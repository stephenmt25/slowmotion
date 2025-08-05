import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Plus, Save, Trash2, X, Copy } from 'lucide-react';
import { ExerciseSelector } from './ExerciseSelector';
import { CustomTrackerModal } from './CustomTrackerModal';
import { TutorialModal } from './TutorialModal';
import { useToast } from '@/hooks/use-toast';

export const LogWorkout = () => {
  const {
    currentWorkout,
    globalCustomTrackers,
    setCurrentWorkoutDate,
    removeExerciseFromWorkout,
    updateWorkoutEntry,
    saveWorkout,
    clearCurrentWorkout,
    addGlobalCustomTracker,
    duplicateSet,
    openModal,
    exercises
  } = useWorkoutStore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);


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
    const newSets = [...entry.sets, { weight: 0, reps: 0, custom_values: {} }];
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

  const handleCustomValueChange = (entryIndex: number, setIndex: number, trackerName: string, value: string) => {
    const entry = currentWorkout.entries[entryIndex];
    const newSets = [...entry.sets];
    newSets[setIndex] = { 
      ...newSets[setIndex], 
      custom_values: { ...newSets[setIndex].custom_values, [trackerName]: value }
    };
    updateWorkoutEntry(entryIndex, { sets: newSets });
  };

  const handleCustomTrackerChange = (entryIndex: number, key: string, value: string) => {
    const entry = currentWorkout.entries[entryIndex];
    const newTrackers = { ...entry.custom_trackers, [key]: value };
    updateWorkoutEntry(entryIndex, { custom_trackers: newTrackers });
  };

  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [isCustomTrackerModalOpen, setIsCustomTrackerModalOpen] = useState(false);

  const addCustomTracker = () => {
    setIsCustomTrackerModalOpen(true);
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

      {/* Add Exercise Button */}
      <Card>
        <CardContent className="p-6">
          <Button 
            onClick={() => setIsExerciseSelectorOpen(true)}
            className="w-full"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Exercise
          </Button>
        </CardContent>
      </Card>

      {/* Exercise Selector Modal */}
      <Dialog open={isExerciseSelectorOpen} onOpenChange={setIsExerciseSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Exercise</DialogTitle>
          </DialogHeader>
          <ExerciseSelector onExerciseSelect={() => setIsExerciseSelectorOpen(false)} />
        </DialogContent>
      </Dialog>

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
                  
                  {/* Table Headers */}
                  <div className="flex gap-2 items-center mb-2">
                    <div className="w-8 text-sm font-medium text-muted-foreground">Set</div>
                    <div className="flex-1 text-sm font-medium text-muted-foreground">Weight</div>
                    <div className="flex-1 text-sm font-medium text-muted-foreground">Reps</div>
                     {globalCustomTrackers.map((tracker, index) => (
                       <div key={index} className="flex-1 text-sm font-medium text-muted-foreground">
                         {tracker.name}{tracker.unit !== 'none' ? ` (${tracker.unit})` : ''}
                       </div>
                     ))}
                    <div className="w-20 text-sm font-medium text-muted-foreground">Actions</div>
                  </div>

                  {/* Table Rows */}
                  {entry.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex gap-2 items-center">
                      <span className="w-8 text-sm font-medium text-center">
                        {setIndex + 1}
                      </span>
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
                       {globalCustomTrackers.map((tracker, trackerIndex) => (
                         <div key={trackerIndex} className="flex-1">
                           <Label htmlFor={`tracker-${tracker.name}-${entryIndex}-${setIndex}`} className="sr-only">{tracker.name}</Label>
                           <Input
                             id={`tracker-${tracker.name}-${entryIndex}-${setIndex}`}
                             type="text"
                             placeholder={tracker.name}
                             value={set.custom_values[tracker.name] || ''}
                             onChange={(e) => handleCustomValueChange(entryIndex, setIndex, tracker.name, e.target.value)}
                           />
                         </div>
                       ))}
                      <div className="w-20 flex items-center justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateSet(entryIndex, setIndex)}
                          title="Duplicate set"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {entry.sets.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSet(entryIndex, setIndex)}
                            title="Remove set"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCustomTracker()}
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

      <CustomTrackerModal 
        isOpen={isCustomTrackerModalOpen}
        onClose={() => setIsCustomTrackerModalOpen(false)}
      />
      <TutorialModal />
    </div>
  );
};