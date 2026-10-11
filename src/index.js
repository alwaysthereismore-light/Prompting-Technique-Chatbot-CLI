/**
 * Prompting Technique Chatbot CLI
 * ─────────────────────────────────
 * Interactive chatbot powered by Google Gemini.
 * Lets the user pick a prompting pattern at startup:
 *   1. Zero-shot
 *   2. Few-shot
 *   3. Chain-of-thought
 */

import { MODEL } from "./client.js";
import { chatWithMetaPrompt } from "./meta-prompt.js";
import { banner, label, c, createPrompt } from "./ui.js";
import {
  ZERO_SHOT_SYSTEM,
  buildZeroShotMessages,
} from "./patterns/zero-shot.js";
import {
  FEW_SHOT_SYSTEM,
  buildFewShotMessages,
} from "./patterns/few-shot.js";
import {
  COT_SYSTEM,
  buildCoTMessages,
} from "./patterns/chain-of-thought.js";

const PATTERNS = {
  "1": {
    name: "Zero-shot",
    colour: c.cyan,
    system: ZERO_SHOT_SYSTEM,
    build: buildZeroShotMessages,
    hint: "A short meta-prompt plan is generated before each answer.",
  },
  "2": {
    name: "Few-shot",
    colour: c.magenta,
    system: FEW_SHOT_SYSTEM,
    build: buildFewShotMessages,
    hint: "A short meta-prompt plan uses the labelled examples before answering.",
  },
  "3": {
    name: "Chain-of-thought",
    colour: c.yellow,
    system: COT_SYSTEM,
    build: buildCoTMessages,
    hint: "A short meta-prompt plan guides the reasoning before the answer.",
  },
};

async function main() {
  banner("🤖  Prompting Technique Chatbot CLI", c.cyan);
  console.log(`${c.dim}Model: ${MODEL}${c.reset}\n`);

  console.log(`${c.bold}Choose a prompting pattern:${c.reset}`);
  console.log(`  ${c.cyan}1${c.reset}  Zero-shot`);
  console.log(`  ${c.magenta}2${c.reset}  Few-shot`);
  console.log(`  ${c.yellow}3${c.reset}  Chain-of-thought`);
  console.log();

  const { ask, close } = createPrompt();

  let choice;
  while (!PATTERNS[choice]) {
    choice = (await ask("Enter 1, 2, or 3: ")).trim();
    if (!PATTERNS[choice]) console.log("  Please enter 1, 2, or 3.\n");
  }

  const pattern = PATTERNS[choice];
  banner(`Pattern: ${pattern.name}`, pattern.colour);
  console.log(`${c.dim}${pattern.hint}${c.reset}`);
  console.log(`${c.dim}Type "exit" or "quit" to end the session.${c.reset}\n`);

  const conversationHistory = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const userInput = (await ask("")).trim();

    if (!userInput) continue;
    if (["exit", "quit", "q"].includes(userInput.toLowerCase())) {
      console.log(`\n${c.dim}Goodbye! 👋${c.reset}\n`);
      break;
    }

    conversationHistory.push({ role: "user", content: userInput });

    try {
      console.log(`\n${pattern.colour}${c.bold}Gemini › ${c.reset}`);
      const messages = pattern.build(conversationHistory);
      const { plan, response } = await chatWithMetaPrompt({
        system: pattern.system,
        messages,
        contextMessages: conversationHistory,
        maxTokens: 1024,
      });

      console.log(`${c.dim}Meta-prompt plan:${c.reset}`);
      console.log(JSON.stringify(plan, null, 2));
      console.log(`${pattern.colour}${c.bold}Gemini response:${c.reset}`);
      console.log(JSON.stringify(response, null, 2));
      console.log();
      conversationHistory.push({
        role: "assistant",
        content: JSON.stringify(response),
      });
    } catch (err) {
      console.error(`\n${c.dim}Error: ${err.message}${c.reset}\n`);
    }
  }

  close();
}

main();
