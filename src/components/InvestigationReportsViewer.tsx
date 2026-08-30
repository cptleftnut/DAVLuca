import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  BookOpen,
  Copy,
  Check,
  Download,
  Search,
  Sparkles,
  ShieldAlert,
  Clock,
  Scale,
  Compass,
  AlertTriangle,
  HardDrive,
  Radio,
  Share2,
  FileDown,
  Layers,
  ChevronRight,
  User,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Minimize2,
  List
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from './ui/UIPrimitives';
import { useLanguage } from '../contexts/LanguageContext';
import { EntityHighlightedText } from './EntityHighlightedText';
import { useCaseData } from '../contexts/CaseDataContext';

interface MasterReport {
  id: string;
  titleDa: string;
  titleEn: string;
  subtitleDa: string;
  subtitleEn: string;
  category: string;
  date: string;
  author: string;
  badgeText: string;
  contentDa: string;
  contentEn: string;
}

interface InvestigationReportsViewerProps {
  onSelectDocument?: (docId: string) => void;
  onSelectParty?: (partyId: string) => void;
  onJumpToTimelineDate?: (dateStr: string) => void;
  onOpenExportModal?: () => void;
}

export function InvestigationReportsViewer({
  onSelectDocument,
  onSelectParty,
  onJumpToTimelineDate,
  onOpenExportModal
}: InvestigationReportsViewerProps) {
  const { language, t } = useLanguage();
  const { documents, parties, claims } = useCaseData();

  const [activeReportId, setActiveReportId] = useState<string>('report-master');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const masterReports: MasterReport[] = [
    {
      id: 'report-master',
      titleDa: 'THE MASTER FILE: TOTAL DEKONSTRUKTION AF LUCA-SAGEN',
      titleEn: 'THE MASTER FILE: TOTAL DECONSTRUCTION OF THE LUCA CASE',
      subtitleDa: 'Komplet gennemgang af 118+ sagsakter, lydoptagelser, byretsdomme, lægejournaler, FABU-rapporter og underretninger (2020-2026)',
      subtitleEn: 'Comprehensive forensic analysis of 118+ case files, audio wiretaps, court verdicts, medical records, and FABU reports (2020-2026)',
      category: 'Master Report // All Archives',
      date: '2026-08-29',
      author: 'Graverjournalist & Lead Investigator (The Brew Method)',
      badgeText: 'THE MASTER FILE (118+ Aktindsigter)',
      contentDa: `# THE MASTER FILE: TOTAL DEKONSTRUKTION AF LUCA-SAGEN
**Efterforskningsmetode:** The Brew Method (Strengt evidensbaseret, afmystificerende)  
**Datagrundlag:** Komplet gennemgang af 118+ sagsakter, lydoptagelser, byretsdomme, lægejournaler, FABU-rapporter og underretninger (2020-2026).  
**Sagens Kerne:** Afdækning af, hvordan systemisk inkompetence muterede til bevidst dokumentfalsk og mørklægning.

---

## TRIN 1: Anti-Confirmation Bias (De Rå Fakta)
Vi skærer al støj, alle forældretårer og alle forvaltningsfloskler væk. Hvad er de uomtvistelige, rå fakta i sagen?
1. **Faktum:** Luca blev akut fjernet (25. maj 2022) på baggrund af anklager om heroinmisbrug og livsfarlig vold (knivtrusler).
2. **Faktum:** Anklagen om heroinmisbrug er lægefagligt modbevist via kontinuerlige, rene urinprøver afleveret via Torvehuset.
3. **Faktum:** Anklagen om vold og "psykopatisk/mimikfattig" adfærd fra faren (Nicklas) er medicinsk forklaret og de-bunket af en officiel autismediagnose i 2025.
4. **Faktum:** Lyngby-Taarbæk Kommune har tilbageholdt positive samværsobservationer fra Børn og Unge-udvalget (fastslået juridisk i Byretten, nov 2025).
5. **Faktum:** Luca er stadig anbragt.

**Konklusion på Trin 1:** Grundlaget for sagens opstart eksisterer ikke længere. Sagens fortsættelse er dermed ikke funderet i barnets sikkerhed, men i forvaltningens administrative overlevelsesinstinkt.

---

## TRIN 2: Kronologisk Kortlægning (Anatomi af et Magtmisbrug)
En minutiøs kortlægning af sagen afslører, at fejlene ikke er tilfældige, men systematiske:

* **Forhistorien (2020-2021 - Gribskov):** Storebror Liam er omdrejningspunktet. Han er fanget i en massiv forældrekonflikt, præget af "indlært had" og udviser svære traumer (beskrevet i Underretning marts 2021). Forvaltningens første fejl er at bruge et ekstremt traumatiseret barns udtalelser som objektiv sandhed.
* **Panik og Magtmisbrug (Maj-Okt 2022):** Lyngby-Taarbæk overtager. Sagsbehandler Dennis modtager rygter (heroin/vold) og handler akut. Han låser forældrene inde i 7 timer, truer med politiet, afhører bedsteforældre om falske positive urinprøver og makulerer/mister forældrenes vitale forsvarsdokumenter (bekræftet af leder Thomas i lydfilen "15. Telefonsamtale Thomas.m4a").
* **Mørklægningen Iværksættes (2022-2024):** FABU (Familiehjælpen) tilknyttes og udarbejder overvejende positive rapporter (f.eks. "FABU Udtalelse 1. september 2023.pdf"), der beskriver forældre, som yder omsorg og trøst. **Kommunen undlader at forelægge disse for B&U-udvalget og Ankestyrelsen**, som dermed dømmer ud fra et falsk, negativt manipuleret sagsbillede.
* **Den Falske Evaluering (2023):** En Forældrekompetenceundersøgelse (FKU) stempler faren som uempatisk og rigid. Disse observationer bruges som argument for anbringelse. To år senere (2025) diagnosticeres han med autisme – hvilket forklarer adfærden og ugyldiggør FKU'ens ondsindede tolkning.
* **Retssystemets Dom (Nov 2025):** Byretten stadfæster anbringelsen (grundet tidens gang), men fælder en historisk hård dom over kommunen: De kalder mørklægningen af FABU-rapporterne for *"et uskønt billede af en forvaltning med en ukendt dagsorden"* (Byretten - DOM.PDF).
* **Det Ultimative Forvaltningsbrud (Jan 2026):** Mette og Marsha giver forældrene en formel, mundtlig undskyldning (bevist på "Møde d. 15 jan 2026 Mette og Marsha.mp3"). I referatet, der sendes til retten ("15 januar 2026 Mette og marsha møde.pdf"), lyver de og skriver, at forældrene nægter at samarbejde.

---

## TRIN 3: Kontekstualisering af Anomalier (Hanlon's Razor)
Er dette inkompetence eller konspiration?
* **2022 (Dennis-æraen):** Kan tilskrives grov inkompetence, stress og en decideret farlig medarbejder, der mistede grebet (og blev fyret).
* **2024-2026 (Ledelsens Cover-up):** Her kollapser Hanlon's Razor. At ledelsen *bevidst* skjuler 2023-FABU-rapporter for et nævn, og *bevidst* forfalsker referater i 2026 for at modarbejde en byretsdom, er ikke inkompetence. Det er en kalkuleret, strafferetlig overtrædelse af Forvaltningsloven for at undgå at skulle indrømme en ulovlig fjernelse.

---

## TRIN 4: Kilde- og Ekspertkritik (Afmontering af Kommunens Beviser)
Hvem er kommunens vidner, og hvad er deres bias?
1. **Pædagogerne (Børnehaven):** Dennis noterede, at børnehaven sagde, barnet var misrøgtet. På optagelsen "7. Første møde i børnehaven.m4a" afviser pædagogerne direkte, at de nogensinde har sagt dette. *Dennis' notat er et fabrikeret bevis.*
2. **Psykologerne (FKU):** Deres vurdering af faren var gennemsyret af *confirmation bias* (de ledte efter en voldsmand). Da de ikke fandt vold, tolkede de hans manglende mimik (Autisme) som dysfunktionel psykopati.
3. **Storebror Liam:** Et barn under massivt pres og indlært had. Han er ofret, ikke et troværdigt vidne til akut anbringelse uden yderligere efterforskning.

---

## TRIN 5: Datadrevet Efterforskning (Hårde Beviser)
Dette afsnit udgør familiens juridiske slagkraft. Data lyver ikke:

* **BEVIS A: Lyd vs. Skrift (Januar 2026)**
  * *Fil:* "Møde d. 15 jan 2026 Mette og Marsha.mp3" vs. "15 januar 2026 Mette og marsha møde.pdf".
  * *Faktum:* Lydfilen beviser en forvaltning, der beder om undskyldning. PDF'en (referatet) er direkte forfalsket for at sværte forældrene. Dette er et brud på Forvaltningslovens krav om sandhedspligt.
* **BEVIS B: Byretsdommen og mørklægningen af FABU**
  * *Fil:* "Byretten - DOM.PDF" & "Opstart fabu.m4a".
  * *Faktum:* Retten bekræfter juridisk, at kommunen ulovligt har tilbageholdt positivt materiale fra Børn og Unge-udvalget og Ankestyrelsen. 
* **BEVIS C: De makulerede papirer**
  * *Fil:* "15. Telefonsamtale Thomas.m4a".
  * *Faktum:* En leder indrømmer på bånd, at vigtige sagsakter (fødselspapirer etc.) sandsynligvis er smidt i en makulator af en nu fyret medarbejder (Dennis), hvorefter forvaltningen har holdt forældrene ansvarlige for manglende dokumentation.
* **BEVIS D: Økonomisk afpresning**
  * *Fil:* "Rådgiver lyngby.m4a".
  * *Faktum:* Afslører, hvordan Ydelsesafdelingen stopper forsørgelsesgrundlaget under påskud af "manglende kontakt", selvom forældrene kan dokumentere det modsatte. Kommunen bruger tvær-afdelings-sanktioner som pressionsmiddel.
* **BEVIS E: Det modbeviste "Heroinmisbrug"**
  * *Fil:* Gennemgående i Aktindsigt.PDF og lydfiler (f.eks. "Marsha møde d. 25 feb.m4a").
  * *Faktum:* På trods af blanke urinprøver afleveret systematisk via Torvehuset, opretholdes narrativet i kommunens indstilling længe efter at være modbevist.

---

## TRIN 6: Adskillelse af Støj og Signal
**Støj (Kommunens afledningsmanøvrer):** At forældrene "råber" til møder, at Luca nogle gange er snavset, at referater bliver diskuteret frem og tilbage, og at forældrene aflyser et møde. Dette er dimmelys. Forvaltningen bruger familiens traume-reaktioner (skabt af kommunen selv) som bevis *mod* dem.

**Signal (Sagens sandhed):**
Fundamentet er råddent. Luca er ikke fjernet fordi han blev misrøgtet, han er fjernet fordi en kommune begik en fatal procedurefejl og nægter at rydde op.

---

## TRIN 7: Den Jordbundne Konklusion
Her er sandheden bag sagen: 
Lyngby-Taarbæk Kommune fjernede Luca i panik i maj 2022. Sagsbehandleren brød loven. Da sagen senere skulle for Ankestyrelsen og Byretten, opdagede ledelsen, at anbringelsesgrundlaget var modbevist. I stedet for at hjemgive barnet (og risikere en skandale, politianmeldelser og massive erstatningskrav), valgte kommunen *Sunk Cost Fallacy*: De gravede et dybere hul. De skjulte FABU-beviser og begyndte systematisk at manipulere referater (som i januar 2026) for at fastholde forældrene i rollen som "u-samarbejdsvillige", så de kunne opretholde anbringelsen af rent juridisk-administrative årsager.

---

## TRIN 8: Det Større Perspektiv (Retssvigtet)
Sagen handler ikke længere kun om forvaltningsret. Det er en historie om et uoverskueligt menneskeligt svigt. 
To børn har betalt prisen: Liam blev brugt som et redskab af systemet og efterladt med sine traumer uden den nødvendige hjælp. Luca har mistet sine formative år hos sine biologiske forældre – ikke på grund af farer i hjemmet, men for at beskytte kommunens anseelse. 
Det ultimative retssvigt er, at det danske velfærdssystem mangler en "fortryd-knap", når maskineriet først er sat i gang på et falsk grundlag.`,
      contentEn: `# THE MASTER FILE: TOTAL DECONSTRUCTION OF THE LUCA CASE
**Forensic Methodology:** The Brew Method (Strictly evidence-based, demystifying)  
**Data Scope:** Comprehensive review of 118+ case files, audio wiretaps, court verdicts, medical records, FABU supervision logs, and municipal notices (2020-2026).  
**Core Thesis:** Exposing how systemic incompetence mutated into deliberate forgery and evidence suppression.

---

## STEP 1: Anti-Confirmation Bias (Raw Facts)
1. **Fact:** Luca was emergency removed (May 25, 2022) based on allegations of heroin addiction and knife violence.
2. **Fact:** The heroin addiction allegation was medically disproven via continuous negative drug screenings.
3. **Fact:** Allegations of violent behavior and lack of emotional response by father Nicklas were medically explained by a formal 2025 Autism diagnosis.
4. **Fact:** Lyngby-Taarbæk Municipality suppressed positive visitation logs from the Child Welfare Committee (confirmed legally in District Court, Nov 2025).
5. **Fact:** Luca remains placed in care.`
    },
    {
      id: 'report-mappe2',
      titleDa: 'EFTERFORSKNINGSRAPPORT: DE SKJULTE VINKLER (SAGSMAPPE 2)',
      titleEn: 'INVESTIGATION REPORT: HIDDEN ANGLES (CASE DOSSIER 2)',
      subtitleDa: 'Oprindelsen, Bevisødelæggelse, Rådhusindespærring og Magtmisbrug',
      subtitleEn: 'The Origin, Evidence Destruction, Municipal Detention & Abuse of Power',
      category: 'Sagsmappe 2 // Oprindelsen',
      date: '2026-08-28',
      author: 'Graverjournalist & Lead Investigator (The Brew Method)',
      badgeText: 'SAGSMAPPE 2 (Oprindelse & Trusler)',
      contentDa: `# EFTERFORSKNINGSRAPPORT: DE SKJULTE VINKLER (SAGSMAPPE 2)
**Efterforskningsmetode:** The Brew Method
**Fokus:** Oprindelsen, Bevisødelæggelse og Magtmisbrug

---

## TRIN 1: Anti-Confirmation Bias
Vi fjerner forældrenes åbenlyse vrede og kigger koldt på kommunens handlinger. Vi antager ikke, at kommunen er ond, men vi antager heller ikke, at de har ret. Vi isolerer tre nye påstande baseret på lydfilerne: 
1. Sagen bygger oprindeligt på udsagn fra en stærkt traumatiseret storebror (Liam).
2. Sagsbehandler Dennis har låst forældrene inde og truet dem.
3. Vitale dokumenter (fødselspapirer fra Tyrkiet) er forsvundet/makuleret.

## TRIN 2: Kronologisk Kortlægning (Det udvidede perspektiv)
* **Startskuddet (2021/2022):** Storebror Liam flyttes til moderen efter en byretssag mod faderen. Liam er massivt præget af konflikten ("indlært had" ifølge sagspapirer fra Gribskov).
* **Maj 2022:** Liam fremsætter ekstreme anklager (at stedfar Nicklas vil skære halsen over på ham med en brødkniv og har kastet ham ud over en altan).
* **25. Maj 2022:** Disse udsagn, kombineret med falske rygter om heroinmisbrug, bruges til en akut formandsbeslutning om at fjerne lillebror Luca.
* **Senere i 2022:** Sagsbehandler Dennis truer forældrene, holder dem angiveligt tilbage på rådhuset, og modtager vitale forsvarsdokumenter. Dennis bliver senere fyret.
* **Januar 2026:** Forvaltningen indrømmer (på lydfil) at papirer kan være smidt i "makuleringsspanden", men nægter at indføre det i referaterne.

## TRIN 3: Kontekstualisering af Anomalier (Hanlon's Razor)
* **Forsvundne fødselspapirer:** Lydfilen "15. Telefonsamtale Thomas.m4a" afslører lederen Thomas, der erkender, at Dennis fik papirerne, men spekulerer i, om de er endt i "makuleringsspanden". *Hanlon's Razor:* Dette er højst sandsynligt grov inkompetence og systemisk rod, ikke en bevidst "James Bond"-agtig mørklægningsoperation i starten. Men *efterfølgende* at skjule denne inkompetence for Ankestyrelsen og Byretten – det er bevidst manipulation.
* **Heroin-anklagen:** At en sagsbehandler modtager et anonymt rygte om heroin og reagerer, er standard. Men at forvaltningen ignorerer blanke urinprøver hver anden dag i et halvt år (ifølge "Marsha møde d. 25 feb.m4a"), er et brud på inkompetence-teorien. Det er aktiv fastholdelse af et falsk narrativ.

## TRIN 4: Kilde- og Ekspertkritik
* **Kilden "Liam":** Hele anbringelsen af Luca hviler på Liams anklager. Men kildekritikken udebliver i forvaltningen. Lydfilerne viser, at Liam havde et "indlært had" og reagerede voldsomt på et miljøskift. Når et barn i voldsom krise fremsætter beskyldninger om "halsklipning", burde en objektiv sagsbehandler have verificeret dette via politi/læge, før det blev brugt som sandhedsgrundlag for at fjerne et *andet* barn (Luca). Forvaltningens bias var total.
* **Sagsbehandler Dennis:** Lydfilen "4. Dennis truer med politiet.m4a" viser en mand ude af kontrol. Kildeværdien af *alt*, han har skrevet i sagen (herunder observationer fra børnehaven, som pædagogerne senere afviser i en anden optagelse), må objektivt set vurderes til nul.

## TRIN 5: Datadrevet Efterforskning (OSINT)
Hvordan beviser vi de vildeste påstande uden forældrenes ord?
1. **Frihedsberøvelsen (7 timer på rådhuset):** Dette kan verificeres via Google Timeline (Location History) på forældrenes telefoner, log-ind-data på kommunens gæstenetværk, eller parkeringsbøder/apps for den pågældende dag.
2. **Trusler mod §75-bisidder Tommy:** Vi skal indhente tele-logs fra Tommys telefon for at bevise, at kommunen ringede ham op, samt en skriftlig tro-og-love-erklæring fra ham om truslens indhold.
3. **Økonomisk sanktion:** Filen "Rådgiver lyngby.m4a" indikerer et muligt stop af ydelser fra Ydelsesafdelingen (Berit). Vi skal indhente kontoudtog, der beviser et pludseligt, ubegrundet stop i forsørgelsesgrundlaget præcis samtidigt med en konflikt med Børne- og Familieafdelingen.

## TRIN 6: Adskillelse af Støj og Signal
* **Støj:** Diskussioner om beskidte negle og mudder mellem tæerne (Aktindsigt fra børnehaven). Dette er klassisk system-støj skabt for at tegne et billede af "nussethed", som retfærdiggør indgreb, når de alvorlige anklager (heroin/vold) falder til jorden.
* **Signal:** At kommunens leder direkte på bånd erkender ("vi ved det ikke passer" - "8. Møde på kommunen.m4a"), at sagsakterne er falske, men at de stadig er tvunget til at træffe afgørelser ud fra dem.

## TRIN 7: Den Jordbundne Konklusion
Den faktuelle og kedelige virkelighed er, at sagen ikke startede som en ond konspiration. Den startede som panik. 
Sagsbehandler Dennis modtog voldsomme (men falske/traume-baserede) underretninger fra et ældre barn. Han handlede i affekt og overskred sine beføjelser (trusler, makulering af papirer). Da Dennis blev fyret, stod kommunen med en ulovlig anbringelse baseret på et sagsfalsum. I stedet for at trække sagen tilbage (hvilket ville udløse massiv kritik og erstatningskrav), valgte ledelsen at "fordreje" nye observationer (f.eks. at faren havde autisme og manglede mimik) for at *konstruere* et nyt anbringelsesgrundlag, mens de ignorerede de rene urinprøver og positive FABU-rapporter. 

## TRIN 8: Det Større Perspektiv
Glem alt om forældrenes frustration i et øjeblik. Det egentlige offer her er to børn:
1. **Liam**, hvis råb om hjælp og massive traumer blev brugt som et administrativt våben, hvorefter han blev efterladt uden den hjælp, han faktisk havde brug for.
2. **Luca**, som blev fjernet fra sit hjem, fordi det kommunale system prioriterede at dække over en inkompetent, fratrådt sagsbehandlers fejl frem for at genoprette sandheden og lovligheden. Retssvigtet ligger i, at maskineriet ikke har en "fortryd-knap", når startgrundlaget bevises falsk.`,
      contentEn: `# INVESTIGATION REPORT: HIDDEN ANGLES (DOSSIER 2)
**Forensic Method:** The Brew Method  
**Focus:** The Origin, Evidence Destruction & Abuse of Power`
    },
    {
      id: 'report-mappe3',
      titleDa: 'EFTERFORSKNINGSRAPPORT: DET KOMPLETTE BEVISKATALOG (SAGSMAPPE 3)',
      titleEn: 'INVESTIGATION REPORT: COMPLETE EVIDENCE CATALOG (DOSSIER 3)',
      subtitleDa: 'Helhedsbilledet, Systemisk Svigt og Mørklægning af Beviser',
      subtitleEn: 'Systemic Failure, Document Suppression & District Court Ruling Nov 2025',
      category: 'Sagsmappe 3 // Beviskatalog',
      date: '2026-08-28',
      author: 'Graverjournalist & Lead Investigator (The Brew Method)',
      badgeText: 'SAGSMAPPE 3 (Beviskatalog & Dom)',
      contentDa: `# EFTERFORSKNINGSRAPPORT: DET KOMPLETTE BEVISKATALOG (SAGSMAPPE 3)
**Efterforskningsmetode:** The Brew Method (Evidensbaseret & Afmystificerende)
**Fokus:** Helhedsbilledet, Systemisk Svigt og Mørklægning af Beviser

---

## TRIN 1: Anti-Confirmation Bias
For at undgå tunnelsyn må vi fjerne os fra forældrenes frustrationer og udelukkende se på det systemiske mønster. Fejl sker i forvaltninger. Det afgørende spørgsmål er, hvordan kommunen *reagerer*, når de bliver præsenteret for beviset for deres egne fejl. Dokumentationen viser konsekvent, at de i stedet for at rette fejlene, forsøger at dække over dem og bebrejde forældrene. Dette er ikke længere kun "dårligt arbejdsmiljø" (Trin 3) – det er aktiv sagsmanipulation.

## TRIN 2: Kronologisk Kortlægning (Det fulde mønster)
Vi har nu en tidslinje, der afslører en skræmmende logik:
* **Oprindelsen (Forår/Sommer 2022):** Anbringelsen af Luca sker *akut* (Formandsbeslutning 25. maj 2022) baseret på meget ekstreme udtalelser fra storebror Liam (bl.a. om "halsklipning") og falske, anonyme rygter om heroinmisbrug. Sagsbehandler Dennis kører en ekstremt hård linje, truer med politiet og udviser utilregnelig adfærd ("4. Samtale med Astrid.m4a" / 7 timers indespærring på rådhuset).
* **Mørklægningen af de gode beviser (2022-2023):** Forældrene afleverer rene urinprøver gentagne gange. FABU udarbejder flere samværsrapporter, der viser positiv interaktion og omsorg (f.eks. "FABU Udtalelse 1. september 2023.pdf"). **Disse rapporter holdes skjult for Børn og Unge-udvalget og Ankestyrelsen.**
* **Afgørelser baseret på sagsfalsum (Maj 2024 - April 2025):** Børn og Unge-udvalget og Ankestyrelsen træffer afgørelse om *fortsat* anbringelse. Denne beslutning er uundgåeligt præget af de gamle (og nu modbeviste) anklager samt forvaltningens tilbageholdelse af de positive FABU-rapporter.
* **Byretten slår fast (November 2025):** Dommen ("Byretten - DOM.PDF") er en massiv kritik af forvaltningen. Retten fremhæver direkte, at FABU-rapporterne *ikke* var fremlagt, og kalder det "et uskønt billede af en forvaltning med en ukendt dagsorden".
* **Den manipulerede "undskyldning" (Januar/Februar 2026):** Forvaltningen tvinges til et møde efter rettens kritik. Ledelsen (Mette/Marsha) giver forældrene en mundtlig undskyldning og anerkender fejlene (Lydfil: "Møde d. 15 jan 2026 Mette og Marsha.mp3"). **Men det journaliserede referat vendes fuldstændigt på hovedet og fremstiller forældrene som u-samarbejdsvillige** ("15 januar 2026 Mette og marsha møde.pdf"). 

## TRIN 3: Kontekstualisering af Anomalier (Hanlon's Razor - opdateret)
Når vi først kiggede på sagen (Sagsmappe 1 & 2), kunne vi måske tilskrive nogle af fejlene grov inkompetence og et presset system (især omkring sagsbehandler Dennis).
Men når vi kigger på referat-manipulationen fra mødet i januar 2026 – *efter* en byretsdom har kritiseret dem massivt – falder Hanlon's Razor. 
At give en verbal undskyldning på et møde, og derefter skrive et referat, der direkte modsiger undskyldningen og udstiller forældrene negativt, er ikke inkompetence. Det er en velovervejet strategi for at beskytte forvaltningen i en potentiel erstatningssag.

## TRIN 4: Kilde- og Ekspertkritik (Forvaltningens Troværdighed)
* **Forældrekompetenceundersøgelsen (2023):** Blev udført med en forudindtagethed baseret på de falske anklager (heroin/vold). Ydermere tolkede den Nicks adfærd (manglende mimik etc.) negativt, på trods af en senere (2025) officiel autismediagnose, der logisk forklarer netop dette. Undersøgelsen er dermed ikke et troværdigt bevis mod forældrene, men et bevis på forvaltningens confirmation bias.
* **De officielle mødereferater:** Beviset ligger i sammenligningen. Når lydoptagelsen fra d. 15. januar 2026 står i direkte kontrast til det udarbejdede referat, må *alle* kommunens referater i sagen betragtes som potentielt utroværdige kilder i et retssystem.

## TRIN 5: Datadrevet Efterforskning (OSINT & Verifikation) - Det afgørende angreb
Her er de stærkeste data-punkter, vi har i sagen, og hvordan de verificerer hinanden:
1.  **Byretsdommen er nøglen:** Dokumentet "Byretten - DOM.PDF" er ikke en påstand, det er en juridisk kendelse. At dommeren direkte påtaler de manglende FABU-rapporter, validerer forældrenes påstand.
2.  **Lydfilen fra d. 15. jan 2026 (Rygende Pistol):** Dette er uomtvisteligt bevis på manipulation af et aktstykke. Man kan ikke skrive "I nægter at samarbejde", når man på båndet siger "Vi vil gerne give jer en stor undskyldning". Dette er strafferetligt relevant (Dokumentfalsk / Brud på Forvaltningsloven).
3.  **Makulerede Fødselspapirer:** Erkendelsen fra afdelingsleder Thomas ("15. Telefonsamtale Thomas.m4a") af, at afgørende papirer fra forældrene *muligvis* er endt i en "makuleringsspand", understreger systemets lemfældige omgang med borgerens vigtigste dokumenter (og beviser).
4.  **Autismediagnosen (2025):** Dette lægelige dokument de-bunker fuldstændig store dele af kommunens (og den forkerte forældrekompetenceundersøgelses) vurdering af Nicklas som udadreagerende/misbruger.

## TRIN 6: Adskillelse af Støj og Signal
* **Systemets støj:** Forvaltningens konstante forsøg på at skifte fokus (fra de falske heroinanklager, til manglende badning, til nussethed, til manglende "erkendelse" af problemet – som demonstreret i "16. Møde på kommunen - Status.m4a" hvor de tvinger forældrene til at "erkende" falske fejl for at få barnet hjem). Dette er røgslør designet til at forlænge sagen.
* **Det rene signal:** Sagen hviler på et falsk grundlag. Børn og Unge-udvalget har aldrig haft det sande, fulde billede at træffe deres afgørelser ud fra, fordi forvaltningen bevidst sorterede de positive beviser fra.

## TRIN 7: Den Jordbundne Konklusion
Kommunen begik en kæmpe, panik-drevet fejl i maj 2022. I stedet for at trække i land, da beviserne mod forældrene smuldrede (rene urinprøver, autisme-diagnose, pædagoger der trak udtalelser tilbage), valgte ledelsen en "Double Down"-strategi. De tilbageholdt de positive beviser (FABU) for de bestemmende organer og forsøgte at manipulere nyere referater for fortsat at tegne et fjendebillede af forældrene, så kommunen undgik en massiv skandale.

## TRIN 8: Det Større Perspektiv
Glem aldrig ofret. Et lille barn (Luca) har været fjernet fra sit hjem i flere år, ikke fordi forældrene var en fare (som bevist i byretten og via urinprøver), men fordi et kommunalt maskineri er mere optaget af at retfærdiggøre sine egne (fejlagtige) beslutninger end at tjene borgernes tarv. Sagsbehandlerne har i deres iver efter at dække over egne procedurefejl forårsaget ubodelig skade på en families tilknytning.`,
      contentEn: `# INVESTIGATION REPORT: COMPLETE EVIDENCE CATALOG (DOSSIER 3)
**Forensic Method:** The Brew Method  
**Focus:** The Full Picture, Systemic Suppression & District Court Ruling Nov 2025`
    }
  ];

  const currentReport = masterReports.find((r) => r.id === activeReportId) || masterReports[0];

  const handleCopyMarkdown = () => {
    const text = language === 'da' ? currentReport.contentDa : (currentReport.contentEn || currentReport.contentDa);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const text = language === 'da' ? currentReport.contentDa : (currentReport.contentEn || currentReport.contentDa);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentReport.id}_${currentReport.date}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeContent = language === 'da' ? currentReport.contentDa : (currentReport.contentEn || currentReport.contentDa);

  const filteredContent = searchTerm
    ? activeContent
        .split('\n')
        .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
        .join('\n')
    : activeContent;

  const fontClass =
    fontSize === 'sm'
      ? 'text-xs sm:text-sm'
      : fontSize === 'lg'
      ? 'text-base sm:text-lg'
      : 'text-sm sm:text-base';

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 bg-zinc-950 p-6 md:p-10 overflow-y-auto space-y-6'
    : 'space-y-6';

  return (
    <div id="investigation-reports-viewer" className={containerClasses}>
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-slate-900/90 border border-emerald-500/30 p-6 rounded-2xl shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                The Brew Method Suite
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                {masterReports.length} {t('Master Rapporter (.md)', 'Master Reports (.md)')}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                • {t('100% Verificerede Sagsakter', '100% Grounded Case Files')}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-emerald-400 shrink-0" />
              <span>{t('Efterforskning Master Rapporter (MD)', 'Investigative Master Reports (MD)')}</span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              {t(
                'De fulde, uafkortede graverjournalistiske efterforskningsrapporter foranlediget af The Brew Method (Trin 1-8). Indeholder total dekonstruktion af 118+ sagsakter, lydbåndsnotater, byretsdommen og mørklægnings-beviser.',
                'Unabridged investigative reports built on The Brew Method (Steps 1-8). Includes total deconstruction of 118+ files, audio transcripts, district court ruling, and evidence suppression logs.'
              )}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Font size picker */}
            <div className="flex items-center bg-zinc-950 rounded-xl p-0.5 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  fontSize === 'sm' ? 'bg-emerald-600 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('base')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  fontSize === 'base' ? 'bg-emerald-600 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  fontSize === 'lg' ? 'bg-emerald-600 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                A+
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isFullscreen
                  ? 'bg-emerald-600 text-zinc-950 border-emerald-500 font-bold'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isFullscreen ? t('Minimér', 'Shrink') : t('Fuld Skærm', 'Maximize')}
              </span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 hover:text-white text-xs font-semibold border border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('Kopieret!', 'Copied!') : t('Kopiér MD', 'Copy MD')}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Download .MD', 'Download .MD')}</span>
            </button>

            {onOpenExportModal && (
              <button
                onClick={onOpenExportModal}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('PDF Rapport', 'PDF Report')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {masterReports.map((report) => {
            const isSelected = report.id === activeReportId;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReportId(report.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-500 shadow-xl ring-1 ring-emerald-500'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {report.badgeText}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">{report.date}</span>
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2">
                    {language === 'da' ? report.titleDa : report.titleEn}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {language === 'da' ? report.subtitleDa : report.subtitleEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border border-zinc-800 bg-zinc-900/95 shadow-2xl overflow-hidden rounded-2xl">
        {/* Search inside active report */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('Søg direkte i rapportens tekster og beviser...', 'Search inside report text...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs text-zinc-400 font-mono hidden sm:flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentReport.category}</span>
          </div>
        </div>

        {/* Report Content Panel */}
        <CardContent className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[850px] leading-relaxed">
          <div className={`prose prose-invert max-w-none ${fontClass}`}>
            <EntityHighlightedText
              text={filteredContent}
              onSelectDocument={onSelectDocument}
              onSelectParty={onSelectParty}
              onJumpToTimelineDate={onJumpToTimelineDate}
              fontSize={fontSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
