import { ArrowRight, Boxes, Braces, GitBranch, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/shared/glass-card";

const foundationItems = [
  {
    label: "Project intake",
    detail: "Structured prompts for product goals, constraints, and delivery phases.",
    icon: Braces,
  },
  {
    label: "Repository context",
    detail: "Frontend, backend, fullstack, and DevOps signals prepared for planning.",
    icon: GitBranch,
  },
  {
    label: "Agent tickets",
    detail: "Phased implementation tickets shaped for Claude Code and Codex handoff.",
    icon: Boxes,
  },
];

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl flex-col">
        <header className="glass-card flex items-center justify-between rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-accent">
              <Sparkles aria-hidden="true" className="size-4" />
            </div>
            <div>
              <p className="font-heading text-base font-semibold text-foreground">
                TicketForge
              </p>
              <p className="text-xs text-muted-foreground">
                Engineering tickets from project intent
              </p>
            </div>
          </div>
          <Badge className="border-primary/30 bg-primary/15 text-accent hover:bg-primary/20">
            Foundation
          </Badge>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <div className="max-w-2xl">
            <Badge className="mb-5 border-white/10 bg-white/10 text-foreground hover:bg-white/15">
              Next.js 14 App Router
            </Badge>
            <h1 className="text-balance font-heading text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              Forge scoped engineering tickets from product intent.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              TicketForge turns project descriptions, repository context, and
              model preferences into phased tickets that are ready for coding
              agents.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="violet-glow h-11 rounded-lg px-5 text-sm font-semibold">
                Start a project
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
              <Button
                className="h-11 rounded-lg border-white/10 bg-white/5 px-5 text-sm text-foreground hover:bg-white/10"
                variant="outline"
              >
                View foundation
              </Button>
            </div>
          </div>

          <GlassCard className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-semibold">
                  Build pipeline
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The frontend shell is ready for auth, projects, GitHub, and
                  tickets.
                </p>
              </div>
              <Badge className="border-primary/30 bg-primary/15 text-accent">
                Live
              </Badge>
            </div>

            <Separator className="my-5 bg-white/10" />

            <div className="space-y-3">
              {foundationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
                    key={item.label}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-accent">
                        <Icon aria-hidden="true" className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-medium text-foreground">
                          {item.label}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-lg border border-white/10 bg-background/45 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-foreground">
                  API readiness
                </p>
                <Badge className="border-blue-400/30 bg-blue-400/15 text-blue-200">
                  localhost:3001
                </Badge>
              </div>
              <div className="mt-4 space-y-2" aria-hidden="true">
                <Skeleton className="h-2 w-full bg-white/10" />
                <Skeleton className="h-2 w-4/5 bg-white/10" />
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}
