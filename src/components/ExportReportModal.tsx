import React, { useState, useRef } from 'react';
import {
  FileDown,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  MessageSquare,
  FileText,
  ShieldAlert,
  Sparkles,
  Download,
  Copy,
  Check,
  Layers,
  Clock,
  User,
  Scale
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../contexts/LanguageContext';
import { useCaseData } from '../contexts/CaseDataContext';
import { TimelineEvent, DocumentFinding, Party, SeriousClaim } from '../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatMessages?: Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>;
  currentTimelineEvents?: TimelineEvent[];
}

export function ExportReportModal({
  isOpen,
  onClose,
  chatMessages = [],
  currentTimelineEvents
}: ExportReportModalProps) {
  const { language, t } = useLanguage();
  const caseData = useCaseData();
  const { summary, documents, parties, claims, timelineEvents } = caseData;

  const activeTimeline = currentTimelineEvents || timelineEvents;

  const [reportType, setReportType] = useState<'timeline' | 'ai_chat' | 'dossier'>('timeline');
  const [includeCitations, setIncludeCitations] = useState<boolean>(true);
  const [includeBrewMethod, setIncludeBrewMethod] = useState<boolean>(true);
  const [includeInvestigatorNotes, setIncludeInvestigatorNotes] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  // Generate Report as formatted jsPDF document
  const handleExportPDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [30, 41, 59]; // Slate 800
      const accentColor = [79, 70, 229]; // Indigo 600
      let y = 20;

      // Page Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('THE BREW METHOD // EFTERFORSKNINGSRAPPORT', 14, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Sag: Lyngby-Taarbæk // Genereret: ${new Date().toLocaleDateString('da-DK')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        14,
        y
      );
      y += 4;

      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, 196, y);
      y += 8;

      if (reportType === 'timeline') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('Syntetiseret Kronologisk Tidslinjerapport', 14, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(
          `Rapporten indeholder ${activeTimeline.length} verificerede begivenheder og sagsakter opbygget efter Trin 2 i The Brew Method.`,
          14,
          y
        );
        y += 8;

        // Iterate events
        activeTimeline.forEach((event, idx) => {
          if (y > 265) {
            doc.addPage();
            y = 20;
          }

          // Event box header
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text(`[${event.date}] ${event.title}`, 16, y + 5);
          y += 10;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const descLines = doc.splitTextToSize(event.description, 178);
          doc.text(descLines, 16, y);
          y += descLines.length * 4 + 2;

          if (includeInvestigatorNotes && event.userNotes) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(99, 102, 241);
            doc.text(`Efterforsker-notat: ${event.userNotes}`, 16, y);
            y += 5;
          }

          y += 3;
        });
      } else if (reportType === 'ai_chat') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('AI Case Assistant // Efterforskningsdialog & Analyse', 14, y);
        y += 6;

        chatMessages.forEach((msg, idx) => {
          if (y > 265) {
            doc.addPage();
            y = 20;
          }

          const isAi = msg.sender === 'ai';
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(isAi ? accentColor[0] : 15, isAi ? accentColor[1] : 23, isAi ? accentColor[2] : 42);
          doc.text(`${isAi ? 'AI Case Assistant (Gemini 3.7 Flash)' : 'Efterforsker'} [${msg.timestamp}]:`, 14, y);
          y += 5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const cleanText = msg.text.replace(/\*\*/g, '').replace(/###/g, '');
          const lines = doc.splitTextToSize(cleanText, 180);
          doc.text(lines, 14, y);
          y += lines.length * 4 + 6;
        });
      } else {
        // Dossier Executive Summary
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('Samlet Sagsdossier & Forvaltningsaudit', 14, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const sumLines = doc.splitTextToSize(summary?.description || 'Officiel sagsoversigt for Lyngby-Taarbæk sagen.', 180);
        doc.text(sumLines, 14, y);
        y += sumLines.length * 4 + 8;

        // Key Metrics
        doc.setFont('helvetica', 'bold');
        doc.text(`Registrerede Sagsakter: ${documents.length} | Parter: ${parties.length} | Påstande: ${claims.length}`, 14, y);
        y += 10;
      }

      // Add page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Side ${i} af ${totalPages} — Fortroligt efterforskningsmateriale`, 105, 290, { align: 'center' });
      }

      const filename = `Brew-Method-Rapport-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let reportMd = `# THE BREW METHOD // EFTERFORSKNINGSRAPPORT\n**Sag:** Lyngby-Taarbæk Sag\n**Dato:** ${new Date().toLocaleDateString('da-DK')}\n\n`;

    if (reportType === 'timeline') {
      reportMd += `## Syntetiseret Tidslinje (${activeTimeline.length} hændelser)\n\n`;
      activeTimeline.forEach(evt => {
        reportMd += `### [${evt.date}] ${evt.title}\n`;
        reportMd += `${evt.description}\n`;
        if (evt.userNotes) reportMd += `*Efterforsker-notat:* ${evt.userNotes}\n`;
        reportMd += `\n`;
      });
    } else if (reportType === 'ai_chat') {
      reportMd += `## AI Case Assistant Dialog\n\n`;
      chatMessages.forEach(msg => {
        reportMd += `**${msg.sender === 'ai' ? 'AI Assistant' : 'Efterforsker'} (${msg.timestamp}):**\n${msg.text}\n\n`;
      });
    }

    navigator.clipboard.writeText(reportMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-4xl max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('Eksporter Formateret Sagsrapport (PDF)', 'Export Formatted Case Report (PDF)')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('Generer retslig rapport baseret på The Brew Method med tidslinje, kildekritik og AI-syntese.', 'Generate judicial report based on The Brew Method with timeline, source critiques, and AI synthesis.')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Report Type Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 block">
              {t('Vælg Rapporttype', 'Select Report Type')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setReportType('timeline')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  reportType === 'timeline'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">{t('Syntetiseret Tidslinje', 'Synthesized Timeline')}</h4>
                <p className="text-[11px] text-slate-400">
                  {t(`${activeTimeline.length} kronologiske hændelser med kildekritik & Hanlon's Razor.`, `${activeTimeline.length} chronological events with source critiques & Hanlon's Razor.`)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('ai_chat')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  reportType === 'ai_chat'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-5 h-5 text-purple-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">{t('AI Efterforskningsdialog', 'AI Investigation Chat')}</h4>
                <p className="text-[11px] text-slate-400">
                  {t(`${chatMessages.length} dialoger med 8-trins metodologisk analyse og citater.`, `${chatMessages.length} dialogues with 8-step blueprint analysis and citations.`)}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('dossier')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  reportType === 'dossier'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Scale className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">{t('Komplet Sagsdossier', 'Full Case Dossier')}</h4>
                <p className="text-[11px] text-slate-400">
                  {t('Overordnet resumé, partsprofiler, påstandsoversigt og bilagskatalog.', 'Executive summary, party profiles, claim ledger, and evidence index.')}
                </p>
              </button>
            </div>
          </div>

          {/* Report Options */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {t('Rapportindstillinger & Bilag', 'Report Settings & Attachments')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCitations}
                  onChange={(e) => setIncludeCitations(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t('Inkluder verificerede kildehenvisninger', 'Include verified source citations')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBrewMethod}
                  onChange={(e) => setIncludeBrewMethod(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t('Inkluder The Brew Method 8-trins analyse', 'Include The Brew Method 8-step analysis')}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInvestigatorNotes}
                  onChange={(e) => setIncludeInvestigatorNotes(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t('Inkluder personlige efterforsker-notater', 'Include personal investigator notes')}</span>
              </label>
            </div>
          </div>

          {/* Quick Preview Box */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
              <span>{t('Dokumentoverskrift i PDF:', 'Document Header in PDF:')}</span>
              <span className="text-indigo-400 font-bold">A4 Formateret PDF</span>
            </div>
            <div className="bg-white text-slate-900 p-4 rounded border border-slate-300 text-xs font-serif leading-relaxed">
              <div className="font-bold text-indigo-900 border-b border-slate-200 pb-1 mb-2">
                THE BREW METHOD // {reportType === 'timeline' ? 'KRONOLOGISK TIDSLINJERAPPORT' : reportType === 'ai_chat' ? 'AI EFTERFORSKNINGSDIALOG' : 'SAGSDOSSIER'}
              </div>
              <p className="text-[11px] text-slate-600">
                Sagsakt: Lyngby-Taarbæk Kommune • Indeks: {documents.length} dokumenter • Genereret: {new Date().toLocaleDateString('da-DK')}
              </p>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="bg-slate-950 border-t border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? t('Kopieret til udklipsholder!', 'Copied to clipboard!') : t('Kopier Markdown', 'Copy Markdown')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('Udskriv / Web PDF', 'Print / Web PDF')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t('Annuller', 'Cancel')}
            </button>

            <button
              disabled={isGenerating}
              onClick={handleExportPDF}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? t('Genererer PDF...', 'Generating PDF...') : t('Download PDF Rapport', 'Download PDF Report')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
