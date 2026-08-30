import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  Filter,
  FileText,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Calendar,
  Search,
  ArrowUpDown,
  Layers,
  MapPin,
  DollarSign,
  Mic,
  ShieldAlert,
  Building2,
  Users,
  ExternalLink,
  Tag,
  Share2,
  Eye,
  X,
  Sparkles,
  Download,
  Flame,
  ArrowRight
} from 'lucide-react';
import { TimelineEvent, DocumentFinding, Party } from '../types';
import { Badge, Card, CardContent, Button } from './ui/UIPrimitives';
import { PARTIES_DATA, DOCUMENT_FINDINGS } from '../data/caseData';
import { useLanguage } from '../contexts/LanguageContext';

export interface TimelineProps {
  events: TimelineEvent[];
  documents?: DocumentFinding[];
  parties?: Party[];
  onSelectDocument?: (doc: DocumentFinding) => void;
  onSelectParty?: (party: Party) => void;
}

export function Timeline({
  events,
  documents = DOCUMENT_FINDINGS,
  parties = PARTIES_DATA,
  onSelectDocument,
  onSelectParty
}: TimelineProps) {
  const { language, t } = useLanguage();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSignificance, setFilterSignificance] = useState<string>('all');
  const [filterParty, setFilterParty] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'stream' | 'compact' | 'swimlane'>('stream');
  const [activeModalEvent, setActiveModalEvent] = useState<TimelineEvent | null>(null);

  // Derive unique months for the scrubber
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    events.forEach(e => {
      const ym = e.date.substring(0, 7); // e.g. "2026-02"
      monthSet.add(ym);
    });
    return Array.from(monthSet).sort();
  }, [events]);

  const monthLabelsDa: Record<string, string> = {
    '2026-01': "Jan '26",
    '2026-02': "Feb '26",
    '2026-03': "Mar '26",
    '2026-04': "Apr '26",
    '2026-05': "Maj '26",
    '2026-06': "Jun '26",
    '2026-07': "Jul '26",
    '2026-08': "Aug '26"
  };

  const monthLabelsEn: Record<string, string> = {
    '2026-01': "Jan '26",
    '2026-02': "Feb '26",
    '2026-03': "Mar '26",
    '2026-04': "Apr '26",
    '2026-05': "May '26",
    '2026-06': "Jun '26",
    '2026-07': "Jul '26",
    '2026-08': "Aug '26"
  };

  const categoriesDa: Record<string, string> = {
    'all': 'Alle Kategorier',
    'Financial Transaction': 'Finansiel Transaktion',
    'Meeting': 'Møde & Samtale',
    'Whistleblower Action': 'Whistleblower-indberetning',
    'Regulatory Action': 'Tilsynshandling & Revision',
    'Key Incident': 'Hovedhændelse',
    'Communication': 'E-mail & Korrespondance',
    'Document Filing': 'Dokumentindlevering'
  };

  const categories = [
    'all',
    'Financial Transaction',
    'Meeting',
    'Whistleblower Action',
    'Regulatory Action',
    'Key Incident',
    'Communication',
    'Document Filing'
  ];

  // Filtering & Sorting Logic
  const filteredEvents = useMemo(() => {
    return events
      .filter(evt => {
        const matchesCategory = filterCategory === 'all' || evt.category === filterCategory;
        const matchesSignificance = filterSignificance === 'all' || evt.significance === filterSignificance;
        const matchesParty = filterParty === 'all' || evt.partyIds.includes(filterParty);
        const matchesMonth = selectedMonth === 'all' || evt.date.startsWith(selectedMonth);

        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !searchLower ||
          evt.title.toLowerCase().includes(searchLower) ||
          evt.description.toLowerCase().includes(searchLower) ||
          (evt.location && evt.location.toLowerCase().includes(searchLower)) ||
          (evt.financialAmount && evt.financialAmount.toLowerCase().includes(searchLower)) ||
          (evt.evidenceExcerpt && evt.evidenceExcerpt.toLowerCase().includes(searchLower)) ||
          (evt.tags && evt.tags.some(t => t.toLowerCase().includes(searchLower)));

        return matchesCategory && matchesSignificance && matchesParty && matchesMonth && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time?.split(' ')[0] || '00:00'}`).getTime();
        const dateB = new Date(`${b.date} ${b.time?.split(' ')[0] || '00:00'}`).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [events, filterCategory, filterSignificance, filterParty, selectedMonth, searchTerm, sortOrder]);

  const criticalCount = events.filter(e => e.significance === 'critical').length;
  const highCount = events.filter(e => e.significance === 'high').length;

  const getSourceIcon = (category: string, sourceType?: string) => {
    if (sourceType === 'audio' || category === 'Meeting') return <Mic className="w-4 h-4 text-cyan-400" />;
    if (sourceType === 'wire' || category === 'Financial Transaction') return <DollarSign className="w-4 h-4 text-emerald-400" />;
    if (sourceType === 'regulatory' || category === 'Regulatory Action') return <Building2 className="w-4 h-4 text-purple-400" />;
    if (category === 'Whistleblower Action') return <Flame className="w-4 h-4 text-amber-400" />;
    if (category === 'Communication') return <Share2 className="w-4 h-4 text-indigo-400" />;
    return <FileText className="w-4 h-4 text-indigo-400" />;
  };

  const getSignificanceBadge = (sig: string) => {
    switch (sig) {
      case 'critical':
        return <Badge variant="critical">{t('Kritisk Milepæl', 'Critical Milestone')}</Badge>;
      case 'high':
        return <Badge variant="high">{t('Høj Vigtighed', 'High Significance')}</Badge>;
      case 'medium':
        return <Badge variant="medium">{t('Middel', 'Medium')}</Badge>;
      default:
        return <Badge variant="default">{t('Rutine', 'Routine')}</Badge>;
    }
  };

  const getCategoryLabel = (cat: string) => {
    if (language === 'da') {
      return categoriesDa[cat] || cat;
    }
    return cat;
  };

  return (
    <div className="space-y-6" id="timeline-container">
      {/* Top Header & Analytics Summary */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
                {t('Kronologisk Sagsmaster', 'Chronological Case Master')}
              </span>
              <span className="text-xs text-slate-400">
                • {t('Tværgående Kildeintegration', 'Cross-Source Integration')}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-indigo-400" />
              {t('Hændelseshistorik & Bevistidslinje', 'Incident History & Evidence Timeline')}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {t(
                'Kronologisk syntese der korrelerer bankoverførsler, aflyttede lydoptagelser, tilsynsakter og whistleblower-indberetninger for Lyngby-Taarbæk sagen.',
                'Chronological synthesis correlating bank wire transfers, intercepted audio transcripts, regulatory filings, and whistleblower disclosures for the investigation.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <div className="text-[11px] text-slate-400">{t('Antal Hændelser', 'Total Events')}</div>
              <div className="text-base font-bold font-mono text-white">{events.length}</div>
            </div>
            <div className="bg-slate-950/80 border border-red-500/20 px-3.5 py-2 rounded-xl text-center">
              <div className="text-[11px] text-red-300">{t('Kritiske Højdepunkter', 'Critical Highlights')}</div>
              <div className="text-base font-bold font-mono text-red-400">{criticalCount}</div>
            </div>
            <div className="bg-slate-950/80 border border-amber-500/20 px-3.5 py-2 rounded-xl text-center">
              <div className="text-[11px] text-amber-300">{t('Høj Betydning', 'High Impact')}</div>
              <div className="text-base font-bold font-mono text-amber-400">{highCount}</div>
            </div>
          </div>
        </div>

        {/* Month Scrubber / Timeline Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {t('Tidslinje-vælger (2026 Kronologi)', 'Timeline Scrubber (2026 Chronology)')}
            </span>
            <span className="text-indigo-300 font-mono text-[11px]">
              {selectedMonth === 'all'
                ? t('Viser Alle Måneder', 'Showing All Months')
                : (language === 'da' ? monthLabelsDa[selectedMonth] : monthLabelsEn[selectedMonth]) || selectedMonth}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedMonth === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('Alle Måneder', 'All Months')} ({events.length})
            </button>
            {months.map(m => {
              const count = events.filter(e => e.date.startsWith(m)).length;
              const hasCritical = events.some(e => e.date.startsWith(m) && e.significance === 'critical');
              const label = language === 'da' ? monthLabelsDa[m] : monthLabelsEn[m];
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedMonth === m
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{label || m}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    hasCritical ? 'bg-red-500/30 text-red-300 font-bold' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Control Bar (Search, Filters, View Modes & Sort) */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('Søg i hændelser, beløb, lokationer, citater eller tags...', 'Search events by keyword, location, wire amount, excerpt, or tag...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode & Sort Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('stream')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'stream'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('Detaljeret strømvisning', 'Detailed Stream View')}
              >
                {t('Detaljeret', 'Detailed')}
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'compact'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('Kompakt hændelsesmatrix', 'Compact Incident Matrix')}
              >
                {t('Matrix', 'Matrix')}
              </button>
              <button
                onClick={() => setViewMode('swimlane')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'swimlane'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('Grupperet efter kildekategori', 'Grouped by Source Category')}
              >
                {t('Kategorier', 'Categories')}
              </button>
            </div>

            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>{sortOrder === 'asc' ? t('Ældste først', 'Oldest First') : t('Nyeste først', 'Newest First')}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('Kategori:', 'Category:')}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden md:block" />

          {/* Party Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs font-medium">{t('Part:', 'Party:')}</span>
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">{t('Alle Parter', 'All Parties')}</option>
              {parties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Significance Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs font-medium">{t('Vigtighed:', 'Significance:')}</span>
            <select
              value={filterSignificance}
              onChange={(e) => setFilterSignificance(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">{t('Alle Niveauer', 'All Levels')}</option>
              <option value="critical">{t('Kritisk', 'Critical')}</option>
              <option value="high">{t('Høj', 'High')}</option>
              <option value="medium">{t('Middel', 'Medium')}</option>
            </select>
          </div>

          {(filterCategory !== 'all' || filterSignificance !== 'all' || filterParty !== 'all' || selectedMonth !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterSignificance('all');
                setFilterParty('all');
                setSelectedMonth('all');
                setSearchTerm('');
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline ml-auto cursor-pointer"
            >
              {t('Nulstil Filtre', 'Reset Filters')}
            </button>
          )}
        </div>
      </div>

      {/* Main Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          {t('Viser', 'Showing')} <strong className="text-white font-mono">{filteredEvents.length}</strong> {t('tidslinjehændelser', 'timeline incidents')}
        </span>
        {selectedMonth !== 'all' && (
          <span>
            {t('Filtreret måned:', 'Filtering month:')}{' '}
            <strong className="text-indigo-300">
              {(language === 'da' ? monthLabelsDa[selectedMonth] : monthLabelsEn[selectedMonth]) || selectedMonth}
            </strong>
          </span>
        )}
      </div>

      {/* VIEW MODE: DETAILED STREAM */}
      {viewMode === 'stream' && (
        <div className="relative pl-6 md:pl-8 border-l-2 border-indigo-500/30 space-y-6">
          {filteredEvents.map((evt, idx) => {
            const linkedDoc = documents.find(d => d.id === evt.sourceDocId);
            const involvedParties = parties.filter(p => evt.partyIds.includes(p.id));
            const isCritical = evt.significance === 'critical';

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(idx * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
                className="relative group"
              >
                {/* Timeline Connector Dot */}
                <div
                  className={`absolute -left-[31px] md:-left-[39px] top-3 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                    isCritical
                      ? 'bg-red-950 border-red-500 shadow-lg shadow-red-500/40 group-hover:scale-125'
                      : 'bg-slate-900 border-indigo-500 group-hover:scale-125 group-hover:bg-indigo-500'
                  }`}
                >
                  {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                </div>

                <Card
                  className={`transition-all duration-200 hover:shadow-xl ${
                    isCritical
                      ? 'border-red-500/40 bg-slate-950/90 hover:border-red-400'
                      : 'border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <CardContent className="p-5 md:p-6 space-y-4">
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {evt.date}
                          {evt.time && <span className="text-slate-400 font-normal">| {evt.time}</span>}
                        </span>

                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                          {getSourceIcon(evt.category, evt.sourceType)}
                          {getCategoryLabel(evt.category)}
                        </span>

                        {getSignificanceBadge(evt.significance)}

                        {evt.verified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('Verificeret Bevis', 'Verified Evidence')}
                          </span>
                        )}
                      </div>

                      {/* Action Button to inspect */}
                      <button
                        onClick={() => setActiveModalEvent(evt)}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-indigo-500/20"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {t('Inspicer Dossier', 'Inspect Dossier')}
                      </button>
                    </div>

                    {/* Main Title & Description */}
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {evt.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed mt-2">
                        {evt.description}
                      </p>
                    </div>

                    {/* Highlights Row: Location, Amount & Involved Parties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {evt.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>{t('Lokation:', 'Location:')} <strong className="text-slate-200">{evt.location}</strong></span>
                        </div>
                      )}

                      {evt.financialAmount && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold bg-emerald-950/30 px-2.5 py-1 rounded border border-emerald-500/20 w-fit">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{t('Beløb:', 'Amount:')} {evt.financialAmount}</span>
                        </div>
                      )}
                    </div>

                    {/* Involved Parties Chips */}
                    {involvedParties.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-400" />
                          {t('Parter:', 'Parties:')}
                        </span>
                        {involvedParties.map(party => (
                          <button
                            key={party.id}
                            onClick={() => onSelectParty && onSelectParty(party)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 hover:border-indigo-500 text-xs text-slate-200 transition-colors cursor-pointer"
                          >
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="font-semibold">{party.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({party.role.split(' ')[0]})</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Verbatim Evidence Excerpt / Quote Callout */}
                    {(evt.evidenceExcerpt || linkedDoc?.excerpt) && (
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-indigo-300 font-medium">
                          <span className="flex items-center gap-1.5 font-mono text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            {linkedDoc ? `${t('Koblet Fund', 'Linked Finding')} (${linkedDoc.docNumber}): ${linkedDoc.title}` : t('Dokumentuddrag / Citat', 'Verbatim Evidentiary Excerpt')}
                          </span>
                          {linkedDoc && (
                            <button
                              onClick={() => onSelectDocument && onSelectDocument(linkedDoc)}
                              className="text-[11px] text-indigo-400 hover:text-indigo-200 underline flex items-center gap-1 cursor-pointer"
                            >
                              {t('Åbn Dokument', 'Open Doc')} <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="italic text-slate-300 border-l-2 border-indigo-500 pl-2.5 my-1">
                          "{evt.evidenceExcerpt || linkedDoc?.excerpt}"
                        </p>
                      </div>
                    )}

                    {/* Tags Footer */}
                    {evt.tags && evt.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {evt.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            <Tag className="w-2.5 h-2.5 text-indigo-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE: COMPACT MATRIX */}
      {viewMode === 'compact' && (
        <Card className="border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">{t('Dato & Tid', 'Date & Time')}</th>
                  <th className="p-3.5">{t('Kilde / Type', 'Source / Type')}</th>
                  <th className="p-3.5">{t('Hændelsestitel & Detaljer', 'Incident Title & Details')}</th>
                  <th className="p-3.5">{t('Involverede Parter', 'Parties Involved')}</th>
                  <th className="p-3.5">{t('Betydning', 'Significance')}</th>
                  <th className="p-3.5 text-right">{t('Handling', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEvents.map((evt, idx) => {
                  const involvedParties = parties.filter(p => evt.partyIds.includes(p.id));
                  return (
                    <motion.tr
                      key={evt.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.2), ease: "easeOut" }}
                      className="hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="p-3.5 whitespace-nowrap font-mono font-medium text-indigo-300">
                        {evt.date}
                        {evt.time && <div className="text-[10px] text-slate-500">{evt.time}</div>}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                          {getSourceIcon(evt.category, evt.sourceType)}
                          {getCategoryLabel(evt.category)}
                        </div>
                        {evt.location && <div className="text-[10px] text-slate-400">{evt.location}</div>}
                      </td>

                      <td className="p-3.5 max-w-md">
                        <div className="font-bold text-white text-sm">{evt.title}</div>
                        <div className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{evt.description}</div>
                        {evt.financialAmount && (
                          <span className="inline-block mt-1 font-mono text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {evt.financialAmount}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {involvedParties.map(p => (
                            <span key={p.id} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300">
                              {p.name.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {getSignificanceBadge(evt.significance)}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveModalEvent(evt)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                          {t('Inspicer', 'Inspect')}
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VIEW MODE: SWIMLANE / CATEGORY GROUPED */}
      {viewMode === 'swimlane' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.filter(c => c !== 'all').map(cat => {
            const catEvents = filteredEvents.filter(e => e.category === cat);
            if (catEvents.length === 0) return null;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-slate-800 flex flex-col justify-between h-full">
                  <div>
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        {getSourceIcon(cat)}
                        {getCategoryLabel(cat)}
                      </h4>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {catEvents.length} {t('hændelser', 'events')}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {catEvents.map(evt => (
                        <div
                          key={evt.id}
                          onClick={() => setActiveModalEvent(evt)}
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-indigo-300">{evt.date}</span>
                            {getSignificanceBadge(evt.significance)}
                          </div>
                          <div className="font-semibold text-white text-xs">{evt.title}</div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{evt.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-500" />
          <h4 className="text-base font-bold text-white">{t('Ingen Matchende Hændelser Fundet', 'No Matching Incidents Found')}</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {t('Ingen kronologiske sagsbegivenheder matcher dine valgte filtre. Prøv at rydde søgningen eller vælg "Alle Måneder".', 'No chronological case events match your current filter parameters. Try clearing the search query or selecting "All Months".')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterCategory('all');
              setFilterSignificance('all');
              setFilterParty('all');
              setSelectedMonth('all');
              setSearchTerm('');
            }}
          >
            {t('Nulstil Filtre', 'Clear Filters')}
          </Button>
        </div>
      )}

      {/* Detailed Event Dossier Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                  {activeModalEvent.id.toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-white">
                  {t('Kronologisk Hændelsesinspektion', 'Chronological Incident Inspection')}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-indigo-300 font-bold bg-indigo-500/10 px-2.5 py-1 rounded">
                    {activeModalEvent.date} {activeModalEvent.time && `• ${activeModalEvent.time}`}
                  </span>
                  <Badge variant={activeModalEvent.significance === 'critical' ? 'critical' : 'indigo'}>
                    {getCategoryLabel(activeModalEvent.category)}
                  </Badge>
                  {activeModalEvent.verified && (
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('Chain of Custody Verificeret', 'Chain of Custody Confirmed')}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-white">
                  {activeModalEvent.title}
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed mt-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  {activeModalEvent.description}
                </p>
              </div>

              {/* Metrics / Location / Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {activeModalEvent.location && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block mb-1">{t('Lokation for hændelse:', 'Incident Location:')}</span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {activeModalEvent.location}
                    </span>
                  </div>
                )}

                {activeModalEvent.financialAmount && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <span className="text-emerald-300 block mb-1">{t('Finansielt Omfang:', 'Financial Quantum:')}</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {activeModalEvent.financialAmount}
                    </span>
                  </div>
                )}
              </div>

              {/* Verbatim Excerpt */}
              {activeModalEvent.evidenceExcerpt && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('Bevismæssigt Uddrag / Citat', 'Evidentiary Record Excerpt')}
                  </span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 text-xs italic text-indigo-200 leading-relaxed">
                    "{activeModalEvent.evidenceExcerpt}"
                  </div>
                </div>
              )}

              {/* Associated Parties */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('Forbundne Parter til denne Milepæl', 'Parties Connected to this Milestone')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {parties.filter(p => activeModalEvent.partyIds.includes(p.id)).map(p => (
                    <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        <div className="text-[11px] text-slate-400">{p.role}</div>
                      </div>
                      <Badge variant={p.riskLevel === 'critical' ? 'critical' : 'high'}>
                        {p.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corroborating Citations */}
              {activeModalEvent.corroboratedBy && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-slate-400 font-semibold">{t('Understøttende Referencer:', 'Corroborating References:')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalEvent.corroboratedBy.map((ref, idx) => (
                      <span key={idx} className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {t('Lyngby-Taarbæk Sagen • Bevismateriale', 'Case CAS-2026-0842X • Evidentiary Archive')}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveModalEvent(null)}
              >
                {t('Luk Inspektion', 'Done Inspecting')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
