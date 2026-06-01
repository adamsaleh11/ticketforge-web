import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  className?: string;
  subtitle?: string;
};

export function Wordmark({ className, subtitle }: WordmarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-accent shadow-[0_0_22px_rgba(139,92,246,0.35)]">
        <Sparkles aria-hidden="true" className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="font-heading text-lg font-semibold leading-none text-foreground">
          TicketForge
        </p>
        {subtitle ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
