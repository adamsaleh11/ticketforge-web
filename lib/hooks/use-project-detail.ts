"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { projectsQueryKey } from "@/lib/hooks/use-projects";
import {
  projectProviders,
  projectStatuses,
  ticketRepos,
  ticketStatuses,
  type Phase,
  type Project,
  type ProjectDetail,
  type ProjectProvider,
  type ProjectStatus,
  type Ticket,
  type TicketRepo,
  type TicketStatus,
} from "@/lib/types/project";

export const projectDetailQueryKey = (projectId: string) =>
  ["project", projectId] as const;

type JsonApiResource = {
  id?: unknown;
  type?: unknown;
  attributes?: Record<string, unknown>;
  relationships?: Record<
    string,
    {
      data?: JsonApiRelationshipData;
    }
  >;
};

type JsonApiRelationshipData =
  | { id?: unknown; type?: unknown }
  | Array<{ id?: unknown; type?: unknown }>
  | null;

type JsonApiSingleResponse = {
  data?: JsonApiResource;
  included?: JsonApiResource[];
};

type GenerateTicketsVariables = {
  description: string;
};

type UpdateTicketStatusVariables = {
  ticketId: string;
  status: TicketStatus;
};

type UpdateTicketStatusContext = {
  previousProject: ProjectDetail | undefined;
};

function requiredString(value: unknown, fieldName: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  throw new Error(`Invalid project detail response: missing ${fieldName}`);
}

function requiredNumber(value: unknown, fieldName: string): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  throw new Error(`Invalid project detail response: missing ${fieldName}`);
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? value : String(value);
}

function nullableNonEmptyString(value: unknown): string | null {
  const normalizedValue = nullableString(value)?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : null;
}

function isProjectProvider(value: unknown): value is ProjectProvider {
  return (
    typeof value === "string" &&
    projectProviders.includes(value as ProjectProvider)
  );
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return (
    typeof value === "string" && projectStatuses.includes(value as ProjectStatus)
  );
}

function isTicketRepo(value: unknown): value is TicketRepo {
  return typeof value === "string" && ticketRepos.includes(value as TicketRepo);
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === "string" && ticketStatuses.includes(value as TicketStatus)
  );
}

function resourceKey(resource: Pick<JsonApiResource, "id" | "type">) {
  return `${String(resource.type)}:${String(resource.id)}`;
}

function relationshipArray(resource: JsonApiResource, name: string) {
  const relationship = resource.relationships?.[name]?.data;

  return Array.isArray(relationship) ? relationship : [];
}

function normalizeProjectResource(resource: JsonApiResource): Project {
  const attributes = resource.attributes ?? {};
  const provider = attributes.llm_provider ?? attributes.llmProvider;
  const status = attributes.status;

  if (!isProjectProvider(provider)) {
    throw new Error("Invalid project detail response: unsupported llm provider");
  }

  if (!isProjectStatus(status)) {
    throw new Error("Invalid project detail response: unsupported status");
  }

  return {
    id: requiredString(resource.id, "id"),
    name: requiredString(attributes.name, "name"),
    description: nullableString(attributes.description),
    llmProvider: provider,
    status,
    ticketCount: requiredNumber(
      attributes.ticket_count ?? attributes.ticketCount,
      "ticket_count",
    ),
    createdAt: requiredString(
      attributes.created_at ?? attributes.createdAt,
      "created_at",
    ),
    updatedAt: requiredString(
      attributes.updated_at ?? attributes.updatedAt,
      "updated_at",
    ),
    githubRepoFullName: nullableString(
      attributes.github_repo_full_name ?? attributes.githubRepoFullName,
    ),
    llmModel: requiredString(
      attributes.llm_model ?? attributes.llmModel,
      "llm_model",
    ),
    generationFailureMessage: nullableNonEmptyString(
      attributes.generation_failure_message ??
        attributes.generationFailureMessage ??
        attributes.generation_error ??
        attributes.generationError,
    ),
  };
}

function normalizeTicketResource(resource: JsonApiResource): Ticket {
  const attributes = resource.attributes ?? {};
  const repo = attributes.repo;
  const status = attributes.status;

  if (!isTicketRepo(repo)) {
    throw new Error("Invalid project detail response: unsupported ticket repo");
  }

  if (!isTicketStatus(status)) {
    throw new Error("Invalid project detail response: unsupported ticket status");
  }

  return {
    id: requiredString(resource.id, "ticket id"),
    repo,
    title: requiredString(attributes.title, "ticket title"),
    body: requiredString(attributes.body, "ticket body"),
    position: requiredNumber(attributes.position, "ticket position"),
    status,
  };
}

function normalizePhaseResource(
  resource: JsonApiResource,
  includedByKey: Map<string, JsonApiResource>,
): Phase {
  const attributes = resource.attributes ?? {};
  const ticketRefs = relationshipArray(resource, "tickets");
  const tickets = ticketRefs
    .map((ticketRef) => includedByKey.get(resourceKey(ticketRef)))
    .filter((ticketResource): ticketResource is JsonApiResource => Boolean(ticketResource))
    .map(normalizeTicketResource)
    .sort((leftTicket, rightTicket) => leftTicket.position - rightTicket.position);

  return {
    id: requiredString(resource.id, "phase id"),
    number: requiredNumber(attributes.number, "phase number"),
    title: requiredString(attributes.title, "phase title"),
    description: nullableString(attributes.description),
    position: requiredNumber(attributes.position, "phase position"),
    tickets,
  };
}

export function normalizeProjectDetail(response: unknown): ProjectDetail {
  const projectResponse = response as JsonApiSingleResponse;

  if (!projectResponse.data || projectResponse.data.type !== "project") {
    throw new Error("Invalid project detail response: expected project data");
  }

  const included = projectResponse.included ?? [];
  const includedByKey = new Map(
    included.map((resource) => [resourceKey(resource), resource]),
  );
  const phaseRefs = relationshipArray(projectResponse.data, "phases");
  const phases = phaseRefs
    .map((phaseRef) => includedByKey.get(resourceKey(phaseRef)))
    .filter((phaseResource): phaseResource is JsonApiResource => Boolean(phaseResource))
    .map((phaseResource) => normalizePhaseResource(phaseResource, includedByKey))
    .sort((leftPhase, rightPhase) => leftPhase.position - rightPhase.position);

  return {
    ...normalizeProjectResource(projectResponse.data),
    phases,
  };
}

function updateTicketStatusInProject(
  project: ProjectDetail,
  ticketId: string,
  status: TicketStatus,
): ProjectDetail {
  return {
    ...project,
    phases: project.phases.map((phase) => ({
      ...phase,
      tickets: phase.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status } : ticket,
      ),
    })),
  };
}

async function fetchProjectDetail(projectId: string): Promise<ProjectDetail> {
  const response = await api.get<unknown>(`/projects/${projectId}`);

  return normalizeProjectDetail(response.data);
}

async function generateTickets(
  projectId: string,
  currentDescription: string,
  { description }: GenerateTicketsVariables,
): Promise<ProjectDetail> {
  if (description.trim() !== currentDescription.trim()) {
    await api.patch(`/projects/${projectId}`, {
      project: {
        description,
      },
    });
  }

  const response = await api.post<unknown>(`/projects/${projectId}/generate`);

  return normalizeProjectDetail(response.data);
}

async function updateTicketStatus({
  ticketId,
  status,
}: UpdateTicketStatusVariables): Promise<Ticket> {
  const response = await api.patch<unknown>(`/tickets/${ticketId}`, {
    ticket: {
      status,
    },
  });
  const ticketResponse = response.data as JsonApiSingleResponse;

  if (!ticketResponse.data || ticketResponse.data.type !== "ticket") {
    throw new Error("Invalid ticket response: expected ticket data");
  }

  return normalizeTicketResource(ticketResponse.data);
}

export function useProjectDetail(projectId: string) {
  return useQuery({
    queryKey: projectDetailQueryKey(projectId),
    queryFn: () => fetchProjectDetail(projectId),
    refetchInterval: (query) =>
      query.state.data?.status === "generating" ? 3000 : false,
  });
}

export function useGenerateTickets(project: ProjectDetail | undefined) {
  const queryClient = useQueryClient();
  const projectId = project?.id ?? "";
  const currentDescription = project?.description ?? "";

  return useMutation<ProjectDetail, Error, GenerateTicketsVariables>({
    mutationFn: (variables) =>
      generateTickets(projectId, currentDescription, variables),
    onSuccess: (generatedProject) => {
      queryClient.setQueryData(
        projectDetailQueryKey(generatedProject.id),
        generatedProject,
      );
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.apiErrorToastShown) {
        return;
      }

      toast({
        title: "Couldn't generate tickets. Try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTicketStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    Ticket,
    Error,
    UpdateTicketStatusVariables,
    UpdateTicketStatusContext
  >({
    mutationFn: updateTicketStatus,
    onMutate: async ({ ticketId, status }) => {
      const queryKey = projectDetailQueryKey(projectId);
      await queryClient.cancelQueries({ queryKey });
      const previousProject =
        queryClient.getQueryData<ProjectDetail>(queryKey);

      if (previousProject) {
        queryClient.setQueryData<ProjectDetail>(
          queryKey,
          updateTicketStatusInProject(previousProject, ticketId, status),
        );
      }

      return { previousProject };
    },
    onError: (error, _variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(
          projectDetailQueryKey(projectId),
          context.previousProject,
        );
      }

      if (axios.isAxiosError(error) && error.apiErrorToastShown) {
        return;
      }

      toast({
        title: "Couldn't update ticket status. Try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: projectDetailQueryKey(projectId),
      });
    },
  });
}
