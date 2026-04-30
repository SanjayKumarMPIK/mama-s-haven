/**
 * HealthSummaryCards.tsx
 *
 * Reusable health summary cards component for displaying 4 analytics stats.
 * Used in Premature Dashboard and potentially other dashboards.
 */

import { Calendar, Activity, Moon, Smile } from "lucide-react";
import StatCard, { phaseAccent } from "@/components/shared/StatCard";

interface HealthSummaryCardsProps {
  loggedDays: number;
  symptomsTracked: number;
  avgSleep: number | null;
  avgMood: number | null;
  accent?: typeof phaseAccent[string];
}

// Mood label helper
function moodLabel(val: number | null): string {
  if (val === null) return "–";
  if (val >= 2.5) return "Good 😊";
  if (val >= 1.5) return "Okay 😐";
  return "Low 😔";
}

export default function HealthSummaryCards({
  loggedDays,
  symptomsTracked,
  avgSleep,
  avgMood,
  accent = phaseAccent.premature,
}: HealthSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="Days Logged"
        value={String(loggedDays)}
        sub="this week"
        icon={<Calendar className="w-4 h-4" />}
        accent={accent}
      />
      <StatCard
        label="Symptoms Tracked"
        value={String(symptomsTracked)}
        sub="this week"
        icon={<Activity className="w-4 h-4" />}
        accent={accent}
      />
      <StatCard
        label="Avg Sleep"
        value={avgSleep !== null ? `${avgSleep}h` : "–"}
        sub="this week"
        icon={<Moon className="w-4 h-4" />}
        accent={accent}
      />
      <StatCard
        label="Avg Mood"
        value={moodLabel(avgMood)}
        sub="this week"
        icon={<Smile className="w-4 h-4" />}
        accent={accent}
      />
    </div>
  );
}
