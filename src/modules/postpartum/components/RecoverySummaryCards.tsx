// ─── Recovery Summary Cards ───────────────────────────────────────────────────
// Displays 4 recovery metric cards for Postpartum Dashboard
// STRICTLY isolated to Postpartum Dashboard only

import { useMemo } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { getPostpartumMetrics, type PostpartumMetrics } from "../adapters/postpartumMetricsAdapter";
import { Activity, Moon, Smile, AlertTriangle } from "lucide-react";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
};

interface RecoveryCardProps {
  label: string;
  value: string | number | null;
  trend: string;
  icon: React.ElementType;
}

function RecoveryCard({ label, value, trend, icon: Icon }: RecoveryCardProps) {
  const displayValue = value === null ? "—" : typeof value === "number" ? value : value;
  
  const trendColor = trend.startsWith("+") || trend === "Improved" 
    ? "text-emerald-600" 
    : trend.startsWith("-") || trend === "Declined" || trend === "Higher"
    ? "text-rose-600"
    : "text-muted-foreground";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-rose-600" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-foreground">{displayValue}</span>
        <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
      </div>
    </div>
  );
}

export default function RecoverySummaryCards() {
  const { getPhaseLogs } = useHealthLog();
  const { profile } = usePregnancyProfile();
  const logs = getPhaseLogs("maternity");

  const metrics = useMemo(() => {
    const deliveryDateISO = profile.delivery?.birthDate || new Date().toISOString().split("T")[0];
    return getPostpartumMetrics(logs, deliveryDateISO);
  }, [logs, profile.delivery?.birthDate]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <RecoveryCard
        label="Symptoms Logged"
        value={metrics.symptomsLogged}
        trend={metrics.trends.symptoms}
        icon={Activity}
      />
      <RecoveryCard
        label="Avg Sleep"
        value={metrics.avgSleep !== null ? `${metrics.avgSleep}h` : null}
        trend={metrics.trends.sleep}
        icon={Moon}
      />
      <RecoveryCard
        label="Mood"
        value={metrics.moodLabel}
        trend={metrics.trends.mood}
        icon={Smile}
      />
      <RecoveryCard
        label="Pain Level"
        value={metrics.painLevel !== null ? `${metrics.painLevel}/10` : null}
        trend={metrics.trends.pain}
        icon={AlertTriangle}
      />
    </div>
  );
}
