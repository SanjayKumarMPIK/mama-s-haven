import { usePhase } from "@/hooks/usePhase";
import MenstrualGuide from "@/components/guidance/MenstrualGuide";
import MaternalGuide from "@/components/guidance/MaternalGuide";

export default function WeeklyGuide() {
  const { phase } = usePhase();

  if (phase === "maternity") {
    return <MaternalGuide />;
  }

  // Ensure fully functional functionality for puberty users,
  // falling back to MenstrualGuide for all non-maternity phases in this context
  return <MenstrualGuide />;
}
