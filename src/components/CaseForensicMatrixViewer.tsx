import React, { useState } from 'react';
import {
  Scale,
  FileText,
  Mic,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  User,
  Calendar,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function CaseForensicMatrixViewer() {
  const { language, t } = useLanguage();
  const [activeView, setActiveView] = useState<'matrix' | 'petition'>('matrix');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const DIVERGENCE_DATA = [
    {
      id: 'div-1',
      topic: '1. Forvaltningens Mundtlige Undskyldning & Erkendelse af Sagsbehandlingsfejl',
      audioTimestamp: '15. jan 2026 [24:15 - 28:30]',
      audioEvidence: 'Mette og Marsha udtaler mundtligt: "Vi må bare beklage, at der i de tidlige notater og forældrekompetenceundersøgelsen er sket fejlfortolkninger af jeres reaktionsmønster, og at dette forløb har været unødigt belastende for familien."',
      writtenMinutes: 'FULDSTÆNDIGT UDELADT i det officielle referat journaliseret til Byretten og Ankestyrelsen. Mødet refereres udelukkende som en "orientering om handleplan uden væsentlige nye bemærkninger fra forvaltningens side".',
      legalViolation: 'Brud på Forvaltningslovens § 13 (notatpligt) & § 10 (officialprincippet) samt sandhedspligten i retsplejen.',
      brewStep: 'Trin 3 & 6: Bevidst udeladelse af frikendende kendsgerninger (Ikke blot inkompetence, men ansvarsfraskrivelse)',
      severity: 'critical'
    },
    {
      id: 'div-2',
      topic: '2. Narkotikamistanke (Heroin) vs. Dokumenterede Negative Urinprøver',
      audioTimestamp: '25. feb 2025 [12:08] & 15. jan 2026 [14:40]',
      audioEvidence: 'Sagsbehandler konfronteres med, at samtlige urinprøver har været 100% negative. Sagsbehandler indrømmer: "Vi har ikke fundet spor af stoffer i testene, men bekymringen har beroet på tidligere indberetninger."',
      writtenMinutes: 'I afgørelsesgrundlaget fastholdes formuleringen: "utilstrækkelig omsorg og mistanke om substanspåvirkning i hjemmet" uden at nævne de negative laboratorieresultater.',
      legalViolation: 'Tilsidesættelse af det faktiske oplysningsgrundlag (Officialprincippet). Afgørelse truffet på faktuelt forkert grundlag.',
      brewStep: 'Trin 1 & 5: Anti-Confirmation Bias & OSINT (Laboratoriedata tilsidesat til fordel for administrativ forudindtagethed)',
      severity: 'critical'
    },
    {
      id: 'div-3',
      topic: '3. Mørklægning af Positive FABU-Samværsrapporter (Sept 2023)',
      audioTimestamp: 'Opstart FABU.m4a & Møde 15. jan 2026',
      audioEvidence: 'Rådgiver erkender, at FABUs udtalelse af 1. september 2023 beskriver forældrenes evne til at "møde Luca med ro, trøst, grænsesætning og alderssvarende omsorg".',
      writtenMinutes: 'Børn- og Ungeudvalget fik i maj 2024 forelagt en ensidig sagsfremstilling, hvor de positive FABU-observationer var udeladt eller marginaliseret til fordel for 2 år gamle anonyme underretninger.',
      legalViolation: 'Brud på Forvaltningslovens § 19 (partshøring) og Retssikkerhedslovens § 10.',
      brewStep: 'Trin 4: Kildekritik & Selektiv Bevisførelse (Undladelse af at fremlægge uvildige ekspertobservationer)',
      severity: 'critical'
    },
    {
      id: 'div-4',
      topic: '4. Faderens Adfærd: Fejltolkning af Udiagnosticeret Autisme',
      audioTimestamp: 'Retten.m4a [08:12] & Byretssag 2025/2026',
      audioEvidence: 'Speciallægeerklæring fra 2025 dokumenterer, at faderens flade mimik, monotone stemmeføring og stressreaktioner skyldes autisme, ikke aggression, psykisk ustabilitet eller rusmiddelmisbrug.',
      writtenMinutes: 'Forvaltningen og B&U-udvalget har oprindeligt vurderet faderen som "følelsesmæssigt utilgængelig og truende" i forældrekompetenceundersøgelsen fra juni 2023.',
      legalViolation: 'Fejlagtig retslig subsumtion og diskrimination på baggrund af handicap i strid med Handicapkonventionen & EMK art. 8.',
      brewStep: 'Trin 7: Den Jordbundne Konklusion (Neurologisk virkelighed modbeviser subjektiv mistænkeliggørelse)',
      severity: 'critical'
    },
    {
      id: 'div-5',
      topic: '5. Pædagogernes Udsagn om Hygiejne i Børnehaven',
      audioTimestamp: '7. Første møde i børnehaven.m4a [18:20]',
      audioEvidence: 'Pædagoger udtaler direkte på bånd: "Vi har aldrig sagt, at Luca ikke blev vasket, eller at der var akut hygiejnesvigt. Sagsbehandler Dennis har overfortolket en rutinedialog."',
      writtenMinutes: 'Sagsbehandler Dennis journaliserede i 2022, at børnehaven havde indberettet manglende vask og hygiejnesvigt som anbringelsesbegrundelse.',
      legalViolation: 'Falsk journalføring og fordrejning af vidneudsagn af offentlig myndighedsperson.',
      brewStep: 'Trin 4 & 6: Kildekritik (Primærkilde afviser forvaltningens sekundære forvrængning)',
      severity: 'critical'
    }
  ];

  const PETITION_TEXT = `TIL:
Ankestyrelsen
og Retten i Lyngby (Familieretten)

DATO: 29. August 2026
SAG: Lyngby-Taarbæk Kommune – Sags-ID: LTK-FAM-2022-2026
PARTER: Nicklas (Far) & Louise (Mor) v/ Advokat
VEDRØRENDE: Genoptagelse af anbringelsessag for Luca (f. 2020) samt partshøring vedr. Liam (f. 2017)

═══════════════════════════════════════════════════════════════════════════════
PÅSTAND
═══════════════════════════════════════════════════════════════════════════════
1. Afgørelsen om anbringelse uden for hjemmet af Luca ophæves, og sagen hjemvises til fornyet forvaltningsbehandling i en uvildig nabokommune.
2. Subsidiært pålægges Lyngby-Taarbæk Kommune straks at iværksætte en optrappet hjemgivelsesplan i medfør af Barnets Lov § 46 med uovervåget samvær.
3. Der iværksættes en uvildig forvaltningsrevision af sagsbehandlingsforløbet 2022-2026 på baggrund af dokumenteret manipulation af sagsakter og brud på officialprincippet.

═══════════════════════════════════════════════════════════════════════════════
SAGSFREMSTILLING & RETLIGE ANBRINGENDER
═══════════════════════════════════════════════════════════════════════════════
Til støtte for genoptagelsesbegæringen gøres følgende 4 kardinalpunkter gældende i henhold til The Brew Method efterforskningsstandard:

1. BORTFALD AF DET OPRINDELIGE ANBRINGELSESGRUNDLAG (NEGATIVE NARKOTIKATESTS)
Anbringelsen blev iværksat den 25. maj 2022 på en akut formandsbeslutning under henvisning til mistanke om heroinmisbrug.
Det er nu uomtvisteligt godtgjort ved kontinuerlige, negative laboratorietests (urinprøver), at der ikke foreligger misbrug.
Forvaltningen har fastholdt narrativet i strid med de foreliggende objektive data.

2. FOREKOMST AF VÆSENTLIGE NYE OPLYSNINGER: AUTISMEDIAGNOSE (2025)
Forældrekompetenceundersøgelsen fra juni 2023 lagde afgørende vægt på faderens påståede "manglende mimik, kontaktvanskeligheder og uforudsigelighed".
En speciallægeudredning i 2025 har fastslået, at faderen har en autismeprofil. 
Den adfærd, som forvaltningen tolkede som omsorgssvigt, er i virkeligheden et neurologisk handicap, som forvaltningen var forpligtet til at kompensere for (Serviceloven / Barnets Lov), ikke straffe med anbringelse.

3. MØRKLÆGNING AF POSITIVE FABU-SAMVÆRSRAPPORTER (SEPTEMBER 2023)
Den uvildige observationsenhed FABU (Familiehjælpen) udarbejdede den 1. september 2023 en rapport, der dokumenterer, at forældrene udviser sund, omsorgsfuld og kærlig kontakt til Luca.
Denne rapport blev ikke behørigt fremlagt for Børn- og Ungeudvalget forud for afgørelsen i maj 2024, hvilket udgør et groft brud på Forvaltningslovens § 10 (officialprincippet) og § 19 (partshøring).

4. MANIPULATION AF SAGSAKTER OG UDELADELSE AF FORVALTNINGENS UNDSKYLDNING
Ved møde den 15. januar 2026 mellem forældrene og sagsbehandlerne Mette og Marsha, fremsatte forvaltningen en mundtlig undskyldning og erkendelse af sagsbehandlingsfejl.
I det skriftlige referat, som forvaltningen indsendte til Retten i Lyngby, blev denne undskyldning fuldstændigt udeladt. Lydoptagelsen (Møde d. 15 jan 2026 Mette og Marsha.mp3) beviser uoverensstemmelsen.

═══════════════════════════════════════════════════════════════════════════════
JURIDISK REFERENCERAMME
═══════════════════════════════════════════════════════════════════════════════
• Forvaltningslovens §§ 7-10 (Vejledningspligt, notatpligt og officialprincippet)
• Forvaltningslovens § 19 (Partshøringspligt)
• Retssikkerhedslovens § 10 (Myndighedens pligt til at oplyse sagen alsidigt)
• Barnets Lov §§ 43, 46 (Krav om mindst indgribende foranstaltning og hjemgivelsesvurdering)
• Den Europæiske Menneskerettighedskonvention (EMK) artikel 8 (Retten til respekt for familieliv)

Med venlig hilsen,
Advokat for forældrene
Bilag: 1-51, Lydoptagelser (M4A/MP3), Speciallægeerklæring (2025), FABU-Rapport (01.09.2023).`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-6">
      
      {/* Top Header & Switcher */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {t('Forensisk Afvigelsesmatrix & Juridisk Klageskrift', 'Forensic Discrepancy Matrix & Legal Petition')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('Systematisk konfrontation af rå lydbeviser mod forvaltningens officielle retsreferater (The Brew Method Trin 3, 6 & 7).', 'Systematic cross-examination of raw audio evidence against official court minutes.')}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'matrix'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('Afvigelsesmatrix (Lyd vs Referat)', 'Discrepancy Matrix')}</span>
          </button>

          <button
            onClick={() => setActiveView('petition')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'petition'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('Genoptagelsesbegæring (Proces)', 'Legal Petition')}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DIVERGENCE MATRIX */}
      {activeView === 'matrix' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h4 className="font-bold text-amber-200">
                {t('Kardinalobservation: Brud på Officialprincippet', 'Critical Finding: Due Process Violation')}
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {t(
                  'Analysen påviser en markant diskrepans mellem de rå lydoptagelser (primære data) og de skriftlige referater overdraget til Byretten og B&U-udvalget. Hvor lydoptagelserne indeholder indrømmelser og modbeviser, fremstiller de skriftlige akter sagen ensidigt belastende for forældrene.',
                  'Analysis shows significant divergence between raw audio wiretaps (primary data) and official court filings. While audio recordings document concessions and exculpatory facts, the written minutes present a one-sided case.'
                )}
              </p>
            </div>
          </div>

          {/* Matrix Cards */}
          <div className="space-y-4">
            {DIVERGENCE_DATA.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-slate-700"
              >
                {/* Card Header */}
                <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white">{item.topic}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    {item.brewStep.split(':')[0]}
                  </span>
                </div>

                {/* Card Content Grid (Lydoptagelse vs Skriftligt Referat) */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Raw Audio Evidence */}
                  <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-purple-400" />
                        <span>{t('Rå Lydoptagelse (Signal / Primærdata)', 'Raw Audio Wiretap (Signal)')}</span>
                      </span>
                      <span className="text-[10px] font-mono bg-purple-500/20 px-2 py-0.5 rounded">
                        {item.audioTimestamp}
                      </span>
                    </div>
                    <p className="text-xs font-serif italic text-slate-200 bg-slate-950/60 p-3 rounded border border-purple-500/20 leading-relaxed">
                      "{item.audioEvidence}"
                    </p>
                  </div>

                  {/* Right: Written Court Minutes */}
                  <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-red-300">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-red-400" />
                        <span>{t('Skriftligt Byretsreferat / Kommunalt Notat', 'Official Court Minutes / Filing')}</span>
                      </span>
                      <span className="text-[10px] font-mono bg-red-500/20 px-2 py-0.5 rounded text-red-200">
                        {t('Uoverensstemmelse', 'Discrepancy')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded border border-red-500/20 leading-relaxed">
                      {item.writtenMinutes}
                    </p>
                  </div>
                </div>

                {/* Forensic Assessment & Legal Violation Footer */}
                <div className="bg-slate-900/60 px-4 py-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span><strong>Juridisk Konsekvens:</strong> {item.legalViolation}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono">
                    {item.brewStep}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: LEGAL PETITION / MOTION */}
      {activeView === 'petition' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                {t('Formel Genoptagelsesbegæring & Klageskrift', 'Formal Motion for Reopening & Petition')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('Klar til indlevering til Ankestyrelsen og Retten i Lyngby.', 'Ready for submission to the National Board of Appeal and Lyngby District Court.')}
              </p>
            </div>

            <button
              onClick={() => handleCopy(PETITION_TEXT, 'petition-full')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSection === 'petition-full' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{t('Kopieret til Udklipsholder!', 'Copied to Clipboard!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t('Kopiér Fuld Processkrift', 'Copy Full Petition')}</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 sm:p-8 font-mono text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap select-text max-h-[600px] overflow-y-auto shadow-inner">
            {PETITION_TEXT}
          </div>
        </div>
      )}
    </div>
  );
}
