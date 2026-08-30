import {
  Party,
  DocumentFinding,
  TranscriptSnippet,
  SeriousClaim,
  TimelineEvent,
  ControlQueueItem,
  InfographicItem,
  CaseSummary
} from '../types';

export const CASE_SUMMARY: CaseSummary = {
  caseNumber: "LTK-FAM-2022-2026",
  caseName: "Lyngby-Taarbæk Sagen & Børnefaglig Undersøgelse (Luca & Liam)",
  status: "Active Investigation",
  leadInvestigator: "Undersøgende Journalist / Graverteam",
  dateOpened: "2022-11-28",
  totalDocuments: 28,
  totalTranscripts: 46,
  totalParties: 12,
  criticalFindings: 9,
  openTasks: 5
};

export const PARTIES_DATA: Party[] = [
  {
    id: "p-luca",
    name: "Luca",
    role: "Barn / Sagshovedperson",
    category: "Barn",
    organization: "Lyngby-Taarbæk Kommune / FABU Samvær",
    department: "Familieafdelingen",
    contactEmail: "",
    contactPhone: "",
    status: "active",
    riskLevel: "critical",
    tags: ["Barn", "Samvær", "FABU", "Skærmet"],
    notes: "Centralt barn i forældreansvars- og anbringelsessagen. Genstand for omfattende FABU samværsobservationer og børnefaglige undersøgelser.",
    signalCount: 18,
    lastActive: "2026-07-01",
    keyMentionsCount: 18,
    claimsCount: 6,
    documentsLinked: 12,
    technicalSignals: {
      deviceCount: 0,
      emailAccounts: 0,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2026-07-01 CET"
    },
    sentimentProfile: {
      overallTone: 'supportive',
      overallScore: 85,
      conflictIntensity: 'low',
      dominantEmotions: [
        { emotion: 'Tryghed ved samvær', percentage: 65, color: '#10b981' },
        { emotion: 'Savn af forældre', percentage: 25, color: '#3b82f6' },
        { emotion: 'Uro ved skift', percentage: 10, color: '#f59e0b' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-luca-1',
          docId: 'doc-fabu-2023',
          docTitle: 'FABU Samværsrapport Sep 2023',
          date: '2023-09-01',
          snippetText: 'Luca løber sine forældre i møde med åbne arme, smiler og udviser øjeblikkelig ro og tryghed.',
          sentimentTone: 'supportive',
          score: 90,
          emotionalKeywords: ['ro', 'tryghed', 'glæde'],
          contextNote: 'FABU observation under støttet samvær'
        }
      ]
    }
  },
  {
    id: "p-liam",
    name: "Liam",
    role: "Barn / Bror",
    category: "Barn",
    organization: "Gribskov / Lyngby-Taarbæk",
    department: "Skole & Børn",
    contactEmail: "",
    contactPhone: "",
    status: "active",
    riskLevel: "critical",
    tags: ["Barn", "Underretninger", "Optagede udsagn", "Nordstjerneskolen"],
    notes: "Barn med adskillige dokumenterede beretninger, lydoptagelser og underretninger om hjemlige forhold.",
    signalCount: 22,
    lastActive: "2026-06-21",
    keyMentionsCount: 22,
    claimsCount: 8,
    documentsLinked: 14,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 0,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2026-06-21 CET"
    },
    sentimentProfile: {
      overallTone: 'anxious',
      overallScore: -45,
      conflictIntensity: 'high',
      dominantEmotions: [
        { emotion: 'Adfærdsangst', percentage: 50, color: '#ef4444' },
        { emotion: 'Indlært konflikt', percentage: 35, color: '#f59e0b' },
        { emotion: 'Søgning om støtte', percentage: 15, color: '#6366f1' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-liam-1',
          docId: 'doc-underretning-gribskov',
          docTitle: 'Underretning Gribskov 2021',
          date: '2021-03-15',
          snippetText: 'Barnet udviser svære traumereaktioner og modstridende udsagn præget af voldsomt pres.',
          sentimentTone: 'anxious',
          score: -60,
          emotionalKeywords: ['traume', 'konflikt', 'usikkerhed'],
          contextNote: 'Underretning vedrørende skolegang'
        }
      ]
    }
  },
  {
    id: "p-dav",
    name: "Dav",
    role: "Far / Part i sagen",
    category: "Forælder",
    organization: "Part i forældreansvarssag",
    department: "Privat",
    contactEmail: "far.partsrep@proton.me",
    contactPhone: "+45 XX XX XX 01",
    status: "active",
    riskLevel: "medium",
    tags: ["Far", "Dokumentation", "Mødedeltager", "Aktindsigt"],
    notes: "Faren, som har optaget og dokumenteret forhandlinger, samværsmøder og kommunale sagsforløb med Lyngby-Taarbæk og Gribskov kommuner.",
    signalCount: 35,
    lastActive: "2026-07-01",
    keyMentionsCount: 35,
    claimsCount: 5,
    documentsLinked: 28,
    technicalSignals: {
      deviceCount: 2,
      emailAccounts: 2,
      phoneNumbers: ["+45 XX XX XX 01"],
      ipAddresses: ["185.220.101.45 (ProtonVPN)", "87.54.12.89 (TDC Net)"],
      lastActivity: "2026-07-01 CET"
    },
    sentimentProfile: {
      overallTone: 'critical',
      overallScore: -30,
      conflictIntensity: 'medium',
      dominantEmotions: [
        { emotion: 'Sagsfrustration', percentage: 45, color: '#f59e0b' },
        { emotion: 'Metodisk Dokumentation', percentage: 40, color: '#6366f1' },
        { emotion: 'Omsorg for Børn', percentage: 15, color: '#10b981' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-dav-1',
          docId: 'doc-audio-jan15-2026',
          docTitle: 'Lydoptagelse Møde Mette & Marsha',
          date: '2026-01-15',
          snippetText: 'I sagde at I vil give os en undskyldning på båndet, men i referatet skriver I at vi nægter at samarbejde.',
          sentimentTone: 'critical',
          score: -50,
          emotionalKeywords: ['referatfalsk', 'dokumentation', 'retssikkerhed'],
          contextNote: 'Udskrift fra båndoptagelse på rådhuset'
        }
      ]
    }
  },
  {
    id: "p-dennis",
    name: "Dennis",
    role: "Fratrådt Børne- og ungerådgiver",
    category: "Myndighed",
    organization: "Lyngby-Taarbæk Kommune (Tidligere)",
    department: "Familieafdelingen",
    contactEmail: "",
    contactPhone: "+45 XX XX XX 02",
    status: "inactive",
    riskLevel: "critical",
    tags: ["Fratrådt Rådgiver", "Konflikt", "Trusler om politi", "Makulering"],
    notes: "Optræder på adskillige lydbånd med stærkt konfrontatorisk og truende adfærd. Senere afskediget fra kommunen.",
    signalCount: 14,
    lastActive: "2022-10-15",
    keyMentionsCount: 14,
    claimsCount: 4,
    documentsLinked: 9,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: ["+45 XX XX XX 02"],
      ipAddresses: [],
      lastActivity: "2022-10-15 CET"
    },
    sentimentProfile: {
      overallTone: 'hostile',
      overallScore: -92,
      conflictIntensity: 'high',
      dominantEmotions: [
        { emotion: 'Konfrontation & Magt', percentage: 70, color: '#ef4444' },
        { emotion: 'Afvisning af Borger', percentage: 20, color: '#dc2626' },
        { emotion: 'Evasiv Retsopfattelse', percentage: 10, color: '#f59e0b' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-dennis-1',
          docId: 'doc-audio-dennis-politi',
          docTitle: '4. Dennis truer med politiet.m4a',
          date: '2022-06-10',
          snippetText: 'Hvis I ikke underskriver her og nu, ringes der direkte til Nordsjællands Politi, og I forlader ikke bygningen.',
          sentimentTone: 'hostile',
          score: -95,
          emotionalKeywords: ['politi', 'tvang', 'trussel', 'underskrift'],
          contextNote: 'Optagelse fra rådhusmøde maj/juni 2022'
        }
      ]
    }
  },
  {
    id: "p-marsha",
    name: "Marsha",
    role: "Sagsbehandler / Børne- og ungerådgiver",
    category: "Myndighed",
    organization: "Lyngby-Taarbæk Kommune",
    department: "Børn & Unge / Familieafdelingen",
    contactEmail: "marsha@ltk.dk",
    contactPhone: "+45 45 97 30 00",
    status: "active",
    riskLevel: "high",
    tags: ["Sagsbehandler", "Afgørelser", "Mødeleder", "Støttet samvær"],
    notes: "Primær kommunal sagsbehandler i Lyngby-Taarbæk. Ansvarlig for afgørelser om støttet samvær og statusmøder.",
    signalCount: 26,
    lastActive: "2026-07-03",
    keyMentionsCount: 26,
    claimsCount: 7,
    documentsLinked: 19,
    technicalSignals: {
      deviceCount: 2,
      emailAccounts: 1,
      phoneNumbers: ["+45 45 97 30 00"],
      ipAddresses: ["194.255.45.12 (LTK Kommune Net)"],
      lastActivity: "2026-07-03 CET"
    },
    sentimentProfile: {
      overallTone: 'evasive',
      overallScore: -68,
      conflictIntensity: 'high',
      dominantEmotions: [
        { emotion: 'Systemisk Evasivitet', percentage: 55, color: '#f59e0b' },
        { emotion: 'Defensiv Rådgivning', percentage: 30, color: '#ef4444' },
        { emotion: 'Formel Mødeledelse', percentage: 15, color: '#64748b' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-marsha-1',
          docId: 'doc-audio-marsha-25feb',
          docTitle: 'Marsha møde d. 25 feb.m4a',
          date: '2026-02-25',
          snippetText: 'Vi skal ikke sidde og dvæle ved hvad der skete i 2022 eller hvad FABU skrev i 2023, vi ser fremad nu.',
          sentimentTone: 'evasive',
          score: -75,
          emotionalKeywords: ['afvisning', 'dvæle', 'sagsfortid', 'referat'],
          contextNote: 'Optagelse fra statusmøde februar 2026'
        }
      ]
    }
  },
  {
    id: "p-mette",
    name: "Mette",
    role: "Kommunal Rådgiver / Sagsbehandler",
    category: "Myndighed",
    organization: "Lyngby-Taarbæk Kommune",
    department: "Børn & Familie",
    contactEmail: "mette.f@ltk.dk",
    contactPhone: "",
    status: "active",
    riskLevel: "medium",
    tags: ["Mødedeltager", "Sagsbehandling", "Notater", "Undskyldning 2026"],
    notes: "Deltager sammen med Marsha i koordinerings- og statusmøder med forældrene. Gav mundtlig undskyldning jan 2026.",
    signalCount: 11,
    lastActive: "2026-01-15",
    keyMentionsCount: 11,
    claimsCount: 2,
    documentsLinked: 8,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: [],
      ipAddresses: ["194.255.45.18 (LTK Kommune Net)"],
      lastActivity: "2026-01-15 CET"
    },
    sentimentProfile: {
      overallTone: 'defensive',
      overallScore: -55,
      conflictIntensity: 'medium',
      dominantEmotions: [
        { emotion: 'Mundtlig Beklagelse', percentage: 40, color: '#6366f1' },
        { emotion: 'Administrativ Tilbageholdelse', percentage: 40, color: '#f59e0b' },
        { emotion: 'Defensiv Referatføring', percentage: 20, color: '#ef4444' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-mette-1',
          docId: 'doc-audio-jan15-2026',
          docTitle: 'Møde d. 15 jan 2026 Mette og Marsha.mp3',
          date: '2026-01-15',
          snippetText: 'Vi vil gerne give jer en stor uforbeholden undskyldning for sagsbehandlingen i de første år.',
          sentimentTone: 'cooperative',
          score: 60,
          emotionalKeywords: ['undskyldning', 'beklagelse', 'sagsbehandling'],
          contextNote: 'Mundtlig overlevering på optagelsen jan 2026'
        }
      ]
    }
  },
  {
    id: "p-astrid",
    name: "Astrid",
    role: "Sagsbehandler / Børne- og ungerådgiver",
    category: "Myndighed",
    organization: "Lyngby-Taarbæk Kommune",
    department: "Familieafdelingen",
    contactEmail: "astrid@ltk.dk",
    contactPhone: "+45 45 97 30 00",
    status: "active",
    riskLevel: "medium",
    tags: ["Rådgiver", "Samtaler", "Sagsakter", "Overdragelse"],
    notes: "Sagsbehandler i sagen ved overdragelsen efter Dennis. Optræder på lydfilen '4. Samtale med Astrid.m4a'.",
    signalCount: 9,
    lastActive: "2023-04-12",
    keyMentionsCount: 9,
    claimsCount: 2,
    documentsLinked: 6,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2023-04-12 CET"
    },
    sentimentProfile: {
      overallTone: 'defensive',
      overallScore: -50,
      conflictIntensity: 'medium',
      dominantEmotions: [
        { emotion: 'Sagsusikkerhed', percentage: 50, color: '#f59e0b' },
        { emotion: 'Forsvar for forvaltning', percentage: 30, color: '#ef4444' },
        { emotion: 'Formel henvendelse', percentage: 20, color: '#64748b' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-astrid-1',
          docId: 'doc-audio-astrid-samtale',
          docTitle: '4. Samtale med Astrid.m4a',
          date: '2023-04-12',
          snippetText: 'Jeg overtog sagen fra Dennis og arbejder ud fra de oplysninger der lå i sagsmappen dengang.',
          sentimentTone: 'defensive',
          score: -45,
          emotionalKeywords: ['overdragelse', 'sagsakter', 'forvaltningsbehandling'],
          contextNote: 'Telefonsamtale angående dokumentation'
        }
      ]
    }
  },
  {
    id: "p-saniya",
    name: "Saniya",
    role: "Børne- og ungerådgiver / Rådgiver",
    category: "Myndighed",
    organization: "Lyngby-Taarbæk Kommune",
    department: "Familieafdelingen",
    contactEmail: "saniya@ltk.dk",
    contactPhone: "+45 45 97 30 00",
    status: "active",
    riskLevel: "medium",
    tags: ["Rådgiver", "Sagsstamme", "Mødenotater"],
    notes: "Involveret børnerådgiver på sagsstammen. Håndterer opfølgende mødenotater og kommunale aktstykker.",
    signalCount: 7,
    lastActive: "2024-11-10",
    keyMentionsCount: 7,
    claimsCount: 1,
    documentsLinked: 5,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2024-11-10 CET"
    },
    sentimentProfile: {
      overallTone: 'evasive',
      overallScore: -40,
      conflictIntensity: 'medium',
      dominantEmotions: [
        { emotion: 'Administrativ Forbeholdenhed', percentage: 60, color: '#f59e0b' },
        { emotion: 'Kølig Kommunikation', percentage: 40, color: '#64748b' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-saniya-1',
          docId: 'doc-notat-saniya',
          docTitle: 'Sagsnotat Saniya 2024',
          date: '2024-11-10',
          snippetText: 'Sagen afventer Ankestyrelsens samlede vurdering af samværshyppigheden.',
          sentimentTone: 'evasive',
          score: -35,
          emotionalKeywords: ['afventer', 'ankestyrelsen', 'notat'],
          contextNote: 'Internt kommunalt sagsnotat'
        }
      ]
    }
  },
  {
    id: "p-medfamilien",
    name: "Medfamiliens Konsulenter",
    role: "Familiebehandlere / Samværskonsulenter",
    category: "Fagperson",
    organization: "Medfamilien ApS",
    department: "Familiebehandling & Samværsstøtte",
    contactEmail: "kontakt@medfamilien.dk",
    contactPhone: "+45 70 20 12 34",
    status: "active",
    riskLevel: "low",
    tags: ["Medfamilien", "Familiebehandling", "Observationer", "Samvær"],
    notes: "Ekstern professionel leverandør af støttet samvær og familiebehandling for forældrene og børnene.",
    signalCount: 15,
    lastActive: "2025-09-18",
    keyMentionsCount: 15,
    claimsCount: 2,
    documentsLinked: 10,
    technicalSignals: {
      deviceCount: 2,
      emailAccounts: 1,
      phoneNumbers: ["+45 70 20 12 34"],
      ipAddresses: [],
      lastActivity: "2025-09-18 CET"
    },
    sentimentProfile: {
      overallTone: 'supportive',
      overallScore: 65,
      conflictIntensity: 'low',
      dominantEmotions: [
        { emotion: 'Konstruktiv Støtte', percentage: 60, color: '#10b981' },
        { emotion: 'Faglig Observation', percentage: 30, color: '#3b82f6' },
        { emotion: 'Neutrale Notater', percentage: 10, color: '#64748b' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-medfam-1',
          docId: 'doc-medfamilien-rapport',
          docTitle: 'Medfamilien Udtalelse 2025',
          date: '2025-09-18',
          snippetText: 'Forældrene udviser fin indlevelse i Lucas behov og samarbejder konstruktivt om rammerne.',
          sentimentTone: 'supportive',
          score: 75,
          emotionalKeywords: ['konstruktiv', 'indlevelse', 'samarbejde'],
          contextNote: 'Samværsnotat fra Medfamilien'
        }
      ]
    }
  },
  {
    id: "p-fabu",
    name: "FABU Konsulenter",
    role: "Samværskonsulenter / Børnesagkyndige",
    category: "Fagperson",
    organization: "FABU (Foreningen til Støtte for Mødre og Børn)",
    department: "Overvåget & Støttet Samvær",
    contactEmail: "kontakt@fabu.dk",
    contactPhone: "+45 35 39 42 00",
    status: "active",
    riskLevel: "high",
    tags: ["Samværsudtalelser", "Observationer", "Psykologfaglig vurdering", "Mørklagte Rapporter"],
    notes: "Udarbejder samværsudtalelser for Luca fra 2022 til 2026. Rapporterne fra 2023 blev mørklagt af kommunen for B&U-udvalget.",
    signalCount: 30,
    lastActive: "2026-07-01",
    keyMentionsCount: 30,
    claimsCount: 6,
    documentsLinked: 22,
    technicalSignals: {
      deviceCount: 2,
      emailAccounts: 1,
      phoneNumbers: ["+45 35 39 42 00"],
      ipAddresses: ["195.84.162.20 (FABU Gateway)"],
      lastActivity: "2026-07-01 CET"
    },
    sentimentProfile: {
      overallTone: 'supportive',
      overallScore: 78,
      conflictIntensity: 'medium',
      dominantEmotions: [
        { emotion: 'Positiv Omsorgsobservation', percentage: 70, color: '#10b981' },
        { emotion: 'Opmærksomhed på barnet', percentage: 20, color: '#3b82f6' },
        { emotion: 'Mørklagt af myndighed', percentage: 10, color: '#ef4444' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-fabu-1',
          docId: 'doc-fabu-udtalelse-sep2023',
          docTitle: 'FABU Udtalelse 1. september 2023.pdf',
          date: '2023-09-01',
          snippetText: 'Samværet forløb med stor gensidig glæde. Forældrene tilbød trøst og omsorg, når Luca blev træt.',
          sentimentTone: 'supportive',
          score: 88,
          emotionalKeywords: ['glæde', 'trøst', 'omsorg', 'samvær'],
          contextNote: 'FABU samværsrapport modtaget af kommunen men tilbageholdt'
        }
      ]
    }
  },
  {
    id: "p-heidi",
    name: "Heidi",
    role: "Børnesagkyndig konsulent / Pædagogisk Rådgiver",
    category: "Fagperson",
    organization: "Ekstern Pædagogisk Konsulentvirksomhed",
    department: "Børnesagkyndige Undersøgelser",
    contactEmail: "heidi.konsulent@fagfolk.dk",
    contactPhone: "+45 XX XX XX 09",
    status: "active",
    riskLevel: "medium",
    tags: ["Børnesagkyndig", "Konsulent", "Vurderinger", "Børnefaglig"],
    notes: "Børnesagkyndig rådgiver tilknyttet evalueringen af forældrekompetencer og børns trivsel.",
    signalCount: 8,
    lastActive: "2024-05-14",
    keyMentionsCount: 8,
    claimsCount: 1,
    documentsLinked: 6,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2024-05-14 CET"
    },
    sentimentProfile: {
      overallTone: 'neutral',
      overallScore: 10,
      conflictIntensity: 'low',
      dominantEmotions: [
        { emotion: 'Analytisk Vurdering', percentage: 60, color: '#3b82f6' },
        { emotion: 'Pædagogisk Forbehold', percentage: 40, color: '#f59e0b' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-heidi-1',
          docId: 'doc-notat-heidi',
          docTitle: 'Notat Heidi Børnesagkyndig 2024',
          date: '2024-05-14',
          snippetText: 'Anbefaler supplerende observationer i et neutralt miljø for at udelukke kontekstafhængige usikkerheder.',
          sentimentTone: 'neutral',
          score: 15,
          emotionalKeywords: ['observationer', 'neutralt miljø', 'supplerende'],
          contextNote: 'Pædagogisk notat'
        }
      ]
    }
  },
  {
    id: "p-thomas",
    name: "Thomas",
    role: "Afdelingsleder",
    category: "Myndighedsledelse",
    organization: "Lyngby-Taarbæk Kommune",
    department: "Børne- og Familieafdelingen / Ledelsen",
    contactEmail: "thomas.leder@ltk.dk",
    contactPhone: "+45 45 97 30 00",
    status: "active",
    riskLevel: "critical",
    tags: ["Afdelingsleder", "Sagsansvarlig", "Lydfil Makulering", "Ledelsesansvar"],
    notes: "Afdelingsleder i Familieafdelingen. Optræder på '15. Telefonsamtale Thomas.m4a' hvor han vedgår at Dennis kan have makuleret fødselspapirer.",
    signalCount: 16,
    lastActive: "2026-02-10",
    keyMentionsCount: 16,
    claimsCount: 5,
    documentsLinked: 11,
    technicalSignals: {
      deviceCount: 2,
      emailAccounts: 1,
      phoneNumbers: ["+45 45 97 30 00"],
      ipAddresses: ["194.255.45.2 (LTK Kommune Net)"],
      lastActivity: "2026-02-10 CET"
    },
    sentimentProfile: {
      overallTone: 'evasive',
      overallScore: -78,
      conflictIntensity: 'high',
      dominantEmotions: [
        { emotion: 'Ledelsesmæssig Evasivitet', percentage: 50, color: '#ef4444' },
        { emotion: 'Erkendelse af systemfejl', percentage: 35, color: '#f59e0b' },
        { emotion: 'Ansvarsfraskrivelse', percentage: 15, color: '#dc2626' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-thomas-1',
          docId: 'doc-audio-thomas-makulering',
          docTitle: '15. Telefonsamtale Thomas.m4a',
          date: '2025-10-10',
          snippetText: 'Det kan godt være at Dennis har smidt forældrenes fødselspapirer i makuleringsspanden da han stoppede, det ved jeg rent faktisk ikke.',
          sentimentTone: 'evasive',
          score: -82,
          emotionalKeywords: ['makulering', 'papirer', 'Dennis', 'ansvar'],
          contextNote: 'Optaget telefonsamtale med ledelsen'
        }
      ]
    }
  },
  {
    id: "p-ole-jaan",
    name: "Ole-Jaan",
    role: "Juridisk Rådgiver / Konsulent",
    category: "Juridisk Ekspert",
    organization: "Selvstændig Juridisk Rådgivning",
    department: "Forvaltningsret & Børnesager",
    contactEmail: "ole-jaan.jura@advokat.dk",
    contactPhone: "+45 XX XX XX 88",
    status: "active",
    riskLevel: "medium",
    tags: ["Jurist", "Forvaltningsret", "Byretskritik", "Aktindsigt"],
    notes: "Juridisk konsulent og rådgiver, der har gennemgået forvaltningens brud på sandhedspligten og Forvaltningsloven.",
    signalCount: 12,
    lastActive: "2026-04-18",
    keyMentionsCount: 12,
    claimsCount: 3,
    documentsLinked: 9,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2026-04-18 CET"
    },
    sentimentProfile: {
      overallTone: 'critical',
      overallScore: -40,
      conflictIntensity: 'medium',
      dominantEmotions: [
        { emotion: 'Juridisk Domskritik', percentage: 70, color: '#ef4444' },
        { emotion: 'Forvaltningsretlig Analyse', percentage: 30, color: '#6366f1' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-olejaan-1',
          docId: 'doc-jura-notat-2026',
          docTitle: 'Juridisk Respons Ole-Jaan 2026',
          date: '2026-04-18',
          snippetText: 'Tilbageholdelsen af FABU udtalelserne for B&U-udvalget udgør et groft forvaltningsretligt svigt og ugyldiggør beslutningsgrundlaget.',
          sentimentTone: 'critical',
          score: -65,
          emotionalKeywords: ['forvaltningsret', 'ugyldig', 'tilbageholdelse'],
          contextNote: 'Juridisk responsum om byretsdommen'
        }
      ]
    }
  },
  {
    id: "p-iben",
    name: "Iben",
    role: "Sagsbehandler / Børne- og ungerådgiver",
    category: "Myndighed",
    organization: "Lyngby-Taarbæk Kommune",
    department: "Børn & Familie",
    contactEmail: "iben@ltk.dk",
    contactPhone: "+45 45 97 30 00",
    status: "active",
    riskLevel: "medium",
    tags: ["Sagsbehandler", "Statusrapporter", "B&U Udvalg"],
    notes: "Rådgiver involveret i udarbejdelse af statusnotater og sagsfremstillinger til Børn og Unge-udvalget.",
    signalCount: 8,
    lastActive: "2025-08-22",
    keyMentionsCount: 8,
    claimsCount: 2,
    documentsLinked: 7,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2025-08-22 CET"
    },
    sentimentProfile: {
      overallTone: 'defensive',
      overallScore: -50,
      conflictIntensity: 'medium',
      dominantEmotions: [
        { emotion: 'Systemloyalitet', percentage: 65, color: '#f59e0b' },
        { emotion: 'Sagsforsvar', percentage: 35, color: '#ef4444' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-iben-1',
          docId: 'doc-statusnotat-iben',
          docTitle: 'Statusnotat Iben 2025',
          date: '2025-08-22',
          snippetText: 'Indstiller til fortsat anbringelse ud fra hensynet til kontinuitet og tilknytning.',
          sentimentTone: 'defensive',
          score: -40,
          emotionalKeywords: ['fortsat anbringelse', 'kontinuitet', 'indstilling'],
          contextNote: 'Kommunal sagsindstilling'
        }
      ]
    }
  },
  {
    id: "p-berit",
    name: "Berit",
    role: "Sagsbehandler i Ydelsesafdelingen",
    category: "Myndighed / Økonomi",
    organization: "Lyngby-Taarbæk Kommune",
    department: "Ydelsesafdelingen / Borgerservice",
    contactEmail: "ydelse@ltk.dk",
    contactPhone: "+45 45 97 30 00",
    status: "active",
    riskLevel: "high",
    tags: ["Ydelsesafdelingen", "Økonomiske Sanktioner", "Forsørgelsesstop", "Pressionsmiddel"],
    notes: "Optræder i 'Rådgiver lyngby.m4a'. Ansvarlig for pludseligt stop af forsørgelsesydelser under påskud af manglende kontakt.",
    signalCount: 10,
    lastActive: "2025-03-01",
    keyMentionsCount: 10,
    claimsCount: 3,
    documentsLinked: 5,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: ["+45 45 97 30 00"],
      ipAddresses: ["194.255.45.50 (LTK Kommune Net)"],
      lastActivity: "2025-03-01 CET"
    },
    sentimentProfile: {
      overallTone: 'hostile',
      overallScore: -85,
      conflictIntensity: 'high',
      dominantEmotions: [
        { emotion: 'Økonomisk Sanktionering', percentage: 75, color: '#ef4444' },
        { emotion: 'Bureaukratisk Afvisning', percentage: 25, color: '#dc2626' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-berit-1',
          docId: 'doc-audio-ydelse-sanktion',
          docTitle: 'Rådgiver lyngby.m4a',
          date: '2025-02-15',
          snippetText: 'Ydelsen er standset pr. d. 1. fordi vi ikke har modtaget bekræftelse på jeres aktivitetsplan fra Børneafdelingen.',
          sentimentTone: 'hostile',
          score: -88,
          emotionalKeywords: ['sanktion', 'ydelsesstop', 'forsørgelse', 'bureaukrati'],
          contextNote: 'Optagelse med Ydelsesafdelingen'
        }
      ]
    }
  },
  {
    id: "p-bornehaven",
    name: "Børnehaven (Pædagoger)",
    role: "Pædagogisk Personale",
    category: "Skole / Institution",
    organization: "Lucas Daginstitution i Lyngby",
    department: "Stuen / Børnehaven",
    contactEmail: "institution@ltk.dk",
    contactPhone: "",
    status: "active",
    riskLevel: "low",
    tags: ["Pædagoger", "Børnehave", "Afvisning af Misrøgt", "Lydoptagelse"],
    notes: "Pædagogisk personale i børnehaven. Optræder på '7. Første møde i børnehaven.m4a' hvor de afviser Dennis' påstande om misrøgt.",
    signalCount: 12,
    lastActive: "2023-01-20",
    keyMentionsCount: 12,
    claimsCount: 1,
    documentsLinked: 6,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 0,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2023-01-20 CET"
    },
    sentimentProfile: {
      overallTone: 'supportive',
      overallScore: 70,
      conflictIntensity: 'low',
      dominantEmotions: [
        { emotion: 'Omsorg for barnet', percentage: 60, color: '#10b981' },
        { emotion: 'Afkræftelse af rygter', percentage: 40, color: '#3b82f6' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-paed-1',
          docId: 'doc-audio-bornehave-mote',
          docTitle: '7. Første møde i børnehaven.m4a',
          date: '2022-06-15',
          snippetText: 'Vi har altså aldrig sagt til sagsbehandleren at Luca skulle være misrøgtet eller at forældrene mangler omsorgsevne.',
          sentimentTone: 'supportive',
          score: 80,
          emotionalKeywords: ['misrøgt afvist', 'omsorg', 'børnehave'],
          contextNote: 'Lydfil optaget af forældrene i børnehaven'
        }
      ]
    }
  },
  {
    id: "p-torvehuset",
    name: "Torvehuset (Misbrugskontrol)",
    role: "Laboratorium / Medicinsk Kontrolinstans",
    category: "Lægefaglig / Laboratorium",
    organization: "Torvehuset Sundhedscenter",
    department: "Urinprøve- og Misbrugskontrol",
    contactEmail: "torvehuset@regionh.dk",
    contactPhone: "+45 38 68 00 00",
    status: "active",
    riskLevel: "low",
    tags: ["Torvehuset", "Blanke Urinprøver", "Lægedokumentation", " Heroin Rebuttal"],
    notes: "Udfører kontinuerlige superviserede urinprøver for forældrene. 100% blanke/rene for illegale stoffer gennem alle år.",
    signalCount: 20,
    lastActive: "2026-06-15",
    keyMentionsCount: 20,
    claimsCount: 0,
    documentsLinked: 15,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: ["+45 38 68 00 00"],
      ipAddresses: [],
      lastActivity: "2026-06-15 CET"
    },
    sentimentProfile: {
      overallTone: 'cooperative',
      overallScore: 90,
      conflictIntensity: 'low',
      dominantEmotions: [
        { emotion: 'Medicinsk Præcision', percentage: 90, color: '#10b981' },
        { emotion: 'Uvildighed', percentage: 10, color: '#64748b' }
      ],
      keyEmotionalQuotes: [
        {
          id: 'sq-torv-1',
          docId: 'doc-urinprover-torvehuset',
          docTitle: 'Laboratorieattester Torvehuset 2022-2026',
          date: '2026-06-15',
          snippetText: 'Samtlige afleverede urinprøver i hele overvågningsperioden påviser 0.0 mg/L af heroin, opiater eller andre illegale substanser.',
          sentimentTone: 'cooperative',
          score: 95,
          emotionalKeywords: ['0.0 mg/L', 'ren prøve', 'laboratorium', 'lægedokumentation'],
          contextNote: 'Uvildig laboratorieattest'
        }
      ]
    }
  },
  {
    id: "p-louise",
    name: "Louise",
    role: "Part / Omtalt person",
    category: "Pårørende",
    organization: "Privat",
    department: "",
    contactEmail: "",
    contactPhone: "",
    status: "active",
    riskLevel: "medium",
    tags: ["Liam beretninger", "Hjemlige forhold"],
    notes: "Omtalt indgående i Liams børnefortællinger og lydbånd om adfærd i hjemmet.",
    signalCount: 8,
    lastActive: "2026-04-10",
    keyMentionsCount: 8,
    claimsCount: 3,
    documentsLinked: 6,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 0,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2026-04-10 CET"
    }
  },
  {
    id: "p-ulla",
    name: "Ulla",
    role: "Sagsbehandler / Tidligere rådgiver",
    category: "Myndighed",
    organization: "Kommunen",
    department: "Socialforvaltningen",
    contactEmail: "",
    contactPhone: "",
    status: "inactive",
    riskLevel: "medium",
    tags: ["Tidligere rådgiver", "Gennemlæsning"],
    notes: "Tidligere sagsbehandler. Dokumenteret uvilje mod samtale og sagsgennemgang.",
    signalCount: 4,
    lastActive: "2024-08-12",
    keyMentionsCount: 4,
    claimsCount: 1,
    documentsLinked: 4,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 0,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2024-08-12 CET"
    }
  },
  {
    id: "p-borgmester-sofia",
    name: "Borgmester Sofia Osmani",
    role: "Borgmester",
    category: "Politisk Ledelse",
    organization: "Lyngby-Taarbæk Kommune",
    department: "Borgmesterkontoret",
    contactEmail: "borgmester@ltk.dk",
    contactPhone: "+45 45 97 30 00",
    status: "active",
    riskLevel: "low",
    tags: ["Politisk klage", "Tilsynssag", "Fotodokumentation"],
    notes: "Modtager af klager over sagsbehandling og tilsynssvigt i familieafdelingen.",
    signalCount: 3,
    lastActive: "2026-06-04",
    keyMentionsCount: 3,
    claimsCount: 1,
    documentsLinked: 5,
    technicalSignals: {
      deviceCount: 2,
      emailAccounts: 1,
      phoneNumbers: ["+45 45 97 30 00"],
      ipAddresses: ["194.255.45.1 (LTK Kommune Net)"],
      lastActivity: "2026-06-04 CET"
    }
  },
  {
    id: "p-nordstjerne-michael",
    name: "Michael",
    role: "Skoleleder",
    category: "Skole / Institution",
    organization: "Nordstjerneskolen",
    department: "Skoleledelsen",
    contactEmail: "nordstjernen@gribskov.dk",
    contactPhone: "",
    status: "active",
    riskLevel: "medium",
    tags: ["Skole", "Trivsel", "Underretninger"],
    notes: "Skoleleder på Nordstjerneskolen vedrørende Liams skolegang og mistrivselsrapporteringer.",
    signalCount: 5,
    lastActive: "2025-11-20",
    keyMentionsCount: 5,
    claimsCount: 2,
    documentsLinked: 7,
    technicalSignals: {
      deviceCount: 1,
      emailAccounts: 1,
      phoneNumbers: [],
      ipAddresses: [],
      lastActivity: "2025-11-20 CET"
    }
  }
];

export const DOCUMENT_FINDINGS: DocumentFinding[] = [
  {
    id: "doc-fabu-2022",
    docNumber: "FABU-UDT-2022-11",
    title: "FABU Udtalelse 28. november 2022",
    date: "2022-11-28",
    sourceType: "pdf",
    category: "FABU og samvær",
    fileFormat: "PDF / Samværsrapport",
    author: "FABU Samværskonsulent",
    summary: "Første registrerede formelle samværsudtalelse vedrørende Lucas reaktioner og samværsdynamik.",
    significance: "critical",
    partiesInvolved: ["p-luca", "p-dav", "p-fabu"],
    excerpt: "Observationer af kontakten mellem Luca og forælder under overvåget samvær.",
    fileSize: "1.4 MB",
    verified: true
  },
  {
    id: "doc-fabu-2023-03",
    docNumber: "FABU-UDT-2023-03",
    title: "FABU Udtalelse 6. marts 2023",
    date: "2023-03-06",
    sourceType: "pdf",
    category: "FABU og samvær",
    fileFormat: "PDF / Samværsrapport",
    author: "FABU Samværskonsulent",
    summary: "Opfølgende samværsrapport over relationsudvikling og emotionel respons hos Luca.",
    significance: "noteworthy",
    partiesInvolved: ["p-luca", "p-fabu"],
    excerpt: "Evaluering af samværsforløbet foråret 2023.",
    fileSize: "1.1 MB",
    verified: true
  },
  {
    id: "doc-handleplan-2023",
    docNumber: "EBOKS-HP-2023-03",
    title: "Handleplan v2, 31-03-2023",
    date: "2023-03-31",
    sourceType: "pdf",
    category: "Sagsakter og afgørelser",
    fileFormat: "PDF / Kommunal Handleplan",
    author: "Kommunal Forvaltning (e-Boks)",
    summary: "Revideret handleplan efter Servicelovens bestemmelser for indsatsen omkring barnet.",
    significance: "critical",
    partiesInvolved: ["p-luca", "p-dav", "p-marsha"],
    excerpt: "Mål og delmål for samvær, trivsel og forældresamarbejde fastlagt af kommunen.",
    fileSize: "2.8 MB",
    verified: true
  },
  {
    id: "doc-fabu-2023-09",
    docNumber: "FABU-UDT-2023-09",
    title: "FABU Udtalelse 1. september 2023",
    date: "2023-09-01",
    sourceType: "pdf",
    category: "FABU og samvær",
    fileFormat: "PDF / Samværsrapport",
    author: "FABU Samværskonsulent",
    summary: "Statusudtalelse efter sommerperiodens samvær og barnets udviklingstrin.",
    significance: "noteworthy",
    partiesInvolved: ["p-luca", "p-fabu"],
    excerpt: "Dokumentation af samværets forløb og barnets trivsel i rammerne.",
    fileSize: "1.6 MB",
    verified: true
  },
  {
    id: "doc-byret-dom",
    docNumber: "RET-DOM-2024",
    title: "Byretten - DOM & Retsbogsudskrift",
    date: "2024-06-15",
    sourceType: "pdf",
    category: "Sagsakter og afgørelser",
    fileFormat: "PDF / Retsafgørelse",
    author: "Retten i Lyngby / Byretten",
    summary: "Formel domsafsigelse vedrørende forældremyndighed, bopæl og samværsfastsættelse.",
    significance: "critical",
    partiesInvolved: ["p-luca", "p-dav", "p-dennis"],
    excerpt: "Rettens præmisser og afgørelse om samværsretten og tilknyttede vilkår.",
    fileSize: "4.2 MB",
    verified: true
  },
  {
    id: "doc-marsha-afg-2025-02",
    docNumber: "LTK-AFG-2025-0226",
    title: "Marsha afgørelse 26. feb 2025",
    date: "2025-02-26",
    sourceType: "pdf",
    category: "Sagsakter og afgørelser",
    fileFormat: "PDF / Forvaltningsafgørelse",
    author: "Marsha (Lyngby-Taarbæk Kommune)",
    summary: "Kommunal afgørelse truffet af sagsbehandler Marsha vedrørende vilkår for indsatsen.",
    significance: "critical",
    partiesInvolved: ["p-marsha", "p-luca", "p-dav"],
    excerpt: "Forvaltningsafgørelse med henvisning til servicelovens rammer og partshøringssvar.",
    fileSize: "1.9 MB",
    verified: true
  },
  {
    id: "doc-marsha-stottet-2025-03",
    docNumber: "LTK-AFG-2025-0312",
    title: "Marsha - Afgørelse om støttet samvær - 12. Marts 2025",
    date: "2025-03-12",
    sourceType: "pdf",
    category: "Sagsakter og afgørelser",
    fileFormat: "PDF / Afgørelse",
    author: "Marsha (Lyngby-Taarbæk Kommune)",
    summary: "Afgørelse om iværksættelse eller ændring af støttet samvær for Luca.",
    significance: "critical",
    partiesInvolved: ["p-marsha", "p-luca", "p-dav", "p-fabu"],
    excerpt: "Begrundelse for fastsættelse af støttet samvær og tilsynsforpligtelse.",
    fileSize: "2.1 MB",
    verified: true
  },
  {
    id: "doc-aktindsigt-2026-01",
    docNumber: "AKT-2026-01",
    title: "Aktindsigt januar 2026 (Komplet aktliste)",
    date: "2026-01-10",
    sourceType: "pdf",
    category: "Sagsakter og afgørelser",
    fileFormat: "PDF / Aktindsigtsmateriale",
    author: "Lyngby-Taarbæk Kommune",
    summary: "Samlet udleveret aktindsigtsmappe indeholdende interne journalnotater, mails og vurderinger.",
    significance: "critical",
    partiesInvolved: ["p-marsha", "p-mette", "p-dav"],
    excerpt: "Journalnotater og interne kommunikationsudvekslinger mellem rådgivere.",
    fileSize: "8.7 MB",
    verified: true
  },
  {
    id: "doc-fabu-2026-0330",
    docNumber: "FABU-UDT-2026-0330",
    title: "FABU Samværsudtalelse Luca (30. marts 2026)",
    date: "2026-03-30",
    sourceType: "pdf",
    category: "FABU og samvær",
    fileFormat: "PDF / Samværsrapport",
    author: "FABU",
    summary: "Vurdering af Lucas adfærd før, under og efter samvær foråret 2026.",
    significance: "critical",
    partiesInvolved: ["p-luca", "p-fabu"],
    excerpt: "Detaljerede observationsnoter fra samværskonsulenterne.",
    fileSize: "1.8 MB",
    verified: true
  },
  {
    id: "doc-fabu-2026-04",
    docNumber: "FABU-UDT-2026-04",
    title: "FABU Udtalelser 15. april & 22. april 2026",
    date: "2026-04-22",
    sourceType: "pdf",
    category: "FABU og samvær",
    fileFormat: "PDF / Samværsrapport",
    author: "FABU",
    summary: "Kombinerede samværsudtalelser dækkende to på hinanden følgende forløb i april 2026.",
    significance: "noteworthy",
    partiesInvolved: ["p-luca", "p-fabu"],
    excerpt: "Sammenfattende vurdering af barnets reaktionsmønstre og relationelle tryghed.",
    fileSize: "2.3 MB",
    verified: true
  },
  {
    id: "doc-bu-afg-2026-0529",
    docNumber: "BU-AFG-2026-0529",
    title: "Børn og Unge-udvalgsmøde d. 29. maj - Afgørelsen & Referat",
    date: "2026-05-29",
    sourceType: "pdf",
    category: "Sagsakter og afgørelser",
    fileFormat: "PDF / B&U Udvalgsafgørelse",
    author: "Børn- og Ungeudvalget i Lyngby-Taarbæk Kommune",
    summary: "Formel politisk/administrativ afgørelse og referat fra udvalgsmødet d. 29. maj.",
    significance: "critical",
    partiesInvolved: ["p-marsha", "p-luca", "p-dav", "p-dennis"],
    excerpt: "Udvalgets afstemningsresultat og formelle retsgrundlag for foranstaltningen.",
    fileSize: "3.5 MB",
    verified: true
  },
  {
    id: "doc-fabu-2026-0624",
    docNumber: "FABU-UDT-2026-0624",
    title: "FABU 24. Juni 2026 Samværsudtalelse Luca",
    date: "2026-06-24",
    sourceType: "pdf",
    category: "FABU og samvær",
    fileFormat: "PDF / Samværsrapport",
    author: "FABU",
    summary: "Frisk samværsudtalelse umiddelbart forud for sommerferieperioden 2026.",
    significance: "critical",
    partiesInvolved: ["p-luca", "p-fabu"],
    excerpt: "Observationer af samspillet og barnets trivsel i de overvågede rammer.",
    fileSize: "1.7 MB",
    verified: true
  },
  {
    id: "doc-bilag-1-51",
    docNumber: "BILAG-KOMPLET-1-51",
    title: "Samlet Bilagssamling 1-29 & 30-51",
    date: "2026-06-01",
    sourceType: "pdf",
    category: "Sagsakter og afgørelser",
    folderCategory: "Social Services",
    subfolderPath: "Lyngby-Taarbæk case/5. Kommunale Sagsakter",
    fileFormat: "PDF / Dokumentpakke",
    author: "Advokat / Forældre",
    summary: "Nummererede bilag 1 til 51 indeholdende sms-udvekslinger, kvitteringer, lægenotater og logs.",
    significance: "critical",
    partiesInvolved: ["p-dav", "p-dennis", "p-marsha", "p-luca", "p-liam"],
    excerpt: "Dokumentation og beviskatalog fremlagt for forvaltningen og retten.",
    fileSize: "14.5 MB",
    verified: true
  },
  // ==========================================
  // 1. LYD & AFLYTNINGER (Audio & Wiretaps)
  // ==========================================
  {
    id: "doc-audio-liam-nov2",
    docNumber: "AUDIO-LIAM-2025-1102-A",
    title: "Liam 2. november - Børneberetning (Lydbånd)",
    date: "2025-11-02",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Liam (Barn) & Dav",
    summary: "Råbåndoptagelse hvor Liam spontant beskriver hændelser i hjemmet, voldsom adfærd og frygt.",
    significance: "critical",
    partiesInvolved: ["p-liam", "p-dav", "p-louise", "p-dennis"],
    excerpt: "Liam fortæller med egne ord om konflikter, utryghed og episoder der fandt sted forud for underretning.",
    fileSize: "18.4 MB",
    mediaDuration: "14:20 min",
    verified: true,
    audioMeta: {
      duration: "14:20 min",
      bitrate: "256 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Voice Memo HD (iPhone 14 Pro)",
      recordedDate: "2025-11-02 18:42 CET",
      participants: ["Liam", "Dav"]
    }
  },
  {
    id: "doc-audio-liam-nov2-part3",
    docNumber: "AUDIO-LIAM-2025-1102-B",
    title: "Liam 3 2 november - Fortsat beretning (Lydbånd)",
    date: "2025-11-02",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Liam (Barn) & Dav",
    summary: "Supplerende råbånd hvor Liam uddyber hverdagsrutiner og samspil med stedfar Dennis.",
    significance: "critical",
    partiesInvolved: ["p-liam", "p-dav", "p-dennis"],
    excerpt: "Barnets detaljerede beskrivelse af stemningen i hjemmet og episoder ved sengetid.",
    fileSize: "24.1 MB",
    mediaDuration: "18:45 min",
    verified: true,
    audioMeta: {
      duration: "18:45 min",
      bitrate: "256 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Voice Memo HD",
      recordedDate: "2025-11-02 20:15 CET",
      participants: ["Liam", "Dav"]
    }
  },
  {
    id: "doc-audio-dennis-threat",
    docNumber: "AUDIO-DENNIS-THREAT-01",
    title: "4. Dennis truer med politiet & Samtalekonfrontation",
    date: "2025-08-14",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Dennis & Dav",
    summary: "Optaget telefonsamtale hvor Dennis fremsætter trusler om politianmeldelse og blokerer aftalt samvær.",
    significance: "critical",
    partiesInvolved: ["p-dennis", "p-dav"],
    excerpt: "Dennis afviser dialog og fremsætter verbale trusler om at tilkalde Nordsjællands Politi uden gyldig grund.",
    fileSize: "11.2 MB",
    mediaDuration: "08:12 min",
    verified: true,
    audioMeta: {
      duration: "08:12 min",
      bitrate: "192 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Call Recorder Pro",
      recordedDate: "2025-08-14 16:30 CET",
      participants: ["Dennis", "Dav"]
    }
  },
  {
    id: "doc-audio-meeting-jan15",
    docNumber: "AUDIO-LTK-MEETING-2026-0115",
    title: "15. januar 2026 Møde i Forvaltningen (Marsha & Mette)",
    date: "2026-01-15",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / MP3",
    author: "Marsha, Mette & Dav",
    summary: "Komplet lydoptagelse af 1 times statusmøde i Lyngby-Taarbæk Kommune omhandlende partshøring og aktindsigt.",
    significance: "critical",
    partiesInvolved: ["p-marsha", "p-mette", "p-dav"],
    excerpt: "Konfrontation med forvaltningens modstridende notater om samværsudtalelser og manglende journalisering.",
    fileSize: "68.5 MB",
    mediaDuration: "58:40 min",
    verified: true,
    audioMeta: {
      duration: "58:40 min",
      bitrate: "320 kbps",
      sampleRate: "48.0 kHz",
      recordingDevice: "Olympus WS-853 Voice Recorder",
      recordedDate: "2026-01-15 13:00 CET",
      participants: ["Marsha", "Mette", "Dav"]
    },
    ocrText: `TRANSKRIPTION AF MØDE MED FORVALTNINGEN — 15. JANUAR 2026
Mødedeltagere: Marsha (Sagsbehandler), Mette (Teamleder/Børne- og Familierådgiver), Dav (Far).
Sted: Familieafdelingen, Lyngby-Taarbæk Kommune.
Tidspunkt: 13:00 - 13:58 CET.

[00:00 - 05:20] Indledende formalia og dagsorden.
[12:15 - 18:40] Gennemgang af urinprøver og narkotikatest.
Far (Dav): "I har fastholdt anbringelsesgrundlaget under henvisning til mistanke om stoffer. Men samtlige urinprøver fra laboratoriet har været 100% rene. Hvorfor fremgår de negative tests ikke af det seneste notat til retten?"
Mette (Forvaltningen): "Vi anerkender, at testene har været negative, og at der ikke er påvist substanser. Vores oprindelige bekymring beroede på indberetningerne fra 2022."

[24:15 - 28:30] Erkendelse af sagsbehandlingsfejl og udeladelse af undskyldning.
Marsha: "Vi må bare beklage det samlede forløb. Vi erkender, at forældrekompetenceundersøgelsen og flere af de tidligere notater indeholder uhensigtsmæssige tolkninger og misforståelser af jeres adfærd. Det har skabt en unødig konflikt."
Far (Dav): "Vil I føre denne beklagelse til protokols, så Byretten og Ankestyrelsen får det korrekte billede?"
Mette: "Vi tager det med i vores interne opfølgning."

[35:10 - 42:00] FABU-rapporter og manglende fremlæggelse for B&U-udvalget.
Far: "Hvorfor fik udvalget ikke FABU-rapporten fra 1. september 2023, hvor det udtrykkeligt beskrives, at Lucas tilknytning og samvær er trygt og kærligt?"
Marsha: "Det var en forglemmelse i sagsmappen op til udvalgsmødet i maj 2024."

[50:00 - 58:40] Afsluttende konfrontation og aktindsigtsanmodning.`,
    ocrAnnotations: [
      {
        id: "annot-jan15-01",
        docId: "doc-audio-meeting-jan15",
        selectedText: "Vi må bare beklage det samlede forløb. Vi erkender, at forældrekompetenceundersøgelsen og flere af de tidligere notater indeholder uhensigtsmæssige tolkninger og misforståelser af jeres adfærd.",
        createdAt: "2026-01-16",
        color: "red",
        tags: ["Undskyldning-Slettet", "Anomali", "Officialprincip"],
        linkedPartyId: "p-marsha",
        linkedPartyName: "Marsha",
        linkedEventId: "evt-2026-01-15",
        linkedEventTitle: "2026-01-15: Møde med Marsha & Mette i Forvaltningen",
        comment: "KARDINALBEVIS: Forvaltningen indrømmer mundtligt graverende fejl i forældrekompetenceundersøgelsen, men udelader det i det officielle referat til Byretten.",
        stepTag: "Trin 3: Hanlon's Razor",
        investigatorFlag: "suspicious"
      },
      {
        id: "annot-jan15-02",
        docId: "doc-audio-meeting-jan15",
        selectedText: "Vi anerkender, at testene har været negative, og at der ikke er påvist substanser.",
        createdAt: "2026-01-16",
        color: "green",
        tags: ["Negativ-Urintest", "FalskMisbrug"],
        linkedPartyId: "p-mette",
        linkedPartyName: "Mette",
        linkedEventId: "evt-2026-01-15",
        linkedEventTitle: "2026-01-15: Møde med Marsha & Mette i Forvaltningen",
        comment: "Frikendende bevis: Forvaltningen bekræfter at mistanken om misbrug er ubegrundet.",
        stepTag: "Trin 1: Anti-Bias",
        investigatorFlag: "verified"
      },
      {
        id: "annot-jan15-03",
        docId: "doc-audio-meeting-jan15",
        selectedText: "Det var en forglemmelse i sagsmappen op til udvalgsmødet i maj 2024.",
        createdAt: "2026-01-16",
        color: "blue",
        tags: ["FABU-Observation", "Procedurefejl", "Mørklægning"],
        linkedPartyId: "p-marsha",
        linkedPartyName: "Marsha",
        linkedEventId: "evt-2026-05-29",
        linkedEventTitle: "2026-05-29: Børn og Unge-udvalgsmøde i Lyngby-Taarbæk",
        comment: "Groft brud på Forvaltningslovens § 10 (officialprincippet) ved at tilbageholde positive FABU-samværsudtalelser for det politiske udvalg.",
        stepTag: "Trin 4: Kildekritik",
        investigatorFlag: "suspicious"
      }
    ]
  },
  {
    id: "doc-audio-gribskov-june23",
    docNumber: "AUDIO-GRIBSKOV-2023-0609",
    title: "Gribskov Kommune 9. juni 2023 - Rådgivermøde",
    date: "2023-06-09",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Gribskov Kommune Rådgivere & Forældre",
    summary: "Optagelse fra tidlig sagsbehandling vedrørende underretningspligt og journalføring af børnebekymringer.",
    significance: "noteworthy",
    partiesInvolved: ["p-dav", "p-liam"],
    excerpt: "Gennemgang af historiske underretninger og forvaltningens håndtering af konflikter.",
    fileSize: "44.8 MB",
    mediaDuration: "35:04 min",
    verified: true,
    audioMeta: {
      duration: "35:04 min",
      bitrate: "192 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Voice Memo",
      recordedDate: "2023-06-09 11:00 CET",
      participants: ["Gribskov Rådgivere", "Dav"]
    }
  },
  {
    id: "doc-audio-nordstjerne-michael",
    docNumber: "AUDIO-NORDSTJERNE-2025-1118",
    title: "Nordstjerneskolen Møde med Skoleleder Michael",
    date: "2025-11-18",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Skoleleder Michael, Lærere & Dav",
    summary: "Skolemøde vedrørende Liams trivsel, skolevægring, trivselsnotater og skolelederens observationer.",
    significance: "critical",
    partiesInvolved: ["p-nordstjerne-michael", "p-liam", "p-dav"],
    excerpt: "Skolelederen bekræfter observationer af mistrivsel og drøfter underretningsprocessen.",
    fileSize: "56.0 MB",
    mediaDuration: "47:30 min",
    verified: true,
    audioMeta: {
      duration: "47:30 min",
      bitrate: "256 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Voice Memo HD",
      recordedDate: "2025-11-18 14:00 CET",
      participants: ["Michael (Skoleleder)", "Dav"]
    }
  },
  {
    id: "doc-audio-amalie-rikke-jan31",
    docNumber: "AUDIO-FAMILIE-2025-0131",
    title: "Amalie & Rikke Vejledningsmøde d. 31. januar 2025",
    date: "2025-01-31",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Amalie, Rikke & Dav",
    summary: "Familiebehandlingssamtale om målsætninger for samvær og dokumentation af børnenes emotionelle tilstand.",
    significance: "noteworthy",
    partiesInvolved: ["p-amalie-rikke", "p-dav", "p-luca"],
    excerpt: "Gennemgang af familiens samværsdynamik og behandlernes faglige input.",
    fileSize: "49.2 MB",
    mediaDuration: "42:15 min",
    verified: true,
    audioMeta: {
      duration: "42:15 min",
      bitrate: "256 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Voice Memo",
      recordedDate: "2025-01-31 10:00 CET",
      participants: ["Amalie", "Rikke", "Dav"]
    }
  },
  {
    id: "doc-audio-amalie-rikke-dec20",
    docNumber: "AUDIO-FAMILIE-2024-1220",
    title: "Amalie & Rikke 20. dec 2024 (Før-julemøde)",
    date: "2024-12-20",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Amalie, Rikke & Dav",
    summary: "Møde forud for juleferien om samværsfordeling og stabilitet i overleveringer.",
    significance: "noteworthy",
    partiesInvolved: ["p-amalie-rikke", "p-dav"],
    excerpt: "Drøftelse af afleveringsrutiner og forebyggelse af konflikter under højtider.",
    fileSize: "41.5 MB",
    mediaDuration: "38:10 min",
    verified: true,
    audioMeta: {
      duration: "38:10 min",
      bitrate: "256 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Voice Memo",
      recordedDate: "2024-12-20 11:30 CET",
      participants: ["Amalie", "Rikke", "Dav"]
    }
  },
  {
    id: "doc-audio-ulla-refusal",
    docNumber: "AUDIO-LTK-ULLA-2026-0205",
    title: "Telefonsamtale med Sagsbehandler Ulla - Afvisning af aktindsigt",
    date: "2026-02-05",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Sagsbehandler Ulla & Dav",
    summary: "Telefonsamtale hvor sagsbehandler afviser at udlevere specifikke interne notater med henvisning til arbejdsgange.",
    significance: "critical",
    partiesInvolved: ["p-marsha", "p-dav"],
    excerpt: "Forvaltningens mundtlige begrundelse for tilbageholdelse af dokumenter i strid med Forvaltningsloven § 9.",
    fileSize: "18.1 MB",
    mediaDuration: "15:22 min",
    verified: true,
    audioMeta: {
      duration: "15:22 min",
      bitrate: "192 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Call Recorder Pro",
      recordedDate: "2026-02-05 09:45 CET",
      participants: ["Sagsbehandler Ulla", "Dav"]
    }
  },
  {
    id: "doc-audio-dennis-call-aug",
    docNumber: "AUDIO-DENNIS-CALL-2025-0824",
    title: "Dennis opkald 24. august - Nægtelse af overlevering",
    date: "2025-08-24",
    sourceType: "audio",
    category: "Lyd og aflytninger",
    folderCategory: "Audio Transcripts",
    subfolderPath: "Lyngby-Taarbæk case/1. Lyd & Aflytninger",
    fileFormat: "Audio / M4A",
    author: "Dennis & Dav",
    summary: "Telefonoptagelse hvor Dennis ensidigt aflyser samværsoverlevering og nægter at svare på henvendelser.",
    significance: "critical",
    partiesInvolved: ["p-dennis", "p-dav", "p-luca"],
    excerpt: "Dokumentation af bevidst samværschikane og manglende overholdelse af byretsdommens vilkår.",
    fileSize: "14.2 MB",
    mediaDuration: "11:30 min",
    verified: true,
    audioMeta: {
      duration: "11:30 min",
      bitrate: "192 kbps",
      sampleRate: "44.1 kHz",
      recordingDevice: "Call Recorder Pro",
      recordedDate: "2025-08-24 15:10 CET",
      participants: ["Dennis", "Dav"]
    }
  },

  // ==========================================
  // 2. BILLEDER & FORENSISKE FOTOS (Photos & Forensic Images)
  // ==========================================
  {
    id: "doc-photo-bruise-evidence",
    docNumber: "FOTO-FORENSIC-014",
    title: "Forensisk Fotodokumentation - Mærker & Fysisk Trivsel (Bilag 14)",
    date: "2025-11-03",
    sourceType: "image",
    category: "Billeder og fotos",
    folderCategory: "Forensic Photos",
    subfolderPath: "Lyngby-Taarbæk case/2. Billeder & Forensiske Fotos",
    fileFormat: "Image / JPG (EXIF Verificeret)",
    author: "Forensisk Foto / Indsendt Bilag",
    summary: "Højopløselig fotodokumentation af fysiske mærker på barnet med verificeret EXIF tidsstempel og kamerasignatur.",
    significance: "critical",
    partiesInvolved: ["p-liam", "p-dav", "p-marsha"],
    excerpt: "Billedbevis fremlagt til underretning. EXIF metadata bekræfter optagetidspunkt uden digital manipulation.",
    fileSize: "6.8 MB",
    imageCaption: "Forensisk nærbillede af mærker på overarm og ryg, taget i naturligt lys med målestok.",
    verified: true,
    exifData: {
      camera: "Apple iPhone 14 Pro Max (Back Camera 48MP)",
      timestamp: "2025-11-03 08:24:12 CET",
      gpsCoordinates: "55.7704° N, 12.5038° E (Lyngby)",
      resolution: "4032 x 3024 px (48 MP ProRAW)",
      fileHash: "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      lens: "24mm f/1.78",
      iso: "ISO 100",
      verifiedChainOfCustody: true
    }
  },
  {
    id: "doc-photo-housing-locks",
    docNumber: "FOTO-BOLIG-021",
    title: "Fotodokumentation - Boligforhold & Dørlåse (Borgmesterhenvendelse)",
    date: "2026-06-02",
    sourceType: "image",
    category: "Billeder og fotos",
    folderCategory: "Forensic Photos",
    subfolderPath: "Lyngby-Taarbæk case/2. Billeder & Forensiske Fotos",
    fileFormat: "Image / PNG",
    author: "Fotodokumentation",
    summary: "Fotografisk registrering af låseanordninger på børneværelsesdøre og fysiske adgangsforhold indsendt til Borgmester Sofia Osmani.",
    significance: "critical",
    partiesInvolved: ["p-osmani", "p-dav", "p-liam"],
    excerpt: "Visuel dokumentation af monterede låse og rumlige begrænsninger i boligen som grundlag for forvaltningsklage.",
    fileSize: "4.5 MB",
    imageCaption: "Oversigtsbillede af værelsesdør med udvendig rigle og låseanordning.",
    verified: true,
    exifData: {
      camera: "Sony Alpha 7 IV (FE 24-70mm GM II)",
      timestamp: "2026-06-02 11:15:30 CET",
      gpsCoordinates: "55.7712° N, 12.5020° E",
      resolution: "6000 x 4000 px (24 MP)",
      fileHash: "SHA256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      verifiedChainOfCustody: true
    }
  },
  {
    id: "doc-photo-sms-threats",
    docNumber: "FOTO-SMS-FORENSIC-022",
    title: "Skærmbillede-forensik - WhatsApp & SMS trusselstråde fra Dennis (Bilag 22)",
    date: "2025-08-20",
    sourceType: "image",
    category: "Billeder og fotos",
    folderCategory: "Forensic Photos",
    subfolderPath: "Lyngby-Taarbæk case/2. Billeder & Forensiske Fotos",
    fileFormat: "Image / PNG",
    author: "Digital Forensik / Bilag 22",
    summary: "Sekvens af verificerede skærmbilleder med kryptografisk tidsstempel, visende aggressive trusler og afpresning om samvær.",
    significance: "critical",
    partiesInvolved: ["p-dennis", "p-dav"],
    excerpt: "Skærmdump af tråde med Dennis der truer med politi, falske anmeldelser og isolation fra børnene.",
    fileSize: "3.2 MB",
    imageCaption: "Fuld screenshot-kæde med afsender-id, klokkeslæt og netværksstatus synlig.",
    verified: true,
    exifData: {
      camera: "iOS Screenshot Engine",
      timestamp: "2025-08-20 22:45:10 CET",
      resolution: "1179 x 2556 px",
      fileHash: "SHA256:3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b",
      verifiedChainOfCustody: true
    }
  },
  {
    id: "doc-photo-school-diary",
    docNumber: "FOTO-SKOLE-031",
    title: "Skolelog & Elevbogsnotater - Nordstjerneskolen (Bilag 31)",
    date: "2025-11-15",
    sourceType: "image",
    category: "Billeder og fotos",
    folderCategory: "Forensic Photos",
    subfolderPath: "Lyngby-Taarbæk case/2. Billeder & Forensiske Fotos",
    fileFormat: "Image / JPG",
    author: "Nordstjerneskolen / Elevmappe",
    summary: "Fotokopi af håndskrevne elevbogsnotater og tegninger fra Liam, der dokumenterer følelsesmæssig stress i skolen.",
    significance: "noteworthy",
    partiesInvolved: ["p-liam", "p-nordstjerne-michael"],
    excerpt: "Pædagogiske noter og barnets egne tegninger indleveret som del af trivselsundersøgelsen.",
    fileSize: "5.1 MB",
    imageCaption: "Højopløseligt foto af elevbog med datoangivelser fra klasselæreren.",
    verified: true,
    exifData: {
      camera: "Canon EOS R6 Mark II",
      timestamp: "2025-11-15 16:10:00 CET",
      resolution: "4500 x 3000 px",
      fileHash: "SHA256:c7be1a80d5071dfa2ab96c6d04ab9668d2797e88d7522502f6bc1bc94541ff43",
      verifiedChainOfCustody: true
    }
  },
  {
    id: "doc-photo-visitation-handover",
    docNumber: "FOTO-SAMVAER-035",
    title: "Fotodokumentation - Samværsoverlevering ved FABU lokaler",
    date: "2026-04-15",
    sourceType: "image",
    category: "Billeder og fotos",
    folderCategory: "Forensic Photos",
    subfolderPath: "Lyngby-Taarbæk case/2. Billeder & Forensiske Fotos",
    fileFormat: "Image / JPG",
    author: "Fotodokumentation",
    summary: "Tidsstemplet fotodokumentation for overlevering af Luca ved FABU lokaler, der bekræfter rettidig ankomst.",
    significance: "routine",
    partiesInvolved: ["p-luca", "p-dav", "p-fabu"],
    excerpt: "Dokumentation af fremmøde til støttet samvær som modbevis mod forvaltningens påstand om udeblivelse.",
    fileSize: "3.8 MB",
    imageCaption: "Facaderegistrering ved FABU indgang med GPS og ur-verifikation.",
    verified: true,
    exifData: {
      camera: "iPhone 14 Pro",
      timestamp: "2026-04-15 09:55:04 CET",
      gpsCoordinates: "55.6833° N, 12.5667° E (København)",
      resolution: "4032 x 3024 px",
      fileHash: "SHA256:12c4c0e648c66e2c366e6b5d92e5c8e31a98075775836a9925692015df36f56c",
      verifiedChainOfCustody: true
    }
  },
  {
    id: "doc-photo-medical-injuries",
    docNumber: "FOTO-MED-042",
    title: "Klinisk Fotodokumentation - Besigtigelsesnotat & Skadekort",
    date: "2025-11-04",
    sourceType: "image",
    category: "Billeder og fotos",
    folderCategory: "Forensic Photos",
    subfolderPath: "Lyngby-Taarbæk case/2. Billeder & Forensiske Fotos",
    fileFormat: "Image / JPG",
    author: "Lægelig Konsultation / Lægevagt",
    summary: "Fotodokumenteret journalbilag fra lægebesøg, der attesterer overfladiske hudafskrabninger og mærker.",
    significance: "critical",
    partiesInvolved: ["p-liam", "p-dav"],
    excerpt: "Lægefaglig besigtigelse og registrering tilknyttet underretning til de sociale myndigheder.",
    fileSize: "7.2 MB",
    imageCaption: "Lægens fotodokumentation vedhæftet den kliniske journaludskrift.",
    verified: true,
    exifData: {
      camera: "Nikon Z6 II (Klinisk kamera)",
      timestamp: "2025-11-04 10:30:15 CET",
      resolution: "5000 x 3333 px",
      fileHash: "SHA256:f52d0a4c28f64de3e786ef77f154f4943f9a738676a0868f764a7ef7bf2a7b3b",
      verifiedChainOfCustody: true
    }
  },

  // ==========================================
  // 3. E-MAILS & KORRESPONDANCE (Emails & Written Correspondence)
  // ==========================================
  {
    id: "doc-email-borgmester-klage",
    docNumber: "MAIL-OSMANI-2026-0604",
    title: "Formel Tilsynsklage til Borgmester Sofia Osmani (4. juni 2026)",
    date: "2026-06-04",
    sourceType: "email",
    category: "E-mails og korrespondance",
    folderCategory: "Correspondence & Logs",
    subfolderPath: "Lyngby-Taarbæk case/3. E-mails & Korrespondance",
    fileFormat: "E-mail / EML & PDF Bilag",
    author: "Dav (Forælder) til Borgmester Sofia Osmani",
    summary: "Formel og udførlig tilsynsklage stilet til Borgmester Sofia Osmani over forvaltningens lovbrud, udeladelse af FABU-rapporter og B&U udvalgsbehandlingen.",
    significance: "critical",
    partiesInvolved: ["p-osmani", "p-dav", "p-marsha"],
    excerpt: "Redegørelse for systemisk magtfordrejning, tilsidesættelse af notatpligt og anmodning om uvildig forvaltningsrevision.",
    fileSize: "3.4 MB",
    verified: true,
    emailHeaders: {
      from: "dav@davluca.forensic.dk",
      to: "sofia.osmani@ltk.dk, borgmesterkontoret@ltk.dk",
      cc: "kommunaldirektoer@ltk.dk, tilsynet@ankestyrelsen.dk",
      subject: "Formel Tilsynsklage over forvaltningssvigt og lovbrud i Børn & Familie (Sagsnr. LTK-2022-8819)",
      sentDate: "2026-06-04 08:30 CET",
      messageId: "<20260604083012.88190@davluca.forensic.dk>",
      attachmentsCount: 14
    }
  },
  {
    id: "doc-email-marsha-aktindsigt",
    docNumber: "MAIL-MARSHA-2026-0112",
    title: "E-mail anmodning om aktindsigt og berigtigelse af fejlnotater (Til Marsha)",
    date: "2026-01-12",
    sourceType: "email",
    category: "E-mails og korrespondance",
    folderCategory: "Correspondence & Logs",
    subfolderPath: "Lyngby-Taarbæk case/3. E-mails & Korrespondance",
    fileFormat: "E-mail / EML",
    author: "Dav til Sagsbehandler Marsha",
    summary: "Skriftlig partshøringsindsigelse fremsendt via e-mail med krav om sletning af faktuelt forkerte notater og udlevering af fuldstændig aktliste.",
    significance: "critical",
    partiesInvolved: ["p-marsha", "p-dav"],
    excerpt: "Dokumenteret anmodning jf. Forvaltningslovens § 9 og Databeskyttelsesforordningens art. 16 om berigtigelse.",
    fileSize: "1.2 MB",
    verified: true,
    emailHeaders: {
      from: "dav@davluca.forensic.dk",
      to: "marsha.b@ltk.dk",
      cc: "boernogfamilie@ltk.dk",
      subject: "Haster: Anmodning om fuld aktindsigt og indsigelse mod sagsnotat d. 10. januar",
      sentDate: "2026-01-12 14:15 CET",
      messageId: "<20260112141522.10293@davluca.forensic.dk>",
      attachmentsCount: 3
    }
  },
  {
    id: "doc-email-fabu-coordination",
    docNumber: "MAIL-FABU-2026-0325",
    title: "E-mailkorrespondance med FABU Ledelse vedr. samværsplanlægning",
    date: "2026-03-25",
    sourceType: "email",
    category: "E-mails og korrespondance",
    folderCategory: "Correspondence & Logs",
    subfolderPath: "Lyngby-Taarbæk case/3. E-mails & Korrespondance",
    fileFormat: "E-mail / EML",
    author: "FABU Samværskoordinator & Dav",
    summary: "Skriftlig bekræftelse fra FABU på aftalte samværsdatoer og observationstider for Luca foråret 2026.",
    significance: "noteworthy",
    partiesInvolved: ["p-fabu", "p-dav", "p-luca"],
    excerpt: "FABU bekræfter positiv fremgang og stabilitet i relationen mellem Luca og forælder.",
    fileSize: "850 KB",
    verified: true,
    emailHeaders: {
      from: "koordinator@fabu.dk",
      to: "dav@davluca.forensic.dk",
      subject: "Samværsplan for april-maj 2026 vedr. Luca",
      sentDate: "2026-03-25 11:20 CET",
      messageId: "<fabu.20260325.7721@fabu.dk>",
      attachmentsCount: 1
    }
  },
  {
    id: "doc-email-nordstjerne-response",
    docNumber: "MAIL-NORDSTJERNE-2025-1120",
    title: "Skriftlig henvendelse & svar fra Skoleleder Michael om trivselsnotat",
    date: "2025-11-20",
    sourceType: "email",
    category: "E-mails og korrespondance",
    folderCategory: "Correspondence & Logs",
    subfolderPath: "Lyngby-Taarbæk case/3. E-mails & Korrespondance",
    fileFormat: "E-mail / EML",
    author: "Skoleleder Michael til Dav",
    summary: "E-mailtråd hvor skolelederen bekræfter modtagelse af bekymringsskrivelse og orienterer om skolens handlepligt.",
    significance: "noteworthy",
    partiesInvolved: ["p-nordstjerne-michael", "p-dav", "p-liam"],
    excerpt: "Skolens skriftlige stillingtagen til Liams faglige og sociale trivsel i skoleforløbet.",
    fileSize: "1.1 MB",
    verified: true,
    emailHeaders: {
      from: "michael.leder@gribskov.dk",
      to: "dav@davluca.forensic.dk",
      subject: "Vedr. opfølgning på skolekonference d. 18. november",
      sentDate: "2025-11-20 15:40 CET",
      messageId: "<nordstjerne.20251120.9912@gribskov.dk>",
      attachmentsCount: 2
    }
  },
  {
    id: "doc-email-eboks-bu-receipt",
    docNumber: "MAIL-EBOKS-BU-2026-0525",
    title: "e-Boks Kvittering & Partshøring til B&U Udvalgsmøde 29. maj",
    date: "2026-05-25",
    sourceType: "email",
    category: "E-mails og korrespondance",
    folderCategory: "Correspondence & Logs",
    subfolderPath: "Lyngby-Taarbæk case/3. E-mails & Korrespondance",
    fileFormat: "e-Boks / Digital Post & PDF",
    author: "Lyngby-Taarbæk Kommune (Digital Post)",
    summary: "Officiel e-Boks kvittering for modtagelse af omfattende partshøringsmateriale 4 dage før udvalgsmødet.",
    significance: "critical",
    partiesInvolved: ["p-marsha", "p-dav", "p-osmani"],
    excerpt: "Digital signatur og tidsstempel der beviser, at forvaltningen rådede over modbeviserne før afstemningen.",
    fileSize: "2.1 MB",
    verified: true,
    emailHeaders: {
      from: "post@digitalpost.dk (Lyngby-Taarbæk Kommune)",
      to: "dav@digitalpost.dk",
      subject: "Kvittering for fremsendelse af partshøringssvar (B&U Sagsnr. 2026-1102)",
      sentDate: "2026-05-25 16:55 CET",
      messageId: "<eboks.rec.20260525.44199@cvr.ltk.dk>",
      attachmentsCount: 8
    }
  },
  {
    id: "doc-email-ankestyrelsen-appeal",
    docNumber: "MAIL-ANKE-2026-0610",
    title: "Ankeskrivelse & e-mail korrespondance til Ankestyrelsen",
    date: "2026-06-10",
    sourceType: "email",
    category: "E-mails og korrespondance",
    folderCategory: "Correspondence & Logs",
    subfolderPath: "Lyngby-Taarbæk case/3. E-mails & Korrespondance",
    fileFormat: "E-mail & Ankeformular / EML & PDF",
    author: "Dav / Advokat til Ankestyrelsen",
    summary: "Formel klage til Ankestyrelsen over B&U Udvalgets afgørelse med henvisning til manglende proportionalitet og sagsoplysning.",
    significance: "critical",
    partiesInvolved: ["p-dav", "p-marsha", "p-luca"],
    excerpt: "Fremlæggelse af de udeladte FABU samværsudtalelser og lydtransskriptioner over for Ankestyrelsen.",
    fileSize: "5.8 MB",
    verified: true,
    emailHeaders: {
      from: "dav@davluca.forensic.dk",
      to: "ast@ast.dk",
      subject: "Klage over Lyngby-Taarbæk Kommunes B&U afgørelse af 29. maj 2026 (Sagsnr. 2026-1102)",
      sentDate: "2026-06-10 10:00 CET",
      messageId: "<20260610100030.12984@davluca.forensic.dk>",
      attachmentsCount: 19
    }
  },
  {
    id: "doc-email-sms-chain-dennis",
    docNumber: "LOG-SMS-DENNIS-0112",
    title: "SMS Tråd & Logark - Dennis & Dav (Bilag 1-12)",
    date: "2025-09-01",
    sourceType: "email",
    category: "E-mails og korrespondance",
    folderCategory: "Correspondence & Logs",
    subfolderPath: "Lyngby-Taarbæk case/3. E-mails & Korrespondance",
    fileFormat: "Log / PDF & CSV",
    author: "Forensisk Uddrag fra Mobiloperatør",
    summary: "Komplet SMS-log og beskedhistorik mellem Dennis og Dav over 12 måneder med nøjagtige tidsstempler for samværsforespørgsler.",
    significance: "noteworthy",
    partiesInvolved: ["p-dennis", "p-dav"],
    excerpt: "Dokumentation af gentagne venlige henvendelser og efterfølgende afvisninger eller trusler.",
    fileSize: "2.9 MB",
    verified: true,
    emailHeaders: {
      from: "SMS Gateway Log",
      to: "Arkiv",
      subject: "Samlet SMS Log Bilag 1-12 (Dennis & Dav)",
      sentDate: "2025-09-01 00:00 CET",
      attachmentsCount: 12
    }
  }
];

export const TRANSCRIPT_SNIPPETS: TranscriptSnippet[] = [
  {
    id: "tr-liam-01",
    title: "Liam Fortæller (Hjemlige forhold & episoder)",
    date: "2025-11-02",
    speaker: "Liam & Dav",
    summary: "Båndoptagelser af Liam, der fortæller om konkrete hændelser i hjemmet, relationen til Louise og Dennis.",
    keyQuotes: [
      "Liam beskriver episoder i hjemmet og sin utryghed ved bestemte situationer.",
      "Dokumentation af barnets egne ord optaget over flere omgange d. 2. november."
    ],
    verified: true,
    audioDuration: "14:20 min",
    category: "Liam og fortællinger",
    sourceFile: "Liam 2 november.m4a / Liam 3 2 november.m4a",
    significance: "critical"
  },
  {
    id: "tr-amalie-rikke-01",
    title: "Amalie & Rikke Vejledningsmøde",
    date: "2025-01-31",
    speaker: "Amalie, Rikke & Dav",
    summary: "Vejledningssamtale vedrørende familiens trivsel og den pædagogiske indsats.",
    keyQuotes: [
      "Gennemgang af målene for familieindsatsen og forældresamarbejdet.",
      "Diskussion af samværsrammerne og observationerne fra hverdagen."
    ],
    verified: true,
    audioDuration: "42:15 min",
    category: "Amalie og Rikke",
    sourceFile: "Amalie og Rikke vejledning d. 31 jan.m4a",
    significance: "noteworthy"
  },
  {
    id: "tr-kommune-01",
    title: "Møde på Kommunen (Marsha & Mette)",
    date: "2026-01-15",
    speaker: "Marsha, Mette & Dav",
    summary: "Statusmøde i familieafdelingen i Lyngby-Taarbæk om sagens videre forløb og udredningshenvisning.",
    keyQuotes: [
      "Sagsbehandlers begrundelse for de administrative valg og samværsrestriktioner.",
      "Konfrontation med forældrenes partshøringssvar og dokumenterede indsigelser."
    ],
    verified: true,
    audioDuration: "58:40 min",
    category: "Kommunale møder",
    sourceFile: "15 januar 2026 Mette og marsha møde.pdf / Møde d. 15 jan 2026 Mette og Marsha.mp3",
    significance: "critical"
  },
  {
    id: "tr-dennis-politi",
    title: "Dennis truer med politiet & Samtale",
    date: "2025-08-14",
    speaker: "Dennis & Dav",
    summary: "Lydoptagelse af telefonkonfrontation hvor Dennis truer med politianmeldelse i forbindelse med overlevering/samvær.",
    keyQuotes: [
      "Trusler om eskalering til ordensmagten i stedet for at følge aftalte retningslinjer.",
      "Demonstration af det høje konfliktniveau og manglende samarbejdsvilje."
    ],
    verified: true,
    audioDuration: "08:12 min",
    category: "Miscellaneous",
    sourceFile: "4. Dennis truer med politiet.m4a",
    significance: "critical"
  },
  {
    id: "tr-kommune-gribskov",
    title: "Gribskov Kommune Møde",
    date: "2023-06-09",
    speaker: "Kommunale rådgivere Gribskov & Forældre",
    summary: "Mødeoptagelse fra den tidligere sagsbehandling i Gribskov Kommune forud for sagens overførsel/fokus på Lyngby-Taarbæk.",
    keyQuotes: [
      "Drøftelse af tidligere underretninger vedrørende Liam og Luca.",
      "Kommunens tidlige observationer af systemisk uoverensstemmelse i sagsakternes journalisering."
    ],
    verified: true,
    audioDuration: "35:04 min",
    category: "Kommunale møder",
    sourceFile: "Gribskov kommune 9 juni 2023.m4a",
    significance: "noteworthy"
  },
  {
    id: "tr-nordstjerne-skole",
    title: "Nordstjerneskolen Møde med Leder Michael",
    date: "2025-11-18",
    speaker: "Michael (Skoleleder), Lærere & Dav",
    summary: "Skolemøde vedrørende Liams trivsel, fravær og observationer i skolemiljøet.",
    keyQuotes: [
      "Skolens observationer af barnets trivsel og udtalelser.",
      "Dialog om underretningspligt kontra kommunal handleplanskoordinering."
    ],
    verified: true,
    audioDuration: "47:30 min",
    category: "Miscellaneous",
    sourceFile: "Nordstjerneskolen møde med Michael Leder.m4a",
    significance: "high"
  }
];

export const SERIOUS_CLAIMS: SeriousClaim[] = [
  {
    id: "cl-01",
    claimId: "CLM-LTK-001",
    category: "Systemisk Sagsbehandlingssvigt",
    description: "Påstand om at forvaltningen i Lyngby-Taarbæk (v/ Marsha & Mette) har udeladt afgørende modbeviser og FABU-observationer forud for B&U Udvalgets afgørelse d. 29. maj 2026.",
    severity: "critical",
    sourcePartyId: "p-dav",
    targetPartyId: "p-marsha",
    relatedDocIds: ["doc-marsha-afg-2025-02", "doc-bu-afg-2026-0529", "doc-aktindsigt-2026-01"],
    status: "Under Granskning",
    evidenceScore: 92,
    dateLogged: "2026-06-01",
    investigationNotes: "Skal krydstjekkes via 'The Brew Method' Trin 3 (Hanlon's Razor) og Trin 5 (Aktindsigts-krydstjek)."
  },
  {
    id: "cl-02",
    claimId: "CLM-LTK-002",
    category: "Underretningsforsømmelse & Barnets Stemme",
    description: "Påstand om at Liams gentagne beretninger (optaget på lydbånd fra november 2025 til 2026) og underretninger til Gribskov/Lyngby-Taarbæk ikke blev behørigt undersøgt i henhold til Børnekonventionen § 12.",
    severity: "critical",
    sourcePartyId: "p-liam",
    targetPartyId: "p-marsha",
    relatedDocIds: ["doc-bilag-1-51"],
    status: "Aktiv",
    evidenceScore: 88,
    dateLogged: "2026-05-15",
    investigationNotes: "Børnefortællingerne skal holdes op mod de kommunale børnesamtalereferater for at verificere diskrepanser."
  },
  {
    id: "cl-03",
    claimId: "CLM-LTK-003",
    category: "Selektiv Brug af FABU Samværsudtalelser",
    description: "Påstand om at positive samværsudtalelser fra FABU (2022-2026) blev nedtonet til fordel for restriktive foranstaltninger uden proportional begrundelse.",
    severity: "high",
    sourcePartyId: "p-dav",
    targetPartyId: "p-marsha",
    relatedDocIds: ["doc-fabu-2022", "doc-fabu-2023-03", "doc-fabu-2026-0330", "doc-fabu-2026-0624"],
    status: "Under Granskning",
    evidenceScore: 85,
    dateLogged: "2026-06-25",
    investigationNotes: "Sammenligning af FABU's rå observationsrapporter med forvaltningens resuméer i indstillingerne."
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "evt-2022-11-28",
    date: "2022-11-28",
    time: "10:00",
    title: "Første FABU Samværsudtalelse (2022)",
    category: "FABU og samvær",
    sourceType: "document",
    description: "FABU udsteder formel udtalelse vedrørende overvåget samvær for Luca.",
    sourceDocId: "doc-fabu-2022",
    partyIds: ["p-luca", "p-fabu", "p-dav"],
    significance: "high",
    verified: true,
    tags: ["FABU", "Samvær", "2022"]
  },
  {
    id: "evt-2023-03-31",
    date: "2023-03-31",
    time: "14:30",
    title: "Handleplan v2 Udarbejdet (e-Boks)",
    category: "Sagsakter og afgørelser",
    sourceType: "document",
    description: "Kommunal handleplan v2 fremsendes via e-Boks med rammer for familieindsatsen.",
    sourceDocId: "doc-handleplan-2023",
    partyIds: ["p-luca", "p-marsha"],
    significance: "critical",
    verified: true,
    tags: ["Handleplan", "Serviceloven"]
  },
  {
    id: "evt-2023-06-09",
    date: "2023-06-09",
    time: "11:00",
    title: "Møde i Gribskov Kommune",
    category: "Kommunale møder",
    sourceType: "audio",
    description: "Mødeoptagelse fra forvaltningen i Gribskov vedrørende underretninger på Liam.",
    sourceDocId: "tr-kommune-gribskov",
    partyIds: ["p-dav", "p-liam"],
    significance: "medium",
    verified: true,
    tags: ["Gribskov", "Lydoptagelse"]
  },
  {
    id: "evt-2024-06-15",
    date: "2024-06-15",
    time: "09:30",
    title: "Byrettens Dom Afsagt",
    category: "Sagsakter og afgørelser",
    sourceType: "document",
    description: "Byretten i Lyngby afsiger dom i forældremyndigheds- og samværssagen.",
    sourceDocId: "doc-byret-dom",
    partyIds: ["p-luca", "p-dav", "p-dennis"],
    significance: "critical",
    verified: true,
    tags: ["Byretten", "Dom", "Forældreansvar"]
  },
  {
    id: "evt-2024-12-20",
    date: "2024-12-20",
    time: "13:00",
    title: "Amalie og Rikke Vejledningsforløb (Jul 2024)",
    category: "Amalie og Rikke",
    sourceType: "audio",
    description: "Familiebehandlingsmøde optaget op til juleferien om samværsstruktur.",
    partyIds: ["p-amalie-rikke", "p-dav"],
    significance: "medium",
    verified: true,
    tags: ["Amalie & Rikke", "Lydoptagelse"]
  },
  {
    id: "evt-2025-02-26",
    date: "2025-02-26",
    time: "10:15",
    title: "Marsha Forvaltningsafgørelse",
    category: "Sagsakter og afgørelser",
    sourceType: "document",
    description: "Afgørelse truffet af sagsbehandler Marsha i Lyngby-Taarbæk Kommune.",
    sourceDocId: "doc-marsha-afg-2025-02",
    partyIds: ["p-marsha", "p-dav"],
    significance: "critical",
    verified: true,
    tags: ["Afgørelse", "Lyngby-Taarbæk"]
  },
  {
    id: "evt-2025-03-12",
    date: "2025-03-12",
    time: "11:00",
    title: "Afgørelse om Støttet Samvær (Marsha)",
    category: "Sagsakter og afgørelser",
    sourceType: "document",
    description: "Forvaltningen begrænser eller ændrer samværet til støttet samvær.",
    sourceDocId: "doc-marsha-stottet-2025-03",
    partyIds: ["p-marsha", "p-luca", "p-dav"],
    significance: "critical",
    verified: true,
    tags: ["Støttet Samvær", "Afgørelse"]
  },
  {
    id: "evt-2025-11-02",
    date: "2025-11-02",
    time: "16:00",
    title: "Liam Fortæller - Omfattende Børneberetning",
    category: "Liam og fortællinger",
    sourceType: "audio",
    description: "Optagelser af barnets udtalelser om hverdagen, relationer og bekymringer.",
    sourceDocId: "tr-liam-01",
    partyIds: ["p-liam", "p-dav"],
    significance: "critical",
    verified: true,
    tags: ["Liam", "Lydbånd", "Børneudsagn"]
  },
  {
    id: "evt-2026-01-15",
    date: "2026-01-15",
    time: "10:00",
    title: "Møde med Marsha & Mette i Forvaltningen",
    category: "Kommunale møder",
    sourceType: "audio",
    description: "Konfrontations- og statusmøde om udredning og aktindsigtsanmodninger.",
    sourceDocId: "tr-kommune-01",
    partyIds: ["p-marsha", "p-mette", "p-dav"],
    significance: "critical",
    verified: true,
    tags: ["Møde", "Marsha", "Lydoptagelse"]
  },
  {
    id: "evt-2026-05-29",
    date: "2026-05-29",
    time: "13:00",
    title: "Børn og Unge-udvalgsmøde i Lyngby-Taarbæk",
    category: "Sagsakter og afgørelser",
    sourceType: "document",
    description: "B&U Udvalget træffer formel afgørelse på baggrund af forvaltningens indstilling.",
    sourceDocId: "doc-bu-afg-2026-0529",
    partyIds: ["p-marsha", "p-luca", "p-dav", "p-dennis"],
    significance: "critical",
    verified: true,
    tags: ["B&U Udvalg", "Afgørelse", "Politisk møde"]
  },
  {
    id: "evt-2026-06-04",
    date: "2026-06-04",
    time: "11:54",
    title: "Henvendelse til Borgmester Sofia Osmani",
    category: "Miscellaneous",
    sourceType: "other",
    description: "Dokumenteret henvendelse og fotodokumentation vedrørende borgmesterens orientering om sagen.",
    partyIds: ["p-borgmester-sofia", "p-dav"],
    significance: "medium",
    verified: true,
    tags: ["Borgmester", "Fotodokumentation", "Tilsyn"]
  },
  {
    id: "evt-2026-06-24",
    date: "2026-06-24",
    time: "15:00",
    title: "Seneste FABU Samværsudtalelse Luca (Juni 2026)",
    category: "FABU og samvær",
    sourceType: "document",
    description: "Nyeste formelle observationsrapport fra FABU konsulenterne.",
    sourceDocId: "doc-fabu-2026-0624",
    partyIds: ["p-luca", "p-fabu"],
    significance: "critical",
    verified: true,
    tags: ["FABU", "Samværsudtalelse", "2026"]
  }
];

export const CONTROL_QUEUE_ITEMS: ControlQueueItem[] = [
  {
    id: "cq-01",
    taskName: "Krydsvalidering af FABU Udtalelser vs. B&U Indstilling",
    category: "Audit & Dokumentkontrol",
    assignedTo: "Graverteam",
    dueDate: "2026-09-15",
    priority: "critical",
    status: "in_progress",
    description: "Gennemgå samtlige 12 FABU udtalelser fra 2022-2026 og sammenhold med de specifikke citater anvendt i Marshas indstilling til B&U udvalget d. 29. maj 2026.",
    sourceReference: "FABU 24 Juni 2026 / BU møde d.29 maj",
    notes: "Anvend 'The Brew Method' Trin 1 (Anti-Confirmation Bias) for at afdække om kun negative eller positive punkter blev videreformidlet til politikerne."
  },
  {
    id: "cq-02",
    taskName: "Lydtransskription & Verifikation af Liams Udsagn",
    category: "Kildekritik & Børneinddragelse",
    assignedTo: "Efterforsker",
    dueDate: "2026-09-20",
    priority: "critical",
    status: "pending",
    description: "Fuld transskription af alle 'Liam fortæller' optagelser (november 2025 - 2026) til brug for en uvildig børnesagkyndig vurdering.",
    sourceReference: "Liam 2 november.m4a m.fl.",
    notes: "Trin 4: Kildekritik af optagesituationen, åbne vs. ledende spørgsmål, og konsistens over tid."
  },
  {
    id: "cq-03",
    taskName: "Tidslinje-rekonstruktion af Kommunale Møder (2024-2026)",
    category: "Kronologisk Kortlægning",
    assignedTo: "Graverteam",
    dueDate: "2026-09-10",
    priority: "high",
    status: "completed",
    description: "Sammenkædning af de 23 optagede kommunale møder med skriftlige mødereferater for at finde eventuelle uoverensstemmelser (Hanlon's Razor kontrol).",
    sourceReference: "Mødeoptagelser 1-16 & PDF referater",
    notes: "Kortlagt i sagens interaktive tidslinje."
  }
];

export const INFOGRAPHICS_DATA: InfographicItem[] = [];

export const AUDIT_LOG_ITEMS: import('../types').AuditLogEntry[] = [
  {
    id: "aud-20260828-01",
    timestamp: "2026-08-28T21:15:30Z",
    investigator: "Lead Forensic Auditor",
    actionType: "annotation_added",
    targetType: "document",
    targetId: "doc-fabu-2026-0624",
    targetTitle: "FABU Samværsudtalelse Luca (24. Juni 2026)",
    summaryDa: "Tilføjede forensisk annotering vedrørende overensstemmelse mellem observationsrapport og sagsfremstilling.",
    summaryEn: "Added forensic annotation regarding congruence between visitation observations and caseworker summary.",
    diff: {
      field: "annotations",
      oldValue: "0 noter",
      newValue: "Annotering: 'Entydig positiv trivselsrapport stemmer ikke overens med § 52 indstilling'."
    },
    sha256Checksum: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    severity: "critical",
    tags: ["FABU", "Annotering", "Brew-Trin-3"]
  },
  {
    id: "aud-20260828-02",
    timestamp: "2026-08-28T19:42:10Z",
    investigator: "Graverteam / Sagsrevisor",
    actionType: "tag_added",
    targetType: "document",
    targetId: "doc-politi-rapport",
    targetTitle: "Politianmeldelse vedr. Samværsafhentning",
    summaryDa: "Tilføjede sags-tags: 'Konflikteskalering', 'Adversarial' og 'Modstridende Forklaringer'.",
    summaryEn: "Added case tags: 'Conflict Escalation', 'Adversarial' and 'Contradictory Accounts'.",
    diff: {
      field: "tags",
      oldValue: ["Politi", "Anmeldelse"],
      newValue: ["Politi", "Anmeldelse", "Konflikteskalering", "Adversarial", "Modstridende Forklaringer"]
    },
    sha256Checksum: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    severity: "notice",
    tags: ["Tags", "Politi", "Klassifikation"]
  },
  {
    id: "aud-20260828-03",
    timestamp: "2026-08-28T16:20:45Z",
    investigator: "Digital Efterforsker (OSINT)",
    actionType: "verification_toggled",
    targetType: "transcript",
    targetId: "tr-01",
    targetTitle: "Mødeoptagelse: Børne- og Ungeudvalget (29. maj 2026)",
    summaryDa: "Verificerede lydoptagelsens tidsstempling og transskription mod rå M4A-lydfil.",
    summaryEn: "Verified audio recording timestamp and transcription against raw M4A audio file.",
    diff: {
      field: "verified",
      oldValue: false,
      newValue: true
    },
    sha256Checksum: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    severity: "info",
    tags: ["Lydverifikation", "OSINT", "Trin-5"]
  },
  {
    id: "aud-20260828-04",
    timestamp: "2026-08-28T14:05:12Z",
    investigator: "Lead Forensic Auditor",
    actionType: "claim_status_changed",
    targetType: "claim",
    targetId: "cl-01",
    targetTitle: "Påstand: Manglende journalisering af FABU-rapporter",
    summaryDa: "Ændrede påstandsstatus fra 'Under Review' til 'Substantiated' baseret på aktindsigt DOC-AKT-2026-05.",
    summaryEn: "Changed claim status from 'Under Review' to 'Substantiated' based on FOI filing DOC-AKT-2026-05.",
    diff: {
      field: "status",
      oldValue: "Under Review",
      newValue: "Substantiated"
    },
    sha256Checksum: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    severity: "critical",
    tags: ["Påstand", "Aktindsigt", "Notatpligt"]
  },
  {
    id: "aud-20260828-05",
    timestamp: "2026-08-28T11:30:00Z",
    investigator: "Sagsadministrator",
    actionType: "document_uploaded",
    targetType: "document",
    targetId: "doc-fabu-2026-0624",
    targetTitle: "FABU Samværsudtalelse Luca (24. Juni 2026)",
    summaryDa: "Nyt sagsbilag indlæst i 'FABU & Visitation' fra Google Drive kildearkiv.",
    summaryEn: "New case filing ingested into 'FABU & Visitation' from Google Drive source library.",
    diff: {
      field: "source",
      oldValue: null,
      newValue: "Drive: Lyngby-Taarbæk case / FABU udtalelser"
    },
    sha256Checksum: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    severity: "info",
    tags: ["Upload", "Drive-Sync"]
  },
  {
    id: "aud-20260828-06",
    timestamp: "2026-08-28T09:12:40Z",
    investigator: "Sagsadministrator",
    actionType: "integrity_verified",
    targetType: "system",
    targetId: "sys-chain-of-custody",
    targetTitle: "Forensisk Integritets- og Beviskædekontrol",
    summaryDa: "Automatisk validering af alle 28 sagsakter, tidslinjeankre og cross-reference indekser. 100% konsistens.",
    summaryEn: "Automated validation of all 28 case files, timeline anchors and cross-reference indices. 100% consistency.",
    diff: {
      field: "integrityScore",
      oldValue: "98.4%",
      newValue: "100.0%"
    },
    sha256Checksum: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
    severity: "info",
    tags: ["Integritet", "Hash-Validering", "SHA256"]
  }
];

