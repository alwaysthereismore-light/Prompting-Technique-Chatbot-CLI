/**
 * CHAIN-OF-THOUGHT (CoT) PATTERN
 * ─────────────────────────────────────────────────────────────────────────────
 * The model works through the problem, checks its result, and returns the
 * concise answer plus key calculation steps in the structured JSON response.
 *
 * Why it works:
 *   Breaking a problem into explicit intermediate steps significantly improves
 *   accuracy on tasks that require multi-step reasoning, arithmetic, logic
 *   puzzles, or nuanced judgement calls.
 *
 * When to use:
 *   • Math word problems and multi-step calculations
 *   • Logic/deduction puzzles
 *   • Complex decision-making that benefits from visible reasoning
 *   • Debugging or troubleshooting flows
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const COT_SYSTEM = `You are a methodical reasoning assistant.
Solve the problem carefully, check the calculation, and return the concise final
answer in the answer field. Summarize the key steps and calculations in explanation.`;

/**
 * Build the messages array for a chain-of-thought turn.
 * Optionally injects a one-shot CoT example to reinforce the format.
 *
 * @param {Array<{role: string, content: string}>} history
 * @returns {Array<{role: string, content: string}>}
 */
export function buildCoTMessages(history) {
  // A single demonstration example helps anchor the format
  const cotExample = [
    {
      role: "user",
      content:
        "A store sells apples for $0.50 each. If I buy 12 apples and pay with a $10 bill, how much change do I get?",
    },
    {
      role: "assistant",
      content: JSON.stringify({
        answer: "You would receive $4.00 in change.",
        explanation:
          "12 × $0.50 = $6.00; $10.00 - $6.00 = $4.00.",
        sentiment: null,
        confidence: "High",
      }),
    },
  ];

  return [...cotExample, ...history];
}

// ─── Standalone demo ────────────────────────────────────────────────────────
// Run with:  npm run chain-of-thought
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv[1].endsWith("chain-of-thought.js")) {
  const { chat } = await import("../client.js");
  const { banner, label, c } = await import("../ui.js");

  banner("Pattern Demo: Chain-of-thought", c.yellow);
  console.log(
    `${c.dim}The JSON response includes the answer and key calculation steps.${c.reset}\n`
  );

  const problems = [
    "If a train travels at 60 mph for 2.5 hours, then at 80 mph for 1.5 hours, what is the total distance covered?",
    "A password must be 8-12 characters long, contain at least one uppercase letter, one number, and one special character. Is 'Hello@9' a valid password?",
    "Three friends split a restaurant bill. The food costs $72, tax is 8%, and they want to tip 20% on the pre-tax amount. How much does each person pay?",
  ];

  for (const problem of problems) {
    label(`\nProblem: ${problem}`, c.yellow);
    console.log("─".repeat(60));
    const messages = buildCoTMessages([{ role: "user", content: problem }]);
    const reply = await chat({
      system: COT_SYSTEM,
      messages,
      maxTokens: 1024,
    });
    console.log(JSON.stringify(reply, null, 2));
    console.log();
  }
}
