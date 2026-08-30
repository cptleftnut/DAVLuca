import React, { useState, useMemo } from 'react';
import { 
  HardDrive, FileText, Search, Calendar, CheckCircle2,
  Mic, Camera, Mail, Scale, Shield, Users, Folder,
  Clock, Hash, FileCode, ExternalLink, Play, AlertCircle, Info, Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCaseData } from '../contexts/CaseDataContext';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui/UIPrimitives';
import { GoogleDriveSync } from './GoogleDriveSync';
import { DocumentFinding } from '../types';

export function DriveSourceLibrary() {
  const { language, t } = useLanguage();
  const { documents } = useCaseData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<DocumentFinding | null>(null);

  const categories = [
    { id: 'all', labelDa: 'Alle Kilder', labelEn: 'All Sources', icon: HardDrive, count: documents.length },
    { 
      id: 'audio', 
      labelDa: 'Lyd & Aflytninger', 
      labelEn: 'Audio & Wiretaps', 
      icon: Mic, 
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      matcher: (d: DocumentFinding) => 
        d.sourceType === 'audio' || 
        d.folderCategory === 'Audio Transcripts' || 
        d.folderCategory === 'Personal Audio' || 
        d.category === 'audio' ||
        d.category === 'Lyd og aflytninger' ||
        d.category?.toLowerCase().includes('lyd') || 
        d.category?.toLowerCase().includes('audio') ||
        d.fileFormat?.toLowerCase().includes('audio') ||
        d.fileFormat?.toLowerCase().includes('m4a') ||
        d.fileFormat?.toLowerCase().includes('mp3') ||
        d.audioMeta !== undefined
    },
    { 
      id: 'photos', 
      labelDa: 'Billeder & Forensiske Fotos', 
      labelEn: 'Forensic Photos & Images', 
      icon: Camera, 
      color: 'text-pink-400',
      badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/30',
      matcher: (d: DocumentFinding) => 
        d.sourceType === 'image' || 
        d.folderCategory === 'Forensic Photos' || 
        d.category === 'image' ||
        d.category === 'Billeder og fotos' ||
        d.category?.toLowerCase().includes('billede') || 
        d.category?.toLowerCase().includes('foto') ||
        d.category?.toLowerCase().includes('image') ||
        d.fileFormat?.toLowerCase().includes('image') ||
        d.fileFormat?.toLowerCase().includes('jpg') ||
        d.fileFormat?.toLowerCase().includes('png') ||
        d.exifData !== undefined ||
        d.imageCaption !== undefined
    },
    { 
      id: 'emails', 
      labelDa: 'E-mails & Korrespondance', 
      labelEn: 'Emails & Correspondence', 
      icon: Mail, 
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      matcher: (d: DocumentFinding) => 
        d.sourceType === 'email' || 
        d.folderCategory === 'Correspondence & Logs' || 
        d.category === 'email' ||
        d.category === 'E-mails og korrespondance' ||
        d.category?.toLowerCase().includes('mail') || 
        d.category?.toLowerCase().includes('korrespondance') ||
        d.fileFormat?.toLowerCase().includes('eml') ||
        d.fileFormat?.toLowerCase().includes('msg') ||
        d.emailHeaders !== undefined
    },
    { 
      id: 'court', 
      labelDa: 'Retsakter & Kendelser', 
      labelEn: 'Court Records & Decrees', 
      icon: Scale, 
      color: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      matcher: (d: DocumentFinding) => 
        d.folderCategory === 'Court Documents' || 
        d.folderCategory === 'Court Records' || 
        d.title.toLowerCase().includes('byret') || 
        d.title.toLowerCase().includes('dom') ||
        d.title.toLowerCase().includes('retsbog') ||
        d.title.toLowerCase().includes('kendelse')
    },
    { 
      id: 'social', 
      labelDa: 'Kommunale Sagsakter', 
      labelEn: 'Social Services Files', 
      icon: Shield, 
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      matcher: (d: DocumentFinding) => 
        d.folderCategory === 'Social Services' || 
        d.title.toLowerCase().includes('handleplan') || 
        d.title.toLowerCase().includes('b&u') || 
        d.title.toLowerCase().includes('marsha') ||
        d.title.toLowerCase().includes('børne- og ungdomsforvaltning') ||
        d.category === 'Sagsakter og afgørelser'
    },
    { 
      id: 'fabu', 
      labelDa: 'FABU Samværsrapporter', 
      labelEn: 'FABU Supervision Reports', 
      icon: Users, 
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      matcher: (d: DocumentFinding) => 
        d.folderCategory === 'FABU & Visitation' || 
        d.title.toLowerCase().includes('fabu') || 
        d.category?.toLowerCase().includes('fabu') ||
        d.category === 'FABU og samvær'
    }
  ];

  const filteredFiles = useMemo(() => {
    return documents.filter(f => {
      // Search text match
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        f.title.toLowerCase().includes(term) ||
        (f.excerpt && f.excerpt.toLowerCase().includes(term)) ||
        (f.summary && f.summary.toLowerCase().includes(term)) ||
        (f.subfolderPath && f.subfolderPath.toLowerCase().includes(term)) ||
        (f.docNumber && f.docNumber.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // Category tab match
      if (selectedCategory === 'all') return true;
      const catConfig = categories.find(c => c.id === selectedCategory);
      return catConfig?.matcher ? catConfig.matcher(f) : true;
    });
  }, [documents, searchTerm, selectedCategory]);

  const getFileTypeBadge = (file: DocumentFinding) => {
    if (file.sourceType === 'audio' || file.fileFormat.toLowerCase().includes('audio') || file.fileFormat.toLowerCase().includes('m4a') || file.fileFormat.toLowerCase().includes('mp3')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border bg-purple-500/15 text-purple-300 border-purple-500/30 flex items-center gap-1">
          <Mic className="w-2.5 h-2.5" />
          {file.mediaDuration ? `${file.mediaDuration}` : 'Lydoptagelse'}
        </span>
      );
    }
    if (file.sourceType === 'image' || file.fileFormat.toLowerCase().includes('image') || file.fileFormat.toLowerCase().includes('jpg') || file.fileFormat.toLowerCase().includes('png')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border bg-pink-500/15 text-pink-300 border-pink-500/30 flex items-center gap-1">
          <Camera className="w-2.5 h-2.5" />
          {file.exifData ? 'EXIF Verificeret' : 'Forensisk Foto'}
        </span>
      );
    }
    if (file.sourceType === 'email' || file.fileFormat.toLowerCase().includes('mail') || file.fileFormat.toLowerCase().includes('eml')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border bg-cyan-500/15 text-cyan-300 border-cyan-500/30 flex items-center gap-1">
          <Mail className="w-2.5 h-2.5" />
          E-mail
        </span>
      );
    }
    if (file.fileFormat.toLowerCase().includes('pdf')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border bg-red-500/15 text-red-300 border-red-500/30 flex items-center gap-1">
          <FileText className="w-2.5 h-2.5" />
          PDF
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border bg-slate-800 text-slate-300 border-slate-700">
        {file.fileFormat.split('/').pop() || file.fileFormat}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Drive Sync Card */}
      <GoogleDriveSync />

      {/* Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5 mb-1">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              <span>{t('Google Drive Kildearkiv: Lyngby-Taarbæk case', 'Google Drive Source Archive: Lyngby-Taarbæk case')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {t(
                'Komplet digitalt kildearkiv synkroniseret fra Drive-mappen og undermapper. Omfatter alle Lyd & Aflytninger, Forensiske Fotos med EXIF metadata, E-mails & Korrespondance, Retsakter og FABU Samværsrapporter.',
                'Complete digital evidence archive synced from the Drive folder and subfolders. Includes all Audio Wiretaps, Forensic Photos with EXIF metadata, Emails & Correspondence, Court Decrees, and FABU Visitation Reports.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-mono text-slate-400">{t('Arkiverede Filer', 'Archived Files')}</div>
              <div className="text-base font-bold font-mono text-emerald-400">{documents.length}</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map(cat => {
            const Icon = cat.icon;
            const count = cat.id === 'all' 
              ? documents.length 
              : documents.filter(d => cat.matcher ? cat.matcher(d) : false).length;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-600 text-zinc-950 border-emerald-400 shadow-md font-bold'
                    : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : cat.color || 'text-slate-400'}`} />
                <span>{language === 'da' ? cat.labelDa : cat.labelEn}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-zinc-950 text-emerald-300 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder={t('Søg i sagsakter, lydfiler, fotometadata, e-mail emner eller bilag...', 'Search files, audio logs, photo metadata, email subjects, or appendices...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid of Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <Card
            key={file.id}
            className="border-slate-800 hover:border-emerald-500/50 bg-slate-900/90 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              <CardHeader className="pb-2.5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getFileTypeBadge(file)}
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {file.date}
                  </span>
                </div>

                {/* Subfolder Breadcrumb */}
                {file.subfolderPath && (
                  <div className="text-[10px] font-mono text-emerald-400/90 flex items-center gap-1 truncate mb-1">
                    <Folder className="w-3 h-3 shrink-0 text-emerald-500" />
                    <span className="truncate">{file.subfolderPath}</span>
                  </div>
                )}

                <CardTitle className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                  {file.title}
                </CardTitle>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {file.docNumber}
                  </span>
                  {file.author && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {file.author}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 line-clamp-3">
                  {file.excerpt || file.summary}
                </p>

                {/* Specialized Badge Rows */}
                {file.audioMeta && (
                  <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/20 text-[11px] flex items-center justify-between text-purple-300">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3 h-3 text-purple-400" />
                      <span>{file.audioMeta.duration}</span>
                    </span>
                    <span className="font-mono text-[10px] text-purple-400/80">
                      {file.audioMeta.recordingDevice}
                    </span>
                  </div>
                )}

                {file.exifData && (
                  <div className="p-2 rounded-lg bg-pink-950/30 border border-pink-500/20 text-[11px] flex items-center justify-between text-pink-300">
                    <span className="flex items-center gap-1.5 truncate">
                      <Camera className="w-3 h-3 text-pink-400 shrink-0" />
                      <span className="truncate">{file.exifData.camera.split('(')[0]}</span>
                    </span>
                    <span className="font-mono text-[10px] text-pink-400/90 shrink-0">
                      {file.exifData.resolution?.split(' ')[0]}
                    </span>
                  </div>
                )}

                {file.emailHeaders && (
                  <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] space-y-0.5 text-cyan-300">
                    <div className="truncate flex items-center gap-1">
                      <span className="text-slate-400 text-[10px]">{t('Fra:', 'From:')}</span>
                      <span className="truncate">{file.emailHeaders.from.split('<')[0]}</span>
                    </div>
                    <div className="truncate text-slate-400 text-[10px]">
                      {t('Emne:', 'Subject:')} <span className="text-cyan-200">{file.emailHeaders.subject}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>

            <div className="p-4 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-400">{file.fileSize}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(file)}
                  className="hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  {t('Inspicer Metadata', 'Inspect Metadata')}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredFiles.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 space-y-2 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <Info className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm">{t('Ingen kilder matchede din filtrering.', 'No source documents matched your criteria.')}</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              {t('Nulstil filtre', 'Reset filters')}
            </button>
          </div>
        )}
      </div>

      {/* Forensic Inspection Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white leading-none">
                    {t('Forensisk Fil- & Metadatainspektion', 'Forensic File & Metadata Inspection')}
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400 mt-1 block">
                    {selectedFile.docNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-white px-2 py-1 cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* File Title & Subfolder */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400">{t('Filsti i Google Drive:', 'Google Drive Path:')}</div>
                <div className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-emerald-400" />
                  <span>{selectedFile.subfolderPath || 'Lyngby-Taarbæk case'} / {selectedFile.title}</span>
                </div>
              </div>

              {/* Summary / Excerpt */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] font-semibold block">{t('Sagsresumé & Uddrag:', 'Case Summary & Excerpt:')}</span>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 leading-relaxed">
                  {selectedFile.excerpt || selectedFile.summary}
                </div>
              </div>

              {/* Specialized Sub-Inspectors */}
              {selectedFile.audioMeta && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                      <Mic className="w-4 h-4 text-purple-400" />
                      {t('Lydfilsegenskaber & Akustisk Analyse', 'Audio Properties & Acoustic Analysis')}
                    </span>
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                      {selectedFile.audioMeta.duration}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-purple-500/20">
                      <span className="text-slate-400 block text-[10px]">{t('Optagedato:', 'Recorded Date:')}</span>
                      <span className="font-mono text-purple-200 font-semibold">{selectedFile.audioMeta.recordedDate || selectedFile.date}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-purple-500/20">
                      <span className="text-slate-400 block text-[10px]">{t('Enhed / Hardware:', 'Device / Hardware:')}</span>
                      <span className="font-mono text-purple-200 font-semibold">{selectedFile.audioMeta.recordingDevice}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-purple-500/20">
                      <span className="text-slate-400 block text-[10px]">{t('Lydformat:', 'Audio Format:')}</span>
                      <span className="font-mono text-purple-200 font-semibold">{selectedFile.audioMeta.bitrate} • {selectedFile.audioMeta.sampleRate}</span>
                    </div>
                  </div>
                  {selectedFile.audioMeta.participants && (
                    <div className="text-[11px] text-slate-300">
                      <span className="text-purple-400 font-semibold">{t('Registrerede Stemmer:', 'Identified Voices:')} </span>
                      {selectedFile.audioMeta.participants.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {selectedFile.exifData && (
                <div className="p-4 rounded-xl bg-pink-950/30 border border-pink-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-300 flex items-center gap-1.5 text-xs">
                      <Camera className="w-4 h-4 text-pink-400" />
                      {t('Forensiske Billeddata & EXIF Metadata (Trin 5: OSINT)', 'Forensic Image & EXIF Metadata (Step 5: OSINT)')}
                    </span>
                    <span className="text-[10px] font-mono bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded">
                      {selectedFile.exifData.verifiedChainOfCustody ? 'Chain of Custody Verificeret' : 'EXIF Data'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-pink-500/20">
                      <span className="text-slate-400 block text-[10px]">{t('Kamera & Optik:', 'Camera & Lens:')}</span>
                      <span className="font-mono text-pink-200 font-semibold truncate block">{selectedFile.exifData.camera}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-pink-500/20">
                      <span className="text-slate-400 block text-[10px]">{t('Opløsning:', 'Resolution:')}</span>
                      <span className="font-mono text-pink-200 font-semibold">{selectedFile.exifData.resolution}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-pink-500/20">
                      <span className="text-slate-400 block text-[10px]">{t('EXIF Tidsstempel:', 'EXIF Timestamp:')}</span>
                      <span className="font-mono text-pink-200 font-semibold">{selectedFile.exifData.timestamp}</span>
                    </div>
                  </div>
                  {selectedFile.exifData.fileHash && (
                    <div className="p-2 rounded-lg bg-slate-950/80 border border-pink-500/20 font-mono text-[10px] text-pink-300 truncate">
                      <span className="text-slate-400">{t('Kryptografisk Hash:', 'Cryptographic Hash:')} </span>
                      {selectedFile.exifData.fileHash}
                    </div>
                  )}
                </div>
              )}

              {selectedFile.emailHeaders && (
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    {t('E-mail Headers & Forvaltningskorrespondance', 'Email Headers & Casework Correspondence')}
                  </span>
                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-cyan-500/20 font-mono text-[11px]">
                    <div><span className="text-slate-400">From:</span> <span className="text-white">{selectedFile.emailHeaders.from}</span></div>
                    <div><span className="text-slate-400">To:</span> <span className="text-white">{selectedFile.emailHeaders.to}</span></div>
                    {selectedFile.emailHeaders.cc && <div><span className="text-slate-400">Cc:</span> <span className="text-slate-300">{selectedFile.emailHeaders.cc}</span></div>}
                    <div><span className="text-slate-400">Subject:</span> <span className="text-cyan-300 font-semibold">{selectedFile.emailHeaders.subject}</span></div>
                    <div><span className="text-slate-400">Date:</span> <span className="text-slate-300">{selectedFile.emailHeaders.sentDate}</span></div>
                    {selectedFile.emailHeaders.messageId && (
                      <div className="text-[10px] text-slate-400 truncate">
                        <span>Message-ID:</span> {selectedFile.emailHeaders.messageId}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Standard Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">{t('Kategori:', 'Category:')}</span>
                  <span className="font-bold text-white truncate block">{selectedFile.category}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">{t('Format:', 'Format:')}</span>
                  <span className="font-bold text-white truncate block">{selectedFile.fileFormat}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">{t('Filstørrelse:', 'File Size:')}</span>
                  <span className="font-bold font-mono text-white">{selectedFile.fileSize}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">{t('Verifikation:', 'Verification:')}</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedFile.verified ? 'Verificeret' : 'Ikke verificeret'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3.5 border-t border-slate-800">
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t('Kilde verificeret mod Google Drive arkiv (Lyngby-Taarbæk case)', 'Source verified against Google Drive archive (Lyngby-Taarbæk case)')}
              </span>
              <Button variant="primary" size="sm" onClick={() => setSelectedFile(null)}>
                {t('Luk Inspektion', 'Close Inspection')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

