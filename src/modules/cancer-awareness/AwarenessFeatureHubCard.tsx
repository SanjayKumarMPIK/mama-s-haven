import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AwarenessCardData } from "./cancerAwarenessContent";
import { CARD_ICONS } from "./awarenessIcons";

interface AwarenessFeatureHubCardProps {
  card: AwarenessCardData;
  delay?: number;
}

export default function AwarenessFeatureHubCard({ card, delay = 0 }: AwarenessFeatureHubCardProps) {
  const iconConfig = CARD_ICONS[card.id];
  const IconComponent = iconConfig?.icon;

  return (
    <Link
      to={card.route}
      className="group block"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "relative rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          card.borderColor,
          "backdrop-blur-sm",
        )}
      >
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${card.gradient.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').join(', ')})`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-md",
                iconConfig?.gradient && `bg-gradient-to-br ${iconConfig.gradient}`,
                iconConfig?.shadow,
              )}
            >
              {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {card.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {card.description}
          </p>

          <div className="mt-4 pt-4 border-t border-border/50">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
              Learn More
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
