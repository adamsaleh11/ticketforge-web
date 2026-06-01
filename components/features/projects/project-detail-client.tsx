"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  FileText,
  Loader2,
  RotateCw,
  Sparkles,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/shared/glass-card";
import { TicketCard } from "@/components/features/projects/ticket-card";
import {
  useGenerateTickets,
  useProjectDetail,
  useUpdateTicketStatus,
} from "@/lib/hooks/use-project-detail";
import { cn } from "@/lib/utils";
import type {
  Phase,
  ProjectDetail,
  ProjectProvider,
  TicketStatus,
} from "@/lib/types/project";

type ProjectDetailClientProps = {
  projectId: string;
};

const providerLabels: Record<ProjectProvider, string> = {
  groq: "Groq",
  ollama: "Ollama",
};

const providerClasses: Record<ProjectProvider, string> = {
  groq: "border-primary/30 bg-primary/15 text-accent",
  ollama: "border-cyan-300/30 bg-cyan-400/15 text-cyan-200",
};

const generationMessages = [
  "Analyzing your project...",
  "Designing phases...",
  "Drafting tickets...",
  "Almost there...",
] as const;

function formatTicketCount(ticketCount: number) {
  return `${ticketCount} ${ticketCount === 1 ? "ticket" : "tickets"}`;
}

function ProjectDetailSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <Skeleton className="h-5 w-24 border border-white/10 bg-white/10" />
        <Skeleton className="h-10 w-full max-w-lg border border-white/10 bg-white/10" />
        <Skeleton className="h-20 w-full max-w-3xl border border-white/10 bg-white/10" />
      </div>
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            className="h-24 rounded-lg border border-white/10 bg-white/10"
            key={index}
          />
        ))}
      </div>
    </section>
  );
}

type ProjectLoadErrorProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

function ProjectLoadError({ isRetrying, onRetry }: ProjectLoadErrorProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <GlassCard className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-red-200">
              <AlertCircle aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-semibold text-foreground">
                Project could not be loaded
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Retry the request or return to the dashboard.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
              disabled={isRetrying}
              onClick={onRetry}
              type="button"
              variant="outline"
            >
              <RotateCw
                aria-hidden="true"
                className={isRetrying ? "size-4 animate-spin" : "size-4"}
              />
              Retry
            </Button>
            <Link className={cn(buttonVariants(), "h-9")} href="/dashboard">
              Dashboard
            </Link>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

type ProjectHeaderProps = {
  project: ProjectDetail;
  isGenerating: boolean;
  onRegenerate: () => void;
};

function ProjectHeader({
  project,
  isGenerating,
  onRegenerate,
}: ProjectHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Project
        </p>
        <h1 className="mt-3 break-words font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {project.name}
        </h1>
        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground sm:text-base">
          {project.description ?? "No description yet."}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              "border px-2.5 py-1",
              providerClasses[project.llmProvider],
            )}
            variant="outline"
          >
            {providerLabels[project.llmProvider]}
          </Badge>
          {project.githubRepoFullName ? (
            <a
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-8 gap-2 border-white/10 bg-white/5 px-3 text-muted-foreground hover:bg-white/10 hover:text-foreground",
              )}
              href={`https://github.com/${project.githubRepoFullName}`}
              rel="noreferrer"
              target="_blank"
            >
              {project.githubRepoFullName}
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      <Button
        className="violet-glow h-10 w-full gap-2 sm:w-auto"
        disabled={isGenerating}
        onClick={onRegenerate}
        type="button"
      >
        {isGenerating ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <RotateCw aria-hidden="true" className="size-4" />
        )}
        Regenerate
      </Button>
    </header>
  );
}

type GenerateTicketsPanelProps = {
  descriptionDraft: string;
  isGenerating: boolean;
  onDescriptionChange: (description: string) => void;
  onGenerate: () => void;
};

function GenerateTicketsPanel({
  descriptionDraft,
  isGenerating,
  onDescriptionChange,
  onGenerate,
}: GenerateTicketsPanelProps) {
  return (
    <div className="flex min-h-[480px] items-center justify-center">
      <GlassCard className="w-full max-w-3xl p-5 sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-accent shadow-[0_0_30px_rgba(139,92,246,0.45)]">
          <Sparkles aria-hidden="true" className="size-8" />
        </div>
        <div className="mt-6 text-center">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Generate Tickets
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Refine the brief, then forge phased tickets for this project.
          </p>
        </div>

        <div className="mt-7 space-y-3">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="project-description"
          >
            Project description
          </label>
          <Textarea
            className="min-h-44 border-white/10 bg-white/5 text-foreground shadow-inner shadow-black/20 placeholder:text-muted-foreground focus-visible:ring-accent focus-visible:ring-offset-background"
            disabled={isGenerating}
            id="project-description"
            onChange={(event) => onDescriptionChange(event.target.value)}
            value={descriptionDraft}
          />
        </div>

        <div className="mt-7 flex justify-center">
          <Button
            className="violet-glow h-11 w-full max-w-xs gap-2"
            disabled={isGenerating || descriptionDraft.trim().length === 0}
            onClick={onGenerate}
            type="button"
          >
            {isGenerating ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <Sparkles aria-hidden="true" className="size-4" />
            )}
            Generate Tickets
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

type FailedProjectCardProps = {
  errorMessage: string | null | undefined;
  isRetrying: boolean;
  onRetry: () => void;
};

function FailedProjectCard({
  errorMessage,
  isRetrying,
  onRetry,
}: FailedProjectCardProps) {
  return (
    <GlassCard className="border-destructive/40 bg-destructive/10 p-6 shadow-[0_0_34px_rgba(248,113,113,0.16)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/15 text-red-100">
            <AlertCircle aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-red-100">
              Ticket generation failed
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-100/75">
              {errorMessage ??
                "Retry generation or refine the project description first."}
            </p>
          </div>
        </div>
        <Button
          className="h-9 gap-2 bg-red-100 text-red-950 hover:bg-red-100/90"
          disabled={isRetrying}
          onClick={onRetry}
          type="button"
        >
          {isRetrying ? (
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <RotateCw aria-hidden="true" className="size-4" />
          )}
          Retry
        </Button>
      </div>
    </GlassCard>
  );
}

type PhaseAccordionProps = {
  phases: Phase[];
  updatingTicketId: string | null;
  onTicketStatusChange: (ticketId: string, status: TicketStatus) => void;
};

function PhaseAccordion({
  phases,
  updatingTicketId,
  onTicketStatusChange,
}: PhaseAccordionProps) {
  return (
    <Accordion
      className="space-y-4"
      defaultValue={phases[0] ? `phase-${phases[0].id}` : undefined}
      type="single"
      collapsible
    >
      {phases.map((phase) => (
        <AccordionItem
          className="glass-card rounded-lg border-white/10 px-4 shadow-xl shadow-black/20"
          key={phase.id}
          value={`phase-${phase.id}`}
        >
          <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline">
            <span className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  Phase {phase.number}
                </span>
                <span className="mt-1 block truncate font-heading text-lg font-semibold text-foreground">
                  {phase.title}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                <FileText aria-hidden="true" className="size-4 text-accent" />
                {formatTicketCount(phase.tickets.length)}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            {phase.description ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {phase.description}
              </p>
            ) : null}
            <div className="space-y-3">
              {phase.tickets.map((ticket) => (
                <TicketCard
                  isUpdating={updatingTicketId === ticket.id}
                  key={ticket.id}
                  onStatusChange={onTicketStatusChange}
                  ticket={ticket}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function OverlayStarfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.5 + Math.random() * 1.4,
      speed: 0.001 + Math.random() * 0.002,
      offset: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      for (const star of stars) {
        const alpha = 0.35 + Math.sin(time * star.speed + star.offset) * 0.28;
        context.beginPath();
        context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(228, 230, 241, ${Math.max(0.18, alpha)})`;
        context.shadowBlur = star.radius * 5;
        context.shadowColor = "rgba(192, 132, 252, 0.6)";
        context.fill();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    animationFrame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      ref={canvasRef}
    />
  );
}

function GenerationOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % generationMessages.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background/95 px-4 backdrop-blur-sm">
      <OverlayStarfield />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.24),transparent_55%)]" />
      <div className="relative z-10 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-accent shadow-[0_0_34px_rgba(139,92,246,0.55)]">
          <Sparkles aria-hidden="true" className="size-8 animate-pulse" />
        </div>
        <p className="mt-6 font-heading text-2xl font-semibold text-foreground">
          {generationMessages[messageIndex]}
        </p>
      </div>
    </div>
  );
}

export function ProjectDetailClient({ projectId }: ProjectDetailClientProps) {
  const projectQuery = useProjectDetail(projectId);
  const project = projectQuery.data;
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const generateMutation = useGenerateTickets(project);
  const updateTicketStatusMutation = useUpdateTicketStatus(projectId);
  const updatingTicketId = updateTicketStatusMutation.isPending
    ? updateTicketStatusMutation.variables.ticketId
    : null;
  const loadedProjectId = project?.id;
  const loadedDescription = project?.description;

  useEffect(() => {
    if (loadedProjectId) {
      setDescriptionDraft(loadedDescription ?? "");
    }
  }, [loadedProjectId, loadedDescription]);

  const isGenerating =
    generateMutation.isPending || projectQuery.data?.status === "generating";
  const shouldShowGeneratePanel =
    project?.status !== "failed" &&
    (project?.status === "draft" || (project?.phases.length ?? 0) === 0);
  const canRenderReadyBoard =
    project?.status === "ready" && project.phases.length > 0;

  const handleGenerate = () => {
    if (!project || generateMutation.isPending) {
      return;
    }

    generateMutation.mutate({ description: descriptionDraft });
  };

  const handleTicketStatusChange = (
    ticketId: string,
    status: TicketStatus,
  ) => {
    updateTicketStatusMutation.mutate({ ticketId, status });
  };

  if (projectQuery.isPending) {
    return <ProjectDetailSkeleton />;
  }

  if (projectQuery.isError || !project) {
    return (
      <ProjectLoadError
        isRetrying={projectQuery.isFetching}
        onRetry={() => {
          void projectQuery.refetch();
        }}
      />
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {isGenerating ? <GenerationOverlay /> : null}

      <ProjectHeader
        isGenerating={isGenerating}
        onRegenerate={handleGenerate}
        project={project}
      />

      {shouldShowGeneratePanel ? (
        <GenerateTicketsPanel
          descriptionDraft={descriptionDraft}
          isGenerating={isGenerating}
          onDescriptionChange={setDescriptionDraft}
          onGenerate={handleGenerate}
        />
      ) : null}

      {!shouldShowGeneratePanel && project.status === "failed" ? (
        <FailedProjectCard
          errorMessage={project.generationFailureMessage}
          isRetrying={isGenerating}
          onRetry={handleGenerate}
        />
      ) : null}

      {canRenderReadyBoard ? (
        <PhaseAccordion
          onTicketStatusChange={handleTicketStatusChange}
          phases={project.phases}
          updatingTicketId={updatingTicketId}
        />
      ) : null}
    </section>
  );
}
