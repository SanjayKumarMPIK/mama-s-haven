import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Syringe, Bell, CalendarDays, Circle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { usePhase, type Phase } from "@/hooks/usePhase";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { Button } from "@/components/ui/button";

const STATUS_KEY_PREFIX = "ss-vaccine-records-";
const REMINDER_KEY_PREFIX = "ss-vaccine-reminders-";

type VaxStatus = "pending" | "completed";

type VaccineRecord = {
  id: string;
  name: string;
  dueDate: string; // YYYY-MM-DD
  status: VaxStatus;
  schedule: string;
  note: string;
};

type VaccineDef = Omit<VaccineRecord, "dueDate" | "status"> & { defaultOffsetDays: number };

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function toISODateLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDaysISO(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toISODateLocal(d);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function diffDaysFromToday(isoDate: string) {
  const due = new Date(isoDate + "T00:00:00");
  return Math.round((startOfDay(due).getTime() - startOfDay(new Date()).getTime()) / 86400000);
}

function formatDue(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

const BY_PHASE: Record<Phase, VaccineDef[]> = {
  puberty: [
    {
      id: "hpv",
      name: "HPV Vaccine",
      schedule: "Ask your healthcare provider for age-appropriate dosing",
      note: "Eligibility depends on age and region. Follow local guidance.",
      defaultOffsetDays: 60,
    },
    {
      id: "tt",
      name: "TT Vaccine",
      schedule: "Booster schedule as advised (often per national guidance)",
      note: "Discuss timing with your PHC or clinician.",
      defaultOffsetDays: 90,
    },
  ],
  maternity: [
    {
      id: "tt-mat",
      name: "TT/Tdap Vaccine",
      schedule: "As per ANC visits — protect mother and newborn",
      note: "Follow your obstetrician’s plan.",
      defaultOffsetDays: 25,
    },
    {
      id: "flu",
      name: "Influenza (inactivated) Vaccine",
      schedule: "Once per flu season if advised",
      note: "Discuss timing during pregnancy with your doctor.",
      defaultOffsetDays: 140,
    },
  ],
  "family-planning": [
    {
      id: "rubella",
      name: "Rubella/MMR Vaccine",
      schedule: "Before conception when advised",
      note: "Plan ahead; live vaccines may not be given during pregnancy.",
      defaultOffsetDays: 45,
    },
    {
      id: "tt-fp",
      name: "TT Vaccine",
      schedule: "Up to date before pregnancy",
      note: "General adult booster as per schedule.",
      defaultOffsetDays: 180,
    },
  ],
};

function loadRecords(phase: Phase): Record<string, VaccineRecord> {
  try {
    const raw = localStorage.getItem(STATUS_KEY_PREFIX + phase);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, VaccineRecord>;
  } catch {
    return {};
  }
}

function saveRecords(phase: Phase, records: Record<string, VaccineRecord>) {
  try {
    localStorage.setItem(STATUS_KEY_PREFIX + phase, JSON.stringify(records));
  } catch {
    // ignore
  }
}

function initRecords(phase: Phase): Record<string, VaccineRecord> {
  const defs = BY_PHASE[phase];
  const base: Record<string, VaccineRecord> = {};
  for (const d of defs) {
    base[d.id] = {
      id: d.id,
      name: d.name,
      dueDate: addDaysISO(d.defaultOffsetDays),
      status: "pending",
      schedule: d.schedule,
      note: d.note,
    };
  }
  return base;
}

function loadReminders(phase: Phase): Record<string, { remindedAtISO: string }> {
  try {
    const raw = localStorage.getItem(REMINDER_KEY_PREFIX + phase);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, { remindedAtISO: string }>;
  } catch {
    return {};
  }
}

function saveReminders(phase: Phase, reminders: Record<string, { remindedAtISO: string }>) {
  try {
    localStorage.setItem(REMINDER_KEY_PREFIX + phase, JSON.stringify(reminders));
  } catch {
    // ignore
  }
}

export default function VaccineTracker() {
  const { phase, phaseName, phaseEmoji } = usePhase();
  const defs = BY_PHASE[phase];

  const [records, setRecords] = useState<Record<string, VaccineRecord>>(() => {
    const existing = loadRecords(phase);
    if (Object.keys(existing).length > 0) return existing;
    return initRecords(phase);
  });

  const [reminders, setReminders] = useState<Record<string, { remindedAtISO: string }>>(() => loadReminders(phase));
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadRecords(phase);
    if (Object.keys(existing).length > 0) {
      setRecords(existing);
    } else {
      setRecords(initRecords(phase));
    }
    setReminders(loadReminders(phase));
    setReminderMessage(null);
  }, [phase]);

  useEffect(() => {
    saveRecords(phase, records);
  }, [phase, records]);

  const vaccineList = useMemo(() => {
    return defs.map((d) => records[d.id]).filter(Boolean);
  }, [defs, records]);

  const upcoming = useMemo(() => {
    return [...vaccineList].filter((v) => v.status !== "completed").sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  }, [vaccineList]);

  const toggleCompleted = (id: string) => {
    setRecords((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      const nextStatus: VaxStatus = cur.status === "completed" ? "pending" : "completed";
      return { ...prev, [id]: { ...cur, status: nextStatus } };
    });
  };

  const setReminderForVaccine = useCallback(
    (id: string) => {
      const rec = records[id];
      if (!rec) return;
      const remindedAtISO = new Date().toISOString();
      const updated = { ...reminders, [id]: { remindedAtISO } };
      setReminders(updated);
      saveReminders(phase, updated);
      setReminderMessage(`Reminder set for ${rec.name} on ${formatDue(rec.dueDate)}`);
    },
    [records, reminders, phase],
  );

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
            Interactive vaccine tracker with reminders. Vaccine schedules vary by region and individual health — consult a healthcare provider.
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

        {reminderMessage && (
          <ScrollReveal delay={60}>
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              {reminderMessage}
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={80}>
          <div className="mt-8 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Reminder calendar (simple)</h2>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming pending vaccines for this phase.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 6).map((v) => {
                  const daysLeft = diffDaysFromToday(v.dueDate);
                  const isNear = daysLeft >= 0 && daysLeft <= 7;
                  const reminderSet = Boolean(reminders[v.id]);
                  return (
                    <div
                      key={v.id}
                      className={`rounded-xl border p-3 flex items-start justify-between gap-4 ${
                        isNear ? "border-primary/30 bg-primary/5" : "border-border/60 bg-background"
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{v.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDue(v.dueDate)}
                          {daysLeft >= 0 ? ` (${daysLeft} days left)` : " (past date)"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {reminderSet ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Bell className="w-3 h-3" />
                            Reminder set
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Circle className="w-3 h-3" />
                            Not set
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            isNear ? "bg-amber-50 text-amber-900 border-amber-200" : "bg-muted/50 text-muted-foreground border-border"
                          }`}
                        >
                          {isNear ? "Due soon" : "Scheduled"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>

        <div className="mt-8 space-y-4">
          {vaccineList.map((row, i) => {
            const st = row.status;
            return (
              <ScrollReveal key={row.id} delay={60 + i * 40}>
                <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-sm">{row.name}</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due date: <span className="font-medium text-foreground/80">{formatDue(row.dueDate)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">{row.schedule}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">{row.note}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          st === "completed" ? "bg-green-100 text-green-800" : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {st === "completed" ? "Completed" : "Pending"}
                      </span>
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => toggleCompleted(row.id)} type="button">
                        Mark as {st === "completed" ? "Pending" : "Completed"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" type="button" onClick={() => setReminderForVaccine(row.id)}>
                        <Bell className="w-3.5 h-3.5" /> Set Reminder
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
            This is general information only. Vaccine schedules vary by region and individual health. Always consult your doctor or PHC.
          </p>
        </ScrollReveal>

        <SafetyDisclaimer />
      </div>
    </main>
  );
}


