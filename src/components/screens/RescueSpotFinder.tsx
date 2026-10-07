import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Coffee,
  BookOpen,
  Wifi,
  Zap,
  ShieldCheck,
  Navigation,
  ArrowRight,
  Send,
  Check,
  Copy,
  SlidersHorizontal,
  CloudRain,
  ExternalLink,
} from 'lucide-react';
import { RescueSpot, MeetupHotspot, CommuterTrip } from '../../types';
import { RESCUE_SPOTS_DATA } from '../../data/singaporeTransitData';

interface RescueSpotFinderProps {
  hotspot: MeetupHotspot;
  youTrip: CommuterTrip;
  friendTrip: CommuterTrip;
  onSetTargetRescueSpot?: (spot: RescueSpot) => void;
}

export const RescueSpotFinder: React.FC<RescueSpotFinderProps> = ({
  hotspot,
  youTrip,
  friendTrip,
  onSetTargetRescueSpot,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlySheltered, setOnlySheltered] = useState(false);
  const [onlyPlugs, setOnlyPlugs] = useState(false);
  const [activeModalSpot, setActiveModalSpot] = useState<RescueSpot | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const diffMinutes = Math.max(0, friendTrip.etaMinutes - youTrip.etaMinutes);
  const friendName = friendTrip.personName.split(' ')[0] || 'Friend';

  // Filter spots for the current meetup hotspot or nearby
  const relevantSpots = RESCUE_SPOTS_DATA.filter((spot) => {
    const matchesHub = spot.hubId === hotspot.id || spot.hubId === 'somerset_313';
    if (!matchesHub) return false;
    if (selectedCategory !== 'all' && spot.category !== selectedCategory) return false;
    if (onlySheltered && spot.shelteredPercent < 100) return false;
    if (onlyPlugs && !spot.hasPlugs) return false;
    return true;
  });

  const generatePivotMessage = (spot: RescueSpot) => {
    return `Hey ${friendName}! Since your bus is delayed by ~${diffMinutes || 10} mins, let's pivot to ${spot.name} instead! It's 100% sheltered from ${hotspot.nearestBusStopName.split('/')[0]} and got cold air-con. I'll chope a table first, see you there!`;
  };

  const handleCopyPivotText = (spot: RescueSpot) => {
    const msg = generatePivotMessage(spot);
    navigator.clipboard.writeText(msg);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleSendWhatsAppPivot = (spot: RescueSpot) => {
    const msg = encodeURIComponent(generatePivotMessage(spot));
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-900 border border-teal-500/30 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Meetup Rescue: Alternative Spot Finder</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Sheltered & Air-Con Waiting Sanctuary
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Don't sweat in 33°C tropical heat or get soaked by sudden rain at the open bus stop. When someone is delayed by 10-25 mins, pivot smoothly to a 100% sheltered indoor spot nearby!
            </p>
          </div>

          {diffMinutes > 0 && (
            <div className="px-3.5 py-2 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-200 text-xs font-semibold flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              <span>
                <strong>+{diffMinutes}m</strong> waiting window available
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Filter Tabs & Quick Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Rescue Spots', icon: Compass },
            { id: 'toast_kopi', label: '☕ Kopi & Toast', icon: Coffee },
            { id: 'library', label: '📚 Quiet & Plugs', icon: BookOpen },
            { id: 'bbt', label: '🧋 Bubble Tea & Bites', icon: Coffee },
            { id: 'cafe', label: '🥐 Specialty Cafes', icon: Coffee },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Switches */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setOnlySheltered(!onlySheltered)}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              onlySheltered
                ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>100% Sheltered Only</span>
          </button>

          <button
            onClick={() => setOnlyPlugs(!onlyPlugs)}
            className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              onlyPlugs
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Has Plugs</span>
          </button>
        </div>
      </div>

      {/* Spot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {relevantSpots.map((spot) => (
          <div
            key={spot.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all space-y-3.5 relative overflow-hidden group"
          >
            <div>
              {/* Top Row: Name, Walking Distance, and Shelter Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {spot.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{spot.locationDetails}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-emerald-400 font-mono">
                    {spot.walkingMinutes} min walk
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{spot.distanceMeters}m away</div>
                </div>
              </div>

              {/* Badges strip (Aircon, Shelter, Crowd, Plugs) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                  {spot.airConLevel}
                </span>

                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                    spot.shelteredPercent === 100
                      ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  ☂️ {spot.shelteredPercent}% Sheltered Linkway
                </span>

                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  Crowd: <strong className="text-white font-medium">{spot.crowdLevel}</strong>
                </span>

                {spot.hasPlugs && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    <span>Plugs</span>
                  </span>
                )}

                {spot.hasWifi && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5" />
                    <span>Wi-Fi</span>
                  </span>
                )}
              </div>

              {/* Specialty & Opening Hours */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-850/80 border border-slate-750 text-xs space-y-1">
                <div className="text-slate-300 flex items-start gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-semibold">Specialty:</strong> {spot.specialty}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 pl-5">
                  Hours: {spot.openHours} · Price: {spot.priceLevel}
                </div>
              </div>

              {/* Sheltered Walking Directions */}
              <div className="mt-2 text-[11px] text-slate-400 flex items-start gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{spot.shelteredDirections}</span>
              </div>
            </div>

            {/* Bottom Button: Pivot Meetup Here */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400">
                Direct rainproof route from {hotspot.nearestBusStopName.split('/')[0]}
              </span>

              <button
                onClick={() => setActiveModalSpot(spot)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Pivot Meetup Here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Pivot Location Confirmation & WhatsApp Broadcast */}
      {activeModalSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Confirm Location Pivot
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeModalSpot.name}</h3>
                <p className="text-xs text-slate-400">{activeModalSpot.locationDetails}</p>
              </div>

              <button
                onClick={() => setActiveModalSpot(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Notification Preview Text Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">WhatsApp Alert to {friendName}:</label>
              <div className="p-3 rounded-xl bg-slate-850 border border-slate-700 text-xs text-slate-200 font-mono leading-relaxed">
                {generatePivotMessage(activeModalSpot)}
              </div>
            </div>

            {/* Sheltered Guidance Note */}
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">100% Rainproof Route:</span>
                <p className="text-[11px] text-teal-300 mt-0.5">{activeModalSpot.shelteredDirections}</p>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleSendWhatsAppPivot(activeModalSpot)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Alert via WhatsApp</span>
              </button>

              <button
                onClick={() => handleCopyPivotText(activeModalSpot)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedNotification ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedNotification ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
