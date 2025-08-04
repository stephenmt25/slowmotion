import { useEffect, useRef } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { SupabaseStorageService } from '@/services/supabaseStorage';
import { toast } from '@/hooks/use-toast';

export const useLifecycleSync = () => {
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const { 
    exercises, 
    workoutSessions, 
    globalCustomTrackers,
    setSyncStatus,
    syncToSupabase,
    loadFromSupabase 
  } = useWorkoutStore();

  // Auto-sync every 30 seconds during activity
  useEffect(() => {
    const performAutoSync = async () => {
      try {
        await syncToSupabase();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    };

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Set new timeout for auto-sync
    syncTimeoutRef.current = setTimeout(performAutoSync, 30000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [exercises, workoutSessions, globalCustomTrackers, syncToSupabase]);

  // Handle page close/refresh
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      try {
        // Attempt final sync
        await syncToSupabase();
      } catch (error) {
        console.error('Final sync failed:', error);
        // Warn user about unsaved changes
        event.preventDefault();
        event.returnValue = 'You have unsaved workout data. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden, attempt sync
        try {
          await syncToSupabase();
        } catch (error) {
          console.error('Visibility sync failed:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncToSupabase]);

  // Load data on mount and check connectivity
  useEffect(() => {
    const initializeSync = async () => {
      try {
        console.log('Initializing sync...');
        setSyncStatus({ isOnline: false, lastSync: null, pendingChanges: 0, syncError: null });
        
        // Check if we have local data first
        const hasLocalData = exercises.length > 0 || workoutSessions.length > 0;
        console.log('Has local data:', hasLocalData);
        
        // Register device
        await SupabaseStorageService.registerDevice();
        
        // Check connectivity
        const isOnline = await SupabaseStorageService.checkConnectivity();
        console.log('Is online:', isOnline);
        
        if (isOnline) {
          // Only load from Supabase if we don't have newer local data
          if (!hasLocalData) {
            console.log('Loading from Supabase (no local data)...');
            await loadFromSupabase();
          } else {
            console.log('Keeping local data, syncing to cloud...');
            // Sync local data to cloud
            await syncToSupabase();
          }
          
          setSyncStatus({ 
            isOnline: true, 
            lastSync: new Date(), 
            pendingChanges: 0, 
            syncError: null 
          });
          
          toast({
            title: "Data synced",
            description: hasLocalData ? "Your local data has been synced to the cloud." : "Your workout data has been loaded from the cloud.",
          });
        } else {
          setSyncStatus({ 
            isOnline: false, 
            lastSync: null, 
            pendingChanges: 0, 
            syncError: 'No internet connection' 
          });
          
          if (!hasLocalData) {
            toast({
              title: "Offline mode",
              description: "No internet connection. Your data will sync when you're back online.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Initialization failed:', error);
        setSyncStatus({ 
          isOnline: false, 
          lastSync: null, 
          pendingChanges: 0, 
          syncError: error instanceof Error ? error.message : 'Failed to initialize sync'
        });
        
        toast({
          title: "Sync error",
          description: "Failed to initialize sync. Your data is saved locally.",
          variant: "destructive",
        });
      }
    };

    initializeSync();
  }, [loadFromSupabase, setSyncStatus, syncToSupabase]);
};