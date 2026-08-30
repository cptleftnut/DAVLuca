import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Users,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  FileText,
  Mic,
  ShieldAlert,
  Info,
  ExternalLink,
  ChevronRight,
  User,
  Building,
  Scale,
  HeartHandshake,
  GraduationCap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Party, DocumentFinding, TranscriptSnippet, SeriousClaim } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  role: string;
  category: 'Family' | 'Social Services' | 'Experts & FABU' | 'Court & Officials' | 'School & Other';
  organization: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  signalCount?: number;
  connectionsCount?: number;
  // d3 simulation positions
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  relationshipType: 'family' | 'administrative' | 'observation' | 'conflict' | 'legal' | 'therapy' | 'school' | 'complaint';
  labelDa: string;
  labelEn: string;
  weight: number; // 1-10
  details: string;
  documentsLinked?: string[];
}

interface PartyRelationshipGraphProps {
  parties: Party[];
  documents?: DocumentFinding[];
  transcripts?: TranscriptSnippet[];
  claims?: SeriousClaim[];
  onSelectParty?: (partyId: string) => void;
  onSelectDocument?: (docId: string) => void;
}

export function PartyRelationshipGraph({
  parties,
  documents = [],
  transcripts = [],
  claims = [],
  onSelectParty,
  onSelectDocument
}: PartyRelationshipGraphProps) {
  const { language, t } = useLanguage();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('p-luca');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPhysicsActive, setIsPhysicsActive] = useState(true);

  // Zoom reference to programmatically trigger zoom in/out/reset
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // 1. Build Categorized Nodes
  const rawNodes: GraphNode[] = useMemo(() => {
    const mapCategory = (p: Party): GraphNode['category'] => {
      const name = p.name.toLowerCase();
      const role = p.role.toLowerCase();
      const org = (p.organization || '').toLowerCase();

      if (name.includes('luca') || name.includes('liam') || name.includes('dav') || name.includes('dennis') || name.includes('louise')) {
        return 'Family';
      }
      if (name.includes('marsha') || name.includes('mette') || name.includes('ulla') || org.includes('kommune') || role.includes('sagsbehandler')) {
        return 'Social Services';
      }
      if (name.includes('fabu') || name.includes('amalie') || name.includes('rikke') || role.includes('konsulent') || role.includes('vejleder')) {
        return 'Experts & FABU';
      }
      if (name.includes('byret') || name.includes('dom') || name.includes('udvalg') || name.includes('borgmester') || role.includes('dommer')) {
        return 'Court & Officials';
      }
      return 'School & Other';
    };

    return parties.map(p => ({
      id: p.id,
      name: p.name,
      role: p.role,
      category: mapCategory(p),
      organization: p.organization,
      riskLevel: (p.riskLevel as GraphNode['riskLevel']) || 'medium',
      notes: p.notes,
      signalCount: p.signalCount || 10
    }));
  }, [parties]);

  // 2. Build Grounded Links between Parties
  const rawLinks: GraphLink[] = useMemo(() => {
    return [
      {
        id: 'link-dav-luca',
        source: 'p-dav',
        target: 'p-luca',
        relationshipType: 'family',
        labelDa: 'Far-Søn Samvær & Støttet Forløb',
        labelEn: 'Father-Son Visitation & Support',
        weight: 9,
        details: 'Gennemgående samværsrelation med løbende FABU-observationer (2022-2026).',
        documentsLinked: ['doc-fabu-2022', 'doc-fabu-2023-03', 'doc-fabu-2026-0330', 'doc-fabu-2026-0624']
      },
      {
        id: 'link-dav-liam',
        source: 'p-dav',
        target: 'p-liam',
        relationshipType: 'family',
        labelDa: 'Far-Søn / Optagede Børnesamtaler',
        labelEn: 'Father-Son / Recorded Child Accounts',
        weight: 8,
        details: 'Optagede samtaler (bl.a. 2. november 2025) om trivsel, tryghed og hjemlige forhold.',
        documentsLinked: ['tr-liam-01', 'doc-bilag-1-51']
      },
      {
        id: 'link-luca-liam',
        source: 'p-luca',
        target: 'p-liam',
        relationshipType: 'family',
        labelDa: 'Brødre i Børnefaglig Sag',
        labelEn: 'Brothers in Child Welfare Case',
        weight: 7,
        details: 'Fælles sagsgrundlag og familiemæssig tilknytning på tværs af kommunale undersøgelser.',
        documentsLinked: ['doc-handleplan-2023', 'doc-bilag-1-51']
      },
      {
        id: 'link-dav-dennis',
        source: 'p-dav',
        target: 'p-dennis',
        relationshipType: 'conflict',
        labelDa: 'Modpartsrelation / Trusler om Politi',
        labelEn: 'Adversarial / Police Threat Intercept',
        weight: 7,
        details: 'Lydoptagede konflikter og uoverensstemmelser vedrørende aflyste aftaler og overleveringer.',
        documentsLinked: ['tr-dennis-politi', 'doc-bilag-1-51']
      },
      {
        id: 'link-dennis-louise',
        source: 'p-dennis',
        target: 'p-louise',
        relationshipType: 'family',
        labelDa: 'Hjemlig Bopælsrelation',
        labelEn: 'Domestic Residence Relationship',
        weight: 5,
        details: 'Omtalt i børnefortællingerne vedrørende daglige rutiner og samspil.',
        documentsLinked: ['tr-liam-01']
      },
      {
        id: 'link-dav-marsha',
        source: 'p-dav',
        target: 'p-marsha',
        relationshipType: 'administrative',
        labelDa: 'Sagsbehandlerkontakt & Afgørelser',
        labelEn: 'Caseworker Supervision & Decisions',
        weight: 9,
        details: 'Møde d. 15. jan 2026, afgørelser om støttet samvær (feb/mar 2025) og klager.',
        documentsLinked: ['doc-marsha-afg-2025-02', 'doc-marsha-stottet-2025-03', 'tr-kommune-01', 'cl-01']
      },
      {
        id: 'link-marsha-mette',
        source: 'p-marsha',
        target: 'p-mette',
        relationshipType: 'administrative',
        labelDa: 'Kommunalt Sagsbehandlerteam',
        labelEn: 'Municipal Caseworker Team',
        weight: 7,
        details: 'Deltager sammen i møder med familien i Lyngby-Taarbæk Kommune.',
        documentsLinked: ['tr-kommune-01', 'doc-aktindsigt-2026-01']
      },
      {
        id: 'link-marsha-luca',
        source: 'p-marsha',
        target: 'p-luca',
        relationshipType: 'administrative',
        labelDa: 'Forvaltningsafgørelser & Børnesamtaler',
        labelEn: 'Administrative Rulings & Inquiries',
        weight: 8,
        details: 'Udarbejdelse af handleplaner, indstilling til B&U udvalg og samværsrammer.',
        documentsLinked: ['doc-handleplan-2023', 'doc-bu-afg-2026-0529']
      },
      {
        id: 'link-marsha-fabu',
        source: 'p-marsha',
        target: 'p-fabu',
        relationshipType: 'observation',
        labelDa: 'Rekvirering af Samværsrapporter',
        labelEn: 'Commissioning of Supervision Reports',
        weight: 8,
        details: 'Kommunens bestilling og anvendelse af FABU samværsudtalelser i sagsbehandlingen.',
        documentsLinked: ['doc-fabu-2022', 'doc-fabu-2026-0330', 'doc-marsha-stottet-2025-03']
      },
      {
        id: 'link-fabu-luca',
        source: 'p-fabu',
        target: 'p-luca',
        relationshipType: 'observation',
        labelDa: 'Overvåget & Støttet Samværsobservation',
        labelEn: 'Supervised Visitation Observation',
        weight: 10,
        details: 'Systematiske udtalelser om Lucas trivsel, tryghed og kontakt (2022-2026).',
        documentsLinked: ['doc-fabu-2022', 'doc-fabu-2023-03', 'doc-fabu-2023-09', 'doc-fabu-2026-0330', 'doc-fabu-2026-04', 'doc-fabu-2026-0624']
      },
      {
        id: 'link-fabu-dav',
        source: 'p-fabu',
        target: 'p-dav',
        relationshipType: 'observation',
        labelDa: 'Forældresamspil i Samværsrammen',
        labelEn: 'Parental Interaction in Visitation',
        weight: 8,
        details: 'Observationer af samværets forløb og forælder-barn interaktion i FABU lokaler.',
        documentsLinked: ['doc-fabu-2022', 'doc-fabu-2026-0624']
      },
      {
        id: 'link-dav-amalie-rikke',
        source: 'p-dav',
        target: 'p-amalie-rikke',
        relationshipType: 'therapy',
        labelDa: 'Familievejledningsforløb (31. jan 2025)',
        labelEn: 'Family Counseling Sessions',
        weight: 6,
        details: 'Vejledningssamtaler om trivsel, pædagogiske tiltag og samværsstruktur.',
        documentsLinked: ['tr-amalie-rikke-01']
      },
      {
        id: 'link-amalie-rikke-marsha',
        source: 'p-amalie-rikke',
        target: 'p-marsha',
        relationshipType: 'therapy',
        labelDa: 'Rapportering til Familieafdelingen',
        labelEn: 'Reporting to Social Services',
        weight: 5,
        details: 'Evaluering af familiebehandlingens forløb til brug for kommunens handleplan.',
        documentsLinked: ['doc-handleplan-2023']
      },
      {
        id: 'link-dav-byret',
        source: 'p-dav',
        target: 'p-byret',
        relationshipType: 'legal',
        labelDa: 'Part i Byretssag (Domsafsigelse 2024)',
        labelEn: 'Party to District Court Custody Ruling',
        weight: 7,
        details: 'Retssag ved Retten i Lyngby om forældremyndighed og samvær d. 15. juni 2024.',
        documentsLinked: ['doc-byret-dom']
      },
      {
        id: 'link-dennis-byret',
        source: 'p-dennis',
        target: 'p-byret',
        relationshipType: 'legal',
        labelDa: 'Modpart i Byretssag',
        labelEn: 'Adversary in Court Ruling',
        weight: 6,
        details: 'Formel partsrolle i retsbogsudskrift og byretsdom.',
        documentsLinked: ['doc-byret-dom']
      },
      {
        id: 'link-luca-byret',
        source: 'p-luca',
        target: 'p-byret',
        relationshipType: 'legal',
        labelDa: 'Genstand for Retsafgørelse',
        labelEn: 'Subject of Legal Custody Ruling',
        weight: 7,
        details: 'Rettens vurdering og fastsættelse af samværsrettigheder og bopæl.',
        documentsLinked: ['doc-byret-dom']
      },
      {
        id: 'link-marsha-bu-udvalg',
        source: 'p-marsha',
        target: 'p-bu-udvalg',
        relationshipType: 'administrative',
        labelDa: 'Indstilling til B&U Udvalg (29. maj 2026)',
        labelEn: 'Caseworker Recommendation to Board',
        weight: 8,
        details: 'Sagsfremstilling og indstilling til politisk afgørelse i udvalget.',
        documentsLinked: ['doc-bu-afg-2026-0529', 'cl-01']
      },
      {
        id: 'link-luca-bu-udvalg',
        source: 'p-luca',
        target: 'p-bu-udvalg',
        relationshipType: 'administrative',
        labelDa: 'Afgørelse om Tvangsforanstaltning',
        labelEn: 'Statutory Board Decision on Child',
        weight: 8,
        details: 'Afgørelse truffet af Børn- og Ungeudvalget på møde d. 29. maj 2026.',
        documentsLinked: ['doc-bu-afg-2026-0529']
      },
      {
        id: 'link-dav-borgmester',
        source: 'p-dav',
        target: 'p-borgmester-sofia',
        relationshipType: 'complaint',
        labelDa: 'Tilsynsklage til Borgmesterkontoret',
        labelEn: 'Formal Oversight Complaint to Mayor',
        weight: 5,
        details: 'Fremsendelse af klage over sagsbehandling og manglende tilsyn i familieafdelingen.',
        documentsLinked: ['doc-aktindsigt-2026-01']
      },
      {
        id: 'link-liam-skoleleder',
        source: 'p-liam',
        target: 'p-nordstjerne-michael',
        relationshipType: 'school',
        labelDa: 'Skolegang & Trivselsdialog',
        labelEn: 'Schooling & Well-Being Monitoring',
        weight: 7,
        details: 'Møde d. 18. november 2025 vedrørende Liams trivsel og observationer på Nordstjerneskolen.',
        documentsLinked: ['tr-nordstjerne-skole']
      },
      {
        id: 'link-dav-skoleleder',
        source: 'p-dav',
        target: 'p-nordstjerne-michael',
        relationshipType: 'school',
        labelDa: 'Skolemøde med Ledelsen',
        labelEn: 'School Leadership Meeting',
        weight: 5,
        details: 'Drøftelse af underretningspraksis og samarbejde med skolen.',
        documentsLinked: ['tr-nordstjerne-skole']
      },
      {
        id: 'link-ulla-dav',
        source: 'p-ulla',
        target: 'p-dav',
        relationshipType: 'administrative',
        labelDa: 'Tidligere Sagsforløb',
        labelEn: 'Former Casework History',
        weight: 4,
        details: 'Historisk sagsbehandling forud for overdragelse til nuværende rådgivere.',
        documentsLinked: ['doc-aktindsigt-2026-01']
      }
    ];
  }, []);

  // Filtered nodes and links based on category & search
  const { filteredNodes, filteredLinks } = useMemo(() => {
    // 1. Category filter
    let nodes = rawNodes;
    if (categoryFilter !== 'all') {
      nodes = nodes.filter(n => n.category === categoryFilter);
    }

    // 2. Search filter
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      nodes = nodes.filter(n =>
        n.name.toLowerCase().includes(lower) ||
        n.role.toLowerCase().includes(lower) ||
        n.organization.toLowerCase().includes(lower)
      );
    }

    const nodeIds = new Set(nodes.map(n => n.id));

    // Keep links where both ends are in filtered nodes
    const links = rawLinks.filter(l => {
      const sourceId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      const targetId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    // Count connections
    const connMap: Record<string, number> = {};
    rawLinks.forEach(l => {
      const sId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      connMap[sId] = (connMap[sId] || 0) + 1;
      connMap[tId] = (connMap[tId] || 0) + 1;
    });

    const enrichedNodes = nodes.map(n => ({
      ...n,
      connectionsCount: connMap[n.id] || 0
    }));

    return { filteredNodes: enrichedNodes, filteredLinks: links };
  }, [rawNodes, rawLinks, categoryFilter, searchTerm]);

  // Selected Node Details
  const selectedNode = useMemo(() => {
    return rawNodes.find(n => n.id === selectedNodeId) || null;
  }, [rawNodes, selectedNodeId]);

  // Selected Node Connected Links
  const selectedNodeLinks = useMemo(() => {
    if (!selectedNodeId) return [];
    return rawLinks.filter(l => {
      const sId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
      return sId === selectedNodeId || tId === selectedNodeId;
    });
  }, [rawLinks, selectedNodeId]);

  // Category Colors
  const getCategoryColor = (cat: GraphNode['category']) => {
    switch (cat) {
      case 'Family':
        return { fill: '#10b981', stroke: '#059669', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400' };
      case 'Social Services':
        return { fill: '#06b6d4', stroke: '#0891b2', bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-400' };
      case 'Experts & FABU':
        return { fill: '#8b5cf6', stroke: '#7c3aed', bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-400' };
      case 'Court & Officials':
        return { fill: '#f43f5e', stroke: '#e11d48', bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400' };
      case 'School & Other':
      default:
        return { fill: '#f59e0b', stroke: '#d97706', bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400' };
    }
  };

  const getLinkColor = (type: GraphLink['relationshipType']) => {
    switch (type) {
      case 'family': return '#10b981';
      case 'administrative': return '#06b6d4';
      case 'observation': return '#8b5cf6';
      case 'conflict': return '#ef4444';
      case 'legal': return '#f43f5e';
      case 'therapy': return '#6366f1';
      case 'school': return '#f59e0b';
      case 'complaint': return '#ec4899';
      default: return '#64748b';
    }
  };

  // D3 FORCE SIMULATION INITIALIZATION & LIFECYCLE
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 540;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Master Container Group for Zoom/Pan
    const g = svg.append('g').attr('class', 'network-main-group');

    // Setup Zoom & Pan Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Build Arrow Marker Definitions for Directed Interactions
    const defs = svg.append('defs');
    ['family', 'administrative', 'observation', 'conflict', 'legal', 'therapy', 'school', 'complaint'].forEach(type => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 26) // Distance from node center
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L8,0L0,4')
        .attr('fill', getLinkColor(type as GraphLink['relationshipType']))
        .attr('opacity', 0.85);
    });

    // Deep clone data for D3 mutation
    const simulationNodes: GraphNode[] = filteredNodes.map(d => ({ ...d }));
    const simulationLinks: GraphLink[] = filteredLinks.map(d => ({ ...d }));

    // Create D3 Force Simulation
    const simulation = d3.forceSimulation<GraphNode>(simulationNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(simulationLinks).id(d => d.id).distance(d => 140 - (d.weight * 4)).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(48).iterations(2));

    // 1. Draw Links (Lines)
    const linkGroup = g.append('g').attr('class', 'links-layer');
    const link = linkGroup.selectAll('line')
      .data(simulationLinks)
      .enter()
      .append('line')
      .attr('stroke', d => getLinkColor(d.relationshipType))
      .attr('stroke-width', d => Math.max(1.8, Math.min(5.5, d.weight * 0.55)))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', d => d.relationshipType === 'conflict' ? '4 3' : 'none')
      .attr('marker-end', d => `url(#arrow-${d.relationshipType})`)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredLinkId(d.id);
        d3.select(event.currentTarget).attr('stroke-opacity', 1).attr('stroke-width', 6);
      })
      .on('mouseleave', (event, d) => {
        setHoveredLinkId(null);
        d3.select(event.currentTarget)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', Math.max(1.8, Math.min(5.5, d.weight * 0.55)));
      });

    // 2. Draw Nodes (Groups)
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');
    const node = nodeGroup.selectAll('g')
      .data(simulationNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .attr('cursor', 'grab')
      .on('click', (event, d) => {
        setSelectedNodeId(d.id);
        if (onSelectParty) onSelectParty(d.id);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNodeId(d.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      });

    // Node Outer Pulse Ring for Critical / High Risk
    node.filter(d => d.riskLevel === 'critical' || d.riskLevel === 'high')
      .append('circle')
      .attr('r', d => (d.category === 'Family' ? 28 : 24))
      .attr('fill', 'none')
      .attr('stroke', d => d.riskLevel === 'critical' ? '#ef4444' : '#f59e0b')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.45)
      .attr('stroke-dasharray', '3 3')
      .attr('class', 'animate-pulse');

    // Main Circle Body
    node.append('circle')
      .attr('r', d => {
        if (d.id === 'p-luca' || d.id === 'p-dav' || d.id === 'p-marsha') return 24;
        return d.category === 'Family' ? 21 : 18;
      })
      .attr('fill', d => getCategoryColor(d.category).fill)
      .attr('fill-opacity', 0.9)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2.5)
      .attr('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))');

    // Inner Glyph / Initial Letter
    node.append('text')
      .text(d => d.name.substring(0, 2).toUpperCase())
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#ffffff')
      .attr('font-size', d => (d.id === 'p-luca' || d.id === 'p-dav' ? '12px' : '10px'))
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');

    // Node Label Text (Name Below)
    node.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('y', 36)
      .attr('fill', '#f1f5f9')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#090d16')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .attr('pointer-events', 'none');

    // Node Sub-Role Text
    node.append('text')
      .text(d => {
        const parts = d.role.split('/');
        return parts[0].trim();
      })
      .attr('text-anchor', 'middle')
      .attr('y', 48)
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#090d16')
      .attr('stroke-width', 2)
      .attr('pointer-events', 'none');

    // Drag behavior with D3
    const drag = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        // Release fixed position unless pinned
        if (isPhysicsActive) {
          d.fx = null;
          d.fy = null;
        }
      });

    node.call(drag);

    // Simulation Tick Updates
    simulation.on('tick', () => {
      link
        .attr('x1', d => (typeof d.source === 'object' ? (d.source as GraphNode).x || 0 : 0))
        .attr('y1', d => (typeof d.source === 'object' ? (d.source as GraphNode).y || 0 : 0))
        .attr('x2', d => (typeof d.target === 'object' ? (d.target as GraphNode).x || 0 : 0))
        .attr('y2', d => (typeof d.target === 'object' ? (d.target as GraphNode).y || 0 : 0));

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, isPhysicsActive]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.75);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  const categories = [
    { id: 'all', labelDa: 'Alle Grupper', labelEn: 'All Groups', icon: Layers, count: rawNodes.length },
    { id: 'Family', labelDa: 'Familie & Børn', labelEn: 'Family & Children', icon: HeartHandshake, count: rawNodes.filter(n => n.category === 'Family').length },
    { id: 'Social Services', labelDa: 'Kommunale Myndigheder', labelEn: 'Social Services', icon: Building, count: rawNodes.filter(n => n.category === 'Social Services').length },
    { id: 'Experts & FABU', labelDa: 'FABU & Konsulenter', labelEn: 'FABU & Experts', icon: Sparkles, count: rawNodes.filter(n => n.category === 'Experts & FABU').length },
    { id: 'Court & Officials', labelDa: 'Retten & Ledelse', labelEn: 'Court & Officials', icon: Scale, count: rawNodes.filter(n => n.category === 'Court & Officials').length }
  ];

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* Top Header & Interactive Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {t('Part- og Relationsnetværk (D3.js Interaktionsgraf)', 'Party Relationship & Interaction Network (D3.js)')}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  D3 Force Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t(
                  'Dynamisk kortlægning af relationer og interaktioner mellem Familie, Forvaltning, FABU og Retsinstanser.',
                  'Dynamic force-directed graph mapping relations across Family, Social Services, FABU, and Court officials.'
                )}
              </p>
            </div>
          </div>

          {/* Search and Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('Søg i aktører & roller...', 'Search parties & roles...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={handleZoomIn}
                title={t('Zoom Ind', 'Zoom In')}
                className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                title={t('Zoom Ud', 'Zoom Out')}
                className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title={t('Nulstil Visning', 'Reset View')}
                className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
              title={isFullscreen ? t('Luk Fuldskærm', 'Exit Fullscreen') : t('Fuldskærm', 'Fullscreen')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            {t('Kategori:', 'Category:')}
          </span>
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = categoryFilter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'da' ? c.labelDa : c.labelEn}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-700 text-slate-400'}`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Canvas & Side Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* D3 Interactive Graph Stage */}
        <div
          ref={containerRef}
          className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl relative overflow-hidden shadow-xl min-h-[540px] flex flex-col justify-between"
        >
          {/* Legend Overlay at Top Left */}
          <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md border border-slate-800/90 p-2.5 rounded-xl text-[11px] space-y-1.5 shadow-lg">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              {t('Aktørfarver', 'Node Legend')}
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Familie & Børn</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              <span>Kommunale Myndigheder</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              <span>FABU & Konsulenter</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Retten & B&U Udvalg</span>
            </div>
          </div>

          {/* D3 Canvas SVG */}
          <svg
            ref={svgRef}
            className="w-full h-[540px] block cursor-grab active:cursor-grabbing select-none"
          />

          {/* Canvas Bottom Quick Bar */}
          <div className="bg-slate-950/80 backdrop-blur border-t border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('Træk i noder for at flytte. Rul for at zoome. Klik for at inspicere aktør.', 'Drag nodes to arrange. Scroll to zoom. Click to inspect party.')}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span>{filteredNodes.length} {t('Aktører', 'Parties')}</span>
              <span>•</span>
              <span>{filteredLinks.length} {t('Interaktioner', 'Interactions')}</span>
            </div>
          </div>
        </div>

        {/* Party Detail & Evidence Inspector Sidebar */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          {selectedNode ? (
            <div className="space-y-4">
              {/* Header Profile Badge */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-lg ${getCategoryColor(selectedNode.category).bg} ${getCategoryColor(selectedNode.category).border} border`}>
                    <User className={`w-6 h-6 ${getCategoryColor(selectedNode.category).text}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{selectedNode.name}</h3>
                    <p className="text-xs text-slate-400">{selectedNode.role}</p>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(selectedNode.category).bg} ${getCategoryColor(selectedNode.category).border} ${getCategoryColor(selectedNode.category).text}`}>
                      {selectedNode.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                    selectedNode.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    selectedNode.riskLevel === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {selectedNode.riskLevel}
                  </span>
                </div>
              </div>

              {/* Organization & Case Notes */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">{t('Organisation / Tilknytning', 'Organization')}</span>
                  <p className="text-slate-200 font-medium">{selectedNode.organization || t('Privat / Sagspart', 'Private party')}</p>
                </div>

                {selectedNode.notes && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">{t('Efterforskningsnoter', 'Investigative Notes')}</span>
                    <p className="text-slate-300 leading-relaxed">{selectedNode.notes}</p>
                  </div>
                )}
              </div>

              {/* Direct Interactions & Relationships */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {t('Tilknyttede Relationer & Sagsakter', 'Direct Interactions')}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{selectedNodeLinks.length}</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedNodeLinks.length > 0 ? (
                    selectedNodeLinks.map((link) => {
                      const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
                      const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
                      const otherId = sourceId === selectedNode.id ? targetId : sourceId;
                      const otherNode = rawNodes.find(n => n.id === otherId);

                      return (
                        <div
                          key={link.id}
                          className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-xs space-y-1.5 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getLinkColor(link.relationshipType) }} />
                              {otherNode?.name || otherId}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {language === 'da' ? link.labelDa : link.labelEn}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 leading-tight">{link.details}</p>

                          {link.documentsLinked && link.documentsLinked.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              {link.documentsLinked.map((docId) => (
                                <button
                                  key={docId}
                                  onClick={() => onSelectDocument && onSelectDocument(docId)}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition-colors"
                                >
                                  <FileText className="w-2.5 h-2.5" />
                                  <span>{docId}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      {t('Ingen filtrerede forbindelser for denne aktør.', 'No active connections for this filter.')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <Users className="w-12 h-12 text-slate-700" />
              <p className="text-sm">{t('Vælg en aktør i grafen for at se relationer, sagsakter og dokumenterede interaktioner.', 'Select a party in the graph to view relationships, documents, and transcripts.')}</p>
            </div>
          )}

          {/* Bottom Callout */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>{t('Grounded i 28 sagsakter & 46 lydfiler', 'Grounded in 28 case records & 46 audio files')}</span>
            <span className="text-indigo-400 font-semibold font-mono">The Brew Method</span>
          </div>
        </div>
      </div>
    </div>
  );
}
