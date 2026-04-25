/**
 * OvulationSupport.tsx
 *
 * TTC Tool (Optional): Allows inputs like cervical mucus tracking
 * and basal body temperature for better ovulation predictions.
 */

import { useState, useCallback } from "react";

const LS_KEY = "ss-fp-ovulation-logs";

interface OvulationLog {
  date: string;
  mucus: "dry" | "sticky" | "creamy" | "watery" | "egg-white" | "";
  temperature: string;
  notes: string;
}

function readLogs(): OvulationLog[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function writeLogs(data: OvulationLog[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

const MUCUS_OPTIONS = [
  { val: "dry", emoji: "🏜️", label: "Dry", desc: "No noticeable discharge", fertility: "Low" },
  { val: "sticky", emoji: "🫧", label: "Sticky", desc: "Thick, tacky texture", fertility: "Low" },
  { val: "creamy", emoji: "🥛", label: "Creamy", desc: "White, lotion-like", fertility: "Medium" },
  { val: "watery", emoji: "💧", label: "Watery", desc: "Clear and thin", fertility: "High" },
  { val: "egg-white", emoji: "🥚", label: "Egg White", desc: "Stretchy, clear", fertility: "Peak" },
] as const;

export default function OvulationSupport() {
  const [logs, setLogs] = useState<OvulationLog[]>(() => readLogs());
  const [mucus, setMucus] = useState<OvulationLog["mucus"]>("");
  const [temp, setTemp] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = logs.find((l) => l.date === todayStr);

  const saveLog = useCallback(() => {
    const log: OvulationLog = {
      date: todayStr,
      mucus,
      temperature: temp,
      notes,
    };
    const updated = logs.filter((l) => l.date !== todayStr);
    updated.push(log);
    updated.sort((a, b) => b.date.localeCompare(a.date));
    const trimmed = updated.slice(0, 30); // Keep last 30 entries
    writeLogs(trimmed);
    setLogs(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [mucus, temp, notes, todayStr, logs]);

  const selectedMucusInfo = MUCUS_OPTIONS.find((m) => m.val === mucus);

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="rounded-xl p-3 bg-sky-50 border border-sky-200">
        <p className="text-xs text-sky-700 leading-relaxed">
          <span className="font-semibold">Optional tracking</span> — Logging cervical mucus and
          temperature may help refine your fertile window predictions.
        </p>
      </div>

      {/* Cervical Mucus Selector */}
      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          Cervical Mucus — Today
        </p>
        <div className="grid grid-cols-5 gap-2">
          {MUCUS_OPTIONS.map((opt) => (
            <button
              key={opt.val}
              onClick={() => setMucus(opt.val as OvulationLog["mucus"])}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200 active:scale-[0.95] ${
                mucus === opt.val
                  ? "border-sky-400 bg-sky-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <span className="text-lg">{opt.emoji}</span>
              <span className="text-[9px] font-semibold text-slate-700">{opt.label}</span>
            </button>
          ))}
        </div>
        {selectedMucusInfo && (
          <div className="mt-2 rounded-lg p-2.5 bg-slate-50 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">{selectedMucusInfo.desc}</p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedMucusInfo.fertility === "Peak"
                    ? "bg-emerald-100 text-emerald-700"
                    : selectedMucusInfo.fertility === "High"
                    ? "bg-teal-100 text-teal-700"
                    : selectedMucusInfo.fertility === "Medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {selectedMucusInfo.fertility} Fertility
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Basal Temperature */}
      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          Basal Body Temperature (°F)
        </p>
        <input
          type="number"
          step="0.1"
          min={96}
          max={100}
          placeholder="e.g. 97.6"
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Measure at the same time each morning before getting out of bed
        </p>
      </div>

      {/* Notes */}
      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          Notes (optional)
        </p>
        <textarea
          placeholder="Any additional observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all resize-none"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={saveLog}
        disabled={!mucus && !temp}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] ${
          saved
            ? "bg-emerald-500 text-white"
            : "bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed"
        }`}
      >
        {saved ? "✓ Saved for Today" : todayLog ? "Update Today's Log" : "Save Today's Entry"}
      </button>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Recent Entries ({logs.length})
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {logs.slice(0, 5).map((log, i) => {
              const mucusOpt = MUCUS_OPTIONS.find((m) => m.val === log.mucus);
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="text-slate-400 font-medium w-20">{log.date}</span>
                  {mucusOpt && <span>{mucusOpt.emoji} {mucusOpt.label}</span>}
                  {log.temperature && <span className="text-sky-600">🌡️ {log.temperature}°F</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
