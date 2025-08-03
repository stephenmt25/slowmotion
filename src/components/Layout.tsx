import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Dumbbell, History, TrendingUp, Plus } from 'lucide-react';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { activePage, setPage } = useWorkoutStore();

  const navItems = [
    { id: 'log', label: 'Log Workout', icon: Plus },
    { id: 'history', label: 'History', icon: History },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <Dumbbell className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Gym Tracker</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activePage === item.id ? "default" : "ghost"}
                    onClick={() => setPage(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Sync Status & App Title */}
            <div className="hidden sm:flex items-center space-x-4">
              <SyncStatusIndicator />
              <span className="text-sm text-muted-foreground">Personal Gym Tracker</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b border-border bg-card">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activePage === item.id ? "default" : "ghost"}
                onClick={() => setPage(item.id)}
                className="flex-1 flex-col space-y-1 h-auto py-3"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};