/**
 * NotificationBell.tsx
 *
 * Dynamic notification bell component with maternity phase symptom monitoring.
 * Shows unread notification badge and opens notification center on click.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Bell, X, CheckCheck, AlertTriangle, ClipboardList, Clock, Info, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/hooks/useNotificationStore";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { runMaternityNotificationCheck } from "@/lib/maternitySymptomMonitor";
import type { NotificationType, NotificationSeverity } from "@/lib/notificationTypes";
import SendToDoctorModal from "@/components/notifications/SendToDoctorModal";

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  emergency: AlertTriangle,
  "doctor-alert": Stethoscope,
  recommendation: ClipboardList,
  reminder: Clock,
  informational: Info,
};

const SEVERITY_BG: Record<NotificationSeverity, string> = {
  critical: "bg-red-50 border-red-200",
  high: "bg-orange-50 border-orange-200",
  medium: "bg-amber-50 border-amber-200",
  low: "bg-blue-50 border-blue-200",
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [escalationModal, setEscalationModal] = useState<{ open: boolean; title: string }>({
    open: false,
    title: "",
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, addNotification } = useNotificationStore();
  const { maternityLogs } = useHealthLog();
  const { phase } = usePhase();
  const { activeEDD } = usePregnancyProfile();

  // Run maternity notification check for maternity phase
  useEffect(() => {
    if (phase !== "maternity") return;

    const checkNotifications = () => {
      const newNotifications = runMaternityNotificationCheck(maternityLogs, activeEDD ?? null);
      for (const notification of newNotifications) {
        addNotification(notification);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [phase, maternityLogs, activeEDD, addNotification]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleNotificationClick = useCallback(
    (notification: { id: string; read: boolean; type: NotificationType; title: string; metadata?: { doctorEscalationRecommended?: boolean } }) => {
      if (!notification.read) {
        markAsRead(notification.id);
      }

      if (
        (notification.type === "emergency" || notification.type === "doctor-alert") &&
        notification.metadata?.doctorEscalationRecommended
      ) {
        setEscalationModal({ open: true, title: notification.title });
      }
    },
    [markAsRead]
  );

  const activeNotifications = useMemo(() => {
    return notifications.filter((n) => !n.dismissed);
  }, [notifications]);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-white shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-4 w-4 text-slate-600" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-white shadow-lg z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {activeNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No notifications</p>
              </div>
            ) : (
              activeNotifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] ?? Info;
                const severityClass = SEVERITY_BG[notification.severity] ?? SEVERITY_BG.low;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer",
                      !notification.read && "bg-muted/20"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0 border", severityClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-xs font-medium", !notification.read && "font-semibold")}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                            aria-label="Dismiss notification"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {(notification.type === "emergency" || notification.type === "doctor-alert") &&
                            notification.metadata?.doctorEscalationRecommended && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEscalationModal({ open: true, title: notification.title });
                                }}
                                className="text-[10px] font-medium text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
                              >
                                <Stethoscope className="h-3 w-3" />
                                Send to Doctor
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeNotifications.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-xs font-medium text-primary hover:text-primary/80 transition-colors text-center"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Escalation Modal */}
      <SendToDoctorModal
        open={escalationModal.open}
        onClose={() => setEscalationModal({ open: false, title: "" })}
        notificationTitle={escalationModal.title}
      />
    </div>
  );
}
