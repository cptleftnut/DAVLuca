import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  ArrowRight,
  Sliders,
  Eye,
  Activity,
  Compass,
  Download,
  Share2,
  CheckCircle2,
  X,
  Play,
  Route,
  Target,
  Network,
  Calendar,
  AlertCircle,
  HelpCircle,
  FileSearch,
  Radio,
  CornerDownRight
} from 'lucide-react';
import { Party, DocumentFinding, TranscriptSnippet, SeriousClaim } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export type EntityType = 'individual' | 'organization';

export interface ConnectionNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  entityType: EntityType;
  role: string;
  category: 'Family' | 'Social Services' | 'Experts & FABU' | 'Court & Officials' | 'School & Health' | 'Corporate & Logistics';
  organization: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  avatar?: string;
  mentionCount: number;
  documentIds: string[];
  transcriptIds: string[];
  claimIds: string[];
  // D3 force coordinates
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface ConnectionLink extends d3.SimulationLinkDatum<ConnectionNode> {
  id: string;
  source: string | ConnectionNode;
  target: string | ConnectionNode;
  relationshipType: 'institutional' | 'document_cooccurrence' | 'family' | 'observation' | 'conflict' | 'legal' | 'administrative';
  labelDa: string;
  labelEn: string;
  weight: number; // 1-15
  sharedDocumentIds: string[];
  details: string;
  firstMentionDate?: string;
}

interface ConnectionMapperProps {
  parties: Party[];
  documents?: DocumentFinding[];
  transcripts?: TranscriptSnippet[];
  claims?: SeriousClaim[];
  onSelectParty?: (partyId: string) => void;
  onSelectDocument?: (doc: DocumentFinding | string) => void;
  onOpenLiveTranscriber?: () => void;
  onAskAiAboutEntity?: (entityName: string) => void;
}

// Color and icon palette for node clusters
export const CLUSTER_THEMES: Record<string, { bg: string; border: string; text: string; glow: string; labelDa: string; labelEn: string; icon: any }> = {
  'Family': {
    bg: '#059669', // emerald
    border: '#34d399',
    text: '#a7f3d0',
    glow: 'rgba(16, 185, 129, 0.35)',
    labelDa: 'Familie & Børn',
    labelEn: 'Family & Children',
    icon: HeartHandshake
  },
  'Social Services': {
    bg: '#2563eb', // blue
    border: '#60a5fa',
    text: '#bfdbfe',
    glow: 'rgba(37, 99, 235, 0.35)',
    labelDa: 'Kommunal Forvaltning',
    labelEn: 'Municipal Social Services',
    icon: Building
  },
  'Experts & FABU': {
    bg: '#7c3aed', // violet
    border: '#a78bfa',
    text: '#ddd6fe',
    glow: 'rgba(124, 58, 237, 0.35)',
    labelDa: 'FABU & Børnesagkyndige',
    labelEn: 'FABU & Experts',
    icon: GraduationCap
  },
  'Court & Officials': {
    bg: '#d97706', // amber
    border: '#fbbf24',
    text: '#fef3c7',
    glow: 'rgba(217, 119, 6, 0.35)',
    labelDa: 'Domstol & Tilsyn',
    labelEn: 'Court & Oversight',
    icon: Scale
  },
  'School & Health': {
    bg: '#db2777', // pink
    border: '#f472b6',
    text: '#fce7f3',
    glow: 'rgba(219, 39, 119, 0.35)',
    labelDa: 'Skole & Sundhedsvæsen',
    labelEn: 'School & Healthcare',
    icon: Activity
  },
  'Corporate & Logistics': {
    bg: '#475569', // slate
    border: '#94a3b8',
    text: '#e2e8f0',
    glow: 'rgba(71, 85, 105, 0.35)',
    labelDa: 'Virksomheder & Finans',
    labelEn: 'Corporate & Finance',
    icon: Layers
  }
};

export const RELATION_COLORS: Record<string, { stroke: string; labelDa: string; labelEn: string; dash?: string }> = {
  family: { stroke: '#10b981', labelDa: 'Familiær relation', labelEn: 'Family Relation' },
  institutional: { stroke: '#6366f1', labelDa: 'Institutionel tilknytning', labelEn: 'Institutional Affiliation' },
  observation: { stroke: '#a855f7', labelDa: 'FABU Samværsobservation', labelEn: 'Supervised Visitation' },
  conflict: { stroke: '#ef4444', labelDa: 'Konflikt / Uoverensstemmelse', labelEn: 'Adversarial Conflict', dash: '5,4' },
  legal: { stroke: '#f59e0b', labelDa: 'Retslig / Domstolsbehandling', labelEn: 'Legal / Custody Proceedings' },
  administrative: { stroke: '#38bdf8', labelDa: 'Forvaltningsmæssig sagsgang', labelEn: 'Administrative Casework' },
  document_cooccurrence: { stroke: '#64748b', labelDa: 'Dokumentsammenfald', labelEn: 'Document Co-occurrence' }
};

export function ConnectionMapper({
  parties,
  documents = [],
  transcripts = [],
  claims = [],
  onSelectParty,
  onSelectDocument,
  onOpenLiveTranscriber,
  onAskAiAboutEntity
}: ConnectionMapperProps) {
  const { language, t } = useLanguage();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active state & filters
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('p-luca');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [entityTypeFilter, setEntityTypeFilter] = useState<'all' | 'individual' | 'organization'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minWeightFilter, setMinWeightFilter] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPhysicsActive, setIsPhysicsActive] = useState(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isEgoView, setIsEgoView] = useState(false); // Focus on selected node's neighborhood only

  // Pathfinder state (finding connections between 2 entities)
  const [pathfinderMode, setPathfinderMode] = useState(false);
  const [pathSourceId, setPathSourceId] = useState<string>('p-dav');
  const [pathTargetId, setPathTargetId] = useState<string>('org-ltk');

  // Force simulation parameters
  const [chargeStrength, setChargeStrength] = useState<number>(-420);
  const [linkDistance, setLinkDistance] = useState<number>(140);
  const [collisionRadius, setCollisionRadius] = useState<number>(40);

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<ConnectionNode, ConnectionLink> | null>(null);

  // 1. DYNAMICALLY EXTRACT ALL INDIVIDUALS AND ORGANIZATIONS FROM PARTIES & IMPORTED DOCUMENTS
  const { allNodes, allLinks } = useMemo(() => {
    const nodeMap = new Map<string, ConnectionNode>();
    const linkMap = new Map<string, ConnectionLink>();

    // Helper: Determine category from entity name and role
    const getCategory = (name: string, role: string, org: string): ConnectionNode['category'] => {
      const lower = `${name} ${role} ${org}`.toLowerCase();
      if (lower.includes('luca') || lower.includes('liam') || lower.includes('dav') || lower.includes('dennis') || lower.includes('louise') || lower.includes('familie') || lower.includes('far') || lower.includes('mor') || lower.includes('barn')) {
        return 'Family';
      }
      if (lower.includes('kommune') || lower.includes('sagsbehandler') || lower.includes('marsha') || lower.includes('mette') || lower.includes('ulla') || lower.includes('forvaltning') || lower.includes('børn og unge') || lower.includes('socialforvaltning')) {
        return 'Social Services';
      }
      if (lower.includes('fabu') || lower.includes('amalie') || lower.includes('rikke') || lower.includes('konsulent') || lower.includes('børnesagkyndig') || lower.includes('observation') || lower.includes('samvær')) {
        return 'Experts & FABU';
      }
      if (lower.includes('ret') || lower.includes('byret') || lower.includes('dommer') || lower.includes('advokat') || lower.includes('tilsyn') || lower.includes('ankestyrelse') || lower.includes('politi')) {
        return 'Court & Officials';
      }
      if (lower.includes('skole') || lower.includes('lærer') || lower.includes('sundhed') || lower.includes('læge') || lower.includes('hospital') || lower.includes('børnehave') || lower.includes('daginstitution')) {
        return 'School & Health';
      }
      return 'Corporate & Logistics';
    };

    // A. Add Parties (Individuals & Organizations)
    parties.forEach(p => {
      const isOrg = p.name.toLowerCase().includes('kommune') || 
                    p.name.toLowerCase().includes('fabu') || 
                    p.name.toLowerCase().includes('ret') || 
                    p.name.toLowerCase().includes('skole') || 
                    p.name.toLowerCase().includes('hospital') ||
                    p.name.toLowerCase().includes('center') ||
                    p.name.toLowerCase().includes('logistics') ||
                    p.organization === p.name;

      const nodeCategory = getCategory(p.name, p.role, p.organization || '');
      
      nodeMap.set(p.id, {
        id: p.id,
        name: p.name,
        entityType: isOrg ? 'organization' : 'individual',
        role: p.role,
        category: nodeCategory,
        organization: p.organization || 'Sagsforankret',
        riskLevel: (p.riskLevel as ConnectionNode['riskLevel']) || 'medium',
        notes: p.notes,
        avatar: p.avatar,
        mentionCount: p.signalCount || 1,
        documentIds: [],
        transcriptIds: [],
        claimIds: []
      });
    });

    // Known Key Organizations to ensure are explicitly mapped in the graph
    const coreOrganizations = [
      {
        id: 'org-ltk',
        name: 'Lyngby-Taarbæk Kommune (Center for Børn og Unge)',
        role: 'Kommunal Myndighed & Forvaltning',
        category: 'Social Services' as const,
        organization: 'Lyngby-Taarbæk Kommune',
        riskLevel: 'high' as const,
        notes: 'Ansvarlig forvaltningsmyndighed for børnesagen, handleplaner, § 52 undersøgelser og samværsafgørelser.'
      },
      {
        id: 'org-fabu',
        name: 'FABU (Foreningen Børns Trivsel & Udvikling)',
        role: 'Børnesagkyndig Observationsinstans',
        category: 'Experts & FABU' as const,
        organization: 'FABU Ekstern Konsulent',
        riskLevel: 'low' as const,
        notes: 'Uafhængig børnesagkyndig observation af samvær mellem far og barn i perioden 2022-2026. Entydigt positive vurderinger.'
      },
      {
        id: 'org-familieret',
        name: 'Retten i Lyngby / Familieretten',
        role: 'Retslig Instans for Forældremyndighed & Samvær',
        category: 'Court & Officials' as const,
        organization: 'Danmarks Domstole',
        riskLevel: 'medium' as const,
        notes: 'Behandler retsakter vedrørende forældremyndighed, samværsfastsættelse og bopæl.'
      },
      {
        id: 'org-skole',
        name: 'Skolen ved Søerne & Daginstitution',
        role: 'Uddannelses- & Dagtilbudsinstitution',
        category: 'School & Health' as const,
        organization: 'Kommunal Skoleforvaltning',
        riskLevel: 'low' as const,
        notes: 'Følger barnets daglige trivsel og afgiver underretninger og pædagogiske statusudtalelser.'
      },
      {
        id: 'org-tilsyn',
        name: 'Det Sociale Tilsyn & Ankestyrelsen',
        role: 'Klageret & Forvaltningsmæssigt Tilsyn',
        category: 'Court & Officials' as const,
        organization: 'Ankestyrelsen',
        riskLevel: 'medium' as const,
        notes: 'Modtager formelle forvaltningsklager over sagsbehandlingsfejl og manglende notatpligt.'
      },
      {
        id: 'org-politi',
        name: 'Nordsjællands Politi',
        role: 'Politimyndighed & Efterforskning',
        category: 'Court & Officials' as const,
        organization: 'Rigspolitiet',
        riskLevel: 'medium' as const,
        notes: 'Involveret i henvendelser vedrørende anmeldelser og konfliktoptrapninger.'
      }
    ];

    coreOrganizations.forEach(org => {
      if (!nodeMap.has(org.id)) {
        nodeMap.set(org.id, {
          id: org.id,
          name: org.name,
          entityType: 'organization',
          role: org.role,
          category: org.category,
          organization: org.organization,
          riskLevel: org.riskLevel,
          notes: org.notes,
          mentionCount: 14,
          documentIds: [],
          transcriptIds: [],
          claimIds: []
        });
      }
    });

    // B. Parse Documents and link mentioned entities / co-occurrences
    documents.forEach(doc => {
      const docText = `${doc.title} ${doc.author} ${doc.summary} ${doc.excerpt} ${doc.fullContent || ''}`.toLowerCase();
      const matchedNodeIdsInDoc: string[] = [];

      nodeMap.forEach((node, nodeId) => {
        const nameTerms = node.name.toLowerCase().split(/[\s,]+/);
        const firstName = nameTerms[0];
        
        let isMentioned = false;
        if (doc.partiesInvolved && (doc.partiesInvolved.includes(nodeId) || doc.partiesInvolved.includes(node.name))) {
          isMentioned = true;
        } else if (firstName.length >= 3 && docText.includes(firstName)) {
          isMentioned = true;
        } else if (docText.includes(node.name.toLowerCase())) {
          isMentioned = true;
        }

        if (isMentioned) {
          matchedNodeIdsInDoc.push(nodeId);
          if (!node.documentIds.includes(doc.id)) {
            node.documentIds.push(doc.id);
            node.mentionCount += 1;
          }
        }
      });

      // Also connect to organizations based on author / category
      if (docText.includes('fabu') && nodeMap.has('org-fabu')) {
        matchedNodeIdsInDoc.push('org-fabu');
        if (!nodeMap.get('org-fabu')!.documentIds.includes(doc.id)) {
          nodeMap.get('org-fabu')!.documentIds.push(doc.id);
        }
      }
      if ((docText.includes('kommune') || docText.includes('sagsbehandler') || docText.includes('børn og unge')) && nodeMap.has('org-ltk')) {
        matchedNodeIdsInDoc.push('org-ltk');
        if (!nodeMap.get('org-ltk')!.documentIds.includes(doc.id)) {
          nodeMap.get('org-ltk')!.documentIds.push(doc.id);
        }
      }
      if ((docText.includes('byret') || docText.includes('familieret') || docText.includes('retsbog')) && nodeMap.has('org-familieret')) {
        matchedNodeIdsInDoc.push('org-familieret');
        if (!nodeMap.get('org-familieret')!.documentIds.includes(doc.id)) {
          nodeMap.get('org-familieret')!.documentIds.push(doc.id);
        }
      }
      if ((docText.includes('skole') || docText.includes('pædagog') || docText.includes('institution')) && nodeMap.has('org-skole')) {
        matchedNodeIdsInDoc.push('org-skole');
        if (!nodeMap.get('org-skole')!.documentIds.includes(doc.id)) {
          nodeMap.get('org-skole')!.documentIds.push(doc.id);
        }
      }
      if ((docText.includes('politi') || docText.includes('anmeldelse')) && nodeMap.has('org-politi')) {
        matchedNodeIdsInDoc.push('org-politi');
        if (!nodeMap.get('org-politi')!.documentIds.includes(doc.id)) {
          nodeMap.get('org-politi')!.documentIds.push(doc.id);
        }
      }

      // Build co-occurrence links between all pairs in this document
      const uniqueMatched = Array.from(new Set(matchedNodeIdsInDoc));
      for (let i = 0; i < uniqueMatched.length; i++) {
        for (let j = i + 1; j < uniqueMatched.length; j++) {
          const idA = uniqueMatched[i];
          const idB = uniqueMatched[j];
          const linkKey = [idA, idB].sort().join('__');

          if (!linkMap.has(linkKey)) {
            const nodeA = nodeMap.get(idA)!;
            const nodeB = nodeMap.get(idB)!;
            
            // Determine relationship nature
            let relType: ConnectionLink['relationshipType'] = 'document_cooccurrence';
            let labelDa = 'Dokumentsammenhæng';
            let labelEn = 'Document Co-occurrence';

            if (nodeA.entityType === 'organization' || nodeB.entityType === 'organization') {
              relType = 'institutional';
              labelDa = 'Forvaltningsmæssig Tilknytning';
              labelEn = 'Institutional Affiliation';
            } else if (nodeA.category === 'Family' && nodeB.category === 'Family') {
              relType = 'family';
              labelDa = 'Familiær Relation';
              labelEn = 'Family Relation';
            } else if (nodeA.category === 'Experts & FABU' || nodeB.category === 'Experts & FABU') {
              relType = 'observation';
              labelDa = 'FABU Samværsobservation';
              labelEn = 'Supervised Visitation';
            }

            linkMap.set(linkKey, {
              id: `link-${linkKey}`,
              source: idA,
              target: idB,
              relationshipType: relType,
              labelDa,
              labelEn,
              weight: 2,
              sharedDocumentIds: [doc.id],
              details: `Optræder i fællesskab i ${doc.docNumber || doc.title}.`,
              firstMentionDate: doc.date
            });
          } else {
            const existing = linkMap.get(linkKey)!;
            if (!existing.sharedDocumentIds.includes(doc.id)) {
              existing.sharedDocumentIds.push(doc.id);
              existing.weight = Math.min(15, existing.weight + 1);
            }
          }
        }
      }
    });

    // C. Institutional Hierarchy Links (Linking Caseworkers to LTK, Consultants to FABU, etc.)
    const addExplicitLink = (
      src: string,
      tgt: string,
      type: ConnectionLink['relationshipType'],
      labelDa: string,
      labelEn: string,
      weight: number,
      details: string
    ) => {
      if (!nodeMap.has(src) || !nodeMap.has(tgt)) return;
      const key = [src, tgt].sort().join('__');
      if (linkMap.has(key)) {
        const link = linkMap.get(key)!;
        link.weight = Math.max(link.weight, weight);
        link.relationshipType = type;
        link.labelDa = labelDa;
        link.labelEn = labelEn;
        link.details = details;
      } else {
        linkMap.set(key, {
          id: `link-${key}`,
          source: src,
          target: tgt,
          relationshipType: type,
          labelDa,
          labelEn,
          weight,
          sharedDocumentIds: [],
          details
        });
      }
    };

    // Link Caseworkers to Municipality
    addExplicitLink('p-marsha', 'org-ltk', 'institutional', 'Ansat Sagsbehandler', 'Employed Caseworker', 9, 'Marsha er primær kommunal sagsbehandler i Lyngby-Taarbæk Kommune.');
    addExplicitLink('p-mette', 'org-ltk', 'institutional', 'Ansat Sagsbehandler', 'Employed Caseworker', 8, 'Mette indgår i det kommunale sagsbehandlerteam for sagen.');
    addExplicitLink('p-ulla', 'org-ltk', 'institutional', 'Ledende Børne- og Ungechef', 'Head of Child Welfare', 8, 'Overordnet ledelsesansvar for forvaltningens afgørelser.');

    // Link Consultants to FABU
    addExplicitLink('p-amalie-rikke', 'org-fabu', 'institutional', 'Børnesagkyndige Konsulenter', 'Child Welfare Specialists', 9, 'Amalie & Rikke udfører samværsobservationer for FABU.');
    addExplicitLink('p-fabu', 'org-fabu', 'institutional', 'FABU Konsulentstab', 'FABU Staff', 9, 'Institutionel forankring hos Foreningen Børns Trivsel & Udvikling.');

    // Link Core Family Relations
    addExplicitLink('p-dav', 'p-luca', 'family', 'Far-Søn Samvær & Støttet Forløb', 'Father-Son Visitation', 12, 'Gennemgående forælder-barn samvær med FABU observation.');
    addExplicitLink('p-dav', 'p-liam', 'family', 'Far-Søn / Børnesamtaler', 'Father-Son Accounts', 9, 'Optagede samtaler og tryghedsrelation.');
    addExplicitLink('p-luca', 'p-liam', 'family', 'Brødre i Børnesagen', 'Brothers in Welfare Case', 8, 'Fælles familiebånd og sagsakter.');
    addExplicitLink('p-dennis', 'p-louise', 'family', 'Hjemlig Bopælsrelation', 'Domestic Residence Relation', 7, 'Bopælsrelation og fælles hjem.');

    // Link Conflicts and Observations
    addExplicitLink('p-dav', 'p-dennis', 'conflict', 'Adversarial Konflikt / Politi', 'Adversarial Conflict / Police', 9, 'Lydoptagede uoverensstemmelser, trusler om politi og modstridende forklaringer.');
    addExplicitLink('p-dav', 'p-marsha', 'administrative', 'Sagsbehandling & Afgørelser', 'Casework Decisions', 10, 'Formelle møder, afgørelser om støttet samvær og klagesager.');
    addExplicitLink('p-fabu', 'p-luca', 'observation', 'Overvåget Samværsobservation', 'Supervised Visitation', 11, 'Gennemgående positive observationer af Lucas trivsel hos far.');
    addExplicitLink('p-luca', 'org-ltk', 'administrative', 'Børnefaglig Sag & Handleplan', 'Child Welfare Case', 10, 'Kommunens administrative sag vedrørende Lucas trivsel.');
    addExplicitLink('p-dav', 'org-familieret', 'legal', 'Forældremyndigheds- & Samværssag', 'Custody & Visitation Case', 9, 'Behandling af samværs- og bopælssag i Familieretten.');
    addExplicitLink('p-dennis', 'org-politi', 'legal', 'Politianmeldelser & Henvendelser', 'Police Reports', 7, 'Dokumenterede henvendelser og anmeldelser mod far.');

    // D. Link Transcripts & Claims
    transcripts.forEach(tr => {
      nodeMap.forEach(node => {
        if (tr.speaker && tr.speaker.toLowerCase().includes(node.name.toLowerCase().split(' ')[0])) {
          if (!node.transcriptIds.includes(tr.id)) {
            node.transcriptIds.push(tr.id);
          }
        }
      });
    });

    claims.forEach(cl => {
      nodeMap.forEach(node => {
        if ((cl.claimant && cl.claimant.includes(node.name)) || (cl.targetParty && cl.targetParty.includes(node.name))) {
          if (!node.claimIds.includes(cl.id)) {
            node.claimIds.push(cl.id);
          }
        }
      });
    });

    return {
      allNodes: Array.from(nodeMap.values()),
      allLinks: Array.from(linkMap.values())
    };
  }, [parties, documents, transcripts, claims]);

  // 2. Shortest Path Finder (BFS Dijkstra) for Pathfinder Mode
  const shortestPathInfo = useMemo(() => {
    if (!pathfinderMode || !pathSourceId || !pathTargetId || pathSourceId === pathTargetId) {
      return { pathNodeIds: new Set<string>(), pathLinkIds: new Set<string>(), steps: [] };
    }

    // Build adjacency graph
    const adj = new Map<string, { neighbor: string; linkId: string; weight: number }[]>();
    allNodes.forEach(n => adj.set(n.id, []));

    allLinks.forEach(l => {
      const src = typeof l.source === 'object' ? (l.source as ConnectionNode).id : (l.source as string);
      const tgt = typeof l.target === 'object' ? (l.target as ConnectionNode).id : (l.target as string);
      if (adj.has(src) && adj.has(tgt)) {
        adj.get(src)!.push({ neighbor: tgt, linkId: l.id, weight: l.weight });
        adj.get(tgt)!.push({ neighbor: src, linkId: l.id, weight: l.weight });
      }
    });

    // BFS Queue
    const queue: { current: string; path: string[]; linkPath: string[] }[] = [
      { current: pathSourceId, path: [pathSourceId], linkPath: [] }
    ];
    const visited = new Set<string>([pathSourceId]);

    while (queue.length > 0) {
      const { current, path, linkPath } = queue.shift()!;
      if (current === pathTargetId) {
        return {
          pathNodeIds: new Set(path),
          pathLinkIds: new Set(linkPath),
          steps: path
        };
      }

      const neighbors = adj.get(current) || [];
      for (const edge of neighbors) {
        if (!visited.has(edge.neighbor)) {
          visited.add(edge.neighbor);
          queue.push({
            current: edge.neighbor,
            path: [...path, edge.neighbor],
            linkPath: [...linkPath, edge.linkId]
          });
        }
      }
    }

    return { pathNodeIds: new Set<string>(), pathLinkIds: new Set<string>(), steps: [] };
  }, [pathfinderMode, pathSourceId, pathTargetId, allNodes, allLinks]);

  // 3. Filter Nodes & Links based on Search, Entity Type, Category, Ego-View and Weight
  const filteredData = useMemo(() => {
    let nodes = allNodes.filter(n => {
      if (entityTypeFilter !== 'all' && n.entityType !== entityTypeFilter) return false;
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = n.name.toLowerCase().includes(query);
        const matchesRole = n.role.toLowerCase().includes(query);
        const matchesOrg = n.organization.toLowerCase().includes(query);
        if (!matchesName && !matchesRole && !matchesOrg) return false;
      }
      return true;
    });

    // If Ego-View is active, only retain selected node and its direct neighbors
    if (isEgoView && selectedNodeId) {
      const egoNeighbors = new Set<string>([selectedNodeId]);
      allLinks.forEach(link => {
        const srcId = typeof link.source === 'object' ? (link.source as ConnectionNode).id : (link.source as string);
        const tgtId = typeof link.target === 'object' ? (link.target as ConnectionNode).id : (link.target as string);
        if (srcId === selectedNodeId) egoNeighbors.add(tgtId);
        if (tgtId === selectedNodeId) egoNeighbors.add(srcId);
      });
      nodes = nodes.filter(n => egoNeighbors.has(n.id));
    }

    // If Pathfinder mode is active, ensure path nodes are kept
    if (pathfinderMode && shortestPathInfo.pathNodeIds.size > 0) {
      // Keep nodes
    }

    const activeNodeIds = new Set(nodes.map(n => n.id));

    let links = allLinks.filter(link => {
      const srcId = typeof link.source === 'object' ? (link.source as ConnectionNode).id : (link.source as string);
      const tgtId = typeof link.target === 'object' ? (link.target as ConnectionNode).id : (link.target as string);
      if (!activeNodeIds.has(srcId) || !activeNodeIds.has(tgtId)) return false;
      if (link.weight < minWeightFilter) return false;
      return true;
    });

    return { nodes, links };
  }, [allNodes, allLinks, entityTypeFilter, categoryFilter, searchTerm, minWeightFilter, isEgoView, selectedNodeId, pathfinderMode, shortestPathInfo]);

  // 4. Selected Node Context
  const selectedNode = useMemo(() => {
    return allNodes.find(n => n.id === selectedNodeId) || null;
  }, [allNodes, selectedNodeId]);

  // Connected Neighbors for Selected Node
  const connectedNeighbors = useMemo(() => {
    if (!selectedNodeId) return [];
    const neighborMap = new Map<string, { node: ConnectionNode; link: ConnectionLink }>();
    
    allLinks.forEach(link => {
      const srcId = typeof link.source === 'object' ? (link.source as ConnectionNode).id : (link.source as string);
      const tgtId = typeof link.target === 'object' ? (link.target as ConnectionNode).id : (link.target as string);

      if (srcId === selectedNodeId) {
        const neighbor = allNodes.find(n => n.id === tgtId);
        if (neighbor) neighborMap.set(tgtId, { node: neighbor, link });
      } else if (tgtId === selectedNodeId) {
        const neighbor = allNodes.find(n => n.id === srcId);
        if (neighbor) neighborMap.set(srcId, { node: neighbor, link });
      }
    });

    return Array.from(neighborMap.values());
  }, [selectedNodeId, allLinks, allNodes]);

  // Associated Documents for Selected Node
  const selectedNodeDocuments = useMemo(() => {
    if (!selectedNode) return [];
    return documents.filter(d => 
      selectedNode.documentIds.includes(d.id) ||
      (d.partiesInvolved && (d.partiesInvolved.includes(selectedNode.id) || d.partiesInvolved.includes(selectedNode.name))) ||
      d.title.toLowerCase().includes(selectedNode.name.toLowerCase().split(' ')[0]) ||
      d.author.toLowerCase().includes(selectedNode.name.toLowerCase().split(' ')[0])
    );
  }, [selectedNode, documents]);

  // Selected Link details (if a link is clicked)
  const selectedLink = useMemo(() => {
    if (!selectedLinkId) return null;
    return allLinks.find(l => l.id === selectedLinkId) || null;
  }, [selectedLinkId, allLinks]);

  // 5. D3 Force Simulation Setup
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = isFullscreen ? window.innerHeight - 180 : 640;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Defs: Gradients, Markers and Glow Filters
    const defs = svg.append('defs');

    // Arrow markers for directed links
    defs.append('marker')
      .attr('id', 'arrow-end')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6366f1');

    // Glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4.5')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Pathfinder High-contrast Neon Filter
    const pathFilter = defs.append('filter')
      .attr('id', 'path-glow')
      .attr('x', '-60%')
      .attr('y', '-60%')
      .attr('width', '220%')
      .attr('height', '220%');
    pathFilter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'coloredBlur');
    const pathMerge = pathFilter.append('feMerge');
    pathMerge.append('feMergeNode').attr('in', 'coloredBlur');
    pathMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Main Graph Container
    const g = svg.append('g').attr('class', 'graph-main');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4.0])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Simulation Data Copies
    const nodesCopy: ConnectionNode[] = filteredData.nodes.map(d => ({ ...d }));
    const linksCopy: ConnectionLink[] = filteredData.links.map(d => ({ ...d }));

    // D3 Force Simulation
    const simulation = d3.forceSimulation<ConnectionNode, ConnectionLink>(nodesCopy)
      .force('link', d3.forceLink<ConnectionNode, ConnectionLink>(linksCopy)
        .id(d => d.id)
        .distance(linkDistance)
        .strength(0.65)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(collisionRadius).strength(0.75))
      .alphaDecay(0.025);

    simulationRef.current = simulation;

    if (!isPhysicsActive) {
      simulation.stop();
    }

    // Draw Links
    const linkGroup = g.append('g').attr('class', 'links');
    const linkLines = linkGroup.selectAll('.link-line')
      .data(linksCopy)
      .enter()
      .append('line')
      .attr('class', 'link-line')
      .attr('stroke', d => {
        if (pathfinderMode && shortestPathInfo.pathLinkIds.has(d.id)) {
          return '#38bdf8'; // neon cyan on shortest path
        }
        const relConfig = RELATION_COLORS[d.relationshipType] || RELATION_COLORS.document_cooccurrence;
        return relConfig.stroke;
      })
      .attr('stroke-opacity', d => {
        if (pathfinderMode && shortestPathInfo.pathLinkIds.size > 0) {
          return shortestPathInfo.pathLinkIds.has(d.id) ? 1 : 0.15;
        }
        if (hoveredNodeId) {
          const srcId = typeof d.source === 'object' ? (d.source as ConnectionNode).id : (d.source as string);
          const tgtId = typeof d.target === 'object' ? (d.target as ConnectionNode).id : (d.target as string);
          return srcId === hoveredNodeId || tgtId === hoveredNodeId ? 1 : 0.2;
        }
        return d.id === selectedLinkId ? 1 : 0.6;
      })
      .attr('stroke-width', d => {
        if (pathfinderMode && shortestPathInfo.pathLinkIds.has(d.id)) {
          return 5;
        }
        return Math.max(1.8, Math.min(6, d.weight * 0.75));
      })
      .attr('stroke-dasharray', d => {
        if (d.relationshipType === 'conflict') return '5,4';
        return 'none';
      })
      .attr('filter', d => pathfinderMode && shortestPathInfo.pathLinkIds.has(d.id) ? 'url(#path-glow)' : 'none')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedLinkId(d.id);
      })
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', Math.max(4, d.weight * 0.9));
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .attr('stroke-opacity', 0.6)
          .attr('stroke-width', Math.max(1.8, Math.min(6, d.weight * 0.75)));
      });

    // Draw Link Labels (Pills on Links with high weight or shared documents)
    const linkLabels = linkGroup.selectAll('.link-label-group')
      .data(linksCopy.filter(l => l.weight >= 4 || l.sharedDocumentIds.length > 0 || (pathfinderMode && shortestPathInfo.pathLinkIds.has(l.id))))
      .enter()
      .append('g')
      .attr('class', 'link-label-group')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedLinkId(d.id);
      });

    linkLabels.append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', '#090d16')
      .attr('stroke', d => pathfinderMode && shortestPathInfo.pathLinkIds.has(d.id) ? '#38bdf8' : '#334155')
      .attr('stroke-width', 1)
      .attr('height', 16)
      .attr('width', d => (language === 'da' ? d.labelDa : d.labelEn).length * 6.2 + 20)
      .attr('transform', 'translate(-24, -8)');

    linkLabels.append('text')
      .attr('fill', d => pathfinderMode && shortestPathInfo.pathLinkIds.has(d.id) ? '#38bdf8' : '#cbd5e1')
      .attr('font-size', '9px')
      .attr('font-family', 'ui-monospace, monospace')
      .attr('font-weight', '500')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .text(d => language === 'da' ? d.labelDa : d.labelEn);

    // Draw Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup.selectAll('.node-element')
      .data(nodesCopy)
      .enter()
      .append('g')
      .attr('class', 'node-element')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, ConnectionNode>()
          .on('start', (event, d) => {
            if (!event.active && isPhysicsActive) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active && isPhysicsActive) simulation.alphaTarget(0);
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        setSelectedLinkId(null);
        if (onSelectParty && d.id.startsWith('p-')) {
          onSelectParty(d.id);
        }
      })
      .on('mouseenter', (event, d) => {
        setHoveredNodeId(d.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      });

    // Node Shape: Circle for Individuals, Rect/Pill for Organizations
    nodeElements.each(function(d) {
      const nodeSel = d3.select(this);
      const theme = CLUSTER_THEMES[d.category] || CLUSTER_THEMES['Corporate & Logistics'];
      const isSelected = d.id === selectedNodeId;
      const isPathMember = pathfinderMode && shortestPathInfo.pathNodeIds.has(d.id);
      const isIndividual = d.entityType === 'individual';
      const baseRadius = Math.max(18, Math.min(32, 16 + (d.mentionCount * 1.8)));

      if (isIndividual) {
        // Outer glow on selected or pathfinder highlight
        if (isSelected || isPathMember) {
          nodeSel.append('circle')
            .attr('r', baseRadius + 8)
            .attr('fill', 'none')
            .attr('stroke', isPathMember ? '#38bdf8' : theme.border)
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray', isSelected ? '4,3' : 'none')
            .attr('filter', isPathMember ? 'url(#path-glow)' : 'url(#node-glow)');
        }

        // Main circle
        nodeSel.append('circle')
          .attr('r', baseRadius)
          .attr('fill', isPathMember ? '#0284c7' : theme.bg)
          .attr('stroke', isSelected || isPathMember ? '#ffffff' : theme.border)
          .attr('stroke-width', isSelected || isPathMember ? 3 : 2)
          .attr('filter', isSelected ? 'url(#node-glow)' : 'none');

        // Initials / Icon symbol
        const initials = d.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        nodeSel.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', 5)
          .attr('fill', '#ffffff')
          .attr('font-size', `${Math.max(10, baseRadius * 0.55)}px`)
          .attr('font-weight', 'bold')
          .text(initials);
      } else {
        // Organization: Rounded Box / Pill
        const boxWidth = Math.max(48, Math.min(78, 42 + (d.mentionCount * 2.4)));
        const boxHeight = Math.max(34, Math.min(50, 30 + (d.mentionCount * 1.4)));

        if (isSelected || isPathMember) {
          nodeSel.append('rect')
            .attr('x', -(boxWidth + 10) / 2)
            .attr('y', -(boxHeight + 10) / 2)
            .attr('width', boxWidth + 10)
            .attr('height', boxHeight + 10)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', 'none')
            .attr('stroke', isPathMember ? '#38bdf8' : theme.border)
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray', isSelected ? '4,3' : 'none')
            .attr('filter', isPathMember ? 'url(#path-glow)' : 'url(#node-glow)');
        }

        nodeSel.append('rect')
          .attr('x', -boxWidth / 2)
          .attr('y', -boxHeight / 2)
          .attr('width', boxWidth)
          .attr('height', boxHeight)
          .attr('rx', 6)
          .attr('ry', 6)
          .attr('fill', isPathMember ? '#0284c7' : theme.bg)
          .attr('stroke', isSelected || isPathMember ? '#ffffff' : theme.border)
          .attr('stroke-width', isSelected || isPathMember ? 3 : 2)
          .attr('filter', isSelected ? 'url(#node-glow)' : 'none');

        const orgShort = d.name.includes('Lyngby') ? 'LTK' :
                         d.name.includes('FABU') ? 'FABU' :
                         d.name.includes('Ret') ? 'RET' :
                         d.name.includes('Skole') ? 'SKOLE' :
                         d.name.includes('Politi') ? 'POLITI' :
                         d.name.includes('Tilsyn') ? 'TILSYN' : 'ORG';

        nodeSel.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', 4)
          .attr('fill', '#ffffff')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .text(orgShort);
      }

      // Node Name Label under node with outline for contrast
      nodeSel.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', isIndividual ? baseRadius + 16 : 28)
        .attr('fill', isSelected || isPathMember ? '#ffffff' : '#cbd5e1')
        .attr('font-size', isSelected ? '12px' : '11px')
        .attr('font-weight', isSelected || isPathMember ? 'bold' : 'normal')
        .attr('paint-order', 'stroke')
        .attr('stroke', '#020617')
        .attr('stroke-width', 3.5)
        .attr('stroke-linejoin', 'round')
        .text(d.name.length > 22 ? d.name.substring(0, 20) + '...' : d.name);

      // Badge for document count
      if (d.mentionCount > 1) {
        nodeSel.append('circle')
          .attr('cx', isIndividual ? baseRadius * 0.7 : 22)
          .attr('cy', isIndividual ? -baseRadius * 0.7 : -16)
          .attr('r', 8.5)
          .attr('fill', '#6366f1')
          .attr('stroke', '#090d16')
          .attr('stroke-width', 1.5);

        nodeSel.append('text')
          .attr('x', isIndividual ? baseRadius * 0.7 : 22)
          .attr('y', isIndividual ? -baseRadius * 0.7 + 3.5 : -12.5)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '9px')
          .attr('font-family', 'ui-monospace, monospace')
          .attr('font-weight', 'bold')
          .text(d.mentionCount);
      }
    });

    // Tick Animation
    simulation.on('tick', () => {
      linkLines
        .attr('x1', d => (d.source as ConnectionNode).x || 0)
        .attr('y1', d => (d.source as ConnectionNode).y || 0)
        .attr('x2', d => (d.target as ConnectionNode).x || 0)
        .attr('y2', d => (d.target as ConnectionNode).y || 0);

      linkLabels.attr('transform', d => {
        const x = (((d.source as ConnectionNode).x || 0) + ((d.target as ConnectionNode).x || 0)) / 2;
        const y = (((d.source as ConnectionNode).y || 0) + ((d.target as ConnectionNode).y || 0)) / 2;
        return `translate(${x}, ${y})`;
      });

      nodeElements.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    // Center Graph Initially
    const initialTransform = d3.zoomIdentity.translate(0, 0).scale(1);
    svg.call(zoom.transform, initialTransform);

    return () => {
      simulation.stop();
    };
  }, [
    filteredData,
    selectedNodeId,
    selectedLinkId,
    hoveredNodeId,
    language,
    isFullscreen,
    isPhysicsActive,
    chargeStrength,
    linkDistance,
    collisionRadius,
    pathfinderMode,
    shortestPathInfo,
    onSelectParty
  ]);

  // Zoom control helpers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  // Center on Selected Node
  const handleFocusSelectedNode = () => {
    if (!svgRef.current || !zoomBehaviorRef.current || !selectedNode) return;
    const width = containerRef.current?.clientWidth || 900;
    const height = isFullscreen ? window.innerHeight - 180 : 640;
    const x = selectedNode.x || width / 2;
    const y = selectedNode.y || height / 2;
    const transform = d3.zoomIdentity.translate(width / 2 - x * 1.5, height / 2 - y * 1.5).scale(1.5);
    d3.select(svgRef.current).transition().duration(500).call(zoomBehaviorRef.current.transform, transform);
  };

  return (
    <div className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all ${isFullscreen ? 'fixed inset-4 z-50 bg-slate-950/98' : 'w-full'}`}>
      {/* Top Header & Investigation Bar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {t('Forbindelseskortlægger & Relationsgraf (D3)', 'Connection Mapper & Force Graph (D3)')}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                {filteredData.nodes.length} {t('Enheder', 'Entities')} | {filteredData.links.length} {t('Relationer', 'Links')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t(
                'Udvinder og visualiserer alle personer, myndigheder og institutioner omtalt på tværs af de importerede sagsakter.',
                'Visualizes all individuals and organizations mentioned across imported case files with D3 force physics.'
              )}
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Pathfinder mode toggle */}
          <button
            onClick={() => setPathfinderMode(!pathfinderMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ${
              pathfinderMode ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={t('Find korteste bevisvej mellem to enheder', 'Find shortest evidence path between two entities')}
          >
            <Route className="w-3.5 h-3.5" />
            <span>{t('Stifinder (Pathfinder)', 'Pathfinder Mode')}</span>
          </button>

          {/* Ego Network Toggle */}
          <button
            onClick={() => setIsEgoView(!isEgoView)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ${
              isEgoView ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={t('Isoler valgte enheds direkte naboer (Ego Network)', 'Isolate selected entity neighborhood')}
          >
            <Target className="w-3.5 h-3.5" />
            <span>{t('Isoler Nabolag', 'Isolate Neighbors')}</span>
          </button>

          {onOpenLiveTranscriber && (
            <button
              onClick={onOpenLiveTranscriber}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title={t('Start live interviewoptagelse og transskription', 'Start live interview recording and transcription')}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{t('Optag Nyt Interview', 'Record Interview')}</span>
            </button>
          )}

          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showSettingsDrawer ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={t('Fysik & Grafindstillinger', 'Physics & Graph Settings')}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? t('Luk fuld skærm', 'Exit Fullscreen') : t('Fuld skærm', 'Fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Pathfinder Controls (Conditional) */}
      {pathfinderMode && (
        <div className="p-3 bg-cyan-950/40 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-cyan-200">
              {t('Bevisstifinder (Korteste Rute):', 'Shortest Evidentiary Path:')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">{t('Fra (Kilde):', 'From (Source):')}</span>
              <select
                value={pathSourceId}
                onChange={(e) => setPathSourceId(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {allNodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.entityType === 'organization' ? 'Org' : 'Person'})</option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">{t('Til (Mål):', 'To (Target):')}</span>
              <select
                value={pathTargetId}
                onChange={(e) => setPathTargetId(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                {allNodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.entityType === 'organization' ? 'Org' : 'Person'})</option>
                ))}
              </select>
            </div>

            <div className="text-[11px] font-mono text-cyan-300 bg-cyan-900/50 px-2.5 py-1 rounded-lg border border-cyan-500/30">
              {shortestPathInfo.steps.length > 0 ? (
                <span>{shortestPathInfo.steps.length - 1} {t('led fundet', 'hops found')}</span>
              ) : (
                <span className="text-amber-400">{t('Ingen direkte vej fundet', 'No direct path found')}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('Søg i personer & organisationer...', 'Search individuals & orgs...')}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Entity Type Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setEntityTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              entityTypeFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('Alle Enheder', 'All Entities')}
          </button>
          <button
            onClick={() => setEntityTypeFilter('individual')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              entityTypeFilter === 'individual' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3 h-3" />
            <span>{t('Personer', 'Individuals')}</span>
          </button>
          <button
            onClick={() => setEntityTypeFilter('organization')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              entityTypeFilter === 'organization' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-3 h-3" />
            <span>{t('Organisationer & Myndigheder', 'Organizations')}</span>
          </button>
        </div>

        {/* Cluster / Category Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{t('Klynge:', 'Cluster:')}</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">{t('Alle Klynger', 'All Clusters')}</option>
            {Object.keys(CLUSTER_THEMES).map(catKey => (
              <option key={catKey} value={catKey}>
                {language === 'da' ? CLUSTER_THEMES[catKey].labelDa : CLUSTER_THEMES[catKey].labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Physics Settings Drawer (Conditional) */}
      {showSettingsDrawer && (
        <div className="p-4 bg-slate-950/90 border-b border-indigo-500/30 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs animate-in fade-in duration-200">
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>{t('Afstødning (Charge):', 'Repulsion (Charge):')}</span>
              <span className="font-mono text-indigo-400">{chargeStrength}</span>
            </div>
            <input
              type="range"
              min="-800"
              max="-100"
              step="20"
              value={chargeStrength}
              onChange={(e) => setChargeStrength(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>{t('Relationsafstand:', 'Link Distance:')}</span>
              <span className="font-mono text-indigo-400">{linkDistance}px</span>
            </div>
            <input
              type="range"
              min="60"
              max="250"
              step="10"
              value={linkDistance}
              onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>{t('Kollisionsradius:', 'Collision Radius:')}</span>
              <span className="font-mono text-indigo-400">{collisionRadius}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              step="5"
              value={collisionRadius}
              onChange={(e) => setCollisionRadius(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-end justify-between gap-2">
            <button
              onClick={() => setIsPhysicsActive(!isPhysicsActive)}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isPhysicsActive ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' : 'bg-amber-600/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isPhysicsActive ? t('Fysik Aktiv (Simulerer)', 'Physics Active') : t('Fysik Frossen', 'Physics Frozen')}</span>
            </button>

            <button
              onClick={() => {
                setChargeStrength(-420);
                setLinkDistance(140);
                setCollisionRadius(40);
                setIsPhysicsActive(true);
                handleResetZoom();
              }}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title={t('Nulstil alle parametre', 'Reset parameters')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas & Side Inspection Panel */}
      <div className="flex-1 flex flex-col lg:flex-row relative min-h-[550px]" ref={containerRef}>
        {/* SVG Canvas */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center">
          <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            style={{ height: isFullscreen ? 'calc(100vh - 180px)' : '580px' }}
          />

          {/* Floating Zoom & Centering Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl z-10">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={t('Zoom ind', 'Zoom in')}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={t('Zoom ud', 'Zoom out')}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title={t('Centrer visning', 'Center view')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {selectedNode && (
              <button
                onClick={handleFocusSelectedNode}
                className="p-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors cursor-pointer border border-indigo-500/30"
                title={t('Fokuser på valgt enhed', 'Focus on selected entity')}
              >
                <Target className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Floating Cluster Legend in Canvas */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl hidden sm:flex flex-col gap-2 z-10 text-[11px]">
            <span className="font-bold text-slate-300">{t('Farvekoder for Enhedsklynger:', 'Cluster Legend:')}</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {Object.keys(CLUSTER_THEMES).map(catKey => {
                const info = CLUSTER_THEMES[catKey];
                return (
                  <div key={catKey} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.bg }} />
                    <span className="text-slate-300">{language === 'da' ? info.labelDa : info.labelEn}</span>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> {t('Person (Cirkel)', 'Individual (Circle)')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2 rounded-xs bg-slate-400" /> {t('Organisation (Firkant)', 'Organization (Box)')}
              </span>
            </div>
          </div>
        </div>

        {/* Side Entity Inspection Panel or Link Details Panel */}
        {selectedLink ? (
          <aside className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col p-5 overflow-y-auto max-h-[580px] z-10 shrink-0">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                  {t('Forbindelsesdetaljer', 'Connection Details')}
                </span>
                <h3 className="font-bold text-white text-sm mt-0.5">
                  {language === 'da' ? selectedLink.labelDa : selectedLink.labelEn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLinkId(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 space-y-2">
              <div className="text-slate-400 text-[11px]">{t('Beskrivelse af relation:', 'Relationship Summary:')}</div>
              <p className="leading-relaxed">{selectedLink.details}</p>
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>{t('Fælles Sagsakter & Beviser', 'Shared Documents & Evidence')} ({selectedLink.sharedDocumentIds.length})</span>
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedLink.sharedDocumentIds.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">{t('Forankret via forvaltningsmæssig relation.', 'Established via institutional affiliation.')}</p>
                ) : (
                  selectedLink.sharedDocumentIds.map(docId => {
                    const doc = documents.find(d => d.id === docId);
                    if (!doc) return null;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => onSelectDocument && onSelectDocument(doc)}
                        className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all hover:border-indigo-500/50 group"
                      >
                        <div className="flex items-center justify-between text-[10px] text-indigo-400 font-mono">
                          <span>{doc.docNumber || doc.id}</span>
                          <span className="text-slate-400">{doc.date}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 line-clamp-1 mt-0.5">
                          {doc.title}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {doc.summary || doc.excerpt}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        ) : selectedNode ? (
          <aside className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col p-5 overflow-y-auto max-h-[580px] z-10 shrink-0">
            {/* Header with Avatar / Badge */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-lg shrink-0"
                  style={{ backgroundColor: CLUSTER_THEMES[selectedNode.category]?.bg || '#4f46e5' }}
                >
                  {selectedNode.entityType === 'organization' ? (
                    <Building className="w-6 h-6" />
                  ) : (
                    selectedNode.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">{selectedNode.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-indigo-500/30">
                      {selectedNode.entityType === 'organization' ? t('Organisation', 'Organization') : t('Person', 'Individual')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedNode.role}</p>
                </div>
              </div>
            </div>

            {/* Entity Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[11px] text-slate-400">{t('Tilknyttede Sagsakter', 'Linked Documents')}</div>
                <div className="text-base font-bold text-indigo-300 font-mono mt-0.5">
                  {selectedNodeDocuments.length}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[11px] text-slate-400">{t('Direkte Forbindelser', 'Direct Connections')}</div>
                <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">
                  {connectedNeighbors.length}
                </div>
              </div>
            </div>

            {/* Notes & Bio */}
            {selectedNode.notes && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200/90 leading-relaxed mb-4">
                <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>{t('Sagsbeskrivelse & Rolle', 'Case Context & Role')}</span>
                </div>
                {selectedNode.notes}
              </div>
            )}

            {/* Connected Entities List */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>{t('Forbundne Enheder & Institutioner', 'Connected Entities')} ({connectedNeighbors.length})</span>
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {connectedNeighbors.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">{t('Ingen direkte naboer med nuværende filter.', 'No direct neighbors.')}</p>
                ) : (
                  connectedNeighbors.map(({ node, link }) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="w-full p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/50 flex items-center justify-between text-xs transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: CLUSTER_THEMES[node.category]?.bg || '#94a3b8' }}
                        />
                        <div>
                          <div className="font-semibold text-slate-200 group-hover:text-indigo-300">
                            {node.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {language === 'da' ? link.labelDa : link.labelEn}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Linked Documents Accordion / List */}
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>{t('Omtalt i Sagsakter', 'Mentioned in Documents')} ({selectedNodeDocuments.length})</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedNodeDocuments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">{t('Ingen dokumenter fundet for denne enhed.', 'No documents found.')}</p>
                ) : (
                  selectedNodeDocuments.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => onSelectDocument && onSelectDocument(doc)}
                      className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all hover:border-indigo-500/50 group"
                    >
                      <div className="flex items-center justify-between gap-1 text-[10px] text-indigo-400 font-mono">
                        <span>{doc.docNumber || doc.id}</span>
                        <span className="text-slate-400">{doc.date}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 line-clamp-1 mt-0.5">
                        {doc.title}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {doc.summary || doc.excerpt}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{doc.author}</span>
                        <span className="text-indigo-400 flex items-center gap-0.5 group-hover:underline">
                          {t('Åbn sagsakt', 'Open document')} <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            {onAskAiAboutEntity && (
              <div className="pt-3 mt-3 border-t border-slate-800">
                <button
                  onClick={() => onAskAiAboutEntity(selectedNode.name)}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t(`Spørg AI om ${selectedNode.name.split(' ')[0]}`, `Ask AI about ${selectedNode.name.split(' ')[0]}`)}</span>
                </button>
              </div>
            )}
          </aside>
        ) : (
          <aside className="w-full lg:w-80 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
            <Info className="w-8 h-8 text-slate-600 mb-2" />
            <p>{t('Klik på en person eller organisation i grafen for at se relationer og sagsakter.', 'Click a node to inspect relationships and linked case documents.')}</p>
          </aside>
        )}
      </div>
    </div>
  );
}
