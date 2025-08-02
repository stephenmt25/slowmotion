import { useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Layout } from '@/components/Layout';
import { LogWorkout } from '@/components/LogWorkout';
import { History } from '@/components/History';
import { Progress } from '@/components/Progress';

const Index = () => {
  const { activePage, loadExercises, loadWorkoutHistory } = useWorkoutStore();

  useEffect(() => {
    // Initialize data from local storage
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
