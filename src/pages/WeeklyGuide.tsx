import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { WEEK_DATA } from "@/lib/pregnancyData";
import { PUBERTY_GUIDE, FAMILY_PLANNING_GUIDE, MENOPAUSE_GUIDE, type PhaseGuideWeek } from "@/lib/phaseGuideData";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import SymptomQuickLogger from "@/components/SymptomQuickLogger";
import {
  ChevronLeft, ChevronRight, Scale, Ruler, Heart, Apple,
  Droplets, Activity, AlertTriangle, Calendar, Flower2,
  HeartPulse, Users, Sparkles, Lightbulb, BookOpen
} from "lucide-react";

// ─── Determine the effective life-stage ──────────────────────────────────────
function useEffectiveLifeStage() {
  const { user } = useAuth();
  const { phase } = usePhase();

  // Prefer the phase selector (dropdown) so the user can switch guides dynamically;
  // fall back to the registered life-stage from auth if there's no phase selected.
  const lifeStage = phase || user?.lifeStage;

  // Map registration lifeStage values AND phase values to our guide modes
  const isPregnant = lifeStage === "pregnant" || lifeStage === "maternity";
  const isPuberty = lifeStage === "puberty";
  const isMenopause = lifeStage === "menopause";
  const isFamilyPlanning =
    lifeStage === "family-planning" ||
    lifeStage === "reproductive" ||
    lifeStage === "postpartum";

  let mode: "pregnancy" | "puberty" | "family-planning" | "menopause";
  if (isPregnant) mode = "pregnancy";
  else if (isPuberty) mode = "puberty";
  else if (isMenopause) mode = "menopause";
  else mode = "family-planning";

  return { mode, lifeStage };
}

// ─── Phase-specific metadata ─────────────────────────────────────────────────
const PHASE_META = {
  puberty: {
    title: "Menstrual Cycle Guide",
    subtitle: "Understanding your 4-week cycle — period to PMS and everything in between",
    emoji: "🌸",
    color: "text-pink-600",
    bgLight: "bg-pink-50",
    totalWeeks: 4,
    weekLabel: "Phase",
    icon: Flower2,
  },
  "family-planning": {
    title: "Family Planning Guide",
    subtitle: "Preconception health, contraception, spacing, and government support",
    emoji: "🌿",
    color: "text-teal-600",
    bgLight: "bg-teal-50",
    totalWeeks: 4,
    weekLabel: "Module",
    icon: Users,
  },
  menopause: {
    title: "Menopause Wellness Guide",
    subtitle: "Managing symptoms, staying healthy, and thriving through the transition",
    emoji: "✨",
    color: "text-amber-600",
    bgLight: "bg-amber-50",
    totalWeeks: 4,
    weekLabel: "Module",
    icon: Sparkles,
  },
  pregnancy: {
    title: "Pregnancy Weekly Guide",
    subtitle: "Week-by-week journey from conception to delivery",
    emoji: "🤰",
    color: "text-primary",
    bgLight: "bg-primary/5",
    totalWeeks: 40,
    weekLabel: "Week",
    icon: Calendar,
  },
};

function getGuideData(mode: keyof typeof PHASE_META): PhaseGuideWeek[] {
  switch (mode) {
    case "puberty": return PUBERTY_GUIDE;
    case "family-planning": return FAMILY_PLANNING_GUIDE;
    case "menopause": return MENOPAUSE_GUIDE;
    default: return [];
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Component: Non-pregnancy phase guide
// ═════════════════════════════════════════════════════════════════════════════
function PhaseGuideView({ mode }: { mode: "puberty" | "family-planning" | "menopause" }) {
  const { t, simpleMode } = useLanguage();
  const meta = PHASE_META[mode];
  const data = getGuideData(mode);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const weekData = data[selectedWeek - 1];

  if (!weekData) return null;

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* Header */}
      <div className={`border-b border-border ${meta.bgLight}`}>
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-xl ${meta.bgLight} border border-current/10 flex items-center justify-center`}>
                <meta.icon className={`w-6 h-6 ${meta.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{meta.title}</h1>
                <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Week/Module navigator */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
            disabled={selectedWeek <= 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="text-center">
            <p className={`text-xs font-semibold uppercase tracking-wider ${meta.color}`}>{meta.weekLabel} {selectedWeek} of {meta.totalWeeks}</p>
            <p className="text-sm font-bold mt-0.5">{weekData.title}</p>
          </div>
          <button
            onClick={() => setSelectedWeek(Math.min(meta.totalWeeks, selectedWeek + 1))}
            disabled={selectedWeek >= meta.totalWeeks}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick selector */}
        <div className="mt-3 flex gap-2 justify-center">
          {Array.from({ length: meta.totalWeeks }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`shrink-0 w-10 h-10 rounded-full text-xs font-semibold transition-all duration-150 ${
                w === selectedWeek
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container pb-12">
        <ScrollReveal>
          <div className="mb-4">
            <SymptomQuickLogger />
          </div>
        </ScrollReveal>
        {/* Description */}
        <ScrollReveal>
          <div className={`rounded-xl border p-5 shadow-sm mb-4 ${meta.bgLight} border-current/10`}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className={`w-5 h-5 ${meta.color}`} />
              <h3 className="font-semibold text-sm">About This {meta.weekLabel}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{weekData.description}</p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Tips */}
          <ScrollReveal>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-lavender/70 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-foreground/80" />
                </div>
                <h3 className="font-semibold text-sm">Key Tips</h3>
              </div>
              <ul className="space-y-2">
                {weekData.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Nutrition */}
          <ScrollReveal delay={80}>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center">
                  <Apple className="w-4 h-4 text-mint-foreground" />
                </div>
                <h3 className="font-semibold text-sm">{t("nutritionTips")}</h3>
              </div>
              <ul className="space-y-2">
                {weekData.nutrition.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Activity */}
          <ScrollReveal delay={160}>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-baby-blue flex items-center justify-center">
                  <Activity className="w-4 h-4 text-baby-blue-foreground" />
                </div>
                <h3 className="font-semibold text-sm">{t("activityTips")}</h3>
              </div>
              <ul className="space-y-2">
                {weekData.activity.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 shrink-0">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Warning Signs */}
          <ScrollReveal delay={240}>
            <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-sm text-red-800">{t("warningSigns")}</h3>
              </div>
              <ul className="space-y-2">
                {weekData.warnings.map((sign, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                    {sign}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-red-600 font-medium">{t("visitCenter")}</p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Component: Pregnancy guide (original, with due-date setup)
// ═════════════════════════════════════════════════════════════════════════════
function PregnancyGuideView() {
  const { t, simpleMode } = useLanguage();
  const { profile, saveProfile, currentWeek, daysLeft, trimester, progress } = usePregnancyProfile();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [setupName, setSetupName] = useState(profile.name);
  const [setupDueDate, setSetupDueDate] = useState(profile.dueDate);
  const [setupRegion, setSetupRegion] = useState(profile.region);

  const weekData = WEEK_DATA[selectedWeek - 1];

  const handleSave = () => {
    if (setupDueDate) {
      saveProfile({ name: setupName, dueDate: setupDueDate, region: setupRegion });
    }
  };

  // Setup screen — only for pregnancy
  if (!profile.isSetup) {
    return (
      <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
        <div className="container py-16 max-w-lg">
          <ScrollReveal>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t("profileSetup")}</h1>
              <p className="mt-2 text-muted-foreground text-sm">{t("enterDueDate")}</p>
            </div>
          </ScrollReveal>
          <div className="space-y-4 bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("name")}</label>
              <input
                type="text"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("dueDate")}</label>
              <input
                type="date"
                value={setupDueDate}
                onChange={(e) => setSetupDueDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">{t("region")}</label>
              <select
                value={setupRegion}
                onChange={(e) => setSetupRegion(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="north">{t("northIndia")}</option>
                <option value="south">{t("southIndia")}</option>
                <option value="east">{t("eastIndia")}</option>
                <option value="west">{t("westIndia")}</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={!setupDueDate}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {t("save")} →
            </button>
          </div>
        </div>
      </main>
    );
  }

  const trimesterLabel = trimester === 1 ? t("firstTrimester") : trimester === 2 ? t("secondTrimester") : t("thirdTrimester");
  const getFetalMetrics = (week: number) => {
    if (week >= 37) return { weight: "3.2 - 3.6 kg", length: "48 - 52 cm", summary: "Fully developed and ready for delivery." };
    if (week >= 28) return { weight: "1.0 - 2.9 kg", length: "35 - 47 cm", summary: "Rapid growth with maturity of lungs and brain." };
    if (week >= 13) return { weight: "0.02 - 0.9 kg", length: "9 - 34 cm", summary: "Steady structural growth and organ development." };
    return { weight: "< 0.02 kg", length: "< 9 cm", summary: "Early organ formation and foundational development." };
  };
  const fetal = getFetalMetrics(selectedWeek);

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* Progress header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-5">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{trimesterLabel}</p>
                <h1 className="text-2xl font-bold mt-1">
                  {t("yourWeek")} {selectedWeek} <span className="text-muted-foreground font-normal text-lg">/ 40</span>
                </h1>
                {profile.name && <p className="text-sm text-muted-foreground mt-0.5">{profile.name}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{daysLeft}</p>
                  <p className="text-xs text-muted-foreground">{t("daysRemaining")}</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progress}%</div>
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Week navigator */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
            disabled={selectedWeek <= 1}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Fetal Development Overview</p>
            <p className="text-sm font-semibold">Week {selectedWeek} status</p>
          </div>
          <button
            onClick={() => setSelectedWeek(Math.min(40, selectedWeek + 1))}
            disabled={selectedWeek >= 40}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium bg-muted hover:bg-muted/80 transition-colors disabled:opacity-30"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-all duration-150 ${
                w === selectedWeek
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : w === currentWeek
                  ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Week content */}
      {weekData && (
        <div className="container pb-12">
          <div className="grid gap-4 md:grid-cols-2">
            <ScrollReveal>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-lavender/70 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-foreground/80" />
                  </div>
                  <h3 className="font-semibold text-sm">Fetal Development Overview</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-[11px] text-muted-foreground">Average Weight</p>
                    <p className="mt-1 text-sm font-semibold inline-flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-primary" /> {fetal.weight}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-[11px] text-muted-foreground">Average Length</p>
                    <p className="mt-1 text-sm font-semibold inline-flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-primary" /> {fetal.length}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{fetal.summary}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{weekData.development}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-peach flex items-center justify-center">
                    <Heart className="w-4 h-4 text-peach-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("whatMomFeels")}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{weekData.momFeels}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center">
                    <Apple className="w-4 h-4 text-mint-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("nutritionTips")}</h3>
                </div>
                <ul className="space-y-1.5">
                  {weekData.nutritionTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={240}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-baby-blue flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-baby-blue-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("hygieneTips")}</h3>
                </div>
                <ul className="space-y-1.5">
                  {weekData.hygieneTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={320}>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center">
                    <Activity className="w-4 h-4 text-mint-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("activityTips")}</h3>
                </div>
                <ul className="space-y-1.5">
                  {weekData.activityTips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="rounded-xl border-2 border-red-200 bg-red-50/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-red-800">{t("warningSigns")}</h3>
                </div>
                <ul className="space-y-1.5">
                  {weekData.warningSigns.map((sign, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                      {sign}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-red-600 font-medium">{t("visitCenter")}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      <SafetyDisclaimer />
    </main>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main export — routes to the correct guide based on life stage
// ═════════════════════════════════════════════════════════════════════════════
export default function WeeklyGuide() {
  const { mode } = useEffectiveLifeStage();

  if (mode === "pregnancy") {
    return <PregnancyGuideView />;
  }

  return <PhaseGuideView mode={mode} />;
}
