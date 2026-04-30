import { useLanguage } from "@/hooks/useLanguage";
import ScrollReveal from "@/components/ScrollReveal";
import { Phone, MapPin, AlertTriangle, Heart, Ambulance, ShieldAlert } from "lucide-react";

const emergencySigns = [
  { emoji: "🩸", en: "Heavy vaginal bleeding", hi: "भारी योनि रक्तस्राव", ta: "அதிக இரத்தப்போக்கு" },
  { emoji: "🤕", en: "Severe headache with vision changes", hi: "तेज सिरदर्द और आंखों में बदलाव", ta: "கடுமையான தலைவலி மற்றும் பார்வை மாற்றங்கள்" },
  { emoji: "👶", en: "Baby not moving (after 28 weeks)", hi: "शिशु हिल नहीं रहा (28 सप्ताह बाद)", ta: "குழந்தை அசையவில்லை (28 வாரங்களுக்குப் பிறகு)" },
  { emoji: "🤒", en: "High fever (above 100.4°F / 38°C)", hi: "तेज बुखार (100.4°F से ऊपर)", ta: "அதிக காய்ச்சல் (100.4°F-க்கு மேல்)" },
  { emoji: "💧", en: "Water breaking before 37 weeks", hi: "37 सप्ताह से पहले पानी की थैली फटना", ta: "37 வாரங்களுக்கு முன் நீர் உடைதல்" },
  { emoji: "⚡", en: "Seizures or convulsions", hi: "दौरे या ऐंठन", ta: "வலிப்பு அல்லது இழுப்பு" },
  { emoji: "😵", en: "Fainting or loss of consciousness", hi: "बेहोशी", ta: "மயக்கம்" },
  { emoji: "🫁", en: "Difficulty breathing or chest pain", hi: "सांस लेने में कठिनाई या सीने में दर्द", ta: "சுவாசிப்பதில் சிரமம் அல்லது நெஞ்சு வலி" },
  { emoji: "🦶", en: "Sudden severe swelling of face/hands", hi: "चेहरे/हाथों में अचानक सूजन", ta: "முகம்/கைகளில் திடீர் வீக்கம்" },
  { emoji: "🩺", en: "Severe abdominal pain", hi: "पेट में तेज दर्द", ta: "கடுமையான வயிற்று வலி" },
];

export default function EmergencyGuidance() {
  const { t, language, simpleMode } = useLanguage();

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* Emergency header */}
      <div className="bg-red-600 text-white">
        <div className="container py-8">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("emergency")}</h1>
                <p className="text-sm text-red-100">{t("emergencyTitle")}</p>
              </div>
            </div>
            <p className="text-sm text-red-100 leading-relaxed max-w-2xl mt-2">{t("emergencyMsg")}</p>
          </ScrollReveal>
        </div>
      </div>

      {/* Helpline numbers */}
      <div className="container -mt-4">
        <ScrollReveal>
          <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
            <a
              href="tel:104"
              className="flex items-center gap-3 rounded-xl bg-white border-2 border-red-200 p-5 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-lg text-red-700">104</p>
                <p className="text-xs text-muted-foreground">{t("helplineMaternal")}</p>
              </div>
            </a>
            <a
              href="tel:108"
              className="flex items-center gap-3 rounded-xl bg-white border-2 border-red-200 p-5 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-lg text-red-700">108</p>
                <p className="text-xs text-muted-foreground">{t("helplineAmbulance")}</p>
              </div>
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Warning signs list */}
      <div className="container py-10">
        <ScrollReveal>
          <h2 className="text-xl font-bold mb-6">{t("warningSigns")}</h2>
        </ScrollReveal>
        <div className="grid gap-3 md:grid-cols-2">
          {emergencySigns.map((sign, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="rounded-xl border-2 border-red-100 bg-red-50/50 p-4 flex items-start gap-3">
                <span className="text-2xl shrink-0">{sign.emoji}</span>
                <div>
                  <p className="font-semibold text-sm text-red-800">
                    {language === "hi" ? sign.hi : language === "ta" ? sign.ta : sign.en}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* What to do section */}
      <div className="bg-card border-t border-border">
        <div className="container py-10">
          <ScrollReveal>
            <h2 className="text-xl font-bold mb-6">What To Do</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-red-50 border border-red-100 p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Step 1</h3>
                <p className="text-xs text-muted-foreground">{t("callHelpline")} — 104 or 108</p>
              </div>
              <div className="rounded-xl bg-orange-50 border border-orange-100 p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Step 2</h3>
                <p className="text-xs text-muted-foreground">{t("visitCenter")}</p>
              </div>
              <div className="rounded-xl bg-green-50 border border-green-100 p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Step 3</h3>
                <p className="text-xs text-muted-foreground">Stay calm. Keep your documents ready. Note time of symptoms.</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Government footer */}
      <div className="bg-red-50 border-t border-red-200">
        <div className="container py-4 text-center">
          <p className="text-xs text-red-600 font-medium">{t("govDisclaimer")}</p>
          <p className="text-xs text-red-500 mt-1">{t("poweredBy")}</p>
        </div>
      </div>
    </main>
  );
}
