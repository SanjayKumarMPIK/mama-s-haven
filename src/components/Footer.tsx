import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Phone, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      {/* Helpline strip */}
      <div className="bg-red-50 border-b border-red-100">
        <div className="container py-3 flex flex-wrap items-center justify-center gap-6 text-sm">
          <a href="tel:104" className="flex items-center gap-2 font-semibold text-red-700 hover:underline">
            <Phone className="w-4 h-4" /> {t("helplineMaternal")}
          </a>
          <a href="tel:102" className="flex items-center gap-2 font-semibold text-red-700 hover:underline">
            <Phone className="w-4 h-4" /> {t("helplineAmbulance")}
          </a>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤰</span>
              <span className="text-lg font-bold text-gradient-bloom">{t("appName")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{t("subtitle")}</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: t("weeklyGuide"), path: "/weekly-guide" },
                { label: t("nutritionGuide"), path: "/nutrition" },
                { label: t("symptomChecker"), path: "/symptom-checker" },
                { label: t("aiAssistant"), path: "/assistant" },
                { label: t("emergency"), path: "/emergency" },
                { label: t("about"), path: "/about" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Gov info */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Important</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>{t("disclaimerShort")}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Heart className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>{t("poweredBy")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground">{t("govDisclaimer")}</p>
          <p className="text-[10px] text-muted-foreground">© 2026 {t("appName")}</p>
        </div>
      </div>

      {/* Tricolor bottom */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[hsl(22,90%,52%)]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[hsl(140,60%,35%)]" />
      </div>
    </footer>
  );
}
