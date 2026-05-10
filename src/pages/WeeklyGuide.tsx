import { Navigate } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import MenstrualGuide from "@/components/guidance/MenstrualGuide";
import PubertyGuide from "@/components/guidance/PubertyGuide";

export default function WeeklyGuide() {
  const { phase } = usePhase();

  if (phase === "puberty") {
    return <PubertyGuide />;
  }

  if (phase === "maternity") {
    return <Navigate to="/maternal-guide" replace />;
  }

  if (phase === "postpartum") {
    return <Navigate to="/postpartum-dashboard" replace />;
  }

  // For all other phases, show the standard MenstrualGuide
  return <MenstrualGuide />;
}
