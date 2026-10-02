/**
 * CHAIN-OF-THOUGHT (CoT) PATTERN
 * ─────────────────────────────────────────────────────────────────────────────
 * The model is instructed to reason step-by-step before producing its final
 * answer. Intermediate reasoning is shown inside <thinking> tags, followed
 * by a clear "Final Answer:" section.
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
For EVERY question you receive, you MUST follow this exact structure:

<thinking>
Step 1: [Identify what is being asked]
Step 2: [Break down the problem into smaller parts]
Step 3: [Work through each part carefully]
Step 4: [Verify your reasoning]
</thinking>

Final Answer: [Your concise, direct answer based on the reasoning above]

Do not skip the thinking steps, even for simple questions. Show all your work.`;

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
      content: `<thinking>
Step 1: Identify what is being asked — calculate the change from a $10 bill after buying 12 apples.
Step 2: Break it down — (a) cost of 12 apples, (b) subtract from $10.
Step 3: Work through it:
  (a) 12 apples × $0.50 = $6.00
  (b) $10.00 − $6.00 = $4.00
Step 4: Verify — 12 × 0.5 = 6 ✓  10 − 6 = 4 ✓
</thinking>

Final Answer: You would receive $4.00 in change.`,
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
    `${c.dim}The model reasons step-by-step inside <thinking> tags.${c.reset}\n`
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
    console.log(reply);
    console.log();
  }
}
