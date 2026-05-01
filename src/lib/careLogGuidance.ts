/**
 * careLogGuidance.ts
 *
 * Static guidance content for the Care Log module.
 * Procedure-specific care topics, recovery messages, and red flag definitions.
 *
 * IMPORTANT: This content is for awareness only.
 * It does NOT replace medical advice.
 */

import type { ProcedureType, RecoveryStage, ConcernId } from "@/hooks/useCareLog";

// ─── Procedure Labels & Descriptions ──────────────────────────────────────────

export const PROCEDURE_OPTIONS: {
  id: ProcedureType;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "hysterectomy",
    label: "Hysterectomy / Uterus Removal",
    emoji: "🏥",
    description: "Surgical removal of the uterus",
  },
  {
    id: "tubal-ligation",
    label: "Tubal Ligation / Sterilization",
    emoji: "🩺",
    description: "Fallopian tubes tied or blocked",
  },
  {
    id: "other-surgery",
    label: "Other Reproductive Surgery",
    emoji: "💊",
    description: "Other family planning procedure",
  },
  {
    id: "prefer-not-to-say",
    label: "Prefer Not to Say",
    emoji: "🔒",
    description: "General post-procedure support",
  },
];

export const CONCERN_OPTIONS: {
  id: ConcernId;
  label: string;
  emoji: string;
}[] = [
  { id: "pain", label: "Pain or discomfort", emoji: "😣" },
  { id: "bleeding", label: "Bleeding or spotting", emoji: "🩸" },
  { id: "fatigue", label: "Fatigue", emoji: "😴" },
  { id: "fever", label: "Fever or chills", emoji: "🤒" },
  { id: "wound", label: "Wound discomfort", emoji: "🩹" },
  { id: "swelling", label: "Swelling", emoji: "🫧" },
  { id: "mood", label: "Mood changes", emoji: "💭" },
  { id: "sleep", label: "Sleep difficulty", emoji: "🌙" },
  { id: "none", label: "No concerns", emoji: "✅" },
];

// ─── Recovery Stage Messages ──────────────────────────────────────────────────

export const RECOVERY_MESSAGES: Record<
  RecoveryStage,
  { title: string; message: string; emoji: string; color: string }
> = {
  "first-week": {
    title: "Early Recovery",
    message:
      "You are in the early recovery stage. Follow your doctor's advice and avoid overexertion. Rest is essential right now.",
    emoji: "🌱",
    color: "from-amber-50 to-orange-50 border-amber-200",
  },
  "2-6-weeks": {
    title: "Active Recovery",
    message:
      "Your body is healing well. Continue following your doctor's instructions. Light activities may resume as advised by your healthcare provider.",
    emoji: "🌿",
    color: "from-emerald-50 to-teal-50 border-emerald-200",
  },
  "6-weeks-plus": {
    title: "Advanced Recovery",
    message:
      "You are in the later recovery phase. Most healing should be progressing well. Continue attending follow-up visits as scheduled.",
    emoji: "🌳",
    color: "from-sky-50 to-blue-50 border-sky-200",
  },
};

// ─── Procedure-Specific Guidance ──────────────────────────────────────────────

export interface GuidanceTopic {
  emoji: string;
  title: string;
  points: string[];
}

export const PROCEDURE_GUIDANCE: Record<ProcedureType, {
  title: string;
  topics: GuidanceTopic[];
}> = {
  hysterectomy: {
    title: "Post-Hysterectomy Care",
    topics: [
      {
        emoji: "🛏️",
        title: "Rest & Recovery",
        points: [
          "Allow at least 6–8 weeks for full recovery",
          "Avoid strenuous activity until cleared by your doctor",
          "Gradually increase light walking as comfort allows",
          "Listen to your body — rest when you feel tired",
        ],
      },
      {
        emoji: "🩹",
        title: "Wound Care Awareness",
        points: [
          "Keep the incision area clean and dry",
          "Watch for redness, swelling, or discharge around the wound",
          "Follow your doctor's specific wound care instructions",
          "Avoid submerging the wound in water until healed",
        ],
      },
      {
        emoji: "🚫",
        title: "Activity Restrictions",
        points: [
          "Do not lift heavy objects (over 5 kg) until cleared",
          "Avoid intense household chores in the first few weeks",
          "Refrain from sexual activity until your doctor approves",
          "Avoid driving until you can comfortably use the seatbelt",
        ],
      },
      {
        emoji: "📋",
        title: "Follow-up Visits",
        points: [
          "Attend all scheduled post-surgery check-ups",
          "Keep a list of questions for your doctor",
          "Report any unusual symptoms at follow-up visits",
          "Bring your Care Log notes to appointments",
        ],
      },
      {
        emoji: "💗",
        title: "Emotional Support",
        points: [
          "It's normal to feel emotional after this procedure",
          "Talk to someone you trust about how you feel",
          "Hormonal changes may affect mood — this is expected",
          "Seek professional help if sadness persists",
        ],
      },
      {
        emoji: "⚠️",
        title: "When to Seek Help",
        points: [
          "Heavy or increasing bleeding",
          "Fever above 100.4°F (38°C)",
          "Severe or worsening pain",
          "Foul-smelling vaginal discharge",
          "Signs of infection at the incision site",
        ],
      },
    ],
  },
  "tubal-ligation": {
    title: "Post-Tubal Ligation Care",
    topics: [
      {
        emoji: "💆‍♀️",
        title: "Pain & Discomfort",
        points: [
          "Mild pain or cramping is normal for a few days",
          "Take prescribed pain medication as directed",
          "Use a heating pad on your abdomen if comfortable",
          "Pain should gradually decrease — report if it worsens",
        ],
      },
      {
        emoji: "🩹",
        title: "Incision Care",
        points: [
          "Keep the small incision(s) clean and dry",
          "Change bandages as your doctor instructed",
          "Watch for signs of infection (redness, warmth, pus)",
          "Stitches may dissolve on their own if absorbable",
        ],
      },
      {
        emoji: "🛏️",
        title: "Rest & Return to Activity",
        points: [
          "Rest for 1–2 days after the procedure",
          "Avoid heavy lifting for about a week",
          "Most activities can resume within a few days",
          "Follow your doctor's advice on returning to work",
        ],
      },
      {
        emoji: "📋",
        title: "Follow-up Guidance",
        points: [
          "Attend the scheduled follow-up appointment",
          "Report any concerns about the incision site",
          "Ask about when to resume normal activities",
          "Discuss any persistent pain with your doctor",
        ],
      },
      {
        emoji: "⚠️",
        title: "Warning Signs",
        points: [
          "Fever or chills",
          "Increasing pain or swelling",
          "Redness or drainage from incision",
          "Fainting or dizziness",
          "Abdominal bloating that doesn't improve",
        ],
      },
    ],
  },
  "other-surgery": {
    title: "Post-Procedure Recovery Support",
    topics: [
      {
        emoji: "📋",
        title: "Follow Doctor's Instructions",
        points: [
          "Take all prescribed medications as directed",
          "Follow specific wound care instructions given to you",
          "Attend all scheduled follow-up appointments",
          "Keep a record of your symptoms for your doctor",
        ],
      },
      {
        emoji: "📊",
        title: "Track Your Symptoms",
        points: [
          "Use the daily symptom log to track how you feel",
          "Note any new or worsening symptoms",
          "Record pain levels honestly — it helps your recovery",
          "Share this log with your healthcare provider",
        ],
      },
      {
        emoji: "🚫",
        title: "Activity Precautions",
        points: [
          "Avoid strenuous activity until cleared by your doctor",
          "Do not lift heavy objects in the recovery period",
          "Rest as much as your body needs",
          "Gradually return to normal activities as advised",
        ],
      },
      {
        emoji: "⚠️",
        title: "Watch for Red Flags",
        points: [
          "Fever, chills, or signs of infection",
          "Heavy or unexpected bleeding",
          "Severe or worsening pain",
          "Dizziness or fainting",
          "Any symptom that concerns you",
        ],
      },
    ],
  },
  "prefer-not-to-say": {
    title: "General Recovery Support",
    topics: [
      {
        emoji: "📋",
        title: "Follow Doctor's Instructions",
        points: [
          "Take all prescribed medications as directed",
          "Follow specific care instructions given to you",
          "Attend all scheduled follow-up appointments",
          "Keep a record of your symptoms for your doctor",
        ],
      },
      {
        emoji: "📊",
        title: "Track Your Symptoms",
        points: [
          "Use the daily symptom log to track how you feel",
          "Note any new or worsening symptoms",
          "Record pain levels honestly",
          "Share this log with your healthcare provider",
        ],
      },
      {
        emoji: "⚠️",
        title: "Watch for Warning Signs",
        points: [
          "Fever, chills, or signs of infection",
          "Heavy or unexpected bleeding",
          "Severe or worsening pain",
          "Dizziness or fainting",
          "Contact a healthcare professional if concerned",
        ],
      },
    ],
  },
};

// ─── Checklist Items ──────────────────────────────────────────────────────────

export const CHECKLIST_ITEMS: {
  key: keyof Omit<import("@/hooks/useCareLog").CareChecklist, "date" | "savedAt">;
  label: string;
  emoji: string;
}[] = [
  { key: "medicineTaken", label: "Took prescribed medicine", emoji: "💊" },
  { key: "hydration", label: "Drank enough water", emoji: "💧" },
  { key: "rest", label: "Rested properly", emoji: "🛏️" },
  { key: "avoidedHeavyLifting", label: "Avoided heavy lifting", emoji: "🚫" },
  { key: "woundChecked", label: "Checked wound area (if applicable)", emoji: "🩹" },
  { key: "followupDone", label: "Attended follow-up (if scheduled)", emoji: "📋" },
];

// ─── Symptom Watch Items ──────────────────────────────────────────────────────

export const SYMPTOM_WATCH_TOGGLES: {
  key: keyof import("@/hooks/useCareLog").CareLogEntry;
  label: string;
  emoji: string;
  isRedFlag: boolean;
}[] = [
  { key: "bleeding", label: "Bleeding / spotting", emoji: "🩸", isRedFlag: false },
  { key: "fever", label: "Fever", emoji: "🤒", isRedFlag: true },
  { key: "chills", label: "Chills", emoji: "🥶", isRedFlag: true },
  { key: "woundDiscomfort", label: "Wound discomfort", emoji: "🩹", isRedFlag: false },
  { key: "fatigue", label: "Fatigue", emoji: "😴", isRedFlag: false },
  { key: "moodChanges", label: "Mood changes", emoji: "💭", isRedFlag: false },
  { key: "heavyBleeding", label: "Heavy bleeding", emoji: "🔴", isRedFlag: true },
  { key: "severePain", label: "Severe pain", emoji: "😰", isRedFlag: true },
  { key: "worseningSwelling", label: "Worsening swelling", emoji: "🫧", isRedFlag: true },
  { key: "foulDischarge", label: "Foul-smelling discharge", emoji: "⚠️", isRedFlag: true },
  { key: "dizziness", label: "Dizziness / fainting", emoji: "💫", isRedFlag: true },
];

// ─── Weekly Check-in Questions ────────────────────────────────────────────────

export const WEEKLY_QUESTIONS: {
  key: keyof Omit<import("@/hooks/useCareLog").WeeklyCheckIn, "weekNumber" | "date" | "savedAt">;
  question: string;
  emoji: string;
}[] = [
  { key: "painImproving", question: "Is pain improving?", emoji: "📉" },
  { key: "energyImproving", question: "Is energy improving?", emoji: "⚡" },
  { key: "unusualSymptoms", question: "Any fever or unusual symptoms?", emoji: "🤒" },
  { key: "attendedFollowup", question: "Did you attend follow-up?", emoji: "📋" },
  { key: "emotionallyOkay", question: "Do you feel emotionally okay?", emoji: "💗" },
];

// ─── Safety Disclaimer ───────────────────────────────────────────────────────

export const SAFETY_DISCLAIMER =
  "This guidance is for awareness only. Please follow your doctor's instructions and contact a healthcare professional for medical concerns.";

export const RED_FLAG_WARNING =
  "Please contact a healthcare professional immediately or visit the nearest health center.";
