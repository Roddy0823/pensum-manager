import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Loader2,
  BookOpen,
  Link2,
  Check,
  Plus,
  Trash2,
  ThumbsUp,
  Trophy,
  Calendar,
  Target
} from 'lucide-react';
import { useProgram } from '@/hooks/useProgram';
import { toast } from '@/hooks/use-toast';
import PrerequisiteSelector from '@/components/pensum/PrerequisiteSelector';
import type { Subject, Prerequisite } from '@/types/database';
import { cn } from '@/lib/utils';

interface OnboardingWizardProps {
  onComplete: () => void;
}

interface LocalSubject {
  id: string;
  name: string;
  semester: number;
  credits: number;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { createProgram, addSubject, addPrerequisite, removePrerequisite, refetch } = useProgram();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [programName, setProgramName] = useState('');
  const [totalSemesters, setTotalSemesters] = useState(10);
  const [programId, setProgramId] = useState<string | null>(null);

  // Step 2: Semester tabs
  const [activeSemester, setActiveSemester] = useState(() => {
    const saved = localStorage.getItem('onboarding_active_semester');
    return saved ? parseInt(saved) : 1;
  });
  const [localSubjects, setLocalSubjects] = useState<LocalSubject[]>(() => {
    const saved = localStorage.getItem('onboarding_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  // Step 3: Persisted subjects
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);

  const steps = [
    { number: 1, title: 'Carrera', icon: GraduationCap },
    { number: 2, title: 'Materias', icon: BookOpen },
    { number: 3, title: 'Prerrequisitos', icon: Link2 },
    { number: 4, title: 'Listo', icon: Check }
  ];

  // Get subjects for current semester
  const getSubjectsForSemester = useCallback((semester: number) => {
    return localSubjects.filter(s => s.semester === semester);
  }, [localSubjects]);

  // Count subjects per semester
  const getSubjectCount = useCallback((semester: number) => {
    return localSubjects.filter(s => s.semester === semester).length;
  }, [localSubjects]);

  // Calculate total credits
  const getTotalCredits = useCallback(() => {
    return subjects.reduce((sum, s) => sum + s.credits, 0);
  }, [subjects]);

  // Add new subject to local state
  const handleAddLocalSubject = () => {
    const newSubject: LocalSubject = {
      id: `local-${Date.now()}`,
      name: '',
      semester: activeSemester,
      credits: 3
    };
    setLocalSubjects(prev => [...prev, newSubject]);
  };

  // Persist subjects whenever they change
  useEffect(() => {
    localStorage.setItem('onboarding_subjects', JSON.stringify(localSubjects));
  }, [localSubjects]);

  // Persist active semester
  useEffect(() => {
    localStorage.setItem('onboarding_active_semester', activeSemester.toString());
  }, [activeSemester]);

  // Restore program ID if exists
  useEffect(() => {
    const savedProgramId = localStorage.getItem('onboarding_program_id');
    if (savedProgramId && !programId) {
      setProgramId(savedProgramId);
    }
  }, [programId]);

  // Update local subject
  const handleUpdateLocalSubject = (id: string, field: 'name' | 'credits', value: string | number) => {
    setLocalSubjects(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // Remove local subject
  const handleRemoveLocalSubject = (id: string) => {
    setLocalSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleCreateProgram = async () => {
    if (!programName.trim()) {
      toast({
        title: 'Error',
        description: 'Ingresa el nombre de tu carrera',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const program = await createProgram(programName.trim(), totalSemesters);
    setLoading(false);

    if (program) {
      setProgramId(program.id);
      setStep(2);
      // Save program ID
      localStorage.setItem('onboarding_program_id', program.id);
    } else {
      toast({
        title: 'Error',
        description: 'No se pudo crear el programa',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSubjects = async () => {
    if (!programId) return;

    // Filter out subjects without names
    const validSubjects = localSubjects.filter(s => s.name.trim());

    if (validSubjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Agrega al menos una materia',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const savedSubjects: Subject[] = [];

      for (const local of validSubjects) {
        const subject = await addSubject(programId, local.name.trim(), local.semester, local.credits);
        if (subject) {
          savedSubjects.push(subject);
        }
      }

      setSubjects(savedSubjects);
      setStep(3);

      toast({
        title: '¡Materias guardadas!',
        description: `Se guardaron ${savedSubjects.length} materias`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al guardar las materias',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrerequisiteToggle = async (subjectId: string, prerequisiteId: string, isAdding: boolean): Promise<boolean> => {
    if (isAdding) {
      const success = await addPrerequisite(subjectId, prerequisiteId);
      if (success) {
        setPrerequisites(prev => [...prev, {
          id: `temp-${Date.now()}`,
          subject_id: subjectId,
          prerequisite_id: prerequisiteId,
          created_at: new Date().toISOString()
        }]);
      }
      return success;
    } else {
      const success = await removePrerequisite(subjectId, prerequisiteId);
      if (success) {
        setPrerequisites(prev => prev.filter(p => !(p.subject_id === subjectId && p.prerequisite_id === prerequisiteId)));
      }
      return success;
    }
  };

  const handleGoToStep4 = () => {
    setStep(4);
  };

  const handleComplete = async () => {
    setLoading(true);
    await refetch();
    setLoading(false);
    setLoading(false);
    // Clear storage on completion
    localStorage.removeItem('onboarding_subjects');
    localStorage.removeItem('onboarding_active_semester');
    localStorage.removeItem('onboarding_program_id');
    onComplete();
  };

  const currentSemesterSubjects = getSubjectsForSemester(activeSemester);
  const totalSubjectsCount = localSubjects.filter(s => s.name.trim()).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-xl">Pensum Manager</span>
      </div>

      {/* Progress steps - Circular numbered */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, index) => (
          <div key={s.number} className="flex items-center">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
              step > s.number
                ? "bg-primary text-primary-foreground"
                : step === s.number
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted text-muted-foreground"
            )}>
              {step > s.number ? (
                <Check className="h-5 w-5" />
              ) : (
                s.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 sm:w-20 h-0.5 mx-1 transition-colors duration-300",
                step > s.number ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-card rounded-2xl border shadow-medium p-8 animate-fade-in">
        {/* Step 1: Program Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Configura tu carrera</h1>
              <p className="text-muted-foreground mt-1">Ingresa los datos básicos de tu programa académico</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="programName" className="text-sm font-medium">
                Nombre de la carrera
              </Label>
              <Input
                id="programName"
                placeholder="Ej: Ingeniería de Sistemas"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="h-12 bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semesters" className="text-sm font-medium">
                Número de semestres
              </Label>
              <Input
                id="semesters"
                type="number"
                min={1}
                max={20}
                value={totalSemesters}
                onChange={(e) => setTotalSemesters(parseInt(e.target.value) || 10)}
                className="h-12 bg-background"
              />
            </div>

            <Button
              className="w-full h-12 text-base bg-primary hover:bg-primary/90"
              onClick={handleCreateProgram}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Subjects with Semester Tabs */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="mb-2">
              <h1 className="text-2xl font-bold">Materias</h1>
              <p className="text-muted-foreground mt-1">Agrega las materias de cada semestre de tu carrera</p>
            </div>

            {/* Semester Tabs */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {Array.from({ length: totalSemesters }, (_, i) => i + 1).map(semester => {
                  const count = getSubjectCount(semester);
                  const isActive = activeSemester === semester;

                  return (
                    <button
                      key={semester}
                      onClick={() => setActiveSemester(semester)}
                      className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      )}
                    >
                      Sem {semester}
                      {count > 0 && (
                        <span className={cn(
                          "ml-2",
                          isActive ? "text-primary-foreground/80" : "text-primary"
                        )}>
                          ({count})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Tab indicator line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted" />
            </div>

            {/* Subjects List for Active Semester */}
            <div className="space-y-3 min-h-[250px]">
              {/* Column Headers */}
              {currentSemesterSubjects.length > 0 && (
                <div className="flex items-center gap-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span className="flex-1">Nombre de la materia</span>
                  <span className="w-24 text-center">Créditos</span>
                  <span className="w-12"></span>
                </div>
              )}

              {currentSemesterSubjects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">Semestre {activeSemester} vacío</p>
                  <p className="text-sm mt-1">Haz clic en el botón de abajo para agregar materias</p>
                </div>
              ) : (
                currentSemesterSubjects.map((subject, index) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 animate-fade-in group hover:bg-muted/70 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Subject Name Input */}
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Ej: Cálculo I, Física, Programación..."
                        value={subject.name}
                        onChange={(e) => handleUpdateLocalSubject(subject.id, 'name', e.target.value)}
                        className="h-12 bg-background border-border/50 pr-10"
                      />
                      {subject.name && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                      )}
                    </div>

                    {/* Credits Input with Label */}
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={subject.credits}
                        onChange={(e) => handleUpdateLocalSubject(subject.id, 'credits', parseInt(e.target.value) || 3)}
                        className="w-24 h-12 bg-background border-border/50 text-center pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        cr.
                      </span>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLocalSubject(subject.id)}
                      className="h-12 w-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-50 group-hover:opacity-100 transition-opacity"
                      title="Eliminar materia"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))
              )}

              {/* Add Subject Button */}
              <button
                onClick={handleAddLocalSubject}
                className="w-full py-4 border-2 border-dashed border-primary/30 rounded-xl text-primary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="h-5 w-5" />
                Agregar materia al semestre {activeSemester}
              </button>

              {/* Helper Text */}
              <p className="text-xs text-muted-foreground text-center pt-2">
                💡 Los <strong>créditos</strong> representan el peso académico de cada materia (normalmente entre 1 y 6)
              </p>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button
                className="flex-1 h-12 bg-primary hover:bg-primary/90"
                onClick={handleSaveSubjects}
                disabled={loading || totalSubjectsCount === 0}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Prerequisites */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="mb-2">
              <h1 className="text-2xl font-bold">Prerrequisitos</h1>
              <p className="text-muted-foreground mt-1">
                Configura qué materias dependen de otras (opcional)
              </p>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
              <PrerequisiteSelector
                subjects={subjects}
                prerequisites={prerequisites}
                onToggle={handlePrerequisiteToggle}
                totalSemesters={totalSemesters}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button
                className="flex-1 h-12 bg-primary hover:bg-primary/90"
                onClick={handleGoToStep4}
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Summary & Completion */}
        {step === 4 && (
          <div className="space-y-8 animate-fade-in-up text-center">
            {/* Success Icon with Animation */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center shadow-glow">
                <ThumbsUp className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                ¡Todo listo!
              </h1>
              <p className="text-muted-foreground mt-2">
                Tu pensum ha sido configurado exitosamente
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <div className="h-10 w-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{totalSemesters}</p>
                <p className="text-xs text-muted-foreground">Semestres</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <div className="h-10 w-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{subjects.length}</p>
                <p className="text-xs text-muted-foreground">Materias</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 space-y-1">
                <div className="h-10 w-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{getTotalCredits()}</p>
                <p className="text-xs text-muted-foreground">Créditos</p>
              </div>
            </div>

            {/* Program Name */}
            <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl p-6 border border-primary/10">
              <p className="text-sm text-muted-foreground mb-1">Tu carrera</p>
              <p className="text-xl font-semibold">{programName}</p>
              {prerequisites.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {prerequisites.length} prerrequisito{prerequisites.length !== 1 ? 's' : ''} configurado{prerequisites.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="text-left bg-muted/30 rounded-xl p-4 space-y-2">
              <p className="font-medium text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Próximos pasos:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Marca las materias que ya has aprobado</li>
                <li>• Visualiza tu progreso en tiempo real</li>
                <li>• Identifica qué materias puedes cursar</li>
              </ul>
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              className="w-full h-14 text-base bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-glow"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Ir a mi Dashboard
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {step === 2 && totalSubjectsCount > 0 && (
        <p className="text-sm text-muted-foreground mt-4">
          {totalSubjectsCount} materia{totalSubjectsCount !== 1 ? 's' : ''} agregada{totalSubjectsCount !== 1 ? 's' : ''} en total
        </p>
      )}
    </div>
  );
}
