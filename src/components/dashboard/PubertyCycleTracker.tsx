import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function PubertyCycleTracker() {
  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-5">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 p-5 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />
          <p className="text-sm font-bold text-blue-800">
            Your Cycle Dashboard is ready
          </p>
          <p className="text-xs text-blue-600">
            Check the Cycle Insights card for your period predictions and fertility window details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
