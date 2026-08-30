import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  FileText,
  Users,
  ShieldAlert,
  Clock,
  Download,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Sparkles,
  X,
  FileUp,
  HardDrive
} from 'lucide-react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui/UIPrimitives';

interface CaseDataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'upload' | 'add-doc' | 'add-party' | 'add-claim' | 'add-event' | 'import-export';
}

export function CaseDataManagerModal({ isOpen, onClose, defaultTab = 'upload' }: CaseDataManagerModalProps) {
  const { t } = useLanguage();
  const {
    summary,
    parties,
    documents,
    claims,
    timelineEvents,
    uploadRealFile,
    addDocument,
    addParty,
    addClaim,
    addTimelineEvent,
    importCaseJson,
    exportCaseJson,
    resetToEmptyCase,
    resetToVerifiedCase
  } = useCaseData();

  const [activeTab, setActiveTab] = useState<'upload' | 'add-doc' | 'add-party' | 'add-claim' | 'add-event' | 'import-export'>(defaultTab);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Document Form State
  const [docForm, setDocForm] = useState({
    title: '',
    docNumber: `DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().split('T')[0],
    sourceType: 'report' as const,
    category: 'document' as const,
    author: '',
    summary: '',
    significance: 'noteworthy' as const,
    partiesInvolved: '',
    excerpt: '',
    verified: true
  });

  // New Party Form State
  const [partyForm, setPartyForm] = useState({
    name: '',
    role: '',
    organization: '',
    riskLevel: 'medium' as const,
    phone: '',
    email: '',
    notes: ''
  });

  // New Claim Form State
  const [claimForm, setClaimForm] = useState({
    claimId: `CLM-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
    claimant: '',
    targetParty: '',
    category: 'Financial Irregularity' as const,
    severity: 'high' as const,
    status: 'Under Review' as const,
    description: '',
    evidenceRefs: ''
  });

  // New Event Form State
  const [eventForm, setEventForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    title: '',
    category: 'Key Incident' as const,
    description: '',
    location: '',
    financialAmount: '',
    significance: 'high' as const
  });

  if (!isOpen) return null;

  // Handle Real File Upload
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadStatus(t('Uploader og indekserer ægte sagsfiler...', 'Uploading and indexing real case files...'));
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadRealFile(file);
      }
      setUploadStatus(t(`Succes! ${files.length} ægte fil(er) tilføjet til sagsarkivet.`, `Success! ${files.length} real file(s) added to case archive.`));
      setTimeout(() => setUploadStatus(null), 4000);
    } catch (err) {
      setUploadStatus(t('Fejl ved indlæsning af filer.', 'Error uploading files.'));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title.trim()) return;

    addDocument({
      ...docForm,
      partiesInvolved: docForm.partiesInvolved.split(',').map(s => s.trim()).filter(Boolean),
      fileSize: "1.2 MB"
    });

    setUploadStatus(t('Ægte dokument oprettet i arkivet!', 'Real document created in case archive!'));
    setTimeout(() => setUploadStatus(null), 3000);
    setDocForm({
      title: '',
      docNumber: `DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      sourceType: 'report',
      category: 'document',
      author: '',
      summary: '',
      significance: 'noteworthy',
      partiesInvolved: '',
      excerpt: '',
      verified: true
    });
  };

  const handlePartySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyForm.name.trim()) return;

    addParty({
      name: partyForm.name,
      role: partyForm.role || "Sagsrelevant Part",
      organization: partyForm.organization || "Ukendt Organisation",
      riskLevel: partyForm.riskLevel,
      technicalSignals: {
        deviceCount: 1,
        emailAccounts: partyForm.email ? 1 : 0,
        phoneNumbers: partyForm.phone ? [partyForm.phone] : [],
        ipAddresses: [],
        lastActivity: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' CET'
      },
      keyMentionsCount: 1,
      claimsCount: 0,
      documentsLinked: 0,
      notes: partyForm.notes || "Oprettet manuelt i aktiv sag."
    });

    setUploadStatus(t('Ny part tilføjet til sagen!', 'New party added to case!'));
    setTimeout(() => setUploadStatus(null), 3000);
    setPartyForm({
      name: '',
      role: '',
      organization: '',
      riskLevel: 'medium',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.description.trim() || !claimForm.targetParty.trim()) return;

    addClaim({
      ...claimForm,
      evidenceRefs: claimForm.evidenceRefs.split(',').map(s => s.trim()).filter(Boolean),
      registeredDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    });

    setUploadStatus(t('Ny påstand / mistanke registreret!', 'New claim / allegation registered!'));
    setTimeout(() => setUploadStatus(null), 3000);
    setClaimForm({
      claimId: `CLM-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      claimant: '',
      targetParty: '',
      category: 'Financial Irregularity',
      severity: 'high',
      status: 'Under Review',
      description: '',
      evidenceRefs: ''
    });
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.date.trim()) return;

    addTimelineEvent({
      ...eventForm,
      partyIds: [],
      verified: true
    });

    setUploadStatus(t('Hændelse tilføjet til tidslinjen!', 'Event added to timeline!'));
    setTimeout(() => setUploadStatus(null), 3000);
    setEventForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      title: '',
      category: 'Key Incident',
      description: '',
      location: '',
      financialAmount: '',
      significance: 'high'
    });
  };

  const handleExportDownload = () => {
    const jsonStr = exportCaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sagsdossier_${summary.caseNumber}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    setImportSuccess(null);
    if (!importText.trim()) {
      setImportError(t('Indsæt venligst gyldig JSON sagsdata.', 'Please paste valid JSON case data.'));
      return;
    }
    const success = importCaseJson(importText);
    if (success) {
      setImportSuccess(t('Sagsdata importeret og synkroniseret!', 'Case data successfully imported and synced!'));
      setImportText('');
    } else {
      setImportError(t('Kunne ikke fortolke JSON-data. Kontrollér formatet.', 'Could not parse JSON data. Check format.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t('Sagsdatastyring & Ægte Beviser', 'Case Data & Real Evidence Manager')}
                <Badge variant="indigo" className="text-[10px] font-mono">
                  {summary.caseNumber}
                </Badge>
              </h2>
              <p className="text-xs text-slate-400">
                {t('Administrér ægte sagsakter, upload filer, tilføj parter og eksportér verificerede sagsdossierer.', 'Manage real case files, upload documents, register parties, and export verified dossiers.')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            {t('Upload Ægte Filer', 'Upload Real Files')}
          </button>

          <button
            onClick={() => setActiveTab('add-doc')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'add-doc' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {t('Opret Sagsakt / Bevis', 'Create Document')}
          </button>

          <button
            onClick={() => setActiveTab('add-party')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'add-party' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t('Tilføj Part', 'Add Party')}
          </button>

          <button
            onClick={() => setActiveTab('add-claim')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'add-claim' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {t('Registrér Påstand', 'Register Claim')}
          </button>

          <button
            onClick={() => setActiveTab('add-event')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'add-event' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {t('Tilføj Hændelse', 'Add Event')}
          </button>

          <button
            onClick={() => setActiveTab('import-export')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'import-export' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {t('Import & Eksport', 'Import & Export')}
          </button>
        </div>

        {/* Global Alert / Status Feedback */}
        {uploadStatus && (
          <div className="mx-5 mt-4 p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: UPLOAD REAL FILES */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : 'border-slate-700 bg-slate-950/50 hover:border-indigo-500/50 hover:bg-slate-900/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.eml,.msg,.mp3,.wav,.m4a,.flac,.jpg,.jpeg,.png,.svg,.zip"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileUp className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {t('Træk og slip ægte sagsfiler her, eller klik for at vælge', 'Drag & drop real case files here, or click to browse')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('Understøtter PDF, Lydoptagelser (MP3/WAV), Billeder/Fotos, E-mails (.EML), Excel/CSV og Tekstdokumenter.', 'Supports PDF, Audio recordings (MP3/WAV), Images/Photos, Emails (.EML), Excel/CSV, and Text documents.')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">PDF</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">MP3 / WAV</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">JPG / PNG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">EML / MSG</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">CSV / XLSX</span>
                </div>
              </div>

              {/* Current Active Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">{t('Aktive Sagsakter', 'Active Documents')}</div>
                  <div className="text-xl font-bold text-white font-mono">{documents.length}</div>
                </div>
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">{t('Registrerede Parter', 'Registered Parties')}</div>
                  <div className="text-xl font-bold text-indigo-300 font-mono">{parties.length}</div>
                </div>
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">{t('Aktive Påstande', 'Active Claims')}</div>
                  <div className="text-xl font-bold text-amber-300 font-mono">{claims.length}</div>
                </div>
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">{t('Tidslinjehændelser', 'Timeline Events')}</div>
                  <div className="text-xl font-bold text-emerald-300 font-mono">{timelineEvents.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE REAL DOCUMENT */}
          {activeTab === 'add-doc' && (
            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Dokumenttitel / Aktnavn *', 'Document Title *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    placeholder="f.eks. Bankoverførsel Kvittering #9901"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Aktnummer (DOC ID)', 'Document Number')}
                  </label>
                  <input
                    type="text"
                    value={docForm.docNumber}
                    onChange={(e) => setDocForm({ ...docForm, docNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Dato *', 'Date *')}
                  </label>
                  <input
                    type="date"
                    required
                    value={docForm.date}
                    onChange={(e) => setDocForm({ ...docForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Kategori / Type', 'Category / Type')}
                  </label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="document">{t('Sagsakt / Rapport', 'Document / Report')}</option>
                    <option value="audio">{t('Lydoptagelse / Aflytning', 'Audio Recording')}</option>
                    <option value="image">{t('Foto / Kriminalteknisk Billede', 'Photo / Image')}</option>
                    <option value="email">{t('E-mail Korrespondance', 'Email Correspondence')}</option>
                    <option value="financial">{t('Finansiel / Bogføring', 'Financial / Ledger')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Betydning / Vægt', 'Significance')}
                  </label>
                  <select
                    value={docForm.significance}
                    onChange={(e) => setDocForm({ ...docForm, significance: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="routine">{t('Rutine (Lav)', 'Routine (Low)')}</option>
                    <option value="noteworthy">{t('Bemærkelsesværdig (Mellem)', 'Noteworthy (Medium)')}</option>
                    <option value="critical">{t('Kritisk Hovedbevis (Høj)', 'Critical Key Evidence')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('Udsteder / Forfatter', 'Author / Origin')}
                </label>
                <input
                  type="text"
                  value={docForm.author}
                  onChange={(e) => setDocForm({ ...docForm, author: e.target.value })}
                  placeholder="f.eks. Revisionsudvalget / Sagsbehandler"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('Resumé / Sammenfatning *', 'Summary *')}
                </label>
                <textarea
                  required
                  rows={2}
                  value={docForm.summary}
                  onChange={(e) => setDocForm({ ...docForm, summary: e.target.value })}
                  placeholder="Kort beskrivelse af dokumentets indhold og betydning for sagen..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('Uddrag / Tekstudsnit (Excerpt)', 'Excerpt / Key Quote')}
                </label>
                <textarea
                  rows={2}
                  value={docForm.excerpt}
                  onChange={(e) => setDocForm({ ...docForm, excerpt: e.target.value })}
                  placeholder="Citat eller nøgleafsnit fra bilaget..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" variant="primary">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t('Opret og Indsæt Sagsakt', 'Create and Insert Document')}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: ADD PARTY */}
          {activeTab === 'add-party' && (
            <form onSubmit={handlePartySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Partens Navn *', 'Party Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={partyForm.name}
                    onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                    placeholder="f.eks. Peter Hansen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Rolle i Sagen', 'Role in Case')}
                  </label>
                  <input
                    type="text"
                    value={partyForm.role}
                    onChange={(e) => setPartyForm({ ...partyForm, role: e.target.value })}
                    placeholder="f.eks. Revisor / Vidne / Rådgiver"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Organisation / Selskab', 'Organization')}
                  </label>
                  <input
                    type="text"
                    value={partyForm.organization}
                    onChange={(e) => setPartyForm({ ...partyForm, organization: e.target.value })}
                    placeholder="f.eks. Lyngby-Taarbæk Kommune"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Risikoniveau', 'Risk Level')}
                  </label>
                  <select
                    value={partyForm.riskLevel}
                    onChange={(e) => setPartyForm({ ...partyForm, riskLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="low">{t('Lav Risiko (Vidne/Myndighed)', 'Low Risk')}</option>
                    <option value="medium">{t('Mellem Risiko (Rådgiver/Tilknyttet)', 'Medium Risk')}</option>
                    <option value="high">{t('Høj Risiko (Nøgleperson)', 'High Risk')}</option>
                    <option value="critical">{t('Kritisk Risiko (Hovedmistænkt)', 'Critical Risk')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Telefonnummer', 'Phone Number')}
                  </label>
                  <input
                    type="text"
                    value={partyForm.phone}
                    onChange={(e) => setPartyForm({ ...partyForm, phone: e.target.value })}
                    placeholder="+45 XX XX XX XX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('E-mailadresse', 'Email Address')}
                  </label>
                  <input
                    type="email"
                    value={partyForm.email}
                    onChange={(e) => setPartyForm({ ...partyForm, email: e.target.value })}
                    placeholder="navn@domæne.dk"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('Efterforskningsnotater', 'Investigative Notes')}
                </label>
                <textarea
                  rows={2}
                  value={partyForm.notes}
                  onChange={(e) => setPartyForm({ ...partyForm, notes: e.target.value })}
                  placeholder="Noter om personens ageren og forbindelse til sagen..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" variant="primary">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t('Registrér Part i Sagen', 'Register Party in Case')}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 4: REGISTER CLAIM */}
          {activeTab === 'add-claim' && (
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Målpart / Modpart (Target Party) *', 'Target Party *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={claimForm.targetParty}
                    onChange={(e) => setClaimForm({ ...claimForm, targetParty: e.target.value })}
                    placeholder="f.eks. Luca De Angelis"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Anmelder / Kilde (Claimant)', 'Claimant / Source')}
                  </label>
                  <input
                    type="text"
                    value={claimForm.claimant}
                    onChange={(e) => setClaimForm({ ...claimForm, claimant: e.target.value })}
                    placeholder="f.eks. Revisionsudvalget / Henrik Møller"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Kategori', 'Category')}
                  </label>
                  <select
                    value={claimForm.category}
                    onChange={(e) => setClaimForm({ ...claimForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Financial Irregularity">{t('Finansiel Uregelmæssighed', 'Financial Irregularity')}</option>
                    <option value="Breach of Protocol">{t('Protokolbrud', 'Breach of Protocol')}</option>
                    <option value="Conflict of Interest">{t('Interessekonflikt', 'Conflict of Interest')}</option>
                    <option value="Misrepresentation">{t('Vildledende Oplysninger', 'Misrepresentation')}</option>
                    <option value="Security Incident">{t('Sikkerhedshændelse', 'Security Incident')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Alvorsgrad', 'Severity')}
                  </label>
                  <select
                    value={claimForm.severity}
                    onChange={(e) => setClaimForm({ ...claimForm, severity: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="high">{t('Høj', 'High')}</option>
                    <option value="critical">{t('Kritisk', 'Critical')}</option>
                    <option value="severe">{t('Alvorlig', 'Severe')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Status', 'Status')}
                  </label>
                  <select
                    value={claimForm.status}
                    onChange={(e) => setClaimForm({ ...claimForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Under Review">{t('Under Granskning', 'Under Review')}</option>
                    <option value="Substantiated">{t('Underbygget / Dokumenteret', 'Substantiated')}</option>
                    <option value="Pending Evidence">{t('Afventer Beviser', 'Pending Evidence')}</option>
                    <option value="Refuted">{t('Afvist', 'Refuted')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('Påstandens Beskrivelse *', 'Claim Description *')}
                </label>
                <textarea
                  required
                  rows={2}
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  placeholder="Detaljeret beskrivelse af overtrædelsen..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('Bevisreferencer (kommasepareret DOC-IDs)', 'Evidence References (comma separated)')}
                </label>
                <input
                  type="text"
                  value={claimForm.evidenceRefs}
                  onChange={(e) => setClaimForm({ ...claimForm, evidenceRefs: e.target.value })}
                  placeholder="DOC-2026-001A, DOC-2026-044E"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" variant="primary">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t('Opret Påstand', 'Register Claim')}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 5: ADD EVENT */}
          {activeTab === 'add-event' && (
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Dato *', 'Date *')}
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Klokkeslæt', 'Time')}
                  </label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    placeholder="14:30"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Kategori', 'Category')}
                  </label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Key Incident">{t('Hovedhændelse', 'Key Incident')}</option>
                    <option value="Financial Transaction">{t('Finansiel Transaktion', 'Financial Transaction')}</option>
                    <option value="Communication">{t('Kommunikation / Opkald', 'Communication')}</option>
                    <option value="Document Filing">{t('Dokumentindlevering', 'Document Filing')}</option>
                    <option value="Regulatory Action">{t('Myndighedshandling', 'Regulatory Action')}</option>
                    <option value="Whistleblower Action">{t('Whistleblower Handling', 'Whistleblower Action')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('Hændelsestitel *', 'Event Title *')}
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="f.eks. Uautoriseret bankoverførsel gennemført"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Lokation / Sted', 'Location')}
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="f.eks. København / Genève"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('Finansielt Beløb (hvis relevant)', 'Financial Amount')}
                  </label>
                  <input
                    type="text"
                    value={eventForm.financialAmount}
                    onChange={(e) => setEventForm({ ...eventForm, financialAmount: e.target.value })}
                    placeholder="f.eks. €4.200.000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('Beskrivelse', 'Description')}
                </label>
                <textarea
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Kort redegørelse for hvad der skete på denne dato..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" variant="primary">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t('Tilføj til Tidslinje', 'Add to Timeline')}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 6: IMPORT & EXPORT */}
          {activeTab === 'import-export' && (
            <div className="space-y-6">
              {/* Export Box */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-400" />
                    {t('Eksportér Fuldt Sagsdossier (JSON)', 'Export Complete Case Dossier (JSON)')}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('Downloader alle aktive sagsakter, parter, påstande, tidslinjer og kontrolopgaver som struktureret JSON-fil.', 'Downloads all active documents, parties, claims, timeline events, and tasks as structured JSON.')}
                  </p>
                </div>
                <Button onClick={handleExportDownload} variant="primary" className="shrink-0">
                  <Download className="w-4 h-4 mr-1.5" />
                  {t('Download Sagsfil', 'Download Case File')}
                </Button>
              </div>

              {/* Import Box */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  {t('Importér Sagsdata (JSON format)', 'Import Case Data (JSON)')}
                </h4>
                <p className="text-xs text-slate-400">
                  {t('Indsæt et eksporteret sagsdossier for at indlæse det direkte i platformen.', 'Paste an exported case JSON bundle to load it directly into the platform.')}
                </p>

                <textarea
                  rows={4}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='{"summary": {...}, "documents": [...], "parties": [...]}'
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                />

                {importError && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{importSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleImportSubmit} variant="secondary">
                    {t('Importér Data', 'Import Data')}
                  </Button>
                </div>
              </div>

              {/* Archive Maintenance & Reset Actions */}
              <div className="p-5 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    {t('Nulstil eller Genindlæs Sagsarkiv', 'Reset or Reload Case Archive')}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('Start en helt ny tom sag, eller genindlæs det verificerede officielle arkiv.', 'Start a clean blank investigation or reload the verified official archive.')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (confirm(t('Er du sikker på, at du vil rydde alle data og starte en tom sag?', 'Are you sure you want to clear all data and start a blank case?'))) {
                        resetToEmptyCase();
                        onClose();
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('Tom Sag (Blank Slate)', 'Clean Slate (Blank)')}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(t('Genindlæs det verificerede Lyngby-Taarbæk / DAVLuca sagsarkiv?', 'Reload the verified Lyngby-Taarbæk / DAVLuca case archive?'))) {
                        resetToVerifiedCase();
                        onClose();
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t('Genindlæs Verificeret Arkiv', 'Reload Verified Archive')}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t('Data gemmes automatisk lokalt i din browser', 'Data is saved automatically in local storage')}</span>
          </div>

          <Button variant="ghost" onClick={onClose}>
            {t('Luk', 'Close')}
          </Button>
        </div>

      </div>
    </div>
  );
}
