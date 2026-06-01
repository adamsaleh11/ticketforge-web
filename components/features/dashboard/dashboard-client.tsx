"use client";

import { useState } from "react";
import { AlertCircle, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { ProjectCard } from "@/components/features/projects/project-card";
import { ProjectCardSkeleton } from "@/components/features/projects/project-card-skeleton";
import { NewProjectDialog } from "@/components/features/projects/new-project-dialog";
import { useDeleteProject, useProjects } from "@/lib/hooks/use-projects";

function DashboardSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </div>
  );
}

type DashboardEmptyStateProps = {
  onCreateProject: () => void;
};

function DashboardEmptyState({ onCreateProject }: DashboardEmptyStateProps) {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <GlassCard className="w-full max-w-lg p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-accent shadow-[0_0_26px_rgba(139,92,246,0.4)]">
          <Sparkles aria-hidden="true" className="size-7" />
        </div>
        <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
          Forge your first project
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Start with a project idea and turn it into phased engineering tickets.
        </p>
        <Button
          className="violet-glow mt-6 h-10 gap-2 px-4"
          onClick={onCreateProject}
        >
          <Sparkles aria-hidden="true" className="size-4" />
          New Project
        </Button>
      </GlassCard>
    </div>
  );
}

type DashboardErrorStateProps = {
  isRetrying: boolean;
  onRetry: () => void;
};

function DashboardErrorState({ isRetrying, onRetry }: DashboardErrorStateProps) {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-red-200">
            <AlertCircle aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Projects could not be loaded
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Retry the request or check the API connection.
            </p>
          </div>
        </div>
        <Button
          className="h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
          disabled={isRetrying}
          onClick={onRetry}
          variant="outline"
        >
          <RotateCw
            aria-hidden="true"
            className={isRetrying ? "size-4 animate-spin" : "size-4"}
          />
          Retry
        </Button>
      </div>
    </GlassCard>
  );
}

export function DashboardClient() {
  const [isNewProjectOpen, setNewProjectOpen] = useState(false);
  const projectsQuery = useProjects();
  const deleteProjectMutation = useDeleteProject();
  const deletingProjectId = deleteProjectMutation.isPending
    ? deleteProjectMutation.variables?.projectId
    : null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Dashboard
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            Your project forge
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Track planning projects, generation status, and generated ticket
            volume from one workspace.
          </p>
        </div>
        <Button
          className="violet-glow h-10 w-full gap-2 sm:w-auto"
          onClick={() => setNewProjectOpen(true)}
        >
          <Sparkles aria-hidden="true" className="size-4" />
          New Project
        </Button>
      </div>

      {projectsQuery.isPending ? <DashboardSkeletonGrid /> : null}

      {projectsQuery.isError ? (
        <DashboardErrorState
          isRetrying={projectsQuery.isFetching}
          onRetry={() => {
            void projectsQuery.refetch();
          }}
        />
      ) : null}

      {projectsQuery.isSuccess && projectsQuery.data.length === 0 ? (
        <DashboardEmptyState onCreateProject={() => setNewProjectOpen(true)} />
      ) : null}

      {projectsQuery.isSuccess && projectsQuery.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {projectsQuery.data.map((project) => (
            <ProjectCard
              isDeleting={deletingProjectId === project.id}
              key={project.id}
              onDelete={(projectId) => {
                deleteProjectMutation.mutate({ projectId });
              }}
              project={project}
            />
          ))}
        </div>
      ) : null}

      <NewProjectDialog
        onOpenChange={setNewProjectOpen}
        open={isNewProjectOpen}
      />
    </section>
  );
}
