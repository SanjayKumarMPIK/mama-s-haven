import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BabyDetails } from "../CelebrationFlow";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  details: BabyDetails;
  onClose: () => void;
}

export function CompletionSummaryStep({ details, onClose }: Props) {
  const { user } = useAuth();
  const { saveDelivery } = usePregnancyProfile();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function saveToSupabase() {
      setIsSaving(true);
      try {
        if (user?.id) {
          const payload = {
            user_id: user.id,
            delivery_confirmed: true,
            due_date_celebration_shown: true,
            due_date_confirmation_asked: true,
            baby_gender: details.gender,
            baby_name: details.name,
            baby_weight: parseFloat(details.weight) || null,
            baby_blood_group: details.bloodGroup,
            updated_at: new Date().toISOString()
          };

          await (supabase as any)
            .from("pregnancy_profiles")
            .upsert(payload, { onConflict: "user_id" });
        }

        // Save to local profile to shift to postpartum phase
        saveDelivery({
          isDelivered: true,
          birthDate: new Date().toISOString().split("T")[0],
          weeksAtBirth: 40, // Assume full term if reached EDD
          birthWeight: parseFloat(details.weight) || null
        });

        setSaved(true);
      } catch (e) {
        console.error("Failed to save delivery profile", e);
        toast.error("Could not save to database, but continuing...");
        setSaved(true); // Allow continuing anyway
      } finally {
        setIsSaving(false);
      }
    }

    saveToSupabase();
  }, []);

  const handleFinish = () => {
    onClose();
    // Navigate to pregnancy dashboard to trigger proper mode switch
    navigate("/pregnancy-dashboard", { replace: true });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in slide-in-from-bottom-8 duration-500 fill-mode-both">
      {isSaving ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Preparing your postpartum journey...</p>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1 text-center">
            Welcome, Baby {details.name}!
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Your baby's information has been saved.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-muted-foreground text-sm">Weight</span>
              <span className="font-semibold text-foreground">{details.weight} kg</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-muted-foreground text-sm">Blood Group</span>
              <span className="font-semibold text-foreground">{details.bloodGroup}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Gender</span>
              <span className="font-semibold text-foreground capitalize">{details.gender.replace(/_/g, " ")}</span>
            </div>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            onClick={handleFinish}
          >
            Start Postpartum Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
