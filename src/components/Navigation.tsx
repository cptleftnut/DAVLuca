import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Scale,
  Compass,
  Fingerprint,
  HardDrive,
  FileText,
  Clock,
  Share2,
  Users,
  Bot,
  Radio,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  FolderGit2,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCaseData } from '../contexts/CaseDataContext';
import { LanguageToggle } from './LanguageToggle';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, t } = useLanguage();
  const { summary, documents, transcripts, parties, auditLogs } = useCaseData();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  const quickNavItems = [
    { id: 'overview', labelDa: 'Sagssyntese', labelEn: 'Case Synthesis', icon: Scale },
    { id: 'timeline', labelDa: 'Tidslinje', labelEn: 'Timeline', icon: Clock },
    { id: 'findings', labelDa: 'Akter & Evidens', labelEn: 'Evidence', icon: FileText, count: documents.length },
    { id: 'transcripts', labelDa: 'Lyd & Interview', labelEn: 'Audio', icon: Radio, count: transcripts.length },
    { id: 'parties', labelDa: 'Partsgraf', labelEn: 'Parties', icon: Users, count: parties.length },
    { id: 'mapper', labelDa: 'Connection Mapper', labelEn: 'Connection Mapper', icon: Share2 },
    { id: 'audit', labelDa: 'Revisionslog', labelEn: 'Audit Log', icon: Fingerprint, count: auditLogs.length }
  ];

  return (
    <nav className="bg-zinc-950/95 border-b border-zinc-800/90 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <NavLink to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-zinc-950 font-black text-xs shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform shrink-0">
              BM
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-sm sm:text-base tracking-tight truncate">
                  The Brew Forensic Platform
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold shrink-0 hidden sm:inline">
                  {summary.caseNumber}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono truncate hidden md:inline">
                Lyngby-Taarbæk Sagen • Graverjournalistisk Efterforskning (8-Trin)
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-zinc-950 font-bold shadow-md shadow-emerald-600/20'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t('Sagsdashboard', 'Case Dashboard')}</span>
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-zinc-950 font-bold shadow-md shadow-emerald-600/20'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('Om DAVLuca Forensic', 'About DAVLuca Forensic')}</span>
            </NavLink>

            {/* Language Switcher */}
            <div className="pl-2 border-l border-zinc-800 flex items-center">
              <LanguageToggle />
            </div>
          </div>

          {/* Mobile Right Bar: Language Switcher + Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 focus:outline-none cursor-pointer border border-zinc-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="block h-5 w-5 text-emerald-400" /> : <Menu className="block h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Slide down / overlay) */}
      {isOpen && (
        <div className="md:hidden bg-zinc-950/98 border-b border-zinc-800 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <div className="px-4 pt-3 pb-5 space-y-3">
            {/* Primary Site Pages */}
            <div className="space-y-1 pb-3 border-b border-zinc-800">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1">
                {t('Hovedsider', 'Main Pages')}
              </div>
              <NavLink
                to="/"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-zinc-950 font-bold shadow-md shadow-emerald-600/20'
                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`
                }
              >
                <Scale className="w-4 h-4" />
                <span>{t('Sagsdashboard', 'Case Dashboard')}</span>
              </NavLink>

              <NavLink
                to="/about"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-zinc-950 font-bold shadow-md shadow-emerald-600/20'
                      : 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`
                }
              >
                <Compass className="w-4 h-4" />
                <span>{t('Om DAVLuca Forensic', 'About DAVLuca Forensic')}</span>
              </NavLink>
            </div>

            {/* Case Quick Status Bar */}
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-zinc-300 font-bold">{summary.caseNumber}</span>
              </div>
              <span className="text-zinc-400 font-mono text-[11px]">
                {documents.length} {t('akter', 'docs')} • {transcripts.length} {t('lydfiler', 'audio')}
              </span>
            </div>

            {/* External Links */}
            <div className="pt-2 flex items-center justify-between text-xs px-2 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>DAVLuca GitHub</span>
              </span>
              <a
                href="https://github.com/cptleftnut/DAVLuca"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                cptleftnut/DAVLuca <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
