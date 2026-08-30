import React, { useState, useRef, useEffect } from 'react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bot,
  FileText,
  Save,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Volume2,
  VolumeX,
  Radio,
  Download,
  Copy,
  Check,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentFinding, TranscriptSnippet } from '../types';

interface AudioTranscriptionPanelProps {
  onSavedToCase?: (doc: DocumentFinding, transcript: TranscriptSnippet) => void;
  onAskAIWithTranscript?: (text: string) => void;
  className?: string;
}

export function AudioTranscriptionPanel({
  onSavedToCase,
  onAskAIWithTranscript,
  className = ''
}: AudioTranscriptionPanelProps) {
  const { addRecordedInterview, parties } = useCaseData();
  const { language, t } = useLanguage();

  // MediaRecorder states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Transcription states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<{
    transcription: string;
    caseNoteSummary: string;
    suggestedTags: string[];
    significance: 'routine' | 'noteworthy' | 'critical';
    confidenceScore: number;
    model?: string;
  } | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  // Metadata form
  const [speakerName, setSpeakerName] = useState('Dennis / Bisidder');
  const [contextTitle, setContextTitle] = useState('Lydoptagelse af forvaltningsmøde & vidneudsagn');
  const [interviewer, setInterviewer] = useState('Efterforsker (The Brew Method)');
  const [significance, setSignificance] = useState<'routine' | 'noteworthy' | 'critical'>('noteworthy');
  const [customTagInput, setCustomTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Lydoptagelse', 'Lyngby-Taarbæk', 'Verbatim']);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audio level visualizer simulation
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(16).fill(10));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start Audio Recording using MediaRecorder API
  const startRecording = async () => {
    setMicPermissionError(null);
    setTranscriptionError(null);
    setTranscriptionResult(null);
    setSaveSuccess(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup Web Audio Analyser for live visualizer
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const updateLevels = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const normalized = Array.from(dataArray.slice(0, 16)).map((v) => Math.max(8, (v / 255) * 44));
          setAudioLevel(normalized);
          animFrameRef.current = requestAnimationFrame(updateLevels);
        };
        updateLevels();
      } catch (e) {
        console.warn('AudioContext visualization not available:', e);
      }

      // Check supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(finalBlob);
        const newUrl = URL.createObjectURL(finalBlob);
        setAudioUrl(newUrl);

        try {
          const b64 = await blobToBase64(finalBlob);
          setAudioBase64(b64);
        } catch (err) {
          console.error('Error converting audio to base64:', err);
        }

        // Stop all tracks in stream
        stream.getTracks().forEach((track) => track.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(new Array(16).fill(8));
      };

      mediaRecorder.start(250); // Slice in 250ms chunks
      setIsRecording(true);
      setIsPaused(false);
      setRecordingDuration(0);

      // Start duration timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied or error:', err);
      setMicPermissionError(
        err.message || 'Mikrofonadgang blev afvist eller er ikke tilgængelig i browseren.'
      );
    }
  };

  // Pause / Resume
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Reset / Discard
  const resetRecording = () => {
    stopRecording();
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingDuration(0);
    setTranscriptionResult(null);
    setTranscriptionError(null);
    setSaveSuccess(false);
  };

  // Request AI Transcription using Gemini API
  const handleTranscribeAudio = async () => {
    if (!audioBase64) {
      setTranscriptionError(t('Ingen lydoptagelse tilgængelig til transskribering.', 'No audio recording available for transcription.'));
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError(null);

    try {
      const response = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioBlob?.type || 'audio/webm',
          language,
          caseContext: {
            speaker: speakerName,
            title: contextTitle,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Serverfejl ${response.status}`);
      }

      const data = await response.json();
      setTranscriptionResult({
        transcription: data.transcription,
        caseNoteSummary: data.caseNoteSummary,
        suggestedTags: data.suggestedTags || ['Lydoptagelse', 'Gemini'],
        significance: data.significance || 'noteworthy',
        confidenceScore: data.confidenceScore || 96,
        model: data.model,
      });

      // Update suggested tags
      if (Array.isArray(data.suggestedTags)) {
        setTags((prev) => Array.from(new Set([...prev, ...data.suggestedTags])));
      }
    } catch (err: any) {
      console.error('Transcription failed:', err);
      setTranscriptionError(
        err.message || t('Kunne ikke gennemføre AI transskribering.', 'Could not complete AI transcription.')
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  // Save the result directly into CaseDataContext
  const handleSaveToCase = () => {
    if (!transcriptionResult) return;

    const formattedDuration = formatTime(recordingDuration);
    const { document, transcript } = addRecordedInterview({
      speaker: speakerName,
      interviewer,
      contextTitle,
      date: new Date().toISOString().split('T')[0],
      durationFormatted: formattedDuration,
      transcriptText: transcriptionResult.transcription,
      audioBlobUrl: audioUrl || undefined,
      significance: transcriptionResult.significance || significance,
      tags,
      keyQuotes: [transcriptionResult.caseNoteSummary],
    });

    setSaveSuccess(true);
    if (onSavedToCase) {
      onSavedToCase(document, transcript);
    }
  };

  const handleCopyTranscription = () => {
    if (!transcriptionResult) return;
    navigator.clipboard.writeText(
      `--- TRANSSKRIPTION: ${contextTitle} (${speakerName}) ---\n\n${transcriptionResult.transcription}\n\n--- FORENSISK RESUMÉ ---\n${transcriptionResult.caseNoteSummary}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (customTagInput.trim() && !tags.includes(customTagInput.trim())) {
      setTags([...tags, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-5 md:p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                {t('Trin 5: OSINT & Verbatim Lydbevis', 'Step 5: Verbatim Audio Forensics')}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                MediaRecorder API + Gemini Multimodal
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Mic className="w-6 h-6 text-red-400 shrink-0" />
              <span>{t('AudioTranscriptionPanel (Gemini Lydoptager & Transskribering)', 'Audio Transcription Panel')}</span>
            </h2>

            <p className="text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              {t(
                'Optag vidneudsagn, interviewnotater eller afhøringsoptagelser direkte i browseren. Gemini AI genererer automatisk ordret transskription, forensisk resumé og evidensnøgletags.',
                'Record witness statements, interviews, or case notes directly in your browser. Gemini AI processes the audio and generates accurate verbatim transcriptions, forensic summaries, and case tags.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Gemini 3.7 Flash Audio Engine</span>
            </span>
          </div>
        </div>
      </div>

      {/* Permission Error Banner */}
      {micPermissionError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{t('Mikrofontilladelse Påkrævet', 'Microphone Permission Required')}</p>
            <p>{micPermissionError}</p>
            <p className="text-[11px] text-red-400/80">
              {t('Tillad mikrofonadgang i din browser (eller klik på hængelåsen i adresselinjen).', 'Please grant microphone permissions in your browser bar.')}
            </p>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recording Controls & Waveform */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                {t('Optagestudie & Kontrol', 'Recording Studio')}
              </h3>

              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400 animate-pulse bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  {isPaused ? t('PAUSE', 'PAUSED') : t('OPTAGER', 'RECORDING')}
                </span>
              )}
            </div>

            {/* Live Audio Visualizer / Timer */}
            <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800/80 text-center space-y-4 shadow-inner">
              <div className="font-mono text-4xl font-black text-white tracking-widest">
                {formatTime(recordingDuration)}
              </div>

              {/* Animated Waveform Bars */}
              <div className="h-16 flex items-center justify-center gap-1.5 px-4">
                {audioLevel.map((lvl, idx) => (
                  <motion.div
                    key={idx}
                    className={`w-2 rounded-full transition-all duration-75 ${
                      isRecording && !isPaused
                        ? 'bg-gradient-to-t from-red-600 to-amber-400'
                        : audioUrl
                        ? 'bg-emerald-500/60'
                        : 'bg-zinc-800'
                    }`}
                    style={{ height: `${lvl}px` }}
                  />
                ))}
              </div>

              <div className="text-[11px] text-zinc-400 font-mono">
                {isRecording
                  ? isPaused
                    ? t('Optagelse sat på pause', 'Recording is paused')
                    : t('Taler ind i mikrofonen... (MediaRecorder aktiv)', 'Listening to microphone stream...')
                  : audioBlob
                  ? `${t('Optagelse klar:', 'Recording ready:')} ${(audioBlob.size / 1024).toFixed(1)} KB`
                  : t('Tryk på knappen for at starte optagelse', 'Click button to start recording')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{audioBlob ? t('Start Ny Optagelse', 'Record New Clip') : t('Start Optagelse', 'Start Recording')}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={togglePause}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                    <span>{isPaused ? t('Genoptag', 'Resume') : t('Pause', 'Pause')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>{t('Stop & Behandl', 'Stop & Finalize')}</span>
                  </button>
                </>
              )}

              {audioBlob && !isRecording && (
                <button
                  type="button"
                  onClick={resetRecording}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                  title={t('Nulstil optagelse', 'Reset recording')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('Nulstil', 'Reset')}</span>
                </button>
              )}
            </div>

            {/* Audio Playback Player */}
            {audioUrl && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    {t('Afspil Optaget Lyd', 'Recorded Audio Playback')}
                  </span>
                  <a
                    href={audioUrl}
                    download={`case_recording_${Date.now()}.webm`}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>{t('Download .webm', 'Download')}</span>
                  </a>
                </div>

                <audio controls src={audioUrl} className="w-full h-10 accent-emerald-500" />
              </div>
            )}

            {/* AI Transcribe Trigger Button */}
            {audioBase64 && !isRecording && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTranscribeAudio}
                  disabled={isTranscribing}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {isTranscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('Gemini Transskriberer Lyd...', 'Gemini Transcribing Audio...')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-zinc-950" />
                      <span>{t('Transskriber med Gemini AI', 'Generate Gemini Transcription')}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Transcription Output */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Metadata Fields */}
            <div className="space-y-4 border-b border-zinc-800 pb-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                {t('Sagsmetadata & Vidnekontekst', 'Case Metadata & Speaker Context')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Speaker */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    {t('Taler / Vidne (Speaker):', 'Speaker / Entity:')}
                  </label>
                  <input
                    type="text"
                    value={speakerName}
                    onChange={(e) => setSpeakerName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    placeholder="f.eks. Dennis / Bisidder / Sagsbehandler"
                  />
                </div>

                {/* Significance */}
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    {t('Evidensgrad (Significance):', 'Significance:')}
                  </label>
                  <select
                    value={significance}
                    onChange={(e) => setSignificance(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="critical">🔴 {t('Kritisk (Critical)', 'Critical')}</option>
                    <option value="noteworthy">🟡 {t('Vigtigt / Noteworthy', 'Noteworthy')}</option>
                    <option value="routine">🟢 {t('Rutine (Routine)', 'Routine')}</option>
                  </select>
                </div>

                {/* Context Title */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    {t('Titel / Emne for Lydoptagelsen:', 'Context Title / Topic:')}
                  </label>
                  <input
                    type="text"
                    value={contextTitle}
                    onChange={(e) => setContextTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none"
                    placeholder="f.eks. Mødeoptagelse vedr. forældrekompetenceundersøgelse"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-zinc-400 block">
                  {t('Sagsnøgletags (Cross-Reference):', 'Case Tags:')}
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((tg, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-mono bg-zinc-800 text-indigo-300 border border-indigo-500/20 flex items-center gap-1"
                    >
                      #{tg}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                        className="text-zinc-500 hover:text-zinc-300 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag(e)}
                      placeholder={t('+ nyt tag', '+ add tag')}
                      className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-0.5 text-xs text-zinc-200 outline-none w-24"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {transcriptionError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{transcriptionError}</span>
              </div>
            )}

            {/* Results Display */}
            {transcriptionResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {t('Gemini Verbatim Transskription Udført', 'Gemini Verbatim Transcription Ready')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyTranscription}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? t('Kopieret', 'Copied') : t('Kopier', 'Copy')}</span>
                    </button>

                    {onAskAIWithTranscript && (
                      <button
                        type="button"
                        onClick={() => onAskAIWithTranscript(transcriptionResult.transcription)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>{t('Spørg AI', 'Ask AI')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Verbatim Transcript Box */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                    {t('Ordret Transskriberet Tekst (Verbatim Audio):', 'Verbatim Transcription Text:')}
                  </label>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
                    {transcriptionResult.transcription}
                  </div>
                </div>

                {/* Structured Summary Box */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                    {t('Forensisk Sagsnotat (The Brew Method Resumé):', 'Forensic Case Summary:')}
                  </label>
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-indigo-500/30 text-xs text-zinc-300 leading-relaxed font-sans max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {transcriptionResult.caseNoteSummary}
                  </div>
                </div>

                {/* Save to Case Dossier Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveToCase}
                    disabled={saveSuccess}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      saveSuccess
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{t('Arkiveret i Sagsakter & Tidslinje!', 'Saved to Case Dossier & Timeline!')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>{t('Arkiver som Officielt Sagsbilag & Transskribering', 'Archive in Case Dossier & Transcripts')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <Mic className="w-10 h-10 mx-auto text-zinc-700" />
                <p className="text-xs">
                  {t('Optag en lydsekvens til venstre og klik på "Transskriber med Gemini AI".', 'Record an audio clip on the left and click "Generate Gemini Transcription".')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
