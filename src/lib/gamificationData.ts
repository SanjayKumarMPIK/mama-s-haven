export interface HabitDef {
  id: string;
  name: string;
  nameHi: string;
  nameTa: string;
  icon: string;
  emoji: string;
  description: string;
  target: string;
  xp: number;
}

export const DAILY_HABITS: HabitDef[] = [
  { id: "nutrition", name: "Balanced Meal", nameHi: "संतुलित भोजन", nameTa: "சமச்சீர் உணவு", icon: "Apple", emoji: "🥗", description: "Eat a balanced meal with protein, iron, and greens", target: "3 meals", xp: 10 },
  { id: "hydration", name: "Stay Hydrated", nameHi: "पानी पिएं", nameTa: "நீர் அருந்துங்கள்", icon: "Droplets", emoji: "💧", description: "Drink at least 8 glasses of water today", target: "8 glasses", xp: 10 },
  { id: "supplements", name: "Take Supplements", nameHi: "दवाई लें", nameTa: "மாத்திரை எடுங்கள்", icon: "Pill", emoji: "💊", description: "Take your IFA tablet / folic acid / prescribed supplements", target: "1 tablet", xp: 10 },
  { id: "rest", name: "Adequate Rest", nameHi: "पर्याप्त आराम", nameTa: "போதுமான ஓய்வு", icon: "Moon", emoji: "😴", description: "Get 7-9 hours of sleep and rest when tired", target: "8 hours", xp: 10 },
  { id: "exercise", name: "Gentle Activity", nameHi: "हल्का व्यायाम", nameTa: "லேசான உடற்பயிற்சி", icon: "Footprints", emoji: "🚶‍♀️", description: "Take a walk, do prenatal yoga, or gentle stretches", target: "20 min", xp: 10 },
  { id: "hygiene", name: "Hygiene Care", nameHi: "स्वच्छता", nameTa: "சுகாதாரம்", icon: "Sparkles", emoji: "🧼", description: "Wash hands, brush teeth, maintain personal hygiene", target: "Routine", xp: 10 },
];

export interface Badge {
  id: string;
  name: string;
  nameHi: string;
  nameTa: string;
  emoji: string;
  description: string;
  criteria: string;
  check: (stats: GamificationStats) => boolean;
}

export interface GamificationStats {
  totalDaysTracked: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  totalHabitsCompleted: number;
  perfectDays: number;
  habitCounts: Record<string, number>;
}

export const BADGES: Badge[] = [
  { id: "first-step", name: "First Step", nameHi: "पहला कदम", nameTa: "முதல் அடி", emoji: "🌱", description: "Complete your first habit check-in", criteria: "Complete 1 habit", check: (s) => s.totalHabitsCompleted >= 1 },
  { id: "perfect-day", name: "Perfect Day", nameHi: "सही दिन", nameTa: "சிறந்த நாள்", emoji: "⭐", description: "Complete all 6 habits in one day", criteria: "All 6 habits in 1 day", check: (s) => s.perfectDays >= 1 },
  { id: "streak-3", name: "Getting Going", nameHi: "शुरुआत", nameTa: "தொடக்கம்", emoji: "🔥", description: "Maintain a 3-day streak", criteria: "3-day streak", check: (s) => s.longestStreak >= 3 },
  { id: "streak-7", name: "One Week Strong", nameHi: "एक हफ्ता", nameTa: "ஒரு வாரம்", emoji: "💪", description: "Maintain a 7-day streak", criteria: "7-day streak", check: (s) => s.longestStreak >= 7 },
  { id: "streak-14", name: "Fortnight Hero", nameHi: "दो हफ्ते", nameTa: "இரண்டு வாரம்", emoji: "🏅", description: "Maintain a 14-day streak", criteria: "14-day streak", check: (s) => s.longestStreak >= 14 },
  { id: "streak-30", name: "Monthly Champion", nameHi: "मासिक चैंपियन", nameTa: "மாத சாம்பியன்", emoji: "🏆", description: "Maintain a 30-day streak", criteria: "30-day streak", check: (s) => s.longestStreak >= 30 },
  { id: "hydration-hero", name: "Hydration Hero", nameHi: "जल नायक", nameTa: "நீர் நாயகன்", emoji: "💧", description: "Track hydration for 10 days", criteria: "10 hydration check-ins", check: (s) => (s.habitCounts["hydration"] || 0) >= 10 },
  { id: "nutrition-star", name: "Nutrition Star", nameHi: "पोषण सितारा", nameTa: "ஊட்டச்சத்து நட்சத்திரம்", emoji: "🌟", description: "Track nutrition for 10 days", criteria: "10 nutrition check-ins", check: (s) => (s.habitCounts["nutrition"] || 0) >= 10 },
  { id: "supplement-champ", name: "Supplement Champ", nameHi: "दवाई चैंपियन", nameTa: "மாத்திரை சாம்பியன்", emoji: "💊", description: "Take supplements for 15 days", criteria: "15 supplement check-ins", check: (s) => (s.habitCounts["supplements"] || 0) >= 15 },
  { id: "active-mama", name: "Active Mama", nameHi: "सक्रिय माँ", nameTa: "சுறுசுறுப்பான அம்மா", emoji: "🧘‍♀️", description: "Track exercise for 10 days", criteria: "10 exercise check-ins", check: (s) => (s.habitCounts["exercise"] || 0) >= 10 },
  { id: "xp-100", name: "Centurion", nameHi: "शतक", nameTa: "நூறு", emoji: "💯", description: "Earn 100 XP total", criteria: "100 XP", check: (s) => s.totalXP >= 100 },
  { id: "xp-500", name: "Rising Star", nameHi: "उभरता सितारा", nameTa: "வளரும் நட்சத்திரம்", emoji: "🌠", description: "Earn 500 XP total", criteria: "500 XP", check: (s) => s.totalXP >= 500 },
  { id: "xp-1000", name: "Superstar", nameHi: "सुपरस्टार", nameTa: "சூப்பர் ஸ்டார்", emoji: "✨", description: "Earn 1000 XP total", criteria: "1000 XP", check: (s) => s.totalXP >= 1000 },
  { id: "perfect-5", name: "Fab Five", nameHi: "शानदार पाँच", nameTa: "சிறந்த ஐந்து", emoji: "🎯", description: "5 perfect days (all habits done)", criteria: "5 perfect days", check: (s) => s.perfectDays >= 5 },
  { id: "perfect-15", name: "Consistency Queen", nameHi: "निरंतरता रानी", nameTa: "நிலைத்தன்மை ராணி", emoji: "👑", description: "15 perfect days", criteria: "15 perfect days", check: (s) => s.perfectDays >= 15 },
  { id: "clean-queen", name: "Hygiene Queen", nameHi: "स्वच्छता रानी", nameTa: "சுகாதார ராணி", emoji: "🧼", description: "Track hygiene for 10 days", criteria: "10 hygiene check-ins", check: (s) => (s.habitCounts["hygiene"] || 0) >= 10 },
];

export interface LevelDef {
  level: number;
  name: string;
  nameHi: string;
  nameTa: string;
  emoji: string;
  minXP: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1, name: "Seedling", nameHi: "बीज", nameTa: "விதை", emoji: "🌱", minXP: 0 },
  { level: 2, name: "Sprout", nameHi: "अंकुर", nameTa: "முளை", emoji: "🌿", minXP: 60 },
  { level: 3, name: "Sapling", nameHi: "पौधा", nameTa: "நாற்று", emoji: "🌳", minXP: 180 },
  { level: 4, name: "Bloom", nameHi: "खिलना", nameTa: "மலர்ச்சி", emoji: "🌸", minXP: 360 },
  { level: 5, name: "Blossom", nameHi: "फूल", nameTa: "மலர்", emoji: "🌺", minXP: 600 },
  { level: 6, name: "Lotus", nameHi: "कमल", nameTa: "தாமரை", emoji: "🪷", minXP: 1000 },
  { level: 7, name: "Radiant", nameHi: "चमकदार", nameTa: "ஒளிரும்", emoji: "☀️", minXP: 1500 },
];

export const NUDGE_MESSAGES = [
  { en: "You're doing amazing, mama! Every healthy choice matters 🌟", hi: "आप बहुत अच्छा कर रही हैं, माँ! हर स्वस्थ विकल्प मायने रखता है 🌟", ta: "நீங்கள் அருமையாக செய்கிறீர்கள், அம்மா! ஒவ்வொரு ஆரோக்கியமான தேர்வும் முக்கியம் 🌟" },
  { en: "Your baby feels your love through every healthy habit 💕", hi: "आपका शिशु आपके हर स्वस्थ आदत से प्यार महसूस करता है 💕", ta: "உங்கள் குழந்தை ஒவ்வொரு ஆரோக்கியமான பழக்கத்திலும் உங்கள் அன்பை உணர்கிறது 💕" },
  { en: "Small steps lead to big changes. Keep going! 🚶‍♀️", hi: "छोटे कदम बड़े बदलाव लाते हैं। आगे बढ़ती रहें! 🚶‍♀️", ta: "சிறிய அடிகள் பெரிய மாற்றங்களை ஏற்படுத்தும். தொடருங்கள்! 🚶‍♀️" },
  { en: "Stay hydrated — your body is building a miracle 💧", hi: "हाइड्रेटेड रहें — आपका शरीर एक चमत्कार बना रहा है 💧", ta: "நீர் அருந்துங்கள் — உங்கள் உடல் ஒரு அதிசயத்தை உருவாக்குகிறது 💧" },
  { en: "Your dedication inspires us. You're a wonderful mother! 🌺", hi: "आपकी लगन हमें प्रेरित करती है। आप एक अद्भुत माँ हैं! 🌺", ta: "உங்கள் அர்ப்பணிப்பு எங்களை ஊக்குவிக்கிறது. நீங்கள் ஒரு அற்புதமான தாய்! 🌺" },
  { en: "Remember: rest is productive too. Take care of yourself 😴", hi: "याद रखें: आराम भी उत्पादक है। अपना ख्याल रखें 😴", ta: "நினைவில் கொள்ளுங்கள்: ஓய்வும் உற்பத்தித்திறன் கொண்டது. உங்களை கவனித்துக் கொள்ளுங்கள் 😴" },
  { en: "Every supplement you take gives your baby strength 💪", hi: "आपकी हर दवाई आपके शिशु को ताकत देती है 💪", ta: "நீங்கள் எடுக்கும் ஒவ்வொரு மாத்திரையும் உங்கள் குழந்தைக்கு வலிமை தருகிறது 💪" },
  { en: "A healthy mama means a healthy baby. You got this! 🎯", hi: "स्वस्थ माँ का मतलब स्वस्थ बच्चा। आप यह कर सकती हैं! 🎯", ta: "ஆரோக்கியமான அம்மா என்றால் ஆரோக்கியமான குழந்தை. உங்களால் முடியும்! 🎯" },
  { en: "Your streak shows your commitment. Proud of you! 🔥", hi: "आपकी स्ट्रीक आपकी प्रतिबद्धता दर्शाती है। गर्व है! 🔥", ta: "உங்கள் தொடர்ச்சி உங்கள் அர்ப்பணிப்பை காட்டுகிறது. பெருமை! 🔥" },
  { en: "One day at a time. You're building the best start for your baby 🌈", hi: "एक दिन एक समय। आप अपने बच्चे के लिए सबसे अच्छी शुरुआत बना रहीं 🌈", ta: "ஒரு நாள் ஒரு நேரம். உங்கள் குழந்தைக்கு சிறந்த தொடக்கத்தை உருவாக்குகிறீர்கள் 🌈" },
];

export function getDailyNudge(language: "en" | "hi" | "ta" | string): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const nudge = NUDGE_MESSAGES[dayOfYear % NUDGE_MESSAGES.length];
  if (language === "hi") return nudge.hi;
  if (language === "ta") return nudge.ta;
  return nudge.en;
}

export function getLevel(xp: number): LevelDef {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(xp: number): LevelDef | null {
  const current = getLevel(xp);
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}
