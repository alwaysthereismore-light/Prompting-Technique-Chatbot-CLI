import test from "node:test";
import assert from "node:assert/strict";

process.env.GEMINI_API_KEY = "test-only-key";
const { chatWithMetaPrompt } = await import("../src/meta-prompt.js");

test("meta-prompting validates a plan before generating the final answer", async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  const responses = [
    {
      task: "Translate the greeting into French.",
      instructions: ["Use a natural French translation."],
      constraints: ["Keep the translation concise."],
      responseFormat: "Return the translated greeting.",
    },
    {
      answer: "Bonjour, comment allez-vous ?",
      explanation: "This is a polite French translation.",
      sentiment: null,
      confidence: "High",
    },
  ];

  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    requests.push(body);
    return new Response(
      JSON.stringify({
        candidates: [
          { content: { parts: [{ text: JSON.stringify(responses.shift()) }] } },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  try {
    const result = await chatWithMetaPrompt({
      system: "You are a concise translation assistant.",
      messages: [
        { role: "user", content: "Translate 'Hello, how are you?' into French." },
      ],
    });

    assert.equal(requests.length, 2);
    assert.equal(result.plan.task, "Translate the greeting into French.");
    assert.equal(result.response.answer, "Bonjour, comment allez-vous ?");
    const finalRequest = requests[1].contents[0].parts[0].text;
    assert.match(finalRequest, /Meta-prompt plan/);
    assert.match(finalRequest, /Original user request/);
    assert.ok(
      finalRequest.includes("Translate 'Hello, how are you?' into French.")
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("meta-prompting rejects messages without a user request", async () => {
  const originalFetch = globalThis.fetch;
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    throw new Error("No request should be made.");
  };

  try {
    await assert.rejects(
      chatWithMetaPrompt({
        system: "Assistant.",
        messages: [{ role: "assistant", content: "Hello." }],
      }),
      /requires at least one user message/
    );
    assert.equal(requestCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("meta-prompting stops if the planner returns an invalid plan", async () => {
  const originalFetch = globalThis.fetch;
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    task: "Answer the request.",
                    instructions: [],
                    constraints: [],
                    responseFormat: "A short answer.",
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
    await assert.rejects(
      chatWithMetaPrompt({
        system: "Assistant.",
        messages: [{ role: "user", content: "Answer me." }],
      }),
      /Too small|at least 1/i
    );
    assert.equal(requestCount, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
