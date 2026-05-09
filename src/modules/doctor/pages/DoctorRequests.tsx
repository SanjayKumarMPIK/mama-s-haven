import { useState, useCallback, useEffect, useRef } from "react";
import {
  FileText, Clock, CheckCircle2, XCircle, User, Calendar,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getRequestsByDoctor,
  updateRequestStatus,
  type ConnectionRequest,
  type ConnectionStatus,
} from "@/lib/connectionStore";

const DOCTOR_ID = "doctor-demo-123";

const statusConfig: Record<ConnectionStatus, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { color: "text-amber-700", bgColor: "bg-amber-50", icon: Clock },
  accepted: { color: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle2 },
  rejected: { color: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function DoctorRequests() {
  const [activeFilter, setActiveFilter] = useState<ConnectionStatus | "all">("all");
  const [requests, setRequests] = useState<ConnectionRequest[]>(() =>
    getRequestsByDoctor(DOCTOR_ID),
  );
  const mountedRef = useRef(true);

  const refresh = useCallback(() => {
    if (mountedRef.current) {
      setRequests(getRequestsByDoctor(DOCTOR_ID));
    }
  }, []);

  // Poll for new/changed requests every 5 seconds
  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(refresh, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  const handleAccept = useCallback((id: string) => {
    updateRequestStatus(id, "accepted");
    refresh();
  }, [refresh]);

  const handleReject = useCallback((id: string) => {
    updateRequestStatus(id, "rejected");
    refresh();
  }, [refresh]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filteredRequests = activeFilter === "all"
    ? requests
    : requests.filter((r) => r.status === activeFilter);

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
                <p className="text-teal-100 text-sm">Patient connection requests</p>
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
              All ({requests.length})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "pending" ? "default" : "outline"}
              onClick={() => setActiveFilter("pending")}
              className={activeFilter === "pending" ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "accepted" ? "default" : "outline"}
              onClick={() => setActiveFilter("accepted")}
              className={activeFilter === "accepted" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Accepted ({requests.filter((r) => r.status === "accepted").length})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "rejected" ? "default" : "outline"}
              onClick={() => setActiveFilter("rejected")}
              className={activeFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Rejected ({requests.filter((r) => r.status === "rejected").length})
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
                                <h4 className="text-sm font-semibold text-slate-900">Connection Request</h4>
                                <Badge className={cn("text-xs", config.bgColor, config.color, "border-0")}>
                                  {request.status === "accepted" ? "approved" : request.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <User className="h-3 w-3 text-slate-400" />
                                <p className="text-xs text-slate-500">{request.patientName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {formatDate(request.createdAt)}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Stethoscope className="h-3 w-3" />
                              {request.patientPhase}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(request.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>

                          {request.status === "pending" && (
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                className="h-8 bg-green-600 hover:bg-green-700 text-xs"
                                onClick={() => handleAccept(request.id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => handleReject(request.id)}
                              >
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
