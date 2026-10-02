import readline from "readline";

/** ANSI colour helpers */
export const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  dim: "\x1b[2m",
};

export function banner(title, colour = c.cyan) {
  const line = "─".repeat(60);
  console.log(`\n${colour}${c.bold}${line}${c.reset}`);
  console.log(`${colour}${c.bold}  ${title}${c.reset}`);
  console.log(`${colour}${c.bold}${line}${c.reset}\n`);
}

export function label(text, colour = c.yellow) {
  console.log(`${colour}${c.bold}${text}${c.reset}`);
}

/** Create a readline interface and return a promisified question fn. */
export function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const ask = (q) =>
    new Promise((resolve) => rl.question(`${c.green}${c.bold}You › ${c.reset}${q}`, resolve));
  const close = () => rl.close();
  return { ask, close };
}
