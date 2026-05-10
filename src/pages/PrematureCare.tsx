import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Baby, Ruler, Stethoscope, AlertCircle, Users, Activity } from "lucide-react";

const TABS = ["Overview", "Feeding", "Growth", "NICU", "Emergency", "Support"] as const;

const TAB_ICONS: Record<string, React.ReactNode> = {
  Overview: <Activity className="w-4 h-4" />,
  Feeding: <Baby className="w-4 h-4" />,
  Growth: <Ruler className="w-4 h-4" />,
  NICU: <Stethoscope className="w-4 h-4" />,
  Emergency: <AlertCircle className="w-4 h-4" />,
  Support: <Users className="w-4 h-4" />,
};

const PLACEHOLDER_CONTENT: Record<string, { title: string; description: string; items: string[] }> = {
  Overview: {
    title: "Overview",
    description:
      "Premature babies require specialized care and attention. This guide provides essential information to help you navigate the journey of caring for your premature baby.",
    items: [
      "Premature birth occurs before 37 weeks of pregnancy",
      "The earlier a baby is born, the more medical care they may need",
      "Every premature baby is unique and progresses at their own pace",
      "Your NICU team will guide you through each step of the journey",
    ],
  },
  Feeding: {
    title: "Feeding",
    description: "Feeding a premature baby can be challenging. Here are some key points to keep in mind.",
    items: [
      "Breast milk is the best nutrition for premature babies",
      "Your baby may need tube feeding initially",
      "Kangaroo care helps promote feeding readiness",
      "Consult with a lactation specialist for personalized guidance",
    ],
  },
  Growth: {
    title: "Growth & Development",
    description: "Track your baby's growth milestones and understand what to expect.",
    items: [
      "Premature babies are measured on adjusted age charts",
      "Weight gain is a key indicator of health",
      "Developmental milestones may be delayed compared to full-term babies",
      "Regular follow-ups with your pediatrician are essential",
    ],
  },
  NICU: {
    title: "NICU Care",
    description: "The Neonatal Intensive Care Unit (NICU) provides specialized care for premature babies.",
    items: [
      "Your baby will be monitored 24/7 by trained medical staff",
      "You can participate in your baby's care through kangaroo care and feeding",
      "Ask questions — the NICU team is there to support both you and your baby",
      "Take care of yourself too — your recovery matters",
    ],
  },
  Emergency: {
    title: "Emergency Signs",
    description: "Know when to seek immediate medical attention for your premature baby.",
    items: [
      "Difficulty breathing or rapid breathing",
      "Feeding difficulties or refusing to feed",
      "Unusual lethargy or irritability",
      "Fever or low body temperature",
      "Always call your doctor or 108 in case of emergency",
    ],
  },
  Support: {
    title: "Support & Resources",
    description: "You are not alone. Reach out for support and connect with other parents.",
    items: [
      "Connect with other parents of premature babies",
      "Speak to a counselor if you're feeling overwhelmed",
      "Government programs may provide financial assistance",
      "Helpline: 104 (Health) | 108 (Ambulance)",
    ],
  },
};

export default function PrematureCare() {
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const content = PLACEHOLDER_CONTENT[activeTab];

  return (
    <main className="min-h-screen bg-[#fafafa]">
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

      <div className="container py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-widest mb-4 border border-purple-100">
            <Heart className="w-3.5 h-3.5" /> Premature Care
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Premature Baby Guide
          </h1>
          <p className="text-base text-slate-500">
            Support and guidance for babies born before 37 weeks.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-6 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-purple-200 hover:text-purple-600"
              }`}
            >
              {TAB_ICONS[tab]}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-3">{content.title}</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">{content.description}</p>
          <ul className="space-y-3">
            {content.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
