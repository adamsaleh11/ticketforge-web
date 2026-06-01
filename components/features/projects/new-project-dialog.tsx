"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  useCreateProject,
  type CreateProjectVariables,
} from "@/lib/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { ProjectProvider } from "@/lib/types/project";

type NewProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const groqModels = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
] as const;

const defaultGroqModel = groqModels[0];
const defaultOllamaModel = "llama3.1";

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
});

type NewProjectFormValues = z.infer<typeof formSchema>;

const defaultFormValues: NewProjectFormValues = {
  name: "",
  description: "",
  llm_provider: "groq",
  llm_model: defaultGroqModel,
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

export function NewProjectDialog({
  open,
  onOpenChange,
}: NewProjectDialogProps) {
  const router = useRouter();
  const createProjectMutation = useCreateProject();
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

  useEffect(() => {
    if (!open) {
      reset(defaultFormValues);
    }
  }, [open, reset]);

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
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);
  }

  async function onSubmit(values: NewProjectFormValues) {
    const payload: CreateProjectVariables = {
      name: values.name.trim(),
      description: values.description.trim(),
      llm_provider: values.llm_provider,
      llm_model: values.llm_model.trim(),
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

  return (
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
                    aria-disabled="true"
                    className="cursor-not-allowed rounded-sm text-xs font-medium text-accent/60"
                    disabled
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
                  {...register("llm_model")}
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
            <Input
              className={cn(fieldClassName, "text-muted-foreground")}
              disabled
              id="new-project-github-repo"
              value="Coming in Phase 4"
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
  );
}
