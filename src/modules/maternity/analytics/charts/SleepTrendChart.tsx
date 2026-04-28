// ─── Sleep Trend Chart ───────────────────────────────────────────────────────
// Premium rounded bar chart showing sleep hours over time.
// Y-axis: numeric hours — X-axis: date labels
// Uses gradient purple bars with rounded caps.

import type { SleepTrendData } from "../useMaternityAnalytics";

interface SleepTrendChartProps {
  data: SleepTrendData[];
}

export default function SleepTrendChart({ data }: SleepTrendChartProps) {
  try {
    if (!data || data.length === 0 || !data.some((d) => d.hours > 0)) {
      return (
        <div className="h-52 flex items-center justify-center text-slate-300 text-sm font-medium">
          No sleep data yet
        </div>
      );
    }

    const chartWidth = 700;
    const chartHeight = 220;
    const pL = 50;
    const pR = 20;
    const pT = 20;
    const pB = 40;
    const drawW = chartWidth - pL - pR;
    const drawH = chartHeight - pT - pB;
    const maxHours = Math.max(...data.map((d) => d.hours), 10);

    // Calculate bar dimensions
    const totalSlots = data.length;
    const slotW = drawW / totalSlots;
    const barW = Math.min(slotW * 0.5, 36);

    // Y-axis tick values: 0, mid, max
    const yTicks = [0, Math.round(maxHours / 2), Math.ceil(maxHours)];

    const getY = (hours: number) => pT + drawH - (hours / maxHours) * drawH;

    return (
      <div className="w-full" style={{ aspectRatio: `${chartWidth}/${chartHeight}` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="sleepBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(262, 72%, 58%)" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(262, 72%, 65%)" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Y-axis labels + faint grid lines */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line x1={pL} y1={y} x2={chartWidth - pR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x={pL - 12} y={y + 4} textAnchor="end" fontSize="12" fill="#94a3b8" fontWeight="500" fontFamily="system-ui, sans-serif">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const cx = pL + slotW * i + slotW / 2;
            const bx = cx - barW / 2;
            const barH = (d.hours / maxHours) * drawH;
            const by = pT + drawH - barH;
            return (
              <rect
                key={i}
                x={bx}
                y={by}
                width={barW}
                height={Math.max(barH, 0)}
                rx={barW / 2}
                fill="url(#sleepBarGrad)"
                opacity={d.hours > 0 ? 1 : 0.15}
                className="transition-all duration-200"
              />
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const cx = pL + slotW * i + slotW / 2;
            return (
              <text key={i} x={cx} y={chartHeight - 10} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500" fontFamily="system-ui, sans-serif">
                {d.dayLabel}
              </text>
            );
          })}
        </svg>
      </div>
    );
  } catch (error) {
    console.error("SleepTrendChart error:", error);
    return <div className="h-52 flex items-center justify-center text-slate-300 text-sm">Chart error</div>;
  }
}
