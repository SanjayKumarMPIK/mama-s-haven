import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { generateAffirmation } from "@/lib/symptomAffirmationEngine";

// ─── Phase gradients ────────────────────────────────────────────────────

const PHASE_GRADIENTS: Record<string, string> = {
  puberty: "from-pink-400/15 via-rose-300/10 to-pink-200/5 border-pink-200/40",
  maternity: "from-purple-400/15 via-violet-300/10 to-purple-200/5 border-purple-200/40",
  "family-planning": "from-teal-400/15 via-emerald-300/10 to-teal-200/5 border-teal-200/40",
  menopause: "from-amber-400/15 via-orange-300/10 to-amber-200/5 border-amber-200/40",
};

const PHASE_ICON_BG: Record<string, string> = {
  puberty: "from-pink-500 to-rose-400",
  maternity: "from-purple-500 to-violet-400",
  "family-planning": "from-teal-500 to-emerald-400",
  menopause: "from-amber-500 to-orange-400",
};

// ─── Component ──────────────────────────────────────────────────────────

export default function AffirmationBanner() {
  const { logs } = useHealthLog();
  const { phase } = usePhase();

  const affirmation = useMemo(
    () => generateAffirmation(logs, phase),
    [logs, phase],
  );

  const gradient = PHASE_GRADIENTS[phase] ?? PHASE_GRADIENTS.puberty;
  const iconBg = PHASE_ICON_BG[phase] ?? PHASE_ICON_BG.puberty;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r ${gradient} p-4 transition-all`}
      id="affirmation-banner"
    >
      {/* Subtle shimmer decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-pulse pointer-events-none" />

      <div className="relative flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-md shrink-0`}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm font-medium leading-relaxed text-foreground/90">
          {affirmation.message}
        </p>
      </div>
    </div>
  );
}
