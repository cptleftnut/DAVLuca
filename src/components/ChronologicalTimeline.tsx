import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Calendar,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
  Mic,
  Users,
  Star,
  Search,
  ArrowUpDown,
  Tag,
  Info,
  Scale,
  ShieldCheck,
  Building,
  Heart,
  ChevronDown,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Bookmark,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  Save,
  X,
  ExternalLink,
  Eye,
  Hash
} from 'lucide-react';
import { TimelineEvent, DocumentFinding, Party, EventAnnotation } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { DocumentTimestampVerticalTimeline } from './DocumentTimestampVerticalTimeline';

export interface ChronologicalTimelineProps {
  events: TimelineEvent[];
  documents?: DocumentFinding[];
  parties?: Party[];
  onSelectEvent?: (event: TimelineEvent) => void;
  onSelectDocument?: (docId: string) => void;
  onUpdateEvent?: (eventId: string, updates: Partial<TimelineEvent>) => void;
}

export function ChronologicalTimeline({
  events,
  documents = [],
  parties = [],
  onSelectEvent,
  onSelectDocument,
  onUpdateEvent
}: ChronologicalTimelineProps) {
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'events' | 'doc_timestamps'>('events');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [onlyMilestones, setOnlyMilestones] = useState(false);
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [hoveredPartyId, setHoveredPartyId] = useState<string | null>(null);
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);

  // Active annotation editor state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedFlag, setSelectedFlag] = useState<'verified' | 'suspicious' | 'follow_up' | 'unconfirmed'>('follow_up');

  // Quick document lookup dictionary
  const docLookup = useMemo(() => {
    const map = new Map<string, DocumentFinding>();
    documents.forEach(d => {
      map.set(d.id, d);
      if (d.docNumber) map.set(d.docNumber, d);
    });
    return map;
  }, [documents]);

  // Extract years and categories
  const years = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      if (e.date) {
        const y = e.date.substring(0, 4);
        if (y.length === 4) set.add(y);
      }
    });
    return Array.from(set).sort();
  }, [events]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set).sort();
  }, [events]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        if (onlyMilestones && e.significance !== 'critical' && !e.isKeyMilestone) return false;
        if (onlyWithNotes && (!e.userNotes && (!e.annotations || e.annotations.length === 0))) return false;
        if (selectedYear !== 'all' && !e.date.startsWith(selectedYear)) return false;
        if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = e.title?.toLowerCase().includes(q);
          const matchDesc = e.description?.toLowerCase().includes(q);
          const matchDate = e.date?.toLowerCase().includes(q);
          const matchCat = e.category?.toLowerCase().includes(q);
          const matchNotes = e.userNotes?.toLowerCase().includes(q);
          const matchTags = e.tags?.some(t => t.toLowerCase().includes(q));
          const matchAnnotations = e.annotations?.some(a => a.text.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchDate && !matchCat && !matchNotes && !matchTags && !matchAnnotations) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const cmp = a.date.localeCompare(b.date);
        return sortAscending ? cmp : -cmp;
      });
  }, [events, onlyMilestones, onlyWithNotes, selectedYear, selectedCategory, searchQuery, sortAscending]);

  // Key milestone highlights
  const keyMilestones = useMemo(() => {
    return events.filter(e => e.significance === 'critical' || e.isKeyMilestone);
  }, [events]);

  // Handle adding private annotation
  const handleAddAnnotation = (event: TimelineEvent) => {
    if (!newNoteText.trim() && !newTagInput.trim()) return;

    const newAnnotation: EventAnnotation = {
      id: `annot-${Date.now()}`,
      text: newNoteText.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      investigatorFlag: selectedFlag,
      tags: newTagInput.trim() ? [newTagInput.trim().replace(/^#/, '')] : []
    };

    const existingAnnotations = event.annotations || [];
    const updatedAnnotations = [...existingAnnotations, newAnnotation];

    // Also update tags list if user added a tag
    let updatedTags = event.tags || [];
    if (newTagInput.trim()) {
      const cleanTag = newTagInput.trim().replace(/^#/, '');
      if (!updatedTags.includes(cleanTag)) {
        updatedTags = [...updatedTags, cleanTag];
      }
    }

    onUpdateEvent?.(event.id, {
      annotations: updatedAnnotations,
      tags: updatedTags,
      userNotes: event.userNotes ? `${event.userNotes}\n• ${newNoteText.trim()}` : newNoteText.trim()
    });

    setNewNoteText('');
    setNewTagInput('');
    setEditingNoteId(null);
  };

  const handleDeleteAnnotation = (event: TimelineEvent, annotationId: string) => {
    const updated = (event.annotations || []).filter(a => a.id !== annotationId);
    onUpdateEvent?.(event.id, { annotations: updated });
  };

  const handleAddTag = (event: TimelineEvent, tagToAdd: string) => {
    if (!tagToAdd.trim()) return;
    const cleanTag = tagToAdd.trim().replace(/^#/, '');
    const current = event.tags || [];
    if (!current.includes(cleanTag)) {
      onUpdateEvent?.(event.id, { tags: [...current, cleanTag] });
    }
  };

  const handleRemoveTag = (event: TimelineEvent, tagToRemove: string) => {
    const updated = (event.tags || []).filter(t => t !== tagToRemove);
    onUpdateEvent?.(event.id, { tags: updated });
  };

  const getCategoryColor = (cat: string) => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('fabu') || lower.includes('samvær')) {
      return {
        badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 group-hover:bg-cyan-500/20',
        dot: 'bg-cyan-500 shadow-cyan-500/50',
        glow: 'from-cyan-500/10 to-transparent',
        border: 'border-cyan-500/20 hover:border-cyan-500/50',
        activeBorder: 'border-cyan-400 shadow-cyan-500/20'
      };
    }
    if (lower.includes('amalie') || lower.includes('rikke')) {
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30 group-hover:bg-amber-500/20',
        dot: 'bg-amber-500 shadow-amber-500/50',
        glow: 'from-amber-500/10 to-transparent',
        border: 'border-amber-500/20 hover:border-amber-500/50',
        activeBorder: 'border-amber-400 shadow-amber-500/20'
      };
    }
    if (lower.includes('liam') || lower.includes('fortælling')) {
      return {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30 group-hover:bg-rose-500/20',
        dot: 'bg-rose-500 shadow-rose-500/50',
        glow: 'from-rose-500/10 to-transparent',
        border: 'border-rose-500/20 hover:border-rose-500/50',
        activeBorder: 'border-rose-400 shadow-rose-500/20'
      };
    }
    if (lower.includes('møde') || lower.includes('kommune')) {
      return {
        badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 group-hover:bg-indigo-500/20',
        dot: 'bg-indigo-500 shadow-indigo-500/50',
        glow: 'from-indigo-500/10 to-transparent',
        border: 'border-indigo-500/20 hover:border-indigo-500/50',
        activeBorder: 'border-indigo-400 shadow-indigo-500/20'
      };
    }
    if (lower.includes('dom') || lower.includes('afgørelse') || lower.includes('bu')) {
      return {
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30 group-hover:bg-purple-500/20',
        dot: 'bg-purple-500 shadow-purple-500/50',
        glow: 'from-purple-500/10 to-transparent',
        border: 'border-purple-500/20 hover:border-purple-500/50',
        activeBorder: 'border-purple-400 shadow-purple-500/20'
      };
    }
    return {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 group-hover:bg-emerald-500/20',
      dot: 'bg-emerald-500 shadow-emerald-500/50',
      glow: 'from-emerald-500/10 to-transparent',
      border: 'border-emerald-500/20 hover:border-emerald-500/50',
      activeBorder: 'border-emerald-400 shadow-emerald-500/20'
    };
  };

  const getFlagBadge = (flag?: string) => {
    switch (flag) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            <CheckCircle className="w-2.5 h-2.5" />
            {t('Verificeret Faktum', 'Verified Fact')}
          </span>
        );
      case 'suspicious':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold">
            <AlertTriangle className="w-2.5 h-2.5" />
            {t('Mistænkelig / Modstridende', 'Suspicious / Contradictory')}
          </span>
        );
      case 'follow_up':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
            <HelpCircle className="w-2.5 h-2.5" />
            {t('Kræver Opfølgning', 'Needs Follow-up')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            <Bookmark className="w-2.5 h-2.5" />
            {t('Privat Notat', 'Private Note')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
                {t('Trin 2: Kronologisk Kortlægning', 'Step 2: Chronological Mapping')}
              </span>
              <motion.span
                key={filteredEvents.length}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-slate-400"
              >
                • 2022 — 2026 ({filteredEvents.length} {t('hændelser', 'events')})
              </motion.span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
              <Clock className="w-6 h-6 text-indigo-400" />
              <span>{t('Kronologisk Sagsforløb & Hovedmilepæle', 'Chronological Case Flow & Key Milestones')}</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl mt-0.5 leading-relaxed">
              {t(
                'Minutiøs, uafbrudt tidslinje fra 2022 til 2026 med integreret privat annoteringssystem for personlig efterforskning.',
                'Minute-by-minute timeline spanning 2022 to 2026 with integrated inline annotations and personal investigation tracking.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('events')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'events'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t('Sagshændelser', 'Case Events')}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('doc_timestamps')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'doc_timestamps'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('Dokument Tidsstempler (Vertikal)', 'Doc Timestamps (Vertical)')}</span>
              </button>
            </div>

            {viewMode === 'events' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOnlyMilestones(!onlyMilestones)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    onlyMilestones
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${onlyMilestones ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                  <span>{t('Kun Hovedmilepæle', 'Milestones Only')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOnlyWithNotes(!onlyWithNotes)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    onlyWithNotes
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 ${onlyWithNotes ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{t('Kun Med Notater', 'With Notes Only')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSortAscending(!sortAscending)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{sortAscending ? t('2022 → 2026', 'Oldest First') : t('2026 → 2022', 'Newest First')}</span>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {viewMode === 'events' && (
          <>
            {/* Milestone Quick-Jump Bar with Rich Hover States */}
            <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t('Hurtig navigation til Hovedmilepæle:', 'Quick Jump to Key Milestones:')}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {keyMilestones.slice(0, 4).map((ms, msIdx) => {
              const colors = getCategoryColor(ms.category);
              return (
                <motion.div
                  key={`ms-${ms.id}-${msIdx}`}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => {
                    setExpandedEventId(ms.id);
                    setHoveredEventId(ms.id);
                    const el = document.getElementById(`timeline-evt-${ms.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`p-2.5 rounded-xl bg-slate-950/60 border ${colors.border} hover:bg-slate-900/90 transition-all cursor-pointer group shadow-sm`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
                      {ms.date}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${colors.badge}`}>
                      {ms.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 line-clamp-1 transition-colors">
                    {ms.title}
                  </h4>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('Søg i hændelser, datoer, notater, tags...', 'Search events, dates, notes, tags...')}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Year Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedYear('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedYear === 'all' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('Alle År', 'All Years')}
            </motion.button>
            {years.map(y => (
              <motion.button
                key={y}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedYear(y)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedYear === y ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {y}
              </motion.button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
          >
            <option value="all">{t('Alle Kategorier', 'All Categories')}</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </>
    )}
  </div>

  {viewMode === 'doc_timestamps' ? (
    <DocumentTimestampVerticalTimeline
      documents={documents}
      onSelectDocument={(doc) => onSelectDocument?.(doc.id)}
    />
  ) : (
    /* Vertical Scrollable Timeline Spine */
    <div className="relative pl-6 md:pl-10 space-y-6 before:content-[''] before:absolute before:left-3 md:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-cyan-500 before:to-purple-500">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm">{t('Ingen hændelser matcher de valgte filtre.', 'No events match the selected filters.')}</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const colors = getCategoryColor(evt.category);
            const isExpanded = expandedEventId === evt.id;
            const isHovered = hoveredEventId === evt.id;
            const isMilestone = evt.significance === 'critical' || evt.isKeyMilestone;
            const hasNotes = (evt.annotations && evt.annotations.length > 0) || evt.userNotes;

            // Associate party details
            const involvedParties = parties.filter(p => evt.partyIds?.includes(p.id));

            return (
              <div
                key={`timeline-evt-${evt.id}-${idx}`}
                id={`timeline-evt-${evt.id}`}
                className="relative group"
                onMouseEnter={() => setHoveredEventId(evt.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                {/* Glowing Spine Dot with Animated Transition */}
                <motion.div
                  animate={{
                    scale: isHovered || isExpanded ? 1.25 : 1,
                    boxShadow: isHovered || isExpanded
                      ? '0 0 15px rgba(99, 102, 241, 0.6)'
                      : isMilestone
                      ? '0 0 10px rgba(251, 191, 36, 0.4)'
                      : '0 0 0px transparent'
                  }}
                  transition={{ duration: 0.18 }}
                  className={`absolute -left-6 md:-left-10 top-3.5 w-6 h-6 rounded-full bg-slate-950 border-2 flex items-center justify-center transition-colors z-10 ${
                    isMilestone
                      ? 'border-amber-400'
                      : isHovered
                      ? 'border-indigo-400'
                      : 'border-indigo-500/70'
                  }`}
                >
                  <motion.div
                    animate={{ scale: isHovered ? [1, 1.3, 1] : 1 }}
                    transition={{ repeat: isHovered ? Infinity : 0, duration: 1.2 }}
                    className={`w-2 h-2 rounded-full ${colors.dot}`}
                  />
                </motion.div>

                {/* Event Card with Framer Motion interactive hover & expansion */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    x: isHovered ? 4 : 0
                  }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.25) }}
                  className={`relative overflow-hidden p-4 md:p-5 rounded-2xl bg-slate-900/90 border transition-all shadow-md ${
                    isExpanded
                      ? 'border-indigo-500/80 shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                      : isMilestone
                      ? 'border-amber-500/40 shadow-amber-500/5 hover:border-amber-500/70'
                      : isHovered
                      ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : colors.border
                  }`}
                >
                  {/* Subtle dynamic background glow when hovered */}
                  {isHovered && (
                    <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full bg-gradient-to-br ${colors.glow} blur-2xl pointer-events-none transition-opacity`} />
                  )}

                  <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-mono text-xs font-bold border border-slate-700 flex items-center gap-1 shadow-sm"
                        >
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          {evt.date} {evt.time ? `• ${evt.time}` : ''}
                        </motion.span>

                        <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium transition-colors ${colors.badge}`}>
                          {evt.category}
                        </span>

                        {isMilestone && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold shadow-sm shadow-amber-500/10">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {t('Kritisk Milepæl', 'Key Milestone')}
                          </span>
                        )}

                        {hasNotes && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
                            <MessageSquare className="w-2.5 h-2.5" />
                            {evt.annotations?.length || 1} {t('notat', 'note')}
                          </span>
                        )}

                        {/* Hover Quick Indicator */}
                        {isHovered && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>{t('Fokuseret', 'Focused')}</span>
                          </motion.span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors pt-0.5">
                        {evt.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingNoteId(editingNoteId === evt.id ? null : evt.id);
                          if (!isExpanded) setExpandedEventId(evt.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-xs text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer border border-indigo-500/30 shadow-sm"
                        title={t('Tilføj privat notat eller tag', 'Add private note or tag')}
                      >
                        <Edit3 className="w-3 h-3 text-indigo-400" />
                        <span>{t('Notat / Tag', 'Annotate')}</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                      >
                        <span>{isExpanded ? t('Mindre', 'Less') : t('Detaljer', 'Details')}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Summary / Description */}
                  <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Hover Party & Document Metadata Badges Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/60">
                    {/* Parties involved pills */}
                    {involvedParties.map(p => (
                      <motion.span
                        key={p.id}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.25)' }}
                        onMouseEnter={() => setHoveredPartyId(p.id)}
                        onMouseLeave={() => setHoveredPartyId(null)}
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-colors cursor-default ${
                          hoveredPartyId === p.id
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <Users className="w-2.5 h-2.5 text-indigo-400" />
                        <span>{p.name}</span>
                      </motion.span>
                    ))}

                    {/* Source Documents pills */}
                    {(() => {
                      const allDocIds = Array.from(
                        new Set([
                          ...(evt.sourceDocumentIds || []),
                          ...(evt.sourceDocId ? [evt.sourceDocId] : [])
                        ])
                      );
                      return allDocIds.map(docId => {
                        const docInfo = docLookup.get(docId);
                        return (
                          <motion.button
                            key={docId}
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onMouseEnter={() => setHoveredDocId(docId)}
                            onMouseLeave={() => setHoveredDocId(null)}
                            onClick={() => onSelectDocument?.(docId)}
                            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 font-mono transition-all cursor-pointer shadow-sm"
                            title={docInfo?.title ? `${docId}: ${docInfo.title}` : `Åbn Sagsakt & OCR (${docId})`}
                          >
                            <FileText className="w-3 h-3 text-emerald-400" />
                            <span>{docInfo?.docNumber || docId}</span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-sans font-bold">OCR</span>
                            <ExternalLink className="w-2.5 h-2.5 text-emerald-400/70" />
                          </motion.button>
                        );
                      });
                    })()}

                    {/* Inline Tags Display */}
                    {evt.tags && evt.tags.map((tg, i) => (
                      <motion.span
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-cyan-300 font-mono shadow-sm"
                      >
                        <Tag className="w-2.5 h-2.5 text-cyan-400" />
                        #{tg}
                        <button
                          onClick={() => handleRemoveTag(evt, tg)}
                          className="text-slate-500 hover:text-rose-400 ml-0.5 cursor-pointer"
                          title="Fjern tag"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>

                  {/* Inline Annotation Editor with Smooth Animation */}
                  <AnimatePresence>
                    {editingNoteId === evt.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3 shadow-inner"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                            {t('Tilføj Personlig Efterforskningsnote', 'Add Personal Investigation Note')}
                          </span>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Note textarea */}
                        <div>
                          <textarea
                            value={newNoteText}
                            onChange={e => setNewNoteText(e.target.value)}
                            placeholder={t(
                              'Skriv dine private observationer, hypotese eller modstridende oplysninger her...',
                              'Enter your private notes, hypotheses, or observed contradictions here...'
                            )}
                            rows={2}
                            className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Tag & Flag selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              {t('Tilføj Tag (f.eks. FABU, Modstrid, Alibi)', 'Add Custom Tag')}
                            </label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={newTagInput}
                                onChange={e => setNewTagInput(e.target.value)}
                                placeholder="f.eks. Modstridende"
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              {t('Efterforskningsstatus', 'Investigator Flag')}
                            </label>
                            <select
                              value={selectedFlag}
                              onChange={e => setSelectedFlag(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="follow_up">{t('⚠️ Kræver Opfølgning', '⚠️ Needs Follow-up')}</option>
                              <option value="suspicious">{t('🚨 Mistænkelig Anomali', '🚨 Suspicious Anomaly')}</option>
                              <option value="verified">{t('✅ Verificeret Faktum', '✅ Verified Fact')}</option>
                              <option value="unconfirmed">{t('❓ Ubekræftet Påstand', '❓ Unconfirmed')}</option>
                            </select>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
                          >
                            {t('Annuller', 'Cancel')}
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleAddAnnotation(evt)}
                            className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{t('Gem Note', 'Save Note')}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expandable Deep Forensic Details & Saved Annotations */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24 }}
                        className="mt-4 pt-4 border-t border-slate-800/80 space-y-3"
                      >
                        {/* Saved Annotations List */}
                        {evt.annotations && evt.annotations.length > 0 && (
                          <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                              {t('Tilknyttede Private Notater:', 'Attached Private Annotations:')}
                            </span>
                            <div className="space-y-2">
                              {evt.annotations.map(annot => (
                                <motion.div
                                  key={annot.id}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      {getFlagBadge(annot.investigatorFlag)}
                                      <span className="text-[10px] text-slate-400 font-mono">{annot.createdAt}</span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteAnnotation(evt, annot.id)}
                                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                                      title={t('Slet note', 'Delete note')}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <p className="text-slate-200 leading-relaxed pl-1">{annot.text}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Involved Parties detailed breakdown */}
                        {involvedParties.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <Users className="w-3 h-3 text-indigo-400" />
                              {t('Involverede Nøgleaktører & Roller:', 'Involved Key Parties & Roles:')}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {involvedParties.map(p => (
                                <div
                                  key={p.id}
                                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 text-xs font-bold">
                                    {p.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-bold text-white truncate">{p.name}</h5>
                                    <p className="text-[11px] text-indigo-300/90">{p.role}</p>
                                    {p.organization && (
                                      <p className="text-[10px] text-slate-400 truncate">{p.organization}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Associated Source Documents with Rich Preview */}
                        {evt.sourceDocumentIds && evt.sourceDocumentIds.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-emerald-400" />
                              {t('Verificerede Kildedokumenter & Aktindsigter:', 'Verified Source Documents & Filings:')}
                            </span>
                            <div className="space-y-1.5">
                              {evt.sourceDocumentIds.map(docId => {
                                const docInfo = docLookup.get(docId);
                                return (
                                  <div
                                    key={docId}
                                    onClick={() => onSelectDocument?.(docId)}
                                    className="p-2.5 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400/60 flex items-center justify-between gap-3 transition-all cursor-pointer group/doc"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                                        {docId}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-200 group-hover/doc:text-emerald-300 truncate">
                                          {docInfo?.title || docId}
                                        </p>
                                        {docInfo?.summary && (
                                          <p className="text-[11px] text-slate-400 truncate max-w-lg">
                                            {docInfo.summary}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 text-[11px] font-medium flex items-center gap-1 shrink-0 group-hover/doc:bg-emerald-600 group-hover/doc:text-white transition-colors"
                                    >
                                      <span>{t('Se Akt', 'Inspect')}</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            );
          })
        )}
      </div>
      )}
    </div>
  );
}

