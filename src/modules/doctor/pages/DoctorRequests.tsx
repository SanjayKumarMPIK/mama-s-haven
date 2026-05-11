import { useState, useCallback, useEffect, useRef } from "react";
import {
  FileText, Clock, CheckCircle2, XCircle, User, Calendar,
  Stethoscope, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDoctorAuth } from "@/modules/doctor/hooks/useDoctorAuth";
import {
  getSupabaseRequestsByDoctor,
  updateSupabaseConnectionStatus,
} from "@/lib/supabaseConnectionStore";
import type { ConnectionRequest, ConnectionStatus } from "@/lib/connectionStore";

const statusConfig: Record<ConnectionStatus, {
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  pending:  { color: "text-amber-700",  bgColor: "bg-amber-50",  icon: Clock },
  accepted: { color: "text-green-700",  bgColor: "bg-green-50",  icon: CheckCircle2 },
  rejected: { color: "text-red-700",    bgColor: "bg-red-50",    icon: XCircle },
};

function formatDate(iso: string): string {
  const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMins < 1)  return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
}

export default function DoctorRequests() {
  const { doctorProfile } = useDoctorAuth();
  const doctorId = doctorProfile?.id ?? "";

  const [requests, setRequests]     = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [activeFilter, setActiveFilter] = useState<ConnectionStatus | "all">("all");
  const mountedRef = useRef(true);

  // ── Fetch from Supabase ───────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!doctorId) return;
    const data = await getSupabaseRequestsByDoctor(doctorId);
    if (mountedRef.current) setRequests(data);
  }, [doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    refresh().finally(() => {
      if (mountedRef.current) setIsLoading(false);
    });

    // Poll every 10 seconds for new requests
    const interval = setInterval(refresh, 10_000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  // ── Accept / Reject ───────────────────────────────────────────────────────
  const handleAccept = useCallback(async (id: string) => {
    await updateSupabaseConnectionStatus(id, "accepted");
    refresh();
  }, [refresh]);

  const handleReject = useCallback(async (id: string) => {
    await updateSupabaseConnectionStatus(id, "rejected");
    refresh();
  }, [refresh]);

  // ── Derived state ─────────────────────────────────────────────────────────
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
                <h1 className="text-2xl font-bold">Patient Requests</h1>
                <p className="text-teal-100 text-sm">Connection requests from patients</p>
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
            {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={activeFilter === f ? "default" : "outline"}
                onClick={() => setActiveFilter(f)}
                className={
                  activeFilter === f
                    ? f === "pending"  ? "bg-amber-600 hover:bg-amber-700"
                    : f === "accepted" ? "bg-green-600 hover:bg-green-700"
                    : f === "rejected" ? "bg-red-600 hover:bg-red-700"
                    : "bg-teal-600 hover:bg-teal-700"
                    : ""
                }
              >
                {f === "all"
                  ? `All (${requests.length})`
                  : `${f.charAt(0).toUpperCase() + f.slice(1)} (${requests.filter((r) => r.status === f).length})`
                }
              </Button>
            ))}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
              <p className="text-sm text-slate-500">Loading requests…</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium">No requests found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {activeFilter === "all"
                    ? "Patients who enter your code will appear here"
                    : `No ${activeFilter} requests`}
                </p>
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
                                <h4 className="text-sm font-semibold text-slate-900">
                                  Connection Request
                                </h4>
                                <Badge className={cn("text-xs border-0", config.bgColor, config.color)}>
                                  {request.status === "accepted" ? "Approved" : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <User className="h-3 w-3 text-slate-400" />
                                <p className="text-xs text-slate-500">{request.patientName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap shrink-0">
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
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </div>
                            {request.pregnancyWeek && (
                              <span className="text-xs text-slate-500">
                                Week {request.pregnancyWeek}
                              </span>
                            )}
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
