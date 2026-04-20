import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Flame, Moon, Sun, Smile, Frown, Meh, Laugh, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause, type MenopauseLogEntry } from "@/hooks/useMenopause";
import { getStageLabel } from "@/hooks/useMenopause";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOOD_EMOJIS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: "😢", label: "Very low" },
  { value: 2, emoji: "😔", label: "Low" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Daily Log Modal ─────────────────────────────────────────────────────────

function DailyLogModal({
  date,
  existing,
  isPerimenopause,
  onSave,
  onClose,
}: {
  date: string;
  existing?: MenopauseLogEntry;
  isPerimenopause: boolean;
  onSave: (entry: MenopauseLogEntry) => void;
  onClose: () => void;
}) {
  const [hotFlashCount, setHotFlashCount] = useState(existing?.hotFlashCount ?? 0);
  const [mood, setMood] = useState(existing?.mood ?? 3);
  const [sleepHrs, setSleepHrs] = useState(existing?.sleepHrs ?? 7);
  const [painLevel, setPainLevel] = useState(existing?.painLevel ?? 1);
  const [periodOccurred, setPeriodOccurred] = useState(existing?.periodOccurred ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const displayDate = new Date(date + "T00:00:00");
  const dateLabel = displayDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const handleSave = () => {
    onSave({ date, hotFlashCount, mood, sleepHrs, painLevel, periodOccurred, notes });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Daily Log</h3>
            <p className="text-xs text-amber-600 font-medium">{dateLabel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Hot flash count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Flame className="w-4 h-4 text-orange-500" /> Hot flashes today
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHotFlashCount(Math.max(0, hotFlashCount - 1))}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 transition-colors"
              >−</button>
              <span className="w-12 text-center text-2xl font-bold text-amber-600">{hotFlashCount}</span>
              <button
                onClick={() => setHotFlashCount(hotFlashCount + 1)}
                className="w-9 h-9 rounded-lg bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-lg font-bold text-amber-600 transition-colors"
              >+</button>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Mood</label>
            <div className="flex items-center justify-between gap-1">
              {MOOD_EMOJIS.map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => setMood(value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all",
                    mood === value
                      ? "border-amber-400 bg-amber-50 shadow-sm scale-105"
                      : "border-transparent hover:border-slate-200"
                  )}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep hours */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Moon className="w-4 h-4 text-indigo-500" /> Sleep hours
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleepHrs}
                onChange={(e) => setSleepHrs(parseFloat(e.target.value))}
                className="flex-1 h-2 appearance-none bg-slate-200 rounded-full cursor-pointer accent-indigo-500
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
              />
              <span className="text-sm font-bold text-indigo-600 w-12 text-right">{sleepHrs}h</span>
            </div>
          </div>

          {/* Pain level */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Pain level (1–5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setPainLevel(level)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border-2 text-sm font-bold transition-all",
                    painLevel === level
                      ? level <= 2 ? "border-green-400 bg-green-50 text-green-700" :
                        level <= 3 ? "border-amber-400 bg-amber-50 text-amber-700" :
                        "border-red-400 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Period occurred (perimenopause only) */}
          {isPerimenopause && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Heart className="w-4 h-4 text-rose-500" /> Period today?
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriodOccurred(false)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                    !periodOccurred ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500"
                  )}
                >No</button>
                <button
                  onClick={() => setPeriodOccurred(true)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                    periodOccurred ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500"
                  )}
                >Yes</button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today? Any observations..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-[0.98] transition-all"
          >
            {existing ? "Update Log" : "Save Log"} ✨
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Calendar Component ─────────────────────────────────────────────────

export default function MenopauseCalendar() {
  const { profile, logs, addLog, getLogForDate, getLogsForMonth } = useMenopause();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const isPerimenopause = profile?.stage === "perimenopause";
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const monthLogs = useMemo(() => getLogsForMonth(viewYear, viewMonth), [getLogsForMonth, viewYear, viewMonth]);

  const logMap = useMemo(() => {
    const map: Record<string, MenopauseLogEntry> = {};
    monthLogs.forEach((l) => { map[l.date] = l; });
    return map;
  }, [monthLogs]);

  // Weekly summary
  const weeklySummaries = useMemo(() => {
    const weeks: { start: number; end: number; avgScore: number | null }[] = [];
    let weekStart = 1;

    while (weekStart <= daysInMonth) {
      const weekEnd = Math.min(weekStart + 6, daysInMonth);
      const weekLogs: MenopauseLogEntry[] = [];

      for (let d = weekStart; d <= weekEnd; d++) {
        const dateStr = formatDateStr(viewYear, viewMonth, d);
        if (logMap[dateStr]) weekLogs.push(logMap[dateStr]);
      }

      const avgScore = weekLogs.length > 0
        ? weekLogs.reduce((sum, l) => sum + ((l.hotFlashCount > 0 ? 1 : 0) + (5 - l.mood) + (7 - Math.min(l.sleepHrs, 7)) / 7 * 5 + l.painLevel) / 4, 0) / weekLogs.length
        : null;

      weeks.push({ start: weekStart, end: weekEnd, avgScore });
      weekStart = weekEnd + 1;
    }
    return weeks;
  }, [daysInMonth, viewYear, viewMonth, logMap]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const getDots = (log: MenopauseLogEntry | undefined) => {
    if (!log) return [];
    const dots: { color: string; label: string }[] = [];
    if (log.hotFlashCount > 0) dots.push({ color: "bg-amber-400", label: "Hot flash" });
    if (log.mood <= 2) dots.push({ color: "bg-purple-400", label: "Low mood" });
    if (log.mood >= 4 && log.sleepHrs >= 7) dots.push({ color: "bg-teal-400", label: "Good day" });
    if (isPerimenopause && log.periodOccurred) dots.push({ color: "bg-red-400", label: "Period" });
    return dots;
  };

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Menopause Calendar</h1>
            {profile && (
              <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                {getStageLabel(profile.stage)}
              </span>
            )}
          </div>
        </div>

        {/* Month Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-amber-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-base font-bold text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-amber-100 transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-2 pt-3">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-slate-400 uppercase pb-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateStr(viewYear, viewMonth, day);
              const log = logMap[dateStr];
              const dots = getDots(log);
              const isToday = dateStr === todayStr;
              const isFuture = new Date(dateStr) > today;

              return (
                <button
                  key={day}
                  onClick={() => !isFuture && setSelectedDate(dateStr)}
                  disabled={isFuture}
                  className={cn(
                    "h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all text-sm relative",
                    isToday && "ring-2 ring-amber-400 bg-amber-50",
                    log && !isToday && "bg-slate-50",
                    isFuture ? "opacity-30 cursor-not-allowed" : "hover:bg-amber-50 cursor-pointer",
                    !isToday && !log && !isFuture && "hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    isToday ? "text-amber-700 font-bold" : "text-slate-700"
                  )}>
                    {day}
                  </span>
                  {dots.length > 0 && (
                    <div className="flex gap-0.5">
                      {dots.slice(0, 3).map((dot, idx) => (
                        <div key={idx} className={cn("w-1.5 h-1.5 rounded-full", dot.color)} title={dot.label} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Hot flash
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Low mood
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Good day
            </div>
            {isPerimenopause && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Period
              </div>
            )}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-bold text-slate-700 px-1">Weekly Summary</h3>
          {weeklySummaries.map((week, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {MONTH_NAMES[viewMonth].slice(0, 3)} {week.start}–{week.end}
              </span>
              {week.avgScore !== null ? (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        week.avgScore <= 1.5 ? "bg-green-400" :
                        week.avgScore <= 3 ? "bg-amber-400" : "bg-red-400"
                      )}
                      style={{ width: `${Math.min(100, (week.avgScore / 5) * 100)}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-bold",
                    week.avgScore <= 1.5 ? "text-green-600" :
                    week.avgScore <= 3 ? "text-amber-600" : "text-red-600"
                  )}>
                    {week.avgScore.toFixed(1)}/5
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No data</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Log Modal */}
      {selectedDate && (
        <DailyLogModal
          date={selectedDate}
          existing={getLogForDate(selectedDate)}
          isPerimenopause={isPerimenopause}
          onSave={(entry) => { addLog(entry); setSelectedDate(null); }}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
