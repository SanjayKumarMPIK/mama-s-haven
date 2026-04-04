import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building2, Menu, Siren, ShieldCheck, Phone, LogIn, UserPlus, LogOut } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useAuth } from "@/hooks/useAuth";
import HamburgerMenu from "@/components/navigation/HamburgerMenu";
import NavItem from "@/components/navigation/NavItem";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { t, setLanguage, language } = useLanguage();
  const { phaseName } = usePhase();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
      {/* Slim gov branding bar */}
      <div className="bg-[hsl(220,60%,30%)] text-white">
        <div className="container flex items-center justify-between py-1 text-[10px]">
          <span className="font-medium tracking-wide">{t("appName")} — {t("poweredBy")}</span>
          <div className="hidden sm:flex items-center gap-3">
            <a href="tel:104" className="flex items-center gap-1 hover:underline"><Phone className="w-2.5 h-2.5" /> 104</a>
            <a href="tel:108" className="flex items-center gap-1 hover:underline"><Phone className="w-2.5 h-2.5" /> 108</a>
          </div>
        </div>
      </div>

      <div className="container flex h-16 items-center gap-2">
        <Link to="/" className="inline-flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-gradient-bloom sm:text-base">{t("appName")}</span>
        </Link>

        {/* Desktop mandatory items */}
        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          <NavItem to="/phc-nearby" label="PHC" icon={Building2} active={location.pathname === "/phc-nearby"} compact />
          <NavItem to="/vaccine-tracker" label="Vaccine Tracker" icon={Siren} active={location.pathname === "/vaccine-tracker"} compact />
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {/* Phase badge (read-only — change via Settings) */}
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap px-2 py-1 rounded-full bg-muted/50 border border-border/60">
            Phase: <span className="font-semibold text-foreground">{phaseName}</span>
          </span>
          <LanguageSwitcher />

          {/* Auth buttons */}
          {user ? (
            <div className="flex items-center gap-2 border-l pl-2 border-border/50">
              <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-xs font-semibold shadow-sm transition-colors hover:bg-slate-50 text-slate-600"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l pl-2 border-border/50">
              <Link
                to="/login"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-xs font-semibold shadow-sm transition-colors hover:bg-slate-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                Log in
              </Link>
              <Link
                to="/register"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign up
              </Link>
            </div>
          )}

          <Link
            to="/emergency"
            className="inline-flex h-9 items-center rounded-md bg-red-600 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Open emergency guidance"
          >
            {t("emergency")}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile: emergency + hamburger */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link
            to="/emergency"
            className="inline-flex h-9 items-center rounded-md bg-red-600 px-3 text-xs font-semibold text-white shadow-sm"
            aria-label="Open emergency guidance"
          >
            {t("emergency")}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile phase badge (read-only) */}
      <div className="border-t border-border/60 bg-background lg:hidden">
        <div className="container flex items-center justify-center py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Phase: <span className="font-semibold text-foreground">{phaseName}</span>
          </span>
        </div>
      </div>

      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        t={t}
      />
    </header>
  );
}
