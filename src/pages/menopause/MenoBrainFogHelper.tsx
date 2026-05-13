import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, CheckCircle2, Clock3, Plus, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog, type MenopauseEntry } from "@/hooks/useHealthLog";
import {
  buildMemorySequence,
  buildWordAssociationPrompt,
  countRecentCalendarPatterns,
  createId,
  readMenopauseToolData,
  writeMenopauseToolData,
  fetchSyncedToolData,
  type BrainFogNote,
  type BrainFogTask,
} from "@/lib/menopauseTools";
import { cn } from "@/lib/utils";

type ExerciseMode = "memory" | "association" | "timer";

const reminderPrompts = ["Drink water", "Take medicine", "Call someone", "Buy groceries"];

export default function MenoBrainFogHelper() {
  const { user } = useAuth();
  const { getPhaseLogs } = useHealthLog();
  const today = new Date().toISOString().slice(0, 10);

  const calendarLogs = useMemo(() => {
    const phaseLogs = getPhaseLogs("menopause");
    return Object.entries(phaseLogs)
      .map(([date, entry]) => ({ date, entry: entry as MenopauseEntry }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getPhaseLogs]);

  const recentSummary = useMemo(() => countRecentCalendarPatterns(calendarLogs), [calendarLogs]);
  const [notes, setNotes] = useState<BrainFogNote[]>(() => readMenopauseToolData(user?.id, "brainFogNotes", []));
  const [tasks, setTasks] = useState<BrainFogTask[]>(() => readMenopauseToolData(user?.id, "brainFogTasks", []));

  useEffect(() => {
    if (!user) return;
    const sync = async () => {
      const notesData = await fetchSyncedToolData(user.id, "brainFogNotes");
      if (notesData) {
        const mappedNotes: BrainFogNote[] = notesData.map((d: any) => ({
          id: d.id,
          noteText: d.note_text,
          reminderDate: d.reminder_date,
          createdAt: d.created_at
        }));
        setNotes(prev => {
          const merged = [...mappedNotes, ...prev.filter(p => !mappedNotes.some(m => m.id === p.id))];
          return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        });
      }

      const tasksData = await fetchSyncedToolData(user.id, "brainFogTasks");
      if (tasksData) {
        const mappedTasks: BrainFogTask[] = tasksData.map((d: any) => ({
          id: d.id,
          taskText: d.task_text,
          date: d.date,
          completed: d.completed,
          createdAt: d.created_at
        }));
        setTasks(prev => {
          const merged = [...mappedTasks, ...prev.filter(p => !mappedTasks.some(m => m.id === p.id))];
          return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        });
      }
    };
    sync();
  }, [user]);

  const [noteText, setNoteText] = useState("");
  const [reminderDate, setReminderDate] = useState(today);
  const [taskText, setTaskText] = useState("");
  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>("memory");
  const [memorySequence, setMemorySequence] = useState(() => buildMemorySequence());
  const [showMemoryAnswer, setShowMemoryAnswer] = useState(false);
  const [memoryInput, setMemoryInput] = useState("");
  const [associationPrompt, setAssociationPrompt] = useState(() => buildWordAssociationPrompt());
  const [associationText, setAssociationText] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [exerciseMessage, setExerciseMessage] = useState("");

  const todayTasks = tasks.filter((task) => task.date === today).slice(0, 3);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setExerciseMessage("Focus timer complete. Nicely done.");
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const persistNotes = (next: BrainFogNote[]) => {
    setNotes(next);
    writeMenopauseToolData(user?.id, "brainFogNotes", next);
  };

  const persistTasks = (next: BrainFogTask[]) => {
    setTasks(next);
    writeMenopauseToolData(user?.id, "brainFogTasks", next);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const next = [{ id: createId("note"), noteText: noteText.trim(), reminderDate, createdAt: new Date().toISOString() }, ...notes].slice(0, 12);
    persistNotes(next);
    setNoteText("");
    toast.success("Note saved.");
  };

  const addReminderPrompt = (text: string) => {
    const next = [{ id: createId("note"), noteText: text, reminderDate: today, createdAt: new Date().toISOString() }, ...notes].slice(0, 12);
    persistNotes(next);
    toast.success("Reminder added.");
  };

  const addTask = () => {
    if (!taskText.trim() || todayTasks.length >= 3) return;
    const next = [{ id: createId("task"), taskText: taskText.trim(), date: today, completed: false, createdAt: new Date().toISOString() }, ...tasks];
    persistTasks(next);
    setTaskText("");
  };

  const toggleTask = (id: string) => {
    persistTasks(tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const removeTask = (id: string) => {
    persistTasks(tasks.filter((task) => task.id !== id));
  };

  const removeNote = (id: string) => {
    persistNotes(notes.filter((note) => note.id !== id));
  };

  const checkMemorySequence = () => {
    const normalizedInput = memoryInput.toLowerCase().replace(/\s+/g, " ").trim();
    const normalizedAnswer = memorySequence.answer.toLowerCase().replace(/\s+/g, " ").trim();
    setExerciseMessage(normalizedInput === normalizedAnswer ? "Sequence matched. Strong focus." : `Close enough or not quite. The sequence was ${memorySequence.answer}.`);
  };

  const submitAssociation = () => {
    if (!associationText.trim()) return;
    setExerciseMessage("Word association complete. A quick reset can still sharpen focus.");
    setAssociationText("");
    setAssociationPrompt(buildWordAssociationPrompt());
  };

  const suggestionText = recentSummary.sleepDifficultyDays >= 3
    ? "Recent low-sleep days suggest using notes and reminders earlier in the day."
    : "Keep notes brief and visible so you do not need to hold everything in your head.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 via-white to-rose-50/30">
      <div className="container max-w-5xl space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/tools" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 shadow-md">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Brain Fog Helper</h1>
            <p className="text-xs text-slate-500">Use quick notes, reminders, and light focus exercises for memory support</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-amber-200/70 bg-white/85 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">Quick Note</h2>
            <p className="mt-1 text-xs text-slate-500">What do you want to remember today?</p>
            <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} rows={3} placeholder="Write a short note or reminder" className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:bg-white" />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input type="date" value={reminderDate} onChange={(event) => setReminderDate(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600" />
              <button onClick={addNote} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600">
                <Plus className="h-4 w-4" /> Save note
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {notes.slice(0, 4).map((note) => (
                <div key={note.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm text-slate-700">{note.noteText}</p>
                    {note.reminderDate && <p className="mt-1 text-[11px] text-slate-500">Reminder date: {note.reminderDate}</p>}
                  </div>
                  <button onClick={() => removeNote(note.id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-amber-200/70 bg-white/85 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">Today's Focus List</h2>
            <p className="mt-1 text-xs text-slate-500">Keep it light. Add up to three small tasks.</p>
            <div className="mt-4 flex gap-2">
              <input value={taskText} onChange={(event) => setTaskText(event.target.value)} placeholder="Add one small task" className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-300 focus:bg-white" />
              <button onClick={addTask} disabled={todayTasks.length >= 3} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {todayTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Your focus list is empty. Add one to three tasks you want to keep visible today.</div>
              ) : todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <button onClick={() => toggleTask(task.id)} className="flex items-center gap-3 text-left">
                    <CheckCircle2 className={cn("h-5 w-5", task.completed ? "text-emerald-500" : "text-slate-300")} />
                    <span className={cn("text-sm", task.completed ? "text-slate-400 line-through" : "text-slate-700")}>{task.taskText}</span>
                  </button>
                  <button onClick={() => removeTask(task.id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-amber-200/70 bg-white/85 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">Mini Exercise</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["memory", "Memory sequence"],
                ["association", "Word association"],
                ["timer", "60-second focus timer"],
              ].map(([value, label]) => (
                <button key={value} onClick={() => { setExerciseMode(value as ExerciseMode); setExerciseMessage(""); }} className={cn("rounded-full border px-3 py-2 text-sm font-medium transition-all", exerciseMode === value ? "border-amber-300 bg-amber-100 text-amber-800" : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50")}>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {exerciseMode === "memory" && (
                <div>
                  <p className="text-sm font-medium text-slate-800">{memorySequence.prompt}</p>
                  {!showMemoryAnswer ? (
                    <>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {memorySequence.words.map((word) => <span key={word} className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700">{word}</span>)}
                      </div>
                      <button onClick={() => { setShowMemoryAnswer(true); setMemoryInput(""); }} className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-100">I am ready</button>
                    </>
                  ) : (
                    <>
                      <input value={memoryInput} onChange={(event) => setMemoryInput(event.target.value)} placeholder="Type the sequence in order" className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-300" />
                      <div className="mt-3 flex gap-2">
                        <button onClick={checkMemorySequence} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600">Check</button>
                        <button onClick={() => { setMemorySequence(buildMemorySequence()); setShowMemoryAnswer(false); setExerciseMessage(""); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">New sequence</button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {exerciseMode === "association" && (
                <div>
                  <p className="text-sm font-medium text-slate-800">Write three words you connect with <span className="font-bold">{associationPrompt}</span>.</p>
                  <textarea value={associationText} onChange={(event) => setAssociationText(event.target.value)} rows={3} placeholder="Example: steady, breath, pause" className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-300" />
                  <button onClick={submitAssociation} className="mt-3 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600">Complete exercise</button>
                </div>
              )}

              {exerciseMode === "timer" && (
                <div>
                  <p className="text-sm font-medium text-slate-800">Spend one minute focusing on just one task or one breath pattern.</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-xl font-bold text-slate-800 ring-1 ring-slate-200">{timerSeconds}s</div>
                    <button onClick={() => { setTimerRunning((prev) => !prev); setExerciseMessage(""); }} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600">
                      <Clock3 className="h-4 w-4" /> {timerRunning ? "Pause" : "Start timer"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {exerciseMessage && <p className="mt-3 text-sm text-slate-600">{exerciseMessage}</p>}
          </section>

          <section className="rounded-3xl border border-amber-200/70 bg-white/85 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">Reminders</h2>
            <p className="mt-1 text-xs text-slate-500">Quick prompts to keep visible when your mind feels full.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reminderPrompts.map((prompt) => (
                <button key={prompt} onClick={() => addReminderPrompt(prompt)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800">
                  {prompt}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {suggestionText}
            </div>
          </section>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <Shield className="h-5 w-5 shrink-0 text-slate-500" />
          <p className="text-[11px] leading-relaxed text-slate-500">Brain Fog Helper is designed for light support and organization. It is not a medical assessment or diagnosis tool.</p>
        </div>
      </div>
    </div>
  );
}
