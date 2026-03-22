import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface VoiceButtonProps {
  type: "mic" | "speaker";
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export default function VoiceButton({ type, active, onClick, disabled, size = "md" }: VoiceButtonProps) {
  const { t } = useLanguage();
  const sizeClasses = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={type === "mic" ? t("voiceInput") : t("voiceOutput")}
      className={`${sizeClasses} shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
        active
          ? type === "mic"
            ? "bg-red-500 text-white animate-recording-pulse shadow-lg shadow-red-500/30"
            : "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      id={type === "mic" ? "voice-mic-btn" : "voice-speaker-btn"}
    >
      {type === "mic" ? (
        active ? <MicOff className={iconSize} /> : <Mic className={iconSize} />
      ) : (
        active ? <VolumeX className={iconSize} /> : <Volume2 className={iconSize} />
      )}
    </button>
  );
}
