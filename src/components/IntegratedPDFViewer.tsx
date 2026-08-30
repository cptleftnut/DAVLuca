import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Highlighter,
  Tag,
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Sparkles,
  Trash2,
  Check,
  Plus,
  X,
  Scale,
  Copy,
  Printer,
  Download,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Eye,
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { DocumentFinding, OCRAnnotation, Party, TimelineEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useCaseData } from '../contexts/CaseDataContext';
import { Card, Badge, Button } from './ui/UIPrimitives';

export interface IntegratedPDFViewerProps {
  document: DocumentFinding;
  allDocuments?: DocumentFinding[];
  onSelectDocument?: (doc: DocumentFinding) => void;
  onSelectParty?: (partyId: string) => void;
  onJumpToTimelineDate?: (dateOrId: string) => void;
  onAskAIWithDoc?: (doc: DocumentFinding) => void;
  onCloseViewer?: () => void;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; labelDa: string; labelEn: string; ring: string }> = {
  yellow: {
    bg: 'bg-amber-400/30',
    text: 'text-amber-200',
    border: 'border-amber-400/60',
    ring: 'ring-amber-400',
    labelDa: 'Gul (Vigtig Fremhævelse)',
    labelEn: 'Yellow (Key Highlight)'
  },
  red: {
    bg: 'bg-red-500/30',
    text: 'text-red-200',
    border: 'border-red-500/60',
    ring: 'ring-red-400',
    labelDa: 'Rød (Kritisk Anomali / Uoverensstemmelse)',
    labelEn: 'Red (Critical Discrepancy)'
  },
  green: {
    bg: 'bg-emerald-500/30',
    text: 'text-emerald-200',
    border: 'border-emerald-500/60',
    ring: 'ring-emerald-400',
    labelDa: 'Grøn (Frikendende Bevis)',
    labelEn: 'Green (Exculpatory Evidence)'
  },
  blue: {
    bg: 'bg-blue-500/30',
    text: 'text-blue-200',
    border: 'border-blue-500/60',
    ring: 'ring-blue-400',
    labelDa: 'Blå (Procedurefejl / Officialprincip)',
    labelEn: 'Blue (Due Process Violation)'
  },
  purple: {
    bg: 'bg-purple-500/30',
    text: 'text-purple-200',
    border: 'border-purple-500/60',
    ring: 'ring-purple-400',
    labelDa: 'Lilla (Kildekritik / Udsagn)',
    labelEn: 'Purple (Source Critique)'
  },
  amber: {
    bg: 'bg-orange-500/30',
    text: 'text-orange-200',
    border: 'border-orange-500/60',
    ring: 'ring-orange-400',
    labelDa: 'Orange (Hanlon\'s Razor / Systemfejl)',
    labelEn: 'Orange (Hanlon\'s Razor)'
  }
};

const BREW_STEPS = [
  { id: 'Trin 1: Anti-Bias', label: 'Trin 1: Anti-Confirmation Bias' },
  { id: 'Trin 2: Kronologi', label: 'Trin 2: Kronologisk Kortlægning' },
  { id: 'Trin 3: Hanlon\'s Razor', label: 'Trin 3: Hanlon\'s Razor (Systemfejl)' },
  { id: 'Trin 4: Kildekritik', label: 'Trin 4: Kilde- & Ekspertkritik' },
  { id: 'Trin 5: OSINT', label: 'Trin 5: Datadrevet Efterforskning' },
  { id: 'Trin 6: Signal vs Støj', label: 'Trin 6: Adskillelse af Signal & Støj' },
  { id: 'Trin 7: Jordbunden Konklusion', label: 'Trin 7: Den Jordbundne Konklusion' },
  { id: 'Trin 8: Moralsk Anker', label: 'Trin 8: Det Større Perspektiv' }
];

const PRESET_TAGS = [
  'Anomali',
  'FABU-Observation',
  'Autisme-Bevis',
  'Negativ-Urintest',
  'Undskyldning-Slettet',
  'Officialprincip',
  'Procedurefejl',
  'EMK-Art8',
  'Mørklægning',
  'Kildekritik',
  'Dokumentfalsk',
  'FalskMisbrug'
];

export function IntegratedPDFViewer({
  document: doc,
  allDocuments = [],
  onSelectDocument,
  onSelectParty,
  onJumpToTimelineDate,
  onAskAIWithDoc,
  onCloseViewer
}: IntegratedPDFViewerProps) {
  const { language, t } = useLanguage();
  const { parties, timelineEvents, updateDocument } = useCaseData();

  // Document Reading Canvas State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [inDocSearchQuery, setInDocSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const paperRef = useRef<HTMLDivElement | null>(null);

  // Annotator Popover Form State
  const [selectedText, setSelectedText] = useState<string>('');
  const [isAnnotatorOpen, setIsAnnotatorOpen] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'red' | 'green' | 'blue' | 'purple' | 'amber'>('yellow');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedStep, setSelectedStep] = useState<string>('Trin 6: Signal vs Støj');
  const [activeTags, setActiveTags] = useState<string[]>(['Anomali']);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [investigatorComment, setInvestigatorComment] = useState<string>('');
  const [investigatorFlag, setInvestigatorFlag] = useState<'verified' | 'suspicious' | 'follow_up' | 'unconfirmed'>('suspicious');

  // Annotation Sidebar Filters
  const [filterParty, setFilterParty] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterStep, setFilterStep] = useState<string>('all');
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reset page when document changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedText('');
    setIsAnnotatorOpen(false);
  }, [doc.id]);

  const annotations = useMemo(() => {
    return doc.ocrAnnotations || [];
  }, [doc.ocrAnnotations]);

  // Full page text construction / simulation
  const fullDocumentText = useMemo(() => {
    if (doc.ocrText && doc.ocrText.trim().length > 0) return doc.ocrText;
    if (doc.fullContent && doc.fullContent.trim().length > 0) return doc.fullContent;

    return `================================================================================
DOKUMENT IDENTIFIKATION: ${doc.docNumber || doc.id}
SAG: Lyngby-Taarbæk Kommune // Familieafdelingen // Aktindsigt: Luca & Liam
JOURNALDATO: ${doc.date}
OFFICIEL UDFÆRDIGER: ${doc.author}
KATEGORI / TYPE: ${(doc.folderCategory || doc.category || doc.sourceType || 'Sagsakt').toUpperCase()}
STATUSAFTALE: VERIFICERET AF BREW METHOD FORENSIC TEAM
================================================================================

§ 1. OFFICIELE SAGSNOTATER OG FORVALTNINGSRESUMÉ
${doc.summary || 'Ingen officiel sagsfremstilling registreret i akten.'}

§ 2. DOKUMENTERET CITAT OG AKTINDSIGTUDDRAG
${doc.excerpt || 'Ingen særskilte udtræk registreret i denne akt.'}

§ 3. PROTOKOLLAT FOR BEVISINDSAMLING & OBSERVATIONER
Dette aktstykke er forankret i den samlede sagsfremstilling og underkastet kildekritisk prøvelse.
Involverede nøgleaktører i dokumentet: ${doc.partiesInvolved?.join(', ') || 'Luca, Dav, Louise'}.
Dokumentets indhold er krydsvalideret over for den etablerede tidslinje for forvaltningshandlinger i Lyngby-Taarbæk Kommune (2022-2026).

§ 4. ANALYSE AF UOVERENSSTEMMELSER (THE BREW METHOD)
Evt. uoverensstemmelser mellem dette aktstykke og eksterne registreringer (fx FABU samværsnotater, lægefaglige vurderinger eller urintest-dokumentation) registreres automatisk i sagens afvigelsesmatrix.
================================================================================`;
  }, [doc]);

  // Generate multi-page view chunks
  const pages = useMemo(() => {
    const paragraphs = fullDocumentText.split('\n\n');
    const totalPar = paragraphs.length;
    if (totalPar <= 3) {
      return [
        {
          pageNumber: 1,
          sectionTitle: t('Officiel Sagsakt & Aktindsigtsresumé', 'Official Case Filing & Executive Brief'),
          text: fullDocumentText
        }
      ];
    }

    const half = Math.ceil(totalPar / 2);
    const page1Text = paragraphs.slice(0, half).join('\n\n');
    const page2Text = paragraphs.slice(half).join('\n\n');

    return [
      {
        pageNumber: 1,
        sectionTitle: t('Side 1: Sagsidentifikation & Hovednotater', 'Page 1: Case Header & Core Findings'),
        text: page1Text
      },
      {
        pageNumber: 2,
        sectionTitle: t('Side 2: Observationalia & Kildekritisk Prøvelse', 'Page 2: Observations & Source Critique'),
        text: page2Text
      }
    ];
  }, [fullDocumentText, t]);

  const totalPages = pages.length;

  // Handle text selection on paper container
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (text.length >= 3) {
      setSelectedText(text);
      setIsAnnotatorOpen(true);
    }
  };

  // Toggle tag selection
  const handleToggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(prev => prev.filter(t => t !== tag));
    } else {
      setActiveTags(prev => [...prev, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const clean = customTagInput.trim().replace(/^#/, '');
    if (!activeTags.includes(clean)) {
      setActiveTags(prev => [...prev, clean]);
    }
    setCustomTagInput('');
  };

  // Save new annotation to document
  const handleSaveAnnotation = () => {
    if (!selectedText.trim()) return;

    const matchedParty = parties.find(p => p.id === selectedPartyId);
    const matchedEvent = timelineEvents.find(e => e.id === selectedEventId);

    const newAnnotation: OCRAnnotation = {
      id: `pdf-annot-${Date.now()}`,
      docId: doc.id,
      selectedText: selectedText.trim(),
      pageNumber: currentPage,
      createdAt: new Date().toISOString().split('T')[0],
      color: selectedColor,
      tags: activeTags,
      linkedPartyId: selectedPartyId || undefined,
      linkedPartyName: matchedParty?.name || undefined,
      linkedEventId: selectedEventId || undefined,
      linkedEventTitle: matchedEvent ? `${matchedEvent.date}: ${matchedEvent.title}` : undefined,
      comment: investigatorComment.trim() || undefined,
      stepTag: selectedStep,
      investigatorFlag: investigatorFlag
    };

    const updatedAnnotations = [...annotations, newAnnotation];

    updateDocument(
      doc.id,
      { ocrAnnotations: updatedAnnotations },
      `Forensisk PDF-fremhævning oprettet: "${selectedText.slice(0, 35)}..."`,
      'Graverjournalist'
    );

    setSelectedText('');
    setInvestigatorComment('');
    setIsAnnotatorOpen(false);
    setActiveAnnotationId(newAnnotation.id);
  };

  // Delete annotation
  const handleDeleteAnnotation = (annotId: string) => {
    const updated = annotations.filter(a => a.id !== annotId);
    updateDocument(
      doc.id,
      { ocrAnnotations: updated },
      'PDF-fremhævning slettet.',
      'Graverjournalist'
    );
  };

  const handleCopyQuote = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered annotations list
  const filteredAnnotations = useMemo(() => {
    return annotations.filter(a => {
      if (filterParty !== 'all' && a.linkedPartyId !== filterParty) return false;
      if (filterTag !== 'all' && !a.tags?.includes(filterTag)) return false;
      if (filterStep !== 'all' && a.stepTag !== filterStep) return false;
      return true;
    });
  }, [annotations, filterParty, filterTag, filterStep]);

  // Render current page text with highlighted annotations + search term highlights
  const renderedPageContent = useMemo(() => {
    const currentPageData = pages[currentPage - 1] || pages[0];
    let rawText = currentPageData.text;

    if (!rawText) return <span>{t('Ingen tekst tilgængelig.', 'No text available.')}</span>;

    // Collect all terms to highlight:
    // 1. Saved annotations
    // 2. In-document search query (if any)
    const sortedAnnots = [...annotations].sort((a, b) => b.selectedText.length - a.selectedText.length);

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const patterns: { pattern: string; type: 'annotation' | 'search'; annot?: OCRAnnotation }[] = [];

    if (inDocSearchQuery.trim().length >= 2) {
      patterns.push({
        pattern: escapeRegex(inDocSearchQuery.trim()),
        type: 'search'
      });
    }

    sortedAnnots.forEach(a => {
      const clean = a.selectedText.trim();
      if (clean.length > 0) {
        patterns.push({
          pattern: escapeRegex(clean),
          type: 'annotation',
          annot: a
        });
      }
    });

    if (patterns.length === 0) {
      return <span>{rawText}</span>;
    }

    // Build unified regex
    const combinedRegex = new RegExp(`(${patterns.map(p => p.pattern).join('|')})`, 'gi');
    const parts = rawText.split(combinedRegex);

    return parts.map((part, idx) => {
      const lowerPart = part.toLowerCase();

      // Check if matches search
      if (inDocSearchQuery.trim() && lowerPart === inDocSearchQuery.trim().toLowerCase()) {
        return (
          <mark
            key={idx}
            className="bg-amber-400 text-zinc-950 font-extrabold px-1 py-0.5 rounded shadow-sm inline-block mx-0.5"
          >
            {part}
          </mark>
        );
      }

      // Check if matches an annotation
      const matchedAnnot = sortedAnnots.find(
        a => a.selectedText.trim().toLowerCase() === lowerPart
      );

      if (matchedAnnot) {
        const colorStyles = COLOR_MAP[matchedAnnot.color || 'yellow'] || COLOR_MAP.yellow;
        const isSelected = activeAnnotationId === matchedAnnot.id;

        return (
          <mark
            key={idx}
            onClick={() => setActiveAnnotationId(matchedAnnot.id)}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition-all inline-block ${colorStyles.bg} ${colorStyles.text} border-b-2 ${colorStyles.border} font-semibold ${
              isSelected ? `ring-2 ${colorStyles.ring} shadow-md` : 'hover:brightness-125'
            }`}
            title={`Fremhævelse: ${matchedAnnot.tags?.join(', ') || 'Note'} | Klik for at se detaljer`}
          >
            {part}
          </mark>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  }, [pages, currentPage, annotations, inDocSearchQuery, activeAnnotationId, t]);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[820px]'
    }`}>
      
      {/* 1. TOP CONTROL TOOLBAR */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Document Selector & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 font-bold">
            <FileText className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 shrink-0">
                {doc.docNumber || doc.id}
              </span>
              
              {allDocuments.length > 1 ? (
                <select
                  value={doc.id}
                  onChange={(e) => {
                    const target = allDocuments.find(d => d.id === e.target.value);
                    if (target && onSelectDocument) onSelectDocument(target);
                  }}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 max-w-[280px] sm:max-w-[400px] truncate cursor-pointer"
                >
                  {allDocuments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.docNumber ? `[${d.docNumber}] ` : ''}{d.title}
                    </option>
                  ))}
                </select>
              ) : (
                <h3 className="text-sm font-bold text-white truncate max-w-[280px] sm:max-w-[420px]">
                  {doc.title}
                </h3>
              )}
            </div>

            <p className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
              <span>{doc.date}</span>
              <span>•</span>
              <span>{doc.author}</span>
              <span>•</span>
              <span className="text-indigo-300 font-medium">
                {doc.folderCategory || doc.category}
              </span>
            </p>
          </div>
        </div>

        {/* Reader Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Search inside PDF */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={t('Søg i PDF-akt...', 'Search inside PDF...')}
              value={inDocSearchQuery}
              onChange={(e) => setInDocSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-32 sm:w-44 shadow-inner"
            />
            {inDocSearchQuery && (
              <button
                onClick={() => setInDocSearchQuery('')}
                className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Page Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 gap-1.5 font-mono">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel(z => Math.max(z - 15, 65))}
              title={t('Zoom Ud', 'Zoom Out')}
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(z + 15, 175))}
              title={t('Zoom Ind', 'Zoom In')}
              className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Executive Summary */}
          {onAskAIWithDoc && (
            <Button
              onClick={() => onAskAIWithDoc(doc)}
              className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs py-1.5 px-2.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">{t('Brew Resumé', 'AI Summary')}</span>
            </Button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? t('Formindsk', 'Restore') : t('Fuldskærm', 'Fullscreen')}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Viewer */}
          {onCloseViewer && (
            <button
              onClick={onCloseViewer}
              title={t('Luk Læser', 'Close Viewer')}
              className="p-1.5 bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN VIEWER CONTENT AREA */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-y-auto bg-slate-950/70 p-4 sm:p-6 gap-6">
        
        {/* LEFT / CENTER: PDF PAPER CANVAS & TEXT SELECTION */}
        <div className="xl:col-span-8 flex flex-col items-center space-y-4">
          
          {/* Active Text Selection Popover Bar */}
          {isAnnotatorOpen && (
            <div className="w-full max-w-[780px] bg-slate-900 border-2 border-indigo-500 p-4 rounded-2xl shadow-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Highlighter className="w-4 h-4" />
                  <span>{t('Opret Ny Forensisk Fremhævning', 'Create New Forensic Annotation')}</span>
                </div>
                <button
                  onClick={() => setIsAnnotatorOpen(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quoted Selection */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 block mb-1">
                  {t('Markeret Tekstcitat:', 'Selected Quote:')}
                </span>
                <p className="text-xs font-serif italic text-slate-100">
                  "{selectedText}"
                </p>
              </div>

              {/* Color Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  {t('1. Farve- & Betydningskategori:', '1. Color & Meaning Category:')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(COLOR_MAP).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedColor(key as any)}
                      className={`px-2.5 py-1.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                        selectedColor === key
                          ? `${val.bg} ${val.border} text-white font-bold ring-2 ${val.ring}`
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${val.bg} border ${val.border}`} />
                      <span className="truncate">{language === 'da' ? val.labelDa.split(' ')[0] : val.labelEn.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Entity & Event Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t('2. Kobl til Sagspart:', '2. Link to Case Entity:')}</span>
                  </label>
                  <select
                    value={selectedPartyId}
                    onChange={(e) => setSelectedPartyId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">{t('— Ingen part valgt —', '— No entity —')}</option>
                    {parties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t('3. Kobl til Tidslinje:', '3. Link to Timeline Event:')}</span>
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">{t('— Ingen hændelse valgt —', '— No event —')}</option>
                    {timelineEvents.map(e => (
                      <option key={e.id} value={e.id}>{e.date}: {e.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brew Step & Tags */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('4. Nøgleord & Forensiske Tags:', '4. Forensic Tags:')}</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map(tag => {
                    const isChecked = activeTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder={t('Eget tag (f.eks. #Urinprøve)...', 'Custom tag...')}
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {t('Tilføj', 'Add')}
                  </button>
                </div>
              </div>

              {/* Investigator Note */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  {t('5. Efterforskerens Notat / Juridisk Betydning:', '5. Investigator Note & Significance:')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('Beskriv retslig eller sagsmæssig relevans...', 'Describe legal relevance...')}
                  value={investigatorComment}
                  onChange={(e) => setInvestigatorComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAnnotatorOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  {t('Annuller', 'Cancel')}
                </button>
                <Button
                  onClick={handleSaveAnnotation}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1.5 px-4 rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('Gem Fremhævning & Kobl', 'Save Annotation & Link')}</span>
                </Button>
              </div>
            </div>
          )}

          {/* REALISTIC A4 PAPER CANVAS */}
          <div
            ref={paperRef}
            onMouseUp={handleMouseUp}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-[780px] bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 space-y-6 transition-transform duration-200 border border-slate-300 relative min-h-[960px] select-text font-serif leading-relaxed"
          >
            {/* Header Letterhead */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  Lyngby-Taarbæk Sagsdossier // Aktindsigt & Bevisarkiv
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-950 mt-1 leading-tight">
                  {doc.title}
                </h1>
                <p className="text-xs text-slate-600 mt-1 font-mono">
                  Dok. Nr: <strong className="text-slate-900">{doc.docNumber || doc.id}</strong> | Journaldato: <strong>{doc.date}</strong>
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="inline-block border-2 border-indigo-700 px-3 py-1 text-center rounded">
                  <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-900">
                    AKTINDSIGT VERIFICERET
                  </div>
                  <div className="text-[8px] text-indigo-700 font-mono">
                    THE BREW METHOD
                  </div>
                </div>
              </div>
            </div>

            {/* Confidentiality Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] rotate-[-35deg]">
              <span className="text-8xl font-black font-sans uppercase">
                CONFIDENTIAL DOSSIER
              </span>
            </div>

            {/* Page Section Title */}
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-800 border-b border-indigo-100 pb-1">
              {pages[currentPage - 1]?.sectionTitle} (Side {currentPage} af {totalPages})
            </div>

            {/* Rendered Page Text with Highlights */}
            <div className="text-xs sm:text-sm font-mono leading-relaxed text-slate-800 bg-slate-50/80 p-5 rounded-lg border border-slate-200 shadow-xs whitespace-pre-wrap select-text">
              {renderedPageContent}
            </div>

            {/* Page Footer */}
            <div className="border-t border-slate-300 pt-4 mt-8 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Side {currentPage} af {totalPages}</span>
              <span>The Brew Method Forensisk Sagsdatabase</span>
              <span>Ref: {doc.id}</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: REGISTERED FORENSIC ANNOTATIONS & TAGS */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* Header & Filter Card */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>{t('Registrerede Forensiske Tags', 'Registered Forensic Annotations')}</span>
              </h4>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px]">
                {filteredAnnotations.length} / {annotations.length}
              </Badge>
            </div>

            {/* Party Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('Filtrér efter Part:', 'Filter by Entity:')}
              </label>
              <select
                value={filterParty}
                onChange={(e) => setFilterParty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">{t('Alle Parter', 'All Parties')}</option>
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Step Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('Filtrér efter Analysefase:', 'Filter by Phase:')}
              </label>
              <select
                value={filterStep}
                onChange={(e) => setFilterStep(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">{t('Alle Faser', 'All Phases')}</option>
                {BREW_STEPS.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Annotations Feed */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredAnnotations.length === 0 ? (
              <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-400 space-y-2">
                <Highlighter className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-white">
                  {t('Ingen registrerede fremhævninger endnu', 'No registered annotations yet')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t('Træk musen over en tekstpassage i PDF-dokumentet for at oprette et nyt tag eller link.', 'Highlight text on the PDF paper to create a new tag or link.')}
                </p>
              </div>
            ) : (
              filteredAnnotations.map(annot => {
                const colorInfo = COLOR_MAP[annot.color || 'yellow'] || COLOR_MAP.yellow;
                const isSelected = activeAnnotationId === annot.id;

                return (
                  <div
                    key={annot.id}
                    onClick={() => setActiveAnnotationId(annot.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-md ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500 shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}>
                        {annot.stepTag || 'Trin 6: Signal'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyQuote(annot.selectedText, annot.id);
                          }}
                          title={t('Kopiér Citat', 'Copy Quote')}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
                        >
                          {copiedId === annot.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(annot.id);
                          }}
                          title={t('Slet Fremhævning', 'Delete Annotation')}
                          className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-300 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quoted Text */}
                    <div className={`p-3 rounded-xl text-xs font-serif italic border-l-2 ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}>
                      "{annot.selectedText}"
                    </div>

                    {/* Comment */}
                    {annot.comment && (
                      <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                        {annot.comment}
                      </p>
                    )}

                    {/* Tags */}
                    {annot.tags && annot.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {annot.tags.map((tg, idx) => (
                          <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-indigo-300 border border-slate-800 font-medium">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Entity & Timeline links */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5 text-[11px]">
                      {annot.linkedPartyName && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (annot.linkedPartyId && onSelectParty) onSelectParty(annot.linkedPartyId);
                          }}
                          className="text-left text-indigo-300 hover:text-indigo-200 flex items-center justify-between group cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="truncate">{t('Tilknyttet part:', 'Linked Entity:')} <strong>{annot.linkedPartyName}</strong></span>
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}

                      {annot.linkedEventTitle && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onJumpToTimelineDate) onJumpToTimelineDate(annot.linkedEventTitle.split(':')[0].trim());
                          }}
                          className="text-left text-emerald-300 hover:text-emerald-200 flex items-center justify-between group cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="truncate">{t('Tidslinje:', 'Timeline:')} <strong>{annot.linkedEventTitle}</strong></span>
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
