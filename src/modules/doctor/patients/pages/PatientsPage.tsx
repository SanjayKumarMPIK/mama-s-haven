import { useState } from "react";
import { Search, Users, AlertTriangle, Activity, Baby, X, Clock, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePatientsData, type Patient } from "../hooks/usePatientsData";

const riskBadge: Record<string, string> = {
  Low: "bg-green-100 text-green-700",
  Moderate: "bg-orange-100 text-orange-700",
  High: "bg-red-100 text-red-700",
};

const phaseStage = (p: Patient) => {
  if (p.phase === "Maternity" && p.trimester && p.pregnancyWeek) {
    return `Trimester ${p.trimester} · Week ${p.pregnancyWeek}`;
  }
  if (p.phase === "Postpartum" && p.pregnancyWeek) {
    return `Postpartum · Week ${p.pregnancyWeek}`;
  }
  return p.phase;
};

export default function PatientsPage() {
  const { patients, stats, search, setSearch, phaseFilter, setPhaseFilter, riskFilter, setRiskFilter } = usePatientsData();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Patients</h1>
              <p className="text-teal-100 text-sm">Manage your patient roster</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl shadow-sm border border-slate-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Patients</p>
                <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border border-slate-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">High Risk</p>
                <p className="text-xl font-bold text-slate-800">{stats.highRisk}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border border-slate-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Moderate Risk</p>
                <p className="text-xl font-bold text-slate-800">{stats.moderateRisk}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border border-slate-100">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Baby className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Maternity</p>
                <p className="text-xl font-bold text-slate-800">{stats.maternity}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl shadow-sm border border-slate-100">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-slate-400"
                />
              </div>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">All Phases</option>
                <option value="Maternity">Maternity</option>
                <option value="Postpartum">Postpartum</option>
                <option value="Menopause">Menopause</option>
                <option value="Family Planning">Family Planning</option>
                <option value="Puberty">Puberty</option>
              </select>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="all">All Risk Levels</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {patients.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No patients match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="text-left w-full"
              >
                <Card className={cn(
                  "rounded-xl shadow-sm border border-slate-100 transition-all duration-150",
                  "hover:shadow-md hover:border-teal-200 hover:-translate-y-0.5"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">{patient.name}</h3>
                          <p className="text-xs text-slate-500">{phaseStage(patient)}</p>
                        </div>
                      </div>
                      <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", riskBadge[patient.riskLevel])}>
                        {patient.riskLevel}
                      </span>
                    </div>

                    {patient.recentSymptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {patient.recentSymptoms.map((s) => (
                          <span key={s} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{patient.warningCount} warnings</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{patient.lastActivity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedPatient(null)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">{selectedPatient.name}</h2>
                  <p className="text-xs text-slate-500">{phaseStage(selectedPatient)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Risk Level</p>
                  <span className={cn("text-sm font-semibold px-2 py-0.5 rounded-full", riskBadge[selectedPatient.riskLevel])}>
                    {selectedPatient.riskLevel}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Age</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedPatient.age} years</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Warnings</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedPatient.warningCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium mb-0.5">Last Activity</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedPatient.lastActivity}</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Recent Symptoms
                </h4>
                {selectedPatient.recentSymptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatient.recentSymptoms.map((s) => (
                      <span key={s} className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No recent symptoms reported</p>
                )}
              </div>

              <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">
                <h4 className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Quick Actions
                </h4>
                <div className="flex flex-col gap-2">
                  <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-teal-200 text-sm text-teal-700 font-medium hover:bg-teal-50 transition-colors">
                    <span>View Health Log</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-teal-200 text-sm text-teal-700 font-medium hover:bg-teal-50 transition-colors">
                    <span>View Appointments</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
