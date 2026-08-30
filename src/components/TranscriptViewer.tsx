import React, { useState, useMemo } from 'react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, Badge } from './ui/UIPrimitives';
import { Search, Mic, Play, Clock, AlertTriangle, Bookmark, FileAudio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function TranscriptViewer() {
  const { transcripts, parties } = useCaseData();
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);

  const filteredTranscripts = useMemo(() => {
    if (!searchTerm) return transcripts;
    const lower = searchTerm.toLowerCase();
    return transcripts.filter(tr => 
      tr.text.toLowerCase().includes(lower) || 
      tr.speaker.toLowerCase().includes(lower) ||
      (tr.tags && tr.tags.some(tag => tag.toLowerCase().includes(lower)))
    );
  }, [transcripts, searchTerm]);

  // Function to get party role if known
  const getSpeakerRole = (partyId?: string) => {
    if (!partyId) return null;
    const party = parties.find(p => p.id === partyId);
    return party ? party.role : null;
  };

  // Highlighting function
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={i} className="bg-indigo-500/30 text-indigo-200 px-0.5 rounded">{part}</span> 
        : part
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-purple-400" />
            {t('Transskriptionsviser', 'Transcript Viewer')}
          </h2>
          <p className="text-sm text-slate-400">
            {t('Gennemse og søg i lydoptagelser og afhøringer.', 'Browse and search through audio recordings and interrogations.')}
          </p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="w-full h-10 pl-9 pr-4 rounded-md bg-slate-900 border border-slate-800 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            placeholder={t('Søg i lydudskrifter...', 'Search transcripts...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredTranscripts.map((tr, idx) => (
            <motion.div
              key={tr.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.5) }}
            >
              <Card 
                className={`overflow-hidden transition-all duration-300 ${activeSnippetId === tr.id ? 'border-purple-500/50 bg-slate-900/90 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'}`}
              >
                <div className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Time & Play Column */}
                    <div className="sm:w-32 bg-slate-950/50 p-4 border-b sm:border-b-0 sm:border-r border-slate-800/60 flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="font-mono text-sm font-semibold text-slate-300">{tr.timecode}</span>
                      </div>
                      <button 
                        onClick={() => setActiveSnippetId(activeSnippetId === tr.id ? null : tr.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${activeSnippetId === tr.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                      >
                        {activeSnippetId === tr.id ? <Mic className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      
                      {tr.bookmarked && (
                        <Bookmark className="w-4 h-4 text-emerald-400 hidden sm:block mt-auto" />
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 p-4 md:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base flex items-center gap-2">
                            {tr.speaker}
                            {tr.confidence < 0.8 && (
                              <span title={t('Lav transskriptionssikkerhed', 'Low transcription confidence')}>
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              </span>
                            )}
                          </h3>
                          {getSpeakerRole(tr.partyId) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              {getSpeakerRole(tr.partyId)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {tr.tags?.map(tag => (
                            <Badge key={tag} className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] uppercase">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className={`text-sm leading-relaxed transition-colors ${activeSnippetId === tr.id ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {highlightText(tr.text, searchTerm)}
                      </div>

                      {tr.uncertainWords && tr.uncertainWords.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-500">
                          <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t('Usikre ord:', 'Uncertain words:')}</span>
                          <span className="italic">{tr.uncertainWords.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTranscripts.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <Mic className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p>{t('Ingen lydudskrifter matchede din søgning.', 'No transcripts matched your search.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
