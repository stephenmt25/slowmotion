import { useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CustomTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRACKER_UNITS = [
  'none',
  'seconds',
  'minutes',
  'kg',
  'lbs',
  'reps',
  'sets',
  'RPE (1-10)',
  '%',
  'cm',
  'inches'
];

export const CustomTrackerModal = ({ isOpen, onClose }: CustomTrackerModalProps) => {
  const { addGlobalCustomTracker } = useWorkoutStore();
  const [trackerName, setTrackerName] = useState('');
  const [trackerUnit, setTrackerUnit] = useState('none');

  const handleAddTracker = () => {
    if (!trackerName.trim()) return;

    const trackerDisplayName = trackerUnit === 'none' 
      ? trackerName.trim() 
      : `${trackerName.trim()} (${trackerUnit})`;
    
    addGlobalCustomTracker(trackerName.trim(), trackerUnit);

    // Reset and close
    setTrackerName('');
    setTrackerUnit('none');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <Label htmlFor="tracker-unit">Unit</Label>
            <Select value={trackerUnit} onValueChange={setTrackerUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {TRACKER_UNITS.map(unit => (
                  <SelectItem key={unit} value={unit}>
                    {unit === 'none' ? 'No unit' : unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddTracker} className="flex-1">
              Add Tracker
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};