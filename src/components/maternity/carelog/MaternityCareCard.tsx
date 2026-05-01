// ─── Maternity Care Card Component ───────────────────────────────────────────────
// Reusable card component for maternity care log modules

import { LucideIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface CareCardData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  to?: string;
  badge?: string;
  badgeColor?: string;
}

interface MaternityCareCardProps {
  data: CareCardData;
  onClick?: () => void;
  route?: string;
  onNavigate?: (route: string) => void;
}

export default function MaternityCareCard({ data, onClick, route, onNavigate }: MaternityCareCardProps) {
  const Icon = data.icon;

  // Single resolved destination: data.to takes priority over route prop
  const resolvedRoute = data.to || route;

  const handleInteraction = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e && 'key' in e && e.key !== 'Enter' && e.key !== ' ') {
      return;
    }

    // Debug log
    console.log("[CareCard] Click:", {
      clickedCard: data.id,
      title: data.title,
      resolvedRoute,
      dataTo: data.to,
      routeProp: route,
    });

    if (resolvedRoute && onNavigate) {
      onNavigate(resolvedRoute);
    } else if (onClick) {
      onClick();
    }
  };

  const handleCtaClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    handleInteraction();
  };

  const CardContent = (
    <>
      {/* Accent bottom border */}
      <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${data.accentColor}`} />

      {/* Icon zone */}
      <div className={`w-16 h-16 rounded-2xl ${data.iconBg} flex items-center justify-center mb-4 shadow-sm`}>
        <Icon className={`w-8 h-8 ${data.iconColor}`} />
      </div>

      {/* Badge if present */}
      {data.badge && (
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${data.badgeColor}`}>
          {data.badge}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold mb-2">{data.title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{data.description}</p>

      {/* Floating CTA button */}
      <div className="absolute bottom-4 right-4 z-10">
        <div 
          role="button"
          tabIndex={0}
          onClick={handleCtaClick}
          onKeyDown={handleCtaClick}
          className={`w-10 h-10 rounded-full ${data.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 cursor-pointer`}
          aria-label={`Go to ${data.title}`}
        >
          <ArrowRight className={`w-5 h-5 ${data.iconColor}`} />
        </div>
      </div>
    </>
  );

  // Use Link for direct navigation if we have a resolved route
  if (resolvedRoute) {
    return (
      <Link
        to={resolvedRoute}
        className="group relative block rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
      >
        {CardContent}
      </Link>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
      className="group relative block w-full text-left rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {CardContent}
    </div>
  );
}
