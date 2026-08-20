import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type AiCoreState = "idle" | "active" | "thinking" | "success";

const SIZES = {
  sm: "size-24",
  md: "size-40",
  lg: "size-64",
  xl: "size-80",
} as const;

/**
 * Futuristic AI core visual. Purely presentational, transform/opacity only.
 * States: idle (breathing), active (stronger pulse), thinking (orbiting energy),
 * success (single elegant completion pulse).
 */
export function AiCore({
  state = "idle",
  size = "md",
  className,
}: {
  state?: AiCoreState;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const thinking = state === "thinking";
  const active = state === "active" || thinking;
  const success = state === "success";

  return (
    <div
      aria-hidden
      className={cn("relative grid place-items-center", SIZES[size], className)}
      data-state={state}
    >
      {/* Ambient glow */}
      <div
        className={cn(
          "animate-breathe absolute inset-0 rounded-full bg-[image:var(--gradient-primary)] blur-2xl transition-opacity duration-700",
          success ? "opacity-60" : active ? "opacity-55" : "opacity-30",
          active && "[animation-duration:2.4s]",
        )}
      />

      {/* Orbiting energy rings */}
      <div
        className={cn(
          "absolute inset-[6%] rounded-full border border-primary/30",
          thinking ? "animate-orbit" : "animate-spin-slow",
        )}
      >
        <span className="absolute -top-[3px] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary-glow shadow-[0_0_10px_var(--primary-glow)]" />
      </div>
      <div
        className={cn(
          "absolute inset-[18%] rounded-full border border-violet/30 [animation-direction:reverse]",
          thinking ? "animate-orbit-slow" : "animate-spin-slow",
        )}
      >
        <span className="absolute -bottom-[3px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-violet shadow-[0_0_10px_var(--violet)]" />
      </div>

      {/* Energy ripples while thinking */}
      {thinking && (
        <>
          <span className="animate-ripple absolute inset-[22%] rounded-full border border-primary/40" />
          <span className="animate-ripple absolute inset-[22%] rounded-full border border-primary/30 [animation-delay:-1.3s]" />
        </>
      )}

      {/* Core */}
      <div
        className={cn(
          "glass relative grid place-items-center rounded-full transition-all duration-500",
          size === "sm" ? "size-11" : size === "md" ? "size-18" : "size-28",
          active && "shadow-[var(--shadow-glow)]",
          success && "animate-success-pop shadow-[var(--shadow-glow)]",
        )}
      >
        <Sparkles
          className={cn(
            "text-primary-glow transition-all duration-500",
            size === "sm" ? "size-5" : size === "md" ? "size-7" : "size-11",
            active && "animate-pulse-glow",
            success && "text-success",
          )}
        />
      </div>
    </div>
  );
}
