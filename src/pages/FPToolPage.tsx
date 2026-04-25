/**
 * FPToolPage.tsx
 *
 * Generic wrapper page for individual Family Planning tool routes.
 * Reads the tool ID from the URL, resolves the correct component,
 * and renders it in a full-page layout with back navigation.
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useEffect } from "react";
import { usePhase } from "@/hooks/usePhase";
import ScrollReveal from "@/components/ScrollReveal";

// Tool components
import FertilityWindowTracker from "@/components/familyplanning/FertilityWindowTracker";
import BestDaysToTry from "@/components/familyplanning/BestDaysToTry";
import CycleRegularityAnalyzer from "@/components/familyplanning/CycleRegularityAnalyzer";
import OvulationSupport from "@/components/familyplanning/OvulationSupport";
import PreparationTips from "@/components/familyplanning/PreparationTips";
import SafeRiskDays from "@/components/familyplanning/SafeRiskDays";
import DailyRiskIndicator from "@/components/familyplanning/DailyRiskIndicator";
import ContraceptionGuidanceTool from "@/components/familyplanning/ContraceptionGuidanceTool";
import CycleReliability from "@/components/familyplanning/CycleReliability";
import ProtectionReminder from "@/components/familyplanning/ProtectionReminder";
import BasicCalendar from "@/components/familyplanning/BasicCalendar";
import EducationalInsights from "@/components/familyplanning/EducationalInsights";

interface ToolMeta {
  name: string;
  description: string;
  icon: string;
  gradient: string;
  border: string;
  component: React.ComponentType;
}

const TOOL_MAP: Record<string, ToolMeta> = {
  "fertility-window": {
    name: "Fertility Window Tracker",
    description: "Highlights fertile days and ovulation prediction based on your cycle",
    icon: "🌸",
    gradient: "from-rose-50 to-pink-50",
    border: "border-rose-200",
    component: FertilityWindowTracker,
  },
  "best-days": {
    name: "Best Days to Try",
    description: "Suggests optimal days for conception based on your cycle data",
    icon: "💕",
    gradient: "from-pink-50 to-fuchsia-50",
    border: "border-pink-200",
    component: BestDaysToTry,
  },
  "cycle-regularity": {
    name: "Cycle Regularity Analyzer",
    description: "Tracks consistency of cycles to improve prediction accuracy",
    icon: "📊",
    gradient: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    component: CycleRegularityAnalyzer,
  },
  "ovulation-support": {
    name: "Ovulation Support",
    description: "Track cervical mucus and basal temperature for better predictions",
    icon: "🌡️",
    gradient: "from-sky-50 to-cyan-50",
    border: "border-sky-200",
    component: OvulationSupport,
  },
  "preparation-tips": {
    name: "Preparation Tips",
    description: "Lifestyle guidance — nutrition, sleep, and stress management",
    icon: "🧘‍♀️",
    gradient: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    component: PreparationTips,
  },
  "safe-risk-days": {
    name: "Safe vs Risk Days",
    description: "Marks low-risk and high-risk days for pregnancy on your calendar",
    icon: "🛡️",
    gradient: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    component: SafeRiskDays,
  },
  "daily-risk": {
    name: "Daily Risk Indicator",
    description: "Shows today's probability level — Low, Medium, or High",
    icon: "⚡",
    gradient: "from-orange-50 to-red-50",
    border: "border-orange-200",
    component: DailyRiskIndicator,
  },
  "contraception-guide": {
    name: "Contraception Guidance",
    description: "Informational overview of barrier, hormonal, and natural methods",
    icon: "💊",
    gradient: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    component: ContraceptionGuidanceTool,
  },
  "cycle-reliability": {
    name: "Cycle Reliability Indicator",
    description: "Indicates prediction accuracy based on your cycle regularity",
    icon: "📈",
    gradient: "from-teal-50 to-green-50",
    border: "border-teal-200",
    component: CycleReliability,
  },
  "protection-reminder": {
    name: "Protection Reminder",
    description: "Suggests protection during high-risk days in your cycle",
    icon: "🔔",
    gradient: "from-red-50 to-rose-50",
    border: "border-red-200",
    component: ProtectionReminder,
  },
  "basic-calendar": {
    name: "Basic Calendar",
    description: "Simple cycle tracking without strong predictions or alerts",
    icon: "📅",
    gradient: "from-slate-50 to-gray-50",
    border: "border-slate-200",
    component: BasicCalendar,
  },
  "educational-insights": {
    name: "Educational Insights",
    description: "Basic knowledge about cycles, phases, and reproductive health",
    icon: "📚",
    gradient: "from-indigo-50 to-blue-50",
    border: "border-indigo-200",
    component: EducationalInsights,
  },
};

export default function FPToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const { setPhase } = usePhase();

  useEffect(() => { setPhase("family-planning"); }, [setPhase]);

  const tool = toolId ? TOOL_MAP[toolId] : null;

  if (!tool) {
    return <Navigate to="/tools" replace />;
  }

  const ToolComponent = tool.component;

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-2xl">
        <ScrollReveal>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>

          {/* Tool Header */}
          <div className={`rounded-2xl border bg-gradient-to-br ${tool.gradient} ${tool.border} p-6 mb-8`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 flex items-center justify-center text-3xl shadow-sm">
                {tool.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{tool.name}</h1>
                <p className="text-sm text-slate-600 mt-0.5">{tool.description}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Tool Content */}
        <ScrollReveal delay={80}>
          <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
            <ToolComponent />
          </div>
        </ScrollReveal>

        {/* Disclaimer */}
        <ScrollReveal delay={160}>
          <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              All data is stored locally on your device. This guidance is for awareness only — always consult a healthcare professional for personalized medical advice.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
