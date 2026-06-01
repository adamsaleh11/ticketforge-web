import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { GlassCard } from "@/components/shared/glass-card";
import { Wordmark } from "@/components/shared/wordmark";
import { LoginCard } from "./login-card";

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function hasOAuthCallbackParams(
  searchParams: LoginPageProps["searchParams"],
) {
  return Boolean(
    searchParams?.code ??
      searchParams?.error ??
      searchParams?.error_description,
  );
}

function buildCallbackRedirect(searchParams: LoginPageProps["searchParams"]) {
  const callbackParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (typeof value === "string") {
      callbackParams.set(key, value);
    }
  }

  return `/auth/callback?${callbackParams.toString()}`;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  if (hasOAuthCallbackParams(searchParams)) {
    redirect(buildCallbackRedirect(searchParams));
  }

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <Suspense fallback={<LoginCardSkeleton />}>
        <LoginCard />
      </Suspense>
    </main>
  );
}

function LoginCardSkeleton() {
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
        <button
          className="violet-glow inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground opacity-80"
          disabled
          type="button"
        >
          <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          Continue with GitHub
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          We request read-only access to your public repositories
        </p>
      </div>
    </GlassCard>
  );
}
