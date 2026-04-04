import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useGamification } from "@/hooks/useGamification";
import { useHealthLog } from "@/hooks/useHealthLog";
import { DAILY_HABITS } from "@/lib/gamificationData";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import HabitCard from "@/components/gamification/HabitCard";
import StreakBadge from "@/components/gamification/StreakBadge";
import BadgeGrid from "@/components/gamification/BadgeGrid";
import LevelProgress from "@/components/gamification/LevelProgress";
import MotivationalNudge from "@/components/gamification/MotivationalNudge";

import SymptomQuickLogger from "@/components/SymptomQuickLogger";
import WeeklyGuidance from "@/components/guidance/WeeklyGuidance";
import { Trophy, TrendingUp, Calendar, Target, Wind } from "lucide-react";


const STRESS_BY_PHASE: Record<string, { title: string; tips: string[] }> = {
  puberty: {
    title: "Stress care for school & hormones",
    tips: ["Try a 5‑minute walk after class before homework.", "Name one trusted person you can text on a hard day.", "Keep a regular sleep window — screens off 45 minutes before bed."],
  },
  maternity: {
    title: "Stress care during pregnancy",
    tips: ["Box breathing: 4 in, hold 4, out 6 for two minutes.", "Share one worry with your partner or ANC nurse — don't carry it alone.", "Limit doom‑scrolling; set a daily news timer."],
  },
  "family-planning": {
    title: "Stress care while planning ahead",
    tips: ["Plan one small joyful ritual weekly (not only \"tasks\").", "Split big decisions into weekly micro\u2011steps.", "If trying feels heavy, pause and hydrate \u2014 reset the nervous system."],
  },
};

export default function WellnessDashboard() {
  const { language, simpleMode } = useLanguage();
  const { phase, phaseName, phaseEmoji } = usePhase();
  const g = useGamification(language);
  const { logs } = useHealthLog();
  const stress = STRESS_BY_PHASE[phase];

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = logs[todayISO];
  const todaySymptomCount = useMemo(() => {
    if (!todayLog?.symptoms) return 0;
    return Object.values(todayLog.symptoms).filter(Boolean).length;
  }, [todayLog]);

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-5">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Wellness Tracker</h1>
                  <p className="text-xs text-muted-foreground">Track daily habits · Earn rewards · Stay healthy</p>
                  <p className="mt-1 text-[10px] inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">
                    <span>{phaseEmoji}</span>
                    <span>
                      Context: <strong>{phaseName}</strong>
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StreakBadge streak={g.stats.currentStreak} size="md" />
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{g.todayCompleted}/{g.todayTotal}</p>
                  <p className="text-[10px] text-muted-foreground">today</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Calendar CTA — log symptoms in the Calendar (single source of truth) */}
        <ScrollReveal>
          <Link
            to="/calendar"
            className="block rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Today's Health Log</p>
                  <p className="text-xs text-muted-foreground">
                    {todaySymptomCount > 0
                      ? `${todaySymptomCount} symptom${todaySymptomCount > 1 ? "s" : ""} logged today`
                      : "No symptoms logged yet — tap to open Calendar"}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </Link>
        </ScrollReveal>
        <ScrollReveal>
          <WeeklyGuidance />
        </ScrollReveal>
        {/* Level + XP */}
        <ScrollReveal>
          <LevelProgress
            level={g.level}
            nextLevel={g.nextLevel}
            progress={g.levelProgress}
            totalXP={g.stats.totalXP}
          />
        </ScrollReveal>

        {/* Motivational Nudge */}
        <ScrollReveal delay={80}>
          <MotivationalNudge message={g.nudge} />
        </ScrollReveal>

        <ScrollReveal delay={90}>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wind className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">{stress.title}</h2>
            </div>
            <ul className="space-y-2">
              {stress.tips.map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        {/* Today's completion ring + stats row */}
        <ScrollReveal delay={120}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-card border border-border p-3 text-center">
              <div className="relative w-14 h-14 mx-auto mb-1">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                    stroke={g.todayPct === 100 ? "hsl(140,60%,40%)" : "hsl(var(--primary))"}
                    strokeWidth="3.5" strokeDasharray={`${g.todayPct}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {g.todayPct}%
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">Today</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-3 text-center">
              <p className="text-2xl font-bold text-primary">{g.stats.totalXP}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">Total XP</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{g.stats.perfectDays}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">Perfect Days</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{g.unlockedBadges.length}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">Badges</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Daily Habits */}
        <div>
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">Today's Habits</h2>
              {g.todayPct === 100 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ All Done!</span>}
            </div>
          </ScrollReveal>
          <div className="grid gap-2 sm:grid-cols-2">
            {DAILY_HABITS.map((habit, i) => (
              <ScrollReveal key={habit.id} delay={i * 60}>
                <HabitCard
                  habit={habit}
                  completed={!!g.todayHabits[habit.id]}
                  onToggle={() => g.toggleHabit(habit.id)}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Weekly Progress Bar Chart */}
        <ScrollReveal>
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">Last 7 Days</h2>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-28">
              {g.last7Days.map((day, i) => {
                const dayName = dayLabels[new Date(day.date).getDay()];
                const isToday = day.date === new Date().toISOString().slice(0, 10);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-muted-foreground">{day.pct}%</span>
                    <div className="w-full rounded-t-lg bg-muted relative" style={{ height: "80px" }}>
                      <div
                        className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${
                          day.pct === 100
                            ? "bg-gradient-to-t from-green-500 to-green-400"
                            : day.pct > 0
                            ? "bg-gradient-to-t from-primary to-primary/70"
                            : "bg-transparent"
                        }`}
                        style={{ height: `${(day.pct / 100) * 80}px` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {isToday ? "Today" : dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Badge Collection */}
        <ScrollReveal>
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">Badge Collection</h2>
              <span className="text-xs text-muted-foreground">{g.unlockedBadges.length}/{g.unlockedBadges.length + g.lockedBadges.length}</span>
            </div>
            <BadgeGrid unlocked={g.unlockedBadges} locked={g.lockedBadges} />
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
