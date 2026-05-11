import {
  SCHEME_TYPE_ICONS,
  SCHEME_TYPE_LABELS,
  BADGE_LABELS,
  BADGE_COLORS,
  type Scheme,
} from "./types";

function getTypeGradient(type: Scheme["type"]): string {
  const map: Record<string, string> = {
    financial: "from-emerald-50/80 via-emerald-50/60 to-green-50/40",
    nutrition: "from-amber-50/80 via-amber-50/60 to-orange-50/40",
    insurance: "from-blue-50/80 via-blue-50/60 to-sky-50/40",
    institutional_delivery: "from-purple-50/80 via-purple-50/60 to-violet-50/40",
    healthcare: "from-rose-50/80 via-rose-50/60 to-pink-50/40",
  };
  return map[type] ?? "from-slate-50/80 via-slate-50/60 to-gray-50/40";
}

function getTypeBorder(type: Scheme["type"]): string {
  const map: Record<string, string> = {
    financial: "border-emerald-200 hover:border-emerald-300",
    nutrition: "border-amber-200 hover:border-amber-300",
    insurance: "border-blue-200 hover:border-blue-300",
    institutional_delivery: "border-purple-200 hover:border-purple-300",
    healthcare: "border-rose-200 hover:border-rose-300",
  };
  return map[type] ?? "border-border/60";
}

function getTypeAccent(type: Scheme["type"]): string {
  const map: Record<string, string> = {
    financial: "bg-emerald-500",
    nutrition: "bg-amber-500",
    insurance: "bg-blue-500",
    institutional_delivery: "bg-purple-500",
    healthcare: "bg-rose-500",
  };
  return map[type] ?? "bg-slate-500";
}

export function SchemeCard({ scheme }: { scheme: Scheme }) {
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${getTypeGradient(scheme.type)} ${getTypeBorder(scheme.type)} p-6 shadow-sm hover:shadow-md transition-all duration-200 group`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${getTypeAccent(scheme.type)}/10 flex items-center justify-center text-xl shrink-0 border ${getTypeBorder(scheme.type).split(" ")[0]}`}>
          {SCHEME_TYPE_ICONS[scheme.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {scheme.name}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {scheme.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {scheme.badges.map((badge) => (
              <span
                key={badge}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${BADGE_COLORS[badge]}`}
              >
                {badge === "highly_recommended" && "⭐"}
                {badge === "cash_benefit" && "💵"}
                {badge === "free_delivery" && "🏥"}
                {badge === "nutrition_support" && "🥗"}
                {badge === "transport_support" && "🚐"}
                {BADGE_LABELS[badge]}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-600">
              {SCHEME_TYPE_ICONS[scheme.type]} {SCHEME_TYPE_LABELS[scheme.type]}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-700 mb-1">Benefits</p>
              <ul className="space-y-1">
                {scheme.benefits.slice(0, 3).map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <span className="text-emerald-600 mt-0.5 shrink-0">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-700 mb-0.5">Eligibility</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">{scheme.eligibility}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <span className="text-[10px] font-medium text-slate-400">
              {SCHEME_TYPE_ICONS[scheme.type]} {scheme.state}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-[11px] font-semibold shadow-sm group-hover:shadow-md transition-all">
              Apply / Read More
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
