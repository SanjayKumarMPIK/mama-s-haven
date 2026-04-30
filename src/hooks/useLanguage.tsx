import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Language, t as translate } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: Parameters<typeof translate>[1]) => string;
  simpleMode: boolean;
  setSimpleMode: (v: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translate("en", key),
  simpleMode: false,
  setSimpleMode: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem("mh-lang") as Language) || "en";
    } catch {
      return "en";
    }
  });

  const [simpleMode, setSimpleMode] = useState(() => {
    try {
      return localStorage.getItem("mh-simple") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try { localStorage.setItem("mh-lang", language); } catch {}
  }, [language]);

  useEffect(() => {
    try { localStorage.setItem("mh-simple", String(simpleMode)); } catch {}
  }, [simpleMode]);

  const setLanguage = (lang: Language) => setLang(lang);
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, simpleMode, setSimpleMode }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
