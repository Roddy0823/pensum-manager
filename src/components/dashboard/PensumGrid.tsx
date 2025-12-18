import SemesterColumn from './SemesterColumn';
import type { SubjectWithStatus } from '@/types/database';

interface PensumGridProps {
  subjectsBySemester: Record<number, SubjectWithStatus[]>;
  totalSemesters: number;
  onSubjectClick: (subjectId: string) => void;
  loadingSubject?: string | null;
}

export default function PensumGrid({
  subjectsBySemester,
  totalSemesters,
  onSubjectClick,
  loadingSubject
}: PensumGridProps) {
  const semesters = Array.from({ length: totalSemesters }, (_, i) => i + 1);

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-min px-1">
          {semesters.map((semester, index) => (
            <div key={semester} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              <SemesterColumn
                semester={semester}
                subjects={subjectsBySemester[semester] || []}
                onSubjectClick={onSubjectClick}
                loadingSubject={loadingSubject}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

