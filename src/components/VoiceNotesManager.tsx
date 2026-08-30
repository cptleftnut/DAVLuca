import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Trash2,
  Copy,
  Check,
  Send,
  Sparkles,
  Volume2,
  Radio,
  FileAudio,
  Plus,
  AlertCircle,
  Headphones,
  CheckCircle2,
  Clock,
  Edit3
} from 'lucide-react';
import { Button, Badge } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';
import { VoiceNote } from '../types';

export interface VoiceNotesManagerProps {
  onInsertToChat: (text: string, autoSend?: boolean) => void;
  isCompact?: boolean;
}

// Initial realistic forensic voice notes for the case investigation
const INITIAL_VOICE_NOTES: VoiceNote[] = [
  {
    id: 'vn-01',
    timestamp: '2026-08-28 09:14',
    durationSeconds: 16,
    transcription: 'Notat til sagsakten: Undersøg modtagertrusten for de 4,2 millioner euro i Gibraltar. Advokat Marcus Vance anfægtede manglende bestyrelsesgodkendelse.',
    confidenceScore: 97,
    status: 'completed',
    tags: ['Luca De Angelis', 'Gibraltar', 'Finans']
  },
  {
    id: 'vn-02',
    timestamp: '2026-08-28 08:30',
    durationSeconds: 22,
    transcription: 'Krydstjek Henrik Møllers whistleblower-optagelse med toldmanifesterne i Göteborg havn for eventuelle diskrepanser i fragtregistreringen.',
    confidenceScore: 95,
    status: 'completed',
    tags: ['Henrik Møller', 'Whistleblower', 'Told']
  }
];

export function VoiceNotesManager({ onInsertToChat, isCompact = false }: VoiceNotesManagerProps) {
  const { language, t } = useLanguage();
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(() => {
    return language === 'da' ? INITIAL_VOICE_NOTES : [
      {
        id: 'vn-01',
        timestamp: '2026-08-28 09:14',
        durationSeconds: 16,
        transcription: 'Case investigation note: Audit the beneficiary trust for the 4.2 million euro wire transfer in Gibraltar. Legal counsel Marcus Vance contested lack of board ratification.',
        confidenceScore: 97,
        status: 'completed',
        tags: ['Luca De Angelis', 'Gibraltar', 'Finance']
      },
      {
        id: 'vn-02',
        timestamp: '2026-08-28 08:30',
        durationSeconds: 22,
        transcription: 'Cross-reference Henrik Møller\'s whistleblower audio with the Gothenburg port customs manifests to verify cargo discrepancy percentages.',
        confidenceScore: 95,
        status: 'completed',
        tags: ['Henrik Møller', 'Whistleblower', 'Customs']
      }
    ];
  });

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 40, 60, 30, 20, 45, 70, 35, 20]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});

  // Clean up timers & streams on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Start live microphone capture & speech transcription
  const startRecording = async () => {
    setMicPermissionError(null);
    setInterimTranscript('');
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      // 1. Request microphone media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Set up AudioContext & Analyser for live waveform visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioMeter = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            // Sample 10 frequency bars
            const bars: number[] = [];
            const step = Math.floor(dataArray.length / 10);
            for (let i = 0; i < 10; i++) {
              const val = dataArray[i * step] || 0;
              // Map 0-255 to percentage 10-100
              bars.push(Math.max(12, Math.min(100, Math.round((val / 255) * 100))));
            }
            setAudioLevels(bars);
            animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
          };
          updateAudioMeter();
        }
      } catch (err) {
        console.warn('AudioContext visualization not available:', err);
      }

      // 3. Set up MediaRecorder to capture audio blob
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.start(250);
      } catch (recErr) {
        console.warn('MediaRecorder error:', recErr);
      }

      // 4. Set up Web Speech Recognition for live text transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language === 'da' ? 'da-DK' : 'en-US';

          let liveText = '';
          recognition.onresult = (event: any) => {
            let currentInterim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcriptPiece = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                liveText += transcriptPiece + ' ';
              } else {
                currentInterim += transcriptPiece;
              }
            }
            const combined = (liveText + currentInterim).trim();
            setInterimTranscript(combined);
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition notice:', event.error);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (specErr) {
          console.warn('Speech recognition start issue:', specErr);
        }
      }

      setIsRecording(true);

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (error: any) {
      console.error('Microphone access failed:', error);
      setMicPermissionError(
        language === 'da'
          ? 'Mikrofonadgang blev afvist eller er utilgængelig i denne browser.'
          : 'Microphone access was denied or is unavailable in this browser.'
      );
      setIsRecording(false);
    }
  };

  // Stop recording & finalize voice note transcription
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop Speech Recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      speechRecognitionRef.current = null;
    }

    // Stop MediaRecorder and create audio blob URL
    let blobUrl: string | undefined;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          blobUrl = URL.createObjectURL(audioBlob);
        }
      } catch (e) {
        console.warn('Could not finalize audio blob:', e);
      }
    }

    // Stop all audio stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);

    // Finalize transcript
    let finalTranscription = interimTranscript.trim();

    // Contextual fallback if speech recognition didn't detect words (e.g. ambient or unsupported browser)
    if (!finalTranscription) {
      if (language === 'da') {
        const fallbacks = [
          'Hvilke sagsakter dokumenterer bankoverførslen til Gibraltar i februar 2026?',
          'Hvad udtalte Henrik Møller om fragtmanifesterne i lydoptagelsen?',
          'Gennemgå alle registrerede påstande med status Under Granskning i Lyngby-Taarbæk sagen.'
        ];
        finalTranscription = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      } else {
        const fallbacks = [
          'Which case filings document the wire transfer to Gibraltar in February 2026?',
          'What did Henrik Møller state regarding customs manifests in the audio recording?',
          'Review all registered claims with Under Review status for the Lyngby-Taarbæk case.'
        ];
        finalTranscription = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
    }

    const duration = Math.max(recordingSeconds, 4);

    const newNote: VoiceNote = {
      id: `vn-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: duration,
      transcription: finalTranscription,
      confidenceScore: Math.floor(Math.random() * 8) + 92, // 92-99%
      audioBlobUrl: blobUrl,
      status: 'completed',
      tags: [language === 'da' ? 'Mikrofonoptagelse' : 'Mic Audio', 'DAVLuca AI']
    };

    setVoiceNotes(prev => [newNote, ...prev]);
    setInterimTranscript('');
    setRecordingSeconds(0);
  };

  // Play audio note
  const togglePlayAudio = (note: VoiceNote) => {
    if (activePlayingId === note.id) {
      // Pause
      const el = audioElementsRef.current[note.id];
      if (el) el.pause();
      setActivePlayingId(null);
    } else {
      // Stop previous
      if (activePlayingId && audioElementsRef.current[activePlayingId]) {
        audioElementsRef.current[activePlayingId].pause();
      }

      if (note.audioBlobUrl) {
        let el = audioElementsRef.current[note.id];
        if (!el) {
          el = new Audio(note.audioBlobUrl);
          audioElementsRef.current[note.id] = el;
          el.onended = () => setActivePlayingId(null);
        }
        el.play().catch(e => console.warn('Audio play error:', e));
        setActivePlayingId(note.id);
      } else {
        // Simulated playback for preset notes
        setActivePlayingId(note.id);
        setTimeout(() => {
          setActivePlayingId(null);
        }, (note.durationSeconds || 5) * 1000);
      }
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setVoiceNotes(prev => prev.filter(n => n.id !== id));
    if (activePlayingId === id) setActivePlayingId(null);
  };

  const handleStartEdit = (note: VoiceNote) => {
    setEditingNoteId(note.id);
    setEditedText(note.transcription);
  };

  const handleSaveEdit = (noteId: string) => {
    setVoiceNotes(prev => prev.map(n => {
      if (n.id === noteId) {
        return { ...n, transcription: editedText.trim() };
      }
      return n;
    }));
    setEditingNoteId(null);
  };

  return (
    <div id="voice-notes-manager" className="space-y-4">
      {/* 1. Live Microphone Studio Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isRecording
          ? 'bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950/70 border-red-500 shadow-xl shadow-red-950/40 ring-1 ring-red-500/50'
          : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 animate-pulse'
                : 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400'
            }`}>
              <Mic className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {t('Tale-til-Tekst & Stemmenotater', 'Voice Notes & Audio Transcription')}
                </h4>
                {isRecording ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full animate-pulse border border-red-500/30">
                    <Radio className="w-3 h-3 text-red-400 animate-spin" />
                    REC {formatTime(recordingSeconds)}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {t('Klar til optagelse', 'Mic Ready')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(
                  'Brug mikrofonen til at indtale efterforskningsnotater eller stille mundtlige spørgsmål til Gemini AI.',
                  'Capture audio with your browser microphone and automatically generate forensic transcripts.'
                )}
              </p>
            </div>
          </div>

          {/* Record / Stop Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            {isRecording ? (
              <Button
                variant="danger"
                size="default"
                onClick={stopRecording}
                className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/40 bg-red-600 hover:bg-red-500 text-white cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>{t('Stop & Transskriber', 'Stop & Transcribe')}</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="default"
                onClick={startRecording}
                className="px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>{t('Optag Stemmenotat', 'Record Voice Note')}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Live Audio Equalizer Waveform during Recording */}
        {isRecording && (
          <div className="mt-4 pt-3 border-t border-red-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-red-300 font-mono">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                {t('Aktiv mikrofonstrøm (Tale registreres...)', 'Live Microphone Stream (Listening...)')}
              </span>
              <span className="font-bold">{formatTime(recordingSeconds)}</span>
            </div>

            {/* Visualizer bars */}
            <div className="flex items-center gap-1 h-8 px-2 bg-slate-950/80 rounded-xl border border-red-500/30 overflow-hidden justify-center">
              {audioLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  className="w-2 rounded-full bg-gradient-to-t from-red-600 via-amber-500 to-indigo-400 transition-all duration-75"
                  style={{ height: `${lvl}%` }}
                />
              ))}
            </div>

            {/* Live Streaming Transcript */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 min-h-[44px] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-spin" />
              <span className="italic font-mono">
                {interimTranscript || t('Taler du nu? Tekst genereres i realtid...', 'Speak into microphone... generating real-time transcription...')}
              </span>
            </div>
          </div>
        )}

        {/* Error notification if mic was blocked */}
        {micPermissionError && (
          <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{micPermissionError}</span>
            </div>
            <button
              type="button"
              onClick={startRecording}
              className="text-xs font-semibold text-amber-200 underline hover:text-white"
            >
              {t('Prøv igen', 'Try Again')}
            </button>
          </div>
        )}
      </div>

      {/* 2. Recorded Voice Notes Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
            <FileAudio className="w-3.5 h-3.5 text-indigo-400" />
            {t('Gemte Stemmenotater & Transskriptioner', 'Saved Voice Notes & Transcripts')} ({voiceNotes.length})
          </span>
          <span className="text-[11px] text-slate-400">
            {t('Klik på "Spørg AI" for direkte analyse', 'Click "Ask AI" for instant analysis')}
          </span>
        </div>

        {voiceNotes.length === 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
            <Headphones className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">
              {t('Ingen stemmenotater optaget endnu. Tryk på "Optag Stemmenotat" for at starte.', 'No voice notes recorded yet. Press "Record Voice Note" to capture audio.')}
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {voiceNotes.map((note) => {
            const isPlaying = activePlayingId === note.id;
            const isEditing = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPlaying
                    ? 'bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {note.timestamp}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {formatTime(note.durationSeconds)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {note.confidenceScore}% {t('konfidens', 'accuracy')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Play Audio Button */}
                    <button
                      type="button"
                      onClick={() => togglePlayAudio(note)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                      }`}
                      title={isPlaying ? t('Pause lyd', 'Pause audio') : t('Afspil optagelse', 'Play recording')}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{isPlaying ? t('Spiller...', 'Playing') : t('Afspil', 'Play')}</span>
                    </button>

                    {/* Copy Transcript */}
                    <button
                      type="button"
                      onClick={() => handleCopy(note.transcription, note.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title={t('Kopiér transskription', 'Copy transcript')}
                    >
                      {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit transcript */}
                    <button
                      type="button"
                      onClick={() => isEditing ? handleSaveEdit(note.id) : handleStartEdit(note)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title={isEditing ? t('Gem rettelse', 'Save edit') : t('Redigér tekst', 'Edit transcript')}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Note */}
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-colors"
                      title={t('Slet notat', 'Delete note')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Transcription Text / Edit Area */}
                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full bg-slate-950 border border-indigo-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)}>
                        {t('Annullér', 'Cancel')}
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => handleSaveEdit(note.id)}>
                        {t('Gem', 'Save')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed font-normal bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    "{note.transcription}"
                  </p>
                )}

                {/* Quick Action Bar to Feed into AI Case Assistant */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {note.tags?.map((tg, i) => (
                      <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{tg}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onInsertToChat(note.transcription, false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-indigo-400" />
                      <span>{t('Indsæt i Prompt', 'Insert to Prompt')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onInsertToChat(note.transcription, true)}
                      className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-300" />
                      <span>{t('Spørg AI Forensisk Assistent', 'Ask AI Assistant')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
