import React, { useState, useEffect } from 'react';
import { Clock, MapPin, ChevronDown, CloudRain, ShieldCheck, Share2 } from 'lucide-react';
import { MeetupHotspot } from '../types';
import { MEETUP_HOTSPOTS } from '../data/singaporeTransitData';

interface HeaderProps {
  currentHotspot: MeetupHotspot;
  onSelectHotspot: (hotspot: MeetupHotspot) => void;
  onOpenShareModal: () => void;
  activeScreen: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentHotspot,
  onSelectHotspot,
  onOpenShareModal,
}) => {
  const [sgTime, setSgTime] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Singapore Time (SGT UTC+8)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setSgTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg tracking-wider shrink-0">
            CU
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-white truncate">CatchUp SG</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <span>LTA Singapore Bus Grid</span>
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
            </p>
          </div>
        </div>

        {/* Hotspot Meetup Destination Selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            title="Change Meetup Location"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] block text-slate-400 uppercase font-medium">Meetup Target</span>
              <span className="font-semibold text-white truncate max-w-[150px] block">{currentHotspot.name}</span>
            </div>
            <div className="sm:hidden font-semibold text-white truncate max-w-[110px]">
              {currentHotspot.name.split(' ')[0]}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 bg-slate-850 rounded-xl shadow-2xl border border-slate-700 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 bg-slate-900">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Singapore Meetup Spot
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {MEETUP_HOTSPOTS.map((hotspot) => (
                  <button
                    key={hotspot.id}
                    onClick={() => {
                      onSelectHotspot(hotspot);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                      currentHotspot.id === hotspot.id
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${currentHotspot.id === hotspot.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{hotspot.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{hotspot.area} · MRT: {hotspot.nearestMrt}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Clock & Share button */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{sgTime || '19:42:00'} SGT</span>
          </div>

          <button
            onClick={onOpenShareModal}
            className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-700/30 cursor-pointer"
            title="Share Live Meetup Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Subtle Weather / Transit Advisory Strip */}
      <div className="bg-slate-950/70 border-t border-slate-800/60 px-4 py-1 text-[11px] text-slate-400 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <CloudRain className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">
              Weather: <strong className="text-slate-300 font-medium">Scattered monsoon drizzle</strong> along CTE/PIE corridors. Heavy shelter routing active.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-slate-400 text-[10px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>LTA DataMall Sync: 10s</span>
          </div>
        </div>
      </div>
    </header>
  );
};
