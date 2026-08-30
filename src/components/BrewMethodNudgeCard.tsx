import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  Search,
  Scale,
  HeartHandshake
} from 'lucide-react';
import { DocumentFinding } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BrewMethodNudgeCardProps {
  activeDocument: DocumentFinding | null;
  allDocuments?: DocumentFinding[];
  onSelectDocument?: (doc: DocumentFinding) => void;
  onAskQuestion: (questionText: string) => void;
  defaultExpanded?: boolean;
}

export function BrewMethodNudgeCard({
  activeDocument,
  allDocuments = [],
  onSelectDocument,
  onAskQuestion,
  defaultExpanded = false
}: BrewMethodNudgeCardProps) {
  const { language, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  // If no document is selected, default to the first verified document
  const currentDoc = activeDocument || allDocuments[0];

  if (!currentDoc) return null;

  const docTitle = currentDoc.title;
  const docRef = currentDoc.docNumber || currentDoc.id;
  const docDate = currentDoc.date;
  const docAuthor = currentDoc.author || 'Forvaltning / Part';

  // The 8 Brew Method Investigative Steps tailored specifically to the active document
  const brewSteps = [
    {
      step: 1,
      name: language === 'da' ? 'Trin 1: Anti-Confirmation Bias' : 'Step 1: Anti-Confirmation Bias',
      icon: ShieldCheck,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/30',
      question:
        language === 'da'
          ? `Anvend Trin 1 (Anti-Confirmation Bias) på ${docRef}: Isoler de ubestridelige fakta i dokumentet '${docTitle}' fra forvaltningens eller forældrenes subjektive tolkninger og antagelser.`
          : `Apply Step 1 (Anti-Confirmation Bias) to ${docRef}: Isolate the undeniable raw facts in '${docTitle}' from any subjective interpretations.`
    },
    {
      step: 2,
      name: language === 'da' ? 'Trin 2: Kronologisk Kortlægning' : 'Step 2: Chronological Mapping',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      question:
        language === 'da'
          ? `Anvend Trin 2 (Kronologisk Kortlægning) på ${docRef}: Hvor placerer hændelserne i '${docTitle}' (${docDate}) sig på sagens overordnede tidslinje, og opstår der kronologiske uoverensstemmelser med de øvrige sagsakter?`
          : `Apply Step 2 (Chronological Mapping) to ${docRef}: Where do events in '${docTitle}' (${docDate}) fit in the master timeline, and are there chronological anomalies?`
    },
    {
      step: 3,
      name: language === 'da' ? "Trin 3: Hanlon's Razor (Anomalier)" : "Step 3: Hanlon's Razor (Anomalies)",
      icon: HelpCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      question:
        language === 'da'
          ? `Anvend Trin 3 (Hanlon's Razor) på ${docRef}: Er manglerne, forsinkelserne eller modstridende oplysninger i '${docTitle}' et resultat af travlhed, systemisk inkompetence eller administrative fejl frem for en overlagt sammensværgelse?`
          : `Apply Step 3 (Hanlon's Razor) to ${docRef}: Could the omissions or discrepancies in '${docTitle}' be explained by workload or incompetence rather than deliberate conspiracy?`
    },
    {
      step: 4,
      name: language === 'da' ? 'Trin 4: Kilde- & Ekspertkritik' : 'Step 4: Source & Expert Critique',
      icon: Search,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
      question:
        language === 'da'
          ? `Anvend Trin 4 (Kilde- og Ekspertkritik) på ${docRef}: Vurder forfatteren (${docAuthor}) og eventuelle vidner i '${docTitle}'. Hvem betaler/ansætter kilden, hvilke bias kan være i spil, og hvornår er udtalelsen noteret i forhold til begivenheden?`
          : `Apply Step 4 (Source Critique) to ${docRef}: Critique the author (${docAuthor}) and witnesses in '${docTitle}'. Are there potential biases or delays in recording?`
    },
    {
      step: 5,
      name: language === 'da' ? 'Trin 5: Datadrevet OSINT' : 'Step 5: Data-Driven OSINT Verification',
      icon: Compass,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      question:
        language === 'da'
          ? `Anvend Trin 5 (Datadrevet Efterforskning / OSINT) på ${docRef}: Hvordan kan vi krydstjekke oplysningerne i '${docTitle}' med tekniske data, tidsstempler, journalnumre eller eksterne registre?`
          : `Apply Step 5 (OSINT Verification) to ${docRef}: How can assertions in '${docTitle}' be verified through timestamps, metadata, and digital investigation?`
    },
    {
      step: 6,
      name: language === 'da' ? 'Trin 6: Adskillelse af Støj og Signal' : 'Step 6: Noise vs. Signal Separation',
      icon: Sparkles,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      question:
        language === 'da'
          ? `Anvend Trin 6 (Støj vs Signal) på ${docRef}: Hvilke dele af '${docTitle}' er blot proceduremæssig støj eller følelsesladede rygter, og hvad udgør det konkrete, juridisk verificerbare kernesignal?`
          : `Apply Step 6 (Noise vs Signal) to ${docRef}: Filter out procedural clutter in '${docTitle}' and isolate the verifiable core signal.`
    },
    {
      step: 7,
      name: language === 'da' ? 'Trin 7: Den Jordbundne Konklusion' : 'Step 7: Grounded Conclusion',
      icon: Scale,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      question:
        language === 'da'
          ? `Anvend Trin 7 (Den Jordbundne Konklusion) på ${docRef}: Hvad er den mest logiske, nøgterne og saglige forklaring på fundene i '${docTitle}', uanset om det modsiger en dramatisk fortælling?`
          : `Apply Step 7 (Grounded Conclusion) to ${docRef}: Provide the most objective, factual conclusion regarding '${docTitle}', avoiding dramatic over-interpretation.`
    },
    {
      step: 8,
      name: language === 'da' ? 'Trin 8: Det Større Perspektiv' : 'Step 8: Moral Anchor & Bigger Picture',
      icon: HeartHandshake,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      question:
        language === 'da'
          ? `Anvend Trin 8 (Det Større Perspektiv) på ${docRef}: Hvem er det egentlige offer i relation til '${docTitle}', og hvad er det primære retssvigt og moralske anker, vi ikke må miste af syne?`
          : `Apply Step 8 (Moral Anchor) to ${docRef}: Who is the true victim in relation to '${docTitle}', and what is the primary systemic breakdown?`
    }
  ];

  // Collapsed Mode: Compact 1-line bar that takes minimal space
  if (!isExpanded) {
    return (
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl px-3 py-1.5 shadow-sm transition-all flex items-center justify-between gap-2 text-xs mb-1 flex-grow-0 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Compass className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-200 text-[11px] truncate shrink-0">
            The Brew Method™
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 shrink-0 font-bold">
            {docRef}
          </span>
          <span className="text-slate-400 text-[11px] truncate hidden sm:inline">
            {docTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick document switcher */}
          {allDocuments.length > 1 && onSelectDocument && (
            <select
              value={currentDoc.id}
              onChange={(e) => {
                const found = allDocuments.find((d) => d.id === e.target.value);
                if (found) onSelectDocument(found);
              }}
              className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] focus:outline-none cursor-pointer max-w-[110px] truncate"
            >
              {allDocuments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.docNumber || d.id}: {d.title.slice(0, 15)}...
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="px-2 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title={t('Åbn 8-Trin Nudge-spørgsmål', 'Open 8-step nudge questions')}
          >
            <span>{t('Nudge-spørgsmål', 'Nudge Queries')}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded Mode: Full card with max height limits and flex-grow-0
  return (
    <div className="bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-3.5 shadow-xl mb-2 transition-all space-y-2.5 flex-grow-0 shrink-0 max-h-[30vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>The Brew Method™</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 font-bold">
                {t('Efterforsknings-Nudge', 'Investigative Nudge')}
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Document Switcher if multiple documents */}
          {allDocuments.length > 1 && onSelectDocument && (
            <select
              value={currentDoc.id}
              onChange={(e) => {
                const found = allDocuments.find((d) => d.id === e.target.value);
                if (found) onSelectDocument(found);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[160px] truncate"
            >
              {allDocuments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.docNumber || d.id}: {d.title.slice(0, 20)}...
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title={t('Minimer Nudge', 'Minimize Nudge')}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Document Tag */}
      <div className="px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-mono font-bold text-indigo-300">{docRef}</span>
          <span className="text-slate-300 truncate">{docTitle}</span>
        </div>
        <span className="text-slate-500 shrink-0 font-mono text-[10px]">{docDate}</span>
      </div>

      {/* Expanded Nudge Steps */}
      <div className="space-y-2">
        {/* Step Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {brewSteps.map((stepItem, idx) => {
            const IconComp = stepItem.icon;
            const isSelected = selectedStepIndex === idx;
            return (
              <button
                key={stepItem.step}
                type="button"
                onClick={() => setSelectedStepIndex(idx)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
                }`}
              >
                <IconComp className={`w-3 h-3 ${isSelected ? 'text-white' : stepItem.color}`} />
                <span>Trin {stepItem.step}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Question Card */}
        {brewSteps[selectedStepIndex] && (
          <div
            className={`p-2.5 rounded-xl border text-xs ${brewSteps[selectedStepIndex].bgColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all max-h-40 overflow-y-auto`}
          >
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="font-bold text-slate-200 text-[11px]">
                {brewSteps[selectedStepIndex].name}
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                "{brewSteps[selectedStepIndex].question}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onAskQuestion(brewSteps[selectedStepIndex].question);
                setIsExpanded(false); // Automatically collapse after asking to clear the chat view
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0 whitespace-nowrap self-end sm:self-auto"
            >
              <span>{t('Stil Spørgsmål', 'Ask Question')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
