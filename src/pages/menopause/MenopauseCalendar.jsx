import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause, getStageLabel, SYMPTOM_OPTIONS } from "@/hooks/useMenopause";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CORE_MENOPAUSE_SYMPTOMS = [
  "hot_flashes",
  "night_sweats",
  "mood_swings",
  "anxiety",
  "sleep_issues",
  "fatigue",
  "joint_pain",
  "vaginal_dryness",
];

const CONTEXT_GROUPS = {
  poor_sleep: ["fatigue", "brain_fog", "sleep_issues"],
  mood: ["anxiety", "mood_swings"],
  physical_pain: ["joint_pain", "headache"],
};

const FOOD_GUIDANCE = {
  hot_flashes: "Cooling foods: cucumber, mint, coconut water, hydration focus",
  fatigue: "Iron and protein rich foods: lentils, spinach, eggs, paneer",
  mood_swings: "Omega-3 support: walnuts, flax/chia seeds, fatty fish",
};

const EXERCISE_GUIDANCE = {
  low_energy: "Light yoga or short walks for energy-friendly movement",
  joint_pain: "Low-impact workouts: mobility, stretching, swimming, cycling",
};

function formatDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getWeekIndexInMonth(day, firstDay) {
  return Math.floor((day + firstDay - 1) / 7);
}

function symptomScore(log) {
  const sleepPenalty = Math.max(0, 7 - (log.sleepHrs ?? 7));
  const hotFlashComponent = (log.hotFlashCount ?? 0) > 0 ? 1 : 0;
  return ((hotFlashComponent + (5 - (log.mood ?? 3)) + sleepPenalty + (log.painLevel ?? 1)) / 4);
}

function getSeverityTone(severity = "mild") {
  if (severity === "severe") return "bg-rose-500";
  if (severity === "moderate") return "bg-amber-400";
  return "bg-emerald-400";
}

function getRecentDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return [start, end];
}

function inRange(dateStr, start, end) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d >= start && d <= end;
}

function buildPersonalizedInsights(logs) {
  const [start7, end7] = getRecentDateRange(7);
  const [start14, end14] = getRecentDateRange(14);
  const logs7d = logs.filter((log) => inRange(log.date, start7, end7));
  const logs14d = logs.filter((log) => inRange(log.date, start14, end14));

  const symptomCount7d = {};
  logs7d.forEach((log) => {
    (log.symptoms ?? []).forEach((id) => {
      symptomCount7d[id] = (symptomCount7d[id] ?? 0) + 1;
    });
  });

  const fatigueCount = symptomCount7d.fatigue ?? 0;
  const hotFlashesCount = symptomCount7d.hot_flashes ?? 0;
  const poorSleepDays = logs7d.filter((log) => log.sleepQuality === "poor").length;
  const avgEnergy = logs7d.length
    ? logs7d.reduce((sum, log) => sum + (log.energyLevel ?? 3), 0) / logs7d.length
    : null;

  const smartInsights = [];
  if (fatigueCount > 0) smartInsights.push(`You logged fatigue ${fatigueCount} times this week`);
  if (poorSleepDays >= 2) smartInsights.push("Sleep quality is low -> improve your sleep routine");
  if (hotFlashesCount >= 3) smartInsights.push("Frequent hot flashes -> adjust diet and hydration");
  if (smartInsights.length === 0 && logs7d.length > 0) smartInsights.push("Consistent logging is helping personalize your care");

  const food = [];
  if (hotFlashesCount > 0) food.push(FOOD_GUIDANCE.hot_flashes);
  if (fatigueCount > 0) food.push(FOOD_GUIDANCE.fatigue);
  if ((symptomCount7d.mood_swings ?? 0) > 0) food.push(FOOD_GUIDANCE.mood_swings);

  const exercise = [];
  if (avgEnergy !== null && avgEnergy <= 2.5) exercise.push(EXERCISE_GUIDANCE.low_energy);
  if ((symptomCount7d.joint_pain ?? 0) > 0) exercise.push(EXERCISE_GUIDANCE.joint_pain);

  return {
    logs7d,
    logs14d,
    symptomCount7d,
    smartInsights,
    food: food.slice(0, 3),
    exercise: exercise.slice(0, 2),
  };
}

function LogModal({ date, existingLog, isPerimenopause, logs, onSave, onDelete, onClose }) {
  const [periodOccurred, setPeriodOccurred] = useState(existingLog?.periodOccurred ?? false);
  const [notes, setNotes] = useState(existingLog?.notes ?? "");
  const [symptoms, setSymptoms] = useState(existingLog?.symptoms ?? []);
  const [severity, setSeverity] = useState(existingLog?.severity ?? "mild");
  const [energyLevel, setEnergyLevel] = useState(existingLog?.energyLevel ?? 3);
  const [sleepQuality, setSleepQuality] = useState(existingLog?.sleepQuality ?? "average");
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);

  const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const toggleSymptom = (symptomId) => {
    setSymptoms((prev) => (
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    ));
  };

  const dynamicSymptomOptions = useMemo(() => {
    const optionMap = new Map(SYMPTOM_OPTIONS.map((item) => [item.id, item]));
    const [start14, end14] = getRecentDateRange(14);
    const [start7, end7] = getRecentDateRange(7);
    const recentLogs = logs.filter((log) => inRange(log.date, start14, end14));
    const last7Logs = logs.filter((log) => inRange(log.date, start7, end7));

    const freq = {};
    const recentScore = {};
    recentLogs.forEach((log) => {
      (log.symptoms ?? []).forEach((symptomId) => {
        freq[symptomId] = (freq[symptomId] ?? 0) + 1;
      });
    });

    recentLogs
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((log, idx) => {
        (log.symptoms ?? []).forEach((symptomId) => {
          if (recentScore[symptomId] == null) recentScore[symptomId] = 20 - idx;
        });
      });

    const poorSleepCount = last7Logs.filter((log) => log.sleepQuality === "poor").length;
    const moodIssueCount = last7Logs.filter((log) => (log.symptoms ?? []).some((s) => s === "mood_swings" || s === "anxiety")).length;
    const painCount = last7Logs.filter((log) => (log.symptoms ?? []).some((s) => s === "joint_pain" || s === "headache")).length;

    const contextBoost = {};
    if (poorSleepCount >= 2) CONTEXT_GROUPS.poor_sleep.forEach((id) => { contextBoost[id] = (contextBoost[id] ?? 0) + 8; });
    if (moodIssueCount >= 2) CONTEXT_GROUPS.mood.forEach((id) => { contextBoost[id] = (contextBoost[id] ?? 0) + 8; });
    if (painCount >= 2) CONTEXT_GROUPS.physical_pain.forEach((id) => { contextBoost[id] = (contextBoost[id] ?? 0) + 8; });

    const scores = SYMPTOM_OPTIONS.map((item) => {
      const isCore = CORE_MENOPAUSE_SYMPTOMS.includes(item.id);
      const inCurrentLog = symptoms.includes(item.id);
      const score =
        (freq[item.id] ?? 0) * 5 +
        (recentScore[item.id] ?? 0) +
        (contextBoost[item.id] ?? 0) +
        (isCore ? 3 : 0) +
        (inCurrentLog ? 12 : 0);
      return { item, score, frequent: (freq[item.id] ?? 0) >= 2 };
    }).sort((a, b) => b.score - a.score);

    const ordered = scores.map((x) => x.item);
    return {
      top: ordered.slice(0, 6),
      all: ordered,
      hasMore: ordered.length > 6,
      frequentIds: scores.filter((s) => s.frequent).map((s) => s.item.id),
    };
  }, [logs, symptoms]);

  const handleSave = () => {
    const hotFlashCount = symptoms.includes("hot_flashes")
      ? (severity === "severe" ? 4 : severity === "moderate" ? 2 : 1)
      : 0;
    const nightSweats = symptoms.includes("night_sweats")
      ? (severity === "severe" ? 5 : severity === "moderate" ? 3 : 1)
      : 0;
    const jointPain = symptoms.includes("joint_pain")
      ? (severity === "severe" ? 5 : severity === "moderate" ? 3 : 1)
      : 0;
    const headache = symptoms.includes("headache")
      ? (severity === "severe" ? 5 : severity === "moderate" ? 3 : 1)
      : 0;
    const anxiety = symptoms.includes("anxiety")
      ? (severity === "severe" ? 5 : severity === "moderate" ? 3 : 1)
      : 0;
    const vaginalDryness = symptoms.includes("vaginal_dryness")
      ? (severity === "severe" ? 4 : severity === "moderate" ? 2 : 1)
      : 0;
    const fatigue = symptoms.includes("fatigue")
      ? (severity === "severe" ? 5 : severity === "moderate" ? 3 : 1)
      : 0;
    const mood = Number(energyLevel);
    const sleepHrs = sleepQuality === "good" ? 7.5 : sleepQuality === "average" ? 6 : 4.5;
    const painLevel = jointPain;

    onSave({
      date,
      hotFlashCount,
      nightSweats,
      jointPain,
      headache,
      anxiety,
      vaginalDryness,
      fatigue,
      mood,
      sleepHrs,
      painLevel,
      periodOccurred,
      notes,
      symptoms,
      severity,
      energyLevel,
      sleepQuality,
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-amber-50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Daily Log</h3>
            <p className="text-xs text-slate-500">{dateLabel}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-amber-100">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Symptoms (multi-select)</p>
            {dynamicSymptomOptions.frequentIds.length > 0 ? (
              <p className="text-[11px] text-amber-700 mb-2">Frequently logged symptoms are pinned first</p>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              {(showAllSymptoms ? dynamicSymptomOptions.all : dynamicSymptomOptions.top).map((item) => {
                const active = symptoms.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSymptom(item.id)}
                    className={cn(
                      "rounded-xl border px-2.5 py-2 text-xs text-left transition-colors",
                      active ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-600"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            {dynamicSymptomOptions.hasMore ? (
              <button
                type="button"
                onClick={() => setShowAllSymptoms((prev) => !prev)}
                className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                {showAllSymptoms ? "View less" : "View more"}
              </button>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Severity</p>
            <div className="grid grid-cols-3 gap-2">
              {["mild", "moderate", "severe"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSeverity(item)}
                  className={cn(
                    "rounded-xl border-2 py-2 text-xs font-semibold capitalize",
                    severity === item ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Energy level (1-5)</p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEnergyLevel(value)}
                  className={cn(
                    "rounded-xl border-2 py-2 text-sm font-semibold",
                    energyLevel === value ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Sleep quality</p>
            <div className="grid grid-cols-3 gap-2">
              {["good", "average", "poor"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSleepQuality(value)}
                  className={cn(
                    "rounded-xl border-2 py-2 text-xs font-semibold capitalize",
                    sleepQuality === value ? "border-amber-400 bg-amber-50 text-amber-800" : "border-slate-200 text-slate-600"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {isPerimenopause ? (
            <div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={periodOccurred}
                  onChange={(e) => setPeriodOccurred(e.target.checked)}
                  className="rounded border-slate-300"
                />
                Period occurred
              </label>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none"
              placeholder="Optional notes"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onDelete(date)}
            className="rounded-xl py-2.5 text-sm font-semibold border border-rose-300 bg-rose-50 text-rose-700"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl py-2.5 text-sm font-semibold bg-amber-500 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function MonthPickerOverlay({ year, onClose, onYearChange, onSelectMonth }) {
  return (
    <div className="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100" onClick={() => onYearChange(-1)}>
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h3 className="text-sm font-bold text-slate-800">{year}</h3>
          <button type="button" className="p-2 rounded-lg hover:bg-slate-100" onClick={() => onYearChange(1)}>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTH_NAMES.map((monthName, idx) => (
            <button
              key={monthName}
              type="button"
              onClick={() => onSelectMonth(idx)}
              className="rounded-xl border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50"
            >
              {monthName.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MenopauseCalendar() {
  const { profile, logs, addLog, deleteLog, getLogForDate, getLogsForMonth } = useMenopause();
  const today = new Date();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [modalDate, setModalDate] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const touchStartX = useRef(null);
  const monthLogs = useMemo(() => getLogsForMonth(viewYear, viewMonth), [getLogsForMonth, viewYear, viewMonth]);
  const logMap = useMemo(() => {
    const map = {};
    monthLogs.forEach((log) => {
      map[log.date] = log;
    });
    return map;
  }, [monthLogs]);

  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  const weekAverages = useMemo(() => {
    const weeks = [];
    for (let week = 0; week < 6; week += 1) {
      const weekLogs = [];
      for (let day = 1; day <= daysInMonth; day += 1) {
        if (getWeekIndexInMonth(day, firstDay) === week) {
          const dateStr = formatDateStr(viewYear, viewMonth, day);
          if (logMap[dateStr]) {
            weekLogs.push(logMap[dateStr]);
          }
        }
      }
      if (weekLogs.length > 0) {
        const avg = weekLogs.reduce((sum, log) => sum + symptomScore(log), 0) / weekLogs.length;
        weeks.push({ week, average: avg });
      }
    }
    return weeks;
  }, [daysInMonth, firstDay, logMap, viewMonth, viewYear]);
  const personalization = useMemo(() => buildPersonalizedInsights(logs), [logs]);

  const changeMonth = (offset) => {
    if (viewMonth === 0 && offset < 0) {
      setViewYear((v) => v - 1);
      setViewMonth(11);
      return;
    }
    if (viewMonth === 11 && offset > 0) {
      setViewYear((v) => v + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth((v) => v + offset);
  };

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        changeMonth(1);
      } else {
        changeMonth(-1);
      }
    }
    touchStartX.current = null;
  };

  const stage = profile?.stage;
  const isPerimenopause = stage === "perimenopause";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Menopause Calendar</h1>
            {profile ? (
              <p className="text-xs text-amber-700 font-medium">{getStageLabel(profile.stage)}</p>
            ) : null}
          </div>
        </div>

        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
            <button type="button" className="p-2 rounded-lg hover:bg-amber-100" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
            <button type="button" className="px-3 py-1 rounded-lg hover:bg-amber-100" onClick={() => setShowMonthPicker(true)}>
              <h2 className="text-sm font-bold text-slate-800">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
            </button>
            <button type="button" className="p-2 rounded-lg hover:bg-amber-100" onClick={() => changeMonth(1)}>
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          <div className="px-4 py-2 border-b border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={goToToday}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 px-2 pt-2">
            {DAY_HEADERS.map((day) => (
              <div key={day} className="text-center text-[11px] font-semibold text-slate-400 pb-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 px-2 pb-3">
            {Array.from({ length: firstDay }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-12" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = formatDateStr(viewYear, viewMonth, day);
              const log = logMap[dateStr];
              const isSelected = selectedDate === dateStr;
              const severityTone = log ? getSeverityTone(log.severity) : null;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setModalDate(dateStr);
                  }}
                  className={cn(
                    "h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 border transition-colors",
                    isSelected ? "border-amber-400 bg-amber-50" : "border-transparent hover:bg-slate-50"
                  )}
                >
                  <span className={cn("text-sm", isSelected ? "text-amber-700 font-bold" : "text-slate-700")}>{day}</span>
                  {severityTone ? <span className={cn("w-2.5 h-1 rounded-full", severityTone)} /> : <span className="w-2.5 h-1 rounded-full bg-transparent" />}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap gap-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Mild day
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate day
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Severe day
            </div>
            {isPerimenopause ? (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Period
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-3">
          <h3 className="text-xs font-bold text-slate-700 mb-2">Weekly Summary</h3>
          <div className="flex gap-2 overflow-x-auto">
            {[0, 1, 2, 3, 4, 5].map((week) => {
              const weekItem = weekAverages.find((entry) => entry.week === week);
              return (
                <div key={week} className="min-w-[92px] rounded-lg border border-slate-200 px-2 py-2 bg-slate-50">
                  <p className="text-[10px] text-slate-500">Week {week + 1}</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {weekItem ? `${weekItem.average.toFixed(1)}/5` : "No data"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-3 space-y-3">
          <h3 className="text-xs font-bold text-slate-700">Smart Insights</h3>
          <div className="space-y-2">
            {personalization.smartInsights.map((insight) => (
              <p key={insight} className="text-xs text-slate-600 rounded-lg bg-slate-50 px-2.5 py-2">
                {insight}
              </p>
            ))}
          </div>
          {(personalization.food.length > 0 || personalization.exercise.length > 0) ? (
            <div className="grid md:grid-cols-2 gap-2">
              <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-2.5">
                <p className="text-[11px] font-bold text-amber-800 mb-1">Food Focus</p>
                {personalization.food.length > 0 ? (
                  personalization.food.map((item) => (
                    <p key={item} className="text-[11px] text-amber-900 mb-1">{item}</p>
                  ))
                ) : (
                  <p className="text-[11px] text-amber-900">No specific food guidance yet. Keep logging for 7 days.</p>
                )}
              </div>
              <div className="rounded-lg border border-teal-100 bg-teal-50/60 p-2.5">
                <p className="text-[11px] font-bold text-teal-800 mb-1">Exercise Focus</p>
                {personalization.exercise.length > 0 ? (
                  personalization.exercise.map((item) => (
                    <p key={item} className="text-[11px] text-teal-900 mb-1">{item}</p>
                  ))
                ) : (
                  <p className="text-[11px] text-teal-900">Energy and pain look stable this week.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showMonthPicker ? (
        <MonthPickerOverlay
          year={viewYear}
          onClose={() => setShowMonthPicker(false)}
          onYearChange={(offset) => setViewYear((prev) => prev + offset)}
          onSelectMonth={(month) => {
            setViewMonth(month);
            setShowMonthPicker(false);
          }}
        />
      ) : null}

      {modalDate ? (
        <LogModal
          date={modalDate}
          existingLog={getLogForDate(modalDate)}
          isPerimenopause={isPerimenopause}
          logs={logs}
          onSave={(entry) => {
            addLog(entry);
            setModalDate(null);
          }}
          onDelete={(date) => {
            deleteLog(date);
            setModalDate(null);
          }}
          onClose={() => setModalDate(null)}
        />
      ) : null}
    </div>
  );
}
