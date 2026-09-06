'use client';

// Source: Google Maps Platform Code Assist
import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Search,
  Sparkles,
  Send,
  ExternalLink,
  Plus,
  Star,
  Clock,
  Car,
  Footprints,
  Bike,
  Train,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Copy,
  Info,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PlaceResult, RouteResult } from '@/lib/maps-service';

interface MapsExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoJournal?: (textToInsert: string) => void;
  userCity?: string;
}

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  places?: PlaceResult[];
  route?: RouteResult | null;
  timestamp: number;
}

const PRESET_QUERIES = [
  'Quiet coffee shops & bookstores near Central Park NYC',
  'Scenic walking route from Golden Gate Park to Ocean Beach SF',
  'Serene Japanese gardens and tea houses in Kyoto',
  'Walking directions from London Bridge to Borough Market',
];

const INITIAL_WELCOME_MESSAGE: AgentMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I am your **Google Maps & Journey Intelligence Agent**.\n\nI can connect you to real-time Google Maps data to find inspiring & mindful places, calculate walking or driving routes, and provide step-by-step directions for your reflections or travels.\n\nTry asking me for quiet study cafes, scenic nature trails, or exact directions between any two points!`,
  timestamp: 1700000000000,
};

let globalAgentMsgCounter = 0;
function createMessageId(prefix: string): string {
  globalAgentMsgCounter += 1;
  return `${prefix}_${globalAgentMsgCounter}`;
}

export function MapsExplorerModal({
  isOpen,
  onClose,
  onInsertIntoJournal,
  userCity,
}: MapsExplorerModalProps) {
  const [activeTab, setActiveTab] = useState<'agent' | 'places' | 'routes'>('agent');

  // Agent Chat States
  const [chatInput, setChatInput] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([INITIAL_WELCOME_MESSAGE]);

  // Direct Places Search States
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placesLoading, setPlacesLoading] = useState(false);
  const [foundPlaces, setFoundPlaces] = useState<PlaceResult[]>([]);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // Direct Routes Search States
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [travelMode, setTravelMode] = useState<'DRIVE' | 'WALK' | 'BICYCLE' | 'TRANSIT'>('WALK');
  const [routesLoading, setRoutesLoading] = useState(false);
  const [computedRoute, setComputedRoute] = useState<RouteResult | null>(null);
  const [routesError, setRoutesError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === 'agent') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAgentThinking, activeTab]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle sending agent message
  const handleSendAgentMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput.trim();
    if (!textToSend || isAgentThinking) return;

    const userMsg: AgentMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: textToSend,
      timestamp: 0,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsAgentThinking(true);

    try {
      const response = await fetch('/api/gemini/maps-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.filter((m) => m.id !== 'welcome').slice(-6),
          userLocation: userCity ? { city: userCity } : undefined,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: AgentMessage = {
        id: createMessageId('assistant'),
        role: 'assistant',
        content: data.text,
        places: data.places || [],
        route: data.route || null,
        timestamp: 0,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Agent chat error:', err);
      const errorMsg: AgentMessage = {
        id: createMessageId('error'),
        role: 'assistant',
        content: `⚠️ **Unable to fetch maps data**: ${err?.message || 'Please check your connection and Google Maps configuration.'}`,
        timestamp: 0,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  // Direct Places Search Trigger
  const handleSearchPlaces = async () => {
    if (!placeSearchQuery.trim() || placesLoading) return;
    setPlacesLoading(true);
    setPlacesError(null);

    try {
      const res = await fetch('/api/maps/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: placeSearchQuery.trim(),
          maxResultCount: 8,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to search places');
      }

      setFoundPlaces(data.places || []);
      if ((data.places || []).length === 0) {
        setPlacesError(`No places found matching "${placeSearchQuery}". Try broadening your query.`);
      }
    } catch (err: any) {
      setPlacesError(err?.message || 'Error searching places.');
    } finally {
      setPlacesLoading(false);
    }
  };

  // Direct Routes Search Trigger
  const handleComputeRoute = async () => {
    if (!originInput.trim() || !destinationInput.trim() || routesLoading) return;
    setRoutesLoading(true);
    setRoutesError(null);

    try {
      const res = await fetch('/api/maps/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: originInput.trim(),
          destination: destinationInput.trim(),
          travelMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compute route');
      }

      setComputedRoute(data.route || null);
    } catch (err: any) {
      setRoutesError(err?.message || 'Error computing route.');
    } finally {
      setRoutesLoading(false);
    }
  };

  // Insert Place / Route into Journal
  const handleInsert = (contentToInsert: string, id: string) => {
    if (onInsertIntoJournal) {
      onInsertIntoJournal(contentToInsert);
      setInsertedId(id);
      setTimeout(() => setInsertedId(null), 2500);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-sans animate-fade-in selection:bg-[#3b82f6]/30 selection:text-white"
      data-lenis-prevent="true"
    >
      <div 
        className="bg-[#0f0f0f] w-full max-w-4xl h-[92vh] max-h-[820px] rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden text-[#f4f4f4]"
        data-lenis-prevent="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#141414] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 text-[#3b82f6] flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-medium text-lg text-white">
                  Google Maps & Journey Agent
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#60a5fa] font-mono font-semibold uppercase tracking-wider">
                  Real-Time Maps
                </span>
              </div>
              <p className="text-xs text-[#7d7d7d] font-mono">
                Places API (New) • Routes API • Conversational Grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              data-cursor="CLOSE"
              aria-label="Close Maps Explorer"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[#7d7d7d] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-[#141414] border-b border-white/10 flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
          <button
            id="tab-maps-agent"
            onClick={() => setActiveTab('agent')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'agent'
                ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-xs'
                : 'bg-white/5 text-[#7d7d7d] hover:text-white border border-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>AI Maps Agent</span>
          </button>

          <button
            id="tab-maps-places"
            onClick={() => setActiveTab('places')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'places'
                ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-xs'
                : 'bg-white/5 text-[#7d7d7d] hover:text-white border border-white/5'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Places Finder</span>
          </button>

          <button
            id="tab-maps-routes"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-xs'
                : 'bg-white/5 text-[#7d7d7d] hover:text-white border border-white/5'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Routes & Directions</span>
          </button>
        </div>

        {/* TAB 1: AI MAPS AGENT CONVERSATION */}
        {activeTab === 'agent' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
            {/* Presets Bar */}
            <div className="px-6 py-2.5 bg-[#111111] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
              <span className="text-[#7d7d7d] font-bold text-[10px] uppercase tracking-wider shrink-0 mr-1">
                Suggestions:
              </span>
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAgentMessage(preset)}
                  disabled={isAgentThinking}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#dcdcdc] hover:bg-white/15 hover:text-white transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-5 shadow-md ${
                        isUser
                          ? 'bg-[#1c1c1c] border border-white/15 text-white rounded-br-xs'
                          : 'bg-[#141414] border border-white/10 text-[#f4f4f4] rounded-bl-xs'
                      }`}
                    >
                      <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {/* Display Place Cards if provided by tool */}
                      {msg.places && msg.places.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#10b981] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Grounded Places ({msg.places.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {msg.places.map((place) => (
                              <div
                                key={place.id}
                                className="p-3.5 bg-[#1a1a1a] rounded-xl border border-white/10 text-xs space-y-2 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-1">
                                    <h5 className="font-heading font-semibold text-white text-xs leading-snug">{place.name}</h5>
                                    {place.rating && (
                                      <span className="flex items-center gap-0.5 text-amber-400 font-bold text-[10px] shrink-0 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        {place.rating}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#999] line-clamp-2 mt-1">
                                    {place.address}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                  <a
                                    href={place.googleMapsUri}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-mono text-[#60a5fa] hover:underline flex items-center gap-0.5"
                                  >
                                    View in Maps
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                  {onInsertIntoJournal && (
                                    <button
                                      onClick={() =>
                                        handleInsert(
                                          `📍 **${place.name}**\n${place.address}\nRating: ⭐ ${place.rating || 'N/A'}\n[Google Maps Link](${place.googleMapsUri})`,
                                          place.id
                                        )
                                      }
                                      className="text-[10px] font-mono uppercase tracking-wider text-white hover:text-[#D4AF37] flex items-center gap-0.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 cursor-pointer transition-colors"
                                    >
                                      {insertedId === place.id ? (
                                        <>
                                          <Check className="w-2.5 h-2.5 text-[#10b981]" />
                                          <span className="text-[#10b981]">Added</span>
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-2.5 h-2.5" />
                                          <span>Add to Entry</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display Route Card if provided by tool */}
                      {msg.route && (
                        <div className="mt-4 pt-3 border-t border-white/10 p-3.5 bg-[#1a1a1a] rounded-xl border border-white/10 text-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#3b82f6] flex items-center gap-1">
                              <Navigation className="w-3.5 h-3.5" />
                              Route Calculated
                            </span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="bg-[#3b82f6] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {msg.route.distanceMiles}
                              </span>
                              <span className="bg-white/10 border border-white/10 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                ~{msg.route.durationMinutes}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-white/90 font-medium">{msg.route.summary}</p>

                          {msg.route.steps.length > 0 && (
                            <div className="space-y-1 pt-1 max-h-36 overflow-y-auto text-[11px] text-[#999] divide-y divide-white/5">
                              {msg.route.steps.slice(0, 5).map((step, idx) => (
                                <div key={idx} className="py-1 flex items-start justify-between gap-2">
                                  <span>{step.instruction}</span>
                                  <span className="font-mono text-[10px] text-[#7d7d7d] shrink-0">{step.distance}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Actions */}
                    {!isUser && (
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#7d7d7d] px-2">
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-[#10b981]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        {onInsertIntoJournal && (
                          <button
                            onClick={() => handleInsert(msg.content, `msg-${msg.id}`)}
                            className="hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
                          >
                            {insertedId === `msg-${msg.id}` ? (
                              <Check className="w-3 h-3 text-[#10b981]" />
                            ) : (
                              <Plus className="w-3 h-3" />
                            )}
                            <span>Insert full response</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isAgentThinking && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#141414] border border-white/10 max-w-md animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6] animate-ping" />
                  <span className="text-xs text-white/80 font-mono">
                    Querying Google Maps Places & Routes Grounding tools...
                  </span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Box */}
            <div className="p-4 bg-[#141414] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAgentMessage();
                }}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-[#3b82f6] transition-colors"
              >
                <Compass className="w-4 h-4 text-[#7d7d7d]" />
                <input
                  type="text"
                  placeholder="Ask about places, routes, scenic walks, cafes, or directions..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isAgentThinking}
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none py-2 font-sans"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAgentThinking}
                  className="p-2 rounded-lg bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT PLACES FINDER */}
        {activeTab === 'places' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-heading font-medium text-base text-white">
                Search Places &amp; Mindfulness Spots
              </h4>
              <p className="text-xs font-mono text-[#7d7d7d]">
                Powered by Google Maps Places API (New) Text Search with live ratings &amp; metadata.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7d7d7d] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Zen gardens in Kyoto, quiet libraries in Austin, organic tea houses..."
                  value={placeSearchQuery}
                  onChange={(e) => setPlaceSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPlaces()}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#161616] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#3b82f6] shadow-xs"
                />
              </div>
              <button
                onClick={handleSearchPlaces}
                disabled={!placeSearchQuery.trim() || placesLoading}
                className="px-5 py-2.5 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {placesLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
            </div>

            {/* Quick Category Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono pb-1">
              {['Quiet Cafes', 'Public Gardens & Parks', 'Bookstores & Libraries', 'Meditation Centers', 'Scenic Viewpoints'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setPlaceSearchQuery(cat + (userCity ? ` in ${userCity}` : ''));
                  }}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#dcdcdc] hover:bg-white/15 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {placesError && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>{placesError}</p>
                </div>
              )}

              {foundPlaces.length === 0 && !placesLoading && !placesError && (
                <div className="py-16 text-center text-[#7d7d7d] space-y-2">
                  <MapPin className="w-8 h-8 mx-auto text-white/20 stroke-[1.5]" />
                  <p className="font-heading italic text-sm text-white/70">Search for places worldwide</p>
                  <p className="text-xs font-mono">Find locations and embed them directly into your journal reflections.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {foundPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="p-4 rounded-xl bg-[#141414] border border-white/10 shadow-xs flex flex-col justify-between space-y-3 hover:border-white/25 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-heading font-semibold text-sm text-white leading-tight">{place.name}</h5>
                        {place.rating && (
                          <span className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0 border border-amber-400/25">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {place.rating} ({place.userRatingCount})
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#999] leading-relaxed">{place.address}</p>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#7d7d7d] pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80">{place.type}</span>
                        {place.isOpenNow !== null && (
                          <span
                            className={`font-semibold ${place.isOpenNow ? 'text-[#10b981]' : 'text-white/40'}`}
                          >
                            {place.isOpenNow ? '● Open now' : '○ Closed'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <a
                        href={place.googleMapsUri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
                      >
                        Google Maps
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {onInsertIntoJournal && (
                        <button
                          onClick={() =>
                            handleInsert(
                              `📍 **${place.name}**\n${place.address}\nRating: ⭐ ${place.rating || 'N/A'} (${place.userRatingCount} reviews)\nType: ${place.type}\n[Open on Google Maps](${place.googleMapsUri})`,
                              place.id
                            )
                          }
                          className="px-3 py-1 rounded-full bg-white/10 hover:bg-[#3b82f6] hover:text-white text-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {insertedId === place.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#10b981]" />
                              <span className="text-[#10b981]">Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Add to Journal</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIRECT ROUTES & DIRECTIONS */}
        {activeTab === 'routes' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-heading font-medium text-base text-white">
                Compute Real-Time Routes &amp; Directions
              </h4>
              <p className="text-xs font-mono text-[#7d7d7d]">
                Powered by Google Maps Routes API with real-time traffic, distances, durations, and steps.
              </p>
            </div>

            {/* Route Inputs */}
            <div className="p-4 bg-[#141414] rounded-xl border border-white/10 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7d7d7d] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#10b981]" /> Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Times Square, NYC or Union Square SF"
                    value={originInput}
                    onChange={(e) => setOriginInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7d7d7d] flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#3b82f6]" /> Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Park Conservatory or Brooklyn Bridge"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              {/* Mode & Action */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-lg border border-white/10 text-xs font-mono">
                  <button
                    onClick={() => setTravelMode('WALK')}
                    className={`px-3 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                      travelMode === 'WALK' ? 'bg-[#3b82f6] text-white font-semibold shadow-xs' : 'text-[#7d7d7d] hover:text-white'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Walk</span>
                  </button>

                  <button
                    onClick={() => setTravelMode('DRIVE')}
                    className={`px-3 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                      travelMode === 'DRIVE' ? 'bg-[#3b82f6] text-white font-semibold shadow-xs' : 'text-[#7d7d7d] hover:text-white'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Drive</span>
                  </button>

                  <button
                    onClick={() => setTravelMode('BICYCLE')}
                    className={`px-3 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                      travelMode === 'BICYCLE' ? 'bg-[#3b82f6] text-white font-semibold shadow-xs' : 'text-[#7d7d7d] hover:text-white'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Bike</span>
                  </button>

                  <button
                    onClick={() => setTravelMode('TRANSIT')}
                    className={`px-3 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                      travelMode === 'TRANSIT' ? 'bg-[#3b82f6] text-white font-semibold shadow-xs' : 'text-[#7d7d7d] hover:text-white'
                    }`}
                  >
                    <Train className="w-3.5 h-3.5" />
                    <span>Transit</span>
                  </button>
                </div>

                <button
                  onClick={handleComputeRoute}
                  disabled={!originInput.trim() || !destinationInput.trim() || routesLoading}
                  className="px-5 py-2 rounded-lg bg-[#3b82f6] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#2563eb] disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {routesLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                  <span>Calculate Route</span>
                </button>
              </div>
            </div>

            {/* Computed Route Display */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {routesError && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>{routesError}</p>
                </div>
              )}

              {computedRoute && (
                <div className="p-5 bg-[#141414] rounded-2xl border border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#7d7d7d]">
                        Route Summary
                      </span>
                      <h4 className="font-heading font-semibold text-base text-white">
                        {originInput} → {destinationInput}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <div className="px-3 py-1 rounded-full bg-[#3b82f6] text-white text-xs font-bold">
                        {computedRoute.distanceMiles} ({computedRoute.distanceKm})
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold">
                        ~{computedRoute.durationMinutes}
                      </div>
                    </div>
                  </div>

                  {/* Steps Breakdown */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#7d7d7d]">
                      Turn-by-Turn Directions ({computedRoute.steps.length} steps)
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-white/5">
                      {computedRoute.steps.map((step, idx) => (
                        <div key={idx} className="pt-1.5 flex items-start justify-between gap-3 text-xs">
                          <span className="text-white/90">
                            <strong className="text-[#3b82f6] mr-1">{idx + 1}.</strong>
                            {step.instruction}
                          </span>
                          <span className="text-[10px] font-mono text-[#7d7d7d] font-semibold shrink-0">
                            {step.distance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <a
                      href={computedRoute.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#60a5fa] hover:underline flex items-center gap-1"
                    >
                      Open in Google Maps
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {onInsertIntoJournal && (
                      <button
                        onClick={() =>
                          handleInsert(
                            `🗺️ **Directions: ${originInput} → ${destinationInput}**\nMode: ${travelMode}\nDistance: ${computedRoute.distanceMiles}\nEstimated Duration: ~${computedRoute.durationMinutes}\n[Navigate Live in Google Maps](${computedRoute.googleMapsUrl})`,
                            'custom-route'
                          )
                        }
                        className="px-4 py-1.5 rounded-full bg-[#3b82f6] text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-[#2563eb] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {insertedId === 'custom-route' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#10b981]" />
                            <span>Added to Entry</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Entry</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Attribution Banner Required by Terms */}
        <div className="px-6 py-2.5 bg-[#141414] border-t border-white/10 flex items-center justify-between text-[11px] text-[#7d7d7d] font-mono">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#7d7d7d]" />
            <span>
              Real-time geospatial data powered by{' '}
              <a
                href="https://cloud.google.com/maps-platform/terms?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-white/90 hover:underline"
              >
                Google Maps Platform
              </a>
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-medium text-[#10b981]">
            Places (New) • Routes API
          </span>
        </div>
      </div>
    </div>
  );
}
