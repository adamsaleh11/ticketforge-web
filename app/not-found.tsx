import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

function FloatingAstronaut() {
  return (
    <svg
      aria-hidden="true"
      className="h-44 w-44 animate-[float_6s_ease-in-out_infinite] sm:h-56 sm:w-56"
      fill="none"
      viewBox="0 0 220 220"
    >
      <g filter="url(#astronaut-glow)">
        <path
          d="M94 62c-20 7-31 29-24 49l6 18c7 20 29 31 49 24l10-3c20-7 31-29 24-49l-6-18c-7-20-29-31-49-24l-10 3Z"
          fill="#e4e6f1"
        />
        <path
          d="M82 93c-3-18 10-35 28-38 18-3 35 10 38 28 3 18-10 35-28 38-18 3-35-10-38-28Z"
          fill="#111632"
          stroke="#c084fc"
          strokeWidth="5"
        />
        <path
          d="M95 86c9-11 28-14 40-2"
          stroke="#8b5cf6"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M75 128 51 150M150 115l30 10M102 154l-3 34M133 145l19 30"
          stroke="#e4e6f1"
          strokeLinecap="round"
          strokeWidth="12"
        />
        <path
          d="m43 149 14-14 12 12-14 14c-4 4-10 4-13 1-3-4-3-9 1-13ZM176 115l20 7-4 17-21-6c-5-1-8-6-7-11 2-5 7-8 12-7ZM90 187h19v16H90c-5 0-9-4-9-8s4-8 9-8ZM145 177l17-8 8 15-17 9c-5 2-10 0-12-4-2-5 0-10 4-12Z"
          fill="#c084fc"
        />
        <circle cx="65" cy="55" r="4" fill="#c084fc" />
        <circle cx="172" cy="58" r="3" fill="#e4e6f1" />
        <circle cx="185" cy="166" r="4" fill="#8b5cf6" />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="220"
          id="astronaut-glow"
          width="220"
          x="0"
          y="0"
        >
          <feDropShadow
            dx="0"
            dy="0"
            floodColor="#8b5cf6"
            floodOpacity="0.55"
            stdDeviation="8"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <section className="grid w-full max-w-5xl items-center gap-8 md:grid-cols-[1fr_0.85fr]">
        <GlassCard className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            404
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
            Lost in space
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            This route drifted beyond the TicketForge star map. Head back to
            the dashboard to keep planning.
          </p>
          <Link
            className={cn(buttonVariants(), "violet-glow mt-7 h-10 gap-2")}
            href="/dashboard"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to dashboard
          </Link>
        </GlassCard>

        <div className="flex justify-center md:justify-end">
          <FloatingAstronaut />
        </div>
      </section>
    </main>
  );
}
