import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, FileText, ClipboardList, AlertCircle, User, Map, MessageSquareText, Calendar } from "lucide-react";

export const DOCTOR_NAV_ITEMS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/doctor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/patients", label: "Patients", icon: Users },
  { to: "/doctor/history", label: "Reports", icon: FileText },
  { to: "/doctor/schedules", label: "Schedules", icon: ClipboardList },
  { to: "/doctor/alerts", label: "Alerts", icon: AlertCircle },
  { to: "/doctor/hotspots", label: "Hotspots", icon: Map },
  { to: "/doctor/questions", label: "Questions", icon: MessageSquareText },
  { to: "/doctor/calendar", label: "Calendar", icon: Calendar },
  { to: "/doctor/requests", label: "Requests", icon: FileText },
  { to: "/doctor/profile", label: "Profile", icon: User },
];
