import React from 'react';
import { Bus, MessageSquareText, Compass, Radio } from 'lucide-react';

export type ScreenTab = 'tracker' | 'excuse' | 'rescue' | 'live_share';

interface NavigationProps {
  activeScreen: ScreenTab;
  onSelectScreen: (screen: ScreenTab) => void;
  diffMinutes: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeScreen,
  onSelectScreen,
  diffMinutes,
}) => {
  const tabs = [
    {
      id: 'tracker' as ScreenTab,
      label: 'Bus Tracker',
      sublabel: 'Dual ETA Sync',
      icon: Bus,
      badge: null,
    },
    {
      id: 'excuse' as ScreenTab,
      label: 'Delay Excuse AI',
      sublabel: 'Singlish Generator',
      icon: MessageSquareText,
      badge: diffMinutes > 0 ? `+${diffMinutes}m late` : 'AI',
    },
    {
      id: 'rescue' as ScreenTab,
      label: 'Rescue Spots',
      sublabel: 'Sheltered & AC',
      icon: Compass,
      badge: 'Pivot',
    },
    {
      id: 'live_share' as ScreenTab,
      label: 'Shared Live ETA',
      sublabel: 'Real-time Trip',
      icon: Radio,
      badge: 'LIVE',
    },
  ];

  return (
    <>
      {/* Desktop Navigation Tabs (Above content) */}
      <div className="hidden sm:block max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-1">
        <nav className="flex items-center justify-between p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectScreen(tab.id)}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 text-xs font-semibold relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="leading-tight font-bold">{tab.label}</div>
                  <div className={`text-[10px] font-normal leading-none mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {tab.sublabel}
                  </div>
                </div>

                {tab.badge && (
                  <span
                    className={`ml-1 text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.id === 'excuse'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : tab.id === 'live_share'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-2xl safe-area-pb">
        <nav className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectScreen(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400 scale-110' : 'text-slate-400'}`} />
                  {tab.badge && (
                    <span
                      className={`absolute -top-1.5 -right-3 text-[8px] font-extrabold px-1 rounded-full ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950'
                          : tab.id === 'excuse'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 leading-tight tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
