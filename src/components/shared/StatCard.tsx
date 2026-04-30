/**
 * StatCard.tsx
 *
 * Reusable stat card component for displaying summary statistics.
 * Used across multiple dashboards including Symptoms and Premature.
 */

import { ReactNode } from "react";

// Phase accent colors for consistent theming
export const phaseAccent: Record<string, {
  border: string; bg: string; text: string; gradient: string;
  cardBg: string; badge: string; ring: string;
}> = {
  puberty: {
    border: "border-pink-200/60", bg: "bg-pink-50", text: "text-pink-700",
    gradient: "from-pink-500 to-rose-400", cardBg: "bg-gradient-to-br from-pink-50 to-rose-50",
    badge: "bg-pink-100 text-pink-700", ring: "ring-pink-300",
  },
  maternity: {
    border: "border-purple-200/60", bg: "bg-purple-50", text: "text-purple-700",
    gradient: "from-purple-500 to-violet-400", cardBg: "bg-gradient-to-br from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-700", ring: "ring-purple-300",
  },
  "family-planning": {
    border: "border-teal-200/60", bg: "bg-teal-50", text: "text-teal-700",
    gradient: "from-teal-500 to-emerald-400", cardBg: "bg-gradient-to-br from-teal-50 to-emerald-50",
    badge: "bg-teal-100 text-teal-700", ring: "ring-teal-300",
  },
  menopause: {
    border: "border-amber-200/60", bg: "bg-amber-50", text: "text-amber-700",
    gradient: "from-amber-500 to-orange-400", cardBg: "bg-gradient-to-br from-amber-50 to-orange-50",
    badge: "bg-amber-100 text-amber-700", ring: "ring-amber-300",
  },
  premature: {
    border: "border-violet-200/60", bg: "bg-violet-50", text: "text-violet-700",
    gradient: "from-violet-500 to-purple-400", cardBg: "bg-gradient-to-br from-violet-50 to-purple-50",
    badge: "bg-violet-100 text-violet-700", ring: "ring-violet-300",
  },
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  accent: typeof phaseAccent[string];
}

export default function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-xl ${accent.bg} flex items-center justify-center shadow-sm`}>
          <span className={accent.text}>{icon}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-extrabold leading-none tracking-tight">{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground mt-1.5">{sub}</p>
    </div>
  );
}
