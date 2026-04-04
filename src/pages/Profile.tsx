import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { usePhase } from "@/hooks/usePhase";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
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
  const { profile, updateWeight, updateHeight, updatePeriodDuration } = useProfile();
  const { phase, phaseName, phaseEmoji, phaseColor } = usePhase();
  const { user } = useAuth();

  const showCycleSettings = phase === "puberty" || phase === "family-planning";

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
            <Link
              to="/"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold">My Profile</h1>
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
              <InfoRow
                icon={Activity}
                label="Average Cycle Length"
                value={profile.cycleLength ? `${profile.cycleLength} days` : "Not recorded"}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
              />

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
                  onChange={(e) => updatePeriodDuration(parseInt(e.target.value, 10))}
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
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Health Information
            </h3>
          </div>
          <div className="px-5 py-2 divide-y divide-border/40">
            <InfoRow
              icon={Activity}
              label="Haemoglobin"
              value={profile.haemoglobin ? `${profile.haemoglobin} g/dL` : "Not recorded"}
              iconBg="bg-red-50"
              iconColor="text-red-600"
            />
            <InfoRow
              icon={Heart}
              label="Known Conditions"
              value={profile.knownConditions || "None reported"}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>
        </section>

        {/* ── Location ─────────────────────────────────────────── */}
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-muted/20">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Location
            </h3>
          </div>
          <div className="px-5 py-2 divide-y divide-border/40">
            <InfoRow icon={MapPin} label="State" value={profile.state} iconBg="bg-teal-50" iconColor="text-teal-600" />
            <InfoRow icon={MapPin} label="District" value={profile.district} iconBg="bg-teal-50" iconColor="text-teal-600" />
            <InfoRow icon={MapPin} label="Village / City" value={profile.village} iconBg="bg-teal-50" iconColor="text-teal-600" />
            <InfoRow icon={MapPin} label="Pincode" value={profile.pincode} iconBg="bg-teal-50" iconColor="text-teal-600" />
          </div>
        </section>

        {/* ── Privacy Footer ──────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All your profile data is stored locally on your device. Nothing is sent to any server.
            To update your name, DOB, or location, please re-register.
          </p>
        </div>
      </div>
    </main>
  );
}
