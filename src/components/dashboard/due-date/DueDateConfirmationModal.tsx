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
      <div className="rounded-2xl border border-border bg-card w-full max-w-sm p-6 text-center shadow-sm animate-in zoom-in-95 duration-300">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Baby className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">Is baby here?</h2>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          Your predicted due date has passed. Has your baby been delivered?
        </p>

        <div className="space-y-3">
          <Button
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-transform active:scale-[0.98]"
            onClick={onYes}
          >
            Yes, I've delivered!
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-lg py-2.5 text-sm text-foreground border-border hover:bg-muted transition-transform active:scale-[0.98]"
            onClick={handleNotYet}
            disabled={isExtending}
          >
            <CalendarPlus className="w-4 h-4 mr-2 text-muted-foreground" />
            Not Yet (Extend 14 Days)
          </Button>
        </div>
      </div>
    </div>
  );
}
