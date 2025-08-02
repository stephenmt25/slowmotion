import { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core'];

export const Progress = () => {
  const { 
    exercises, 
    progressFilter, 
    setProgressFilter, 
    calculateProgressData 
  } = useWorkoutStore();

  const [selectedMetric, setSelectedMetric] = useState<'volume_load' | 'max_weight' | 'estimated_1rm' | 'total_reps'>('volume_load');

  const progressData = calculateProgressData();

  const getMetricDisplayName = (metric: string) => {
    switch (metric) {
      case 'volume_load': return 'Volume Load';
      case 'max_weight': return 'Max Weight';
      case 'estimated_1rm': return 'Estimated 1RM';
      case 'total_reps': return 'Total Reps';
      default: return metric;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'volume_load': return 'hsl(var(--chart-primary))';
      case 'max_weight': return 'hsl(var(--chart-secondary))';
      case 'estimated_1rm': return 'hsl(var(--chart-tertiary))';
      case 'total_reps': return 'hsl(var(--accent))';
      default: return 'hsl(var(--chart-primary))';
    }
  };

  const formatTooltipValue = (value: number, metric: string) => {
    switch (metric) {
      case 'volume_load':
        return `${Math.round(value)} kg`;
      case 'max_weight':
      case 'estimated_1rm':
        return `${value} kg`;
      case 'total_reps':
        return `${value} reps`;
      default:
        return value;
    }
  };

  const calculateSummaryStats = () => {
    if (progressData.length === 0) return null;

    const latest = progressData[progressData.length - 1];
    const previous = progressData.length > 1 ? progressData[progressData.length - 2] : null;

    const improvement = previous 
      ? ((latest[selectedMetric] - previous[selectedMetric]) / previous[selectedMetric]) * 100
      : 0;

    return {
      current: latest[selectedMetric],
      improvement,
      totalSessions: progressData.length
    };
  };

  const stats = calculateSummaryStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress Tracking</h1>
        <p className="text-muted-foreground">
          Visualize your fitness journey and monitor improvements
        </p>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={progressFilter?.type === 'exercise' ? progressFilter.value : ''}
              onValueChange={(value) => 
                setProgressFilter(value ? { type: 'exercise', value } : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All exercises</SelectItem>
                {exercises.map(exercise => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Muscle Group</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={progressFilter?.type === 'muscle_group' ? progressFilter.value : ''}
              onValueChange={(value) => 
                setProgressFilter(value ? { type: 'muscle_group', value } : null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a muscle group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All muscle groups</SelectItem>
                {MUSCLE_GROUPS.map(group => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {!progressFilter ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a filter to view progress</h3>
            <p className="text-muted-foreground text-center">
              Choose an exercise or muscle group to analyze your progress over time
            </p>
          </CardContent>
        </Card>
      ) : progressData.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No data available</h3>
            <p className="text-muted-foreground text-center">
              No workout data found for the selected filter. Start logging workouts to see your progress!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="metric-card">
                  <div className="text-2xl font-bold">{formatTooltipValue(stats.current, selectedMetric)}</div>
                  <p className="text-muted-foreground">Current {getMetricDisplayName(selectedMetric)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="metric-card">
                  <div className="text-2xl font-bold">
                    {stats.improvement > 0 ? '+' : ''}{stats.improvement.toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground">
                    Change from last session
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="metric-card">
                  <div className="text-2xl font-bold">{stats.totalSessions}</div>
                  <p className="text-muted-foreground">Total sessions</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Current Filter Display */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Currently viewing:</span>
                <Badge variant="outline">
                  {progressFilter.type === 'exercise' 
                    ? exercises.find(e => e.id === progressFilter.value)?.name || 'Unknown Exercise'
                    : progressFilter.value
                  }
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Metric Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Metric to Display</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume_load">Volume Load (Weight × Reps)</SelectItem>
                  <SelectItem value="max_weight">Max Weight</SelectItem>
                  <SelectItem value="estimated_1rm">Estimated 1RM</SelectItem>
                  <SelectItem value="total_reps">Total Reps</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Progress Chart */}
          <Card className="progress-chart">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>{getMetricDisplayName(selectedMetric)} Over Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedMetric === 'total_reps' ? (
                    <BarChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value: number) => [formatTooltipValue(value, selectedMetric), getMetricDisplayName(selectedMetric)]}
                      />
                      <Bar dataKey={selectedMetric} fill={getMetricColor(selectedMetric)} />
                    </BarChart>
                  ) : (
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(value: number) => [formatTooltipValue(value, selectedMetric), getMetricDisplayName(selectedMetric)]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={selectedMetric} 
                        stroke={getMetricColor(selectedMetric)} 
                        strokeWidth={3}
                        dot={{ fill: getMetricColor(selectedMetric), strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};