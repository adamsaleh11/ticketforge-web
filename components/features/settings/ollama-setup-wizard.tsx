"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  PlugZap,
  Server,
  Terminal,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { toast } from "@/hooks/use-toast";
import {
  getOllamaEndpointValidationMessage,
  useCurrentUserSettings,
  useSaveOllamaEndpoint,
  useTestSavedOllamaEndpoint,
  type OllamaConnectionResult,
} from "@/lib/hooks/use-ollama-settings";
import {
  defaultGroqModel,
  defaultOllamaEndpoint,
  groqModels,
  type GroqModel,
} from "@/lib/types/llm";
import { cn } from "@/lib/utils";

type WizardContext = "settings" | "new-project";

type OllamaSetupWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: WizardContext;
  onConnectedModels?: (models: string[]) => void;
  onGroqFallback?: (model: GroqModel) => void;
};

type WizardStep = {
  title: string;
  description: string;
  icon: typeof Download;
};

const steps: WizardStep[] = [
  {
    title: "Install Ollama",
    description: "Install the local runtime TicketForge will connect to.",
    icon: Download,
  },
  {
    title: "Pull a model",
    description: "Download a model that can generate tickets locally.",
    icon: Terminal,
  },
  {
    title: "Verify Ollama is running",
    description: "Start the local server and confirm the tags API responds.",
    icon: Server,
  },
  {
    title: "Connect",
    description: "Save your endpoint and test the saved Ollama server.",
    icon: PlugZap,
  },
];

const endpointSchema = z.object({
  endpoint: z
    .string()
    .trim()
    .min(1, "Endpoint is required.")
    .refine((value) => {
      try {
        const url = new URL(value);

        return (
          (url.protocol === "http:" || url.protocol === "https:") &&
          url.hostname.length > 0
        );
      } catch {
        return false;
      }
    }, "Endpoint must be a valid http or https URL."),
});

type EndpointFormValues = z.infer<typeof endpointSchema>;

const fieldClassName =
  "border-white/10 bg-white/5 text-foreground shadow-inner shadow-black/20 " +
  "placeholder:text-muted-foreground focus-visible:ring-accent " +
  "focus-visible:ring-offset-background disabled:bg-white/[0.03]";

function trimEndpoint(endpoint: string) {
  return endpoint.trim().replace(/\/+$/, "");
}

function FieldError({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs leading-5 text-red-200">{message}</p>;
}

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: "Couldn't copy command.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30 shadow-inner shadow-black/30">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          Terminal
        </span>
        <Button
          aria-label={`Copy ${command}`}
          className="h-8 gap-2 border-white/10 bg-white/5 px-2 text-xs hover:bg-white/10"
          onClick={handleCopy}
          type="button"
          variant="outline"
        >
          {copied ? (
            <Check aria-hidden="true" className="size-3.5 text-green-300" />
          ) : (
            <Copy aria-hidden="true" className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto px-3 py-3 text-sm leading-6 text-violet-100">
        <code>{command}</code>
      </pre>
    </div>
  );
}

function ProgressDots({
  currentStep,
  onStepChange,
}: {
  currentStep: number;
  onStepChange: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label="Setup steps">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <button
            aria-current={isActive ? "step" : undefined}
            aria-label={`Go to step ${index + 1}: ${step.title}`}
            className={cn(
              "size-3 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "border-accent bg-accent shadow-[0_0_16px_rgba(192,132,252,0.65)]"
                : isComplete
                  ? "border-primary bg-primary/80"
                  : "border-white/20 bg-white/10 hover:bg-white/20",
            )}
            key={step.title}
            onClick={() => onStepChange(index)}
            type="button"
          />
        );
      })}
    </div>
  );
}

function InstructionStep({ stepIndex }: { stepIndex: number }) {
  if (stepIndex === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Ollama runs models on your machine so TicketForge can generate project
          tickets without sending prompts to a hosted model provider.
        </p>
        <a
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between border-white/10 bg-white/5 hover:bg-white/10 sm:w-auto",
          )}
          href="https://ollama.com/download"
          rel="noreferrer"
          target="_blank"
        >
          Open Ollama downloads
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
        <CommandBlock command="curl -fsSL https://ollama.com/install.sh | sh" />
      </div>
    );
  }

  if (stepIndex === 1) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Pull the default model before creating an Ollama-backed project. This
          downloads about 4GB locally, so it can take a few minutes.
        </p>
        <CommandBlock command="ollama pull llama3.1" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Start Ollama if it is not already running, then verify that the local
        tags endpoint responds.
      </p>
      <div className="grid gap-3">
        <CommandBlock command="ollama serve" />
        <CommandBlock command="curl http://localhost:11434/api/tags" />
      </div>
    </div>
  );
}

function ConnectionSuccess({ models }: { models: string[] }) {
  return (
    <div
      className="rounded-lg border border-green-300/25 bg-green-400/10 p-4"
      role="status"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-green-200">
        <CheckCircle2 aria-hidden="true" className="size-4" />
        Ollama connected
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {models.map((model) => (
          <Badge
            className="border-primary/30 bg-primary/20 text-violet-100"
            key={model}
            variant="outline"
          >
            {model}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ConnectionFailure({ error }: { error: string }) {
  return (
    <div
      className="rounded-lg border border-red-300/25 bg-red-400/10 p-4"
      role="alert"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-red-200">
        <XCircle aria-hidden="true" className="size-4" />
        Could not connect to Ollama
      </div>
      <p className="mt-2 text-xs leading-5 text-red-100/85">{error}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
        <li>Is Ollama running?</li>
        <li>Is a firewall or network rule blocking the endpoint?</li>
        <li>Can TicketForge reach the local service from this environment?</li>
      </ul>
    </div>
  );
}

function NoModelsState({
  context,
  selectedFallbackModel,
  onFallbackModelChange,
  onConfirmFallback,
  onBackToPullModel,
}: {
  context: WizardContext;
  selectedFallbackModel: GroqModel;
  onFallbackModelChange: (model: GroqModel) => void;
  onConfirmFallback: () => void;
  onBackToPullModel: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-amber-300/25 bg-amber-400/10 p-4"
      role="status"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-amber-100">
        <CheckCircle2 aria-hidden="true" className="size-4" />
        Ollama connected, but no models are available
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Pull a local model before using Ollama for generation.
        {context === "new-project"
          ? " You can use Groq as a fallback for this project."
          : " Go back to the model step and pull llama3.1."}
      </p>

      {context === "new-project" ? (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="ollama-groq-fallback-model">Groq fallback model</Label>
            <Select
              onValueChange={(value) => {
                if (groqModels.includes(value as GroqModel)) {
                  onFallbackModelChange(value as GroqModel);
                }
              }}
              value={selectedFallbackModel}
            >
              <SelectTrigger
                className={fieldClassName}
                id="ollama-groq-fallback-model"
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
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              className="border-white/10 bg-white/5 hover:bg-white/10"
              onClick={onBackToPullModel}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button className="violet-glow" onClick={onConfirmFallback} type="button">
              Use Groq fallback
            </Button>
          </div>
        </div>
      ) : (
        <Button
          className="mt-4 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={onBackToPullModel}
          type="button"
          variant="outline"
        >
          Back to Pull a model
        </Button>
      )}
    </div>
  );
}

export function OllamaSetupWizard({
  open,
  onOpenChange,
  context,
  onConnectedModels,
  onGroqFallback,
}: OllamaSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [connectionResult, setConnectionResult] =
    useState<OllamaConnectionResult | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [selectedFallbackModel, setSelectedFallbackModel] =
    useState<GroqModel>(defaultGroqModel);
  const currentUserQuery = useCurrentUserSettings();
  const saveEndpointMutation = useSaveOllamaEndpoint();
  const testEndpointMutation = useTestSavedOllamaEndpoint();
  const isTesting =
    saveEndpointMutation.isPending || testEndpointMutation.isPending;
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<EndpointFormValues>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      endpoint: defaultOllamaEndpoint,
    },
  });
  const endpointValue = watch("endpoint");
  const activeStep = steps[currentStep];
  const ActiveIcon = activeStep.icon;
  const connectedModels = useMemo(
    () =>
      connectionResult?.connected === true && connectionResult.models.length > 0
        ? connectionResult.models
        : [],
    [connectionResult],
  );
  const hasSuccessfulModels = connectedModels.length > 0;
  const hasNoModels =
    connectionResult?.connected === true && connectionResult.models.length === 0;

  useEffect(() => {
    if (open) {
      reset({
        endpoint: currentUserQuery.data?.ollamaEndpoint ?? defaultOllamaEndpoint,
      });
      setCurrentStep(0);
      setConnectionResult(null);
      setFieldError(null);
      setSelectedFallbackModel(defaultGroqModel);
    }
  }, [currentUserQuery.data?.ollamaEndpoint, open, reset]);

  useEffect(() => {
    setConnectionResult(null);
    setFieldError(null);
  }, [endpointValue]);

  async function handleTestConnection(values: EndpointFormValues) {
    setFieldError(null);
    setConnectionResult(null);

    try {
      await saveEndpointMutation.mutateAsync({
        endpoint: trimEndpoint(values.endpoint),
      });
      const result = await testEndpointMutation.mutateAsync();
      setConnectionResult(result);
    } catch (error) {
      setFieldError(
        getOllamaEndpointValidationMessage(error) ??
          "Couldn't save the Ollama endpoint.",
      );
    }
  }

  function handleFinish() {
    if (connectedModels.length === 0) {
      return;
    }

    onConnectedModels?.(connectedModels);
    onOpenChange(false);
    toast({ title: "Ollama connected" });
  }

  function handleConfirmFallback() {
    onGroqFallback?.(selectedFallbackModel);
    onOpenChange(false);
  }

  function goToStep(step: number) {
    setCurrentStep(Math.min(Math.max(step, 0), steps.length - 1));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto border-white/10 bg-popover/95 text-foreground shadow-2xl shadow-black/30 sm:max-w-2xl sm:rounded-lg">
        <div className="space-y-5">
          <ProgressDots currentStep={currentStep} onStepChange={goToStep} />

          <DialogHeader>
            <div className="mb-2 flex size-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-accent shadow-[0_0_22px_rgba(139,92,246,0.35)]">
              <ActiveIcon aria-hidden="true" className="size-5" />
            </div>
            <DialogTitle className="font-heading text-xl">
              {activeStep.title}
            </DialogTitle>
            <DialogDescription className="leading-6">
              {activeStep.description}
            </DialogDescription>
          </DialogHeader>

          {currentStep < 3 ? (
            <InstructionStep stepIndex={currentStep} />
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(handleTestConnection)}>
              <div className="grid gap-2">
                <Label htmlFor="ollama-endpoint">Endpoint</Label>
                <Input
                  aria-describedby="ollama-endpoint-help"
                  aria-invalid={Boolean(errors.endpoint || fieldError)}
                  className={fieldClassName}
                  disabled={isTesting}
                  id="ollama-endpoint"
                  placeholder={defaultOllamaEndpoint}
                  {...register("endpoint")}
                />
                <p
                  className="text-xs leading-5 text-muted-foreground"
                  id="ollama-endpoint-help"
                >
                  Test Connection saves this endpoint first, then tests the
                  saved Ollama server.
                </p>
                <FieldError message={errors.endpoint?.message ?? fieldError} />
              </div>

              <Button className="violet-glow w-full gap-2" disabled={isTesting} type="submit">
                {isTesting ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : (
                  <PlugZap aria-hidden="true" className="size-4" />
                )}
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>

              {connectionResult?.connected === true && connectedModels.length > 0 ? (
                <ConnectionSuccess models={connectedModels} />
              ) : null}

              {connectionResult?.connected === false ? (
                <ConnectionFailure error={connectionResult.error} />
              ) : null}

              {hasNoModels ? (
                <NoModelsState
                  context={context}
                  onBackToPullModel={() => goToStep(1)}
                  onConfirmFallback={handleConfirmFallback}
                  onFallbackModelChange={setSelectedFallbackModel}
                  selectedFallbackModel={selectedFallbackModel}
                />
              ) : null}
            </form>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              className="h-10 border-white/10 bg-white/5 hover:bg-white/10"
              disabled={isTesting}
              onClick={() => {
                if (currentStep === 0) {
                  onOpenChange(false);
                } else {
                  goToStep(currentStep - 1);
                }
              }}
              type="button"
              variant="outline"
            >
              {currentStep === 0 ? (
                "Close"
              ) : (
                <>
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Back
                </>
              )}
            </Button>

            {currentStep < 3 ? (
              <Button
                className="violet-glow h-10 gap-2"
                onClick={() => goToStep(currentStep + 1)}
                type="button"
              >
                Next
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            ) : (
              <Button
                className="violet-glow h-10 gap-2"
                disabled={!hasSuccessfulModels || isTesting}
                onClick={handleFinish}
                type="button"
              >
                <CheckCircle2 aria-hidden="true" className="size-4" />
                Finish
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
