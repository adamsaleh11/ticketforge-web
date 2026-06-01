"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const githubReposQueryKey = ["github", "repos"] as const;

export type GitHubRepo = {
  defaultBranch: string;
  description: string | null;
  fullName: string;
  isPrivate: boolean;
  language: string | null;
  name: string;
};

type GitHubRepoResponse = {
  default_branch?: unknown;
  defaultBranch?: unknown;
  description?: unknown;
  full_name?: unknown;
  fullName?: unknown;
  is_private?: unknown;
  isPrivate?: unknown;
  language?: unknown;
  name?: unknown;
  private?: unknown;
};

type JsonApiRepoResource = {
  id?: unknown;
  type?: unknown;
  attributes?: GitHubRepoResponse;
};

type JsonApiRepoListResponse = {
  data?: Array<JsonApiRepoResource | GitHubRepoResponse>;
};

type GitHubReposResponse = {
  repos?: Array<JsonApiRepoResource | GitHubRepoResponse>;
};

type GitHubReposListPayload =
  | GitHubReposResponse
  | JsonApiRepoListResponse
  | Array<JsonApiRepoResource | GitHubRepoResponse>;

function requiredString(value: unknown, fieldName: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  throw new Error(`Invalid GitHub repository response: missing ${fieldName}`);
}

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return typeof value === "string" ? value : String(value);
}

function booleanValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
}

function repoResponseFromResource(
  resource: JsonApiRepoResource | GitHubRepoResponse,
): GitHubRepoResponse {
  if ("attributes" in resource && resource.attributes) {
    return resource.attributes;
  }

  return resource as GitHubRepoResponse;
}

function normalizeGitHubRepo(repo: GitHubRepoResponse): GitHubRepo {
  const fullName = requiredString(
    repo.full_name ?? repo.fullName,
    "full_name",
  );

  return {
    defaultBranch: requiredString(
      repo.default_branch ?? repo.defaultBranch,
      "default_branch",
    ),
    description: nullableString(repo.description),
    fullName,
    name: requiredString(repo.name, "name"),
    language: nullableString(repo.language),
    isPrivate: booleanValue(repo.private ?? repo.is_private ?? repo.isPrivate),
  };
}

async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  const response = await api.get<unknown>("/github/repos", {
    headers: {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
    },
    params: {
      _: Date.now(),
    },
    skipAuthRedirectOn401: true,
  });
  const reposResponse = response.data as GitHubReposListPayload;
  const repos = extractRepos(reposResponse);

  if (!Array.isArray(repos)) {
    throw new Error("Invalid GitHub repository response: expected an array");
  }

  return repos.map((repo) => normalizeGitHubRepo(repoResponseFromResource(repo)));
}

function extractRepos(payload: GitHubReposListPayload): Array<
  JsonApiRepoResource | GitHubRepoResponse
> {
  if (Array.isArray(payload)) {
    return payload;
  }

  if ("repos" in payload && Array.isArray(payload.repos)) {
    return payload.repos;
  }

  if ("data" in payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  throw new Error("Invalid GitHub repository response: expected an array");
}

export function isGitHubReposUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function useGitHubRepos({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: githubReposQueryKey,
    queryFn: fetchGitHubRepos,
    enabled,
    retry: (failureCount, error) =>
      !isGitHubReposUnauthorizedError(error) && failureCount < 2,
  });
}
