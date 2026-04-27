// ─── Symptoms Trend Chart ─────────────────────────────────────────────────────
// Line chart showing symptom count over the last 7 days

import type { SymptomTrendData } from "../useMaternityAnalytics";

interface SymptomsTrendChartProps {
  data: SymptomTrendData[];
}

export default function SymptomsTrendChart({ data }: SymptomsTrendChartProps) {
  try {
    if (!data || data.length === 0) {
      return (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          No symptom data yet
        </div>
      );
    }

    const hasData = data.some((d) => d.symptomCount > 0);

    if (!hasData) {
      return (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          No symptom data yet
        </div>
      );
    }

    const maxCount = Math.max(...data.map((d) => d.symptomCount), 5);
    const chartHeight = 130;
    const chartWidth = 300;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    // Generate SVG path
    const points = data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * (chartWidth - paddingLeft - paddingRight);
      const y = chartHeight - paddingBottom - (d.symptomCount / maxCount) * (chartHeight - paddingTop - paddingBottom);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(" L ")}`;

    return (
      <div className="w-full h-40 relative">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - paddingBottom - ratio * (chartHeight - paddingTop - paddingBottom);
            const value = Math.round(ratio * maxCount);
            // Only show 3 labels to avoid clutter
            const showLabel = ratio === 0 || ratio === 0.5 || ratio === 1;
            
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="hsl(var(--muted))"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  opacity="0.3"
                />
                {showLabel && (
                  <text
                    x={paddingLeft - 5}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="hsl(var(--muted-foreground))"
                    fontWeight="500"
                  >
                    {value}
                  </text>
                )}
              </g>
            );
          })}

          {/* Y-axis Title */}
          <text
            x={10}
            y={chartHeight / 2}
            transform={`rotate(-90 10 ${chartHeight / 2})`}
            textAnchor="middle"
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
            fontWeight="bold"
            letterSpacing="0.5"
          >
            SYMPTOMS
          </text>

          {/* Trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(262, 83%, 58%)" // lavender
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = paddingLeft + (i / (data.length - 1)) * (chartWidth - paddingLeft - paddingRight);
            const y = chartHeight - paddingBottom - (d.symptomCount / maxCount) * (chartHeight - paddingTop - paddingBottom);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={d.symptomCount > 0 ? 4 : 2}
                fill={d.symptomCount > 0 ? "hsl(262, 83%, 58%)" : "hsl(var(--muted))"}
                opacity={d.symptomCount > 0 ? 1 : 0.3}
              />
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const x = paddingLeft + (i / (data.length - 1)) * (chartWidth - paddingLeft - paddingRight);
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 5}
                textAnchor="middle"
                fontSize="9"
                fill="hsl(var(--muted-foreground))"
                fontWeight="500"
              >
                {d.dayLabel}
              </text>
            );
          })}
        </svg>
      </div>
    );
  } catch (error) {
    console.error("SymptomsTrendChart error:", error);
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
        Chart error
      </div>
    );
  }
}
