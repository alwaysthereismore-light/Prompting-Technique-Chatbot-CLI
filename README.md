# 🤖 Prompting Technique Chatbot CLI

[![CI](https://github.com/alwaysthereismore-light/Prompting-Technique-Chatbot-CLI/actions/workflows/ci.yml/badge.svg)](https://github.com/alwaysthereismore-light/Prompting-Technique-Chatbot-CLI/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

A command-line chatbot powered by the **Google Gemini API** that demonstrates three core prompting techniques: **Zero-shot**, **Few-shot**, and **Chain-of-thought**. Built as part of the [IntelliForge 12-Week AI Engineering Cohort](https://upskill.intelliforge.tech).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Prompting Patterns](#prompting-patterns)
  - [1. Zero-shot](#1-zero-shot)
  - [2. Few-shot](#2-few-shot)
  - [3. Chain-of-thought](#3-chain-of-thought)
- [Pattern Comparison](#pattern-comparison)
- [Learning Outcomes & Evaluation Evidence](#learning-outcomes--evaluation-evidence)
- [Sample Outputs](#sample-outputs)

---

## Overview

| Feature | Detail |
|---|---|
| **Model** | `gemini-2.5-flash` |
| **Runtime** | Node.js 18+ (ESM) |
| **API** | Google Gemini API |
| **Interface** | Interactive CLI with colour output |
| **Output** | Zod-validated JSON |

The chatbot loads with a **custom system prompt** per pattern, shaping Gemini's persona and output format before any user message is sent. All three patterns share the same underlying API client — only the system prompt and message construction differ. API credentials are loaded from local environment files and must never be committed.

---

## Project Structure

```
prompting-technique-chatbot-cli/
├── src/
│   ├── index.js                    # Interactive CLI entry point
│   ├── client.js                   # Gemini API wrapper + validated chat() helper
│   ├── meta-prompt.js              # Plan-then-answer meta-prompting flow
│   ├── response-schema.js          # Zod schemas and JSON output instructions
│   ├── eval/
│   │   ├── cases.js                # Ten W01 evaluation cases
│   │   ├── report.js               # Markdown report renderer
│   │   └── run.js                  # Chatbot + LLM-as-judge harness
│   ├── ui.js                       # ANSI colours, banner, readline helpers
│   └── patterns/
│       ├── zero-shot.js            # Zero-shot pattern + standalone demo
│       ├── few-shot.js             # Few-shot pattern + standalone demo
│       └── chain-of-thought.js     # Chain-of-thought pattern + standalone demo
├── .env.example                    # Safe Gemini configuration template
├── .github/workflows/ci.yml        # Key-free test workflow for Node 18/20/22
├── .gitignore
├── LICENSE                         # MIT
├── reports/
│   └── eval-report.md              # Latest recorded LLM-as-judge run
├── test/
│   ├── gemini-client.test.js       # Gemini API adapter tests
│   ├── meta-prompt.test.js         # Plan-then-answer flow tests
│   └── response-schema.test.js     # Schema, case-count, and report tests
├── package.json
└── README.md
```

---

## Setup & Installation

### 1. Clone the repo

```bash
git clone https://github.com/alwaysthereismore-light/Prompting-Technique-Chatbot-CLI.git
cd Prompting-Technique-Chatbot-CLI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Google Gemini API key

Copy `.env.example` to `.env` in the repository root, then add your key:

```powershell
Copy-Item .env.example .env
```

Or on macOS/Linux:

```bash
cp .env.example .env
```

The `.env` file is ignored by Git. Add the key locally:

```
GEMINI_API_KEY=your-google-ai-studio-key
```

Create a key in [Google AI Studio](https://aistudio.google.com/app/apikey). The client also accepts `GOOGLE_API_KEY`; set `GEMINI_MODEL` to override the default model. Keep API keys private, and never paste them into source code, issues, or chat.

---

## Usage

### Interactive chatbot (choose a pattern at runtime)

```bash
npm start
```

You'll see a menu:

```
──────────────────────────────────────────────────────────────
  🤖  Prompting Technique Chatbot CLI
──────────────────────────────────────────────────────────────

Choose a prompting pattern:
  1  Zero-shot
  2  Few-shot
  3  Chain-of-thought

You › Enter 1, 2, or 3:
```

Type `exit` or `quit` at any time to end the session.

### Meta-prompting flow

Each chatbot turn now uses a two-stage meta-prompting flow:

1. A planner receives the selected pattern's base instructions and up to the
   latest eight real conversation messages. Few-shot/CoT demonstration examples
   are excluded from planner context.
2. The planner returns a concise JSON plan validated by `MetaPromptPlanSchema`.
   The plan identifies the task, up to six answer instructions, up to six
   constraints, and a response format.
3. The validated plan is added as guidance to the latest user request. The
   selected prompting pattern then generates the final answer, which is
   independently validated by `ChatResponseSchema`.

Planner output is treated as task guidance, not as a replacement for the
selected system role or safety requirements. The CLI displays the plan and
answer separately so the technique is observable. This adds one model request
per chatbot turn; evaluations make three requests per case (planner, answer,
and judge), so latency and API cost increase.

### Structured response format

Every generated chatbot reply is requested as JSON and validated with Zod before
it is displayed or added to the conversation history. The schema rejects
missing or unexpected fields and invalid enum values. The response has this shape:

```json
{
  "answer": "The direct answer",
  "explanation": "A concise explanation or key calculation steps",
  "sentiment": null,
  "confidence": "High"
}
```

For sentiment classification, `sentiment` is `POSITIVE`, `NEGATIVE`, or
`NEUTRAL`. Otherwise it is `null`. The confidence value is `High`, `Medium`, or
`Low`. Invalid JSON or a schema mismatch is surfaced as an error rather than
displayed as a successful response.

### Run the LLM-as-judge evaluation

```bash
npm run eval
```

The harness runs ten cases across the zero-shot, few-shot, and chain-of-thought
patterns. Each chatbot response and each judge result is validated with Zod.
The judge scores each response from 1 to 5 against case-specific criteria; a
score of 4 or higher passes. The run writes a pass/fail table, generated
meta-prompt plans, and failure-mode commentary to `reports/eval-report.md`. A
failed case causes the command to exit with a non-zero status. Each case
normally makes three model requests (planner, chatbot, and judge); the
harness stops early on non-retryable API errors and marks unattempted cases as
not run. A valid `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) and an explicit
`GEMINI_JUDGE_MODEL` are required.

### Evaluation model decision: use a SOTA judge

**Decision:** use a separate, highest-capability Gemini model available to the
project as the LLM judge, rather than letting the chatbot score itself or
silently reusing the chatbot's generation model. The judge checks the response
against each case's criteria and emits a schema-validated score, rationale, and
failure mode. A stronger judge is selected to improve the quality of
correctness and instruction-following assessments; it can increase evaluation
latency and API cost, so each run records the exact chatbot and judge model IDs
in the report.

Set `GEMINI_JUDGE_MODEL` in `.env` to the highest-capability generally available
Gemini model enabled for your project. Model availability and names change;
choose the current model in [Google's Gemini model documentation](https://ai.google.dev/gemini-api/docs/models)
instead of assuming a hard-coded model ID will remain SOTA. `GEMINI_MODEL`
continues to select the chatbot model independently. `npm run eval` requires
the judge setting explicitly so an evaluation cannot silently fall back to the
chatbot model.

This is a model-selection decision, not proof that the judge is unbiased or
objectively superior. LLM-as-judge scores remain qualitative and may contain
errors; retain the case criteria and review rationales, especially for
borderline scores.

The current checked-in [evaluation report](./reports/eval-report.md) is
transparent evidence of an attempted run, **not a successful quality result**:
the recorded attempt received HTTP 404 on its first Gemini request, so no judge
scores were produced and the remaining cases were not run. The SOTA-judge
selection above documents the evaluation policy; that historical run did not
reach a judge call. Re-run the harness with a working key and both model
settings to generate scored evidence. The report is overwritten on each run.

Run the local schema and report tests with:

```bash
npm test
```

### Standalone pattern demos

Each pattern file runs independently and fires a set of preset questions:

```bash
npm run zero-shot          # General Q&A demo
npm run few-shot           # Sentiment analysis demo
npm run chain-of-thought   # Step-by-step reasoning demo
```

---

## Prompting Patterns

### 1. Zero-shot

**File:** `src/patterns/zero-shot.js`

#### What it is

Zero-shot prompting gives the model **no examples**. The task is described entirely through the system prompt, and the model relies on its pre-trained knowledge to respond correctly.

#### System prompt used

```
You are a knowledgeable and concise AI assistant.
Answer every question directly and accurately without asking for clarification.
Be helpful, friendly, and to the point. If you do not know something, say so honestly.
```

#### How it works

```
System prompt (task description only)
        │
        ▼
User message ──► Gemini ──► Response
```

The `buildZeroShotMessages()` function simply passes the raw conversation history — no injection of examples:

```js
export function buildZeroShotMessages(history) {
  return history;
}
```

#### When to use it

- General Q&A, summarisation, translation
- When the task is straightforward and well within the model's knowledge
- When avoiding pattern-specific examples matters

---

### 2. Few-shot

**File:** `src/patterns/few-shot.js`

#### What it is

Few-shot prompting **injects labelled input→output examples** into the message history before the user's real question. The model learns the expected format and decision logic by analogy, without any explicit rules.

#### System prompt used

```
You are a precise sentiment analysis assistant.
Classify every piece of text as POSITIVE, NEGATIVE, or NEUTRAL.
Set the sentiment field to the correct label, give a concise reason in
explanation, and provide your confidence.
```

#### How it works

```
System prompt
        │
        ▼
Example 1: user  →  "I absolutely love this product!"
Example 1: asst  →  JSON with answer=POSITIVE / sentiment=POSITIVE
Example 2: user  →  "The delivery was late and packaging was damaged."
Example 2: asst  →  JSON with answer=NEGATIVE / sentiment=NEGATIVE
Example 3: user  →  "The package arrived on Tuesday."
Example 3: asst  →  JSON with answer=NEUTRAL / sentiment=NEUTRAL
Example 4: user  →  "The product is okay, I guess."
Example 4: asst  →  JSON with answer=NEUTRAL / sentiment=NEUTRAL
        │
        ▼
Real user message ──► Gemini ──► Zod-validated JSON response
```

The `buildFewShotMessages()` function prepends fixed examples to every turn:

```js
export function buildFewShotMessages(history) {
  return [...FEW_SHOT_EXAMPLES, ...history];
}
```

#### When to use it

- Classification tasks (sentiment, intent, category)
- Enforcing a strict output format (JSON, structured fields)
- Tasks where showing is clearer than telling

---

### 3. Chain-of-thought

**File:** `src/patterns/chain-of-thought.js`

#### What it is

Chain-of-thought (CoT) prompting encourages the model to **work through a
problem step-by-step**, verify its calculations, and put the concise answer and
key steps in the structured response fields.

#### System prompt used

```
You are a methodical reasoning assistant.
Solve the problem carefully, check the calculation, and return the concise final
answer in the answer field. Summarize the key steps and calculations in explanation.
```

#### How it works

```
System prompt (reasoning task and JSON format)
        │
        ▼
1-shot JSON example (anchors the calculation and format)
        │
        ▼
Real user message ──► Gemini works through the calculation ──► JSON answer
```

A single demonstration example is injected to reinforce the format:

```js
export function buildCoTMessages(history) {
  const cotExample = [
    { role: "user", content: "A store sells apples for $0.50 each..." },
    { role: "assistant", content: "{\"answer\":\"$4.00 in change\",\"explanation\":\"12 × $0.50 = $6.00; $10.00 - $6.00 = $4.00.\",\"sentiment\":null,\"confidence\":\"High\"}" }
  ];
  return [...cotExample, ...history];
}
```

#### When to use it

- Arithmetic and multi-step word problems
- Logic puzzles and deduction
- Complex decisions that benefit from an auditable reasoning trail
- Debugging flows where intermediate steps matter

---

## Pattern Comparison

| | Zero-shot | Few-shot | Chain-of-thought |
|---|---|---|---|
| **Examples injected** | None | 4 labelled examples | 1 reasoning example |
| **Best for** | General Q&A | Classification / formatting | Reasoning / maths |
| **Token cost** | Lowest | Medium | Highest |
| **Output format** | Structured JSON | Structured JSON | Structured JSON with key steps |
| **Intended use** | General answers | Classification | Multi-step problem solving |
| **Key mechanism** | Pretrained knowledge | Learning by analogy | Explicit intermediate steps |

## Learning Outcomes & Evaluation Evidence

This project demonstrates the following hands-on learning:

- **Prompting patterns:** implemented zero-shot, few-shot, and step-by-step
  problem-solving prompts and compared when each is useful.
- **Meta-prompting:** added a validated plan-then-answer flow that adapts task
  instructions to the latest conversation turn while preserving each pattern.
- **Structured generation:** designed a strict response contract and validate
  generated JSON at runtime with Zod instead of trusting prompt compliance.
- **Evaluation design:** authored ten cases with explicit criteria and added an
  LLM-as-judge rubric, score threshold, failure categories, and Markdown output.
- **Reliability and testing:** tests validate schema rejection, judge score
  bounds, case count, report output, and the Gemini adapter without requiring a
  live API key. GitHub Actions runs these tests on Node.js 18, 20, and 22.
- **Honest measurement:** model quality is not claimed from synthetic examples
  or from API errors. Only a completed run with judge scores should be treated
  as evaluation evidence; judge scores are qualitative and can themselves be
  wrong.

To reproduce the key-free checks, run `npm ci` and `npm test`. To produce
model-based evidence, configure a valid Gemini key and run `npm run eval`, then
commit the resulting report together with the code/configuration used for that
run. Do not commit API credentials.

---

## Sample Outputs

### Zero-shot

**Prompt:**
```
What is machine learning in one sentence?
```

**Response:**
```
{
  "answer": "Machine learning is a branch of artificial intelligence where systems learn patterns from data to make predictions or decisions.",
  "explanation": "The system improves from examples rather than relying only on explicitly programmed rules.",
  "sentiment": null,
  "confidence": "High"
}
```

---

**Prompt:**
```
Name three benefits of open-source software.
```

**Response:**
```
{
  "answer": "Three benefits are transparency, lower licensing costs, and community-driven improvement.",
  "explanation": "Open code can be audited, free licenses can reduce costs, and a broad contributor base can improve the software.",
  "sentiment": null,
  "confidence": "High"
}
```

---

### Few-shot

**Input:**
```
I waited three weeks and the item still hasn't arrived. Terrible experience!
```

**Response:**
```
{
  "answer": "NEGATIVE",
  "explanation": "The text expresses frustration over a delayed delivery and explicitly describes the experience as 'terrible'.",
  "sentiment": "NEGATIVE",
  "confidence": "High"
}
```

---

**Input:**
```
The coffee was warm and the chair was comfortable.
```

**Response:**
```
{
  "answer": "NEUTRAL",
  "explanation": "The text describes mildly positive conditions in a plain, unenthusiastic way.",
  "sentiment": "NEUTRAL",
  "confidence": "Medium"
}
```

---

**Input:**
```
Five stars! Exceeded every expectation I had.
```

**Response:**
```
{
  "answer": "POSITIVE",
  "explanation": "A five-star rating and 'exceeded every expectation' signal strong satisfaction.",
  "sentiment": "POSITIVE",
  "confidence": "High"
}
```

---

### Chain-of-thought

**Prompt:**
```
If a train travels at 60 mph for 2.5 hours, then at 80 mph for 1.5 hours,
what is the total distance covered?
```

**Response:**
```
{
  "answer": "The train covers a total distance of 270 miles.",
  "explanation": "The first leg is 60 × 2.5 = 150 miles; the second is 80 × 1.5 = 120 miles. Together, 150 + 120 = 270 miles.",
  "sentiment": null,
  "confidence": "High"
}
```

---

**Prompt:**
```
Three friends split a restaurant bill. The food costs $72, tax is 8%,
and they want to tip 20% on the pre-tax amount. How much does each person pay?
```

**Response:**
```
{
  "answer": "Each person pays $30.72.",
  "explanation": "Tax is $5.76 and the pre-tax tip is $14.40, so the total is $92.16. Dividing by 3 gives $30.72.",
  "sentiment": null,
  "confidence": "High"
}
```

---

## License

MIT
