import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Activity, Heart } from 'lucide-react';

interface CycleData {
  date: string;
  cycleLength: number | null;
  isPeriod: boolean;
}

interface SymptomData {
  symptom: string;
  frequency: number;
  category: string;
}

interface MoodData {
  date: string;
  mood: string;
  energy: number;
}

interface PubertyPhaseAnalyticsProps {
  cycleData: CycleData[];
  symptomData: SymptomData[];
  moodData: MoodData[];
}

export default function PubertyPhaseAnalytics({
  cycleData,
  symptomData,
  moodData,
}: PubertyPhaseAnalyticsProps) {
  // Process cycle data for line chart
  const cycleChartData = useMemo(() => {
    return cycleData
      .filter(item => item.cycleLength !== null)
      .map(item => ({
        date: item.date,
        cycleLength: item.cycleLength!,
        isPeriod: item.isPeriod,
      }))
      .reverse();
  }, [cycleData]);

  // Calculate cycle statistics
  const cycleStats = useMemo(() => {
    if (cycleChartData.length === 0) {
      return {
        average: 0,
        regularity: 'Insufficient data',
        sampleSize: 0,
      };
    }

    const lengths = cycleChartData.map(item => item.cycleLength);
    const average = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    
    // Calculate regularity
    if (lengths.length < 3) {
      return { average, regularity: 'Insufficient data', sampleSize: lengths.length };
    }
    
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((acc, length) => acc + Math.pow(length - avg, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    let regularity: string;
    if (stdDev <= 4) regularity = 'Regular';
    else if (stdDev <= 7) regularity = 'Slightly irregular';
    else regularity = 'Irregular';

    return { average, regularity, sampleSize: lengths.length };
  }, [cycleChartData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Visual Analytics</h2>
          <p className="text-xs text-muted-foreground">Track your patterns and trends</p>
        </div>
      </div>

      {/* Cycle Regularity Chart */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold">Cycle Regularity</h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Avg:</span>
              <span className="font-medium">{cycleStats.average} days</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Pattern:</span>
              <span className={`font-medium ${
                cycleStats.regularity === 'Regular' ? 'text-green-600' :
                cycleStats.regularity === 'Slightly irregular' ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {cycleStats.regularity}
              </span>
            </div>
          </div>
        </div>

        {cycleChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cycleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#888"
                domain={[15, 45]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cycleLength" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', r: 4 }}
                name="Cycle Length (days)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No cycle data available</p>
              <p className="text-xs">Start tracking your periods to see patterns</p>
            </div>
          </div>
        )}
      </div>

      {/* Symptom Frequency Chart */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">Symptom Frequency</h3>
        </div>

        {symptomData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={symptomData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis 
                type="category"
                dataKey="symptom"
                tick={{ fontSize: 12 }}
                stroke="#888"
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="frequency" 
                fill="#82ca9d"
                name="Frequency"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No symptom data available</p>
              <p className="text-xs">Log your symptoms daily to see patterns</p>
            </div>
          </div>
        )}
      </div>

      {/* Mood & Energy Trends */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">Mood & Energy Trends</h3>
        </div>

        {moodData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#888"
                domain={[0, 10]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#ffc658" 
                strokeWidth={2}
                dot={{ fill: '#ffc658', r: 3 }}
                name="Energy Level"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No mood data available</p>
              <p className="text-xs">Track your mood and energy to see trends</p>
            </div>
          </div>
        )}
      </div>

      {/* Insights Summary */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="text-base font-semibold mb-3">Key Insights</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
            <p>
              {cycleStats.regularity === 'Regular' 
                ? 'Your menstrual cycle shows a regular pattern, which is a positive health indicator.'
                : cycleStats.regularity === 'Slightly irregular'
                ? 'Your cycle shows some variation, which is common during puberty.'
                : 'Your cycle appears irregular - consider discussing with a healthcare provider.'
              }
            </p>
          </div>
          {symptomData.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <p>
                Most frequent symptom: <span className="font-medium">{symptomData[0]?.symptom}</span>
              </p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            <p>
              Continue consistent tracking to get more accurate insights and predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
