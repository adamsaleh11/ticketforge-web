export const projectProviders = ["groq", "ollama"] as const;
export const projectStatuses = ["draft", "generating", "ready", "failed"] as const;

export type ProjectProvider = (typeof projectProviders)[number];
export type ProjectStatus = (typeof projectStatuses)[number];

export type Project = {
  id: string;
  name: string;
  description: string | null;
  llmProvider: ProjectProvider;
  status: ProjectStatus;
  ticketCount: number;
  createdAt: string;
  updatedAt: string;
  githubRepoFullName: string | null;
  llmModel: string;
};
