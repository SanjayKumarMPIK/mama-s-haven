import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export default function NavItem({ to, label, icon: Icon, active, onClick, compact = false }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-gray-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "bg-orange-100 text-orange-600 border-orange-200",
        compact && "px-2 py-1.5 text-xs",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0 text-muted-foreground group-hover:text-orange-600", active && "text-orange-600")} />
      <span>{label}</span>
    </Link>
  );
}
