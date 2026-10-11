import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import {
  CHAT_OUTPUT_INSTRUCTIONS,
  ChatResponseSchema,
} from "./response-schema.js";

dotenv.config({
  path: [".env", fileURLToPath(new URL("./.env", import.meta.url))],
});

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error(
    "❌  Missing GEMINI_API_KEY. Add your Google AI Studio key to .env or src/.env."
  );
  process.exit(1);
}

export const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const JUDGE_MODEL = process.env.GEMINI_JUDGE_MODEL;

/** Send a request to Gemini and return its Zod-validated structured response. */
export async function chat({
  system,
  messages,
  model = MODEL,
  maxTokens = 1024,
  schema = ChatResponseSchema,
  outputInstructions = CHAT_OUTPUT_INSTRUCTIONS,
}) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${system}\n\n${outputInstructions}` }],
        },
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : message.role,
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = new Error(`Gemini request failed with HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  const text = payload.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("");

  if (!text) {
    throw new Error("Gemini returned no text content to validate.");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error("Gemini returned invalid JSON.", { cause: error });
  }
  return schema.parse(parsed);
}
