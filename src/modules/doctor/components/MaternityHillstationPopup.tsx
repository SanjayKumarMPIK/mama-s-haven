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

  const ageLabel =
    alert.patient_age != null && Number.isFinite(alert.patient_age)
      ? `${alert.patient_age} yrs`
      : "Not on file";

  const bloodGroupLabel = alert.blood_group?.trim() || "Not on file";
  const trimesterLabel =
    alert.trimester != null && Number.isFinite(alert.trimester)
      ? String(alert.trimester)
      : "Not on file";
  const weeksPregnantLabel =
    alert.weeks_pregnant != null && Number.isFinite(alert.weeks_pregnant)
      ? `${alert.weeks_pregnant} weeks`
      : "Not on file";
  const phcLabel = alert.phc_location?.trim() || "Not on file";
  const villageLabel = alert.village_town?.trim() || "Not on file";
  const emergencyContactLabel = alert.emergency_contact?.trim() || "Not on file";
  const riskLevel = getRegionRiskLevel("hillstation", alert.village_town);
  const riskColors: Record<string, string> = {
    critical: "bg-red-600 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-amber-500 text-white",
    low: "bg-yellow-300 text-slate-900",
  };

  const extras = [
    { label: "Age", value: ageLabel },
    { label: "Blood group", value: bloodGroupLabel },
    { label: "Trimester", value: trimesterLabel },
    { label: "Weeks pregnant", value: weeksPregnantLabel },
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm animate-fadeIn sm:p-6">
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div className="animate-scaleIn flex w-full max-w-5xl max-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_-32px_rgba(15,23,42,0.45)] sm:max-h-[calc(100vh-3rem)]">
          <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <AlertTriangle className="h-6 w-6 text-orange-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-200">
                    Doctor dashboard notice
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    Maternity high-risk alert
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                    A patient from a hillstation area is nearing delivery and requires timely doctor follow-up.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Action required
                </span>
                {riskLevel ? (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${riskColors[riskLevel] ?? riskColors.high}`}
                  >
                    {riskLevel} risk
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
              <section className="rounded-[24px] border border-red-100 bg-gradient-to-br from-red-50 via-white to-orange-50 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                    Hillstation near delivery
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    Confirmed case
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">Patient</p>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {alert.patient_name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Expected delivery in <span className="font-semibold text-red-700">{daysText}</span>
                      {" "}with an EDD of <span className="font-semibold text-slate-900">{dueDateLabel}</span>.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Baby className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-wide">Phase</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Maternity / Pregnancy
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mountain className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-wide">Regional status</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Hillstation condition confirmed
                    </p>
                  </div>
                </div>

                {alert.alert_message ? (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                      Alert summary
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {alert.alert_message}
                    </p>
                  </div>
                ) : null}
              </section>

              <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Care snapshot
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      Key patient details
                    </h3>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-2xl border border-red-100 bg-white p-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <Clock className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-wide">Delivery due in</p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{daysText}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <p className="text-xs font-semibold uppercase tracking-wide">EDD</p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{dueDateLabel}</p>
                  </div>
                  {extras.map((row) => (
                    <div key={row.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {row.label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-950">{row.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        PHC name
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{phcLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Village / Town
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{villageLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Emergency contact
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{emergencyContactLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    Clinical note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Please review the case, coordinate travel-readiness, and confirm follow-up with the patient immediately.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Alert created {new Date(alert.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span>
                  Expires {new Date(alert.expires_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <button
                onClick={() => onAcknowledge(alert.id)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.99] lg:w-auto lg:min-w-[260px]"
              >
                <CheckCircle2 className="h-5 w-5" />
                Acknowledge and attend case
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
