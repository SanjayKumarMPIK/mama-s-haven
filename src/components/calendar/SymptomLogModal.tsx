import { useEffect, useMemo, useRef, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

import type { CalendarSymptomLogItem, SymptomAnalyticsResponse, SymptomTime } from "@/api/symptomsApi";
import { getSymptomAnalytics } from "@/api/symptomsApi";
import { useAuth } from "@/hooks/useAuth";

const severityLabel = (s: number) => (s <= 2 ? "Mild" : s <= 4 ? "Moderate" : "Severe");

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export type SymptomOption = { id: string; label: string };

interface Props {
  dateISO: string | null;
  initialSymptoms: CalendarSymptomLogItem[];
  symptomOptions: SymptomOption[];
  onClose: () => void;
  onSave: (dateISO: string, symptoms: CalendarSymptomLogItem[]) => Promise<void>;
}

export default function SymptomLogModal({ dateISO, initialSymptoms, symptomOptions, onClose, onSave }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userKey = user?.id;
  const [draftSymptoms, setDraftSymptoms] = useState<CalendarSymptomLogItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedForAnalytics, setSelectedForAnalytics] = useState<string | null>(null);
  const initialSymptomsRef = useRef<CalendarSymptomLogItem[]>(initialSymptoms ?? []);

  useEffect(() => {
    initialSymptomsRef.current = initialSymptoms ?? [];
  }, [initialSymptoms]);

  useEffect(() => {
    if (!dateISO) return;
    setDraftSymptoms(initialSymptomsRef.current);
    setSelectedForAnalytics(null);
    setSaving(false);
  }, [dateISO]);

  const selectedAnalyticsQuery = useQuery<SymptomAnalyticsResponse>({
    queryKey: ["symptomAnalytics", selectedForAnalytics, userKey ?? "default"],
    enabled: !!selectedForAnalytics,
    queryFn: () => getSymptomAnalytics(selectedForAnalytics as string, userKey),
    staleTime: 10 * 60 * 1000,
  });

  const selectedOptionsMap = useMemo(() => new Map(symptomOptions.map((o) => [o.id, o.label])), [symptomOptions]);

  function setSymptomAt(idx: number, next: Partial<CalendarSymptomLogItem>) {
    setDraftSymptoms((prev) => prev.map((s, i) => (i === idx ? { ...s, ...next } : s)));
  }

  function removeSymptomAt(idx: number) {
    setDraftSymptoms((prev) => prev.filter((_, i) => i !== idx));
  }

  function addSymptomRow() {
    const defaultName = symptomOptions[0]?.id ?? "";
    setDraftSymptoms((prev) => [
      ...prev,
      { name: defaultName, severity: 3, time: "evening" as SymptomTime, notes: "" },
    ]);
  }

  async function handleSave() {
    if (!dateISO) return;
    if (saving) return;
    // Minimal validation to keep UI responsive.
    for (const s of draftSymptoms) {
      if (!s.name || s.name.trim().length === 0) return;
      if (s.severity < 1 || s.severity > 5) return;
    }

    setSaving(true);
    try {
      await onSave(dateISO, draftSymptoms);
      // Invalidate analytics for anything currently in/was in the day, so edits reflect instantly.
      const invalidationNames = new Set<string>([
        ...initialSymptoms.map((s) => s.name),
        ...draftSymptoms.map((s) => s.name),
      ]);
      for (const name of invalidationNames) {
        queryClient.invalidateQueries({ queryKey: ["symptomAnalytics", name, userKey ?? "default"] });
      }
      queryClient.invalidateQueries({ queryKey: ["weeklyGuidance"] });
      // If the selected symptom was removed, clear the analytics selection.
      if (selectedForAnalytics && !draftSymptoms.some((s) => s.name === selectedForAnalytics)) {
        setSelectedForAnalytics(null);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!dateISO) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Log symptoms for ${dateISO}`}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col"
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-border/60">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{formatDisplayDate(dateISO)}</p>
            <h2 className="text-lg font-bold mt-0.5">Daily Symptom Log</h2>
            <p className="text-xs text-muted-foreground mt-1">Tap a symptom row to view analytics.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors mt-0.5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Draft editor */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Symptoms</h3>
              <button
                type="button"
                onClick={addSymptomRow}
                className="px-3 py-1.5 rounded-xl border border-border bg-white text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Add symptom
              </button>
            </div>

            {draftSymptoms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No symptoms logged for this date. Add one to begin.</p>
            ) : (
              <div className="space-y-3">
                {draftSymptoms.map((s, idx) => {
                  const label = selectedOptionsMap.get(s.name) ?? s.name;
                  const active = selectedForAnalytics === s.name;
                  const intensity =
                    s.severity <= 2 ? "bg-primary/30 border-primary/40" : s.severity <= 4 ? "bg-primary/60 border-primary/80" : "bg-primary/90 border-primary";

                  return (
                    <button
                      key={`${idx}-${s.name}`}
                      type="button"
                      onClick={() => setSelectedForAnalytics(s.name)}
                      className={`w-full text-left rounded-xl border p-3 transition-colors ${
                        active ? intensity : "bg-card border-border hover:bg-muted/40"
                      }`}
                      aria-label={`Select ${label} for analytics`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Symptom
                              <select
                                value={s.name}
                                onChange={(e) => setSymptomAt(idx, { name: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                              >
                                {symptomOptions.map((o) => (
                                  <option key={o.id} value={o.id}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Time
                              <select
                                value={s.time}
                                onChange={(e) => setSymptomAt(idx, { time: e.target.value as SymptomTime })}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                              >
                                <option value="morning">morning</option>
                                <option value="afternoon">afternoon</option>
                                <option value="evening">evening</option>
                              </select>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Severity (1-5)
                              <select
                                value={s.severity}
                                onChange={(e) => setSymptomAt(idx, { severity: Number(e.target.value) })}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <option key={n} value={n}>
                                    {n} ({severityLabel(n)})
                                  </option>
                                ))}
                              </select>
                            </label>

                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Summary
                              </p>
                              <p className="text-sm font-medium mt-1">
                                {label} · {severityLabel(s.severity)} · {s.time}
                              </p>
                            </div>
                          </div>

                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Notes (optional)
                            <input
                              type="text"
                              value={s.notes ?? ""}
                              onChange={(e) => setSymptomAt(idx, { notes: e.target.value })}
                              className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                              placeholder="e.g., mild discomfort"
                            />
                          </label>
                        </div>

                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSymptomAt(idx);
                            }}
                            className="w-9 h-9 rounded-full inline-flex items-center justify-center border border-border hover:bg-muted/40 transition-colors"
                            aria-label="Remove symptom"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Analytics panel */}
          {selectedAnalyticsQuery.isSuccess && selectedForAnalytics && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Analytics for {selectedOptionsMap.get(selectedForAnalytics) ?? selectedForAnalytics}</h3>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold">Insight</p>
                  <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{selectedAnalyticsQuery.data.insight}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Prediction</p>
                  <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{selectedAnalyticsQuery.data.prediction}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-2">{selectedAnalyticsQuery.data.confidence}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Frequency Timeline</p>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedAnalyticsQuery.data.barData}>
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-1">
                  <p className="text-sm font-semibold mb-2">Severity Distribution</p>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedAnalyticsQuery.data.pieData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={52}
                          label
                        >
                          {selectedAnalyticsQuery.data.pieData.map((entry, index) => (
                            <Cell key={entry.name} fill={["#8BC6A6", "#F2C574", "#E99696"][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          )}

          {selectedAnalyticsQuery.isLoading && selectedForAnalytics && (
            <section className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Loading analytics…</p>
            </section>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border/60 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted/50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all ${
              saving ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:shadow-md active:scale-[0.97]"
            }`}
          >
            {saving ? "Saving…" : "Save log"}
          </button>
        </div>
      </div>
    </>
  );
}

