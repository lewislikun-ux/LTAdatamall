import React, { useState, useEffect } from 'react';
import {
  Bus,
  RefreshCw,
  Search,
  Users,
  Compass,
  ArrowRight,
  Accessibility,
  Flame,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { BusStop, BusService, CommuterTrip, MeetupHotspot, LoadLevel } from '../../types';
import { BUS_STOPS_DATA } from '../../data/singaporeTransitData';

interface LiveBusEtaTrackerProps {
  hotspot: MeetupHotspot;
  youTrip: CommuterTrip;
  friendTrip: CommuterTrip;
  onSetYouBus: (service: BusService, stop: BusStop) => void;
  onSetFriendBus: (service: BusService, stop: BusStop) => void;
  onNavigateToExcuse: () => void;
  onNavigateToRescue: () => void;
}

export const LiveBusEtaTracker: React.FC<LiveBusEtaTrackerProps> = ({
  hotspot,
  youTrip,
  friendTrip,
  onSetYouBus,
  onSetFriendBus,
  onNavigateToExcuse,
  onNavigateToRescue,
}) => {
  const [selectedStopCode, setSelectedStopCode] = useState<string>(hotspot.nearestBusStopCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(12);
  const [expandedServiceNo, setExpandedServiceNo] = useState<string | null>('65');
  const [viewFilter, setViewFilter] = useState<'all' | 'double_decker' | 'has_seats'>('all');

  // Update selected stop if hotspot changes
  useEffect(() => {
    setSelectedStopCode(hotspot.nearestBusStopCode);
  }, [hotspot.nearestBusStopCode]);

  // Countdown timer for live bus arrival updates
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setSecondsUntilRefresh(15);
    }, 600);
  };

  const currentStop = BUS_STOPS_DATA.find((s) => s.code === selectedStopCode) || BUS_STOPS_DATA[0];

  // Filter bus services
  const filteredServices = currentStop.services.filter((svc) => {
    const matchesSearch =
      svc.serviceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.routeDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.operator.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (viewFilter === 'double_decker' && svc.nextBus.type !== 'Double Decker') return false;
    if (viewFilter === 'has_seats' && svc.nextBus.load !== 'Seats Available') return false;
    return true;
  });

  // Calculate ETA differential
  const diffMinutes = friendTrip.etaMinutes - youTrip.etaMinutes;

  const getLoadBadge = (load: LoadLevel) => {
    switch (load) {
      case 'Seats Available':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-500',
          label: 'Seats Avail',
          short: 'SEA',
        };
      case 'Standing Available':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          dot: 'bg-amber-500',
          label: 'Standing Avail',
          short: 'SDA',
        };
      case 'Limited Standing':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-500',
          label: 'Limited Standing',
          short: 'LSD',
        };
    }
  };

  const getOperatorColor = (operator: string) => {
    switch (operator) {
      case 'SBS Transit':
        return 'from-purple-600 to-indigo-600 border-purple-500/30';
      case 'SMRT':
        return 'from-red-600 to-rose-700 border-red-500/30';
      case 'Tower Transit':
        return 'from-emerald-600 to-green-700 border-emerald-500/30';
      case 'Go-Ahead SG':
        return 'from-amber-600 to-yellow-600 border-amber-500/30';
      default:
        return 'from-slate-700 to-slate-800 border-slate-600';
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* 1. DUAL MEETUP SYNC HERO CARD */}
      <section className="bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-750 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Dual Arrival Synchronizer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              Target: <span className="text-emerald-300 font-extrabold">{hotspot.name}</span>
            </h2>
          </div>

          {/* Differential Status Callout */}
          <div className="flex items-center gap-2">
            {diffMinutes > 0 ? (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  You arrive <strong>{diffMinutes}m earlier</strong> than {friendTrip.personName.split(' ')[0]}
                </span>
              </div>
            ) : diffMinutes < 0 ? (
              <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  You are <strong>{Math.abs(diffMinutes)}m behind</strong> {friendTrip.personName.split(' ')[0]}
                </span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Perfect Sync: Arriving together!</span>
              </div>
            )}
          </div>
        </div>

        {/* Dual Commuter Cards Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {/* Commuter 1: YOU */}
          <div className="bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/80 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={youTrip.avatar}
                  alt={youTrip.personName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/50 shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{youTrip.personName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                      You
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    On <strong className="text-white">Bus {youTrip.busServiceNo}</strong> · {youTrip.deckPosition}
                  </div>
                </div>
              </div>

              {/* Big ETA Display */}
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
                  {youTrip.etaMinutes} <span className="text-xs font-medium text-slate-400">mins</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ETA ~{new Date(Date.now() + youTrip.etaMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>{youTrip.currentStopName}</span>
                <span className="text-emerald-400 font-medium">{youTrip.stopsRemaining} stops left</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(((youTrip.totalStops - youTrip.stopsRemaining) / youTrip.totalStops) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Commuter 2: FRIEND (CHLOE) */}
          <div className="bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/80 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={friendTrip.avatar}
                  alt={friendTrip.personName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/50 shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{friendTrip.personName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold">
                      Friend
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    On <strong className="text-white">Bus {friendTrip.busServiceNo}</strong> · {friendTrip.vehicleType}
                  </div>
                </div>
              </div>

              {/* Big ETA Display */}
              <div className="text-right">
                <div className="text-2xl font-black text-amber-400 tracking-tight font-mono">
                  {friendTrip.etaMinutes} <span className="text-xs font-medium text-slate-400">mins</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  ETA ~{new Date(Date.now() + friendTrip.etaMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span className="truncate max-w-[170px]">{friendTrip.currentStopName}</span>
                <span className="text-amber-400 font-medium shrink-0">{friendTrip.stopsRemaining} stops left</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(((friendTrip.totalStops - friendTrip.stopsRemaining) / friendTrip.totalStops) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Strategy Action Callouts */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>
              {diffMinutes > 3
                ? `You have a ${diffMinutes} min buffer before Chloe arrives. Perfect for a quick kopi!`
                : diffMinutes < -3
                ? `You're ${Math.abs(diffMinutes)} mins behind! Send Chloe a quick Singlish delay update.`
                : 'Both transit paths in sync! Head straight to the meetup spot.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {diffMinutes > 3 && (
              <button
                onClick={onNavigateToRescue}
                className="px-3 py-1.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/40 border border-teal-500/40 text-teal-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                <span>Find Sheltered Chill Spot</span>
              </button>
            )}

            {diffMinutes < 0 && (
              <button
                onClick={onNavigateToExcuse}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate Delay Excuse</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. BUS STOP SELECTOR & LIVE ARRIVALS BOARD */}
      <section className="space-y-3">
        {/* Bus Stop Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Selected Stop Header */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{currentStop.name}</h3>
                <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentStop.code}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {currentStop.road} · 50m to {hotspot.name.split(' ')[0]}
              </div>
            </div>
          </div>

          {/* Controls: Search, Filter & Refresh */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[140px] sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter bus (e.g. 65)"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewFilter('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  viewFilter === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="All buses"
              >
                All
              </button>
              <button
                onClick={() => setViewFilter('double_decker')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  viewFilter === 'double_decker' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Double Deckers only"
              >
                DD
              </button>
              <button
                onClick={() => setViewFilter('has_seats')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  viewFilter === 'has_seats' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Seats available only"
              >
                Seats
              </button>
            </div>

            {/* Refresh countdown button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Refresh LTA Real-time Arrival"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">{secondsUntilRefresh}s</span>
            </button>
          </div>
        </div>

        {/* Bus Stop Quick Tabs (Switch between nearby bus stops) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {BUS_STOPS_DATA.map((stop) => (
            <button
              key={stop.code}
              onClick={() => setSelectedStopCode(stop.code)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedStopCode === stop.code
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="font-mono text-[10px] text-slate-400">{stop.code}</span>
              <span>{stop.name.split('/')[0]}</span>
            </button>
          ))}
        </div>

        {/* Real-time Bus Arrivals Grid */}
        <div className="space-y-2.5">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400">
              <Bus className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
              <p className="text-sm font-medium">No bus services found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for 65, 190, 147, or clear filter.</p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const isExpanded = expandedServiceNo === service.serviceNo;
              const nextLoad = getLoadBadge(service.nextBus.load);
              const subLoad = getLoadBadge(service.subsequentBus.load);
              const thirdLoad = getLoadBadge(service.thirdBus.load);
              const isYouBus = youTrip.busServiceNo === service.serviceNo;
              const isFriendBus = friendTrip.busServiceNo === service.serviceNo;

              return (
                <div
                  key={service.serviceNo}
                  className={`bg-slate-900 border rounded-xl transition-all overflow-hidden ${
                    isYouBus
                      ? 'border-emerald-500/50 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                      : isFriendBus
                      ? 'border-amber-500/50 shadow-md shadow-amber-950/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header & Primary ETA Row */}
                  <div
                    onClick={() => setExpandedServiceNo(isExpanded ? null : service.serviceNo)}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-850/60 transition-colors"
                  >
                    {/* Left: Service Pill & Route */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Big Bus Service Number Badge */}
                      <div
                        className={`w-14 h-12 rounded-xl bg-gradient-to-br ${getOperatorColor(
                          service.operator
                        )} border flex flex-col items-center justify-center text-white font-black text-xl tracking-tight shadow-md shrink-0`}
                      >
                        {service.serviceNo}
                        <span className="text-[8px] font-normal tracking-tighter opacity-80 uppercase leading-none">
                          {service.operator.split(' ')[0]}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{service.routeDescription}</span>
                          {isYouBus && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold uppercase tracking-wide border border-emerald-500/30">
                              Your Trip
                            </span>
                          )}
                          {isFriendBus && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-extrabold uppercase tracking-wide border border-amber-500/30">
                              Chloe's Bus
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>{service.operator}</span>
                          <span className="text-slate-600">·</span>
                          <span className="flex items-center gap-1">
                            {service.nextBus.type === 'Double Decker' ? 'Double Decker 🚌' : 'Single Deck'}
                          </span>
                          {service.nextBus.wab && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="flex items-center gap-0.5 text-slate-400" title="Wheelchair Accessible Bus">
                                <Accessibility className="w-3 h-3 text-cyan-400" />
                                <span>WAB</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: 3 Bus Arrival Times (Next, Subsequent, 3rd) */}
                    <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center shrink-0">
                      {/* 1st Next Bus */}
                      <div className="text-center px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 min-w-[70px]">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold leading-none mb-1">Next</div>
                        <div
                          className={`text-base font-black font-mono leading-none ${
                            service.nextBus.etaMinutes <= 2 ? 'text-emerald-400 animate-pulse' : 'text-white'
                          }`}
                        >
                          {service.nextBus.etaMinutes <= 0 ? 'Arr' : `${service.nextBus.etaMinutes}m`}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${nextLoad.dot}`}></span>
                          <span className="text-[9px] font-mono text-slate-400 font-medium">{nextLoad.short}</span>
                        </div>
                      </div>

                      {/* 2nd Bus */}
                      <div className="text-center px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-750 min-w-[62px]">
                        <div className="text-[9px] text-slate-400 uppercase font-medium leading-none mb-1">2nd</div>
                        <div className="text-sm font-bold font-mono text-slate-200 leading-none">
                          {service.subsequentBus.etaMinutes}m
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${subLoad.dot}`}></span>
                          <span className="text-[9px] font-mono text-slate-400">{subLoad.short}</span>
                        </div>
                      </div>

                      {/* 3rd Bus */}
                      <div className="text-center px-2 py-1.5 rounded-lg bg-slate-800/40 border border-slate-750/70 min-w-[55px] hidden xs:block">
                        <div className="text-[9px] text-slate-400 uppercase font-medium leading-none mb-1">3rd</div>
                        <div className="text-xs font-semibold font-mono text-slate-400 leading-none">
                          {service.thirdBus.etaMinutes}m
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <span className={`w-1 h-1 rounded-full ${thirdLoad.dot}`}></span>
                          <span className="text-[8px] font-mono text-slate-400">{thirdLoad.short}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Route Details & Action Buttons */}
                  {isExpanded && (
                    <div className="bg-slate-950/70 border-t border-slate-800/80 p-3.5 sm:p-4 text-xs space-y-3">
                      {/* Vehicle Deck / Crowding Info Banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                        <div className="p-2 rounded-lg bg-slate-850 border border-slate-750">
                          <span className="text-[10px] block text-slate-400 uppercase font-medium">1st Bus Vehicle</span>
                          <span className="font-semibold text-white">{service.nextBus.type}</span>
                          <span className={`ml-2 text-[10px] px-1 py-0.2 rounded ${nextLoad.bg}`}>
                            {nextLoad.label}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-850 border border-slate-750">
                          <span className="text-[10px] block text-slate-400 uppercase font-medium">2nd Bus Vehicle</span>
                          <span className="font-semibold text-white">{service.subsequentBus.type}</span>
                          <span className={`ml-2 text-[10px] px-1 py-0.2 rounded ${subLoad.bg}`}>
                            {subLoad.label}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-850 border border-slate-750">
                          <span className="text-[10px] block text-slate-400 uppercase font-medium">Route Distance</span>
                          <span className="font-semibold text-white">{service.stopsCount} stops total</span>
                          <span className="ml-2 text-[10px] text-slate-400 font-mono">15-30m avg run</span>
                        </div>
                      </div>

                      {/* Commuter Assignment Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="text-[11px] text-slate-400">
                          Select this bus to synchronize your dual meetup arrival countdown.
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSetYouBus(service, currentStop)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isYouBus
                                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                                : 'bg-slate-800 hover:bg-emerald-600/30 text-emerald-300 border border-slate-700'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>{isYouBus ? 'Current: Your Bus' : 'Set As My Bus'}</span>
                          </button>

                          <button
                            onClick={() => onSetFriendBus(service, currentStop)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isFriendBus
                                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                                : 'bg-slate-800 hover:bg-amber-600/30 text-amber-300 border border-slate-700'
                            }`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>{isFriendBus ? "Current: Chloe's Bus" : "Set As Chloe's Bus"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* LTA Crowd Legend Card */}
      <footer className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-300">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>LTA Singapore Bus Crowd Legend:</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SEA (Seats Available)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>SDA (Standing Available)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>LSD (Limited Standing)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
