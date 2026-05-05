import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { usePhase } from "@/hooks/usePhase";
import { useAuth } from "@/hooks/useAuth";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Scale,
  Ruler,
  Heart,
  Activity,
  Shield,
  ArrowLeft,
  Pencil,
  Check,
  X,
  Droplets,
  Info,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── BMI Gauge ────────────────────────────────────────────────────────────────

function BMIGauge({ bmi, category }: { bmi: number | null; category: string }) {
  if (bmi === null) return null;

  const pct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
  const color =
    category === "Normal"
      ? "from-emerald-400 to-green-500"
      : category === "Underweight"
      ? "from-amber-400 to-yellow-500"
      : "from-red-400 to-orange-500";
  const textColor =
    category === "Normal"
      ? "text-emerald-700"
      : category === "Underweight"
      ? "text-amber-700"
      : "text-red-700";
  const bgColor =
    category === "Normal"
      ? "bg-emerald-50"
      : category === "Underweight"
      ? "bg-amber-50"
      : "bg-red-50";

  return (
    <div className={`rounded-2xl ${bgColor} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${textColor}`} />
          <p className="text-sm font-semibold text-foreground">Body Mass Index</p>
        </div>
        <span className={`text-lg font-bold ${textColor}`}>{bmi}</span>
      </div>

      <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-amber-300 via-emerald-400 to-red-400 mb-2 overflow-hidden">
        <div
          className="absolute top-0 w-4 h-4 -mt-0.5 rounded-full bg-white border-2 border-foreground/50 shadow-md transition-all duration-700"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>

      <p className={`text-sm font-semibold ${textColor} text-center`}>{category}</p>
    </div>
  );
}

// ─── Editable Field ───────────────────────────────────────────────────────────

function EditableMetric({
  label,
  value,
  unit,
  icon: Icon,
  onSave,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number | null;
  unit: string;
  icon: any;
  onSave: (val: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));

  function startEdit() {
    setDraft(String(value ?? ""));
    setEditing(true);
  }

  function save() {
    const num = parseFloat(draft);
    if (isNaN(num) || num < min || num > max) {
      toast.error(`Enter a valid ${label.toLowerCase()} (${min}–${max} ${unit})`);
      return;
    }
    onSave(num);
    setEditing(false);
    toast.success(`${label} updated to ${num} ${unit}`);
  }

  function cancel() {
    setEditing(false);
    setDraft(String(value ?? ""));
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-all hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                min={min}
                max={max}
                step={step}
                className="w-20 h-8 rounded-lg border border-primary/40 bg-primary/5 px-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") cancel();
                }}
              />
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          ) : (
            <p className="text-lg font-bold text-foreground">
              {value !== null ? `${value} ${unit}` : "Not set"}
            </p>
          )}
        </div>
      </div>

      {editing ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={save}
            className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200 transition-colors"
            aria-label="Save"
          >
            <Check className="w-4 h-4 text-emerald-700" />
          </button>
          <button
            type="button"
            onClick={cancel}
            className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
            aria-label="Cancel"
          >
            <X className="w-4 h-4 text-red-700" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
          aria-label={`Edit ${label}`}
        >
          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
}: {
  icon: any;
  label: string;
  value: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { profile, updateWeight, updateHeight, updateCycleConfig, updatePersonalInfo, updateLifestyle } = useProfile();
  const { phase, phaseName, phaseEmoji, phaseColor } = usePhase();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isSetup = searchParams.get("setup") === "true";
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [showMenarcheDate, setShowMenarcheDate] = useState(() => {
    // Default to showing menarche date only if user is in puberty phase
    return phase === "puberty";
  });
  const [draftDob, setDraftDob] = useState(profile.dob || "");
  const [draftBloodGroup, setDraftBloodGroup] = useState(profile.bloodGroup || "");
  const [draftMenarcheDate, setDraftMenarcheDate] = useState<string | null>(profile.menarcheDate || null);
  const [draftMedicalConditions, setDraftMedicalConditions] = useState<string[]>(profile.medicalConditions || []);
  const [draftRegion, setDraftRegion] = useState<"north" | "south" | "east" | "west">(profile.region || "north");
  useEffect(() => {
    setDraftDob(profile.dob || "");
    setDraftBloodGroup(profile.bloodGroup || "");
    setDraftMenarcheDate(profile.menarcheDate || null);
    setDraftMedicalConditions(profile.medicalConditions || []);
    setDraftRegion(profile.region || "north");
  }, [profile.dob, profile.bloodGroup, profile.menarcheDate, profile.medicalConditions, profile.region]);
  
  const handleFinishSetup = () => {
    if (profile.weight === null || profile.height === null) {
      toast.error("Please add your weight and height to finish the setup profile", {
        description: "This will help us calculate your BMI and personalize recommendations."
      });
      return;
    }
    navigate("/");
  };

  const showCycleSettings = phase === "puberty" || phase === "family-planning";
  const CONDITION_OPTIONS = ["Hypothyroidism", "Hyperthyroidism", "PCOD", "PCOS", "Diabetes", "Anemia", "Osteoporosis"];
  const CONDITION_GUIDANCE: Record<string, string> = {
    Hypothyroidism: "Slow metabolism diet, iodine intake, and light exercise plan",
    Hyperthyroidism: "Calorie-rich diet, avoid excess iodine, and stress management",
    PCOD: "Hormonal balance diet, weight management, and cycle tracking",
    PCOS: "Hormonal balance diet, weight management, and cycle tracking",
    Diabetes: "Low sugar diet and glucose monitoring reminders",
    Anemia: "Iron-rich food suggestions and supplement reminders",
    Osteoporosis: "Calcium + Vitamin D focus and bone-strength exercises",
  };

  // Generate initials for avatar
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = profile.registeredAt
    ? new Date(profile.registeredAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "";

  const toggleCondition = (condition: string) => {
    setDraftMedicalConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition],
    );
  };

  const savePersonalHealth = () => {
    if (!draftDob) {
      toast.error("Date of birth is required.");
      return;
    }
    updatePersonalInfo({
      dob: draftDob,
      bloodGroup: draftBloodGroup,
      menarcheDate: draftMenarcheDate,
      medicalConditions: draftMedicalConditions,
      region: draftRegion,
    });
    setEditingPersonal(false);
    toast.success("Profile health details updated.");
  };

  if (!user || !profile.isProfileAvailable) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">No Profile Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Create an account to set up your personal health profile.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Create Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-50 via-pink-50/30 to-white border-b border-border/60">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-4">
            {!isSetup && (
              <Link
                to="/"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            <h1 className="text-xl font-bold">{isSetup ? "Setup Your Profile" : "My Profile"}</h1>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-200/50">
              <span className="text-xl font-bold text-white">{initials || "?"}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-[11px] font-semibold rounded-full border px-2.5 py-0.5",
                    phaseColor
                  )}
                >
                  {phaseEmoji} {phaseName}
                </span>
                {memberSince && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
                    <Clock className="w-3 h-3" /> Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-5">
        {/* ── Personal Information ─────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal Information
            </h3>
          </div>
          <div className="px-5 py-2 divide-y divide-border/40">
            <InfoRow icon={User} label="Full Name" value={profile.name} />
            <div className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Age
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {profile.age > 0 ? `${profile.age} years` : "—"}
                </p>
              </div>
              <div className="group relative">
                <Info className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-52 rounded-xl bg-foreground text-background text-[11px] px-3 py-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                  Age is automatically calculated from your date of birth and advances each year.
                </div>
              </div>
            </div>
            <InfoRow
              icon={Calendar}
              label="Date of Birth"
              value={
                profile.dob
                  ? new Date(profile.dob).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""
              }
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <InfoRow
              icon={Droplets}
              label="Blood Group"
              value={profile.bloodGroup || "Not set"}
              iconBg="bg-red-50"
              iconColor="text-red-600"
            />
            <InfoRow
              icon={Phone}
              label="Mobile"
              value={profile.mobile ? `+91 ${profile.mobile}` : ""}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            {profile.email && (
              <InfoRow
                icon={Mail}
                label="Email"
                value={profile.email}
                iconBg="bg-teal-50"
                iconColor="text-teal-600"
              />
            )}
          </div>
        </section>

        {/* ── Body Metrics ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Body Metrics
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Tap the pencil icon to update your measurements
            </p>
          </div>
          <div className="p-5 space-y-3">
            <EditableMetric
              label="Weight"
              value={profile.weight}
              unit="kg"
              icon={Scale}
              onSave={updateWeight}
              min={20}
              max={200}
              step={0.5}
            />
            <EditableMetric
              label="Height"
              value={profile.height}
              unit="cm"
              icon={Ruler}
              onSave={updateHeight}
              min={80}
              max={250}
            />

            {/* BMI */}
            {profile.bmi !== null && (
              <BMIGauge bmi={profile.bmi} category={profile.bmiCategory} />
            )}

            {profile.bmi === null && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-700">
                  <strong>Tip:</strong> Set your weight and height above to see your BMI analysis.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Lifestyle Settings ────────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Lifestyle Settings
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Used for hydration, calorie, and protein recommendations
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Activity Level</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["sedentary", "moderate", "active"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateLifestyle({ activityLevel: level })}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all active:scale-[0.97] capitalize",
                      profile.activityLevel === level
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {level === "sedentary" ? "🪑 Sedentary" : level === "moderate" ? "🚶 Moderate" : "🏃 Active"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {profile.activityLevel === "sedentary"
                  ? "Mostly sitting, minimal physical activity"
                  : profile.activityLevel === "active"
                  ? "Regular exercise, sports, or physical work"
                  : "Light walks, some physical activity"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Climate</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["hot", "moderate", "cold"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateLifestyle({ climate: c })}
                    className={cn(
                      "py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all active:scale-[0.97] capitalize",
                      profile.climate === c
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {c === "hot" ? "🌡️ Hot" : c === "moderate" ? "🌤️ Moderate" : "❄️ Cold"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {profile.climate === "hot"
                  ? "Tropical / summer climate — higher hydration needs"
                  : profile.climate === "cold"
                  ? "Cold / winter climate — lower sweat loss"
                  : "Temperate climate — moderate hydration needs"}
              </p>
            </div>
          </div>
        </section>

        {/* ── Cycle Settings (puberty / family-planning only) ── */}
        {showCycleSettings && (
          <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-pink-500" />
                Cycle Settings
              </h3>
            </div>
            <div className="px-5 py-4 space-y-4">
              <InfoRow
                icon={Calendar}
                label="Last Period Date"
                value={
                  profile.lastPeriodDate
                    ? new Date(profile.lastPeriodDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not recorded"
                }
                iconBg="bg-pink-50"
                iconColor="text-pink-600"
              />
              {/* Cycle Length Slider */}
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-semibold">Average Cycle Length</p>
                  </div>
                  <span className="text-lg font-bold text-purple-700">{profile.cycleLength || 28} days</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={45}
                  step={1}
                  value={profile.cycleLength || 28}
                  onChange={(e) => updateCycleConfig(profile.periodDuration, parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-purple-200 to-purple-500 cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:shadow-md
                    [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-600 [&::-moz-range-thumb]:shadow-md"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 px-0.5">
                  <span>15</span>
                  <span>28</span>
                  <span>45</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  This helps predict your upcoming cycles accurately.
                </p>
              </div>

              {/* Period Duration Slider */}
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-pink-500" />
                    <p className="text-sm font-semibold">Period Duration</p>
                  </div>
                  <span className="text-lg font-bold text-pink-600">{profile.periodDuration} days</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={7}
                  step={1}
                  value={profile.periodDuration}
                  onChange={(e) => updateCycleConfig(parseInt(e.target.value, 10), profile.cycleLength || 28)}
                  className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-pink-200 to-pink-400 cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-pink-500 [&::-webkit-slider-thumb]:shadow-md
                    [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-pink-500 [&::-moz-range-thumb]:shadow-md"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 px-0.5">
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  This controls how many days are auto-marked when you set a period start date on the calendar.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Health Info ──────────────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Health Information
              </h3>
              <button
                type="button"
                onClick={() => setEditingPersonal((v) => !v)}
                className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Edit health details"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="px-5 py-2 divide-y divide-border/40">
            <InfoRow
              icon={Calendar}
              label="Date of Birth"
              value={profile.dob ? new Date(profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not recorded"}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            {profile.menarcheDate && phase === "puberty" && (
              <div className="px-5 py-2 divide-y divide-border/40">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Menarche Date</p>
                      <p className="text-xs text-muted-foreground">First period date</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMenarcheDate(!showMenarcheDate)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground">
                      {showMenarcheDate ? "Hide" : "Show"}
                    </span>
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      showMenarcheDate ? "bg-pink-500" : "bg-muted"
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        showMenarcheDate ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </div>
                  </button>
                </div>
                {showMenarcheDate && (
                  <InfoRow
                    icon={Calendar}
                    label=""
                    value={new Date(profile.menarcheDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    iconBg="bg-transparent"
                    iconColor="text-transparent"
                  />
                )}
              </div>
            )}
            <InfoRow
              icon={Activity}
              label="Haemoglobin"
              value={profile.haemoglobin ? `${profile.haemoglobin} g/dL` : "Not recorded"}
              iconBg="bg-red-50"
              iconColor="text-red-600"
            />
            <InfoRow
              icon={Heart}
              label="Medical Conditions"
              value={profile.medicalConditions.length > 0 ? profile.medicalConditions.join(", ") : "None reported"}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>
          {editingPersonal && (
            <div className="px-5 py-4 border-t border-border/40 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={draftDob}
                    onChange={(e) => setDraftDob(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blood Group</label>
                  <select
                    value={draftBloodGroup}
                    onChange={(e) => setDraftBloodGroup(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm bg-background"
                  >
                    {["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg || "none"} value={bg}>{bg || "Select"}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menarche Date (First Period)</label>
                  <input
                    type="date"
                    value={draftMenarcheDate || ""}
                    onChange={(e) => setDraftMenarcheDate(e.target.value || null)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm"
                    placeholder="Optional - for puberty phase users"
                  />
                  <p className="text-xs text-muted-foreground">Helps provide personalized puberty nutrition guidance</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Medical Conditions</p>
                <p className="text-xs text-muted-foreground mb-2">This helps us give you personalized health insights.</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {CONDITION_OPTIONS.map((condition) => {
                    const active = draftMedicalConditions.includes(condition);
                    return (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => toggleCondition(condition)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm text-left",
                          active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/40",
                        )}
                      >
                        {condition}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={savePersonalHealth} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Save</button>
                <button type="button" onClick={() => setEditingPersonal(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold">Cancel</button>
              </div>
            </div>
          )}
          {profile.medicalConditions.length > 0 && (
            <div className="px-5 py-4 border-t border-border/40 bg-amber-50/50">
              <p className="text-xs font-semibold text-amber-800 mb-2">Personalized focus based on your conditions</p>
              <ul className="space-y-1">
                {profile.medicalConditions.map((condition) => (
                  <li key={condition} className="text-xs text-amber-700">
                    <strong>{condition}:</strong> {CONDITION_GUIDANCE[condition] || "Personalized guidance enabled."}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── Location ─────────────────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                Region
              </h3>
              <button
                type="button"
                onClick={() => setEditingPersonal((v) => !v)}
                className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Edit region"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="px-5 py-2 divide-y divide-border/40">
            <InfoRow
              icon={MapPin}
              label="Region"
              value={
                profile.region === "north"
                  ? "North India"
                  : profile.region === "south"
                  ? "South India"
                  : profile.region === "east"
                  ? "East India"
                  : "West India"
              }
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
            />
          </div>
          {editingPersonal && (
            <div className="px-5 py-4 border-t border-border/40">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Edit Region</label>
              <select
                value={draftRegion}
                onChange={(e) => setDraftRegion(e.target.value as any)}
                className="h-10 w-full rounded-lg border border-border px-3 text-sm bg-background max-w-xs"
              >
                <option value="north">North India</option>
                <option value="south">South India</option>
                <option value="east">East India</option>
                <option value="west">West India</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Region is used for food, lifestyle, and climate-based personalized recommendations.
              </p>
            </div>
          )}
        </section>

        {/* ── Privacy Footer ──────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All your profile data is stored locally on your device. Nothing is sent to any server.
            You can update DOB, blood group, and medical conditions from this profile page.
          </p>
        </div>

        {/* ── Finish Setup Button ──────────────────────────────────── */}
        {isSetup && (
          <div className="pt-4 pb-8 flex justify-center">
            <button
              onClick={handleFinishSetup}
              className="w-full max-w-sm rounded-xl py-4 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Finish Setup & Go to Home
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
