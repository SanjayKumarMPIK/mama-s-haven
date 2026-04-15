import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Stethoscope, Heart, Dumbbell, Sparkles, AlertTriangle, Bot, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScrollReveal from "@/components/ScrollReveal";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase, type Phase } from "@/hooks/usePhase";
import { useVoice } from "@/hooks/useVoice";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
const EMERGENCY_KEYWORDS = [
  "hemorrhage", "bleeding heavily", "heavy bleeding", "blood clot",
  "no fetal movement", "baby not moving", "baby stopped moving",
  "seizure", "convulsion", "unconscious", "fainted",
  "severe headache", "blurred vision", "seeing spots",
  "severe abdominal pain", "sharp pain",
  "high fever", "fever above 100",
  "water broke", "water breaking", "leaking fluid",
  "chest pain", "difficulty breathing", "can't breathe",
  "swelling face", "swollen face", "sudden swelling",
  "preeclampsia", "eclampsia",
];
function checkEmergencyKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}
import VoiceButton from "@/components/VoiceButton";
import EmergencyCard from "@/components/EmergencyCard";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";

type Tone = "doctor" | "mom" | "coach";
type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-assistant`;

const tones: { id: Tone; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "doctor", label: "Doctor", icon: <Stethoscope className="w-4 h-4" />, desc: "Professional & evidence-based" },
  { id: "mom", label: "Friendly Mom", icon: <Heart className="w-4 h-4" />, desc: "Warm & relatable" },
  { id: "coach", label: "Coach", icon: <Dumbbell className="w-4 h-4" />, desc: "Motivating & action-oriented" },
];

async function streamChat({
  messages, tone, language, weekContext, onDelta, onDone, onError,
}: {
  messages: Msg[]; tone: Tone; language: string; weekContext: string;
  onDelta: (text: string) => void; onDone: () => void; onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, tone, language, weekContext }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Something went wrong. Please try again.");
    return;
  }
  if (!resp.body) { onError("No response stream"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

function MessageBubble({ msg, onSpeak }: { msg: Msg; onSpeak?: (text: string) => void }) {
  const isUser = msg.role === "user";
  const hasWarning = /consult (your |a )?doctor|seek (medical |immediate )?help|emergency|call your (healthcare|midwife)/i.test(msg.content);
  const hasEmergency = checkEmergencyKeywords(msg.content);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground text-sm leading-relaxed shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Bot className="w-4 h-4" />
      </div>
      <div className="max-w-[85%] space-y-1">
        <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3 text-sm leading-relaxed shadow-sm text-card-foreground prose prose-sm max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
        {onSpeak && (
          <button onClick={() => onSpeak(msg.content)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-1">
            <Volume2 className="w-3 h-3" /> Listen
          </button>
        )}
        {hasEmergency && <EmergencyCard show={true} />}
        {hasWarning && !hasEmergency && (
          <Alert className="my-2 border-amber-300 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-xs">This response mentions symptoms that may need medical attention. Please consult your healthcare provider.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

const QUICK_BY_PHASE: Record<Phase, string[]> = {
  puberty: ["What’s a normal cycle length?", "How can I ease period pain at school?", "Iron foods that are easy to pack?"],
  maternity: [],
  "family-planning": ["How do I track fertile days simply?", "When should we see a doctor before conceiving?", "Stress making planning hard — ideas?"],
  menopause: ["What are common menopause symptoms?", "How can I manage hot flashes?", "What foods help during menopause?"],
};

export default function Assistant() {
  const { t, language, simpleMode } = useLanguage();
  const { phase, phaseName } = usePhase();
  const { currentWeek, trimester, profile } = usePregnancyProfile();
  const voice = useVoice(language);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<Tone>("mom");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Handle voice transcript
  useEffect(() => {
    if (voice.transcript && !voice.isListening) {
      setInput(voice.transcript);
    }
  }, [voice.transcript, voice.isListening]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput("");
    setError(null);

    // Check if user input contains emergency keywords
    if (checkEmergencyKeywords(msg)) {
      setShowEmergencyBanner(true);
    }

    const userMsg: Msg = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantText = "";
    const upsert = (chunk: string) => {
      assistantText += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
        }
        return [...prev, { role: "assistant", content: assistantText }];
      });
    };

    const weekContext = [
      `Life stage: ${phaseName}.`,
      profile.isSetup
        ? `Pregnancy: week ${currentWeek}, trimester ${trimester}, due date ${profile.dueDate}, region ${profile.region}.`
        : null,
      `Respond in ${language}.`,
      "Stay within general wellness education; encourage professional care for symptoms or decisions.",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      await streamChat({
        messages: [...messages, userMsg],
        tone,
        language,
        weekContext,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (e) => { setError(e); setIsLoading(false); },
      });
    } catch {
      setError("Connection failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const defaultMaternityPrompts = [t("quickPromptEat"), t("quickPromptSymptom"), t("quickPromptWellness"), t("quickPromptSleep")];
  const quickPrompts =
    phase === "maternity"
      ? defaultMaternityPrompts
      : [...QUICK_BY_PHASE[phase], ...defaultMaternityPrompts].slice(0, 4);

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* Header */}
      <ScrollReveal>
        <div className="border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="container py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  {t("aiAssistant")}
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Phase: <strong>{phaseName}</strong>
                  {profile.isSetup && (
                    <>
                      {" "}
                      · {t("yourWeek")} {currentWeek}/40 · {t("trimester")} {trimester}
                      {profile.name && ` · 👋 ${profile.name}`}
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {tones.map((to) => (
                  <button
                    key={to.id}
                    onClick={() => setTone(to.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-[0.96] ${
                      tone === to.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                    title={to.desc}
                  >
                    {to.icon}
                    <span className="hidden sm:inline">{to.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Chat area */}
      <div className="container flex flex-col" style={{ height: "calc(100vh - 14rem)" }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-full max-w-md mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Safety note:</strong> This is general guidance. Consult a healthcare professional if needed.
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">{t("greeting")}</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">{t("greetingDesc")}</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.97]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showEmergencyBanner && <EmergencyCard show={true} />}

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} onSpeak={msg.role === "assistant" ? voice.speak : undefined} />
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start gap-2">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <Alert className="mb-2 border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Input area */}
        <div className="border-t border-border bg-background pb-3 pt-3">
          <div className="flex gap-2 items-end">
            {voice.supported && (
              <VoiceButton
                type="mic"
                active={voice.isListening}
                onClick={voice.isListening ? voice.stopListening : voice.startListening}
              />
            )}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t("askAnything")}
              className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-border bg-card text-sm"
              rows={1}
            />
            <Button
              onClick={() => send()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl shadow-sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
