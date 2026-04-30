export interface WeekData {
  week: number;
  title: string;
  trimester: 1 | 2 | 3;
  babyDev: {
    size: string;
    highlights: string[];
  };
  motherChanges: {
    physical: string[];
    emotional: string[];
  };
  symptoms: {
    name: string;
    intensity: "low" | "medium" | "high";
  }[];
  careTips: string[];
  nutritionFocus: string[];
  redFlags: string[];
}

export const timelineData: WeekData[] = Array.from({ length: 40 }).map((_, i) => {
  const week = i + 1;
  let trimester: 1 | 2 | 3 = 1;
  if (week >= 13 && week <= 26) trimester = 2;
  if (week >= 27) trimester = 3;

  // Generate generic dummy data that varies slightly based on trimester/week
  const sizeProgression = [
    "Poppy seed", "Sesame seed", "Lentil", "Blueberry", "Kidney bean",
    "Grape", "Kumquat", "Fig", "Lime", "Peapod", "Plum", "Peach",
    "Lemon", "Navel orange", "Avocado", "Turnip", "Bell pepper", "Heirloom tomato",
    "Banana", "Carrot", "Spaghetti squash", "Papaya", "Grapefruit", "Cantaloupe",
    "Cauliflower", "Lettuce", "Rutabaga", "Eggplant", "Butternut squash", "Cabbage",
    "Coconut", "Jicama", "Pineapple", "Cantaloupe", "Honeydew melon", "Romaine lettuce",
    "Swiss chard", "Winter melon", "Mini watermelon", "Small pumpkin"
  ];

  return {
    week,
    title: `Week ${week}`,
    trimester,
    babyDev: {
      size: sizeProgression[i] || "Unknown",
      highlights: [
        `Development highlight for week ${week}`,
        "Growing rapidly",
        "Forming vital connections"
      ],
    },
    motherChanges: {
      physical: trimester === 1 ? ["Uterus expanding", "Breast changes"] : trimester === 2 ? ["Baby bump showing", "Increased energy"] : ["Feeling heavy", "Practice contractions"],
      emotional: trimester === 1 ? ["Mood swings", "Anxiety mixed with excitement"] : trimester === 2 ? ["Feeling more settled", "Nesting instincts"] : ["Impatient", "Anxious about birth"],
    },
    symptoms: [
      { name: trimester === 1 ? "Nausea" : trimester === 2 ? "Round ligament pain" : "Back aches", intensity: trimester === 1 ? "high" : "medium" },
      { name: trimester === 1 ? "Fatigue" : trimester === 2 ? "Increased appetite" : "Frequent urination", intensity: "medium" },
    ],
    careTips: [
      "Stay hydrated",
      "Rest when you feel tired",
      "Gentle stretching"
    ],
    nutritionFocus: [
      trimester === 1 ? "Folic Acid" : trimester === 2 ? "Calcium & Iron" : "Protein & DHA",
      "Adequate water intake"
    ],
    redFlags: [
      "Heavy bleeding",
      "Severe abdominal pain",
      "Continuous severe headaches"
    ]
  };
});

// Adding some custom data for a few weeks to make it realistic
timelineData[3].babyDev.highlights = ["Implantation occurs", "Amniotic sac forms"];
timelineData[11].babyDev.highlights = ["Reflexes develop", "Fingers and toes separate"];
timelineData[19].babyDev.highlights = ["Baby learns to swallow", "Meconium forms"];
timelineData[39].babyDev.highlights = ["Baby is full term", "Lungs are mature"];
