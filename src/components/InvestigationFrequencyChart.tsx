import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Users,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  CheckCircle2,
  ScanText,
  HardDrive,
  Database,
  ArrowUpRight,
  Flame,
  Activity
} from 'lucide-react';
import { TimelineEvent, DocumentFinding, Party } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { EvidenceFrequencyTimelineD3 } from './EvidenceFrequencyTimelineD3';

export interface InvestigationFrequencyChartProps {
  events: TimelineEvent[];
  documents?: DocumentFinding[];
  parties?: Party[];
  onSelectDocument?: (doc: DocumentFinding) => void;
}

export function InvestigationFrequencyChart({
  events,
  documents = [],
  parties = [],
  onSelectDocument
}: InvestigationFrequencyChartProps) {
  const { language, t } = useLanguage();
  const [chartView, setChartView] = useState<
    'doc_categories' | 'ingestion_volume' | 'timeline_trend' | 'party_mentions' | 'd3_activity'
  >('doc_categories');
  const [timeGrouping, setTimeGrouping] = useState<'quarter' | 'year' | 'month'>('quarter');

  // 1. Document Categories Frequency Distribution (Recharts Bar & Pie)
  const docCategoriesData = useMemo(() => {
    const categoryCounts: Record<
      string,
      { category: string; count: number; ocrCount: number; criticalCount: number }
    > = {};

    const defaultCategories = [
      'Court Documents',
      'Social Services Reports',
      'FABU Observations',
      'Audio Transcripts',
      'Police & Health Records',
      'Internal Correspondence',
      'Forensic Notes'
    ];

    defaultCategories.forEach(cat => {
      categoryCounts[cat] = { category: cat, count: 0, ocrCount: 0, criticalCount: 0 };
    });

    documents.forEach(doc => {
      const cat = doc.folderCategory || doc.category || 'Forensic Notes';
      if (!categoryCounts[cat]) {
        categoryCounts[cat] = { category: cat, count: 0, ocrCount: 0, criticalCount: 0 };
      }
      categoryCounts[cat].count += 1;
      if (doc.ocrText && doc.ocrText.length > 50) {
        categoryCounts[cat].ocrCount += 1;
      }
      if (doc.significance === 'critical') {
        categoryCounts[cat].criticalCount += 1;
      }
    });

    const colors = [
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#6366f1', // Indigo
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#8b5cf6', // Purple
      '#3b82f6', // Blue
      '#14b8a6'  // Teal
    ];

    return Object.values(categoryCounts)
      .filter(item => item.count > 0 || defaultCategories.includes(item.category))
      .map((item, idx) => ({
        ...item,
        color: colors[idx % colors.length],
        percentage: documents.length > 0 ? Math.round((item.count / documents.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [documents]);

  // 2. Document Ingestion Volume Over Time (Monthly/Quarterly/Yearly Recharts Area/Bar)
  const ingestionVolumeData = useMemo(() => {
    const periodMap: Record<
      string,
      { period: string; ingestedDocs: number; cumulative: number; ocrIndexed: number; audioFiles: number }
    > = {};

    // Sort documents by date
    const sortedDocs = [...documents].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    let cumulativeTotal = 0;

    sortedDocs.forEach(doc => {
      const dateStr = doc.date || '2026-01-01';
      const year = dateStr.substring(0, 4) || '2026';
      const monthNum = parseInt(dateStr.substring(5, 7) || '1', 10);
      const quarter = Math.ceil(monthNum / 3);

      let key = `${year} Q${quarter}`;
      if (timeGrouping === 'year') {
        key = year;
      } else if (timeGrouping === 'month') {
        key = `${year}-${String(monthNum).padStart(2, '0')}`;
      }

      if (!periodMap[key]) {
        periodMap[key] = {
          period: key,
          ingestedDocs: 0,
          cumulative: 0,
          ocrIndexed: 0,
          audioFiles: 0
        };
      }

      periodMap[key].ingestedDocs += 1;
      cumulativeTotal += 1;
      periodMap[key].cumulative = cumulativeTotal;

      if (doc.ocrText && doc.ocrText.length > 50) {
        periodMap[key].ocrIndexed += 1;
      }
      if (doc.sourceType === 'audio') {
        periodMap[key].audioFiles += 1;
      }
    });

    return Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));
  }, [documents, timeGrouping]);

  // 3. Timeline Event Trend (Quarterly / Yearly)
  const occurrenceTrendData = useMemo(() => {
    const counts: Record<
      string,
      { period: string; events: number; documents: number; audio: number; decisions: number }
    > = {};

    events.forEach(evt => {
      if (!evt.date) return;
      const y = evt.date.substring(0, 4);
      const m = parseInt(evt.date.substring(5, 7) || '1', 10);
      const q = Math.ceil(m / 3);
      const key = timeGrouping === 'quarter' ? `${y} Q${q}` : y;

      if (!counts[key]) {
        counts[key] = { period: key, events: 0, documents: 0, audio: 0, decisions: 0 };
      }
      counts[key].events += 1;
      const cat = (evt.category || '').toLowerCase();
      if (cat.includes('fabu') || cat.includes('dokument')) counts[key].documents += 1;
      if (cat.includes('lyd') || cat.includes('fortælling') || evt.sourceType === 'audio') counts[key].audio += 1;
      if (cat.includes('dom') || cat.includes('afgørelse') || cat.includes('bu')) counts[key].decisions += 1;
    });

    return Object.values(counts).sort((a, b) => a.period.localeCompare(b.period));
  }, [events, timeGrouping]);

  // 4. Party Mentions Distribution
  const partyMentionsData = useMemo(() => {
    const mentionCounts: Record<string, { name: string; count: number; role: string; color: string }> = {};

    const colorPalette = [
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#6366f1', // Indigo
      '#8b5cf6', // Purple
      '#f43f5e', // Rose
      '#3b82f6'  // Blue
    ];

    parties.forEach((p, idx) => {
      mentionCounts[p.id] = {
        name: p.name,
        role: p.role,
        count: 0,
        color: colorPalette[idx % colorPalette.length]
      };
    });

    events.forEach(evt => {
      evt.partyIds?.forEach(pid => {
        if (mentionCounts[pid]) {
          mentionCounts[pid].count += 1;
        }
      });
    });

    documents.forEach(doc => {
      doc.partiesInvolved?.forEach(pid => {
        if (mentionCounts[pid]) {
          mentionCounts[pid].count += 1;
        }
      });
    });

    return Object.values(mentionCounts)
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [events, documents, parties]);

  // Metadata KPI Summary Stats
  const metadataKPIs = useMemo(() => {
    const totalDocs = documents.length;
    const ocrIndexedCount = documents.filter(d => Boolean(d.ocrText && d.ocrText.length > 50)).length;
    const criticalCount = documents.filter(d => d.significance === 'critical').length;
    const ocrCoveragePct = totalDocs > 0 ? Math.round((ocrIndexedCount / totalDocs) * 100) : 100;
    const verifiedCount = documents.filter(d => d.verified).length;

    return {
      totalDocs,
      ocrIndexedCount,
      criticalCount,
      ocrCoveragePct,
      verifiedCount
    };
  }, [documents]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/95 border border-zinc-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-white border-b border-zinc-800 pb-1 font-mono">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color || '#10b981' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || '#10b981' }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Dashboard Header with KPI Pills & Tab Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
              <Database className="w-3 h-3" />
              {t('Sagsarkivets Metadatapanel', 'Case Metadata & Ingestion Dashboard')}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              • {documents.length} {t('sagsakter indekseret', 'documents indexed')}
            </span>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
              {metadataKPIs.ocrCoveragePct}% {t('OCR Fuldtekstdækning', 'OCR Coverage')}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>
              {t(
                'Kategorifrekvens & Dokumentindlæsningsvolumen',
                'Category Frequency & Ingestion Volume Dashboard'
              )}
            </span>
          </h2>
          <p className="text-xs text-zinc-300 max-w-2xl mt-0.5 leading-relaxed">
            {t(
              'Recharts metadatapanel over sagsakternes fordeling, dokumentindtag over tid (2022-2026), OCR-udtræksstatus og forensiske partskoblinger.',
              'Recharts metadata state dashboard tracking category distributions, ingestion volume over time (2022-2026), OCR coverage, and forensic party associations.'
            )}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setChartView('doc_categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              chartView === 'doc_categories'
                ? 'bg-emerald-600 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-600/25'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{t('Dokumentkategorier', 'Document Categories')}</span>
          </button>

          <button
            onClick={() => setChartView('ingestion_volume')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              chartView === 'ingestion_volume'
                ? 'bg-emerald-600 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-600/25'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('Indlæsningsvolumen', 'Ingestion Volume')}</span>
          </button>

          <button
            onClick={() => setChartView('timeline_trend')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              chartView === 'timeline_trend'
                ? 'bg-emerald-600 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-600/25'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('Hændelsesintensitet', 'Incident Trend')}</span>
          </button>

          <button
            onClick={() => setChartView('party_mentions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              chartView === 'party_mentions'
                ? 'bg-emerald-600 text-zinc-950 border-emerald-400 shadow-lg shadow-emerald-600/25'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('Partsforkomster', 'Party Mentions')}</span>
          </button>

          <button
            onClick={() => setChartView('d3_activity')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              chartView === 'd3_activity'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-red-400 shadow-lg shadow-red-600/30'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400 fill-current" />
            <span>{t('D3 Højaktivitetsanalyse', 'D3 Spike Analysis')}</span>
          </button>
        </div>
      </div>

      {/* Quick Metadata KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              {t('Indekserede Akter', 'Indexed Files')}
            </div>
            <div className="text-lg font-mono font-extrabold text-white">
              {metadataKPIs.totalDocs}
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <ScanText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              {t('OCR Fuldtekst Scannet', 'OCR Extracted')}
            </div>
            <div className="text-lg font-mono font-extrabold text-cyan-400">
              {metadataKPIs.ocrIndexedCount} <span className="text-xs text-zinc-400 font-normal">({metadataKPIs.ocrCoveragePct}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              {t('Kritiske Sagsakter', 'Critical Evidence')}
            </div>
            <div className="text-lg font-mono font-extrabold text-amber-400">
              {metadataKPIs.criticalCount}
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              {t('SHA-256 Verificeret', 'SHA-256 Verified')}
            </div>
            <div className="text-lg font-mono font-extrabold text-emerald-400">
              {metadataKPIs.verifiedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="w-full h-80">
        {/* VIEW 1: DOCUMENT CATEGORIES FREQUENCY */}
        {chartView === 'doc_categories' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                {t('Dokumentfrekvens opdelt på sagsmappekategorier & OCR-dækning:', 'Document count per folder category & OCR coverage:')}
              </span>
            </div>

            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={docCategoriesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis
                  dataKey="category"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                <Bar
                  dataKey="count"
                  name={t('Totale Dokumenter', 'Total Documents')}
                  radius={[6, 6, 0, 0]}
                >
                  {docCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar
                  dataKey="ocrCount"
                  name={t('Fuldtekst OCR Indekseret', 'OCR Searchable Text')}
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VIEW 2: DOCUMENT INGESTION VOLUME OVER TIME */}
        {chartView === 'ingestion_volume' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                {t('Kumulativ og periodisk sagsaktindtagelse (2022 - 2026):', 'Cumulative and period document intake (2022 - 2026):')}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setTimeGrouping('month')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                    timeGrouping === 'month'
                      ? 'bg-emerald-600 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white bg-zinc-800'
                  }`}
                >
                  {t('Måned', 'Month')}
                </button>
                <button
                  onClick={() => setTimeGrouping('quarter')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                    timeGrouping === 'quarter'
                      ? 'bg-emerald-600 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white bg-zinc-800'
                  }`}
                >
                  {t('Kvartal', 'Quarter')}
                </button>
                <button
                  onClick={() => setTimeGrouping('year')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                    timeGrouping === 'year'
                      ? 'bg-emerald-600 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white bg-zinc-800'
                  }`}
                >
                  {t('År', 'Year')}
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="90%">
              <AreaChart
                data={ingestionVolumeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIngested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="period" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name={t('Kumulativt Arkiv (Total Antal Akter)', 'Cumulative Archive Total')}
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                />
                <Area
                  type="monotone"
                  dataKey="ingestedDocs"
                  name={t('Nye Sagsakter i Perioden', 'Ingested Docs in Period')}
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIngested)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VIEW 3: TIMELINE INCIDENT TREND */}
        {chartView === 'timeline_trend' && (
          <div className="h-full flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart
                data={occurrenceTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAudio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                <XAxis dataKey="period" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="events"
                  name={t('Totale Sagsbegivenheder', 'Total Events')}
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEvents)"
                />
                <Area
                  type="monotone"
                  dataKey="audio"
                  name={t('Mødelyd / Børneoptagelser', 'Audio Recordings')}
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAudio)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* VIEW 4: PARTY MENTIONS DISTRIBUTION */}
        {chartView === 'party_mentions' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={partyMentionsData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
              <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                width={110}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                name={t('Antal Dokumenterede Forekomster', 'Documented Mentions')}
                radius={[0, 6, 6, 0]}
              >
                {partyMentionsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* VIEW 5: D3 EVIDENCE FREQUENCY & HIGH-ACTIVITY SURGE DETECTION */}
        {chartView === 'd3_activity' && (
          <div className="w-full pt-1">
            <EvidenceFrequencyTimelineD3
              documents={documents}
              timelineEvents={events}
              onSelectDocument={onSelectDocument}
            />
          </div>
        )}
      </div>
    </div>
  );
}

