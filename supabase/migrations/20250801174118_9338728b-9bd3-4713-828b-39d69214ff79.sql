-- Create exercise library table to store all available exercises
CREATE TABLE public.exercise_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  muscle_group TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout sessions table
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout entries table to link exercises to sessions with performance data
CREATE TABLE public.workout_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercise_library(id) ON DELETE CASCADE,
  sets JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_trackers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercise_library
CREATE POLICY "Users can view all exercises" 
ON public.exercise_library 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create custom exercises" 
ON public.exercise_library 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exercises" 
ON public.exercise_library 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own exercises" 
ON public.exercise_library 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions" 
ON public.workout_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout sessions" 
ON public.workout_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions" 
ON public.workout_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions" 
ON public.workout_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for workout_entries
CREATE POLICY "Users can view their own workout entries" 
ON public.workout_entries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions 
    WHERE public.workout_sessions.id = workout_entries.session_id 
    AND public.workout_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own workout entries" 
ON public.workout_entries 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workout_sessions 
    WHERE public.workout_sessions.id = workout_entries.session_id 
    AND public.workout_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own workout entries" 
ON public.workout_entries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions 
    WHERE public.workout_sessions.id = workout_entries.session_id 
    AND public.workout_sessions.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own workout entries" 
ON public.workout_entries 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.workout_sessions 
    WHERE public.workout_sessions.id = workout_entries.session_id 
    AND public.workout_sessions.user_id = auth.uid()
  )
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workout_sessions
CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_date ON public.workout_sessions(date);
CREATE INDEX idx_workout_entries_session_id ON public.workout_entries(session_id);
CREATE INDEX idx_workout_entries_exercise_id ON public.workout_entries(exercise_id);
CREATE INDEX idx_exercise_library_muscle_group ON public.exercise_library(muscle_group);

-- Insert default exercises
INSERT INTO public.exercise_library (name, muscle_group, is_default) VALUES
-- Chest
('Bench Press', 'Chest', true),
('Incline Bench Press', 'Chest', true),
('Dumbbell Press', 'Chest', true),
('Push-ups', 'Chest', true),
('Chest Flyes', 'Chest', true),
('Dips', 'Chest', true),

-- Back
('Pull-ups', 'Back', true),
('Lat Pulldown', 'Back', true),
('Barbell Rows', 'Back', true),
('Dumbbell Rows', 'Back', true),
('Deadlift', 'Back', true),
('Cable Rows', 'Back', true),

-- Legs
('Squats', 'Legs', true),
('Leg Press', 'Legs', true),
('Lunges', 'Legs', true),
('Leg Curls', 'Legs', true),
('Leg Extensions', 'Legs', true),
('Calf Raises', 'Legs', true),
('Romanian Deadlift', 'Legs', true),

-- Shoulders
('Overhead Press', 'Shoulders', true),
('Lateral Raises', 'Shoulders', true),
('Front Raises', 'Shoulders', true),
('Rear Delt Flyes', 'Shoulders', true),
('Arnold Press', 'Shoulders', true),
('Upright Rows', 'Shoulders', true),

-- Biceps
('Bicep Curls', 'Biceps', true),
('Hammer Curls', 'Biceps', true),
('Preacher Curls', 'Biceps', true),
('Cable Curls', 'Biceps', true),

-- Triceps
('Tricep Dips', 'Triceps', true),
('Close-Grip Bench Press', 'Triceps', true),
('Tricep Extensions', 'Triceps', true),
('Cable Pushdowns', 'Triceps', true),

-- Core
('Plank', 'Core', true),
('Crunches', 'Core', true),
('Russian Twists', 'Core', true),
('Mountain Climbers', 'Core', true),
('Dead Bug', 'Core', true);