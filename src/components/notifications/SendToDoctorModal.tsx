import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SendToDoctorModalProps {
  open: boolean;
  onClose: () => void;
  notificationTitle?: string;
}

export default function SendToDoctorModal({ open, onClose, notificationTitle }: SendToDoctorModalProps) {
  const [message, setMessage] = useState("");

  function handleSend() {
    console.log("Sending to doctor:", { notificationTitle, message });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send to Doctor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {notificationTitle && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium">{notificationTitle}</p>
            </div>
          )}
          <Textarea
            placeholder="Add a message for your doctor (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            This feature will be fully implemented in a future update. For now, this is a placeholder.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend}>Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
