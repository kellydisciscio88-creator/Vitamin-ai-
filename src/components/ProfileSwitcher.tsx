import { useState } from 'react';
import { User, Users, Plus, Edit3, Trash2, Check, ShieldCheck, Database, LogIn, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileSwitcherProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onAddNewProfile: () => void;
  onEditProfile: (profile: UserProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  currentUserEmail?: string | null;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  isCloudSynced?: boolean;
}

export function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddNewProfile,
  onEditProfile,
  onDeleteProfile,
  currentUserEmail,
  onGoogleSignIn,
  onSignOut,
  isCloudSynced = true
}: ProfileSwitcherProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeProfile = profiles.find(p => p.profileId === activeProfileId) || profiles[0];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Active Individual Summary */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20 shrink-0">
            {activeProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Active Individual
              </span>
              {isCloudSynced && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Database size={10} /> Cloud SQL
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-lg font-black tracking-tight text-white">
                {activeProfile?.name || 'Primary User'}
              </h2>
              {activeProfile?.age && (
                <span className="text-xs text-slate-400 font-medium">
                  ({activeProfile.age} yo{activeProfile.gender ? `, ${activeProfile.gender}` : ''})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {activeProfile?.dietaryPreference && (
                <span className="text-[11px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                  🍽️ {activeProfile.dietaryPreference}
                </span>
              )}
              {activeProfile?.healthConditions && activeProfile.healthConditions.slice(0, 2).map(c => (
                <span key={c} className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  ⚠️ {c}
                </span>
              ))}
              {activeProfile?.healthGoals && activeProfile.healthGoals.slice(0, 2).map(g => (
                <span key={g} className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  🎯 {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Switcher / Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:self-center">
          {/* Individuals list pills */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
            {profiles.map(p => {
              const isSelected = p.profileId === activeProfileId;
              return (
                <button
                  key={p.profileId}
                  onClick={() => onSelectProfile(p.profileId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <User size={12} />
                  {p.name}
                </button>
              );
            })}

            <button
              onClick={onAddNewProfile}
              title="Add New Individual"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all flex items-center gap-1"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Add Individual</span>
            </button>
          </div>

          {/* Edit current profile button */}
          {activeProfile && (
            <button
              onClick={() => onEditProfile(activeProfile)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Edit Personal Information"
            >
              <Edit3 size={14} className="text-indigo-400" />
              <span className="hidden md:inline">Edit Info</span>
            </button>
          )}

          {/* Delete profile button if multiple */}
          {profiles.length > 1 && activeProfile && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete profile "${activeProfile.name}" and all their custom stack data?`)) {
                  onDeleteProfile(activeProfile.profileId);
                }
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 transition-colors"
              title="Delete this profile"
            >
              <Trash2 size={14} />
            </button>
          )}

          {/* Cloud Auth Button */}
          {onGoogleSignIn && (
            <div className="ml-auto sm:ml-0">
              {currentUserEmail ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs">
                  <span className="text-emerald-400 truncate max-w-[120px] font-medium" title={currentUserEmail}>
                    {currentUserEmail}
                  </span>
                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      className="text-slate-400 hover:text-rose-400"
                      title="Sign Out"
                    >
                      <LogOut size={13} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onGoogleSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  <LogIn size={13} className="text-indigo-400" />
                  <span>Google Sign In</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
