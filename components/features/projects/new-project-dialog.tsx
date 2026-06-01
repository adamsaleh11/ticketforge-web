"use client";

import { Check, ChevronsUpDown, Loader2, RotateCw, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OllamaSetupWizard } from "@/components/features/settings/ollama-setup-wizard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  isGitHubReposUnauthorizedError,
  useGitHubRepos,
  type GitHubRepo,
} from "@/lib/hooks/use-github-repos";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  useCreateProject,
  type CreateProjectVariables,
} from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { ProjectProvider } from "@/lib/types/project";
import {
  defaultGroqModel,
  defaultOllamaModel,
  groqModels,
  type GroqModel,
} from "@/lib/types/llm";

type NewProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters."),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters."),
  llm_provider: z.enum(["groq", "ollama"]),
  llm_model: z.string().trim().min(1, "Choose or enter a model."),
  github_repo_full_name: z.string().trim().optional(),
});

type NewProjectFormValues = z.infer<typeof formSchema>;

const defaultFormValues: NewProjectFormValues = {
  name: "",
  description: "",
  llm_provider: "groq",
  llm_model: defaultGroqModel,
  github_repo_full_name: "",
};

const fieldClassName =
  "border-white/10 bg-white/5 text-foreground shadow-inner shadow-black/20 " +
  "placeholder:text-muted-foreground focus-visible:ring-accent " +
  "focus-visible:ring-offset-background disabled:bg-white/[0.03]";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs leading-5 text-red-200">{message}</p>;
}

function isProjectProvider(value: string): value is ProjectProvider {
  return value === "groq" || value === "ollama";
}

type GitHubRepoComboboxProps = {
  disabled: boolean;
  id: string;
  isError: boolean;
  isLoading: boolean;
  isUnauthorized: boolean;
  onRetry: () => void;
  onValueChange: (value: string) => void;
  repos: GitHubRepo[];
  value: string;
};

function GitHubRepoCombobox({
  disabled,
  id,
  isError,
  isLoading,
  isUnauthorized,
  onRetry,
  onValueChange,
  repos,
  value,
}: GitHubRepoComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const listId = `${id}-list`;
  const selectedRepo = repos.find((repo) => repo.fullName === value);

  if (isLoading) {
    return (
      <Skeleton
        aria-label="Loading GitHub repositories"
        className="h-10 w-full border border-white/10 bg-white/10"
      />
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isUnauthorized
            ? "Repository access expired"
            : "Repositories couldn't be loaded"}
        </p>
        {!isUnauthorized ? (
          <Button
            className="h-8 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
            onClick={onRetry}
            type="button"
            variant="outline"
          >
            <RotateCw aria-hidden="true" className="size-3.5" />
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Popover modal open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            aria-controls={listId}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label="Choose GitHub repository"
            className={cn(
              fieldClassName,
              "flex h-10 min-w-0 flex-1 items-center justify-between rounded-md border px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            )}
            disabled={disabled}
            id={id}
            role="combobox"
            type="button"
          >
            <span
              className={cn(
                "min-w-0 truncate",
                selectedRepo ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {selectedRepo?.fullName ?? "Select repository (optional)"}
            </span>
            <ChevronsUpDown
              aria-hidden="true"
              className="ml-2 size-4 shrink-0 text-muted-foreground"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="glass-card w-[min(var(--radix-popover-trigger-width),calc(100vw-2rem))] border-white/10 bg-popover p-0 text-foreground shadow-xl shadow-black/30"
          onTouchMove={(event) => event.stopPropagation()}
          onWheel={(event) => event.stopPropagation()}
        >
          <Command
            className="bg-transparent"
            filter={(repoValue, search) => {
              if (repoValue.toLowerCase().includes(search.toLowerCase())) {
                return 1;
              }

              return 0;
            }}
          >
            <CommandInput
              className="text-foreground"
              placeholder="Search repositories..."
            />
            <CommandList
              className="max-h-64 overflow-y-auto overscroll-contain sm:max-h-72"
              id={listId}
              onTouchMove={(event) => event.stopPropagation()}
              onWheel={(event) => event.stopPropagation()}
            >
              <CommandEmpty>No repositories found.</CommandEmpty>
              <CommandGroup>
                {repos.map((repo) => (
                  <CommandItem
                    className="items-start gap-3 rounded-md px-3 py-2 data-[selected=true]:bg-primary/20 data-[selected=true]:text-foreground"
                    key={repo.fullName}
                    onSelect={() => {
                      onValueChange(repo.fullName);
                      setIsOpen(false);
                    }}
                    value={`${repo.fullName} ${repo.name} ${repo.language ?? ""}`}
                  >
                    <Check
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 size-4 text-accent",
                        value === repo.fullName ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {repo.fullName}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {repo.language ? <span>{repo.language}</span> : null}
                        {repo.isPrivate ? (
                          <Badge
                            className="border-primary/30 bg-primary/10 px-2 py-0 text-[0.65rem] text-accent"
                            variant="outline"
                          >
                            Private
                          </Badge>
                        ) : null}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedRepo ? (
        <Button
          aria-label="Clear GitHub repository"
          className="h-10 border-white/10 bg-white/5 hover:bg-white/10"
          disabled={disabled}
          onClick={() => onValueChange("")}
          size="icon"
          type="button"
          variant="outline"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

export function NewProjectDialog({
  open,
  onOpenChange,
}: NewProjectDialogProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isOllamaWizardOpen, setOllamaWizardOpen] = useState(false);
  const [hasManualOllamaModel, setHasManualOllamaModel] = useState(false);
  const hasShownGitHubAuthToast = useRef(false);
  const createProjectMutation = useCreateProject();
  const githubReposQuery = useGitHubRepos({ enabled: open });
  const isSubmitting = createProjectMutation.isPending;
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<NewProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });
  const selectedProvider = watch("llm_provider");
  const selectedGitHubRepo = watch("github_repo_full_name") ?? "";
  const modelInputRegistration = register("llm_model", {
    onChange: () => {
      if (selectedProvider === "ollama") {
        setHasManualOllamaModel(true);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      reset(defaultFormValues);
      setHasManualOllamaModel(false);
      setOllamaWizardOpen(false);
      hasShownGitHubAuthToast.current = false;
    }
  }, [open, reset]);

  useEffect(() => {
    if (
      !open ||
      hasShownGitHubAuthToast.current ||
      !isGitHubReposUnauthorizedError(githubReposQuery.error)
    ) {
      return;
    }

    hasShownGitHubAuthToast.current = true;
    toast({
      action: (
        <ToastAction
          altText="Sign out"
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </ToastAction>
      ),
      title: "GitHub access expired, please sign in again",
      variant: "destructive",
    });
  }, [githubReposQuery.error, open, signOut]);

  function handleProviderChange(value: string) {
    if (!isProjectProvider(value)) {
      return;
    }

    setValue("llm_provider", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue(
      "llm_model",
      value === "groq" ? defaultGroqModel : defaultOllamaModel,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );
    setHasManualOllamaModel(false);
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);
  }

  async function onSubmit(values: NewProjectFormValues) {
    const githubRepoFullName = values.github_repo_full_name?.trim();
    const payload: CreateProjectVariables = {
      name: values.name.trim(),
      description: values.description.trim(),
      llm_provider: values.llm_provider,
      llm_model: values.llm_model.trim(),
      ...(githubRepoFullName
        ? { github_repo_full_name: githubRepoFullName }
        : {}),
    };

    try {
      const createdProject = await createProjectMutation.mutateAsync(payload);
      reset(defaultFormValues);
      onOpenChange(false);
      router.push(`/projects/${createdProject.id}`);
    } catch {
      toast({
        title: "Couldn't create project. Try again.",
        variant: "destructive",
      });
    }
  }

  function handleOllamaModelsDetected(models: string[]) {
    if (hasManualOllamaModel) {
      return;
    }

    const preferredModel =
      models.find(
        (model) =>
          model === defaultOllamaModel ||
          model.startsWith(`${defaultOllamaModel}:`),
      ) ?? models[0];

    if (preferredModel) {
      setValue("llm_model", preferredModel, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }

  function handleGroqFallback(model: GroqModel) {
    setValue("llm_provider", "groq", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue("llm_model", model, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setHasManualOllamaModel(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="glass-card max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto border-white/10 bg-popover/95 text-foreground shadow-2xl shadow-black/30 sm:max-w-2xl sm:rounded-lg">
        <DialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-accent shadow-[0_0_22px_rgba(139,92,246,0.35)]">
            <Sparkles aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle className="font-heading text-xl">
            Forge a new project
          </DialogTitle>
          <DialogDescription className="leading-6">
            Describe what you want to build and choose the model that will turn
            it into phased engineering tickets.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="new-project-name">Project name</Label>
            <Input
              aria-invalid={Boolean(errors.name)}
              className={fieldClassName}
              disabled={isSubmitting}
              id="new-project-name"
              placeholder="Launch planning workspace"
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-project-description">Description</Label>
            <Textarea
              aria-invalid={Boolean(errors.description)}
              className={cn(fieldClassName, "min-h-32 resize-y")}
              disabled={isSubmitting}
              id="new-project-description"
              placeholder="Describe the app, constraints, users, integrations, and the kind of tickets you need."
              {...register("description")}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="new-project-provider">LLM provider</Label>
              <Select
                disabled={isSubmitting}
                onValueChange={handleProviderChange}
                value={selectedProvider}
              >
                <SelectTrigger
                  aria-invalid={Boolean(errors.llm_provider)}
                  className={fieldClassName}
                  id="new-project-provider"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10 bg-popover text-foreground">
                  <SelectItem value="groq">Groq Cloud</SelectItem>
                  <SelectItem value="ollama">Local Ollama</SelectItem>
                </SelectContent>
              </Select>
              <FieldError message={errors.llm_provider?.message} />
            </div>

            <div className="grid gap-2">
              <div className="flex min-h-5 items-center justify-between gap-3">
                <Label htmlFor="new-project-model">LLM model</Label>
                {selectedProvider === "ollama" ? (
                  <button
                    className="rounded-sm text-xs font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    onClick={() => setOllamaWizardOpen(true)}
                    type="button"
                  >
                    Set up Ollama
                  </button>
                ) : null}
              </div>

              {selectedProvider === "groq" ? (
                <Select
                  disabled={isSubmitting}
                  onValueChange={(value) => {
                    setValue("llm_model", value, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  value={watch("llm_model")}
                >
                  <SelectTrigger
                    aria-invalid={Boolean(errors.llm_model)}
                    className={fieldClassName}
                    id="new-project-model"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10 bg-popover text-foreground">
                    {groqModels.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  aria-describedby="new-project-ollama-help"
                  aria-invalid={Boolean(errors.llm_model)}
                  className={fieldClassName}
                  disabled={isSubmitting}
                  id="new-project-model"
                  placeholder="llama3.1"
                  {...modelInputRegistration}
                />
              )}

              {selectedProvider === "ollama" ? (
                <p
                  className="text-xs leading-5 text-muted-foreground"
                  id="new-project-ollama-help"
                >
                  Must be pulled locally on your machine
                </p>
              ) : null}
              <FieldError message={errors.llm_model?.message} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-project-github-repo">GitHub repository</Label>
            <GitHubRepoCombobox
              disabled={isSubmitting}
              id="new-project-github-repo"
              isError={githubReposQuery.isError}
              isLoading={githubReposQuery.isLoading}
              isUnauthorized={isGitHubReposUnauthorizedError(
                githubReposQuery.error,
              )}
              onRetry={() => {
                void githubReposQuery.refetch();
              }}
              onValueChange={(value) => {
                setValue("github_repo_full_name", value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              repos={githubReposQuery.data ?? []}
              value={selectedGitHubRepo}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              className="h-10 border-white/10 bg-white/5 hover:bg-white/10"
              disabled={isSubmitting}
              onClick={() => handleDialogOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="violet-glow h-10 gap-2"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Sparkles aria-hidden="true" className="size-4" />
              )}
              {isSubmitting ? "Forging..." : "Forge project"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>

      <OllamaSetupWizard
        context="new-project"
        onConnectedModels={handleOllamaModelsDetected}
        onGroqFallback={handleGroqFallback}
        onOpenChange={setOllamaWizardOpen}
        open={isOllamaWizardOpen}
      />
    </>
  );
}
