// ─── Activity Trend Chart ─────────────────────────────────────────────────────
// Bar chart showing activity level (low/medium/active) over the last 7 days

import type { ActivityTrendData } from "../useMaternityAnalytics";

interface ActivityTrendChartProps {
  data: ActivityTrendData[];
}

export default function ActivityTrendChart({ data }: ActivityTrendChartProps) {
  try {
    if (!data || data.length === 0) {
      return (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          No activity data yet
        </div>
      );
    }

    const hasData = data.some((d) => d.activityLevel !== "low");

    if (!hasData) {
      return (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          No activity data yet
        </div>
      );
    }

    const chartHeight = 140;
    const chartWidth = 300;
    const paddingLeft = 35;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 25;

    // Convert Activity Score (1=low, 2=med, 3=active) to Y coordinate
    // The image has High at top, Med in middle, Low at bottom.
    // data.activityScore is 1, 2, 3. We will map 3 -> High, 2 -> Med, 1 -> Low.
    const points = data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * (chartWidth - paddingLeft - paddingRight);
      // Map score 1..3 to Y coordinates:
      // Score 3 (High) -> paddingTop
      // Score 1 (Low) -> chartHeight - paddingBottom
      const ratio = (d.activityScore - 1) / 2; // 0 for low, 0.5 for med, 1 for high
      const y = chartHeight - paddingBottom - ratio * (chartHeight - paddingTop - paddingBottom);
      return { x, y };
    });

    const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
    
    // Smooth curve (optional, but image uses straight lines with rounded joints for Energy)
    // Actually the image looks like straight lines with dots.

    const gradientId = "activityGradient";

    return (
      <div className="w-full h-44 relative">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis Labels (High, Med, Low) */}
          <text x={0} y={paddingTop + 4} fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="600">High</text>
          <text x={0} y={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2 + 4} fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="600">Med</text>
          <text x={0} y={chartHeight - paddingBottom + 4} fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="600">Low</text>

          {/* Fill Area */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`}
            fill={`url(#${gradientId})`}
          />

          {/* Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(262, 83%, 58%)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill="hsl(262, 83%, 58%)"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}

          {/* X-axis labels (just the first letter for clean look) */}
          {data.map((d, i) => {
            const x = points[i].x;
            // Use just the first letter (e.g. 'M' for Monday)
            const letter = d.dayLabel.charAt(0).toUpperCase();
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 5}
                textAnchor="middle"
                fontSize="10"
                fill="hsl(var(--muted-foreground))"
                fontWeight="600"
              >
                {letter}
              </text>
            );
          })}
        </svg>
      </div>
    );
  } catch (error) {
    console.error("ActivityTrendChart error:", error);
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
        Chart error
      </div>
    );
  }
}
