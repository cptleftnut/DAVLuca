import { DocumentFinding } from '../types';

export type SuggestedCategory =
  | 'Social Services'
  | 'Court Records'
  | 'Personal Audio'
  | 'Forensic Photos'
  | 'FABU & Visitation'
  | 'School & Daycare'
  | 'Medical & Health'
  | 'Correspondence & Logs';

export interface TaggingAnalysisResult {
  category: SuggestedCategory;
  confidence: number;
  tags: string[];
  significance: 'routine' | 'noteworthy' | 'critical';
  detectedParties: string[];
  detectedDates: string[];
  legalClauses: string[];
  justificationDa: string;
  justificationEn: string;
}

export const CATEGORY_METADATA: Record<SuggestedCategory, {
  nameDa: string;
  nameEn: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  descriptionDa: string;
  descriptionEn: string;
}> = {
  'Social Services': {
    nameDa: 'Kommunale Sagsakter & Afgørelser',
    nameEn: 'Social Services & Municipal Records',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-400',
    descriptionDa: 'Handleplaner, B&U udvalgsafgørelser, forvaltningsakter, §50 undersøgelser og sagsnotater.',
    descriptionEn: 'Action plans, Child Board decrees, caseworker notes, §50 investigations, and decisions.'
  },
  'Court Records': {
    nameDa: 'Retsakter & Kendelser',
    nameEn: 'Court Records & Judicial Rulings',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-400',
    descriptionDa: 'Byretsdomme, retsbøger, forældremyndighedsafgørelser, stævninger og fogedretssager.',
    descriptionEn: 'City court judgments, court records, custody decrees, and judicial minutes.'
  },
  'Personal Audio': {
    nameDa: 'Lydoptagelser & Aflytninger',
    nameEn: 'Personal Audio & Transcripts',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400',
    descriptionDa: 'Børnesamtaler, telefonoptagelser, mødeaflytninger, afhøringer og råbånd.',
    descriptionEn: 'Child audio logs, phone intercepts, recorded meetings, and verbatim voice transcripts.'
  },
  'Forensic Photos': {
    nameDa: 'Billeder & Forensiske Fotos',
    nameEn: 'Forensic Photos & Images',
    badgeBg: 'bg-pink-500/10',
    badgeBorder: 'border-pink-500/30',
    badgeText: 'text-pink-400',
    descriptionDa: 'Fotodokumentation af fysiske mærker, boligforhold, låse, SMS-screenshots og EXIF metadata.',
    descriptionEn: 'Photo documentation of physical marks, housing conditions, locks, SMS screenshots, and EXIF metadata.'
  },
  'FABU & Visitation': {
    nameDa: 'FABU Samværsrapporter',
    nameEn: 'FABU Supervision Reports',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    badgeText: 'text-emerald-400',
    descriptionDa: 'Systematiske samværsobservationer og trivselsvurderinger for Luca.',
    descriptionEn: 'Supervised visitation observations and well-being assessments.'
  },
  'School & Daycare': {
    nameDa: 'Skole & Institutioner',
    nameEn: 'School & Daycare Records',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    descriptionDa: 'Trivselsdialoger, underretninger og referater fra Nordstjerneskolen.',
    descriptionEn: 'Well-being notes, school notifications, and leadership meetings.'
  },
  'Medical & Health': {
    nameDa: 'Sundhed & Lægeerklæringer',
    nameEn: 'Medical & Health Evaluations',
    badgeBg: 'bg-red-500/10',
    badgeBorder: 'border-red-500/30',
    badgeText: 'text-red-400',
    descriptionDa: 'Lægenotater, skadekort, psykologvurderinger og journaludskrifter.',
    descriptionEn: 'Medical records, emergency room logs, and psychological assessments.'
  },
  'Correspondence & Logs': {
    nameDa: 'Korrespondance & Bilag 1-51',
    nameEn: 'Correspondence & Case Logs',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-400',
    descriptionDa: 'SMS-korrespondance, e-mails, kvitteringer og samlede bilag 1-51.',
    descriptionEn: 'SMS logs, email threads, receipts, and evidence appendix 1-51.'
  }
};

/**
 * Deeply analyzes document title, excerpt, and extracted OCR text to suggest category and metadata.
 */
export function analyzeAndTagDocument(
  title: string,
  content: string = '',
  metadata?: {
    mimeType?: string;
    sourceType?: string;
    author?: string;
    fileSize?: string;
  }
): TaggingAnalysisResult {
  const cleanTitle = (title || '').toLowerCase();
  const cleanContent = (content || '').toLowerCase();
  const mime = (metadata?.mimeType || '').toLowerCase();
  const srcType = (metadata?.sourceType || '').toLowerCase();
  const combined = `${cleanTitle} ${cleanContent} ${mime} ${srcType} ${metadata?.author || ''}`.toLowerCase();

  const detectedParties: string[] = [];
  const detectedDates: string[] = [];
  const legalClauses: string[] = [];
  const tags: string[] = [];

  // 1. Detect Parties
  if (combined.includes('luca')) detectedParties.push('p-luca');
  if (combined.includes('liam')) detectedParties.push('p-liam');
  if (combined.includes('marsha')) detectedParties.push('p-marsha');
  if (combined.includes('mette')) detectedParties.push('p-mette');
  if (combined.includes('amalie') || combined.includes('rikke') || combined.includes('sanne')) detectedParties.push('p-amalie-rikke');
  if (combined.includes('fabu')) detectedParties.push('p-fabu');
  if (combined.includes('dennis')) detectedParties.push('p-dennis');
  if (combined.includes('louise')) detectedParties.push('p-louise');
  if (combined.includes('david') || combined.includes('dav')) detectedParties.push('p-dav');

  // 2. Detect Legal References
  if (combined.includes('barnets lov')) legalClauses.push('Barnets Lov');
  if (combined.includes('§ 50') || combined.includes('paragraf 50')) legalClauses.push('Serviceloven § 50');
  if (combined.includes('forældreansvar') || combined.includes('§ 11')) legalClauses.push('Forældreansvarsloven');
  if (combined.includes('børnekonventionen') || combined.includes('art. 12') || combined.includes('artikel 12')) legalClauses.push('Børnekonventionen Art. 12');
  if (combined.includes('forvaltningsloven') || combined.includes('notatpligt')) legalClauses.push('Forvaltningsloven (Notatpligt)');

  // 3. Detect Dates
  const dateRegex = /(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})|(\d{4}[-_]\d{2}[-_]\d{2})/g;
  const foundDates = combined.match(dateRegex);
  if (foundDates) {
    detectedDates.push(...Array.from(new Set(foundDates)).slice(0, 3));
  }

  // 4. Category Scoring Engine
  let category: SuggestedCategory = 'Social Services';
  let confidence = 0.85;
  let significance: 'routine' | 'noteworthy' | 'critical' = 'noteworthy';
  let justificationDa = '';
  let justificationEn = '';

  // Forensic Photos check
  if (
    cleanTitle.endsWith('.jpg') ||
    cleanTitle.endsWith('.jpeg') ||
    cleanTitle.endsWith('.png') ||
    cleanTitle.endsWith('.webp') ||
    cleanTitle.endsWith('.heic') ||
    mime.includes('image') ||
    srcType === 'image' ||
    cleanTitle.includes('foto') ||
    cleanTitle.includes('billede') ||
    cleanTitle.includes('skærmbillede') ||
    cleanTitle.includes('screenshot') ||
    cleanTitle.includes('mærker') ||
    cleanTitle.includes('dørlås') ||
    cleanTitle.includes('lås') ||
    cleanTitle.includes('fotodokumentation')
  ) {
    category = 'Forensic Photos';
    confidence = 0.98;
    significance = cleanTitle.includes('mærker') || cleanTitle.includes('trussel') ? 'critical' : 'noteworthy';
    tags.push('Forensic Photos', 'Image Evidence', 'EXIF Metadata');
    if (combined.includes('mærker') || combined.includes('fysisk')) tags.push('Physical-Signs');
    if (combined.includes('lås') || combined.includes('bolig')) tags.push('Safety-Locks');

    justificationDa = 'Fotodokumentation og billedmateriale indeholdende visuelle beviser og EXIF tidsstempler.';
    justificationEn = 'Photographic evidence and digital imagery containing verifiable visual cues and EXIF timestamps.';
    return { category, confidence, tags, significance, detectedParties, detectedDates, legalClauses, justificationDa, justificationEn };
  }

  // Audio / Personal Audio check
  if (
    cleanTitle.endsWith('.m4a') ||
    cleanTitle.endsWith('.mp3') ||
    cleanTitle.endsWith('.wav') ||
    cleanTitle.endsWith('.aac') ||
    mime.includes('audio') ||
    srcType === 'audio' ||
    cleanTitle.includes('optagelse') ||
    cleanTitle.includes('lydfil') ||
    cleanTitle.includes('samtale med') ||
    cleanTitle.includes('bånd') ||
    cleanContent.includes('afhøring') ||
    cleanContent.includes('lydoptagelse')
  ) {
    category = 'Personal Audio';
    confidence = 0.98;
    significance = combined.includes('liam') || combined.includes('trussel') || combined.includes('politi') ? 'critical' : 'noteworthy';
    tags.push('Personal Audio', 'Voice Recording', 'Audio Transcript');
    if (combined.includes('liam')) tags.push('Liam-Interview');
    if (combined.includes('marsha') || combined.includes('mette')) tags.push('Caseworker-Confrontation');

    justificationDa = 'Filen er identificeret som en lydfil/transskription indeholdende primære børne- eller mødeoptagelser.';
    justificationEn = 'Identified as audio recording/transcript containing primary voice testimony or recorded case encounters.';
    return { category, confidence, tags, significance, detectedParties, detectedDates, legalClauses, justificationDa, justificationEn };
  }

  // Court Records check
  if (
    cleanTitle.includes('dom') ||
    cleanTitle.includes('byret') ||
    cleanTitle.includes('retten') ||
    cleanTitle.includes('retsbog') ||
    cleanTitle.includes('stævning') ||
    cleanTitle.includes('fogedret') ||
    cleanTitle.includes('kendelse') ||
    cleanContent.includes('retten i lyngby') ||
    cleanContent.includes('retsbogsudskrift') ||
    cleanContent.includes('dommer') ||
    cleanContent.includes('forældremyndighedssag')
  ) {
    category = 'Court Records';
    confidence = 0.97;
    significance = 'critical';
    tags.push('Court Records', 'Byretten', 'Judicial Ruling', 'Binding Decree');
    if (combined.includes('retsbog')) tags.push('Retsbogsudskrift');
    if (combined.includes('fogedret')) tags.push('Fogedretskendelse');

    justificationDa = 'Indeholder retslige afgørelser, kendelser eller retsbøger fra Byretten med bindende juridisk virkning.';
    justificationEn = 'Contains judicial decrees, minutes, or judgments from the City Court with binding legal effect.';
    return { category, confidence, tags, significance, detectedParties, detectedDates, legalClauses, justificationDa, justificationEn };
  }

  // FABU & Visitation check
  if (
    cleanTitle.includes('fabu') ||
    cleanTitle.includes('samværsudtalelse') ||
    cleanTitle.includes('samværsobservation') ||
    cleanTitle.includes('overvåget samvær') ||
    cleanTitle.includes('støttet samvær') ||
    cleanContent.includes('foreningen familie og børn') ||
    cleanContent.includes('samværskonsulent') ||
    cleanContent.includes('observation af samvær')
  ) {
    category = 'FABU & Visitation';
    confidence = 0.96;
    significance = 'critical';
    tags.push('FABU & Visitation', 'Supervised Visitation', 'Child Observation', 'Neutral Assessment');

    justificationDa = 'Uvildig observationsrapport fra Foreningen Familie og Børn (FABU) vedrørende samværsforløb og trivsel for Luca.';
    justificationEn = 'Independent visitation report from FABU evaluating supervised contact and child well-being.';
    return { category, confidence, tags, significance, detectedParties, detectedDates, legalClauses, justificationDa, justificationEn };
  }

  // School & Daycare check
  if (
    cleanTitle.includes('nordstjerne') ||
    cleanTitle.includes('skole') ||
    cleanTitle.includes('børnehave') ||
    cleanTitle.includes('institution') ||
    cleanContent.includes('nordstjerneskolen') ||
    cleanContent.includes('skoleleder') ||
    cleanContent.includes('trivselsnotat') ||
    cleanContent.includes('skoleunderretning')
  ) {
    category = 'School & Daycare';
    confidence = 0.93;
    significance = combined.includes('underretning') ? 'critical' : 'noteworthy';
    tags.push('School & Daycare', 'Nordstjerneskolen', 'Institutional Record');

    justificationDa = 'Dokument fra uddannelses- eller daginstitution, herunder Nordstjerneskolen.';
    justificationEn = 'Document originated from school or educational daycare institution.';
    return { category, confidence, tags, significance, detectedParties, detectedDates, legalClauses, justificationDa, justificationEn };
  }

  // Medical & Health check
  if (
    cleanTitle.includes('læge') ||
    cleanTitle.includes('hospital') ||
    cleanTitle.includes('journal') ||
    cleanTitle.includes('psykolog') ||
    cleanTitle.includes('skadekort') ||
    cleanContent.includes('lægelig vurdering') ||
    cleanContent.includes('epikrise') ||
    cleanContent.includes('børnepsykiatrisk')
  ) {
    category = 'Medical & Health';
    confidence = 0.95;
    significance = 'critical';
    tags.push('Medical & Health', 'Health Evaluation', 'Clinical Record');

    justificationDa = 'Sundhedsfagligt dokument, lægeerklæring eller psykologisk vurdering.';
    justificationEn = 'Healthcare document, clinical note, or psychological evaluation.';
    return { category, confidence, tags, significance, detectedParties, detectedDates, legalClauses, justificationDa, justificationEn };
  }

  // Correspondence & Logs / Bilag check
  if (
    cleanTitle.includes('bilag') ||
    cleanTitle.includes('sms') ||
    cleanTitle.includes('mail') ||
    cleanTitle.includes('email') ||
    cleanTitle.includes('besked') ||
    cleanTitle.includes('log') ||
    cleanTitle.includes('korrespondance') ||
    cleanContent.includes('whatsapp') ||
    cleanContent.includes('sms-korrespondance')
  ) {
    category = 'Correspondence & Logs';
    confidence = 0.90;
    significance = 'noteworthy';
    tags.push('Correspondence & Logs', 'Communication Logs', 'Evidence Appendix');

    justificationDa = 'Skriftlig korrespondance, beskeder eller bilagsoversigter mellem parter og myndigheder.';
    justificationEn = 'Written correspondence, message logs, or evidence annexes.';
    return { category, confidence, tags, significance, detectedParties, detectedDates, legalClauses, justificationDa, justificationEn };
  }

  // Social Services (Default & Municipal)
  category = 'Social Services';
  confidence = 0.92;
  significance = combined.includes('afgørelse') || combined.includes('b&u') || combined.includes('29 maj') ? 'critical' : 'noteworthy';
  tags.push('Social Services', 'Municipal Casework', 'Administrative Record');
  if (combined.includes('handleplan')) tags.push('Handleplan-v2');
  if (combined.includes('b&u') || combined.includes('børn og unge')) tags.push('B&U-Udvalg');
  if (combined.includes('underretning')) tags.push('Underretning');

  justificationDa = 'Kommunal forvaltningsakt, sagsbehandlernotat, handleplan eller udvalgsafgørelse fra Lyngby-Taarbæk Kommune.';
  justificationEn = 'Municipal administrative filing, caseworker memorandum, action plan, or committee ruling.';

  return { category, confidence, tags, significance, detectedParties, detectedDates, legalClauses, justificationDa, justificationEn };
}

/**
 * Batch auto-tags an array of DocumentFindings.
 */
export function autoTagDocumentFindings(docs: DocumentFinding[]): DocumentFinding[] {
  return docs.map(doc => {
    const analysis = analyzeAndTagDocument(
      doc.title,
      `${doc.excerpt || ''} ${doc.summary || ''} ${doc.ocrText || ''} ${doc.fullContent || ''}`,
      {
        mimeType: doc.fileFormat,
        sourceType: doc.sourceType,
        author: doc.author,
        fileSize: doc.fileSize
      }
    );

    // Map category to standard folderCategory
    const mappedFolderCategory =
      analysis.category === 'Court Records'
        ? 'Court Documents'
        : analysis.category === 'Personal Audio'
        ? 'Audio Transcripts'
        : analysis.category;

    return {
      ...doc,
      folderCategory: mappedFolderCategory,
      significance: doc.significance || analysis.significance,
      partiesInvolved: Array.from(new Set([...(doc.partiesInvolved || []), ...analysis.detectedParties]))
    };
  });
}
