"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCopy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Ticket, TicketRepo, TicketStatus } from "@/lib/types/project";

type TicketCardProps = {
  ticket: Ticket;
  isUpdating: boolean;
  onStatusChange: (ticketId: string, status: TicketStatus) => void;
};

const repoLabels: Record<TicketRepo, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  devops: "DevOps",
};

const repoClasses: Record<TicketRepo, string> = {
  frontend: "border-primary/30 bg-primary/15 text-accent",
  backend: "border-blue-300/30 bg-blue-400/15 text-blue-200",
  fullstack:
    "border-primary/30 bg-gradient-to-r from-primary/25 to-blue-400/25 text-violet-100",
  devops: "border-orange-300/30 bg-orange-400/15 text-orange-200",
};

const statusLabels: Record<TicketStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

const ticketStatuses: TicketStatus[] = ["pending", "in_progress", "done"];

async function copyTicketBody(body: string) {
  try {
    await navigator.clipboard.writeText(body);
    toast({ title: "Copied to clipboard" });
  } catch {
    toast({
      title: "Couldn't copy ticket. Try again.",
      variant: "destructive",
    });
  }
}

function shouldShowBodyToggle(body: string) {
  return body.split("\n").length > 3 || body.length > 220;
}

export function TicketCard({
  ticket,
  isUpdating,
  onStatusChange,
}: TicketCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDone = ticket.status === "done";
  const hasToggle = shouldShowBodyToggle(ticket.body);

  return (
    <article
      className={cn(
        "glass-card rounded-lg p-4 shadow-xl shadow-black/20 transition-opacity",
        isDone ? "opacity-50" : "opacity-100",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Badge
            className={cn("border px-2.5 py-1", repoClasses[ticket.repo])}
            variant="outline"
          >
            {repoLabels[ticket.repo]}
          </Badge>
          <h3
            className={cn(
              "mt-3 font-heading text-lg font-semibold leading-6 text-foreground",
              isDone ? "line-through decoration-2" : null,
            )}
          >
            {ticket.title}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            aria-label={`Copy ticket: ${ticket.title}`}
            className="size-9 border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            onClick={() => {
              void copyTicketBody(ticket.body);
            }}
            size="icon"
            type="button"
            variant="outline"
          >
            <ClipboardCopy aria-hidden="true" className="size-4" />
          </Button>

          <Select
            disabled={isUpdating}
            onValueChange={(status: TicketStatus) => {
              onStatusChange(ticket.id, status);
            }}
            value={ticket.status}
          >
            <SelectTrigger
              aria-label={`Status for ticket: ${ticket.title}`}
              className="h-9 w-[142px] border-white/10 bg-white/5 text-foreground shadow-inner shadow-black/20 focus:ring-accent focus:ring-offset-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10 bg-popover text-foreground">
              {ticketStatuses.map((status) => (
                <SelectItem
                  className="focus:bg-primary/20 focus:text-foreground"
                  key={status}
                  value={status}
                >
                  <span className="inline-flex items-center gap-2">
                    {status === "done" ? (
                      <CheckCircle2 aria-hidden="true" className="size-3.5" />
                    ) : null}
                    {statusLabels[status]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <p
          className={cn(
            "whitespace-pre-wrap text-sm leading-6 text-muted-foreground",
            !isExpanded ? "line-clamp-3" : null,
          )}
        >
          {ticket.body}
        </p>
        {hasToggle ? (
          <Button
            className="mt-2 h-8 px-0 text-accent hover:text-violet-100"
            onClick={() => setIsExpanded((current) => !current)}
            type="button"
            variant="link"
          >
            {isExpanded ? "Show less" : "Show more"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
