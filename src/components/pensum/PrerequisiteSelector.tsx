import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Link2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subject, Prerequisite } from '@/types/database';

interface PrerequisiteSelectorProps {
  subjects: Subject[];
  prerequisites: Prerequisite[];
  onToggle: (subjectId: string, prerequisiteId: string, isAdding: boolean) => Promise<boolean>;
  totalSemesters?: number;
}

export default function PrerequisiteSelector({ 
  subjects, 
  prerequisites, 
  onToggle,
  totalSemesters 
}: PrerequisiteSelectorProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Group subjects by semester
  const subjectsBySemester = subjects.reduce((acc, subject) => {
    if (!acc[subject.semester]) acc[subject.semester] = [];
    acc[subject.semester].push(subject);
    return acc;
  }, {} as Record<number, Subject[]>);

  // Get all semesters that have subjects (starting from semester 2)
  const semestersWithSubjects = Object.keys(subjectsBySemester)
    .map(Number)
    .filter(sem => sem > 1)
    .sort((a, b) => a - b);

  // Get prerequisites for a subject from earlier semesters
  const getAvailablePrerequisites = (subjectSemester: number) => {
    return subjects.filter(s => s.semester < subjectSemester).sort((a, b) => a.semester - b.semester);
  };

  // Check if a prerequisite is set
  const isPrerequisite = (subjectId: string, prerequisiteId: string) => {
    return prerequisites.some(p => p.subject_id === subjectId && p.prerequisite_id === prerequisiteId);
  };

  // Count prerequisites for a subject
  const getPrerequisiteCount = (subjectId: string) => {
    return prerequisites.filter(p => p.subject_id === subjectId).length;
  };

  const handleToggle = async (subjectId: string, prerequisiteId: string) => {
    const key = `${subjectId}-${prerequisiteId}`;
    const isAdding = !isPrerequisite(subjectId, prerequisiteId);
    
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    await onToggle(subjectId, prerequisiteId, isAdding);
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  };

  if (subjects.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Link2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No hay suficientes materias</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Necesitas al menos 2 materias en diferentes semestres para configurar prerrequisitos.
        </p>
      </div>
    );
  }

  if (semestersWithSubjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Link2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Sin materias para configurar</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Agrega materias en semestres 2 o superiores para poder configurar sus prerrequisitos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {semestersWithSubjects.map(semester => (
        <div key={semester} className="space-y-4">
          {/* Semester header */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{semester}</span>
            </div>
            <h3 className="font-semibold text-lg">Semestre {semester}</h3>
            <Badge variant="secondary" className="ml-auto">
              {subjectsBySemester[semester]?.length || 0} materias
            </Badge>
          </div>

          {/* Subjects in this semester */}
          <div className="grid gap-4">
            {subjectsBySemester[semester]?.map(subject => {
              const availablePrereqs = getAvailablePrerequisites(subject.semester);
              const prereqCount = getPrerequisiteCount(subject.id);

              return (
                <div 
                  key={subject.id} 
                  className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Subject header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-base">{subject.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {subject.credits} créditos
                      </p>
                    </div>
                    {prereqCount > 0 && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        {prereqCount} prerrequisito{prereqCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {/* Prerequisites checkboxes grouped by semester */}
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      Requiere aprobar:
                    </p>
                    
                    {availablePrereqs.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No hay materias de semestres anteriores
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Group available prereqs by their semester */}
                        {Array.from(new Set(availablePrereqs.map(p => p.semester)))
                          .sort((a, b) => a - b)
                          .map(prereqSemester => (
                            <div key={prereqSemester} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded bg-muted flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-muted-foreground">
                                    S{prereqSemester}
                                  </span>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                  Semestre {prereqSemester}
                                </span>
                              </div>
                              <div className="space-y-1.5 pl-7">
                                {availablePrereqs
                                  .filter(p => p.semester === prereqSemester)
                                  .map(prereq => {
                                    const key = `${subject.id}-${prereq.id}`;
                                    const isLoading = loadingStates[key];
                                    const isChecked = isPrerequisite(subject.id, prereq.id);

                                    return (
                                      <label
                                        key={prereq.id}
                                        className={cn(
                                          "flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all",
                                          "hover:bg-accent/50",
                                          isChecked && "bg-primary/5 hover:bg-primary/10",
                                          isLoading && "opacity-50 pointer-events-none"
                                        )}
                                      >
                                        {isLoading ? (
                                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        ) : (
                                          <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={() => handleToggle(subject.id, prereq.id)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                          />
                                        )}
                                        <span className={cn(
                                          "text-sm",
                                          isChecked ? "font-medium text-foreground" : "text-muted-foreground"
                                        )}>
                                          {prereq.name}
                                        </span>
                                      </label>
                                    );
                                  })}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
