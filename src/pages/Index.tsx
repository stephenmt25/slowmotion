import { useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Auth } from '@/components/Auth';
import { Layout } from '@/components/Layout';
import { LogWorkout } from '@/components/LogWorkout';
import { History } from '@/components/History';
import { Progress } from '@/components/Progress';

const Index = () => {
  const { user, isLoading, activePage } = useWorkoutStore();

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
