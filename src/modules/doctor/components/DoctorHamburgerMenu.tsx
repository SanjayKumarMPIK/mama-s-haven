import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Calendar, History, Bell, Map, AlertCircle, FileText, X, LogOut, Stethoscope, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import NavItem from "@/components/navigation/NavItem";

interface DoctorHamburgerMenuProps {
  open: boolean;
  onClose: () => void;
}

type DoctorMenuItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const DOCTOR_MENU_ITEMS: DoctorMenuItem[] = [
  { to: "/doctor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/calendar", label: "Calendar", icon: Calendar },
  { to: "/doctor/history", label: "History", icon: History },
  { to: "/doctor/notifications", label: "Notifications", icon: Bell },
  { to: "/doctor/alerts", label: "Alerts", icon: AlertCircle },
  { to: "/doctor/requests", label: "Requests", icon: FileText },
  { to: "/doctor/hotspots", label: "Hotspots", icon: Map },
];

export default function DoctorHamburgerMenu({
  open,
  onClose,
}: DoctorHamburgerMenuProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    if (!open) return;

    firstFocusRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const menuContent = (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        aria-hidden
        className={cn(
          "fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        aria-label="Doctor navigation menu"
        className={cn(
          "fixed top-0 right-0 z-[9999] h-full w-80 max-w-[85vw] bg-white border-l border-border",
          "shadow-2xl transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-teal-600" />
            <p className="text-sm font-semibold">Doctor Menu</p>
          </div>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-57px)]">
          <div className="flex-1 overflow-y-auto space-y-5 px-5 py-4">
            {/* Doctor Profile Accordion */}
            {user && (
              <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                <button
                  onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-teal-50 hover:bg-teal-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-lg">
                      {user.name?.charAt(0).toUpperCase() ?? "D"}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">Dr. {user.name ?? "Doctor"}</p>
                      <p className="text-xs text-muted-foreground">Doctor</p>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-200", isProfileExpanded && "rotate-180")} />
                </button>

                <div className={cn("grid transition-all duration-200", isProfileExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="p-2 bg-card border-t border-border space-y-1">
                      <Link
                        to="/doctor/profile"
                        onClick={onClose}
                        className="w-full text-left flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <User className="w-4 h-4 text-teal-600/70" />
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation items */}
            <nav className="space-y-2" aria-label="Doctor navigation">
              {DOCTOR_MENU_ITEMS.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  active={location.pathname === item.to}
                  onClick={onClose}
                />
              ))}
            </nav>
          </div>

          {/* Logout section at bottom */}
          <div className="border-t border-border px-5 py-4">
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold shadow-sm transition-colors hover:bg-slate-50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  return createPortal(menuContent, document.body);
}
