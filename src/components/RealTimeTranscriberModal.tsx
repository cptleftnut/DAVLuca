import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Save,
  Trash2,
  BookmarkPlus,
  Volume2,
  VolumeX,
  User,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  X,
  FileText,
  Radio,
  Tag,
  RotateCcw,
  Languages,
  Check,
  ChevronDown
} from 'lucide-react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DocumentFinding, TranscriptSnippet, Party } from '../types';

interface RealTimeTranscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptSaved?: (doc: DocumentFinding, transcript: TranscriptSnippet) => void;
  defaultSpeaker?: string;
  defaultContextTitle?: string;
}

interface TranscriptLine {
  id: string;
  timestamp: string;
  speaker: string;
  text: string;
  isInterim?: boolean;
  isBookmarked?: boolean;
}

const PRESET_SPEAKERS = [
  { id: 'interviewer', name: 'Efterforsker / Afhører', role: 'Lead Investigator' },
  { id: 'luca', name: 'Luca (Barn / Vidne)', role: 'Witness / Subject' },
  { id: 'dav', name: 'Dav (Far / Part)', role: 'Father / Party' },
  { id: 'marsha', name: 'Marsha (Sagsbehandler)', role: 'Municipal Caseworker' },
  { id: 'amalie_rikke', name: 'Amalie & Rikke (FABU)', role: 'Child Welfare Experts' },
  { id: 'louise', name: 'Louise (Mor / Part)', role: 'Mother / Party' },
  { id: 'dennis', name: 'Dennis (Stedfar / Modpart)', role: 'Stepfather / Party' }
];

export function RealTimeTranscriberModal({
  isOpen,
  onClose,
  onTranscriptSaved,
  defaultSpeaker = 'Efterforsker / Afhører',
  defaultContextTitle = ''
}: RealTimeTranscriberModalProps) {
  const { language, t } = useLanguage();
  const { parties, addRecordedInterview } = useCaseData();

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechLanguage, setSpeechLanguage] = useState<'da-DK' | 'en-US'>('da-DK');

  // Metadata
  const [interviewTitle, setInterviewTitle] = useState(
    defaultContextTitle || (language === 'da' ? 'Afdækkende interview / Afhøring' : 'Investigative Interview')
  );
  const [activeSpeaker, setActiveSpeaker] = useState<string>(defaultSpeaker);
  const [customSpeakerInput, setCustomSpeakerInput] = useState('');
  const [significance, setSignificance] = useState<'routine' | 'noteworthy' | 'critical'>('noteworthy');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');

  // Transcripts & Audio State
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [interimText, setInterimText] = useState<string>('');
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio Playback Preview State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Canvas visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // MediaRecorder & SpeechRecognition refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedAudioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollBottomRef = useRef<HTMLDivElement | null>(null);

  // Helper format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Initialize Speech Recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage(
        language === 'da'
          ? 'Web Speech API understøttes ikke i denne browser. Brug Google Chrome eller Edge for real-tids stemmegenkendelse.'
          : 'Web Speech API is not supported in this browser. Please use Chrome or Edge.'
      );
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLanguage;

    recognition.onresult = (event: any) => {
      let finalSpeech = '';
      let interimSpeech = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalSpeech += transcriptPart;
        } else {
          interimSpeech += transcriptPart;
        }
      }

      if (interimSpeech) {
        setInterimText(interimSpeech);
      }

      if (finalSpeech.trim()) {
        const timeStamp = formatTime(recordingSeconds);
        const newLine: TranscriptLine = {
          id: `line-${Date.now()}`,
          timestamp: timeStamp,
          speaker: activeSpeaker,
          text: finalSpeech.trim(),
          isInterim: false
        };

        setLines(prev => [...prev, newLine]);
        setInterimText('');
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage(
          language === 'da'
            ? 'Mikrofonadgang blev afvist. Tillad mikrofonadgang i browseren.'
            : 'Microphone permission denied. Please allow microphone access.'
        );
      }
    };

    recognition.onend = () => {
      // Auto-restart if we are still actively recording and not paused
      if (isRecording && !isPaused && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore if already running
        }
      }
    };

    return recognition;
  }, [speechLanguage, activeSpeaker, recordingSeconds, isRecording, isPaused, language]);

  // Start Audio Visualizer Canvas Loop
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.2;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * (canvas.height - 4);

          // Gradient color: Indigo to Emerald
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#4f46e5');
          gradient.addColorStop(0.6, '#6366f1');
          gradient.addColorStop(1, '#10b981');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 3);
          ctx.fill();

          x += barWidth + 1;
        }

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.warn('Audio visualizer init error:', err);
    }
  };

  // Start Live Recording
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setIsSavedSuccess(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Start Visualizer
      startVisualizer(stream);

      // Start MediaRecorder for actual audio capture
      recordedAudioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedAudioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedAudioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
      };

      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;

      // Start Speech Recognition
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognition start caught:', e);
        }
      }

      setIsRecording(true);
      setIsPaused(false);

      // Timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setErrorMessage(
        language === 'da'
          ? 'Kunne ikke tilgå mikrofonen. Tjek browserens tilladelser.'
          : 'Could not access microphone. Please check browser permissions.'
      );
    }
  };

  // Pause / Resume Recording
  const handleTogglePause = () => {
    if (isPaused) {
      // Resume
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // ignore
        }
      }
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      setIsPaused(false);
    } else {
      // Pause
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIsPaused(true);
    }
  };

  // Stop Recording
  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Auto scroll transcript to bottom
  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, interimText]);

  // Insert a landmark bookmark
  const handleAddBookmark = () => {
    if (lines.length === 0) return;
    setLines(prev => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last) {
        last.isBookmarked = !last.isBookmarked;
      }
      return copy;
    });
  };

  // Save to Case Archive (Creates DocumentFinding & TranscriptSnippet in 'Audio Transcripts')
  const handleSaveToArchive = () => {
    if (lines.length === 0 && !interimText) {
      setErrorMessage(
        language === 'da'
          ? 'Der er intet transskriberet indhold at gemme endnu. Tal i mikrofonen først.'
          : 'No transcribed content to save yet. Please speak into the microphone.'
      );
      return;
    }

    // Build full formatted transcript text
    const fullTranscript = lines
      .map(l => `[${l.timestamp}] ${l.speaker}: "${l.text}"${l.isBookmarked ? ' ★ [NØGLEUDSAGN / BOGMÆRKE]' : ''}`)
      .join('\n\n');

    const keyQuotes = lines
      .filter(l => l.isBookmarked || l.text.length > 50)
      .slice(0, 4)
      .map(l => `"${l.text}" — ${l.speaker} (${l.timestamp})`);

    const todayDate = new Date().toISOString().split('T')[0];
    const durationStr = formatTime(recordingSeconds);

    const savedResult = addRecordedInterview({
      speaker: activeSpeaker,
      interviewer: 'Efterforsker / Afhører',
      contextTitle: interviewTitle.trim() || `Interview med ${activeSpeaker}`,
      date: todayDate,
      durationFormatted: durationStr,
      transcriptText: fullTranscript,
      audioBlobUrl: audioBlobUrl || undefined,
      significance,
      tags: ['Live Transskription', 'Interview', activeSpeaker.split(' ')[0]],
      keyQuotes: keyQuotes.length > 0 ? keyQuotes : undefined,
      partyId: selectedPartyId || undefined
    });

    setIsSavedSuccess(true);

    if (onTranscriptSaved) {
      onTranscriptSaved(savedResult.document, savedResult.transcript);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isRecording ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  {t('Real-Time Interview Optager & Transskription', 'Real-Time Case Interview Recorder')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  Web Speech API + Audio Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t(
                  'Optag nye afhøringer og interviews direkte i dashboardet – arkiveres automatisk i kategorien "Audio Transcripts".',
                  'Record new case interviews directly in the dashboard – automatically categorized into "Audio Transcripts".'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isRecording) handleStopRecording();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border-b border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {isSavedSuccess && (
          <div className="p-3 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {t(
                  'Interviewet er gemt og tilføjet til sagsarkivet under "Audio Transcripts" samt indsat i tidslinjen!',
                  'Interview saved and ingested into "Audio Transcripts" folder and timeline!'
                )}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
            >
              {t('Luk & Se i Arkiv', 'Close & View')}
            </button>
          </div>
        )}

        {/* Top Controls: Title, Speaker & Language */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Interview Title */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              {t('Interview Titel & Kontekst', 'Interview Title & Context')}
            </label>
            <input
              type="text"
              value={interviewTitle}
              onChange={(e) => setInterviewTitle(e.target.value)}
              placeholder={t('f.eks. Afhøring af vidne / FABU møde', 'e.g. Witness Interview')}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Active Speaker Selection */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              {t('Aktiv Taler (Skift undervejs)', 'Active Speaker (Switch on the fly)')}
            </label>
            <div className="flex gap-1.5">
              <select
                value={activeSpeaker}
                onChange={(e) => setActiveSpeaker(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {PRESET_SPEAKERS.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Language & Significance */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-slate-400 font-semibold mb-1">
                {t('Sprog', 'Language')}
              </label>
              <select
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value as any)}
                disabled={isRecording}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
              >
                <option value="da-DK">Dansk (Danish)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {t('Vigtighed', 'Significance')}
              </label>
              <select
                value={significance}
                onChange={(e) => setSignificance(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="routine">{t('Rutine', 'Routine')}</option>
                <option value="noteworthy">{t('Væsentlig', 'Noteworthy')}</option>
                <option value="critical">{t('Kritisk', 'Critical')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Visualizer & Recording Bar */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Waveform Canvas */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <canvas
              ref={canvasRef}
              width={220}
              height={44}
              className="bg-slate-900 rounded-lg border border-slate-800"
            />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                {isRecording ? (isPaused ? t('PAUSET', 'PAUSED') : t('OPTAGER LIVE', 'LIVE RECORDING')) : t('KLAR', 'READY')}
              </span>
              <span className="font-mono text-xl font-bold text-slate-100">
                {formatTime(recordingSeconds)}
              </span>
            </div>
          </div>

          {/* Live Speaker Tag Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">{t('Hurtigskift taler:', 'Quick speaker:')}</span>
            {PRESET_SPEAKERS.slice(0, 4).map(spk => (
              <button
                key={spk.id}
                onClick={() => setActiveSpeaker(spk.name)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  activeSpeaker === spk.name
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {spk.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>{t('Start Optagelse', 'Start Recording')}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleTogglePause}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  title={isPaused ? t('Genoptag', 'Resume') : t('Pause', 'Pause')}
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  onClick={handleAddBookmark}
                  className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={t('Indsæt bogmærke / Nøgleudsagn', 'Bookmark key quote')}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{t('Bogmærke', 'Bookmark')}</span>
                </button>

                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-300 hover:text-red-200 border border-red-500/40 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-red-400" />
                  <span>{t('Stop', 'Stop')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Transcribed Stream Area */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-950 space-y-3 min-h-[260px] max-h-[360px]">
          {lines.length === 0 && !interimText ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
              <Mic className="w-10 h-10 text-slate-700 animate-bounce" />
              <p className="text-sm font-semibold text-slate-400">
                {t('Klar til optagelse og transskribering', 'Ready for live recording and transcription')}
              </p>
              <p className="text-xs max-w-md">
                {t(
                  'Tryk "Start Optagelse" og tal i mikrofonen. Alt hvad der bliver sagt transskriberes ordret med tidsstempler og taleridentifikation i realtid.',
                  'Press "Start Recording" and speak. Live transcripts with speaker tags and timecodes will appear here.'
                )}
              </p>
            </div>
          ) : (
            <>
              {lines.map((line) => (
                <div
                  key={line.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    line.isBookmarked
                      ? 'bg-amber-950/30 border-amber-500/40 shadow-sm'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        {line.timestamp}
                      </span>
                      <span className="font-bold text-slate-200">{line.speaker}</span>
                    </div>

                    {line.isBookmarked && (
                      <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        ★ {t('Nøgleudsagn', 'Key Quote')}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed pl-1">{line.text}</p>
                </div>
              ))}

              {/* Interim Real-time speech preview */}
              {interimText && (
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs italic text-indigo-300 flex items-start gap-2 animate-pulse">
                  <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    {formatTime(recordingSeconds)}
                  </span>
                  <div>
                    <span className="font-semibold text-indigo-200 mr-1">{activeSpeaker}:</span>
                    <span>"{interimText}..."</span>
                  </div>
                </div>
              )}

              <div ref={scrollBottomRef} />
            </>
          )}
        </div>

        {/* Footer: Audio Playback & Save to Archive */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Audio Playback Preview if Blob exists */}
          {audioBlobUrl ? (
            <div className="flex items-center gap-3">
              <audio ref={audioPreviewRef} src={audioBlobUrl} controls className="h-8 w-60 rounded" />
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {t('Lydspor optaget', 'Audio recorded')} ({formatTime(recordingSeconds)})
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{lines.length} {t('linjer transskriberet', 'lines transcribed')}</span>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {lines.length > 0 && (
              <button
                onClick={() => {
                  setLines([]);
                  setInterimText('');
                  setRecordingSeconds(0);
                  setAudioBlobUrl(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                title={t('Ryd transskript', 'Clear transcript')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              {t('Annuller', 'Cancel')}
            </button>

            <button
              onClick={handleSaveToArchive}
              disabled={lines.length === 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{t('Gem i Sagsarkiv (Audio Transcripts)', 'Save to Case Archive')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
