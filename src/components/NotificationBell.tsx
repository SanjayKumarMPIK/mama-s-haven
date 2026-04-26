/**
 * NotificationBell.tsx
 *
 * Notification bell component for the header.
 * Shows unread notification badge and opens notification center on click.
 */

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock notification store - replace with actual store when available
const MOCK_UNREAD_COUNT = 3;

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount] = useState(MOCK_UNREAD_COUNT);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
          aria-modal="false"
          aria-label="Notifications"
        >
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {/* Mock notifications - replace with actual data */}
            <div className="p-3 border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer">
              <p className="text-xs font-medium text-foreground">Medicine reminder</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Time to take your prenatal vitamins</p>
              <p className="text-[10px] text-muted-foreground mt-1">2 minutes ago</p>
            </div>
            
            <div className="p-3 border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer">
              <p className="text-xs font-medium text-foreground">Weekly check-in</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Complete your health log for today</p>
              <p className="text-[10px] text-muted-foreground mt-1">1 hour ago</p>
            </div>
            
            <div className="p-3 hover:bg-muted/30 transition-colors cursor-pointer">
              <p className="text-xs font-medium text-foreground">Appointment reminder</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">ANC checkup scheduled for tomorrow</p>
              <p className="text-[10px] text-muted-foreground mt-1">Yesterday</p>
            </div>
          </div>
          
          <div className="p-3 border-t border-border">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
