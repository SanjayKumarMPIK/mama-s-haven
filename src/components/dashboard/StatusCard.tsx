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
    { label: "Energy", value: data.energy, icon: Battery, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Mood", value: data.mood, icon: Brain, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
    { label: "Body", value: data.body, icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
  ];

  return (
    <section className="dashboard-section" aria-labelledby="status-heading">
      <h2 id="status-heading" className="dashboard-section-title">
        <span className="dashboard-section-dot bg-emerald-400" />
        Status
      </h2>

      {/* Phase pill */}
      <div className="dashboard-phase-pill">
        <span className="dashboard-phase-dot" />
        <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
          {data.phase}
        </span>
      </div>

      {/* Today's Condition */}
      <div className="dashboard-condition-grid">
        {conditionItems.map((item) => (
          <div
            key={item.label}
            className={`dashboard-condition-card ${item.bg} ${item.border}`}
          >
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {item.label}
              </p>
              <p className={`text-sm font-semibold ${item.color}`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Alerts */}
      {data.alerts.length > 0 && (
        <div className="dashboard-alert-container">
          {data.alerts.map((alert, i) => (
            <div key={i} className="dashboard-alert-card">
              <div className="dashboard-alert-icon-wrap">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-amber-900 leading-snug">
                {alert}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
