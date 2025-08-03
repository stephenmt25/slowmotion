import { supabase } from '@/integrations/supabase/client';
import { DeviceService } from './deviceService';
import type { Exercise, WorkoutSession, WorkoutEntry } from '@/stores/workoutStore';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncError: string | null;
}

export class SupabaseStorageService {
  private static deviceId = DeviceService.getOrCreateDeviceId();

  // Set device ID in Supabase context for RLS policies
  private static async setDeviceContext() {
    // For now, we'll use simpler approach without set_config
    // The device_id will be included in queries directly
  }

  // Sync custom exercises to Supabase
  static async syncCustomExercises(exercises: Exercise[]): Promise<void> {
    await this.setDeviceContext();
    
    const customExercises = exercises.filter(ex => ex.isCustom);
    
    for (const exercise of customExercises) {
      const { error } = await supabase
        .from('user_exercises')
        .upsert({
          id: exercise.id,
          device_id: this.deviceId,
          name: exercise.name,
          muscle_group: exercise.muscle_group,
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing exercise:', error);
        throw error;
      }
    }
  }

  // Load custom exercises from Supabase
  static async loadCustomExercises(): Promise<Exercise[]> {
    await this.setDeviceContext();
    
    const { data, error } = await supabase
      .from('user_exercises')
      .select('*')
      .eq('device_id', this.deviceId);

    if (error) {
      console.error('Error loading exercises:', error);
      return [];
    }

    return data.map(ex => ({
      id: ex.id,
      name: ex.name,
      muscle_group: ex.muscle_group,
      isCustom: true,
    }));
  }

  // Sync global custom trackers
  static async syncCustomTrackers(trackers: Array<{name: string; unit: string}>): Promise<void> {
    await this.setDeviceContext();
    
    // First, clear existing trackers
    await supabase
      .from('user_custom_trackers')
      .delete()
      .eq('device_id', this.deviceId);

    // Insert new trackers
    for (const tracker of trackers) {
      const { error } = await supabase
        .from('user_custom_trackers')
        .insert({
          device_id: this.deviceId,
          name: tracker.name,
          unit: tracker.unit,
        });

      if (error) {
        console.error('Error syncing tracker:', error);
        throw error;
      }
    }
  }

  // Load custom trackers from Supabase
  static async loadCustomTrackers(): Promise<Array<{name: string; unit: string}>> {
    await this.setDeviceContext();
    
    const { data, error } = await supabase
      .from('user_custom_trackers')
      .select('name, unit')
      .eq('device_id', this.deviceId);

    if (error) {
      console.error('Error loading trackers:', error);
      return [];
    }

    return data;
  }

  // Sync workout sessions
  static async syncWorkoutSessions(sessions: WorkoutSession[]): Promise<void> {
    await this.setDeviceContext();
    
    for (const session of sessions) {
      const { error } = await supabase
        .from('workout_sessions')
        .upsert({
          id: session.id,
          device_id: this.deviceId,
          user_id: null, // Required field for RLS
          date: session.date,
          created_at: session.created_at,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing session:', error);
        throw error;
      }

      // Sync workout entries for this session
      const sessionEntries = session.exercises || session.entries || [];
      for (const entry of sessionEntries) {
        const { error: entryError } = await supabase
          .from('workout_entries')
          .upsert({
            id: entry.id,
            session_id: session.id,
            exercise_id: entry.exercise?.id || entry.exercise_id,
            sets: entry.sets as any,
            custom_trackers: entry.custom_trackers || {},
          }, { onConflict: 'id' });

        if (entryError) {
          console.error('Error syncing entry:', entryError);
          throw entryError;
        }
      }
    }
  }

  // Load workout sessions from Supabase
  static async loadWorkoutSessions(): Promise<WorkoutSession[]> {
    await this.setDeviceContext();
    
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_entries (
          *
        )
      `)
      .eq('device_id', this.deviceId)
      .order('date', { ascending: false });

    if (sessionsError) {
      console.error('Error loading sessions:', sessionsError);
      return [];
    }

    // Load exercises to map IDs to exercise objects
    const { data: exercisesData } = await supabase
      .from('exercise_library')
      .select('*');

    const { data: userExercisesData } = await supabase
      .from('user_exercises')
      .select('*')
      .eq('device_id', this.deviceId);

    const allExercises = [
      ...(exercisesData || []).map(ex => ({
        id: ex.id,
        name: ex.name,
        muscle_group: ex.muscle_group,
        isCustom: false,
      })),
      ...(userExercisesData || []).map(ex => ({
        id: ex.id,
        name: ex.name,
        muscle_group: ex.muscle_group,
        isCustom: true,
      })),
    ];

    return sessionsData.map(session => ({
      id: session.id,
      date: session.date,
      created_at: session.created_at,
      exercises: session.workout_entries.map((entry: any) => {
        const exercise = allExercises.find(ex => ex.id === entry.exercise_id);
        return {
          id: entry.id,
          exercise_id: entry.exercise_id,
          exercise: exercise || { id: entry.exercise_id, name: 'Unknown', muscle_group: 'Unknown', isCustom: false },
          sets: entry.sets,
          custom_trackers: entry.custom_trackers || {},
        };
      }),
    }));
  }

  // Check if online and update sync status
  static async checkConnectivity(): Promise<boolean> {
    try {
      const { error } = await supabase.from('device_users').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Register device user
  static async registerDevice(): Promise<void> {
    await this.setDeviceContext();
    
    const { error } = await supabase
      .from('device_users')
      .upsert({
        device_id: this.deviceId,
        last_active: new Date().toISOString(),
      }, { onConflict: 'device_id' });

    if (error) {
      console.error('Error registering device:', error);
    }
  }
}