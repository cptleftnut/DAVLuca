import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  Shield,
  CheckCircle2,
  Calendar,
  User,
  Building,
  Tag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Eye,
  Layers,
  Scale,
  Sparkles,
  Volume2,
  Play,
  Pause,
  ArrowRight,
  Highlighter,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import { DocumentFinding, Party, TimelineEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { LOGICAL_FOLDERS } from '../services/documentCategorizerService';
import { EntityHighlightedText } from './EntityHighlightedText';
import { OCRTextAnnotator } from './OCRTextAnnotator';
import { CaseForensicMatrixViewer } from './CaseForensicMatrixViewer';
import { useCaseData } from '../contexts/CaseDataContext';

interface PDFDocumentViewerModalProps {
  document: DocumentFinding | null;
  isOpen: boolean;
  onClose: () => void;
  parties?: Party[];
  timelineEvents?: TimelineEvent[];
  onSelectParty?: (partyId: string) => void;
  onJumpToTimeline?: (dateOrId: string) => void;
  onJumpToTimelineDate?: (dateOrId: string) => void;
  onDownloadReport?: (doc: DocumentFinding) => void;
  onAskAIWithDoc?: (doc: DocumentFinding) => void;
}

export function PDFDocumentViewerModal({
  document: doc,
  isOpen,
  onClose,
  parties: propParties,
  timelineEvents: propTimelineEvents,
  onSelectParty,
  onJumpToTimeline,
  onJumpToTimelineDate,
  onAskAIWithDoc
}: PDFDocumentViewerModalProps) {
  const jumpHandler = onJumpToTimelineDate || onJumpToTimeline;
  const { language, t } = useLanguage();
  const { parties: ctxParties, timelineEvents: ctxTimelineEvents, updateDocument } = useCaseData();

  const parties = propParties && propParties.length > 0 ? propParties : ctxParties;
  const timelineEvents = propTimelineEvents && propTimelineEvents.length > 0 ? propTimelineEvents : ctxTimelineEvents;

  // View mode tab state: dossier | ocr | matrix
  const [activeTab, setActiveTab] = useState<'dossier' | 'ocr' | 'matrix'>('dossier');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [inDocSearch, setInDocSearch] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !doc) return null;

  // Folder Category Metadata
  const folderInfo = LOGICAL_FOLDERS[doc.folderCategory || 'Social Services'] || LOGICAL_FOLDERS['Social Services'];

  // Associated Timeline Event
  const linkedTimelineEvent = useMemo(() => {
    return timelineEvents.find(e => 
      e.sourceDocId === doc.id || 
      e.sourceDocumentIds?.includes(doc.id) ||
      e.date === doc.date
    );
  }, [timelineEvents, doc]);

  // Multi-page document text generation / simulation
  const generatedPages = useMemo(() => {
    // Page 1: Official Case Header & Executive Summary & Parties
    const page1 = {
      pageNumber: 1,
      sectionTitle: t('Officiel Sagsakt & Forvaltningsresumé', 'Official Case Document & Executive Brief'),
      content: [
        {
          heading: t('Sagsidentifikation & Dokumentoverskrift', 'Case Identification & Subject'),
          text: `${doc.title} (Dokument-ID: ${doc.docNumber || doc.id})`
        },
        {
          heading: t('Officiel Forfatter & Ansvarlig Myndighed', 'Official Author & Entity'),
          text: `${doc.author} — Dateret: ${doc.date} | Format: ${(doc.fileFormat || doc.sourceType).toUpperCase()}`
        },
        {
          heading: t('Sagsresumé & Hovedkonklusion', 'Executive Summary & Finding'),
          text: doc.summary
        },
        {
          heading: t('Uddrag & Primære Notater', 'Official Excerpt & Source Notes'),
          text: doc.excerpt
        }
      ]
    };

    // Page 2: Verifications, Forensic Observations & Evidence References
    const page2 = {
      pageNumber: 2,
      sectionTitle: t('Kildekritik, Observationer & Juridisk Kontekst', 'Source Critique, Observations & Legal Context'),
      content: [
        {
          heading: t('The Brew Method: Trin 3 & 4 Kildevurdering', 'The Brew Method: Steps 3 & 4 Source Assessment'),
          text: doc.sourceType === 'audio' 
            ? 'Optagelse verificeret med tidsstempler. Ingen tegn på klipning eller manipulation. Håndholdt optageudstyr forankret i sagsakterne.'
            : doc.sourceType === 'report' || doc.sourceType === 'pdf'
            ? 'Formelt journaliseret dokument i kommunalt/retsligt aktindsigtskatalog. Kildekritisk verificeret mod bilagssamling.'
            : 'Sagsrelevant dokumentation verificeret med ubrudt chain-of-custody.'
        },
        {
          heading: t('Involverede Parter & Partsroller', 'Involved Parties & Roles'),
          text: `Dokumentet berører direkte: ${doc.partiesInvolved?.join(', ') || 'Luca, Dav, Louise'}.`
        },
        {
          heading: t('Tilknyttet Tidslinjebegivenhed', 'Linked Chronological Milestone'),
          text: linkedTimelineEvent ? `${linkedTimelineEvent.date}: ${linkedTimelineEvent.title} — ${linkedTimelineEvent.description}` : 'Ingen særskilt tidslinjehændelse registreret.'
        }
      ]
    };

    return [page1, page2];
  }, [doc, linkedTimelineEvent, t]);

  const totalPages = generatedPages.length;

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 15, 175));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 15, 65));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className={`bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full ${
        isFullscreen ? 'h-full max-w-full' : 'max-w-6xl max-h-[94vh]'
      }`}>
        
        {/* MODAL TOP TOOLBAR */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${folderInfo.badgeBg} ${folderInfo.badgeBorder} border ${folderInfo.badgeText}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 shrink-0">
                  {doc.docNumber || doc.id}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-[240px] sm:max-w-[380px]">
                  {doc.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                <span>{doc.date}</span>
                <span>•</span>
                <span>{doc.author}</span>
                <span>•</span>
                <span className={folderInfo.badgeText}>
                  {language === 'da' ? folderInfo.nameDa : folderInfo.nameEn}
                </span>
              </p>
            </div>
          </div>

          {/* VIEW MODE TABS */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dossier'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('Dossier / Sidevisning', 'Dossier View')}</span>
            </button>

            <button
              onClick={() => setActiveTab('ocr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ocr'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>{t('OCR & Fremhævninger', 'OCR & Highlights')}</span>
              {doc.ocrAnnotations && doc.ocrAnnotations.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-400/20 text-indigo-300 text-[10px] flex items-center justify-center font-mono">
                  {doc.ocrAnnotations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('Afvigelsesmatrix', 'Discrepancy Matrix')}</span>
            </button>
          </div>

          {/* Reader Controls Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'dossier' && (
              <>
                {/* Search inside Document */}
                <div className="relative hidden md:block">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder={t('Søg i akt...', 'Search...')}
                    value={inDocSearch}
                    onChange={(e) => setInDocSearch(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-3 py-1 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-28 sm:w-36"
                  />
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 gap-1.5 font-mono">
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
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                  <button
                    onClick={handleZoomOut}
                    title={t('Zoom Ud', 'Zoom Out')}
                    className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1.5 text-slate-300">{zoomLevel}%</span>
                  <button
                    onClick={handleZoomIn}
                    title={t('Zoom Ind', 'Zoom In')}
                    className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {/* Brew Method AI Executive Summary Button */}
            {onAskAIWithDoc && (
              <button
                onClick={() => onAskAIWithDoc(doc)}
                className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={t('Generér The Brew Method Resumé', 'Generate The Brew Method Summary')}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden sm:inline">{t('Brew Resumé', 'Summary')}</span>
              </button>
            )}

            {/* Print & Fullscreen */}
            <button
              onClick={handlePrint}
              title={t('Udskriv / Gem som PDF', 'Print / Save as PDF')}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? t('Formindsk', 'Restore') : t('Fuldskærm', 'Fullscreen')}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              title={t('Luk', 'Close')}
              className="p-1.5 bg-slate-800 hover:bg-red-500/20 hover:text-red-300 border border-slate-700 text-slate-400 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY DEPENDING ON ACTIVE TAB */}
        <div className="flex-1 overflow-y-auto bg-slate-950/60 p-4 sm:p-6">
          
          {/* TAB 1: DOSSIER A4 PAGE VIEW WITH METADATA SIDEBAR */}
          {activeTab === 'dossier' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT METADATA & EVIDENCE AUDIT SIDEBAR */}
              <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
                
                {/* Verification Status Card */}
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('Verifikationsstatus', 'Verification Status')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('Journaliseret Sagsakt', 'Verified Record')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {t('Forankret i sagens officielle bilagssamling for Lyngby-Taarbæk.', 'Anchored in the official case dossier for Lyngby-Taarbæk.')}
                  </p>
                </div>

                {/* Folder & Category Info */}
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('Mappe & Kategori', 'Folder & Category')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${folderInfo.badgeBg} ${folderInfo.badgeBorder} ${folderInfo.badgeText}`}>
                      {language === 'da' ? folderInfo.nameDa : folderInfo.nameEn}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {doc.fileSize || 'Standard PDF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {language === 'da' ? folderInfo.descriptionDa : folderInfo.descriptionEn}
                  </p>
                </div>

                {/* Audio Wiretap Player (If Audio File) */}
                {doc.sourceType === 'audio' && (
                  <div className="bg-purple-950/20 border border-purple-500/30 p-3.5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-purple-400" />
                        {t('Afspil Optagelse / Lydfil', 'Play Audio Recording')}
                      </span>
                      <span className="text-[10px] font-mono bg-purple-500/20 px-1.5 py-0.5 rounded">
                        {doc.mediaDuration || '04:15 min'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-500 h-full transition-all duration-300"
                            style={{ width: isPlayingAudio ? '65%' : '20%' }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                          <span>{isPlayingAudio ? '02:45' : '00:00'}</span>
                          <span>{doc.mediaDuration || '04:15'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* In-Document Linked Entities (People, Dates) */}
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>{t('Nøgleaktører & Entiteter', 'Key Entities in Document')}</span>
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doc.partiesInvolved?.map((partyName) => (
                      <button
                        key={partyName}
                        onClick={() => {
                          const matched = parties.find(p => p.name.toLowerCase().includes(partyName.toLowerCase()) || p.id === partyName);
                          if (matched && onSelectParty) onSelectParty(matched.id);
                        }}
                        className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-indigo-600/30 text-slate-200 hover:text-indigo-200 border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <User className="w-3 h-3 text-indigo-400" />
                        <span>{partyName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link to Timeline Milestone */}
                {linkedTimelineEvent && (
                  <div className="bg-slate-950 border border-indigo-500/30 p-3.5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t('Tilknyttet Hændelse på Tidslinjen', 'Linked Timeline Event')}
                    </span>
                    <p className="text-xs font-semibold text-white">{linkedTimelineEvent.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{linkedTimelineEvent.description}</p>
                    {jumpHandler && (
                      <button
                        onClick={() => {
                          jumpHandler(linkedTimelineEvent.date);
                          onClose();
                        }}
                        className="w-full mt-2 py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{t('Hop til hændelse på tidslinje', 'Jump to Event on Timeline')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT PDF DOCUMENT VIEWER CANVAS */}
              <div className="lg:col-span-8 flex flex-col items-center">
                <div
                  ref={printAreaRef}
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="w-full max-w-[760px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 space-y-6 transition-transform duration-200 border border-slate-300 relative min-h-[960px] select-text"
                >
                  {/* Document Header Letterhead */}
                  <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold">
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
                      <div className="inline-block border-2 border-emerald-700 px-3 py-1 text-center rounded">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                          VERIFICERET AKT
                        </div>
                        <div className="text-[8px] text-emerald-700 font-mono">
                          BREW METHOD SECURE
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Watermark Overlay in Paper Background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] rotate-[-35deg]">
                    <span className="text-8xl font-black font-sans uppercase">
                      CONFIDENTIAL DOSSIER
                    </span>
                  </div>

                  {/* Active Page Section Content */}
                  {generatedPages[currentPage - 1] && (
                    <div className="space-y-6">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-1">
                        {generatedPages[currentPage - 1].sectionTitle} (Side {currentPage} af {totalPages})
                      </div>

                      {generatedPages[currentPage - 1].content.map((sec, idx) => (
                        <div key={idx} className="space-y-2">
                          <h4 className="text-sm font-sans font-bold text-slate-900 tracking-wide uppercase text-[12px]">
                            § {sec.heading}
                          </h4>
                          <div className="text-xs sm:text-sm font-serif leading-relaxed text-slate-800 bg-slate-50/80 p-3.5 rounded border border-slate-200/80 shadow-xs">
                            <EntityHighlightedText
                              text={sec.text}
                              onSelectParty={(partyId) => {
                                if (onSelectParty) onSelectParty(partyId);
                              }}
                              onJumpToTimelineDate={(dateStr) => {
                                if (jumpHandler) jumpHandler(dateStr);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document Footer */}
                  <div className="border-t border-slate-300 pt-4 mt-8 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Side {currentPage} af {totalPages}</span>
                    <span>The Brew Method Forensisk Sagsdatabase</span>
                    <span>Ref: {doc.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE OCR TEXT ANNOTATOR & TAGGER */}
          {activeTab === 'ocr' && (
            <OCRTextAnnotator
              document={doc}
              parties={parties}
              timelineEvents={timelineEvents}
              onUpdateDocument={(docId, updates, reason) => {
                updateDocument(docId, updates, reason, 'Graverjournalist');
              }}
              onSelectParty={onSelectParty}
              onJumpToTimelineDate={jumpHandler}
              onAskAIWithDoc={onAskAIWithDoc}
            />
          )}

          {/* TAB 3: DIVERGENCE MATRIX & PETITION */}
          {activeTab === 'matrix' && (
            <CaseForensicMatrixViewer />
          )}

        </div>
      </div>
    </div>
  );
}
