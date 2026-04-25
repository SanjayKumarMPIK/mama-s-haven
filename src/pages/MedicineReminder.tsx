import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import {
  useMedicineReminder,
  type Medicine,
  type DoseLog,
  type DoseStatus,
} from "@/hooks/useMedicineReminder";
import { toast } from "@/components/ui/sonner";
import ScrollReveal from "@/components/ScrollReveal";
import {
  ArrowLeft,
  Pill,
  Plus,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlarmClock,
  Bell,
  BellOff,
  Trash2,
  ChevronDown,
  History,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  Timer,
  Sparkles,
  Edit3,
  Hourglass,
  Save,
  FileText,
} from "lucide-react";
import MaternalTestsTimeline from "@/components/medicine/MaternalTestsTimeline";

// ─── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DoseStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  scheduled: { label: "Upcoming", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       icon: Hourglass },
  taken:     { label: "Taken",    color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  missed:    { label: "Missed",   color: "text-red-700",     bg: "bg-red-50 border-red-200",         icon: XCircle },
  snoozed:   { label: "Snoozed",  color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     icon: AlarmClock },
  pending:   { label: "Take Now", color: "text-purple-700",  bg: "bg-purple-50 border-purple-200",   icon: Clock },
};

function StatusBadge({ status }: { status: DoseStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ─── Notification Banner ────────────────────────────────────────────────────────

function NotificationBanner({
  permission,
  onRequest,
}: {
  permission: NotificationPermission;
  onRequest: () => void;
}) {
  if (permission === "granted") return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 flex items-start gap-4 animate-fadeIn">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
        {permission === "denied" ? (
          <BellOff className="w-5 h-5 text-amber-600" />
        ) : (
          <Bell className="w-5 h-5 text-amber-600" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm text-amber-900">
          {permission === "denied" ? "Notifications Blocked" : "Enable Notifications"}
        </h3>
        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
          {permission === "denied"
            ? "Notifications are blocked. Please enable them in your browser settings to receive care log reminders."
            : "Allow notifications so we can remind you when it's time to take your medicines."}
        </p>
        {permission !== "denied" && (
          <button
            onClick={onRequest}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-sm hover:bg-amber-700 transition-all active:scale-[0.97]"
          >
            <Bell className="w-3.5 h-3.5" />
            Allow Notifications
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Next Dose Countdown ────────────────────────────────────────────────────────

function NextDoseCountdown() {
  const { getNextDose } = useMedicineReminder();
  const [, setTick] = useState(0);

  // Re-render every 30s to update countdown
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const next = getNextDose();
  if (!next) return null;

  const hours = Math.floor(next.minutesUntil / 60);
  const mins = next.minutesUntil % 60;
  const isImminent = next.minutesUntil <= 5;
  const isDue = next.minutesUntil === 0;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
      isDue
        ? "border-purple-300 bg-gradient-to-r from-purple-50 to-violet-50 animate-pulse"
        : isImminent
        ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50"
        : "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
            isDue
              ? "bg-gradient-to-br from-purple-500 to-violet-600"
              : isImminent
              ? "bg-gradient-to-br from-amber-500 to-orange-600"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
          }`}>
            {isDue ? (
              <Pill className="w-5 h-5 text-white animate-bounce" />
            ) : (
              <Timer className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm">
              {isDue ? "Take Now!" : "Next Dose"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {next.medicineName} — {next.dosage}
            </p>
          </div>
        </div>
        <div className="text-right">
          {isDue ? (
            <span className="text-lg font-bold text-purple-700">Due Now</span>
          ) : (
            <>
              <span className={`text-lg font-bold ${isImminent ? "text-amber-700" : "text-blue-700"}`}>
                {hours > 0 ? `${hours}h ` : ""}{mins}m
              </span>
              <p className="text-[10px] text-muted-foreground">at {next.scheduledTime}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Today Stats Bar ────────────────────────────────────────────────────────────

function TodayStatsBar({ stats }: { stats: { taken: number; missed: number; pending: number; snoozed: number; scheduled: number; total: number } }) {
  const activeDoses = stats.taken + stats.missed; // completed doses
  const pct = stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-sm">Today's Progress</h3>
        </div>
        <span className="text-2xl font-bold text-purple-700">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-muted/60 overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? "linear-gradient(135deg, #10b981, #34d399)"
              : "linear-gradient(135deg, #8b5cf6, #a78bfa)",
          }}
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Taken", value: stats.taken, color: "text-emerald-600", dot: "bg-emerald-500" },
          { label: "Pending", value: stats.pending, color: "text-purple-600", dot: "bg-purple-500" },
          { label: "Snoozed", value: stats.snoozed, color: "text-amber-600", dot: "bg-amber-500" },
          { label: "Upcoming", value: stats.scheduled, color: "text-blue-600", dot: "bg-blue-500" },
          { label: "Missed", value: stats.missed, color: "text-red-600", dot: "bg-red-500" },
        ].map((item) => (
          <div key={item.label} className="text-center p-2 rounded-xl bg-muted/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className={`w-2 h-2 rounded-full ${item.dot}`} />
              <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dose Card ──────────────────────────────────────────────────────────────────

function DoseCard({
  log,
  onTake,
  onSnooze,
  onMiss,
  maxSnooze,
}: {
  log: DoseLog;
  onTake: () => void;
  onSnooze: (min: number) => void;
  onMiss: () => void;
  maxSnooze: number;
}) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const cfg = STATUS_CONFIG[log.status];
  const isPending = log.status === "pending";
  const isSnoozed = log.status === "snoozed";
  const isScheduled = log.status === "scheduled";
  const isActionable = isPending || isSnoozed;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 ${
        isPending
          ? "border-purple-200 bg-gradient-to-br from-purple-50/80 to-violet-50/60 shadow-md shadow-purple-100/50 ring-2 ring-purple-200/50"
          : isSnoozed
          ? "border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/60 shadow-md shadow-amber-100/50"
          : isScheduled
          ? "border-blue-100 bg-gradient-to-br from-blue-50/40 to-indigo-50/30 opacity-75"
          : log.status === "taken"
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-red-200 bg-red-50/50"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isPending
                ? "bg-purple-100 animate-pulse"
                : isSnoozed
                ? "bg-amber-100"
                : isScheduled
                ? "bg-blue-100"
                : log.status === "taken"
                ? "bg-emerald-100"
                : "bg-red-100"
            }`}
          >
            <Pill className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div>
            <h4 className="font-bold text-sm">{log.medicineName}</h4>
            <p className="text-xs text-muted-foreground">{log.dosage}</p>
          </div>
        </div>
        <StatusBadge status={log.status} />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <Clock className="w-3.5 h-3.5" />
        <span>Scheduled at <strong>{log.scheduledTime}</strong></span>
        {isSnoozed && log.snoozeUntil && (
          <span className="text-amber-600">
            • Snoozed until {new Date(log.snoozeUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {isSnoozed && (
          <span className="text-amber-600">
            ({log.snoozeCount}/{maxSnooze} snoozes)
          </span>
        )}
      </div>

      {isActionable && (
        <div className="flex items-center gap-2">
          <button
            onClick={onTake}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all active:scale-[0.97]"
          >
            <CheckCircle2 className="w-4 h-4" />
            Take ✅
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
              disabled={log.snoozeCount >= maxSnooze}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-amber-300 text-amber-700 text-sm font-semibold hover:bg-amber-50 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <AlarmClock className="w-4 h-4" />
              Snooze
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSnoozeOptions ? "rotate-180" : ""}`} />
            </button>

            {showSnoozeOptions && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-border bg-card shadow-xl z-20 overflow-hidden animate-scaleIn">
                {[5, 10, 30].map((min) => (
                  <button
                    key={min}
                    onClick={() => { onSnooze(min); setShowSnoozeOptions(false); }}
                    className="w-full px-4 py-2.5 text-sm text-left hover:bg-muted/60 transition-colors flex items-center gap-2"
                  >
                    <Timer className="w-3.5 h-3.5 text-amber-600" />
                    {min} minutes
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onMiss}
            className="inline-flex items-center justify-center px-3 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm hover:bg-red-50 transition-all active:scale-[0.97]"
            title="Mark as missed"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {log.status === "taken" && log.actionTimestamp && (
        <p className="text-xs text-emerald-600 flex items-center gap-1.5 mt-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Taken at {new Date(log.actionTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}

      {log.status === "missed" && (
        <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Dose missed
        </p>
      )}

      {isScheduled && (
        <p className="text-xs text-blue-500 flex items-center gap-1.5 mt-1">
          <Hourglass className="w-3.5 h-3.5" />
          Upcoming — will remind you at scheduled time
        </p>
      )}
    </div>
  );
}

// ─── Add / Edit Medicine Dialog ─────────────────────────────────────────────────

function MedicineFormDialog({
  isOpen,
  onClose,
  onSubmit,
  editData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (med: { name: string; dosage: string; scheduledTimes: string[]; notes: string }) => void;
  editData?: Medicine | null;
}) {
  const [name, setName] = useState(editData?.name || "");
  const [dosage, setDosage] = useState(editData?.dosage || "");
  const [times, setTimes] = useState<string[]>(editData?.scheduledTimes || ["08:00"]);
  const [notes, setNotes] = useState(editData?.notes || "");

  // Reset when editData changes
  useEffect(() => {
    if (isOpen) {
      setName(editData?.name || "");
      setDosage(editData?.dosage || "");
      setTimes(editData?.scheduledTimes || ["08:00"]);
      setNotes(editData?.notes || "");
    }
  }, [isOpen, editData]);

  const addTimeSlot = () => setTimes((prev) => [...prev, "12:00"]);
  const removeTimeSlot = (i: number) => setTimes((prev) => prev.filter((_, idx) => idx !== i));
  const updateTime = (i: number, val: string) =>
    setTimes((prev) => prev.map((t, idx) => (idx === i ? val : t)));

  const handleSubmit = () => {
    if (!name.trim() || !dosage.trim() || times.length === 0) return;
    onSubmit({ name: name.trim(), dosage: dosage.trim(), scheduledTimes: times, notes: notes.trim() });
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!editData;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md mx-auto bg-card rounded-t-3xl sm:rounded-3xl border border-border/60 shadow-2xl p-6 animate-scaleIn max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              isEditing
                ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                : "bg-gradient-to-br from-purple-500 to-violet-600"
            }`}>
              {isEditing ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
            </div>
            <h2 className="text-lg font-bold">{isEditing ? "Edit Medicine" : "Add Medicine"}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Medicine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Folic Acid"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-shadow"
            />
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 5mg, 1 tablet"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-shadow"
            />
          </div>

          {/* Scheduled Times */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Scheduled Times</label>
            <div className="space-y-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-shadow"
                  />
                  {times.length > 1 && (
                    <button
                      onClick={() => removeTimeSlot(i)}
                      className="w-10 h-10 rounded-xl border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addTimeSlot}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another time
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Take after food"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-shadow resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !dosage.trim()}
            className={`w-full py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed text-white ${
              isEditing
                ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                : "bg-gradient-to-r from-purple-600 to-violet-600"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Add Medicine</>}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Medicine List Card ─────────────────────────────────────────────────────────

function MedicineListCard({
  medicine,
  onToggle,
  onDelete,
  onEdit,
}: {
  medicine: Medicine;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        medicine.isActive
          ? "border-border/60 bg-card shadow-sm"
          : "border-border/30 bg-muted/30 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${medicine.isActive ? "bg-purple-100" : "bg-muted/60"}`}>
            <Pill className={`w-4 h-4 ${medicine.isActive ? "text-purple-600" : "text-muted-foreground"}`} />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{medicine.name}</h4>
            <p className="text-xs text-muted-foreground">{medicine.dosage}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            title="Edit medicine"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              medicine.isActive
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {medicine.isActive ? "Active" : "Paused"}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {medicine.scheduledTimes.map((time) => (
          <span
            key={time}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-medium"
          >
            <Clock className="w-3 h-3" />
            {time}
          </span>
        ))}
      </div>

      {medicine.notes && (
        <p className="mt-2 text-xs text-muted-foreground italic">📝 {medicine.notes}</p>
      )}
    </div>
  );
}

// ─── History Section ────────────────────────────────────────────────────────────

function HistorySection({ logs, adherenceRate }: { logs: DoseLog[]; adherenceRate: number }) {
  const [filter, setFilter] = useState<"all" | DoseStatus>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return logs;
    return logs.filter((l) => l.status === filter);
  }, [logs, filter]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, DoseLog[]>();
    for (const log of filtered) {
      const group = map.get(log.scheduledDate) || [];
      group.push(log);
      map.set(log.scheduledDate, group);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <History className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-sm">Medicine History</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
          adherenceRate >= 80
            ? "bg-emerald-50 border-emerald-200"
            : adherenceRate >= 50
            ? "bg-amber-50 border-amber-200"
            : "bg-red-50 border-red-200"
        }`}>
          <TrendingUp className={`w-3.5 h-3.5 ${
            adherenceRate >= 80 ? "text-emerald-600" : adherenceRate >= 50 ? "text-amber-600" : "text-red-600"
          }`} />
          <span className={`text-xs font-bold ${
            adherenceRate >= 80 ? "text-emerald-700" : adherenceRate >= 50 ? "text-amber-700" : "text-red-700"
          }`}>{adherenceRate}% adherence</span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(["all", "taken", "missed", "snoozed", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No history yet</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 sticky top-0 bg-card py-1">
                {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </h4>
              <div className="space-y-1.5">
                {items.map((log) => {
                  const cfg = STATUS_CONFIG[log.status];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={log.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.bg} transition-all`}
                    >
                      <Icon className={`w-4 h-4 ${cfg.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{log.medicineName}</span>
                        <span className="text-xs text-muted-foreground">{log.dosage} • {log.scheduledTime}</span>
                      </div>
                      <StatusBadge status={log.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

type Tab = "today" | "medicines" | "history" | "tests";

export default function MedicineReminder() {
  const { setPhase } = usePhase();
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const {
    medicines,
    notificationPermission,
    addMedicine,
    editMedicine,
    toggleMedicine,
    deleteMedicine,
    markAsTaken,
    snoozeDose,
    markAsMissed,
    getTodayLogs,
    getTodayStats,
    getHistory,
    getAdherenceRate,
    requestNotificationPermission,
    MAX_SNOOZE_COUNT,
  } = useMedicineReminder();

  useEffect(() => {
    setPhase("maternity");
  }, [setPhase]);

  const todayLogs = getTodayLogs();
  const todayStats = getTodayStats();
  const historyLogs = getHistory(30);
  const adherenceRate = getAdherenceRate(30);

  const handleTake = (logId: string, medicineName: string) => {
    markAsTaken(logId);
    toast.success(`${medicineName} marked as taken ✅`, {
      description: "Great job staying on track!",
    });
  };

  const handleSnooze = (logId: string, minutes: number, medicineName: string) => {
    snoozeDose(logId, minutes);
    toast.info(`${medicineName} snoozed for ${minutes} min ⏰`, {
      description: `We'll remind you again in ${minutes} minutes.`,
    });
  };

  const handleMiss = (logId: string, medicineName: string) => {
    markAsMissed(logId);
    toast.error(`${medicineName} marked as missed ⚠️`, {
      description: "Please try not to miss your next dose.",
    });
  };

  const handleAddMedicine = (med: { name: string; dosage: string; scheduledTimes: string[]; notes: string }) => {
    addMedicine(med);
    toast.success(`${med.name} added 💊`, {
      description: `Scheduled at ${med.scheduledTimes.join(", ")}`,
    });
  };

  const handleEditMedicine = (med: { name: string; dosage: string; scheduledTimes: string[]; notes: string }) => {
    if (editingMedicine) {
      editMedicine(editingMedicine.id, med);
      toast.success(`${med.name} updated ✏️`, {
        description: "Medicine details have been saved.",
      });
      setEditingMedicine(null);
    }
  };

  const handleDeleteMedicine = (med: Medicine) => {
    deleteMedicine(med.id);
    toast.error(`${med.name} removed`, {
      description: "Medicine and its pending doses have been deleted.",
    });
  };

  const openEditDialog = (med: Medicine) => {
    setEditingMedicine(med);
    setShowFormDialog(true);
  };

  const closeFormDialog = () => {
    setShowFormDialog(false);
    setEditingMedicine(null);
  };

  const tabs: { key: Tab; label: string; icon: typeof Clock }[] = [
    { key: "today", label: "Today", icon: CalendarDays },
    { key: "medicines", label: "Medicines", icon: Pill },
    { key: "history", label: "History", icon: History },
    { key: "tests", label: "Tests & Scans", icon: FileText },
  ];

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-2xl">
        <ScrollReveal>
          <Link
            to="/maternity"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Maternity
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
              💊 Care Log
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Care <span className="text-gradient-bloom">Log</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Never miss a dose — smart reminders, snooze options, and complete medicine tracking for your pregnancy journey.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-5">
          {/* Notification banner */}
          <ScrollReveal>
            <NotificationBanner
              permission={notificationPermission}
              onRequest={requestNotificationPermission}
            />
          </ScrollReveal>

          {/* Tab bar */}
          <ScrollReveal delay={50}>
            <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-muted/50 border border-border/40">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab.key
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          {/* ─── Today Tab ─── */}
          {activeTab === "today" && (
            <>
              {/* Next Dose Countdown */}
              <ScrollReveal delay={70}>
                <NextDoseCountdown />
              </ScrollReveal>

              <ScrollReveal delay={90}>
                <TodayStatsBar stats={todayStats} />
              </ScrollReveal>

              {todayLogs.length === 0 ? (
                <ScrollReveal delay={120}>
                  <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-purple-300" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">No medicines scheduled today</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {medicines.length === 0
                        ? "Add your first medicine to get started with reminders."
                        : "All clear for today! Your scheduled medicines will appear here."}
                    </p>
                    {medicines.length === 0 && (
                      <button
                        onClick={() => setShowFormDialog(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
                      >
                        <Plus className="w-4 h-4" />
                        Add Medicine
                      </button>
                    )}
                  </div>
                </ScrollReveal>
              ) : (
                <div className="space-y-3">
                  {todayLogs.map((log, i) => (
                    <ScrollReveal key={log.id} delay={120 + i * 50}>
                      <DoseCard
                        log={log}
                        onTake={() => handleTake(log.id, log.medicineName)}
                        onSnooze={(min) => handleSnooze(log.id, min, log.medicineName)}
                        onMiss={() => handleMiss(log.id, log.medicineName)}
                        maxSnooze={MAX_SNOOZE_COUNT}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── Medicines Tab ─── */}
          {activeTab === "medicines" && (
            <>
              <ScrollReveal delay={80}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    {medicines.length} medicine{medicines.length !== 1 ? "s" : ""}
                  </h3>
                  <button
                    onClick={() => { setEditingMedicine(null); setShowFormDialog(true); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add New
                  </button>
                </div>
              </ScrollReveal>

              {medicines.length === 0 ? (
                <ScrollReveal delay={120}>
                  <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/30 p-8 text-center">
                    <Pill className="w-10 h-10 text-purple-300 mx-auto mb-3" />
                    <h3 className="font-bold text-sm mb-1">No medicines added yet</h3>
                    <p className="text-xs text-muted-foreground">
                      Tap "Add New" to start tracking your prescribed medicines.
                    </p>
                  </div>
                </ScrollReveal>
              ) : (
                <div className="space-y-3">
                  {medicines.map((med, i) => (
                    <ScrollReveal key={med.id} delay={120 + i * 50}>
                      <MedicineListCard
                        medicine={med}
                        onToggle={() => toggleMedicine(med.id)}
                        onDelete={() => handleDeleteMedicine(med)}
                        onEdit={() => openEditDialog(med)}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── History Tab ─── */}
          {activeTab === "history" && (
            <ScrollReveal delay={80}>
              <HistorySection logs={historyLogs} adherenceRate={adherenceRate} />
            </ScrollReveal>
          )}

          {/* ─── Tests & Scans Tab ─── */}
          {activeTab === "tests" && (
            <MaternalTestsTimeline />
          )}
        </div>
      </div>

      {/* Add / Edit Medicine Dialog */}
      <MedicineFormDialog
        isOpen={showFormDialog}
        onClose={closeFormDialog}
        onSubmit={editingMedicine ? handleEditMedicine : handleAddMedicine}
        editData={editingMedicine}
      />
    </div>
  );
}
