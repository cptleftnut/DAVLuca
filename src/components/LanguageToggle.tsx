import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  showIcon?: boolean;
}

export function LanguageToggle({ className = '', showIcon = true }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      id="language-toggle-control"
      className={`inline-flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 shadow-inner ${className}`}
      role="group"
      aria-label="Language selection"
    >
      {showIcon && (
        <span className="pl-2 pr-1.5 text-slate-500 hidden sm:inline-flex items-center">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
        </span>
      )}
      <button
        id="lang-btn-da"
        type="button"
        onClick={() => setLanguage('da')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          language === 'da'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
        title={t('Skift grænseflade til Dansk', 'Switch interface to Danish')}
      >
        <span className="text-sm">🇩🇰</span>
        <span>Dansk</span>
      </button>
      <button
        id="lang-btn-en"
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
        title={t('Switch interface to English', 'Switch interface to English')}
      >
        <span className="text-sm">🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
}
