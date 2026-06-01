"use client";

import { useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { Wordmark } from "@/components/shared/wordmark";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function getCallbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

export function LoginCard() {
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const callbackError = searchParams.get("error");
  const visibleError = errorMessage ?? callbackError;

  async function handleGitHubSignIn() {
    setIsSigningIn(true);
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "public_repo read:user",
        redirectTo: getCallbackUrl(),
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSigningIn(false);
    }
  }

  return (
    <GlassCard className="w-full max-w-md p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <Wordmark
          className="justify-center"
          subtitle="Engineering tickets from project intent"
        />
        <h1 className="mt-8 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Sign in to forge tickets
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Use your GitHub identity to connect TicketForge with the repositories
          that shape your plans.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <Button
          className={cn(
            "violet-glow h-12 w-full gap-2 rounded-lg text-base font-semibold",
            "bg-primary text-primary-foreground hover:bg-primary/85",
          )}
          disabled={isSigningIn}
          onClick={handleGitHubSignIn}
          size="lg"
          type="button"
        >
          {isSigningIn ? (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <GitBranch aria-hidden="true" className="size-5" />
          )}
          Continue with GitHub
        </Button>

        {visibleError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {visibleError}
          </p>
        ) : null}

        <p className="text-center text-xs leading-5 text-muted-foreground">
          We request read-only access to your public repositories
        </p>
      </div>
    </GlassCard>
  );
}
