import { AWARENESS_ROUTES } from "./awarenessRoutes";

export interface AwarenessCardData {
  id: string;
  title: string;
  description: string;
  route: string;
  gradient: string;
  borderColor: string;
}

export const AWARENESS_CARDS: AwarenessCardData[] = [
  {
    id: "early-symptoms",
    title: "Early Symptoms",
    description: "Recognise the early warning signs of cancer. Early detection saves lives and improves treatment outcomes.",
    route: AWARENESS_ROUTES.earlySymptoms,
    gradient: "from-rose-50 via-pink-50/50 to-white",
    borderColor: "border-rose-200/60",
  },
  {
    id: "self-exam-guide",
    title: "Self-Exam Guide",
    description: "Learn how to perform regular self-examinations. Simple steps you can do at home for early detection.",
    route: AWARENESS_ROUTES.selfExamGuide,
    gradient: "from-sky-50 via-cyan-50/50 to-white",
    borderColor: "border-sky-200/60",
  },
  {
    id: "myths-facts",
    title: "Myths vs Facts",
    description: "Separate cancer myths from medical facts. Get accurate, science-based information to make informed decisions.",
    route: AWARENESS_ROUTES.mythsFacts,
    gradient: "from-amber-50 via-orange-50/50 to-white",
    borderColor: "border-amber-200/60",
  },
  {
    id: "prevention",
    title: "Lifestyle Prevention",
    description: "Reduce your cancer risk through healthy lifestyle choices. Small changes can make a big difference.",
    route: AWARENESS_ROUTES.prevention,
    gradient: "from-emerald-50 via-teal-50/50 to-white",
    borderColor: "border-emerald-200/60",
  },
  {
    id: "family-history",
    title: "Family History Awareness",
    description: "Understand how your family medical history affects your cancer risk and when to consider genetic counselling.",
    route: AWARENESS_ROUTES.familyHistory,
    gradient: "from-violet-50 via-purple-50/50 to-white",
    borderColor: "border-violet-200/60",
  },
  {
    id: "screening-awareness",
    title: "Screening Awareness",
    description: "Learn about recommended cancer screenings, mammograms, and the importance of regular health check-ups.",
    route: AWARENESS_ROUTES.screeningAwareness,
    gradient: "from-blue-50 via-indigo-50/50 to-white",
    borderColor: "border-blue-200/60",
  },
  {
    id: "emotional-support",
    title: "Emotional Support",
    description: "Find reassurance, calming guidance, and encouragement. You are not alone on this awareness journey.",
    route: AWARENESS_ROUTES.emotionalSupport,
    gradient: "from-pink-50 via-rose-50/50 to-white",
    borderColor: "border-pink-200/60",
  },
];

export interface SymptomItem {
  title: string;
  description: string;
  consultation: string;
}

export const EARLY_SYMPTOMS_CONTENT: SymptomItem[] = [
  {
    title: "Breast Lump or Thickening",
    description: "A lump or thickened area in the breast or underarm that feels different from surrounding tissue. Not all lumps are cancerous, but any new lump should be evaluated by a healthcare professional.",
    consultation: "Consult a doctor if you feel any new lump or thickening that persists beyond your menstrual cycle.",
  },
  {
    title: "Breast Shape Changes",
    description: "Noticeable changes in the size, shape, or contour of one breast compared to the other. This may include swelling, distortion, or asymmetry that was not present before.",
    consultation: "Seek medical advice if you observe persistent changes in breast shape or size.",
  },
  {
    title: "Skin Dimpling",
    description: "Skin that looks like the peel of an orange, with small dimples or indentations. This can occur due to changes beneath the skin affecting the connective tissue.",
    consultation: "Consult a healthcare provider if you notice any dimpling, puckering, or texture changes on your breast skin.",
  },
  {
    title: "Nipple Inversion",
    description: "A nipple that turns inward or becomes flattened. While some people naturally have inverted nipples, a recent change in nipple direction should be checked.",
    consultation: "Visit a doctor if your nipple changes direction, becomes inverted, or develops a new flattening.",
  },
  {
    title: "Nipple Discharge",
    description: "Any fluid coming from the nipple, especially if it is clear, bloody, or occurs without squeezing. Discharge from only one breast or from a single duct warrants attention.",
    consultation: "Consult a healthcare professional if you experience spontaneous nipple discharge, particularly if it is bloody or clear.",
  },
  {
    title: "Persistent Breast Pain",
    description: "Ongoing pain or discomfort in the breast or nipple area that does not go away with your menstrual cycle. While most breast pain is not cancer-related, persistent pain should be evaluated.",
    consultation: "Seek medical evaluation if you have persistent, localised breast pain that does not resolve.",
  },
  {
    title: "Redness or Swelling",
    description: "Redness, warmth, or swelling of the breast skin that may indicate an underlying issue. This can sometimes be confused with an infection, but persistent symptoms need investigation.",
    consultation: "Consult a doctor if you have persistent redness, warmth, or swelling in any area of the breast.",
  },
  {
    title: "Underarm Swelling",
    description: "Swollen lymph nodes or lumps in the armpit area. This can sometimes be the first sign of breast cancer, even before a breast lump is detectable.",
    consultation: "Seek medical attention if you notice any swelling, lumps, or tenderness in your underarm area.",
  },
];

export interface SelfExamStep {
  title: string;
  method: string;
  steps: string[];
  tip: string;
}

export const SELF_EXAM_CONTENT: SelfExamStep[] = [
  {
    title: "Mirror Check",
    method: "Visual Examination in Front of a Mirror",
    steps: [
      "Stand undressed from the waist up in front of a well-lit mirror with your arms relaxed at your sides.",
      "Look at both breasts for any visible changes in size, shape, or contour.",
      "Raise your arms overhead and look for the same changes.",
      "Place your hands on your hips and press firmly to flex your chest muscles. Observe both breasts for dimpling, puckering, or changes.",
      "Check your nipples for any inversion, discharge, or changes in direction.",
    ],
    tip: "Perform the mirror check in good lighting. Use a full-length mirror for a complete view.",
  },
  {
    title: "Shower Check",
    method: "Manual Examination While Bathing",
    steps: [
      "Use the pads of your three middle fingers, not the fingertips, to examine your breasts.",
      "Apply varying pressure levels: light pressure for the tissue close to the skin, medium for deeper tissue, and firm for tissue closest to the chest wall.",
      "Use a circular motion, moving in a spiral pattern from the outer edge of the breast toward the nipple.",
      "Examine the entire breast area including the armpit and up to the collarbone.",
      "Check both breasts using the same pattern each month for consistency.",
    ],
    tip: "Wet, soapy skin makes it easier for your fingers to glide smoothly over the breast tissue during a shower check.",
  },
  {
    title: "Lying-Down Check",
    method: "Lying-Down Manual Examination",
    steps: [
      "Lie down on your back with a small pillow or folded towel under your right shoulder. Place your right arm behind your head.",
      "Using your left hand, examine your right breast using the pads of your three middle fingers.",
      "Use small circular motions covering the entire breast area in a systematic pattern (vertical strip or spiral).",
      "Vary pressure levels to feel all layers of breast tissue.",
      "Repeat on the left side by placing the pillow under your left shoulder with your left arm behind your head, using your right hand to examine.",
    ],
    tip: "Lying down spreads the breast tissue evenly against the chest wall, making it easier to feel any unusual areas.",
  },
];

export interface MythFact {
  myth: string;
  fact: string;
}

export const MYTHS_FACTS_CONTENT: MythFact[] = [
  {
    myth: "Finding a lump in your breast means you have cancer.",
    fact: "Most breast lumps are benign (non-cancerous). Up to 80% of breast lumps turn out to be benign cysts, fibroadenomas, or other non-cancerous conditions. However, any new lump should be evaluated by a healthcare professional.",
  },
  {
    myth: "Only women with a family history of breast cancer get it.",
    fact: "Most people diagnosed with breast cancer have no family history of the disease. Only about 5-10% of breast cancers are hereditary. The majority are sporadic, meaning they occur by chance due to genetic mutations that happen throughout life.",
  },
  {
    myth: "Antiperspirants or deodorants cause breast cancer.",
    fact: "There is no conclusive scientific evidence linking antiperspirants or deodorants to breast cancer. Extensive research has found no increased risk among people who use these products.",
  },
  {
    myth: "Men cannot get breast cancer.",
    fact: "Men can and do get breast cancer, although it is rare. Male breast cancer accounts for about 1% of all breast cancer cases. Men should also be aware of breast changes and report any unusual symptoms to their doctor.",
  },
  {
    myth: "If you have a healthy lifestyle, you will not get cancer.",
    fact: "While a healthy lifestyle significantly reduces your cancer risk, it does not guarantee prevention. Cancer can develop due to factors beyond lifestyle, including genetic predisposition, environmental exposures, and random cellular mutations. A healthy lifestyle is one part of a comprehensive prevention strategy.",
  },
  {
    myth: "Cancer is always painful in its early stages.",
    fact: "Many cancers in their early stages cause no pain or discomfort at all. This is why regular screenings and self-examinations are so important. By the time pain occurs, cancer may have already advanced. Do not wait for pain to seek medical advice.",
  },
  {
    myth: "Mammograms cause cancer due to radiation.",
    fact: "The radiation exposure from a mammogram is extremely low and the benefits of early detection far outweigh the minimal risk. The amount of radiation used in a mammogram is comparable to the natural background radiation you receive over 7-8 weeks of daily life.",
  },
  {
    myth: "Breast cancer only affects older women.",
    fact: "While the risk of breast cancer increases with age, it can affect people of all ages, including younger women and men. Regular breast awareness and self-examinations are important at every age.",
  },
];

export interface PreventionItem {
  title: string;
  icon: string;
  description: string;
  tips: string[];
}

export const PREVENTION_CONTENT: PreventionItem[] = [
  {
    title: "Regular Exercise",
    icon: "Activity",
    description: "Physical activity helps maintain a healthy weight, regulates hormones, and strengthens the immune system. Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week.",
    tips: [
      "Incorporate brisk walking, jogging, swimming, or cycling into your routine.",
      "Include strength training exercises at least twice per week.",
      "Break activity into shorter sessions if needed – 30 minutes, 5 times per week.",
      "Choose activities you enjoy to maintain consistency.",
    ],
  },
  {
    title: "Healthy Diet",
    icon: "Apple",
    description: "A nutrient-rich diet supports your body's natural defences. Emphasise whole foods, plenty of fruits and vegetables, lean proteins, and healthy fats while limiting processed foods.",
    tips: [
      "Eat at least 5 servings of fruits and vegetables daily, focusing on a variety of colours.",
      "Choose whole grains like brown rice, quinoa, and whole wheat over refined grains.",
      "Include fibre-rich foods such as legumes, nuts, and seeds.",
      "Limit red meat consumption and avoid processed meats.",
    ],
  },
  {
    title: "Quality Sleep",
    icon: "Moon",
    description: "Adequate sleep is essential for immune function and cellular repair. Poor sleep patterns have been linked to increased cancer risk. Aim for 7-9 hours of quality sleep each night.",
    tips: [
      "Maintain a consistent sleep schedule, even on weekends.",
      "Create a relaxing bedtime routine with dim lighting and no screens.",
      "Keep your bedroom cool, dark, and quiet for optimal rest.",
      "Avoid caffeine and heavy meals within 2-3 hours of bedtime.",
    ],
  },
  {
    title: "Avoid Smoking & Limit Alcohol",
    icon: "Ban",
    description: "Tobacco use is the single largest preventable cause of cancer worldwide. Alcohol consumption is also linked to several types of cancer. Eliminating or reducing these substances significantly lowers your risk.",
    tips: [
      "If you smoke, seek support to quit – your risk reduces significantly over time after stopping.",
      "Limit alcohol intake to no more than one drink per day for women.",
      "Consider alcohol-free days each week.",
      "Avoid exposure to second-hand smoke as well.",
    ],
  },
  {
    title: "Maintain Healthy Weight",
    icon: "Scale",
    description: "Excess body weight is linked to an increased risk of several cancers, including breast, colorectal, and uterine cancer. Maintaining a healthy weight through diet and exercise is a powerful prevention strategy.",
    tips: [
      "Monitor your BMI and aim to keep it within the healthy range (18.5-24.9).",
      "Focus on gradual, sustainable weight management rather than crash diets.",
      "Combine a balanced diet with regular physical activity for best results.",
      "Consult a healthcare provider for personalised weight management guidance.",
    ],
  },
  {
    title: "Breastfeeding Benefits",
    icon: "Baby",
    description: "Breastfeeding provides protective benefits against breast cancer for the mother. The longer you breastfeed, the greater the protective effect. This is believed to be due to hormonal changes during lactation.",
    tips: [
      "Exclusive breastfeeding for the first 6 months is recommended for maximum benefit.",
      "Extended breastfeeding up to 2 years or beyond continues to provide protective effects.",
      "Every month of breastfeeding reduces breast cancer risk incrementally.",
      "Even short-term breastfeeding offers some level of protection.",
    ],
  },
];

export interface FamilyHistoryItem {
  relation: string;
  description: string;
  riskNote: string;
}

export const FAMILY_HISTORY_CONTENT: FamilyHistoryItem[] = [
  {
    relation: "Mother",
    description: "A mother diagnosed with breast cancer, especially before menopause, significantly increases her daughter's risk. The risk is higher if the cancer occurred in both breasts or was detected before age 50.",
    riskNote: "If your mother had breast cancer, talk to your doctor about starting screenings earlier than age 40.",
  },
  {
    relation: "Grandmother",
    description: "Both maternal and paternal grandmothers' cancer history matters. A history of breast or ovarian cancer in either grandmother should be discussed with your healthcare provider.",
    riskNote: "Family history on your father's side is equally important – do not overlook it.",
  },
  {
    relation: "Sibling",
    description: "A sister or brother with breast cancer more than doubles your personal risk. The risk is highest when a sibling is diagnosed at a young age or with cancer in both breasts.",
    riskNote: "If you have a sibling with breast cancer, consider genetic counselling for BRCA mutation testing.",
  },
  {
    relation: "Other Relatives",
    description: "Cancer in extended family members such as aunts, cousins, or nieces also contributes to your risk profile. Multiple relatives on the same side of the family with breast, ovarian, or pancreatic cancer are particularly significant.",
    riskNote: "Create a complete family health history chart covering at least three generations for your doctor.",
  },
];

export interface ScreeningItem {
  title: string;
  description: string;
  recommendations: string[];
  icon: string;
}

export const SCREENING_CONTENT: ScreeningItem[] = [
  {
    title: "Self-Awareness",
    icon: "Heart",
    description: "Being breast-aware means knowing what is normal for your breasts and noticing any changes promptly. This is the foundation of early detection and complements regular clinical screenings.",
    recommendations: [
      "Perform monthly breast self-examinations, ideally a few days after your menstrual period ends.",
      "Familiarise yourself with the normal look and feel of your breasts.",
      "Note any changes and report them to your healthcare provider promptly.",
      "Remember that most changes are not cancer, but they should always be checked.",
    ],
  },
  {
    title: "Mammogram Education",
    icon: "Search",
    description: "A mammogram is an X-ray of the breast that can detect tumours before they can be felt. It is the most effective screening tool for breast cancer and can detect cancer 2-3 years before a lump becomes palpable.",
    recommendations: [
      "Women aged 40-44 should have the option to start annual mammograms.",
      "Women aged 45-54 should have mammograms every year.",
      "Women aged 55 and older can switch to mammograms every 2 years or continue yearly screening.",
      "If you have a family history or genetic risk, your doctor may recommend earlier or more frequent screening.",
    ],
  },
  {
    title: "Screening Importance",
    icon: "Shield",
    description: "Regular cancer screening saves lives. When breast cancer is detected early (localised stage), the 5-year survival rate is 99%. Late-stage detection drops this rate significantly. Screening is your best defence.",
    recommendations: [
      "Early detection through screening reduces breast cancer mortality by 20-40%.",
      "Regular screening finds smaller tumours that are easier to treat.",
      "Screening can detect ductal carcinoma in situ, the earliest form of breast cancer.",
      "Follow your doctor's recommended screening schedule based on your personal risk factors.",
    ],
  },
];

export interface EmotionalSupportItem {
  title: string;
  content: string;
  color: string;
  icon: string;
}

export const EMOTIONAL_SUPPORT_CONTENT: EmotionalSupportItem[] = [
  {
    title: "You Are Not Alone",
    content: "Thousands of women navigate their cancer awareness journey every day. By educating yourself and staying proactive about your health, you are taking a powerful step toward empowerment. Every small step matters, and there is a whole community of support around you.",
    color: "from-rose-100 to-pink-50",
    icon: "Heart",
  },
  {
    title: "Knowledge is Power",
    content: "Understanding your body and being aware of changes gives you control over your health journey. Fear often comes from the unknown, and education is the antidote. You are building strength through awareness, and that is truly commendable.",
    color: "from-sky-100 to-blue-50",
    icon: "Lightbulb",
  },
  {
    title: "It Is Okay to Feel Concerned",
    content: "Feeling worried or anxious about cancer is completely normal. These feelings do not make you weak – they make you human. Acknowledge your feelings, talk to trusted friends or family, and remember that being proactive about your health is a form of self-love and courage.",
    color: "from-amber-100 to-yellow-50",
    icon: "Brain",
  },
  {
    title: "Reach Out for Support",
    content: "Support groups, counselling services, and helplines are available for anyone with concerns about cancer. Talking to others who share similar experiences can be incredibly healing. You deserve support, and it is available whenever you need it.",
    color: "from-purple-100 to-violet-50",
    icon: "Users",
  },
  {
    title: "Focus on What You Can Control",
    content: "While you cannot control all health outcomes, you can control your awareness, your lifestyle choices, and your commitment to regular check-ups. Channel your energy into these positive actions. Every healthy choice, every self-exam, every doctor's visit is a victory.",
    color: "from-emerald-100 to-teal-50",
    icon: "Target",
  },
  {
    title: "Celebrate Your Proactiveness",
    content: "By engaging with this educational module, you are already taking a vital step for your well-being. Learning about early symptoms, self-examinations, and prevention makes you an advocate for your own health. That deserves recognition and celebration.",
    color: "from-pink-100 to-rose-50",
    icon: "Trophy",
  },
];
