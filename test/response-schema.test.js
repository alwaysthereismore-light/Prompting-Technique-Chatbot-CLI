import test from "node:test";
import assert from "node:assert/strict";
import {
  ChatResponseSchema,
  JudgeResponseSchema,
} from "../src/response-schema.js";
import { EVAL_CASES } from "../src/eval/cases.js";
import { renderReport } from "../src/eval/report.js";

test("chat response schema accepts structured chatbot output", () => {
  const response = {
    answer: "NEUTRAL",
    explanation: "The text states a fact without expressing emotion.",
    sentiment: "NEUTRAL",
    confidence: "High",
  };
  assert.deepEqual(ChatResponseSchema.parse(response), response);
});

test("chat response schema rejects missing, invalid, and extra fields", () => {
  assert.equal(
    ChatResponseSchema.safeParse({
      answer: "Yes",
      explanation: "It is correct.",
      sentiment: null,
      confidence: "Certain",
    }).success,
    false
  );
  assert.equal(
    ChatResponseSchema.safeParse({
      answer: "Yes",
      explanation: "It is correct.",
      sentiment: null,
    }).success,
    false
  );
  assert.equal(
    ChatResponseSchema.safeParse({
      answer: "Yes",
      explanation: "It is correct.",
      sentiment: null,
      confidence: "High",
      extra: true,
    }).success,
    false
  );
});

test("judge response schema constrains scores to integers from 1 through 5", () => {
  assert.equal(
    JudgeResponseSchema.safeParse({
      score: 4,
      rationale: "The result is correct.",
      failureMode: null,
    }).success,
    true
  );
  for (const score of [0, 6, 3.5]) {
    assert.equal(
      JudgeResponseSchema.safeParse({
        score,
        rationale: "Invalid score.",
        failureMode: null,
      }).success,
      false
    );
  }
});

test("evaluation set contains exactly ten cases across all three patterns", () => {
  assert.equal(EVAL_CASES.length, 10);
  assert.deepEqual(
    [...new Set(EVAL_CASES.map((testCase) => testCase.pattern))].sort(),
    ["Chain-of-thought", "Few-shot", "Zero-shot"].sort()
  );
});

test("report renders every case and failure mode commentary", () => {
  const results = [
    {
      id: "zs-01",
      pattern: "Zero-shot",
      score: 5,
      rationale: "Accurate.",
      failureMode: null,
    },
    {
      id: "fs-01",
      pattern: "Few-shot",
      score: 2,
      rationale: "Incorrect label.",
      failureMode: "Classification error",
    },
  ];
  const report = renderReport(results, {
    chatbotModel: "test-chatbot",
    judgeModel: "test-sota-judge",
    date: "test-date",
  });
  assert.match(report, /Chatbot model:\*\* test-chatbot/);
  assert.match(report, /LLM-as-judge model:\*\* test-sota-judge/);
  assert.match(report, /1 passed, 1 failed, 0 not run/);
  assert.match(report, /Classification error \(fs-01\)/);
  assert.match(report, /\| zs-01 \| Zero-shot \| 5\/5 \| \*\*PASS\*\* \|/);
  assert.match(report, /\| fs-01 \| Few-shot \| 2\/5 \| \*\*FAIL\*\* \|/);
});

test("report distinguishes an API-blocked case from an attempted failure", () => {
  const report = renderReport([
    {
      id: "zs-01",
      pattern: "Zero-shot",
      score: null,
      error: "Gemini request failed with HTTP 401.",
      failureMode: "Gemini API error (HTTP 401)",
    },
    {
      id: "zs-02",
      pattern: "Zero-shot",
      score: null,
      notRun: true,
      error: "Not run after API authentication failure.",
    },
  ]);
  assert.match(report, /0 passed, 1 failed, 1 not run/);
  assert.match(report, /\| zs-02 \| Zero-shot \| — \| \*\*NOT RUN\*\* \|/);
  assert.match(report, /Gemini API error \(HTTP 401\) \(zs-01\)/);
});
