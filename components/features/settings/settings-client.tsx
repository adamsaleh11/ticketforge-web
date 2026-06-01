"use client";

import { Loader2, PlugZap, RefreshCw, Server } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserSettings } from "@/lib/hooks/use-ollama-settings";
import { OllamaSetupWizard } from "@/components/features/settings/ollama-setup-wizard";

export function SettingsClient() {
  const [isWizardOpen, setWizardOpen] = useState(false);
  const currentUserQuery = useCurrentUserSettings();

  return (
    <>
      <div className="grid gap-4">
        <GlassCard className="border-white/10 bg-white/[0.04] p-4 shadow-black/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-accent">
                  <Server aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Local Ollama
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Configure the local endpoint TicketForge will use for Ollama.
                  </p>
                </div>
              </div>

              {currentUserQuery.isLoading ? (
                <div className="space-y-2" aria-label="Loading Ollama settings">
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-10 w-full max-w-md bg-white/10" />
                </div>
              ) : currentUserQuery.isError ? (
                <div
                  className="rounded-lg border border-red-300/25 bg-red-400/10 p-3"
                  role="alert"
                >
                  <p className="text-sm font-medium text-red-100">
                    Could not load Ollama settings.
                  </p>
                  <Button
                    className="mt-3 h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => void currentUserQuery.refetch()}
                    type="button"
                    variant="outline"
                  >
                    {currentUserQuery.isFetching ? (
                      <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                    ) : (
                      <RefreshCw aria-hidden="true" className="size-4" />
                    )}
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Saved endpoint
                  </p>
                  <p className="mt-1 truncate rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm text-violet-100">
                    {currentUserQuery.data?.ollamaEndpoint}
                  </p>
                </div>
              )}
            </div>

            <Button
              className="violet-glow h-10 gap-2 sm:shrink-0"
              disabled={currentUserQuery.isLoading}
              onClick={() => setWizardOpen(true)}
              type="button"
            >
              <PlugZap aria-hidden="true" className="size-4" />
              Set up Ollama
            </Button>
          </div>
        </GlassCard>
      </div>

      <OllamaSetupWizard
        context="settings"
        onOpenChange={setWizardOpen}
        open={isWizardOpen}
      />
    </>
  );
}
