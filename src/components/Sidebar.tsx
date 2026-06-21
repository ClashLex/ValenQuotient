import React from 'react';
import {
  Home,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Radio,
  UserCircle2,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenAuth: () => void;
}

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  num: string;
}

/**
 * Sidebar navigation rail component (desktop layout).
 * Wraps static navigation items, supports hover states, keyboard navigation, and aria labels.
 */
export const Sidebar = React.memo(function Sidebar({
  activeSection,
  setActiveSection,
  onOpenAuth,
}: SidebarProps) {
  const { user } = useAuth();

  const tabs: TabItem[] = [
    { id: 'home', label: 'Dashboard', icon: Home, num: '01' },
    { id: 'analysis', label: 'Gap Matrix', icon: BarChart3, num: '02' },
    { id: 'trackers', label: 'CO₂ Trackers', icon: MessageSquare, num: '03' },
    { id: 'advisory', label: 'Eco Directive', icon: HelpCircle, num: '04' },
    { id: 'profile', label: 'My Profile', icon: UserCircle2, num: '05' },
  ];

  /** Extract initials from display name or email */
  const initials = (() => {
    const name = user?.displayName;
    const email = user?.email ?? '';
    if (name) {
      const parts = name.trim().split(' ');
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  })();

  return (
    <aside className="hidden md:flex flex-col w-[72px] lg:w-[84px] h-full bg-[#00041d] border-r border-white/5 py-5 justify-between items-center shrink-0 z-30 relative shadow-2xl">
      {/* Top App Avatar / Logo Badge */}
      <div className="flex flex-col items-center gap-1.5 focus:outline-none" aria-hidden="true">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neon to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-neon/10 hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full rounded-xl bg-[#010828] flex items-center justify-center font-bold font-grotesk text-neon text-sm">
            VQ
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_8px_#6FFF00]" />
      </div>

      {/* Mid Navigation Tab Icons Stack */}
      <nav className="flex flex-col gap-4 w-full px-3" aria-label="Main Desktop Navigation">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer relative group ${
                isActive
                  ? 'bg-neon/10 border border-neon/30 text-neon shadow-[0_0_12px_rgba(111,255,0,0.15)]'
                  : 'text-[#9cb4e5]/70 hover:bg-white/5 hover:text-cream border border-transparent'
              }`}
              title={tab.label}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent
                size={18}
                className={
                  isActive ? 'scale-110 text-neon' : 'group-hover:scale-105 transition-transform'
                }
              />
              <span className="font-mono text-[7px] uppercase tracking-widest leading-none mt-0.5 scale-90">
                {isActive ? 'OPEN' : tab.num}
              </span>

              {/* Cyber Hover Tooltip */}
              <span className="absolute left-[80px] bg-[#00041d] border border-white/10 text-neon font-mono text-[8px] uppercase tracking-widest px-2.5 py-1 rounded shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-40">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Panel — User Avatar + Status */}
      <div className="flex flex-col items-center gap-4">
        {/* User avatar button → profile tab (signed in) or auth modal (guest) */}
        <button
          id="sidebar-user-avatar"
          onClick={() => (user ? setActiveSection('profile') : onOpenAuth())}
          title={user ? 'My Profile' : 'Sign In'}
          aria-label={user ? 'Open my profile' : 'Sign in'}
          className={`relative w-9 h-9 rounded-xl flex items-center justify-center font-grotesk text-xs font-bold transition-all duration-300 cursor-pointer ${
            activeSection === 'profile'
              ? 'bg-neon/20 border border-neon/40 text-neon shadow-[0_0_10px_rgba(111,255,0,0.2)]'
              : 'bg-white/5 border border-white/10 text-cream/60 hover:text-neon hover:border-neon/20 hover:bg-neon/5'
          }`}
        >
          {user?.photoURL ? (
            <img src={user.photoURL} alt={`${user.displayName || 'User'} profile avatar`} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <span>{initials}</span>
          )}
          {/* Online dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon border-2 border-[#00041d]" />
        </button>

        <div className="flex flex-col items-center gap-1 font-mono text-[8.5px] text-[#9cb4e5]/40 uppercase tracking-widest">
          <Radio size={14} className="text-neon/50 animate-pulse" aria-hidden="true" />
          <span>NODE</span>
        </div>
      </div>
    </aside>
  );
});
