import SubjectCard from './SubjectCard';
import type { SubjectWithStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface SemesterColumnProps {
  semester: number;
  subjects: SubjectWithStatus[];
  onSubjectClick: (subjectId: string) => void;
  loadingSubject?: string | null;
}

export default function SemesterColumn({
  semester,
  subjects,
  onSubjectClick,
  loadingSubject
}: SemesterColumnProps) {
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const approvedCredits = subjects.filter(s => s.status === 'approved').reduce((sum, s) => sum + s.credits, 0);
  const completionPercentage = totalCredits > 0 ? Math.round((approvedCredits / totalCredits) * 100) : 0;
  const isComplete = completionPercentage === 100 && subjects.length > 0;

  return (
    <div className="flex-shrink-0 w-64">
      <div className={cn("bg-card rounded-2xl border shadow-soft transition-all", isComplete && "border-success/30 bg-success/5")}>
        <div className="p-4 border-b bg-muted/30 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Semestre {semester}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{subjects.length} materia{subjects.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <div className={cn("text-lg font-bold", isComplete ? "text-success" : "text-foreground")}>{completionPercentage}%</div>
              <p className="text-xs text-muted-foreground">{approvedCredits}/{totalCredits} cr.</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", isComplete ? "bg-success" : "bg-primary")} style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>
        <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onClick={() => onSubjectClick(subject.id)}
              isLoading={loadingSubject === subject.id}
            />
          ))}
          {subjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Sin materias</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

