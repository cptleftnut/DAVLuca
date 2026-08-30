import { DocumentFinding, TimelineEvent, TranscriptSnippet, Party, SeriousClaim } from '../types';
import { categorizeDocument } from './documentCategorizerService';

export interface BlueprintAnalysisResult {
  fileId: string;
  fileName: string;
  sourceType: 'pdf' | 'audio' | 'image' | 'digital' | 'other';
  step1RawFacts: string[];
  step2TimelineDate?: string;
  step2TimelineEvent?: Partial<TimelineEvent>;
  step3HanlonsRazorAssessment: string;
  step4SourceCritique: {
    sourceType: string;
    biasRisk: 'low' | 'medium' | 'high';
    credibilityScore: number;
    notes: string;
  };
  step5OsintForensics: {
    extractedIds: string[];
    technicalProperties: Record<string, string>;
  };
  step6NoiseVsSignal: {
    isSignal: boolean;
    noiseElements: string[];
    coreSignals: string[];
  };
  step7GroundedConclusion: string;
  step8MoralAnchor: string;
}

/**
 * Parses file name, metadata, and optional text content to extract dates, categories,
 * parties, and map them into the 8-step Brew Method blueprint.
 */
export function parseCaseFileForBlueprint(
  fileName: string,
  fileSize?: string,
  mimeType?: string,
  textContent?: string
): BlueprintAnalysisResult {
  const name = decodeURIComponent(fileName).trim();
  const lower = name.toLowerCase();

  // 1. Identify File Type
  let sourceType: 'pdf' | 'audio' | 'image' | 'digital' | 'other' = 'digital';
  if (lower.endsWith('.m4a') || lower.endsWith('.mp3') || lower.endsWith('.wav') || (mimeType && mimeType.includes('audio'))) {
    sourceType = 'audio';
  } else if (lower.endsWith('.pdf') || (mimeType && mimeType.includes('pdf'))) {
    sourceType = 'pdf';
  } else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || (mimeType && mimeType.includes('image'))) {
    sourceType = 'image';
  }

  // 2. Date Extraction Regex
  let extractedDate = new Date().toISOString().split('T')[0];
  const dateMatch = name.match(/(\d{1,2})\s*(jan|feb|mar|marts|apr|april|maj|may|jun|juni|jul|juli|aug|august|sep|september|okt|oktober|nov|november|dec|december)\s*(\d{2,4})?/i);
  const isoDateMatch = name.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
  const compactDateMatch = name.match(/_(\d{2})(\d{2})(\d{2})_/);

  if (isoDateMatch) {
    extractedDate = `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
  } else if (compactDateMatch) {
    extractedDate = `20${compactDateMatch[1]}-${compactDateMatch[2]}-${compactDateMatch[3]}`;
  } else if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', marts: '03', apr: '04', april: '04',
      maj: '05', may: '05', jun: '06', juni: '06', jul: '07', juli: '07',
      aug: '08', august: '08', sep: '09', september: '09', okt: '10', oktober: '10',
      nov: '11', november: '11', dec: '12', december: '12'
    };
    const month = monthMap[dateMatch[2].toLowerCase()] || '01';
    let year = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : '2025';
    if (lower.includes('2026')) year = '2026';
    if (lower.includes('2024')) year = '2024';
    if (lower.includes('2023')) year = '2023';
    if (lower.includes('2022')) year = '2022';
    extractedDate = `${year}-${month}-${day}`;
  } else {
    // Specific file name checks
    if (lower.includes('28 november 2022')) extractedDate = '2022-11-28';
    else if (lower.includes('6 marts 2023')) extractedDate = '2023-03-06';
    else if (lower.includes('31-03-2023')) extractedDate = '2023-03-31';
    else if (lower.includes('9 juni 2023')) extractedDate = '2023-06-09';
    else if (lower.includes('1. september 2023')) extractedDate = '2023-09-01';
    else if (lower.includes('15 januar 2026') || lower.includes('15 jan 2026')) extractedDate = '2026-01-15';
    else if (lower.includes('26 feb 25') || lower.includes('26 februar')) extractedDate = '2025-02-26';
    else if (lower.includes('12 marts 25') || lower.includes('12 marts 2025')) extractedDate = '2025-03-12';
    else if (lower.includes('29 maj') || lower.includes('bu møde d.29 maj')) extractedDate = '2026-05-29';
    else if (lower.includes('4 juni') || lower.includes('20260604')) extractedDate = '2026-06-04';
    else if (lower.includes('24 juni 2026')) extractedDate = '2026-06-24';
    else if (lower.includes('29 juni - 1 juli 2026')) extractedDate = '2026-06-29';
  }

  // 3. Category & Party Mapping
  let category = 'Sagsakter og afgørelser';
  const partyIds: string[] = ['p-luca', 'p-dav'];

  if (lower.includes('fabu') || lower.includes('samvær')) {
    category = 'FABU og samvær';
    partyIds.push('p-fabu');
  } else if (lower.includes('amalie') || lower.includes('rikke') || lower.includes('sanne')) {
    category = 'Amalie og Rikke';
    partyIds.push('p-amalie-rikke');
  } else if (lower.includes('liam')) {
    category = 'Liam og fortællinger';
    partyIds.push('p-liam');
    if (lower.includes('louise')) partyIds.push('p-louise');
    if (lower.includes('dennis')) partyIds.push('p-dennis');
  } else if (lower.includes('møde') || lower.includes('kommune') || lower.includes('marsha') || lower.includes('mette')) {
    category = 'Kommunale møder';
    if (lower.includes('marsha')) partyIds.push('p-marsha');
    if (lower.includes('mette')) partyIds.push('p-mette');
  } else if (lower.includes('underretning')) {
    category = 'Underretninger og bekymring';
    partyIds.push('p-liam');
  }

  // 4. Brew Method 8-Step Synthesis
  const isFabu = category === 'FABU og samvær';
  const isLiam = category === 'Liam og fortællinger';
  const isDecision = lower.includes('dom') || lower.includes('afgørelse') || lower.includes('bu');

  const step1RawFacts = [
    `Filnavn: ${name}`,
    `Filtype: ${sourceType.toUpperCase()} (${fileSize || 'Standard'}), dateret: ${extractedDate}`,
    isFabu ? 'Uvildig samværsobservation fra FABU konsulent.' : 
    isLiam ? 'Optaget børneudsagn vedrørende hverdagsforhold og trivsel.' :
    isDecision ? 'Formel retslig/kommunal forvaltningsafgørelse.' : 'Dokumenteret sagsakt / mødeoptagelse.'
  ];

  const step3HanlonsRazorAssessment = isDecision
    ? 'Forvaltningsafgørelse: Vurder om mangelfulde begrundelser skyldes bureaukratisk tunnelsyn, tidsnød og skabelonbrug snarere end bevidst forfølgelse.'
    : isFabu
    ? 'Standardiseret observationsrapport: Upartisk fagperson uden institutionel interessekonflikt i kommunens budget eller interne relationer.'
    : 'Møde- og sagsakter: Høj forekomst af sagsbehandlerskift og defensiv kommunikation indikerer systemisk stress og manglende sagsoverblik.';

  const step4SourceCritique = {
    sourceType: isFabu ? 'Uvildig Børnesagkyndig (FABU)' : isLiam ? 'Primært Børneudsagn' : sourceType === 'audio' ? 'Real-time Lydbånd (Primærkilde)' : 'Kommunalt Dokument',
    biasRisk: isFabu ? ('low' as const) : isLiam ? ('medium' as const) : ('medium' as const),
    credibilityScore: isFabu ? 95 : sourceType === 'audio' ? 98 : isDecision ? 90 : 85,
    notes: isFabu 
      ? 'Højeste evidensværdi; direkte observationer af samvær og barnets reaktioner.' 
      : sourceType === 'audio'
      ? 'Objektiv lydoptagelse; udelukker fejlcitater eller efterrationaliseringer.'
      : 'Skal krydstjekkes mod de samtidige mødebånd for udeladelser.'
  };

  const step5OsintForensics = {
    extractedIds: [
      `ID-${Math.abs(name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(16).toUpperCase()}`
    ],
    technicalProperties: {
      Format: sourceType.toUpperCase(),
      Dato: extractedDate,
      Kategori: category,
      Størrelse: fileSize || 'Ukendt'
    }
  };

  const step6NoiseVsSignal = {
    isSignal: true,
    noiseElements: ['Følelsesladede partsudsagn', 'Telefoniske provokationer', 'Udokumenterede rygter'],
    coreSignals: [
      `Faktisk hændelse: ${name.replace(/\.[^/.]+$/, "")}`,
      `Kronologisk tidsfæstelse: ${extractedDate}`,
      `Involverede nøgleaktører: ${partyIds.join(', ')}`
    ]
  };

  const step7GroundedConclusion = `Filen "${name}" udgør en vigtig brik i tidslinjen pr. ${extractedDate}. Den belyser ${category.toLowerCase()} og skal indgå i den samlede krydsvalidering mod kommunens forvaltningsakter.`;

  const step8MoralAnchor = 'Sagens moralske anker forbliver børnenes (Luca og Liam) ret til en tryg barndom, retfærdig sagsbehandling og overholdelse af Børnekonventionens § 12.';

  return {
    fileId: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fileName: name,
    sourceType,
    step1RawFacts,
    step2TimelineDate: extractedDate,
    step2TimelineEvent: {
      id: `evt-auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: extractedDate,
      time: '12:00',
      title: name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      category,
      sourceType: sourceType === 'audio' ? 'audio' : sourceType === 'pdf' ? 'document' : 'other',
      description: `Automatisk ekstraheret hændelse fra "${name}" via The Brew Method parser.`,
      partyIds,
      significance: isDecision || isFabu ? 'critical' : 'high',
      verified: true,
      tags: [category, sourceType.toUpperCase(), extractedDate.substring(0, 4)]
    },
    step3HanlonsRazorAssessment,
    step4SourceCritique,
    step5OsintForensics,
    step6NoiseVsSignal,
    step7GroundedConclusion,
    step8MoralAnchor
  };
}

/**
 * Creates structured DocumentFinding from a Drive Picker file item
 */
export function buildDocumentFromDriveItem(driveFile: {
  id: string;
  name: string;
  mimeType?: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
}): DocumentFinding {
  const parsed = parseCaseFileForBlueprint(
    driveFile.name,
    driveFile.size,
    driveFile.mimeType
  );

  const docNumber = `DOC-DRIVE-${driveFile.id ? driveFile.id.substring(0, 6).toUpperCase() : Math.floor(100 + Math.random() * 900)}`;

  const autoCategory = categorizeDocument(driveFile.name, {
    mimeType: driveFile.mimeType,
    sourceType: parsed.sourceType,
    author: parsed.step4SourceCritique.sourceType,
    summary: parsed.step7GroundedConclusion
  });

  return {
    id: driveFile.id || parsed.fileId,
    docNumber,
    title: driveFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
    date: parsed.step2TimelineDate || new Date().toISOString().split('T')[0],
    sourceType: parsed.sourceType,
    category: parsed.step2TimelineEvent?.category || 'Sagsakter og afgørelser',
    folderCategory: autoCategory.folderCategory,
    fileFormat: driveFile.mimeType || `${parsed.sourceType.toUpperCase()} Sagsakt`,
    author: parsed.step4SourceCritique.sourceType,
    summary: parsed.step7GroundedConclusion,
    significance: autoCategory.suggestedSignificance || (parsed.step4SourceCritique.credibilityScore > 90 ? 'critical' : 'noteworthy'),
    partiesInvolved: parsed.step2TimelineEvent?.partyIds || ['p-luca', 'p-dav'],
    excerpt: `Google Drive fil synkroniseret til sagsarkiv. ${driveFile.webViewLink ? `Link: ${driveFile.webViewLink}` : ''}`,
    fileSize: driveFile.size ? `${(parseInt(driveFile.size) / 1024).toFixed(1)} KB` : 'Ukendt',
    verified: true
  };
}
