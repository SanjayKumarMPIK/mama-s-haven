import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGES } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200"
        title={t("selectLanguage")}
        id="language-switcher"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{LANGUAGES.find((l) => l.code === language)?.native || "English"}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                language === lang.code
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.native}</span>
              <span className="ml-auto text-xs text-muted-foreground">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
