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
  preview: string;
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
        emoji: "📋",
        title: "Follow Doctor's Instructions",
        preview: "Use your discharge advice and follow-up plan as your main guide.",
        points: [
          "Keep your discharge instructions nearby and refer to them when needed",
          "Attend scheduled follow-up visits and share any recovery concerns",
          "Use your Care Log to note questions for your doctor",
          "If advice from different sources differs, follow your treating doctor",
        ],
      },
      {
        emoji: "📊",
        title: "Track Your Symptoms",
        preview: "Monitor how pain, bleeding, energy, and comfort change over time.",
        points: [
          "Log daily pain, fatigue, bleeding, and any wound-related discomfort",
          "Notice whether symptoms are steady, improving, or getting worse",
          "Bring notes from this log to your next follow-up visit",
          "Contact a healthcare professional if new concerning symptoms appear",
        ],
      },
      {
        emoji: "🚫",
        title: "Activity Restrictions",
        preview: "Ease back into routine activity only as advised during recovery.",
        points: [
          "Avoid strain, heavy lifting, or demanding chores until cleared",
          "Increase daily activity gradually if your doctor has advised it",
          "Rest when your body feels tired rather than pushing through discomfort",
          "Ask your doctor before returning to activities you are unsure about",
        ],
      },
      {
        emoji: "⚠️",
        title: "Watch for Red Flags",
        preview: "Certain symptoms may need medical attention and should not be ignored.",
        points: [
          "Heavy bleeding or bleeding that seems to worsen",
          "Fever, chills, or signs that may suggest infection",
          "Severe pain, dizziness, or fainting",
          "Unusual discharge, swelling, or symptoms that concern you",
        ],
      },
      {
        emoji: "💗",
        title: "Emotional Support",
        preview: "Emotional recovery matters too, especially after a major procedure.",
        points: [
          "Feeling emotional, tired, or unsettled can be part of recovery",
          "Talk with someone you trust if you need support",
          "Mention ongoing low mood, worry, or sleep difficulty at follow-up",
          "Seek professional support if emotional distress continues",
        ],
      },
    ],
  },
  "tubal-ligation": {
    title: "Post-Tubal Ligation Care",
    topics: [
      {
        emoji: "📋",
        title: "Follow Doctor's Instructions",
        preview: "Keep your care advice and follow-up plan as your main reference.",
        points: [
          "Follow the discharge advice given by your healthcare team",
          "Attend any scheduled follow-up and ask when normal routines can resume",
          "Use your Care Log to remember questions or symptoms to mention",
          "If anything feels unclear, confirm it with your doctor or health center",
        ],
      },
      {
        emoji: "📊",
        title: "Track Your Symptoms",
        preview: "Watch how discomfort, energy, and any spotting change day by day.",
        points: [
          "Log pain levels and any symptoms that continue or worsen",
          "Track bleeding, fatigue, wound discomfort, or dizziness if present",
          "Share your symptom notes during follow-up visits",
          "Use the log to spot patterns instead of relying on memory",
        ],
      },
      {
        emoji: "🚫",
        title: "Activity Precautions",
        preview: "Return to activity gradually and avoid overexertion during recovery.",
        points: [
          "Avoid heavy lifting or demanding physical work until advised",
          "Rest when needed and build back activity gradually",
          "Do not assume all discomfort means you should push through activity",
          "Ask your doctor before resuming activities you are unsure about",
        ],
      },
      {
        emoji: "⚠️",
        title: "Watch for Red Flags",
        preview: "Some symptoms may need prompt review by a healthcare professional.",
        points: [
          "Fever, chills, or signs of possible infection",
          "Increasing pain, swelling, or wound-related concerns",
          "Heavy bleeding, dizziness, or fainting",
          "Any symptom that feels unusual or is getting worse",
        ],
      },
      {
        emoji: "💗",
        title: "Emotional Wellbeing",
        preview: "Physical recovery can also affect mood, confidence, and rest.",
        points: [
          "Mood changes or tiredness can happen during recovery",
          "Check in with yourself each week, not only with physical symptoms",
          "Talk to someone you trust if you are feeling overwhelmed",
          "Mention emotional concerns to a healthcare professional if they persist",
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
        preview: "Your doctor knows your procedure details and recovery plan best.",
        points: [
          "Follow the care plan shared by your healthcare team",
          "Attend all scheduled follow-up appointments",
          "Keep a record of your symptoms for your doctor",
          "If you are unsure about an instruction, ask for clarification",
        ],
      },
      {
        emoji: "📊",
        title: "Track Your Symptoms",
        preview: "Use daily logs to notice changes early and discuss them clearly.",
        points: [
          "Use the daily symptom log to track how you feel",
          "Note any new or worsening symptoms",
          "Record pain levels honestly so changes are easy to notice",
          "Share this log with your healthcare provider",
        ],
      },
      {
        emoji: "🚫",
        title: "Activity Precautions",
        preview: "Protect your recovery by avoiding strain until you are cleared.",
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
        preview: "Certain symptoms may need medical attention rather than monitoring alone.",
        points: [
          "Fever, chills, or signs of infection",
          "Heavy or unexpected bleeding",
          "Severe or worsening pain",
          "Dizziness or fainting",
          "Any symptom that concerns you",
        ],
      },
      {
        emoji: "💗",
        title: "Emotional Wellbeing",
        preview: "Recovery can affect mood and confidence as well as physical comfort.",
        points: [
          "Feeling emotional or low on energy can happen during recovery",
          "Talk to someone you trust if you need support",
          "Use the weekly check-in to notice how you are coping",
          "Contact a healthcare professional if emotional distress continues",
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
        preview: "Personal medical advice should guide your recovery decisions.",
        points: [
          "Follow specific care instructions given to you",
          "Attend all scheduled follow-up appointments",
          "Keep a record of your symptoms for your doctor",
          "Ask a healthcare professional if any instruction feels unclear",
        ],
      },
      {
        emoji: "📊",
        title: "Track Your Symptoms",
        preview: "Daily tracking makes it easier to notice changes and ask for help early.",
        points: [
          "Use the daily symptom log to track how you feel",
          "Note any new or worsening symptoms",
          "Record pain levels honestly",
          "Share this log with your healthcare provider",
        ],
      },
      {
        emoji: "🚫",
        title: "Activity Precautions",
        preview: "Build back activity slowly and avoid strain unless you were advised otherwise.",
        points: [
          "Avoid activities that strain your body during recovery",
          "Rest when needed and return to normal routines gradually",
          "Do not assume you should resume everything at once",
          "Ask your doctor what is safe for your situation",
        ],
      },
      {
        emoji: "⚠️",
        title: "Watch for Warning Signs",
        preview: "Symptoms that worsen or feel unusual may need medical review.",
        points: [
          "Fever, chills, or signs of infection",
          "Heavy or unexpected bleeding",
          "Severe or worsening pain",
          "Dizziness or fainting",
          "Contact a healthcare professional if concerned",
        ],
      },
      {
        emoji: "💗",
        title: "Emotional Wellbeing",
        preview: "Support for stress, low mood, or worry is also part of recovery care.",
        points: [
          "Mood changes or worry can happen while recovering",
          "Check in with yourself each week, not only with symptoms",
          "Talk to someone you trust if you need support",
          "Seek professional support if emotional distress continues",
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
  reason: string;
}[] = [
  { key: "medicineTaken", label: "Took prescribed medicine", emoji: "💊", reason: "Helps you stay aligned with the care plan given to you." },
  { key: "hydration", label: "Drank enough water", emoji: "💧", reason: "Hydration supports general recovery and day-to-day comfort." },
  { key: "rest", label: "Rested properly", emoji: "🛏️", reason: "Rest gives your body space to recover without extra strain." },
  { key: "avoidedHeavyLifting", label: "Avoided heavy lifting", emoji: "🚫", reason: "Limiting strain may help protect healing tissues." },
  { key: "woundChecked", label: "Checked wound area (if applicable)", emoji: "🩹", reason: "A quick check helps you notice changes you may want to report." },
  { key: "followupDone", label: "Attended follow-up (if scheduled)", emoji: "📋", reason: "Follow-up visits help confirm recovery is staying on track." },
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
  "Some symptoms may need medical attention. Please contact a healthcare professional or visit the nearest health center.";
