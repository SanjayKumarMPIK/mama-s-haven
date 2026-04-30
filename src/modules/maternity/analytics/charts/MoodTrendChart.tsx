// ─── Mood Trend Chart ────────────────────────────────────────────────────────
// Clean smooth purple bezier curve — NO visible data points.
// Only shows hover indicator when user hovers a data zone.
// Matches reference: smooth line, Good/Okay/Low Y-axis, date X-axis.

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { MoodTrendData } from "../useMaternityAnalytics";

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const SID = "__mood-chart-css";
function injectCSS() {
  if (typeof document === "undefined" || document.getElementById(SID)) return;
  const s = document.createElement("style");
  s.id = SID;
  s.textContent = `
    @keyframes mc-fade{0%{opacity:0}100%{opacity:1}}
    @keyframes mc-tip{0%{opacity:0;transform:translateY(6px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @media(prefers-reduced-motion:reduce){.mc-anim{animation:none!important}}
  `;
  document.head.appendChild(s);
}

/* ─── Tooltip ────────────────────────────────────────────────────────────── */
function Tip({ x, y, label, score, cw }: { x: number; y: number; label: string; score: number; cw: number }) {
  const text = score >= 3 ? "Good" : score >= 2 ? "Okay" : "Low";
  const w = 96; const h = 46;
  const tx = Math.min(Math.max(x - w / 2, 4), cw - w - 4);
  const ty = y - h - 16;
  return (
    <g style={{ animation: "mc-tip 200ms cubic-bezier(.34,1.56,.64,1) both" }}>
      <line x1={x} y1={y - 6} x2={x} y2={ty + h} stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 2" opacity=".25" />
      <rect x={tx} y={ty} width={w} height={h} rx={10} fill="white" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0 4px 12px rgba(139,92,246,.12))" />
      <text x={tx + w / 2} y={ty + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b" fontFamily="system-ui,sans-serif">{label}</text>
      <text x={tx + w / 2} y={ty + 34} textAnchor="middle" fontSize="10" fontWeight="600" fill="#8b5cf6" fontFamily="system-ui,sans-serif">Mood: {text}</text>
    </g>
  );
}

/* ─── Chart ──────────────────────────────────────────────────────────────── */
interface Props { data: MoodTrendData[] }

export default function MoodTrendChart({ data }: Props) {
  injectCSS();
  const lineRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [key, setKey] = useState(0);

  const fp = useMemo(() => data?.map(d => `${d.dayLabel}:${d.moodScore}`).join(","), [data]);
  useEffect(() => { setDrawn(false); setHovered(null); setKey(k => k + 1); }, [fp]);

  if (!data || data.length === 0 || !data.some(d => d.moodScore !== 3)) {
    return <div className="h-52 flex items-center justify-center text-slate-300 text-sm font-medium">No mood data yet</div>;
  }

  const W = 700, H = 220, pL = 50, pR = 20, pT = 25, pB = 40;
  const dW = W - pL - pR, dH = H - pT - pB;
  const yLabels = [{ l: "Good", v: 3 }, { l: "Okay", v: 2 }, { l: "Low", v: 1 }];
  const getY = (s: number) => pT + dH - ((s - 1) / 2) * dH;

  const normalizeScore = (score: number) => {
    if (score >= 4.5) return 3; // Good/Happy
    if (score >= 3.5) return 2; // Okay/Neutral
    return 1; // Low/Poor
  };

  const getX = (i: number) => pL + (i / Math.max(data.length - 1, 1)) * dW;
  const pts = data.map((d, i) => ({ x: getX(i), y: getY(normalizeScore(d.moodScore)) }));

  // Smooth bezier path
  let pathD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const c = pts[i], n = pts[i + 1];
    const t = (n.x - c.x) * 0.4;
    pathD += ` C ${c.x + t} ${c.y}, ${n.x - t} ${n.y}, ${n.x} ${n.y}`;
  }
  const fillD = `${pathD} L ${pts[pts.length - 1].x} ${pT + dH} L ${pts[0].x} ${pT + dH} Z`;
  const color = "#8b5cf6";

  // Stroke draw animation
  const onRef = useCallback((el: SVGPathElement | null) => {
    if (!el) return;
    lineRef.current = el;
    const len = el.getTotalLength();
    setPathLen(len);
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.2s cubic-bezier(.25,.46,.45,.94)";
      el.style.strokeDashoffset = "0";
      setTimeout(() => setDrawn(true), 1200);
    });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full" style={{ aspectRatio: `${W}/${H}` }} key={key}>
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        <defs>
          <linearGradient id={`mf${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity=".06" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid + Y-labels */}
        {yLabels.map((yl, idx) => {
          const y = getY(yl.v);
          return (
            <g key={yl.l} className="mc-anim" style={{ animation: `mc-fade 400ms ${idx * 80}ms ease-out both` }}>
              <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL + 4} y={y - 6} textAnchor="start" fontSize="11" fill="#94a3b8" fontWeight="600" fontFamily="system-ui,sans-serif">{yl.l}</text>
            </g>
          );
        })}

        {/* Gradient fill — very subtle */}
        <path d={fillD} fill={`url(#mf${key})`} className="mc-anim" style={{ animation: "mc-fade 1s .8s ease-out both" }} />

        {/* Main curve — clean, no dots */}
        <path
          ref={onRef} d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className="mc-anim"
          style={{
            strokeDasharray: pathLen || 1000,
            strokeDashoffset: pathLen || 1000,
            transition: "stroke-dashoffset 1.2s cubic-bezier(.25,.46,.45,.94)",
          }}
        />

        {/* Hover zones — invisible, NO circles shown by default */}
        {drawn && pts.map((p, i) => {
          const isH = hovered === i;
          return (
            <g key={i}>
              {/* Invisible hit area */}
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
              {/* Only show dot on hover */}
              {isH && (
                <>
                  <circle cx={p.x} cy={p.y} r={5} fill={color} stroke="white" strokeWidth="2" />
                  <Tip x={p.x} y={p.y} label={data[i].dayLabel} score={data[i].moodScore} cw={W} />
                </>
              )}
            </g>
          );
        })}

        {/* X-axis */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={H - 12} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500" fontFamily="system-ui,sans-serif"
            className="mc-anim" style={{ animation: `mc-fade 350ms ${i * 50 + 200}ms ease-out both` }}>
            {d.dayLabel}
          </text>
        ))}
      </svg>
    </div>
  );
}
