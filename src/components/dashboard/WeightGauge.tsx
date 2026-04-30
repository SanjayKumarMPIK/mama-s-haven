import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Dumbbell, HeartPulse, Scale, Salad, Activity, Stethoscope, Utensils } from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

interface WeightGaugeProps {
  bmi: number;
  weight: number;
  height: number;
  lastWeightUpdate?: number | null; // epoch ms
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

/* ── Staleness check ───────────────────────────────────── */

const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isWeightStale(lastUpdate: number | null | undefined): boolean {
  if (!lastUpdate) return true; // no timestamp = stale
  return Date.now() - lastUpdate > STALE_THRESHOLD_MS;
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

/* ── Weight Management Tips Data ───────────────────────── */

interface TipItem {
  icon: React.ReactNode;
  text: string;
}

const OVERWEIGHT_TIPS: TipItem[] = [
  { icon: <Activity className="w-4 h-4 text-amber-600 shrink-0" />, text: "Increase physical activity — aim for 30 min of brisk walking daily" },
  { icon: <Salad className="w-4 h-4 text-amber-600 shrink-0" />, text: "Reduce processed and high-sugar foods from your diet" },
  { icon: <HeartPulse className="w-4 h-4 text-amber-600 shrink-0" />, text: "Stay hydrated — drink at least 8 glasses of water daily" },
  { icon: <Scale className="w-4 h-4 text-amber-600 shrink-0" />, text: "Track your weight weekly to monitor progress" },
];

const OBESE_TIPS: TipItem[] = [
  { icon: <Salad className="w-4 h-4 text-red-600 shrink-0" />, text: "Follow a balanced, calorie-controlled diet with whole foods" },
  { icon: <Dumbbell className="w-4 h-4 text-red-600 shrink-0" />, text: "Start with safe, guided physical activity — even 15 min helps" },
  { icon: <Activity className="w-4 h-4 text-red-600 shrink-0" />, text: "Reduce sedentary time — take short breaks every hour" },
  { icon: <Stethoscope className="w-4 h-4 text-red-600 shrink-0" />, text: "Consult a healthcare provider for a personalized plan" },
  { icon: <Scale className="w-4 h-4 text-red-600 shrink-0" />, text: "Monitor weight regularly and celebrate small progress" },
];

const UNDERWEIGHT_TIPS: TipItem[] = [
  { icon: <Utensils className="w-4 h-4 text-sky-600 shrink-0" />, text: "Eat calorie-dense foods — nuts, dry fruits, ghee, paneer, and bananas" },
  { icon: <Salad className="w-4 h-4 text-sky-600 shrink-0" />, text: "Include protein-rich foods in every meal — eggs, dal, milk, and curd" },
  { icon: <Activity className="w-4 h-4 text-sky-600 shrink-0" />, text: "Light strength exercises can help build healthy muscle mass" },
  { icon: <HeartPulse className="w-4 h-4 text-sky-600 shrink-0" />, text: "Eat 5–6 smaller meals throughout the day instead of 3 large ones" },
  { icon: <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />, text: "Consult a doctor if weight gain is difficult — rule out underlying causes" },
];

/* ── Semi-circle Solid Gauge ───────────────────────────── */

export default function WeightGauge({ bmi, weight, height, lastWeightUpdate }: WeightGaugeProps) {
  const [animatedAngle, setAnimatedAngle] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const targetAngle = getAngleForBmi(bmi);
  const catIndex = getCategoryIndex(bmi);
  const stale = isWeightStale(lastWeightUpdate);

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

  // Determine which tips to show
  const isUnderweight = bmi < 18.5;
  const isOverweight = bmi >= 25 && bmi < 30;
  const isObese = bmi >= 30;
  const showTips = isUnderweight || isOverweight || isObese;
  const tips = isObese ? OBESE_TIPS : isOverweight ? OVERWEIGHT_TIPS : UNDERWEIGHT_TIPS;
  const tipsTitle = isObese
    ? "Personalized Health Recommendations"
    : isOverweight
    ? "Weight Management Suggestions"
    : "Nutrition Tips for Healthy Weight Gain";
  const tipsAccent = isObese ? "red" : isOverweight ? "amber" : "sky";

  // Staleness message
  const staleDays = lastWeightUpdate
    ? Math.floor((Date.now() - lastWeightUpdate) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-4">
      {/* ── Gauge Card ── */}
      <div className="rounded-3xl p-6 border border-white/60 bg-white/80 shadow-sm flex flex-col items-center justify-center">
        <div className="w-full max-w-xl mx-auto flex justify-center">
          <svg width="100%" height="auto" viewBox="0 0 600 290" className="drop-shadow-sm overflow-visible">
            <defs>
              {CATEGORIES.map((_, i) => {
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
              const endAngle = i * 30 + 29;
              const midAngle = startAngle + 14.5;
              const iconPos = polarToCartesian(midAngle, (innerR + outerR) / 2);

              return (
                <g key={i}>
                  <path d={describeFilledArc(startAngle, endAngle)} fill={cat.color} />
                  <StickFigure x={iconPos.x} y={iconPos.y} />
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
                fill="#1e3a8a"
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

        {/* ── Healthy range message (Normal BMI) ── */}
        {bmi >= 18.5 && bmi < 25 && (
          <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-lime-50 border border-lime-200">
            <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
            <p className="text-sm font-medium text-lime-800">
              You are in a healthy range. Maintain your current lifestyle.
            </p>
          </div>
        )}
      </div>

      {/* ── Feature 1: Smart Weight Update Prompt ── */}
      {stale && !dismissed && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 flex items-start gap-3 animate-in fade-in duration-300">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              Your weight data may be outdated
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {staleDays !== null && staleDays > 0
                ? `Last updated ${staleDays} day${staleDays === 1 ? "" : "s"} ago. `
                : "No update recorded. "}
              Update for more accurate insights.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-sm hover:bg-amber-700 transition-colors"
              >
                Update Weight <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-xs text-amber-600 font-medium hover:text-amber-800 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feature 2: Dynamic Weight-Based Recommendations ── */}
      {showTips && (() => {
        const colors = isObese
          ? { border: "border-red-200", bg: "bg-gradient-to-br from-red-50 to-rose-50", iconBg: "bg-red-100", iconText: "text-red-600", title: "text-red-900", sub: "text-red-600", itemBorder: "border-red-100", itemText: "text-red-800/80", note: "text-red-500" }
          : isOverweight
          ? { border: "border-amber-200", bg: "bg-gradient-to-br from-amber-50 to-yellow-50", iconBg: "bg-amber-100", iconText: "text-amber-600", title: "text-amber-900", sub: "text-amber-600", itemBorder: "border-amber-100", itemText: "text-amber-800/80", note: "text-amber-500" }
          : { border: "border-sky-200", bg: "bg-gradient-to-br from-sky-50 to-cyan-50", iconBg: "bg-sky-100", iconText: "text-sky-600", title: "text-sky-900", sub: "text-sky-600", itemBorder: "border-sky-100", itemText: "text-sky-800/80", note: "text-sky-500" };

        const subtitle = isObese
          ? "Steps to improve your health safely"
          : isOverweight
          ? "Small changes for big results"
          : "Nourish your body for healthy weight gain";

        return (
          <div className={`rounded-2xl border p-5 ${colors.border} ${colors.bg}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}>
                {isUnderweight
                  ? <Utensils className={`w-5 h-5 ${colors.iconText}`} />
                  : <HeartPulse className={`w-5 h-5 ${colors.iconText}`} />}
              </div>
              <div>
                <h3 className={`text-sm font-bold ${colors.title}`}>
                  {tipsTitle}
                </h3>
                <p className={`text-[11px] font-medium ${colors.sub}`}>
                  {subtitle}
                </p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {tips.map((tip, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border shadow-sm bg-white/70 ${colors.itemBorder}`}
                >
                  <span className="mt-0.5">{tip.icon}</span>
                  <p className={`text-sm font-medium leading-snug ${colors.itemText}`}>
                    {tip.text}
                  </p>
                </li>
              ))}
            </ul>

            <p className={`text-[11px] mt-3.5 font-medium ${colors.note}`}>
              These are general wellness suggestions — not medical advice.
            </p>
          </div>
        );
      })()}
    </div>
  );
}
