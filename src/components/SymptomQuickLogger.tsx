import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePhase } from "@/hooks/usePhase";
import { useAuth } from "@/hooks/useAuth";
import { KEY_SYMPTOMS_BY_PHASE, type KeySymptomId } from "@/lib/symptomAnalysis";
import { getSymptomLogsByDate, postSymptomLogsForDate, type CalendarSymptomLogResponse } from "@/api/symptomsApi";

export default function SymptomQuickLogger() {
  const { phase } = usePhase();
  const { user } = useAuth();
  const userKey = user?.id;
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<KeySymptomId | null>(null);
  const symptoms = KEY_SYMPTOMS_BY_PHASE[phase];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick symptom log</p>
      <div className="grid grid-cols-2 gap-2">
        {symptoms.slice(0, 4).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={`rounded-lg border px-2.5 py-2 text-xs text-left transition-colors ${
              selected === s.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!selected}
        onClick={async () => {
          if (!selected) return;
          const dateISO = new Date().toISOString().slice(0, 10);
          const existing = await getSymptomLogsByDate(dateISO, userKey);
          const current = existing.symptoms ?? [];

          const idx = current.findIndex((x) => x.name === selected);
          const nextItem = { name: selected, severity: 3, time: "evening" as const, notes: "" };
          if (idx >= 0) current[idx] = nextItem;
          else current.push(nextItem);

          await postSymptomLogsForDate(dateISO, current, userKey, { menstrualPhase: "period" });
          queryClient.invalidateQueries({ queryKey: ["symptomAnalytics", selected, userKey ?? "default"] });
          queryClient.invalidateQueries({ queryKey: ["weeklyGuidance"] });

          // Instant calendar sync: update cached ranges that include `dateISO`.
          const dateYear = dateISO.slice(0, 4);
          const dateMonth0 = Number(dateISO.slice(5, 7)) - 1;
          const targetDate = dateISO;

          const cachedRanges = queryClient.getQueriesData<CalendarSymptomLogResponse[]>({ queryKey: ["symptomLogsRange"] });
          for (const [qKey] of cachedRanges) {
            const rangeKey = qKey?.[1] as string | undefined;
            const cacheUser = (qKey?.[2] as string | undefined) ?? "default";
            if (cacheUser !== (userKey ?? "default")) continue;
            if (!rangeKey) continue;

            const inRange =
              rangeKey.startsWith("year-")
                ? rangeKey === `year-${dateYear}`
                : rangeKey.startsWith("month-")
                  ? (() => {
                      const parts = rangeKey.split("-");
                      const y = parts[1];
                      const m0 = Number(parts[2]);
                      return y === dateYear && m0 === dateMonth0;
                    })()
                  : false;

            if (!inRange) continue;

            queryClient.setQueryData(qKey, (prev?: CalendarSymptomLogResponse[]) => {
              const list = prev ?? [];
              const idx = list.findIndex((x) => x.date === targetDate);
              const entry: CalendarSymptomLogResponse = { date: targetDate, symptoms: current };

              if (current.length === 0) {
                if (idx >= 0) return [...list.slice(0, idx), ...list.slice(idx + 1)];
                return list;
              }

              if (idx >= 0) {
                const next = [...list];
                next[idx] = entry;
                return next;
              }
              return [...list, entry];
            });
          }

          queryClient.invalidateQueries({ queryKey: ["symptomLogsRange"] });
        }}
        className="mt-3 w-full rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold disabled:opacity-40"
      >
        Save to today
      </button>
    </div>
  );
}

