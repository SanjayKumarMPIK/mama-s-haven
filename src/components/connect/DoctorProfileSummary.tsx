import { Stethoscope, BadgeCheck, CalendarDays } from "lucide-react";

interface DoctorInfo {
  name: string;
  specialty: string;
  hospital: string;
}

interface Props {
  doctor: DoctorInfo | null;
  connectedDate: string;
  onChangeDoctor: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DoctorProfileSummary({ doctor, connectedDate, onChangeDoctor }: Props) {
  const displayName = doctor?.name ?? "Your Doctor";
  const displaySpecialty = doctor?.specialty ?? "Healthcare Provider";
  const displayHospital = doctor?.hospital ?? "Registered Healthcare Facility";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-500" />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md shadow-teal-200/50">
            {getInitials(displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
                <p className="text-sm text-teal-600 font-medium">{displaySpecialty}</p>
                <p className="text-xs text-gray-500 mt-0.5">{displayHospital}</p>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
                <BadgeCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-700">Connected</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Connected since {connectedDate}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onChangeDoctor}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50 transition-all"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          Change Doctor
        </button>
      </div>
    </div>
  );
}
