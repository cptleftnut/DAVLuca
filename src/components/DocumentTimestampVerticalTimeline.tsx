import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Calendar,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  FolderOpen,
  User,
  Eye,
  Hash,
  FileCheck
} from 'lucide-react';
import { DocumentFinding } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCaseData } from '../contexts/CaseDataContext';

interface ParsedDocumentMarker {
  id: string;
  docId: string;
  docNumber: string;
  title: string;
  dateStr: string;
  parsedYear: number;
  parsedMonth: number;
  parsedDay: number;
  author: string;
  category: string;
  significance: 'routine' | 'noteworthy' | 'critical';
  summary: string;
  excerpt?: string;
  ocrText?: string;
  driveUrl?: string;
  subTimestamps: string[];
  doc: DocumentFinding;
}

export interface DocumentTimestampVerticalTimelineProps {
  documents?: DocumentFinding[];
  onSelectDocument?: (doc: DocumentFinding) => void;
  onOpenDocModal?: (doc: DocumentFinding) => void;
}

export function DocumentTimestampVerticalTimeline({
  documents: propsDocuments,
  onSelectDocument,
  onOpenDocModal
}: DocumentTimestampVerticalTimelineProps) {
  const { language, t } = useLanguage();
  const { documents: contextDocuments } = useCaseData();

  const documents = propsDocuments || contextDocuments || [];

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSignificance, setSelectedSignificance] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [expandedMarkerId, setExpandedMarkerId] = useState<string | null>(null);

  // Parse timestamps from imported documents and map them to chronological visual markers
  const parsedMarkers = useMemo(() => {
    const list: ParsedDocumentMarker[] = [];

    documents.forEach((doc, idx) => {
      const rawDate = doc.date || '2026-01-01';
      let year = 2026;
      let month = 1;
      let day = 1;

      // Match YYYY-MM-DD
      const dateMatch = rawDate.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
      if (dateMatch) {
        year = parseInt(dateMatch[1], 10);
        month = parseInt(dateMatch[2], 10);
        day = parseInt(dateMatch[3], 10);
      }

      // Parse inner timestamps from OCR text or summary
      const innerText = `${doc.summary || ''} ${doc.excerpt || ''} ${doc.ocrText || ''}`;
      const subTimestamps: string[] = [];

      // Regex to find timestamps/dates like 29. maj 2026, 14.02.2026, etc.
      const dateRegex = /\b(\d{1,2}[./-](?:\d{1,2}|[a-zA-ZæøåÆØÅ]+)[./-]\d{2,4})\b/g;
      let match;
      while ((match = dateRegex.exec(innerText)) !== null) {
        if (subTimestamps.length < 4 && !subTimestamps.includes(match[1])) {
          subTimestamps.push(match[1]);
        }
      }

      list.push({
        id: `parsed-marker-${doc.id || idx}`,
        docId: doc.id,
        docNumber: doc.docNumber || `DOC-${idx + 1}`,
        title: doc.title,
        dateStr: rawDate,
        parsedYear: year,
        parsedMonth: month,
        parsedDay: day,
        author: doc.author || 'Lyngby-Taarbæk Kommune',
        category: doc.folderCategory || doc.category || 'Generel Sagsakt',
        significance: (doc.significance as 'routine' | 'noteworthy' | 'critical') || 'routine',
        summary: doc.summary || '',
        excerpt: doc.excerpt || doc.summary || '',
        ocrText: doc.ocrText,
        driveUrl: doc.driveUrl,
        subTimestamps,
        doc
      });
    });

    return list;
  }, [documents]);

  // Unique years & categories
  const years = useMemo(() => {
    const set = new Set<number>();
    parsedMarkers.forEach(m => set.add(m.parsedYear));
    return Array.from(set).sort((a, b) => b - a);
  }, [parsedMarkers]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    parsedMarkers.forEach(m => set.add(m.category));
    return Array.from(set).sort();
  }, [parsedMarkers]);

  // Filter and sort markers
  const filteredMarkers = useMemo(() => {
    return parsedMarkers.filter(m => {
      if (selectedYear !== 'all' && m.parsedYear.toString() !== selectedYear) return false;
      if (selectedSignificance !== 'all' && m.significance !== selectedSignificance) return false;
      if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
      if (onlyCritical && m.significance !== 'critical') return false;

      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesSummary = m.summary.toLowerCase().includes(q);
        const matchesDocNumber = m.docNumber.toLowerCase().includes(q);
        const matchesAuthor = m.author.toLowerCase().includes(q);
        const matchesSub = m.subTimestamps.some(st => st.toLowerCase().includes(q));
        return matchesTitle || matchesSummary || matchesDocNumber || matchesAuthor || matchesSub;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.dateStr).getTime() || 0;
      const timeB = new Date(b.dateStr).getTime() || 0;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [parsedMarkers, selectedYear, selectedSignificance, selectedCategory, onlyCritical, searchTerm, sortOrder]);

  const getSignificanceBadge = (significance: 'routine' | 'noteworthy' | 'critical') => {
    switch (significance) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            {t('Kritisk Mærkedag', 'Critical Marker')}
          </span>
        );
      case 'noteworthy':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t('Vigtig Obs.', 'Important Marker')}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono font-bold uppercase">
            {t('Rutine Akt', 'Routine Filing')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
              <span>{t('Vertikal Dokument-Tidslinje', 'Vertical Document Timestamp Timeline')}</span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {filteredMarkers.length} {t('Aktindslag', 'Entries')}
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            {t('Automatisk udtræk af tidsstempler, journaldatoer og mærkedage direkte fra de importerede sagsakter.', 'Automated extraction of timestamps, journal dates, and milestone markers parsed directly from imported case files.')}
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>{sortOrder === 'asc' ? t('Ældste Først', 'Oldest First') : t('Nyeste Først', 'Newest First')}</span>
          </button>

          <button
            type="button"
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              onlyCritical
                ? 'bg-red-950/80 text-red-300 border-red-500/50 shadow-md shadow-red-600/30 font-bold'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>{t('Kun Kritiske Mærkedage', 'Critical Markers Only')}</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Søg i tidsstempler, akttitler eller journalnr...', 'Search timestamps, titles, or journal numbers...')}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
            />
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase">{t('År:', 'Year:')}</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">{t('Alle År', 'All Years')}</option>
              {years.map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-zinc-400 font-bold uppercase">{t('Kategori:', 'Category:')}</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 max-w-[180px] truncate"
            >
              <option value="all">{t('Alle Kategorier', 'All Categories')}</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Vertical Timeline Connector Spine */}
      {filteredMarkers.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/60 border border-dashed border-zinc-800 rounded-2xl space-y-2">
          <Calendar className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-xs text-zinc-400">{t('Ingen tidsstempler matcher de valgte søgekriterier.', 'No document timestamps match the selected filter criteria.')}</p>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-6 before:absolute before:left-3 md:before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-indigo-500/40 before:to-zinc-800">
          {filteredMarkers.map((marker, idx) => {
            const isExpanded = expandedMarkerId === marker.id;

            return (
              <motion.div
                key={marker.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                className="relative group"
              >
                {/* Visual Node Marker on Spine */}
                <div
                  className={`absolute -left-6 md:-left-10 top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
                    marker.significance === 'critical'
                      ? 'bg-red-950 border-red-500 text-red-400 shadow-red-500/30'
                      : marker.significance === 'noteworthy'
                      ? 'bg-amber-950 border-amber-500 text-amber-400 shadow-amber-500/20'
                      : 'bg-zinc-900 border-indigo-500/60 text-indigo-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${marker.significance === 'critical' ? 'bg-red-400 animate-ping' : 'bg-indigo-400'}`} />
                </div>

                {/* Event Card Container */}
                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/40 transition-all shadow-lg space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Timestamp Pill */}
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {marker.dateStr}
                        </span>

                        {/* Doc Number Badge */}
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 border border-zinc-700">
                          {marker.docNumber}
                        </span>

                        {getSignificanceBadge(marker.significance)}
                      </div>

                      <h3
                        onClick={() => {
                          if (onSelectDocument) onSelectDocument(marker.doc);
                          if (onOpenDocModal) onOpenDocModal(marker.doc);
                        }}
                        className="text-sm font-extrabold text-zinc-100 hover:text-indigo-300 transition-colors cursor-pointer truncate"
                      >
                        {marker.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedMarkerId(isExpanded ? null : marker.id)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`} />
                    </button>
                  </div>

                  {/* Category & Author Row */}
                  <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-zinc-300">
                      <FolderOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      {marker.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      {marker.author}
                    </span>
                  </div>

                  {/* Summary Preview */}
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                    {marker.summary}
                  </p>

                  {/* Sub-Timestamps extracted inside OCR text */}
                  {marker.subTimestamps.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{t('Under-tidsstempler:', 'Sub-timestamps:')}</span>
                      {marker.subTimestamps.map((st, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 font-mono text-[10px]">
                          {st}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expanded Document Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-3 border-t border-zinc-800 space-y-3"
                    >
                      {marker.excerpt && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            {t('Uddrag fra Sagsakt', 'Document Excerpt')}
                          </span>
                          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 italic whitespace-pre-wrap">
                            "{marker.excerpt}"
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectDocument) onSelectDocument(marker.doc);
                            if (onOpenDocModal) onOpenDocModal(marker.doc);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer border border-indigo-400/40"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t('Åbn Fuld Sagsakt Modal', 'Open Full Case Document')}</span>
                        </button>

                        {marker.driveUrl && (
                          <a
                            href={marker.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>Google Drive</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
