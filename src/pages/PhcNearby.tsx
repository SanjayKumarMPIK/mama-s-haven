import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Building2,
  Send,
  CalendarClock,
  CheckCircle2,
  Circle,
  Bell,
  Loader2,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { usePhase } from "@/hooks/usePhase";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_PHC_NAME,
  evaluateRisk,
  cycleStatusLabel,
  randomAppointmentSlot,
  formatAppointmentDate,
  type RiskLevel,
} from "@/lib/phcSimulation";
import { cn } from "@/lib/utils";

const MOCK_PHCS = [
  { name: "Urban Primary Health Centre — Sector 12", area: "Near bus stand", mapUrl: "https://www.openstreetmap.org/search?query=primary%20health%20centre%20india" },
  { name: "Sub-Centre — Village Cluster A", area: "Block PHC catchment", mapUrl: "https://www.openstreetmap.org/" },
  { name: "District Hospital Outpatient Wing", area: "Town centre (referral)", mapUrl: "https://www.openstreetmap.org/" },
];

const SYMPTOM_OPTIONS = [
  { id: "fatigue", label: "Fatigue" },
  { id: "period_pain", label: "Period pain / cramps" },
  { id: "nausea", label: "Nausea" },
  { id: "dizziness", label: "Dizziness" },
  { id: "severe", label: "Severe bleeding or intense pain" },
];

function riskBadgeClasses(level: RiskLevel): string {
  if (level === "stable") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (level === "attention") return "bg-amber-50 text-amber-900 border-amber-200";
  return "bg-red-50 text-red-800 border-red-200";
}

function riskLabel(level: RiskLevel): string {
  if (level === "stable") return "Stable";
  if (level === "attention") return "Needs attention";
  return "Priority";
}

export default function PhcNearby() {
  const { phase, phaseName } = usePhase();
  const [cycleLengthStr, setCycleLengthStr] = useState("");
  const [hbStr, setHbStr] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const cycleLength = cycleLengthStr === "" ? null : Number(cycleLengthStr);
  const hb = hbStr === "" ? null : Number(hbStr);

  const symptoms = useMemo(
    () =>
      SYMPTOM_OPTIONS.filter((o) => checked[o.id]).map((o) =>
        o.id === "severe" ? "severe bleeding or intense pain" : o.label.toLowerCase(),
      ),
    [checked],
  );

  const evaluation = useMemo(
    () =>
      evaluateRisk({
        phase,
        cycleLength: cycleLength !== null && !Number.isNaN(cycleLength) ? cycleLength : null,
        hb: hb !== null && !Number.isNaN(hb) ? hb : null,
        symptoms,
      }),
    [phase, cycleLength, hb, symptoms],
  );

  const [sendLoading, setSendLoading] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [responseReceived, setResponseReceived] = useState(false);
  const [responseAt, setResponseAt] = useState<string | null>(null);
  const [phcResponseSnapshot, setPhcResponseSnapshot] = useState<string | null>(null);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [appointmentLine, setAppointmentLine] = useState<string | null>(null);

  const sendHealthReport = useCallback(() => {
    if (sendLoading) return;
    const snapshot = evaluateRisk({
      phase,
      cycleLength: cycleLength !== null && !Number.isNaN(cycleLength) ? cycleLength : null,
      hb: hb !== null && !Number.isNaN(hb) ? hb : null,
      symptoms,
    });
    setSendLoading(true);
    setResponseReceived(false);
    setResponseAt(null);
    setPhcResponseSnapshot(null);
    setReportSent(false);
    setSentAt(null);

    window.setTimeout(() => {
      setSendLoading(false);
      setReportSent(true);
      setSentAt(new Date().toLocaleString("en-IN"));
      window.setTimeout(() => {
        setResponseReceived(true);
        setResponseAt(new Date().toLocaleString("en-IN"));
        setPhcResponseSnapshot(snapshot.phcResponse);
      }, 2500);
    }, 1500);
  }, [sendLoading, phase, cycleLength, hb, symptoms]);

  const bookAppointment = () => {
    const { date, timeLabel } = randomAppointmentSlot();
    setAppointmentBooked(true);
    setAppointmentLine(
      `Appointment confirmed at ${DEFAULT_PHC_NAME} — Date: ${formatAppointmentDate(date)} | Time: ${timeLabel}`,
    );
  };

  const toggleSymptom = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl">
        <ScrollReveal>
          <Link to="/" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint/80">
              <Building2 className="h-5 w-5 text-foreground/80" />
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">
              PHC
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Prototype simulation. Enter your inputs for rule-based guidance and a demo PHC workflow.
          </p>
        </ScrollReveal>

        {/* Inputs */}
        <ScrollReveal delay={40}>
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Health inputs</h2>
            <p className="mt-1 text-xs text-muted-foreground">Used only in this browser session for this demo.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Cycle length (days)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={cycleLengthStr}
                  onChange={(e) => setCycleLengthStr(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 28"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Hemoglobin (g/dL)</label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  step={0.1}
                  value={hbStr}
                  onChange={(e) => setHbStr(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 11.5"
                />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground">Symptoms (optional)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((o) => (
                  <label key={o.id} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={!!checked[o.id]}
                      onChange={() => toggleSymptom(o.id)}
                      className="rounded border-input"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Phase: <span className="font-medium text-foreground">{phaseName}</span>
            </p>
          </div>
        </ScrollReveal>

        {/* Recommendation banner */}
        <ScrollReveal delay={60}>
          <div
            className={cn(
              "mt-6 rounded-xl border border-l-4 p-4",
              evaluation.level === "stable" && "border-l-emerald-600 bg-emerald-50/80",
              evaluation.level === "attention" && "border-l-amber-500 bg-amber-50/80",
              evaluation.level === "priority" && "border-l-red-600 bg-red-50/80",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", riskBadgeClasses(evaluation.level))}>
                {riskLabel(evaluation.level)}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{evaluation.banner}</p>
          </div>
        </ScrollReveal>

        {/* Health report card */}
        <ScrollReveal delay={80}>
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Health report summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">Phase</dt>
                <dd className="font-medium">{phaseName}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">Cycle status</dt>
                <dd className="text-right font-medium">{cycleStatusLabel(cycleLength)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">Hb</dt>
                <dd className="font-medium">{hb !== null && !Number.isNaN(hb) ? `${hb} g/dL` : "Not provided"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="text-muted-foreground">Symptoms</dt>
                <dd className="text-right font-medium">{symptoms.length ? symptoms.join(", ") : "None selected"}</dd>
              </div>
              <div className="flex justify-between gap-4 pt-1">
                <dt className="text-muted-foreground">Risk level</dt>
                <dd className="font-medium">{riskLabel(evaluation.level)}</dd>
              </div>
            </dl>
            <Button type="button" variant="outline" className="mt-4 w-full sm:w-auto" onClick={sendHealthReport} disabled={sendLoading}>
              {sendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Share with PHC
            </Button>
          </div>
        </ScrollReveal>

        {/* Send + workflow */}
        <ScrollReveal delay={100}>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={sendHealthReport} disabled={sendLoading} className="gap-2">
              {sendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send health report to PHC
            </Button>
            <Button type="button" variant="secondary" onClick={bookAppointment} disabled={appointmentBooked} className="gap-2">
              <CalendarClock className="h-4 w-4" />
              Book appointment
            </Button>
          </div>
          {sendLoading && <p className="mt-2 text-xs text-muted-foreground">Sending report…</p>}
          {reportSent && sentAt && (
            <p className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              Your health report has been shared with {DEFAULT_PHC_NAME}. <span className="text-muted-foreground">({sentAt})</span>
            </p>
          )}
          {responseReceived && phcResponseSnapshot && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-semibold text-primary">PHC response received</p>
              <p className="mt-1 text-sm text-foreground">{phcResponseSnapshot}</p>
              {responseAt && <p className="mt-2 text-xs text-muted-foreground">Received: {responseAt}</p>}
            </div>
          )}
          {appointmentBooked && appointmentLine && (
            <p className="mt-3 rounded-lg border border-border bg-card p-3 text-sm font-medium">{appointmentLine}</p>
          )}
        </ScrollReveal>

        {/* PHC status panel */}
        <ScrollReveal delay={120}>
          <div className="mt-8 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">PHC workflow status</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                {reportSent ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                Report sent
              </li>
              <li className="flex items-center gap-2">
                {responseReceived ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                Response received
              </li>
              <li className="flex items-center gap-2">
                {appointmentBooked ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                Appointment booked
              </li>
            </ul>
          </div>
        </ScrollReveal>

        {/* Reminders */}
        <ScrollReveal delay={140}>
          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Reminders
            </div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {evaluation.reminders.map((r) => (
                <li key={r}>• {r}</li>
              ))}
              {evaluation.reminders.length === 0 && <li className="text-xs">No reminders for current inputs.</li>}
            </ul>
          </div>
        </ScrollReveal>

        {/* Facility list */}
        <div className="mt-10 space-y-4">
          {MOCK_PHCS.map((p, i) => (
            <ScrollReveal key={p.name} delay={i * 40}>
              <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">{p.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.area}</p>
                  </div>
                </div>
                <a
                  href={p.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-muted"
                >
                  Open map <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          This PHC interaction is a prototype simulation for demonstration purposes.
        </p>

        <SafetyDisclaimer />
      </div>
    </main>
  );
}
