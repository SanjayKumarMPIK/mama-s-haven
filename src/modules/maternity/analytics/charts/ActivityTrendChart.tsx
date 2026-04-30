// ─── Activity / Energy Trend Chart ─────────────────────────────────────────
// Premium animated orange bezier curve matching Family Planning reference.
// Features: progressive stroke draw, orange gradient fill, staggered point
//           reveal, hover tooltip, data-change re-animation, reduced-motion.
// Displayed as "ENERGY" tab in the Visual Analytics panel.

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { ActivityTrendData } from "../useMaternityAnalytics";

/* ─── Inject animation CSS once ──────────────────────────────────────────── */
const SID = "__energy-chart-css";
function injectCSS() {
  if (typeof document === "undefined" || document.getElementById(SID)) return;
  const s = document.createElement("style");
  s.id = SID;
  s.textContent = `
    @keyframes ec-fade{0%{opacity:0}100%{opacity:1}}
    @keyframes ec-point{0%{opacity:0;transform:scale(0)}60%{transform:scale(1.25)}100%{opacity:1;transform:scale(1)}}
    @keyframes ec-tip{0%{opacity:0;transform:translateY(6px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes ec-shimmer{0%,100%{opacity:1}50%{opacity:.78}}
    @media(prefers-reduced-motion:reduce){.ec-anim{animation:none!important}}
  `;
  document.head.appendChild(s);
}

/* ─── Tooltip ────────────────────────────────────────────────────────────── */
function Tip({ x, y, label, score, cw }: { x: number; y: number; label: string; score: number; cw: number }) {
  const text = score >= 3 ? "High" : score >= 2 ? "Mid" : "Low";
  const w = 96; const h = 46;
  const tx = Math.min(Math.max(x - w / 2, 4), cw - w - 4);
  const ty = y - h - 16;
  return (
    <g style={{ animation: "ec-tip 200ms cubic-bezier(.34,1.56,.64,1) both" }}>
      <line x1={x} y1={y - 8} x2={x} y2={ty + h} stroke="#f97316" strokeWidth="1" strokeDasharray="3 2" opacity=".3" />
      <rect x={tx} y={ty} width={w} height={h} rx={10} fill="white" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0 4px 12px rgba(249,115,22,.12))" />
      <text x={tx + w / 2} y={ty + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b" fontFamily="system-ui,sans-serif">{label}</text>
      <text x={tx + w / 2} y={ty + 34} textAnchor="middle" fontSize="10" fontWeight="600" fill="#f97316" fontFamily="system-ui,sans-serif">Energy: {text}</text>
    </g>
  );
}

/* ─── Chart ──────────────────────────────────────────────────────────────── */
interface Props { data: ActivityTrendData[] }

export default function ActivityTrendChart({ data }: Props) {
  injectCSS();
  const lineRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  const fp = useMemo(() => data?.map(d => `${d.dayLabel}:${d.activityScore}`).join(","), [data]);
  useEffect(() => { setDrawn(false); setHovered(null); setKey(k => k + 1); }, [fp]);

  if (!data || data.length === 0 || !data.some(d => d.activityLevel !== "low")) {
    return <div className="h-52 flex items-center justify-center text-slate-300 text-sm font-medium">No energy data yet</div>;
  }

  const W = 700, H = 220, pL = 50, pR = 20, pT = 25, pB = 40;
  const dW = W - pL - pR, dH = H - pT - pB;
  const yLabels = [{ l: "High", v: 3 }, { l: "Mid", v: 2 }, { l: "Low", v: 1 }];
  const getY = (s: number) => pT + dH - ((s - 1) / 2) * dH;
  const getX = (i: number) => pL + (i / Math.max(data.length - 1, 1)) * dW;
  const pts = data.map((d, i) => ({ x: getX(i), y: getY(d.activityScore) }));

  // Smooth bezier path
  let pathD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const c = pts[i], n = pts[i + 1];
    const t = (n.x - c.x) * 0.4;
    pathD += ` C ${c.x + t} ${c.y}, ${n.x - t} ${n.y}, ${n.x} ${n.y}`;
  }
  const fillD = `${pathD} L ${pts[pts.length - 1].x} ${pT + dH} L ${pts[0].x} ${pT + dH} Z`;
  const lineColor = "#f97316";
  const fillStart = "#fdba74";

  // Animation orchestration
  const onRef = useCallback((el: SVGPathElement | null) => {
    if (!el) return;
    lineRef.current = el;
    const len = el.getTotalLength();
    setPathLen(len);
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.25,.46,.45,.94)";
      el.style.strokeDashoffset = "0";
      setTimeout(() => setDrawn(true), 1100);
    });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full" style={{ aspectRatio: `${W}/${H}` }} key={key}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        <defs>
          <linearGradient id={`ef${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillStart} stopOpacity=".25" />
            <stop offset="100%" stopColor={fillStart} stopOpacity="0" />
          </linearGradient>
          <filter id="eg"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* Grid + Y-labels */}
        {yLabels.map((yl, idx) => {
          const y = getY(yl.v);
          return (
            <g key={yl.l} className="ec-anim" style={{ animation: `ec-fade 400ms ${idx * 80}ms ease-out both` }}>
              <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL + 4} y={y - 6} textAnchor="start" fontSize="11" fill="#94a3b8" fontWeight="600" fontFamily="system-ui,sans-serif">{yl.l}</text>
            </g>
          );
        })}

        {/* Orange gradient fill */}
        <path d={fillD} fill={`url(#ef${key})`} className="ec-anim" style={{ animation: "ec-fade 1s .8s ease-out both" }} />

        {/* Main orange curve — clean, no dots */}
        <path
          ref={onRef} d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="ec-anim"
          style={{
            strokeDasharray: pathLen || 1000,
            strokeDashoffset: pathLen || 1000,
            transition: "stroke-dashoffset 1.1s cubic-bezier(.25,.46,.45,.94)",
          }}
        />

        {/* Hover zones — invisible, NO circles shown by default */}
        {drawn && pts.map((p, i) => {
          const isH = hovered === i;
          return (
            <g key={i}>
              <rect
                x={i === 0 ? pL - 10 : (pts[i - 1].x + p.x) / 2}
                y={pT - 5}
                width={i === 0 || i === pts.length - 1
                  ? dW / data.length / 2 + 10
                  : (pts[Math.min(i + 1, pts.length - 1)].x - pts[Math.max(i - 1, 0)].x) / 2}
                height={dH + 10}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {isH && (
                <>
                  <circle cx={p.x} cy={p.y} r={5} fill={lineColor} stroke="white" strokeWidth="2" />
                  <Tip x={p.x} y={p.y} label={data[i].dayLabel} score={data[i].activityScore} cw={W} />
                </>
              )}
            </g>
          );
        })}

        {/* X-axis */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={H - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500" fontFamily="system-ui,sans-serif"
            className="ec-anim" style={{ animation: `ec-fade 350ms ${i * 50 + 200}ms ease-out both` }}>
            {d.dayLabel}
          </text>
        ))}
      </svg>
    </div>
  );
}
