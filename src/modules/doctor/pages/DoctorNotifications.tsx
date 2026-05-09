import { useState, useMemo, useCallback, useEffect } from "react";
import {
  MessageSquareText, Send, CheckCircle2, Clock,
  ChevronRight, X, Stethoscope, AlertCircle,
  User, Activity, Pill, FileText, Apple,
  HelpCircle, MessageCircle, ArrowLeft,
} from "lucide-react";
import { getDoctorCode } from "@/modules/doctor/hooks/useDoctorProfile";
import {
  getQuestionsByDoctor,
  updateQuestionStatus,
  type DoctorQuestion,
  type QuestionStatus,
} from "@/lib/doctorAskStore";

type Tab = "pending" | "urgent" | "replied" | "resolved";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Symptoms: Activity,
  Medication: Pill,
  Reports: FileText,
  Nutrition: Apple,
  Recovery: HelpCircle,
  "General Question": MessageCircle,
};

const PRIORITY_STYLES: Record<string, { label: string; classes: string }> = {
  Normal: { label: "Normal", classes: "bg-emerald-100 text-emerald-700" },
  Moderate: { label: "Moderate", classes: "bg-amber-100 text-amber-700" },
  Urgent: { label: "Urgent", classes: "bg-red-100 text-red-700" },
};

const STATUS_STYLES: Record<QuestionStatus, { label: string; classes: string }> = {
  pending: { label: "Pending Doctor Response", classes: "bg-amber-100 text-amber-700" },
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

function QuestionCard({
  question,
  onReply,
  onResolve,
  onView,
}: {
  question: DoctorQuestion;
  onReply: (q: DoctorQuestion) => void;
  onResolve: (q: DoctorQuestion) => void;
  onView: (q: DoctorQuestion) => void;
}) {
  const CatIcon = CATEGORY_ICONS[question.category] ?? MessageCircle;
  const preview = question.detail.length > 100
    ? question.detail.slice(0, 100) + "..."
    : question.detail;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 transition-all hover:shadow-md hover:border-slate-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold text-sm">
            {question.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{question.patientName}</p>
            <p className="text-[11px] text-slate-500">
              ID: {question.patientId} &middot; {question.phase}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[question.priority].classes}`}>
            {PRIORITY_STYLES[question.priority].label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
          <CatIcon className="h-3 w-3 text-slate-600" />
        </div>
        <span className="text-[11px] font-medium text-slate-500">{question.category}</span>
        <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[question.status].classes}`}>
          {STATUS_STYLES[question.status].label}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-1">{question.title}</h3>
      <p className="text-xs text-slate-600 line-clamp-2">{preview}</p>

      {question.doctorReply && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 shrink-0 mt-0.5">
              <Stethoscope className="h-3 w-3 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800">Your Reply</p>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{question.doctorReply}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDateTime(question.createdAt)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(question)}
            className="text-[11px] font-medium text-teal-600 hover:text-teal-700 px-2 py-1 rounded hover:bg-teal-50 transition-colors"
          >
            View
          </button>
          {question.status !== "resolved" && (
            <>
              {question.status !== "replied" && (
                <button
                  onClick={() => onReply(question)}
                  className="text-[11px] font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  Reply
                </button>
              )}
              <button
                onClick={() => onResolve(question)}
                className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
              >
                Resolve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewQuestionModal({
  question,
  onClose,
  onReply,
  onResolve,
}: {
  question: DoctorQuestion;
  onClose: () => void;
  onReply: (q: DoctorQuestion) => void;
  onResolve: (q: DoctorQuestion) => void;
}) {
  const CatIcon = CATEGORY_ICONS[question.category] ?? MessageCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Question Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold text-lg">
              {question.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{question.patientName}</p>
              <p className="text-xs text-slate-500">ID: {question.patientId} &middot; {question.phase}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLES[question.priority].classes}`}>
              {PRIORITY_STYLES[question.priority].label}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[question.status].classes}`}>
              {STATUS_STYLES[question.status].label}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CatIcon className="h-3 w-3" />
              {question.category}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Question</p>
            <h3 className="text-base font-bold text-slate-900">{question.title}</h3>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Details</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{question.detail}</p>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            Submitted {formatDateTime(question.createdAt)}
          </div>

          {question.doctorReply && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Your Reply</p>
              <p className="text-sm text-slate-700">{question.doctorReply}</p>
              {question.repliedAt && (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Replied {formatDateTime(question.repliedAt)}
                </p>
              )}
            </div>
          )}

          {question.resolvedAt && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Resolved</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Resolved on {formatDateTime(question.resolvedAt)}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 p-5 border-t border-slate-100">
          {question.status !== "resolved" && (
            <>
              {question.status !== "replied" && (
                <button
                  onClick={() => { onReply(question); onClose(); }}
                  className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Reply
                </button>
              )}
              <button
                onClick={() => { onResolve(question); onClose(); }}
                className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Resolved
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-6 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ReplyModal({
  question,
  onClose,
  onSubmit,
}: {
  question: DoctorQuestion;
  onClose: () => void;
  onSubmit: (questionId: string, reply: string) => void;
}) {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onSubmit(question.id, replyText.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reply to Question</h2>
            <p className="text-sm text-slate-500">From: {question.patientName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 mb-1">{question.title}</p>
            <p className="text-sm text-slate-700 line-clamp-3">{question.detail}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your Reply</label>
            <textarea
              placeholder="Type your medical advice here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-slate-400 resize-none"
              autoFocus
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-5 border-t border-slate-100">
          <button
            onClick={handleSubmit}
            disabled={!replyText.trim()}
            className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Send Reply
          </button>
          <button
            onClick={onClose}
            className="px-6 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorQuestions() {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [questions, setQuestions] = useState<DoctorQuestion[]>([]);
  const [viewQuestion, setViewQuestion] = useState<DoctorQuestion | null>(null);
  const [replyQuestion, setReplyQuestion] = useState<DoctorQuestion | null>(null);

  const doctorCode = useMemo(() => getDoctorCode(), []);

  const refresh = useCallback(() => {
    if (doctorCode) {
      setQuestions(getQuestionsByDoctor(doctorCode));
    }
  }, [doctorCode]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    window.addEventListener("storage", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const pendingQuestions = useMemo(
    () => questions.filter((q) => q.status === "pending"),
    [questions]
  );

  const urgentQuestions = useMemo(
    () => questions.filter((q) => q.priority === "Urgent"),
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

  const handleReply = useCallback((questionId: string, reply: string) => {
    const updated = updateQuestionStatus(questionId, "replied", reply);
    if (updated) {
      setReplyQuestion(null);
      refresh();
    }
  }, [refresh]);

  const handleResolve = useCallback((q: DoctorQuestion) => {
    const updated = updateQuestionStatus(q.id, "resolved");
    if (updated) refresh();
  }, [refresh]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: pendingQuestions.length },
    { key: "urgent", label: "Urgent", count: urgentQuestions.length },
    { key: "replied", label: "Replied", count: repliedQuestions.length },
    { key: "resolved", label: "Resolved", count: resolvedQuestions.length },
  ];

  const currentQuestions = useMemo(() => {
    switch (activeTab) {
      case "pending": return pendingQuestions;
      case "urgent": return urgentQuestions;
      case "replied": return repliedQuestions;
      case "resolved": return resolvedQuestions;
    }
  }, [activeTab, pendingQuestions, urgentQuestions, repliedQuestions, resolvedQuestions]);

  if (!doctorCode) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="container py-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquareText className="h-6 w-6" />
              Questions
            </h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <MessageSquareText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">Doctor profile not configured.</p>
          <p className="text-sm text-slate-400 mt-1">Please set up your doctor profile first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">Questions</h1>
                <p className="text-teal-100 text-sm">Patient inquiries from Ask Doctor</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-white/20 rounded-lg px-3 py-1.5 text-teal-50">
                {questions.length} total
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-teal-100 text-teal-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? "bg-teal-200 text-teal-800" : "bg-slate-200 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {currentQuestions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            {activeTab === "pending" && (
              <>
                <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">No pending questions</p>
                <p className="text-xs text-slate-400 mt-1">Patient questions will appear here</p>
              </>
            )}
            {activeTab === "urgent" && (
              <>
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">No urgent questions</p>
                <p className="text-xs text-slate-400 mt-1">High-priority questions will appear here</p>
              </>
            )}
            {activeTab === "replied" && (
              <>
                <Send className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">No replied questions</p>
                <p className="text-xs text-slate-400 mt-1">Your responses will be listed here</p>
              </>
            )}
            {activeTab === "resolved" && (
              <>
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">No resolved questions</p>
                <p className="text-xs text-slate-400 mt-1">Closed conversations will appear here</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onReply={setReplyQuestion}
                onResolve={handleResolve}
                onView={setViewQuestion}
              />
            ))}
          </div>
        )}
      </div>

      {viewQuestion && (
        <ViewQuestionModal
          question={viewQuestion}
          onClose={() => setViewQuestion(null)}
          onReply={setReplyQuestion}
          onResolve={handleResolve}
        />
      )}

      {replyQuestion && (
        <ReplyModal
          question={replyQuestion}
          onClose={() => setReplyQuestion(null)}
          onSubmit={handleReply}
        />
      )}
    </div>
  );
}