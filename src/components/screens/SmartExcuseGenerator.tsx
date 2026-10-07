import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Volume2,
  Send,
  HelpCircle,
  ExternalLink,
  Info,
  Cpu,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { CommuterTrip, MeetupHotspot } from '../../types';
import { SINGLISH_GLOSSARY } from '../../data/singaporeTransitData';

interface SmartExcuseGeneratorProps {
  hotspot: MeetupHotspot;
  youTrip: CommuterTrip;
  friendTrip: CommuterTrip;
}

export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'custom';

export const SmartExcuseGenerator: React.FC<SmartExcuseGeneratorProps> = ({
  hotspot,
  youTrip,
  friendTrip,
}) => {
  const [friendName, setFriendName] = useState(friendTrip.personName.split(' ')[0] || 'Chloe');
  const [busNo, setBusNo] = useState(youTrip.busServiceNo || '65');
  const [destination, setDestination] = useState(hotspot.name.split(' ')[0] || 'Somerset 313');
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [singlishLevel, setSinglishLevel] = useState<1 | 2 | 3 | 4>(3);
  const [category, setCategory] = useState<
    'bus_drama' | 'weather' | 'hawker' | 'highway' | 'unhinged' | 'professional'
  >('bus_drama');
  const [customPrompt, setCustomPrompt] = useState('');

  // Multi-Provider & Model State
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [customBaseUrl, setCustomBaseUrl] = useState<string>('');
  const [overrideApiKey, setOverrideApiKey] = useState<string>('');
  const [showModelSettings, setShowModelSettings] = useState<boolean>(false);

  const [generatedExcuse, setGeneratedExcuse] = useState<string>(
    `Wah ${friendName} damn jialat, bus bunching then two double-deckers just zoom past my stop sia! Finally squeezed onto Bus ${busNo}, confirm late ${delayMinutes} mins. Chope seat first can?`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [sourceTag, setSourceTag] = useState<string>('gemini');
  const [activeModelName, setActiveModelName] = useState<string>('gemini-2.5-flash');

  const providerModels: Record<LLMProvider, { label: string; models: string[] }> = {
    gemini: {
      label: 'Google Gemini',
      models: ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'],
    },
    openai: {
      label: 'OpenAI',
      models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    },
    anthropic: {
      label: 'Anthropic Claude',
      models: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022'],
    },
    groq: {
      label: 'Groq (Ultra Fast)',
      models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    },
    openrouter: {
      label: 'OpenRouter (Universal)',
      models: ['meta-llama/llama-3.3-70b-instruct', 'mistralai/mistral-large-2407', 'openrouter/auto'],
    },
    custom: {
      label: 'Custom OpenAI-Compatible',
      models: ['custom-model'],
    },
  };

  const categories = [
    { id: 'bus_drama', label: '🚌 Bus Bunching', desc: 'Full buses zoomed past / slow driver' },
    { id: 'weather', label: '🌧️ Monsoon Storm', desc: 'Sudden rainstorm & flooded linkway' },
    { id: 'highway', label: '🚧 CTE / PIE Jam', desc: 'Expressway crawl / lorry breakdown' },
    { id: 'hawker', label: '☕ Kopitiam Drama', desc: 'Tissue chope stolen / slow kopi uncle' },
    { id: 'unhinged', label: '🦦 Wild SG Encounters', desc: 'Otters in bus lane / void deck rooster' },
    { id: 'professional', label: '💼 Deadpan Office', desc: 'Polite corporate transit delay' },
  ];

  const handleProviderChange = (newProvider: LLMProvider) => {
    setSelectedProvider(newProvider);
    setSelectedModel(providerModels[newProvider].models[0]);
  };

  const handleGenerate = async (forcedLevel?: number) => {
    setIsLoading(true);
    const levelToUse = forcedLevel !== undefined ? forcedLevel : singlishLevel;

    try {
      const response = await fetch('/api/generate-excuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendName,
          busNo,
          destination,
          delayMinutes,
          singlishLevel: levelToUse,
          category,
          customPrompt,
          provider: selectedProvider,
          model: selectedModel,
          apiKey: overrideApiKey,
          customBaseUrl,
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      if (data.excuse) {
        setGeneratedExcuse(data.excuse);
        setSourceTag(data.provider || selectedProvider);
        setActiveModelName(data.model || selectedModel);
      }
    } catch (err) {
      console.warn('Using client-side fallback generator:', err);
      generateClientFallback(levelToUse);
    } finally {
      setIsLoading(false);
    }
  };

  const generateClientFallback = (level: number) => {
    const fallbacks: Record<string, string[]> = {
      bus_drama: [
        `Wah ${friendName} damn jialat, bus bunching then two double-deckers just zoom past my stop sia! Squeezing into Bus ${busNo} now, late ${delayMinutes} mins. Chope seat first can?`,
        `Aiyo bro wait for Bus ${busNo} until beard grow long! Squeezing on upper deck now, ETA around ${delayMinutes} mins late to ${destination}. Order drink first!`,
        `Aiyo ${friendName} steady wait ah! Bus ${busNo} driver driving like tractor 20km/h and red light after red light sial! Confirm ${delayMinutes} mins late, don't rage quit I buy you Teh-C ping later!!`,
        `Hi ${friendName}, apologies! Bus ${busNo} was bunched up and the previous two buses were completely full. Running about ${delayMinutes} mins behind schedule to ${destination}.`,
      ],
      weather: [
        `Wah bro the sky suddenly open up like waterfall sia! No umbrella so dashed under bus stop, bus ${busNo} delayed by ${delayMinutes} mins. Head to aircon first!`,
        `Aiyo ${friendName} sudden monsoon flood at bus stop sia, water reach ankle level! Bus ${busNo} crawling through the rain, give me ${delayMinutes} mins more, sorry bro!`,
      ],
      highway: [
        `Wah CTE jam until like carpark sia, Bus ${busNo} crawling at 10km/h. Confirm late ${delayMinutes} mins to ${destination}, chill somewhere first!`,
        `Wah lao eh, CTE lorry breakdown one lane blocked completely! Bus ${busNo} stuck motionless sial. Bro give me ${delayMinutes} mins, order your food first I sponsor side dish!`,
      ],
      hawker: [
        `Wah bro kopitiam uncle pour kopi extra artistic today, queue 15 mins for toast! Running ${delayMinutes} mins late to ${destination}, chope place first!`,
      ],
      unhinged: [
        `Bro you confirm laugh, family of wild otters crossing the bus lane so Bus ${busNo} had to halt! Running ${delayMinutes} mins late to ${destination}!`,
        `Aiyo bro wild rooster at void deck chase me until I miss the first bus ${busNo} sial! Squeezed into next bus already, late ${delayMinutes} mins, don't disown me!`,
      ],
      professional: [
        `Dear ${friendName}, unexpected transit congestion along the corridor has delayed my arrival by ${delayMinutes} minutes. Looking forward to catching up shortly.`,
      ],
    };

    const list = fallbacks[category] || fallbacks.bus_drama;
    const randomPick = list[Math.floor(Math.random() * list.length)];
    setGeneratedExcuse(randomPick);
    setSourceTag('Local Engine');
    setActiveModelName('Template');
  };

  const fullTrackingLink = `https://catchup.sg/track?bus=${busNo}&target=${encodeURIComponent(
    destination
  )}&eta=+${delayMinutes}m`;

  const handleCopy = (withLink = false) => {
    const textToCopy = withLink
      ? `${generatedExcuse}\n\n📍 Live Transit Tracking: ${fullTrackingLink}`
      : generatedExcuse;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `${generatedExcuse}\n\n📍 Live Transit Tracking: ${fullTrackingLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(generatedExcuse);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const sgVoice = voices.find((v) => v.lang.includes('SG') || v.lang.includes('en-GB') || v.name.includes('Singapore'));
      if (sgVoice) utterance.voice = sgVoice;

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* Screen Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Singapore Delay Excuse AI</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Smart Excuse & Delay Generator</h2>
          <p className="text-xs text-slate-400">
            Running late because bus bunched up or CTE crawled? Generate culturally authentic, hilarious, and believable Singlish excuses with any LLM model!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* LLM Model Config Button */}
          <button
            onClick={() => setShowModelSettings(!showModelSettings)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Configure LLM Provider & Model"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Model:</span>
            <span className="text-emerald-300 font-bold">{selectedModel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <button
            onClick={() => setShowGlossary(!showGlossary)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Slang Guide</span>
          </button>
        </div>
      </div>

      {/* Expandable Multi-Provider LLM Settings Drawer */}
      {showModelSettings && (
        <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Multi-Model LLM Configuration
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Keys are loaded from Vercel environment variables (or test with overrides below)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* 1. Choose Provider */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                LLM Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="gemini">Google Gemini (Default)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="groq">Groq (Ultra-Fast)</option>
                <option value="openrouter">OpenRouter (All Models)</option>
                <option value="custom">Custom Endpoint</option>
              </select>
            </div>

            {/* 2. Choose Model */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Selected Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {providerModels[selectedProvider].models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Optional Custom Base URL or Custom Model Name */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Custom Model / Base URL (Optional)
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="e.g. http://localhost:11434/v1"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 text-[11px] text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                Active Provider: <strong>{providerModels[selectedProvider].label}</strong> ({selectedModel})
              </span>
            </span>
            <button
              onClick={() => setShowModelSettings(false)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Singlish Glossary */}
      {showGlossary && (
        <div className="p-3.5 bg-slate-850 border border-amber-500/30 rounded-xl space-y-2 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Essential Singapore Transit Vocabulary</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {SINGLISH_GLOSSARY.map((item) => (
              <div key={item.term} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-white">{item.term}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Controls Left, Live WhatsApp Bubble Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Controls (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3.5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          {/* Commuter Variables Form */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Friend Name</label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Bus No.</label>
              <input
                type="text"
                value={busNo}
                onChange={(e) => setBusNo(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Meetup Spot</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Delay Time Selector Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-300">Estimated Delay Duration</label>
              <span className="text-xs font-mono font-bold text-amber-400">+{delayMinutes} mins</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[5, 10, 15, 25, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDelayMinutes(mins)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    delayMinutes === mins
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
                  }`}
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Singlish Intensity Slider (Level 1 to 4) */}
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Singlish Intensity Level:</span>
              </label>
              <span className="text-xs font-extrabold text-amber-400">
                {singlishLevel === 1 && '1: Formal Corporate'}
                {singlishLevel === 2 && '2: Casual SG Friend'}
                {singlishLevel === 3 && '3: High Singlish (Jialat / Sial)'}
                {singlishLevel === 4 && '4: Maximum Panic Mode (Hokkien)'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[
                { lvl: 1, label: '👔 Formal', tip: 'Office friendly' },
                { lvl: 2, label: '☕ Casual', tip: 'Chill friend' },
                { lvl: 3, label: '🇸🇬 Singlish', tip: 'Jialat / Lah' },
                { lvl: 4, label: '🌶️ Maximum', tip: 'Buy Teh-C ping' },
              ].map((item) => (
                <button
                  key={item.lvl}
                  onClick={() => {
                    setSinglishLevel(item.lvl as 1 | 2 | 3 | 4);
                    handleGenerate(item.lvl);
                  }}
                  className={`py-2 px-1 text-center rounded-lg transition-all cursor-pointer ${
                    singlishLevel === item.lvl
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[9px] opacity-80 mt-0.5 leading-none">{item.tip}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category / Scenario Buttons */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Delay Scenario / Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as any)}
                  className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-xs">{cat.label}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Prompt Context */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Optional Extra Details (e.g. "I'm with auntie carrying durians")
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Heavy rain at Little India, uncle driving slow..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action Generate Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating with {selectedModel}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Excuse ({selectedModel})</span>
                </>
              )}
            </button>

            <button
              onClick={() => generateClientFallback(singlishLevel)}
              title="Quick Shuffle / Preset Randomizer"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: WhatsApp Live Chat Simulation Card (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="space-y-3">
            {/* Header of WhatsApp Chat Screen */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={friendTrip.avatar}
                    alt={friendName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{friendName}</div>
                  <div className="text-[10px] text-emerald-400 leading-none">Online · Waiting at {destination}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                <span>WhatsApp Preview</span>
              </div>
            </div>

            {/* Chat Messages Canvas */}
            <div className="space-y-3 py-2">
              {/* Previous message from Friend */}
              <div className="flex items-start gap-2">
                <div className="max-w-[85%] bg-slate-800 text-slate-200 text-xs p-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-750">
                  <p>Bro where are you? I'm already reached {destination} leh!</p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1">19:35</span>
                </div>
              </div>

              {/* Your Generated Response Bubble */}
              <div className="flex flex-col items-end gap-1.5">
                <div className="max-w-[90%] bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 text-xs p-3.5 rounded-2xl rounded-tr-sm shadow-md space-y-2">
                  <p className="leading-relaxed font-medium">{generatedExcuse}</p>

                  {/* Attached Live CatchUp Transit Card */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <span>🚌 Live Bus {busNo} Tracking</span>
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 px-1 rounded">+{delayMinutes}m delay</span>
                    </div>
                    <div className="text-slate-300 text-[10px] truncate">
                      Approaching {hotspot.nearestBusStopName.split('/')[0]}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between pt-1">
                      <span>Live GPS Active</span>
                      <span className="text-emerald-300 underline flex items-center gap-0.5">
                        catchup.sg/live <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-400/80">
                    <span>19:42</span>
                    <span>✓✓</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>
                    Generated via <strong className="text-slate-300">{sourceTag} ({activeModelName})</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Copy, WhatsApp, TTS */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send directly on WhatsApp</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCopy(false)}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleSpeak}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400 animate-pulse' : ''}`} />
                <span>{isSpeaking ? 'Speaking...' : 'Read Aloud'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
