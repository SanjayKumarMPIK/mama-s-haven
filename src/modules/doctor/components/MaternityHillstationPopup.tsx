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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn flex items-center justify-center">
      <div className="animate-scaleIn flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-red-900/20 max-h-[calc(100vh-2rem)]">
        {/* Header - Red Theme */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 px-6 py-5 text-white relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-black/10 rounded-full blur-xl" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner border border-white/20">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Hillstation Delivery Alert</h2>
                <div className="flex gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Action Required
                  </span>
                  {riskLevel && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 shadow-sm">
                      {riskLevel} RISK
                    </span>
                  )}
                </div>
              </div>
              <p className="text-red-100 text-sm leading-relaxed max-w-xl">
                Patient from a remote hillstation area is approaching delivery. Immediate coordination for travel readiness is highly recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6">
          {/* Patient Overview */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 ring-4 ring-red-50">
              <User className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-2xl font-bold text-slate-900 truncate">{alert.patient_name}</h3>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                <Mountain className="w-4 h-4 text-slate-400 shrink-0" /> 
                {villageLabel} <span className="text-slate-300 mx-1">•</span> {phcLabel}
              </p>
            </div>
          </div>

          {/* Time Critical Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-100/50 rounded-full blur-xl -mr-8 -mt-8 transition-transform group-hover:scale-150" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-red-600 mb-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Due In</span>
                </div>
                <p className="text-2xl font-black text-red-950">{daysText}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1.5">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">EDD</span>
              </div>
              <p className="text-lg font-bold text-slate-900 mt-1">{dueDateLabel}</p>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {extras.map((row) => (
              <div key={row.label} className="rounded-xl border border-slate-100 p-3 bg-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{row.label}</p>
                <p className="text-sm font-bold text-slate-800">{row.value}</p>
              </div>
            ))}
          </div>

          {/* Emergency Contact */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">Emergency Contact</p>
                <p className="text-sm font-bold text-amber-950">{emergencyContactLabel}</p>
              </div>
            </div>
            <a href={`tel:${emergencyContactLabel}`} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors hidden sm:block">
              Call Now
            </a>
          </div>

          {/* Alert Message Note */}
          {alert.alert_message && (
            <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 leading-relaxed border-l-4 border-l-red-500 shadow-sm">
              <span className="font-bold text-slate-900">Clinical Note:</span> {alert.alert_message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left flex flex-col sm:block">
            <span>Generated: {new Date(alert.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            <span className="hidden sm:inline mx-2">•</span>
            <span>Expires: {new Date(alert.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            Acknowledge Alert
          </button>
        </div>
      </div>
    </div>
  );
}
