import { FileText, Clock, CheckCircle2, XCircle, User, Calendar, Stethoscope, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

type RequestStatus = "pending" | "approved" | "rejected";

interface Request {
  id: number;
  type: string;
  patient: string;
  description: string;
  time: string;
  status: RequestStatus;
}

const mockRequests: Request[] = [
  {
    id: 1,
    type: "Appointment",
    patient: "Priya Sharma",
    description: "Requesting appointment reschedule from May 7th to May 9th at 11:00 AM",
    time: "30 minutes ago",
    status: "pending",
  },
  {
    id: 2,
    type: "Prescription Refill",
    patient: "Anita Devi",
    description: "Requesting refill for Iron supplements (prenatal vitamins)",
    time: "1 hour ago",
    status: "pending",
  },
  {
    id: 3,
    type: "Medical Record",
    patient: "Meera Kumari",
    description: "Requesting medical history records for consultation with specialist",
    time: "2 hours ago",
    status: "pending",
  },
  {
    id: 4,
    type: "Appointment",
    patient: "Sunita Patel",
    description: "Requesting urgent appointment for severe hot flashes and sleep issues",
    time: "3 hours ago",
    status: "approved",
  },
  {
    id: 5,
    type: "Lab Test",
    patient: "Rekha Singh",
    description: "Requesting HPV test prior to vaccination scheduled next week",
    time: "5 hours ago",
    status: "approved",
  },
  {
    id: 6,
    type: "Prescription",
    patient: "Kavita Rao",
    description: "Requesting prescription renewal for blood pressure medication",
    time: "Yesterday",
    status: "rejected",
  },
];

const statusConfig: Record<RequestStatus, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { color: "text-amber-700", bgColor: "bg-amber-50", icon: Clock },
  approved: { color: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle2 },
  rejected: { color: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
};

export default function DoctorRequests() {
  const [activeFilter, setActiveFilter] = useState<RequestStatus | "all">("all");

  const filteredRequests = activeFilter === "all"
    ? mockRequests
    : mockRequests.filter(r => r.status === activeFilter);

  const pendingCount = mockRequests.filter(r => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">Requests</h1>
                <p className="text-teal-100 text-sm">Patient requests and approvals</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-amber-400/20 text-white border-0 text-sm px-3 py-1">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              size="sm"
              variant={activeFilter === "all" ? "default" : "outline"}
              onClick={() => setActiveFilter("all")}
              className={activeFilter === "all" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "pending" ? "default" : "outline"}
              onClick={() => setActiveFilter("pending")}
              className={activeFilter === "pending" ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              Pending
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "approved" ? "default" : "outline"}
              onClick={() => setActiveFilter("approved")}
              className={activeFilter === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Approved
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "rejected" ? "default" : "outline"}
              onClick={() => setActiveFilter("rejected")}
              className={activeFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Rejected
            </Button>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No requests found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const config = statusConfig[request.status];
                const Icon = config.icon;
                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", config.bgColor)}>
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-900">{request.type}</h4>
                                <Badge className={cn("text-xs", config.bgColor, config.color, "border-0")}>
                                  {request.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <User className="h-3 w-3 text-slate-400" />
                                <p className="text-xs text-slate-500">{request.patient}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              {request.time}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">{request.description}</p>

                          {request.status === "pending" && (
                            <div className="flex items-center gap-2 mt-3">
                              <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
