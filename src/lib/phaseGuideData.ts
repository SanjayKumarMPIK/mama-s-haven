// ─── Phase-aware guide data for non-pregnancy life stages ────────────────────

export interface PhaseGuideWeek {
  week: number;
  title: string;
  description: string;
  tips: string[];
  nutrition: string[];
  activity: string[];
  warnings: string[];
}

// ─── PUBERTY: 4-week menstrual cycle guide ──────────────────────────────────
export const PUBERTY_GUIDE: PhaseGuideWeek[] = [
  {
    week: 1,
    title: "Menstrual Phase (Days 1–5)",
    description: "Your period has started. The uterus sheds its lining. It's normal to experience cramps, fatigue, and mood changes. This is a time to rest and take care of yourself.",
    tips: [
      "Use clean, hygienic menstrual products (pads, cups, or cloth — change every 4-6 hours)",
      "Track your period start date in a diary or app",
      "Apply a warm compress on your lower belly for cramp relief",
      "Rest when needed — it's okay to take it easy",
      "Talk to a trusted adult if cramps are very severe"
    ],
    nutrition: [
      "Drink plenty of warm water and herbal tea (ginger, tulsi)",
      "Iron-rich foods: spinach, beetroot, dates, jaggery, pomegranate",
      "Avoid excess caffeine, cold beverages, and junk food",
      "Eat small frequent meals to maintain energy",
      "Include vitamin C foods (amla, lemon) to help iron absorption"
    ],
    activity: [
      "Light stretching or gentle yoga (child's pose, butterfly pose)",
      "Short walks to ease cramps",
      "Avoid intense workouts if you feel weak",
      "Practice deep breathing for pain relief",
      "Get 8-9 hours of sleep"
    ],
    warnings: [
      "Soaking through a pad/cloth every hour (excessive bleeding)",
      "Period lasting more than 7 days consistently",
      "Severe pain that doesn't respond to warm compress or rest",
      "Feeling dizzy or fainting during periods",
      "No period by age 15 — consult a doctor"
    ]
  },
  {
    week: 2,
    title: "Follicular Phase (Days 6–13)",
    description: "Your body is preparing for the next cycle. Estrogen rises, energy increases, and you may feel more confident and active. This is a great time for learning and physical activity.",
    tips: [
      "Your energy is at its highest — great time for exercise and study",
      "Maintain a regular sleep schedule",
      "Practice good hygiene — daily bathing and clean clothes",
      "Learn about your body — understanding menstruation is empowering",
      "Build healthy friendships and communicate openly"
    ],
    nutrition: [
      "Balanced meals with protein (eggs, paneer, dal, sprouts)",
      "Calcium-rich foods for growing bones (milk, curd, ragi, sesame)",
      "Fruits and vegetables — aim for 5 servings daily",
      "Whole grains (roti, brown rice, oats) for sustained energy",
      "Nuts and seeds as healthy snacks"
    ],
    activity: [
      "Engage in sports, dance, or outdoor activities",
      "Strength-building exercises (push-ups, squats, skipping)",
      "Join a community class or team sport",
      "Practice good posture — important for growing spines",
      "Spend time outdoors for vitamin D"
    ],
    warnings: [
      "Unusual discharge with bad smell or itching",
      "Persistent acne that is painful or cystic",
      "Excessive hair growth in unusual areas",
      "Feeling excessively tired despite rest",
      "Mood swings that interfere with daily life"
    ]
  },
  {
    week: 3,
    title: "Ovulation Phase (Days 14–16)",
    description: "An egg is released from the ovary. You may notice clearer skin, higher energy, and slight lower abdominal discomfort. Understanding this phase helps with body awareness.",
    tips: [
      "You may notice clear, stretchy vaginal discharge — this is normal",
      "Some girls feel mild pain on one side of the lower belly (mittelschmerz)",
      "This is the most fertile phase of the cycle",
      "Great time for creative activities and social interactions",
      "Continue maintaining menstrual hygiene awareness"
    ],
    nutrition: [
      "Anti-inflammatory foods: turmeric (haldi), ginger, green leafy vegetables",
      "Omega-3 rich foods: walnuts, flaxseeds, fish (if non-vegetarian)",
      "Zinc-rich foods: pumpkin seeds, chickpeas, cashews",
      "Stay well hydrated — 8 glasses of water daily",
      "Avoid processed and packaged foods"
    ],
    activity: [
      "Peak energy — ideal for high-intensity exercise",
      "Try new activities: swimming, cycling, badminton",
      "Group activities and team sports",
      "Morning yoga or exercise routine",
      "Practice mindfulness for emotional balance"
    ],
    warnings: [
      "Severe mid-cycle pain that lasts more than 2 days",
      "Heavy mid-cycle bleeding (not just spotting)",
      "Persistent bloating or discomfort",
      "Signs of hormonal imbalance (irregular cycles after age 16)",
      "Any unwanted pressure or uncomfortable situations — tell a trusted adult"
    ]
  },
  {
    week: 4,
    title: "Luteal Phase (Days 17–28)",
    description: "Progesterone rises as your body prepares for the next period. You may experience PMS symptoms: bloating, mood swings, food cravings, breast tenderness, and acne.",
    tips: [
      "PMS is normal — mood swings, bloating, and cravings are common",
      "Keep menstrual products ready for your upcoming period",
      "Try journaling or talking to friends about how you feel",
      "Avoid skipping meals — maintain steady blood sugar",
      "Prepare a small period kit for school (pads, wipes, change of clothes)"
    ],
    nutrition: [
      "Magnesium-rich foods to reduce PMS: dark chocolate (small amount), bananas, almonds",
      "Vitamin B6 foods: potatoes, chickpeas, poultry",
      "Reduce salt to minimize bloating",
      "Warm soups and herbal tea for comfort",
      "Avoid excess sugar — it worsens mood swings"
    ],
    activity: [
      "Moderate exercise like walking, slow jogging, or yoga",
      "Stretching and breathing exercises to manage PMS discomfort",
      "Avoid overexertion if feeling fatigued",
      "Sleep is crucial — maintain 8-9 hours",
      "Relaxation techniques: warm bath, reading, hobbies"
    ],
    warnings: [
      "Extreme mood changes (depression, anxiety) that disrupt life",
      "Severe breast pain or lumps",
      "Very irregular cycles (more than 45 days apart after age 16)",
      "Sudden weight gain or loss",
      "Persistent fatigue or weakness — get hemoglobin checked"
    ]
  }
];

// ─── FAMILY PLANNING: 4-week guide ──────────────────────────────────────────
export const FAMILY_PLANNING_GUIDE: PhaseGuideWeek[] = [
  {
    week: 1,
    title: "Understanding Your Fertility",
    description: "Learn about your fertility window, ovulation tracking, and how to optimize your chances of conception — or effectively prevent pregnancy based on your goals.",
    tips: [
      "Track your menstrual cycle for at least 3 months to understand patterns",
      "Learn to identify your fertile window (typically days 10-16 of a 28-day cycle)",
      "Discuss family planning goals openly with your partner",
      "Schedule a preconception health checkup with your doctor",
      "Review any current medications with your doctor for safety"
    ],
    nutrition: [
      "Start folic acid (400 mcg daily) at least 3 months before trying to conceive",
      "Iron-rich foods: spinach, lentils, beetroot, dates, pomegranate",
      "Whole grains, fresh fruits, and vegetables daily",
      "Reduce caffeine to less than 200mg/day",
      "Avoid alcohol and smoking completely"
    ],
    activity: [
      "Maintain a healthy weight — BMI between 18.5-24.9",
      "Regular moderate exercise (30 min daily)",
      "Yoga and stress reduction techniques",
      "Adequate sleep (7-8 hours)",
      "Reduce occupational hazards if any"
    ],
    warnings: [
      "Irregular periods lasting more than 3 months",
      "Heavy or painful periods that worsen over time",
      "Unable to conceive after 12 months of trying (6 months if >35)",
      "History of miscarriage or ectopic pregnancy",
      "Any pelvic pain or abnormal discharge"
    ]
  },
  {
    week: 2,
    title: "Preconception Health & Lifestyle",
    description: "Optimize your health before conception. Both partners' health matters. Focus on nutrition, eliminating harmful substances, and building a supportive environment.",
    tips: [
      "Both partners should get health screenings (blood tests, infections)",
      "Update vaccinations (rubella, hepatitis B, varicella)",
      "Review genetic history with a counselor if needed",
      "Create a budget plan for pregnancy and childbirth",
      "Build a support network of family and community"
    ],
    nutrition: [
      "DHA and omega-3 fatty acids (walnuts, flaxseeds, fish oil)",
      "Vitamin D — morning sunlight for 15-20 minutes",
      "Zinc-rich foods: pumpkin seeds, sesame, legumes",
      "Antioxidant-rich foods: berries, green tea, turmeric",
      "Calcium: milk, curd, ragi, sesame seeds"
    ],
    activity: [
      "Build a consistent exercise routine you enjoy",
      "Manage stress through meditation, hobbies, or counseling",
      "Reduce screen time before bed for better sleep",
      "Practice pelvic floor exercises (Kegels)",
      "Connect with your partner through shared activities"
    ],
    warnings: [
      "Thyroid problems (get TSH tested)",
      "PCOS symptoms: irregular periods, excessive hair, acne, weight gain",
      "Diabetes or high blood sugar",
      "High blood pressure",
      "Mental health concerns — seek support early"
    ]
  },
  {
    week: 3,
    title: "Contraception & Spacing",
    description: "Understanding modern contraception options and ideal pregnancy spacing. The WHO recommends at least 2 years between pregnancies for best maternal and child health outcomes.",
    tips: [
      "Discuss contraception options with your healthcare provider",
      "WHO recommends: 2 years between pregnancies for best outcomes",
      "Understand reversible vs. permanent methods",
      "Emergency contraception is available — know when and how",
      "ASHA workers can help you access free government family planning services"
    ],
    nutrition: [
      "Maintain a balanced nutritious diet regardless of planning stage",
      "Green leafy vegetables and seasonal fruits daily",
      "Adequate protein intake (dal, eggs, milk, paneer)",
      "Limit processed foods, sugar, and trans fats",
      "Iron and calcium supplementation if deficient"
    ],
    activity: [
      "Stay physically active — 150 minutes of moderate exercise per week",
      "Yoga for hormonal balance and fertility",
      "Walking and outdoor activities",
      "Pelvic health exercises",
      "Mental wellness activities: journaling, art, music"
    ],
    warnings: [
      "Side effects of contraception that concern you — always discuss with a doctor",
      "Missed pills or failed contraception — know your options",
      "Signs of sexually transmitted infections",
      "Persistent pelvic pain",
      "Any forced decisions about family planning — seek help"
    ]
  },
  {
    week: 4,
    title: "Government Schemes & Community Support",
    description: "India offers many government programs supporting family planning and maternal health. Learn about the schemes available to you and how to access free healthcare services.",
    tips: [
      "Janani Suraksha Yojana (JSY): cash benefits for institutional delivery",
      "Pradhan Mantri Matru Vandana Yojana: ₹5000 for first pregnancy",
      "Free contraception available at all government health facilities",
      "ASHA workers: your community health link — reach out for help",
      "Maintain your Mother-Child Protection Card (MCP card)"
    ],
    nutrition: [
      "Take-Home Ration (THR) from Anganwadi — for pregnant and nursing mothers",
      "Mid-day meal schemes for school-going children",
      "ICDS supplementary nutrition for women and children",
      "Seasonal and local foods are the most nutritious and affordable",
      "Community kitchen resources if available"
    ],
    activity: [
      "Visit your nearest Anganwadi centre for health services",
      "Attend community health awareness programs",
      "Register early for pregnancy at the nearest PHC/CHC",
      "Build a network with other mothers in your community",
      "Learn about your rights as a mother and patient"
    ],
    warnings: [
      "Being denied healthcare — report to the PHC medical officer",
      "Financial exploitation by unofficial health providers",
      "Unregistered medicines or supplements",
      "Violence or coercion related to family planning decisions",
      "Any emergency — call 108 for ambulance, 104 for health helpline"
    ]
  }
];

// ─── MENOPAUSE / PERIMENOPAUSE: 4-week guide ─────────────────────────────────
export const MENOPAUSE_GUIDE: PhaseGuideWeek[] = [
  {
    week: 1,
    title: "Understanding Perimenopause & Menopause",
    description: "Menopause typically occurs between ages 45-55. Perimenopause can start years before your last period. Understanding the changes helps you manage symptoms and stay healthy.",
    tips: [
      "Menopause = 12 months without a period. Before that is perimenopause",
      "Track your periods — irregular cycles are the first sign",
      "Hot flashes affect 75% of women — they're normal and temporary",
      "Sleep disruptions are common — establish a bedtime routine",
      "Discuss hormone therapy options with your gynecologist"
    ],
    nutrition: [
      "Calcium is critical: 1200mg/day (milk, curd, ragi, sesame, green leafy vegetables)",
      "Vitamin D: morning sun exposure 20 min + supplements if needed",
      "Phytoestrogen foods: soy products (tofu, soy milk), flaxseeds, sesame",
      "Reduce caffeine and spicy food — they trigger hot flashes",
      "Increase omega-3: walnuts, flaxseeds, fish"
    ],
    activity: [
      "Weight-bearing exercises to prevent osteoporosis (walking, climbing stairs)",
      "Yoga and deep breathing for hot flash management",
      "30 minutes of moderate exercise daily",
      "Balance exercises to prevent falls",
      "Strength training 2-3 times per week"
    ],
    warnings: [
      "Any vaginal bleeding after 12 months of no periods — see doctor immediately",
      "Persistent severe hot flashes affecting daily life",
      "Mood changes: severe depression or anxiety",
      "Rapid weight gain or difficulty losing weight",
      "Bone pain or fractures from minor falls"
    ]
  },
  {
    week: 2,
    title: "Managing Menopausal Symptoms",
    description: "From hot flashes to mood swings, sleep issues to joint pain — practical strategies to manage common menopausal symptoms naturally and with medical support when needed.",
    tips: [
      "Layer clothing — easy to remove during hot flashes",
      "Keep a cold water bottle by your bedside",
      "Practice slow, deep breathing when a hot flash starts",
      "Vaginal dryness: water-based lubricants and moisturizers help",
      "Consider counseling or support groups for emotional support"
    ],
    nutrition: [
      "Cooling foods: cucumber, watermelon, coconut water, buttermilk",
      "B-vitamin foods for mood: whole grains, bananas, leafy greens",
      "Magnesium for sleep: almonds, dark chocolate, spinach",
      "Fiber for digestion and cholesterol: oats, fruits, vegetables",
      "Limit alcohol — worsens hot flashes and sleep issues"
    ],
    activity: [
      "Swimming — excellent low-impact exercise for joint relief",
      "Morning walks in sunlight for mood and vitamin D",
      "Pelvic floor exercises (Kegels) for bladder health",
      "Tai chi or gentle yoga for balance and flexibility",
      "Regular stretching to relieve joint stiffness"
    ],
    warnings: [
      "Urinary incontinence that worsens — pelvic floor therapy available",
      "Memory problems or severe brain fog affecting daily function",
      "Heart palpitations or chest discomfort",
      "Joint pain with swelling — could indicate arthritis",
      "Severe mood swings or feelings of hopelessness — seek professional help"
    ]
  },
  {
    week: 3,
    title: "Heart & Bone Health Post-Menopause",
    description: "After menopause, estrogen decline increases risk of heart disease and osteoporosis. Proactive health management is essential for a long, active life.",
    tips: [
      "Heart disease risk increases after menopause — get regular checkups",
      "Bone density scan (DEXA) recommended after age 50",
      "Monitor blood pressure, cholesterol, and blood sugar regularly",
      "Keep an emergency medical ID with your health information",
      "Stay socially active — loneliness worsens health outcomes"
    ],
    nutrition: [
      "Heart-healthy diet: reduce saturated fats, increase fiber",
      "Anti-inflammatory spices: turmeric, ginger, garlic, fenugreek",
      "Potassium-rich foods for blood pressure: banana, sweet potato, spinach",
      "Limit salt to less than 5g/day",
      "Green tea and nuts for heart health"
    ],
    activity: [
      "Brisk walking for 30-45 minutes — best heart exercise",
      "Weight-bearing exercises for bone strength",
      "Balance training: standing on one foot, heel-to-toe walking",
      "Regular BP and sugar monitoring at home",
      "Annual health checkup — don't skip it"
    ],
    warnings: [
      "Chest pain, breathlessness, or arm/jaw pain — call 108 immediately",
      "Sudden severe headache — could indicate stroke",
      "Fracture from minor impact — osteoporosis screening needed",
      "Blood in urine or stool — consult doctor",
      "Sudden vision or hearing changes"
    ]
  },
  {
    week: 4,
    title: "Thriving Through Menopause",
    description: "Menopause is not the end — it's a new beginning. Focus on mental wellness, community engagement, preventive health, and embracing this transformative phase with confidence.",
    tips: [
      "Menopause is a natural transition, not a disease",
      "Many women report increased confidence and freedom post-menopause",
      "Pursue hobbies, education, or volunteering — stay engaged",
      "Strengthen relationships with family and friends",
      "Regular health screenings: mammography, cervical smear, thyroid"
    ],
    nutrition: [
      "Focus on anti-aging nutrition: colorful vegetables, berries, nuts",
      "Protein for muscle maintenance: dal, paneer, eggs, legumes",
      "Probiotics for gut health: curd, buttermilk, fermented foods",
      "Hydrate well — skin and joint health depend on it",
      "Iron needs decrease after menopause — shift focus to calcium and D"
    ],
    activity: [
      "Find an exercise you love — dancing, gardening, walking groups",
      "Mental exercises: puzzles, reading, learning new skills",
      "Meditation and mindfulness for inner peace",
      "Travel, explore, and try new experiences",
      "Teach and mentor younger women in your community"
    ],
    warnings: [
      "Any new breast lumps — get checked promptly",
      "Persistent fatigue not improving with rest",
      "Unexplained weight loss",
      "Post-menopausal bleeding — always needs investigation",
      "Depression lasting more than 2 weeks — professional support available"
    ]
  }
];
