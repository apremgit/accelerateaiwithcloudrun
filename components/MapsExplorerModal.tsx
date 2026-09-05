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
  Share2,
  Copy,
  ChevronRight,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2C3539]/30 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-[#F9F8F6] w-full max-w-4xl h-[92vh] max-h-[820px] rounded-2xl border border-[#D1D8DB] shadow-2xl flex flex-col overflow-hidden text-[#2C3539]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F9F8F6] border-b border-[#D1D8DB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#6B8E9B] text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-normal text-lg text-[#2C3539]">
                  Google Maps & Journey Agent
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#D1D8DB] text-[#6B8E9B] font-sans font-medium uppercase tracking-[0.05em]">
                  Real-Time Maps
                </span>
              </div>
              <p className="text-xs text-[#6B8E9B] font-sans font-light">
                Places API (New) • Routes API • Conversational Grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded bg-[#FFFFFF] border border-[#D1D8DB] text-[#6B8E9B] hover:text-[#2C3539] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-2.5 bg-[#FFFFFF] border-b border-[#D1D8DB] flex items-center gap-2 text-xs font-sans uppercase tracking-[0.05em]">
          <button
            id="tab-maps-agent"
            onClick={() => setActiveTab('agent')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'agent'
                ? 'bg-[#6B8E9B] text-white font-medium shadow-xs'
                : 'bg-[#F9F8F6] text-[#6B8E9B] hover:text-[#2C3539] border border-[#D1D8DB]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Maps Agent</span>
          </button>

          <button
            id="tab-maps-places"
            onClick={() => setActiveTab('places')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'places'
                ? 'bg-[#6B8E9B] text-white font-medium shadow-xs'
                : 'bg-[#F9F8F6] text-[#6B8E9B] hover:text-[#2C3539] border border-[#D1D8DB]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Places Finder</span>
          </button>

          <button
            id="tab-maps-routes"
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded transition-all cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-[#6B8E9B] text-white font-medium shadow-xs'
                : 'bg-[#F9F8F6] text-[#6B8E9B] hover:text-[#2C3539] border border-[#D1D8DB]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Routes & Directions</span>
          </button>
        </div>

        {/* TAB 1: AI MAPS AGENT CONVERSATION */}
        {activeTab === 'agent' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfaf7]">
            {/* Presets Bar */}
            <div className="px-6 py-2 bg-[#fcfaf7]/80 border-b border-[#f5f2ed] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-[#8c887d] font-bold text-[10px] uppercase tracking-wider shrink-0 mr-1">
                Suggestions:
              </span>
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAgentMessage(preset)}
                  disabled={isAgentThinking}
                  className="px-3 py-1 rounded-full bg-white border border-[#e5e1da] text-[#5A5A40] hover:bg-[#f5f2ed] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
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
                      className={`max-w-[88%] rounded-3xl p-5 shadow-xs ${
                        isUser
                          ? 'bg-[#5A5A40] text-white rounded-br-xs'
                          : 'bg-white border border-[#e5e1da] text-[#3a3a35] rounded-bl-xs'
                      }`}
                    >
                      <div className="text-sm leading-relaxed prose prose-stone max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {/* Display Place Cards if provided by tool */}
                      {msg.places && msg.places.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#f0ede8] space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Grounded Places ({msg.places.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.places.map((place) => (
                              <div
                                key={place.id}
                                className="p-3 bg-[#fcfaf7] rounded-xl border border-[#e5e1da] text-xs space-y-1.5 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-1">
                                    <h5 className="font-bold text-[#3a3a35] text-xs">{place.name}</h5>
                                    {place.rating && (
                                      <span className="flex items-center gap-0.5 text-amber-700 font-bold text-[10px] shrink-0 bg-amber-50 px-1.5 py-0.5 rounded">
                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                        {place.rating}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#8c887d] line-clamp-2 mt-0.5">
                                    {place.address}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-[#e5e1da]/60">
                                  <a
                                    href={place.googleMapsUri}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-bold text-[#5A5A40] hover:underline flex items-center gap-0.5"
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
                                      className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] hover:text-[#3a3a35] flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-full border border-[#e5e1da] cursor-pointer"
                                    >
                                      {insertedId === place.id ? (
                                        <>
                                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                                          <span className="text-emerald-600">Added</span>
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
                        <div className="mt-4 pt-3 border-t border-[#f0ede8] p-3 bg-[#fcfaf7] rounded-2xl border border-[#e5e1da] text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-1">
                              <Navigation className="w-3.5 h-3.5" />
                              Route Calculated
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="bg-[#5A5A40] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                {msg.route.distanceMiles}
                              </span>
                              <span className="bg-[#f5f2ed] border border-[#e5e1da] text-[#3a3a35] px-2 py-0.5 rounded-full text-[10px] font-bold">
                                ~{msg.route.durationMinutes}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[#5A5A40] font-medium">{msg.route.summary}</p>

                          {msg.route.steps.length > 0 && (
                            <div className="space-y-1 pt-1 max-h-36 overflow-y-auto text-[11px] text-[#8c887d] divide-y divide-[#e5e1da]/50">
                              {msg.route.steps.slice(0, 5).map((step, idx) => (
                                <div key={idx} className="py-1 flex items-start justify-between gap-2">
                                  <span>
                                    {idx + 1}. {step.instruction}
                                  </span>
                                  <span className="text-[9px] font-semibold shrink-0">
                                    {step.distance}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-[#e5e1da]">
                            <a
                              href={msg.route.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-[#5A5A40] hover:underline flex items-center gap-0.5"
                            >
                              Open in Google Maps
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>

                            {onInsertIntoJournal && (
                              <button
                                onClick={() =>
                                  handleInsert(
                                    `🗺️ **Route Plan** (${msg.route?.distanceMiles}, ~${msg.route?.durationMinutes})\n${msg.route?.summary}\n[Navigate on Google Maps](${msg.route?.googleMapsUrl})`,
                                    'route-plan'
                                  )
                                }
                                className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] hover:text-[#3a3a35] flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-full border border-[#e5e1da] cursor-pointer"
                              >
                                {insertedId === 'route-plan' ? (
                                  <>
                                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                                    <span className="text-emerald-600">Added</span>
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
                      )}
                    </div>

                    {!isUser && (
                      <div className="flex items-center gap-2 text-[10px] text-[#8c887d] px-2">
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="hover:text-[#3a3a35] flex items-center gap-0.5 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        {onInsertIntoJournal && (
                          <button
                            onClick={() => handleInsert(msg.content, `msg-${msg.id}`)}
                            className="hover:text-[#3a3a35] flex items-center gap-0.5 cursor-pointer"
                          >
                            {insertedId === `msg-${msg.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
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
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#e5e1da] max-w-md animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-[#5A5A40] animate-ping" />
                  <span className="text-xs text-[#5A5A40] font-medium font-serif italic">
                    Querying Google Maps Places & Routes Grounding tools...
                  </span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Box */}
            <div className="p-4 bg-white border-t border-[#e5e1da]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAgentMessage();
                }}
                className="flex items-center gap-2 bg-[#fcfaf7] border border-[#e5e1da] rounded-2xl px-3 py-1.5 focus-within:border-[#5A5A40] focus-within:ring-1 focus-within:ring-[#5A5A40]"
              >
                <Compass className="w-4 h-4 text-[#8c887d]" />
                <input
                  type="text"
                  placeholder="Ask about places, routes, scenic walks, cafes, or directions..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isAgentThinking}
                  className="flex-1 bg-transparent text-xs text-[#3a3a35] placeholder-[#a19d93] focus:outline-none py-2"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAgentThinking}
                  className="p-2 rounded-xl bg-[#5A5A40] text-white hover:bg-[#4a4a35] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT PLACES FINDER */}
        {activeTab === 'places' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfaf7] p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif italic font-bold text-base text-[#3a3a35]">
                Search Places & Mindfulness Spots
              </h4>
              <p className="text-xs text-[#8c887d]">
                Powered by Google Maps Places API (New) Text Search with live ratings & metadata.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8c887d] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Zen gardens in Kyoto, quiet libraries in Austin, organic tea houses..."
                  value={placeSearchQuery}
                  onChange={(e) => setPlaceSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPlaces()}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[#e5e1da] rounded-2xl text-[#3a3a35] placeholder-[#a19d93] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] shadow-xs"
                />
              </div>
              <button
                onClick={handleSearchPlaces}
                disabled={!placeSearchQuery.trim() || placesLoading}
                className="px-5 py-2.5 rounded-2xl bg-[#5A5A40] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#4a4a35] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {placesLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
            </div>

            {/* Quick Category Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
              {['Quiet Cafes', 'Public Gardens & Parks', 'Bookstores & Libraries', 'Meditation Centers', 'Scenic Viewpoints'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setPlaceSearchQuery(cat + (userCity ? ` in ${userCity}` : ''));
                  }}
                  className="px-3 py-1 rounded-full bg-white border border-[#e5e1da] text-[#5A5A40] hover:bg-[#f5f2ed] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {placesError && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p>{placesError}</p>
                </div>
              )}

              {foundPlaces.length === 0 && !placesLoading && !placesError && (
                <div className="py-16 text-center text-[#8c887d] space-y-2">
                  <MapPin className="w-8 h-8 mx-auto text-[#a19d93] stroke-[1.5]" />
                  <p className="font-serif italic text-sm text-[#3a3a35]">Search for places worldwide</p>
                  <p className="text-xs">Find locations and embed them directly into your journal entries.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {foundPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="p-4 rounded-2xl bg-white border border-[#e5e1da] shadow-xs flex flex-col justify-between space-y-3 hover:border-[#5A5A40]/40 transition-all"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-sm text-[#3a3a35] leading-tight">{place.name}</h5>
                        {place.rating && (
                          <span className="flex items-center gap-1 text-amber-700 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full shrink-0 border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {place.rating} ({place.userRatingCount})
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#8c887d] leading-relaxed">{place.address}</p>

                      <div className="flex items-center gap-2 text-[10px] text-[#5A5A40] pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#f5f2ed] font-semibold">{place.type}</span>
                        {place.isOpenNow !== null && (
                          <span
                            className={`font-semibold ${place.isOpenNow ? 'text-emerald-700' : 'text-stone-500'}`}
                          >
                            {place.isOpenNow ? '● Open now' : '○ Closed'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f5f2ed]">
                      <a
                        href={place.googleMapsUri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#5A5A40] hover:underline flex items-center gap-1"
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
                          className="px-3 py-1 rounded-full bg-[#f5f2ed] hover:bg-[#5A5A40] hover:text-white text-[#5A5A40] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {insertedId === place.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Added</span>
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
          <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfaf7] p-6 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif italic font-bold text-base text-[#3a3a35]">
                Compute Real-Time Routes & Directions
              </h4>
              <p className="text-xs text-[#8c887d]">
                Powered by Google Maps Routes API with real-time traffic, distances, durations, and steps.
              </p>
            </div>

            {/* Route Inputs */}
            <div className="p-4 bg-white rounded-2xl border border-[#e5e1da] shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8c887d] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#5A5A40]" /> Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Times Square, NYC or Union Square SF"
                    value={originInput}
                    onChange={(e) => setOriginInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#fcfaf7] border border-[#e5e1da] rounded-xl text-[#3a3a35] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8c887d] flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#5A5A40]" /> Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Park Conservatory or Brooklyn Bridge"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#fcfaf7] border border-[#e5e1da] rounded-xl text-[#3a3a35] focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Mode & Action */}
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-[#f5f2ed] p-1 rounded-xl border border-[#e5e1da] text-xs font-bold">
                  <button
                    onClick={() => setTravelMode('WALK')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      travelMode === 'WALK' ? 'bg-[#5A5A40] text-white shadow-2xs' : 'text-[#8c887d] hover:text-[#3a3a35]'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Walk</span>
                  </button>

                  <button
                    onClick={() => setTravelMode('DRIVE')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      travelMode === 'DRIVE' ? 'bg-[#5A5A40] text-white shadow-2xs' : 'text-[#8c887d] hover:text-[#3a3a35]'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Drive</span>
                  </button>

                  <button
                    onClick={() => setTravelMode('BICYCLE')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      travelMode === 'BICYCLE' ? 'bg-[#5A5A40] text-white shadow-2xs' : 'text-[#8c887d] hover:text-[#3a3a35]'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Bike</span>
                  </button>

                  <button
                    onClick={() => setTravelMode('TRANSIT')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      travelMode === 'TRANSIT' ? 'bg-[#5A5A40] text-white shadow-2xs' : 'text-[#8c887d] hover:text-[#3a3a35]'
                    }`}
                  >
                    <Train className="w-3.5 h-3.5" />
                    <span>Transit</span>
                  </button>
                </div>

                <button
                  onClick={handleComputeRoute}
                  disabled={!originInput.trim() || !destinationInput.trim() || routesLoading}
                  className="px-5 py-2 rounded-xl bg-[#5A5A40] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#4a4a35] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  {routesLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                  <span>Calculate Route</span>
                </button>
              </div>
            </div>

            {/* Computed Route Display */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {routesError && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p>{routesError}</p>
                </div>
              )}

              {computedRoute && (
                <div className="p-5 bg-white rounded-3xl border border-[#e5e1da] shadow-xs space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#f5f2ed]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#8c887d]">
                        Route Summary
                      </span>
                      <h4 className="font-serif italic font-bold text-base text-[#3a3a35]">
                        {originInput} → {destinationInput}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-[#5A5A40] text-white text-xs font-bold shadow-2xs">
                        {computedRoute.distanceMiles} ({computedRoute.distanceKm})
                      </div>
                      <div className="px-3 py-1 rounded-full bg-[#f5f2ed] border border-[#e5e1da] text-[#3a3a35] text-xs font-bold">
                        ~{computedRoute.durationMinutes}
                      </div>
                    </div>
                  </div>

                  {/* Steps Breakdown */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#8c887d]">
                      Turn-by-Turn Directions ({computedRoute.steps.length} steps)
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-[#f5f2ed]">
                      {computedRoute.steps.map((step, idx) => (
                        <div key={idx} className="pt-1.5 flex items-start justify-between gap-3 text-xs">
                          <span className="text-[#3a3a35]">
                            <strong className="text-[#5A5A40] mr-1">{idx + 1}.</strong>
                            {step.instruction}
                          </span>
                          <span className="text-[10px] text-[#8c887d] font-semibold shrink-0">
                            {step.distance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#f5f2ed]">
                    <a
                      href={computedRoute.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#5A5A40] hover:underline flex items-center gap-1"
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
                        className="px-4 py-1.5 rounded-full bg-[#5A5A40] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#4a4a35] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {insertedId === 'custom-route' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
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
        <div className="px-6 py-2.5 bg-[#F9F8F6] border-t border-[#D1D8DB] flex items-center justify-between text-[11px] text-[#6B8E9B] font-sans">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#6B8E9B]" />
            <span>
              Real-time geospatial data powered by{' '}
              <a
                href="https://cloud.google.com/maps-platform/terms?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#2C3539] hover:underline"
              >
                Google Maps Platform
              </a>
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.05em] font-medium text-[#8DA399]">
            Places (New) • Routes API
          </span>
        </div>
      </div>
    </div>
  );
}
