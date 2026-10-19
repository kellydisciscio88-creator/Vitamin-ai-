import { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { HistoryRecord, SubjectiveHistory, ScheduleBlock } from '../types';
import { getTotalSupplements } from '../data';
import { cn } from '../lib/utils';

interface TrendsChartProps {
  schedule: ScheduleBlock[];
  vitaminHistory: HistoryRecord;
  subjectiveHistory: SubjectiveHistory;
}

export function TrendsChart({ schedule, vitaminHistory, subjectiveHistory }: TrendsChartProps) {
  const [timeframe, setTimeframe] = useState<7 | 30>(7);
  
  const data = [];
  const total = getTotalSupplements(schedule);
  
  for (let i = timeframe - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Vitamins
    const dayRecord = vitaminHistory[dateStr] || {};
    const completed = Object.keys(dayRecord).filter(k => dayRecord[k]).length;
    const vitaminPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Subjective (scale 1-5, but mapped to 20-100 for visual overlay if using same axis, OR we can use right Y-axis)
    // We will use a right Y-axis for 0-5 scale.
    const subLog = subjectiveHistory[dateStr] || { mood: 0, energy: 0, sleep: 0 };
    
    data.push({
      date: dateStr,
      name: date.toLocaleDateString('en-US', { weekday: 'short', day: timeframe === 30 ? 'numeric' : undefined }),
      vitamins: vitaminPercentage,
      mood: subLog.mood || null,
      energy: subLog.energy || null,
      sleep: subLog.sleep || null,
    });
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Health Trends</h2>
          <p className="text-sm text-slate-400 mt-1">Vitamins vs. Wellness Metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setTimeframe(7)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              timeframe === 7 ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            )}
          >
            7 Days
          </button>
          <button 
            onClick={() => setTimeframe(30)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              timeframe === 30 ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
            )}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#ffffff10" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={[0, 5]}
              tickCount={6}
            />
            <Tooltip 
              cursor={{ fill: '#ffffff0a' }}
              contentStyle={{ backgroundColor: '#0a0f1ea0', backdropFilter: 'blur(16px)', borderColor: '#ffffff20', borderRadius: '12px' }}
              itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
            
            <Bar yAxisId="left" dataKey="vitamins" name="Vitamins Taken" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={timeframe === 30 ? 10 : 30} opacity={0.6} />
            
            <Line yAxisId="right" type="monotone" dataKey="mood" name="Mood" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#0a0f1e', strokeWidth: 2 }} connectNulls />
            <Line yAxisId="right" type="monotone" dataKey="energy" name="Energy" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#0a0f1e', strokeWidth: 2 }} connectNulls />
            <Line yAxisId="right" type="monotone" dataKey="sleep" name="Sleep" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#0a0f1e', strokeWidth: 2 }} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
