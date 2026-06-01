"use client";

import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <section className="w-full max-w-2xl">
        <GlassCard className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.22),transparent_54%)]" />
          <div className="relative">
            <div className="flex size-14 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/15 text-red-100 shadow-[0_0_28px_rgba(248,113,113,0.28)]">
              <AlertTriangle aria-hidden="true" className="size-7" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-red-200">
              System anomaly
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
              Houston, we have a problem
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              The workspace hit an unexpected error. Retry this view or return
              to mission control.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                className="violet-glow h-10 gap-2"
                onClick={reset}
                type="button"
              >
                <RotateCw aria-hidden="true" className="size-4" />
                Reset
              </Button>
              <Link
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-10 border-white/10 bg-white/5 hover:bg-white/10",
                )}
                href="/dashboard"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </GlassCard>
      </section>
    </main>
  );
}
