"use client";

import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type {
  Project,
  ProjectProvider,
  ProjectStatus,
} from "@/lib/types/project";

type ProjectCardProps = {
  project: Project;
  isDeleting: boolean;
  onDelete: (projectId: string) => void;
};

const providerLabels: Record<ProjectProvider, string> = {
  groq: "Groq",
  ollama: "Ollama",
};

const providerClasses: Record<ProjectProvider, string> = {
  groq: "border-primary/30 bg-primary/15 text-accent",
  ollama: "border-cyan-300/30 bg-cyan-400/15 text-cyan-200",
};

const statusLabels: Record<ProjectStatus, string> = {
  draft: "Draft",
  generating: "Generating",
  ready: "Ready",
  failed: "Failed",
};

const statusClasses: Record<ProjectStatus, string> = {
  draft: "border-white/15 bg-white/10 text-muted-foreground",
  generating: "animate-pulse border-primary/30 bg-primary/15 text-accent",
  ready: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
  failed: "border-destructive/40 bg-destructive/15 text-red-200",
};

function formatTicketCount(ticketCount: number) {
  return `${ticketCount} ${ticketCount === 1 ? "ticket" : "tickets"}`;
}

export function ProjectCard({
  project,
  isDeleting,
  onDelete,
}: ProjectCardProps) {
  return (
    <div className="glass-card group flex min-h-52 flex-col rounded-lg p-5 shadow-2xl shadow-black/20 transition-all hover:border-primary/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            className="rounded-sm font-heading text-lg font-semibold leading-6 text-foreground outline-none transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href={`/projects/${project.id}`}
          >
            {project.name}
          </Link>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {project.description ?? "No description yet."}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              aria-label={`Delete project ${project.name}`}
              className="size-8 shrink-0 border-white/10 bg-white/5 text-muted-foreground hover:bg-destructive/15 hover:text-red-200"
              disabled={isDeleting}
              size="icon"
              type="button"
              variant="outline"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card border-white/10 bg-popover/95 text-foreground shadow-2xl shadow-black/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">
                Delete {project.name}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This project and its generated tickets will be removed from your
                workspace. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-white/10 bg-white/5 hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive/15 text-red-100 hover:bg-destructive/25"
                disabled={isDeleting}
                onClick={() => onDelete(project.id)}
              >
                {isDeleting ? "Deleting..." : "Delete project"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge
          className={cn("rounded-full border px-2.5 py-1", providerClasses[project.llmProvider])}
          variant="outline"
        >
          {providerLabels[project.llmProvider]}
        </Badge>
        <Badge
          className={cn("rounded-full border px-2.5 py-1", statusClasses[project.status])}
          variant="outline"
        >
          {statusLabels[project.status]}
        </Badge>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-6 text-sm text-muted-foreground">
        <FileText aria-hidden="true" className="size-4 text-accent" />
        <span>{formatTicketCount(project.ticketCount)}</span>
      </div>
    </div>
  );
}
