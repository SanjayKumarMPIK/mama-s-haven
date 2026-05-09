import { CalendarDays, FileText, MessageSquareText, ShieldCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
  to?: string;
  onClick?: () => void;
}

function ActionCard({ icon: Icon, label, description, color, to, onClick }: ActionCardProps) {
  const navigate = useNavigate();
  const colorMap: Record<string, { bg: string; iconBg: string; iconText: string; border: string }> = {
    teal: { bg: "bg-teal-50", iconBg: "bg-teal-100", iconText: "text-teal-600", border: "border-teal-200 hover:border-teal-300 hover:bg-teal-50" },
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", iconText: "text-blue-600", border: "border-blue-200 hover:border-blue-300 hover:bg-blue-50" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", iconText: "text-amber-600", border: "border-amber-200 hover:border-amber-300 hover:bg-amber-50" },
    purple: { bg: "bg-purple-50", iconBg: "bg-purple-100", iconText: "text-purple-600", border: "border-purple-200 hover:border-purple-300 hover:bg-purple-50" },
  };
  const c = colorMap[color] ?? colorMap.teal;

  return (
    <button
      onClick={() => {
        if (onClick) onClick();
        else if (to) navigate(to);
      }}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border ${c.border} transition-all text-left group`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.iconBg}`}>
        <Icon className={`h-5 w-5 ${c.iconText}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      {to && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />}
    </button>
  );
}

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2.5">
        <ActionCard icon={CalendarDays} label="Request Schedule" description="Book and manage appointment requests" color="teal" to="/request-schedule" />
        <ActionCard 
          icon={FileText} 
          label="Doctor Reports" 
          description="View medical records" 
          color="blue" 
          onClick={() => {
            const el = document.getElementById("doctor-reports-section");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
        <ActionCard icon={MessageSquareText} label="Ask Doctor" description="Send health questions and receive guidance" color="amber" to="/ask-doctor" />
        <ActionCard icon={ShieldCheck} label="Connection Status" description="Active & verified" color="purple" to="/connection-status" />
      </div>
    </div>
  );
}
