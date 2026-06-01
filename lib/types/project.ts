export const projectProviders = ["groq", "ollama"] as const;
export const projectStatuses = ["draft", "generating", "ready", "failed"] as const;
export const ticketRepos = ["frontend", "backend", "fullstack", "devops"] as const;
export const ticketStatuses = ["pending", "in_progress", "done"] as const;

export type ProjectProvider = (typeof projectProviders)[number];
export type ProjectStatus = (typeof projectStatuses)[number];
export type TicketRepo = (typeof ticketRepos)[number];
export type TicketStatus = (typeof ticketStatuses)[number];

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
  generationFailureMessage?: string | null;
};

export type Ticket = {
  id: string;
  repo: TicketRepo;
  title: string;
  body: string;
  position: number;
  status: TicketStatus;
};

export type Phase = {
  id: string;
  number: number;
  title: string;
  description: string | null;
  position: number;
  tickets: Ticket[];
};

export type ProjectDetail = Project & {
  phases: Phase[];
};
