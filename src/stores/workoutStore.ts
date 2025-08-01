import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Types
export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  created_by?: string;
  is_default?: boolean;
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  id?: string;
}

export interface WorkoutEntry {
  id?: string;
  exercise_id: string;
  exercise?: Exercise;
  sets: WorkoutSet[];
  custom_trackers: Record<string, any>;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  date: string;
  entries?: WorkoutEntry[];
  created_at?: string;
}

export interface ProgressData {
  date: string;
  volume_load: number;
  max_weight: number;
  estimated_1rm: number;
  total_reps: number;
}

interface WorkoutState {
  // Auth
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  
  // Navigation
  activePage: 'log' | 'history' | 'progress' | 'auth';
  
  // Data
  exercises: Exercise[];
  workoutSessions: WorkoutSession[];
  currentWorkout: {
    date: string;
    entries: WorkoutEntry[];
  };
  
  // UI State
  isModalOpen: boolean;
  modalType: 'exercise' | 'custom-tracker' | null;
  selectedExerciseId: string | null;
  progressFilter: {
    type: 'exercise' | 'muscle_group';
    value: string;
  } | null;
  
  // Actions
  setPage: (page: WorkoutState['activePage']) => void;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Exercise actions
  fetchExercises: () => Promise<void>;
  addCustomExercise: (name: string, muscleGroup: string) => Promise<Exercise | null>;
  
  // Workout actions
  setCurrentWorkoutDate: (date: string) => void;
  addExerciseToWorkout: (exerciseId: string) => void;
  updateWorkoutEntry: (index: number, entry: Partial<WorkoutEntry>) => void;
  removeExerciseFromWorkout: (index: number) => void;
  saveWorkout: () => Promise<boolean>;
  clearCurrentWorkout: () => void;
  
  // History actions
  fetchWorkoutHistory: () => Promise<void>;
  
  // Progress actions
  setProgressFilter: (filter: WorkoutState['progressFilter']) => void;
  calculateProgressData: () => ProgressData[];
  
  // Modal actions
  openModal: (type: 'exercise' | 'custom-tracker', exerciseId?: string) => void;
  closeModal: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  isLoading: true,
  activePage: 'log',
  exercises: [],
  workoutSessions: [],
  currentWorkout: {
    date: new Date().toISOString().split('T')[0],
    entries: []
  },
  isModalOpen: false,
  modalType: null,
  selectedExerciseId: null,
  progressFilter: null,

  // Navigation
  setPage: (page) => set({ activePage: page }),
  
  // Auth
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ isLoading: loading }),

  // Exercises
  fetchExercises: async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_library')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ exercises: data || [] });
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  },

  addCustomExercise: async (name, muscleGroup) => {
    const { user } = get();
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('exercise_library')
        .insert({
          name,
          muscle_group: muscleGroup,
          created_by: user.id,
          is_default: false
        })
        .select()
        .single();

      if (error) throw error;
      
      const { exercises } = get();
      set({ exercises: [...exercises, data] });
      return data;
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      return null;
    }
  },

  // Current workout
  setCurrentWorkoutDate: (date) => {
    const { currentWorkout } = get();
    set({ currentWorkout: { ...currentWorkout, date } });
  },

  addExerciseToWorkout: (exerciseId) => {
    const { currentWorkout, exercises } = get();
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newEntry: WorkoutEntry = {
      exercise_id: exerciseId,
      exercise,
      sets: [{ weight: 0, reps: 0 }],
      custom_trackers: {}
    };

    set({
      currentWorkout: {
        ...currentWorkout,
        entries: [...currentWorkout.entries, newEntry]
      }
    });
  },

  updateWorkoutEntry: (index, entryUpdate) => {
    const { currentWorkout } = get();
    const newEntries = [...currentWorkout.entries];
    newEntries[index] = { ...newEntries[index], ...entryUpdate };
    
    set({
      currentWorkout: {
        ...currentWorkout,
        entries: newEntries
      }
    });
  },

  removeExerciseFromWorkout: (index) => {
    const { currentWorkout } = get();
    const newEntries = currentWorkout.entries.filter((_, i) => i !== index);
    
    set({
      currentWorkout: {
        ...currentWorkout,
        entries: newEntries
      }
    });
  },

  saveWorkout: async () => {
    const { user, currentWorkout } = get();
    if (!user || currentWorkout.entries.length === 0) return false;

    try {
      // Create workout session
      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          date: currentWorkout.date
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create workout entries
      const entriesToInsert = currentWorkout.entries.map(entry => ({
        session_id: sessionData.id,
        exercise_id: entry.exercise_id,
        sets: entry.sets as any, // Cast to any for JSON storage
        custom_trackers: entry.custom_trackers as any // Cast to any for JSON storage
      }));

      const { error: entriesError } = await supabase
        .from('workout_entries')
        .insert(entriesToInsert);

      if (entriesError) throw entriesError;

      // Refresh workout history
      get().fetchWorkoutHistory();
      
      // Clear current workout
      get().clearCurrentWorkout();
      
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      return false;
    }
  },

  clearCurrentWorkout: () => {
    set({
      currentWorkout: {
        date: new Date().toISOString().split('T')[0],
        entries: []
      }
    });
  },

  // History
  fetchWorkoutHistory: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_entries (
            *,
            exercise_library (*)
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedSessions: WorkoutSession[] = (data || []).map(session => ({
        ...session,
        entries: session.workout_entries?.map((entry: any) => ({
          ...entry,
          exercise: entry.exercise_library
        })) || []
      }));

      set({ workoutSessions: formattedSessions });
    } catch (error) {
      console.error('Error fetching workout history:', error);
    }
  },

  // Progress
  setProgressFilter: (filter) => set({ progressFilter: filter }),

  calculateProgressData: () => {
    const { workoutSessions, progressFilter } = get();
    if (!progressFilter) return [];

    const filteredSessions = workoutSessions.filter(session => {
      if (!session.entries) return false;
      
      return session.entries.some(entry => {
        if (progressFilter.type === 'exercise') {
          return entry.exercise_id === progressFilter.value;
        } else {
          return entry.exercise?.muscle_group === progressFilter.value;
        }
      });
    });

    return filteredSessions.map(session => {
      const relevantEntries = session.entries?.filter(entry => {
        if (progressFilter.type === 'exercise') {
          return entry.exercise_id === progressFilter.value;
        } else {
          return entry.exercise?.muscle_group === progressFilter.value;
        }
      }) || [];

      let totalVolumeLoad = 0;
      let maxWeight = 0;
      let maxE1RM = 0;
      let totalReps = 0;

      relevantEntries.forEach(entry => {
        entry.sets.forEach(set => {
          totalVolumeLoad += set.weight * set.reps;
          maxWeight = Math.max(maxWeight, set.weight);
          totalReps += set.reps;
          
          // Calculate estimated 1RM using Epley formula
          const e1rm = set.weight * (1 + (set.reps / 30));
          maxE1RM = Math.max(maxE1RM, e1rm);
        });
      });

      return {
        date: session.date,
        volume_load: totalVolumeLoad,
        max_weight: maxWeight,
        estimated_1rm: Math.round(maxE1RM * 10) / 10,
        total_reps: totalReps
      };
    }).reverse(); // Reverse to show chronological order
  },

  // Modal
  openModal: (type, exerciseId) => {
    set({ 
      isModalOpen: true, 
      modalType: type,
      selectedExerciseId: exerciseId || null
    });
  },

  closeModal: () => {
    set({ 
      isModalOpen: false, 
      modalType: null,
      selectedExerciseId: null
    });
  },
}));