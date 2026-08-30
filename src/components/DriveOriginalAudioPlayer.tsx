import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Bookmark, HardDrive, Sparkles } from 'lucide-react';
import { TranscriptSnippet } from '../types';
import { Card, CardContent } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';

interface DriveOriginalAudioPlayerProps {
  currentSnippet?: TranscriptSnippet | null;
  onTimeUpdate?: (seconds: number) => void;
}

export function DriveOriginalAudioPlayer({ currentSnippet, onTimeUpdate }: DriveOriginalAudioPlayerProps) {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(360); // 6 mins default demo length
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentSnippet) {
      setCurrentTime(currentSnippet.seconds);
      setIsPlaying(true);
    }
  }, [currentSnippet]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          const next = prev + 1;
          if (onTimeUpdate) onTimeUpdate(next);
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, duration, onTimeUpdate]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-indigo-500/30 bg-slate-950/90 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-indigo-900/40 px-5 py-3 border-b border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <span>
            {t(
              'Synkroniseret Drive Lydkilde: 03_Lydoptagelse_Ledelsesmoede_02-03-2026_Tr_01.mp3 (Fra Google Drive "Lyngby-Taarbæk case")',
              'Synchronized Drive Audio Stream: DOC-2026-044E (Raw Master Wiretap - "Lyngby-Taarbæk case")'
            )}
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          44.1kHz • Lossless Stream
        </span>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Waveform Visualization mockup */}
        <div className="flex items-center gap-1 h-12 px-2 bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden">
          {Array.from({ length: 48 }).map((_, i) => {
            const progressRatio = currentTime / duration;
            const barRatio = i / 48;
            const isActive = barRatio <= progressRatio;
            const height = 20 + Math.sin(i * 0.4) * 16 + (i % 3) * 6;

            return (
              <div
                key={i}
                onClick={() => setCurrentTime(Math.floor(barRatio * duration))}
                className={`flex-1 rounded-full transition-all cursor-pointer ${
                  isActive ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-slate-700 hover:bg-slate-600'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Player Controls & Scrubber */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => setCurrentTime(0)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title={t('Genstart fra start', 'Restart from beginning')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="font-mono text-sm font-bold text-slate-200">
              {formatTime(currentTime)} <span className="text-slate-500 font-normal">/ {formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              {t('AI-baseret Fonem- & Tidsstempeljustering', 'AI Timestamp-Aligned Transcription')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
