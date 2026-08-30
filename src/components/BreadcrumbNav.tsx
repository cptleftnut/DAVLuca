import React, { useState } from 'react';
import {
  ChevronRight,
  Home,
  Layers,
  Sparkles,
  Compass,
  ArrowLeft,
  ChevronDown,
  LayoutDashboard,
  Clock,
  Share2,
  Users,
  BookOpen,
  FileText,
  Mic,
  HardDrive,
  ShieldAlert,
  ListTodo,
  Fingerprint,
  Bot,
  Search,
  BarChart3
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface BreadcrumbItem {
  id: string;
  labelDa: string;
  labelEn: string;
  icon?: React.ElementType;
  isCategory?: boolean;
}

interface BreadcrumbNavProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  subItemTitle?: string | null;
  onClearSubItem?: () => void;
  className?: string;
}

export function BreadcrumbNav({
  currentTab,
  onSelectTab,
  subItemTitle,
  onClearSubItem,
  className = ''
}: BreadcrumbNavProps) {
  const { language, t } = useLanguage();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);

  // Grouped Navigation Sections Definition
  const sections = [
    {
      categoryId: 'cat_investigation',
      categoryNameDa: 'Efterforskning & Syntese',
      categoryNameEn: 'Investigation & Synthesis',
      items: [
        { id: 'overview', labelDa: 'Sagssyntese (Dashboard)', labelEn: 'Case Synthesis (Dashboard)', icon: LayoutDashboard },
        { id: 'timeline', labelDa: 'Kronologisk Tidslinje', labelEn: 'Chronological Timeline', icon: Clock },
        { id: 'mapper', labelDa: 'Connection Mapper (D3)', labelEn: 'Connection Mapper (D3)', icon: Share2 },
        { id: 'parties', labelDa: 'Parter & Aktørgraf', labelEn: 'Parties & Relations', icon: Users },
        { id: 'reports', labelDa: 'Master Rapporter (MD)', labelEn: 'Master Reports (MD)', icon: BookOpen }
      ]
    },
    {
      categoryId: 'cat_evidence',
      categoryNameDa: 'Evidens & Kildearkiv',
      categoryNameEn: 'Evidence & Archives',
      items: [
        { id: 'findings', labelDa: 'Aktindsigter & Dokumenter', labelEn: 'Document Findings', icon: FileText },
        { id: 'transcripts', labelDa: 'Lydoptagelser & Udsagn', labelEn: 'Audio Recordings', icon: Mic },
        { id: 'drive', labelDa: 'Google Drive Arkiv', labelEn: 'Google Drive Archive', icon: HardDrive }
      ]
    },
    {
      categoryId: 'cat_legal',
      categoryNameDa: 'Juridisk Kontrol & Revisionslog',
      categoryNameEn: 'Legal Audit & Chain of Custody',
      items: [
        { id: 'claims', labelDa: 'Register over Påstande', labelEn: 'Claims Register', icon: ShieldAlert },
        { id: 'queue', labelDa: 'Forvaltningskontrolkø', labelEn: 'Control & Audit Queue', icon: ListTodo },
        { id: 'audit', labelDa: 'Revisionslog (Audit Trail)', labelEn: 'Investigation Audit Log', icon: Fingerprint }
      ]
    },
    {
      categoryId: 'cat_ai',
      categoryNameDa: 'Dybdeanalyse & AI',
      categoryNameEn: 'Intelligence & Search',
      items: [
        { id: 'assistant', labelDa: 'The Brew AI Sagskonsulent', labelEn: 'The Brew AI Assistant', icon: Bot },
        { id: 'search', labelDa: 'Global Dybdesøgning', labelEn: 'Global Deep Search', icon: Search },
        { id: 'infographics', labelDa: 'Infografik & Matrix', labelEn: 'Infographics Matrix', icon: BarChart3 }
      ]
    }
  ];

  // Find active category and item
  const currentCategory = sections.find(cat => cat.items.some(it => it.id === currentTab)) || sections[0];
  const currentItem = currentCategory.items.find(it => it.id === currentTab) || currentCategory.items[0];

  const categoryName = language === 'da' ? currentCategory.categoryNameDa : currentCategory.categoryNameEn;
  const itemName = language === 'da' ? currentItem.labelDa : currentItem.labelEn;
  const ItemIcon = currentItem.icon;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs overflow-x-auto scrollbar-none backdrop-blur-md ${className}`}
    >
      {/* Breadcrumb Steps */}
      <ol className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
        {/* Step 0: Root Home */}
        <li className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'overview' && !subItemTitle
                ? 'bg-emerald-600/20 text-emerald-300 font-bold border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title={t('Gå til Forside Dashboard', 'Go to Main Dashboard')}
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{t('Forside', 'Home')}</span>
          </button>
        </li>

        <li className="text-zinc-600 shrink-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>

        {/* Step 1: Category Dropdown */}
        <li className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsCategoryMenuOpen(!isCategoryMenuOpen);
              setIsSectionMenuOpen(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer font-medium"
          >
            <Layers className="w-3 h-3 text-indigo-400" />
            <span className="truncate max-w-[130px] sm:max-w-[180px]">{categoryName}</span>
            <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isCategoryMenuOpen ? 'rotate-180 text-indigo-400' : ''}`} />
          </button>

          {isCategoryMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsCategoryMenuOpen(false)} />
              <div className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                  {t('Vælg Kategori', 'Select Category')}
                </div>
                {sections.map(cat => {
                  const catTitle = language === 'da' ? cat.categoryNameDa : cat.categoryNameEn;
                  const isSelected = cat.categoryId === currentCategory.categoryId;
                  return (
                    <button
                      key={cat.categoryId}
                      type="button"
                      onClick={() => {
                        onSelectTab(cat.items[0].id);
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{catTitle}</span>
                      <span className="text-[10px] font-mono opacity-70">
                        {cat.items.length} {t('sektioner', 'sections')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </li>

        <li className="text-zinc-600 shrink-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>

        {/* Step 2: Active Section Dropdown */}
        <li className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsSectionMenuOpen(!isSectionMenuOpen);
              setIsCategoryMenuOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
              !subItemTitle
                ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/50 shadow-sm'
                : 'text-zinc-300 hover:text-white bg-zinc-950/60 hover:bg-zinc-800 border-zinc-800'
            }`}
          >
            {ItemIcon && <ItemIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
            <span className="truncate max-w-[120px] sm:max-w-[170px]">{itemName}</span>
            <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isSectionMenuOpen ? 'rotate-180 text-indigo-400' : ''}`} />
          </button>

          {isSectionMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsSectionMenuOpen(false)} />
              <div className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                  <span>{categoryName}</span>
                  <span className="text-zinc-500 font-mono text-[9px]">{t('Sektioner', 'Sections')}</span>
                </div>
                {currentCategory.items.map(it => {
                  const Icon = it.icon;
                  const label = language === 'da' ? it.labelDa : it.labelEn;
                  const isCurrent = it.id === currentTab;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(it.id);
                        if (onClearSubItem) onClearSubItem();
                        setIsSectionMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-indigo-400'}`} />
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </li>

        {/* Step 3: Sub-Item Breadcrumb (if active item inspect modal/drawer is open) */}
        {subItemTitle && (
          <>
            <li className="text-zinc-600 shrink-0">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className="shrink-0 flex items-center gap-1">
              <div className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                <span className="truncate max-w-[120px] sm:max-w-[220px]">{subItemTitle}</span>
                {onClearSubItem && (
                  <button
                    type="button"
                    onClick={onClearSubItem}
                    className="p-0.5 rounded hover:bg-emerald-500/30 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                    title={t('Luk akt / detaljevisning', 'Close detail view')}
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          </>
        )}
      </ol>

      {/* Quick Step-Back / Fast Shortcut */}
      <div className="flex items-center gap-2 shrink-0">
        {currentTab !== 'overview' && (
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer border border-zinc-700 hidden md:flex"
            title={t('Tilbage til Sagssyntese', 'Back to Overview')}
          >
            <ArrowLeft className="w-3 h-3 text-indigo-400" />
            <span>{t('Oversigt', 'Overview')}</span>
          </button>
        )}
      </div>
    </nav>
  );
}
