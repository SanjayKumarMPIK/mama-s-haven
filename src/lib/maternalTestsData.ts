// ─── Maternal Tests & Scans Timeline Data ────────────────────────────────────
// All test data extracted from the existing SwasthyaSakhi tests list.
// This file is the single source of truth for the pregnancy timeline.

export type TestCategory =
  | "Blood Test"
  | "Scan"
  | "Vaccine"
  | "Genetic Screening"
  | "Monitoring";

export type TestStatus =
  | "completed"
  | "current"
  | "upcoming"
  | "missed"
  | "recommended-soon";

export interface MaternalTest {
  id: string;
  title: string;
  description: string;
  weekStart: number;
  weekEnd: number;
  category: TestCategory;
  optional: boolean;
  trimester: 1 | 2 | 3;
  whyItMatters: string;
  riskNotes: string;
}

// ─── Complete test dataset from the existing app ─────────────────────────────

export const MATERNAL_TESTS: MaternalTest[] = [
  // ── Trimester 1 ──────────────────────────────────────────────────────────────
  {
    id: "hcg-test",
    title: "HCG (Human Chorionic Gonadotropin) Test",
    description:
      "HCG test can be done on either urine or blood; it is usually done after a missed menstrual period to confirm pregnancy.",
    weekStart: 1,
    weekEnd: 2,
    category: "Blood Test",
    optional: false,
    trimester: 1,
    whyItMatters:
      "Confirms pregnancy by detecting the HCG hormone. Rising HCG levels indicate a healthy early pregnancy.",
    riskNotes:
      "Abnormally low or non-rising HCG levels may warrant further investigation by your doctor.",
  },
  {
    id: "cbc",
    title: "CBC",
    description:
      "Complete blood count test is done early in the pregnancy. The test determines your iron levels and checks whether you are affected by anaemia. It also determines the count of the three types of blood cells — red blood cells, white blood cells and platelets.",
    weekStart: 1,
    weekEnd: 2,
    category: "Blood Test",
    optional: false,
    trimester: 1,
    whyItMatters:
      "Detects anaemia, infections, and clotting disorders early so they can be managed before they affect your pregnancy.",
    riskNotes:
      "Low haemoglobin may require iron supplements. Abnormal white cell counts may need further evaluation.",
  },
  {
    id: "urine-test",
    title: "Urine Test",
    description:
      "Urine test confirms the presence of the pregnancy hormone human chorionic gonadotropin (HCG) in a woman's urine. The test is qualitative and does not indicate the amount of the hormone in the urine which can only be determined by a blood test. The occurrence of hormone HCG in the urine is a positive indication of pregnancy.",
    weekStart: 1,
    weekEnd: 2,
    category: "Blood Test",
    optional: false,
    trimester: 1,
    whyItMatters:
      "A simple, non-invasive first step to confirm pregnancy. Also screens for urinary tract infections and protein levels.",
    riskNotes:
      "Protein in urine during later stages may indicate preeclampsia. UTIs should be treated promptly.",
  },
  {
    id: "blood-test",
    title: "Blood Test",
    description:
      "The best way to determine if you are pregnant is to get a blood pregnancy test done. It is used to test for the levels of hCG or pregnancy hormone in the body which only elevates if you are pregnant.",
    weekStart: 1,
    weekEnd: 4,
    category: "Blood Test",
    optional: false,
    trimester: 1,
    whyItMatters:
      "Quantitative blood HCG test provides exact hormone levels, helping confirm pregnancy viability and track early progression.",
    riskNotes:
      "Your doctor may order serial blood tests to ensure HCG levels are doubling appropriately every 48–72 hours.",
  },
  {
    id: "dating-scan",
    title: "Viability/Dating Scan",
    description:
      "A dating scan is an ultrasound examination which is performed in order to determine your current week of pregnancy and your due date.",
    weekStart: 6,
    weekEnd: 9,
    category: "Scan",
    optional: false,
    trimester: 1,
    whyItMatters:
      "Confirms the pregnancy is in the uterus, checks for a heartbeat, and accurately dates your pregnancy to set an expected due date.",
    riskNotes:
      "If no heartbeat is detected at 7+ weeks, your doctor may schedule a follow-up scan.",
  },
  {
    id: "blood-group-panel",
    title: "Blood Group, Rh Factor, Haemoglobin, HIV, CBC, Thalassemia, Blood Sugar, Thyroid, Vitamin D and Hepatitis B",
    description:
      "The doctor will assess the risk of various diseases and will address any abnormal levels before you progress further with your pregnancy.",
    weekStart: 6,
    weekEnd: 9,
    category: "Blood Test",
    optional: false,
    trimester: 1,
    whyItMatters:
      "This comprehensive panel identifies your blood type, Rh compatibility, infections, thyroid function, and vitamin deficiencies — all critical for a safe pregnancy.",
    riskNotes:
      "Rh-negative mothers may need anti-D injections. Thyroid imbalances need immediate management.",
  },
  {
    id: "urine-routine-microscopic",
    title: "Urine Routine and Microscopic Test",
    description:
      "Checks the levels of Beta HCG and detects any infection in the urinary tract.",
    weekStart: 6,
    weekEnd: 9,
    category: "Blood Test",
    optional: false,
    trimester: 1,
    whyItMatters:
      "Detects urinary tract infections and kidney issues early. Untreated UTIs can lead to preterm labour.",
    riskNotes:
      "Recurring UTIs during pregnancy should be reported to your doctor immediately.",
  },
  {
    id: "cvs",
    title: "CVS (Chorionic Villus Sampling)",
    description:
      "CVS is carried out to detect specific abnormalities in an unborn baby. A sample of cells is taken from the placenta (the organ that links the mother's blood supply with her unborn baby's) and tested for genetic defects.",
    weekStart: 10,
    weekEnd: 13,
    category: "Genetic Screening",
    optional: true,
    trimester: 1,
    whyItMatters:
      "Diagnoses chromosomal abnormalities like Down syndrome and genetic disorders with high accuracy earlier than amniocentesis.",
    riskNotes:
      "CVS carries a small risk of miscarriage (about 1%). It is recommended only for high-risk pregnancies. Discuss with your doctor.",
  },
  {
    id: "nt-scan",
    title: "Nuchal Translucency (NT) Scan for Down Syndrome",
    description:
      "This test assesses the risk of baby being born with Down's Syndrome and other chromosomal abnormalities. Down's syndrome is a genetic disorder that causes intellectual disability and other physical and learning challenges.",
    weekStart: 11,
    weekEnd: 13,
    category: "Scan",
    optional: false,
    trimester: 1,
    whyItMatters:
      "Measures the fluid at the back of baby's neck. Increased thickness may indicate chromosomal conditions and prompts further testing.",
    riskNotes:
      "An abnormal NT measurement does not mean a definite diagnosis — it indicates the need for further diagnostic tests.",
  },
  {
    id: "double-marker",
    title: "Double Marker Test",
    description:
      "A double marker test is a specific type of blood test that is conducted to detect any chromosomal abnormalities in the baby. Having any abnormalities in the chromosomes can lead to severe health conditions and disorders that can affect the baby's growth within the uterus, or even later in life.",
    weekStart: 11,
    weekEnd: 13,
    category: "Genetic Screening",
    optional: false,
    trimester: 1,
    whyItMatters:
      "Combined with NT scan, it gives a risk assessment for Down syndrome (Trisomy 21) and Edwards syndrome (Trisomy 18).",
    riskNotes:
      "A high-risk result does not confirm a disorder — it means your doctor may recommend diagnostic tests like CVS or amniocentesis.",
  },
  {
    id: "chorionicity-scan",
    title: "Chorionicity Scan",
    description:
      "For women expecting twins — this scan detects if your twins share a placenta or have separate placentas.",
    weekStart: 12,
    weekEnd: 14,
    category: "Scan",
    optional: true,
    trimester: 1,
    whyItMatters:
      "Determines if twins share a placenta (monochorionic) which carries higher risks and requires closer monitoring.",
    riskNotes:
      "Monochorionic twins need more frequent scans to monitor for twin-to-twin transfusion syndrome (TTTS).",
  },

  // ── Trimester 2 ──────────────────────────────────────────────────────────────
  {
    id: "triple-marker",
    title: "Triple Marker Screen Test",
    description:
      "A Triple marker test is a blood test conducted during pregnancy. It does not provide a diagnosis; rather it simply indicates any potential genetic abnormalities in the baby. It is compulsory for women over 35 years.",
    weekStart: 15,
    weekEnd: 20,
    category: "Genetic Screening",
    optional: false,
    trimester: 2,
    whyItMatters:
      "Screens for neural tube defects (like spina bifida), Down syndrome, and other chromosomal abnormalities during mid-pregnancy.",
    riskNotes:
      "Abnormal results may lead to further testing such as a detailed anomaly scan or amniocentesis.",
  },
  {
    id: "quadruple-marker",
    title: "Quadruple Marker Test",
    description:
      "The quadruple marker test is a blood test similar to triple marker test. It gives information about risks, but it does not allow the definitive diagnosis of any conditions. It can only signal that further testing should be done to confirm a diagnosis.",
    weekStart: 15,
    weekEnd: 20,
    category: "Genetic Screening",
    optional: true,
    trimester: 2,
    whyItMatters:
      "Adds an additional marker (Inhibin A) to triple screening for improved accuracy in detecting Down syndrome risk.",
    riskNotes:
      "Like the triple marker, this is a screening test — not diagnostic. Discuss results with your healthcare provider.",
  },
  {
    id: "amniocentesis",
    title: "Amniocentesis",
    description:
      "In Amniocentesis, a small amount of amniotic fluid is removed from the sac surrounding the fetus for testing. The fluid is then sent to a laboratory for analysis. Different tests can be performed on a sample of amniotic fluid, depending on the genetic risk and indication for the test.",
    weekStart: 15,
    weekEnd: 18,
    category: "Genetic Screening",
    optional: true,
    trimester: 2,
    whyItMatters:
      "Provides a definitive diagnosis for chromosomal disorders like Down syndrome, neural tube defects, and genetic conditions.",
    riskNotes:
      "Carries a small risk of miscarriage (less than 1%). Recommended only when screening tests show high risk.",
  },
  {
    id: "anomaly-scan",
    title: "Anatomy/Anomaly Level 2 Scan",
    description:
      "A level 2 ultrasound focuses closely on fetal anatomy, to be sure everything is growing and developing as it should. Your baby will be measured from crown to rump, around the middle, and around the head, and his or her weight will be estimated. The four chambers of the heart will be looked at, as well as the kidneys, bladder, stomach, brain, spine and sex organs.",
    weekStart: 18,
    weekEnd: 20,
    category: "Scan",
    optional: false,
    trimester: 2,
    whyItMatters:
      "The most detailed scan of your pregnancy — checks every major organ and structure of your baby for any abnormalities.",
    riskNotes:
      "Some findings may require follow-up scans or specialist referrals. Most babies are found to be developing normally.",
  },

  // ── Trimester 3 ──────────────────────────────────────────────────────────────
  {
    id: "gtt",
    title: "Glucose Tolerance Test (GTT)",
    description:
      "The glucose tolerance test, also known as the oral glucose tolerance test, measures your body's response to sugar (glucose). More commonly, a modified version of the glucose tolerance test is used to diagnose gestational diabetes — a type of diabetes that develops during pregnancy.",
    weekStart: 24,
    weekEnd: 34,
    category: "Blood Test",
    optional: false,
    trimester: 3,
    whyItMatters:
      "Gestational diabetes affects up to 10% of pregnancies. Early detection allows dietary management and monitoring to protect both mother and baby.",
    riskNotes:
      "Unmanaged gestational diabetes can lead to large babies, difficult deliveries, and neonatal blood sugar issues.",
  },
  {
    id: "influenza-vaccine",
    title: "Influenza Vaccine",
    description:
      "If vaccinated against Influenza, the pregnant woman passes her immunity in the form of antibodies to the baby too. It is advisable for pregnant women to get the influenza vaccination as there are no vaccines or anti influenza drugs available for babies less than 6 months old.",
    weekStart: 26,
    weekEnd: 26,
    category: "Vaccine",
    optional: false,
    trimester: 3,
    whyItMatters:
      "Protects both mother and newborn from flu complications. Antibodies pass to the baby providing protection in the first 6 months of life.",
    riskNotes:
      "The flu vaccine is safe during pregnancy. Discuss timing with your doctor if you have allergies.",
  },
  {
    id: "growth-scan",
    title: "Growth and Well Being Scan",
    description:
      "The most common reason for a scan in the third trimester is to check that your baby is growing normally.",
    weekStart: 28,
    weekEnd: 32,
    category: "Scan",
    optional: false,
    trimester: 3,
    whyItMatters:
      "Monitors baby's growth, amniotic fluid levels, and placental health. Ensures the baby is developing on track for delivery.",
    riskNotes:
      "Growth restriction or excess amniotic fluid may require closer monitoring or early delivery planning.",
  },
  {
    id: "tetanus-1",
    title: "Tetanus 1st Shot",
    description:
      "Tetanus vaccination is recommended during pregnancy to protect the baby from tetanus.",
    weekStart: 32,
    weekEnd: 32,
    category: "Vaccine",
    optional: false,
    trimester: 3,
    whyItMatters:
      "Protects your newborn from neonatal tetanus, which can be life-threatening. Antibodies pass through the placenta to the baby.",
    riskNotes:
      "If you've had a tetanus booster in the last 2 years, discuss with your doctor whether this is needed.",
  },
  {
    id: "tetanus-2",
    title: "Tetanus 2nd Shot",
    description:
      "Second dose of tetanus vaccination to ensure full protection for the baby after birth.",
    weekStart: 36,
    weekEnd: 36,
    category: "Vaccine",
    optional: false,
    trimester: 3,
    whyItMatters:
      "Completes the two-dose tetanus immunisation schedule, ensuring maximum antibody transfer to your baby before birth.",
    riskNotes:
      "The second dose should be given at least 4 weeks after the first dose for optimal immunity.",
  },
  {
    id: "growth-scan-doppler",
    title: "Growth Scan and Colour Doppler",
    description:
      "A Doppler scan measures the blood flow in different parts of your baby's body, such as his umbilical cord, brain and heart. This helps to show whether he's getting all the oxygen and nutrients he needs via the placenta.",
    weekStart: 36,
    weekEnd: 40,
    category: "Scan",
    optional: false,
    trimester: 3,
    whyItMatters:
      "Assesses blood flow through the umbilical cord and placenta to ensure the baby is receiving adequate oxygen and nutrition in the final weeks before delivery.",
    riskNotes:
      "Abnormal Doppler readings may indicate placental insufficiency and could require closer monitoring or early delivery planning.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Determine the dynamic status of a test based on the current pregnancy week. */
export function getTestStatus(test: MaternalTest, currentWeek: number): TestStatus {
  if (currentWeek > test.weekEnd + 2) return "completed";
  if (currentWeek >= test.weekStart && currentWeek <= test.weekEnd) return "current";
  if (currentWeek >= test.weekStart - 2 && currentWeek < test.weekStart) return "recommended-soon";
  if (currentWeek > test.weekEnd && currentWeek <= test.weekEnd + 2) return "missed";
  return "upcoming";
}

/** Group tests by trimester. */
export function groupTestsByTrimester(tests: MaternalTest[]): Record<1 | 2 | 3, MaternalTest[]> {
  const groups: Record<1 | 2 | 3, MaternalTest[]> = { 1: [], 2: [], 3: [] };
  for (const test of tests) {
    groups[test.trimester].push(test);
  }
  return groups;
}

/** Find the next upcoming test for the sticky header. */
export function getNextUpcomingTest(tests: MaternalTest[], currentWeek: number): MaternalTest | null {
  const sorted = [...tests].sort((a, b) => a.weekStart - b.weekStart);
  return sorted.find((t) => t.weekStart >= currentWeek) || null;
}

/** Category badge color mapping. */
export const CATEGORY_COLORS: Record<TestCategory, { bg: string; text: string; border: string }> = {
  "Blood Test": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  Scan: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Vaccine: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Genetic Screening": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Monitoring: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

/** Status badge styling. */
export const STATUS_STYLES: Record<TestStatus, { bg: string; text: string; label: string; dot: string }> = {
  completed: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", label: "Completed", dot: "bg-emerald-500" },
  current: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", label: "Current", dot: "bg-purple-500" },
  upcoming: { bg: "bg-slate-50 border-slate-200", text: "text-slate-600", label: "Upcoming", dot: "bg-slate-400" },
  missed: { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "Missed", dot: "bg-red-500" },
  "recommended-soon": { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "Recommended Soon", dot: "bg-amber-500" },
};
