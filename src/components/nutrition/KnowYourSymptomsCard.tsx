import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, ChevronRight, ArrowRight } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { getPopularSymptoms, type SymptomGuideEntry } from "@/lib/symptomGuideRegistry";

// ─── Phase accent map ────────────────────────────────────────────────────

const phaseAccent: Record<string, {
  gradient: string; bg: string; border: string; text: string;
  chipBg: string; chipBorder: string;
}> = {
  puberty: {
    gradient: "from-pink-500 to-rose-400", bg: "bg-pink-50", border: "border-pink-200/60",
    text: "text-pink-700", chipBg: "bg-pink-100/80", chipBorder: "border-pink-200/60",
  },
  maternity: {
    gradient: "from-purple-500 to-violet-400", bg: "bg-purple-50", border: "border-purple-200/60",
    text: "text-purple-700", chipBg: "bg-purple-100/80", chipBorder: "border-purple-200/60",
  },
  "family-planning": {
    gradient: "from-teal-500 to-emerald-400", bg: "bg-teal-50", border: "border-teal-200/60",
    text: "text-teal-700", chipBg: "bg-teal-100/80", chipBorder: "border-teal-200/60",
  },
  menopause: {
    gradient: "from-amber-500 to-orange-400", bg: "bg-amber-50", border: "border-amber-200/60",
    text: "text-amber-700", chipBg: "bg-amber-100/80", chipBorder: "border-amber-200/60",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────

function getRecentLoggedSymptoms(logs: Record<string, any>, phase: string, limit: number = 5): string[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const todayISO = new Date().toISOString().slice(0, 10);

  const counts = new Map<string, number>();
  for (const [date, entry] of Object.entries(logs)) {
    if (date < cutoffISO || date > todayISO) continue;
    if ((entry as any).phase !== phase) continue;
    const symptoms = (entry as any).symptoms;
    if (!symptoms) continue;
    for (const [key, val] of Object.entries(symptoms)) {
      if (val === true) counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

// ─── Component ──────────────────────────────────────────────────────────

interface KnowYourSymptomsCardProps {
  onExplore?: () => void;
  onSymptomClick?: (id: string) => void;
}

export default function KnowYourSymptomsCard({ onExplore, onSymptomClick }: KnowYourSymptomsCardProps = {}) {
  const { logs } = useHealthLog();
  const { phase } = usePhase();
  const accent = phaseAccent[phase] ?? phaseAccent.puberty;

  // Get symptom chips: prefer logged symptoms, fallback to popular
  const displayChips = useMemo((): SymptomGuideEntry[] => {
    const recentIds = getRecentLoggedSymptoms(logs, phase, 5);
    const popular = getPopularSymptoms(phase);

    if (recentIds.length >= 2) {
      // Use recent logged symptoms, matched to guide entries
      const matched = recentIds
        .map((id) => popular.find((p) => p.id === id) ?? getPopularSymptoms(phase).find((p) => p.id === id))
        .filter(Boolean) as SymptomGuideEntry[];

      // Fill remaining with popular if needed
      if (matched.length < 3) {
        const matchedIds = new Set(matched.map((m) => m.id));
        for (const p of popular) {
          if (!matchedIds.has(p.id)) { matched.push(p); matchedIds.add(p.id); }
          if (matched.length >= 5) break;
        }
      }
      return matched.slice(0, 5);
    }

    return popular.slice(0, 5);
  }, [logs, phase]);

  return (
    <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-4 space-y-3`} id="know-your-symptoms-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-sm`}>
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Know your symptoms</h3>
            <p className="text-[11px] text-muted-foreground">Search, learn, and take action</p>
          </div>
        </div>
        {onExplore ? (
          <button
            onClick={onExplore}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r ${accent.gradient} text-white text-[11px] font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]`}
          >
            Explore
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <Link
            to="/symptom-checker"
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r ${accent.gradient} text-white text-[11px] font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]`}
          >
            Explore
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Symptom Chips */}
      <div className="flex flex-wrap gap-2">
        {displayChips.map((entry) => (
          onSymptomClick ? (
            <button
              key={entry.id}
              onClick={() => onSymptomClick(entry.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${accent.chipBorder} ${accent.chipBg} text-xs font-medium hover:shadow-sm transition-all active:scale-95 group`}
            >
              <span>{entry.emoji}</span>
              <span>{entry.name}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
            </button>
          ) : (
            <Link
              key={entry.id}
              to={`/symptom-checker?query=${entry.id}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${accent.chipBorder} ${accent.chipBg} text-xs font-medium hover:shadow-sm transition-all active:scale-95 group`}
            >
              <span>{entry.emoji}</span>
              <span>{entry.name}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
