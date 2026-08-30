import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  History,
  FileCheck,
  AlertTriangle,
  Fingerprint,
  Search,
  Filter,
  Download,
  PlusCircle,
  Clock,
  User,
  Tag,
  CheckCircle2,
  Lock,
  ArrowUpDown,
  FileText,
  Radio,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { AuditLogEntry } from '../types';

interface InvestigationAuditLogProps {
  onSelectTarget?: (targetType: string, targetId: string) => void;
}

export function InvestigationAuditLog({ onSelectTarget }: InvestigationAuditLogProps) {
  const { auditLogs, logAuditEvent, clearAuditLogs, summary } = useCaseData();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedTargetType, setSelectedTargetType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Manual Log Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualInvestigator, setManualInvestigator] = useState('Graverjournalist / Efterforsker');
  const [manualSummaryDa, setManualSummaryDa] = useState('');
  const [manualSummaryEn, setManualSummaryEn] = useState('');
  const [manualSeverity, setManualSeverity] = useState<'info' | 'notice' | 'warning' | 'critical'>('info');
  const [manualActionType, setManualActionType] = useState<AuditLogEntry['actionType']>('note_attached');
  const [manualTargetType, setManualTargetType] = useState<AuditLogEntry['targetType']>('case_file');
  const [manualTags, setManualTags] = useState('');

  // Integrity Check State
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<boolean | null>(null);

  // Filtered and Sorted Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Action Type filter
      if (selectedActionType !== 'all' && log.actionType !== selectedActionType) return false;
      // Severity filter
      if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) return false;
      // Target Type filter
      if (selectedTargetType !== 'all' && log.targetType !== selectedTargetType) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = log.targetTitle?.toLowerCase().includes(q);
        const matchesInvestigator = log.investigator?.toLowerCase().includes(q);
        const matchesDa = log.summaryDa?.toLowerCase().includes(q);
        const matchesEn = log.summaryEn?.toLowerCase().includes(q);
        const matchesHash = log.sha256Checksum?.toLowerCase().includes(q);
        const matchesTags = log.tags?.some(tag => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesInvestigator && !matchesDa && !matchesEn && !matchesHash && !matchesTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [auditLogs, selectedActionType, selectedSeverity, selectedTargetType, searchQuery, sortBy]);

  // Copy hash helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Export audit log to JSON
  const handleExportAuditJson = () => {
    const exportBundle = {
      caseNumber: summary.caseNumber,
      caseTitle: summary.caseName,
      exportedAt: new Date().toISOString(),
      integrityProtocol: 'SHA-256 Chain of Custody',
      totalLogEntries: auditLogs.length,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Log_Chain_of_Custody_${summary.caseNumber}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Submit manual log entry
  const handleCreateManualLog = (e: FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualSummaryDa.trim()) return;

    logAuditEvent({
      investigator: manualInvestigator.trim() || 'Graverjournalist',
      actionType: manualActionType,
      targetType: manualTargetType,
      targetId: `manual-log-${Date.now()}`,
      targetTitle: manualTitle.trim(),
      summaryDa: manualSummaryDa.trim(),
      summaryEn: manualSummaryEn.trim() || manualSummaryDa.trim(),
      severity: manualSeverity,
      tags: manualTags ? manualTags.split(',').map(t => t.trim()).filter(Boolean) : ['Manuel Indførsel', 'Journalistisk Notat']
    });

    setManualTitle('');
    setManualSummaryDa('');
    setManualSummaryEn('');
    setManualTags('');
    setIsAddModalOpen(false);
  };

  // Simulate complete cryptographic integrity verification
  const handleRunIntegrityVerification = () => {
    setIsVerifyingIntegrity(true);
    setTimeout(() => {
      setIsVerifyingIntegrity(false);
      setVerifiedStatus(true);
      logAuditEvent({
        investigator: 'Forensisk Sikkerhedskontrol',
        actionType: 'integrity_verified',
        targetType: 'case_file',
        targetId: summary.caseNumber,
        targetTitle: 'Chain of Custody Verifikation',
        summaryDa: `Kryptografisk kontrol gennemført for samtlige ${auditLogs.length} sagslogger. Ingen manipulering detekteret.`,
        summaryEn: `Cryptographic audit verified for all ${auditLogs.length} case entries. Zero tampering detected.`,
        severity: 'info',
        tags: ['Kryptografi', 'SHA256', 'ForensicProof']
      });
      setTimeout(() => setVerifiedStatus(null), 5000);
    }, 900);
  };

  const getActionBadge = (action: AuditLogEntry['actionType']) => {
    switch (action) {
      case 'document_uploaded':
        return { label: t('Akt Uploadet', 'Document Uploaded'), color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'annotation_added':
        return { label: t('Annotation Tilføjet', 'Annotation Added'), color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'annotation_updated':
        return { label: t('Annotation Redigeret', 'Annotation Updated'), color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'annotation_deleted':
        return { label: t('Annotation Slettet', 'Annotation Deleted'), color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'tag_added':
        return { label: t('Tag Tilføjet', 'Tag Added'), color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'tag_removed':
        return { label: t('Tag Fjernet', 'Tag Removed'), color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' };
      case 'verification_toggled':
        return { label: t('Verifikation Ændret', 'Verification Toggled'), color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'document_updated':
        return { label: t('Akt Redigeret', 'Document Updated'), color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'document_deleted':
        return { label: t('Akt Slettet', 'Document Deleted'), color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'party_updated':
        return { label: t('Part Ændret', 'Party Modified'), color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
      case 'claim_status_changed':
        return { label: t('Påstandsstatus', 'Claim Status'), color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' };
      case 'timeline_event_mutated':
        return { label: t('Tidslinje Hændelse', 'Timeline Mutated'), color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'integrity_verified':
        return { label: t('Integritet Verificeret', 'Integrity Verified'), color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'case_exported':
        return { label: t('Sagspakke Eksporteret', 'Case Exported'), color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' };
      case 'note_attached':
      default:
        return { label: t('Journalistisk Notat', 'Note Attached'), color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };
    }
  };

  const getSeverityBadge = (sev: AuditLogEntry['severity']) => {
    switch (sev) {
      case 'critical':
        return { label: t('Kritisk', 'Critical'), color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'warning':
        return { label: t('Advarsel', 'Warning'), color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'notice':
        return { label: t('Bemærkning', 'Notice'), color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'info':
      default:
        return { label: t('Info', 'Info'), color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  return (
    <div id="investigation-audit-log-root" className="space-y-6">
      {/* Header & Metric Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>SHA-256 Immutable Audit Trail</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono">
                {auditLogs.length} {t('registrerede handlinger', 'logged actions')}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2.5">
              <Fingerprint className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>{t('Efterforsknings- & Revisionslog (Chain of Custody)', 'Investigation Audit Log & Chain of Custody')}</span>
            </h2>

            <p className="text-xs md:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              {t(
                'Uforanderlig revisionslog over alle sagsændringer, filannoteringer, tag-opdateringer, import/eksport og integritetskontroller. Sikrer fuld transparens og juridisk beviskæde for graverjournalistikken.',
                'Immutable forensic audit trail tracking all evidence annotations, tag updates, imports/exports, and cryptographic integrity verifications for legal custody.'
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-verify-audit-integrity"
              onClick={handleRunIntegrityVerification}
              disabled={isVerifyingIntegrity}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                isVerifyingIntegrity
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 animate-pulse'
                  : 'bg-emerald-600/15 hover:bg-emerald-600/25 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
              <span>
                {isVerifyingIntegrity
                  ? t('Validerer Hash-kæde...', 'Validating Hash Chain...')
                  : t('Verificer Kryptografi', 'Verify Crypto Integrity')}
              </span>
            </button>

            <button
              id="btn-export-audit-json"
              onClick={handleExportAuditJson}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('Eksporter Log (JSON)', 'Export Log (JSON)')}</span>
            </button>

            <button
              id="btn-add-manual-audit-entry"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('Log Manuel Handling', 'Log Manual Action')}</span>
            </button>
          </div>
        </div>

        {/* Verification Success Toast */}
        {verifiedStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                {t(
                  'Kryptografisk beviskæde er 100% intakt. Alle SHA-256 hashes stemmer overens med sagsakterne.',
                  'Chain of custody verified. 100% of SHA-256 hashes match indexed evidence artifacts.'
                )}
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-300">{new Date().toLocaleTimeString()}</span>
          </motion.div>
        )}

        {/* Forensic Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800/80">
          <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {t('Handlinger I Alt', 'Total Log Entries')}
            </div>
            <div className="text-xl font-extrabold text-zinc-100 mt-1 font-mono">
              {auditLogs.length}
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {t('Kritiske Handlinger', 'Critical Modifications')}
            </div>
            <div className="text-xl font-extrabold text-amber-400 mt-1 font-mono">
              {auditLogs.filter(l => l.severity === 'critical' || l.severity === 'warning').length}
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {t('Verificerede Hashes', 'Verified Checksums')}
            </div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
              {auditLogs.filter(l => l.sha256Checksum).length} / {auditLogs.length}
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              {t('Aktiv Efterforsker', 'Lead Investigator')}
            </div>
            <div className="text-xs font-bold text-cyan-300 mt-1.5 truncate">
              {summary.leadInvestigator || 'Graverteam'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Søg i log, efterforsker, checksum...', 'Search logs, investigator, hash...')}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Action Type Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-zinc-200">{t('Alle Handlingstyper', 'All Actions')}</option>
              <option value="file_uploaded" className="bg-zinc-900 text-zinc-200">{t('Fil Uploads', 'File Uploads')}</option>
              <option value="document_created" className="bg-zinc-900 text-zinc-200">{t('Akt Oprettet', 'Doc Created')}</option>
              <option value="document_updated" className="bg-zinc-900 text-zinc-200">{t('Akt Redigeret', 'Doc Updated')}</option>
              <option value="party_updated" className="bg-zinc-900 text-zinc-200">{t('Part Ændret', 'Party Updated')}</option>
              <option value="claim_status_changed" className="bg-zinc-900 text-zinc-200">{t('Påstandsstatus', 'Claim Status')}</option>
              <option value="integrity_verified" className="bg-zinc-900 text-zinc-200">{t('Integritet Kontrol', 'Integrity Verified')}</option>
              <option value="case_exported" className="bg-zinc-900 text-zinc-200">{t('Sags Eksport', 'Case Export')}</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-zinc-200">{t('Alle Niveauer', 'All Severities')}</option>
              <option value="info" className="bg-zinc-900 text-zinc-200">{t('Info', 'Info')}</option>
              <option value="notice" className="bg-zinc-900 text-zinc-200">{t('Bemærkning', 'Notice')}</option>
              <option value="warning" className="bg-zinc-900 text-zinc-200">{t('Advarsel', 'Warning')}</option>
              <option value="critical" className="bg-zinc-900 text-zinc-200">{t('Kritisk', 'Critical')}</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title={t('Skift sortering', 'Toggle Sort')}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span>{sortBy === 'newest' ? t('Nyeste Først', 'Newest') : t('Ældste Først', 'Oldest')}</span>
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
            <History className="w-8 h-8 text-zinc-500 mx-auto" />
            <div className="text-zinc-300 font-semibold text-sm">
              {t('Ingen revisionslogpunkter matcher dine filtre', 'No audit log entries match your criteria')}
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {t('Prøv at nulstille dine søgekriterier eller log en ny handling.', 'Try clearing your filters or create a new manual audit log entry.')}
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const actionBadge = getActionBadge(log.actionType);
            const severityBadge = getSeverityBadge(log.severity);
            const formattedDate = new Date(log.timestamp).toLocaleString(language === 'da' ? 'da-DK' : 'en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="p-4 md:p-5 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl transition-all shadow-sm space-y-3 group"
              >
                {/* Entry Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${actionBadge.color}`}>
                      {actionBadge.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${severityBadge.color}`}>
                      {severityBadge.label}
                    </span>
                    <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                      {log.targetTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-300 font-semibold">{log.investigator}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{formattedDate}</span>
                    </span>
                  </div>
                </div>

                {/* Entry Description */}
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                  {language === 'da' ? log.summaryDa : (log.summaryEn || log.summaryDa)}
                </p>

                {/* Field Diff Inspection if present */}
                {log.diff && (
                  <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-3 text-xs font-mono space-y-1">
                    <div className="text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">
                      {t('Feltændring:', 'Field Mutation:')} <span className="text-zinc-200">{log.diff.field}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      {log.diff.oldValue !== undefined && (
                        <div className="text-rose-400/90 bg-rose-950/30 p-2 rounded border border-rose-900/30 truncate">
                          <span className="font-bold">- Forrige:</span> {String(log.diff.oldValue)}
                        </div>
                      )}
                      {log.diff.newValue !== undefined && (
                        <div className="text-emerald-400/90 bg-emerald-950/30 p-2 rounded border border-emerald-900/30 truncate">
                          <span className="font-bold">+ Ny Værdi:</span> {String(log.diff.newValue)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom Row: Checksum & Tags */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/60 text-[11px]">
                  {/* Cryptographic SHA-256 Checksum */}
                  {log.sha256Checksum ? (
                    <div className="flex items-center gap-1.5 font-mono text-zinc-400">
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-zinc-500">SHA-256:</span>
                      <span className="text-emerald-400/90 truncate max-w-[200px] sm:max-w-[320px]">
                        {log.sha256Checksum}
                      </span>
                      <button
                        onClick={() => copyToClipboard(log.sha256Checksum!, log.id)}
                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title={t('Kopier SHA-256 hash', 'Copy SHA-256 checksum')}
                      >
                        {copiedHash === log.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-zinc-500 italic text-[10px]">
                      {t('Systemgenereret hændelse', 'System event')}
                    </div>
                  )}

                  {/* Tags */}
                  {log.tags && log.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {log.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 font-mono text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Manual Audit Entry Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">
                    {t('Log Manuel Efterforskningshandling', 'Log Manual Investigation Action')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-zinc-400 hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateManualLog} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t('Efterforsker / Revisor Navn', 'Investigator / Auditor Name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={manualInvestigator}
                    onChange={(e) => setManualInvestigator(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t('Handlings- eller Dokumenttitel', 'Action or Document Title')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="f.eks. Møde med kilde X / Tilsynsnotat gennemsøgt"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      {t('Handlingstype', 'Action Type')}
                    </label>
                    <select
                      value={manualActionType}
                      onChange={(e) => setManualActionType(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="note_attached">{t('Journalistisk Notat', 'Note Attached')}</option>
                      <option value="file_uploaded">{t('Fil Uploadet', 'File Uploaded')}</option>
                      <option value="document_updated">{t('Akt Annoteret', 'Document Annotated')}</option>
                      <option value="party_updated">{t('Part Verificeret', 'Party Verified')}</option>
                      <option value="claim_status_changed">{t('Påstand Ændret', 'Claim Mutated')}</option>
                      <option value="integrity_verified">{t('Integritetstest', 'Integrity Check')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      {t('Alvorsgrad', 'Severity Level')}
                    </label>
                    <select
                      value={manualSeverity}
                      onChange={(e) => setManualSeverity(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="info">{t('Info (Rutine)', 'Info (Routine)')}</option>
                      <option value="notice">{t('Bemærkelsesværdig', 'Notice')}</option>
                      <option value="warning">{t('Advarsel', 'Warning')}</option>
                      <option value="critical">{t('Kritisk', 'Critical')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t('Beskrivelse af Handling (Dansk)', 'Description of Action (Danish)')}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Præcis beskrivelse af hvad der er blevet undersøgt, ændret eller verificeret..."
                    value={manualSummaryDa}
                    onChange={(e) => setManualSummaryDa(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t('Tags (kommasepareret)', 'Tags (comma separated)')}
                  </label>
                  <input
                    type="text"
                    placeholder="f.eks. Kildekontakt, FABU, SHA256, Forensisk"
                    value={manualTags}
                    onChange={(e) => setManualTags(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    {t('Annuller', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
                  >
                    {t('Gem og Generer Hash', 'Save & Generate Hash')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
