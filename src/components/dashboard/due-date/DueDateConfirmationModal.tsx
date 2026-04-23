import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Baby, CalendarPlus } from "lucide-react";

interface Props {
  onClose: () => void;
  onYes: () => void;
}

export function DueDateConfirmationModal({ onClose, onYes }: Props) {
  const { user } = useAuth();
  const { activeEDD, setUserEDD } = usePregnancyProfile();
  const [isExtending, setIsExtending] = useState(false);

  const handleNotYet = async () => {
    setIsExtending(true);
    try {
      const currentEddDate = new Date(activeEDD + "T00:00:00");
      currentEddDate.setDate(currentEddDate.getDate() + 14);
      const newEdd = currentEddDate.toISOString().split("T")[0];

      if (user?.id) {
        await (supabase as any)
          .from("pregnancy_profiles")
          .upsert({
            user_id: user.id,
            expected_due_date: newEdd,
            due_date_confirmation_asked: true,
            updated_at: new Date().toISOString()
          }, { onConflict: "user_id" });
      }

      setUserEDD(newEdd);
      toast.success("Due date extended by 14 days", { icon: "📅" });
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to extend due date. Please try again.");
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Baby className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Is baby here?</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Your predicted due date has passed. Has your baby been delivered?
        </p>
        
        <div className="space-y-4">
          <Button 
            className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-2xl py-6 text-lg font-semibold shadow-lg shadow-rose-200 transition-transform active:scale-[0.98]"
            onClick={onYes}
          >
            Yes, I've delivered!
          </Button>
          <Button 
            variant="outline"
            className="w-full rounded-2xl py-6 text-lg text-slate-600 border-2 border-slate-100 hover:bg-slate-50 transition-transform active:scale-[0.98]"
            onClick={handleNotYet}
            disabled={isExtending}
          >
            <CalendarPlus className="w-5 h-5 mr-3 text-slate-400" />
            Not Yet (Extend 14 Days)
          </Button>
        </div>
      </div>
    </div>
  );
}
