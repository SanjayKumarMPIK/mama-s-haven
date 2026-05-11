import { Link } from "react-router-dom";
import { Baby, Heart, Feather, ChevronRight } from "lucide-react";

export default function MaternalGuideHub() {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="container py-12 md:py-16 max-w-2xl mx-auto">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-widest mb-4 border border-pink-100">
            <Heart className="w-3.5 h-3.5" /> Maternal Guide
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            How can we help you?
          </h1>
          <p className="text-base text-slate-500">
            Choose a guide tailored to your needs.
          </p>
        </div>

        <div className="space-y-5">
          {/* Pregnancy Guide Card */}
          <Link
            to="/maternal-guide/pregnancy"
            className="group block w-full rounded-2xl border border-slate-200 bg-white p-6 md:p-8 hover:border-pink-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-sm shrink-0">
                <Baby className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900">Pregnancy Guide</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Weekly maternal care, symptoms, nutrition, and appointments.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Link>

          {/* Premature Care Card */}
          <Link
            to="/maternal-guide/premature"
            className="group block w-full rounded-2xl border border-slate-200 bg-white p-6 md:p-8 hover:border-purple-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center shadow-sm shrink-0">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900">Premature Care</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Support and guidance for babies born before 37 weeks.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Link>

          {/* Postpartum Guide Card */}
          <Link
            to="/maternity/postpartum-guide"
            className="group block w-full rounded-2xl border border-slate-200 bg-white p-6 md:p-8 hover:border-amber-200 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center shadow-sm shrink-0">
                <Feather className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900">Postpartum Guide</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Recovery, emotional wellbeing, breastfeeding, and newborn care after delivery.
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
