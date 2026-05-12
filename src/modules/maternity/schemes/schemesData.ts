import type { Scheme, SchemesByState } from "./types";

function s(
  id: string,
  name: string,
  description: string,
  benefits: string[],
  eligibility: string,
  type: Scheme["type"],
  badges: Scheme["badges"],
  state: string,
): Scheme {
  return { id, name, description, benefits, eligibility, type, badges, state };
}

const J = (st: string) =>
  s(
    `jsy-${st}`,
    "Janani Suraksha Yojana (JSY)",
    "A centrally sponsored scheme that provides cash assistance to pregnant women from below-poverty-line households for institutional delivery.",
    [
      "Cash assistance of ₹1,400–₹1,900 for institutional delivery",
      "₹600–₹700 for ASHA worker as performance-based incentive",
      "Reduces maternal and neonatal mortality by promoting hospital births",
      "Covers all government health institutions and accredited private facilities",
    ],
    "BPL pregnant women aged 19+ years eligible for institutional delivery; up to 2 live births.",
    "financial",
    ["cash_benefit"],
    st,
  );

const K = (st: string) =>
  s(
    `jssk-${st}`,
    "Janani Shishu Suraksha Karyakram (JSSK)",
    "Ensures free and cashless maternity services for pregnant women in government health institutions.",
    [
      "Free delivery including C-section at government facilities",
      "Free medicines, diagnostics, and blood transfusion",
      "Free transport from home to facility and back",
      "Free Diet during hospital stay for mother and newborn",
    ],
    "All pregnant women delivering in government health institutions.",
    "healthcare",
    ["free_delivery", "transport_support"],
    st,
  );

const P = (st: string) =>
  s(
    `pmmvy-${st}`,
    "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    "A centrally sponsored maternity benefit scheme providing cash incentives for the first live birth to compensate for wage loss.",
    [
      "Cash benefit of ₹5,000 in three installments during pregnancy and lactation",
      "Conditional cash transfer linked to antenatal care visits and vaccination",
      "Compensates for wage loss during pregnancy and childcare",
      "Promotes nutrition and health-seeking behaviour among pregnant women",
    ],
    "Pregnant women aged 19+ years for first live birth; excludes those covered under JSY or state schemes.",
    "financial",
    ["cash_benefit", "highly_recommended"],
    st,
  );

const M = (st: string) =>
  s(
    `pmsma-${st}`,
    "Pradhan Mantri Surakshit Matritva Yojana (PMSMA)",
    "Provides free antenatal check-ups on the 9th of every month at government facilities across the country.",
    [
      "Free comprehensive antenatal check-up including blood pressure, urine, and ultrasound",
      "Identification and management of high-risk pregnancies",
      "Free supplements including iron, folic acid, and calcium tablets",
      "Referral to higher centres for complicated pregnancies",
    ],
    "All pregnant women, especially those in their 4th–9th month of pregnancy.",
    "healthcare",
    ["highly_recommended"],
    st,
  );

export const schemesByState: SchemesByState = {
  "Andhra Pradesh": [
    s(
      "ap-amma-vodi",
      "Dr. YSR Amma Vodi",
      "A state flagship scheme providing financial assistance to mothers for the education of their children, covering school fees and expenses.",
      [
        "Annual financial assistance of ₹15,000 per mother for child education",
        "Covers school fees, books, and other educational expenses",
        "Direct benefit transfer to mother's bank account",
        "Reduces dropout rates and promotes girl child education",
      ],
      "Mothers of school-going children (Class 1 to Intermediate) in government and aided schools in Andhra Pradesh.",
      "financial",
      ["cash_benefit"],
      "Andhra Pradesh",
    ),
    J("Andhra Pradesh"),
    K("Andhra Pradesh"),
    P("Andhra Pradesh"),
  ],

  "Arunachal Pradesh": [
    J("Arunachal Pradesh"),
    K("Arunachal Pradesh"),
    P("Arunachal Pradesh"),
    M("Arunachal Pradesh"),
  ],

  Assam: [
    s(
      "assam-mamoni",
      "Mamoni Scheme",
      "A state scheme providing financial assistance to pregnant women for nutrition and healthcare during pregnancy.",
      [
        "Cash assistance of ₹10,000 in installments during pregnancy and post-delivery",
        "Linked to antenatal care visits and institutional delivery",
        "Promotes nutrition and health awareness among mothers",
        "Direct benefit transfer to the mother's Aadhaar-linked account",
      ],
      "All pregnant women in Assam belonging to BPL families, for up to 2 live births.",
      "financial",
      ["cash_benefit", "nutrition_support"],
      "Assam",
    ),
    J("Assam"),
    P("Assam"),
    K("Assam"),
  ],

  Bihar: [
    s(
      "bihar-mukhyamantri-kanya",
      "Mukhyamantri Kanya Utthan Yojana",
      "A state scheme aimed at improving the status of the girl child through education and health support.",
      [
        "Financial assistance at birth, school enrolment, and graduation milestones",
        "Encourages institutional delivery and timely vaccination",
        "Promotes girl child education and delays marriage",
        "Covers health and nutritional needs of the girl child",
      ],
      "Families with girl children in Bihar, conditional on institutional delivery and vaccination.",
      "financial",
      ["cash_benefit"],
      "Bihar",
    ),
    J("Bihar"),
    P("Bihar"),
    K("Bihar"),
  ],

  Chhattisgarh: [
    s(
      "cg-mahatari-jatan",
      "Mahatari Jatan Yojana",
      "A state scheme providing comprehensive maternity care and financial assistance to pregnant women in Chhattisgarh.",
      [
        "Cash assistance of ₹6,000 for institutional delivery",
        "Free medicines, diagnostics, and transport services",
        "Nutrition support during pregnancy and lactation",
        "Includes mother and child tracking for health follow-ups",
      ],
      "All pregnant women in Chhattisgarh, priority to BPL and tribal families.",
      "financial",
      ["cash_benefit", "nutrition_support"],
      "Chhattisgarh",
    ),
    J("Chhattisgarh"),
    K("Chhattisgarh"),
    M("Chhattisgarh"),
  ],

  Goa: [
    s(
      "goa-deendayal",
      "Deen Dayal Swasthya Seva Yojana",
      "A state health insurance scheme providing cashless treatment for maternity and other healthcare needs.",
      [
        "Cashless maternity care including delivery and C-section at empanelled hospitals",
        "Coverage up to ₹5 lakh per family per year",
        "Includes newborn care up to 1 year",
        "Covers pre and post-natal complications",
      ],
      "All residents of Goa with valid health cards; covers maternity benefits.",
      "insurance",
      ["free_delivery"],
      "Goa",
    ),
    J("Goa"),
    P("Goa"),
    K("Goa"),
  ],

  Gujarat: [
    s(
      "gujarat-chiranjeevi",
      "Chiranjeevi Yojana",
      "A state public-private partnership scheme providing free maternity care to BPL families in Gujarat.",
      [
        "Free C-section and emergency obstetric care at empanelled private hospitals",
        "Covers all delivery-related expenses including medicines and hospital stay",
        "Transport incentive for reaching the facility",
        "24/7 emergency obstetric services available",
      ],
      "BPL pregnant women in Gujarat with up to 2 children.",
      "healthcare",
      ["free_delivery"],
      "Gujarat",
    ),
    s(
      "gujarat-bal-sakha",
      "Bal Sakha Yojana",
      "A state scheme providing financial support for nutrition and healthcare of children and mothers.",
      [
        "Cash assistance for nutritional food during pregnancy",
        "Support for infant health check-ups and vaccinations",
        "Educational materials for newborn care",
        "Counselling sessions on breastfeeding and nutrition",
      ],
      "BPL families in Gujarat with children under 5 years.",
      "nutrition",
      ["nutrition_support"],
      "Gujarat",
    ),
    J("Gujarat"),
    P("Gujarat"),
  ],

  Haryana: [
    P("Haryana"),
    J("Haryana"),
    s(
      "haryana-laado",
      "Laado Lakshmi Scheme",
      "A state scheme to improve the gender ratio and provide financial security for girl children.",
      [
        "Cash assistance of ₹5,500 per year from birth to age 18 for girl child",
        "Maturity amount of approximately ₹1 lakh at age 18",
        "Linked to birth registration, vaccination, and school attendance",
        "Promotes girl child education and prevents sex-selective abortion",
      ],
      "Families in Haryana with a girl child, subject to birth registration and vaccination compliance.",
      "financial",
      ["cash_benefit"],
      "Haryana",
    ),
    K("Haryana"),
  ],

  "Himachal Pradesh": [
    s(
      "hp-mother-child",
      "Himachal Mother & Child Scheme",
      "A state scheme providing comprehensive healthcare and nutrition support for mothers and children.",
      [
        "Cash incentive for institutional delivery",
        "Free nutrition kits for mother and newborn",
        "Regular health check-ups and vaccination tracking",
        "Transport assistance for reaching healthcare facilities",
      ],
      "All pregnant women and children under 5 in Himachal Pradesh, with focus on remote areas.",
      "healthcare",
      ["nutrition_support", "free_delivery"],
      "Himachal Pradesh",
    ),
    J("Himachal Pradesh"),
    P("Himachal Pradesh"),
    M("Himachal Pradesh"),
  ],

  Jharkhand: [
    s(
      "jharkhand-matri",
      "Mukhyamantri Matritva Yojana",
      "A state scheme providing financial incentives for safe delivery and postnatal care in Jharkhand.",
      [
        "Cash assistance of ₹6,000 for institutional delivery",
        "Additional support for nutritional diet during pregnancy",
        "Free transport services for emergency obstetric care",
        "Follow-up care for mother and newborn up to 6 months",
      ],
      "All pregnant women in Jharkhand, with priority to ST/SC and BPL families.",
      "financial",
      ["cash_benefit"],
      "Jharkhand",
    ),
    J("Jharkhand"),
    P("Jharkhand"),
    K("Jharkhand"),
  ],

  Karnataka: [
    s(
      "karnataka-mathru-poorna",
      "Mathru Poorna",
      "A state scheme providing nutritious meals to pregnant and lactating women at Anganwadi centres.",
      [
        "One nutritious meal per day at Anganwadi centres during pregnancy and lactation",
        "Take-home rations for women unable to visit centres",
        "Nutrition counselling and health education sessions",
        "Supports food security for low-income families",
      ],
      "Pregnant and lactating women in Karnataka, priority to BPL and rural families.",
      "nutrition",
      ["nutrition_support"],
      "Karnataka",
    ),
    s(
      "karnataka-madilu",
      "Madilu Kit Scheme",
      "A state scheme providing a kit with essential items for newborn care to mothers delivering in government hospitals.",
      [
        "Free kit containing baby clothes, blankets, diapers, and hygiene products",
        "Delivery kit with essentials for safe delivery",
        "Health education booklet for newborn care",
        "Encourages institutional delivery in government facilities",
      ],
      "All women delivering in government health facilities in Karnataka.",
      "healthcare",
      [],
      "Karnataka",
    ),
    J("Karnataka"),
    P("Karnataka"),
  ],

  Kerala: [
    s(
      "kerala-mctp",
      "Mother & Child Tracking Programme",
      "A comprehensive health tracking programme for pregnant women and children in Kerala.",
      [
        "Regular health monitoring and follow-up throughout pregnancy",
        "Automated SMS and call reminders for check-ups and vaccination",
        "High-risk pregnancy identification and management",
        "Postnatal follow-up for mother and child up to 1 year",
      ],
      "All pregnant women registered at government health facilities in Kerala.",
      "healthcare",
      ["highly_recommended"],
      "Kerala",
    ),
    J("Kerala"),
    P("Kerala"),
    K("Kerala"),
  ],

  "Madhya Pradesh": [
    s(
      "mp-ladli-laxmi",
      "Ladli Laxmi Yojana",
      "A state scheme to promote the welfare of girl children through financial support and education incentives.",
      [
        "Cash assistance at birth (₹2,000), Class 6 (₹4,000), Class 9 (₹6,000), Class 12 (₹8,000)",
        "Maturity amount of ₹1 lakh on turning 21",
        "Linked to school attendance and vaccination compliance",
        "Reduces child marriage and promotes financial independence",
      ],
      "Families in Madhya Pradesh with a girl child, subject to birth registration, vaccination, and school enrolment.",
      "financial",
      ["cash_benefit"],
      "Madhya Pradesh",
    ),
    J("Madhya Pradesh"),
    P("Madhya Pradesh"),
    K("Madhya Pradesh"),
  ],

  Maharashtra: [
    s(
      "maharashtra-rajmata",
      "Rajmata Jijau Mother-Child Health Scheme",
      "A state scheme providing cash incentives for institutional delivery and postnatal care in Maharashtra.",
      [
        "Cash incentive of ₹6,000 for institutional delivery",
        "Free health check-ups during pregnancy and after delivery",
        "Nutrition support and take-home rations",
        "Transport subsidy for reaching healthcare facilities",
      ],
      "All pregnant women in Maharashtra, priority to BPL and rural families.",
      "financial",
      ["cash_benefit"],
      "Maharashtra",
    ),
    J("Maharashtra"),
    P("Maharashtra"),
    M("Maharashtra"),
  ],

  Manipur: [
    s(
      "manipur-matru-vandana",
      "Matru Vandana Scheme",
      "A state maternity benefit scheme providing cash assistance for nutrition and health during pregnancy.",
      [
        "Cash assistance of ₹5,000 for the first live birth",
        "Encourages timely antenatal care visits and hospital delivery",
        "Supports nutrition during pregnancy and lactation",
        "Direct benefit transfer to the mother's account",
      ],
      "Pregnant women in Manipur for first live birth, aged 19+ years.",
      "financial",
      ["cash_benefit", "nutrition_support"],
      "Manipur",
    ),
    J("Manipur"),
    P("Manipur"),
    K("Manipur"),
  ],

  Meghalaya: [
    s(
      "meghalaya-mhis",
      "Megha Health Insurance Scheme",
      "A state health insurance scheme providing cashless treatment for maternity care and other health needs in Meghalaya.",
      [
        "Cashless maternity care including delivery and emergency procedures",
        "Coverage up to ₹5 lakh for maternity and other treatments",
        "Free transport and diet during hospital stay",
        "Newborn care coverage up to 30 days",
      ],
      "All families in Meghalaya with annual income below ₹5 lakh.",
      "insurance",
      ["free_delivery"],
      "Meghalaya",
    ),
    J("Meghalaya"),
    P("Meghalaya"),
    M("Meghalaya"),
  ],

  Mizoram: [
    s(
      "mizoram-maternal-assistance",
      "State Maternal Health Assistance Scheme",
      "A state scheme providing comprehensive health assistance to pregnant women in Mizoram.",
      [
        "Free delivery including C-section at government facilities",
        "Cash assistance for nutrition during pregnancy and lactation",
        "Free medicines and diagnostics",
        "Follow-up care for mother and newborn",
      ],
      "All pregnant women in Mizoram, with focus on rural and remote areas.",
      "healthcare",
      ["free_delivery"],
      "Mizoram",
    ),
    J("Mizoram"),
    P("Mizoram"),
    K("Mizoram"),
  ],

  Nagaland: [
    s(
      "nagaland-mother-support",
      "Nagaland Mother Support Scheme",
      "A state initiative providing financial and nutrition support to pregnant women and new mothers in Nagaland.",
      [
        "Cash benefit for institutional delivery",
        "Nutrition kits containing supplements and healthy food items",
        "Free check-ups and health counselling during pregnancy",
        "Transport allowance for hospital visits",
      ],
      "Pregnant women in Nagaland, priority to tribal and BPL communities.",
      "financial",
      ["nutrition_support"],
      "Nagaland",
    ),
    J("Nagaland"),
    P("Nagaland"),
    M("Nagaland"),
  ],

  Odisha: [
    s(
      "odisha-mamata",
      "Mamata Scheme",
      "A state conditional cash transfer scheme for pregnant and lactating women in Odisha.",
      [
        "Cash benefit of ₹6,000 in installments from pregnancy up to 12 months after delivery",
        "Linked to antenatal care, institutional delivery, and child vaccination",
        "Compensates for wage loss and supports nutrition",
        "Direct transfer to the mother's bank account",
      ],
      "Pregnant and lactating women in Odisha aged 19+ years for up to 2 live births.",
      "financial",
      ["cash_benefit", "nutrition_support"],
      "Odisha",
    ),
    s(
      "odisha-biju",
      "Biju Swasthya Kalyan Yojana",
      "A state health insurance scheme providing cashless healthcare including maternity services in Odisha.",
      [
        "Cashless treatment for maternity complications including C-section",
        "Coverage up to ₹5 lakh per family per year",
        "Free transport and diet during hospital stay",
        "Coverage for newborn care up to 1 year",
      ],
      "All residents of Odisha with valid BSKY health cards.",
      "insurance",
      ["free_delivery"],
      "Odisha",
    ),
    J("Odisha"),
    P("Odisha"),
  ],

  Punjab: [
    s(
      "punjab-mata-kaushalya",
      "Mata Kaushalya Scheme",
      "A state scheme providing financial support to pregnant women for safe delivery and postnatal care in Punjab.",
      [
        "Cash assistance of ₹6,000 for institutional delivery",
        "Additional nutrition incentive during pregnancy",
        "Free transport for delivery and emergency care",
        "Health check-ups and vaccination tracking for newborn",
      ],
      "All pregnant women in Punjab, with priority to BPL and SC families.",
      "financial",
      ["cash_benefit"],
      "Punjab",
    ),
    J("Punjab"),
    P("Punjab"),
    K("Punjab"),
  ],

  Rajasthan: [
    s(
      "rajasthan-rajshree",
      "Rajshree Yojana",
      "A state conditional cash transfer scheme promoting girl child birth, education, and delaying marriage in Rajasthan.",
      [
        "Cash assistance of ₹2,000 at birth, ₹1,000 at 1 year (full vaccination)",
        "₹2,000 on school enrolment in Class 1, ₹4,000 in Class 6, ₹6,000 in Class 10",
        "₹25,000 on reaching age 18 without marriage",
        "Encourages institutional delivery and timely vaccinations",
      ],
      "Families in Rajasthan with a girl child, conditional on institutional delivery, vaccination, and school attendance.",
      "financial",
      ["cash_benefit"],
      "Rajasthan",
    ),
    s(
      "rajasthan-bhamashah",
      "Bhamashah Swasthya Bima Yojana",
      "A state health insurance scheme providing cashless maternity care and other health benefits in Rajasthan.",
      [
        "Cashless delivery including C-section at empanelled hospitals",
        "Coverage up to ₹5 lakh per family per year",
        "Coverage for newborn screening and treatment up to 1 year",
        "Free transport and accommodation benefits for treatment",
      ],
      "All families in Rajasthan with valid Bhamashah health cards, BPL families priority.",
      "insurance",
      ["free_delivery"],
      "Rajasthan",
    ),
    J("Rajasthan"),
    P("Rajasthan"),
  ],

  Sikkim: [
    s(
      "sikkim-maternal",
      "Sikkim Maternal Assistance Scheme",
      "A state scheme providing comprehensive maternity support to all pregnant women in Sikkim.",
      [
        "Financial assistance of ₹6,000 for institutional delivery",
        "Free medicines, diagnostics, and hospital stay",
        "Nutrition support through take-home rations",
        "Free transport for delivery and emergency care",
      ],
      "All pregnant women in Sikkim delivering at government health facilities.",
      "financial",
      ["cash_benefit"],
      "Sikkim",
    ),
    J("Sikkim"),
    P("Sikkim"),
    M("Sikkim"),
  ],

  "Tamil Nadu": [
    s(
      "tn-muthulakshmi",
      "Dr. Muthulakshmi Reddy Maternity Benefit Scheme",
      "A state flagship scheme providing comprehensive financial support for pregnant women in Tamil Nadu.",
      [
        "Cash assistance of ₹18,000 in installments during pregnancy and post-delivery",
        "Free nutritious meal at Anganwadi centres",
        "Free transport for antenatal care and delivery",
        "Health insurance coverage for delivery complications",
      ],
      "All pregnant women in Tamil Nadu aged 19+ years, for up to 2 live births.",
      "financial",
      ["cash_benefit", "highly_recommended"],
      "Tamil Nadu",
    ),
    s(
      "tn-picme",
      "PICME Pregnancy Registration",
      "A digital pregnancy tracking and health management system in Tamil Nadu.",
      [
        "Online registration and tracking of pregnancy progress",
        "Automated reminders for check-ups, scans, and vaccinations",
        "Integrated with all government health facilities",
        "Provides post-delivery follow-up for mother and child",
      ],
      "All pregnant women in Tamil Nadu registering at government health facilities.",
      "healthcare",
      [],
      "Tamil Nadu",
    ),
    s(
      "tn-amma-baby-kit",
      "Amma Baby Care Kit Scheme",
      "A state scheme providing a comprehensive baby care kit to all new mothers delivering in government hospitals.",
      [
        "Free baby care kit with clothes, blankets, diapers, and hygiene products",
        "Postnatal care guide for breastfeeding and newborn care",
        "Encourages institutional delivery in government hospitals",
        "Includes essential items for the first 6 months of childcare",
      ],
      "All women delivering in government health facilities in Tamil Nadu.",
      "healthcare",
      [],
      "Tamil Nadu",
    ),
    K("Tamil Nadu"),
  ],

  Telangana: [
    s(
      "telangana-kcr-kit",
      "KCR Kit Scheme",
      "A state flagship scheme providing a comprehensive kit and financial assistance to pregnant women in Telangana.",
      [
        "Cash assistance of ₹12,000 in installments during pregnancy and post-delivery",
        "Free baby care kit worth ₹3,000 with essential items",
        "Free delivery including C-section at government hospitals",
        "Nutrition support and health counselling sessions",
      ],
      "All pregnant women in Telangana delivering at government health facilities.",
      "financial",
      ["cash_benefit", "nutrition_support"],
      "Telangana",
    ),
    s(
      "telangana-amma-odi",
      "Amma Odi",
      "A state scheme providing free transport for pregnant women to government health facilities in Telangana.",
      [
        "Free ambulance service for antenatal care visits",
        "Emergency transport for delivery and complications",
        "Free drop-back service after delivery",
        "24/7 helpline for transport booking",
      ],
      "All pregnant women in Telangana requiring transport to government health facilities.",
      "healthcare",
      ["transport_support"],
      "Telangana",
    ),
    J("Telangana"),
    P("Telangana"),
  ],

  Tripura: [
    s(
      "tripura-maternal",
      "State Maternal Assistance Programme",
      "A state scheme providing financial assistance for safe delivery and maternal health in Tripura.",
      [
        "Cash benefit of ₹5,000 for institutional delivery",
        "Nutrition supplements during pregnancy and lactation",
        "Free health check-ups and diagnostic services",
        "Transport allowance for hospital visits",
      ],
      "Pregnant women in Tripura, priority to BPL and tribal families.",
      "financial",
      ["cash_benefit"],
      "Tripura",
    ),
    J("Tripura"),
    P("Tripura"),
    K("Tripura"),
  ],

  "Uttar Pradesh": [
    s(
      "up-matru-vandana",
      "Matru Vandana Yojana",
      "A state maternity benefit scheme providing cash assistance to pregnant women in Uttar Pradesh.",
      [
        "Cash benefit of ₹5,000 in installments for first live birth",
        "Encourages antenatal care visits and institutional delivery",
        "Nutrition support during pregnancy and lactation",
        "Bank transfer directly to mother's account",
      ],
      "Pregnant women in Uttar Pradesh aged 19+ years for first live birth.",
      "financial",
      ["cash_benefit"],
      "Uttar Pradesh",
    ),
    J("Uttar Pradesh"),
    P("Uttar Pradesh"),
    M("Uttar Pradesh"),
  ],

  Uttarakhand: [
    s(
      "uttarakhand-nanda-gaura",
      "Nanda Gaura Yojana",
      "A state scheme providing comprehensive maternity support and financial assistance in Uttarakhand.",
      [
        "Cash assistance of ₹6,000 for institutional delivery",
        "Free nutrition kits during pregnancy and lactation",
        "Free ambulance service for emergency obstetric care",
        "Health education and counselling sessions",
      ],
      "All pregnant women in Uttarakhand, priority to BPL families and hill areas.",
      "financial",
      ["cash_benefit", "nutrition_support"],
      "Uttarakhand",
    ),
    J("Uttarakhand"),
    P("Uttarakhand"),
    K("Uttarakhand"),
  ],

  "West Bengal": [
    s(
      "wb-matri-sathi",
      "Matri Sathi",
      "A state scheme providing comprehensive financial assistance to pregnant women in West Bengal.",
      [
        "Cash assistance of ₹10,000 in installments during pregnancy and post-delivery",
        "Free delivery including C-section at government hospitals",
        "Nutrition support during pregnancy and lactation",
        "Free medicines and diagnostic services",
      ],
      "All pregnant women in West Bengal for up to 2 live births.",
      "financial",
      ["cash_benefit"],
      "West Bengal",
    ),
    s(
      "wb-swasthya-sathi",
      "Swasthya Sathi",
      "A state health insurance scheme providing cashless treatment including comprehensive maternity coverage in West Bengal.",
      [
        "Cashless maternity care including delivery and emergency procedures",
        "Coverage up to ₹5 lakh per family per year",
        "Newborn care coverage up to 30 days",
        "Free transport and diet during hospital stay",
      ],
      "All families in West Bengal with Swasthya Sathi health cards.",
      "insurance",
      ["free_delivery"],
      "West Bengal",
    ),
    J("West Bengal"),
    P("West Bengal"),
  ],
};

export const ALL_STATES = Object.keys(schemesByState).sort();

export function getSchemesByState(state: string): Scheme[] {
  return schemesByState[state] ?? [];
}

export function getStateDisplayName(state: string): string {
  return state;
}

export function searchSchemes(schemes: Scheme[], query: string): Scheme[] {
  const q = query.toLowerCase().trim();
  if (!q) return schemes;
  return schemes.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.benefits.some((b) => b.toLowerCase().includes(q)) ||
      s.eligibility.toLowerCase().includes(q),
  );
}

export function filterSchemesByType(schemes: Scheme[], types: string[]): Scheme[] {
  if (!types.length) return schemes;
  return schemes.filter((s) => types.includes(s.type));
}
