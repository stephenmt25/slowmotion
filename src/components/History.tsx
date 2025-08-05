import { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, ChevronDown, ChevronUp, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const History = () => {
  const { workoutSessions, deleteWorkoutSession } = useWorkoutStore();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const calculateSessionStats = (session: any) => {
    if (!session.entries) return { totalSets: 0, totalReps: 0, totalVolume: 0 };

    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    session.entries.forEach((entry: any) => {
      if (entry.sets) {
        entry.sets.forEach((set: any) => {
          totalSets++;
          totalReps += set.reps || 0;
          totalVolume += (set.weight || 0) * (set.reps || 0);
        });
      }
    });

    return { totalSets, totalReps, totalVolume };
  };

  if (workoutSessions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Workout History</h1>
          <p className="text-muted-foreground">
            View and analyze your past workouts
          </p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No workouts recorded yet</h3>
            <p className="text-muted-foreground text-center">
              Start logging your workouts to see your progress over time
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workout History</h1>
        <p className="text-muted-foreground">
          {workoutSessions.length} workout{workoutSessions.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      <div className="space-y-4">
        {workoutSessions.map((session) => {
          const isExpanded = expandedSessions.has(session.id);
          const stats = calculateSessionStats(session);
          const workoutDate = new Date(session.date);

          return (
            <Card key={session.id} className="workout-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(workoutDate, 'EEEE, MMMM do, yyyy')}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{session.entries?.length || 0} exercises</span>
                      <span>{stats.totalSets} sets</span>
                      <span>{stats.totalReps} reps</span>
                      <span>{Math.round(stats.totalVolume)} total volume</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteWorkoutSession(session.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSessionExpansion(session.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-4">
                    {session.entries?.map((entry: any, entryIndex: number) => (
                      <div key={entryIndex} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{entry.exercise?.name}</h4>
                            <Badge variant="secondary" className="mt-1">
                              {entry.exercise?.muscle_group}
                            </Badge>
                          </div>
                        </div>

                        {/* Sets */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {entry.sets?.map((set: any, setIndex: number) => (
                            <div
                              key={setIndex}
                              className="bg-muted/50 rounded-md p-2 text-sm"
                            >
                              <span className="font-medium">Set {setIndex + 1}:</span>{' '}
                              {set.weight}kg × {set.reps} reps
                              <span className="text-muted-foreground ml-2">
                                ({Math.round(set.weight * set.reps)} vol)
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Custom Trackers */}
                        {entry.custom_trackers && Object.keys(entry.custom_trackers).length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-muted-foreground">Custom Trackers</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(entry.custom_trackers).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="font-medium">{key}:</span>
                                  <span>{value as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {entryIndex < (session.entries?.length || 0) - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>

                  {session.created_at && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Logged {format(new Date(session.created_at), 'MMM do, yyyy \'at\' h:mm a')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};