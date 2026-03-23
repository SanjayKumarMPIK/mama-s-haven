import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Syringe, Bell } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { usePhase, type Phase } from "@/hooks/usePhase";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { Button } from "@/components/ui/button";

const STORAGE_PREFIX = "ss-vaccine-";

type VaxStatus = "pending" | "completed";

interface VaxRow {
  id: string;
  name: string;
  schedule: string;
  note: string;
}

const BY_PHASE: Record<Phase, VaxRow[]> = {
  puberty: [
    { id: "hpv", name: "HPV (as per national schedule)", schedule: "Dose schedule per MOHFW / school health camp", note: "Ask your doctor about age-appropriate dosing." },
    { id: "tt", name: "Tetanus (TT)", schedule: "Booster as advised (e.g. every 10 years)", note: "Often given with other school-age boosters." },
  ],
  maternity: [
    { id: "tt-mat", name: "Tetanus (TT) / Tdap", schedule: "As per ANC visits — protect mother & newborn", note: "Follow your obstetrician’s plan." },
    { id: "flu", name: "Influenza (inactivated)", schedule: "Once per flu season if advised", note: "Discuss timing during pregnancy with your doctor." },
  ],
  "family-planning": [
    { id: "rubella", name: "Rubella / MMR (if non-immune)", schedule: "Before conception when advised", note: "Live vaccines may not be given during pregnancy — plan ahead." },
    { id: "tt-fp", name: "Tetanus (TT)", schedule: "Up to date before pregnancy", note: "General adult booster as per schedule." },
  ],
};

function loadStatus(phase: Phase): Record<string, VaxStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + phase);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, VaxStatus>;
  } catch {
    return {};
  }
}

export default function VaccineTracker() {
  const { phase, phaseName, phaseEmoji } = usePhase();
  const rows = BY_PHASE[phase];
  const [status, setStatus] = useState<Record<string, VaxStatus>>(() => loadStatus(phase));

  useEffect(() => {
    setStatus(loadStatus(phase));
  }, [phase]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + phase, JSON.stringify(status));
    } catch {
      /* ignore */
    }
  }, [phase, status]);

  const toggle = (id: string) => {
    setStatus((s) => ({
      ...s,
      [id]: s[id] === "completed" ? "pending" : "completed",
    }));
  };

  return (
    <main className="min-h-screen py-12 bg-background">
      <div className="container max-w-3xl">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-lavender/80 flex items-center justify-center">
              <Syringe className="w-5 h-5 text-foreground/80" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Vaccine <span className="text-gradient-bloom">Tracker</span>
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Simple, non-clinical checklist for your current phase. Always confirm dates and eligibility with a healthcare provider.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium bg-card">
            <span>{phaseEmoji}</span>
            <span>
              Showing schedule for: <strong>{phaseName}</strong>
            </span>
          </div>
        </ScrollReveal>

        <div className="mt-8 space-y-4">
          {rows.map((row, i) => {
            const st = status[row.id] || "pending";
            return (
              <ScrollReveal key={row.id} delay={60 + i * 40}>
                <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-sm">{row.name}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{row.schedule}</p>
                      <p className="text-xs text-muted-foreground mt-2">{row.note}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          st === "completed" ? "bg-green-100 text-green-800" : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {st === "completed" ? "Completed" : "Pending"}
                      </span>
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toggle(row.id)}>
                        Mark {st === "completed" ? "pending" : "done"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" type="button" title="Reminder UI only — set a phone reminder separately">
                        <Bell className="w-3.5 h-3.5" /> Set reminder
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={200}>
          <p className="mt-8 text-xs text-muted-foreground text-center max-w-lg mx-auto leading-relaxed">
            This is general information only. Vaccine names and schedules vary by region and individual health — consult your doctor or PHC.
          </p>
        </ScrollReveal>

        <SafetyDisclaimer />
      </div>
    </main>
  );
}
