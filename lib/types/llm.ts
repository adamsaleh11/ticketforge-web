export const groqModels = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
] as const;

export type GroqModel = (typeof groqModels)[number];

export const defaultGroqModel = groqModels[0];
export const defaultOllamaModel = "llama3.1";
export const defaultOllamaEndpoint = "http://localhost:11434";
