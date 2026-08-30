import React, { useState, useRef, useEffect } from 'react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  FileText,
  AlertTriangle,
  Radio,
  Check,
  Copy,
  ChevronRight,
  HelpCircle,
  Compass,
  Scale,
  ShieldCheck,
  Zap,
  CornerDownRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { DocumentFinding } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: Array<{
    id: string;
    title: string;
    type: string;
    snippet?: string;
  }>;
  confidenceScore?: number;
  modelUsed?: string;
}

interface AICaseAssistantProps {
  onSelectDocument?: (doc: DocumentFinding) => void;
  initialQuestion?: string;
  className?: string;
}

export function AICaseAssistant({
  onSelectDocument,
  initialQuestion,
  className = ''
}: AICaseAssistantProps) {
  const { summary, documents, transcripts, claims, parties, timelineEvents } = useCaseData();
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: language === 'da'
        ? `Velkommen til **AI Case Assistant** for **${summary.caseName || 'Lyngby-Taarbæk Sagen'}**.\n\nJeg er din forensiske graverjournalist og sagskonsulent, der arbejder ud fra **The Brew Method** (den 8-trins evidensbaserede efterforskningsmodel).\n\nDu kan stille spørgsmål om alle ${documents.length} registrerede sagsakter, FABU-rapporter, mødelydbånd, urinprøverapporter og forvaltningens administrative afgørelser.`
        : `Welcome to the **AI Case Assistant** for **${summary.caseName || 'Lyngby-Taarbæk Case'}**.\n\nI am your lead forensic case investigator working under **The Brew Method** (the 8-step evidence-based methodology).\n\nYou can inquire about any of the ${documents.length} indexed files, FABU supervised visitation observations, meeting recordings, laboratory tests, or municipal decisions.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: documents.slice(0, 3).map((d) => ({
        id: d.docNumber || d.id,
        title: d.title,
        type: 'Document',
        snippet: d.summary
      }))
    }
  ]);

  const [inputValue, setInputValue] = useState(initialQuestion || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Initial Question trigger if passed via props
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      setInputValue(initialQuestion);
    }
  }, [initialQuestion]);

  // Preset suggested investigative questions
  const presetPrompts = [
    {
      labelDa: '🎙️ Gennemgå 15. januar mødeoptagelsen',
      labelEn: '🎙️ Analyze Jan 15 recorded meeting',
      queryDa: 'Hvad blev der indrømmet på lydoptagelsen fra mødet den 15. januar 2026 i Lyngby-Taarbæk Kommune?',
      queryEn: 'What admissions were made on the audio recording from the Jan 15, 2026 meeting in Lyngby-Taarbæk?'
    },
    {
      labelDa: '📋 Hvad konkluderer FABU rapporterne?',
      labelEn: '📋 Summarize FABU visitation reports',
      queryDa: 'Hvad konkluderer FABU observationerne og rapporterne om børnenes tilknytning og trivsel under samværene?',
      queryEn: 'What do the FABU supervised visitation reports conclude regarding the children’s attachment and wellbeing?'
    },
    {
      labelDa: '🧭 Anvend The Brew Method (8 trin)',
      labelEn: '🧭 Apply The Brew Method (8 steps)',
      queryDa: 'Gennemgå hele sagsforløbet trin for trin efter The Brew Method (Trin 1 til 8).',
      queryEn: 'Review the entire case process step-by-step using The Brew Method (Steps 1 through 8).'
    },
    {
      labelDa: '⚖️ Analyse af B&U Udvalgsafgørelsen',
      labelEn: '⚖️ Analyze Children & Youth Decree',
      queryDa: 'Hvilke faktuelle uoverensstemmelser er der i Børn og Unge-udvalgets afgørelse fra 29. maj 2026?',
      queryEn: 'What factual discrepancies exist in the Children and Youth Committee decision of May 29, 2026?'
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build case context payload
      const caseContext = {
        summary,
        documents: documents.map((d) => ({
          id: d.id,
          docNumber: d.docNumber,
          title: d.title,
          date: d.date,
          author: d.author,
          summary: d.summary,
          significance: d.significance,
          ocrText: (d as any).ocrText || (d as any).fullText || '',
          excerpt: d.excerpt
        })),
        transcripts: transcripts.map((t) => ({
          id: t.id,
          speaker: t.speaker,
          date: t.date,
          text: t.text,
          summary: t.summary || t.title || ''
        })),
        claims: claims.map((c) => ({
          id: c.id,
          claimId: c.claimId,
          category: c.category,
          severity: c.severity,
          description: c.description,
          status: c.status
        })),
        parties: parties.map((p) => ({
          id: p.id,
          name: p.name,
          role: p.role,
          organization: p.organization,
          riskLevel: p.riskLevel,
          connectionType: p.connectionType
        })),
        timelineEvents: timelineEvents.slice(0, 40)
      };

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query.trim(),
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text
          })),
          caseContext,
          language
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || t('Ingen analyse returneret fra Gemini.', 'No analysis returned from Gemini.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        confidenceScore: data.confidenceScore || 98,
        modelUsed: data.model || 'gemini-3.7-flash'
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Error during AI Case Assistant chat:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: language === 'da'
          ? `### ⚠️ Fejl under AI analyse\nDer opstod en fejl under kommunikationen med Gemini API: ${err.message || 'Ukendt netværksfejl'}. Prøv venligst igen.`
          : `### ⚠️ AI Analysis Error\nAn error occurred while communicating with the Gemini API: ${err.message || 'Network error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        sender: 'ai',
        text: language === 'da'
          ? `Samtale nulstillet. Hvordan kan jeg bistå med efterforskningen af **${summary.caseName || 'sagen'}**?`
          : `Conversation reset. How can I assist with investigating **${summary.caseName || 'the case'}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCitationClick = (citationId: string) => {
    if (!onSelectDocument) return;
    const foundDoc = documents.find(
      (d) => d.id === citationId || d.docNumber === citationId
    );
    if (foundDoc) {
      onSelectDocument(foundDoc);
    }
  };

  return (
    <div className={`flex flex-col h-[740px] max-h-[85vh] bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden ${className}`}>
      {/* Top Header */}
      <div className="bg-zinc-950/90 border-b border-zinc-800 px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>AICaseAssistant</span>
              </h3>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {t('Forensisk graverjournalist & sagsbevis-syntese (The Brew Method)', 'Forensic investigator & evidence synthesis engine')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 border border-zinc-700"
            title={t('Nulstil samtale', 'Reset chat')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('Nulstil', 'Reset')}</span>
          </button>
        </div>
      </div>

      {/* Preset Query Chips Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase shrink-0">
          {t('Foreslåede emner:', 'Prompts:')}
        </span>
        <div className="flex items-center gap-2 min-w-max">
          {presetPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(language === 'da' ? p.queryDa : p.queryEn)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {language === 'da' ? p.labelDa : p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Flow */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-zinc-900/60">
        <AnimatePresence>
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[88%] md:max-w-[78%] space-y-2.5 ${isAI ? 'text-left' : 'text-right'}`}>
                  {/* Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-lg ${
                      isAI
                        ? 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                        : 'bg-emerald-600 text-zinc-950 font-medium ml-auto shadow-emerald-600/20'
                    }`}
                  >
                    {isAI ? (
                      <div className="prose prose-invert prose-xs max-w-none space-y-2 text-zinc-200">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}
                  </div>

                  {/* Interactive Citations Box */}
                  {isAI && msg.citations && msg.citations.length > 0 && (
                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-indigo-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="font-bold text-indigo-400 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {t('Dokumenterede Kildehenvisninger:', 'Grounded Citations:')}
                        </span>
                        {msg.confidenceScore && (
                          <span className="text-emerald-400 font-bold">
                            {msg.confidenceScore}% {t('konfidens', 'confidence')}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.citations.map((cit, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleCitationClick(cit.id)}
                            className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                            title={cit.snippet || cit.title}
                          >
                            <span>[{cit.id}]</span>
                            <span className="truncate max-w-[140px]">{cit.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Meta & Copy Tool */}
                  <div className={`flex items-center gap-2 text-[10px] text-zinc-500 font-mono ${isAI ? 'justify-start' : 'justify-end'}`}>
                    <span>{msg.timestamp}</span>
                    {isAI && (
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                        title={t('Kopier svar', 'Copy message')}
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? t('Kopieret', 'Copied') : t('Kopier', 'Copy')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-center text-zinc-400 text-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span className="text-zinc-300 font-mono text-[11px]">
                {t('Gemini analyserer sagsakter og anvender The Brew Method...', 'Gemini analyzing case files and applying The Brew Method...')}
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('Stil et forensisk spørgsmål til sagsakterne, lydoptagelser eller personer...', 'Ask a forensic question about files, audio tapes, or entities...')}
              disabled={isLoading}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-4 pr-10 py-3 text-xs md:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Spørg AI', 'Ask')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
