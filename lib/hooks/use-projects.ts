"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  projectProviders,
  projectStatuses,
  type Project,
  type ProjectProvider,
  type ProjectStatus,
} from "@/lib/types/project";

export const projectsQueryKey = ["projects"] as const;

type ProjectResponse = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  llm_provider?: unknown;
  llmProvider?: unknown;
  status?: unknown;
  ticket_count?: unknown;
  ticketCount?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  updated_at?: unknown;
  updatedAt?: unknown;
  github_repo_full_name?: unknown;
  githubRepoFullName?: unknown;
  llm_model?: unknown;
  llmModel?: unknown;
};

type JsonApiProjectResource = {
  id?: unknown;
  type?: unknown;
  attributes?: ProjectResponse;
};

type JsonApiSingleProjectResponse = {
  data?: JsonApiProjectResource | ProjectResponse;
};

type JsonApiProjectListResponse = {
  data?: Array<JsonApiProjectResource | ProjectResponse>;
};

type DeleteProjectVariables = {
  projectId: string;
};

export type CreateProjectVariables = {
  name: string;
  description: string;
  llm_provider: ProjectProvider;
  llm_model: string;
  github_repo_full_name?: string;
};

export type CreateProjectResult = {
  id: string;
  project: Project | null;
};

type DeleteProjectContext = {
  previousProjects: Project[] | undefined;
};

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

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? value : String(value);
}

function requiredString(value: unknown, fieldName: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  throw new Error(`Invalid project response: missing ${fieldName}`);
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

  throw new Error(`Invalid project response: missing ${fieldName}`);
}

function projectResponseFromResource(
  resource: JsonApiProjectResource | ProjectResponse,
): ProjectResponse {
  if ("attributes" in resource && resource.attributes) {
    return {
      ...resource.attributes,
      id: resource.id,
    };
  }

  return resource;
}

function normalizeProject(project: ProjectResponse): Project {
  const provider = project.llm_provider ?? project.llmProvider;
  const status = project.status;

  if (!isProjectProvider(provider)) {
    throw new Error("Invalid project response: unsupported llm provider");
  }

  if (!isProjectStatus(status)) {
    throw new Error("Invalid project response: unsupported status");
  }

  return {
    id: requiredString(project.id, "id"),
    name: requiredString(project.name, "name"),
    description: nullableString(project.description),
    llmProvider: provider,
    status,
    ticketCount: requiredNumber(
      project.ticket_count ?? project.ticketCount,
      "ticket_count",
    ),
    createdAt: requiredString(project.created_at ?? project.createdAt, "created_at"),
    updatedAt: requiredString(project.updated_at ?? project.updatedAt, "updated_at"),
    githubRepoFullName: nullableString(
      project.github_repo_full_name ?? project.githubRepoFullName,
    ),
    llmModel: requiredString(project.llm_model ?? project.llmModel, "llm_model"),
  };
}

async function fetchProjects(): Promise<Project[]> {
  const response = await api.get<unknown>("/projects");
  const projectsResponse = response.data as
    | JsonApiProjectListResponse
    | Array<JsonApiProjectResource | ProjectResponse>;
  const projects = Array.isArray(projectsResponse)
    ? projectsResponse
    : projectsResponse.data;

  if (!Array.isArray(projects)) {
    throw new Error("Invalid project response: expected an array");
  }

  return projects.map((project) =>
    normalizeProject(projectResponseFromResource(project)),
  );
}

function normalizeCreatedProject(project: unknown): CreateProjectResult {
  if (project && typeof project === "object") {
    const singleProjectResponse = project as
      | JsonApiSingleProjectResponse
      | JsonApiProjectResource
      | ProjectResponse;
    const response =
      "data" in singleProjectResponse && singleProjectResponse.data
        ? projectResponseFromResource(singleProjectResponse.data)
        : projectResponseFromResource(
            singleProjectResponse as JsonApiProjectResource | ProjectResponse,
          );
    const id = requiredString(response.id, "id");

    try {
      const normalizedProject = normalizeProject(response);

      return {
        id: normalizedProject.id,
        project: normalizedProject,
      };
    } catch {
      return { id, project: null };
    }
  }

  throw new Error("Invalid project response: missing id");
}

async function createProject(
  project: CreateProjectVariables,
): Promise<CreateProjectResult> {
  const response = await api.post<unknown>("/projects", { project });

  return normalizeCreatedProject(response.data);
}

async function deleteProject({ projectId }: DeleteProjectVariables) {
  await api.delete(`/projects/${projectId}`);
}

export function useProjects() {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: fetchProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<CreateProjectResult, Error, CreateProjectVariables>({
    mutationFn: createProject,
    onSuccess: (createdProject) => {
      if (createdProject.project) {
        const project = createdProject.project;

        queryClient.setQueryData<Project[]>(
          projectsQueryKey,
          (currentProjects) => {
            if (!currentProjects) {
              return currentProjects;
            }

            const alreadyExists = currentProjects.some(
              (currentProject) => currentProject.id === project.id,
            );

            return alreadyExists ? currentProjects : [project, ...currentProjects];
          },
        );
      }

      void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteProjectVariables, DeleteProjectContext>({
    mutationFn: deleteProject,
    onMutate: async ({ projectId }) => {
      await queryClient.cancelQueries({ queryKey: projectsQueryKey });

      const previousProjects =
        queryClient.getQueryData<Project[]>(projectsQueryKey);

      queryClient.setQueryData<Project[]>(projectsQueryKey, (currentProjects) =>
        currentProjects?.filter((project) => project.id !== projectId) ?? [],
      );

      return { previousProjects };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(projectsQueryKey, context.previousProjects);
      }

      toast({
        title: "Couldn't delete project. Try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "Project deleted" });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
}
