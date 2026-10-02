import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "❌  Missing ANTHROPIC_API_KEY. Copy .env.example → .env and add your key."
  );
  process.exit(1);
}

export const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODEL = "claude-3-5-haiku-20241022";

/** Send a single request and return the text response. */
export async function chat({ system, messages, maxTokens = 1024 }) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  });
  return response.content[0].text;
}
