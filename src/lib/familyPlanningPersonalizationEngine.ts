/**
 * familyPlanningPersonalizationEngine.ts
 *
 * Pure-function engine that takes the FP profile + cycle data and produces:
 *   1. User segment (first-time / experienced-normal / experienced-csection)
 *   2. Daily guidance card (intent-aware message based on cycle day)
 *   3. Dashboard sections config (which sections to show/hide)
 *   4. Contraception recommendations (for "avoid" users only)
 *   5. Risk level for today
 *   6. Spacing awareness (for users with children / recent birth)
 *
 * All text uses suggestive, non-medical language per safety rules.
 */

import type { FPProfile, FPIntent, CycleRegularity } from "@/hooks/useFamilyPlanningProfile";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserSegment =
  | "first-time"
  | "experienced-normal"
  | "experienced-csection"
  | "recent-birth";

export type RiskLevel = "low" | "moderate" | "high" | "unknown";

export interface DailyGuidance {
  headline: string;
  message: string;
  emoji: string;
  tone: "positive" | "caution" | "neutral" | "info";
}

export interface SpacingAwareness {
  show: boolean;
  title: string;
  message: string;
  emoji: string;
}

export interface ContraceptionCategory {
  id: string;
  icon: string;
  title: string;
  description: string;
  examples: string[];
  warning?: string;
  highlighted?: boolean;
  badge?: string;
}

export interface DashboardConfig {
  showFertilityInsights: boolean;
  showRiskAssessment: boolean;
  showContraception: boolean;
  showSpacing: boolean;
  showEducation: boolean;
  showLifestyle: boolean;
  intentLabel: string;
  intentEmoji: string;
  intentColor: string;
}

export interface PersonalizationResult {
  segment: UserSegment;
  dailyGuidance: DailyGuidance;
  dashboard: DashboardConfig;
  contraception: ContraceptionCategory[];
  riskLevel: RiskLevel;
  spacing: SpacingAwareness;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCycleDay(lastPeriodISO: string, cycleLength: number): number | null {
  if (!lastPeriodISO || cycleLength < 10) return null;
  const lmp = new Date(lastPeriodISO);
  if (isNaN(lmp.getTime())) return null;
  const today = new Date();
  const diffMs = today.getTime() - lmp.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  return (diffDays % cycleLength) + 1;
}

function isInFertileWindow(cycleDay: number, cycleLength: number): boolean {
  const ovulationDay = cycleLength - 14;
  return cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1;
}

function isOvulationDay(cycleDay: number, cycleLength: number): boolean {
  return cycleDay === cycleLength - 14;
}

function getRiskFromCycleDay(cycleDay: number | null, cycleLength: number): RiskLevel {
  if (cycleDay === null) return "unknown";
  if (isOvulationDay(cycleDay, cycleLength)) return "high";
  if (isInFertileWindow(cycleDay, cycleLength)) return "high";
  // Days right around fertile window
  const ovDay = cycleLength - 14;
  if (Math.abs(cycleDay - ovDay) <= 7) return "moderate";
  return "low";
}

// ─── Segment Detection ───────────────────────────────────────────────────────

function detectSegment(profile: FPProfile): UserSegment {
  if (profile.recentChildbirth) return "recent-birth";
  if (!profile.hasChildren || profile.children.length === 0) return "first-time";
  const hasCSection = profile.children.some((c) => c.birthType === "c-section");
  return hasCSection ? "experienced-csection" : "experienced-normal";
}

// ─── Daily Guidance ──────────────────────────────────────────────────────────

function buildDailyGuidance(
  intent: FPIntent,
  riskLevel: RiskLevel,
  cycleDay: number | null,
  cycleLength: number,
  segment: UserSegment,
): DailyGuidance {
  // TTC intent
  if (intent === "ttc") {
    if (riskLevel === "high") {
      return {
        headline: "High Fertility Window",
        message: "This may be your best window — conditions appear favorable for conception.",
        emoji: "🌟",
        tone: "positive",
      };
    }
    if (riskLevel === "moderate") {
      return {
        headline: "Approaching Fertile Window",
        message: "Your fertile window may be approaching. Consider maintaining a healthy routine.",
        emoji: "🌱",
        tone: "info",
      };
    }
    return {
      headline: "Building Phase",
      message: "Focus on nutrition, rest, and overall wellness as your body prepares for the next cycle.",
      emoji: "💪",
      tone: "neutral",
    };
  }

  // Avoid intent
  if (intent === "avoid") {
    if (riskLevel === "high") {
      return {
        headline: "Higher Risk Today",
        message: "Pregnancy risk may be elevated today. You may want to consider protection.",
        emoji: "⚠️",
        tone: "caution",
      };
    }
    if (riskLevel === "moderate") {
      return {
        headline: "Moderate Risk",
        message: "Risk is moderate today. Continue being mindful of your cycle timing.",
        emoji: "🔶",
        tone: "caution",
      };
    }
    return {
      headline: "Lower Risk Today",
      message: "Risk appears lower today, but no day is completely risk-free. Stay informed.",
      emoji: "🟢",
      tone: "neutral",
    };
  }

  // Tracking / neutral
  if (cycleDay !== null) {
    const ovDay = cycleLength - 14;
    if (cycleDay <= 5) {
      return {
        headline: "Menstrual Phase",
        message: "You may be in your menstrual phase. Focus on rest and hydration.",
        emoji: "🩸",
        tone: "info",
      };
    }
    if (cycleDay <= ovDay - 5) {
      return {
        headline: "Follicular Phase",
        message: "Your body is preparing for ovulation. Energy levels may be rising.",
        emoji: "🌿",
        tone: "neutral",
      };
    }
    if (cycleDay <= ovDay + 1) {
      return {
        headline: "Ovulation Window",
        message: "You may be near ovulation. This is a natural part of your cycle.",
        emoji: "✨",
        tone: "info",
      };
    }
    return {
      headline: "Luteal Phase",
      message: "Post-ovulation phase. Some may experience PMS symptoms.",
      emoji: "🌙",
      tone: "neutral",
    };
  }

  return {
    headline: "Track Your Cycle",
    message: "Log your last period date to get personalized daily guidance.",
    emoji: "📅",
    tone: "info",
  };
}

// ─── Dashboard Config ─────────────────────────────────────────────────────────

function buildDashboardConfig(intent: FPIntent, segment: UserSegment): DashboardConfig {
  const base = {
    showLifestyle: true,
    showEducation: true,
    showSpacing: segment === "experienced-csection" || segment === "recent-birth",
  };

  switch (intent) {
    case "ttc":
      return {
        ...base,
        showFertilityInsights: true,
        showRiskAssessment: false,
        showContraception: false,
        intentLabel: "Trying to Conceive",
        intentEmoji: "💕",
        intentColor: "text-rose-600 bg-rose-50 border-rose-200",
      };
    case "avoid":
      return {
        ...base,
        showFertilityInsights: false,
        showRiskAssessment: true,
        showContraception: true,
        intentLabel: "Avoiding Pregnancy",
        intentEmoji: "🛡️",
        intentColor: "text-amber-600 bg-amber-50 border-amber-200",
      };
    default:
      return {
        ...base,
        showFertilityInsights: true,
        showRiskAssessment: false,
        showContraception: false,
        intentLabel: "Cycle Tracking",
        intentEmoji: "📊",
        intentColor: "text-teal-600 bg-teal-50 border-teal-200",
      };
  }
}

// ─── Contraception Categories ─────────────────────────────────────────────────

function buildContraceptionCategories(
  profile: FPProfile,
  riskLevel: RiskLevel,
): ContraceptionCategory[] {
  const isFirstTime = !profile.hasChildren || profile.children.length === 0;
  const isIrregular = profile.cycleRegularity === "irregular";
  const isHighRisk = riskLevel === "high";

  const categories: ContraceptionCategory[] = [
    {
      id: "barrier",
      icon: "🛡️",
      title: "Barrier Methods",
      description: isFirstTime
        ? "These methods create a physical barrier that may help prevent sperm from reaching the egg."
        : "Physical barrier methods that prevent sperm from reaching the egg.",
      examples: ["Condoms (male)", "Female condoms"],
      highlighted: isHighRisk,
      badge: isHighRisk ? "Suggested for today" : undefined,
    },
    {
      id: "hormonal",
      icon: "💊",
      title: "Hormonal Methods",
      description: isFirstTime
        ? "These methods may help regulate hormones to prevent ovulation. A doctor can help you choose."
        : "Regulate hormones to prevent ovulation. Require prescription.",
      examples: ["Oral contraceptive pills", "Patches"],
    },
    {
      id: "longterm",
      icon: "🔒",
      title: "Long-term Methods",
      description: isFirstTime
        ? "These are placed by a healthcare provider and can last for years. Consider discussing with your doctor."
        : "Long-lasting protection that can be reversed when ready.",
      examples: ["IUD (Copper)", "IUD (Hormonal)"],
    },
    {
      id: "natural",
      icon: "📅",
      title: "Natural Methods",
      description: isFirstTime
        ? "Tracking your cycle to identify fertile days. This requires consistency and may be less reliable."
        : "Avoid intercourse during the fertile window based on cycle tracking.",
      examples: ["Cycle tracking", "Basal body temperature"],
      warning: isIrregular
        ? "⚠️ Less reliable for irregular cycles — you may want to consider additional methods."
        : undefined,
    },
  ];

  return categories;
}

// ─── Spacing Awareness ────────────────────────────────────────────────────────

function buildSpacingAwareness(segment: UserSegment): SpacingAwareness {
  if (segment === "recent-birth") {
    return {
      show: true,
      title: "Postpartum Recovery",
      message:
        "After recent childbirth, your body needs time to recover. Healthcare professionals generally suggest waiting before planning the next pregnancy. You may want to discuss timing with your doctor.",
      emoji: "🤱",
    };
  }
  if (segment === "experienced-csection") {
    return {
      show: true,
      title: "C-Section Recovery Awareness",
      message:
        "After a cesarean delivery, adequate spacing between pregnancies may be important for recovery. Consider consulting your healthcare provider about recommended intervals.",
      emoji: "🏥",
    };
  }
  return {
    show: false,
    title: "",
    message: "",
    emoji: "",
  };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function computePersonalization(
  profile: FPProfile,
  lastPeriodISO: string,
  cycleLength: number,
): PersonalizationResult {
  const cycleLengthSafe = cycleLength >= 10 && cycleLength <= 60 ? cycleLength : 28;
  const cycleDay = getCycleDay(lastPeriodISO, cycleLengthSafe);
  const segment = detectSegment(profile);
  const riskLevel = getRiskFromCycleDay(cycleDay, cycleLengthSafe);

  return {
    segment,
    dailyGuidance: buildDailyGuidance(profile.intent, riskLevel, cycleDay, cycleLengthSafe, segment),
    dashboard: buildDashboardConfig(profile.intent, segment),
    contraception: profile.intent === "avoid"
      ? buildContraceptionCategories(profile, riskLevel)
      : [],
    riskLevel,
    spacing: buildSpacingAwareness(segment),
  };
}

export { getCycleDay, isInFertileWindow, isOvulationDay, getRiskFromCycleDay };
