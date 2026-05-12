import { useEffect, useRef } from "react";
import {
  AlertTriangle,
  MapPin,
  Calendar,
  Phone,
  User,
  Baby,
  CheckCircle2,
  Mountain,
  Clock,
} from "lucide-react";
import type { MaternityHillstationAlert } from "@/services/maternityAlertStore";
import { getRegionRiskLevel } from "@/lib/regionalRiskZones";

interface MaternityHillstationPopupProps {
  alert: MaternityHillstationAlert;
  onAcknowledge: (alertId: string) => void;
}

export function MaternityHillstationPopup({
  alert,
  onAcknowledge,
}: MaternityHillstationPopupProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+Af39/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+Af39/f4B/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+"
    );
    audio.loop = false;
    audio.volume = 0.3;
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const hasDueCountdown =
    alert.days_left >= 0 && Number.isFinite(alert.days_left);
  const daysText = !hasDueCountdown
    ? "Not on file"
    : alert.days_left === 0
      ? "Today"
      : alert.days_left === 1
        ? "1 day"
        : `${alert.days_left} days`;

  const dueDateLabel =
    alert.due_date && String(alert.due_date).trim().length >= 8
      ? new Date(alert.due_date + "T00:00:00").toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not on file";

  const extras = [
    alert.patient_age != null && Number.isFinite(alert.patient_age)
      ? { label: "Age", value: `${alert.patient_age} yrs` }
      : null,
    alert.blood_group ? { label: "Blood group", value: alert.blood_group } : null,
    alert.trimester != null && Number.isFinite(alert.trimester)
      ? { label: "Trimester", value: String(alert.trimester) }
      : null,
    alert.weeks_pregnant != null && Number.isFinite(alert.weeks_pregnant)
      ? { label: "Weeks pregnant", value: `${alert.weeks_pregnant}` }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border-l-4 border-red-500 overflow-hidden animate-scaleIn">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">HIGH RISK DELIVERY ALERT</h2>
                <p className="text-orange-100 text-xs mt-0.5">
                  Hillstation Pregnancy — Immediate Attention Required
                </p>
              </div>
            </div>
            <span className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
              HIGH PRIORITY
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
            <Mountain className="w-5 h-5 text-red-600 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-red-500 font-semibold uppercase tracking-wider">
                Risk Badge
              </p>
              <p className="font-bold text-red-800">Hillstation Near Delivery</p>
            </div>
            {(() => {
              const riskLevel = getRegionRiskLevel(
                'hillstation',
                alert.village_town,
              );
              const riskColors: Record<string, string> = {
                critical: 'bg-red-600 text-white',
                high: 'bg-orange-500 text-white',
                medium: 'bg-amber-500 text-white',
                low: 'bg-yellow-400 text-slate-900',
              };
              return riskLevel ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${riskColors[riskLevel] ?? riskColors.high}`}>
                  {riskLevel} risk
                </span>
              ) : null;
            })()}
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <User className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-orange-500">Patient Name</p>
                <p className="font-bold text-orange-900 text-lg">
                  {alert.patient_name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Baby className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Phase</p>
                  <p className="text-sm font-bold text-slate-900">Maternity / Pregnancy</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <MapPin className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Hillstation Status</p>
                  <p className="text-sm font-bold text-slate-900">Confirmed</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                <Calendar className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-xs text-amber-500">Delivery due in</p>
                  <p className="text-sm font-bold text-amber-800">{daysText}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Expected delivery date</p>
                  <p className="text-sm font-bold text-slate-900">{dueDateLabel}</p>
                </div>
              </div>
            </div>

            {extras.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {extras.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-2 p-2.5 bg-violet-50 rounded-lg border border-violet-100"
                  >
                    <div>
                      <p className="text-[10px] text-violet-600 font-semibold uppercase tracking-wide">
                        {row.label}
                      </p>
                      <p className="text-sm font-bold text-violet-900">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {alert.alert_message ? (
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">
                  Alert summary
                </p>
                <p className="text-xs text-slate-800 leading-relaxed">{alert.alert_message}</p>
              </div>
            ) : null}

            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-500">PHC Name</p>
                <p className="text-sm font-bold text-blue-900">
                  {alert.phc_location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <MapPin className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Village / Town</p>
                <p className="text-sm font-bold text-slate-900">
                  {alert.village_town}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <Phone className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Emergency Contact</p>
                <p className="text-sm font-bold text-slate-900">
                  {alert.emergency_contact}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-sm hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Acknowledge Alert — I Will Attend
            </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-3 h-3" />
                Alert created{" "}
                {new Date(alert.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <span className="text-[10px] text-slate-400">
                Expires{" "}
                {new Date(alert.expires_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
