'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  JournalEntry,
  ChatMessage,
  saveJournalEntry,
  deleteJournalEntry,
  subscribeToJournalEntries,
} from '@/lib/firestore-service';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MapsExplorerModal } from './MapsExplorerModal';
import {
  Plus,
  Search,
  Sparkles,
  Send,
  Trash2,
  Calendar,
  Tag,
  FileText,
  Lightbulb,
  CheckSquare,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Menu,
  X,
  AlertCircle,
  RotateCcw,
  Compass,
} from 'lucide-react';

interface DashboardProps {
  user: User | null;
  initialPrompt?: string;
  onOpenMaps?: () => void;
  onOpenPrivacy?: () => void;
  onOpenPreferences?: () => void;
}

const CATEGORIES = [
  { id: 'reflection', label: 'Reflection', icon: Sparkles },
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb },
  { id: 'journal', label: 'Journal', icon: FileText },
  { id: 'summary', label: 'Summary', icon: RefreshCw },
  { id: 'action_plan', label: 'Action Plan', icon: CheckSquare },
] as const;

const DATE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: '7 Days' },
  { id: 'month', label: '30 Days' },
] as const;

const SUMMARY_TYPES = [
  {
    id: 'brief',
    label: 'Brief Summary',
    icon: FileText,
    description: 'Concise 2-3 sentence distillation of emotional & core themes',
  },
  {
    id: 'takeaways',
    label: 'Key Takeaways',
    icon: Lightbulb,
    description: 'Bullet-pointed realizations, patterns, and cognitive shifts',
  },
  {
    id: 'actionable',
    label: 'Actionable Insights',
    icon: CheckSquare,
    description: 'Concrete next steps with checklist, habit tweaks, and micro-actions',
  },
  {
    id: 'structured',
    label: 'Complete Synthesis',
    icon: RefreshCw,
    description: 'Full structured breakdown with summary, insights, and next steps',
  },
] as const;

const MOODS = [
  { id: 'Focused', emoji: '🎯', label: 'Focused' },
  { id: 'Calm', emoji: '🧘', label: 'Calm' },
  { id: 'Inspired', emoji: '💡', label: 'Inspired' },
  { id: 'Contemplative', emoji: '💭', label: 'Contemplative' },
  { id: 'Energized', emoji: '⚡', label: 'Energized' },
  { id: 'Grateful', emoji: '🙏', label: 'Grateful' },
];

const PROMPT_SUGGESTIONS = [
  "I'm finding it hard to prioritize tasks. Everything feels urgent, but I know some things are noise.",
  "What is the most important lesson I learned today, and what subtle cognitive patterns influenced my choices?",
  "Here is an ambitious creative concept I'm exploring. Brainstorm unconventional, grounded angles.",
  "Reflecting on a recent friction point: what went well and what can I improve with clear perspective?",
];

function generateId(prefix: string): string {
  return `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 8)}`;
}

function getCurrentTimestamp(): number {
  return new Date().getTime();
}

function formatHistoryDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
      ? 'nd'
      : day === 3 || day === 23
      ? 'rd'
      : 'th';
  return `${month} ${day}${suffix}`;
}

export function Dashboard({
  user,
  initialPrompt = '',
  onOpenMaps,
  onOpenPrivacy,
  onOpenPreferences,
}: DashboardProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('serene_guest_entries');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error('Failed to parse local guest entries', e);
      }
    }
    return [];
  });
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Summary generation config
  const [selectedSummaryType, setSelectedSummaryType] = useState<
    'brief' | 'takeaways' | 'actionable' | 'structured'
  >('brief');
  const [summaryMenuOpen, setSummaryMenuOpen] = useState(false);

  // Active entry editor state
  const [activeTitle, setActiveTitle] = useState('New Reflection');
  const [activeCategory, setActiveCategory] = useState<JournalEntry['category']>('reflection');
  const [activeMood, setActiveMood] = useState<string>('Calm');
  const [activeTags, setActiveTags] = useState<string[]>(['Sanctuary']);
  const [newTagInput, setNewTagInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt);

  // UI interaction states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [mapsModalOpen, setMapsModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const summaryMenuRef = useRef<HTMLDivElement | null>(null);

  // Auto-resize textarea to expand with text
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleInsertFromMaps = useCallback((contentToInsert: string) => {
    setInputPrompt((prev) => (prev ? `${prev}\n\n${contentToInsert}` : contentToInsert));
    setMapsModalOpen(false);
  }, []);

  // Close summary menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (summaryMenuRef.current && !summaryMenuRef.current.contains(event.target as Node)) {
        setSummaryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEntryIntoWorkspace = useCallback((entry: JournalEntry) => {
    setSelectedEntryId(entry.id);
    setActiveTitle(entry.title || 'Untitled Reflection');
    setActiveCategory(entry.category || 'reflection');
    setActiveMood(entry.mood || 'Calm');
    setActiveTags(entry.tags || []);
    setMessages(entry.messages || []);
    setInputPrompt('');
    setSidebarOpen(false);
  }, []);

  // Prominent Fresh Entry Creator: clears chat and starts completely fresh session
  const createNewEntry = useCallback(() => {
    const newId = generateId('entry');
    const timestamp = getCurrentTimestamp();
    const effectiveUid = user?.uid || 'guest-session';
    const newEntry: JournalEntry = {
      id: newId,
      userId: effectiveUid,
      title: 'New Reflection',
      category: 'reflection',
      mood: 'Calm',
      tags: ['Sanctuary'],
      messages: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setSelectedEntryId(newId);
    setActiveTitle(newEntry.title);
    setActiveCategory(newEntry.category);
    setActiveMood(newEntry.mood!);
    setActiveTags(newEntry.tags);
    setMessages([]);
    setInputPrompt('');
    setSidebarOpen(false);

    if (user?.uid) {
      saveJournalEntry(user.uid, newEntry).catch((err) => {
        console.error('Error creating new entry:', err);
      });
    }

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [user]);

  // Subscribe to user's Firestore entries
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToJournalEntries(
      user.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        setSaveStatus('saved');

        setSelectedEntryId((currId) => {
          if (!currId && fetchedEntries.length > 0) {
            loadEntryIntoWorkspace(fetchedEntries[0]);
            return fetchedEntries[0].id;
          }
          return currId;
        });
      },
      (error) => {
        console.error('Subscription error:', error);
        setSaveStatus('error');
        setSaveError('Could not sync with Firestore');
      }
    );

    return () => unsubscribe();
  }, [user, loadEntryIntoWorkspace]);

  // Helper to persist entry state to Firestore
  const persistCurrentEntry = useCallback(
    async (entryOverride?: Partial<JournalEntry>) => {
      const now = getCurrentTimestamp();
      const effectiveUid = user?.uid || 'guest-session';
      const existingEntry = entries.find((e) => e.id === selectedEntryId);
      const entryId = selectedEntryId || generateId('entry');

      const entryToSave: JournalEntry = {
        id: entryId,
        userId: effectiveUid,
        title: activeTitle.trim() || 'Untitled Reflection',
        category: activeCategory,
        mood: activeMood,
        tags: activeTags,
        messages: messages,
        createdAt: existingEntry?.createdAt || now,
        updatedAt: now,
        ...entryOverride,
      };

      if (!user?.uid) {
        // Guest mode persistence
        try {
          const updated = [entryToSave, ...entries.filter((e) => e.id !== entryId)];
          setEntries(updated);
          localStorage.setItem('serene_guest_entries', JSON.stringify(updated));
          setSaveStatus('saved');
        } catch (e) {
          console.error('Local save error', e);
        }
        return;
      }

      setSaveStatus('saving');
      setSaveError(null);

      const result = await saveJournalEntry(user.uid, entryToSave);
      if (result.success) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
        setSaveError(result.error || 'Failed to save to Firestore');
      }
    },
    [user, selectedEntryId, activeTitle, activeCategory, activeMood, activeTags, messages, entries]
  );

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle sending a reflection message to Gemini
  const handleSendMessage = useCallback(
    async (customPrompt?: string) => {
      const textToSend = customPrompt || inputPrompt;
      if (!textToSend.trim() || isGenerating) return;

      const now = getCurrentTimestamp();
      const userMsgId = generateId('msg_user');
      const userMessage: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: textToSend.trim(),
        timestamp: now,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputPrompt('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setIsGenerating(true);
      setActiveAction('chat');

      try {
        const response = await fetch('/api/gemini/reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'chat',
            messages: updatedMessages,
            prompt: textToSend.trim(),
            category: activeCategory,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to get reflection response');
        }

        const modelMsgId = generateId('msg_model');
        const modelMessage: ChatMessage = {
          id: modelMsgId,
          role: 'model',
          content: data.text || 'I am here with you.',
          timestamp: getCurrentTimestamp(),
        };

        const finalMessages = [...updatedMessages, modelMessage];
        setMessages(finalMessages);

        // Update active entry title if it's the first message and title is default
        const newTitle =
          activeTitle === 'New Reflection' || !activeTitle
            ? textToSend.trim().slice(0, 36) + (textToSend.length > 36 ? '...' : '')
            : activeTitle;

        setActiveTitle(newTitle);
        persistCurrentEntry({
          title: newTitle,
          messages: finalMessages,
        });
      } catch (error: any) {
        console.error('Reflection chat error:', error);
        const errorMsgId = generateId('msg_err');
        setMessages((prev) => [
          ...prev,
          {
            id: errorMsgId,
            role: 'model',
            content:
              'A quiet stillness interrupted our connection. Please take a breath and try sending your thought again.',
            timestamp: getCurrentTimestamp(),
          },
        ]);
      } finally {
        setIsGenerating(false);
        setActiveAction(null);
      }
    },
    [inputPrompt, isGenerating, messages, activeCategory, activeTitle, persistCurrentEntry]
  );

  // If initialPrompt was passed, focus the textarea
  useEffect(() => {
    if (initialPrompt && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [initialPrompt]);

  // Quick Actions: Summarize or Brainstorm
  const handleQuickAction = useCallback(
    async (
      action: 'summarize' | 'brainstorm',
      overrideSummaryType?: 'brief' | 'takeaways' | 'actionable' | 'structured'
    ) => {
      if (isGenerating || messages.length === 0) return;

      setIsGenerating(true);
      setActiveAction(action);
      setSummaryMenuOpen(false);

      const summaryType = overrideSummaryType || selectedSummaryType;

      try {
        const response = await fetch('/api/gemini/reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            messages,
            summaryType: action === 'summarize' ? summaryType : undefined,
            category: activeCategory,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || `Failed to generate ${action}`);
        }

        const modelMsgId = generateId(`msg_${action}`);
        const resultMessage: ChatMessage = {
          id: modelMsgId,
          role: 'model',
          content: data.text || '',
          timestamp: getCurrentTimestamp(),
        };

        const finalMessages = [...messages, resultMessage];
        setMessages(finalMessages);

        persistCurrentEntry({
          messages: finalMessages,
          summary: action === 'summarize' ? data.text : undefined,
        });
      } catch (err: any) {
        console.error(`${action} error:`, err);
      } finally {
        setIsGenerating(false);
        setActiveAction(null);
      }
    },
    [isGenerating, messages, selectedSummaryType, activeCategory, persistCurrentEntry]
  );

  // Delete an entry
  const handleDeleteEntry = async (entryId: string) => {
    if (user?.uid) {
      await deleteJournalEntry(user.uid, entryId);
    } else {
      const updated = entries.filter((e) => e.id !== entryId);
      setEntries(updated);
      try {
        localStorage.setItem('serene_guest_entries', JSON.stringify(updated));
      } catch (e) {}
    }

    setDeleteConfirmId(null);
    if (selectedEntryId === entryId) {
      createNewEntry();
    }
  };

  const handleCopyMarkdown = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const tagClean = newTagInput.trim().replace(/^#/, '');
    if (!activeTags.includes(tagClean)) {
      const updated = [...activeTags, tagClean];
      setActiveTags(updated);
      persistCurrentEntry({ tags: updated });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = activeTags.filter((t) => t !== tagToRemove);
    setActiveTags(updated);
    persistCurrentEntry({ tags: updated });
  };

  // Date filter logic
  const isWithinDateRange = useCallback((timestamp: number, filter: string): boolean => {
    if (filter === 'all') return true;
    const entryDate = new Date(timestamp).getTime();
    const now = new Date().getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    if (filter === 'today') return now - entryDate < dayMs;
    if (filter === 'week') return now - entryDate < 7 * dayMs;
    if (filter === 'month') return now - entryDate < 30 * dayMs;
    return true;
  }, []);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesCategory =
        selectedCategoryFilter === 'all' || entry.category === selectedCategoryFilter;
      const matchesDate = isWithinDateRange(entry.updatedAt || entry.createdAt, selectedDateFilter);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        entry.title.toLowerCase().includes(query) ||
        entry.tags.some((t) => t.toLowerCase().includes(query)) ||
        entry.messages.some((m) => m.content.toLowerCase().includes(query));

      return matchesCategory && matchesDate && matchesSearch;
    });
  }, [entries, selectedCategoryFilter, selectedDateFilter, searchQuery, isWithinDateRange]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedCategoryFilter !== 'all' || selectedDateFilter !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    setSelectedDateFilter('all');
  };

  const currentSummaryConfig =
    SUMMARY_TYPES.find((s) => s.id === selectedSummaryType) || SUMMARY_TYPES[0];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#F9F8F6] font-sans text-[#2C3539] overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#2C3539]/30 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT COLUMN: History Nav (~20-25% width, border-r: 1px solid #D1D8DB) */}
      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 w-72 lg:w-80 bg-[#F9F8F6] border-r border-[#D1D8DB] z-30 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header with Prominent New Entry Button */}
        <div className="p-5 border-b border-[#D1D8DB] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.05em] text-[#6B8E9B] font-sans font-medium">
              Reflections
            </span>

            {/* Prominent New Entry Button */}
            <button
              id="btn-sidebar-new-entry"
              onClick={createNewEntry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#6B8E9B] hover:opacity-90 text-white text-xs uppercase tracking-[0.05em] font-sans transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B8E9B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-entries"
              type="text"
              placeholder="Search thoughts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-[#FFFFFF] border border-[#D1D8DB] rounded text-[#2C3539] placeholder-[#D1D8DB] focus:outline-none focus:border-[#6B8E9B] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B8E9B] hover:text-[#2C3539]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Date Filter Tabs */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.05em] text-[#6B8E9B] font-sans">
            {DATE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                id={`btn-date-filter-${filter.id}`}
                onClick={() => setSelectedDateFilter(filter.id)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  selectedDateFilter === filter.id
                    ? 'text-[#2C3539] font-medium bg-[#FFFFFF] border border-[#D1D8DB]'
                    : 'hover:text-[#2C3539]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of History Items: List of dates (e.g. October 12th), 14px text */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredEntries.length === 0 ? (
            <div className="py-12 px-4 text-center text-[#6B8E9B] space-y-2">
              <p className="font-serif italic text-sm text-[#2C3539]">No reflections recorded</p>
              <p className="text-xs font-sans">Click &ldquo;New Entry&rdquo; above to begin.</p>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded bg-[#FFFFFF] border border-[#D1D8DB] text-xs font-sans text-[#6B8E9B] hover:text-[#2C3539]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isSelected = entry.id === selectedEntryId;
              const formattedDate = formatHistoryDate(entry.updatedAt || entry.createdAt);

              return (
                <button
                  key={entry.id}
                  id={`entry-item-${entry.id}`}
                  onClick={() => loadEntryIntoWorkspace(entry)}
                  className={`w-full text-left px-3.5 py-3 rounded transition-all cursor-pointer group border ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#D1D8DB] shadow-xs'
                      : 'border-transparent hover:border-[#D1D8DB]/50'
                  }`}
                >
                  {/* Date as primary anchor: 14px text */}
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={`text-[14px] font-sans transition-colors duration-200 ${
                        isSelected
                          ? 'text-[#2C3539] font-medium'
                          : 'text-[#6B8E9B] group-hover:text-[#2C3539]'
                      }`}
                    >
                      {formattedDate}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.05em] text-[#8DA399] font-sans">
                      {entry.category}
                    </span>
                  </div>

                  {/* Title subtitle */}
                  <p
                    className={`text-xs font-serif truncate mt-0.5 ${
                      isSelected ? 'text-[#2C3539]' : 'text-[#6B8E9B]/80 group-hover:text-[#2C3539]'
                    }`}
                  >
                    {entry.title || 'Untitled Reflection'}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar Footer: User / Session status */}
        <div className="p-4 border-t border-[#D1D8DB] flex items-center justify-between text-xs font-sans text-[#6B8E9B]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8DA399]"></span>
            <span className="truncate max-w-[150px]">
              {user ? user.displayName || 'Authenticated' : 'Local Sanctuary Session'}
            </span>
          </div>
          {user && (
            <span className="text-[10px] uppercase tracking-[0.05em] text-[#8DA399]">Cloud Synced</span>
          )}
        </div>
      </aside>

      {/* RIGHT COLUMN: Chat Canvas (~75-80% width, max 680px centered) */}
      <main className="flex-1 h-full flex flex-col bg-[#F9F8F6] relative overflow-hidden">
        {/* Subtle Workspace Header Bar */}
        <header className="px-6 py-4 border-b border-[#D1D8DB]/60 bg-[#F9F8F6] flex flex-wrap items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              id="btn-toggle-sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded border border-[#D1D8DB] text-[#6B8E9B] hover:text-[#2C3539] cursor-pointer"
              title="Toggle Timeline"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Editable Reflection Title */}
            <input
              id="input-entry-title"
              type="text"
              value={activeTitle}
              onChange={(e) => {
                setActiveTitle(e.target.value);
                persistCurrentEntry({ title: e.target.value });
              }}
              placeholder="Title of this reflection..."
              className="font-serif text-lg sm:text-xl text-[#2C3539] bg-transparent border-none focus:outline-none p-0 truncate max-w-md"
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Prominent New Journal Entry Button */}
            <button
              id="btn-main-new-entry"
              onClick={createNewEntry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#6B8E9B] hover:opacity-90 text-white text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer shadow-xs"
              title="Start a fresh, clean reflection"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Entry</span>
            </button>

            {/* Summary Type Selector Dropdown */}
            <div className="relative inline-flex items-center" ref={summaryMenuRef}>
              <button
                id="btn-action-summarize"
                onClick={() => handleQuickAction('summarize')}
                disabled={isGenerating || messages.length === 0}
                className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-l bg-[#FFFFFF] border border-r-0 border-[#D1D8DB] text-[#2C3539] text-xs font-sans uppercase tracking-[0.05em] hover:bg-[#F9F8F6] transition-colors disabled:opacity-50 cursor-pointer"
                title={`Generate ${currentSummaryConfig.label}`}
              >
                <Sparkles className="w-3 h-3 text-[#6B8E9B]" />
                <span>{currentSummaryConfig.label}</span>
              </button>

              <button
                id="btn-summary-type-toggle"
                onClick={() => setSummaryMenuOpen(!summaryMenuOpen)}
                disabled={isGenerating}
                className="flex items-center justify-center px-1.5 py-1.5 rounded-r bg-[#FFFFFF] border border-[#D1D8DB] text-[#6B8E9B] hover:text-[#2C3539] text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${summaryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {summaryMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#FFFFFF] rounded border border-[#D1D8DB] shadow-md p-1.5 z-50 space-y-1 font-sans">
                  {SUMMARY_TYPES.map((typeOption) => {
                    const isSelected = selectedSummaryType === typeOption.id;
                    return (
                      <button
                        key={typeOption.id}
                        id={`btn-select-summary-${typeOption.id}`}
                        onClick={() => {
                          setSelectedSummaryType(typeOption.id);
                          if (messages.length > 0) {
                            handleQuickAction('summarize', typeOption.id);
                          } else {
                            setSummaryMenuOpen(false);
                          }
                        }}
                        className={`w-full text-left p-2 rounded transition-colors text-xs flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-[#F9F8F6] text-[#2C3539] font-medium' : 'text-[#6B8E9B] hover:bg-[#F9F8F6]'
                        }`}
                      >
                        <span>{typeOption.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#6B8E9B]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Brainstorm Button */}
            <button
              id="btn-action-brainstorm"
              onClick={() => handleQuickAction('brainstorm')}
              disabled={isGenerating || messages.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FFFFFF] border border-[#D1D8DB] hover:border-[#6B8E9B] text-[#2C3539] text-xs font-sans uppercase tracking-[0.05em] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Lightbulb className="w-3 h-3 text-[#6B8E9B]" />
              <span className="hidden sm:inline">Brainstorm</span>
            </button>

            {/* Google Maps Agent Button */}
            <button
              id="btn-action-maps-agent"
              onClick={() => (onOpenMaps ? onOpenMaps() : setMapsModalOpen(true))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FFFFFF] border border-[#D1D8DB] hover:border-[#6B8E9B] text-[#6B8E9B] hover:text-[#2C3539] text-xs font-sans uppercase tracking-[0.05em] transition-all cursor-pointer"
              title="Open Google Maps Real-Time Agent"
            >
              <Compass className="w-3.5 h-3.5 text-[#6B8E9B]" />
              <span className="hidden md:inline">Maps Agent</span>
            </button>

            {/* Sync status */}
            <div className="flex items-center gap-1 text-xs text-[#8DA399] font-sans pl-1">
              {saveStatus === 'saving' && <RefreshCw className="w-3 h-3 animate-spin text-[#6B8E9B]" />}
              {saveStatus === 'saved' && <Check className="w-3 h-3 text-[#8DA399]" />}
              {saveStatus === 'error' && (
                <button
                  onClick={() => persistCurrentEntry()}
                  className="text-rose-600 text-[10px] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>

            {/* Delete Entry */}
            {selectedEntryId && (
              <button
                id="btn-delete-entry"
                onClick={() => setDeleteConfirmId(selectedEntryId)}
                title="Silence / delete reflection"
                className="p-1.5 rounded text-[#6B8E9B] hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* CHAT CANVAS CONTAINER: max-w-[680px] centered in the right pane */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-10">
          <div className="w-full max-w-[680px] mx-auto space-y-12">
            {messages.length === 0 ? (
              /* Empty state: "I am here. Take your time." centered in the canvas */
              <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-serif text-[#2C3539] font-normal italic tracking-[-0.01em]">
                    I am here. Take your time.
                  </h2>
                  <p className="text-sm font-sans text-[#6B8E9B] font-light max-w-sm mx-auto">
                    Speak freely or untangle a quiet consideration.
                  </p>
                </div>

                {/* Prompt Starters */}
                <div className="w-full pt-4 space-y-2 text-left">
                  {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="w-full text-left p-3.5 rounded bg-[#FFFFFF] border border-[#D1D8DB] hover:border-[#6B8E9B] text-[#2C3539] text-xs font-serif italic transition-colors cursor-pointer block leading-relaxed"
                    >
                      &ldquo;{suggestion}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages Stream */
              <div className="space-y-10">
                {messages.map((msg) => (
                  <div key={msg.id} id={`msg-${msg.id}`}>
                    {msg.role === 'user' ? (
                      /* User Message: Albert Sans, 16px, flush right, no bubble, #6B8E9B text */
                      <div className="text-right ml-auto max-w-[85%]">
                        <p className="font-sans text-[16px] text-[#6B8E9B] font-normal leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    ) : (
                      /* AI Message: Lora, 18px, flush left, #2C3539 text, 1.8 line-height */
                      <div className="text-left mr-auto max-w-full relative group">
                        <MarkdownRenderer content={msg.content} />

                        {/* Copy Option */}
                        <button
                          onClick={() => handleCopyMarkdown(msg.content, msg.id)}
                          title="Copy reflection"
                          className="opacity-0 group-hover:opacity-100 mt-2 text-[11px] uppercase tracking-[0.05em] font-sans text-[#6B8E9B] hover:text-[#2C3539] transition-opacity inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#8DA399]" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* AI Thinking State: subtle breathing opacity change on a small ... text */}
                {isGenerating && (
                  <div className="text-left py-2">
                    <span className="font-serif text-xl text-[#6B8E9B] animate-pulse">...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT AREA: Bottom fixed, gradient fade to mask scrolling text: linear-gradient(to top, #F9F8F6 80%, transparent) */}
        <div className="bg-gradient-to-t from-[#F9F8F6] via-[#F9F8F6]/95 to-transparent pt-8 pb-6 px-4 z-20">
          <div className="w-full max-w-[680px] mx-auto space-y-2">
            <div className="relative bg-[#FFFFFF] border border-[#D1D8DB] focus-within:border-[#6B8E9B] rounded-lg shadow-2xs transition-colors">
              <textarea
                id="textarea-reflection-input"
                ref={textareaRef}
                rows={1}
                value={inputPrompt}
                onChange={handleTextareaInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isGenerating}
                placeholder="Take your time..."
                className="w-full p-4 pr-14 bg-transparent outline-none resize-none font-sans text-[16px] text-[#2C3539] placeholder-[#D1D8DB] leading-relaxed block"
              />

              <button
                id="btn-submit-reflection"
                onClick={() => handleSendMessage()}
                disabled={isGenerating || !inputPrompt.trim()}
                className="absolute right-3 bottom-3 p-2 rounded bg-[#6B8E9B] text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity cursor-pointer"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] font-sans text-[#6B8E9B]/80 px-1 pt-1">
              <span>Sovereign Storage &bull; Zero Training</span>
              <span>Enter to send &bull; Shift + Enter for new line</span>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#2C3539]/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D1D8DB] max-w-sm w-full p-6 rounded-lg space-y-4 shadow-sm">
            <h3 className="text-xl font-serif text-[#2C3539]">Silence Reflection?</h3>
            <p className="text-xs font-sans text-[#6B8E9B] leading-relaxed">
              This reflection will be permanently erased from your records.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="text-xs font-sans uppercase tracking-[0.05em] text-[#6B8E9B] hover:text-[#2C3539] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEntry(deleteConfirmId)}
                className="px-4 py-2 rounded bg-rose-600 hover:opacity-90 text-white text-xs font-sans uppercase tracking-[0.05em] cursor-pointer"
              >
                Erase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Agent Modal */}
      <MapsExplorerModal
        isOpen={mapsModalOpen}
        onClose={() => setMapsModalOpen(false)}
        onInsertIntoJournal={handleInsertFromMaps}
      />
    </div>
  );
}
