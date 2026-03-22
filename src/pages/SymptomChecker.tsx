import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { SYMPTOMS, SEVERITY_COLORS, type SymptomSeverity } from "@/lib/symptoms";
import EmergencyCard from "@/components/EmergencyCard";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Search, Shield, AlertTriangle, Eye, Activity } from "lucide-react";

const severityIcons: Record<SymptomSeverity, typeof Shield> = {
  normal: Shield,
  monitor: Eye,
  "visit-center": Activity,
  emergency: AlertTriangle,
};

export default function SymptomChecker() {
  const { t, language, simpleMode } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = SYMPTOMS.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.nameHi.includes(search) || s.nameTa.includes(search) || s.category.toLowerCase().includes(q);
  });

  const selected = SYMPTOMS.find((s) => s.id === selectedId);
  const showEmergency = selected?.severity === "emergency";

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("symptomChecker")}</h1>
                <p className="text-sm text-muted-foreground">{t("disclaimerShort")}</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchSymptoms")}
                className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                id="symptom-search"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Symptom list */}
          <div className="space-y-2">
            {filtered.map((symptom) => {
              const colors = SEVERITY_COLORS[symptom.severity];
              const Icon = severityIcons[symptom.severity];
              const name = language === "hi" ? symptom.nameHi : language === "ta" ? symptom.nameTa : symptom.name;

              return (
                <ScrollReveal key={symptom.id}>
                  <button
                    onClick={() => setSelectedId(symptom.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all duration-200 hover:shadow-md active:scale-[0.99] ${
                      selectedId === symptom.id
                        ? `${colors.bg} ${colors.border} border-2 shadow-sm`
                        : "bg-card border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                        <span className="font-medium text-sm">{name}</span>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                        {symptom.severity === "normal" ? t("symptomNormal") :
                         symptom.severity === "monitor" ? t("symptomMonitor") :
                         symptom.severity === "visit-center" ? t("symptomVisitCenter") :
                         t("symptomEmergency")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{symptom.category}</p>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Detail pane */}
          <div>
            {selected ? (
              <ScrollReveal>
                <div className="sticky top-20 space-y-4">
                  <EmergencyCard show={showEmergency || false} />

                  <div className={`rounded-xl border-2 p-6 ${SEVERITY_COLORS[selected.severity].border} ${SEVERITY_COLORS[selected.severity].bg}`}>
                    <h2 className="text-lg font-bold mb-1">{language === "hi" ? selected.nameHi : language === "ta" ? selected.nameTa : selected.name}</h2>
                    <p className={`text-xs font-medium mb-4 ${SEVERITY_COLORS[selected.severity].text}`}>
                      {selected.severity === "normal" ? t("symptomNormal") :
                       selected.severity === "monitor" ? t("symptomMonitor") :
                       selected.severity === "visit-center" ? t("symptomVisitCenter") :
                       t("symptomEmergency")}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-1">What it means</h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">{selected.description}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-1">What to do</h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">{selected.advice}</p>
                      </div>
                      <div className="border-t pt-3">
                        <h3 className="text-sm font-semibold mb-1 text-red-700">When to seek help</h3>
                        <p className="text-sm text-red-600 leading-relaxed">{selected.escalation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{t("searchSymptoms")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
