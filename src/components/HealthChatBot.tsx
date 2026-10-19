import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, Sparkles, Globe, Trash2, ArrowUpRight, ShieldAlert, Pill, Clock, CheckCircle2, Loader2, HelpCircle, FileArchive } from 'lucide-react';
import { ScheduleBlock, UserProfile } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  sources?: Array<{ title: string; uri: string }>;
  timestamp: string;
}

interface HealthChatBotProps {
  currentSchedule: ScheduleBlock[];
  personalProfile?: UserProfile;
  onOpenExport?: () => void;
}

const QUICK_PROMPTS = [
  "What vitamins in my stack should NEVER be taken together?",
  "Which of my vitamins need to be taken with food vs empty stomach?",
  "How should I space out minerals like Calcium, Zinc, and Magnesium?",
  "Are there any missing synergistic co-factors in my daily protocol?",
  "What supplements should I avoid taking late in the day so my sleep isn't ruined?",
  "Can you review my stack considering my health goals and sensitivities?"
];

export function HealthChatBot({ currentSchedule, personalProfile, onOpenExport }: HealthChatBotProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(`vitality-chat-${personalProfile?.profileId || 'default'}`);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }

    return [
      {
        id: 'welcome',
        role: 'model',
        content: `Hello ${personalProfile?.name || 'there'}! I am your **Vitality Clinical Nutrition & Vitamin Interaction Assistant**. 

I have full context of your current **daily schedule** (${currentSchedule.reduce((acc, b) => acc + b.items.length, 0)} supplements configured) and your **personal health profile** (${personalProfile?.dietaryPreference || 'Standard diet'}, goals: ${personalProfile?.healthGoals?.slice(0, 2).join(', ') || 'overall vitality'}).

Ask me anything about:
• **What NOT to take together** (competing minerals, bioavailability blockers, contraindications)
• **Best ways to take each vitamin** (with dietary fat, empty stomach, circadian morning vs. evening)
• **Timing and spacing** to maximize cellular uptake and avoid stomach distress.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist messages per profile
  useEffect(() => {
    try {
      localStorage.setItem(`vitality-chat-${personalProfile?.profileId || 'default'}`, JSON.stringify(messages));
    } catch (e) { /* ignore */ }
  }, [messages, personalProfile?.profileId]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare payload for backend
      const payloadMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/health-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          currentSchedule,
          personalProfile
        })
      });

      if (!res.ok) {
        throw new Error('Failed to get advice from Vitality AI.');
      }

      const data = await res.json();

      const modelMessage: Message = {
        id: 'msg-' + Date.now() + '-model',
        role: 'model',
        content: data.text || "I've reviewed your request. Please let me know if you'd like more specific guidance.",
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'An error occurred while connecting to the assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleClearChat = () => {
    if (confirm('Clear the current conversation thread?')) {
      const resetMsg: Message = {
        id: 'welcome-reset',
        role: 'model',
        content: `Conversation refreshed! What would you like to know about taking your vitamins or avoiding interactions today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([resetMsg]);
    }
  };

  const totalSupplements = currentSchedule.reduce((acc, b) => acc + b.items.length, 0);

  return (
    <div className="flex flex-col h-[750px] max-h-[82vh] bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Chat Header */}
      <div className="bg-[#0f172a] border-b border-white/10 p-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
            <Bot size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base">Vitality Health & Vitamin Assistant</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <Globe size={10} /> Google Search Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Tailored for <strong className="text-white">{personalProfile?.name || 'You'}</strong></span>
              <span>•</span>
              <span>{totalSupplements} vitamins in stack</span>
              {personalProfile?.dietaryPreference && (
                <>
                  <span>•</span>
                  <span>{personalProfile.dietaryPreference}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm"
              title="Export Stack as ZIP for ChatGPT"
            >
              <FileArchive size={14} />
              <span className="hidden sm:inline">Export for ChatGPT (.zip)</span>
              <span className="sm:hidden">ZIP</span>
            </button>
          )}

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-white/5"
            title="Clear Conversation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-[#0a0f1e]/40 to-[#0a0f1e]/90">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white border-indigo-400/30 shadow-md shadow-indigo-500/20'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isUser ? (
                  personalProfile?.name?.charAt(0)?.toUpperCase() || <User size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-lg text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 border border-white/10 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Header info for model */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert size={12} /> Clinical Guidance
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                )}

                {/* Message Body with clean markdown/line breaks */}
                <div className="whitespace-pre-wrap space-y-1.5">
                  {msg.content}
                </div>

                {/* Grounding Sources (Google Search) */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
                      <Globe size={11} className="text-emerald-400" /> Grounded Research & Medical Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.slice(0, 4).map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-indigo-200 border border-white/10 transition-colors"
                        >
                          <span className="truncate max-w-[150px]">{src.title}</span>
                          <ArrowUpRight size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp for user */}
                {isUser && (
                  <div className="text-[10px] text-indigo-200/70 text-right mt-1.5">
                    {msg.timestamp}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="bg-slate-800/90 border border-white/10 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400 animate-spin" />
              <span>Checking pharmacological interactions & literature via Google Search...</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-slate-950/80 border-t border-white/5 px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 shrink-0 mr-1 flex items-center gap-1">
          <HelpCircle size={11} /> Quick Questions:
        </span>
        {QUICK_PROMPTS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-full text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleFormSubmit} className="p-4 bg-[#0f172a] border-t border-white/10 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask about interactions, best time to take vitamins, or what not to combine...`}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
