import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import EmergencyCard from "@/components/EmergencyCard";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { KEY_SYMPTOMS_BY_PHASE } from "@/lib/symptomAnalysis";
import { getSymptomAnalytics, getSymptomLogsInRange, type SymptomAnalyticsResponse } from "@/api/symptomsApi";
import { useAuth } from "@/hooks/useAuth";

export default function SymptomChecker() {
  const { simpleMode } = useLanguage();
  const { phase } = usePhase();
  const { user } = useAuth();
  const userKey = user?.id;
  const [selectedKeySymptomId, setSelectedKeySymptomId] = useState<string | null>(null);

  const todayISO = new Date().toISOString().slice(0, 10);
  const oneYearAgoISO = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const logsQuery = useQuery({
    queryKey: ["symptomLogsRange", "year-dynamic", userKey ?? "default"],
    queryFn: () => getSymptomLogsInRange(oneYearAgoISO, todayISO, userKey),
    staleTime: 5 * 60 * 1000,
  });

  const loggedSymptoms = useMemo(() => {
    if (!logsQuery.data) return [];
    const counts: Record<string, number> = {};
    for (const log of logsQuery.data) {
      if (!log.symptoms) continue;
      for (const s of log.symptoms) {
        counts[s.name] = (counts[s.name] || 0) + 1;
      }
    }
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
    return sorted;
  }, [logsQuery.data]);

  const analyticsQuery = useQuery<SymptomAnalyticsResponse>({
    queryKey: ["symptomAnalytics", selectedKeySymptomId, userKey ?? "default"],
    enabled: !!selectedKeySymptomId,
    queryFn: () => getSymptomAnalytics(selectedKeySymptomId as string, userKey),
    staleTime: 10 * 60 * 1000,
  });
  const phaseAnalysis = analyticsQuery.data ?? null;

  const getSymptomLabel = (name: string) => {
    for (const p of Object.values(KEY_SYMPTOMS_BY_PHASE)) {
      const found = p.find((s) => s.id === name);
      if (found) return found.label;
    }
    return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

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
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${accent.bg} flex items-center justify-center`}>
                <Activity className={`w-5 h-5 ${accent.text}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Key Symptoms from Your Calendar</h1>
                <p className="text-sm text-muted-foreground">Tap a symptom below to see your personalized insights.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Symptom list (Dynamic Chips) */}
          <div className="space-y-4">
            <div className={`rounded-xl border shadow-sm ${accent.border} ${accent.bg} p-6`}>
              {logsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading your symptom history...</p>
              ) : loggedSymptoms.length > 0 ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Your Logged Symptoms</p>
                  <div className="flex flex-wrap gap-2.5">
                    {loggedSymptoms.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => setSelectedKeySymptomId(s.name)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all active:scale-[0.98] ${
                          selectedKeySymptomId === s.name
                            ? accent.button
                            : "border-border/60 bg-background hover:border-primary/30 shadow-sm"
                        }`}
                      >
                        {getSymptomLabel(s.name)} <span className="ml-1 opacity-60 text-xs font-normal">({s.count})</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-base font-semibold mb-1">No symptoms logged yet</h3>
                  <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                    Start tracking from your calendar to see insights, dynamic patterns, and personalized suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detail pane */}
          <div>
            {selectedKeySymptomId ? (
              analyticsQuery.isLoading ? (
                <div className="sticky top-20 space-y-4">
                  <p className="text-sm text-muted-foreground">Loading analytics…</p>
                </div>
              ) : phaseAnalysis ? (
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
                      <h2 className="text-sm font-bold mb-1">Trend</h2>
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
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${accent.bg.replace("50", "400")}`} />
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
              ) : (
                <div className="sticky top-20 space-y-4">
                  <p className="text-sm text-muted-foreground">No analytics available.</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/20">
                {loggedSymptoms.length > 0 ? (
                  <>
                    <Activity className="w-8 h-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground max-w-[200px]">Select a symptom chip from your logs to view insights & patterns.</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Log symptoms in your calendar first.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
