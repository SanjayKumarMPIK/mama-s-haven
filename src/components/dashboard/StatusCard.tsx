import { AlertTriangle, Battery, Brain, HeartPulse } from "lucide-react";

interface StatusData {
  phase: string;
  energy: string;
  mood: string;
  body: string;
  alerts: string[];
}

interface StatusCardProps {
  data: StatusData;
}

export default function StatusCard({ data }: StatusCardProps) {
  const conditionItems = [
    { label: "Energy", value: data.energy, icon: Battery, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Mood", value: data.mood, icon: Brain, color: "text-violet-600", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { label: "Body", value: data.body, icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  ];

  return (
    <section className="dashboard-section p-5 !bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" aria-labelledby="status-heading">
      <div className="flex justify-between items-center mb-5">
        <h2 id="status-heading" className="dashboard-section-title !mb-0 !text-slate-700">
          <span className="dashboard-section-dot bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Today's Status
        </h2>
        {/* Phase pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 shadow-sm">
          <span className="dashboard-phase-dot bg-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
            {data.phase}
          </span>
        </div>
      </div>

      {/* Today's Condition */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {conditionItems.map((item) => (
          <div
            key={item.label}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl ${item.bg} ${item.border} border transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default`}
          >
            <item.icon className={`w-5 h-5 mb-2 ${item.color}`} />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              {item.label}
            </p>
            <p className={`text-xs font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Risk Alerts */}
      {data.alerts.length > 0 && (
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
          {data.alerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 shrink-0">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs font-semibold text-orange-800 leading-snug">
                {alert}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
