import test from "node:test";
import assert from "node:assert/strict";
import { ChatResponseSchema } from "../src/response-schema.js";

process.env.GEMINI_API_KEY = "test-only-key";
const { chat } = await import("../src/client.js");

test("Gemini client requests JSON and validates its response", async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    answer: "4",
                    explanation: "Two plus two equals four.",
                    sentiment: null,
                    confidence: "High",
                  }),
                },
              ],
            },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  try {
    const result = await chat({
      system: "Answer directly.",
      model: "gemini-test-judge",
      messages: [{ role: "assistant", content: "Earlier response" },
        { role: "user", content: "What is 2 + 2?" }],
    });

    assert.equal(ChatResponseSchema.safeParse(result).success, true);
    assert.equal(
      request.url,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-test-judge:generateContent"
    );
    assert.equal(request.options.headers["x-goog-api-key"], "test-only-key");
    const body = JSON.parse(request.options.body);
    assert.equal(body.contents[0].role, "model");
    assert.equal(body.generationConfig.responseMimeType, "application/json");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Gemini client exposes HTTP status without echoing credentials", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("Unauthorized", { status: 401 });

  try {
    await assert.rejects(
      chat({
        system: "Answer directly.",
        messages: [{ role: "user", content: "Hi" }],
      }),
      (error) => error.status === 401 && !error.message.includes("test-only-key")
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
