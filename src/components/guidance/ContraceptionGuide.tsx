/**
 * ContraceptionGuide.tsx
 *
 * Card-based contraception awareness module for users with "avoid" intent.
 * Shows categorized methods with personalization rules:
 *   - Irregular cycles → natural methods warning
 *   - High-risk days → barrier methods highlighted
 *   - First-time users → simplified explanations
 *   - Experienced users → comparison-style info
 *
 * Safety rules:
 *   - No medical advice, no brand names, no dosage/usage instructions
 *   - Suggestive tone ("You may consider…")
 *   - Disclaimer at bottom
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContraceptionCategory } from "@/lib/familyPlanningPersonalizationEngine";

interface ContraceptionGuideProps {
  categories: ContraceptionCategory[];
  isFirstTime: boolean;
}

function CategoryCard({ category, defaultExpanded = false }: { category: ContraceptionCategory; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 overflow-hidden",
        category.highlighted
          ? "border-amber-300 bg-gradient-to-br from-amber-50/80 to-orange-50/60 shadow-sm shadow-amber-100/50"
          : "border-border/60 bg-card",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="text-2xl shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{category.title}</p>
            {category.badge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[10px] font-semibold text-amber-700">
                ⭐ {category.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{category.description}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          maxHeight: expanded ? "600px" : "0px",
          opacity: expanded ? 1 : 0,
          overflow: "hidden",
        }}
      >
        <div className="px-5 pb-5 pt-1 space-y-3">
          {/* Examples */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Examples</p>
            <div className="flex flex-wrap gap-2">
              {category.examples.map((ex, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-xs font-medium text-foreground"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>

          {/* Warning */}
          {category.warning && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">{category.warning}</p>
            </div>
          )}

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Consult a healthcare professional to understand which method may be suitable for your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContraceptionGuide({ categories, isFirstTime }: ContraceptionGuideProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll ? categories : categories.slice(0, 3);
  const hasMore = categories.length > 3;

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 pb-0 md:pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Contraception Awareness</h2>
            <p className="text-xs text-muted-foreground">
              {isFirstTime
                ? "Learn about different contraception categories to make informed choices"
                : "Methods overview — talk to your doctor for personalized recommendations"}
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-6 md:p-8 pt-5 space-y-3">
        {visibleCategories.map((cat, i) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            defaultExpanded={i === 0 && !!cat.highlighted}
          />
        ))}

        {/* View More */}
        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 rounded-xl border border-dashed border-border hover:border-amber-300 hover:bg-amber-50/30 text-sm font-medium text-muted-foreground hover:text-amber-700 transition-all"
          >
            View More Methods →
          </button>
        )}

        {/* Safety Disclaimer */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            ⚕️ This information is for awareness purposes only. It does not constitute medical advice.
            No brand names or specific dosages are provided. Always consult a qualified healthcare professional
            for personalized contraceptive guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
