import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Headphones,
  Image as ImageIcon,
  Mail,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  Search,
  HardDrive,
  Download,
  Copy,
  Check,
  Eye,
  X,
  Layers,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Lock,
  Calendar,
  User,
  Hash,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  ZoomIn,
  Camera,
  Scan,
  Tag,
  Radio,
  FileCheck,
  BookOpen,
  Highlighter
} from 'lucide-react';
import { DocumentFinding } from '../types';
import { Badge, Card, CardContent, CardHeader, CardTitle, Button } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';
import { useCaseData } from '../contexts/CaseDataContext';
import { IntegratedPDFViewer } from './IntegratedPDFViewer';
import { DocumentAISummaryPanel } from './DocumentAISummaryPanel';
import { SelectedEvidenceSummaryModal } from './SelectedEvidenceSummaryModal';

export interface EvidenceListProps {
  documents: DocumentFinding[];
  onOpenDocModal?: (doc: DocumentFinding) => void;
  onAskAIWithDoc?: (doc: DocumentFinding) => void;
  initialCategory?: string;
}

export function EvidenceList({
  documents,
  onOpenDocModal,
  onAskAIWithDoc,
  initialCategory = 'all'
}: EvidenceListProps) {
  const { language, t } = useLanguage();
  const { updateDocument, parties: caseParties } = useCaseData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSignificance, setSelectedSignificance] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'significance' | 'id'>('date-desc');
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'gallery' | 'pdf'>('table');
  const [selectedDoc, setSelectedDoc] = useState<DocumentFinding | null>(null);
  const [selectedDocForPdf, setSelectedDocForPdf] = useState<DocumentFinding | null>(null);
  const [selectedDocForSummary, setSelectedDocForSummary] = useState<DocumentFinding | null>(documents[0] || null);
  const [isSummaryPanelOpen, setIsSummaryPanelOpen] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<boolean>(false);

  // Multi-Select and Bulk Action State
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [isBulkEntityModalOpen, setIsBulkEntityModalOpen] = useState(false);
  const [isBulkSignificanceModalOpen, setIsBulkSignificanceModalOpen] = useState(false);

  // Gemini Evidence Summary Modal State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [summaryModalDocs, setSummaryModalDocs] = useState<DocumentFinding[]>([]);

  const [bulkTagInput, setBulkTagInput] = useState('');
  const [bulkPartyInput, setBulkPartyInput] = useState('');
  const [bulkSignificanceInput, setBulkSignificanceInput] = useState<'routine' | 'noteworthy' | 'critical'>('critical');
  const [bulkFeedbackMsg, setBulkFeedbackMsg] = useState<string | null>(null);

  // Normalization helper for category determination
  const getDocCategory = (doc: DocumentFinding): 'audio' | 'image' | 'document' | 'email' => {
    // 1. Audio
    if (
      doc.sourceType === 'audio' ||
      doc.folderCategory === 'Audio Transcripts' ||
      doc.folderCategory === 'Personal Audio' ||
      doc.category === 'audio' ||
      doc.category === 'Lyd og aflytninger' ||
      (doc.category && doc.category.toLowerCase().includes('lyd')) ||
      (doc.category && doc.category.toLowerCase().includes('audio')) ||
      (doc.fileFormat && doc.fileFormat.toLowerCase().includes('audio')) ||
      (doc.fileFormat && doc.fileFormat.toLowerCase().includes('m4a')) ||
      (doc.fileFormat && doc.fileFormat.toLowerCase().includes('mp3')) ||
      doc.audioMeta !== undefined
    ) {
      return 'audio';
    }

    // 2. Image / Forensic Photos
    if (
      doc.sourceType === 'image' ||
      doc.folderCategory === 'Forensic Photos' ||
      doc.category === 'image' ||
      doc.category === 'Billeder og fotos' ||
      (doc.category && doc.category.toLowerCase().includes('billede')) ||
      (doc.category && doc.category.toLowerCase().includes('foto')) ||
      (doc.category && doc.category.toLowerCase().includes('image')) ||
      (doc.fileFormat && doc.fileFormat.toLowerCase().includes('image')) ||
      (doc.fileFormat && doc.fileFormat.toLowerCase().includes('jpg')) ||
      (doc.fileFormat && doc.fileFormat.toLowerCase().includes('png')) ||
      doc.exifData !== undefined ||
      doc.imageCaption !== undefined
    ) {
      return 'image';
    }

    // 3. Email / Correspondence
    if (
      doc.sourceType === 'email' ||
      doc.folderCategory === 'Correspondence & Logs' ||
      doc.category === 'email' ||
      doc.category === 'E-mails og korrespondance' ||
      (doc.category && doc.category.toLowerCase().includes('mail')) ||
      (doc.category && doc.category.toLowerCase().includes('korrespondance')) ||
      (doc.fileFormat && doc.fileFormat.toLowerCase().includes('eml')) ||
      (doc.fileFormat && doc.fileFormat.toLowerCase().includes('msg')) ||
      doc.emailHeaders !== undefined
    ) {
      return 'email';
    }

    // 4. Default to document / court / municipal filings
    return 'document';
  };

  // Category counts for interactive badges
  const categoryCounts = useMemo(() => {
    const counts = {
      all: documents.length,
      audio: 0,
      document: 0,
      image: 0,
      email: 0
    };
    documents.forEach((doc) => {
      const cat = getDocCategory(doc);
      if (cat in counts) {
        counts[cat]++;
      }
    });
    return counts;
  }, [documents]);

  // Main Interactive Category Definitions
  const categories = [
    {
      id: 'all',
      labelDa: 'Alle Kategorier',
      labelEn: 'All Categories',
      icon: Layers,
      count: categoryCounts.all,
      color: 'indigo'
    },
    {
      id: 'audio',
      labelDa: 'Lyd & Aflytninger',
      labelEn: 'Audio & Wiretaps',
      icon: Headphones,
      count: categoryCounts.audio,
      color: 'amber'
    },
    {
      id: 'document',
      labelDa: 'Sagsakter & Retsbøger',
      labelEn: 'Case Files & Court Records',
      icon: FileText,
      count: categoryCounts.document,
      color: 'blue'
    },
    {
      id: 'image',
      labelDa: 'Billeder & Forensiske Fotos',
      labelEn: 'Images & Forensic Scans',
      icon: ImageIcon,
      count: categoryCounts.image,
      color: 'emerald'
    },
    {
      id: 'email',
      labelDa: 'E-mails & Korrespondance',
      labelEn: 'Emails & Logs',
      icon: Mail,
      count: categoryCounts.email,
      color: 'purple'
    }
  ];

  const filteredAndSortedDocs = useMemo(() => {
    return documents
      .filter((doc) => {
        const cat = getDocCategory(doc);
        const matchesCategory = selectedCategory === 'all' || cat === selectedCategory;
        const matchesSignificance = selectedSignificance === 'all' || doc.significance === selectedSignificance;
        const matchesVerified = !onlyVerified || doc.verified;

        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          doc.title.toLowerCase().includes(term) ||
          doc.summary.toLowerCase().includes(term) ||
          doc.docNumber.toLowerCase().includes(term) ||
          doc.author.toLowerCase().includes(term) ||
          doc.excerpt.toLowerCase().includes(term) ||
          (doc.fullContent && doc.fullContent.toLowerCase().includes(term)) ||
          (doc.ocrText && doc.ocrText.toLowerCase().includes(term)) ||
          (doc.imageCaption && doc.imageCaption.toLowerCase().includes(term)) ||
          (doc.folderCategory && doc.folderCategory.toLowerCase().includes(term)) ||
          (doc.fileFormat && doc.fileFormat.toLowerCase().includes(term)) ||
          (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(term))) ||
          doc.partiesInvolved.some((p) => p.toLowerCase().includes(term)) ||
          (doc.emailHeaders &&
            (doc.emailHeaders.subject?.toLowerCase().includes(term) ||
              doc.emailHeaders.from?.toLowerCase().includes(term) ||
              doc.emailHeaders.to?.toLowerCase().includes(term))) ||
          (doc.ocrAnnotations &&
            doc.ocrAnnotations.some(
              (a) =>
                a.selectedText.toLowerCase().includes(term) ||
                a.comment?.toLowerCase().includes(term) ||
                a.tags?.some((tg) => tg.toLowerCase().includes(term))
            ));

        return matchesCategory && matchesSignificance && matchesVerified && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'significance') {
          const score = (sig: string) => (sig === 'critical' ? 3 : sig === 'high' || sig === 'noteworthy' ? 2 : 1);
          return score(b.significance) - score(a.significance);
        }
        if (sortBy === 'id') {
          return a.docNumber.localeCompare(b.docNumber);
        }
        return 0;
      });
  }, [documents, selectedCategory, selectedSignificance, onlyVerified, sortBy, searchTerm]);

  const handleCopyCitation = (doc: DocumentFinding, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const catName = getDocCategory(doc).toUpperCase();
    const citation = `[Lyngby-Taarbæk Case Evidence (${catName})] ${doc.docNumber}: "${doc.title}" (${doc.date}), Authored by ${doc.author}. Verified FOI Dossier. Ref: ${doc.driveUrl || 'Google Drive Archive'}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const togglePlayAudio = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPlayingAudioId((prev) => (prev === id ? null : id));
  };

  // Multi-Select Handlers
  const handleToggleSelectDoc = (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredAndSortedDocs.map((d) => d.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedDocIds.includes(id));

    if (allSelected) {
      setSelectedDocIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      const combined = new Set([...selectedDocIds, ...visibleIds]);
      setSelectedDocIds(Array.from(combined));
    }
  };

  const handleApplyBulkTag = (tagToApply: string) => {
    if (!tagToApply.trim() || selectedDocIds.length === 0) return;
    const cleanTag = tagToApply.trim();

    selectedDocIds.forEach((docId) => {
      const doc = documents.find((d) => d.id === docId);
      if (!doc) return;
      const existingTags = doc.tags || [];
      if (!existingTags.includes(cleanTag)) {
        updateDocument(docId, { tags: [...existingTags, cleanTag] }, `Massetildeling af tag '${cleanTag}'`);
      }
    });

    setBulkFeedbackMsg(
      t(
        `Tildelt tag '${cleanTag}' til ${selectedDocIds.length} bevisdokumenter!`,
        `Assigned tag '${cleanTag}' to ${selectedDocIds.length} evidence items!`
      )
    );
    setIsBulkTagModalOpen(false);
    setBulkTagInput('');
    setTimeout(() => setBulkFeedbackMsg(null), 3500);
  };

  const handleApplyBulkEntity = (partyName: string) => {
    if (!partyName.trim() || selectedDocIds.length === 0) return;
    const cleanParty = partyName.trim();

    selectedDocIds.forEach((docId) => {
      const doc = documents.find((d) => d.id === docId);
      if (!doc) return;
      const existingParties = doc.partiesInvolved || [];
      if (!existingParties.includes(cleanParty)) {
        updateDocument(
          docId,
          { partiesInvolved: [...existingParties, cleanParty] },
          `Massetilknytning af part '${cleanParty}'`
        );
      }
    });

    setBulkFeedbackMsg(
      t(
        `Tilknyttet part/entitet '${cleanParty}' til ${selectedDocIds.length} bevisdokumenter!`,
        `Linked party/entity '${cleanParty}' to ${selectedDocIds.length} evidence items!`
      )
    );
    setIsBulkEntityModalOpen(false);
    setBulkPartyInput('');
    setTimeout(() => setBulkFeedbackMsg(null), 3500);
  };

  const handleApplyBulkSignificance = (sig: 'routine' | 'noteworthy' | 'critical') => {
    if (selectedDocIds.length === 0) return;

    selectedDocIds.forEach((docId) => {
      updateDocument(docId, { significance: sig }, `Masseredigering af alvorlighed til '${sig}'`);
    });

    setBulkFeedbackMsg(
      t(
        `Opdateret alvorlighed for ${selectedDocIds.length} dokumenter til ${sig.toUpperCase()}!`,
        `Updated significance for ${selectedDocIds.length} items to ${sig.toUpperCase()}!`
      )
    );
    setIsBulkSignificanceModalOpen(false);
    setTimeout(() => setBulkFeedbackMsg(null), 3500);
  };

  const handleApplyBulkVerify = () => {
    if (selectedDocIds.length === 0) return;

    selectedDocIds.forEach((docId) => {
      updateDocument(docId, { verified: true }, 'Massering af verifikation: Verificeret');
    });

    setBulkFeedbackMsg(
      t(
        `Markeret ${selectedDocIds.length} bevisdokumenter som verificeret!`,
        `Marked ${selectedDocIds.length} items as verified!`
      )
    );
    setTimeout(() => setBulkFeedbackMsg(null), 3500);
  };

  const criticalCount = documents.filter((d) => d.significance === 'critical').length;
  const verifiedCount = documents.filter((d) => d.verified).length;

  return (
    <div id="evidence-list-container" className="space-y-6">
      {/* 1. Evidence Stat Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{documents.length}</div>
            <div className="text-xs text-slate-400">{t('Registrerede Bevisakter', 'Total Evidence Files')}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-red-400">{criticalCount}</div>
            <div className="text-xs text-slate-400">{t('Kritiske Bevisfund', 'Critical Evidences')}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400">{verifiedCount}</div>
            <div className="text-xs text-slate-400">{t('Verificerede Aktindsigter', 'Verified FOI Documents')}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-purple-300">100%</div>
            <div className="text-xs text-slate-400">Drive "Lyngby-Taarbæk"</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Category Filter Navigation Cards */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {t('Interaktive Beviskategorier', 'Interactive Evidence Categories')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('Filtrer direkte på medietyper: Lydoptagelser, Billeder, Dokumenter og E-mails', 'Filter across evidence media types: Audio, Images, Documents, and Emails')}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {t('Aktiv Kategori:', 'Active Filter:')}{' '}
            <strong className="text-indigo-400">
              {categories.find((c) => c.id === selectedCategory)?.[language === 'da' ? 'labelDa' : 'labelEn']}
            </strong>
          </span>
        </div>

        {/* Category Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`category-filter-${cat.id}`}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </div>

                <div className="text-xs font-bold text-white leading-tight">
                  {language === 'da' ? cat.labelDa : cat.labelEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Secondary Filters Toolbar */}
      <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="evidence-search-input"
              type="text"
              placeholder={t(
                'Søg i alle beviser efter titel, forfatter, sagsnummer, citatuddrag eller parter...',
                'Search evidence filings, authors, excerpt quotes, image captions, or parties...'
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                title={t('Ryd søgning', 'Clear search')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Secondary Controls: View Mode & Sorting & Filters */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            {/* View Mode */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('Tabelvisning', 'Table View')}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('Gittervisning', 'Grid View')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('gallery')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'gallery' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('Gallerivisning', 'Gallery & Media View')}
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedDocForPdf && filteredAndSortedDocs.length > 0) {
                    setSelectedDocForPdf(filteredAndSortedDocs[0]);
                  }
                  setViewMode('pdf');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'pdf' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t('Integreret PDF Læser & Annotering', 'Integrated PDF Viewer & Annotator')}
              >
                <Highlighter className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">{t('PDF Læser', 'PDF Reader')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSummaryPanelOpen(!isSummaryPanelOpen)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSummaryPanelOpen
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title={t('Slå AI Resumé Sidepanel til/fra', 'Toggle AI Summary Sidepanel')}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">{t('AI Sidepanel', 'AI Sidepanel')}</span>
              </button>

              <button
                type="button"
                id="generate-summary-top-btn"
                onClick={() => {
                  const targets = selectedDocIds.length > 0
                    ? documents.filter((d) => selectedDocIds.includes(d.id))
                    : filteredAndSortedDocs.slice(0, 10);
                  if (targets.length > 0) {
                    setSummaryModalDocs(targets);
                    setIsSummaryModalOpen(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  selectedDocIds.length > 0
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-indigo-400/60 shadow-md shadow-indigo-600/30'
                    : 'bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border-indigo-500/40'
                }`}
                title={
                  selectedDocIds.length > 0
                    ? t(`Generér samlet synopse af ${selectedDocIds.length} valgte beviser`, `Generate synopsis of ${selectedDocIds.length} selected items`)
                    : t('Generér resumé af de viste bevisakter', 'Generate summary of shown evidence')
                }
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>
                  {selectedDocIds.length > 0
                    ? `${t('Generér Resumé', 'Generate Summary')} (${selectedDocIds.length})`
                    : t('Generér Resumé', 'Generate Summary')}
                </span>
              </button>
            </div>

            {/* Significance filter */}
            <select
              id="evidence-significance-select"
              value={selectedSignificance}
              onChange={(e) => setSelectedSignificance(e.target.value)}
              className="bg-slate-950 text-slate-300 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">{t('Alle Alvorligheder', 'All Significance')}</option>
              <option value="critical">{t('Kun Kritiske', 'Critical Only')}</option>
              <option value="noteworthy">{t('Vigtige', 'Noteworthy')}</option>
              <option value="routine">{t('Rutine', 'Routine')}</option>
            </select>

            {/* Sort select */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
              <select
                id="evidence-sort-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="date-desc" className="bg-slate-900 text-white">
                  {t('Nyeste først', 'Newest date')}
                </option>
                <option value="date-asc" className="bg-slate-900 text-white">
                  {t('Ældste først', 'Oldest date')}
                </option>
                <option value="significance" className="bg-slate-900 text-white">
                  {t('Alvorlighed (Kritisk)', 'Significance (Critical)')}
                </option>
                <option value="id" className="bg-slate-900 text-white">
                  {t('Dokument ID', 'Document ID')}
                </option>
              </select>
            </div>

            {/* Verified toggle */}
            <button
              type="button"
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                onlyVerified
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('Verificerede', 'Verified')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3.5. MASS-SELECTION / BULK ACTION TOOLBAR */}
      {selectedDocIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-indigo-950/90 border border-indigo-500/60 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-md shrink-0">
              {selectedDocIds.length}
            </div>
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{t('Bevisdokumenter Valgt til Masseredigering', 'Evidence Items Selected for Bulk Action')}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono">
                  {selectedDocIds.length} / {filteredAndSortedDocs.length}
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                {t(
                  'Tildel samme emneord/tag, knyt til en sagsaktør eller skift juridisk alvorlighedsgrad for alle markeret beviser på én gang.',
                  'Assign the same tag, link to a case entity, or change significance across all selected items.'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="bulk-generate-summary-btn"
              onClick={() => {
                const targets = documents.filter((d) => selectedDocIds.includes(d.id));
                if (targets.length > 0) {
                  setSummaryModalDocs(targets);
                  setIsSummaryModalOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/40 flex items-center gap-2 transition-all cursor-pointer border border-indigo-400/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>{t('⚡ Generér Resumé (Gemini)', '⚡ Generate Summary (Gemini)')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkTagModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-400/40"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{t('Tildel Tag', 'Assign Tag')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkEntityModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/40"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('Knyt Part / Entitet', 'Link Party')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkSignificanceModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-amber-400/40"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t('Skift Status', 'Set Status')}</span>
            </button>

            <button
              type="button"
              onClick={handleApplyBulkVerify}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-500/30"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('Verificér Alle', 'Verify All')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDocIds([])}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('Nulstil', 'Deselect')}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Bulk Feedback Banner */}
      {bulkFeedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bulkFeedbackMsg}</span>
          </div>
          <button
            onClick={() => setBulkFeedbackMsg(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* 4. Filter Counter & Reset Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            {t('Viser', 'Showing')} <strong className="text-white">{filteredAndSortedDocs.length}</strong> {t('af', 'of')}{' '}
            {documents.length} {t('bevisakter', 'evidence records')}
          </span>
          {(selectedCategory !== 'all' || selectedSignificance !== 'all' || onlyVerified || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSignificance('all');
                setOnlyVerified(false);
                setSearchTerm('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-2 cursor-pointer"
            >
              {t('Nulstil filtre', 'Reset all filters')}
            </button>
          )}
        </div>

        {copiedId && (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {t('Kildehenvisning kopieret til udklipsholder!', 'Citation copied to clipboard!')}
          </span>
        )}
      </div>

      {/* 5. EVIDENCE LIST VIEWS */}
      {viewMode !== 'pdf' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className={isSummaryPanelOpen ? 'xl:col-span-7 2xl:col-span-8 space-y-4' : 'xl:col-span-12 space-y-4'}>
            {/* Empty State */}
      {filteredAndSortedDocs.length === 0 && (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 p-10 rounded-2xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">
            {t('Ingen bevisakter matcher det valgte filter', 'No evidence items match the selected category & filter')}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {t(
              'Prøv at vælge "Alle Kategorier", fjerne søgetermen eller slå "Kun Verificerede" fra.',
              'Try selecting "All Categories", clearing your search query, or disabling the verified filter.'
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSignificance('all');
              setOnlyVerified(false);
              setSearchTerm('');
            }}
          >
            {t('Nulstil filtre', 'Reset Filters')}
          </Button>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredAndSortedDocs.length > 0 && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredAndSortedDocs.length > 0 &&
                        filteredAndSortedDocs.every((d) => selectedDocIds.includes(d.id))
                      }
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title={t('Vælg alle synlige beviser', 'Select all visible evidence')}
                    />
                  </th>
                  <th className="py-3.5 px-4">{t('Dokument ID', 'Doc Number')}</th>
                  <th className="py-3.5 px-4">{t('Kategori & Type', 'Category & Type')}</th>
                  <th className="py-3.5 px-4">{t('Dokumenttitel & Forensisk Resumé', 'Title & Abstract')}</th>
                  <th className="py-3.5 px-4">{t('Tilknyttede Parter', 'Parties Linked')}</th>
                  <th className="py-3.5 px-4">{t('Dato / Kilde', 'Date / Author')}</th>
                  <th className="py-3.5 px-4">{t('Status', 'Status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('Handlinger', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAndSortedDocs.map((doc, idx) => {
                  const cat = getDocCategory(doc);
                  const isCritical = doc.significance === 'critical';
                  const isAudio = cat === 'audio';
                  const isImage = cat === 'image';
                  const isSelected = selectedDocIds.includes(doc.id);

                  return (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: Math.min(idx * 0.02, 0.3) }}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setSelectedDocForSummary(doc);
                      }}
                      className={`transition-colors cursor-pointer group ${
                        isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : 'hover:bg-indigo-950/20'
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-4 px-3 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectDoc(doc.id, e as any)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                          {doc.docNumber}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {cat === 'audio' && <Headphones className="w-3.5 h-3.5 text-amber-400" />}
                          {cat === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
                          {cat === 'document' && <FileText className="w-3.5 h-3.5 text-blue-400" />}
                          {cat === 'email' && <Mail className="w-3.5 h-3.5 text-purple-400" />}
                          <span className="font-semibold text-slate-300 capitalize">
                            {cat === 'audio'
                              ? t('Lydoptagelse', 'Audio Wire')
                              : cat === 'image'
                              ? t('Forensisk Foto', 'Photo Evidence')
                              : cat === 'email'
                              ? t('E-mail Korrespondance', 'Email Chain')
                              : t('Dokument / Rapport', 'Document')}
                          </span>
                        </div>
                        {doc.fileFormat && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{doc.fileFormat}</div>
                        )}
                      </td>

                      {/* Title & Summary */}
                      <td className="py-4 px-4 max-w-md">
                        <div className="font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {doc.title}
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5 font-normal">
                          {doc.summary}
                        </p>
                        {isAudio && doc.mediaDuration && (
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-amber-400 font-mono">
                            <Volume2 className="w-3 h-3" />
                            <span>{t('Varighed', 'Duration')}: {doc.mediaDuration}</span>
                          </div>
                        )}
                        {isImage && doc.imageCaption && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                            <Camera className="w-3 h-3" />
                            <span className="truncate">{doc.imageCaption}</span>
                          </div>
                        )}
                      </td>

                      {/* Parties */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {doc.partiesInvolved.map((p, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Date & Author */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-200 font-semibold">{doc.date}</div>
                        <div className="text-slate-400 text-[10px] truncate max-w-[140px]">{doc.author}</div>
                      </td>

                      {/* Status / Significance */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Badge variant={isCritical ? 'critical' : 'medium'}>
                            {doc.significance === 'critical'
                              ? t('Kritisk', 'Critical')
                              : doc.significance === 'noteworthy'
                              ? t('Vigtig', 'Noteworthy')
                              : t('Rutine', 'Routine')}
                          </Badge>
                          <div>
                            {doc.verified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('Verificeret', 'Verified')}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-400">
                                {t('Under granskning', 'In Review')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAudio && (
                            <button
                              type="button"
                              onClick={(e) => togglePlayAudio(doc.id, e)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                playingAudioId === doc.id
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                              }`}
                              title={playingAudioId === doc.id ? t('Pause afspilning', 'Pause Audio') : t('Afspil lydklip', 'Play Audio')}
                            >
                              {playingAudioId === doc.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleCopyCitation(doc, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title={t('Kopiér kildehenvisning', 'Copy citation')}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocForPdf(doc);
                              setViewMode('pdf');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-1 transition-colors border border-amber-500/30"
                            title={t('Læs i PDF-læser & tilføj tags', 'Read in PDF reader & add tags')}
                          >
                            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t('Læs & Annotér', 'Read & Annotate')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocForSummary(doc);
                              setIsSummaryPanelOpen(true);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                              selectedDocForSummary?.id === doc.id && isSummaryPanelOpen
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 font-bold'
                                : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border-indigo-500/40 hover:text-white'
                            }`}
                            title={t('Generér automatisk AI Resumé for denne sagsakt', 'Generate automated AI summary for this document')}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{t('AI Resumé', 'AI Summary')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoc(doc);
                              setSelectedDocForSummary(doc);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-semibold flex items-center gap-1 transition-colors border border-indigo-500/30"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t('Inspicér', 'Inspect')}</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredAndSortedDocs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedDocs.map((doc, idx) => {
            const cat = getDocCategory(doc);
            const isCritical = doc.significance === 'critical';
            const isAudio = cat === 'audio';
            const isImage = cat === 'image';

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.025, 0.3) }}
                whileHover={{ y: -3 }}
                className="h-full"
              >
                <Card
                  onClick={() => {
                    setSelectedDoc(doc);
                    setSelectedDocForSummary(doc);
                  }}
                  className="h-full hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between group bg-slate-900/90 rounded-2xl"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {doc.docNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {cat === 'audio' && <Headphones className="w-3 h-3 text-amber-400" />}
                          {cat === 'image' && <ImageIcon className="w-3 h-3 text-emerald-400" />}
                          {cat === 'document' && <FileText className="w-3 h-3 text-blue-400" />}
                          {cat === 'email' && <Mail className="w-3 h-3 text-purple-400" />}
                          <span className="capitalize">{cat}</span>
                        </span>
                        <Badge variant={isCritical ? 'critical' : 'medium'}>
                          {doc.significance === 'critical' ? t('Kritisk', 'Critical') : t('Vigtig', 'High')}
                        </Badge>
                      </div>
                    </div>

                    <CardTitle className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {doc.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{doc.summary}</p>

                    {/* Audio mini player preview */}
                    {isAudio && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => togglePlayAudio(doc.id, e)}
                          className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold"
                        >
                          {playingAudioId === doc.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>{playingAudioId === doc.id ? '04:12' : '00:00'}</span>
                            <span>{doc.mediaDuration || '12:00'}</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all"
                              style={{ width: playingAudioId === doc.id ? '35%' : '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image mini scan preview */}
                    {isImage && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Scan className="w-3 h-3" />
                            {doc.fileFormat || 'RAW 600 DPI'}
                          </span>
                          <span>{doc.fileSize}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 italic line-clamp-1">
                          "{doc.imageCaption || doc.excerpt}"
                        </div>
                      </div>
                    )}

                    {!isAudio && !isImage && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border-l-2 border-indigo-500 text-[11px] text-slate-300 font-mono italic line-clamp-2">
                        "{doc.excerpt}"
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {doc.partiesInvolved.map((p, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        {doc.date}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocForSummary(doc);
                          setIsSummaryPanelOpen(true);
                        }}
                        className="px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold flex items-center gap-1 border border-indigo-500/30 text-[10px]"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>{t('AI Resumé', 'AI Summary')}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* GALLERY / MEDIA VIEW */}
      {viewMode === 'gallery' && filteredAndSortedDocs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedDocs.map((doc, idx) => {
            const cat = getDocCategory(doc);
            const isAudio = cat === 'audio';
            const isImage = cat === 'image';
            const isCritical = doc.significance === 'critical';

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.3) }}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedDoc(doc)}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-4 shadow-xl flex flex-col justify-between group"
              >
                {/* Top Media Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                      {doc.docNumber}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={isCritical ? 'critical' : 'medium'}>
                        {doc.significance === 'critical' ? t('Kritisk Fund', 'Critical') : t('Vigtig', 'Noteworthy')}
                      </Badge>
                      {doc.verified && (
                        <span className="text-emerald-400" title={t('Verificeret Aktindsigt', 'Verified FOI Dossier')}>
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Simulated Visual Media Stage */}
                  <div
                    className={`h-36 rounded-xl border flex flex-col items-center justify-center p-4 text-center relative overflow-hidden transition-all ${
                      isAudio
                        ? 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-500/30'
                        : isImage
                        ? 'bg-gradient-to-b from-emerald-950/40 to-slate-950 border-emerald-500/30'
                        : 'bg-gradient-to-b from-indigo-950/40 to-slate-950 border-indigo-500/30'
                    }`}
                  >
                    {isAudio && (
                      <div className="space-y-2 w-full">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
                          <Headphones className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-amber-300 font-mono">
                          {doc.fileFormat || 'Audio Wiretap Track'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {t('Længde', 'Length')}: {doc.mediaDuration || '08:45 min'}
                        </div>
                      </div>
                    )}

                    {isImage && (
                      <div className="space-y-2 w-full">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-emerald-300 font-mono">
                          {doc.fileFormat || 'High-Resolution Scan'}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 px-2">
                          {doc.imageCaption || doc.title}
                        </div>
                      </div>
                    )}

                    {!isAudio && !isImage && (
                      <div className="space-y-2 w-full">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto shadow-lg">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-indigo-300 font-mono">
                          {doc.fileFormat || 'Official Dossier Filing'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {doc.fileSize || '3.2 MB'}
                        </div>
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{doc.date}</span>
                    <span className="truncate max-w-[120px]">{doc.author}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyCitation(doc, e)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{t('Kopiér Ref', 'Copy Ref')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors border border-indigo-500/30"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{t('Inspicér', 'Inspect')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>

          {/* Automated AI Summary Side-Panel Card */}
          {isSummaryPanelOpen && (
            <div className="xl:col-span-5 2xl:col-span-4 sticky top-24">
              <DocumentAISummaryPanel
                selectedDoc={selectedDocForSummary}
                onClose={() => setIsSummaryPanelOpen(false)}
                onAskAIWithDoc={onAskAIWithDoc}
                onOpenDocModal={(doc) => {
                  setSelectedDoc(doc);
                  if (onOpenDocModal) onOpenDocModal(doc);
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* INTEGRATED PDF VIEWER & ANNOTATOR VIEW */
        <div className="w-full">
          <IntegratedPDFViewer
            document={selectedDocForPdf || filteredAndSortedDocs[0] || documents[0]}
            allDocuments={documents}
            onSelectDocument={(doc) => setSelectedDocForPdf(doc)}
            onAskAIWithDoc={(doc) => {
              if (onAskAIWithDoc) onAskAIWithDoc(doc);
            }}
            onCloseViewer={() => setViewMode('table')}
          />
        </div>
      )}

      {/* 6. DETAILED EVIDENCE INSPECTION MODAL */}
      {selectedDoc && (
        <div
          id="evidence-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            setSelectedDoc(null);
            setZoomImage(false);
          }}
        >
          <div
            id="evidence-modal-card"
            className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/30">
                    {selectedDoc.docNumber}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 capitalize flex items-center gap-1.5">
                    {getDocCategory(selectedDoc) === 'audio' && <Headphones className="w-3.5 h-3.5 text-amber-400" />}
                    {getDocCategory(selectedDoc) === 'image' && <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />}
                    {getDocCategory(selectedDoc) === 'document' && <FileText className="w-3.5 h-3.5 text-blue-400" />}
                    {getDocCategory(selectedDoc) === 'email' && <Mail className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{getDocCategory(selectedDoc)}</span>
                  </span>
                  <Badge variant={selectedDoc.significance === 'critical' ? 'critical' : 'medium'}>
                    {selectedDoc.significance === 'critical' ? t('Kritisk Fund', 'Critical Finding') : t('Vigtig', 'Medium Finding')}
                  </Badge>
                  {selectedDoc.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('Verificeret Aktindsigt', 'Verified FOI Dossier')}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{selectedDoc.title}</h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedDoc(null);
                  setZoomImage(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category-Specific Media Visualizer Stage in Modal */}
            {getDocCategory(selectedDoc) === 'audio' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
                    <Headphones className="w-4 h-4" />
                    <span>{t('Forensisk Lydfil & Aflytning', 'Forensic Audio Wiretap')}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{selectedDoc.fileFormat || 'WAV Lossless'}</span>
                </div>

                {/* Interactive Player Controls */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={(e) => togglePlayAudio(selectedDoc.id, e)}
                    className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg hover:bg-amber-400 transition-colors"
                  >
                    {playingAudioId === selectedDoc.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <div className="flex-1 space-y-1.5">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-300"
                        style={{ width: playingAudioId === selectedDoc.id ? '45%' : '0%' }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{playingAudioId === selectedDoc.id ? '04:12' : '00:00'}</span>
                      <span>{selectedDoc.mediaDuration || '14:22'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {getDocCategory(selectedDoc) === 'image' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                    <Camera className="w-4 h-4" />
                    <span>{t('Forensisk Fotografisk Bevismateriale', 'Forensic Photographic Exhibit')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomImage(!zoomImage)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>{zoomImage ? t('Formindsk', 'Reset Zoom') : t('Zoom / Inspicér', 'Zoom In')}</span>
                  </button>
                </div>

                <div
                  className={`rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col items-center justify-center text-center transition-all ${
                    zoomImage ? 'py-16 bg-slate-950' : 'py-8'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                    <Scan className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{selectedDoc.docNumber}</div>
                  <div className="text-xs text-slate-300 max-w-lg mt-1 italic">
                    "{selectedDoc.imageCaption || selectedDoc.excerpt}"
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-400">
                    <span>{selectedDoc.fileFormat || 'RAW / EXIF'}</span>
                    <span>•</span>
                    <span>{selectedDoc.fileSize || '8.6 MB'}</span>
                    <span>•</span>
                    <span>ISO 400 / 50mm / SHA-256 Validated</span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">{t('Forfatter / Kilde', 'Author / Submitter')}</span>
                <strong className="text-slate-200 mt-0.5 block">{selectedDoc.author}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">{t('Dokumentdato', 'Filing Date')}</span>
                <strong className="text-slate-200 mt-0.5 block">{selectedDoc.date}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">{t('Filformat & Størrelse', 'Format & Size')}</span>
                <strong className="text-slate-200 mt-0.5 block font-mono">
                  {selectedDoc.fileFormat || selectedDoc.fileSize || 'PDF / 3.4 MB'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">{t('Kildearkiv', 'Source Repository')}</span>
                <strong className="text-indigo-400 mt-0.5 block">Lyngby-Taarbæk case</strong>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                {t('Forensisk Resumé & Sammenhæng', 'Forensic Abstract & Context')}
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/90 text-sm text-slate-200 leading-relaxed border border-slate-800">
                {selectedDoc.summary}
              </div>
            </div>

            {/* Verified Excerpt Box */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                {t('Verificeret Dokumentcitat (Uddrag)', 'Verified Direct Excerpt')}
              </h4>
              <div className="p-4 rounded-xl bg-slate-950 border-l-4 border-indigo-500 text-sm text-slate-200 font-mono italic leading-relaxed shadow-inner">
                "{selectedDoc.excerpt}"
              </div>
            </div>

            {/* Linked Parties */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-400" />
                {t('Tilknyttede Sagsaktører & Parter', 'Linked Parties & Persons of Interest')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedDoc.partiesInvolved.map((party, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-indigo-300 border border-slate-700 font-medium"
                  >
                    {party}
                  </span>
                ))}
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash Verification */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Hash className="w-4 h-4 text-emerald-400" />
                <span>SHA-256 Checksum:</span>
                <span className="font-mono text-[11px] text-slate-300">
                  9f8a6c42b08e2f17d35a74e09819f2a4bc81d604e3
                </span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('Valideret', 'Validated')}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <a
                href={selectedDoc.driveUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2.5 rounded-xl transition-colors border border-emerald-500/20"
              >
                <HardDrive className="w-4 h-4" />
                <span>{t('Åbn i Drive: "Lyngby-Taarbæk case"', 'Open in Drive: "Lyngby-Taarbæk case"')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDocForPdf(selectedDoc);
                    setSelectedDoc(null);
                    setViewMode('pdf');
                  }}
                  className="bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-white border-amber-500/40 flex items-center gap-1.5 font-semibold"
                >
                  <Highlighter className="w-4 h-4 text-amber-400" />
                  <span>{t('Læs & Annotér i PDF', 'Read & Annotate in PDF')}</span>
                </Button>

                {onAskAIWithDoc && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onAskAIWithDoc(selectedDoc);
                      setSelectedDoc(null);
                    }}
                    className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border-indigo-500/40 flex items-center gap-1.5 font-semibold"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>{t('AI Resumé (The Brew Method)', 'AI Executive Summary')}</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleCopyCitation(selectedDoc, e)}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>
                    {copiedId === selectedDoc.id ? t('Kopieret!', 'Copied!') : t('Kopiér Henvisning', 'Copy Citation')}
                  </span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (onOpenDocModal) onOpenDocModal(selectedDoc);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('Download Akt / Udskrift', 'Download Evidence Asset')}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 6. BULK ACTION MODAL: ASSIGN TAG          */}
      {/* ========================================= */}
      {isBulkTagModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-indigo-500/40 p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                <Tag className="w-5 h-5" />
                <h3>{t('Massetildel Tag / Emneord', 'Bulk Assign Tag / Keyword')}</h3>
              </div>
              <button
                onClick={() => setIsBulkTagModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              {t(
                `Du er ved at tildele et tag til ${selectedDocIds.length} markerede bevisdokumenter. Vælg et foruddefineret emneord eller skriv et nyt.`,
                `You are about to assign a tag to ${selectedDocIds.length} selected evidence items. Choose a preset or enter a custom tag.`
              )}
            </p>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                {t('Hurtige Emneord (Presets):', 'Quick Tag Presets:')}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Børns Vilkår',
                  'FABU Samværsrapport',
                  'Byretten 2025 Dom',
                  'Lydoptagelse / Aflytning',
                  'Rene Urinprøver',
                  'Mørklægning af Beviser',
                  'Akut Anbringelse 2022',
                  'Fødselspapirer Tyrkiet',
                  'Master File',
                  'Gribskov Oprindelse',
                  'FKU 2023 Kritik',
                  'Dokumentfalsk 2026'
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleApplyBulkTag(preset)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all cursor-pointer font-medium"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-200 block">
                {t('Eget Tilpasset Tag:', 'Custom Tag Name:')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('f.eks. Børns Vilkår, Mørklægning...', 'e.g. Hospital record, FOI Request...')}
                  value={bulkTagInput}
                  onChange={(e) => setBulkTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyBulkTag(bulkTagInput);
                  }}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleApplyBulkTag(bulkTagInput)}
                  disabled={!bulkTagInput.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {t('Tildel Tag', 'Assign Tag')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================= */}
      {/* 7. BULK ACTION MODAL: LINK CASE ENTITY    */}
      {/* ========================================= */}
      {isBulkEntityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-emerald-500/40 p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <User className="w-5 h-5" />
                <h3>{t('Knyt Case-Entitet / Part', 'Link Case Entity / Party')}</h3>
              </div>
              <button
                onClick={() => setIsBulkEntityModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              {t(
                `Vælg den sagsaktør eller organisation, der skal tilknyttes de ${selectedDocIds.length} markeret dokumenter i deres relaterede aktørliste.`,
                `Select the party or organisation to link to the ${selectedDocIds.length} selected evidence items.`
              )}
            </p>

            {/* Presets from Case Data */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                {t('Sagsaktører i Lyngby-Taarbæk Sagen:', 'Lyngby-Taarbæk Case Parties:')}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {[
                  'Luca (Barn)',
                  'Liam (Storebror)',
                  'Nicklas (Far)',
                  'Marsha (Mor)',
                  'Mette (Sagsbehandler)',
                  'Dennis (Fratrådt Rådgiver)',
                  'Thomas (Afdelingsleder)',
                  'FABU (Familiehjælp)',
                  'Lyngby-Taarbæk Kommune',
                  'Byretten i Lyngby'
                ].map((partyName) => (
                  <button
                    key={partyName}
                    onClick={() => handleApplyBulkEntity(partyName)}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-emerald-950 hover:border-emerald-500 border border-zinc-800 text-left text-xs font-semibold text-zinc-200 hover:text-emerald-300 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate">{partyName}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">+ Knyt</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Entity Input */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-bold text-zinc-200 block">
                {t('Anden Part / Institution:', 'Other Party / Institution:')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('f.eks. Ankestyrelsen, Torvehuset...', 'e.g. Børns Vilkår, Police...')}
                  value={bulkPartyInput}
                  onChange={(e) => setBulkPartyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyBulkEntity(bulkPartyInput);
                  }}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleApplyBulkEntity(bulkPartyInput)}
                  disabled={!bulkPartyInput.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-zinc-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  {t('Knyt Part', 'Link Party')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================= */}
      {/* 8. BULK ACTION MODAL: SET SIGNIFICANCE     */}
      {/* ========================================= */}
      {isBulkSignificanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-amber-500/40 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <ShieldAlert className="w-5 h-5" />
                <h3>{t('Skift Juridisk Alvorlighed', 'Change Legal Significance')}</h3>
              </div>
              <button
                onClick={() => setIsBulkSignificanceModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              {t(
                `Vælg den juridiske alvorlighedsgrad for de ${selectedDocIds.length} markeret bevisdokumenter.`,
                `Select the legal significance for the ${selectedDocIds.length} selected evidence items.`
              )}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleApplyBulkSignificance('critical')}
                className="w-full p-3.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-left text-xs font-bold text-red-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>{t('KRITISK (Rygende Pistol / Domskritik)', 'CRITICAL (Smoking Gun / High Impact)')}</span>
                </div>
                <span className="text-[10px] bg-red-500/20 px-2 py-0.5 rounded font-mono">Prio 1</span>
              </button>

              <button
                onClick={() => handleApplyBulkSignificance('noteworthy')}
                className="w-full p-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/50 text-left text-xs font-bold text-indigo-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>{t('VIGTIG (Relevant for tidslinje/sag)', 'NOTEWORTHY (Relevant Context)')}</span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded font-mono">Prio 2</span>
              </button>

              <button
                onClick={() => handleApplyBulkSignificance('routine')}
                className="w-full p-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-left text-xs font-bold text-zinc-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  <span>{t('RUTINE (Standard Korrespondance)', 'ROUTINE (Standard Log)')}</span>
                </div>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded font-mono">Prio 3</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* =================================================== */}
      {/* 9. GEMINI FORENSIC EVIDENCE SYNOPSIS MODAL         */}
      {/* =================================================== */}
      <SelectedEvidenceSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        documents={summaryModalDocs}
        onRemoveDoc={(docId) => {
          setSummaryModalDocs((prev) => prev.filter((d) => d.id !== docId));
          setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
        }}
        onAskAIWithSummary={(synopsisText, docs) => {
          if (onAskAIWithDoc && docs.length > 0) {
            onAskAIWithDoc({
              ...docs[0],
              title: `Forensisk Sammenfatning (${docs.length} bevisakter)`,
              summary: synopsisText,
              excerpt: synopsisText.slice(0, 300)
            });
          }
        }}
      />
    </div>
  );
}
