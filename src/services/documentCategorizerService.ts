import { DocumentFinding } from '../types';

export interface FolderDefinition {
  id: string;
  nameDa: string;
  nameEn: string;
  descriptionDa: string;
  descriptionEn: string;
  iconName: 'scale' | 'mic' | 'building' | 'users' | 'graduation-cap' | 'heart-pulse' | 'mail' | 'folder' | 'camera';
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const LOGICAL_FOLDERS: Record<string, FolderDefinition> = {
  'Audio Transcripts': {
    id: 'Audio Transcripts',
    nameDa: '1. Lydoptagelser & Aflytninger',
    nameEn: '1. Audio Recordings & Wiretaps',
    descriptionDa: 'Børnesamtaler (Liam), telefonoptagelser med Dennis, mødeaflytninger i forvaltningen og råbånd.',
    descriptionEn: 'Child audio logs (Liam), recorded calls with Dennis, municipal meeting wiretaps, and verbatim transcripts.',
    iconName: 'mic',
    color: '#a855f7',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400'
  },
  'Forensic Photos': {
    id: 'Forensic Photos',
    nameDa: '2. Billeder & Forensiske Fotos',
    nameEn: '2. Forensic Photos & Images',
    descriptionDa: 'Forensisk fotodokumentation af fysiske mærker, boligforhold, låse, SMS-skærmbilleder og EXIF metadata.',
    descriptionEn: 'Forensic photo documentation of physical marks, housing locks, SMS screenshots, and EXIF metadata.',
    iconName: 'camera',
    color: '#ec4899',
    badgeBg: 'bg-pink-500/10',
    badgeBorder: 'border-pink-500/30',
    badgeText: 'text-pink-400'
  },
  'Correspondence & Logs': {
    id: 'Correspondence & Logs',
    nameDa: '3. E-mails & Korrespondance',
    nameEn: '3. Emails & Written Correspondence',
    descriptionDa: 'Tilsynsklage til Borgmester Sofia Osmani, e-mailtråde med sagsbehandlere, e-Boks kvitteringer og bilag 1-51.',
    descriptionEn: 'Formal complaints to Mayor Sofia Osmani, caseworker email threads, e-Boks receipts, and evidence appendix.',
    iconName: 'mail',
    color: '#3b82f6',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-400'
  },
  'Court Documents': {
    id: 'Court Documents',
    nameDa: '4. Retsakter & Kendelser',
    nameEn: '4. Court Documents & Rulings',
    descriptionDa: 'Byretsdomme, retsbøger, forældremyndighedsafgørelser, fogedretsakter og stævninger.',
    descriptionEn: 'City court judgments, judicial records, custody decrees, and court minutes.',
    iconName: 'scale',
    color: '#f43f5e',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400'
  },
  'Social Services': {
    id: 'Social Services',
    nameDa: '5. Kommunale Sagsakter & Afgørelser',
    nameEn: '5. Social Services & Municipal Records',
    descriptionDa: 'Handleplaner, B&U udvalgsafgørelser, forvaltningsakter, §50 undersøgelser og sagsnotater.',
    descriptionEn: 'Action plans, child board decrees, municipal caseworker notes, and administrative decisions.',
    iconName: 'building',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-400'
  },
  'FABU & Visitation': {
    id: 'FABU & Visitation',
    nameDa: '6. FABU Samværsrapporter',
    nameEn: '6. FABU Supervision Reports',
    descriptionDa: 'Systematiske samværsobservationer og trivselsvurderinger for Luca.',
    descriptionEn: 'Supervised visitation observations and well-being assessments by neutral FABU consultants.',
    iconName: 'users',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400'
  },
  'School & Daycare': {
    id: 'School & Daycare',
    nameDa: '7. Skole & Institutioner',
    nameEn: '7. School & Daycare Records',
    descriptionDa: 'Trivselsdialoger, underretninger og referater fra Nordstjerneskolen.',
    descriptionEn: 'Well-being notes, school notifications, and leadership meetings.',
    iconName: 'graduation-cap',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400'
  },
  'Medical & Health': {
    id: 'Medical & Health',
    nameDa: '8. Sundhed & Lægeerklæringer',
    nameEn: '8. Medical & Health Evaluations',
    descriptionDa: 'Lægenotater, skadekort, psykologvurderinger og journaludskrifter.',
    descriptionEn: 'Medical records, emergency room logs, and psychological assessments.',
    iconName: 'heart-pulse',
    color: '#ef4444',
    badgeBg: 'bg-red-500/10',
    badgeBorder: 'border-red-500/30',
    badgeText: 'text-red-400'
  }
};

/**
 * Automatically categorizes a file based on its name, mimeType, and metadata.
 */
export function categorizeDocument(
  fileName: string,
  metadata?: {
    mimeType?: string;
    sourceType?: string;
    author?: string;
    summary?: string;
  }
): {
  folderCategory: string;
  confidence: number;
  tags: string[];
  suggestedSignificance: 'routine' | 'noteworthy' | 'critical';
} {
  const name = (fileName || '').toLowerCase();
  const mime = (metadata?.mimeType || '').toLowerCase();
  const summary = (metadata?.summary || '').toLowerCase();
  const author = (metadata?.author || '').toLowerCase();
  const srcType = (metadata?.sourceType || '').toLowerCase();

  const tags: string[] = [];

  // 1. Audio Transcripts & Wiretaps
  if (
    name.endsWith('.m4a') ||
    name.endsWith('.mp3') ||
    name.endsWith('.wav') ||
    name.endsWith('.aac') ||
    name.endsWith('.ogg') ||
    mime.includes('audio') ||
    srcType === 'audio' ||
    name.includes('optagelse') ||
    name.includes('lydfil') ||
    name.includes('samtale') ||
    name.includes('aflytning') ||
    name.includes('bånd') ||
    name.includes('telefonsamtale') ||
    name.includes('lyd & aflytninger') ||
    name.includes('lyd')
  ) {
    tags.push('Audio', 'Wiretap');
    if (name.includes('liam')) tags.push('Liam-Interview');
    if (name.includes('dennis')) tags.push('Dennis-Call');
    if (name.includes('politi') || name.includes('trussel')) tags.push('Conflict');
    return {
      folderCategory: 'Audio Transcripts',
      confidence: 0.98,
      tags,
      suggestedSignificance: name.includes('politi') || name.includes('liam') || name.includes('trussel') ? 'critical' : 'noteworthy'
    };
  }

  // 2. Forensic Photos & Images
  if (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp') ||
    name.endsWith('.heic') ||
    mime.includes('image') ||
    srcType === 'image' ||
    name.includes('foto') ||
    name.includes('billede') ||
    name.includes('skærmbillede') ||
    name.includes('screenshot') ||
    name.includes('mærker') ||
    name.includes('dørlås') ||
    name.includes('lås') ||
    name.includes('fotodokumentation') ||
    name.includes('forensisk foto') ||
    name.includes('billeder & forensiske fotos')
  ) {
    tags.push('Forensic-Photo', 'Image-Evidence', 'EXIF-Logged');
    if (name.includes('mærker') || name.includes('fysisk') || name.includes('skade')) tags.push('Physical-Injury');
    if (name.includes('bolig') || name.includes('lås')) tags.push('Living-Conditions');
    if (name.includes('sms') || name.includes('whatsapp') || name.includes('skærm')) tags.push('Digital-Evidence');
    return {
      folderCategory: 'Forensic Photos',
      confidence: 0.98,
      tags,
      suggestedSignificance: name.includes('mærker') || name.includes('trussel') ? 'critical' : 'noteworthy'
    };
  }

  // 3. E-mails & Correspondence
  if (
    name.endsWith('.eml') ||
    name.endsWith('.msg') ||
    name.includes('mail') ||
    name.includes('email') ||
    name.includes('e-mail') ||
    name.includes('eboks') ||
    name.includes('e-boks') ||
    name.includes('klage') ||
    name.includes('henvendelse') ||
    name.includes('korrespondance') ||
    name.includes('sms') ||
    name.includes('skrivelse') ||
    name.includes('partshøring') ||
    name.includes('e-mails & korrespondance') ||
    srcType === 'email'
  ) {
    tags.push('Email', 'Correspondence', 'Formal-Filing');
    if (name.includes('borgmester') || name.includes('osmani')) tags.push('Mayor-Complaint');
    if (name.includes('aktindsigt')) tags.push('Freedom-of-Information');
    if (name.includes('anke') || name.includes('ankestyrelsen')) tags.push('Appeals-Board');
    return {
      folderCategory: 'Correspondence & Logs',
      confidence: 0.95,
      tags,
      suggestedSignificance: name.includes('klage') || name.includes('borgmester') || name.includes('anke') ? 'critical' : 'noteworthy'
    };
  }

  // 4. Court Documents
  if (
    name.includes('dom') ||
    name.includes('byret') ||
    name.includes('retten') ||
    name.includes('retsbog') ||
    name.includes('stævning') ||
    name.includes('fogedret') ||
    name.includes('kendelse') ||
    summary.includes('byretten') ||
    summary.includes('retsbogsudskrift')
  ) {
    tags.push('Court', 'Judicial', 'Binding');
    return {
      folderCategory: 'Court Documents',
      confidence: 0.96,
      tags,
      suggestedSignificance: 'critical'
    };
  }

  // 5. FABU & Visitation
  if (
    name.includes('fabu') ||
    name.includes('samværsudtalelse') ||
    name.includes('samværsobservation') ||
    name.includes('overvåget samvær') ||
    name.includes('støttet samvær') ||
    author.includes('fabu') ||
    summary.includes('fabu')
  ) {
    tags.push('FABU', 'Visitation', 'Observation');
    return {
      folderCategory: 'FABU & Visitation',
      confidence: 0.95,
      tags,
      suggestedSignificance: 'critical'
    };
  }

  // 6. School & Daycare
  if (
    name.includes('nordstjerne') ||
    name.includes('skole') ||
    name.includes('børnehave') ||
    name.includes('institution') ||
    name.includes('michael') ||
    summary.includes('skolegang') ||
    summary.includes('skoleleder')
  ) {
    tags.push('School', 'Nordstjerneskolen', 'Education');
    return {
      folderCategory: 'School & Daycare',
      confidence: 0.92,
      tags,
      suggestedSignificance: 'noteworthy'
    };
  }

  // 7. Medical & Health
  if (
    name.includes('læge') ||
    name.includes('hospital') ||
    name.includes('journal') ||
    name.includes('psykolog') ||
    name.includes('skadekort') ||
    summary.includes('lægelig') ||
    summary.includes('diagnose')
  ) {
    tags.push('Medical', 'Health', 'Doctor-Note');
    return {
      folderCategory: 'Medical & Health',
      confidence: 0.94,
      tags,
      suggestedSignificance: 'critical'
    };
  }

  // 8. Social Services (Municipal decisions, handleplan, B&U udvalg)
  if (
    name.includes('kommune') ||
    name.includes('marsha') ||
    name.includes('mette') ||
    name.includes('handleplan') ||
    name.includes('b&u') ||
    name.includes('børn og unge') ||
    name.includes('afgørelse') ||
    name.includes('aktindsigt') ||
    name.includes('sagsnotat') ||
    name.includes('underretning') ||
    author.includes('kommune') ||
    summary.includes('sagsbehandling')
  ) {
    tags.push('Municipality', 'Social-Services', 'Casework');
    return {
      folderCategory: 'Social Services',
      confidence: 0.93,
      tags,
      suggestedSignificance: name.includes('afgørelse') || name.includes('b&u') ? 'critical' : 'noteworthy'
    };
  }

  // Default fallback
  return {
    folderCategory: 'Social Services',
    confidence: 0.75,
    tags: ['General-Case-File'],
    suggestedSignificance: 'routine'
  };
}

/**
 * Enriches an array of documents with logical folder categories.
 */
export function enrichDocumentsWithFolders(docs: DocumentFinding[]): DocumentFinding[] {
  return docs.map(doc => {
    if (doc.folderCategory && LOGICAL_FOLDERS[doc.folderCategory]) {
      return doc;
    }

    const { folderCategory } = categorizeDocument(doc.title || doc.docNumber, {
      mimeType: doc.fileFormat,
      sourceType: doc.sourceType,
      author: doc.author,
      summary: doc.summary
    });

    return {
      ...doc,
      folderCategory
    };
  });
}
