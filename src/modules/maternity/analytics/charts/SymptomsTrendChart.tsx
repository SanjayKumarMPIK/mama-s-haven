// ─── Symptoms Trend Chart ─────────────────────────────────────────────────────
// Pink gradient rectangular bar chart matching reference image 4.
// Bars: tall, rectangular with slight rounded top, pink-to-hotpink gradient.
// Y-axis: numeric even ticks (0, 2, 4, 6). X-axis: date labels.
// Animated bar growth with stagger. Hover tooltip.

import { useEffect, useState, useMemo } from "react";
import type { SymptomTrendData } from "../useMaternityAnalytics";

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const SID = "__symptom-chart-css";
function injectCSS() {
  if (typeof document === "undefined" || document.getElementById(SID)) return;
  const s = document.createElement("style");
  s.id = SID;
  s.textContent = `
    @keyframes sc-fade{0%{opacity:0}100%{opacity:1}}
    @keyframes sc-grow{0%{transform:scaleY(0)}100%{transform:scaleY(1)}}
    @keyframes sc-tip{0%{opacity:0;transform:translateY(6px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @media(prefers-reduced-motion:reduce){.sc-anim{animation:none!important}}
  `;
  document.head.appendChild(s);
}

/* ─── Tooltip ────────────────────────────────────────────────────────────── */
function Tip({ x, y, label, count, cw }: { x: number; y: number; label: string; count: number; cw: number }) {
  const w = 100; const h = 46;
  const tx = Math.min(Math.max(x - w / 2, 4), cw - w - 4);
  const ty = y - h - 10;
  return (
    <g style={{ animation: "sc-tip 200ms cubic-bezier(.34,1.56,.64,1) both" }}>
      <rect x={tx} y={ty} width={w} height={h} rx={10} fill="white" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0 4px 12px rgba(236,72,153,.12))" />
      <text x={tx + w / 2} y={ty + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b" fontFamily="system-ui,sans-serif">{label}</text>
      <text x={tx + w / 2} y={ty + 34} textAnchor="middle" fontSize="10" fontWeight="600" fill="#ec4899" fontFamily="system-ui,sans-serif">{count} symptom{count !== 1 ? "s" : ""}</text>
    </g>
  );
}

/* ─── Chart ──────────────────────────────────────────────────────────────── */
interface Props { data: SymptomTrendData[] }

export default function SymptomsTrendChart({ data }: Props) {
  injectCSS();
  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  const fp = useMemo(() => data?.map(d => `${d.dayLabel}:${d.symptomCount}`).join(","), [data]);
  useEffect(() => { setReady(false); setHovered(null); setKey(k => k + 1); }, [fp]);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, [key]);

  if (!data || data.length === 0 || !data.some(d => d.symptomCount > 0)) {
    return <div className="h-52 flex items-center justify-center text-slate-300 text-sm font-medium">No symptom data yet</div>;
  }

  const W = 700, H = 220, pL = 40, pR = 20, pT = 15, pB = 40;
  const dW = W - pL - pR, dH = H - pT - pB;
  const maxCount = Math.max(...data.map(d => d.symptomCount), 6);

  // Even Y-axis ticks: 0, 2, 4, 6 (matching reference)
  const yTicks: number[] = [];
  for (let v = 0; v <= maxCount; v += 2) yTicks.push(v);
  if (yTicks[yTicks.length - 1] < maxCount) yTicks.push(Math.ceil(maxCount));

  const getY = (v: number) => pT + dH - (v / maxCount) * dH;
  const baseline = pT + dH;

  // Bar layout — moderately thin rectangles
  const slotW = dW / data.length;
  const barW = Math.min(slotW * 0.22, 18);

  return (
    <div className="w-full" style={{ aspectRatio: `${W}/${H}` }} key={key}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        <defs>
          <linearGradient id={`sb${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="1" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Grid + Y-labels */}
        {yTicks.map((val, idx) => {
          const y = getY(val);
          return (
            <g key={val} className="sc-anim" style={{ animation: `sc-fade 350ms ${idx * 60}ms ease-out both` }}>
              <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL + 4} y={y - 6} textAnchor="start" fontSize="11" fill="#94a3b8" fontWeight="600" fontFamily="system-ui,sans-serif">{val}</text>
            </g>
          );
        })}

        {/* Bars — rectangular, top-rounded, flat bottom, grow from bottom */}
        {ready && data.map((d, i) => {
          const cx = pL + slotW * i + slotW / 2;
          const barW = Math.min(slotW * 0.18, 14);
          const bx = cx - barW / 2;
          const barH = Math.max((d.symptomCount / maxCount) * dH, 2);
          const by = baseline - barH;
          const isH = hovered === i;
          const r = barW / 2;

          // Path for bar with rounded top corners and square bottom corners
          const barPath = `
            M ${bx} ${baseline}
            L ${bx} ${by + r}
            Q ${bx} ${by} ${bx + r} ${by}
            L ${bx + barW - r} ${by}
            Q ${bx + barW} ${by} ${bx + barW} ${by + r}
            L ${bx + barW} ${baseline}
            Z
          `;

          if (d.symptomCount === 0) return (
            <g key={i}>
              <text x={cx} y={H - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500" fontFamily="system-ui,sans-serif"
                className="sc-anim" style={{ animation: `sc-fade 300ms ${i * 50 + 300}ms ease-out both` }}>
                {d.dayLabel}
              </text>
            </g>
          );

          return (
            <g key={i}>
              {/* Hover hit area */}
              <rect x={bx - 8} y={pT} width={barW + 16} height={dH + pB} fill="transparent" style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />

              {/* Bar — rectangular with small top radius ONLY */}
              <path
                d={barPath}
                fill={`url(#sb${key})`}
                opacity={isH ? 1 : 0.88}
                className="sc-anim"
                style={{
                  transformOrigin: `${cx}px ${baseline}px`,
                  animation: `sc-grow 500ms ${i * 80}ms cubic-bezier(.25,.46,.45,.94) both`,
                  transition: "opacity 150ms ease",
                }}
              />

              {/* Hover tooltip */}
              {isH && <Tip x={cx} y={by} label={d.dayLabel} count={d.symptomCount} cw={W} />}

              {/* X-axis label */}
              <text x={cx} y={H - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500" fontFamily="system-ui,sans-serif"
                className="sc-anim" style={{ animation: `sc-fade 300ms ${i * 50 + 300}ms ease-out both` }}>
                {d.dayLabel}
              </text>
            </g>
          );
        })}

        {/* X-axis labels for zero-bar days (already rendered above for non-zero) */}
      </svg>
    </div>
  );
}
