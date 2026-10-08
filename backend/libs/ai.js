import { createGoogleGenerativeAI } from "@ai-sdk/google";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable"
  );
}

export const google = createGoogleGenerativeAI({
  apiKey,
});

export const AI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const aiModel = google(AI_MODEL);