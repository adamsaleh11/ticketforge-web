"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  GitBranch,
  Loader2,
  PlugZap,
  RefreshCw,
  Server,
  ShieldAlert,
  UserCircle,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { GlassCard } from "@/components/shared/glass-card";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  useCurrentUserSettings,
  useDeleteAccount,
  type CurrentUserSettings,
} from "@/lib/hooks/use-ollama-settings";
import { useAuth } from "@/lib/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { OllamaSetupWizard } from "@/components/features/settings/ollama-setup-wizard";

type Metadata = Record<string, unknown> | undefined;

type SettingsFieldProps = {
  label: string;
  value: string;
};

function getCallbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

function getMetadataString(metadata: Metadata, key: string) {
  const value = metadata?.[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function getProfileName(user: User | null) {
  if (!user) {
    return "GitHub user";
  }

  return (
    getMetadataString(user.user_metadata, "full_name") ??
    getMetadataString(user.user_metadata, "name") ??
    getMetadataString(user.user_metadata, "user_name") ??
    getMetadataString(user.user_metadata, "preferred_username") ??
    "GitHub user"
  );
}

function getProfileEmail(user: User | null) {
  return user?.email ?? "Email unavailable";
}

function getGitHubUsername(
  user: User | null,
  currentUser: CurrentUserSettings | undefined,
) {
  return (
    currentUser?.githubUsername ??
    getMetadataString(user?.user_metadata, "user_name") ??
    getMetadataString(user?.user_metadata, "preferred_username") ??
    getMetadataString(user?.user_metadata, "name")
  );
}

function SettingsField({ label, value }: SettingsFieldProps) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-violet-100">
        {value}
      </p>
    </div>
  );
}

function PanelHeader({
  description,
  icon: Icon,
  tone = "violet",
  title,
}: {
  description: string;
  icon: typeof UserCircle;
  tone?: "violet" | "red";
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg border",
          tone === "red"
            ? "border-destructive/30 bg-destructive/10 text-red-200"
            : "border-primary/30 bg-primary/15 text-accent",
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingsPanel({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  return (
    <TabsContent className="mt-4 focus-visible:ring-accent" value={value}>
      <GlassCard className="p-4 sm:p-6">{children}</GlassCard>
    </TabsContent>
  );
}

function LoadingFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading settings">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 bg-white/10" />
        <Skeleton className="h-10 w-full bg-white/10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20 bg-white/10" />
        <Skeleton className="h-10 w-full bg-white/10" />
      </div>
    </div>
  );
}

function SettingsError({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-red-300/25 bg-red-400/10 p-3"
      role="alert"
    >
      <p className="text-sm font-medium text-red-100">
        Settings could not be loaded.
      </p>
      <Button
        className="mt-3 h-9 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
        disabled={isRetrying}
        onClick={onRetry}
        type="button"
        variant="outline"
      >
        <RefreshCw
          aria-hidden="true"
          className={isRetrying ? "size-4 animate-spin" : "size-4"}
        />
        Retry
      </Button>
    </div>
  );
}

export function SettingsClient() {
  const router = useRouter();
  const [isWizardOpen, setWizardOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isReauthenticating, setReauthenticating] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const currentUserQuery = useCurrentUserSettings();
  const deleteAccountMutation = useDeleteAccount();
  const profileName = useMemo(() => getProfileName(user), [user]);
  const profileEmail = useMemo(() => getProfileEmail(user), [user]);
  const githubUsername = useMemo(
    () => getGitHubUsername(user, currentUserQuery.data),
    [currentUserQuery.data, user],
  );

  async function handleReauthenticate() {
    setReauthenticating(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "public_repo read:user",
        redirectTo: getCallbackUrl(),
      },
    });

    if (error) {
      setReauthenticating(false);
      toast({
        title: "GitHub re-authentication failed.",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  function handleDeleteAccount() {
    deleteAccountMutation.mutate(undefined, {
      onError: (error) => {
        toast({
          title: "Couldn't delete account.",
          description: error.message,
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setDeleteDialogOpen(false);
        router.replace("/login");
        router.refresh();
      },
    });
  }

  return (
    <>
      <Tabs className="w-full" defaultValue="profile">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-md sm:grid-cols-4">
          {[
            ["profile", "Profile"],
            ["github", "GitHub"],
            ["ollama", "Ollama"],
            ["account", "Account"],
          ].map(([value, label]) => (
            <TabsTrigger
              className="min-h-10 rounded-md px-3 py-2 text-muted-foreground data-[state=active]:bg-primary/20 data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_18px_rgba(139,92,246,0.28)]"
              key={value}
              value={value}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <SettingsPanel value="profile">
          <div className="space-y-5">
            <PanelHeader
              description="Your TicketForge identity comes from your GitHub Supabase session."
              icon={UserCircle}
              title="Profile"
            />
            {isAuthLoading ? (
              <LoadingFields />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <SettingsField label="Name" value={profileName} />
                <SettingsField label="Email" value={profileEmail} />
              </div>
            )}
          </div>
        </SettingsPanel>

        <SettingsPanel value="github">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-5">
              <PanelHeader
                description="Refresh your GitHub OAuth grants when repository access changes."
                icon={GitBranch}
                title="GitHub"
              />
              {currentUserQuery.isLoading ? (
                <div className="space-y-2" aria-label="Loading GitHub account">
                  <Skeleton className="h-3 w-28 bg-white/10" />
                  <Skeleton className="h-10 w-full max-w-md bg-white/10" />
                </div>
              ) : currentUserQuery.isError ? (
                <SettingsError
                  isRetrying={currentUserQuery.isFetching}
                  onRetry={() => {
                    void currentUserQuery.refetch();
                  }}
                />
              ) : (
                <p className="truncate rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm font-medium text-violet-100">
                  {githubUsername
                    ? `Connected as @${githubUsername}`
                    : "GitHub username unavailable"}
                </p>
              )}
            </div>
            <Button
              className="violet-glow h-10 gap-2 sm:shrink-0"
              disabled={isReauthenticating}
              onClick={() => {
                void handleReauthenticate();
              }}
              type="button"
            >
              {isReauthenticating ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <RefreshCw aria-hidden="true" className="size-4" />
              )}
              Re-authenticate
            </Button>
          </div>
        </SettingsPanel>

        <SettingsPanel value="ollama">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-5">
              <PanelHeader
                description="Configure the local endpoint TicketForge will use for Ollama."
                icon={Server}
                title="Ollama"
              />
              {currentUserQuery.isLoading ? (
                <div className="space-y-2" aria-label="Loading Ollama settings">
                  <Skeleton className="h-3 w-28 bg-white/10" />
                  <Skeleton className="h-10 w-full max-w-md bg-white/10" />
                </div>
              ) : currentUserQuery.isError ? (
                <SettingsError
                  isRetrying={currentUserQuery.isFetching}
                  onRetry={() => {
                    void currentUserQuery.refetch();
                  }}
                />
              ) : (
                <SettingsField
                  label="Current endpoint"
                  value={
                    currentUserQuery.data?.ollamaEndpoint ??
                    "Endpoint unavailable"
                  }
                />
              )}
            </div>
            <Button
              className="violet-glow h-10 gap-2 sm:shrink-0"
              disabled={currentUserQuery.isLoading}
              onClick={() => setWizardOpen(true)}
              type="button"
            >
              <PlugZap aria-hidden="true" className="size-4" />
              Run Setup Wizard
            </Button>
          </div>
        </SettingsPanel>

        <SettingsPanel value="account">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-5">
              <PanelHeader
                description="Delete your TicketForge account data and end this session."
                icon={ShieldAlert}
                title="Account"
                tone="red"
              />
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <div className="flex gap-3">
                  <AlertTriangle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-red-200"
                  />
                  <p className="text-sm leading-6 text-red-100">
                    Account deletion cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  className="h-10 gap-2 border-destructive/40 bg-destructive/15 text-red-100 hover:bg-destructive/25 sm:shrink-0"
                  type="button"
                  variant="outline"
                >
                  <ShieldAlert aria-hidden="true" className="size-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card border-white/10 bg-popover/95">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading text-foreground">
                    Delete your account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes your TicketForge account data and signs you out.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="border-white/10 bg-white/5 hover:bg-white/10"
                    disabled={deleteAccountMutation.isPending}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/85"
                    disabled={deleteAccountMutation.isPending}
                    onClick={(event) => {
                      event.preventDefault();
                      handleDeleteAccount();
                    }}
                  >
                    {deleteAccountMutation.isPending ? (
                      <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                    ) : (
                      <ShieldAlert aria-hidden="true" className="size-4" />
                    )}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SettingsPanel>
      </Tabs>

      <OllamaSetupWizard
        context="settings"
        onOpenChange={setWizardOpen}
        open={isWizardOpen}
      />
    </>
  );
}
