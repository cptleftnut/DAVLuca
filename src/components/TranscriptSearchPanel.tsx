import React, { useState } from 'react';
import { Play, Bookmark, Search, AlertCircle, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { TranscriptSnippet } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from './ui/UIPrimitives';
import { DriveOriginalAudioPlayer } from './DriveOriginalAudioPlayer';
import { useLanguage } from '../contexts/LanguageContext';

interface TranscriptSearchPanelProps {
  snippets: TranscriptSnippet[];
  onSelectSnippet?: (snip: TranscriptSnippet) => void;
}

export function TranscriptSearchPanel({ snippets: initialSnippets }: TranscriptSearchPanelProps) {
  const { language, t } = useLanguage();
  const [snippets, setSnippets] = useState<TranscriptSnippet[]>(initialSnippets);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('all');
  const [activeSnippet, setActiveSnippet] = useState<TranscriptSnippet | null>(initialSnippets[0] || null);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, bookmarked: !s.bookmarked } : s));
  };

  const speakers = ['all', 'Henrik Møller', 'Luca De Angelis', 'Marcus Vance, Esq.', 'Elena Rostova', 'Sofia Bellini'];

  const filteredSnippets = snippets.filter(s => {
    const matchesSpeaker = selectedSpeaker === 'all' || s.speaker === selectedSpeaker;
    const matchesSearch = s.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.tags && s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesSpeaker && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <DriveOriginalAudioPlayer currentSnippet={activeSnippet} />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400 mr-1" />
          {speakers.map(spk => (
            <button
              key={spk}
              onClick={() => setSelectedSpeaker(spk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedSpeaker === spk
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {spk === 'all' ? t('Alle Talere', 'All Speakers') : spk.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('Søg i lydtransskriptioner, nøgleord, talere...', 'Search audio transcripts, keywords...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Transcripts Stream */}
      <div className="space-y-3">
        {filteredSnippets.map((snippet) => {
          const isActive = activeSnippet?.id === snippet.id;
          const hasUncertainty = snippet.uncertainWords && snippet.uncertainWords.length > 0;

          return (
            <Card
              key={snippet.id}
              onClick={() => setActiveSnippet(snippet)}
              className={`transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-500 bg-indigo-950/20 shadow-md'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSnippet(snippet);
                      }}
                      className="w-8 h-8 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title={t('Afspil fra dette tidsstempel', 'Play from this timestamp')}
                    >
                      <Play className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                    <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {snippet.timecode}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {snippet.speaker}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {t('Sikkerhed:', 'Conf:')}{' '}
                      <strong className={snippet.confidence >= 0.9 ? 'text-emerald-400' : 'text-amber-400'}>
                        {Math.round(snippet.confidence * 100)}%
                      </strong>
                    </span>

                    <button
                      onClick={(e) => toggleBookmark(snippet.id, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        snippet.bookmarked ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={snippet.bookmarked ? t('Bogmærket', 'Bookmarked') : t('Tilføj bogmærke', 'Add Bookmark')}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-200 pl-11 leading-relaxed">
                  "{snippet.text}"
                </p>

                {hasUncertainty && (
                  <div className="pl-11 pt-1 flex items-center gap-1.5 text-xs text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>
                      {t('Potentiel fonem-usikkerhed markeret på:', 'Potential phoneme uncertainty flagged on:')}{' '}
                      <strong>{snippet.uncertainWords?.join(', ')}</strong>
                    </span>
                  </div>
                )}

                {snippet.tags && (
                  <div className="pl-11 pt-1 flex flex-wrap gap-1.5">
                    {snippet.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
