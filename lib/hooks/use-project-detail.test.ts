import { describe, expect, it } from "vitest";
import { normalizeProjectDetail } from "@/lib/hooks/use-project-detail";

const baseProjectAttributes = {
  name: "TicketForge",
  description: "Generate phased tickets",
  llm_provider: "groq",
  llm_model: "llama-3.3-70b-versatile",
  status: "ready",
  ticket_count: 2,
  github_repo_full_name: "openai/ticketforge",
  created_at: "2026-06-01T12:00:00Z",
  updated_at: "2026-06-01T12:30:00Z",
};

describe("normalizeProjectDetail", () => {
  it("normalizes ordered phases and nested tickets from JSON:API included data", () => {
    const project = normalizeProjectDetail({
      data: {
        id: "project-1",
        type: "project",
        attributes: baseProjectAttributes,
        relationships: {
          phases: {
            data: [
              { id: "phase-2", type: "phase" },
              { id: "phase-1", type: "phase" },
            ],
          },
        },
      },
      included: [
        {
          id: "phase-2",
          type: "phase",
          attributes: {
            number: 2,
            title: "Second phase",
            description: null,
            position: 2,
          },
          relationships: {
            tickets: {
              data: [{ id: "ticket-2", type: "ticket" }],
            },
          },
        },
        {
          id: "phase-1",
          type: "phase",
          attributes: {
            number: 1,
            title: "First phase",
            description: "Start here",
            position: 1,
          },
          relationships: {
            tickets: {
              data: [
                { id: "ticket-2", type: "ticket" },
                { id: "ticket-1", type: "ticket" },
              ],
            },
          },
        },
        {
          id: "ticket-2",
          type: "ticket",
          attributes: {
            repo: "backend",
            title: "Build API",
            body: "Implement the endpoint.",
            position: 2,
            status: "pending",
          },
        },
        {
          id: "ticket-1",
          type: "ticket",
          attributes: {
            repo: "frontend",
            title: "Build UI",
            body: "Implement the page.",
            position: 1,
            status: "done",
          },
        },
      ],
    });

    expect(project.id).toBe("project-1");
    expect(project.githubRepoFullName).toBe("openai/ticketforge");
    expect(project.phases.map((phase) => phase.id)).toEqual([
      "phase-1",
      "phase-2",
    ]);
    expect(project.phases[0].tickets.map((ticket) => ticket.id)).toEqual([
      "ticket-1",
      "ticket-2",
    ]);
    expect(project.phases[0].tickets[0].status).toBe("done");
  });

  it("returns an empty phase list for an empty board response", () => {
    const project = normalizeProjectDetail({
      data: {
        id: "project-1",
        type: "project",
        attributes: {
          ...baseProjectAttributes,
          status: "draft",
          ticket_count: 0,
        },
        relationships: {
          phases: {
            data: [],
          },
        },
      },
      included: [],
    });

    expect(project.status).toBe("draft");
    expect(project.phases).toEqual([]);
    expect(project.generationFailureMessage).toBeNull();
  });

  it("normalizes snake_case generation failure metadata", () => {
    const project = normalizeProjectDetail({
      data: {
        id: "project-1",
        type: "project",
        attributes: {
          ...baseProjectAttributes,
          status: "failed",
          generation_error: "Ollama timed out while generating tickets.",
        },
        relationships: {
          phases: {
            data: [],
          },
        },
      },
      included: [],
    });

    expect(project.status).toBe("failed");
    expect(project.generationFailureMessage).toBe(
      "Ollama timed out while generating tickets.",
    );
  });

  it("normalizes camelCase generation failure metadata", () => {
    const project = normalizeProjectDetail({
      data: {
        id: "project-1",
        type: "project",
        attributes: {
          ...baseProjectAttributes,
          status: "failed",
          generationFailureMessage: "Groq returned an unavailable response.",
        },
        relationships: {
          phases: {
            data: [],
          },
        },
      },
      included: [],
    });

    expect(project.generationFailureMessage).toBe(
      "Groq returned an unavailable response.",
    );
  });
});
