import { useLanguage } from "@/hooks/useLanguage";
import { ShieldCheck } from "lucide-react";

export default function SafetyDisclaimer() {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-amber-50 border-t border-amber-200" id="safety-disclaimer">
      <div className="container py-2.5 flex items-center gap-2 justify-center text-center">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800 font-medium leading-snug">
          {t("disclaimer")}
        </p>
      </div>
    </div>
  );
}
