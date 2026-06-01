import type { ReactNode } from "react";
import { GlassCard } from "@/components/shared/glass-card";

type ProtectedPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function ProtectedPageShell({
  eyebrow,
  title,
  description,
  children,
}: ProtectedPageShellProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <GlassCard className="p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </GlassCard>
    </section>
  );
}
