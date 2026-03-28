import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getWeeklyGuidance, syncProfileDob, type WeeklyGuidanceResponse } from "@/api/symptomsApi";
import { cn } from "@/lib/utils";

function normalizeDob(raw: string | undefined): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export default function WeeklyGuidance({ className }: { className?: string }) {
  const { user, fullProfile } = useAuth();
  const userKey = user?.id;
  const clientDob = normalizeDob(fullProfile?.basic?.dob);

  useEffect(() => {
    if (!userKey || !clientDob) return;
    syncProfileDob(clientDob, userKey).catch(() => {
      /* offline / backend down — guidance still works with ?dob */
    });
  }, [userKey, clientDob]);

  const q = useQuery<WeeklyGuidanceResponse>({
    queryKey: ["weeklyGuidance", userKey, clientDob],
    queryFn: () => getWeeklyGuidance(userKey, clientDob),
    staleTime: 5 * 60 * 1000,
    enabled: !!userKey,
  });

  if (!userKey) {
    return (
      <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
        <p className="text-sm text-muted-foreground">Log in to load personalized weekly guidance from your profile and calendar.</p>
      </section>
    );
  }

  if (q.isLoading) {
    return (
      <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
        <p className="text-sm text-muted-foreground">Preparing your week&apos;s guidance…</p>
      </section>
    );
  }

  if (q.isError) {
    return (
      <section className={cn("rounded-xl border border-red-200 bg-red-50 p-5", className)}>
        <p className="text-sm text-red-800">Could not load weekly guidance. Is the API running?</p>
      </section>
    );
  }

  const data = q.data!;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">This week for you</h2>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Period phase · last 7 days</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium">
            Age group: {data.ageGroup}
          </span>
          {data.topSymptoms.length > 0 ? (
            data.topSymptoms.map((s) => (
              <span key={s} className="inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground">
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No period-phase symptoms logged this week yet.</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">What you&apos;re experiencing</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.experience}</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Nutrition support</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {data.nutrition.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary shrink-0">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Emotional care</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {data.emotionalCare.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary shrink-0">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
