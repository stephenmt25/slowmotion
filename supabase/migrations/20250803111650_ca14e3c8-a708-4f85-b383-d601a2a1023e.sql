-- Create device-based user system for anonymous users
CREATE TABLE IF NOT EXISTS public.device_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_users ENABLE ROW LEVEL SECURITY;

-- Create policy for device users
CREATE POLICY "Device users can manage their own data" 
ON public.device_users 
FOR ALL 
USING (device_id = current_setting('request.jwt.claims', true)::json->>'device_id' OR device_id = current_setting('app.device_id', true));

-- Create custom exercises table for device users
CREATE TABLE IF NOT EXISTS public.user_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user exercises
ALTER TABLE public.user_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for user exercises
CREATE POLICY "Users can view their own exercises" 
ON public.user_exercises 
FOR SELECT 
USING (device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can create their own exercises" 
ON public.user_exercises 
FOR INSERT 
WITH CHECK (device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can update their own exercises" 
ON public.user_exercises 
FOR UPDATE 
USING (device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can delete their own exercises" 
ON public.user_exercises 
FOR DELETE 
USING (device_id = current_setting('app.device_id', true));

-- Create global custom trackers table
CREATE TABLE IF NOT EXISTS public.user_custom_trackers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for custom trackers
ALTER TABLE public.user_custom_trackers ENABLE ROW LEVEL SECURITY;

-- Create policies for custom trackers
CREATE POLICY "Users can view their own custom trackers" 
ON public.user_custom_trackers 
FOR SELECT 
USING (device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can create their own custom trackers" 
ON public.user_custom_trackers 
FOR INSERT 
WITH CHECK (device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can update their own custom trackers" 
ON public.user_custom_trackers 
FOR UPDATE 
USING (device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can delete their own custom trackers" 
ON public.user_custom_trackers 
FOR DELETE 
USING (device_id = current_setting('app.device_id', true));

-- Update workout sessions to use device_id instead of user_id
ALTER TABLE public.workout_sessions 
ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Create new policies for workout sessions with device_id
DROP POLICY IF EXISTS "Users can view their own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users can create their own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users can update their own workout sessions" ON public.workout_sessions;
DROP POLICY IF EXISTS "Users can delete their own workout sessions" ON public.workout_sessions;

CREATE POLICY "Device users can view their own workout sessions" 
ON public.workout_sessions 
FOR SELECT 
USING (device_id = current_setting('app.device_id', true) OR user_id = auth.uid());

CREATE POLICY "Device users can create their own workout sessions" 
ON public.workout_sessions 
FOR INSERT 
WITH CHECK (device_id = current_setting('app.device_id', true) OR user_id = auth.uid());

CREATE POLICY "Device users can update their own workout sessions" 
ON public.workout_sessions 
FOR UPDATE 
USING (device_id = current_setting('app.device_id', true) OR user_id = auth.uid());

CREATE POLICY "Device users can delete their own workout sessions" 
ON public.workout_sessions 
FOR DELETE 
USING (device_id = current_setting('app.device_id', true) OR user_id = auth.uid());

-- Update workout entries policies to work with device_id
DROP POLICY IF EXISTS "Users can view their own workout entries" ON public.workout_entries;
DROP POLICY IF EXISTS "Users can create their own workout entries" ON public.workout_entries;
DROP POLICY IF EXISTS "Users can update their own workout entries" ON public.workout_entries;
DROP POLICY IF EXISTS "Users can delete their own workout entries" ON public.workout_entries;

CREATE POLICY "Device users can view their own workout entries" 
ON public.workout_entries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM workout_sessions 
  WHERE workout_sessions.id = workout_entries.session_id 
  AND (workout_sessions.device_id = current_setting('app.device_id', true) OR workout_sessions.user_id = auth.uid())
));

CREATE POLICY "Device users can create their own workout entries" 
ON public.workout_entries 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM workout_sessions 
  WHERE workout_sessions.id = workout_entries.session_id 
  AND (workout_sessions.device_id = current_setting('app.device_id', true) OR workout_sessions.user_id = auth.uid())
));

CREATE POLICY "Device users can update their own workout entries" 
ON public.workout_entries 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM workout_sessions 
  WHERE workout_sessions.id = workout_entries.session_id 
  AND (workout_sessions.device_id = current_setting('app.device_id', true) OR workout_sessions.user_id = auth.uid())
));

CREATE POLICY "Device users can delete their own workout entries" 
ON public.workout_entries 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM workout_sessions 
  WHERE workout_sessions.id = workout_entries.session_id 
  AND (workout_sessions.device_id = current_setting('app.device_id', true) OR workout_sessions.user_id = auth.uid())
));

-- Add trigger for updating updated_at on user_exercises
CREATE TRIGGER update_user_exercises_updated_at
BEFORE UPDATE ON public.user_exercises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();