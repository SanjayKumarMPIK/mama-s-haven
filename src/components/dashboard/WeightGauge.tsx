import { useEffect, useState } from "react";

/* ── Types ──────────────────────────────────────────────── */

interface WeightGaugeProps {
  bmi: number;
  weight: number;
  height: number;
}

interface BMICategory {
  lines: string[];
  color: string;
}

/* ── BMI Categories (Equal Slices layout) ───────────────── */

const CATEGORIES: BMICategory[] = [
  { lines: ["SEVERELY", "UNDERWEIGHT"], color: "#0ea5e9" }, // sky-500
  { lines: ["UNDERWEIGHT"], color: "#38bdf8" },             // sky-400
  { lines: ["OPTIMAL"], color: "#84cc16" },                 // lime-500
  { lines: ["OVERWEIGHT"], color: "#facc15" },              // yellow-400
  { lines: ["OBESE"], color: "#f97316" },                   // orange-500
  { lines: ["SEVERELY", "OBESE"], color: "#ef4444" },       // red-500
];

function getAngleForBmi(bmi: number): number {
  if (bmi < 16) return ((bmi - 10) / 6) * 30; // 10-16
  if (bmi < 18.5) return 30 + ((bmi - 16) / 2.5) * 30; // 16-18.5
  if (bmi < 25) return 60 + ((bmi - 18.5) / 6.5) * 30; // 18.5-25
  if (bmi < 30) return 90 + ((bmi - 25) / 5) * 30; // 25-30
  if (bmi < 35) return 120 + ((bmi - 30) / 5) * 30; // 30-35
  if (bmi <= 45) return 150 + ((bmi - 35) / 10) * 30; // 35-45
  return 180;
}

function getCategoryIndex(bmi: number): number {
  if (bmi < 16) return 0;
  if (bmi < 18.5) return 1;
  if (bmi < 25) return 2;
  if (bmi < 30) return 3;
  if (bmi < 35) return 4;
  return 5;
}

/* ── Stick Figure Icon ─────────────────────────────────── */

function StickFigure({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y + 8})`}>
      <circle cx="0" cy="-20" r="3.5" fill="black" />
      <rect x="-1.5" y="-14" width="3" height="12" fill="black" />
      <rect x="-6" y="-14" width="12" height="3" rx="1.5" fill="black" />
      <rect x="-6" y="-14" width="3" height="10" rx="1" fill="black" />
      <rect x="3" y="-14" width="3" height="10" rx="1" fill="black" />
      <rect x="-3" y="-4" width="3" height="11" rx="1" fill="black" />
      <rect x="0" y="-4" width="3" height="11" rx="1" fill="black" />
    </g>
  );
}

/* ── Semi-circle Solid Gauge ───────────────────────────── */

export default function WeightGauge({ bmi, weight, height }: WeightGaugeProps) {
  const [animatedAngle, setAnimatedAngle] = useState(0);

  const targetAngle = getAngleForBmi(bmi);
  const catIndex = getCategoryIndex(bmi);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1500;
    
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedAngle(eased * targetAngle);
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetAngle]);

  const cx = 300;
  const cy = 250;
  const outerR = 150;
  const innerR = 80;
  const labelRadiusBottom = outerR + 8;
  const labelRadiusTop = outerR + 19;

  function polarToCartesian(angle: number, radius: number) {
    const rads = ((180 - angle) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rads),
      y: cy - radius * Math.sin(rads),
    };
  }

  function describeFilledArc(startAngle: number, endAngle: number) {
    const startOuter = polarToCartesian(startAngle, outerR);
    const endOuter = polarToCartesian(endAngle, outerR);
    const startInner = polarToCartesian(startAngle, innerR);
    const endInner = polarToCartesian(endAngle, innerR);
    
    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 0 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerR} ${innerR} 0 0 0 ${startInner.x} ${startInner.y}`,
      `Z`
    ].join(" ");
  }

  function describeTextPath(startAngle: number, endAngle: number, radius: number) {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  }

  const pointerLength = outerR - 15;
  const pointerTip = polarToCartesian(animatedAngle, pointerLength);
  const pointerBase1 = polarToCartesian(animatedAngle - 90, 10);
  const pointerBase2 = polarToCartesian(animatedAngle + 90, 10);

  return (
    <div className="rounded-3xl p-6 border border-white/60 bg-white/80 shadow-sm flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto flex justify-center">
        <svg width="100%" height="auto" viewBox="0 0 600 290" className="drop-shadow-sm overflow-visible">
          <defs>
            {CATEGORIES.map((_, i) => {
              // Creating a 60-degree rail instead of 30 ensures long words don't clip at the path edges
              const midAngle = (i * 30) + 15;
              const startAngle = midAngle - 30; 
              const endAngle = midAngle + 30; 
              return (
                <g key={`textpaths-${i}`}>
                  <path id={`path-bottom-${i}`} d={describeTextPath(startAngle, endAngle, labelRadiusBottom)} />
                  <path id={`path-top-${i}`} d={describeTextPath(startAngle, endAngle, labelRadiusTop)} />
                </g>
              );
            })}
          </defs>

          {CATEGORIES.map((cat, i) => {
            const startAngle = i * 30;
            const endAngle = i * 30 + 29; // 1 degree gap for blocks
            const midAngle = startAngle + 14.5;
            const iconPos = polarToCartesian(midAngle, (innerR + outerR) / 2);

            return (
              <g key={i}>
                {/* Arc filled segment */}
                <path d={describeFilledArc(startAngle, endAngle)} fill={cat.color} />
                
                {/* Stick figure inside segment */}
                <StickFigure x={iconPos.x} y={iconPos.y} />

                {/* Radially curved label perfectly aligned to path */}
                {cat.lines.map((line, idx) => {
                  const pathId = cat.lines.length === 2
                    ? (idx === 0 ? `path-top-${i}` : `path-bottom-${i}`)
                    : `path-bottom-${i}`;

                  return (
                    <text
                      key={idx}
                      fill="#020617"
                      fontSize="10"
                      fontWeight="800"
                      style={{ letterSpacing: "0.06em" }}
                    >
                      <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
                        {line}
                      </textPath>
                    </text>
                  );
                })}
              </g>
            );
          })}

          {/* Needle / Pointer */}
          <g style={{ filter: "drop-shadow(0px 6px 6px rgba(0,0,0,0.3))" }}>
            <polygon
              points={`${pointerTip.x},${pointerTip.y} ${pointerBase1.x},${pointerBase1.y} ${pointerBase2.x},${pointerBase2.y}`}
              fill="#1e3a8a" // deep navy blue
            />
            <circle cx={cx} cy={cy} r="18" fill="#1e3a8a" />
          </g>
        </svg>
      </div>

      {/* Info Stats */}
      <div className="text-center flex flex-col items-center mt-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-100 bg-white shadow-sm mb-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORIES[catIndex].color }} />
          <span className="text-sm font-bold text-slate-700 tracking-wider">
            {CATEGORIES[catIndex].lines.join(" ")}
          </span>
        </div>
        <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
          BMI {bmi.toFixed(1)}
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 text-sm text-slate-500 font-medium tracking-wide">
          <span>{weight} kg</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span>{height} cm</span>
        </div>
      </div>
    </div>
  );
}
