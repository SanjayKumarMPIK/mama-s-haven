/**
 * familyPlanningToolsEngine.ts
 *
 * Pure-function engine for the Dynamic Tools System.
 * Defines intent-specific tool sets and handles:
 *   - Tool registry with metadata (icon, description, component key)
 *   - Intent-based filtering (TTC / Avoid / Tracking)
 *   - Adaptive prioritization based on cycle-day context
 *   - "More Tools" overflow logic (show top 3–5, rest under expand)
 *   - Daily insight card content per intent
 *
 * Safety: No medical advice, suggestive language only.
 */

import type { FPIntent, CycleRegularity } from "@/hooks/useFamilyPlanningProfile";
import type { RiskLevel } from "@/lib/familyPlanningPersonalizationEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToolId =
  | "fertility-window"
  | "best-days"
  | "cycle-regularity"
  | "ovulation-support"
  | "preparation-tips"
  | "safe-risk-days"
  | "daily-risk"
  | "contraception-guide"
  | "cycle-reliability"
  | "protection-reminder"
  | "basic-calendar"
  | "educational-insights";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  icon: string;            // Emoji icon
  iconBg: string;          // Tailwind bg class for icon container
  iconColor: string;       // Tailwind text class for icon
  gradient: string;        // Tailwind gradient classes for card accent
  borderColor: string;     // Tailwind border class
  intents: FPIntent[];     // Which intents show this tool
  priority: number;        // Base priority (lower = higher importance)
  componentKey: string;    // Key to resolve to the correct React component
}

export interface ResolvedTool extends ToolDefinition {
  /** Effective priority after context adjustments */
  effectivePriority: number;
  /** Whether to highlight this tool today */
  highlighted: boolean;
  /** Short reason for highlight */
  highlightReason?: string;
}

export interface DailyInsight {
  headline: string;
  message: string;
  emoji: string;
  tone: "positive" | "caution" | "neutral" | "info";
  badgeText?: string;
  badgeColor?: string;
}

export interface DynamicToolsResult {
  /** Primary tools shown immediately (top 3–5) */
  primaryTools: ResolvedTool[];
  /** Overflow tools hidden under "More Tools" */
  moreTools: ResolvedTool[];
  /** Total tool count for this intent */
  totalCount: number;
  /** Today's insight card */
  dailyInsight: DailyInsight;
  /** Current intent label */
  intentLabel: string;
  /** Intent mode badge color */
  intentBadge: { text: string; bg: string; border: string; emoji: string };
}

// ─── Tool Registry ────────────────────────────────────────────────────────────

const TOOL_REGISTRY: ToolDefinition[] = [
  // ── TTC Tools ──
  {
    id: "fertility-window",
    name: "Fertility Window Tracker",
    description: "Highlights fertile days and ovulation prediction based on your cycle",
    icon: "🌸",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    gradient: "from-rose-50 to-pink-50",
    borderColor: "border-rose-200",
    intents: ["ttc"],
    priority: 1,
    componentKey: "FertilityWindowTracker",
  },
  {
    id: "best-days",
    name: "Best Days to Try",
    description: "Suggests optimal days for conception based on your cycle data",
    icon: "💕",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    gradient: "from-pink-50 to-fuchsia-50",
    borderColor: "border-pink-200",
    intents: ["ttc"],
    priority: 2,
    componentKey: "BestDaysToTry",
  },
  {
    id: "cycle-regularity",
    name: "Cycle Regularity Analyzer",
    description: "Tracks consistency of cycles to improve prediction accuracy",
    icon: "📊",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    gradient: "from-violet-50 to-purple-50",
    borderColor: "border-violet-200",
    intents: ["ttc"],
    priority: 3,
    componentKey: "CycleRegularityAnalyzer",
  },
  {
    id: "ovulation-support",
    name: "Ovulation Support",
    description: "Track cervical mucus and basal temperature for better predictions",
    icon: "🌡️",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    gradient: "from-sky-50 to-cyan-50",
    borderColor: "border-sky-200",
    intents: ["ttc"],
    priority: 4,
    componentKey: "OvulationSupport",
  },
  {
    id: "preparation-tips",
    name: "Preparation Tips",
    description: "Lifestyle guidance — nutrition, sleep, and stress management",
    icon: "🧘‍♀️",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    gradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    intents: ["ttc"],
    priority: 5,
    componentKey: "PreparationTips",
  },

  // ── Avoid Tools ──
  {
    id: "safe-risk-days",
    name: "Safe vs Risk Days",
    description: "Marks low-risk and high-risk days for pregnancy on your calendar",
    icon: "🛡️",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    gradient: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
    intents: ["avoid"],
    priority: 1,
    componentKey: "SafeRiskDays",
  },
  {
    id: "daily-risk",
    name: "Daily Risk Indicator",
    description: "Shows today's probability level — Low, Medium, or High",
    icon: "⚡",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    gradient: "from-orange-50 to-red-50",
    borderColor: "border-orange-200",
    intents: ["avoid"],
    priority: 2,
    componentKey: "DailyRiskIndicator",
  },
  {
    id: "contraception-guide",
    name: "Contraception Guidance",
    description: "Informational overview of barrier, hormonal, and natural methods",
    icon: "💊",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    gradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
    intents: ["avoid"],
    priority: 3,
    componentKey: "ContraceptionGuidanceTool",
  },
  {
    id: "cycle-reliability",
    name: "Cycle Reliability Indicator",
    description: "Indicates prediction accuracy based on your cycle regularity",
    icon: "📈",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    gradient: "from-teal-50 to-green-50",
    borderColor: "border-teal-200",
    intents: ["avoid"],
    priority: 4,
    componentKey: "CycleReliability",
  },
  {
    id: "protection-reminder",
    name: "Protection Reminder",
    description: "Suggests protection during high-risk days in your cycle",
    icon: "🔔",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    gradient: "from-red-50 to-rose-50",
    borderColor: "border-red-200",
    intents: ["avoid"],
    priority: 5,
    componentKey: "ProtectionReminder",
  },

  // ── Tracking / Neutral Tools ──
  {
    id: "basic-calendar",
    name: "Basic Calendar",
    description: "Simple cycle tracking without strong predictions or alerts",
    icon: "📅",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    gradient: "from-slate-50 to-gray-50",
    borderColor: "border-slate-200",
    intents: ["tracking"],
    priority: 1,
    componentKey: "BasicCalendar",
  },
  {
    id: "educational-insights",
    name: "Educational Insights",
    description: "Basic knowledge about cycles, phases, and reproductive health",
    icon: "📚",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    gradient: "from-indigo-50 to-blue-50",
    borderColor: "border-indigo-200",
    intents: ["tracking"],
    priority: 2,
    componentKey: "EducationalInsights",
  },
];

// ─── Adaptive Prioritization ──────────────────────────────────────────────────

function adjustPriority(
  tool: ToolDefinition,
  riskLevel: RiskLevel,
  cycleDay: number | null,
  cycleLength: number,
  regularity: CycleRegularity,
): { priority: number; highlighted: boolean; reason?: string } {
  let priority = tool.priority;
  let highlighted = false;
  let reason: string | undefined;

  const ovDay = cycleLength - 14;
  const inFertileWindow = cycleDay !== null && cycleDay >= ovDay - 5 && cycleDay <= ovDay + 1;

  // TTC: Boost fertility/best-days during fertile window
  if (tool.id === "fertility-window" && inFertileWindow) {
    priority = 0;
    highlighted = true;
    reason = "You may be in your fertile window today";
  }
  if (tool.id === "best-days" && inFertileWindow) {
    priority = 0;
    highlighted = true;
    reason = "Peak fertility days — this tool is most relevant now";
  }

  // Avoid: Boost risk tools during high-risk
  if (tool.id === "safe-risk-days" && riskLevel === "high") {
    priority = 0;
    highlighted = true;
    reason = "High risk detected today — check your risk days";
  }
  if (tool.id === "daily-risk" && riskLevel === "high") {
    priority = 0;
    highlighted = true;
    reason = "Risk is elevated today";
  }
  if (tool.id === "protection-reminder" && riskLevel === "high") {
    priority = 1;
    highlighted = true;
    reason = "You may want to consider protection today";
  }

  // Irregular cycles → boost reliability tools
  if (tool.id === "cycle-regularity" && regularity === "irregular") {
    priority = Math.max(0, priority - 1);
    highlighted = true;
    reason = "Your cycles are irregular — tracking consistency may help";
  }
  if (tool.id === "cycle-reliability" && regularity === "irregular") {
    priority = Math.max(0, priority - 1);
    highlighted = true;
    reason = "Predictions may be less reliable with irregular cycles";
  }

  return { priority, highlighted, reason };
}

// ─── Daily Insight Builder ────────────────────────────────────────────────────

function buildDailyInsight(
  intent: FPIntent,
  riskLevel: RiskLevel,
  cycleDay: number | null,
  cycleLength: number,
): DailyInsight {
  if (intent === "ttc") {
    if (riskLevel === "high") {
      return {
        headline: "High fertility today",
        message: "This appears to be a favorable time — your fertile window may be open. Consider this a good time to try.",
        emoji: "🌟",
        tone: "positive",
        badgeText: "Fertile Window",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    }
    if (riskLevel === "moderate") {
      return {
        headline: "Fertility is building",
        message: "Your fertile window may be approaching. Maintain a healthy routine and stay prepared.",
        emoji: "🌱",
        tone: "info",
        badgeText: "Approaching",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
      };
    }
    return {
      headline: "Preparation phase",
      message: "Focus on nutrition, rest, and wellness. Your body is naturally preparing for the next cycle.",
      emoji: "💪",
      tone: "neutral",
      badgeText: "Building Phase",
      badgeColor: "bg-slate-100 text-slate-600 border-slate-200",
    };
  }

  if (intent === "avoid") {
    if (riskLevel === "high") {
      return {
        headline: "High risk today",
        message: "Pregnancy risk may be elevated. You may want to consider using protection or avoiding unprotected intercourse.",
        emoji: "⚠️",
        tone: "caution",
        badgeText: "High Risk",
        badgeColor: "bg-red-100 text-red-700 border-red-200",
      };
    }
    if (riskLevel === "moderate") {
      return {
        headline: "Moderate risk today",
        message: "Risk is not at its peak but remains meaningful. Stay mindful of your cycle timing.",
        emoji: "🔶",
        tone: "caution",
        badgeText: "Moderate",
        badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
      };
    }
    return {
      headline: "Lower risk today",
      message: "Risk appears lower today. However, no day is completely risk-free — stay informed.",
      emoji: "🟢",
      tone: "neutral",
      badgeText: "Lower Risk",
      badgeColor: "bg-green-100 text-green-700 border-green-200",
    };
  }

  // Tracking / neutral
  if (cycleDay !== null) {
    const ovDay = cycleLength - 14;
    if (cycleDay <= 5) {
      return {
        headline: "Menstrual phase",
        message: "You may be in your period. Prioritize rest, hydration, and iron-rich foods.",
        emoji: "🩸",
        tone: "info",
        badgeText: `Day ${cycleDay}`,
        badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
      };
    }
    if (cycleDay <= ovDay - 5) {
      return {
        headline: "Follicular phase",
        message: "Your body is preparing for ovulation. Energy levels may be rising naturally.",
        emoji: "🌿",
        tone: "neutral",
        badgeText: `Day ${cycleDay}`,
        badgeColor: "bg-teal-100 text-teal-700 border-teal-200",
      };
    }
    if (cycleDay <= ovDay + 1) {
      return {
        headline: "Ovulation window",
        message: "You may be near ovulation — a natural part of your cycle.",
        emoji: "✨",
        tone: "info",
        badgeText: `Day ${cycleDay}`,
        badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
      };
    }
    return {
      headline: "Luteal phase",
      message: "Post-ovulation phase. Some may notice PMS symptoms — this is normal.",
      emoji: "🌙",
      tone: "neutral",
      badgeText: `Day ${cycleDay}`,
      badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    };
  }

  return {
    headline: "Start tracking",
    message: "Log your last period date to receive personalized daily guidance.",
    emoji: "📅",
    tone: "info",
  };
}

// ─── Intent Badge Config ──────────────────────────────────────────────────────

function getIntentBadge(intent: FPIntent): DynamicToolsResult["intentBadge"] {
  switch (intent) {
    case "ttc":
      return { text: "TTC Mode", bg: "bg-rose-50", border: "border-rose-200", emoji: "💕" };
    case "avoid":
      return { text: "Avoid Mode", bg: "bg-amber-50", border: "border-amber-200", emoji: "🛡️" };
    default:
      return { text: "Neutral Mode", bg: "bg-slate-50", border: "border-slate-200", emoji: "📊" };
  }
}

function getIntentLabel(intent: FPIntent): string {
  switch (intent) {
    case "ttc": return "Trying to Conceive";
    case "avoid": return "Avoiding Pregnancy";
    default: return "Just Tracking";
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Resolves the dynamic tool set for the current user intent and cycle context.
 * Returns primary tools (top 3), more tools (overflow), and today's insight.
 */
export function resolveDynamicTools(
  intent: FPIntent,
  riskLevel: RiskLevel,
  cycleDay: number | null,
  cycleLength: number,
  regularity: CycleRegularity,
  maxPrimary: number = 3,
): DynamicToolsResult {
  // 1. Filter tools by intent
  const intentTools = TOOL_REGISTRY.filter((t) => t.intents.includes(intent));

  // 2. Apply adaptive prioritization
  const resolved: ResolvedTool[] = intentTools.map((tool) => {
    const adj = adjustPriority(tool, riskLevel, cycleDay, cycleLength, regularity);
    return {
      ...tool,
      effectivePriority: adj.priority,
      highlighted: adj.highlighted,
      highlightReason: adj.reason,
    };
  });

  // 3. Sort by effective priority
  resolved.sort((a, b) => a.effectivePriority - b.effectivePriority);

  // 4. Split into primary + overflow
  const primaryTools = resolved.slice(0, maxPrimary);
  const moreTools = resolved.slice(maxPrimary);

  // 5. Build daily insight
  const dailyInsight = buildDailyInsight(intent, riskLevel, cycleDay, cycleLength);

  return {
    primaryTools,
    moreTools,
    totalCount: resolved.length,
    dailyInsight,
    intentLabel: getIntentLabel(intent),
    intentBadge: getIntentBadge(intent),
  };
}

export { TOOL_REGISTRY };
