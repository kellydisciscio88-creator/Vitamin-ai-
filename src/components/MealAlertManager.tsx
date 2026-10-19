import { useEffect, useState } from 'react';
import { ScheduleBlock } from '../types';
import { Bell, X } from 'lucide-react';

interface MealAlertManagerProps {
  schedule: ScheduleBlock[];
}

interface ActiveAlert {
  id: string;
  blockTitle: string;
  message: string;
}

function getPrepTime(mealTime: string, prepTimeMinutes: number): string {
  const [h, m] = mealTime.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() - prepTimeMinutes);
  const ph = date.getHours().toString().padStart(2, '0');
  const pm = date.getMinutes().toString().padStart(2, '0');
  return `${ph}:${pm}`;
}

export function MealAlertManager({ schedule }: MealAlertManagerProps) {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);

  useEffect(() => {
    // Check every 30 seconds
    const interval = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      const storageKey = `meal-alerts-${todayStr}`;
      
      try {
        const alertedStr = localStorage.getItem(storageKey);
        const alerted: string[] = alertedStr ? JSON.parse(alertedStr) : [];
        let newAlertsFound = false;

        schedule.forEach(block => {
          if (block.mealTime && block.prepTimeMinutes && !alerted.includes(block.id)) {
            const prepStart = getPrepTime(block.mealTime, block.prepTimeMinutes);
            if (currentHHMM === prepStart) {
              setAlerts(prev => [...prev, {
                id: block.id,
                blockTitle: block.title,
                message: `Time to start prepping for ${block.title}! (Prep time: ${block.prepTimeMinutes}m)`
              }]);
              alerted.push(block.id);
              newAlertsFound = true;
            }
          }
        });

        if (newAlertsFound) {
          localStorage.setItem(storageKey, JSON.stringify(alerted));
          // If browser notifications are allowed, send one
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Meal Prep Alert", {
              body: `It's time to start prepping for your next meal!`,
            });
          }
        }
      } catch (e) {
        console.error("Failed to parse alert storage", e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [schedule]);

  // Ask for notification permission on mount if not asked
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-slate-800 border-l-4 border-emerald-500 rounded-lg shadow-xl shadow-black/50 p-4 flex items-start gap-3 animate-in slide-in-from-right fade-in duration-300 pointer-events-auto">
          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-full shrink-0">
            <Bell size={20} className="animate-[ring_2s_ease-in-out_infinite]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-slate-100 font-bold text-sm">{alert.blockTitle} PREP</h4>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">{alert.message}</p>
          </div>
          <button 
            onClick={() => dismissAlert(alert.id)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
