import React, { useState, useEffect } from 'react';
import {
  Radio,
  Bus,
  Gauge,
  MapPin,
  Clock,
  Play,
  RotateCcw,
  AlertTriangle,
  Heart,
  Coffee,
  Smile,
  Send,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { CommuterTrip, MeetupHotspot, ReactionBubble } from '../../types';

interface SharedLiveEtaStatusProps {
  hotspot: MeetupHotspot;
  youTrip: CommuterTrip;
  friendTrip: CommuterTrip;
  onAdvanceStop: () => void;
  onResetTrip: () => void;
  onTriggerDelay: () => void;
}

export const SharedLiveEtaStatus: React.FC<SharedLiveEtaStatusProps> = ({
  hotspot,
  youTrip,
  friendTrip,
  onAdvanceStop,
  onResetTrip,
  onTriggerDelay,
}) => {
  const [reactions, setReactions] = useState<ReactionBubble[]>([
    {
      id: '1',
      sender: 'Chloe',
      text: 'Order Teh-C ping for you first?',
      emoji: '☕',
      timestamp: '19:41',
      xOffset: 20,
    },
    {
      id: '2',
      sender: 'Chloe',
      text: 'Chope-d table inside Ya Kun already!',
      emoji: '🪑',
      timestamp: '19:42',
      xOffset: 65,
    },
  ]);

  const [inputReaction, setInputReaction] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Auto-simulation interval if active
  useEffect(() => {
    let interval: any;
    if (isSimulating && youTrip.stopsRemaining > 0) {
      interval = setInterval(() => {
        onAdvanceStop();
      }, 3500);
    } else if (youTrip.stopsRemaining === 0) {
      setIsSimulating(false);
    }
    return () => clearInterval(interval);
  }, [isSimulating, youTrip.stopsRemaining, onAdvanceStop]);

  const handleSendReaction = (text: string, emoji = '💬') => {
    if (!text.trim()) return;
    const newBubble: ReactionBubble = {
      id: Date.now().toString(),
      sender: 'You',
      text,
      emoji,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      xOffset: Math.floor(Math.random() * 60) + 10,
    };
    setReactions((prev) => [...prev.slice(-6), newBubble]);
    setInputReaction('');
  };

  const shareableUrl = `https://catchup.sg/track?id=bus${youTrip.busServiceNo}-${youTrip.regNumber}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const progressPercent = Math.round(
    ((youTrip.totalStops - youTrip.stopsRemaining) / youTrip.totalStops) * 100
  );

  return (
    <div className="space-y-4 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* 1. PASSENGER & VEHICLE STATUS HERO CARD */}
      <section className="bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-750 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Radar signal glow effect */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>LIVE BROADCAST</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={youTrip.avatar}
                alt={youTrip.personName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                🚌
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Active Commuter
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{youTrip.personName}</span>
                <span className="text-xs font-mono font-medium text-slate-400">({youTrip.regNumber})</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                On <strong>Bus {youTrip.busServiceNo}</strong> · {youTrip.operator} · {youTrip.deckPosition}
              </p>
            </div>
          </div>

          {/* Real-time Telemetry metrics */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[75px]">
              <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-slate-400" />
                <span>Speed</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{youTrip.speedKmH} km/h</div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[85px]">
              <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>ETA</span>
              </div>
              <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                {youTrip.stopsRemaining === 0 ? 'Arrived!' : `${youTrip.etaMinutes} mins`}
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[75px]">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Stops Left</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {youTrip.stopsRemaining} / {youTrip.totalStops}
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Progress to {hotspot.name.split(' ')[0]}</span>
            <span className="font-mono text-emerald-400 font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-750">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-green-300 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE ROUTE PROGRESS TRACKER & SIMULATION TRAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Stops Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Bus {youTrip.busServiceNo} Live Route Stops</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                  LTA Route 65
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">GPS location refreshed every 10 seconds</p>
            </div>

            {/* Interactive Simulation Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                disabled={youTrip.stopsRemaining === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                  isSimulating
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Simulating...' : 'Auto Run'}</span>
              </button>

              <button
                onClick={onAdvanceStop}
                disabled={youTrip.stopsRemaining === 0}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
                title="Advance 1 Stop forward"
              >
                +1 Stop
              </button>

              <button
                onClick={onResetTrip}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stops Vertical Timeline */}
          <div className="space-y-0 relative pl-4 border-l-2 border-slate-800 ml-3">
            {youTrip.routeStops.map((stop, idx) => {
              const isCurrent = stop.isCurrent;
              const isPassed = stop.passed && !isCurrent;
              const isFinal = idx === youTrip.routeStops.length - 1;

              return (
                <div key={stop.code} className="relative pb-5 last:pb-1">
                  {/* Circle Indicator on the line */}
                  <div
                    className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/30'
                        : isPassed
                        ? 'bg-emerald-800 border-emerald-600 text-white text-[8px]'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    {isPassed && '✓'}
                  </div>

                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-emerald-300'
                              : isPassed
                              ? 'text-slate-400 line-through'
                              : 'text-white'
                          }`}
                        >
                          {stop.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{stop.code}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold uppercase animate-pulse">
                            Current
                          </span>
                        )}
                        {isFinal && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 font-extrabold uppercase">
                            Destination
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isPassed
                          ? 'Passed'
                          : isCurrent
                          ? 'Alighting/Boarding now'
                          : `Approaching in ~${stop.etaMinutes} mins`}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono text-xs">
                      {isCurrent ? (
                        <span className="text-emerald-400 font-bold">Now</span>
                      ) : isPassed ? (
                        <span className="text-slate-400">Passed</span>
                      ) : (
                        <span className="text-slate-300">+{stop.etaMinutes}m</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delay Injection button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Test delay handling:
            </span>
            <button
              onClick={onTriggerDelay}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate +5m Traffic Jam at CTE</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Friend's Perspective & Live Reactions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div>
            {/* Friend's Vantage View Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <img
                  src={friendTrip.avatar}
                  alt={friendTrip.personName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/50"
                />
                <div>
                  <div className="text-xs font-bold text-white">{friendTrip.personName}</div>
                  <div className="text-[11px] text-amber-300">
                    Watching your live link · At {hotspot.name.split(' ')[0]}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                title="View QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>

            {/* Live Friend Reaction Stream */}
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto no-scrollbar">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Live Chat & Arrival Reactions
              </div>

              {reactions.map((r) => (
                <div
                  key={r.id}
                  className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 text-xs flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                  <span className="text-lg shrink-0">{r.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-slate-300">{r.sender}</span>
                      <span>{r.timestamp}</span>
                    </div>
                    <p className="text-slate-200 mt-0.5 leading-snug">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Interactive Reaction Pills */}
            <div className="mt-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                Tap Quick SG Reactions:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { text: 'Order Teh-C ping first!', emoji: '☕' },
                  { text: 'Chope table already!', emoji: '🪑' },
                  { text: 'Safe trip, don’t rush!', emoji: '💚' },
                  { text: 'Got seats upstairs?', emoji: '🚌' },
                  { text: 'Almost there sial!', emoji: '🔥' },
                ].map((item) => (
                  <button
                    key={item.text}
                    onClick={() => handleSendReaction(item.text, item.emoji)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shareable Link Box & Action */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 text-xs flex items-center justify-between gap-2">
              <div className="truncate text-slate-400 font-mono text-[11px]">
                {shareableUrl}
              </div>
              <button
                onClick={handleCopyShareLink}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Share Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Share Live Transit Link</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* QR Mock graphic with Singapore Transit design */}
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-inner flex flex-col items-center justify-center border-4 border-emerald-500">
              <div className="w-full h-full bg-slate-950 p-2 rounded-xl flex flex-col items-center justify-center text-emerald-400 font-mono text-center">
                <QrCode className="w-24 h-24 text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                  CATCHUP.SG / 65
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Friend scans to view real-time countdown, live stops passed, and deck occupancy!
            </p>

            <button
              onClick={handleCopyShareLink}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Live Link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
