import { useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { supabase } from '@/integrations/supabase/client';
import { Auth } from '@/components/Auth';
import { Layout } from '@/components/Layout';
import { LogWorkout } from '@/components/LogWorkout';
import { History } from '@/components/History';
import { Progress } from '@/components/Progress';

const Index = () => {
  const { user, isLoading, activePage, setUser, setSession, setLoading, fetchExercises } = useWorkoutStore();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch exercises when user is authenticated
        if (session?.user) {
          fetchExercises();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Fetch exercises when user is authenticated
      if (session?.user) {
        fetchExercises();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading, fetchExercises]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'log':
        return <LogWorkout />;
      case 'history':
        return <History />;
      case 'progress':
        return <Progress />;
      default:
        return <LogWorkout />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

export default Index;
