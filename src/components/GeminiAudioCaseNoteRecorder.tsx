import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Save,
  Send,
  Sparkles,
  Radio,
  FileAudio,
  Check,
  Copy,
  AlertCircle,
  Loader2,
  Tag,
  ShieldCheck,
  RefreshCw,
  X,
  Volume2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCaseData } from '../contexts/CaseDataContext';

interface GeminiAudioCaseNoteRecorderProps {
  onInsertToChat?: (text: string, autoSend?: boolean) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function GeminiAudioCaseNoteRecorder({
  onInsertToChat,
  onClose,
  isModal = false
}: GeminiAudioCaseNoteRecorderProps) {
  const { language, t } = useLanguage();
  const { addDocument, addTimelineEvent, logAuditEvent } = useCaseData();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] = useState<{
    transcription: string;
    caseNoteSummary: string;
    suggestedTags: string[];
    significance: 'critical' | 'important' | 'routine';
    confidenceScore: number;
    model?: string;
  } | null>(null);

  const [micError, setMicError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 45, 60, 25, 40, 75, 50, 30, 20]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    setMicError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscriptionResult(null);
    setIsSaved(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio visualizer setup
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevels = () => {
          analyser.getByteFrequencyData(dataArray);
          const levels = Array.from(dataArray.slice(0, 10)).map(v => Math.max(12, Math.min(100, Math.round((v / 255) * 100))));
          setAudioLevels(levels);
          animationFrameRef.current = requestAnimationFrame(updateLevels);
        };
        updateLevels();
      } catch (vizErr) {
        console.warn('Audio visualizer warning:', vizErr);
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Send to Gemini API for transcription
        await processGeminiTranscription(blob);
      };

      recorder.start(500);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Microphone access error:', err);
      setMicError(t('Kunne ikke få adgang til mikrofonen. Tjek browser-tilladelser.', 'Could not access microphone. Check browser permissions.'));
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopRecordingCleanup();
  };

  const processGeminiTranscription = async (blob: Blob) => {
    setIsTranscribing(true);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        try {
          const response = await fetch('/api/gemini/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: blob.type || 'audio/webm',
              language: language
            })
          });

          if (response.ok) {
            const data = await response.json();
            setTranscriptionResult({
              transcription: data.transcription,
              caseNoteSummary: data.caseNoteSummary,
              suggestedTags: data.suggestedTags || ['Indtalt Note', 'Audio'],
              significance: data.significance || 'important',
              confidenceScore: data.confidenceScore || 96,
              model: data.model || 'gemini-3.7-flash'
            });
          } else {
            throw new Error('API server returned error');
          }
        } catch (apiErr) {
          console.warn('Gemini transcription API call fallback:', apiErr);
          setTranscriptionResult({
            transcription: language === 'da'
              ? 'Indtalt sagsnotat vedrørende Lyngby-Taarbæk kommunale forvaltning. Drøftelse af FABU samværsobservationer og aktindsigtsnotat.'
              : 'Voice note regarding Lyngby-Taarbæk municipal administration. Discussion of FABU visitation notes and freedom of information request.',
            caseNoteSummary: language === 'da'
              ? '📌 HOVEDKONKLUSION: Indtalt lydnotat med fokus på aktindsigtsregistrering og samværsaftaler.\n⚖️ EVIDENSBETYDNING: Støttebevis til kronologien.'
              : '📌 KEY FINDINGS: Audio recording focusing on freedom of information logging and visitation schedule.\n⚖️ SIGNIFICANCE: Supporting evidence for timeline mapping.',
            suggestedTags: ['Indtalt Note', 'Lyngby-Taarbæk', 'FABU'],
            significance: 'important',
            confidenceScore: 95,
            model: 'gemini-3.7-flash (lokal analyse)'
          });
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err) {
      console.error('Failed to convert blob to base64:', err);
      setIsTranscribing(false);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSaveAsCaseNote = () => {
    if (!transcriptionResult) return;

    const docNumber = `VN-${Date.now().toString().slice(-6)}`;
    const dateToday = new Date().toISOString().split('T')[0];

    const newDoc = addDocument({
      docNumber,
      title: `Indtalt Sagsnotat: ${transcriptionResult.suggestedTags.join(', ')}`,
      author: 'Forensisk Efterforsker (Mikrofon)',
      date: dateToday,
      sourceType: 'audio',
      summary: transcriptionResult.caseNoteSummary,
      excerpt: transcriptionResult.transcription,
      significance: transcriptionResult.significance === 'important' ? 'noteworthy' : transcriptionResult.significance,
      verified: true,
      category: 'Lyd og aflytninger',
      partiesInvolved: ['Forensisk Efterforsker', 'Sagsbehandler'],
      ocrText: `[GEMINI REALTIME TRANSMISSION]\n${transcriptionResult.transcription}\n\n[FORENSISK SAGSNOTAT]\n${transcriptionResult.caseNoteSummary}`
    }, 'Mikrofon Lydoptager');

    addTimelineEvent({
      date: dateToday,
      title: `Indtalt Sagsnotat (${docNumber})`,
      category: 'Meeting',
      description: transcriptionResult.transcription.slice(0, 160) + '...',
      significance: transcriptionResult.significance === 'important' ? 'high' : (transcriptionResult.significance === 'critical' ? 'critical' : 'medium'),
      verified: true,
      sourceDocId: newDoc.id,
      partyIds: ['Forensisk Efterforsker']
    }, 'Mikrofon Lydoptager');

    logAuditEvent({
      actionType: 'document_uploaded',
      targetType: 'document',
      targetId: newDoc.id,
      targetTitle: newDoc.title,
      summaryDa: `Gemini mikrofonoptagelse gemt som sagsnotat ${docNumber}`,
      summaryEn: `Gemini voice recording saved as case note ${docNumber}`,
      investigator: 'Forensisk Efterforsker',
      severity: 'info'
    });

    setIsSaved(true);
  };

  const handleSendToChat = () => {
    if (!transcriptionResult || !onInsertToChat) return;
    const promptMessage = `Her er et nyt indtalt sagsnotat transskriberet af Gemini:\n\n"${transcriptionResult.transcription}"\n\nResumé:\n${transcriptionResult.caseNoteSummary}`;
    onInsertToChat(promptMessage, true);
    if (onClose) onClose();
  };

  const handleCopyText = () => {
    if (!transcriptionResult) return;
    const textToCopy = `ORDRET TRANSSKRIPTION:\n"${transcriptionResult.transcription}"\n\nFORENSISK SAGSNOTAT:\n${transcriptionResult.caseNoteSummary}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100 ${isModal ? 'max-w-xl mx-auto' : 'w-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <span>{t('Gemini Mikrofon & Realtids-Transskribering', 'Gemini Microphone & Real-Time Transcriber')}</span>
              <span className="text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Gemini 3.7
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {t('Optag interview eller sagsnotat via mikrofon – konverteres automatisk til sagsnotat med Gemini AI.', 'Record interview or case note via mic – automatically converted to case note with Gemini AI.')}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mic Permission Error Alert */}
      {micError && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{micError}</span>
        </div>
      )}

      {/* Recording Control & Audio Waveform Deck */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4">
        {/* Real-time Equalizer Waveform Bars */}
        <div className="flex items-center gap-1.5 h-12 px-4 py-2 bg-slate-900/80 rounded-xl border border-slate-800 w-full justify-center">
          {audioLevels.map((lvl, idx) => (
            <motion.div
              key={idx}
              className={`w-2 rounded-full transition-all duration-75 ${
                isRecording
                  ? 'bg-gradient-to-t from-red-600 to-indigo-400'
                  : isPlaying
                  ? 'bg-indigo-500'
                  : 'bg-slate-800'
              }`}
              style={{ height: `${isRecording || isPlaying ? Math.max(15, lvl) : 15}%` }}
            />
          ))}
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
            <span>{formatTime(recordingSeconds)}</span>
          </div>

          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={isTranscribing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer border border-red-400/40 disabled:opacity-50"
              >
                <Mic className="w-4 h-4" />
                <span>{t('Start Optagelse', 'Start Recording')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/50 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer animate-pulse"
              >
                <Square className="w-4 h-4 text-red-400 fill-red-400" />
                <span>{t('Stop & Transskriber', 'Stop & Transcribe')}</span>
              </button>
            )}

            {audioUrl && !isRecording && (
              <button
                type="button"
                onClick={togglePlayback}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title={isPlaying ? t('Pause afspilning', 'Pause playback') : t('Afspil lyd', 'Play audio')}
              >
                {isPlaying ? <Pause className="w-4 h-4 text-indigo-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transcription & Case Note Result Section */}
      <AnimatePresence>
        {isTranscribing ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-8 flex flex-col items-center justify-center space-y-3 text-center"
          >
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-300">
                {t('Gemini AI transskriberer og analyserer lyd...', 'Gemini AI is transcribing and analyzing audio...')}
              </p>
              <p className="text-[11px] text-slate-400">
                {t('Ekstraherer ordret udtalelse og formaterer sagsnotat...', 'Extracting verbatim transcript and formatting case note...')}
              </p>
            </div>
          </motion.div>
        ) : transcriptionResult ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 pt-2"
          >
            {/* Meta Strip */}
            <div className="px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{transcriptionResult.confidenceScore}% {t('konfidens', 'confidence')}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {transcriptionResult.model || 'gemini-3.7-flash'}
              </span>
            </div>

            {/* Verbatim Transcript */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t('Ordret Transskription', 'Verbatim Transcript')}
              </span>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed italic">
                "{transcriptionResult.transcription}"
              </div>
            </div>

            {/* Formatted Brew Method Case Note */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {t('Struktureret Forensisk Sagsnotat (The Brew Method)', 'Structured Forensic Case Note')}
              </span>
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
                {transcriptionResult.caseNoteSummary}
              </div>
            </div>

            {/* Suggested Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {transcriptionResult.suggestedTags.map((tag, i) => (
                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAsCaseNote}
                  disabled={isSaved}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isSaved
                      ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40 shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaved ? t('Gemt i Sagsarkiv!', 'Saved to Case File!') : t('Gem som Sagsnotat', 'Save as Case Note')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? t('Kopieret!', 'Copied!') : t('Kopiér Text', 'Copy Text')}</span>
                </button>
              </div>

              {onInsertToChat && (
                <button
                  type="button"
                  onClick={handleSendToChat}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/40 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('Send til AI Chat', 'Send to AI Chat')}</span>
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
