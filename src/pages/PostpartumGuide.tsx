import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Baby,
  Brain,
  Apple,
  Moon,
  Shield,
  TriangleAlert,
  CalendarCheck,
  Activity,
  Users,
  Sparkles,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";

interface SectionItem {
  title: string;
  description: string;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  accent: string;
  items: SectionItem[];
}

const SECTIONS: GuideSection[] = [
  {
    id: "mother-recovery",
    title: "Mother Recovery",
    icon: Heart,
    accent: "text-rose-600",
    items: [
      {
        title: "C-section Recovery",
        description:
          "Keep incision clean and dry. Avoid heavy lifting beyond baby weight. Wear supportive clothing. Watch for signs of infection such as redness, discharge, or fever. Take stool softeners if prescribed.",
      },
      {
        title: "Vaginal Recovery",
        description:
          "Use cold packs for swelling. Take sitz baths as recommended. Use peri bottles for gentle cleansing. Expect bleeding (lochia) for 4-6 weeks — use pads, not tampons.",
      },
      {
        title: "Hydration Reminders",
        description:
          "Drink 8-10 glasses of water daily. Keep a water bottle nearby while nursing. Set hourly reminders on your phone if needed.",
      },
      {
        title: "Pain Management Basics",
        description:
          "Take prescribed medications on schedule. Use ice or heat therapy as directed. Rest before pain becomes severe. Contact your doctor promptly if pain worsens.",
      },
      {
        title: "Rest & Recovery Timeline",
        description:
          "Week 1-2: Focus on bed rest with light movement. Week 3-6: Gradually increase activity. Week 6-8: Get doctor clearance before resuming exercise. Always listen to your body.",
      },
    ],
  },
  {
    id: "breastfeeding",
    title: "Breastfeeding Support",
    icon: Baby,
    accent: "text-pink-600",
    items: [
      {
        title: "Feeding Frequency",
        description:
          "Newborns typically feed 8-12 times per day, or every 2-3 hours. Feed on demand rather than on a strict schedule. Wake your baby if needed during the first few weeks.",
      },
      {
        title: "Latching Tips",
        description:
          "Bring baby to breast, not breast to baby. Ensure mouth covers both nipple and areola. Look for a wide mouth, flanged lips, and audible swallowing. Seek lactation consultant help if latching is painful.",
      },
      {
        title: "Breast Care",
        description:
          "Apply lanolin cream for sore nipples. Use warm compresses before feeding and cold after. Treat engorgement with frequent feeding or gentle pumping. Watch for mastitis signs — redness, heat, fever.",
      },
      {
        title: "Hydration Importance",
        description:
          "Breastfeeding requires extra fluids. Drink water each time you nurse. Aim for 10+ glasses daily. Limit caffeine as it can affect baby's sleep.",
      },
      {
        title: "Nutrition During Breastfeeding",
        description:
          "Consume 300-500 extra calories daily. Focus on protein, whole grains, fruits and vegetables. Continue prenatal vitamins. Avoid alcohol and limit fish high in mercury.",
      },
    ],
  },
  {
    id: "mental-wellness",
    title: "Mental & Emotional Wellness",
    icon: Brain,
    accent: "text-purple-600",
    items: [
      {
        title: "Baby Blues Awareness",
        description:
          "Baby blues affect up to 80% of new mothers. Symptoms include mood swings, crying spells, anxiety, and irritability. These typically begin 2-3 days after birth and resolve within two weeks.",
      },
      {
        title: "Postpartum Depression Signs",
        description:
          "Persistent sadness, loss of interest in activities, withdrawing from family, difficulty bonding with baby, changes in appetite or sleep, intense irritability, or thoughts of self-harm lasting beyond two weeks.",
      },
      {
        title: "Emotional Support Guidance",
        description:
          "Talk openly with your partner, family, or friends. Join a new mothers support group. Share your feelings without guilt. Accept help when offered. Remember you are not alone.",
      },
      {
        title: "Stress Management Tips",
        description:
          "Practice deep breathing exercises. Take short walks outdoors. Nap when the baby sleeps. Set small achievable goals each day. Limit visitors if you feel overwhelmed.",
      },
      {
        title: "When to Seek Professional Help",
        description:
          "If symptoms persist beyond two weeks, worsen over time, or interfere with daily functioning, contact a healthcare provider immediately. Call 108 for emergency mental health support.",
      },
    ],
  },
  {
    id: "nutrition",
    title: "Nutrition After Delivery",
    icon: Apple,
    accent: "text-emerald-600",
    items: [
      {
        title: "Iron-Rich Foods",
        description:
          "Replenish iron stores with leafy greens, lean red meat, lentils, beans, and fortified cereals. Pair with vitamin C sources like citrus fruits to improve absorption.",
      },
      {
        title: "Protein-Rich Recovery Meals",
        description:
          "Include eggs, yogurt, paneer, chicken, fish, legumes, and nuts in your daily meals. Protein helps repair tissues and supports milk production.",
      },
      {
        title: "Calcium & Vitamin Support",
        description:
          "Consume 1000mg of calcium daily from milk, curd, cheese, ragi, and leafy vegetables. Continue prenatal vitamins with DHA. Get vitamin D through safe sun exposure or supplements.",
      },
      {
        title: "Hydration Goals",
        description:
          "Aim for 8-10 glasses of water plus milk and soups. Keep a filled water bottle visible at all times. Limit sugary drinks and excess caffeine.",
      },
    ],
  },
  {
    id: "sleep-fatigue",
    title: "Sleep & Fatigue",
    icon: Moon,
    accent: "text-indigo-600",
    items: [
      {
        title: "Sleep Recovery Suggestions",
        description:
          "Sleep when the baby sleeps — even short naps help. Accept that uninterrupted sleep may not be possible initially. Prioritize rest over housework.",
      },
      {
        title: "Managing Fatigue",
        description:
          "Eat small frequent meals to maintain energy. Stay hydrated. Limit screen time before bed. Use blackout curtains for daytime naps.",
      },
      {
        title: "Asking Family or Partner Support",
        description:
          "Ask your partner to handle night diaper changes after breastfeeding. Request family to help with meals and household tasks. Communicate your needs clearly.",
      },
      {
        title: "Rest Scheduling Tips",
        description:
          "Create a flexible sleep schedule. Take turns with your partner for night duties. Keep the baby's bassinet or cot near the bed for easier night feeds.",
      },
    ],
  },
  {
    id: "newborn-care",
    title: "Newborn Care Basics",
    icon: Shield,
    accent: "text-sky-600",
    items: [
      {
        title: "Feeding Intervals",
        description:
          "Feed every 2-3 hours or on demand. Look for early hunger cues like rooting, sucking motions, and hand-to-mouth movements. Crying is a late hunger sign.",
      },
      {
        title: "Burping Guidance",
        description:
          "Burp your baby after every feed, or halfway through if they seem uncomfortable. Hold upright against your shoulder or sit them on your lap with head support. Gently pat the back.",
      },
      {
        title: "Diaper Care",
        description:
          "Change diapers every 2-3 hours or immediately when soiled. Expect 8-10 wet diapers daily. Clean from front to back for girls. Apply diaper cream to prevent rash.",
      },
      {
        title: "Umbilical Cord Care",
        description:
          "Keep the cord stump clean and dry. Fold the diaper below the stump. Sponge bathe until it falls off (usually 1-2 weeks). Watch for signs of infection — redness, pus, or foul odor.",
      },
      {
        title: "Safe Sleeping Positions",
        description:
          "Always place baby on their back on a firm mattress. Keep the cot free of pillows, blankets, and toys. Room-share but avoid bed-sharing. Ensure baby's head is uncovered.",
      },
      {
        title: "Vaccination Reminders",
        description:
          "Follow the immunization schedule: BCG, Hepatitis B, and OPV at birth; DPT, Hib, IPV, and Rotavirus at 6 weeks. Keep your vaccination card handy and track dates.",
      },
    ],
  },
  {
    id: "follow-up",
    title: "Follow-up Checkups",
    icon: CalendarCheck,
    accent: "text-teal-600",
    items: [
      {
        title: "Maternal Checkup Reminders",
        description:
          "Schedule a postpartum checkup at 2 weeks and 6 weeks after delivery. Your doctor will check incision healing, bleeding, blood pressure, and discuss contraception options.",
      },
      {
        title: "Baby Health Checkups",
        description:
          "Newborn screening within 24-48 hours. Well-baby visits at 1-2 weeks, 1 month, and 2 months. Pediatrician will track weight, length, head circumference, and developmental milestones.",
      },
      {
        title: "Vaccination Follow-ups",
        description:
          "Keep a vaccination tracker. Note the next due dates for each vaccine. Most health centers send reminders. Do not delay vaccinations — they protect against serious diseases.",
      },
    ],
  },
  {
    id: "exercise",
    title: "Exercise & Physical Recovery",
    icon: Activity,
    accent: "text-lime-600",
    items: [
      {
        title: "Light Walking",
        description:
          "Start with 5-10 minute gentle walks around the house. Gradually increase to 15-20 minute outdoor walks by week 3-4. Listen to your body and stop if you feel pain or discomfort.",
      },
      {
        title: "Pelvic Floor Exercises",
        description:
          "Begin Kegel exercises as soon as comfortable. Contract pelvic floor muscles for 5-10 seconds, then relax. Do 3 sets of 10 repetitions daily. These help prevent incontinence and aid recovery.",
      },
      {
        title: "Stretching Guidance",
        description:
          "Gentle neck, shoulder, and back stretches help relieve nursing tension. Avoid deep twisting or abdominal stretches until cleared by your doctor. Focus on slow, controlled movements.",
      },
      {
        title: "Safe Recovery Progression",
        description:
          "Get medical clearance before resuming intense exercise, typically at 6-8 weeks. Start with low-impact activities. Progress gradually from walking to postpartum yoga to strength training.",
      },
    ],
  },
  {
    id: "family-support",
    title: "Family Support & Self Care",
    icon: Users,
    accent: "text-amber-600",
    items: [
      {
        title: "Emotional Support",
        description:
          "Maintain open communication with your partner. Share your feelings and concerns. Don't hesitate to ask for emotional support from loved ones. Consider professional counseling if needed.",
      },
      {
        title: "Sharing Responsibilities",
        description:
          "Divide household tasks with your partner. Accept help from family and friends with cooking, cleaning, and errands. Focus your energy on yourself and your baby.",
      },
      {
        title: "Self-Care Reminders",
        description:
          "Take a few minutes daily for yourself — a warm shower, a cup of tea, or deep breathing. Maintain personal hygiene. Dress in comfortable clothes. Small acts of self-care matter.",
      },
      {
        title: "Partner Involvement",
        description:
          "Encourage your partner to participate in diaper changes, bathing, burping, and soothing. Attend pediatrician visits together. Take turns for night duties. Parenting is a team effort.",
      },
    ],
  },
];

const EMERGENCY_WARNINGS = [
  {
    title: "Heavy Bleeding",
    description:
      "Soaking more than one pad per hour, or passing large clots (larger than a lemon). This may indicate postpartum hemorrhage — seek immediate medical attention.",
  },
  {
    title: "High Fever",
    description:
      "Temperature of 100.4°F (38°C) or higher could signal an infection such as endometritis, mastitis, or a wound infection.",
  },
  {
    title: "Chest Pain",
    description:
      "Persistent chest pain, tightness, or pressure may indicate a cardiac issue or pulmonary embolism. Do not ignore chest discomfort.",
  },
  {
    title: "Breathing Difficulty",
    description:
      "Sudden shortness of breath, rapid breathing, or feeling like you can't catch your breath requires emergency evaluation for possible blood clots.",
  },
  {
    title: "Severe Depression Symptoms",
    description:
      "Thoughts of harming yourself or your baby, severe hopelessness, or inability to care for yourself or your newborn. Call emergency services or a crisis hotline immediately.",
  },
  {
    title: "Seizure Warning Signs",
    description:
      "Severe headaches with vision changes, confusion, or convulsions may indicate eclampsia. This is a life-threatening emergency requiring immediate medical care.",
  },
];

export default function PostpartumGuide() {
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
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest mb-4 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" /> Postpartum Guide
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Your Postpartum Recovery Journey
          </h1>
          <p className="text-base text-slate-500 leading-relaxed">
            Comprehensive guidance for recovery, emotional wellbeing, breastfeeding, and newborn care in the weeks and months after delivery.
          </p>
        </div>

        <Accordion type="multiple" className="space-y-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50/80 transition-colors [&[data-state=open]>svg]:text-foreground">
                  <div className="flex items-center gap-3 text-left">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${section.accent} bg-opacity-10 bg-gradient-to-br from-white to-current`}
                      style={{ backgroundColor: "color-mix(in srgb, currentColor 8%, transparent)" }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-base font-semibold text-slate-900">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5">
                  <div className="space-y-3 pt-2">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="rounded-xl bg-slate-50 p-4">
                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Emergency Warning Signs */}
        <div className="mt-8 rounded-2xl border-2 border-red-200 bg-red-50 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-red-100 border-b border-red-200">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
              <TriangleAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-900">Emergency Warning Signs</h2>
              <p className="text-sm text-red-700">
                Seek immediate medical help if you experience any of these symptoms
              </p>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {EMERGENCY_WARNINGS.map((warning, idx) => (
              <Alert
                key={idx}
                variant="destructive"
                className="border-red-300 bg-white"
              >
                <TriangleAlert className="w-5 h-5 text-red-600" />
                <AlertTitle className="text-red-900 font-bold">
                  {warning.title}
                </AlertTitle>
                <AlertDescription className="text-red-800">
                  {warning.description}
                </AlertDescription>
              </Alert>
            ))}
            <div className="pt-2 text-center">
              <p className="text-sm font-semibold text-red-800">
                Call 108 (Ambulance) or 104 (Health Helpline) immediately
              </p>
            </div>
          </div>
        </div>

        <SafetyDisclaimer />
      </div>
    </main>
  );
}
