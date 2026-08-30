import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'da' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (daText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'da',
  setLanguage: () => {},
  t: (da, en) => da
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('app_lang');
      if (saved === 'en' || saved === 'da') return saved;
    } catch (e) {
      // ignore
    }
    return 'da'; // Danish is default
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('app_lang', lang);
    } catch (e) {
      // ignore
    }
  };

  const t = (daText: string, enText: string) => {
    return language === 'da' ? daText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
