/**
 * CycleRegularityAnalyzer.tsx
 *
 * TTC Tool: Tracks cycle consistency to improve prediction accuracy.
 * Allows user to log recent cycle lengths and shows regularity analysis.
 */

import { useState, useMemo, useCallback } from "react";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";

const LS_KEY = "ss-fp-cycle-history";

function readHistory(): number[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function writeHistory(data: number[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

export default function CycleRegularityAnalyzer() {
  const { profile } = useFamilyPlanningProfile();
  const [history, setHistory] = useState<number[]>(() => readHistory());
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const addCycle = useCallback(() => {
    const val = parseInt(input, 10);
    if (isNaN(val) || val < 15 || val > 60) return;
    const updated = [...history, val].slice(-12); // Keep last 12 cycles
    writeHistory(updated);
    setHistory(updated);
    setInput("");
    setShowInput(false);
  }, [input, history]);

  const removeLast = useCallback(() => {
    const updated = history.slice(0, -1);
    writeHistory(updated);
    setHistory(updated);
  }, [history]);

  const analysis = useMemo(() => {
    if (history.length < 2) {
      return {
        status: "insufficient" as const,
        message: "Log at least 2 past cycle lengths to analyze regularity.",
        avg: 0,
        variance: 0,
        regularity: "unknown" as const,
        confidence: 0,
      };
    }

    const avg = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
    const variance = Math.round(
      Math.sqrt(history.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / history.length) * 10
    ) / 10;

    let regularity: "regular" | "slightly-irregular" | "irregular";
    let confidence: number;

    if (variance <= 2) {
      regularity = "regular";
      confidence = Math.min(95, 70 + history.length * 5);
    } else if (variance <= 5) {
      regularity = "slightly-irregular";
      confidence = Math.min(80, 50 + history.length * 5);
    } else {
      regularity = "irregular";
      confidence = Math.min(60, 30 + history.length * 5);
    }

    return {
      status: "ready" as const,
      message: "",
      avg,
      variance,
      regularity,
      confidence,
    };
  }, [history]);

  const regularityConfig = {
    regular: {
      emoji: "✅",
      label: "Regular",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      desc: "Your cycles appear consistent. Predictions should be more accurate.",
    },
    "slightly-irregular": {
      emoji: "🔄",
      label: "Slightly Variable",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      desc: "Some variation detected. Predictions are moderately reliable.",
    },
    irregular: {
      emoji: "⚠️",
      label: "Irregular",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      desc: "Significant variation. Consider additional tracking methods for better accuracy.",
    },
    unknown: {
      emoji: "❓",
      label: "Unknown",
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200",
      desc: "Not enough data to determine regularity.",
    },
  };

  const conf = regularityConfig[analysis.regularity];

  return (
    <div className="space-y-4">
      {/* Analysis Result */}
      {analysis.status === "ready" ? (
        <>
          <div className={`rounded-xl p-4 border ${conf.bg} ${conf.border}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{conf.emoji}</span>
              <div>
                <p className={`text-sm font-bold ${conf.color}`}>{conf.label} Cycles</p>
                <p className="text-xs text-slate-500 mt-0.5">{conf.desc}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 bg-violet-50 border border-violet-200 text-center">
              <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">Average</p>
              <p className="text-lg font-bold text-violet-900 mt-1">{analysis.avg}</p>
              <p className="text-[10px] text-violet-500">days</p>
            </div>
            <div className="rounded-xl p-3 bg-sky-50 border border-sky-200 text-center">
              <p className="text-[10px] font-semibold text-sky-600 uppercase tracking-wider">Variance</p>
              <p className="text-lg font-bold text-sky-900 mt-1">±{analysis.variance}</p>
              <p className="text-[10px] text-sky-500">days</p>
            </div>
            <div className="rounded-xl p-3 bg-teal-50 border border-teal-200 text-center">
              <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">Confidence</p>
              <p className="text-lg font-bold text-teal-900 mt-1">{analysis.confidence}%</p>
              <div className="mt-1.5 h-1 rounded-full bg-teal-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${analysis.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cycle History Bubbles */}
          {history.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Logged Cycles ({history.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {history.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600"
                  >
                    {c}d
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl p-4 border border-slate-200 bg-slate-50 text-center">
          <p className="text-sm text-slate-600">📊 {analysis.message}</p>
        </div>
      )}

      {/* Add Cycle Input */}
      {showInput ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={15}
            max={60}
            placeholder="e.g. 28"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
          />
          <button
            onClick={addCycle}
            className="px-4 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold hover:bg-violet-600 transition-colors active:scale-[0.97]"
          >
            Add
          </button>
          <button
            onClick={() => { setShowInput(false); setInput(""); }}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowInput(true)}
            className="flex-1 py-2.5 rounded-xl border border-dashed border-violet-300 text-violet-600 text-sm font-medium hover:bg-violet-50 transition-colors"
          >
            + Log a Cycle Length
          </button>
          {history.length > 0 && (
            <button
              onClick={removeLast}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-400 text-xs hover:bg-slate-50 transition-colors"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
