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

    const chartHeight = 140;
    const chartWidth = 300;
    const paddingLeft = 30;
    const paddingRight = 10;
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

    const gradientId = "moodGradient";
    // Using a green theme for mood trend based on the reference image
    const moodColor = "hsl(142, 76%, 36%)";

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
              <stop offset="0%" stopColor={moodColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={moodColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis Labels (Emojis) */}
          {/* Note: SVG text with emojis works well in modern browsers */}
          <text x={0} y={paddingTop + 5} fontSize="14" fill="hsl(var(--muted-foreground))" textAnchor="start">😃</text>
          <text x={0} y={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2 + 5} fontSize="14" fill="hsl(var(--muted-foreground))" textAnchor="start">😐</text>
          <text x={0} y={chartHeight - paddingBottom + 5} fontSize="14" fill="hsl(var(--muted-foreground))" textAnchor="start">☹️</text>

          {/* Fill area under curve */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`}
            fill={`url(#${gradientId})`}
          />

          {/* Smooth trend line */}
          <path
            d={pathD}
            fill="none"
            stroke={moodColor}
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
              r={3.5}
              fill={moodColor}
              stroke="white"
              strokeWidth="1.5"
              className="hover:scale-150 transition-transform origin-center cursor-pointer"
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            />
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const x = points[i].x;
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
    console.error("MoodTrendChart error:", error);
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-xs">
        Chart error
      </div>
    );
  }
}
