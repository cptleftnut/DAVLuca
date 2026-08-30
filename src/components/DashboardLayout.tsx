import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  Clock,
  FileText,
  Users,
  Mic,
  ShieldAlert,
  ListTodo,
  BarChart3,
  Bot,
  Search,
  FolderGit2,
  HardDrive,
  ExternalLink,
  Fingerprint,
  Radio,
  Compass,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Share2,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Menu,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { useCaseData } from '../contexts/CaseDataContext';
import { AICaseAssistantSidebar } from './AICaseAssistantSidebar';
import { BrewMethodBlueprintModal } from './BrewMethodBlueprintModal';
import { BreadcrumbNav } from './BreadcrumbNav';

interface DashboardLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTranscriber?: () => void;
  onOpenAuditLog?: () => void;
  subItemTitle?: string | null;
  onClearSubItem?: () => void;
  children: ReactNode;
}

export function DashboardLayout({
  currentTab,
  onSelectTab,
  onOpenTranscriber,
  subItemTitle,
  onClearSubItem,
  children
}: DashboardLayoutProps) {
  const { language, t } = useLanguage();
  const { summary, documents, transcripts, parties, claims, controlQueue, auditLogs } = useCaseData();

  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isAiSidebarPinned, setIsAiSidebarPinned] = useState(false);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [openParentDropdown, setOpenParentDropdown] = useState<string | null>(null);

  // Grouped Navigation Sections
  const navSections = [
    {
      groupDa: 'Efterforskning & Syntese',
      groupEn: 'Investigation & Synthesis',
      items: [
        {
          id: 'overview',
          labelDa: 'Sagssyntese (Dashboard)',
          labelEn: 'Case Synthesis (Dashboard)',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'timeline',
          labelDa: 'Kronologisk Tidslinje',
          labelEn: 'Chronological Timeline',
          icon: Clock,
          badge: null
        },
        {
          id: 'mapper',
          labelDa: 'Connection Mapper (D3)',
          labelEn: 'Connection Mapper (D3)',
          icon: Share2,
          badge: 'D3.js'
        },
        {
          id: 'parties',
          labelDa: 'Parter & Aktørgraf',
          labelEn: 'Parties & Relations',
          icon: Users,
          badge: parties.length
        },
        {
          id: 'reports',
          labelDa: 'Master Rapporter (MD)',
          labelEn: 'Master Reports (MD)',
          icon: BookOpen,
          badge: '3 MD'
        }
      ]
    },
    {
      groupDa: 'Evidens & Kildearkiv',
      groupEn: 'Evidence & Archives',
      items: [
        {
          id: 'findings',
          labelDa: 'Aktindsigter & Dokumenter',
          labelEn: 'Document Findings',
          icon: FileText,
          badge: documents.length
        },
        {
          id: 'transcripts',
          labelDa: 'Lydoptagelser & Udsagn',
          labelEn: 'Audio Recordings',
          icon: Mic,
          badge: transcripts.length
        },
        {
          id: 'drive',
          labelDa: 'Drive: Lyngby-Taarbæk case',
          labelEn: 'Drive: Lyngby-Taarbæk case',
          icon: HardDrive,
          badge: null
        }
      ]
    },
    {
      groupDa: 'Juridisk Kontrol & Revisionslog',
      groupEn: 'Legal Audit & Chain of Custody',
      items: [
        {
          id: 'claims',
          labelDa: 'Register over Påstande',
          labelEn: 'Claims Register',
          icon: ShieldAlert,
          badge: claims.length
        },
        {
          id: 'queue',
          labelDa: 'Forvaltningskontrolkø',
          labelEn: 'Control & Audit Queue',
          icon: ListTodo,
          badge: controlQueue.filter(q => q.status === 'pending').length || null
        },
        {
          id: 'audit',
          labelDa: 'Revisionslog (Audit Trail)',
          labelEn: 'Investigation Audit Log',
          icon: Fingerprint,
          badge: auditLogs.length,
          highlight: true
        }
      ]
    },
    {
      groupDa: 'Dybdeanalyse & AI',
      groupEn: 'Intelligence & Search',
      items: [
        {
          id: 'assistant',
          labelDa: 'The Brew AI Sagskonsulent',
          labelEn: 'The Brew AI Assistant',
          icon: Bot,
          badge: '8-Trin'
        },
        {
          id: 'search',
          labelDa: 'Global Dybdesøgning',
          labelEn: 'Global Deep Search',
          icon: Search,
          badge: null
        },
        {
          id: 'infographics',
          labelDa: 'Infografik- & Datamatrix',
          labelEn: 'Infographics Matrix',
          icon: BarChart3,
          badge: null
        }
      ]
    }
  ];

  const allItems = navSections.flatMap(s => s.items);
  const currentItem = allItems.find(n => n.id === currentTab);
  const currentTitle = language === 'da' ? currentItem?.labelDa : currentItem?.labelEn;

  const handleSelectTab = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileDrawerOpen(false);
    setOpenParentDropdown(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-zinc-950 font-sans relative">
      {/* Mobile Off-Canvas Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Desktop Sidebar & Mobile Off-Canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:static ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } w-72 ${
          isSidebarCollapsed ? 'md:w-16' : 'md:w-68'
        } bg-zinc-900/95 border-r border-zinc-800/90 flex flex-col shrink-0 transition-all duration-300 shadow-2xl md:shadow-none`}
      >
        {/* Brand Header */}
        <div className="p-3.5 md:p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-zinc-950 font-black text-sm shadow-md shadow-emerald-600/30 shrink-0">
              BM
            </div>
            {(!isSidebarCollapsed || isMobileDrawerOpen) && (
              <div className="truncate">
                <div className="font-extrabold text-sm text-zinc-100 tracking-tight flex items-center gap-1.5">
                  The Brew Forensic
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    v3.0
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {summary.caseNumber}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Collapse toggle on desktop */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer hidden md:flex shrink-0"
              title={isSidebarCollapsed ? t('Udvid Menu', 'Expand Sidebar') : t('Sammenklap Menu', 'Collapse Sidebar')}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-emerald-400" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Close button on mobile drawer */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer md:hidden shrink-0"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* The Brew Method Blueprint Banner Button */}
        <div className="p-2.5 border-b border-zinc-800 bg-zinc-950/40 flex-grow-0 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsBlueprintModalOpen(true);
              setIsMobileDrawerOpen(false);
            }}
            className={`w-full ${
              isSidebarCollapsed && !isMobileDrawerOpen ? 'p-2 flex justify-center' : 'p-2.5 text-left'
            } rounded-xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/30 hover:border-emerald-500/60 transition-all group cursor-pointer shadow-sm`}
            title={t('The Brew Method (8 Trin Blueprint)', 'The Brew Method (8 Steps)')}
          >
            {isSidebarCollapsed && !isMobileDrawerOpen ? (
              <Compass className="w-5 h-5 text-emerald-400" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>The Brew Method</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    8 Trin
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  {t('Afmystificerende evidensbaseret efterforskning', 'Evidence-based demystifying blueprint')}
                </p>
              </>
            )}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {(!isSidebarCollapsed || isMobileDrawerOpen) && (
                <div className="px-2 text-[10px] font-bold tracking-wider uppercase text-zinc-400 truncate">
                  {language === 'da' ? section.groupDa : section.groupEn}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const label = language === 'da' ? item.labelDa : item.labelEn;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    title={label}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed && !isMobileDrawerOpen ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                    } rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-zinc-950 font-bold shadow-md shadow-emerald-600/20'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                      {(!isSidebarCollapsed || isMobileDrawerOpen) && <span className="truncate">{label}</span>}
                    </div>

                    {(!isSidebarCollapsed || isMobileDrawerOpen) && item.badge !== null && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0 font-semibold ${
                          isActive
                            ? 'bg-zinc-950 text-emerald-400'
                            : item.highlight
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Source Reference & GitHub Box */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 text-xs space-y-2">
          {isSidebarCollapsed && !isMobileDrawerOpen ? (
            <div className="flex justify-center text-emerald-400" title="Lyngby-Taarbæk case - Live">
              <HardDrive className="w-4 h-4" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5 truncate">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Lyngby-Taarbæk case</span>
                </span>
                <span className="text-emerald-400 font-medium font-mono text-[10px] shrink-0">
                  {t('Aktiv', 'Live')}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                  GitHub Arkiv
                </span>
                <a
                  href="https://github.com/cptleftnut/DAVLuca"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[10px]"
                >
                  DAVLuca <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isAiSidebarOpen && isAiSidebarPinned ? 'md:mr-[420px] xl:mr-[460px]' : ''
        }`}
      >
        {/* Top Header */}
        <header className="h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/90 px-3 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger to open drawer */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer md:hidden flex items-center gap-1 text-xs font-semibold border border-zinc-700 shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs hidden xs:inline">{t('Menu', 'Menu')}</span>
            </button>

            {/* Desktop Collapse Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer hidden md:flex items-center gap-1.5 text-xs font-semibold border border-zinc-700 shrink-0"
              title={isSidebarCollapsed ? t('Udvid Menu', 'Expand Sidebar') : t('Sammenklap Menu', 'Collapse Sidebar')}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono">{t('Menu', 'Menu')}</span>
                </>
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-extrabold text-zinc-100 uppercase tracking-wider truncate flex items-center gap-1.5">
                <span>{currentTitle || 'Forensic Workspace'}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Screen Maximizer Indicator */}
            {(currentTab === 'mapper' || currentTab === 'findings') && !isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                title={t('Maksimer skærmplads for PDF & Graf', 'Maximize screen real estate')}
              >
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('Maksimér Lærred', 'Maximize Canvas')}</span>
              </button>
            )}

            {/* The Brew Method 8-Step Blueprint Quick Trigger */}
            <button
              type="button"
              onClick={() => setIsBlueprintModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-all cursor-pointer shadow-sm"
              title={t('Åbn The Brew Method 8-trins blueprint', 'Open The Brew Method 8-step blueprint')}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">The Brew Method</span>
              <span className="text-[10px] font-mono font-bold px-1 rounded bg-emerald-500/20 text-emerald-300">8 Trin</span>
            </button>

            {/* Language Switcher */}
            <LanguageToggle />

            {/* Live Web Speech API Recorder Trigger */}
            {onOpenTranscriber && (
              <button
                type="button"
                onClick={onOpenTranscriber}
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 hover:text-white text-xs font-semibold items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title={t('Optag og transskriber nyt interview direkte', 'Record and transcribe new interview')}
              >
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="hidden md:inline">{t('Live Optager', 'Live Recorder')}</span>
              </button>
            )}

            {/* AI Case Assistant Sidebar Trigger Button */}
            <button
              type="button"
              onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm shrink-0 ${
                isAiSidebarOpen
                  ? 'bg-emerald-600 text-zinc-950 border-emerald-500 font-bold shadow-emerald-600/30'
                  : 'bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{t('AI Sagskonsulent', 'AI Assistant')}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
          </div>
        </header>

        {/* Top Quick Category Navigation Bar */}
        <div className="bg-zinc-950/95 border-b border-zinc-800/80 px-3 sm:px-4 md:px-6 py-2 sticky top-16 z-20 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-md">
          <div className="flex items-center gap-2 min-w-max">
            {navSections.map((section, sIdx) => {
              const groupTitle = language === 'da' ? section.groupDa : section.groupEn;
              const isOpen = openParentDropdown === section.groupDa;
              const hasActiveChild = section.items.some((item) => item.id === currentTab);
              const activeChild = section.items.find((item) => item.id === currentTab);

              return (
                <div key={sIdx} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenParentDropdown(isOpen ? null : section.groupDa)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      hasActiveChild
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="truncate">{groupTitle}</span>
                    {hasActiveChild && activeChild && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 truncate max-w-[120px] hidden sm:inline">
                        {language === 'da' ? activeChild.labelDa : activeChild.labelEn}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                        isOpen ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu for Child Categories */}
                  {isOpen && (
                    <>
                      {/* Backdrop to click outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenParentDropdown(null)}
                      />

                      <div className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                        <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                          {groupTitle}
                        </div>
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isChildActive = item.id === currentTab;
                          const itemLabel = language === 'da' ? item.labelDa : item.labelEn;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectTab(item.id)}
                              className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                                isChildActive
                                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Icon className={`w-4 h-4 shrink-0 ${isChildActive ? 'text-white' : 'text-zinc-400'}`} />
                                <span className="truncate">{itemLabel}</span>
                              </div>
                              {item.badge !== null && item.badge !== undefined && (
                                <span
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                                    isChildActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Page Body: Breadcrumbs + Children */}
        <main
          className={`flex-1 p-3 sm:p-4 md:p-6 w-full mx-auto space-y-4 sm:space-y-6 ${
            currentTab === 'mapper' || currentTab === 'findings' || isSidebarCollapsed
              ? 'max-w-[1920px]'
              : 'max-w-7xl'
          }`}
        >
          {/* Interactive Breadcrumbs Trail */}
          <BreadcrumbNav
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            subItemTitle={subItemTitle}
            onClearSubItem={onClearSubItem}
          />

          {children}
        </main>
      </div>

      {/* Floating Quick-Access AI Assistant Button (Hidden on assistant tab and non-intrusive on mobile) */}
      {!isAiSidebarOpen && currentTab !== 'assistant' && (
        <button
          type="button"
          onClick={() => setIsAiSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-30 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs hidden sm:flex items-center gap-2 shadow-2xl shadow-emerald-600/40 border border-emerald-400/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-zinc-950" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
          <span className="tracking-tight">
            {t('AI Sagskonsulent', 'AI Assistant')}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-950 text-emerald-300">
            The Brew 8-Trin
          </span>
        </button>
      )}

      {/* The Brew Method 8-Step Blueprint Interactive Modal */}
      <BrewMethodBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        onLaunchAssistantWithStep={(stepNum, stepTitle) => {
          setIsAiSidebarOpen(true);
        }}
      />

      {/* AI Case Assistant Sidebar Component */}
      <AICaseAssistantSidebar
        isOpen={isAiSidebarOpen}
        onClose={() => setIsAiSidebarOpen(false)}
        isPinned={isAiSidebarPinned}
        onTogglePin={() => setIsAiSidebarPinned(!isAiSidebarPinned)}
        onSelectParty={() => handleSelectTab('parties')}
        onJumpToTimelineDate={() => handleSelectTab('timeline')}
        onSelectEvidence={(id) => {
          if (id.startsWith('DOC')) {
            handleSelectTab('findings');
          } else if (id.startsWith('CLM')) {
            handleSelectTab('claims');
          } else if (id.startsWith('tr')) {
            handleSelectTab('transcripts');
          }
        }}
      />
    </div>
  );
}
