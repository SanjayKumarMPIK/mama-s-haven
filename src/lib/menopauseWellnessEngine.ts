// ─── Menopause Wellness Engine ───────────────────────────────────────────────
// Pure logic module — no React imports. Generates personalized recommendations
// from menopauseProfile data.

import type { MenopauseProfile, MenopauseLogEntry } from "@/hooks/useMenopause";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FoodCard {
  meal: "breakfast" | "lunch" | "dinner" | "snacks";
  emoji: string;
  items: string[];
  highlight?: string; // special note
}

export interface ExerciseDay {
  day: string;
  activity: string;
  duration: string;
  emoji: string;
  note?: string;
}

export interface SleepTip {
  emoji: string;
  title: string;
  description: string;
}

export interface DailyGoalItem {
  id: string;
  block: "morning" | "afternoon" | "evening";
  emoji: string;
  label: string;
  type: "food" | "exercise" | "water" | "activity" | "sleep";
}

export interface AIInsightCard {
  type: "warning" | "positive" | "info";
  emoji: string;
  title: string;
  message: string;
  color: string; // tailwind bg class
}

// ─── Food Recommendations ────────────────────────────────────────────────────

export function generateFoodPlan(profile: MenopauseProfile): FoodCard[] {
  const { diet, conditions, familyHistory } = profile;

  const basePhytoestrogen = ["Flaxseeds", "Tofu", "Soy milk", "Sesame seeds"];
  const calciumFoods = ["Milk / fortified plant milk", "Yoghurt", "Ragi (finger millet)", "Green leafy veggies"];
  const vitaminD = ["Morning sunlight (15 min)", "Fortified cereals", "Mushrooms"];
  const hydration = ["8+ glasses of water daily", "Coconut water", "Herbal teas (chamomile, peppermint)"];

  const breakfast: FoodCard = { meal: "breakfast", emoji: "🌅", items: [] };
  const lunch: FoodCard = { meal: "lunch", emoji: "☀️", items: [] };
  const dinner: FoodCard = { meal: "dinner", emoji: "🌙", items: [] };
  const snacks: FoodCard = { meal: "snacks", emoji: "🍎", items: [] };

  if (diet === "veg") {
    breakfast.items = ["Ragi porridge with flaxseeds", "Soy milk smoothie with banana", "Fortified cereal with nuts"];
    lunch.items = ["Dal with spinach + brown rice", "Tofu stir-fry with veggies", "Paneer salad with sesame dressing"];
    dinner.items = ["Khichdi with ghee", "Mixed veggie curry + roti", "Moong dal soup with greens"];
    snacks.items = ["Roasted makhana (fox nuts)", "Trail mix (almonds, walnuts, seeds)", "Fresh fruit with curd"];
    breakfast.highlight = "Tip: Add B12-fortified foods or supplements — essential for vegetarian diets";
  } else if (diet === "mixed") {
    breakfast.items = ["Eggs with whole wheat toast", "Oats porridge with nuts & seeds", "Smoothie with flaxseeds & berries"];
    lunch.items = ["Grilled salmon/fish with quinoa", "Chicken salad with leafy greens", "Dal + brown rice with veggies"];
    dinner.items = ["Lean chicken soup", "Fish curry with roti", "Egg bhurji with multigrain bread"];
    snacks.items = ["Boiled egg", "Greek yoghurt with berries", "Handful of walnuts (omega-3!)"];
    lunch.highlight = "Great choice! Salmon & eggs are rich in omega-3 for heart & brain health";
  } else {
    // junk → gentle upgrade plan
    breakfast.items = ["Swap sugary cereal → oats with honey & banana", "Swap white bread → whole wheat toast with peanut butter", "Add: a glass of milk or soy milk"];
    lunch.items = ["Swap fried snacks → a wrap with veggies & protein", "Add a side salad with any meal", "Try dal rice instead of instant noodles once a week"];
    dinner.items = ["Swap takeout → homemade khichdi (easy to make!)", "Try a simple veggie stir-fry with rice", "Warm soup before dinner to reduce overeating"];
    snacks.items = ["Swap chips → roasted makhana or popcorn", "Swap soda → lemon water or coconut water", "Keep fruit handy for sweet cravings"];
    breakfast.highlight = "No pressure! Small swaps make a big difference over time 💛";
  }

  // Condition-specific additions
  if (conditions.includes("thyroid")) {
    dinner.highlight = (dinner.highlight ? dinner.highlight + " | " : "") +
      "⚡ Thyroid note: Limit raw broccoli, cabbage, cauliflower — cook them instead";
  }

  if (familyHistory.includes("osteoporosis")) {
    snacks.highlight = (snacks.highlight ? snacks.highlight + " | " : "") +
      "🦴 Bone boost: Extra calcium & vitamin D — add ragi, sesame, and morning sunlight";
  }

  return [breakfast, lunch, dinner, snacks];
}

export function getFoodsToLimit(): { emoji: string; item: string; reason: string }[] {
  return [
    { emoji: "☕", item: "Caffeine", reason: "Can worsen hot flashes and disrupt sleep" },
    { emoji: "🍷", item: "Alcohol", reason: "Triggers hot flashes and affects bone density" },
    { emoji: "🌶️", item: "Spicy foods", reason: "Common hot flash trigger for many women" },
    { emoji: "🍬", item: "Excess sugar", reason: "Can worsen mood swings and fatigue" },
    { emoji: "🧂", item: "High sodium", reason: "Can increase blood pressure and bloating" },
  ];
}

// ─── Exercise Recommendations ────────────────────────────────────────────────

export function generateExercisePlan(profile: MenopauseProfile): ExerciseDay[] {
  const { symptoms, familyHistory } = profile;
  const highJointPain = symptoms.jointPain >= 3;
  const highFatigue = symptoms.fatigue >= 4;
  const osteoRisk = familyHistory.includes("osteoporosis");

  const duration = highFatigue ? "15–20 min" : "30–40 min";
  const timeNote = highFatigue ? "Morning preferred — energy is usually highest" : undefined;

  if (highJointPain) {
    return [
      { day: "Monday", activity: "Gentle yoga flow", duration, emoji: "🧘", note: "Low impact — easy on joints" },
      { day: "Tuesday", activity: "Swimming / water walking", duration, emoji: "🏊", note: "Water supports your joints beautifully" },
      { day: "Wednesday", activity: "Leisurely walk", duration, emoji: "🚶", note: timeNote },
      { day: "Thursday", activity: "Chair exercises + stretching", duration, emoji: "🪑", note: "Strength without strain" },
      { day: "Friday", activity: "Swimming / water aerobics", duration, emoji: "🏊", note: undefined },
      { day: "Saturday", activity: "Gentle yoga + meditation", duration, emoji: "🧘", note: "Mind-body connection" },
      { day: "Sunday", activity: "Rest or light stretching", duration: "10–15 min", emoji: "💤", note: "Your body deserves rest too" },
    ];
  }

  const plan: ExerciseDay[] = [
    { day: "Monday", activity: "Brisk walking", duration, emoji: "🚶", note: osteoRisk ? "Weight-bearing — great for bones!" : timeNote },
    { day: "Tuesday", activity: "Strength training (upper body)", duration, emoji: "💪", note: "Light dumbbells or resistance bands" },
    { day: "Wednesday", activity: "Yoga / Pilates", duration, emoji: "🧘", note: "Flexibility + balance" },
    { day: "Thursday", activity: "Strength training (lower body)", duration, emoji: "💪", note: osteoRisk ? "Weight-bearing exercises build bone density" : undefined },
    { day: "Friday", activity: "Brisk walking or cycling", duration, emoji: "🚴", note: undefined },
    { day: "Saturday", activity: "Dance / aerobics class", duration, emoji: "💃", note: "Have fun with it!" },
    { day: "Sunday", activity: "Gentle stretching or rest", duration: "15–20 min", emoji: "🌿", note: "Listen to your body" },
  ];

  return plan;
}

export function getExerciseNotes(profile: MenopauseProfile): string[] {
  const notes: string[] = [
    "Aim for 150 minutes of moderate activity per week",
    "Include strength training at least 2 times per week",
  ];
  if (profile.symptoms.jointPain >= 3) {
    notes.push("⚠️ Avoid high-impact activities like running or jumping — your joints will thank you");
  }
  if (profile.symptoms.fatigue >= 4) {
    notes.push("💡 Keep sessions short (15–20 min) — consistency matters more than intensity");
  }
  if (profile.familyHistory.includes("osteoporosis")) {
    notes.push("🦴 Weight-bearing exercises daily are especially important for bone health");
  }
  return notes;
}

// ─── Sleep Hygiene ───────────────────────────────────────────────────────────

export function generateSleepTips(profile: MenopauseProfile): SleepTip[] {
  const tips: SleepTip[] = [];

  if (profile.symptoms.nightSweats >= 3) {
    tips.push(
      { emoji: "🌬️", title: "Keep your room cool", description: "Set room temperature to 18–20°C. Use a fan near your bed." },
      { emoji: "👕", title: "Breathable sleepwear", description: "Choose cotton or moisture-wicking fabrics. Avoid synthetic materials." },
      { emoji: "🛏️", title: "Cooling pillow", description: "Try a gel cooling pillow or place a cold damp cloth on your forehead." },
      { emoji: "🪟", title: "Layer your bedding", description: "Use thin layers you can easily remove if you feel warm during the night." }
    );
  }

  if (profile.symptoms.anxiety >= 3) {
    tips.push(
      { emoji: "🫁", title: "4-7-8 Breathing", description: "Inhale 4 seconds, hold 7 seconds, exhale 8 seconds. Repeat 4 times before bed." },
      { emoji: "📝", title: "Brain dump journal", description: "Write down worries before bed — getting them out of your head helps you sleep." },
      { emoji: "🧘", title: "Body scan meditation", description: "Starting from toes, slowly relax each body part. 5 minutes is enough." }
    );
  }

  // General tips for all
  tips.push(
    { emoji: "⏰", title: "Consistent schedule", description: "Go to bed and wake up at the same time every day, even on weekends." },
    { emoji: "📱", title: "Screen-free hour", description: "No screens 1 hour before bed. Blue light disrupts melatonin production." },
    { emoji: "🥜", title: "Magnesium-rich evening foods", description: "Almonds, pumpkin seeds, or a banana before bed can improve sleep quality." },
    { emoji: "💧", title: "Limit fluids before bed", description: "Stop drinking 2 hours before sleep to reduce nighttime bathroom trips." },
    { emoji: "🚫", title: "Avoid late caffeine", description: "No coffee or tea after 2 PM — caffeine stays in your system for hours." }
  );

  return tips;
}

// ─── Daily Goals Generator ───────────────────────────────────────────────────

export function generateDailyGoals(profile: MenopauseProfile, recentLogs: MenopauseLogEntry[] = []): DailyGoalItem[] {
  const foodPlan = generateFoodPlan(profile);
  const exercisePlan = generateExercisePlan(profile);
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayExercise = exercisePlan.find((e) => e.day === dayNames[dayIndex]);

  const breakfastItem = foodPlan.find((f) => f.meal === "breakfast")?.items[0] ?? "Healthy breakfast";
  const lunchItem = foodPlan.find((f) => f.meal === "lunch")?.items[0] ?? "Balanced lunch";
  const dinnerItem = foodPlan.find((f) => f.meal === "dinner")?.items[0] ?? "Light dinner";

  // Calculate recent trends from logs
  const now = new Date();
  const last7 = recentLogs.filter((l) => {
    const diff = (now.getTime() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  const avgSleep = last7.length > 0 ? last7.reduce((s, l) => s + l.sleepHrs, 0) / last7.length : 7;
  const avgMood = last7.length > 0 ? last7.reduce((s, l) => s + l.mood, 0) / last7.length : 4;
  const avgPain = last7.length > 0 ? last7.reduce((s, l) => s + l.painLevel, 0) / last7.length : 1;
  const avgHotFlashes = last7.length > 0 ? last7.reduce((s, l) => s + l.hotFlashCount, 0) / last7.length : 0;

  let eveningActivity = profile.symptoms.anxiety >= 3 ? "4-7-8 breathing exercise" : "Journaling or light reading";
  if (avgSleep < 6) {
    eveningActivity = "No screens 1 hour before bed (improve sleep)";
  } else if (avgMood <= 2) {
    eveningActivity = "Do something that brings you joy for 15 mins";
  }

  let afternoonActivity = "10-minute walk after lunch";
  if (avgPain >= 3) {
    afternoonActivity = "Gentle stretching or heat/cold on painful joints";
  }

  let morningWater = "Drink 2 glasses of water";
  if (avgHotFlashes >= 3) {
    morningWater = "Drink 2 glasses of cold water to help stay cool";
  }

  const goals: DailyGoalItem[] = [
    // Morning
    { id: "m-wake", block: "morning", emoji: "🌅", label: "Wake up at your target time", type: "activity" },
    { id: "m-breakfast", block: "morning", emoji: "🥣", label: breakfastItem, type: "food" },
    { id: "m-water-1", block: "morning", emoji: "💧", label: morningWater, type: "water" },

    // Afternoon
    { id: "a-lunch", block: "afternoon", emoji: "🍱", label: lunchItem, type: "food" },
    { id: "a-walk", block: "afternoon", emoji: "🚶", label: afternoonActivity, type: "exercise" },
    { id: "a-water-2", block: "afternoon", emoji: "💧", label: "Hydration check — 4 more glasses", type: "water" },

    // Evening
    { id: "e-dinner", block: "evening", emoji: "🍽️", label: dinnerItem, type: "food" },
    { id: "e-winddown", block: "evening", emoji: "🫁", label: eveningActivity, type: "activity" },
    { id: "e-sleep", block: "evening", emoji: "😴", label: "In bed by your target sleep time", type: "sleep" },
  ];

  // Add exercise goal if today has one
  if (todayExercise && todayExercise.activity !== "Rest or light stretching" && todayExercise.activity !== "Gentle stretching or rest") {
    goals.splice(3, 0, {
      id: "m-exercise",
      block: "morning",
      emoji: todayExercise.emoji,
      label: `${todayExercise.activity} (${todayExercise.duration})`,
      type: "exercise",
    });
  }

  // Adjust for high hot flashes during the day
  if (avgHotFlashes >= 3 && avgPain < 3) {
     const aWalkIndex = goals.findIndex(g => g.id === "a-walk");
     if (aWalkIndex !== -1 && goals[aWalkIndex].label === "10-minute walk after lunch") {
        goals[aWalkIndex].label = "Rest in a cool room for 10 minutes";
     }
  }

  return goals;
}

// ─── AI Insight Cards ────────────────────────────────────────────────────────

export function generateInsightCards(logs: MenopauseLogEntry[], profile: MenopauseProfile | null): AIInsightCard[] {
  const cards: AIInsightCard[] = [];
  if (logs.length === 0) {
    cards.push({
      type: "info",
      emoji: "📝",
      title: "Start logging to unlock insights",
      message: "Log your symptoms daily on the calendar and we'll generate personalised insights for you.",
      color: "bg-blue-50 border-blue-200",
    });
    return cards;
  }

  // Last 7 days
  const now = new Date();
  const last7 = logs.filter((l) => {
    const diff = (now.getTime() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  if (last7.length > 0) {
    const avgSleep = last7.reduce((sum, l) => sum + l.sleepHrs, 0) / last7.length;
    const avgMood = last7.reduce((sum, l) => sum + l.mood, 0) / last7.length;
    const totalHotFlashes = last7.reduce((sum, l) => sum + l.hotFlashCount, 0);

    // Sleep alert
    if (avgSleep < 5) {
      cards.push({
        type: "warning",
        emoji: "😴",
        title: "Your sleep needs attention",
        message: `You've averaged ${avgSleep.toFixed(1)} hours of sleep this week. Try our sleep hygiene tips in the Wellness Plan — small changes can make a big difference.`,
        color: "bg-amber-50 border-amber-200",
      });
    }

    // Hot flash trend
    if (last7.length >= 3) {
      const firstHalf = last7.slice(0, Math.floor(last7.length / 2));
      const secondHalf = last7.slice(Math.floor(last7.length / 2));
      const firstAvg = firstHalf.reduce((s, l) => s + l.hotFlashCount, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, l) => s + l.hotFlashCount, 0) / secondHalf.length;

      if (secondAvg < firstAvg * 0.7) {
        cards.push({
          type: "positive",
          emoji: "🎉",
          title: "Hot flashes are trending down!",
          message: "Your hot flash frequency has been decreasing. Whatever you're doing, keep it up — you're doing amazing!",
          color: "bg-green-50 border-green-200",
        });
      } else if (totalHotFlashes > last7.length * 3) {
        cards.push({
          type: "info",
          emoji: "🔥",
          title: "Managing hot flashes",
          message: "You've had frequent hot flashes this week. Try avoiding caffeine & spicy foods, wear layers, and keep a cool drink handy.",
          color: "bg-orange-50 border-orange-200",
        });
      }
    }

    // Consecutive low mood
    const sortedByDate = [...last7].sort((a, b) => a.date.localeCompare(b.date));
    let consecutiveLowMood = 0;
    let maxConsecutive = 0;
    for (const log of sortedByDate) {
      if (log.mood <= 2) {
        consecutiveLowMood++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveLowMood);
      } else {
        consecutiveLowMood = 0;
      }
    }

    if (maxConsecutive >= 3) {
      cards.push({
        type: "warning",
        emoji: "💜",
        title: "You've been feeling low",
        message: "We noticed your mood has been low for a few days. This is completely normal during this transition. Consider talking to someone you trust, or try our Fun Activity section for a quick mood lift.",
        color: "bg-purple-50 border-purple-200",
      });
    } else if (avgMood >= 4) {
      cards.push({
        type: "positive",
        emoji: "✨",
        title: "You're glowing this week!",
        message: "Your mood has been great this week. Keep nurturing what's working for you — you deserve to feel this good!",
        color: "bg-green-50 border-green-200",
      });
    }
  }

  // Fill up to 3 cards
  if (cards.length < 3) {
    const fillers: AIInsightCard[] = [
      {
        type: "info",
        emoji: "💧",
        title: "Stay hydrated",
        message: "Drinking enough water can reduce the intensity of hot flashes and support overall wellbeing during menopause.",
        color: "bg-cyan-50 border-cyan-200",
      },
      {
        type: "info",
        emoji: "🏃",
        title: "Movement is medicine",
        message: "Even 15 minutes of gentle exercise daily can improve mood, sleep quality, and bone health.",
        color: "bg-teal-50 border-teal-200",
      },
      {
        type: "positive",
        emoji: "🌟",
        title: "You're taking charge",
        message: "By tracking your symptoms, you're building a powerful picture of your health. This knowledge is your superpower!",
        color: "bg-amber-50 border-amber-200",
      },
    ];
    while (cards.length < 3 && fillers.length > 0) {
      cards.push(fillers.shift()!);
    }
  }

  return cards.slice(0, 3);
}

// ─── Affirmations ────────────────────────────────────────────────────────────

export const AFFIRMATIONS: string[] = [
  "This new chapter of my life is filled with wisdom and grace.",
  "I embrace the changes in my body with love and patience.",
  "I am strong, resilient, and capable of handling anything.",
  "My body has carried me through incredible journeys — I honour it.",
  "I choose to focus on what I can control and release the rest.",
  "Every day I grow more comfortable in my own beautiful skin.",
  "I deserve rest, joy, and care — especially now.",
  "My experiences make me wiser, not older.",
  "I radiate warmth, confidence, and inner peace.",
  "I am grateful for my body and all it does for me.",
  "This transition is natural, and I move through it with grace.",
  "I attract positivity and release what no longer serves me.",
  "I am worthy of love, care, and compassion — from myself first.",
  "My best days are not behind me — they are unfolding right now.",
  "I find strength in stillness and power in patience.",
  "Every challenge I face makes me more resilient.",
  "I trust my body's wisdom — it knows what it needs.",
  "I am surrounded by love, and I share that love freely.",
  "My journey is unique and beautiful — I walk it with pride.",
  "I choose joy today, even in small moments.",
  "I listen to my body with kindness, not judgment.",
  "This is not an ending — it is a powerful transformation.",
  "I am more than my symptoms — I am full of life and purpose.",
  "I give myself permission to rest without guilt.",
  "My health is my priority, and I invest in it daily.",
  "I celebrate every small victory on this journey.",
  "I am enough, exactly as I am, right now.",
  "The world needs the wisdom and warmth I carry.",
  "I release fear and welcome this beautiful phase with open arms.",
  "Today, I choose to be gentle with myself — I've earned it.",
];

export const WEEKLY_CHALLENGES: string[] = [
  "Walk 10 minutes on 3 different days this week",
  "Try one new healthy recipe this week",
  "Practice deep breathing for 5 minutes daily",
  "Drink 8 glasses of water every day this week",
  "Go to bed 30 minutes earlier for 4 nights",
  "Write 3 things you're grateful for each morning",
  "Do 10 minutes of stretching every day",
  "Call or meet a friend who makes you smile",
  "Try a new fruit or vegetable this week",
  "Take a 20-minute nature walk twice this week",
  "Spend 10 minutes doing something creative daily",
  "Practice the 4-7-8 breathing exercise before bed",
];

export const HEALTH_FACTS: string[] = [
  "Hot flashes affect about 75% of women during menopause — you're not alone!",
  "Weight-bearing exercise can help maintain bone density during menopause.",
  "Phytoestrogens in soy and flaxseeds may help reduce hot flash intensity.",
  "The average age of menopause is 51, but it can happen anywhere from 45 to 55.",
  "Menopause is not a disease — it's a natural biological process.",
  "Regular exercise can reduce hot flash frequency by up to 50%.",
  "Calcium needs increase to 1200mg/day after menopause for bone health.",
  "Vaginal dryness affects up to 50% of postmenopausal women — it's very common and treatable.",
  "Mood changes during menopause are linked to hormonal shifts, not personality changes.",
  "Maintaining social connections has been shown to ease menopausal symptoms.",
  "Sleep problems during menopause can improve with consistent sleep schedules.",
  "Strength training helps maintain muscle mass and metabolism during menopause.",
  "Vitamin D is crucial during menopause for calcium absorption and bone health.",
  "Many women report increased confidence and freedom after menopause!",
  "Perimenopause can last 4–8 years before periods stop completely.",
];

export const UPLIFTING_QUOTES: string[] = [
  "\"You are not getting older, you are getting more remarkable.\" — Anonymous",
  "\"She made broken look beautiful and strong look invincible.\" — Ariana Dancu",
  "\"The most beautiful thing a woman can wear is confidence.\" — Blake Lively",
  "\"Life begins at the end of your comfort zone.\" — Neale Donald Walsch",
  "\"You don't stop laughing when you grow old; you grow old when you stop laughing.\"",
  "\"A woman is like a tea bag — you never know how strong she is until she's in hot water.\" — Eleanor Roosevelt",
  "\"The best time to plant a tree was 20 years ago. The second best time is now.\"",
  "\"What lies behind us and what lies before us are tiny matters compared to what lies within us.\" — Ralph Waldo Emerson",
];
