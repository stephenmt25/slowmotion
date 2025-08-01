import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { LogOut, Dumbbell, History, TrendingUp, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { activePage, setPage, user } = useWorkoutStore();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
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