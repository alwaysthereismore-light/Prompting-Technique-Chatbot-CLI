/**
 * FEW-SHOT PATTERN
 * ─────────────────────────────────────────────────────────────────────────────
 * The model is shown several labelled input→output examples inside the message
 * history BEFORE the user's real question. It learns the expected format and
 * style by analogy.
 *
 * When to use:
 *   • Sentiment analysis, classification, entity extraction
 *   • Enforcing a specific output format (JSON, bullet lists, etc.)
 *   • Domain-specific tasks where the style isn't obvious from instructions alone
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FEW_SHOT_SYSTEM = `You are a precise sentiment analysis assistant.
Classify every piece of text as POSITIVE, NEGATIVE, or NEUTRAL.
Set the sentiment field to the correct label, give a concise reason in explanation,
and provide your confidence.`;

/**
 * Fixed few-shot examples that are prepended to every conversation turn.
 * These teach the model the expected output format.
 */
const FEW_SHOT_EXAMPLES = [
  {
    role: "user",
    content: 'Classify: "I absolutely love this product! Best purchase ever."',
  },
  {
    role: "assistant",
    content: JSON.stringify({
      answer: "POSITIVE",
      explanation:
        "The text uses strong positive language ('absolutely love', 'Best purchase ever').",
      sentiment: "POSITIVE",
      confidence: "High",
    }),
  },
  {
    role: "user",
    content: 'Classify: "The delivery was late and the packaging was damaged."',
  },
  {
    role: "assistant",
    content: JSON.stringify({
      answer: "NEGATIVE",
      explanation:
        "The text describes two negative experiences (late delivery, damaged packaging).",
      sentiment: "NEGATIVE",
      confidence: "High",
    }),
  },
  {
    role: "user",
    content: 'Classify: "The package arrived on Tuesday."',
  },
  {
    role: "assistant",
    content: JSON.stringify({
      answer: "NEUTRAL",
      explanation:
        "The text states a plain fact with no emotional language.",
      sentiment: "NEUTRAL",
      confidence: "High",
    }),
  },
  {
    role: "user",
    content:
      'Classify: "The product is okay, I guess. Nothing special but does the job."',
  },
  {
    role: "assistant",
    content: JSON.stringify({
      answer: "NEUTRAL",
      explanation:
        "Mixed but mild language suggests neither strong satisfaction nor dissatisfaction.",
      sentiment: "NEUTRAL",
      confidence: "Medium",
    }),
  },
];

/**
 * Build the messages array for a few-shot turn.
 * Injects fixed examples before the live conversation history.
 *
 * @param {Array<{role: string, content: string}>} history
 * @returns {Array<{role: string, content: string}>}
 */
export function buildFewShotMessages(history) {
  return [...FEW_SHOT_EXAMPLES, ...history];
}

// ─── Standalone demo ────────────────────────────────────────────────────────
// Run with:  npm run few-shot
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv[1].endsWith("few-shot.js")) {
  const { chatWithMetaPrompt } = await import("../meta-prompt.js");
  const { banner, label, c } = await import("../ui.js");

  banner("Pattern Demo: Few-shot", c.magenta);
  console.log(
    `${c.dim}${FEW_SHOT_EXAMPLES.length} examples injected before each query.${c.reset}\n`
  );

  const inputs = [
    "I waited three weeks and the item still hasn't arrived. Terrible experience!",
    "The coffee was warm and the chair was comfortable.",
    "This is honestly the worst app I have ever used. Crashes constantly.",
    "Five stars! Exceeded every expectation I had.",
  ];

  for (const text of inputs) {
    label(`\nInput: "${text}"`, c.magenta);
    const messages = buildFewShotMessages([
      { role: "user", content: `Classify: "${text}"` },
    ]);
    const { plan, response } = await chatWithMetaPrompt({
      system: FEW_SHOT_SYSTEM,
      messages,
      contextMessages: [{ role: "user", content: `Classify: "${text}"` }],
      maxTokens: 256,
    });
    console.log(`Meta-prompt plan: ${JSON.stringify(plan, null, 2)}`);
    console.log(JSON.stringify(response, null, 2));
  }
}
