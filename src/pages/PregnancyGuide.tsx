import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MaternalGuide from "@/components/guidance/MaternalGuide";

export default function PregnancyGuide() {
  return (
    <>
      <div className="bg-white border-b border-border/50">
        <div className="container py-3">
          <Link
            to="/maternal-guide"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Maternal Guide
          </Link>
        </div>
      </div>
      <MaternalGuide />
    </>
  );
}
