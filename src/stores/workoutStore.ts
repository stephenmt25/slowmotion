import { create } from 'zustand';

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

// Local Storage Keys
const STORAGE_KEYS = {
  exercises: 'gym-tracker-exercises',
  workoutSessions: 'gym-tracker-sessions',
  currentWorkout: 'gym-tracker-current-workout',
} as const;

// Default Exercises
const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', muscle_group: 'Chest', is_default: true },
  { id: 'incline-bench-press', name: 'Incline Bench Press', muscle_group: 'Chest', is_default: true },
  { id: 'dumbbell-press', name: 'Dumbbell Press', muscle_group: 'Chest', is_default: true },
  { id: 'push-ups', name: 'Push-ups', muscle_group: 'Chest', is_default: true },
  { id: 'dips', name: 'Dips', muscle_group: 'Chest', is_default: true },
  
  // Back
  { id: 'deadlift', name: 'Deadlift', muscle_group: 'Back', is_default: true },
  { id: 'pull-ups', name: 'Pull-ups', muscle_group: 'Back', is_default: true },
  { id: 'barbell-rows', name: 'Barbell Rows', muscle_group: 'Back', is_default: true },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscle_group: 'Back', is_default: true },
  { id: 'cable-rows', name: 'Cable Rows', muscle_group: 'Back', is_default: true },
  
  // Legs
  { id: 'squat', name: 'Squat', muscle_group: 'Legs', is_default: true },
  { id: 'leg-press', name: 'Leg Press', muscle_group: 'Legs', is_default: true },
  { id: 'lunges', name: 'Lunges', muscle_group: 'Legs', is_default: true },
  { id: 'leg-curls', name: 'Leg Curls', muscle_group: 'Legs', is_default: true },
  { id: 'calf-raises', name: 'Calf Raises', muscle_group: 'Legs', is_default: true },
  
  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', muscle_group: 'Shoulders', is_default: true },
  { id: 'lateral-raises', name: 'Lateral Raises', muscle_group: 'Shoulders', is_default: true },
  { id: 'front-raises', name: 'Front Raises', muscle_group: 'Shoulders', is_default: true },
  { id: 'rear-delt-flys', name: 'Rear Delt Flys', muscle_group: 'Shoulders', is_default: true },
  
  // Arms
  { id: 'bicep-curls', name: 'Bicep Curls', muscle_group: 'Arms', is_default: true },
  { id: 'tricep-extensions', name: 'Tricep Extensions', muscle_group: 'Arms', is_default: true },
  { id: 'hammer-curls', name: 'Hammer Curls', muscle_group: 'Arms', is_default: true },
  { id: 'close-grip-bench', name: 'Close Grip Bench Press', muscle_group: 'Arms', is_default: true },
];

// Utility functions for local storage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

const generateId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

interface WorkoutState {
  // Navigation
  activePage: 'log' | 'history' | 'progress';
  
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
  
  // Exercise actions
  loadExercises: () => void;
  addCustomExercise: (name: string, muscleGroup: string) => Exercise | null;
  
  // Workout actions
  setCurrentWorkoutDate: (date: string) => void;
  addExerciseToWorkout: (exerciseId: string) => void;
  updateWorkoutEntry: (index: number, entry: Partial<WorkoutEntry>) => void;
  removeExerciseFromWorkout: (index: number) => void;
  saveWorkout: () => boolean;
  clearCurrentWorkout: () => void;
  
  // History actions
  loadWorkoutHistory: () => void;
  
  // Progress actions
  setProgressFilter: (filter: WorkoutState['progressFilter']) => void;
  calculateProgressData: () => ProgressData[];
  
  // Modal actions
  openModal: (type: 'exercise' | 'custom-tracker', exerciseId?: string) => void;
  closeModal: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // Initial state
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

  // Exercises
  loadExercises: () => {
    const savedExercises = loadFromStorage(STORAGE_KEYS.exercises, []);
    
    // If no exercises saved, initialize with defaults
    if (savedExercises.length === 0) {
      saveToStorage(STORAGE_KEYS.exercises, DEFAULT_EXERCISES);
      set({ exercises: DEFAULT_EXERCISES });
    } else {
      set({ exercises: savedExercises });
    }
  },

  addCustomExercise: (name, muscleGroup) => {
    const { exercises } = get();
    const newExercise: Exercise = {
      id: generateId(),
      name,
      muscle_group: muscleGroup,
      is_default: false
    };

    const updatedExercises = [...exercises, newExercise];
    saveToStorage(STORAGE_KEYS.exercises, updatedExercises);
    set({ exercises: updatedExercises });
    return newExercise;
  },

  // Current workout
  setCurrentWorkoutDate: (date) => {
    const { currentWorkout } = get();
    const updatedWorkout = { ...currentWorkout, date };
    set({ currentWorkout: updatedWorkout });
    saveToStorage(STORAGE_KEYS.currentWorkout, updatedWorkout);
  },

  addExerciseToWorkout: (exerciseId) => {
    const { currentWorkout, exercises } = get();
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newEntry: WorkoutEntry = {
      id: generateId(),
      exercise_id: exerciseId,
      exercise,
      sets: [{ weight: 0, reps: 0 }],
      custom_trackers: {}
    };

    const updatedWorkout = {
      ...currentWorkout,
      entries: [...currentWorkout.entries, newEntry]
    };

    set({ currentWorkout: updatedWorkout });
    saveToStorage(STORAGE_KEYS.currentWorkout, updatedWorkout);
  },

  updateWorkoutEntry: (index, entryUpdate) => {
    const { currentWorkout } = get();
    const newEntries = [...currentWorkout.entries];
    newEntries[index] = { ...newEntries[index], ...entryUpdate };
    
    const updatedWorkout = {
      ...currentWorkout,
      entries: newEntries
    };

    set({ currentWorkout: updatedWorkout });
    saveToStorage(STORAGE_KEYS.currentWorkout, updatedWorkout);
  },

  removeExerciseFromWorkout: (index) => {
    const { currentWorkout } = get();
    const newEntries = currentWorkout.entries.filter((_, i) => i !== index);
    
    const updatedWorkout = {
      ...currentWorkout,
      entries: newEntries
    };

    set({ currentWorkout: updatedWorkout });
    saveToStorage(STORAGE_KEYS.currentWorkout, updatedWorkout);
  },

  saveWorkout: () => {
    const { currentWorkout, workoutSessions } = get();
    if (currentWorkout.entries.length === 0) return false;

    try {
      const newSession: WorkoutSession = {
        id: generateId(),
        date: currentWorkout.date,
        entries: currentWorkout.entries,
        created_at: new Date().toISOString()
      };

      const updatedSessions = [newSession, ...workoutSessions];
      saveToStorage(STORAGE_KEYS.workoutSessions, updatedSessions);
      set({ workoutSessions: updatedSessions });
      
      // Clear current workout
      get().clearCurrentWorkout();
      
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      return false;
    }
  },

  clearCurrentWorkout: () => {
    const clearedWorkout = {
      date: new Date().toISOString().split('T')[0],
      entries: []
    };
    
    set({ currentWorkout: clearedWorkout });
    saveToStorage(STORAGE_KEYS.currentWorkout, clearedWorkout);
  },

  // History
  loadWorkoutHistory: () => {
    const savedSessions = loadFromStorage(STORAGE_KEYS.workoutSessions, []);
    // Sort by date descending (newest first)
    const sortedSessions = savedSessions.sort((a: WorkoutSession, b: WorkoutSession) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    set({ workoutSessions: sortedSessions });
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