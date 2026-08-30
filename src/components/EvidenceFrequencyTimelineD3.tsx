import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Activity,
  Calendar,
  Flame,
  Filter,
  Layers,
  Sparkles,
  FileText,
  Mic,
  AlertTriangle,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Bot,
  ExternalLink,
  Sliders,
  TrendingUp,
  CheckCircle2,
  BarChart2,
  Grid,
  Info,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentFinding, TimelineEvent, TranscriptSnippet, SeriousClaim } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export interface EvidenceFrequencyTimelineD3Props {
  documents: DocumentFinding[];
  timelineEvents: TimelineEvent[];
  transcripts?: TranscriptSnippet[];
  claims?: SeriousClaim[];
  onSelectDocument?: (doc: DocumentFinding) => void;
  onSelectDateRange?: (startDate: string, endDate: string) => void;
  onAskAIWithPeriod?: (periodLabel: string, itemsCount: number, topItems: string[]) => void;
  className?: string;
}

interface EvidenceDataPoint {
  id: string;
  date: Date;
  dateStr: string; // YYYY-MM-DD
  title: string;
  type: 'document' | 'audio' | 'event' | 'claim';
  category: string;
  significance: 'routine' | 'noteworthy' | 'critical';
  sourceDocId?: string;
  summary?: string;
}

interface TimeBin {
  binId: string;
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
  totalCount: number;
  criticalCount: number;
  noteworthyCount: number;
  routineCount: number;
  documentCount: number;
  audioCount: number;
  eventCount: number;
  claimCount: number;
  items: EvidenceDataPoint[];
  isHighActivitySpike: boolean;
  activityScore: number; // 0-100 normalized
}

export function EvidenceFrequencyTimelineD3({
  documents = [],
  timelineEvents = [],
  transcripts = [],
  claims = [],
  onSelectDocument,
  onSelectDateRange,
  onAskAIWithPeriod,
  className = ''
}: EvidenceFrequencyTimelineD3Props) {
  const { language, t } = useLanguage();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const brushSvgRef = useRef<SVGSVGElement | null>(null);

  // View & Control States
  const [timeGranularity, setTimeGranularity] = useState<'year' | 'month' | 'week' | 'day'>('month');
  const [viewMode, setViewMode] = useState<'barchart' | 'heatmap' | 'density'>('barchart');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'document' | 'audio' | 'critical'>('all');
  const [highlightSpikesOnly, setHighlightSpikesOnly] = useState<boolean>(false);
  const [selectedBin, setSelectedBin] = useState<TimeBin | null>(null);
  const [hoveredBin, setHoveredBin] = useState<TimeBin | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [dateBrushRange, setDateBrushRange] = useState<[Date, Date] | null>(null);

  // 1. Flatten all evidence items into unified dataset
  const unifiedEvidence = useMemo<EvidenceDataPoint[]>(() => {
    const list: EvidenceDataPoint[] = [];

    // Documents
    documents.forEach((d) => {
      if (!d.date) return;
      const parsed = new Date(d.date);
      if (isNaN(parsed.getTime())) return;
      list.push({
        id: `doc-${d.id}`,
        date: parsed,
        dateStr: d.date.substring(0, 10),
        title: d.title,
        type: d.sourceType === 'audio' ? 'audio' : 'document',
        category: d.folderCategory || d.category || 'Dokument',
        significance: (d.significance as any) || 'routine',
        sourceDocId: d.id,
        summary: d.summary
      });
    });

    // Timeline Events
    timelineEvents.forEach((e) => {
      if (!e.date) return;
      const parsed = new Date(e.date);
      if (isNaN(parsed.getTime())) return;
      // Skip if identical to document to prevent double counting
      const alreadyHasDoc = e.sourceDocId && list.some(item => item.sourceDocId === e.sourceDocId && item.dateStr === e.date);
      if (!alreadyHasDoc) {
        list.push({
          id: `evt-${e.id}`,
          date: parsed,
          dateStr: e.date.substring(0, 10),
          title: e.title,
          type: e.sourceType === 'audio' ? 'audio' : 'event',
          category: e.category || 'Hændelse',
          significance: (e.significance as any) === 'critical' ? 'critical' : (e.significance === 'high' ? 'noteworthy' : 'routine'),
          sourceDocId: e.sourceDocId,
          summary: e.description
        });
      }
    });

    // Transcripts
    transcripts.forEach((tr) => {
      if (!tr.date) return;
      const parsed = new Date(tr.date);
      if (isNaN(parsed.getTime())) return;
      list.push({
        id: `tr-${tr.id}`,
        date: parsed,
        dateStr: tr.date.substring(0, 10),
        title: tr.title || `${tr.speaker}: ${tr.summary || 'Lydoptagelse'}`,
        type: 'audio',
        category: 'Lydoptagelse',
        significance: (tr.significance as any) || 'noteworthy',
        summary: tr.summary || tr.text
      });
    });

    // Serious Claims
    claims.forEach((cl) => {
      const dateVal = cl.registeredDate || cl.dateLogged;
      if (!dateVal) return;
      const parsed = new Date(dateVal);
      if (isNaN(parsed.getTime())) return;
      list.push({
        id: `cl-${cl.id}`,
        date: parsed,
        dateStr: dateVal.substring(0, 10),
        title: `${cl.claimId}: ${cl.description}`,
        type: 'claim',
        category: cl.category || 'Alvorlig Påstand',
        significance: cl.severity === 'critical' || cl.severity === 'severe' ? 'critical' : 'noteworthy',
        summary: cl.investigationNotes || cl.description
      });
    });

    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [documents, timelineEvents, transcripts, claims]);

  // 2. Filter unified evidence
  const filteredEvidence = useMemo(() => {
    return unifiedEvidence.filter((item) => {
      if (selectedTypeFilter === 'document' && item.type !== 'document') return false;
      if (selectedTypeFilter === 'audio' && item.type !== 'audio') return false;
      if (selectedTypeFilter === 'critical' && item.significance !== 'critical') return false;
      return true;
    });
  }, [unifiedEvidence, selectedTypeFilter]);

  // 3. Bin evidence items across time intervals
  const timeBins = useMemo<TimeBin[]>(() => {
    if (filteredEvidence.length === 0) return [];

    const minDate = d3.min(filteredEvidence, (d) => d.date) || new Date('2022-01-01');
    const maxDate = d3.max(filteredEvidence, (d) => d.date) || new Date('2026-12-31');

    // Create intervals based on granularity
    let intervalGenerator: d3.CountableTimeInterval;
    let formatLabel: (d: Date) => string;

    if (timeGranularity === 'year') {
      intervalGenerator = d3.timeYear;
      formatLabel = d3.timeFormat('%Y');
    } else if (timeGranularity === 'week') {
      intervalGenerator = d3.timeWeek;
      formatLabel = d3.timeFormat('Uge %U, %Y');
    } else if (timeGranularity === 'day') {
      intervalGenerator = d3.timeDay;
      formatLabel = d3.timeFormat('%d. %b %Y');
    } else {
      // Month (default)
      intervalGenerator = d3.timeMonth;
      formatLabel = d3.timeFormat('%b %Y');
    }

    const intervals = intervalGenerator.range(
      intervalGenerator.floor(minDate),
      intervalGenerator.offset(intervalGenerator.ceil(maxDate), 1)
    );

    // Group items into intervals
    const bins: TimeBin[] = intervals.map((start, idx) => {
      const end = intervals[idx + 1] || intervalGenerator.offset(start, 1);
      const itemsInBin = filteredEvidence.filter(
        (item) => item.date >= start && item.date < end
      );

      const criticalCount = itemsInBin.filter((i) => i.significance === 'critical').length;
      const noteworthyCount = itemsInBin.filter((i) => i.significance === 'noteworthy').length;
      const routineCount = itemsInBin.filter((i) => i.significance === 'routine').length;
      const documentCount = itemsInBin.filter((i) => i.type === 'document').length;
      const audioCount = itemsInBin.filter((i) => i.type === 'audio').length;
      const eventCount = itemsInBin.filter((i) => i.type === 'event').length;
      const claimCount = itemsInBin.filter((i) => i.type === 'claim').length;

      return {
        binId: `bin-${start.toISOString()}`,
        periodStart: start,
        periodEnd: end,
        periodLabel: formatLabel(start),
        totalCount: itemsInBin.length,
        criticalCount,
        noteworthyCount,
        routineCount,
        documentCount,
        audioCount,
        eventCount,
        claimCount,
        items: itemsInBin,
        isHighActivitySpike: false,
        activityScore: 0
      };
    });

    // Statistical Anomaly / Spike Detection (Mean + 1.2 * StdDev)
    const counts = bins.map((b) => b.totalCount);
    const mean = d3.mean(counts) || 0;
    const stdDev = d3.deviation(counts) || 1;
    const spikeThreshold = Math.max(3, mean + 1.15 * stdDev);
    const maxCount = d3.max(counts) || 1;

    bins.forEach((bin) => {
      bin.isHighActivitySpike = bin.totalCount >= spikeThreshold || (bin.totalCount >= 4 && bin.criticalCount >= 2);
      bin.activityScore = Math.min(100, Math.round((bin.totalCount / maxCount) * 100));
    });

    return bins;
  }, [filteredEvidence, timeGranularity]);

  // Summary Metrics & Top High-Activity Hotspots
  const hotspotSurges = useMemo(() => {
    return timeBins
      .filter((b) => b.isHighActivitySpike && b.totalCount > 0)
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [timeBins]);

  const maxBinCount = useMemo(() => {
    return d3.max(timeBins, (b) => b.totalCount) || 1;
  }, [timeBins]);

  const totalIndexedEvidenceCount = unifiedEvidence.length;
  const criticalEvidenceCount = unifiedEvidence.filter((e) => e.significance === 'critical').length;

  // 4. Render D3 Chart Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || timeBins.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    const containerWidth = containerRef.current.clientWidth || 800;
    const height = 320;
    const margin = { top: 30, right: 30, bottom: 50, left: 45 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('width', containerWidth).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Determine Active Visible Time Bins (if brush applied)
    const activeBins = dateBrushRange
      ? timeBins.filter(
          (b) => b.periodEnd >= dateBrushRange[0] && b.periodStart <= dateBrushRange[1]
        )
      : timeBins;

    const visibleBins = activeBins.length > 0 ? activeBins : timeBins;

    // Scales
    const x0 = d3
      .scaleBand<string>()
      .domain(visibleBins.map((d) => d.periodLabel))
      .range([0, innerWidth])
      .padding(0.24);

    const maxY = Math.max(5, (d3.max(visibleBins, (d) => d.totalCount) || 1) + 2);
    const y = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]).nice();

    // Subtle Gradient Definitions
    const defs = svg.append('defs');

    // Normal Bar Gradient
    const barGrad = defs
      .append('linearGradient')
      .attr('id', 'evidenceBarGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    barGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    barGrad.append('stop').attr('offset', '100%').attr('stop-color', '#047857');

    // High Activity Surge Gradient
    const surgeGrad = defs
      .append('linearGradient')
      .attr('id', 'evidenceSurgeGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    surgeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444');
    surgeGrad.append('stop').attr('offset', '50%').attr('stop-color', '#f59e0b');
    surgeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#b91c1c');

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#27272a')
      .attr('stroke-dasharray', '3 3')
      .attr('opacity', 0.6);

    // High-activity threshold line
    const counts = visibleBins.map((b) => b.totalCount);
    const mean = d3.mean(counts) || 0;
    const stdDev = d3.deviation(counts) || 1;
    const thresholdVal = mean + 1.15 * stdDev;

    if (thresholdVal < maxY && thresholdVal > 1.5) {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', y(thresholdVal))
        .attr('y2', y(thresholdVal))
        .attr('stroke', '#ef4444')
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', innerWidth - 5)
        .attr('y', y(thresholdVal) - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#f87171')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text(`⚡ ${t('Aktivitetstærskel (Spike Hotspot)', 'Activity Spike Threshold')}`);
    }

    // X Axis
    const xAxis = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0).tickSize(0).tickPadding(10));

    xAxis.select('.domain').attr('stroke', '#3f3f46');
    xAxis
      .selectAll('text')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('transform', visibleBins.length > 14 ? 'rotate(-30)' : 'rotate(0)')
      .style('text-anchor', visibleBins.length > 14 ? 'end' : 'middle');

    // Y Axis
    const yAxis = g.append('g').call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(8));
    yAxis.select('.domain').attr('stroke', '#3f3f46');
    yAxis.selectAll('text').attr('fill', '#a1a1aa').attr('font-size', '10px').attr('font-family', 'monospace');

    // Axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -32)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#71717a')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text(t('Antal Sagsakter / Beviser', 'Evidence Entries Count'));

    // VIEW MODE 1: D3 BAR CHART (STACKED / SEGMENTED)
    if (viewMode === 'barchart') {
      const barGroups = g
        .selectAll('.bar-group')
        .data(visibleBins)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('transform', (d) => `translate(${x0(d.periodLabel) || 0}, 0)`)
        .style('cursor', 'pointer');

      // Main Bars
      barGroups
        .append('rect')
        .attr('class', 'evidence-bar')
        .attr('x', 0)
        .attr('width', x0.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', (d) => {
          if (d.isHighActivitySpike) return 'url(#evidenceSurgeGradient)';
          if (d.criticalCount > 0) return '#f59e0b';
          return 'url(#evidenceBarGradient)';
        })
        .attr('stroke', (d) => {
          if (selectedBin?.binId === d.binId) return '#ffffff';
          if (d.isHighActivitySpike) return '#fca5a5';
          return 'transparent';
        })
        .attr('stroke-width', (d) => (selectedBin?.binId === d.binId ? 2 : 1))
        .transition()
        .duration(600)
        .delay((_, i) => i * 20)
        .attr('y', (d) => y(d.totalCount))
        .attr('height', (d) => innerHeight - y(d.totalCount));

      // Indicator Flame or Badge on High-Activity Bars
      barGroups
        .filter((d) => d.isHighActivitySpike && d.totalCount > 0)
        .append('text')
        .attr('x', x0.bandwidth() / 2)
        .attr('y', (d) => y(d.totalCount) - 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('🔥')
        .attr('opacity', 0)
        .transition()
        .delay(650)
        .attr('opacity', 1);

      // Value counts on top of bars
      barGroups
        .filter((d) => d.totalCount > 0)
        .append('text')
        .attr('x', x0.bandwidth() / 2)
        .attr('y', (d) => (d.isHighActivitySpike ? y(d.totalCount) - 22 : y(d.totalCount) - 6))
        .attr('text-anchor', 'middle')
        .attr('fill', (d) => (d.isHighActivitySpike ? '#fca5a5' : '#e4e4e7'))
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .text((d) => d.totalCount)
        .attr('opacity', 0)
        .transition()
        .delay(500)
        .attr('opacity', 1);

      // Interactivity
      barGroups
        .on('mouseenter', function (event, d) {
          d3.select(this).select('rect').attr('opacity', 0.85);
          setHoveredBin(d);
          const rect = event.currentTarget.getBoundingClientRect();
          const parentRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          setTooltipPos({
            x: rect.left - parentRect.left + rect.width / 2,
            y: rect.top - parentRect.top - 10
          });
        })
        .on('mouseleave', function () {
          d3.select(this).select('rect').attr('opacity', 1);
          setHoveredBin(null);
          setTooltipPos(null);
        })
        .on('click', function (_, d) {
          setSelectedBin(d);
          if (onSelectDateRange) {
            onSelectDateRange(d.periodStart.toISOString().split('T')[0], d.periodEnd.toISOString().split('T')[0]);
          }
        });
    }

    // VIEW MODE 2: DENSITY & TREND CURVE
    if (viewMode === 'density') {
      const lineGenerator = d3
        .line<TimeBin>()
        .x((d) => (x0(d.periodLabel) || 0) + x0.bandwidth() / 2)
        .y((d) => y(d.totalCount))
        .curve(d3.curveCatmullRom.alpha(0.5));

      const areaGenerator = d3
        .area<TimeBin>()
        .x((d) => (x0(d.periodLabel) || 0) + x0.bandwidth() / 2)
        .y0(innerHeight)
        .y1((d) => y(d.totalCount))
        .curve(d3.curveCatmullRom.alpha(0.5));

      // Gradient for area
      const areaGrad = defs
        .append('linearGradient')
        .attr('id', 'densityAreaGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      areaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.5);
      areaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#064e3b').attr('stop-opacity', 0.02);

      g.append('path')
        .datum(visibleBins)
        .attr('fill', 'url(#densityAreaGradient)')
        .attr('d', areaGenerator);

      g.append('path')
        .datum(visibleBins)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator);

      // Points on the line
      const points = g
        .selectAll('.density-point')
        .data(visibleBins)
        .enter()
        .append('g')
        .attr('class', 'density-point')
        .attr('transform', (d) => `translate(${(x0(d.periodLabel) || 0) + x0.bandwidth() / 2}, ${y(d.totalCount)})`)
        .style('cursor', 'pointer');

      points
        .append('circle')
        .attr('r', (d) => (d.isHighActivitySpike ? 6 : 4))
        .attr('fill', (d) => (d.isHighActivitySpike ? '#ef4444' : '#10b981'))
        .attr('stroke', '#09090b')
        .attr('stroke-width', 2);

      points
        .on('mouseenter', function (event, d) {
          d3.select(this).select('circle').attr('r', 8);
          setHoveredBin(d);
          const rect = event.currentTarget.getBoundingClientRect();
          const parentRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
          setTooltipPos({
            x: rect.left - parentRect.left,
            y: rect.top - parentRect.top - 10
          });
        })
        .on('mouseleave', function () {
          d3.select(this).select('circle').attr('r', (d: any) => (d.isHighActivitySpike ? 6 : 4));
          setHoveredBin(null);
          setTooltipPos(null);
        })
        .on('click', (_, d) => {
          setSelectedBin(d);
        });
    }
  }, [timeBins, viewMode, selectedBin, dateBrushRange, language, t]);

  // Handle Ask AI with Selected Hotspot
  const handleConsultHotspotAI = (bin: TimeBin) => {
    if (!onAskAIWithPeriod) return;
    const topSnippets = bin.items.slice(0, 5).map((i) => `[${i.dateStr}] ${i.title}`);
    onAskAIWithPeriod(bin.periodLabel, bin.totalCount, topSnippets);
  };

  return (
    <div className={`bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-6 ${className}`}>
      {/* Top Header with Forensic Title, Hotspot Pill & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>{t('D3.js Tidsmæssig Bevisfrekvens & Højaktivitetsanalyse', 'D3.js Evidence Frequency & High-Activity Analysis')}</span>
            </span>

            {hotspotSurges.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-400 fill-current" />
                <span>
                  {hotspotSurges.length} {t('Højaktivitets-hotspots identificeret', 'Surge periods detected')}
                </span>
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-400 shrink-0" />
            <span>{t('Bevisintensitet & Hændelsestæthed Over Tid', 'Evidence Velocity & High-Activity Detection')}</span>
          </h2>

          <p className="text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
            {t(
              'Statistisk analyse af sagens dokumentindgange, mødelydoptagelser og forvaltningsakter. Anvender D3.js til at kortlægge aktivitetsbølger og identificere kritiske efterforskningsperioder i sagen.',
              'Statistical temporal analysis of case document filings, meeting wiretaps, and municipal decrees. Uses D3.js to map activity surges and isolate critical case investigation periods.'
            )}
          </p>
        </div>

        {/* View & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Time Granularity Tabs */}
          <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTimeGranularity('month')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                timeGranularity === 'month'
                  ? 'bg-emerald-600 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('Måned', 'Month')}
            </button>
            <button
              type="button"
              onClick={() => setTimeGranularity('week')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                timeGranularity === 'week'
                  ? 'bg-emerald-600 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('Uge', 'Week')}
            </button>
            <button
              type="button"
              onClick={() => setTimeGranularity('day')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                timeGranularity === 'day'
                  ? 'bg-emerald-600 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t('Dag', 'Day')}
            </button>
          </div>

          {/* Chart Display Mode */}
          <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('barchart')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'barchart'
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={t('Søjlediagram (Histogram)', 'Bar Chart Histogram')}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('density')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'density'
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={t('Tæthedskurve (Density Curve)', 'Density Curve')}
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

          {/* Type Filter dropdown */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-1.5 font-mono outline-none cursor-pointer"
          >
            <option value="all">{t('Alle Beviskilder', 'All Sources')}</option>
            <option value="document">📄 {t('Kun Sagsakter', 'Documents Only')}</option>
            <option value="audio">🎙️ {t('Kun Lydoptagelser', 'Audio Only')}</option>
            <option value="critical">🔴 {t('Kun Kritiske Akter', 'Critical Only')}</option>
          </select>
        </div>
      </div>

      {/* KPI Metrics Dashboard Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              {t('Total Evidensmasse', 'Total Evidence Items')}
            </div>
            <div className="text-lg font-mono font-extrabold text-white">
              {filteredEvidence.length}{' '}
              <span className="text-xs text-zinc-500 font-normal">/ {totalIndexedEvidenceCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              {t('Højaktivitets-bølger', 'Activity Hotspots')}
            </div>
            <div className="text-lg font-mono font-extrabold text-red-400">
              {hotspotSurges.length}{' '}
              <span className="text-xs text-zinc-500 font-normal">{t('perioder', 'surges')}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              {t('Maksimal Spidsværdi', 'Peak Density Count')}
            </div>
            <div className="text-lg font-mono font-extrabold text-amber-400">
              {maxBinCount}{' '}
              <span className="text-xs text-zinc-500 font-normal">{t('akter / interval', 'items/bin')}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
              {t('Lyd & Afhøringer', 'Recorded Audio Evidence')}
            </div>
            <div className="text-lg font-mono font-extrabold text-cyan-400">
              {unifiedEvidence.filter((e) => e.type === 'audio').length}
            </div>
          </div>
        </div>
      </div>

      {/* Identified High-Activity Hotspot Surge Badges (Quick Filter Links) */}
      {hotspotSurges.length > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-zinc-950 to-amber-950/30 border border-red-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-red-300">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400 fill-current" />
              {t('Identificerede Højaktivitetsperioder (Sagsbølger):', 'Detected Case Surge Hotspots:')}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              {t('Klik for at isolere tidsvindue', 'Click to inspect time window')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hotspotSurges.map((hotspot) => (
              <button
                key={hotspot.binId}
                type="button"
                onClick={() => setSelectedBin(hotspot)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all cursor-pointer ${
                  selectedBin?.binId === hotspot.binId
                    ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/30 font-bold'
                    : 'bg-zinc-900/90 text-red-200 border-red-500/40 hover:bg-zinc-800'
                }`}
              >
                <span>🔥 {hotspot.periodLabel}</span>
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[11px] font-bold">
                  {hotspot.totalCount} {t('akter', 'items')}
                </span>
                {hotspot.criticalCount > 0 && (
                  <span className="text-amber-300 text-[10px]">
                    ({hotspot.criticalCount} 🔴)
                  </span>
                )}
              </button>
            ))}

            {selectedBin && (
              <button
                type="button"
                onClick={() => setSelectedBin(null)}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('Vis alle', 'Reset filter')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main D3 Visualization Canvas */}
      <div className="relative bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800/90 overflow-hidden shadow-inner">
        <div ref={containerRef} className="w-full relative">
          <svg ref={svgRef} className="w-full overflow-visible" />

          {/* D3 Hover Tooltip */}
          <AnimatePresence>
            {hoveredBin && tooltipPos && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                style={{
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                  transform: 'translate(-50%, -100%)'
                }}
                className="absolute pointer-events-none z-30 bg-zinc-950/95 border border-zinc-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[220px]"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span className="font-mono font-extrabold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    {hoveredBin.periodLabel}
                  </span>
                  {hoveredBin.isHighActivitySpike && (
                    <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px] font-mono font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-current" />
                      {t('HOTSPOT', 'SPIKE')}
                    </span>
                  )}
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-zinc-300">
                    <span>{t('Total Bevisfrekvens:', 'Total Evidence Count:')}</span>
                    <span className="font-bold text-white">{hoveredBin.totalCount}</span>
                  </div>
                  {hoveredBin.criticalCount > 0 && (
                    <div className="flex justify-between text-red-400 font-bold">
                      <span>🔴 {t('Kritiske Sagsakter:', 'Critical Files:')}</span>
                      <span>{hoveredBin.criticalCount}</span>
                    </div>
                  )}
                  {hoveredBin.documentCount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>📄 {t('Skriftlige Akter:', 'Documents:')}</span>
                      <span>{hoveredBin.documentCount}</span>
                    </div>
                  )}
                  {hoveredBin.audioCount > 0 && (
                    <div className="flex justify-between text-cyan-400">
                      <span>🎙️ {t('Mødelyd / Optagelser:', 'Audio Recordings:')}</span>
                      <span>{hoveredBin.audioCount}</span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-zinc-400 italic pt-1 border-t border-zinc-800/80">
                  {t('Klik for at gennemse alle akter i denne periode', 'Click bar to inspect all items in this period')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Time Bin / High-Activity Period Inspection Drawer */}
      <AnimatePresence>
        {selectedBin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {t('Valgt Tidsinterval:', 'Selected Time Window:')} {selectedBin.periodLabel}
                  </span>
                  {selectedBin.isHighActivitySpike && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      {t('Højaktivitets Bølge', 'High Activity Surge')}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white">
                  {selectedBin.items.length} {t('registrerede bevisposter og sagsakter', 'registered evidence entries and case files')}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {onAskAIWithPeriod && (
                  <button
                    type="button"
                    onClick={() => handleConsultHotspotAI(selectedBin)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{t('Analyser Periode med AI', 'Analyze Period with AI')}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedBin(null)}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Evidence items list for this selected bin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {selectedBin.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">{item.dateStr}</span>
                      <span
                        className={`px-2 py-0.2 rounded-full font-bold uppercase ${
                          item.significance === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : item.significance === 'noteworthy'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item.significance}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-100 line-clamp-2">{item.title}</h4>

                    {item.summary && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      {item.category}
                    </span>

                    {item.sourceDocId && onSelectDocument && (
                      <button
                        type="button"
                        onClick={() => {
                          const doc = documents.find((d) => d.id === item.sourceDocId);
                          if (doc) onSelectDocument(doc);
                        }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{t('Åbn Akt', 'Open Doc')}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
