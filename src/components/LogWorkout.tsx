import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Save, Trash2, X } from 'lucide-react';
import { ExerciseSelector } from './ExerciseSelector';
import { CustomTrackerModal } from './CustomTrackerModal';
import { useToast } from '@/hooks/use-toast';

export const LogWorkout = () => {
  const {
    currentWorkout,
    setCurrentWorkoutDate,
    removeExerciseFromWorkout,
    updateWorkoutEntry,
    saveWorkout,
    clearCurrentWorkout,
    openModal,
    fetchExercises,
    exercises
  } = useWorkoutStore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleSaveWorkout = async () => {
    if (currentWorkout.entries.length === 0) {
      toast({
        title: "No exercises added",
        description: "Please add at least one exercise to save your workout.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const success = await saveWorkout();
    
    if (success) {
      toast({
        title: "Workout saved!",
        description: "Your workout has been successfully recorded.",
      });
    } else {
      toast({
        title: "Failed to save workout",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  const handleAddSet = (entryIndex: number) => {
    const entry = currentWorkout.entries[entryIndex];
    const newSets = [...entry.sets, { weight: 0, reps: 0 }];
    updateWorkoutEntry(entryIndex, { sets: newSets });
  };

  const handleRemoveSet = (entryIndex: number, setIndex: number) => {
    const entry = currentWorkout.entries[entryIndex];
    const newSets = entry.sets.filter((_, i) => i !== setIndex);
    updateWorkoutEntry(entryIndex, { sets: newSets });
  };

  const handleSetChange = (entryIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const entry = currentWorkout.entries[entryIndex];
    const newSets = [...entry.sets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: parseFloat(value) || 0 };
    updateWorkoutEntry(entryIndex, { sets: newSets });
  };

  const handleCustomTrackerChange = (entryIndex: number, key: string, value: string) => {
    const entry = currentWorkout.entries[entryIndex];
    const newTrackers = { ...entry.custom_trackers, [key]: value };
    updateWorkoutEntry(entryIndex, { custom_trackers: newTrackers });
  };

  const addCustomTracker = (entryIndex: number) => {
    const key = prompt('Enter tracker name (e.g., RPE, Rest Time):');
    if (key) {
      handleCustomTrackerChange(entryIndex, key, '');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Log Workout</h1>
          <p className="text-muted-foreground">
            Track your exercises, sets, and reps
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="workout-date" className="sr-only">Workout Date</Label>
            <Input
              id="workout-date"
              type="date"
              value={currentWorkout.date}
              onChange={(e) => setCurrentWorkoutDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* Exercise Selector */}
      <ExerciseSelector />

      {/* Current Workout */}
      <div className="space-y-4">
        {currentWorkout.entries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No exercises added yet</h3>
              <p className="text-muted-foreground text-center">
                Start your workout by selecting an exercise above
              </p>
            </CardContent>
          </Card>
        ) : (
          currentWorkout.entries.map((entry, entryIndex) => (
            <Card key={entryIndex} className="exercise-entry">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{entry.exercise?.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {entry.exercise?.muscle_group}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExerciseFromWorkout(entryIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sets */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sets</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSet(entryIndex)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Set
                    </Button>
                  </div>
                  
                  {entry.sets.map((set, setIndex) => (
                    <div key={setIndex} className="set-row">
                      <span className="text-sm font-medium min-w-[2rem]">
                        {setIndex + 1}
                      </span>
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="flex-1">
                          <Label htmlFor={`weight-${entryIndex}-${setIndex}`} className="sr-only">Weight</Label>
                          <Input
                            id={`weight-${entryIndex}-${setIndex}`}
                            type="number"
                            placeholder="Weight"
                            value={set.weight || ''}
                            onChange={(e) => handleSetChange(entryIndex, setIndex, 'weight', e.target.value)}
                            step="0.5"
                            min="0"
                          />
                        </div>
                        <span className="text-muted-foreground">×</span>
                        <div className="flex-1">
                          <Label htmlFor={`reps-${entryIndex}-${setIndex}`} className="sr-only">Reps</Label>
                          <Input
                            id={`reps-${entryIndex}-${setIndex}`}
                            type="number"
                            placeholder="Reps"
                            value={set.reps || ''}
                            onChange={(e) => handleSetChange(entryIndex, setIndex, 'reps', e.target.value)}
                            min="0"
                          />
                        </div>
                      </div>
                      {entry.sets.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSet(entryIndex, setIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom Trackers */}
                {Object.keys(entry.custom_trackers).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Custom Trackers</h4>
                      {Object.entries(entry.custom_trackers).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Label className="min-w-[4rem] text-sm">{key}:</Label>
                          <Input
                            value={value as string}
                            onChange={(e) => handleCustomTrackerChange(entryIndex, key, e.target.value)}
                            placeholder={`Enter ${key.toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCustomTracker(entryIndex)}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Custom Tracker
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Buttons */}
      {currentWorkout.entries.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSaveWorkout}
            disabled={isSaving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Workout'}
          </Button>
          <Button
            variant="outline"
            onClick={clearCurrentWorkout}
            disabled={isSaving}
          >
            Clear Workout
          </Button>
        </div>
      )}

      <CustomTrackerModal />
    </div>
  );
};