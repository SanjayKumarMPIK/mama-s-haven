// ─── Visual Analytics Split Panel ───────────────────────────────────────────
// Split layout with left menu panel and right chart panel
// STRICTLY isolated to Maternity Phase only

import { useState } from "react";
import VisualAnalyticsMenu from "./VisualAnalyticsMenu";
import { AnalyticsCarousel } from "@/modules/maternity/analytics";
import type { AnalyticsType } from "./VisualAnalyticsMenu";

export default function VisualAnalyticsSplitPanel() {
  const [activeType, setActiveType] = useState<AnalyticsType>("symptoms");

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel: Analytics Menu (28% width on desktop) */}
        <div className="lg:w-[28%] flex-shrink-0">
          <VisualAnalyticsMenu activeType={activeType} onSelect={setActiveType} />
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-border/60 flex-shrink-0" />

        {/* Right Panel: Chart Display (72% width on desktop) */}
        <div className="lg:w-[72%] flex-1 min-w-0">
          <AnalyticsCarousel activeType={activeType} onTypeChange={setActiveType} />
        </div>
      </div>
    </div>
  );
}
