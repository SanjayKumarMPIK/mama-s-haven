export type QuestionStatus = "pending" | "replied" | "resolved";
export type QuestionCategory = "Symptoms" | "Medication" | "Reports" | "Nutrition" | "Recovery" | "General Question";
export type QuestionPriority = "Normal" | "Moderate" | "Urgent";

export interface DoctorQuestion {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  phase: string;
  category: QuestionCategory;
  title: string;
  detail: string;
  priority: QuestionPriority;
  status: QuestionStatus;
  doctorCode: string;
  doctorReply?: string;
  repliedAt?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DailyQuota {
  date: string;
  count: number;
}

const STORAGE_KEY = "ss-doctor-ask-questions";
const QUOTA_KEY = "ss-doctor-ask-quota";

function loadQuestions(): DoctorQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DoctorQuestion[];
  } catch { /* ignore */ }
  return [];
}

function saveQuestions(questions: DoctorQuestion[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch { /* ignore */ }
}

function loadQuota(): DailyQuota {
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    if (raw) return JSON.parse(raw) as DailyQuota;
  } catch { /* ignore */ }
  return { date: "", count: 0 };
}

function saveQuota(quota: DailyQuota) {
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
  } catch { /* ignore */ }
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

const MAX_DAILY = 2;

export function getRemainingQuestions(): number {
  const quota = loadQuota();
  const t = today();
  if (quota.date !== t) return MAX_DAILY;
  return Math.max(0, MAX_DAILY - quota.count);
}

export function canAskQuestion(): boolean {
  return getRemainingQuestions() > 0;
}

export function createQuestion(
  data: Omit<DoctorQuestion, "id" | "status" | "createdAt" | "doctorCode" | "patientName" | "patientId" | "doctorName" | "phase"> & { patientName: string; patientId: string; doctorName: string; phase: string },
  doctorCode: string
): DoctorQuestion | null {
  if (!canAskQuestion()) return null;

  const question: DoctorQuestion = {
    ...data,
    id: `aq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    doctorCode,
    createdAt: new Date().toISOString(),
  };

  const questions = loadQuestions();
  questions.push(question);
  saveQuestions(questions);

  const t = today();
  const quota = loadQuota();
  if (quota.date !== t) {
    saveQuota({ date: t, count: 1 });
  } else {
    saveQuota({ date: t, count: quota.count + 1 });
  }

  return question;
}

export function getQuestionsByDoctor(doctorCode: string): DoctorQuestion[] {
  return loadQuestions()
    .filter((q) => q.doctorCode === doctorCode)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getQuestionsByStatus(doctorCode: string, status: QuestionStatus): DoctorQuestion[] {
  return getQuestionsByDoctor(doctorCode).filter((q) => q.status === status);
}

export function updateQuestionStatus(
  questionId: string,
  status: QuestionStatus,
  reply?: string
): DoctorQuestion | null {
  const questions = loadQuestions();
  const idx = questions.findIndex((q) => q.id === questionId);
  if (idx === -1) return null;
  questions[idx].status = status;
  if (reply !== undefined) {
    questions[idx].doctorReply = reply;
    questions[idx].repliedAt = new Date().toISOString();
  }
  if (status === "resolved") {
    questions[idx].resolvedAt = new Date().toISOString();
  }
  saveQuestions(questions);
  return questions[idx];
}
