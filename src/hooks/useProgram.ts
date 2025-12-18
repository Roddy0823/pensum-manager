import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  createProgramSchema,
  createSubjectSchema,
  updateSubjectSchema,
  uuidSchema,
  validateData
} from '@/lib/validation';
import type { Program, Subject, Prerequisite, Progress, SubjectWithStatus } from '@/types/database';

// Debounce helper
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface OperationResult {
  success: boolean;
  error?: string;
}

export function useProgram() {
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if component is mounted
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchProgram = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (programError) throw programError;

      if (!mountedRef.current) return;

      if (programData) {
        setProgram(programData);

        // Fetch subjects and progress in parallel
        const [subjectsRes, progressRes] = await Promise.all([
          supabase
            .from('subjects')
            .select('*')
            .eq('program_id', programData.id)
            .order('semester', { ascending: true }),
          supabase
            .from('progress')
            .select('*')
            .eq('user_id', user.id)
        ]);

        if (!mountedRef.current) return;

        if (subjectsRes.error) throw subjectsRes.error;
        if (progressRes.error) throw progressRes.error;

        const subjectsList = subjectsRes.data || [];
        setSubjects(subjectsList);
        setProgress(progressRes.data || []);

        // Fetch prerequisites for all subjects
        if (subjectsList.length > 0) {
          const subjectIds = subjectsList.map(s => s.id);
          const { data: prereqData, error: prereqError } = await supabase
            .from('prerequisites')
            .select('*')
            .in('subject_id', subjectIds);

          if (!mountedRef.current) return;

          if (prereqError) throw prereqError;
          setPrerequisites(prereqData || []);
        } else {
          setPrerequisites([]);
        }
      } else {
        setProgram(null);
        setSubjects([]);
        setPrerequisites([]);
        setProgress([]);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = handleSupabaseError(err);
        // Only set error if there's an actual error message (not empty)
        if (errorMessage) {
          setError(errorMessage);
          console.error('Error fetching program:', err);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  const getSubjectStatus = useCallback((subject: Subject): SubjectWithStatus => {
    const approvedSubjectIds = new Set(progress.map(p => p.subject_id));
    const isApproved = approvedSubjectIds.has(subject.id);

    const subjectPrereqs = prerequisites.filter(p => p.subject_id === subject.id);
    const prereqSubjects = subjectPrereqs
      .map(p => subjects.find(s => s.id === p.prerequisite_id))
      .filter((s): s is Subject => s !== undefined);

    const missingPrereqs = prereqSubjects.filter(p => !approvedSubjectIds.has(p.id));

    let status: 'approved' | 'available' | 'blocked';
    if (isApproved) {
      status = 'approved';
    } else if (missingPrereqs.length === 0) {
      status = 'available';
    } else {
      status = 'blocked';
    }

    return {
      ...subject,
      status,
      prerequisites: prereqSubjects,
      missingPrerequisites: missingPrereqs
    };
  }, [progress, prerequisites, subjects]);

  const getSubjectsBySemester = useCallback(() => {
    const bySemester: Record<number, SubjectWithStatus[]> = {};

    subjects.forEach(subject => {
      const subjectWithStatus = getSubjectStatus(subject);
      if (!bySemester[subject.semester]) {
        bySemester[subject.semester] = [];
      }
      bySemester[subject.semester].push(subjectWithStatus);
    });

    return bySemester;
  }, [subjects, getSubjectStatus]);

  const toggleSubjectApproval = useCallback(async (subjectId: string): Promise<OperationResult> => {
    // Validate UUID
    const uuidValidation = validateData(uuidSchema, subjectId);
    if (!uuidValidation.success) {
      return { success: false, error: 'ID de materia inválido' };
    }

    if (!user) return { success: false, error: 'Debes iniciar sesión' };

    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return { success: false, error: 'Materia no encontrada' };

    const subjectWithStatus = getSubjectStatus(subject);

    // Optimistic update for better UX
    const previousProgress = [...progress];

    if (subjectWithStatus.status === 'approved') {
      // Check if any approved subject depends on this one
      const dependentSubjects = subjects.filter(s => {
        const prereqs = prerequisites.filter(p => p.subject_id === s.id);
        return prereqs.some(p => p.prerequisite_id === subjectId);
      });

      const approvedDependents = dependentSubjects.filter(s =>
        progress.some(p => p.subject_id === s.id)
      );

      if (approvedDependents.length > 0) {
        return {
          success: false,
          error: `No puedes desmarcar esta materia porque las siguientes dependen de ella: ${approvedDependents.map(s => s.name).join(', ')}`
        };
      }

      // Optimistic update
      setProgress(prev => prev.filter(p => p.subject_id !== subjectId));

      try {
        const { error } = await supabase
          .from('progress')
          .delete()
          .eq('user_id', user.id)
          .eq('subject_id', subjectId);

        if (error) {
          // Rollback on error
          setProgress(previousProgress);
          return { success: false, error: handleSupabaseError(error) };
        }

        return { success: true };
      } catch (err) {
        setProgress(previousProgress);
        return { success: false, error: handleSupabaseError(err) };
      }
    }

    if (subjectWithStatus.status === 'blocked') {
      return {
        success: false,
        error: `Debes aprobar primero: ${subjectWithStatus.missingPrerequisites.map(s => s.name).join(', ')}`
      };
    }

    // Create optimistic progress entry
    const optimisticEntry: Progress = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      subject_id: subjectId,
      approved_at: new Date().toISOString()
    };

    setProgress(prev => [...prev, optimisticEntry]);

    try {
      const { data, error } = await supabase
        .from('progress')
        .insert({ user_id: user.id, subject_id: subjectId })
        .select()
        .single();

      if (error) {
        setProgress(previousProgress);
        return { success: false, error: handleSupabaseError(error) };
      }

      // Replace optimistic entry with real data
      setProgress(prev => prev.map(p =>
        p.id === optimisticEntry.id ? data : p
      ));

      return { success: true };
    } catch (err) {
      setProgress(previousProgress);
      return { success: false, error: handleSupabaseError(err) };
    }
  }, [user, subjects, prerequisites, progress, getSubjectStatus]);

  const createProgram = useCallback(async (name: string, totalSemesters: number): Promise<Program | null> => {
    // Validate input
    const validation = validateData(createProgramSchema, { name, totalSemesters });
    if (!validation.success) {
      setError(validation.error || 'Error de validación');
      return null;
    }

    if (!user) {
      setError('Debes iniciar sesión');
      console.error('createProgram: No user found');
      return null;
    }

    console.log('createProgram: Attempting to create program', { userId: user.id, name, totalSemesters });

    try {
      const { data, error } = await supabase
        .from('programs')
        .insert({
          user_id: user.id,
          name: validation.data!.name,
          total_semesters: validation.data!.totalSemesters
        })
        .select()
        .single();

      if (error) {
        console.error('createProgram: Supabase error', error);
        const errorMsg = handleSupabaseError(error);
        if (errorMsg) setError(errorMsg);
        return null;
      }

      console.log('createProgram: Success', data);
      setProgram(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('createProgram: Exception', err);
      const errorMsg = handleSupabaseError(err);
      if (errorMsg) setError(errorMsg);
      return null;
    }
  }, [user]);

  const addSubject = useCallback(async (
    programId: string,
    name: string,
    semester: number,
    credits: number
  ): Promise<Subject | null> => {
    // Validate inputs
    const uuidValidation = validateData(uuidSchema, programId);
    if (!uuidValidation.success) {
      setError('ID de programa inválido');
      return null;
    }

    const subjectValidation = validateData(createSubjectSchema, { name, semester, credits });
    if (!subjectValidation.success) {
      setError(subjectValidation.error || 'Error de validación');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          program_id: programId,
          name: subjectValidation.data!.name,
          semester: subjectValidation.data!.semester,
          credits: subjectValidation.data!.credits
        })
        .select()
        .single();

      if (error) {
        setError(handleSupabaseError(error));
        return null;
      }

      setSubjects(prev => [...prev, data].sort((a, b) => a.semester - b.semester));
      setError(null);
      return data;
    } catch (err) {
      setError(handleSupabaseError(err));
      return null;
    }
  }, []);

  const updateSubject = useCallback(async (
    subjectId: string,
    updates: Partial<Pick<Subject, 'name' | 'semester' | 'credits'>>
  ): Promise<boolean> => {
    // Validate UUID
    const uuidValidation = validateData(uuidSchema, subjectId);
    if (!uuidValidation.success) {
      setError('ID de materia inválido');
      return false;
    }

    // Validate updates
    const updateValidation = validateData(updateSubjectSchema, updates);
    if (!updateValidation.success) {
      setError(updateValidation.error || 'Error de validación');
      return false;
    }

    // Optimistic update
    const previousSubjects = [...subjects];
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, ...updates } : s));

    try {
      const { error } = await supabase
        .from('subjects')
        .update(updateValidation.data!)
        .eq('id', subjectId);

      if (error) {
        setSubjects(previousSubjects);
        setError(handleSupabaseError(error));
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      setSubjects(previousSubjects);
      setError(handleSupabaseError(err));
      return false;
    }
  }, [subjects]);

  const deleteSubject = useCallback(async (subjectId: string): Promise<boolean> => {
    // Validate UUID
    const uuidValidation = validateData(uuidSchema, subjectId);
    if (!uuidValidation.success) {
      setError('ID de materia inválido');
      return false;
    }

    // Optimistic update
    const previousSubjects = [...subjects];
    const previousPrerequisites = [...prerequisites];
    const previousProgress = [...progress];

    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setPrerequisites(prev => prev.filter(p => p.subject_id !== subjectId && p.prerequisite_id !== subjectId));
    setProgress(prev => prev.filter(p => p.subject_id !== subjectId));

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) {
        // Rollback
        setSubjects(previousSubjects);
        setPrerequisites(previousPrerequisites);
        setProgress(previousProgress);
        setError(handleSupabaseError(error));
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      setSubjects(previousSubjects);
      setPrerequisites(previousPrerequisites);
      setProgress(previousProgress);
      setError(handleSupabaseError(err));
      return false;
    }
  }, [subjects, prerequisites, progress]);

  const addPrerequisite = useCallback(async (subjectId: string, prerequisiteId: string): Promise<boolean> => {
    // Validate UUIDs
    const subjectValidation = validateData(uuidSchema, subjectId);
    const prereqValidation = validateData(uuidSchema, prerequisiteId);

    if (!subjectValidation.success || !prereqValidation.success) {
      setError('IDs inválidos');
      return false;
    }

    // Prevent circular dependencies
    if (subjectId === prerequisiteId) {
      setError('Una materia no puede ser prerrequisito de sí misma');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('prerequisites')
        .insert({ subject_id: subjectId, prerequisite_id: prerequisiteId })
        .select()
        .single();

      if (error) {
        setError(handleSupabaseError(error));
        return false;
      }

      setPrerequisites(prev => [...prev, data]);
      setError(null);
      return true;
    } catch (err) {
      setError(handleSupabaseError(err));
      return false;
    }
  }, []);

  const removePrerequisite = useCallback(async (subjectId: string, prerequisiteId: string): Promise<boolean> => {
    // Validate UUIDs
    const subjectValidation = validateData(uuidSchema, subjectId);
    const prereqValidation = validateData(uuidSchema, prerequisiteId);

    if (!subjectValidation.success || !prereqValidation.success) {
      setError('IDs inválidos');
      return false;
    }

    // Optimistic update
    const previousPrerequisites = [...prerequisites];
    setPrerequisites(prev => prev.filter(p => !(p.subject_id === subjectId && p.prerequisite_id === prerequisiteId)));

    try {
      const { error } = await supabase
        .from('prerequisites')
        .delete()
        .eq('subject_id', subjectId)
        .eq('prerequisite_id', prerequisiteId);

      if (error) {
        setPrerequisites(previousPrerequisites);
        setError(handleSupabaseError(error));
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      setPrerequisites(previousPrerequisites);
      setError(handleSupabaseError(err));
      return false;
    }
  }, [prerequisites]);

  const getTotalCredits = useCallback(() => {
    return subjects.reduce((sum, s) => sum + s.credits, 0);
  }, [subjects]);

  const getApprovedCredits = useCallback(() => {
    const approvedIds = new Set(progress.map(p => p.subject_id));
    return subjects.filter(s => approvedIds.has(s.id)).reduce((sum, s) => sum + s.credits, 0);
  }, [subjects, progress]);

  const getProgressPercentage = useCallback(() => {
    const total = getTotalCredits();
    if (total === 0) return 0;
    return Math.round((getApprovedCredits() / total) * 100);
  }, [getTotalCredits, getApprovedCredits]);

  // Debounced refetch for real-time updates
  const debouncedRefetch = useCallback(
    debounce(() => {
      if (mountedRef.current) {
        fetchProgram();
      }
    }, 500),
    [fetchProgram]
  );

  return {
    program,
    subjects,
    prerequisites,
    progress,
    loading,
    error,
    getSubjectsBySemester,
    toggleSubjectApproval,
    createProgram,
    addSubject,
    updateSubject,
    deleteSubject,
    addPrerequisite,
    removePrerequisite,
    getTotalCredits,
    getApprovedCredits,
    getProgressPercentage,
    refetch: fetchProgram,
    debouncedRefetch
  };
}
