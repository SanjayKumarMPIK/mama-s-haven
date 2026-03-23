export type SymptomSeverity = "normal" | "monitor" | "visit-center" | "emergency";

export interface Symptom {
  id: string;
  name: string;
  nameHi: string;
  nameTa: string;
  category: string;
  severity: SymptomSeverity;
  description: string;
  advice: string;
  escalation: string;
}

export const EMERGENCY_KEYWORDS = [
  "hemorrhage", "bleeding heavily", "heavy bleeding", "blood clot", "gush of blood",
  "no fetal movement", "baby not moving", "baby stopped moving", "can't feel baby",
  "seizure", "convulsion", "unconscious", "fainted", "fainting",
  "severe headache", "blurred vision", "seeing spots", "vision changes",
  "severe abdominal pain", "severe stomach pain", "sharp pain",
  "high fever", "fever above 100", "high temperature",
  "water broke", "water breaking", "leaking fluid", "gush of fluid",
  "chest pain", "difficulty breathing", "can't breathe",
  "swelling face", "swollen face", "sudden swelling",
  "preeclampsia", "eclampsia",
];

export const SYMPTOMS: Symptom[] = [
  {
    id: "morning-sickness",
    name: "Morning Sickness / Nausea",
    nameHi: "सुबह की मिचली",
    nameTa: "காலை நோய் / குமட்டல்",
    category: "Digestive",
    severity: "normal",
    description: "Nausea and vomiting, especially in the first trimester, affecting up to 80% of pregnant women.",
    advice: "Eat small frequent meals. Try ginger tea, crackers before getting up. Avoid strong smells. Stay hydrated.",
    escalation: "If you cannot keep any food or water down for 24 hours, visit your healthcare center. This could be hyperemesis gravidarum.",
  },
  {
    id: "mild-cramping",
    name: "Mild Cramping",
    nameHi: "हल्की ऐंठन",
    nameTa: "லேசான வலி",
    category: "Pain",
    severity: "normal",
    description: "Light cramping similar to period cramps, common in early pregnancy as the uterus grows.",
    advice: "Rest, change positions, use a warm (not hot) compress. Mild cramping is usually normal.",
    escalation: "If cramps are severe, one-sided, or accompanied by bleeding, visit your nearest health center immediately.",
  },
  {
    id: "fatigue",
    name: "Fatigue / Tiredness",
    nameHi: "थकान",
    nameTa: "சோர்வு",
    category: "General",
    severity: "normal",
    description: "Feeling very tired is extremely common, especially in first and third trimesters.",
    advice: "Rest when you can. Nap during the day if possible. Stay hydrated and eat iron-rich foods.",
    escalation: "If fatigue is extreme with dizziness, rapid heartbeat, or breathlessness, visit your health center.",
  },
  {
    id: "back-pain",
    name: "Back Pain",
    nameHi: "कमर दर्द",
    nameTa: "முதுகு வலி",
    category: "Pain",
    severity: "normal",
    description: "Lower back pain is common as pregnancy progresses due to weight changes and posture shifts.",
    advice: "Practice good posture. Use a pregnancy support belt. Sleep on your side with a pillow between knees. Gentle stretches help.",
    escalation: "If back pain is severe, comes in waves, or is accompanied by fever or bleeding, seek medical attention.",
  },
  {
    id: "headache",
    name: "Headache",
    nameHi: "सिरदर्द",
    nameTa: "தலைவலி",
    category: "Pain",
    severity: "monitor",
    description: "Headaches can occur due to hormonal changes, dehydration, or stress.",
    advice: "Rest in a quiet dark room. Stay hydrated. Avoid screen time. Paracetamol is generally safe (ask doctor).",
    escalation: "If headache is severe, sudden, persistent, or accompanied by vision changes or swelling, visit your health center immediately — could indicate preeclampsia.",
  },
  {
    id: "swelling-feet",
    name: "Swelling in Feet/Ankles",
    nameHi: "पैरों में सूजन",
    nameTa: "பாதங்களில் வீக்கம்",
    category: "Swelling",
    severity: "monitor",
    description: "Mild swelling in feet and ankles is common, especially in third trimester.",
    advice: "Elevate feet when sitting. Avoid standing for long. Reduce salt. Drink water. Ankle circles help.",
    escalation: "If swelling is sudden, severe, in face/hands, or with headache and vision changes, go to hospital immediately — possible preeclampsia.",
  },
  {
    id: "vaginal-discharge",
    name: "Vaginal Discharge",
    nameHi: "योनि स्राव",
    nameTa: "யோனி வெளியேற்றம்",
    category: "Reproductive",
    severity: "monitor",
    description: "Increased thin, white, milky discharge is normal in pregnancy (leukorrhea).",
    advice: "Wear cotton undergarments. Change frequently. Do not douche. Keep area clean and dry.",
    escalation: "If discharge is green/yellow, foul-smelling, chunky, or accompanied by itching/burning, visit your healthcare provider.",
  },
  {
    id: "heavy-bleeding",
    name: "Heavy Bleeding",
    nameHi: "भारी रक्तस्राव",
    nameTa: "அதிக இரத்தப்போக்கு",
    category: "Emergency",
    severity: "emergency",
    description: "Heavy vaginal bleeding during pregnancy requires immediate medical attention.",
    advice: "Do NOT wait. Go to the nearest hospital or PHC immediately. Call 108 for ambulance.",
    escalation: "THIS IS AN EMERGENCY. Call 108 ambulance or go to hospital NOW. Heavy bleeding can indicate placenta previa, placental abruption, or miscarriage.",
  },
  {
    id: "reduced-fetal-movement",
    name: "Reduced Fetal Movement",
    nameHi: "शिशु की कम हलचल",
    nameTa: "குறைந்த கருவின் அசைவு",
    category: "Emergency",
    severity: "emergency",
    description: "If you notice your baby moving less than usual or not at all after 28 weeks.",
    advice: "Lie on your left side and count kicks. You should feel at least 10 movements in 2 hours. Drink cold water and eat something sweet to stimulate movement.",
    escalation: "If you feel fewer than 10 movements in 2 hours, GO TO THE HOSPITAL IMMEDIATELY. This needs urgent monitoring.",
  },
  {
    id: "severe-headache-vision",
    name: "Severe Headache with Vision Changes",
    nameHi: "तेज सिरदर्द और आंखों में बदलाव",
    nameTa: "கடுமையான தலைவலி மற்றும் பார்வை மாற்றங்கள்",
    category: "Emergency",
    severity: "emergency",
    description: "Severe headache combined with blurred vision, seeing spots, or light sensitivity.",
    advice: "This could be a sign of preeclampsia or eclampsia, which are serious pregnancy complications.",
    escalation: "GO TO HOSPITAL IMMEDIATELY. Call 108. Preeclampsia can be life-threatening for mother and baby if untreated.",
  },
  {
    id: "water-breaking",
    name: "Water Breaking (Premature)",
    nameHi: "पानी की थैली का फटना (समय से पहले)",
    nameTa: "நீர் உடைதல் (முன்கூட்டியே)",
    category: "Emergency",
    severity: "emergency",
    description: "Sudden gush or steady trickle of fluid from the vagina before 37 weeks.",
    advice: "Note the time, color, and amount. Do not put anything in the vagina. Lie down on your left side.",
    escalation: "GO TO HOSPITAL IMMEDIATELY. Premature rupture of membranes needs urgent medical care to protect both mother and baby.",
  },
  {
    id: "seizure",
    name: "Seizure / Convulsion",
    nameHi: "दौरा / ऐंठन",
    nameTa: "வலிப்பு",
    category: "Emergency",
    severity: "emergency",
    description: "Seizures during pregnancy can indicate eclampsia, a life-threatening emergency.",
    advice: "If someone near you has a seizure: Keep them safe from injury. Do not put anything in their mouth. Turn them on their side.",
    escalation: "CALL 108 AMBULANCE IMMEDIATELY. Eclampsia is a medical emergency. Get to the nearest hospital.",
  },
  {
    id: "heartburn",
    name: "Heartburn / Acid Reflux",
    nameHi: "सीने में जलन",
    nameTa: "நெஞ்செரிச்சல்",
    category: "Digestive",
    severity: "normal",
    description: "Burning sensation in chest/throat, common especially in second and third trimester.",
    advice: "Eat small meals. Avoid spicy/oily food. Don't lie down right after eating. Elevate your head while sleeping.",
    escalation: "If heartburn is severe and unrelieved by diet changes, ask your health worker about safe antacids.",
  },
  {
    id: "constipation",
    name: "Constipation",
    nameHi: "कब्ज",
    nameTa: "மலச்சிக்கல்",
    category: "Digestive",
    severity: "normal",
    description: "Very common due to hormonal changes and iron supplements.",
    advice: "Eat high-fiber foods (fruits, vegetables, whole grains). Drink plenty of water. Mild exercise like walking helps.",
    escalation: "If you have severe pain, bleeding from rectum, or no bowel movement for 4+ days, visit your health center.",
  },
  {
    id: "leg-cramps",
    name: "Leg Cramps",
    nameHi: "पैर में ऐंठन",
    nameTa: "கால் பிடிப்பு",
    category: "Pain",
    severity: "normal",
    description: "Sudden painful cramps in calves, often at night, common in second and third trimester.",
    advice: "Stretch calf muscles before bed. Stay hydrated. Eat magnesium-rich foods (bananas, nuts). Walk daily.",
    escalation: "If leg is swollen, red, warm, or painful all the time (not just cramps), visit health center — could indicate blood clot.",
  },
  {
    id: "high-bp",
    name: "High Blood Pressure",
    nameHi: "उच्च रक्तचाप",
    nameTa: "உயர் இரத்த அழுத்தம்",
    category: "Cardiovascular",
    severity: "visit-center",
    description: "Blood pressure above 140/90 during pregnancy needs monitoring.",
    advice: "Get regular BP checks. Reduce salt. Rest and stay calm. Take prescribed medications.",
    escalation: "Visit your health center for regular monitoring. High BP can lead to preeclampsia. If BP is above 160/110, go to hospital immediately.",
  },
  {
    id: "burning-urination",
    name: "Painful / Burning Urination",
    nameHi: "पेशाब में जलन",
    nameTa: "எரியும் சிறுநீர் கழித்தல்",
    category: "Urinary",
    severity: "visit-center",
    description: "Pain or burning during urination may indicate a urinary tract infection (UTI).",
    advice: "Drink plenty of water. Wipe front to back. Don't hold urine. Wear cotton undergarments.",
    escalation: "Visit your health center soon. UTIs during pregnancy need antibiotics. Untreated UTIs can lead to kidney infections and preterm labor.",
  },
  {
    id: "itching-severe",
    name: "Severe Itching (whole body)",
    nameHi: "पूरे शरीर में खुजली",
    nameTa: "கடுமையான அரிப்பு (முழு உடல்)",
    category: "Skin",
    severity: "visit-center",
    description: "Intense itching especially on palms and soles, without a rash, in third trimester.",
    advice: "Use mild soap. Moisturize. Wear loose cotton clothing. Avoid hot showers.",
    escalation: "Visit your health center. Severe itching can indicate obstetric cholestasis (liver condition). Blood test needed to check bile acids.",
  },
];

export function checkEmergencyKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getSymptomsBySeverity(severity: SymptomSeverity): Symptom[] {
  return SYMPTOMS.filter((s) => s.severity === severity);
}

export const SEVERITY_COLORS: Record<SymptomSeverity, { bg: string; text: string; border: string }> = {
  normal: { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
  monitor: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  "visit-center": { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  emergency: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
};
