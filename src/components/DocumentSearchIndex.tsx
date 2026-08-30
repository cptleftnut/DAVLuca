import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Calendar,
  Filter,
  FileText,
  Mic,
  FileSpreadsheet,
  FileCheck,
  Tag,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Shield,
  Layers,
  Sparkles,
  Eye,
  SlidersHorizontal,
  X,
  Building,
  CheckCircle2,
  AlertCircle,
  FileCode
} from 'lucide-react';
import { DocumentFinding, Party } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export interface DocumentSearchIndexProps {
  documents: DocumentFinding[];
  parties?: Party[];
  onSelectDocument?: (doc: DocumentFinding) => void;
  onSelectParty?: (partyId: string) => void;
}

export function DocumentSearchIndex({
  documents,
  parties = [],
  onSelectDocument,
  onSelectParty
}: DocumentSearchIndexProps) {
  const { language, t } = useLanguage();

  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSignificance, setSelectedSignificance] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedParty, setSelectedParty] = useState<string>('all');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'title' | 'significance'>('date_desc');

  // Extract unique document types
  const documentTypes = useMemo(() => {
    const types = new Set<string>();
    documents.forEach(d => {
      if (d.sourceType) types.add(d.sourceType);
      if (d.category) types.add(d.category);
    });
    return Array.from(types).sort();
  }, [documents]);

  // Full-text search and filter logic
  const searchResults = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return documents.filter(doc => {
      // 1. Keyword search (Title, Summary, Excerpt, DocNumber, Author, Category)
      if (q) {
        const inTitle = doc.title?.toLowerCase().includes(q);
        const inSummary = doc.summary?.toLowerCase().includes(q);
        const inExcerpt = doc.excerpt?.toLowerCase().includes(q);
        const inDocNumber = doc.docNumber?.toLowerCase().includes(q);
        const inAuthor = doc.author?.toLowerCase().includes(q);
        const inCategory = doc.category?.toLowerCase().includes(q);
        const inFormat = doc.fileFormat?.toLowerCase().includes(q);

        // Also check if matches party name
        const inParties = doc.partiesInvolved?.some(pid => {
          const p = parties.find(party => party.id === pid);
          return p ? p.name.toLowerCase().includes(q) : pid.toLowerCase().includes(q);
        });

        if (!inTitle && !inSummary && !inExcerpt && !inDocNumber && !inAuthor && !inCategory && !inFormat && !inParties) {
          return false;
        }
      }

      // 2. Document Type / Category Filter
      if (selectedType !== 'all') {
        const matchesType = doc.sourceType === selectedType || doc.category === selectedType;
        if (!matchesType) return false;
      }

      // 3. Significance Filter
      if (selectedSignificance !== 'all' && doc.significance !== selectedSignificance) {
        return false;
      }

      // 4. Party Filter
      if (selectedParty !== 'all' && !doc.partiesInvolved?.includes(selectedParty)) {
        return false;
      }

      // 5. Date Range Filter
      if (startDate && doc.date) {
        if (doc.date < startDate) return false;
      }
      if (endDate && doc.date) {
        if (doc.date > endDate) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'significance') {
        const score = (s: string) => s === 'critical' ? 3 : s === 'noteworthy' ? 2 : 1;
        return score(b.significance) - score(a.significance);
      }
      return 0;
    });
  }, [documents, keyword, selectedType, selectedSignificance, selectedParty, startDate, endDate, sortBy, parties]);

  const clearAllFilters = () => {
    setKeyword('');
    setSelectedType('all');
    setSelectedSignificance('all');
    setStartDate('');
    setEndDate('');
    setSelectedParty('all');
  };

  const hasActiveFilters = keyword || selectedType !== 'all' || selectedSignificance !== 'all' || selectedParty !== 'all' || startDate || endDate;

  const getTypeIcon = (type: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('audio') || lower.includes('m4a') || lower.includes('mp3')) {
      return <Mic className="w-4 h-4 text-amber-400" />;
    }
    if (lower.includes('contract') || lower.includes('aftale') || lower.includes('dom')) {
      return <FileCheck className="w-4 h-4 text-purple-400" />;
    }
    if (lower.includes('report') || lower.includes('fabu') || lower.includes('pdf')) {
      return <FileText className="w-4 h-4 text-cyan-400" />;
    }
    return <FileCode className="w-4 h-4 text-indigo-400" />;
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-amber-400/30 text-amber-200 px-0.5 rounded font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
              {t('Fuldtekstsøgning & Indeks', 'Full-Text Search Index')}
            </span>
            <span className="text-xs text-slate-400">
              • {searchResults.length} / {documents.length} {t('dokumenter fundet', 'documents matching')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            <Search className="w-5 h-5 text-cyan-400" />
            <span>{t('Sagsaktindeks & Dokumentfilter', 'Case Document Index & Filter')}</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
            {t(
              'Lynsøg på tværs af alle indekserede FABU-rapporter, mødereferater, lydbånd, retsakter og tidsintervaller.',
              'Instant search across all indexed FABU reports, meeting notes, audio transcripts, court rulings, and date ranges.'
            )}
          </p>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('Nulstil filtre', 'Clear filters')}</span>
          </button>
        )}
      </div>

      {/* Main Search Input & Dynamic Filter Controls */}
      <div className="space-y-4">
        {/* Full-width Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder={t(
              'Søg i sagsakter efter nøgleord, sagsnummer, FABU, Marsha, Liam, Byret, afgørelse...',
              'Search documents by keyword, case number, FABU, Marsha, Liam, court, decision...'
            )}
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Multi-Dimensional Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Document Type */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              {t('Dokumenttype / Format', 'Document Type')}
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">{t('Alle typer & formater', 'All Types & Formats')}</option>
              <option value="pdf">PDF Rapporter & Akter</option>
              <option value="audio">Lydoptagelser (M4A/MP3)</option>
              <option value="contract">Afgørelser & Retsdomme</option>
              <option value="report">Kommunale Referater & Notater</option>
              <option value="digital">Digitale filer</option>
            </select>
          </div>

          {/* 2. Key Party Filter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              {t('Involveret Part', 'Key Party')}
            </label>
            <select
              value={selectedParty}
              onChange={e => setSelectedParty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">{t('Alle parter', 'All Parties')}</option>
              {parties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Date From */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              {t('Fra dato', 'Start Date')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            />
          </div>

          {/* 4. Date To */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              {t('Til dato', 'End Date')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            />
          </div>

          {/* 5. Sort By */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
              {t('Sortering', 'Sort Order')}
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="date_desc">{t('Nyeste først (2026 → 2022)', 'Date: Newest First')}</option>
              <option value="date_asc">{t('Ældste først (2022 → 2026)', 'Date: Oldest First')}</option>
              <option value="significance">{t('Kritikalitet / Betydning', 'Significance')}</option>
              <option value="title">{t('Dokumenttitel (A-Å)', 'Title (A-Z)')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3 pt-2">
        {searchResults.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-medium text-slate-300">
              {t('Ingen dokumenter matcher dine søgekriterier.', 'No documents match your search criteria.')}
            </p>
            <p className="text-xs text-slate-500">
              {t('Prøv at fjerne filtre eller søge på et bredere emneord.', 'Try clearing filters or searching for broader terms.')}
            </p>
          </div>
        ) : (
          searchResults.map((doc, idx) => {
            const isExpanded = expandedDocId === doc.id;
            const docParties = parties.filter(p => doc.partiesInvolved?.includes(p.id));

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                className={`p-4 md:p-5 rounded-2xl bg-slate-950/80 border transition-all ${
                  doc.significance === 'critical'
                    ? 'border-rose-500/30 hover:border-rose-500/50 bg-rose-950/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getTypeIcon(doc.sourceType)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {doc.docNumber}
                        </span>

                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono flex items-center gap-1 border border-slate-700">
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          {doc.date}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold bg-slate-900 border border-slate-700 text-slate-300">
                          {doc.sourceType}
                        </span>

                        {doc.significance === 'critical' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            {t('Kritisk Betydning', 'Critical')}
                          </span>
                        )}

                        {doc.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {t('Verificeret', 'Verified')}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white hover:text-cyan-300 transition-colors pt-0.5">
                        {highlightMatch(doc.title, keyword)}
                      </h3>

                      <p className="text-xs text-slate-400">
                        {t('Kilde / Forfatter:', 'Source / Author:')}{' '}
                        <span className="text-slate-300 font-medium">{highlightMatch(doc.author, keyword)}</span>
                        {doc.fileSize && ` • ${doc.fileSize}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1 transition-colors cursor-pointer border border-slate-800"
                    >
                      <span>{isExpanded ? t('Luk', 'Close') : t('Læs udskrift / Detaljer', 'Read Excerpt')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Summary / Snippet */}
                <p className="text-xs md:text-sm text-slate-300 mt-3 leading-relaxed">
                  {highlightMatch(doc.summary, keyword)}
                </p>

                {/* Expandable Full Excerpt & Party Signals */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-slate-800/80 space-y-4"
                    >
                      {/* Full Excerpt */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                          {t('Dokumentuddrag / Observationsnotat:', 'Document Excerpt / Observation Note:')}
                        </span>
                        <p className="whitespace-pre-line leading-relaxed">
                          {highlightMatch(doc.excerpt, keyword)}
                        </p>
                      </div>

                      {/* Involved Parties */}
                      {docParties.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3 text-indigo-400" />
                            {t('Tilknyttede Parter:', 'Linked Parties:')}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {docParties.map(p => (
                              <button
                                key={p.id}
                                onClick={() => onSelectParty?.(p.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>{p.name}</span>
                                <span className="text-[10px] text-slate-400">({p.role})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
