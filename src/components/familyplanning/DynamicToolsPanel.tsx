/**
 * DynamicToolsPanel.tsx
 *
 * Main orchestrator component for the Dynamic Tools System.
 * Renders tools dynamically based on user intent (TTC / Avoid / Tracking).
 *
 * Features:
 *   - Today's Insight Card (contextual daily guidance)
 *   - Primary tools (top 3, always visible)
 *   - "More Tools" overflow section
 *   - Tool cards with expand/collapse interaction
 *   - Highlighted tools with context reasons
 *   - Switch Mode option
 *   - Smooth animations on intent change
 */

import { useState, useCallback, lazy, Suspense, type ReactNode } from "react";
import { useFamilyPlanningTools } from "@/hooks/useFamilyPlanningTools";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import type { FPIntent } from "@/hooks/useFamilyPlanningProfile";
import type { ResolvedTool, DailyInsight } from "@/lib/familyPlanningToolsEngine";
import { CheckCircle2, Settings2, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";

// ─── Tool Component Registry ─────────────────────────────────────────────────

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

const TOOL_COMPONENTS: Record<string, () => ReactNode> = {
  FertilityWindowTracker: () => <FertilityWindowTracker />,
  BestDaysToTry: () => <BestDaysToTry />,
  CycleRegularityAnalyzer: () => <CycleRegularityAnalyzer />,
  OvulationSupport: () => <OvulationSupport />,
  PreparationTips: () => <PreparationTips />,
  SafeRiskDays: () => <SafeRiskDays />,
  DailyRiskIndicator: () => <DailyRiskIndicator />,
  ContraceptionGuidanceTool: () => <ContraceptionGuidanceTool />,
  CycleReliability: () => <CycleReliability />,
  ProtectionReminder: () => <ProtectionReminder />,
  BasicCalendar: () => <BasicCalendar />,
  EducationalInsights: () => <EducationalInsights />,
};

// ─── Today's Insight Card ─────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: DailyInsight }) {
  const toneStyles = {
    positive: "from-emerald-50 via-teal-50 to-green-50 border-emerald-200",
    caution: "from-amber-50 via-orange-50 to-red-50 border-amber-200",
    neutral: "from-slate-50 via-gray-50 to-zinc-50 border-slate-200",
    info: "from-blue-50 via-sky-50 to-cyan-50 border-blue-200",
  };
  const toneText = {
    positive: "text-emerald-800",
    caution: "text-amber-800",
    neutral: "text-slate-700",
    info: "text-blue-800",
  };

  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br ${toneStyles[insight.tone]} p-5 shadow-sm overflow-hidden`}
    >
      {/* Decorative blob */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/20 blur-xl" />
      <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/15 blur-lg" />

      <div className="relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="text-4xl leading-none mt-0.5">{insight.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Today's Insight
              </p>
              {insight.badgeText && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    insight.badgeColor || "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {insight.badgeText}
                </span>
              )}
            </div>
            <h3 className={`text-lg font-bold ${toneText[insight.tone]} leading-snug`}>
              {insight.headline}
            </h3>
            <p className={`text-sm ${toneText[insight.tone]} leading-relaxed mt-1 opacity-80`}>
              {insight.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tool Card ────────────────────────────────────────────────────────────────

function ToolCard({ tool, defaultExpanded = false }: { tool: ResolvedTool; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const componentRenderer = TOOL_COMPONENTS[tool.componentKey];

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md ${
        tool.highlighted
          ? `bg-gradient-to-br ${tool.gradient} ${tool.borderColor} ring-1 ring-offset-1 ring-current/10`
          : `bg-card border-border/60`
      }`}
      style={{
        animation: "fadeIn 0.4s ease-out both",
      }}
    >
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-muted/10 transition-colors group"
        id={`tool-${tool.id}`}
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105 ${tool.iconBg}`}
        >
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-foreground">{tool.name}</p>
            {tool.highlighted && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[9px] font-bold text-amber-700 animate-pulse">
                ⭐ Relevant Today
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tool.description}</p>
        </div>
        <div className="shrink-0 ml-1">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Highlight reason */}
      {tool.highlighted && tool.highlightReason && !expanded && (
        <div className="px-5 pb-3 -mt-1">
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
            💡 {tool.highlightReason}
          </p>
        </div>
      )}

      {/* Content - expandable */}
      <div
        className="transition-all duration-400 ease-in-out overflow-hidden"
        style={{
          maxHeight: expanded ? "2000px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="px-5 pb-5 pt-1 border-t border-border/30">
          {componentRenderer ? componentRenderer() : (
            <div className="rounded-xl p-4 bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">Tool content loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Intent Switch Modal ──────────────────────────────────────────────────────

function IntentSwitchModal({
  current,
  onSelect,
  onClose,
}: {
  current: FPIntent;
  onSelect: (intent: FPIntent) => void;
  onClose: () => void;
}) {
  const options: { val: FPIntent; emoji: string; label: string; desc: string; gradient: string; border: string }[] = [
    {
      val: "ttc",
      emoji: "💕",
      label: "Trying to Conceive",
      desc: "Fertility window, best days, cycle insights",
      gradient: "from-rose-50 to-pink-50",
      border: "border-rose-200 hover:border-rose-400",
    },
    {
      val: "avoid",
      emoji: "🛡️",
      label: "Avoiding Pregnancy",
      desc: "Risk assessment, safe days, protection guidance",
      gradient: "from-amber-50 to-orange-50",
      border: "border-amber-200 hover:border-amber-400",
    },
    {
      val: "tracking",
      emoji: "📊",
      label: "Just Tracking",
      desc: "Basic calendar and educational content",
      gradient: "from-slate-50 to-gray-50",
      border: "border-slate-200 hover:border-slate-400",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      style={{ animation: "fadeIn 0.2s ease-out" }}
    >
      <div
        className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scaleIn 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Switch Mode</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tools will adapt instantly to your new goal</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Options */}
        <div className="px-6 pb-4 space-y-2.5">
          {options.map((opt) => {
            const isSelected = current === opt.val;
            return (
              <button
                key={opt.val}
                onClick={() => onSelect(opt.val)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 active:scale-[0.98] bg-gradient-to-br ${opt.gradient} ${
                  isSelected
                    ? "border-teal-400 ring-2 ring-teal-200 shadow-sm"
                    : opt.border
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            🔄 Tools will update instantly without page reload. Your data is preserved across mode switches.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function DynamicToolsPanel() {
  const toolsResult = useFamilyPlanningTools();
  const { profile, updateIntent } = useFamilyPlanningProfile();
  const [showMore, setShowMore] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [animateKey, setAnimateKey] = useState(0);

  const handleIntentSwitch = useCallback(
    (newIntent: FPIntent) => {
      updateIntent(newIntent);
      setShowSwitchModal(false);
      setShowMore(false);
      setAnimateKey((k) => k + 1); // Force re-animation
    },
    [updateIntent],
  );

  const { primaryTools, moreTools, dailyInsight, intentLabel, intentBadge, totalCount } = toolsResult;

  return (
    <div key={animateKey} className="space-y-5">
      {/* Intent Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full border px-3.5 py-1.5 ${intentBadge.bg} ${intentBadge.border} text-slate-700 shadow-sm`}
          >
            {intentBadge.emoji} {intentBadge.text}
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            {totalCount} tools available
          </span>
        </div>
        <button
          onClick={() => setShowSwitchModal(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/40 hover:bg-muted/70 px-3 py-1.5 rounded-lg"
          id="switch-mode-btn"
        >
          <Settings2 className="w-3.5 h-3.5" /> Switch Mode
        </button>
      </div>

      {/* Today's Insight Card */}
      <InsightCard insight={dailyInsight} />

      {/* Primary Tools */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Your Tools
        </p>
        <div className="space-y-3">
          {primaryTools.map((tool, i) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              defaultExpanded={i === 0 && tool.highlighted}
            />
          ))}
        </div>
      </div>

      {/* More Tools */}
      {moreTools.length > 0 && (
        <div>
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full py-3 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2"
            id="more-tools-btn"
          >
            {showMore ? (
              <>
                <ChevronUp className="w-4 h-4" /> Hide Extra Tools
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> More Tools ({moreTools.length})
              </>
            )}
          </button>

          {showMore && (
            <div className="space-y-3 mt-3" style={{ animation: "fadeIn 0.3s ease-out" }}>
              {moreTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Intent Switch Modal */}
      {showSwitchModal && (
        <IntentSwitchModal
          current={profile.intent}
          onSelect={handleIntentSwitch}
          onClose={() => setShowSwitchModal(false)}
        />
      )}
    </div>
  );
}
