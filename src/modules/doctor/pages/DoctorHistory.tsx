import { History as HistoryIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DoctorHistory() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <HistoryIcon className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Patient History</h1>
              <p className="text-teal-100 text-sm">View patient medical records</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <HistoryIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No History Records</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                History records will appear here. Patient medical history, previous consultations, and treatment records will be displayed when available.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
