import { useLanguage } from "@/hooks/useLanguage";
import { AlertTriangle, Phone, MapPin } from "lucide-react";

interface EmergencyCardProps {
  show: boolean;
}

export default function EmergencyCard({ show }: EmergencyCardProps) {
  const { t } = useLanguage();

  if (!show) return null;

  return (
    <div className="rounded-xl border-2 border-red-300 bg-red-50 p-5 shadow-lg animate-pulse-glow" id="emergency-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-red-800">{t("emergencyTitle")}</h3>
          <p className="mt-1.5 text-sm text-red-700 leading-relaxed">{t("emergencyMsg")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="tel:104"
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors active:scale-95"
            >
              <Phone className="w-4 h-4" />
              {t("helplineMaternal")}
            </a>
            <a
              href="tel:108"
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors active:scale-95"
            >
              <Phone className="w-4 h-4" />
              {t("helplineAmbulance")}
            </a>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            {t("visitCenter")}
          </div>
        </div>
      </div>
    </div>
  );
}
