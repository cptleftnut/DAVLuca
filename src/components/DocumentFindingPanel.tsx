import { useState } from 'react';
import { FileText, CheckCircle2, ShieldAlert, ExternalLink, Search, Filter, HardDrive, Download, Sparkles } from 'lucide-react';
import { DocumentFinding } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';

interface DocumentFindingPanelProps {
  documents: DocumentFinding[];
  onOpenDocModal?: (doc: DocumentFinding) => void;
  onAskAIWithDoc?: (doc: DocumentFinding) => void;
}

export function DocumentFindingPanel({ documents, onOpenDocModal, onAskAIWithDoc }: DocumentFindingPanelProps) {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeDoc, setActiveDoc] = useState<DocumentFinding | null>(documents[0] || null);

  const filteredDocs = documents.filter(doc => {
    const matchesType = selectedType === 'all' || doc.sourceType === selectedType;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const typesDa: Record<string, string> = {
    'all': 'Alle Typer',
    'contract': 'Kontrakt & Fuldmagt',
    'audio': 'Lydtransskript',
    'report': 'Tilsynsnotat',
    'email': 'E-mail Tråd'
  };

  const types = ['all', 'contract', 'audio', 'report', 'email'];

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400 mr-1" />
          {types.map(typeKey => (
            <button
              key={typeKey}
              onClick={() => setSelectedType(typeKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                selectedType === typeKey
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {language === 'da' ? typesDa[typeKey] || typeKey : typeKey}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('Søg i aktindsigter, forfattere, sagsnumre...', 'Search filings, authors, IDs...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 2-Column Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDocs.map(doc => {
            const isSelected = activeDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {doc.docNumber}
                  </span>
                  <Badge variant={doc.significance === 'critical' ? 'critical' : 'medium'}>
                    {language === 'da' ? typesDa[doc.sourceType] || doc.sourceType : doc.sourceType}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-white line-clamp-1 mb-1">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.summary}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>{doc.date}</span>
                  <span>{doc.author}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Document Details */}
        <div className="lg:col-span-7">
          {activeDoc ? (
            <Card className="border-indigo-500/30 sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded">
                      {activeDoc.docNumber}
                    </span>
                    <Badge variant={activeDoc.significance === 'critical' ? 'critical' : 'medium'}>
                      {activeDoc.significance === 'critical' ? t('Kritisk Fund', 'Critical') : t('Vigtig', 'Medium')}
                    </Badge>
                  </div>
                  {activeDoc.verified && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('Verificeret Aktindsigt', 'Verified')}
                    </span>
                  )}
                </div>
                <CardTitle className="mt-2 text-xl font-bold text-white">
                  {activeDoc.title}
                </CardTitle>
                <div className="text-xs text-slate-400 flex flex-wrap gap-4 mt-1">
                  <span>{t('Forfatter/Kilde:', 'Author:')} <strong className="text-slate-200">{activeDoc.author}</strong></span>
                  <span>{t('Dato:', 'Date:')} <strong className="text-slate-200">{activeDoc.date}</strong></span>
                  {activeDoc.fileSize && <span>{t('Filstørrelse:', 'Size:')} <strong className="text-slate-200">{activeDoc.fileSize}</strong></span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Forensisk Resumé', 'Forensic Summary')}
                  </h5>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                    {activeDoc.summary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Verificeret Dokumentuddrag', 'Verified Excerpt')}
                  </h5>
                  <div className="p-4 rounded-lg bg-slate-950/90 border-l-4 border-indigo-500 text-sm text-slate-300 font-mono italic leading-relaxed">
                    "{activeDoc.excerpt}"
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Tilknyttede Parter', 'Parties Linked')}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {activeDoc.partiesInvolved.map((p, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={activeDoc.driveUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    {t('Åbn i Drive: "Lyngby-Taarbæk case"', 'Open in Google Drive Source')}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex items-center gap-2">
                    {onAskAIWithDoc && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAskAIWithDoc(activeDoc)}
                        className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border-indigo-500/40 flex items-center gap-1.5 font-semibold"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>{t('AI Resumé (The Brew Method)', 'AI Executive Summary')}</span>
                      </Button>
                    )}

                    <Button variant="primary" size="sm" onClick={() => onOpenDocModal && onOpenDocModal(activeDoc)}>
                      <FileText className="w-4 h-4" />
                      {t('Fuld Dokumentinspektion', 'Full Document Inspection')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
              {t('Vælg et dokument for at se alle detaljer.', 'Select a document to inspect full details.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
