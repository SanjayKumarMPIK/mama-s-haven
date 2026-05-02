import { Calendar, Baby, Heart } from "lucide-react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { usePostpartumRecovery } from "../recovery/usePostpartumRecovery";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
};

export default function PostpartumOverviewCard() {
  const { profile } = usePregnancyProfile();
  const { daysPostpartum, activeMilestone } = usePostpartumRecovery();

  // Delivery type: derive from profile if available
  const deliveryType = profile.delivery?.weeksAtBirth
    ? profile.delivery.weeksAtBirth < 37
      ? "Premature Delivery"
      : "Full-term Delivery"
    : "—";

  // Recovery phase from active milestone
  const recoveryPhase = activeMilestone?.title || "Recovery";

  // Format delivery date for display
  const deliveryDateFormatted = profile.delivery?.birthDate
    ? new Date(profile.delivery.birthDate + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6 hover:shadow-md transition-all`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md`}>
          <Heart className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base font-bold text-foreground">Postpartum Status</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className={`w-5 h-5 ${accent.text}`} />
          <div>
            <p className="text-xs text-muted-foreground">Days Postpartum</p>
            <p className="text-lg font-bold text-foreground">
              {daysPostpartum} {daysPostpartum === 1 ? "day" : "days"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Baby className={`w-5 h-5 ${accent.text}`} />
          <div>
            <p className="text-xs text-muted-foreground">Delivery Date</p>
            <p className="text-sm font-semibold text-foreground">{deliveryDateFormatted}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Heart className={`w-5 h-5 ${accent.text}`} />
          <div>
            <p className="text-xs text-muted-foreground">Current Phase</p>
            <p className="text-sm font-semibold text-foreground">{recoveryPhase}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
