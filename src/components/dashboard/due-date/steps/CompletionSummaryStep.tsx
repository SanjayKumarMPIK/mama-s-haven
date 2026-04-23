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
    // Refresh to trigger postpartum state properly via dashboard reload
    navigate("/pregnancy-dashboard", { replace: true });
    window.location.reload();
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 text-center shadow-xl shadow-emerald-100/40 animate-in slide-in-from-bottom-8 duration-500 fill-mode-both">
      {isSaving ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-500 animate-pulse font-medium">Preparing your postpartum journey...</p>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-white">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-slate-800 mb-6 font-serif">
            Welcome, Baby {details.name}!
          </h2>
          
          <div className="bg-slate-50 rounded-xl p-5 mb-8 text-left space-y-3 shadow-inner">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500 text-sm">Weight</span>
              <span className="font-semibold text-slate-800">{details.weight} kg</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-slate-500 text-sm">Blood Group</span>
              <span className="font-semibold text-slate-800">{details.bloodGroup}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-sm">Gender</span>
              <span className="font-semibold text-slate-800 capitalize">{details.gender.replace(/_/g, " ")}</span>
            </div>
          </div>

          <Button 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full py-6 text-lg font-semibold shadow-lg shadow-emerald-200 transition-transform active:scale-[0.98]"
            onClick={handleFinish}
          >
            Start Postpartum Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
