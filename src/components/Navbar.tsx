import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navLinks = [
    { label: t("home"), path: "/" },
    { label: t("aiAssistant"), path: "/assistant" },
    { label: t("weeklyGuide"), path: "/weekly-guide" },
    { label: t("nutritionGuide"), path: "/nutrition" },
    { label: t("symptomChecker"), path: "/symptom-checker" },
    { label: "Wellness", path: "/wellness" },
    { label: t("tools"), path: "/tools" },
    { label: t("articles"), path: "/articles" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      {/* Slim gov branding bar */}
      <div className="bg-[hsl(220,60%,30%)] text-white">
        <div className="container flex items-center justify-between py-1 text-[10px]">
          <span className="font-medium tracking-wide">{t("appName")} — {t("poweredBy")}</span>
          <div className="hidden sm:flex items-center gap-3">
            <a href="tel:104" className="flex items-center gap-1 hover:underline"><Phone className="w-2.5 h-2.5" /> 104</a>
            <a href="tel:102" className="flex items-center gap-1 hover:underline"><Phone className="w-2.5 h-2.5" /> 102</a>
          </div>
        </div>
      </div>

      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg">🤰</span>
          </div>
          <span className="text-lg font-bold text-gradient-bloom">{t("appName")}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
                location.pathname === link.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/emergency"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white shadow-sm hover:bg-red-700 transition-all active:scale-95"
          >
            🚨 {t("emergency")}
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-muted active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="lg:hidden border-t border-border/60 bg-background animate-fade-in">
          <div className="container py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/emergency"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white text-center active:scale-[0.97] transition-all"
            >
              🚨 {t("emergency")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
