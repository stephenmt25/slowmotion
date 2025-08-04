import { useWorkoutStore } from '@/stores/workoutStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { SupabaseStorageService } from '@/services/supabaseStorage';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

export const SyncStatusIndicator = () => {
  const { syncStatus, exercises, workoutSessions, globalCustomTrackers, setSyncStatus } = useWorkoutStore();
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const getStatusColor = () => {
    if (syncStatus.syncError) return 'destructive';
    if (!syncStatus.isOnline) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (syncStatus.syncError) return <CloudOff className="h-3 w-3" />;
    if (!syncStatus.isOnline) return <WifiOff className="h-3 w-3" />;
    return <Cloud className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (syncStatus.syncError) return 'Sync Error';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.lastSync) {
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - syncStatus.lastSync.getTime()) / (1000 * 60));
      if (diffMinutes === 0) return 'Just synced';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      return 'Synced';
    }
    return 'Online';
  };

  const handleManualSync = async () => {
    if (isManualSyncing) return;
    
    setIsManualSyncing(true);
    try {
      setSyncStatus({ 
        ...syncStatus, 
        syncError: null 
      });

      await SupabaseStorageService.manualSync({
        exercises,
        workoutSessions,
        globalCustomTrackers
      });

      setSyncStatus({
        isOnline: true,
        lastSync: new Date(),
        pendingChanges: 0,
        syncError: null
      });

      toast({
        title: "Sync successful",
        description: "Your workout data has been synced to the cloud.",
      });
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus({
        ...syncStatus,
        syncError: error instanceof Error ? error.message : 'Manual sync failed'
      });

      toast({
        title: "Sync failed",
        description: "Failed to sync your data. Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusColor()} className="text-xs flex items-center gap-1">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      
      {(syncStatus.syncError || !syncStatus.isOnline) && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualSync}
          disabled={isManualSyncing}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className={`h-3 w-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      )}
    </div>
  );
};