import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HistoryRecord, ScheduleBlock } from '../types';
import { getTotalSupplements } from '../data';

export function WeeklyChart({ history, schedule }: { history: HistoryRecord, schedule: ScheduleBlock[] }) {
  const data = [];
  const total = getTotalSupplements(schedule);
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayRecord = history[dateStr] || {};
    const completed = Object.keys(dayRecord).filter(k => dayRecord[k]).length;
    
    data.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: dateStr,
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    });
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
            dy={10}
          />
          <Tooltip 
            cursor={{ fill: '#ffffff0a' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-[#0a0f1e]/90 backdrop-blur-xl p-3 border border-white/10 rounded-xl shadow-xl shadow-black/50">
                    <p className="font-semibold text-slate-100 mb-1">{data.date}</p>
                    <p className="text-xs text-slate-400">
                      Completed: <span className="font-semibold text-indigo-400">{data.completed}</span> / {data.total}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.percentage >= 100 ? '#10b981' : '#6366f1'} opacity={entry.percentage === 0 ? 0.15 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
