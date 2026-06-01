"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { defaultOllamaEndpoint } from "@/lib/types/llm";

export const currentUserQueryKey = ["me"] as const;

export type CurrentUserSettings = {
  id: string;
  email: string;
  name: string | null;
  githubUsername: string | null;
  ollamaEndpoint: string;
};

export type SaveOllamaEndpointVariables = {
  endpoint: string;
};

export type OllamaConnectionResult =
  | {
      connected: true;
      models: string[];
    }
  | {
      connected: false;
      error: string;
    };

type UserAttributesResponse = {
  email?: unknown;
  name?: unknown;
  github_username?: unknown;
  githubUsername?: unknown;
  ollama_endpoint?: unknown;
  ollamaEndpoint?: unknown;
};

type JsonApiUserResource = {
  id?: unknown;
  attributes?: UserAttributesResponse;
};

type JsonApiUserResponse = {
  data?: JsonApiUserResource | UserAttributesResponse;
};

type JsonApiError = {
  source?: {
    pointer?: unknown;
  };
  detail?: unknown;
};

type JsonApiErrorResponse = {
  errors?: JsonApiError[];
};

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? value : String(value);
}

function stringOrDefault(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return fallback;
}

function userAttributesFromResponse(response: unknown): {
  id: string;
  attributes: UserAttributesResponse;
} {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid user response: expected object");
  }

  const maybeJsonApi = response as JsonApiUserResponse;
  const data = maybeJsonApi.data;

  if (data && typeof data === "object") {
    if ("attributes" in data && data.attributes) {
      return {
        id: stringOrDefault(data.id, ""),
        attributes: data.attributes,
      };
    }

    return {
      id: "",
      attributes: data as UserAttributesResponse,
    };
  }

  return {
    id: "",
    attributes: response as UserAttributesResponse,
  };
}

function normalizeCurrentUser(response: unknown): CurrentUserSettings {
  const { id, attributes } = userAttributesFromResponse(response);

  return {
    id,
    email: stringOrDefault(attributes.email, ""),
    name: nullableString(attributes.name),
    githubUsername: nullableString(
      attributes.github_username ?? attributes.githubUsername,
    ),
    ollamaEndpoint: stringOrDefault(
      attributes.ollama_endpoint ?? attributes.ollamaEndpoint,
      defaultOllamaEndpoint,
    ),
  };
}

function normalizeConnectionResult(response: unknown): OllamaConnectionResult {
  if (!response || typeof response !== "object") {
    return {
      connected: false,
      error: "Unexpected Ollama test response.",
    };
  }

  const result = response as {
    connected?: unknown;
    models?: unknown;
    error?: unknown;
  };

  if (result.connected === true) {
    return {
      connected: true,
      models: Array.isArray(result.models)
        ? result.models.filter((model): model is string => typeof model === "string")
        : [],
    };
  }

  return {
    connected: false,
    error:
      typeof result.error === "string" && result.error.length > 0
        ? result.error
        : "TicketForge could not connect to Ollama.",
  };
}

async function fetchCurrentUser(): Promise<CurrentUserSettings> {
  const response = await api.get<unknown>("/me");

  return normalizeCurrentUser(response.data);
}

async function saveOllamaEndpoint({
  endpoint,
}: SaveOllamaEndpointVariables): Promise<CurrentUserSettings> {
  const response = await api.patch<unknown>("/settings/ollama", {
    user: {
      ollama_endpoint: endpoint,
    },
  });

  return normalizeCurrentUser(response.data);
}

async function testSavedOllamaEndpoint(): Promise<OllamaConnectionResult> {
  const response = await api.post<unknown>("/settings/ollama/test");

  return normalizeConnectionResult(response.data);
}

export function getOllamaEndpointValidationMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const response = error.response?.data as JsonApiErrorResponse | undefined;
  const endpointError = response?.errors?.find(
    (jsonApiError) =>
      jsonApiError.source?.pointer === "/data/attributes/ollama_endpoint",
  );

  return typeof endpointError?.detail === "string"
    ? endpointError.detail
    : null;
}

export function useCurrentUserSettings() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
  });
}

export function useSaveOllamaEndpoint() {
  const queryClient = useQueryClient();

  return useMutation<CurrentUserSettings, Error, SaveOllamaEndpointVariables>({
    mutationFn: saveOllamaEndpoint,
    onSuccess: (currentUser) => {
      queryClient.setQueryData(currentUserQueryKey, currentUser);
    },
  });
}

export function useTestSavedOllamaEndpoint() {
  return useMutation<OllamaConnectionResult, Error>({
    mutationFn: testSavedOllamaEndpoint,
  });
}
