import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Home, Bot, Calendar, Apple, Search, Trophy, Wrench, ShoppingBag, BookOpen, Globe, X, Building2, Siren, LogIn, UserPlus, LogOut, Baby, Settings, User, ChevronDown, Pill, Flame, BarChart3, Leaf, Target, ShieldCheck, Sparkles } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePhase } from "@/hooks/usePhase";
import { useOnboarding } from "@/hooks/useOnboarding";
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
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/nutrition", labelKey: "nutritionGuide" as const, icon: Apple },
  { to: "/symptom-checker", labelKey: "symptomChecker" as const, icon: Search },
  { to: "/wellness", labelKey: "wellness" as const, icon: Trophy },
  { to: "/tools", label: "Tools", icon: Wrench },
  { to: "/shopping", label: "Care Essentials", icon: ShoppingBag },
  { to: "/weekly-guide", label: "Menstrual Guide", icon: Calendar },
  { to: "/articles", labelKey: "articles" as const, icon: BookOpen },
  { to: "/pregnancy-dashboard", label: "Pregnancy Dashboard", icon: Baby },
  { to: "/medicine-reminder", label: "Medicine Reminder", icon: Pill },
];

// Routes to hide when phase is menopause (menopause has its own dedicated pages)
const MENOPAUSE_HIDDEN_ROUTES = new Set([
  "/calendar", "/nutrition", "/symptom-checker", "/wellness",
  "/tools", "/shopping", "/weekly-guide", "/pregnancy-dashboard",
]);

// Menopause-specific menu items
const MENOPAUSE_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/menopause/calendar", label: "Calendar", icon: Calendar },
  { to: "/menopause/analytics", label: "Symptom Analytics", icon: BarChart3 },
  { to: "/menopause/wellness", label: "Wellness Plan", icon: Leaf },
  { to: "/menopause/goals", label: "Daily Goals", icon: Target },
  { to: "/menopause/care", label: "Care Essentials", icon: ShieldCheck },
  { to: "/menopause/fun", label: "Fun Activity", icon: Sparkles },
];

export default function HamburgerMenu({
  open,
  onClose,
  language,
  onLanguageChange,
  t,
}: HamburgerMenuProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { phase } = usePhase();
  const { setShowOnboarding, config } = useOnboarding();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
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

  const menuContent = (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        aria-hidden
        className={cn(
          "fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        aria-label="Navigation menu"
        className={cn(
          "fixed top-0 right-0 z-[9999] h-full w-80 max-w-[85vw] bg-white border-l border-border",
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

        <div className="flex flex-col h-[calc(100%-57px)]">
          <div className="flex-1 overflow-y-auto space-y-5 px-5 py-4">
            {/* User Profile Accordion (if logged in) */}
            {user && (
              <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">My Profile</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", isProfileExpanded && "rotate-180")} />
                </button>
                
                <div className={cn("grid transition-all duration-200", isProfileExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="p-2 bg-card border-t border-border space-y-1">
                      <Link
                        to="/profile"
                        onClick={onClose}
                        className="w-full text-left flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <User className="w-4 h-4 text-primary/70" />
                        View Profile
                      </Link>
                      <button
                        onClick={() => { setShowOnboarding(true); onClose(); }}
                        className="w-full text-left flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Settings className="w-4 h-4 text-primary/70" />
                        {config.onboardingCompleted
                          ? `Change Purpose & Goals`
                          : `Set up your preferences`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation items */}
            <nav className="space-y-2" aria-label="Secondary navigation">
              {SECONDARY_ITEMS.filter(item => {
                if (item.to === "/pregnancy-dashboard" && phase !== "maternity") return false;
                if (item.to === "/wellness" && phase === "maternity") return false;
                // Hide general phase items when in menopause
                if (phase === "menopause" && MENOPAUSE_HIDDEN_ROUTES.has(item.to)) return false;
                return true;
              }).map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label ?? (item.labelKey ? t(item.labelKey) : "")}
                  icon={item.icon}
                  active={location.pathname === item.to}
                  onClick={onClose}
                />
              ))}

              {/* Menopause-specific menu items */}
              {phase === "menopause" && (
                <>
                  <div className="my-2 border-t border-border/60" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 px-3 mb-1">Menopause</p>
                  {MENOPAUSE_ITEMS.map((item) => (
                    <NavItem
                      key={item.to}
                      to={item.to}
                      label={item.label}
                      icon={item.icon}
                      active={location.pathname === item.to}
                      onClick={onClose}
                    />
                  ))}
                </>
              )}
            </nav>
          </div>

          {/* Auth section at bottom */}
          <div className="border-t border-border px-5 py-4">
            {user ? (
              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold shadow-sm transition-colors hover:bg-slate-50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold shadow-sm transition-colors hover:bg-slate-50"
                >
                  <LogIn className="w-4 h-4" />
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );

  return createPortal(menuContent, document.body);
}
