// ─── Maternity Care Log Grid Component ───────────────────────────────────────────
// Responsive card grid for maternity care log modules

import MaternityCareCard, { CareCardData } from "./MaternityCareCard";
import ScrollReveal from "@/components/ScrollReveal";

interface MaternityCareLogGridProps {
  cards: CareCardData[];
  onCardClick?: (cardId: string) => void;
  routeMapping?: Record<string, string>;
  onNavigate?: (route: string) => void;
  delay?: number;
}

export default function MaternityCareLogGrid({ cards, onCardClick, routeMapping, onNavigate, delay = 0 }: MaternityCareLogGridProps) {
  return (
    <ScrollReveal delay={delay}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <MaternityCareCard
            key={card.id}
            data={card}
            onClick={() => onCardClick?.(card.id)}
            route={routeMapping?.[card.id]}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </ScrollReveal>
  );
}
