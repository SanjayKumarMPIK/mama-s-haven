import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Save, Snowflake, Thermometer, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog, type MenopauseEntry } from "@/hooks/useHealthLog";
import {
  buildCoolingPlan,
  countRecentCalendarPatterns,
  readMenopauseToolData,
  writeMenopauseToolData,
  type CoolingPlanRecord,
} from "@/lib/menopauseTools";
import { cn } from "@/lib/utils";

const botherOptions = ["Heat", "Heavy clothing", "Spicy food", "Poor sleep", "Stress"];

export default function MenoCoolingPlanBuilder() {
  const { user } = useAuth();
  const { getPhaseLogs } = useHealthLog();
  const today = new Date().toISOString().slice(0, 10);

  const calendarLogs = useMemo(() => {
    const phaseLogs = getPhaseLogs("menopause");
    return Object.entries(phaseLogs)
      .map(([date, entry]) => ({ date, entry: entry as MenopauseEntry }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getPhaseLogs]);

  const recentSummary = useMemo(() => countRecentCalendarPatterns(calendarLogs), [calendarLogs]);
  const [plans, setPlans] = useState<CoolingPlanRecord[]>(() => readMenopauseToolData(user?.id, "coolingPlans", []));
  const existingTodayPlan = plans.find((plan) => plan.date === today);

  const [timeOfDay, setTimeOfDay] = useState<CoolingPlanRecord["timeOfDay"]>(existingTodayPlan?.timeOfDay ?? (recentSummary.nightSweatDays >= 3 ? "night" : "evening"));
  const [symptomFocus, setSymptomFocus] = useState<CoolingPlanRecord["symptomFocus"]>(existingTodayPlan?.symptomFocus ?? (recentSummary.nightSweatDays > recentSummary.hotFlashDays ? "night_sweats" : "both"));
  const [supportStyle, setSupportStyle] = useState<CoolingPlanRecord["supportStyle"]>(existingTodayPlan?.supportStyle ?? "simple_reminders");
  const [bothers, setBothers] = useState<string[]>(existingTodayPlan?.bothers ?? []);
  const [currentPlan, setCurrentPlan] = useState<CoolingPlanRecord | null>(existingTodayPlan ?? null);

  const toggleBother = (value: string) => {
    setBothers((prev) => prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]);
  };

  const savePlan = (record: CoolingPlanRecord) => {
    const next = [record, ...plans.filter((plan) => plan.date !== record.date)].sort((a, b) => b.date.localeCompare(a.date));
    setPlans(next);
    setCurrentPlan(record);
    writeMenopauseToolData(user?.id, "coolingPlans", next);
  };

  const generatePlan = () => {
    const planItems = buildCoolingPlan({ symptomFocus, timeOfDay, bothers, supportStyle }, calendarLogs);
    const record: CoolingPlanRecord = {
      date: today,
      symptomFocus,
      timeOfDay,
      bothers,
      supportStyle,
      planItems,
      completedItems: [],
    };
    savePlan(record);
    toast.success("A new cooling plan is ready.");
  };

  const toggleCompleted = (item: string) => {
    if (!currentPlan) return;
    const completedItems = currentPlan.completedItems.includes(item)
      ? currentPlan.completedItems.filter((entry) => entry !== item)
      : [...currentPlan.completedItems, item];
    savePlan({ ...currentPlan, completedItems });
  };

  const planProgress = currentPlan ? `${currentPlan.completedItems.length} of ${currentPlan.planItems.length} completed` : "No plan yet";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/60 via-white to-cyan-50/40">
      <div className="container max-w-5xl space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/tools" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md">
            <Snowflake className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Cooling Plan Builder</h1>
            <p className="text-xs text-slate-500">Create a personalized comfort plan for hot flashes and night sweats</p>
          </div>
        </div>

        <section className="rounded-3xl border border-sky-200/70 bg-white/85 p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Quick Plan Builder Form</p>
                <p className="mt-1 text-xs text-slate-500">Tell the tool when symptoms show up most and what makes them harder.</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700">When do symptoms occur most?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["morning", "afternoon", "evening", "night"] as const).map((option) => (
                    <button key={option} onClick={() => setTimeOfDay(option)} className={cn("rounded-2xl border px-3 py-3 text-sm font-medium capitalize transition-all", timeOfDay === option ? "border-sky-300 bg-sky-100 text-sky-800" : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50")}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700">Which symptom troubles you most?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "hot_flashes", label: "Hot flashes" },
                    { value: "night_sweats", label: "Night sweats" },
                    { value: "both", label: "Both" },
                  ].map((option) => (
                    <button key={option.value} onClick={() => setSymptomFocus(option.value as CoolingPlanRecord["symptomFocus"])} className={cn("rounded-2xl border px-3 py-3 text-sm font-medium transition-all", symptomFocus === option.value ? "border-sky-300 bg-sky-100 text-sky-800" : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50")}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700">What tends to bother you?</p>
                <div className="flex flex-wrap gap-2">
                  {botherOptions.map((option) => (
                    <button key={option} onClick={() => toggleBother(option)} className={cn("rounded-full border px-3 py-2 text-sm font-medium transition-all", bothers.includes(option) ? "border-sky-300 bg-sky-100 text-sky-800" : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50")}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700">Preferred support style</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "simple_reminders", label: "Simple reminders" },
                    { value: "food_tips", label: "Food tips" },
                    { value: "sleep_tips", label: "Sleep tips" },
                    { value: "environment_tips", label: "Environment tips" },
                  ].map((option) => (
                    <button key={option.value} onClick={() => setSupportStyle(option.value as CoolingPlanRecord["supportStyle"])} className={cn("rounded-2xl border px-3 py-3 text-sm font-medium transition-all", supportStyle === option.value ? "border-sky-300 bg-sky-100 text-sky-800" : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50")}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-sky-50/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">Your Cooling Plan Today</p>
                  <p className="mt-1 text-xs text-slate-500">{planProgress}</p>
                </div>
                <Thermometer className="h-5 w-5 text-sky-600" />
              </div>

              <div className="mt-4 space-y-3">
                {currentPlan ? currentPlan.planItems.map((item) => {
                  const done = currentPlan.completedItems.includes(item);
                  return (
                    <button key={item} onClick={() => toggleCompleted(item)} className={cn("w-full rounded-2xl border p-4 text-left transition-all", done ? "border-emerald-200 bg-emerald-50" : "border-white/80 bg-white/85 hover:border-sky-200 hover:bg-white")}>
                      <p className={cn("text-sm font-medium", done ? "text-emerald-800" : "text-slate-700")}>{item}</p>
                    </button>
                  );
                }) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-sm text-slate-500">
                    No plan yet. Generate one to get 3 to 5 comfort actions for today.
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={generatePlan} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700">
                  <Save className="h-4 w-4" /> Save plan
                </button>
                <button onClick={generatePlan} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                  <RefreshCw className="h-4 w-4" /> Regenerate plan
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">What this plan is prioritizing</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {recentSummary.nightSweatDays >= 3 ? "Recent calendar logs show frequent night sweats, so night-time cooling steps are being emphasized." : "Night sweats have not dominated recently, so the plan stays balanced across the day."}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {recentSummary.hotFlashDays >= 3 ? "Hot flashes appear on multiple recent days, so hydration and early response actions are prioritized." : "If hot flashes increase, regenerate the plan to surface stronger day-time support actions."}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {recentSummary.sleepDifficultyDays >= 3 ? "Sleep-related support is added because recent logs suggest night symptoms may affect recovery." : "If sleep becomes harder, switch support style to sleep tips for a more evening-focused plan."}
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <Shield className="h-5 w-5 shrink-0 text-slate-500" />
          <p className="text-[11px] leading-relaxed text-slate-500">Cooling plans are for comfort support only. If symptoms feel severe or rapidly worsen, seek medical care.</p>
        </div>
      </div>
    </div>
  );
}
