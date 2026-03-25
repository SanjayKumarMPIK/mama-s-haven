import { useMemo, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useHealthLog } from "@/hooks/useHealthLog";
import { SYMPTOMS, SEVERITY_COLORS, type SymptomSeverity } from "@/lib/symptoms";
import EmergencyCard from "@/components/EmergencyCard";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Search, Shield, AlertTriangle, Eye, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { analyzePhaseSymptom, KEY_SYMPTOMS_BY_PHASE, type KeySymptomId, type SymptomAnalysisResult, type ViewMode } from "@/lib/symptomAnalysis";

const severityIcons: Record<SymptomSeverity, typeof Shield> = {
  normal: Shield,
  monitor: Eye,
  "visit-center": Activity,
  emergency: AlertTriangle,
};

export default function SymptomChecker() {
  const { t, language, simpleMode } = useLanguage();
  const { phase } = usePhase();
  const { logs, logKeySymptom } = useHealthLog();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedKeySymptomId, setSelectedKeySymptomId] = useState<KeySymptomId | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");

  const filtered = SYMPTOMS.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.nameHi.includes(search) || s.nameTa.includes(search) || s.category.toLowerCase().includes(q);
  });

  const selected = SYMPTOMS.find((s) => s.id === selectedId);
  const showEmergency = selected?.severity === "emergency";

  const phaseAnalysis: SymptomAnalysisResult | null = useMemo(() => {
    if (!selectedKeySymptomId) return null;
    return analyzePhaseSymptom({ phase, logs, symptomId: selectedKeySymptomId, viewMode });
  }, [phase, logs, selectedKeySymptomId, viewMode]);

  const keySymptoms = KEY_SYMPTOMS_BY_PHASE[phase];

  const phaseAccent: Record<string, { border: string; bg: string; text: string; button: string }> = {
    puberty: { border: "border-pink-200", bg: "bg-pink-50", text: "text-pink-900", button: "border-pink-300 bg-pink-50 text-pink-800" },
    maternity: { border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-900", button: "border-purple-300 bg-purple-50 text-purple-800" },
    "family-planning": { border: "border-teal-200", bg: "bg-teal-50", text: "text-teal-900", button: "border-teal-300 bg-teal-50 text-teal-800" },
    menopause: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-900", button: "border-amber-300 bg-amber-50 text-amber-800" },
  };

  const accent = phaseAccent[phase] ?? phaseAccent.puberty;
  const pieColors = ["#8BC6A6", "#F2C574", "#E99696"];

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
          <div className="space-y-4">
            <div className={`rounded-xl border ${accent.border} ${accent.bg} p-4`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key symptoms from your calendar</p>
              <p className="text-[11px] text-muted-foreground mb-3">Tap to see patterns, predictions, and suggestions.</p>
              <div className="grid grid-cols-2 gap-2">
                {keySymptoms.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedKeySymptomId(s.id);
                      setSelectedId(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                      selectedKeySymptomId === s.id
                        ? accent.button
                        : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {selectedKeySymptomId && (
                <button
                  type="button"
                  onClick={() => logKeySymptom(new Date().toISOString().slice(0, 10), phase, selectedKeySymptomId)}
                  className="mt-3 w-full rounded-xl border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  Log selected symptom for today
                </button>
              )}
            </div>

            {filtered.map((symptom) => {
              const colors = SEVERITY_COLORS[symptom.severity];
              const Icon = severityIcons[symptom.severity];
              const name = language === "hi" ? symptom.nameHi : language === "ta" ? symptom.nameTa : symptom.name;

              return (
                <ScrollReveal key={symptom.id}>
                  <button
                    onClick={() => {
                      setSelectedId(symptom.id);
                      setSelectedKeySymptomId(null);
                    }}
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
            {phaseAnalysis && selectedKeySymptomId ? (
              <ScrollReveal>
                <div className="sticky top-20 space-y-4">
                  <EmergencyCard show={false} />

                  <div className={`rounded-xl border-2 p-5 ${accent.border} ${accent.bg}`}>
                    <h2 className="text-sm font-bold mb-2">Insight</h2>
                    <p className={`text-sm leading-relaxed ${accent.text}`}>{phaseAnalysis.insight}</p>
                  </div>

                  <div className={`rounded-xl border-2 p-5 ${accent.border} ${accent.bg}`}>
                    <h2 className="text-sm font-bold mb-2">Prediction</h2>
                    <p className="text-sm leading-relaxed text-foreground/80">{phaseAnalysis.prediction}</p>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">{phaseAnalysis.confidence}</p>
                  </div>

                  <div className={`rounded-xl border p-4 ${accent.border}`}>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-bold mb-1">Trend</h2>
                      <div className="inline-flex rounded-lg border border-border/70 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setViewMode("weekly")}
                          className={`px-2.5 py-1 text-[11px] font-medium ${viewMode === "weekly" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                        >
                          Weekly
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("monthly")}
                          className={`px-2.5 py-1 text-[11px] font-medium ${viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{phaseAnalysis.trendDirection}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Timing Pattern: {phaseAnalysis.timingPattern}</p>
                  </div>

                  <div className={`rounded-xl border p-4 ${accent.border}`}>
                    <h2 className="text-sm font-bold mb-3">Frequency Timeline</h2>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={phaseAnalysis.barData}>
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`rounded-xl border p-4 ${accent.border}`}>
                    <h2 className="text-sm font-bold mb-3">Severity Distribution</h2>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={phaseAnalysis.pieData} dataKey="value" nameKey="name" outerRadius={72} label>
                            {phaseAnalysis.pieData.map((entry, index) => (
                              <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {phaseAnalysis.showSuggestions && (
                    <div className={`rounded-xl border p-4 ${accent.border}`}>
                    <h2 className="text-sm font-bold mb-2">Suggestions</h2>
                    <ul className="space-y-1.5 text-sm text-foreground/80">
                      {phaseAnalysis.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${accent.text}`} />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                    </div>
                  )}

                  {phaseAnalysis.showPHC && (
                    <div className={`rounded-xl border-2 border-amber-200 bg-amber-50 p-4`}>
                      <p className="text-xs font-semibold text-amber-800 mb-2">
                        Frequent symptoms detected — consider consulting a PHC.
                      </p>
                      <Link
                        to="/phc-nearby"
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:shadow-md active:scale-[0.98]"
                      >
                        Find a PHC
                      </Link>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ) : selected ? (
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
