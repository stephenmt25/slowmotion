import { useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const CustomTrackerModal = () => {
  const { isModalOpen, modalType, selectedExerciseId, closeModal, updateWorkoutEntry, currentWorkout } = useWorkoutStore();
  const [trackerName, setTrackerName] = useState('');
  const [trackerValue, setTrackerValue] = useState('');

  const isCustomTrackerModal = isModalOpen && modalType === 'custom-tracker';

  const handleAddTracker = () => {
    if (!trackerName.trim() || selectedExerciseId === null) return;

    // Find the exercise index in current workout
    const exerciseIndex = currentWorkout.entries.findIndex(
      entry => entry.exercise_id === selectedExerciseId
    );

    if (exerciseIndex !== -1) {
      const entry = currentWorkout.entries[exerciseIndex];
      const newTrackers = {
        ...entry.custom_trackers,
        [trackerName.trim()]: trackerValue
      };
      
      updateWorkoutEntry(exerciseIndex, { custom_trackers: newTrackers });
    }

    // Reset and close
    setTrackerName('');
    setTrackerValue('');
    closeModal();
  };

  if (!isCustomTrackerModal) return null;

  return (
    <Dialog open={isCustomTrackerModal} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Tracker</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="tracker-name">Tracker Name</Label>
            <Input
              id="tracker-name"
              value={trackerName}
              onChange={(e) => setTrackerName(e.target.value)}
              placeholder="e.g., RPE, Rest Time, Notes"
            />
          </div>
          <div>
            <Label htmlFor="tracker-value">Value</Label>
            <Input
              id="tracker-value"
              value={trackerValue}
              onChange={(e) => setTrackerValue(e.target.value)}
              placeholder="Enter initial value (optional)"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddTracker} className="flex-1">
              Add Tracker
            </Button>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};