import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Home, Bot, Calendar, Apple, Search, Trophy, Wrench, ShoppingBag, BookOpen, Globe, X, Building2, Siren } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import NavItem from "@/components/navigation/NavItem";

interface HamburgerMenuProps {
  open: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  t: (key: "home" | "aiAssistant" | "weeklyGuide" | "nutritionGuide" | "symptomChecker" | "wellness" | "tools" | "articles") => string;
}

type SecondaryKey = "home" | "aiAssistant" | "weeklyGuide" | "nutritionGuide" | "symptomChecker" | "wellness" | "tools" | "articles";

const SECONDARY_ITEMS: { to: string; labelKey?: SecondaryKey; label?: string; icon: LucideIcon }[] = [
  { to: "/", labelKey: "home" as const, icon: Home },
  { to: "/assistant", labelKey: "aiAssistant" as const, icon: Bot },
  { to: "/weekly-guide", labelKey: "weeklyGuide" as const, icon: Calendar },
  { to: "/nutrition", labelKey: "nutritionGuide" as const, icon: Apple },
  { to: "/symptom-checker", labelKey: "symptomChecker" as const, icon: Search },
  { to: "/wellness", labelKey: "wellness" as const, icon: Trophy },
  { to: "/tools", labelKey: "tools" as const, icon: Wrench },
  { to: "/phc-nearby", label: "PHC", icon: Building2 },
  { to: "/shopping", label: "Care Essentials", icon: ShoppingBag },
  { to: "/articles", labelKey: "articles" as const, icon: BookOpen },
  { to: "/vaccine-tracker", label: "Vaccine Tracker", icon: Siren },
];

export default function HamburgerMenu({
  open,
  onClose,
  language,
  onLanguageChange,
  t,
}: HamburgerMenuProps) {
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    if (!open) return;

    firstFocusRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        role="presentation"
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        aria-label="Navigation menu"
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-white border-l border-border",
          "shadow-2xl transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <p className="text-sm font-semibold">Menu</p>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <label className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                Language
              </span>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="h-9 min-w-[170px] rounded-md border border-input bg-background px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Select language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <nav className="space-y-2" aria-label="Secondary navigation">
            {SECONDARY_ITEMS.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label ?? (item.labelKey ? t(item.labelKey) : "")}
                icon={item.icon}
                active={location.pathname === item.to}
                onClick={onClose}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
