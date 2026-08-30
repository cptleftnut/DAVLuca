import { FileText, Users, AlertTriangle, CheckCircle2, ShieldAlert, ArrowUpRight, HardDrive, FolderGit2 } from 'lucide-react';
import { CaseSummary, Party, SeriousClaim } from '../types';
import { Card, CardContent } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';

interface CaseSynthesisOverviewProps {
  summary: CaseSummary;
  parties: Party[];
  claims: SeriousClaim[];
  onSelectTab: (tab: string) => void;
}

export function CaseSynthesisOverview({ summary, parties, claims, onSelectTab }: CaseSynthesisOverviewProps) {
  const { language, t } = useLanguage();
  const criticalClaimsCount = claims.filter(c => c.severity === 'critical').length;
  const criticalPartiesCount = parties.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length;

  return (
    <div className="space-y-6">
      {/* Top Case Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                {summary.caseNumber}
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t('Aktiv Efterforskning', 'Active Investigation')}
              </span>
              <span className="px-3 py-1 text-xs font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-md flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                Google Drive: Lyngby-Taarbæk case
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {t('Lyngby-Taarbæk Sagen & DAVLuca Forensisk Efterforskning', 'Lyngby-Taarbæk Case & DAVLuca Forensic Investigation')}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {t('Ansvarlig Undersøger:', 'Lead Investigator:')}{' '}
              <span className="text-slate-100 font-medium">Specialkonsulent E. Vance / Advokat M. Lind</span> •{' '}
              {t('Oprettet:', 'Opened:')} {summary.dateOpened} • {t('Hovedkilde:', 'Primary Source:')}{' '}
              <span className="text-indigo-300 font-semibold font-mono">Drive: "Lyngby-Taarbæk case"</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('assistant')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              {t('Spørg AI Sagskonsulent', 'Ask AI Case Assistant')}
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTab('drive')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <HardDrive className="w-4 h-4 text-emerald-400" />
              {t('Åbn Drive Kildearkiv', 'Open Drive Archive')}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:border-indigo-500/40 cursor-pointer" onClick={() => onSelectTab('findings')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">{summary.totalDocuments}</div>
              <div className="text-xs text-slate-400 font-medium">
                {t('Dokumentfund & Aktindsigter', 'Document Findings')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/40 cursor-pointer" onClick={() => onSelectTab('parties')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">{summary.totalParties}</div>
              <div className="text-xs text-slate-400 font-medium">
                {t('Identificerede Parter', 'Identified Parties')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-red-500/40 cursor-pointer" onClick={() => onSelectTab('claims')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400 tracking-tight">{summary.criticalFindings}</div>
              <div className="text-xs text-slate-400 font-medium">
                {t('Kritiske Påstande & Flag', 'Critical Claims / Flags')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-500/40 cursor-pointer" onClick={() => onSelectTab('queue')}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 tracking-tight">{summary.openTasks}</div>
              <div className="text-xs text-slate-400 font-medium">
                {t('Åbne Kontrolopgaver', 'Open Control Tasks')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Synthesis Summary Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                {t('Ledelsessyntese & Hovedkonklusioner', 'Executive Forensic Synthesis & Findings')}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {t('Synkroniseret med Drive & GitHub', 'Synchronized via Drive & GitHub')}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t(
                'Tværgående bevissyntese for Lyngby-Taarbæk sagen samler verificerede kommunale sagsakter, FABU samværsrapporter, forvaltningsafgørelser, retsbogsudskrifter, lydbåndoptagelser, forensisk fotodokumentation og e-mailkorrespondance fra 2022 til 2026. Analysen udføres strengt efter ',
                'The cross-case evidence synthesis for the Lyngby-Taarbæk investigation integrates verified municipal case files, FABU supervised visitation evaluations, administrative decrees, court transcripts, audio recordings, forensic photos, and email correspondence from 2022 to 2026. All analysis strictly applies '
              )}
              <span className="text-emerald-400 font-semibold">{t('The Brew Method (8-trins evidensbaseret blueprint)', 'The Brew Method (8-step evidence-based blueprint)')}</span>
              {t(
                ' for at isolere dokumenterede fakta fra administrative antagelser, modvirke bekræftelsesbias og afdække eventuelle systemiske retssvigt.',
                ' to isolate documented facts from administrative assumptions, eliminate confirmation bias, and uncover systemic procedural failures.'
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                <div className="font-semibold text-indigo-300">
                  {t('Centrale Sagspersoner & Børn:', 'Key Subjects & Children:')}
                </div>
                <div className="text-slate-300">
                  {t(
                    'Luca & Liam (børnene i centrum) samt forvaltningen v/ rådgiver Marsha, Mette og Borgmester Sofia Osmani.',
                    'Luca & Liam (children at center) alongside municipal caseworkers Marsha, Mette, and Mayor Sofia Osmani.'
                  )}
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
                <div className="font-semibold text-emerald-300">
                  {t('Evidens- og Kildeintegritet:', 'Evidence & Source Integrity:')}
                </div>
                <div className="text-slate-300">
                  {t(
                    '94,2% dokumenteret overensstemmelse på tværs af Google Drive-kildearkivet, EXIF fotometadata og tidsstemplede lydoptagelser.',
                    '94.2% documented triangulation across Google Drive sources, EXIF image metadata, and timestamped audio recordings.'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              {t('Risikofordeling', 'Risk Distribution')}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{t('Kritiske Risikopersoner', 'Critical Risk Subjects')}</span>
                <span className="font-semibold text-red-400">{criticalPartiesCount} {t('Parter', 'Parties')}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '40%' }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{t('Høj-Alvorligheds Påstande', 'High-Severity Claims')}</span>
                <span className="font-semibold text-orange-400">{criticalClaimsCount} {t('Påstande', 'Claims')}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{t('Verifikationsstatus', 'Verification Queue')}</span>
                <span className="font-semibold text-emerald-400">{t('82% Verificeret', '82% Verified')}</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
