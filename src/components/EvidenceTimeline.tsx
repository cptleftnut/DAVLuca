import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Clock,
  Calendar,
  FileText,
  Mic,
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowUpDown,
  Filter,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Bot,
  Hash,
  Scale,
  Building,
  Tag,
  Eye,
  List,
  Compass,
  Bookmark,
  Share2,
  Activity,
  Flame
} from 'lucide-react';
import { TimelineEvent, DocumentFinding, Party, TranscriptSnippet, SeriousClaim } from '../types';
import { EvidenceFrequencyTimelineD3 } from './EvidenceFrequencyTimelineD3';

interface EvidenceTimelineProps {
  onSelectDocument?: (doc: DocumentFinding) => void;
  onSelectTranscript?: (transcript: TranscriptSnippet) => void;
  onAskAIWithEvent?: (event: TimelineEvent) => void;
  className?: string;
}

export function EvidenceTimeline({
  onSelectDocument,
  onSelectTranscript,
  onAskAIWithEvent,
  className = ''
}: EvidenceTimelineProps) {
  const { timelineEvents, documents, transcripts, parties, claims, summary } = useCaseData();
  const { language, t } = useLanguage();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all'); // all, document, audio, claim, verified
  const [selectedSignificance, setSelectedSignificance] = useState<string>('all'); // all, critical, high, medium
  const [selectedPartyId, setSelectedPartyId] = useState<string>('all');
  const [sortAscending, setSortAscending] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'stream' | 'matrix'>('stream');
  const [showD3FrequencyChart, setShowD3FrequencyChart] = useState<boolean>(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Lookup dictionaries for cross-source resolution
  const docLookup = useMemo(() => {
    const map = new Map<string, DocumentFinding>();
    documents.forEach((d) => {
      map.set(d.id, d);
      if (d.docNumber) map.set(d.docNumber, d);
    });
    return map;
  }, [documents]);

  const partyLookup = useMemo(() => {
    const map = new Map<string, Party>();
    parties.forEach((p) => map.set(p.id, p));
    return map;
  }, [parties]);

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    timelineEvents.forEach((e) => {
      if (e.date && e.date.length >= 4) {
        years.add(e.date.substring(0, 4));
      }
    });
    return Array.from(years).sort();
  }, [timelineEvents]);

  // Resolve cross-source evidence for an event
  const resolveCrossSourceEvidence = (event: TimelineEvent) => {
    // 1. Direct or mentioned documents
    const matchedDocs: DocumentFinding[] = [];
    if (event.sourceDocId) {
      const doc = docLookup.get(event.sourceDocId);
      if (doc) matchedDocs.push(doc);
    }
    // Search in description for doc numbers
    documents.forEach((d) => {
      if (
        (d.docNumber && event.description?.includes(d.docNumber)) ||
        (d.docNumber && event.title?.includes(d.docNumber))
      ) {
        if (!matchedDocs.some((md) => md.id === d.id)) {
          matchedDocs.push(d);
        }
      }
    });

    // 2. Audio transcripts matching date or keywords
    const matchedTranscripts: TranscriptSnippet[] = [];
    transcripts.forEach((tr) => {
      const isDateMatch = Boolean(tr.date && tr.date.includes(event.date));
      const isKeywordMatch =
        Boolean(
          (event.category?.toLowerCase().includes('meeting') || event.title?.toLowerCase().includes('optagelse') || event.title?.toLowerCase().includes('møde')) &&
          (tr.text?.toLowerCase().includes('møde') || tr.speaker?.toLowerCase().includes('marsha') || tr.speaker?.toLowerCase().includes('mette'))
        );
      if (isDateMatch || isKeywordMatch) {
        matchedTranscripts.push(tr);
      }
    });

    // 3. Claims linked to this event
    const matchedClaims: SeriousClaim[] = [];
    claims.forEach((c) => {
      if (
        c.category?.toLowerCase().includes(event.category?.toLowerCase() || '') ||
        event.tags?.some((tg) => c.category?.toLowerCase().includes(tg.toLowerCase()))
      ) {
        matchedClaims.push(c);
      }
    });

    // 4. Involved parties
    const matchedParties: Party[] = (event.partyIds || [])
      .map((pid) => partyLookup.get(pid))
      .filter((p): p is Party => Boolean(p));

    return {
      documents: matchedDocs,
      transcripts: matchedTranscripts,
      claims: matchedClaims,
      parties: matchedParties
    };
  };

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    return timelineEvents
      .filter((event) => {
        // Year filter
        if (selectedYear !== 'all' && !event.date?.startsWith(selectedYear)) {
          return false;
        }

        // Significance filter
        if (selectedSignificance !== 'all' && event.significance !== selectedSignificance) {
          return false;
        }

        // Source type filter
        if (selectedSourceType === 'verified' && !event.verified) {
          return false;
        }
        if (selectedSourceType === 'document' && !event.sourceDocId && !event.category?.includes('Document')) {
          return false;
        }
        if (selectedSourceType === 'audio' && !event.category?.includes('Meeting') && !event.title?.toLowerCase().includes('optagelse')) {
          return false;
        }
        if (selectedSourceType === 'claim' && event.significance !== 'critical') {
          return false;
        }

        // Party filter
        if (selectedPartyId !== 'all' && !event.partyIds?.includes(selectedPartyId)) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = event.title?.toLowerCase().includes(q);
          const matchDesc = event.description?.toLowerCase().includes(q);
          const matchDate = event.date?.toLowerCase().includes(q);
          const matchCat = event.category?.toLowerCase().includes(q);
          const matchExcerpt = event.evidenceExcerpt?.toLowerCase().includes(q);
          const matchDoc = event.sourceDocId?.toLowerCase().includes(q);
          const matchTags = event.tags?.some((t) => t.toLowerCase().includes(q));

          if (!matchTitle && !matchDesc && !matchDate && !matchCat && !matchExcerpt && !matchDoc && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return sortAscending ? dateA - dateB : dateB - dateA;
      });
  }, [
    timelineEvents,
    selectedYear,
    selectedSignificance,
    selectedSourceType,
    selectedPartyId,
    searchQuery,
    sortAscending
  ]);

  const getSignificanceBadge = (sig: string) => {
    switch (sig) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            {t('Kritisk Evidens', 'Critical')}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            {t('Væsentlig', 'High')}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
            {t('Supplerende', 'Medium')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {sig}
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('meeting') || c.includes('møde') || c.includes('lyd')) {
      return <Mic className="w-4 h-4 text-purple-400" />;
    }
    if (c.includes('court') || c.includes('ret') || c.includes('juridisk')) {
      return <Scale className="w-4 h-4 text-amber-400" />;
    }
    if (c.includes('document') || c.includes('akt') || c.includes('fabu')) {
      return <FileText className="w-4 h-4 text-blue-400" />;
    }
    if (c.includes('financial') || c.includes('økonomi')) {
      return <Building className="w-4 h-4 text-emerald-400" />;
    }
    return <Clock className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-5 md:p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
                {t('Trin 2: Kronologisk Kortlægning', 'Step 2: Chronological Timeline')}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{filteredEvents.length} {t('Verificerede Hændelser', 'Verified Events')}</span>
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-indigo-400 shrink-0" />
              <span>{t('Forensisk Bevistidslinje (Cross-Source Timeline)', 'Forensic Evidence Timeline')}</span>
            </h2>

            <p className="text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              {t(
                'Minutiøs kronologisk kortlægning forankret i The Brew Method. Forbinder sagsakter, FABU samværsrapporter, mødelydoptagelser og forvaltningsakter på tværs af kildearkivet.',
                'Minute chronological mapping anchored in The Brew Method. Connects case documents, FABU visitation reports, audio recordings, and municipal filings across all archive sources.'
              )}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('stream')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'stream'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t('Tidslinje Stream', 'Timeline Stream')}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{t('Forensisk Matrix', 'Evidence Matrix')}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowD3FrequencyChart(!showD3FrequencyChart)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showD3FrequencyChart
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
              title={t('Vis/skjul D3 tidsmæssig bevisfrekvens og aktivitetstæthed', 'Toggle D3 evidence frequency & activity density')}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('D3 Bevisfrekvens', 'D3 Frequency')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSortAscending(!sortAscending)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
              title={sortAscending ? t('Sortering: Ældste først', 'Oldest first') : t('Sortering: Nyeste først', 'Newest first')}
            >
              <ArrowUpDown className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-5 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Søg i hændelser, akter, citater...', 'Search events, documents, excerpts...')}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label={t('Vælg årstal', 'Select year')}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">{t('Alle Årgange (2022-2026)', 'All Years (2022-2026)')}</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Source Type Filter */}
          <div>
            <select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value)}
              aria-label={t('Vælg kildetype', 'Select source type')}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">{t('Alle Kildetyper', 'All Source Types')}</option>
              <option value="document">{t('📄 Aktindsigter & Notater', '📄 Documents & Reports')}</option>
              <option value="audio">{t('🎙️ Lydoptagelser & Møder', '🎙️ Audio & Meetings')}</option>
              <option value="claim">{t('⚖️ Kritiske Påstande', '⚖️ Critical Claims')}</option>
              <option value="verified">{t('✅ Kun Verificeret Evidens', '✅ Verified Evidence Only')}</option>
            </select>
          </div>

          {/* Significance Filter */}
          <div>
            <select
              value={selectedSignificance}
              onChange={(e) => setSelectedSignificance(e.target.value)}
              aria-label={t('Vælg evidensgrad', 'Select evidence significance')}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">{t('Al Evidensgrad', 'All Significance')}</option>
              <option value="critical">🔴 {t('Kritisk / Højeste prioritet', 'Critical Priority')}</option>
              <option value="high">🟠 {t('Væsentlig / Høj', 'High Significance')}</option>
              <option value="medium">🟡 {t('Supplerende', 'Medium Significance')}</option>
            </select>
          </div>
        </div>

        {/* Quick Year Pill Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono font-bold text-zinc-400 mr-1">
            {t('Hurtigvalg År:', 'Quick Year:')}
          </span>
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {t('Alle', 'All')}
          </button>
          {availableYears.map((yr) => (
            <button
              key={`pill-${yr}`}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                selectedYear === yr
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* D3 Evidence Frequency & Activity Surge Visualization */}
      <AnimatePresence>
        {showD3FrequencyChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <EvidenceFrequencyTimelineD3
              documents={documents}
              timelineEvents={timelineEvents}
              transcripts={transcripts}
              claims={claims}
              onSelectDocument={onSelectDocument}
              onSelectDateRange={(startDate, endDate) => {
                const yearPrefix = startDate.substring(0, 4);
                if (yearPrefix) {
                  setSelectedYear(yearPrefix);
                }
              }}
              onAskAIWithPeriod={(periodLabel, count, topSnippets) => {
                if (onAskAIWithEvent) {
                  onAskAIWithEvent({
                    id: `ai-period-${Date.now()}`,
                    date: periodLabel,
                    title: `${t('Højaktivitetsperiode Analyse', 'High-Activity Period Analysis')}: ${periodLabel}`,
                    category: 'Meeting',
                    description: `${t('Forespørgsel vedrørende aktivitetsbølge i', 'Inquiry regarding activity surge in')} ${periodLabel} (${count} ${t('akter', 'files')}).\n\nNøgleakter:\n${topSnippets.join('\n')}`,
                    significance: 'critical',
                    verified: true,
                    partyIds: []
                  });
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Events Presentation */}
      {filteredEvents.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            {t('Ingen hændelser matchede dine filtre', 'No events matched your filters')}
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {t('Prøv at rydde søgefeltet eller ændre dine valg for årgang og kildetype.', 'Try clearing the search or changing your year and source filters.')}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedYear('all');
              setSelectedSourceType('all');
              setSelectedSignificance('all');
              setSelectedPartyId('all');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            {t('Nulstil Filtre', 'Reset Filters')}
          </button>
        </div>
      ) : viewMode === 'stream' ? (
        /* STREAM TIMELINE VIEW */
        <div className="relative pl-4 md:pl-8 space-y-6 before:absolute before:inset-0 before:ml-4 md:before:ml-8 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/60 before:via-zinc-800 before:to-zinc-900/20">
          {filteredEvents.map((event, index) => {
            const cross = resolveCrossSourceEvidence(event);
            const isExpanded = expandedEventId === event.id;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
                className="relative flex items-start gap-4 group"
              >
                {/* Timeline node icon */}
                <div className="absolute left-[-21px] md:left-[-17px] mt-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)] z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform" />
                </div>

                {/* Event Card */}
                <div
                  className={`flex-1 bg-zinc-900/90 border rounded-2xl transition-all shadow-md overflow-hidden ${
                    event.significance === 'critical'
                      ? 'border-red-500/40 hover:border-red-500/70 shadow-red-950/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="p-4 md:p-5 space-y-3">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-indigo-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{event.date}</span>
                          {event.time && <span className="text-zinc-500">kl. {event.time}</span>}

                          {event.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.2 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              {t('Verificeret', 'Verified')}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                          {getCategoryIcon(event.category)}
                          <span>{event.title}</span>
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
                          {event.category}
                        </span>
                        {getSignificanceBadge(event.significance)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Excerpt if present */}
                    {event.evidenceExcerpt && (
                      <div className="p-3 rounded-xl bg-zinc-950/70 border-l-2 border-indigo-500 text-xs text-zinc-300 italic">
                        "{event.evidenceExcerpt}"
                      </div>
                    )}

                    {/* Cross-Source Evidence Chips */}
                    <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Linked Documents */}
                        {cross.documents.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => onSelectDocument && onSelectDocument(doc)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-semibold transition-colors cursor-pointer"
                            title={doc.title}
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            <span>{doc.docNumber || doc.id}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </button>
                        ))}

                        {/* Linked Transcripts */}
                        {cross.transcripts.map((tr) => (
                          <button
                            key={tr.id}
                            type="button"
                            onClick={() => onSelectTranscript && onSelectTranscript(tr)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors cursor-pointer"
                            title={tr.text}
                          >
                            <Mic className="w-3.5 h-3.5 text-purple-400" />
                            <span>{tr.speaker}</span>
                          </button>
                        ))}

                        {/* Involved Parties */}
                        {cross.parties.map((pty) => (
                          <span
                            key={pty.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px]"
                          >
                            <Users className="w-3 h-3 text-zinc-400" />
                            <span>{pty.name}</span>
                          </span>
                        ))}
                      </div>

                      {/* AI Investigation Action */}
                      <div className="flex items-center gap-2">
                        {onAskAIWithEvent && (
                          <button
                            type="button"
                            onClick={() => onAskAIWithEvent(event)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Bot className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t('Spørg AI om hændelse', 'Ask AI about event')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* MATRIX HIGH-DENSITY TABLE VIEW */
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">{t('Dato', 'Date')}</th>
                  <th className="py-3 px-4">{t('Kategori', 'Category')}</th>
                  <th className="py-3 px-4">{t('Hændelse & Beskrivelse', 'Title & Summary')}</th>
                  <th className="py-3 px-4">{t('Tilknyttet Evidens', 'Linked Evidence')}</th>
                  <th className="py-3 px-4">{t('Alvorlighed', 'Significance')}</th>
                  <th className="py-3 px-4 text-right">{t('Handling', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredEvents.map((evt) => {
                  const cross = resolveCrossSourceEvidence(evt);
                  return (
                    <tr key={evt.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                        {evt.date}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-300 whitespace-nowrap">
                        {evt.category}
                      </td>
                      <td className="py-3.5 px-4 space-y-1 max-w-md">
                        <div className="font-bold text-white">{evt.title}</div>
                        <div className="text-zinc-400 line-clamp-2">{evt.description}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {cross.documents.map((doc) => (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => onSelectDocument && onSelectDocument(doc)}
                              className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-mono cursor-pointer hover:bg-blue-500/20"
                            >
                              {doc.docNumber || doc.id}
                            </button>
                          ))}
                          {cross.parties.map((p) => (
                            <span key={p.id} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getSignificanceBadge(evt.significance)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {onAskAIWithEvent && (
                          <button
                            type="button"
                            onClick={() => onAskAIWithEvent(evt)}
                            className="p-1.5 rounded-lg bg-emerald-600/15 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 cursor-pointer inline-flex items-center gap-1"
                            title={t('Spørg The Brew AI', 'Ask The Brew AI')}
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

