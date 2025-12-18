export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  user_id: string;
  name: string;
  total_semesters: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  program_id: string;
  name: string;
  semester: number;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface Prerequisite {
  id: string;
  subject_id: string;
  prerequisite_id: string;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  subject_id: string;
  approved_at: string;
}

export interface SubjectWithStatus extends Subject {
  status: 'approved' | 'available' | 'blocked';
  prerequisites: Subject[];
  missingPrerequisites: Subject[];
}

export interface ProgramWithSubjects extends Program {
  subjects: SubjectWithStatus[];
}
