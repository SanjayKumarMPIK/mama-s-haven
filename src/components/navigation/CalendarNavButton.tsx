/**
 * CalendarNavButton.tsx
 *
 * Reusable calendar navigation button for the global header.
 * Allows users to navigate to the Calendar module from any dashboard.
 * Shows active state when already on calendar route.
 */

import { useNavigate, useLocation } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function CalendarNavButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if current route is calendar
  const isCalendarActive = location.pathname.startsWith("/calendar");

  // Handle click - navigate only if not already on calendar
  const handleClick = () => {
    if (!isCalendarActive) {
      navigate("/calendar");
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={isCalendarActive ? "Calendar (current page)" : "Open Calendar"}
      role="button"
      tabIndex={0}
      className={`
        inline-flex h-9 w-9 items-center justify-center rounded-md border transition-all duration-200
        ${isCalendarActive
          ? "border-violet-300 bg-violet-50 shadow-md"
          : "border-border bg-white shadow-sm hover:bg-slate-50 hover:shadow-md"
        }
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
        focus-visible:ring-offset-2
      `}
    >
      <Calendar 
        className={`
          w-4 h-4 transition-colors
          ${isCalendarActive ? "text-violet-700" : "text-slate-600"}
        `}
      />
    </button>
  );
}
