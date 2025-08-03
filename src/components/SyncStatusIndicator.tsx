import { useWorkoutStore } from '@/stores/workoutStore';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, Wifi, WifiOff } from 'lucide-react';

export const SyncStatusIndicator = () => {
  const { syncStatus } = useWorkoutStore();

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

  return (
    <Badge variant={getStatusColor()} className="text-xs flex items-center gap-1">
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );
};