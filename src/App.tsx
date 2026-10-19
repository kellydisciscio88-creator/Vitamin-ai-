import { useState, useEffect, useCallback } from 'react';
import { vitaminSchedule, getTotalSupplements } from './data';
import {
  HistoryRecord,
  HealthInsight,
  SubjectiveHistory,
  SubjectiveLog,
  ScheduleBlock,
  Supplement,
  UserProfile
} from './types';
import { ProgressRing } from './components/ProgressRing';
import { ScheduleCard } from './components/ScheduleCard';
import { HealthUploader } from './components/HealthUploader';
import { HealthInsightsViewer } from './components/HealthInsightsViewer';
import { SubjectiveLogger } from './components/SubjectiveLogger';
import { TrendsChart } from './components/TrendsChart';
import { CorrelationInsight } from './components/CorrelationInsight';
import { WeeklyReportViewer } from './components/WeeklyReportViewer';
import { SupplementAdvisor } from './components/SupplementAdvisor';
import { HydrationTracker } from './components/HydrationTracker';
import { MealAlertManager } from './components/MealAlertManager';
import { StackEvaluator } from './components/StackEvaluator';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { ProfileModal } from './components/ProfileModal';
import { SupplementModal } from './components/SupplementModal';
import { BlockModal } from './components/BlockModal';
import { HealthChatBot } from './components/HealthChatBot';
import { ExportModal } from './components/ExportModal';
import {
  Activity,
  CalendarDays,
  FlaskConical,
  LayoutDashboard,
  ListTodo,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  MessageSquare,
  Save,
  CheckCheck,
  FileArchive
} from 'lucide-react';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleAuthProvider } from './lib/firebase';

const DEFAULT_PROFILES: UserProfile[] = [
  {
    profileId: 'cory',
    name: 'Cory',
    age: 10,
    gender: 'Male',
    weight: '72 lbs',
    height: "4'6\"",
    dietaryPreference: 'Omnivore',
    healthGoals: ['Cognitive Focus & Memory', 'Mitochondrial Energy', 'Immune Resilience'],
    healthConditions: ['Sensitive Stomach / GERD'],
    wakeTime: '07:30',
    bedTime: '20:30',
    notes: 'Starting square one. High sensitivity to heavy pill stacks; prefers gentle absorption with food.',
    isCurrent: true,
  },
  {
    profileId: 'taylen',
    name: 'Taylen',
    age: 9,
    gender: 'Female',
    weight: '64 lbs',
    height: "4'3\"",
    dietaryPreference: 'Low-Histamine',
    healthGoals: ['Deep REM Sleep', 'Gut Barrier Repair', 'Histamine Tolerance'],
    healthConditions: ['Histamine Intolerance', 'Sensory Sensitive'],
    wakeTime: '07:30',
    bedTime: '20:30',
    notes: 'Sensory-friendly, low visual clutter, calm pacing. Low-histamine dietary focus.',
    isCurrent: false,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'chat' | 'labs'>('dashboard');
  const [isSavingStack, setIsSavingStack] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  // Profiles State
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('vitality-profiles-v2');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
    } catch (e) {
      return DEFAULT_PROFILES;
    }
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('vitality-active-profile-id');
      return saved || profiles[0]?.profileId || 'cory';
    } catch (e) {
      return profiles[0]?.profileId || 'cory';
    }
  });

  // Client UID for Cloud SQL guest session persistence
  const [clientUid] = useState<string>(() => {
    let uid = localStorage.getItem('vitality-client-uid');
    if (!uid) {
      uid = 'usr-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('vitality-client-uid', uid);
    }
    return uid;
  });

  // Schedule for currently active profile
  const [schedule, setSchedule] = useState<ScheduleBlock[]>(() => {
    try {
      const initialProfile = profiles[0]?.profileId || 'cory';
      const saved = localStorage.getItem(`vitality-schedule-${initialProfile}`);
      return saved ? JSON.parse(saved) : vitaminSchedule;
    } catch (e) {
      return vitaminSchedule;
    }
  });

  // History for currently active profile
  const [history, setHistory] = useState<HistoryRecord>(() => {
    try {
      const initialProfile = profiles[0]?.profileId || 'cory';
      const saved = localStorage.getItem(`vitality-history-${initialProfile}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Subjective logs for currently active profile
  const [subjectiveLogs, setSubjectiveLogs] = useState<SubjectiveHistory>(() => {
    try {
      const initialProfile = profiles[0]?.profileId || 'cory';
      const saved = localStorage.getItem(`vitality-subjective-${initialProfile}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Hydration logs for currently active profile
  const [hydrationLogs, setHydrationLogs] = useState<Record<string, number>>(() => {
    try {
      const initialProfile = profiles[0]?.profileId || 'cory';
      const saved = localStorage.getItem(`vitality-hydration-${initialProfile}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Labs/insights
  const [insights, setInsights] = useState<HealthInsight[]>(() => {
    try {
      const saved = localStorage.getItem('health-insights');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<UserProfile | null>(null);

  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false);
  const [targetBlockId, setTargetBlockId] = useState<string>('');
  const [supplementToEdit, setSupplementToEdit] = useState<Supplement | null>(null);

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockToEdit, setBlockToEdit] = useState<ScheduleBlock | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const activeProfile = profiles.find(p => p.profileId === activeProfileId) || profiles[0];

  // Helper headers for backend calls
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-client-uid': currentUser ? currentUser.uid : clientUid,
    };
    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }
    return headers;
  }, [currentUser, clientUid, idToken]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Cloud SQL profiles on initial mount or auth change
  useEffect(() => {
    async function loadCloudProfiles() {
      try {
        const res = await fetch('/api/profiles', {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles);
            if (!data.profiles.some((p: UserProfile) => p.profileId === activeProfileId)) {
              setActiveProfileId(data.profiles[0].profileId);
            }
          } else {
            // Seed default profiles to Cloud SQL
            for (const p of DEFAULT_PROFILES) {
              await fetch('/api/profiles', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(p),
              });
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync profiles with Cloud SQL, using local state:', err);
      }
    }
    loadCloudProfiles();
  }, [getAuthHeaders]);

  // Load schedule and logs when activeProfileId changes
  useEffect(() => {
    localStorage.setItem('vitality-active-profile-id', activeProfileId);

    // 1. First restore from local cache for instant zero-flicker UI
    const localSched = localStorage.getItem(`vitality-schedule-${activeProfileId}`);
    if (localSched) {
      try {
        setSchedule(JSON.parse(localSched));
      } catch (e) { /* ignore */ }
    } else {
      setSchedule(vitaminSchedule);
    }

    const localHist = localStorage.getItem(`vitality-history-${activeProfileId}`);
    if (localHist) {
      try { setHistory(JSON.parse(localHist)); } catch (e) { /* ignore */ }
    } else {
      setHistory({});
    }

    const localSubj = localStorage.getItem(`vitality-subjective-${activeProfileId}`);
    if (localSubj) {
      try { setSubjectiveLogs(JSON.parse(localSubj)); } catch (e) { /* ignore */ }
    } else {
      setSubjectiveLogs({});
    }

    const localHyd = localStorage.getItem(`vitality-hydration-${activeProfileId}`);
    if (localHyd) {
      try { setHydrationLogs(JSON.parse(localHyd)); } catch (e) { /* ignore */ }
    } else {
      setHydrationLogs({});
    }

    // 2. Fetch from Cloud SQL
    async function loadProfileData() {
      try {
        const res = await fetch(`/api/schedule?profileId=${encodeURIComponent(activeProfileId)}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
            setSchedule(data.schedule);
            localStorage.setItem(`vitality-schedule-${activeProfileId}`, JSON.stringify(data.schedule));
          }
        }
      } catch (err) {
        console.warn('Cloud SQL schedule fetch failed:', err);
      }
    }
    loadProfileData();
  }, [activeProfileId, getAuthHeaders]);

  // Persist active schedule changes
  useEffect(() => {
    if (!activeProfileId) return;
    localStorage.setItem(`vitality-schedule-${activeProfileId}`, JSON.stringify(schedule));

    // Debounced Cloud SQL push
    const timeout = setTimeout(async () => {
      try {
        await fetch('/api/schedule', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ profileId: activeProfileId, schedule }),
        });
      } catch (err) {
        console.warn('Failed to sync schedule to Cloud SQL:', err);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [schedule, activeProfileId, getAuthHeaders]);

  // Persist history changes
  useEffect(() => {
    if (!activeProfileId) return;
    localStorage.setItem(`vitality-history-${activeProfileId}`, JSON.stringify(history));
  }, [history, activeProfileId]);

  // Persist subjective logs
  useEffect(() => {
    if (!activeProfileId) return;
    localStorage.setItem(`vitality-subjective-${activeProfileId}`, JSON.stringify(subjectiveLogs));
  }, [subjectiveLogs, activeProfileId]);

  // Persist hydration
  useEffect(() => {
    if (!activeProfileId) return;
    localStorage.setItem(`vitality-hydration-${activeProfileId}`, JSON.stringify(hydrationLogs));
  }, [hydrationLogs, activeProfileId]);

  // Persist profiles list
  useEffect(() => {
    localStorage.setItem('vitality-profiles-v2', JSON.stringify(profiles));
  }, [profiles]);

  // Persist insights
  useEffect(() => {
    localStorage.setItem('health-insights', JSON.stringify(insights));
  }, [insights]);

  // Current date string in local timezone (YYYY-MM-DD)
  const getTodayStr = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().slice(0, 10);
  };

  const todayStr = getTodayStr();
  const todayRecord = history[todayStr] || {};
  const todaySubjective = subjectiveLogs[todayStr];
  const todayHydration = hydrationLogs[todayStr] || 0;

  const totalItems = getTotalSupplements(schedule);
  const completedToday = Object.keys(todayRecord).filter(k => todayRecord[k]).length;
  const progressPercentage = totalItems > 0 ? (completedToday / totalItems) * 100 : 0;

  const toggleItem = (id: string) => {
    setHistory(prev => {
      const currentDay = prev[todayStr] || {};
      const isCurrentlyDone = !!currentDay[id];
      const updatedDay = {
        ...currentDay,
        [id]: !isCurrentlyDone,
      };

      // Sync log to Cloud SQL
      fetch('/api/logs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          profileId: activeProfileId,
          date: todayStr,
          historyJson: JSON.stringify(updatedDay),
        }),
      }).catch(err => console.warn('Could not sync log to Cloud SQL:', err));

      return {
        ...prev,
        [todayStr]: updatedDay,
      };
    });
  };

  const updateSubjectiveLog = (metric: keyof Omit<SubjectiveLog, 'date'>, value: number) => {
    setSubjectiveLogs(prev => {
      const currentDay = prev[todayStr] || { date: todayStr, mood: 0, energy: 0, sleep: 0 };
      const updatedDay = {
        ...currentDay,
        [metric]: value,
      };

      // Sync log to Cloud SQL
      fetch('/api/logs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          profileId: activeProfileId,
          date: todayStr,
          subjectiveJson: JSON.stringify(updatedDay),
        }),
      }).catch(err => console.warn('Could not sync subjective log:', err));

      return {
        ...prev,
        [todayStr]: updatedDay,
      };
    });
  };

  const handleLogHydration = (amount: number) => {
    setHydrationLogs(prev => {
      const newAmount = Math.max(0, (prev[todayStr] || 0) + amount);

      // Sync log to Cloud SQL
      fetch('/api/logs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          profileId: activeProfileId,
          date: todayStr,
          hydration: newAmount,
        }),
      }).catch(err => console.warn('Could not sync hydration log:', err));

      return {
        ...prev,
        [todayStr]: newAmount,
      };
    });
  };

  const handleAddInsight = (insight: HealthInsight) => {
    setInsights(prev => [insight, ...prev]);
  };

  // Supplement & Block Handlers
  const handleOpenAddSupplement = (blockId?: string) => {
    setTargetBlockId(blockId || schedule[0]?.id || '');
    setSupplementToEdit(null);
    setIsSupplementModalOpen(true);
  };

  const handleOpenEditSupplement = (blockId: string, item: Supplement) => {
    setTargetBlockId(blockId);
    setSupplementToEdit(item);
    setIsSupplementModalOpen(true);
  };

  const handleSaveSupplement = (blockId: string, supplement: Supplement) => {
    setSchedule(prev => {
      // First remove item if it existed in another block (in case user changed the block)
      const cleaned = prev.map(b => ({
        ...b,
        items: b.items.filter(i => i.id !== supplement.id),
      }));

      // Now add to the selected target block
      return cleaned.map(b => {
        if (b.id === blockId) {
          return {
            ...b,
            items: [...b.items, supplement],
          };
        }
        return b;
      });
    });
  };

  const handleDeleteSupplement = (blockId: string, supplementId: string) => {
    setSchedule(prev =>
      prev.map(b =>
        b.id === blockId ? { ...b, items: b.items.filter(i => i.id !== supplementId) } : b
      )
    );
  };

  const handleOpenAddBlock = () => {
    setBlockToEdit(null);
    setIsBlockModalOpen(true);
  };

  const handleOpenEditBlock = (block: ScheduleBlock) => {
    setBlockToEdit(block);
    setIsBlockModalOpen(true);
  };

  const handleSaveBlock = (block: ScheduleBlock) => {
    setSchedule(prev => {
      const exists = prev.some(b => b.id === block.id);
      if (exists) {
        return prev.map(b => (b.id === block.id ? { ...b, ...block } : b));
      } else {
        return [...prev, block];
      }
    });
  };

  const handleDeleteBlock = (blockId: string) => {
    setSchedule(prev => prev.filter(b => b.id !== blockId));
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<ScheduleBlock>) => {
    setSchedule(prev =>
      prev.map(block => (block.id === blockId ? { ...block, ...updates } : block))
    );
  };

  const handleManualSaveStack = async () => {
    setIsSavingStack(true);
    try {
      localStorage.setItem(`vitality-schedule-${activeProfileId}`, JSON.stringify(schedule));
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ profileId: activeProfileId, schedule }),
      });
      if (res.ok) {
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.warn('Manual save to Cloud SQL failed:', err);
    } finally {
      setIsSavingStack(false);
    }
  };

  // Profile Management Handlers
  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    setProfiles(prev => {
      const exists = prev.some(p => p.profileId === updatedProfile.profileId);
      if (exists) {
        return prev.map(p => (p.profileId === updatedProfile.profileId ? updatedProfile : p));
      } else {
        return [...prev, updatedProfile];
      }
    });

    try {
      await fetch('/api/profiles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedProfile),
      });
    } catch (err) {
      console.warn('Could not save profile to Cloud SQL:', err);
    }
  };

  const handleAddNewProfile = () => {
    const newId = 'user-' + Date.now().toString(36);
    const newProfile: UserProfile = {
      profileId: newId,
      name: '',
      age: undefined,
      gender: '',
      weight: '',
      height: '',
      dietaryPreference: 'Omnivore',
      healthGoals: ['Mitochondrial Energy', 'Cognitive Focus & Memory'],
      healthConditions: [],
      wakeTime: '07:00',
      bedTime: '22:30',
      notes: '',
    };
    setProfileToEdit(newProfile);
    setIsProfileModalOpen(true);
  };

  const handleEditActiveProfile = (profile: UserProfile) => {
    setProfileToEdit(profile);
    setIsProfileModalOpen(true);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (profiles.length <= 1) return;
    setProfiles(prev => prev.filter(p => p.profileId !== profileId));
    if (activeProfileId === profileId) {
      const remaining = profiles.filter(p => p.profileId !== profileId);
      setActiveProfileId(remaining[0].profileId);
    }

    try {
      await fetch(`/api/profiles/${encodeURIComponent(profileId)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Could not delete profile from Cloud SQL:', err);
    }
  };

  // Google Sign In / Out
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      setIdToken(token);
      setCurrentUser(result.user);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIdToken(null);
    } catch (err: any) {
      console.error('Sign Out failed:', err);
    }
  };

  // Preset Template loader
  const handleLoadTemplate = (templateName: string) => {
    if (templateName === 'empty') {
      if (confirm('Start with a completely empty protocol for this individual?')) {
        setSchedule([
          {
            id: 'morning',
            title: 'MORNING',
            iconName: 'Sun',
            timeOfDay: 'Morning',
            mealTime: '08:00',
            prepTimeMinutes: 10,
            instructions: 'Take with breakfast or morning beverage',
            items: [],
          },
          {
            id: 'afternoon',
            title: 'AFTERNOON',
            iconName: 'SunMedium',
            timeOfDay: 'Afternoon',
            mealTime: '13:00',
            prepTimeMinutes: 10,
            instructions: 'Take with lunch',
            items: [],
          },
          {
            id: 'evening',
            title: 'EVENING / BEDTIME',
            iconName: 'Moon',
            timeOfDay: 'Night',
            mealTime: '21:00',
            prepTimeMinutes: 5,
            instructions: 'Take before sleep',
            items: [],
          },
        ]);
      }
    } else if (templateName === 'baseline') {
      if (confirm('Load the comprehensive functional medicine baseline stack?')) {
        setSchedule(vitaminSchedule);
      }
    } else if (templateName === 'sleep') {
      if (confirm('Load the Neuro-Calm & Deep Sleep protocol?')) {
        setSchedule([
          {
            id: 'morning-alert',
            title: 'MORNING FOCUS',
            iconName: 'Sunrise',
            timeOfDay: 'Morning',
            mealTime: '07:30',
            prepTimeMinutes: 5,
            instructions: 'With hydration and light morning food',
            items: [
              { id: 'sl-water', name: 'Filtered Water + Electrolytes', dosage: '16 oz', benefits: 'Immediate cellular hydration.' },
              { id: 'sl-theanine', name: 'L-Theanine', dosage: '200 mg', benefits: 'Promotes calm alpha-wave alertness.' },
              { id: 'sl-d3', name: 'Vitamin D3 + K2', dosage: '5000 IU', benefits: 'Calibrates circadian rhythm.' },
            ],
          },
          {
            id: 'evening-calm',
            title: 'NIGHT RECOVERY & DEEP SLEEP',
            iconName: 'Moon',
            timeOfDay: 'Night',
            mealTime: '21:30',
            prepTimeMinutes: 5,
            instructions: '30-45 minutes before sleep with chamomile or water',
            items: [
              { id: 'sl-mag', name: 'Magnesium Glycinate / L-Threonate', dosage: '350 mg', benefits: 'Relaxes muscular tension and crosses blood-brain barrier.' },
              { id: 'sl-apigenin', name: 'Apigenin', dosage: '50 mg', benefits: 'Calms GABAergic system for uninterrupted slow-wave sleep.' },
              { id: 'sl-ashwa', name: 'Ashwagandha (Sensoril/KSM-66)', dosage: '300 mg', benefits: 'Blunts late-evening cortisol spikes.' },
            ],
          },
        ]);
      }
    }
  };

  const dateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 pb-24 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      <div className="fixed top-[-100px] right-[-100px] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-100px] left-[-100px] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <header className="relative z-10 sticky top-0 bg-[#0a0f1e]/85 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="text-white" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-xl text-white">Daily Wellness</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Personalized Protocol & Longevity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
              title="Export Stack as ZIP for ChatGPT"
            >
              <FileArchive size={14} className="text-indigo-400" />
              <span className="hidden sm:inline">Share with ChatGPT (.zip)</span>
              <span className="sm:hidden">ZIP</span>
            </button>

            <div className="text-sm font-medium text-slate-400 flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <CalendarDays size={16} className="text-indigo-400" />
              <span className="hidden sm:inline">{dateDisplay}</span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-6 border-t border-white/5 mt-2 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo size={16} />
            Custom Protocol Stack
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-indigo-400 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={16} />
            <span>Health AI Chat</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-bold">
              Interactions
            </span>
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'labs'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical size={16} />
            Lab Uploads
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-8 relative z-10">
        {/* Profile Switcher / Individual Selector Bar */}
        <ProfileSwitcher
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={id => setActiveProfileId(id)}
          onAddNewProfile={handleAddNewProfile}
          onEditProfile={handleEditActiveProfile}
          onDeleteProfile={handleDeleteProfile}
          currentUserEmail={currentUser?.email}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          isCloudSynced={true}
        />

        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Progress */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl shadow-indigo-900/10 flex flex-col items-center justify-center py-10">
                <div className="flex items-center justify-between w-full mb-4">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                    {activeProfile?.name || 'User'}'s Today Progress
                  </h2>
                  <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {activeProfile?.dietaryPreference || 'Standard'}
                  </span>
                </div>
                <ProgressRing progress={progressPercentage} size={150} strokeWidth={14} />
                <p className="text-slate-400 font-medium mt-6 text-sm">
                  <span className="text-indigo-400 font-bold text-lg">{completedToday}</span> / {totalItems} completed
                </p>
                {completedToday === totalItems && totalItems > 0 && (
                  <div className="mt-4 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">
                    Perfect Day Completed
                  </div>
                )}
              </div>

              {/* Subjective Logger */}
              <SubjectiveLogger todayLog={todaySubjective} onUpdate={updateSubjectiveLog} />
            </div>

            {/* Hydration Tracker */}
            <HydrationTracker
              schedule={schedule}
              currentOunces={todayHydration}
              onLogHydration={handleLogHydration}
            />

            {/* Trends Chart */}
            <TrendsChart schedule={schedule} vitaminHistory={history} subjectiveHistory={subjectiveLogs} />

            {/* Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <CorrelationInsight schedule={schedule} vitaminHistory={history} subjectiveHistory={subjectiveLogs} />
              </div>
              <div className="lg:col-span-2">
                <WeeklyReportViewer vitaminHistory={history} subjectiveHistory={subjectiveLogs} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* AI Stack Evaluator with individual profile context */}
            <StackEvaluator
              schedule={schedule}
              personalProfile={activeProfile}
              onApplySchedule={setSchedule}
            />

            {/* AI Supplement Advisor with individual profile context */}
            <SupplementAdvisor
              currentSchedule={schedule}
              personalProfile={activeProfile}
              onAddSupplement={(blockId, supp) => handleSaveSupplement(blockId, supp)}
            />

            {/* Stack Customization Toolbar */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
                  <span>{activeProfile?.name || 'Your'}'s Daily Vitamin Protocol</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize every supplement, dosage, notes, and timing block for this individual.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleManualSaveStack}
                  disabled={isSavingStack}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Explicitly save and sync this protocol to Cloud SQL"
                >
                  <Save size={14} className={isSavingStack ? "animate-pulse" : ""} />
                  <span>{isSavingStack ? 'Saving...' : 'Save Stack'}</span>
                </button>

                {lastSavedTime && (
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1">
                    <CheckCheck size={12} /> Saved {lastSavedTime}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                  title="Open health chat to check interactions or how to take these vitamins"
                >
                  <MessageSquare size={13} />
                  <span>Ask AI Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3.5 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="Download your vitamin stack as a zip file for ChatGPT"
                >
                  <FileArchive size={13} className="text-indigo-400" />
                  <span>Export for ChatGPT (.zip)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAddSupplement()}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Supplement
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddBlock}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Timing Block
                </button>

                {/* Preset Templates */}
                <div className="relative group">
                  <button
                    type="button"
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <Layers size={13} className="text-indigo-400" />
                    <span>Templates</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-30">
                    <button
                      onClick={() => handleLoadTemplate('empty')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                    >
                      <RotateCcw size={12} /> Start Clean (Empty Stack)
                    </button>
                    <button
                      onClick={() => handleLoadTemplate('baseline')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2 font-medium"
                    >
                      <Sparkles size={12} className="text-amber-400" /> Full Biohacker Baseline
                    </button>
                    <button
                      onClick={() => handleLoadTemplate('sleep')}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2 font-medium"
                    >
                      <Sparkles size={12} className="text-indigo-400" /> Neuro-Calm & Sleep Protocol
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Blocks */}
            <div className="space-y-8">
              {schedule.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-slate-300 font-semibold text-base mb-2">No timing blocks configured yet.</p>
                  <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
                    Create your first timing window (e.g., Morning, Mid-Day, Evening) or load a starter template.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleOpenAddBlock}
                      className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      <Plus size={15} /> Create Timing Block
                    </button>
                    <button
                      onClick={() => handleLoadTemplate('baseline')}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-semibold"
                    >
                      Load Baseline Stack
                    </button>
                  </div>
                </div>
              ) : (
                schedule.map(block => (
                  <ScheduleCard
                    key={block.id}
                    block={block}
                    dailyRecord={todayRecord}
                    onToggleItem={toggleItem}
                    onUpdateBlock={handleUpdateBlock}
                    onAddItem={handleOpenAddSupplement}
                    onEditItem={handleOpenEditSupplement}
                    onDeleteItem={handleDeleteSupplement}
                    onEditBlockModal={handleOpenEditBlock}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HealthChatBot
              currentSchedule={schedule}
              personalProfile={activeProfile}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="space-y-10 mt-4">
            <HealthUploader onInsightAdded={handleAddInsight} />
            <HealthInsightsViewer insights={insights} />
          </div>
        )}
      </main>

      {/* Meal Alerts & Fasting Tracker */}
      <MealAlertManager schedule={schedule} />

      {/* Profile Modal for Personal Information */}
      {profileToEdit && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profileToEdit}
          onSave={handleSaveProfile}
        />
      )}

      {/* Supplement Modal for Adding/Editing Supplements */}
      <SupplementModal
        isOpen={isSupplementModalOpen}
        onClose={() => setIsSupplementModalOpen(false)}
        blocks={schedule}
        initialBlockId={targetBlockId}
        supplementToEdit={supplementToEdit}
        onSave={handleSaveSupplement}
        onDelete={handleDeleteSupplement}
      />

      {/* Block Modal for Adding/Editing Timing Blocks */}
      <BlockModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        blockToEdit={blockToEdit}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
      />

      {/* Export Modal for ChatGPT Zip & Codebase */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeProfile={activeProfile}
        schedule={schedule}
        allProfiles={profiles}
      />
    </div>
  );
}
