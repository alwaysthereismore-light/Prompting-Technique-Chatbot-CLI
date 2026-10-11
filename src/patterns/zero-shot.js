/**
 * ZERO-SHOT PATTERN
 * ─────────────────────────────────────────────────────────────────────────────
 * The model receives NO examples — only a task description via the system
 * prompt. It relies entirely on its pre-trained knowledge to respond.
 *
 * When to use:
 *   • General Q&A, summarisation, translation, casual conversation
 *   • When examples would not meaningfully improve the output
 *   • No pattern demonstrations; keeps task-specific context lightweight
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ZERO_SHOT_SYSTEM = `You are a knowledgeable and concise AI assistant.
Answer every question directly and accurately without asking for clarification.
Be helpful, friendly, and to the point. If you do not know something, say so honestly.`;

/**
 * Build the messages array for a zero-shot turn.
 * No injected examples — just the raw conversation history.
 *
 * @param {Array<{role: string, content: string}>} history
 * @returns {Array<{role: string, content: string}>}
 */
export function buildZeroShotMessages(history) {
  return history;
}

// ─── Standalone demo ────────────────────────────────────────────────────────
// Run with:  npm run zero-shot
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv[1].endsWith("zero-shot.js")) {
  const { chatWithMetaPrompt } = await import("../meta-prompt.js");
  const { banner, label, c } = await import("../ui.js");

  banner("Pattern Demo: Zero-shot", c.cyan);

  const questions = [
    "What is machine learning in one sentence?",
    "Name three benefits of open-source software.",
    "Translate 'Hello, how are you?' into French.",
  ];

  for (const q of questions) {
    label(`\nQ: ${q}`, c.cyan);
    const { plan, response } = await chatWithMetaPrompt({
      system: ZERO_SHOT_SYSTEM,
      messages: buildZeroShotMessages([{ role: "user", content: q }]),
    });
    console.log(`Meta-prompt plan: ${JSON.stringify(plan, null, 2)}`);
    console.log(`A: ${JSON.stringify(response, null, 2)}\n`);
  }
}
