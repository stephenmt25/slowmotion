import { useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useLifecycleSync } from '@/hooks/useLifecycleSync';
import { Layout } from '@/components/Layout';
import { LogWorkout } from '@/components/LogWorkout';
import { History } from '@/components/History';
import { Progress } from '@/components/Progress';

const Index = () => {
  const { activePage, loadExercises, loadWorkoutHistory } = useWorkoutStore();
  
  // Initialize sync functionality
  useLifecycleSync();

  useEffect(() => {
    // Initialize data from local storage (fallback)
    loadExercises();
    loadWorkoutHistory();
  }, [loadExercises, loadWorkoutHistory]);

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
