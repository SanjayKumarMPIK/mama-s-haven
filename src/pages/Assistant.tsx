import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Stethoscope, Heart, Dumbbell, Sparkles, AlertTriangle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ScrollReveal from "@/components/ScrollReveal";
import ReactMarkdown from "react-markdown";

type Tone = "doctor" | "mom" | "coach";
type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-assistant`;

const tones: { id: Tone; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "doctor", label: "Doctor", icon: <Stethoscope className="w-4 h-4" />, desc: "Professional & evidence-based" },
  { id: "mom", label: "Friendly Mom", icon: <Heart className="w-4 h-4" />, desc: "Warm & relatable" },
  { id: "coach", label: "Coach", icon: <Dumbbell className="w-4 h-4" />, desc: "Motivating & action-oriented" },
];

const quickPrompts = [
  "What should I eat this week?",
  "Is this symptom normal?",
  "Give me a daily wellness plan",
  "Tips for better sleep",
];

async function streamChat({
  messages,
  tone,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  tone: Tone;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, tone }),
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

function AdviceCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-2 text-sm">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="prose prose-sm max-w-none text-card-foreground">{children}</div>
      </div>
    </div>
  );
}

function WarningCard({ text }: { text: string }) {
  return (
    <Alert className="my-3 border-peach bg-peach/30">
      <AlertTriangle className="h-4 w-4 text-peach-foreground" />
      <AlertDescription className="text-peach-foreground text-sm">{text}</AlertDescription>
    </Alert>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground text-sm leading-relaxed shadow-sm">
          {msg.content}
        </div>
      </div>
    );
  }

  const hasWarning = /consult (your |a )?doctor|seek (medical |immediate )?help|emergency|call your (healthcare|midwife)/i.test(msg.content);

  return (
    <div className="flex justify-start gap-2">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Bot className="w-4 h-4" />
      </div>
      <div className="max-w-[85%] space-y-1">
        <div className="rounded-2xl rounded-bl-md bg-card border border-border px-4 py-3 text-sm leading-relaxed shadow-sm text-card-foreground prose prose-sm max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
        {hasWarning && (
          <WarningCard text="This response mentions symptoms that may need medical attention. Please consult your healthcare provider." />
        )}
      </div>
    </div>
  );
}

export default function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<Tone>("mom");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput("");
    setError(null);

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

    try {
      await streamChat({
        messages: [...messages, userMsg],
        tone,
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

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <ScrollReveal>
        <div className="border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="container py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>
                  Pregnancy Assistant
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your personal AI companion through every week of pregnancy
                </p>
              </div>
              {/* Tone selector */}
              <div className="flex gap-2">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-[0.96] ${
                      tone === t.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                    title={t.desc}
                  >
                    {t.icon}
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Chat area */}
      <div className="container flex flex-col" style={{ height: "calc(100vh - 12rem)" }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Hi there, mama! 👋</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                I'm your pregnancy companion. Ask me anything about nutrition, symptoms, wellness, or what to expect each week.
              </p>
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

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
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

        {/* Error */}
        {error && (
          <Alert className="mb-2 border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Input */}
        <div className="border-t border-border bg-background pb-4 pt-3">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your pregnancy..."
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
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI responses are for informational purposes only — always consult your healthcare provider.
          </p>
        </div>
      </div>
    </main>
  );
}
