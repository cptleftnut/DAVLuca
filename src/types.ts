export interface Party {
  id: string;
  name: string;
  role: string;
  organization: string;
  department?: string;
  category?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  tags?: string[];
  signalCount?: number;
  lastActive?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | string;
  connectionType?: 'Primary Investigator' | 'Authority / Caseworker' | 'Family Member' | 'Witness / Whistleblower' | 'Legal Counsel' | 'Child Welfare Specialist' | 'Third-Party Observer' | string;
  avatar?: string;
  technicalSignals?: {
    deviceCount?: number;
    emailAccounts?: number;
    phoneNumbers?: string[];
    ipAddresses?: string[];
    lastActivity?: string;
  };
  keyMentionsCount?: number;
  claimsCount?: number;
  documentsLinked?: number;
  notes?: string;
  sentimentProfile?: {
    overallTone: 'hostile' | 'defensive' | 'critical' | 'anxious' | 'evasive' | 'supportive' | 'cooperative' | 'neutral';
    overallScore: number;
    dominantEmotions: { emotion: string; percentage: number; color: string }[];
    keyEmotionalQuotes: {
      id: string;
      docId?: string;
      docTitle?: string;
      date?: string;
      snippetText: string;
      sentimentTone: 'hostile' | 'defensive' | 'critical' | 'anxious' | 'evasive' | 'supportive' | 'cooperative' | 'neutral';
      score: number;
      emotionalKeywords: string[];
      contextNote?: string;
    }[];
    conflictIntensity: 'high' | 'medium' | 'low';
  };
}

export interface OCRAnnotation {
  id: string;
  docId: string;
  selectedText: string;
  pageNumber?: number;
  startIndex?: number;
  endIndex?: number;
  createdAt: string;
  color?: 'yellow' | 'red' | 'green' | 'blue' | 'purple' | 'amber';
  tags?: string[];
  linkedPartyId?: string;
  linkedPartyName?: string;
  linkedEventId?: string;
  linkedEventTitle?: string;
  comment?: string;
  stepTag?: string; // e.g. 'Trin 1: Anti-Bias', 'Trin 3: Hanlon\'s Razor', 'Trin 4: Kildekritik', 'Trin 6: Signal'
  investigatorFlag?: 'verified' | 'suspicious' | 'follow_up' | 'unconfirmed';
}

export interface DocumentFinding {
  id: string;
  docNumber: string;
  title: string;
  date: string;
  sourceType: 'email' | 'audio' | 'contract' | 'report' | 'memo' | 'police_report' | 'image' | 'financial' | 'document' | 'pdf' | 'digital' | 'other' | string;
  author: string;
  summary: string;
  significance: 'routine' | 'noteworthy' | 'critical' | string;
  partiesInvolved: string[];
  excerpt: string;
  fileSize?: string;
  driveUrl?: string;
  verified: boolean;
  category?: 'document' | 'audio' | 'image' | 'email' | 'financial' | 'FABU og samvær' | 'Sagsakter og afgørelser' | 'Lyd og aflytninger' | 'Billeder og fotos' | 'E-mails og korrespondance' | string;
  folderCategory?: 'Court Documents' | 'Audio Transcripts' | 'Social Services' | 'FABU & Visitation' | 'School & Daycare' | 'Medical & Health' | 'Correspondence & Logs' | 'Forensic Photos' | string;
  subfolderPath?: string;
  fullContent?: string;
  pdfUrl?: string;
  pageCount?: number;
  ocrText?: string;
  ocrAnnotations?: OCRAnnotation[];
  fileFormat?: string;
  mediaDuration?: string;
  imageCaption?: string;
  thumbnailUrl?: string;
  tags?: string[];
  exifData?: {
    camera?: string;
    timestamp?: string;
    gpsCoordinates?: string;
    resolution?: string;
    fileHash?: string;
    lens?: string;
    iso?: string;
    verifiedChainOfCustody?: boolean;
  };
  emailHeaders?: {
    from?: string;
    to?: string;
    cc?: string;
    subject?: string;
    sentDate?: string;
    messageId?: string;
    inReplyTo?: string;
    attachmentsCount?: number;
  };
  audioMeta?: {
    duration?: string;
    bitrate?: string;
    sampleRate?: string;
    recordingDevice?: string;
    recordedDate?: string;
    participants?: string[];
  };
}

export interface TranscriptSnippet {
  id: string;
  timecode?: string; // e.g. "04:15"
  seconds?: number;
  date?: string;
  speaker: string;
  title?: string;
  summary?: string;
  category?: string;
  sourceFile?: string;
  audioDuration?: string;
  significance?: 'routine' | 'noteworthy' | 'critical' | string;
  keyQuotes?: string[];
  partyId?: string;
  text?: string;
  confidence?: number; // 0.0 - 1.0
  uncertainWords?: string[];
  bookmarked?: boolean;
  tags?: string[];
  verified?: boolean;
}

export interface SeriousClaim {
  id: string;
  claimId: string;
  claimant?: string;
  targetParty?: string;
  targetPartyId?: string;
  sourcePartyId?: string;
  dateLogged?: string;
  investigationNotes?: string;
  category: 'Financial Irregularity' | 'Breach of Protocol' | 'Conflict of Interest' | 'Misrepresentation' | 'Security Incident' | string;
  severity: 'high' | 'critical' | 'severe' | string;
  status: 'Under Review' | 'Substantiated' | 'Refuted' | 'Pending Evidence' | string;
  description: string;
  evidenceRefs?: string[];
  relatedDocIds?: string[];
  evidenceScore?: number;
  registeredDate?: string;
  lastUpdated?: string;
}

export interface EventAnnotation {
  id: string;
  author?: string;
  text: string;
  createdAt: string;
  tags?: string[];
  investigatorFlag?: 'verified' | 'suspicious' | 'follow_up' | 'unconfirmed';
}

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  category: any;
  sourceType?: any;
  description: string;
  sourceDocId?: string;
  sourceDocumentIds?: string[];
  isKeyMilestone?: boolean;
  partyIds: string[];
  significance: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  financialAmount?: string;
  evidenceExcerpt?: string;
  corroboratedBy?: string[];
  tags?: string[];
  verified?: boolean;
  userNotes?: string;
  annotations?: EventAnnotation[];
}

export interface ControlQueueItem {
  id: string;
  itemCode?: string;
  title?: string;
  taskName?: string;
  category?: string;
  description?: string;
  sourceReference?: string;
  type?: 'Verification Needed' | 'Redaction Check' | 'Timeline Discrepancy' | 'Party Disambiguation' | 'Missing Source' | string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical' | string;
  assignedTo: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated' | 'pending' | 'in_progress' | 'completed' | string;
  dueDate: string;
  notes: string;
}

export interface InfographicItem {
  id: string;
  title: string;
  category: string;
  description: string;
  metrics: { label: string; value: string | number; change?: string }[];
  chartType: 'bar' | 'pie' | 'flow' | 'radial';
  lastGenerated: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string e.g. "2026-08-28T21:40:00Z"
  investigator: string;
  actionType:
    | 'annotation_added'
    | 'annotation_updated'
    | 'annotation_deleted'
    | 'tag_added'
    | 'tag_removed'
    | 'verification_toggled'
    | 'document_uploaded'
    | 'document_updated'
    | 'document_deleted'
    | 'party_updated'
    | 'claim_status_changed'
    | 'timeline_event_mutated'
    | 'note_attached'
    | 'case_exported'
    | 'integrity_verified';
  targetType: 'document' | 'party' | 'timeline_event' | 'claim' | 'transcript' | 'case_file' | 'system';
  targetId: string;
  targetTitle: string;
  summaryDa: string;
  summaryEn: string;
  diff?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  };
  sha256Checksum?: string;
  severity: 'info' | 'notice' | 'warning' | 'critical';
  tags?: string[];
}

export interface CaseSummary {
  caseNumber: string;
  caseName: string;
  description?: string;
  overview?: string;
  status: 'Active Investigation' | 'Closed' | 'Under Audit' | 'Court Preparation';
  leadInvestigator: string;
  dateOpened: string;
  totalDocuments: number;
  totalTranscripts: number;
  totalParties: number;
  criticalFindings: number;
  openTasks: number;
}

export interface VoiceNote {
  id: string;
  timestamp: string;
  durationSeconds: number;
  transcription: string;
  confidenceScore: number;
  audioBlobUrl?: string;
  status: 'transcribing' | 'completed' | 'error';
  tags?: string[];
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
