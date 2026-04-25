import { Link } from "react-router-dom";
import {
  Thermometer,
  Heart,
  Moon,
  Baby,
  Apple,
  Activity,
  Lightbulb,
  ChevronRight,
} from "lucide-react";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
};

interface DashboardCard {
  icon: any;
  title: string;
  subtitle: string;
  to: string;
}

const cards: DashboardCard[] = [
  {
    icon: Thermometer,
    title: "Symptoms Tracker",
    subtitle: "Log your daily symptoms",
    to: "/health-log",
  },
  {
    icon: Heart,
    title: "Mood & Emotional Health",
    subtitle: "Track your emotional wellbeing",
    to: "#",
  },
  {
    icon: Moon,
    title: "Sleep & Fatigue",
    subtitle: "Monitor your sleep patterns",
    to: "#",
  },
  {
    icon: Baby,
    title: "Breastfeeding Support",
    subtitle: "Feeding guidance and tips",
    to: "#",
  },
  {
    icon: Apple,
    title: "Nutrition Guide",
    subtitle: "Postpartum nutrition advice",
    to: "/nutrition",
  },
  {
    icon: Activity,
    title: "Postpartum Guide",
    subtitle: "Your healing progress",
    to: "/postpartum-guide",
  },
  {
    icon: Lightbulb,
    title: "Body Healing Progress",
    subtitle: "Track physical recovery",
    to: "#",
  },
  {
    icon: Heart,
    title: "Daily Care Tips",
    subtitle: "Self-care recommendations",
    to: "#",
  },
];

function DashboardCard({ card }: { card: DashboardCard }) {
  const Icon = card.icon;

  return (
    <Link
      to={card.to}
      className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground">{card.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{card.subtitle}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  );
}

export default function PostpartumGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <DashboardCard key={index} card={card} />
      ))}
    </div>
  );
}
