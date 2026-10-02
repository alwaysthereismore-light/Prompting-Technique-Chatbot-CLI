/**
 * Prompting Technique Chatbot CLI
 * ─────────────────────────────────
 * Interactive chatbot powered by Claude.
 * Lets the user pick a prompting pattern at startup:
 *   1. Zero-shot
 *   2. Few-shot
 *   3. Chain-of-thought
 */

import { chat, MODEL } from "./client.js";
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
    hint: "Ask anything — no examples provided.",
  },
  "2": {
    name: "Few-shot",
    colour: c.magenta,
    system: FEW_SHOT_SYSTEM,
    build: buildFewShotMessages,
    hint: "The model has seen labelled examples before answering.",
  },
  "3": {
    name: "Chain-of-thought",
    colour: c.yellow,
    system: COT_SYSTEM,
    build: buildCoTMessages,
    hint: "The model thinks step-by-step before giving its final answer.",
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
      console.log(`\n${pattern.colour}${c.bold}Claude › ${c.reset}`);
      const messages = pattern.build(conversationHistory);
      const reply = await chat({
        system: pattern.system,
        messages,
        maxTokens: 1024,
      });

      console.log(reply);
      console.log();
      conversationHistory.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error(`\n${c.dim}Error: ${err.message}${c.reset}\n`);
    }
  }

  close();
}

main();
