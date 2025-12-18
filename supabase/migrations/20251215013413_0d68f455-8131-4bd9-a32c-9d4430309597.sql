-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de programas académicos (carreras)
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_semesters INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de materias
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  semester INTEGER NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de prerrequisitos (relación materia-materia)
CREATE TABLE public.prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  prerequisite_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject_id, prerequisite_id),
  CHECK (subject_id != prerequisite_id)
);

-- Tabla de progreso (materias aprobadas)
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para programs
CREATE POLICY "Users can view their own programs"
  ON public.programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own programs"
  ON public.programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
  ON public.programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs"
  ON public.programs FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para subjects (basadas en el programa del usuario)
CREATE POLICY "Users can view subjects of their programs"
  ON public.subjects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs 
      WHERE programs.id = subjects.program_id 
      AND programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert subjects to their programs"
  ON public.subjects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programs 
      WHERE programs.id = program_id 
      AND programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update subjects of their programs"
  ON public.subjects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.programs 
      WHERE programs.id = subjects.program_id 
      AND programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subjects of their programs"
  ON public.subjects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.programs 
      WHERE programs.id = subjects.program_id 
      AND programs.user_id = auth.uid()
    )
  );

-- Políticas para prerequisites
CREATE POLICY "Users can view prerequisites of their subjects"
  ON public.prerequisites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.programs p ON p.id = s.program_id
      WHERE s.id = prerequisites.subject_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert prerequisites to their subjects"
  ON public.prerequisites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.programs p ON p.id = s.program_id
      WHERE s.id = subject_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete prerequisites of their subjects"
  ON public.prerequisites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.programs p ON p.id = s.program_id
      WHERE s.id = prerequisites.subject_id 
      AND p.user_id = auth.uid()
    )
  );

-- Políticas para progress
CREATE POLICY "Users can view their own progress"
  ON public.progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.progress FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();