import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Mic,
  Users,
  ShieldAlert,
  FileSearch,
  ArrowUpRight
} from 'lucide-react';
import { useCaseData } from '../contexts/CaseDataContext';
import { Card, Badge, Button } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';

interface DynamicCaseSearchProps {
  onSelectResult?: (type: string, item: any) => void;
}

/**
 * Helper to extract snippet around a match and highlight all query occurrences
 */
function HighlightedSnippet({ text, query }: { text: string; query: string }) {
  if (!text || !query.trim()) return <span>{text}</span>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return <span>{text.length > 200 ? text.slice(0, 200) + '...' : text}</span>;
  }

  // Calculate snippet window
  const snippetStart = Math.max(0, matchIndex - 60);
  const snippetEnd = Math.min(text.length, matchIndex + lowerQuery.length + 90);
  const rawSnippet = (snippetStart > 0 ? '...' : '') + text.slice(snippetStart, snippetEnd) + (snippetEnd < text.length ? '...' : '');

  // Split and highlight
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = rawSnippet.split(regex);

  return (
    <span className="leading-relaxed">
      {parts.map((part, i) =>
        part.toLowerCase() === lowerQuery ? (
          <mark
            key={i}
            className="bg-amber-400/90 text-zinc-950 font-bold px-1 py-0.5 rounded shadow-sm inline-block mx-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

/**
 * Counts total keyword occurrences in a text
 */
function countOccurrences(text: string, query: string): number {
  if (!text || !query.trim()) return 0;
  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

export function DynamicCaseSearch({ onSelectResult }: DynamicCaseSearchProps) {
  const { language, t } = useLanguage();
  const { documents, parties, transcripts, claims } = useCaseData();
  const [query, setQuery] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'docs' | 'parties' | 'transcripts' | 'claims'>('all');

  const trimmedQuery = query.trim();

  // Search Results Calculation
  const matchingDocs = useMemo(() => {
    if (!trimmedQuery) return [];
    return documents
      .map((d) => {
        const fullSearchable = `${d.title} ${d.docNumber} ${d.summary} ${d.excerpt || ''} ${d.ocrText || ''} ${d.fullContent || ''} ${d.tags?.join(' ') || ''} ${d.category || ''}`;
        const hits = countOccurrences(fullSearchable, trimmedQuery);
        return { doc: d, hits };
      })
      .filter((item) => item.hits > 0)
      .sort((a, b) => b.hits - a.hits);
  }, [documents, trimmedQuery]);

  const matchingParties = useMemo(() => {
    if (!trimmedQuery) return [];
    return parties
      .map((p) => {
        const fullSearchable = `${p.name} ${p.role} ${p.organization} ${p.notes || ''} ${p.tags?.join(' ') || ''}`;
        const hits = countOccurrences(fullSearchable, trimmedQuery);
        return { party: p, hits };
      })
      .filter((item) => item.hits > 0);
  }, [parties, trimmedQuery]);

  const matchingTranscripts = useMemo(() => {
    if (!trimmedQuery) return [];
    return transcripts
      .map((tr) => {
        const fullSearchable = `${tr.speaker} ${tr.text} ${tr.tags?.join(' ') || ''}`;
        const hits = countOccurrences(fullSearchable, trimmedQuery);
        return { transcript: tr, hits };
      })
      .filter((item) => item.hits > 0);
  }, [transcripts, trimmedQuery]);

  const matchingClaims = useMemo(() => {
    if (!trimmedQuery) return [];
    return claims
      .map((c) => {
        const fullSearchable = `${c.claimId} ${c.description} ${c.claimant} ${c.targetParty} ${c.category}`;
        const hits = countOccurrences(fullSearchable, trimmedQuery);
        return { claim: c, hits };
      })
      .filter((item) => item.hits > 0);
  }, [claims, trimmedQuery]);

  const totalHits =
    matchingDocs.reduce((acc, curr) => acc + curr.hits, 0) +
    matchingParties.reduce((acc, curr) => acc + curr.hits, 0) +
    matchingTranscripts.reduce((acc, curr) => acc + curr.hits, 0) +
    matchingClaims.reduce((acc, curr) => acc + curr.hits, 0);

  const totalItemsFound = matchingDocs.length + matchingParties.length + matchingTranscripts.length + matchingClaims.length;

  return (
    <div className="space-y-6">
      {/* Search Header Hero Panel */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-indigo-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-indigo-400" />
              {t('Fuldtekst Søge- & Fremhævningsdashboard', 'Full-Text Search & Keyword Dashboard')}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {t(
                'Indtast et nøgleord for at gennemsøge alle OCR-tekster, sagsnotater, udskrifter og partssignaler med direkte visuel fremhævning og 1-klik navigation.',
                'Enter a keyword to query across all OCR documents, transcripts, and party records with live match highlights and 1-click evidence navigation.'
              )}
            </p>
          </div>
          {trimmedQuery && (
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs py-1 px-3 self-start sm:self-auto">
              {totalHits} {t('fremhævede forekomster', 'highlighted occurrences')}
            </Badge>
          )}
        </div>

        {/* Input Field */}
        <div className="relative">
          <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder={t(
              "Søg f.eks. 'FABU', 'Dennis', 'heroin', 'makulering', 'undskyldning', 'urinprøve'...",
              "Search e.g. 'FABU', 'Dennis', 'heroin', 'shredding', 'apology', 'urine test'..."
            )}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-28 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-inner"
          />
          {trimmedQuery && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-2.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              {t('Ryd', 'Clear')}
            </button>
          )}
        </div>

        {/* Quick Suggestion Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-semibold">{t('Hurtigsøgning:', 'Quick Search:')}</span>
          {['FABU', 'Dennis', 'Urinprøve', 'Makulering', 'Mette', 'Undskyldning', 'Børnehaven'].map((suggest) => (
            <button
              key={suggest}
              onClick={() => setQuery(suggest)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-900/40 border border-slate-700/80 text-slate-300 hover:text-indigo-300 transition-all cursor-pointer font-medium text-[11px]"
            >
              #{suggest}
            </button>
          ))}
        </div>

        {/* Category Filters Bar when searching */}
        {trimmedQuery && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t('Alle Kilder', 'All Sources')} ({totalItemsFound})
            </button>
            <button
              onClick={() => setActiveTabFilter('docs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabFilter === 'docs'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-indigo-400 hover:bg-indigo-950'
              }`}
            >
              📄 {t('Dokumenter', 'Documents')} ({matchingDocs.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('parties')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabFilter === 'parties'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 text-purple-400 hover:bg-purple-950'
              }`}
            >
              👤 {t('Parter / Aktører', 'Parties')} ({matchingParties.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('transcripts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabFilter === 'transcripts'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800 text-cyan-400 hover:bg-cyan-950'
              }`}
            >
              🎙️ {t('Transskriptioner', 'Transcripts')} ({matchingTranscripts.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('claims')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabFilter === 'claims'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-800 text-red-400 hover:bg-red-950'
              }`}
            >
              ⚠️ {t('Påstande', 'Claims')} ({matchingClaims.length})
            </button>
          </div>
        )}
      </div>

      {/* SEARCH RESULTS DASHBOARD */}
      {trimmedQuery && (
        <div className="space-y-8">
          {totalItemsFound === 0 ? (
            <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
              <Search className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">
                {t('Ingen matchende sagsakter fundet', 'No matching case records found')}
              </h4>
              <p className="text-xs text-slate-400">
                {t(
                  'Prøv et andet søgeord eller tjek stavningen for aktører og dokumentnumre.',
                  'Try another search term or verify spelling for entities and document numbers.'
                )}
              </p>
            </div>
          ) : (
            <>
              {/* SECTION: DOCUMENTS */}
              {(activeTabFilter === 'all' || activeTabFilter === 'docs') && matchingDocs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t('Dokumenter & Aktindsigter med Fremhævet Tekst', 'Documents & Files with Highlighted Preview')}
                      <span className="text-slate-400 font-normal">({matchingDocs.length})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingDocs.map(({ doc, hits }) => (
                      <Card
                        key={doc.id}
                        className="bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 transition-all p-5 flex flex-col justify-between space-y-3 shadow-lg group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-indigo-400 font-bold flex items-center gap-1.5">
                              {doc.docNumber}
                              <Badge className="bg-indigo-500/20 text-indigo-300 text-[10px] py-0.2">
                                {hits} {hits === 1 ? t('træffer', 'hit') : t('træffere', 'hits')}
                              </Badge>
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">{doc.date}</span>
                          </div>

                          <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                            <HighlightedSnippet text={doc.title} query={trimmedQuery} />
                          </h5>

                          {/* Preview snippet with highlighted text */}
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-serif space-y-1">
                            <p className="text-slate-400 text-[10px] font-sans uppercase font-bold tracking-wider">
                              {t('Tekstuddrag fra Bevisakt:', 'Evidence Text Excerpt:')}
                            </p>
                            <p>
                              <HighlightedSnippet
                                text={doc.ocrText || doc.fullContent || doc.summary}
                                query={trimmedQuery}
                              />
                            </p>
                          </div>

                          {/* Tags */}
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {doc.tags.map((tg, ti) => (
                                <span
                                  key={ti}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                                >
                                  #{tg}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ONE CLICK NAVIGATION BUTTON */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">{doc.category}</span>
                          <Button
                            onClick={() => onSelectResult && onSelectResult('document', doc)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          >
                            <span>{t('Åbn Bevisakt', 'Navigate to Evidence')}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PARTIES */}
              {(activeTabFilter === 'all' || activeTabFilter === 'parties') && matchingParties.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('Sagsaktører & Parter', 'Parties & Case Entities')}
                    <span className="text-slate-400 font-normal">({matchingParties.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingParties.map(({ party, hits }) => (
                      <Card
                        key={party.id}
                        className="bg-slate-900/90 border-slate-800 hover:border-purple-500/50 transition-all p-5 flex flex-col justify-between space-y-3 shadow-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-white">
                              <HighlightedSnippet text={party.name} query={trimmedQuery} />
                            </h5>
                            <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">
                              {party.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-purple-300 font-semibold">{party.organization}</p>
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                            <HighlightedSnippet text={party.notes} query={trimmedQuery} />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {party.documentsLinked ?? 0} {t('beviser tilknyttet', 'linked docs')}
                          </span>
                          <Button
                            onClick={() => onSelectResult && onSelectResult('party', party)}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{t('Gå til Aktør', 'View Entity')}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: TRANSCRIPTS */}
              {(activeTabFilter === 'all' || activeTabFilter === 'transcripts') && matchingTranscripts.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    {t('Lydtransskriptioner & Optagelser', 'Audio Transcripts')}
                    <span className="text-slate-400 font-normal">({matchingTranscripts.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingTranscripts.map(({ transcript, hits }) => (
                      <Card
                        key={transcript.id}
                        className="bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 transition-all p-5 flex flex-col justify-between space-y-3 shadow-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{transcript.speaker}</span>
                            <span className="font-mono text-cyan-400">{transcript.timecode}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 italic font-serif">
                            "<HighlightedSnippet text={transcript.text} query={trimmedQuery} />"
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Audio Log</span>
                          <Button
                            onClick={() => onSelectResult && onSelectResult('transcript', transcript)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-zinc-950 text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{t('Afspil / Vis Lyd', 'Play / View Transcript')}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: CLAIMS */}
              {(activeTabFilter === 'all' || activeTabFilter === 'claims') && matchingClaims.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {t('Registrerede Påstande & Lovovertrædelser', 'Serious Claims & Infringements')}
                    <span className="text-slate-400 font-normal">({matchingClaims.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingClaims.map(({ claim, hits }) => (
                      <Card
                        key={claim.id}
                        className="bg-slate-900/90 border-slate-800 hover:border-red-500/50 transition-all p-5 flex flex-col justify-between space-y-3 shadow-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-red-400 font-bold">{claim.claimId}</span>
                            <Badge className="bg-red-500/20 text-red-300 text-[10px]">{claim.category}</Badge>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                            <HighlightedSnippet text={claim.description} query={trimmedQuery} />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {claim.claimant} → {claim.targetParty}
                          </span>
                          <Button
                            onClick={() => onSelectResult && onSelectResult('claim', claim)}
                            className="bg-red-600 hover:bg-red-500 text-white text-xs py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{t('Gå til Påstand', 'View Claim')}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

