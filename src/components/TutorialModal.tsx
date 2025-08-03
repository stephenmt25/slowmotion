import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Save, BarChart3 } from 'lucide-react';

export const TutorialModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the tutorial before
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Gym Tracker! 🏋️‍♂️
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* How to use */}
          <div className="space-y-4">
            <h3 className="font-semibold">How to use Gym Tracker:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full p-1 mt-0.5">
                  <Plus className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-medium">Add Exercises</p>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Exercise" to open the exercise selector and choose from pre-built exercises or create custom ones.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-accent text-accent-foreground rounded-full p-1 mt-0.5">
                  <BarChart3 className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-medium">Track Your Sets</p>
                  <p className="text-sm text-muted-foreground">
                    Log weight, reps, and custom metrics like RPE or rest time for each set. Add custom trackers as needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-success text-success-foreground rounded-full p-1 mt-0.5">
                  <Save className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-medium">Save & Review</p>
                  <p className="text-sm text-muted-foreground">
                    Save your workout and review your progress in the History and Progress tabs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleClose} className="w-full">
            Got it, let's start training! 💪
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};