// ─── Mood Trend Chart ────────────────────────────────────────────────────────
// Smooth line graph showing mood score over the last 7 days

import type { MoodTrendData } from "../useMaternityAnalytics";

interface MoodTrendChartProps {
  data: MoodTrendData[];
}

export default function MoodTrendChart({ data }: MoodTrendChartProps) {
  try {
    if (!data || data.length === 0) {
      return (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          No mood data yet
        </div>
      );
    }

    const hasData = data.some((d) => d.moodScore !== 3);

    if (!hasData) {
      return (
        <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
          No mood data yet
        </div>
      );
    }

    const chartHeight = 130;
    const chartWidth = 300;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    // Generate SVG path with smooth curve
    const points = data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * (chartWidth - paddingLeft - paddingRight);
      const y = chartHeight - paddingBottom - ((d.moodScore - 1) / 2) * (chartHeight - paddingTop - paddingBottom);
      return { x, y };
    });

    // Create smooth curve using cubic bezier
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    // Gradient fill
    const gradientId = "moodGradient";

    return (
      <div className="w-full h-40 relative">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(340, 82%, 52%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(340, 82%, 52%)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {[0, 0.5, 1].map((ratio) => {
            const y = chartHeight - paddingBottom - ratio * (chartHeight - paddingTop - paddingBottom);
            // 0 = Low (value 1), 0.5 = Okay (value 2), 1 = Good (value 3)
            const label = ratio === 0 ? "Low" : ratio === 0.5 ? "Okay" : "Good";
            
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
                <text
                  x={paddingLeft - 5}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="hsl(var(--muted-foreground))"
                  fontWeight="500"
                >
                  {label}
                </text>
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
            MOOD
          </text>

          {/* Fill area under curve */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`}
            fill={`url(#${gradientId})`}
          />

          {/* Smooth trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(340, 82%, 52%)" // pink/rose
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="hsl(340, 82%, 52%)"
              stroke="white"
              strokeWidth="2"
              className="hover:scale-150 transition-transform origin-center cursor-pointer"
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            />
          ))}

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
    console.error("MoodTrendChart error:", error);
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
        Chart error
      </div>
    );
  }
}
