import React from 'react';
import { User, Calendar, Building, ArrowUpRight } from 'lucide-react';

export interface EntityMatch {
  type: 'party' | 'date' | 'place' | 'document';
  text: string;
  id?: string;
  details?: string;
}

export interface EntityHighlightedTextProps {
  text: string;
  onSelectEntity?: (entity: EntityMatch) => void;
  onJumpToTimelineDate?: (dateStr: string) => void;
  onSelectParty?: (partyId: string) => void;
  onSelectDocument?: (docId: string) => void;
  className?: string;
  fontSize?: 'sm' | 'base' | 'lg';
}

// Recognized Parties Dictionary
const PARTY_MAP: Record<string, { id: string; role: string; name: string }> = {
  'luca': { id: 'p-luca', name: 'Luca', role: 'Barn / Hovedperson' },
  'liam': { id: 'p-liam', name: 'Liam', role: 'Barn / Bror' },
  'dav': { id: 'p-dav', name: 'Dav', role: 'Far / Klager' },
  'dennis': { id: 'p-dennis', name: 'Dennis', role: 'Stedfar / Modpart' },
  'louise': { id: 'p-louise', name: 'Louise', role: 'Mor' },
  'marsha': { id: 'p-marsha', name: 'Marsha', role: 'Sagsbehandler (LTK)' },
  'mette': { id: 'p-mette', name: 'Mette', role: 'Rådgiver (LTK)' },
  'ulla': { id: 'p-ulla', name: 'Ulla', role: 'Tidligere sagsbehandler' },
  'amalie': { id: 'p-amalie-rikke', name: 'Amalie', role: 'Familievejleder' },
  'rikke': { id: 'p-amalie-rikke', name: 'Rikke', role: 'Familievejleder' },
  'michael': { id: 'p-nordstjerne-michael', name: 'Michael', role: 'Skoleleder (Nordstjernen)' },
  'sofia osmani': { id: 'p-borgmester-sofia', name: 'Sofia Osmani', role: 'Borgmester (LTK)' },
  'fabu': { id: 'p-fabu', name: 'FABU', role: 'Samværskonsulenter' }
};

// Recognized Places / Institutions Dictionary
const PLACE_MAP: Record<string, { name: string; type: string; details: string }> = {
  'retten i lyngby': { name: 'Retten i Lyngby', type: 'Byret', details: 'Byretsdom og retsbogsudskrift 15. juni 2024' },
  'lyngby-taarbæk kommune': { name: 'Lyngby-Taarbæk Kommune', type: 'Kommune', details: 'Ansvarlig forvaltningsmyndighed' },
  'børn- og ungeudvalget': { name: 'Børn- og Ungeudvalget', type: 'Kommunalt Udvalg', details: 'Møde og afgørelse 29. maj 2026' },
  'b&u-udvalget': { name: 'B&U-Udvalget', type: 'Kommunalt Udvalg', details: 'Møde og afgørelse 29. maj 2026' },
  'nordstjerneskolen': { name: 'Nordstjerneskolen', type: 'Skole', details: 'Skolemøde og trivselsdialog 18. nov 2025' },
  'gribskov kommune': { name: 'Gribskov Kommune', type: 'Kommune', details: 'Historisk sagsbehandling 2023' }
};

const entityRegex = new RegExp(
  [
    `(\\b\\d{1,2}\\.\\s*(?:januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december|jan|feb|mar|apr|jun|jul|aug|sep|okt|nov|dec)\\s*(?:\\d{2,4})?\\b)`,
    `(\\b\\d{4}-\\d{2}-\\d{2}\\b)`,
    `(\\b(?:Luca|Liam|Dav|Dennis|Louise|Marsha|Mette|Ulla|Amalie|Rikke|Michael|Sofia Osmani|FABU)\\b)`,
    `(\\b(?:Retten i Lyngby|Lyngby-Taarbæk Kommune|Børn- og Ungeudvalget|B&U-udvalget|Nordstjerneskolen|Gribskov Kommune)\\b)`
  ].join('|'),
  'gi'
);

export function EntityHighlightedText({
  text,
  onSelectEntity,
  onJumpToTimelineDate,
  onSelectParty,
  onSelectDocument,
  className = '',
  fontSize = 'base'
}: EntityHighlightedTextProps) {
  if (!text) return null;

  const renderEntitiesOnly = (plainText: string, keyPrefix: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const re = new RegExp(entityRegex.source, 'gi');

    while ((match = re.exec(plainText)) !== null) {
      const matchText = match[0];
      const matchIndex = match.index;

      if (matchIndex > lastIndex) {
        parts.push(plainText.substring(lastIndex, matchIndex));
      }

      const lower = matchText.toLowerCase();
      let entityType: EntityMatch['type'] = 'party';
      let entityId: string | undefined;
      let details: string | undefined;

      if (PARTY_MAP[lower]) {
        entityType = 'party';
        entityId = PARTY_MAP[lower].id;
        details = PARTY_MAP[lower].role;
      } else if (PLACE_MAP[lower]) {
        entityType = 'place';
        details = PLACE_MAP[lower].details;
      } else if (
        /^\d{4}-\d{2}-\d{2}$/.test(matchText) ||
        /\d{1,2}\.\s*(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)/i.test(matchText)
      ) {
        entityType = 'date';
        details = `Klik for at navigere til tidslinjen for ${matchText}`;
      }

      const matchObj: EntityMatch = {
        type: entityType,
        text: matchText,
        id: entityId,
        details
      };

      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSelectEntity) onSelectEntity(matchObj);
        if (entityType === 'party' && entityId && onSelectParty) {
          onSelectParty(entityId);
        } else if (entityType === 'date' && onJumpToTimelineDate) {
          onJumpToTimelineDate(matchText);
        }
      };

      let pillStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
      let IconComponent = User;

      if (entityType === 'party') {
        pillStyle = 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50 hover:bg-emerald-500/35 shadow-xs';
        IconComponent = User;
      } else if (entityType === 'date') {
        pillStyle = 'bg-indigo-500/20 text-indigo-200 border-indigo-500/50 hover:bg-indigo-500/35 shadow-xs';
        IconComponent = Calendar;
      } else if (entityType === 'place') {
        pillStyle = 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 hover:bg-cyan-500/35 shadow-xs';
        IconComponent = Building;
      }

      parts.push(
        <button
          key={`${keyPrefix}-ent-${matchIndex}-${matchText}`}
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md border text-[11px] sm:text-xs font-semibold leading-none transition-all cursor-pointer select-none align-baseline ${pillStyle}`}
          title={details || `${entityType.toUpperCase()}: ${matchText}`}
        >
          <IconComponent className="w-3 h-3 shrink-0 opacity-90" />
          <span>{matchText}</span>
          <ArrowUpRight className="w-2.5 h-2.5 shrink-0 opacity-70" />
        </button>
      );

      lastIndex = matchIndex + matchText.length;
    }

    if (lastIndex < plainText.length) {
      parts.push(plainText.substring(lastIndex));
    }

    return parts;
  };

  const renderInlineFormatted = (rawText: string, keyPrefix: string): React.ReactNode => {
    // Handle **bold** fragments
    const boldTokens = rawText.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {boldTokens.map((tok, idx) => {
          if (tok.startsWith('**') && tok.endsWith('**')) {
            const inner = tok.slice(2, -2);
            return (
              <strong key={`${keyPrefix}-b-${idx}`} className="font-bold text-white tracking-tight">
                {renderEntitiesOnly(inner, `${keyPrefix}-b-${idx}`)}
              </strong>
            );
          }
          return (
            <React.Fragment key={`${keyPrefix}-t-${idx}`}>
              {renderEntitiesOnly(tok, `${keyPrefix}-t-${idx}`)}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  // Process text line-by-line to preserve markdown structures
  const lines = text.split('\n');

  return (
    <div className={`space-y-2 leading-relaxed text-zinc-100 ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={`empty-${lineIdx}`} className="h-1.5" />;
        }

        // Headings
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={`h4-${lineIdx}`}
              className="text-base sm:text-lg font-bold text-emerald-300 mt-3 mb-1.5 flex items-center gap-2 border-b border-zinc-800/80 pb-1"
            >
              {renderInlineFormatted(trimmed.slice(4), `h4-${lineIdx}`)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={`h3-${lineIdx}`}
              className="text-lg sm:text-xl font-extrabold text-emerald-200 mt-4 mb-2 flex items-center gap-2 border-b border-emerald-500/30 pb-1.5"
            >
              {renderInlineFormatted(trimmed.slice(3), `h3-${lineIdx}`)}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2
              key={`h2-${lineIdx}`}
              className="text-xl sm:text-2xl font-black text-white mt-5 mb-2.5 pb-2 border-b border-zinc-700"
            >
              {renderInlineFormatted(trimmed.slice(2), `h2-${lineIdx}`)}
            </h2>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={`bq-${lineIdx}`}
              className="pl-3.5 pr-2 py-1.5 my-2 border-l-3 border-emerald-500 bg-emerald-950/20 text-zinc-200 italic rounded-r-lg"
            >
              {renderInlineFormatted(trimmed.slice(2), `bq-${lineIdx}`)}
            </blockquote>
          );
        }

        // Unordered List Items
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={`li-${lineIdx}`} className="flex items-start gap-2 pl-2 sm:pl-3 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-xs" />
              <div className="flex-1">
                {renderInlineFormatted(trimmed.slice(2), `li-${lineIdx}`)}
              </div>
            </div>
          );
        }

        // Ordered List Items (e.g. 1. 2. 3.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const num = numMatch[1];
          const rest = numMatch[2];
          return (
            <div key={`num-${lineIdx}`} className="flex items-start gap-2.5 pl-2 sm:pl-3 my-1.5">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] mt-0.5 shrink-0 border border-emerald-500/30">
                {num}
              </span>
              <div className="flex-1">
                {renderInlineFormatted(rest, `num-${lineIdx}`)}
              </div>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={`p-${lineIdx}`} className="leading-relaxed">
            {renderInlineFormatted(line, `p-${lineIdx}`)}
          </p>
        );
      })}
    </div>
  );
}
