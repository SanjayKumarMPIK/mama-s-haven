// ─── Sleep Trend Chart ───────────────────────────────────────────────────────
// Vertical bar chart showing sleep hours over the last 7 days

import type { SleepTrendData } from "../useMaternityAnalytics";

interface SleepTrendChartProps {
  data: SleepTrendData[];
}

export default function SleepTrendChart({ data }: SleepTrendChartProps) {
  try {
    if (!data || data.length === 0) {
      return (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          No sleep data yet
        </div>
      );
    }

    const hasData = data.some((d) => d.hours > 0);

    if (!hasData) {
      return (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          No sleep data yet
        </div>
      );
    }

    const maxHours = Math.max(...data.map((d) => d.hours), 8);
    const chartHeight = 140;
    const chartWidth = 300;
    const paddingLeft = 30;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;
    const barWidth = (chartWidth - paddingLeft - paddingRight) / data.length * 0.6;
    const barGap = (chartWidth - paddingLeft - paddingRight) / data.length * 0.4;

    return (
      <div className="w-full h-40 relative">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Y-axis Labels (max, mid, 0) */}
          <text x={0} y={paddingTop + 4} fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="600">{Math.ceil(maxHours)}</text>
          <text x={0} y={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2 + 4} fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="600">{Math.round(maxHours / 2)}</text>
          <text x={0} y={chartHeight - paddingBottom + 4} fontSize="10" fill="hsl(var(--muted-foreground))" fontWeight="600">0</text>

          {/* Bars */}
          {data.map((d, i) => {
            const x = paddingLeft + i * (barWidth + barGap) + barGap / 2;
            const barHeight = (d.hours / maxHours) * (chartHeight - paddingTop - paddingBottom);
            const y = chartHeight - paddingBottom - barHeight;
            
            // Image uses a consistent purple for sleep bars
            const barColor = "hsl(262, 83%, 58%)"; 

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={barWidth / 2}
                  fill={barColor}
                  opacity={d.hours > 0 ? 0.9 : 0.2}
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const x = paddingLeft + i * (barWidth + barGap) + barGap / 2 + barWidth / 2;
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
    console.error("SleepTrendChart error:", error);
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
        Chart error
      </div>
    );
  }
}
