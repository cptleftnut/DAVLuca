import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CaseSynthesisOverview } from '../components/CaseSynthesisOverview';
import { ChronologicalTimeline } from '../components/ChronologicalTimeline';
import { EvidenceTimeline } from '../components/EvidenceTimeline';
import { PartyRelationshipGraph } from '../components/PartyRelationshipGraph';
import { EvidenceList } from '../components/EvidenceList';
import { CasePartyDirectoryPanel } from '../components/CasePartyDirectoryPanel';
import { TranscriptSearchPanel } from '../components/TranscriptSearchPanel';
import { CaseSeriousClaimsRegisterPanel } from '../components/CaseSeriousClaimsRegisterPanel';
import { CaseControlQueuePanel } from '../components/CaseControlQueuePanel';
import { InvestigationAuditLog } from '../components/InvestigationAuditLog';
import { PublicInfographicGallery } from '../components/PublicInfographicGallery';
import { AIChatBox } from '../components/AIChatBox';
import { DynamicCaseSearch } from '../components/DynamicCaseSearch';
import { DocumentSearchIndex } from '../components/DocumentSearchIndex';
import { InvestigationFrequencyChart } from '../components/InvestigationFrequencyChart';
import { DriveSourceLibrary } from '../components/DriveSourceLibrary';
import { GoogleDriveSync } from '../components/GoogleDriveSync';
import { LanguageToggle } from '../components/LanguageToggle';
import { CaseDataManagerModal } from '../components/CaseDataManagerModal';
import { PDFDocumentViewerModal } from '../components/PDFDocumentViewerModal';
import { ExportReportModal } from '../components/ExportReportModal';
import { ConnectionMapper } from '../components/ConnectionMapper';
import { RealTimeTranscriberModal } from '../components/RealTimeTranscriberModal';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { PartySignals } from '../components/PartySignals';
import { AudioTranscriptionPanel } from '../components/AudioTranscriptionPanel';
import { AICaseAssistant } from '../components/AICaseAssistant';
import { InvestigationReportsViewer } from '../components/InvestigationReportsViewer';
import { useCaseData } from '../contexts/CaseDataContext';
import { DocumentFinding } from '../types';
import {
  Clock,
  FileText,
  Bot,
  ArrowRight,
  HardDrive,
  CheckCircle2,
  Scale,
  PlusCircle,
  Upload,
  Database,
  Search,
  FileDown,
  Mic,
  Share2,
  Radio,
  Fingerprint,
  Layers,
  Compass
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function CaseDashboardPage() {
  const { language, t } = useLanguage();
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedDocIdForAssistant, setSelectedDocIdForAssistant] = useState<string | null>(null);
  const [selectedPdfDoc, setSelectedPdfDoc] = useState<DocumentFinding | null>(null);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [isTranscriberOpen, setIsTranscriberOpen] = useState(false);
  const [dataManagerTab, setDataManagerTab] = useState<'upload' | 'add-doc' | 'add-party' | 'add-claim' | 'add-event' | 'import-export'>('upload');

  const {
    summary,
    parties,
    documents,
    transcripts,
    claims,
    timelineEvents,
    controlQueue,
    infographics,
    auditLogs,
    updateTimelineEvent
  } = useCaseData();

  const openDataManager = (tab: typeof dataManagerTab = 'upload') => {
    setDataManagerTab(tab);
    setIsDataManagerOpen(true);
  };

  return (
    <DashboardLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onOpenTranscriber={() => setIsTranscriberOpen(true)}
      subItemTitle={selectedPdfDoc ? selectedPdfDoc.title : null}
      onClearSubItem={() => setSelectedPdfDoc(null)}
    >
      {/* Top Executive Header with Live Case Stats & Forensic Actions */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-5 md:p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                {summary.caseNumber}
              </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-sm"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{t('Aktiv Efterforskning & Forensic Audit', 'Active Investigation & Forensic Audit')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </motion.span>
              <motion.span
                key={documents.length}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-1 text-xs text-zinc-300 font-medium bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-700 font-mono"
              >
                <Database className="w-3 h-3 text-cyan-400" />
                <span>{documents.length} {t('Indekserede Akter', 'Indexed Documents')}</span>
              </motion.span>
              <span className="text-xs text-zinc-400 hidden sm:inline font-mono">
                • {t('The Brew Method Forensic Suite', 'The Brew Method Forensic Suite')}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>{t('Forensisk Sagsportal & Bevisdatabase', 'Forensic Case Portal & Evidence Database')}</span>
            </h1>
            <p className="text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              {t(
                `Graverjournalistisk platform for Lyngby-Taarbæk sagen. Indeholder ${documents.length} verificerede sagsakter, ${transcripts.length} lydoptagelser, ${parties.length} partsprofiler og SHA-256 revisionslog forankret i Google Drive-arkivet.`,
                `Investigative journalism portal for the Lyngby-Taarbæk case. Contains ${documents.length} verified documents, ${transcripts.length} audio recordings, ${parties.length} party profiles, and SHA-256 audit logs grounded in the Google Drive archive.`
              )}
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsTranscriberOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900/80 text-red-300 hover:text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer border border-red-500/40"
              title={t('Optag og transskriber interviews med Web Speech API', 'Record and transcribe interviews with Web Speech API')}
            >
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>{t('Live Interview Optager', 'Live Recorder')}</span>
            </button>

            <button
              onClick={() => setCurrentTab('audit')}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 hover:text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer border border-emerald-500/30"
            >
              <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('Revisionslog', 'Audit Log')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {auditLogs.length}
              </span>
            </button>

            <button
              onClick={() => setIsExportReportOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer border border-zinc-700"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('Eksporter Rapport', 'Export Report')}</span>
            </button>

            <button
              onClick={() => openDataManager('upload')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/40"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('Upload Sagsdata', 'Upload Case Data')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Google Picker & Drive Quick Sync Banner */}
      <GoogleDriveSync />

      {/* DYNAMIC TAB VIEW WITH FRAMER MOTION TRANSITIONS */}
      <AnimatePresence mode="wait">
        {currentTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {/* Executive Case Summary & Metrics */}
            <CaseSynthesisOverview
              summary={summary}
              parties={parties}
              claims={claims}
              onSelectTab={setCurrentTab}
            />

            {/* Investigation Occurrence & Party Mentions Chart */}
            <InvestigationFrequencyChart
              events={timelineEvents}
              documents={documents}
              parties={parties}
              onSelectDocument={(doc) => setSelectedPdfDoc(doc)}
            />

            {/* Quick-Jump Section Navigation Bar with Data Action */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {t('Hovedsektioner i Sagsarkivet:', 'Main Case Interface Sections:')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="#section-timeline"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {t('Kronologisk Tidslinje (2022-2026)', 'Chronological Timeline')}
                </a>
                <a
                  href="#section-search"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  {t('Fuldtekst Sagsindeks', 'Full-Text Index')}
                </a>
                <a
                  href="#section-evidence"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  {t('Bevismateriale (Evidence List)', 'Evidence List')}
                </a>
                <button
                  onClick={() => setCurrentTab('audit')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                  {t('Revisionslog & Kæde', 'Audit Log & Custody')}
                </button>
                <button
                  onClick={() => openDataManager('upload')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  {t('Tilføj Ægte Data / Filer', 'Add Real Data / Files')}
                </button>
              </div>
            </div>

            {/* SECTION 1: CHRONOLOGICAL TIMELINE */}
            <section id="section-timeline" className="space-y-4 pt-2">
              <ChronologicalTimeline
                events={timelineEvents}
                documents={documents}
                parties={parties}
                onSelectDocument={() => setCurrentTab('findings')}
                onUpdateEvent={updateTimelineEvent}
              />
            </section>

            {/* SECTION 2: FULL-TEXT SEARCH INDEX */}
            <section id="section-search" className="space-y-4 pt-4">
              <DocumentSearchIndex
                documents={documents}
                parties={parties}
                onSelectDocument={() => setCurrentTab('findings')}
                onSelectParty={() => setCurrentTab('parties')}
              />
            </section>

            {/* SECTION 2.5: D3.JS PARTY RELATIONSHIP & INTERACTION GRAPH */}
            <section id="section-relationships" className="space-y-4 pt-4">
              <PartyRelationshipGraph
                parties={parties}
                documents={documents}
                transcripts={transcripts}
                claims={claims}
                onSelectDocument={(docId) => setCurrentTab('findings')}
              />
            </section>

            {/* SECTION 3: EVIDENCE LIST & FINDINGS */}
            <section id="section-evidence" className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {t('Bevismateriale & Aktindsigter (Evidence List)', 'Evidence List & Forensic Filings')}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {documents.length} {t('Aktindsigter', 'Files')}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {t(
                        'Komplet katalog over indekserede FABU samværsrapporter, mødelydfiler, tilsynsnotater og SHA-256 validerede aktindsigter.',
                        'Full evidence repository with FABU visitation reports, audio wiretaps, inspection notes, and SHA-256 verification.'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openDataManager('upload')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-zinc-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('Upload Filer', 'Upload Files')}</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('drive')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-emerald-500/20"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>{t('Drive Kildearkiv', 'Drive Archive')}</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('findings')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-emerald-500/20"
                  >
                    <span>{t('Fuld Bevisliste', 'Full Evidence View')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <EvidenceList
                documents={documents}
                onOpenDocModal={(doc) => setSelectedPdfDoc(doc)}
                onAskAIWithDoc={(doc) => {
                  setSelectedDocIdForAssistant(doc.id);
                  setCurrentTab('assistant');
                }}
              />
            </section>

            {/* SECTION 4: AI CASE ASSISTANT */}
            <section id="section-assistant" className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {t('AI Forensisk Sagskonsulent (The Brew Method)', 'AI Forensic Case Assistant (The Brew Method)')}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-normal">
                        8-Trins Analyse
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {t(
                        `Stil spørgsmål om sagens ${documents.length} dokumenter, FABU-udtalelser, mødelydfiler og forvaltningsakter efter 8-trins analysen.`,
                        `Query all ${documents.length} case documents, FABU statements, meeting tapes, and municipal records with the 8-step framework.`
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab('assistant')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-emerald-500/20 shrink-0"
                >
                  <span>{t('Fuld AI Konsulent', 'Expand Full Assistant')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <AIChatBox
                activeDocument={documents.find(d => d.id === selectedDocIdForAssistant) || selectedPdfDoc || documents[0]}
                onSelectEvidence={(docId) => {
                  setSelectedDocIdForAssistant(docId);
                  const foundDoc = documents.find(d => d.id === docId || d.docNumber === docId);
                  if (foundDoc) setSelectedPdfDoc(foundDoc);
                }}
                onSelectParty={() => setCurrentTab('parties')}
                onJumpToTimelineDate={() => setCurrentTab('timeline')}
              />
            </section>
          </motion.div>
        )}

        {/* DEDICATED FULL-TAB VIEWS */}
        {currentTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <InvestigationReportsViewer
              onSelectDocument={(docId) => {
                const found = documents.find(d => d.id === docId || d.docNumber === docId);
                if (found) setSelectedPdfDoc(found);
                else setCurrentTab('findings');
              }}
              onSelectParty={() => setCurrentTab('parties')}
              onJumpToTimelineDate={() => setCurrentTab('timeline')}
              onOpenExportModal={() => setIsExportReportOpen(true)}
            />
          </motion.div>
        )}

        {currentTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <EvidenceTimeline
              onSelectDocument={(doc) => setSelectedPdfDoc(doc)}
              onSelectTranscript={(tr) => {
                setCurrentTab('transcripts');
              }}
              onAskAIWithEvent={(evt) => {
                setSelectedDocIdForAssistant(evt.sourceDocId || evt.sourceDocumentIds?.[0] || 'DOC-01');
                setCurrentTab('assistant');
              }}
            />
          </motion.div>
        )}

        {currentTab === 'findings' && (
          <motion.div
            key="findings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <DocumentSearchIndex
              documents={documents}
              parties={parties}
              onSelectDocument={(doc) => setSelectedPdfDoc(doc)}
              onSelectParty={() => setCurrentTab('parties')}
            />
            <div className="pt-6 border-t border-zinc-800">
              <EvidenceList
                documents={documents}
                onOpenDocModal={(doc) => setSelectedPdfDoc(doc)}
                onAskAIWithDoc={(doc) => {
                  setSelectedDocIdForAssistant(doc.id);
                  setCurrentTab('assistant');
                }}
              />
            </div>
          </motion.div>
        )}

        {currentTab === 'transcripts' && (
          <motion.div
            key="transcripts"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* AudioTranscriptionPanel using browser MediaRecorder API and Gemini AI */}
            <AudioTranscriptionPanel
              onSavedToCase={(newDoc) => {
                setSelectedPdfDoc(newDoc);
              }}
              onAskAIWithTranscript={(text) => {
                setCurrentTab('assistant');
              }}
            />

            <div className="p-4 bg-gradient-to-r from-red-950/40 via-zinc-900 to-emerald-950/40 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{t('Real-Time Live Tale-til-Tekst Mødeoptager', 'Real-Time Live Speech-to-Text Recorder')}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30">
                      Web Speech API
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {t(
                      'Live transskribering med taler-bogmærker og afhøringsskabelon i realtid.',
                      'Live continuous speech transcription with speaker bookmarks and real-time tagging.'
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTranscriberOpen(true)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer shrink-0"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{t('Start Nyt Live Interview', 'Start Live Interview')}</span>
              </button>
            </div>

            <TranscriptViewer />
            <div className="pt-8 border-t border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-6">Advanced Search</h3>
              <TranscriptSearchPanel
                snippets={transcripts}
              />
            </div>
          </motion.div>
        )}

        {currentTab === 'mapper' && (
          <motion.div
            key="mapper"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <ConnectionMapper
              parties={parties}
              documents={documents}
              transcripts={transcripts}
              claims={claims}
              onSelectDocument={(docId) => {
                const foundDoc = documents.find(d => d.id === docId || d.docNumber === docId);
                if (foundDoc) setSelectedPdfDoc(foundDoc);
                else setCurrentTab('findings');
              }}
              onSelectParty={() => {
                setCurrentTab('parties');
              }}
            />
          </motion.div>
        )}

        {currentTab === 'parties' && (
          <motion.div
            key="parties"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t('Netværks- & Forbindelsesgraf (D3)', 'Network & Connection Graph (D3)')}</h4>
                  <p className="text-xs text-zinc-400">{t('Udforsk relationer og dokumentforbindelser på tværs af hele sagsakterne.', 'Explore multi-entity co-occurrence networks and institutional ties.')}</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab('mapper')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{t('Åbn Connection Mapper', 'Open Connection Mapper')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <PartyRelationshipGraph
              parties={parties}
              documents={documents}
              transcripts={transcripts}
              claims={claims}
              onSelectDocument={(docId) => {
                const foundDoc = documents.find(d => d.id === docId || d.docNumber === docId);
                if (foundDoc) setSelectedPdfDoc(foundDoc);
                else setCurrentTab('findings');
              }}
            />
            <div className="pt-6 border-t border-zinc-800">
              <PartySignals
                onSelectParty={(party) => {}}
                onSelectDocument={(doc) => {
                  setSelectedPdfDoc(doc);
                }}
                onAskAIAboutParty={(partyName) => {
                  setSelectedDocIdForAssistant(null);
                  setCurrentTab('assistant');
                }}
              />
            </div>
            <div className="pt-6 border-t border-zinc-800">
              <h3 className="text-xl font-bold text-white mb-6">{t('Partskatalog & Tekniske Profiler', 'Party Directory & Profiles')}</h3>
              <CasePartyDirectoryPanel
                parties={parties}
              />
            </div>
          </motion.div>
        )}

        {currentTab === 'claims' && (
          <motion.div
            key="claims"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <CaseSeriousClaimsRegisterPanel
              claims={claims}
            />
          </motion.div>
        )}

        {currentTab === 'queue' && (
          <motion.div
            key="queue"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <CaseControlQueuePanel
              items={controlQueue}
            />
          </motion.div>
        )}

        {/* INVESTIGATION AUDIT LOG TAB */}
        {currentTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <InvestigationAuditLog
              onSelectTarget={(targetType, targetId) => {
                if (targetType === 'document') setCurrentTab('findings');
                else if (targetType === 'party') setCurrentTab('parties');
                else if (targetType === 'claim') setCurrentTab('claims');
                else if (targetType === 'transcript') setCurrentTab('transcripts');
              }}
            />
          </motion.div>
        )}

        {currentTab === 'drive' && (
          <motion.div
            key="drive"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <DriveSourceLibrary />
          </motion.div>
        )}

        {currentTab === 'infographics' && (
          <motion.div
            key="infographics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <PublicInfographicGallery
              infographics={infographics}
            />
          </motion.div>
        )}

        {currentTab === 'assistant' && (
          <motion.div
            key="assistant"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <AICaseAssistant
              onSelectDocument={(doc) => {
                setSelectedPdfDoc(doc);
              }}
            />

            <div className="pt-6 border-t border-zinc-800">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">
                {t('Aktiv Dokumentkontekst & Dybdegående Granskning', 'Active Document Context & In-Depth Review')}
              </h4>
              <AIChatBox
                activeDocument={documents.find(d => d.id === selectedDocIdForAssistant) || selectedPdfDoc || documents[0]}
                onSelectEvidence={(docId) => {
                  setSelectedDocIdForAssistant(docId);
                  const foundDoc = documents.find(d => d.id === docId || d.docNumber === docId);
                  if (foundDoc) setSelectedPdfDoc(foundDoc);
                }}
                onSelectParty={() => setCurrentTab('parties')}
                onJumpToTimelineDate={() => setCurrentTab('timeline')}
              />
            </div>
          </motion.div>
        )}

        {currentTab === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <DocumentSearchIndex
              documents={documents}
              parties={parties}
              onSelectDocument={(doc) => setSelectedPdfDoc(doc)}
              onSelectParty={() => setCurrentTab('parties')}
            />
            <DynamicCaseSearch
              onSelectResult={(type, item) => {
                if (type === 'document') {
                  setSelectedPdfDoc(item);
                } else if (type === 'party') {
                  setCurrentTab('parties');
                } else if (type === 'transcript') {
                  setCurrentTab('evidence');
                } else if (type === 'claim') {
                  setCurrentTab('claims');
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sagsdata & Evidence Manager Modal */}
      <CaseDataManagerModal
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
        defaultTab={dataManagerTab}
      />

      {/* Full Document & PDF Viewing Modal */}
      <PDFDocumentViewerModal
        isOpen={!!selectedPdfDoc}
        document={selectedPdfDoc}
        parties={parties}
        timelineEvents={timelineEvents}
        onClose={() => setSelectedPdfDoc(null)}
        onSelectParty={() => {
          setSelectedPdfDoc(null);
          setCurrentTab('parties');
        }}
        onJumpToTimelineDate={() => {
          setSelectedPdfDoc(null);
          setCurrentTab('timeline');
        }}
        onAskAIWithDoc={(doc) => {
          setSelectedPdfDoc(null);
          setSelectedDocIdForAssistant(doc.id);
          setCurrentTab('assistant');
        }}
      />

      {/* Formatted PDF Report Export Modal */}
      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
      />

      {/* Real-Time Audio Interview & Web Speech API Transcriber Modal */}
      <RealTimeTranscriberModal
        isOpen={isTranscriberOpen}
        onClose={() => setIsTranscriberOpen(false)}
        onTranscriptSaved={(newDoc) => {
          setSelectedPdfDoc(newDoc);
        }}
      />
    </DashboardLayout>
  );
}
