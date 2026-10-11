import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  JUDGE_OUTPUT_INSTRUCTIONS,
  JudgeResponseSchema,
} from "../response-schema.js";
import { EVAL_CASES } from "./cases.js";
import { renderReport } from "./report.js";

const REPORT_PATH = path.resolve(process.cwd(), "reports", "eval-report.md");

async function scoreCase(chat, testCase) {
  try {
    const generated = await chat({
      system: testCase.system,
      messages: testCase.build([{ role: "user", content: testCase.input }]),
    });

    const judged = await chat({
      system:
        "You are a careful evaluator. Compare the chatbot response to the task criteria. " +
        "Judge factual correctness and whether all requested constraints are satisfied. " +
        "Be strict about incorrect labels and arithmetic, but accept equivalent correct wording.",
      messages: [
        {
          role: "user",
          content: JSON.stringify(
            {
              task: testCase.input,
              successCriteria: testCase.criteria,
              chatbotResponse: generated,
            },
            null,
            2
          ),
        },
      ],
      maxTokens: 256,
      schema: JudgeResponseSchema,
      outputInstructions: JUDGE_OUTPUT_INSTRUCTIONS,
    });

    return {
      id: testCase.id,
      pattern: testCase.pattern,
      score: judged.score,
      rationale: judged.rationale,
      failureMode: judged.failureMode,
    };
  } catch (error) {
    const status =
      Number.isInteger(error.status) && error.status >= 400 && error.status < 500
        ? error.status
        : null;
    return {
      id: testCase.id,
      pattern: testCase.pattern,
      score: null,
      error: status
        ? `Gemini request failed with HTTP ${status}; verify API configuration and retry.`
        : error.message,
      failureMode: status
        ? `Gemini API error (HTTP ${status})`
        : "Generation, judging, or schema validation",
      stopRun: status !== null,
      apiStatus: status,
    };
  }
}

export async function runEvaluation({ reportPath = REPORT_PATH } = {}) {
  const { chat, MODEL } = await import("../client.js");
  const results = [];

  for (const testCase of EVAL_CASES) {
    console.log(`Evaluating ${testCase.id} (${testCase.pattern})...`);
    const result = await scoreCase(chat, testCase);
    results.push(result);
    console.log(
      result.score === null
        ? `  FAIL — ${result.error}`
        : `  ${result.score >= 4 ? "PASS" : "FAIL"} — ${result.score}/5`
    );
    if (result.stopRun) {
      for (const remainingCase of EVAL_CASES.slice(results.length)) {
        results.push({
          id: remainingCase.id,
          pattern: remainingCase.pattern,
          score: null,
          notRun: true,
          error: `Not run because the preceding Gemini request failed with HTTP ${result.apiStatus}.`,
        });
      }
      break;
    }
  }

  const report = renderReport(results, { model: MODEL });
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");
  console.log(`\nReport written to ${reportPath}`);

  return {
    results,
    report,
    passed: results.filter((result) => result.score !== null && result.score >= 4)
      .length,
    failed: results.filter(
      (result) =>
        !result.notRun && (result.score === null || result.score < 4)
    ).length,
    notRun: results.filter((result) => result.notRun).length,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { failed, notRun } = await runEvaluation();
  if (failed > 0 || notRun > 0) process.exitCode = 1;
}
