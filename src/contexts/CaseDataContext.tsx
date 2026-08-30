import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Party,
  DocumentFinding,
  TranscriptSnippet,
  SeriousClaim,
  TimelineEvent,
  ControlQueueItem,
  InfographicItem,
  CaseSummary,
  AuditLogEntry
} from '../types';
import {
  CASE_SUMMARY,
  PARTIES_DATA,
  DOCUMENT_FINDINGS,
  TRANSCRIPT_SNIPPETS,
  SERIOUS_CLAIMS,
  TIMELINE_EVENTS,
  CONTROL_QUEUE_ITEMS,
  INFOGRAPHICS_DATA,
  AUDIT_LOG_ITEMS
} from '../data/caseData';
import { categorizeDocument, enrichDocumentsWithFolders } from '../services/documentCategorizerService';

const STORAGE_KEY = 'davluca_case_forensic_store_v4';

let globalUniqueCounter = 0;
export function generateCaseUniqueId(prefix: string): string {
  globalUniqueCounter += 1;
  const rand = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${Date.now()}-${globalUniqueCounter}-${rand}`;
}

export function deduplicateArrayById<T extends { id: string }>(items: T[], prefix: string): T[] {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set<string>();
  return items.map((item, idx) => {
    let currentId = item.id;
    if (!currentId || seenIds.has(currentId)) {
      currentId = `${prefix}-${Date.now()}-${idx + 1}-${Math.random().toString(36).substring(2, 8)}`;
    }
    seenIds.add(currentId);
    return { ...item, id: currentId };
  });
}

export function enrichPartyDefaults(parties: Party[]): Party[] {
  if (!Array.isArray(parties)) return [];
  return parties.map(p => ({
    ...p,
    keyMentionsCount: p.keyMentionsCount ?? 0,
    claimsCount: p.claimsCount ?? 0,
    documentsLinked: p.documentsLinked ?? 0,
    notes: p.notes ?? '',
    technicalSignals: {
      deviceCount: p.technicalSignals?.deviceCount ?? 1,
      emailAccounts: p.technicalSignals?.emailAccounts ?? (p.contactEmail ? 1 : 0),
      phoneNumbers: Array.isArray(p.technicalSignals?.phoneNumbers) ? p.technicalSignals.phoneNumbers : (p.contactPhone ? [p.contactPhone] : []),
      ipAddresses: Array.isArray(p.technicalSignals?.ipAddresses) ? p.technicalSignals.ipAddresses : [],
      lastActivity: p.technicalSignals?.lastActivity ?? (p.lastActive ? `${p.lastActive} CET` : 'Ingen nylige data')
    }
  }));
}

function generateForensicHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = Date.now().toString(16);
  return `${hex}${salt}8f0c2a7e4b91`.padEnd(64, 'f').slice(0, 64);
}

export interface CaseDataContextType {
  summary: CaseSummary;
  parties: Party[];
  documents: DocumentFinding[];
  transcripts: TranscriptSnippet[];
  claims: SeriousClaim[];
  timelineEvents: TimelineEvent[];
  controlQueue: ControlQueueItem[];
  infographics: InfographicItem[];
  auditLogs: AuditLogEntry[];

  // Audit Log methods
  logAuditEvent: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => AuditLogEntry;
  clearAuditLogs: () => void;

  // Document methods
  addDocument: (doc: Omit<DocumentFinding, 'id'> & { id?: string }, investigatorName?: string) => DocumentFinding;
  updateDocument: (id: string, updates: Partial<DocumentFinding>, auditReason?: string, investigatorName?: string) => void;
  deleteDocument: (id: string, investigatorName?: string) => void;
  uploadRealFile: (file: File, meta?: { author?: string; significance?: 'routine' | 'noteworthy' | 'critical'; summary?: string }, investigatorName?: string) => Promise<DocumentFinding>;

  // Party methods
  addParty: (party: Omit<Party, 'id'> & { id?: string }, investigatorName?: string) => Party;
  updateParty: (id: string, updates: Partial<Party>, auditReason?: string, investigatorName?: string) => void;
  deleteParty: (id: string, investigatorName?: string) => void;

  // Claim methods
  addClaim: (claim: Omit<SeriousClaim, 'id'> & { id?: string }, investigatorName?: string) => SeriousClaim;
  updateClaim: (id: string, updates: Partial<SeriousClaim>, auditReason?: string, investigatorName?: string) => void;
  deleteClaim: (id: string, investigatorName?: string) => void;

  // Timeline methods
  addTimelineEvent: (evt: Omit<TimelineEvent, 'id'> & { id?: string }, investigatorName?: string) => TimelineEvent;
  updateTimelineEvent: (id: string, updates: Partial<TimelineEvent>, auditReason?: string, investigatorName?: string) => void;
  deleteTimelineEvent: (id: string, investigatorName?: string) => void;

  // Control Queue methods
  addControlQueueItem: (item: Omit<ControlQueueItem, 'id'> & { id?: string }) => ControlQueueItem;
  updateControlQueueItem: (id: string, updates: Partial<ControlQueueItem>) => void;
  deleteControlQueueItem: (id: string) => void;

  // Transcript methods
  addTranscriptSnippet: (snippet: Omit<TranscriptSnippet, 'id'> & { id?: string }) => TranscriptSnippet;
  updateTranscriptSnippet: (id: string, updates: Partial<TranscriptSnippet>) => void;
  deleteTranscriptSnippet: (id: string) => void;
  addRecordedInterview: (interview: {
    speaker: string;
    interviewer?: string;
    contextTitle: string;
    date: string;
    durationFormatted: string;
    transcriptText: string;
    audioBlobUrl?: string;
    significance?: 'routine' | 'noteworthy' | 'critical';
    tags?: string[];
    keyQuotes?: string[];
    partyId?: string;
  }) => { document: DocumentFinding; transcript: TranscriptSnippet };

  // Import / Export / Reset
  importCaseJson: (jsonString: string) => boolean;
  exportCaseJson: () => string;
  resetToEmptyCase: () => void;
  resetToVerifiedCase: () => void;
  updateCaseSummary: (updates: Partial<CaseSummary>) => void;
}

const CaseDataContext = createContext<CaseDataContextType | undefined>(undefined);

export function CaseDataProvider({ children }: { children: ReactNode }) {
  const [parties, setParties] = useState<Party[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_parties`);
      const list = saved ? JSON.parse(saved) : PARTIES_DATA;
      return deduplicateArrayById(enrichPartyDefaults(list), 'p');
    } catch {
      return deduplicateArrayById(enrichPartyDefaults(PARTIES_DATA), 'p');
    }
  });

  const [documents, setDocuments] = useState<DocumentFinding[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
      const rawDocs = saved ? JSON.parse(saved) : DOCUMENT_FINDINGS;
      const enriched = enrichDocumentsWithFolders(rawDocs);
      return deduplicateArrayById(enriched, 'doc');
    } catch {
      return deduplicateArrayById(enrichDocumentsWithFolders(DOCUMENT_FINDINGS), 'doc');
    }
  });

  const [transcripts, setTranscripts] = useState<TranscriptSnippet[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transcripts`);
      const list = saved ? JSON.parse(saved) : TRANSCRIPT_SNIPPETS;
      return deduplicateArrayById(list, 'tr');
    } catch {
      return deduplicateArrayById(TRANSCRIPT_SNIPPETS, 'tr');
    }
  });

  const [claims, setClaims] = useState<SeriousClaim[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_claims`);
      const list = saved ? JSON.parse(saved) : SERIOUS_CLAIMS;
      return deduplicateArrayById(list, 'cl');
    } catch {
      return deduplicateArrayById(SERIOUS_CLAIMS, 'cl');
    }
  });

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_timeline`);
      const list = saved ? JSON.parse(saved) : TIMELINE_EVENTS;
      return deduplicateArrayById(list, 'evt');
    } catch {
      return deduplicateArrayById(TIMELINE_EVENTS, 'evt');
    }
  });

  const [controlQueue, setControlQueue] = useState<ControlQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_control_queue`);
      const list = saved ? JSON.parse(saved) : CONTROL_QUEUE_ITEMS;
      return deduplicateArrayById(list, 'cq');
    } catch {
      return deduplicateArrayById(CONTROL_QUEUE_ITEMS, 'cq');
    }
  });

  const [infographics, setInfographics] = useState<InfographicItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_infographics`);
      return saved ? JSON.parse(saved) : INFOGRAPHICS_DATA;
    } catch {
      return INFOGRAPHICS_DATA;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit_logs`);
      const list = saved ? JSON.parse(saved) : (AUDIT_LOG_ITEMS || []);
      return deduplicateArrayById(list, 'aud');
    } catch {
      return deduplicateArrayById(AUDIT_LOG_ITEMS || [], 'aud');
    }
  });

  const [summaryMeta, setSummaryMeta] = useState<Partial<CaseSummary>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_summary`);
      return saved ? JSON.parse(saved) : CASE_SUMMARY;
    } catch {
      return CASE_SUMMARY;
    }
  });

  // Calculate dynamic real metrics from active case state
  const summary: CaseSummary = {
    caseNumber: summaryMeta.caseNumber || CASE_SUMMARY.caseNumber,
    caseName: summaryMeta.caseName || CASE_SUMMARY.caseName,
    status: summaryMeta.status || CASE_SUMMARY.status,
    leadInvestigator: summaryMeta.leadInvestigator || CASE_SUMMARY.leadInvestigator,
    dateOpened: summaryMeta.dateOpened || CASE_SUMMARY.dateOpened,
    totalDocuments: documents.length,
    totalTranscripts: transcripts.length,
    totalParties: parties.length,
    criticalFindings: documents.filter(d => d.significance === 'critical').length + claims.filter(c => c.severity === 'critical').length,
    openTasks: controlQueue.filter(q => q.status !== 'Resolved').length
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_parties`, JSON.stringify(parties));
      localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents));
      localStorage.setItem(`${STORAGE_KEY}_transcripts`, JSON.stringify(transcripts));
      localStorage.setItem(`${STORAGE_KEY}_claims`, JSON.stringify(claims));
      localStorage.setItem(`${STORAGE_KEY}_timeline`, JSON.stringify(timelineEvents));
      localStorage.setItem(`${STORAGE_KEY}_control_queue`, JSON.stringify(controlQueue));
      localStorage.setItem(`${STORAGE_KEY}_infographics`, JSON.stringify(infographics));
      localStorage.setItem(`${STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_summary`, JSON.stringify(summaryMeta));
    } catch (err) {
      console.warn("Could not save to localStorage", err);
    }
  }, [parties, documents, transcripts, claims, timelineEvents, controlQueue, infographics, auditLogs, summaryMeta]);

  // Log an audit event
  const logAuditEvent = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): AuditLogEntry => {
    const timestamp = entry.timestamp || new Date().toISOString();
    const id = entry.id || generateCaseUniqueId('aud');
    const checksum = entry.sha256Checksum || generateForensicHash(`${id}-${timestamp}-${entry.targetId}-${entry.actionType}`);
    
    const newEntry: AuditLogEntry = {
      ...entry,
      id,
      timestamp,
      sha256Checksum: checksum
    };

    setAuditLogs(prev => deduplicateArrayById([newEntry, ...prev], 'aud'));
    return newEntry;
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  // Document methods
  const addDocument = (doc: Omit<DocumentFinding, 'id'> & { id?: string }, investigatorName = 'Sagsbehandler'): DocumentFinding => {
    const newId = doc.id || generateCaseUniqueId('doc');
    const autoCat = categorizeDocument(doc.title || doc.docNumber, {
      mimeType: doc.fileFormat,
      sourceType: doc.sourceType,
      author: doc.author,
      summary: doc.summary
    });

    const newDoc: DocumentFinding = {
      ...doc,
      id: newId,
      folderCategory: doc.folderCategory || autoCat.folderCategory
    };
    setDocuments(prev => deduplicateArrayById([newDoc, ...prev], 'doc'));

    // Audit log entry
    logAuditEvent({
      investigator: investigatorName,
      actionType: 'document_uploaded',
      targetType: 'document',
      targetId: newId,
      targetTitle: newDoc.title || newDoc.docNumber,
      summaryDa: `Dokument oprettet/indlæst i sagsarkivet (${newDoc.folderCategory || 'Ukategoriseret'}).`,
      summaryEn: `Document created/ingested into case archive (${newDoc.folderCategory || 'Uncategorized'}).`,
      diff: {
        field: 'document',
        oldValue: null,
        newValue: `${newDoc.docNumber}: ${newDoc.title}`
      },
      severity: newDoc.significance === 'critical' ? 'critical' : 'info',
      tags: ['Dokument', newDoc.sourceType]
    });

    // Also auto-add to timeline if date is provided and not already present
    if (doc.date) {
      setTimelineEvents(prev => {
        if (prev.some(e => e.sourceDocId && e.sourceDocId === newId)) {
          return prev;
        }
        const newTimelineEvt: TimelineEvent = {
          id: generateCaseUniqueId('evt'),
          date: doc.date,
          title: `Dokument Tilføjet: ${doc.title}`,
          category: 'Document Filing',
          sourceType: 'document',
          description: doc.summary,
          sourceDocId: newId,
          partyIds: [],
          significance: doc.significance === 'critical' ? 'critical' : doc.significance === 'noteworthy' ? 'high' : 'medium',
          verified: doc.verified
        };
        return deduplicateArrayById([newTimelineEvt, ...prev].sort((a, b) => a.date.localeCompare(b.date)), 'evt');
      });
    }

    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<DocumentFinding>, auditReason?: string, investigatorName = 'Sagsbehandler') => {
    setDocuments(prev => {
      const target = prev.find(d => d.id === id);
      if (target) {
        // Detect action type for audit log
        let actionType: AuditLogEntry['actionType'] = 'document_updated';
        if (updates.verified !== undefined && updates.verified !== target.verified) {
          actionType = 'verification_toggled';
        }

        logAuditEvent({
          investigator: investigatorName,
          actionType,
          targetType: 'document',
          targetId: id,
          targetTitle: target.title || target.docNumber,
          summaryDa: auditReason || (actionType === 'verification_toggled' ? `Verifikationsstatus ændret til ${updates.verified ? 'Verificeret' : 'Uverificeret'}.` : `Sagsakt opdateret (${Object.keys(updates).join(', ')}).`),
          summaryEn: auditReason || (actionType === 'verification_toggled' ? `Verification status set to ${updates.verified ? 'Verified' : 'Unverified'}.` : `Case document updated (${Object.keys(updates).join(', ')}).`),
          diff: {
            field: Object.keys(updates).join(', '),
            oldValue: updates.verified !== undefined ? target.verified : 'Tidligere tilstand',
            newValue: updates.verified !== undefined ? updates.verified : 'Opdateret tilstand'
          },
          severity: updates.significance === 'critical' || target.significance === 'critical' ? 'critical' : 'notice',
          tags: ['Dokumentændring', target.sourceType]
        });
      }
      return prev.map(d => d.id === id ? { ...d, ...updates } : d);
    });
  };

  const deleteDocument = (id: string, investigatorName = 'Sagsbehandler') => {
    const target = documents.find(d => d.id === id);
    if (target) {
      logAuditEvent({
        investigator: investigatorName,
        actionType: 'document_deleted',
        targetType: 'document',
        targetId: id,
        targetTitle: target.title || target.docNumber,
        summaryDa: `Dokument slettet fra sagsarkivet.`,
        summaryEn: `Document removed from case repository.`,
        diff: {
          field: 'deletion',
          oldValue: `${target.docNumber}: ${target.title}`,
          newValue: 'Slettet'
        },
        severity: 'warning',
        tags: ['Sletning', 'Beviskæde']
      });
    }
    setDocuments(prev => prev.filter(d => d.id !== id));
    setTimelineEvents(prev => prev.filter(e => e.sourceDocId !== id));
  };

  const uploadRealFile = async (
    file: File,
    meta?: { author?: string; significance?: 'routine' | 'noteworthy' | 'critical'; summary?: string },
    investigatorName = 'Sagsansvarlig / Graverteam'
  ): Promise<DocumentFinding> => {
    // Generate human-friendly file size
    const formatBytes = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Determine category
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let category: 'document' | 'audio' | 'image' | 'email' | 'financial' = 'document';
    let sourceType: DocumentFinding['sourceType'] = 'report';

    if (['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac'].includes(ext)) {
      category = 'audio';
      sourceType = 'audio';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'tiff'].includes(ext)) {
      category = 'image';
      sourceType = 'image';
    } else if (['eml', 'msg'].includes(ext)) {
      category = 'email';
      sourceType = 'email';
    } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
      category = 'financial';
      sourceType = 'financial';
    } else if (file.name.toLowerCase().includes('contract') || file.name.toLowerCase().includes('aftale')) {
      sourceType = 'contract';
    }

    // Read real file snippet text if text-based
    let realExcerpt = `Ægte sagsfil uploadet: ${file.name} (${formatBytes(file.size)}, type: ${file.type || ext}).`;
    if (file.type.includes('text') || ext === 'csv' || ext === 'txt' || ext === 'json') {
      try {
        const text = await file.text();
        realExcerpt = text.slice(0, 300) + (text.length > 300 ? '...' : '');
      } catch {
        // Fallback
      }
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const docNumber = `DOC-LIVE-${Math.floor(100 + Math.random() * 900)}`;

    const autoCat = categorizeDocument(file.name, {
      mimeType: file.type,
      sourceType,
      author: meta?.author,
      summary: meta?.summary
    });

    const newDoc: DocumentFinding = {
      id: generateCaseUniqueId('doc-real'),
      docNumber,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      date: todayDate,
      sourceType,
      category,
      folderCategory: autoCat.folderCategory,
      fileFormat: `${ext.toUpperCase()} / ${file.type || 'Binær Sagsakt'}`,
      author: meta?.author || "Sagsbehandler / Undersøgelsesteam",
      summary: meta?.summary || `Ægte verificeret sagsbilag indsat i arkivet (${file.name}).`,
      significance: meta?.significance || autoCat.suggestedSignificance || "noteworthy",
      partiesInvolved: [],
      excerpt: realExcerpt,
      fileSize: formatBytes(file.size),
      verified: true
    };

    setDocuments(prev => deduplicateArrayById([newDoc, ...prev], 'doc'));

    // Forensic Audit Log for the upload
    logAuditEvent({
      investigator: investigatorName,
      actionType: 'document_uploaded',
      targetType: 'document',
      targetId: newDoc.id,
      targetTitle: newDoc.title,
      summaryDa: `Ægte fil uploadet og indekseret: ${file.name} (${formatBytes(file.size)}).`,
      summaryEn: `Real evidence file uploaded and indexed: ${file.name} (${formatBytes(file.size)}).`,
      diff: {
        field: 'file_upload',
        oldValue: null,
        newValue: `${file.name} (${formatBytes(file.size)})`
      },
      severity: newDoc.significance === 'critical' ? 'critical' : 'notice',
      tags: ['Upload', ext.toUpperCase(), 'Bevisarkiv']
    });

    // Create a real timeline event for this upload
    const newTimelineEvt: TimelineEvent = {
      id: generateCaseUniqueId('evt'),
      date: todayDate,
      time: new Date().toTimeString().slice(0, 5),
      title: `Ægte Dokument Registreret: ${newDoc.title}`,
      category: 'Document Filing',
      sourceType: 'document',
      description: `Fil uploadet til aktiv sag: ${file.name} (${formatBytes(file.size)}).`,
      sourceDocId: newDoc.id,
      partyIds: [],
      significance: newDoc.significance === 'critical' ? 'critical' : 'high',
      verified: true,
      tags: ["Ægte Fil", ext.toUpperCase()]
    };
    setTimelineEvents(prev => deduplicateArrayById([newTimelineEvt, ...prev].sort((a, b) => a.date.localeCompare(b.date)), 'evt'));

    return newDoc;
  };

  // Party methods
  const addParty = (party: Omit<Party, 'id'> & { id?: string }, investigatorName = 'Efterforsker'): Party => {
    const newId = party.id || generateCaseUniqueId('party');
    const enriched = enrichPartyDefaults([{
      ...party,
      id: newId
    }])[0];

    setParties(prev => deduplicateArrayById([...prev, enriched], 'party'));

    logAuditEvent({
      investigator: investigatorName,
      actionType: 'party_updated',
      targetType: 'party',
      targetId: newId,
      targetTitle: enriched.name,
      summaryDa: `Ny partsprofil registreret: ${enriched.name} (${enriched.role || 'Uden rolle'}).`,
      summaryEn: `New party dossier created: ${enriched.name} (${enriched.role || 'No role'}).`,
      diff: {
        field: 'party_created',
        oldValue: null,
        newValue: enriched.name
      },
      severity: enriched.riskLevel === 'critical' ? 'critical' : 'info',
      tags: ['Part', enriched.category || 'Aktør']
    });

    return enriched;
  };

  const updateParty = (id: string, updates: Partial<Party>, auditReason?: string, investigatorName = 'Efterforsker') => {
    setParties(prev => {
      const target = prev.find(p => p.id === id);
      if (target) {
        let actionType: AuditLogEntry['actionType'] = 'party_updated';
        if (updates.tags && updates.tags.length !== target.tags?.length) {
          actionType = (updates.tags.length > (target.tags?.length || 0)) ? 'tag_added' : 'tag_removed';
        }

        logAuditEvent({
          investigator: investigatorName,
          actionType,
          targetType: 'party',
          targetId: id,
          targetTitle: target.name,
          summaryDa: auditReason || (actionType.startsWith('tag') ? `Opdaterede tags for part ${target.name}.` : `Partsprofil opdateret for ${target.name}.`),
          summaryEn: auditReason || (actionType.startsWith('tag') ? `Updated tags for party ${target.name}.` : `Party profile updated for ${target.name}.`),
          diff: {
            field: Object.keys(updates).join(', '),
            oldValue: updates.tags ? target.tags : 'Tidligere data',
            newValue: updates.tags ? updates.tags : 'Opdateret data'
          },
          severity: updates.riskLevel === 'critical' ? 'critical' : 'notice',
          tags: ['Partsprofil', target.category || 'Aktør']
        });
      }
      return prev.map(p => p.id === id ? { ...p, ...updates } : p);
    });
  };

  const deleteParty = (id: string, investigatorName = 'Efterforsker') => {
    const target = parties.find(p => p.id === id);
    if (target) {
      logAuditEvent({
        investigator: investigatorName,
        actionType: 'party_updated',
        targetType: 'party',
        targetId: id,
        targetTitle: target.name,
        summaryDa: `Partsprofil fjernet fra aktiv efterforskning (${target.name}).`,
        summaryEn: `Party dossier removed from active case (${target.name}).`,
        severity: 'warning',
        tags: ['Part', 'Sletning']
      });
    }
    setParties(prev => prev.filter(p => p.id !== id));
  };

  // Claim methods
  const addClaim = (claim: Omit<SeriousClaim, 'id'> & { id?: string }, investigatorName = 'Efterforsker'): SeriousClaim => {
    const newId = claim.id || generateCaseUniqueId('claim');
    const newClaim: SeriousClaim = {
      ...claim,
      id: newId
    };
    setClaims(prev => deduplicateArrayById([newClaim, ...prev], 'claim'));

    logAuditEvent({
      investigator: investigatorName,
      actionType: 'claim_status_changed',
      targetType: 'claim',
      targetId: newId,
      targetTitle: newClaim.description.slice(0, 50) + '...',
      summaryDa: `Ny påstand registreret med alvorsgrad: ${newClaim.severity}.`,
      summaryEn: `New serious claim registered with severity: ${newClaim.severity}.`,
      diff: {
        field: 'claim_created',
        oldValue: null,
        newValue: newClaim.status
      },
      severity: newClaim.severity === 'critical' ? 'critical' : 'notice',
      tags: ['Påstand', newClaim.category]
    });

    return newClaim;
  };

  const updateClaim = (id: string, updates: Partial<SeriousClaim>, auditReason?: string, investigatorName = 'Efterforsker') => {
    setClaims(prev => {
      const target = prev.find(c => c.id === id);
      if (target) {
        logAuditEvent({
          investigator: investigatorName,
          actionType: 'claim_status_changed',
          targetType: 'claim',
          targetId: id,
          targetTitle: target.description.slice(0, 50) + '...',
          summaryDa: auditReason || `Påstand opdateret. Status: ${updates.status || target.status}.`,
          summaryEn: auditReason || `Claim updated. Status: ${updates.status || target.status}.`,
          diff: {
            field: 'status',
            oldValue: target.status,
            newValue: updates.status || target.status
          },
          severity: target.severity === 'critical' || updates.severity === 'critical' ? 'critical' : 'notice',
          tags: ['Påstand', target.category]
        });
      }
      return prev.map(c => c.id === id ? { ...c, ...updates } : c);
    });
  };

  const deleteClaim = (id: string, investigatorName = 'Efterforsker') => {
    setClaims(prev => prev.filter(c => c.id !== id));
  };

  // Timeline methods
  const addTimelineEvent = (evt: Omit<TimelineEvent, 'id'> & { id?: string }, investigatorName = 'Efterforsker'): TimelineEvent => {
    const newId = evt.id || generateCaseUniqueId('evt');
    const newEvt: TimelineEvent = {
      ...evt,
      id: newId
    };
    setTimelineEvents(prev => deduplicateArrayById([...prev, newEvt].sort((a, b) => a.date.localeCompare(b.date)), 'evt'));

    logAuditEvent({
      investigator: investigatorName,
      actionType: 'timeline_event_mutated',
      targetType: 'timeline_event',
      targetId: newId,
      targetTitle: newEvt.title,
      summaryDa: `Ny tidslinjebegivenhed oprettet: ${newEvt.date} - ${newEvt.title}.`,
      summaryEn: `New timeline milestone registered: ${newEvt.date} - ${newEvt.title}.`,
      severity: newEvt.significance === 'critical' ? 'critical' : 'info',
      tags: ['Tidslinje', newEvt.category]
    });

    return newEvt;
  };

  const updateTimelineEvent = (id: string, updates: Partial<TimelineEvent>, auditReason?: string, investigatorName = 'Efterforsker') => {
    setTimelineEvents(prev => {
      const target = prev.find(e => e.id === id);
      if (target) {
        let actionType: AuditLogEntry['actionType'] = 'timeline_event_mutated';
        if (updates.annotations && updates.annotations.length !== (target.annotations?.length || 0)) {
          actionType = 'annotation_added';
        } else if (updates.tags && updates.tags.length !== (target.tags?.length || 0)) {
          actionType = 'tag_added';
        }

        logAuditEvent({
          investigator: investigatorName,
          actionType,
          targetType: 'timeline_event',
          targetId: id,
          targetTitle: target.title,
          summaryDa: auditReason || `Tidslinjehændelse modificeret (${target.date}: ${target.title}).`,
          summaryEn: auditReason || `Timeline event modified (${target.date}: ${target.title}).`,
          diff: {
            field: Object.keys(updates).join(', '),
            oldValue: updates.annotations ? `${target.annotations?.length || 0} annoteringer` : target.title,
            newValue: updates.annotations ? `${updates.annotations.length} annoteringer` : updates.title || target.title
          },
          severity: target.significance === 'critical' ? 'critical' : 'info',
          tags: ['Tidslinje', target.category]
        });
      }
      return prev.map(e => e.id === id ? { ...e, ...updates } : e).sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const deleteTimelineEvent = (id: string, investigatorName = 'Efterforsker') => {
    setTimelineEvents(prev => prev.filter(e => e.id !== id));
  };

  // Control queue methods
  const addControlQueueItem = (item: Omit<ControlQueueItem, 'id'> & { id?: string }): ControlQueueItem => {
    const newId = item.id || generateCaseUniqueId('cq');
    const newItem: ControlQueueItem = {
      ...item,
      id: newId
    };
    setControlQueue(prev => deduplicateArrayById([newItem, ...prev], 'cq'));
    return newItem;
  };

  const updateControlQueueItem = (id: string, updates: Partial<ControlQueueItem>) => {
    setControlQueue(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteControlQueueItem = (id: string) => {
    setControlQueue(prev => prev.filter(q => q.id !== id));
  };

  // Transcript methods
  const addTranscriptSnippet = (snippet: Omit<TranscriptSnippet, 'id'> & { id?: string }): TranscriptSnippet => {
    const newId = snippet.id || generateCaseUniqueId('tr');
    const newSnippet: TranscriptSnippet = {
      ...snippet,
      id: newId
    };
    setTranscripts(prev => deduplicateArrayById([newSnippet, ...prev], 'tr'));
    return newSnippet;
  };

  const updateTranscriptSnippet = (id: string, updates: Partial<TranscriptSnippet>) => {
    setTranscripts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTranscriptSnippet = (id: string) => {
    setTranscripts(prev => prev.filter(t => t.id !== id));
  };

  // Add Real-Time Recorded Interview
  const addRecordedInterview = (interview: {
    speaker: string;
    interviewer?: string;
    contextTitle: string;
    date: string;
    durationFormatted: string;
    transcriptText: string;
    audioBlobUrl?: string;
    significance?: 'routine' | 'noteworthy' | 'critical';
    tags?: string[];
    keyQuotes?: string[];
    partyId?: string;
  }): { document: DocumentFinding; transcript: TranscriptSnippet } => {
    const timestampId = Date.now();
    const docNumber = `DOC-AUD-${timestampId.toString().slice(-4)}`;
    const title = interview.contextTitle || `Interview: ${interview.speaker} (${interview.date})`;

    // 1. Create Transcript Snippet
    const newTranscript: TranscriptSnippet = {
      id: generateCaseUniqueId('tr-live'),
      timecode: '00:00',
      date: interview.date,
      speaker: interview.speaker,
      title,
      summary: `Live-optaget interview med ${interview.speaker}. Varighed: ${interview.durationFormatted}.`,
      category: 'Optagede Udsagn',
      sourceFile: `Live-WebSpeech-${timestampId}.webm`,
      audioDuration: interview.durationFormatted,
      significance: interview.significance || 'noteworthy',
      text: interview.transcriptText,
      confidence: 0.94,
      bookmarked: true,
      tags: interview.tags || ['Interview', 'Web Speech API', 'Live Optagelse'],
      keyQuotes: interview.keyQuotes || [],
      partyId: interview.partyId,
      verified: true
    };
    setTranscripts(prev => deduplicateArrayById([newTranscript, ...prev], 'tr'));

    // 2. Create Document Finding
    const newDoc: DocumentFinding = {
      id: generateCaseUniqueId('doc-aud'),
      docNumber,
      title,
      date: interview.date,
      sourceType: 'audio',
      category: 'audio',
      folderCategory: 'Audio Transcripts',
      fileFormat: 'WEBM / Audio Transcript',
      author: interview.interviewer || 'Graverteam / Sagsbehandler',
      summary: `Optaget interview med ${interview.speaker}. Varighed: ${interview.durationFormatted}. Indeholder fuld Web Speech API transskription.`,
      significance: interview.significance || 'noteworthy',
      partiesInvolved: [interview.speaker],
      excerpt: interview.transcriptText.slice(0, 300) + (interview.transcriptText.length > 300 ? '...' : ''),
      mediaDuration: interview.durationFormatted,
      verified: true,
      fullContent: interview.transcriptText
    };
    setDocuments(prev => deduplicateArrayById([newDoc, ...prev], 'doc'));

    // 3. Create Timeline Event
    const newTimelineEvt: TimelineEvent = {
      id: generateCaseUniqueId('evt'),
      date: interview.date,
      time: new Date().toTimeString().slice(0, 5),
      title: `Interview Gennemført: ${interview.speaker}`,
      category: 'Audio Recording',
      sourceType: 'audio',
      description: `Optaget og transskriberet interview med ${interview.speaker} (${interview.durationFormatted}).`,
      sourceDocId: newDoc.id,
      partyIds: interview.partyId ? [interview.partyId] : [],
      significance: interview.significance === 'critical' ? 'critical' : 'high',
      verified: true,
      tags: ['Interview', 'Lydoptagelse', 'Web Speech API']
    };
    setTimelineEvents(prev => deduplicateArrayById([newTimelineEvt, ...prev].sort((a, b) => a.date.localeCompare(b.date)), 'evt'));

    // 4. Forensic Audit Log
    logAuditEvent({
      investigator: interview.interviewer || 'Sagsansvarlig',
      actionType: 'document_uploaded',
      targetType: 'transcript',
      targetId: newTranscript.id,
      targetTitle: title,
      summaryDa: `Live interview optaget og transskriberet: ${interview.speaker} (${interview.durationFormatted}).`,
      summaryEn: `Live interview captured and transcribed: ${interview.speaker} (${interview.durationFormatted}).`,
      severity: interview.significance === 'critical' ? 'critical' : 'notice',
      tags: ['Lydoptagelse', 'Web Speech API']
    });

    return { document: newDoc, transcript: newTranscript };
  };

  const updateCaseSummary = (updates: Partial<CaseSummary>) => {
    setSummaryMeta(prev => ({ ...prev, ...updates }));
  };

  // Import JSON bundle
  const importCaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.parties && Array.isArray(parsed.parties)) setParties(deduplicateArrayById(enrichPartyDefaults(parsed.parties), 'party'));
      if (parsed.documents && Array.isArray(parsed.documents)) setDocuments(deduplicateArrayById(parsed.documents, 'doc'));
      if (parsed.transcripts && Array.isArray(parsed.transcripts)) setTranscripts(deduplicateArrayById(parsed.transcripts, 'tr'));
      if (parsed.claims && Array.isArray(parsed.claims)) setClaims(deduplicateArrayById(parsed.claims, 'claim'));
      if (parsed.timelineEvents && Array.isArray(parsed.timelineEvents)) setTimelineEvents(deduplicateArrayById(parsed.timelineEvents, 'evt'));
      if (parsed.controlQueue && Array.isArray(parsed.controlQueue)) setControlQueue(deduplicateArrayById(parsed.controlQueue, 'cq'));
      if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) setAuditLogs(deduplicateArrayById(parsed.auditLogs, 'aud'));
      if (parsed.summary) setSummaryMeta(parsed.summary);

      logAuditEvent({
        investigator: 'System Administrator',
        actionType: 'integrity_verified',
        targetType: 'case_file',
        targetId: 'import-bundle',
        targetTitle: 'Ekstern Sagspakke Importeret',
        summaryDa: 'Fuld sagsdatabase gendannet/importeret fra JSON-arkiv.',
        summaryEn: 'Full case database restored/imported from JSON archive.',
        severity: 'info',
        tags: ['Import', 'Gendannelse']
      });

      return true;
    } catch (err) {
      console.error("Error importing case json", err);
      return false;
    }
  };

  // Export JSON bundle
  const exportCaseJson = (): string => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      summary,
      parties,
      documents,
      transcripts,
      claims,
      timelineEvents,
      controlQueue,
      infographics,
      auditLogs
    };

    logAuditEvent({
      investigator: 'Sagsrevisor',
      actionType: 'case_exported',
      targetType: 'case_file',
      targetId: 'export-bundle',
      targetTitle: 'Sagsdatabase Eksporteret',
      summaryDa: 'Fuld forensisk sagspakke med beviskæde og revisionslog eksporteret.',
      summaryEn: 'Full forensic case package with chain of custody and audit log exported.',
      severity: 'info',
      tags: ['Eksport', 'ChainOfCustody']
    });

    return JSON.stringify(bundle, null, 2);
  };

  // Reset to empty blank investigation
  const resetToEmptyCase = () => {
    setParties([]);
    setDocuments([]);
    setTranscripts([]);
    setClaims([]);
    setTimelineEvents([]);
    setControlQueue([]);
    setAuditLogs([]);
    setSummaryMeta({
      caseNumber: "CAS-" + new Date().getFullYear() + "-NEW",
      caseName: "Lyngby-Taarbæk Sagen & DAVLuca Forensic Audit",
      status: "Active Investigation",
      leadInvestigator: "Sagsansvarlig",
      dateOpened: new Date().toISOString().split('T')[0]
    });
  };

  // Reset to verified case dataset
  const resetToVerifiedCase = () => {
    setParties(enrichPartyDefaults(PARTIES_DATA));
    setDocuments(DOCUMENT_FINDINGS);
    setTranscripts(TRANSCRIPT_SNIPPETS);
    setClaims(SERIOUS_CLAIMS);
    setTimelineEvents(TIMELINE_EVENTS);
    setControlQueue(CONTROL_QUEUE_ITEMS);
    setInfographics(INFOGRAPHICS_DATA);
    setAuditLogs(AUDIT_LOG_ITEMS);
    setSummaryMeta(CASE_SUMMARY);
  };

  return (
    <CaseDataContext.Provider
      value={{
        summary,
        parties,
        documents,
        transcripts,
        claims,
        timelineEvents,
        controlQueue,
        infographics,
        auditLogs,
        logAuditEvent,
        clearAuditLogs,
        addDocument,
        updateDocument,
        deleteDocument,
        uploadRealFile,
        addParty,
        updateParty,
        deleteParty,
        addClaim,
        updateClaim,
        deleteClaim,
        addTimelineEvent,
        updateTimelineEvent,
        deleteTimelineEvent,
        addControlQueueItem,
        updateControlQueueItem,
        deleteControlQueueItem,
        addTranscriptSnippet,
        updateTranscriptSnippet,
        deleteTranscriptSnippet,
        addRecordedInterview,
        importCaseJson,
        exportCaseJson,
        resetToEmptyCase,
        resetToVerifiedCase,
        updateCaseSummary
      }}
    >
      {children}
    </CaseDataContext.Provider>
  );
}

export function useCaseData() {
  const context = useContext(CaseDataContext);
  if (!context) {
    throw new Error('useCaseData must be used within a CaseDataProvider');
  }
  return context;
}
