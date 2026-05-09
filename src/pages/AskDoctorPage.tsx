import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MessageSquareText, Send, Clock,
  CheckCircle2, AlertCircle, Stethoscope,
  HelpCircle, Pill, FileText, Apple,
  Activity, MessageCircle, ChevronRight,
} from "lucide-react";
import { getRequestByCode, getOrCreateHealthUserId } from "@/lib/connectionStore";
import {
  createQuestion,
  getQuestionsByDoctor,
  getRemainingQuestions,
  canAskQuestion,
  type QuestionCategory,
  type QuestionPriority,
  type DoctorQuestion,
  type QuestionStatus,
} from "@/lib/doctorAskStore";

type Tab = "ask" | "pending" | "replies" | "resolved";

const CATEGORIES: { value: QuestionCategory; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "Symptoms", icon: Activity },
  { value: "Medication", icon: Pill },
  { value: "Reports", icon: FileText },
  { value: "Nutrition", icon: Apple },
  { value: "Recovery", icon: HelpCircle },
  { value: "General Question", icon: MessageCircle },
];

const PRIORITIES: QuestionPriority[] = ["Normal", "Moderate", "Urgent"];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Symptoms: Activity,
  Medication: Pill,
  Reports: FileText,
  Nutrition: Apple,
  Recovery: HelpCircle,
  "General Question": MessageCircle,
};

const STATUS_BADGE: Record<QuestionStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700" },
  replied: { label: "Replied", classes: "bg-blue-100 text-blue-700" },
  resolved: { label: "Resolved", classes: "bg-emerald-100 text-emerald-700" },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function loadProfile() {
  let doctorCode = "";
  let doctorName = "Your Doctor";
  let patientName = "Patient";
  let patientId = "";
  let phase = "";
  try {
    const docRaw = localStorage.getItem("ss-doctor-profile");
    if (docRaw) {
      const doc = JSON.parse(docRaw);
      doctorCode = doc.doctorCode || "";
      doctorName = doc.name || "Your Doctor";
    }
  } catch { /* ignore */ }
  try {
    const userRaw = localStorage.getItem("swasthyasakhi_user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      patientName = user.basic?.fullName || "Patient";
    }
  } catch { /* ignore */ }
  try {
    phase = localStorage.getItem("ss-phase") || "";
  } catch { /* ignore */ }
  if (doctorCode) {
    try {
      patientId = getOrCreateHealthUserId(doctorCode, phase) || "";
    } catch { /* ignore */ }
  }
  return { doctorCode, doctorName, patientName, patientId, phase };
}

function QuestionCard({
  question,
  showReply,
}: {
  question: DoctorQuestion;
  showReply: boolean;
}) {
  const CatIcon = CATEGORY_ICONS[question.category] ?? MessageCircle;
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 transition-all hover:shadow-md hover:border-slate-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100">
            <CatIcon className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{question.title}</p>
            <p className="text-[11px] text-slate-500">{question.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {question.priority !== "Normal" && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              question.priority === "Urgent" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
            }`}>
              {question.priority}
            </span>
          )}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[question.status].classes}`}>
            {STATUS_BADGE[question.status].label}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{question.detail}</p>

      {showReply && question.doctorReply && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 shrink-0 mt-0.5">
              <Stethoscope className="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Doctor Reply</p>
              <p className="text-xs text-slate-600 mt-0.5">{question.doctorReply}</p>
              {question.repliedAt && (
                <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(question.repliedAt)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
        <span className="text-[10px] text-slate-400">{formatDateTime(question.createdAt)}</span>
      </div>
    </div>
  );
}

export default function AskDoctorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("ask");

  const [category, setCategory] = useState<QuestionCategory>("General Question");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [priority, setPriority] = useState<QuestionPriority>("Normal");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { doctorCode, doctorName, patientName, patientId, phase } = useMemo(() => loadProfile(), []);

  const isConnected = useMemo(() => {
    if (!doctorCode) return false;
    try {
      const req = getRequestByCode(doctorCode);
      return req?.status === "accepted";
    } catch { return false; }
  }, [doctorCode]);

  const [questions, setQuestions] = useState<DoctorQuestion[]>(() =>
    doctorCode ? getQuestionsByDoctor(doctorCode) : []
  );

  const remaining = useMemo(() => getRemainingQuestions(), [questions]);

  const refresh = useCallback(() => {
    if (doctorCode) {
      setQuestions(getQuestionsByDoctor(doctorCode));
    }
  }, [doctorCode]);

  const pendingQuestions = useMemo(
    () => questions.filter((q) => q.status === "pending"),
    [questions]
  );

  const repliedQuestions = useMemo(
    () => questions.filter((q) => q.status === "replied"),
    [questions]
  );

  const resolvedQuestions = useMemo(
    () => questions.filter((q) => q.status === "resolved"),
    [questions]
  );

  const handleSubmit = useCallback(() => {
    if (!doctorCode || !title.trim() || !detail.trim()) return;
    const result = createQuestion({ category, title: title.trim(), detail: detail.trim(), priority, patientName, patientId, doctorName, phase }, doctorCode);
    if (result) {
      setTitle("");
      setDetail("");
      setPriority("Normal");
      setCategory("General Question");
      setSuccessMsg("Your question has been sent to the doctor.");
      refresh();
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  }, [doctorCode, category, title, detail, priority, refresh, patientName, patientId, doctorName, phase]);

  const tabs: Tab[] = ["ask", "pending", "replies", "resolved"];
  const tabLabels: Record<Tab, string> = {
    ask: "Ask Question",
    pending: "Pending Questions",
    replies: "Doctor Replies",
    resolved: "Resolved Questions",
  };
  const tabCounts: Record<Tab, number> = {
    ask: 0,
    pending: pendingQuestions.length,
    replies: repliedQuestions.length,
    resolved: resolvedQuestions.length,
  };

  if (!doctorCode) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="container py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Ask Doctor</h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">Connect with a doctor to ask questions.</p>
          <button
            onClick={() => navigate("/connect")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            Go to My Doctor
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="container py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Ask Doctor</h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <MessageSquareText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">Your connection is not yet active.</p>
          <p className="text-sm text-slate-400 mt-1">Please wait for your doctor to accept your request.</p>
          <button
            onClick={() => navigate("/connect")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            Go to My Doctor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquareText className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-bold">Ask Doctor</h1>
                <p className="text-teal-100 text-sm">Send health questions and receive guidance from {doctorName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {successMsg && (
          <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-teal-100 text-teal-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tabLabels[tab]}
              {tabCounts[tab] > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab ? "bg-teal-200 text-teal-800" : "bg-slate-200 text-slate-600"
                }`}>
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "ask" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquareText className="w-4 h-4 text-teal-600" />
                  Ask a Health Question
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {remaining > 0
                    ? `${remaining} question${remaining !== 1 ? "s" : ""} remaining today`
                    : "No questions remaining today"}
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                remaining > 0
                  ? "bg-teal-100 text-teal-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {remaining > 0
                  ? `${remaining}/${2} remaining`
                  : "Limit reached"}
              </span>
            </div>

            {!canAskQuestion() && questions.length > 0 && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                You have reached today's Ask Doctor limit (2/day).
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(({ value: cat, icon: CatIcon }) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        category === cat
                          ? "border-teal-300 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      {cat === "General Question" ? "General" : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Question Title</label>
                <input
                  type="text"
                  placeholder="e.g., Is this symptom normal?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-slate-400"
                  disabled={!canAskQuestion()}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Detailed Question</label>
                <textarea
                  placeholder="Describe your health concern in detail..."
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent placeholder:text-slate-400 resize-none"
                  disabled={!canAskQuestion()}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                        priority === p
                          ? p === "Urgent"
                            ? "border-red-300 bg-red-50 text-red-700"
                            : p === "Moderate"
                            ? "border-orange-300 bg-orange-50 text-orange-700"
                            : "border-teal-300 bg-teal-50 text-teal-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 mb-2">Attach Report (Optional)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-teal-300 transition-colors cursor-pointer">
                  <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Upload medical report</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PDF, JPG, PNG supported (coming soon)</p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canAskQuestion() || !title.trim() || !detail.trim()}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                Send Question{!canAskQuestion() && " (Limit Reached)"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "pending" && (
          pendingQuestions.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No pending questions.</p>
              <p className="text-xs text-slate-400 mt-1">Questions waiting for doctor response will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pendingQuestions.map((q) => (
                <QuestionCard key={q.id} question={q} showReply={false} />
              ))}
            </div>
          )
        )}

        {activeTab === "replies" && (
          repliedQuestions.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No replies yet.</p>
              <p className="text-xs text-slate-400 mt-1">Doctor responses will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {repliedQuestions.map((q) => (
                <QuestionCard key={q.id} question={q} showReply={true} />
              ))}
            </div>
          )
        )}

        {activeTab === "resolved" && (
          resolvedQuestions.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No resolved questions.</p>
              <p className="text-xs text-slate-400 mt-1">Completed conversations will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {resolvedQuestions.map((q) => (
                <QuestionCard key={q.id} question={q} showReply={true} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
