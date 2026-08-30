import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Shield,
  FileSearch,
  Scale,
  Compass,
  CheckCircle2,
  HardDrive,
  Cpu,
  Layers,
  Search,
  Mic,
  Activity,
  ArrowRight,
  Database,
  Lock,
  GitBranch,
  FileText,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  const { t } = useLanguage();

  const brewMethodSteps = [
    {
      step: '01',
      titleDa: 'Anti-Confirmation Bias',
      titleEn: 'Anti-Confirmation Bias',
      descDa: 'Isolerer rå fakta fra forudindtagede hypoteser og cherry-picking. Ingen konklusioner drages før materialet er kortlagt objektivt.',
      descEn: 'Isolates raw facts from preconceived hypotheses. No conclusions are drawn before material is objectively mapped.'
    },
    {
      step: '02',
      titleDa: 'Kronologisk Kortlægning',
      titleEn: 'Chronological Mapping',
      descDa: 'Opbygger en uafviselig tidslinje for samtlige sagsakter, underretninger, møder og afgørelser fra 2022 til 2026.',
      descEn: 'Builds an irrefutable timeline for all case files, notifications, meetings, and official decisions from 2022 to 2026.'
    },
    {
      step: '03',
      titleDa: 'Kontekstualisering af Anomalier',
      titleEn: 'Contextualizing Anomalies (Hanlon\'s Razor)',
      descDa: 'Undersøger om forvaltningsmæssigt arbejdspres, sagsbehandlerskift og systemfejl er årsagen, før der konkluderes overlagt svigt.',
      descEn: 'Examines whether municipal workload, caseworker turnover, and system flaws explain anomalies before inferring deliberate malice.'
    },
    {
      step: '04',
      titleDa: 'Kilde- og Ekspertkritik',
      titleEn: 'Source & Expert Critique',
      descDa: 'Evaluerer habilitet, bias, forsinkede journalnotater og økonomiske/institutionelle bindinger hos kilder og konsulenter.',
      descEn: 'Evaluates conflicts of interest, bias, delayed journal entries, and institutional dependencies in source and consultant statements.'
    },
    {
      step: '05',
      titleDa: 'Datadrevet Efterforskning (OSINT)',
      titleEn: 'Data-Driven Investigation (OSINT & Forensics)',
      descDa: 'Anvender automatisk OCR-fuldtekst, metadata-analyse, lydtransskriptioner og SHA-256 kryptografisk revisionskæde.',
      descEn: 'Applies automated OCR full-text indexing, metadata extraction, audio transcription timestamps, and SHA-256 audit trails.'
    },
    {
      step: '06',
      titleDa: 'Adskillelse af Støj og Signal',
      titleEn: 'Separating Noise from Signal',
      descDa: 'Frasorterer rygter, emotionel støj og uverificerede påstande til fordel for retsligt og forvaltningsmæssigt verificerbare kendsgerninger.',
      descEn: 'Filters out emotional noise, rumors, and ungrounded claims in favor of legally verifiable municipal records and evidence.'
    },
    {
      step: '07',
      titleDa: 'Den Jordbundne Konklusion',
      titleEn: 'The Grounded Conclusion',
      descDa: 'Samler de verificerede beviser i en nøgtern, stringent og juridisk holdbar syntese fri for sensationelle antagelser.',
      descEn: 'Synthesizes verified evidence into a sober, rigorous, and legally substantiated analysis free from sensationalism.'
    },
    {
      step: '08',
      titleDa: 'Det Større Perspektiv & Moralske Anker',
      titleEn: 'The Bigger Picture & Moral Anchor',
      descDa: 'Fastholder fokus på børnenes trivsel og retsstilling (Luca & Liam) samt det principielle retssikkerhedssvigt.',
      descEn: 'Maintains unwavering focus on child welfare and legal protection (Luca & Liam) and the core systemic failure of due process.'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-2 shadow-lg shadow-emerald-500/10">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
              {t('Forensisk Graverjournalistisk Værktøj', 'Forensic Investigative Journalism Platform')}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              {t('Om DAVLuca Forensic', 'About DAVLuca Forensic')}
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 max-w-3xl mx-auto leading-relaxed">
              {t(
                'DAVLuca Forensic er en evidensbaseret efterforskningsplatform designet til minutiøs analyse af komplekse børnefaglige forvaltningssager, retsakter, partsrelationer og modstridende erklæringer i Lyngby-Taarbæk sagen.',
                'DAVLuca Forensic is an evidence-based investigative platform designed for meticulous analysis of child protection proceedings, municipal caseworker reports, court rulings, and contradictory records in the Lyngby-Taarbæk case.'
              )}
            </p>
          </div>
        </div>

        {/* Primary Core Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {t('The Brew Metoden', 'The Brew Method')}
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {t(
                'En 8-trins afmystificerende journalistisk proces, der metodisk skiller fakta fra antagelser, tester systemisk inkompetence foran konspirationer og fastholder et stærkt moralsk anker.',
                'An 8-step demystifying journalistic process that methodically separates facts from assumptions, tests systemic incompetence over conspiracy, and anchors investigations in legal ethics.'
              )}
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {t('OCR & Drev-Synkronisering', 'OCR & Drive Sync')}
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {t(
                'Automatisk fuldtekstudtræk via Batch OCR for scannede PDF\'er og billeder fra Google Drev mappen "Lyngby-Taarbæk case", så intet bevis forbliver uindekseret.',
                'Automated full-text extraction via Batch OCR for scanned PDFs and photos directly synced from the "Lyngby-Taarbæk case" Google Drive folder.'
              )}
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              {t('SHA-256 Chain of Custody', 'SHA-256 Chain of Custody')}
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {t(
                'Uforanderlig revisionslog med kryptografisk hashing af alle bevisindgange, dokumentversioner og analytiske vurderinger, der sikrer fuld processuel integritet.',
                'Immutable audit logging with cryptographic SHA-256 chaining for all evidence modifications, document versions, and investigative assessments.'
              )}
            </p>
          </div>
        </div>

        {/* 8 Steps Breakdown Section */}
        <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  {t('Metodisk Blueprint', 'Methodological Blueprint')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                {t('De 8 Trin i The Brew Metoden', 'The 8 Steps of The Brew Method')}
              </h2>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs transition-all shadow-md shrink-0"
            >
              <span>{t('Gå til Sagsdashboard', 'Open Case Dashboard')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {brewMethodSteps.map((item, idx) => (
              <div
                key={idx}
                className="bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 p-4 rounded-2xl space-y-2 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                    TRIN {item.step}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400/60" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {t(item.titleDa, item.titleEn)}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t(item.descDa, item.descEn)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Forensic Capabilities Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>{t('Integrerede Efterforskningsmoduler', 'Integrated Forensic Modules')}</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800/70 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <HardDrive className="w-4 h-4" />
                <span>Google Drive / Picker Sync</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'Direkte integration med "Lyngby-Taarbæk case" mappen, som automatisk henter og strukturerer sagsakter.',
                  'Direct integration with the "Lyngby-Taarbæk case" folder, automatically pulling and structuring case files.'
                )}
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/70 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                <Mic className="w-4 h-4" />
                <span>Lyd- & Transskriptanalyse</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'Tidsstemplede transskriberinger af forvaltningsmøder og børneberetninger (f.eks. Liams udsagn) med søgbar fuldtekst.',
                  'Timestamped transcriptions of municipal meetings and children statements with searchable full-text index.'
                )}
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/70 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                <GitBranch className="w-4 h-4" />
                <span>Parts- & Relationsgraf</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t(
                  'Interaktivt D3 relationskort der synliggør forbindelser mellem forvaltning, FABU, familie og retslige organer.',
                  'Interactive D3 relationship mapping uncovering links between social services, FABU, family, and judicial bodies.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              {t(
                'DAVLuca Forensic platformen overholder GDPR og opbevarer alle sagsdata i et sikkert, krypteret miljø med fuld revisionskontrol.',
                'The DAVLuca Forensic platform complies with data protection standards and maintains all records in a secure, audited environment.'
              )}
            </span>
          </div>
          <Link
            to="/"
            className="text-emerald-400 hover:text-emerald-300 font-bold whitespace-nowrap transition-colors"
          >
            {t('Tilbage til Sagsdashboardet →', 'Back to Case Dashboard →')}
          </Link>
        </div>
      </div>
    </div>
  );
}

