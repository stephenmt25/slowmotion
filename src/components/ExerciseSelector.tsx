import { useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MUSCLE_GROUPS = [
  'Chest',
  'Back', 
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Core'
];

interface ExerciseSelectorProps {
  onExerciseSelect?: () => void;
}

export const ExerciseSelector = ({ onExerciseSelect }: ExerciseSelectorProps) => {
  const { exercises, addExerciseToWorkout, addCustomExercise } = useWorkoutStore();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState('');

  // Filter exercises based on search and muscle group
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || selectedMuscleGroup === 'all' || exercise.muscle_group === selectedMuscleGroup;
    return matchesSearch && matchesMuscleGroup;
  });

  const handleSelectExercise = (exerciseId: string) => {
    addExerciseToWorkout(exerciseId);
    setSearchTerm('');
    onExerciseSelect?.();
  };

  const handleAddCustomExercise = async () => {
    if (!newExerciseName.trim() || !newExerciseMuscleGroup) {
      toast({
        title: "Missing information",
        description: "Please enter both exercise name and muscle group.",
        variant: "destructive",
      });
      return;
    }

    const newExercise = await addCustomExercise(newExerciseName.trim(), newExerciseMuscleGroup);
    
    if (newExercise) {
      addExerciseToWorkout(newExercise.id);
      setIsAddDialogOpen(false);
      setNewExerciseName('');
      setNewExerciseMuscleGroup('');
      onExerciseSelect?.();
      toast({
        title: "Exercise added!",
        description: `${newExercise.name} has been added to your workout.`,
      });
    } else {
      toast({
        title: "Failed to add exercise",
        description: "Please try again or check if the exercise already exists.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold">Add Exercise</h3>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Exercise</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exercise-name">Exercise Name</Label>
                    <Input
                      id="exercise-name"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      placeholder="e.g., Cable Crossovers"
                    />
                  </div>
                  <div>
                    <Label htmlFor="muscle-group">Muscle Group</Label>
                    <Select value={newExerciseMuscleGroup} onValueChange={setNewExerciseMuscleGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select muscle group" />
                      </SelectTrigger>
                      <SelectContent>
                        {MUSCLE_GROUPS.map(group => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCustomExercise} className="flex-1">
                      Add & Select
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All muscle groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All muscle groups</SelectItem>
                {MUSCLE_GROUPS.map(group => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exercise List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {filteredExercises.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {searchTerm || selectedMuscleGroup ? 'No exercises found matching your criteria.' : 'No exercises available.'}
              </div>
            ) : (
              filteredExercises.map(exercise => (
                <Button
                  key={exercise.id}
                  variant="outline"
                  onClick={() => handleSelectExercise(exercise.id)}
                  className="h-auto p-3 text-left justify-start flex-col items-start space-y-1"
                >
                  <span className="font-medium">{exercise.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {exercise.muscle_group}
                  </Badge>
                </Button>
              ))
            )}
          </div>
    </div>
  );
};