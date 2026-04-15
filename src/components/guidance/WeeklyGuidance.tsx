import { useWeeklyGuidance } from "@/hooks/useWeeklyGuidance";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Apple,
  HeartPulse,
  Activity,
  AlertCircle,
} from "lucide-react";

/* ── Accent-colour per age-group ──────────────────────────────────────────── */
const AGE_GROUP_ACCENT: Record<string, string> = {
  "Early Puberty": "from-pink-400/20 to-purple-400/20 border-pink-300/40",
  "Peak Puberty": "from-fuchsia-400/20 to-rose-400/20 border-fuchsia-300/40",
  "Identity Phase": "from-violet-400/20 to-indigo-400/20 border-violet-300/40",
  "Maturity Phase": "from-blue-400/20 to-cyan-400/20 border-blue-300/40",
  Adult: "from-teal-400/20 to-emerald-400/20 border-teal-300/40",
};

const AGE_GROUP_BADGE: Record<string, string> = {
  "Early Puberty": "bg-pink-100 text-pink-700 border-pink-200",
  "Peak Puberty": "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  "Identity Phase": "bg-violet-100 text-violet-700 border-violet-200",
  "Maturity Phase": "bg-blue-100 text-blue-700 border-blue-200",
  Adult: "bg-teal-100 text-teal-700 border-teal-200",
};

export default function WeeklyGuidance({ className }: { className?: string }) {
  const { data, hasDob, hasLogs } = useWeeklyGuidance();

  /* ── Not logged in / no DOB ───────────────────────────────────────────── */
  if (!hasDob) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5",
          className
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">
            Log in with your date of birth to unlock weekly guidance personalised
            to your age and symptoms.
          </p>
        </div>
      </section>
    );
  }

  /* ── Engine returned null (shouldn't happen if hasDob) ────────────── */
  if (!data) return null;

  const accentGradient =
    AGE_GROUP_ACCENT[data.ageGroup] ?? AGE_GROUP_ACCENT["Adult"];
  const badgeStyle =
    AGE_GROUP_BADGE[data.ageGroup] ?? AGE_GROUP_BADGE["Adult"];

  return (
    <section className={cn("space-y-4", className)}>
      {/* ── Header card ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-5 shadow-sm bg-gradient-to-br",
          accentGradient
        )}
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold">This week for you</h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Period phase · last 7 days
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
              badgeStyle
            )}
          >
            {data.ageGroup}
          </span>

          {data.topSymptoms.length > 0 ? (
            data.topSymptoms.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              No period-phase symptoms logged this week yet.
            </span>
          )}
        </div>
      </div>

      {/* ── 3-column guidance cards ─────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Experience card */}
        <article className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold">What you're experiencing</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.experience}
          </p>
        </article>

        {/* Nutrition card */}
        <article className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100">
              <Apple className="w-3.5 h-3.5 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold">Nutrition support</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {data.nutrition.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-500 shrink-0 mt-1">•</span>
                <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* Emotional care card */}
        <article className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <h3 className="text-sm font-semibold">Emotional care</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {data.emotionalCare.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-rose-400 shrink-0 mt-1">•</span>
                <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
