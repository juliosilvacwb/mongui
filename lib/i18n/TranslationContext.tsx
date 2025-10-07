"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en, Translation } from "./languages/en";
import { pt } from "./languages/pt";

type Language = "en" | "pt";

interface TranslationContextType {
  t: Translation;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const translations: Record<Language, Translation> = {
  en,
  pt,
};

const TranslationContext = createContext<TranslationContextType>({
  t: en,
  language: "en",
  setLanguage: () => {},
});

export const useTranslation = () => useContext(TranslationContext);

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem("mongui-language") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "pt")) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("mongui-language", lang);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const t = translations[language];

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

