/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, ScreenTab } from './components/Navigation';
import { LiveBusEtaTracker } from './components/screens/LiveBusEtaTracker';
import { SmartExcuseGenerator } from './components/screens/SmartExcuseGenerator';
import { RescueSpotFinder } from './components/screens/RescueSpotFinder';
import { SharedLiveEtaStatus } from './components/screens/SharedLiveEtaStatus';
import {
  MEETUP_HOTSPOTS,
  INITIAL_COMMUTER_YOU,
  INITIAL_COMMUTER_FRIEND,
} from './data/singaporeTransitData';
import { MeetupHotspot, CommuterTrip, BusService, BusStop } from './types';
import { QrCode, Check, Copy, Share2, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentHotspot, setCurrentHotspot] = useState<MeetupHotspot>(MEETUP_HOTSPOTS[0]);
  const [activeScreen, setActiveScreen] = useState<ScreenTab>('tracker');
  const [youTrip, setYouTrip] = useState<CommuterTrip>(INITIAL_COMMUTER_YOU);
  const [friendTrip, setFriendTrip] = useState<CommuterTrip>(INITIAL_COMMUTER_FRIEND);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedGlobalLink, setCopiedGlobalLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const diffMinutes = Math.abs(friendTrip.etaMinutes - youTrip.etaMinutes);

  // Set selected bus as your active trip
  const handleSetYouBus = (service: BusService, stop: BusStop) => {
    setYouTrip((prev) => ({
      ...prev,
      busServiceNo: service.serviceNo,
      operator: service.operator,
      vehicleType: service.nextBus.type,
      etaMinutes: service.nextBus.etaMinutes || 2,
      targetStopName: stop.name,
      stopsRemaining: 3,
    }));
    showToast(`Updated! You are now tracking Bus ${service.serviceNo} (${service.operator})`);
  };

  // Set selected bus as friend's active trip
  const handleSetFriendBus = (service: BusService, stop: BusStop) => {
    setFriendTrip((prev) => ({
      ...prev,
      busServiceNo: service.serviceNo,
      operator: service.operator,
      vehicleType: service.nextBus.type,
      etaMinutes: service.nextBus.etaMinutes || 4,
      targetStopName: stop.name,
      stopsRemaining: 4,
    }));
    showToast(`Updated! Chloe's commute set to Bus ${service.serviceNo}`);
  };

  // Advance stop in simulation
  const handleAdvanceStop = () => {
    setYouTrip((prev) => {
      if (prev.stopsRemaining <= 0) return prev;

      const newStopsRemaining = prev.stopsRemaining - 1;
      const currentIdx = prev.routeStops.findIndex((s) => s.isCurrent);
      const nextIdx = currentIdx !== -1 && currentIdx < prev.routeStops.length - 1 ? currentIdx + 1 : currentIdx;

      const updatedStops = prev.routeStops.map((stop, i) => {
        if (i < nextIdx) {
          return { ...stop, passed: true, isCurrent: false, etaMinutes: 0 };
        } else if (i === nextIdx) {
          return { ...stop, passed: true, isCurrent: true, etaMinutes: 0 };
        } else {
          return { ...stop, passed: false, isCurrent: false, etaMinutes: Math.max(1, (i - nextIdx) * 2) };
        }
      });

      const nextStopName = updatedStops[nextIdx]?.name || prev.targetStopName;
      const nextEta = newStopsRemaining * 2;

      if (newStopsRemaining === 0) {
        showToast('🎉 Ding-dong! Bus 65 has arrived at Somerset Stn! Ready to meetup.');
      }

      return {
        ...prev,
        stopsRemaining: newStopsRemaining,
        etaMinutes: nextEta,
        currentStopName: nextStopName,
        routeStops: updatedStops,
        speedKmH: newStopsRemaining === 0 ? 0 : 34 + Math.floor(Math.random() * 8),
      };
    });
  };

  // Reset simulation to initial
  const handleResetTrip = () => {
    setYouTrip(INITIAL_COMMUTER_YOU);
    showToast('Transit simulation reset to starting route.');
  };

  // Trigger sudden +5m delay
  const handleTriggerDelay = () => {
    setYouTrip((prev) => ({
      ...prev,
      etaMinutes: prev.etaMinutes + 5,
      speedKmH: 14,
      status: 'delayed',
    }));
    showToast('⚠️ Sudden CTE congestion detected! +5 mins added to ETA.');
  };

  const globalShareUrl = `https://catchup.sg/meetup?hotspot=${currentHotspot.id}&you=65&friend=175`;

  const handleCopyGlobalShare = () => {
    navigator.clipboard.writeText(globalShareUrl);
    setCopiedGlobalLink(true);
    setTimeout(() => setCopiedGlobalLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentHotspot={currentHotspot}
        onSelectHotspot={setCurrentHotspot}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        activeScreen={activeScreen}
      />

      {/* Screen Navigation Tabs */}
      <Navigation
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        diffMinutes={diffMinutes}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-3 pb-8">
        {activeScreen === 'tracker' && (
          <LiveBusEtaTracker
            hotspot={currentHotspot}
            youTrip={youTrip}
            friendTrip={friendTrip}
            onSetYouBus={handleSetYouBus}
            onSetFriendBus={handleSetFriendBus}
            onNavigateToExcuse={() => setActiveScreen('excuse')}
            onNavigateToRescue={() => setActiveScreen('rescue')}
          />
        )}

        {activeScreen === 'excuse' && (
          <SmartExcuseGenerator
            hotspot={currentHotspot}
            youTrip={youTrip}
            friendTrip={friendTrip}
          />
        )}

        {activeScreen === 'rescue' && (
          <RescueSpotFinder
            hotspot={currentHotspot}
            youTrip={youTrip}
            friendTrip={friendTrip}
          />
        )}

        {activeScreen === 'live_share' && (
          <SharedLiveEtaStatus
            hotspot={currentHotspot}
            youTrip={youTrip}
            friendTrip={friendTrip}
            onAdvanceStop={handleAdvanceStop}
            onResetTrip={handleResetTrip}
            onTriggerDelay={handleTriggerDelay}
          />
        )}
      </main>

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-18 sm:bottom-6 right-4 z-50 max-w-sm p-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl shadow-emerald-950/60 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="font-medium leading-tight">{toastMessage}</span>
        </div>
      )}

      {/* Global Meetup Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Sync Meetup Link
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Invite Friend to CatchUp SG</h3>
                <p className="text-xs text-slate-400">
                  Target: {currentHotspot.name} · Dual live GPS & countdown tracker
                </p>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* QR Mockup */}
            <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-2xl border-4 border-emerald-500/80 flex flex-col items-center justify-center shadow-lg">
              <QrCode className="w-28 h-28 text-slate-900" />
              <span className="text-[9px] font-mono font-bold text-slate-600 mt-1">CATCHUP.SG SYNC</span>
            </div>

            {/* Copyable link */}
            <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-700 text-xs flex items-center justify-between gap-2">
              <span className="truncate text-slate-300 font-mono text-[11px]">{globalShareUrl}</span>
              <button
                onClick={handleCopyGlobalShare}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedGlobalLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGlobalLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  const text = encodeURIComponent(
                    `Hey! Track our live bus meetup ETA at ${currentHotspot.name} on CatchUp SG: ${globalShareUrl}`
                  );
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
