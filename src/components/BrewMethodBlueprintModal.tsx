import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Search,
  Scale,
  HeartHandshake,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Bot
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BrewMethodBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchAssistantWithStep?: (stepNumber: number, stepTitle: string) => void;
}

export const BREW_METHOD_STEPS = [
  {
    step: 1,
    titleDa: 'Anti-Confirmation Bias',
    titleEn: 'Anti-Confirmation Bias',
    headlineDa: 'Start altid med et tomt lærred',
    headlineEn: 'Always start with a clean slate',
    icon: Compass,
    color: 'emerald',
    descriptionDa: 'Vi må aldrig starte med en konklusion og cherry-picke beviser. Rå fakta isoleres stringent fra teorier, rygter og forudindtagede holdninger.',
    descriptionEn: 'Never start with a conclusion and cherry-pick evidence. Raw facts are strictly isolated from subjective theories, rumors, and biases.',
    keyQuestionsDa: [
      'Hvilke rå fakta kan bekræftes uafhængigt uden forudindtaget tolkning?',
      'Udelukker vi beviser, blot fordi de modsiger vores arbejdshypotese?'
    ]
  },
  {
    step: 2,
    titleDa: 'Kronologisk Kortlægning',
    titleEn: 'Chronological Mapping',
    headlineDa: 'Opbyg og opdater løbende en minutiøs tidslinje',
    headlineEn: 'Build and continuously maintain a meticulous timeline',
    icon: Clock,
    color: 'blue',
    descriptionDa: 'Hver ny hændelse, e-mail, afhøring eller tilsynsnotat skal passes ind på tidslinjen for at vurdere, om den giver logisk, tidsmæssig mening.',
    descriptionEn: 'Every event, email, testimony, or filing must be mapped chronologically to verify logical consistency and causality.',
    keyQuestionsDa: [
      'Giver tidsrækkefølgen mening i forhold til de officielle journalnotater?',
      'Findes der uforklarlige tidsmæssige spring eller overlap?'
    ]
  },
  {
    step: 3,
    titleDa: 'Kontekstualisering af Anomalier (Hanlon\'s Razor)',
    titleEn: 'Contextualizing Anomalies (Hanlon\'s Razor)',
    headlineDa: 'Inkompetence frem for konspiration',
    headlineEn: 'Systemic incompetence before malicious conspiracy',
    icon: AlertCircle,
    color: 'amber',
    descriptionDa: 'Når vi støder på "mistænkelige" huller (manglende overvågning, mistede dokumenter, folk der ikke passer deres job), undersøges stress, tekniske fejl og bureaukrati først.',
    descriptionEn: 'When encountering anomalies (missing records, procedural lapses), first test whether systemic workload, miscommunication, or technical faults explain the outcome.',
    keyQuestionsDa: [
      'Kan manglende notater forklares af underbemanding eller IT-fejl?',
      'Er der direkte bevis for ond vilje eller blot forvaltningssvigt?'
    ]
  },
  {
    step: 4,
    titleDa: 'Kilde- og Ekspertkritik',
    titleEn: 'Source & Expert Critique',
    headlineDa: 'Analyser motiv, økonomi og historik',
    headlineEn: 'Analyze motives, financial incentives, and track records',
    icon: Scale,
    color: 'violet',
    descriptionDa: 'Vurder altid kildens og ekspertens mulige bias. Hvem betaler dem? Har de en historik med utroværdighed? Er vidneudsagnet afgivet længe efter hændelsen?',
    descriptionEn: 'Examine conflicts of interest, funding sources, and memory degradation if testimony was given long after the event occurred.',
    keyQuestionsDa: [
      'Hvem aflønner den pågældende konsulent, sagkyndige eller rådgiver?',
      'Er erindringen påvirket af medieomtale eller tidens gang?'
    ]
  },
  {
    step: 5,
    titleDa: 'Datadrevet Efterforskning (OSINT)',
    titleEn: 'Data-Driven Investigation (OSINT)',
    headlineDa: 'Digital og teknisk krydsverifikation',
    headlineEn: 'Digital metadata, spatial tests, and records verification',
    icon: Search,
    color: 'cyan',
    descriptionDa: 'Verificer påstande gennem digital efterforskning (metadata, reverse image search, IP-sporing, arkiv-søgninger, CVR-udtræk eller fysiske rumlige tests).',
    descriptionEn: 'Verify all empirical claims using metadata inspection, OSINT records, geospatial consistency, and forensic audio analysis.',
    keyQuestionsDa: [
      'Stemmer dokumenternes tidsstempler og metadata overens med det påståede?',
      'Hvad viser CVR-registret og forvaltningsakterne?'
    ]
  },
  {
    step: 6,
    titleDa: 'Adskillelse af Støj og Signal',
    titleEn: 'Separation of Signal and Noise',
    headlineDa: 'Fjern sensationer og fokusér på verificerbart ophav',
    headlineEn: 'Discard sensational noise and focus on verifiable origins',
    icon: Layers,
    color: 'rose',
    descriptionDa: 'Fjern det, der blot er skabt for at skabe røre (falske rygter på sociale medier, clickbait, partsindlæg). Fokuser udelukkende på det, der har et verificerbart ophav.',
    descriptionEn: 'Filter out emotive internet drama, unsupported allegations, and clickbait. Retain only primary documentary evidence.',
    keyQuestionsDa: [
      'Er denne information understøttet af primærkilder eller blot viderefortalt?',
      'Tjener påstanden et følelsesmæssigt narrativ eller en faktuel sandhed?'
    ]
  },
  {
    step: 7,
    titleDa: 'Den Jordbundne Konklusion',
    titleEn: 'The Grounded Conclusion',
    headlineDa: 'Den mest logiske, kedelige og faktuelle sammenhæng',
    headlineEn: 'The most factual, rigorous, and unembellished synthesis',
    icon: FileCheck,
    color: 'indigo',
    descriptionDa: 'Giv den mest nøgterne, kedelige og faktuelle sammenhæng mellem beviserne – uanset om det ødelægger en god og opsigtsvækkende historie.',
    descriptionEn: 'Deliver the sober, disciplined truth supported by documentation, even if it contradicts dramatic sensationalist expectations.',
    keyQuestionsDa: [
      'Hvad er den mindst spekulative syntese af alle tilgængelige beviser?',
      'Holder konklusionen til en streng juridisk og presseetisk prøvelse?'
    ]
  },
  {
    step: 8,
    titleDa: 'Det Større Perspektiv & Moralske Anker',
    titleEn: 'The Moral Anchor & Broader Perspective',
    headlineDa: 'Hvem er de egentlige ofre, og hvad er retssvigtet?',
    headlineEn: 'Who are the true victims and what is the systemic failure?',
    icon: HeartHandshake,
    color: 'teal',
    descriptionDa: 'Påmind løbende om det moralske anker i sagen. Hvem er de egentlige ofre, og hvad er det primære retssvigt, vi ikke må lade os distrahere fra?',
    descriptionEn: 'Never lose sight of the human impact and institutional failure. Maintain vigilance for justice and structural accountability.',
    keyQuestionsDa: [
      'Hvilket barn, borger eller svag part lider overlast i dette forløb?',
      'Hvilke institutionelle reformer er påkrævet for at forhindre gentagelse?'
    ]
  }
];

export function BrewMethodBlueprintModal({ isOpen, onClose, onLaunchAssistantWithStep }: BrewMethodBlueprintModalProps) {
  const { language, t } = useLanguage();
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const currentStepData = BREW_METHOD_STEPS.find(s => s.step === activeStep) || BREW_METHOD_STEPS[0];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 md:p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg tracking-tight">
                  {t('The Brew Method: 8-Trins Journalistisk Blueprint', 'The Brew Method: 8-Step Investigative Blueprint')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Forensic Standard
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {t(
                  'Strengt evidensbaseret, afmystificerende tilgang til sagsundersøgelse og kildekritik.',
                  'Strict evidence-based investigative journalism and forensic de-mystification framework.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content with Steps Nav */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Step Selector Sidebar */}
          <div className="w-full md:w-72 bg-zinc-950/60 border-r border-zinc-800 p-3 space-y-1 overflow-y-auto max-h-56 md:max-h-none">
            {BREW_METHOD_STEPS.map((item) => {
              const Icon = item.icon;
              const isSelected = activeStep === item.step;
              return (
                <button
                  key={item.step}
                  onClick={() => setActiveStep(item.step)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {item.step}
                  </span>
                  <span className="truncate">
                    {language === 'da' ? item.titleDa : item.titleEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Step Detail View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-900/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-inner">
                <StepIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                  TRIN {currentStepData.step} AF 8
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">
                  {language === 'da' ? currentStepData.titleDa : currentStepData.titleEn}
                </h4>
                <div className="text-xs text-zinc-400 font-medium">
                  {language === 'da' ? currentStepData.headlineDa : currentStepData.headlineEn}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-zinc-300 leading-relaxed">
              {language === 'da' ? currentStepData.descriptionDa : currentStepData.descriptionEn}
            </div>

            {/* Key Questions to ask */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>{t('Kritiske spørgsmål i dette trin:', 'Critical audit questions for this step:')}</span>
              </h5>
              <div className="space-y-2">
                {currentStepData.keyQuestionsDa.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 flex items-start gap-2.5"
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch with AI Assistant */}
            {onLaunchAssistantWithStep && (
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {t('Vil du anvende dette trin direkte på sagsmaterialet med AI?', 'Apply this step to the case files using the AI Investigator?')}
                </span>
                <button
                  onClick={() => {
                    onLaunchAssistantWithStep(currentStepData.step, currentStepData.titleDa);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{t(`Anvend Trin ${currentStepData.step} i AI Konsulent`, `Run Step ${currentStepData.step} in AI Assistant`)}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
