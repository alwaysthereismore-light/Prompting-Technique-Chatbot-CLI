# 🤖 Prompting Technique Chatbot CLI

A command-line chatbot powered by the **Claude API** that demonstrates three core prompting techniques: **Zero-shot**, **Few-shot**, and **Chain-of-thought**. Built as part of the [IntelliForge 12-Week AI Engineering Cohort](https://upskill.intelliforge.tech).

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
- [Sample Outputs](#sample-outputs)

---

## Overview

| Feature | Detail |
|---|---|
| **Model** | `claude-3-5-haiku-20241022` |
| **Runtime** | Node.js 18+ (ESM) |
| **API** | Anthropic Claude API |
| **Interface** | Interactive CLI with colour output |

The chatbot loads with a **custom system prompt** per pattern, shaping Claude's persona and output format before any user message is sent. All three patterns share the same underlying API client — only the system prompt and message construction differ.

---

## Project Structure

```
prompting-technique-chatbot-cli/
├── src/
│   ├── index.js                    # Interactive CLI entry point
│   ├── client.js                   # Anthropic SDK wrapper + chat() helper
│   ├── ui.js                       # ANSI colours, banner, readline helpers
│   └── patterns/
│       ├── zero-shot.js            # Zero-shot pattern + standalone demo
│       ├── few-shot.js             # Few-shot pattern + standalone demo
│       └── chain-of-thought.js     # Chain-of-thought pattern + standalone demo
├── .env.example                    # API key template
├── .gitignore
├── package.json
└── README.md
```

---

## Setup & Installation

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/Prompting-Technique-Chatbot-CLI.git
cd Prompting-Technique-Chatbot-CLI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Anthropic API key

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

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
User message ──► Claude ──► Response
```

The `buildZeroShotMessages()` function simply passes the raw conversation history — no injection of examples:

```js
export function buildZeroShotMessages(history) {
  return history;
}
```

#### When to use it

- General Q&A, summarisation, translation
- When the task is straightforward and well within Claude's training
- When token efficiency matters (cheapest pattern)

---

### 2. Few-shot

**File:** `src/patterns/few-shot.js`

#### What it is

Few-shot prompting **injects labelled input→output examples** into the message history before the user's real question. The model learns the expected format and decision logic by analogy, without any explicit rules.

#### System prompt used

```
You are a precise sentiment analysis assistant.
Classify every piece of text as POSITIVE, NEGATIVE, or NEUTRAL.
Always respond in exactly this format:
  Sentiment: <POSITIVE|NEGATIVE|NEUTRAL>
  Confidence: <High|Medium|Low>
  Reason: <one concise sentence>
```

#### How it works

```
System prompt
        │
        ▼
Example 1: user  →  "I absolutely love this product!"
Example 1: asst  →  Sentiment: POSITIVE / Confidence: High / Reason: ...
Example 2: user  →  "The delivery was late and packaging was damaged."
Example 2: asst  →  Sentiment: NEGATIVE / Confidence: High / Reason: ...
Example 3: user  →  "The package arrived on Tuesday."
Example 3: asst  →  Sentiment: NEUTRAL / Confidence: High / Reason: ...
Example 4: user  →  "The product is okay, I guess."
Example 4: asst  →  Sentiment: NEUTRAL / Confidence: Medium / Reason: ...
        │
        ▼
Real user message ──► Claude ──► Response in exact format
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

Chain-of-thought (CoT) prompting instructs the model to **reason step-by-step** before giving its final answer. Intermediate reasoning is wrapped in `<thinking>` tags, followed by a `Final Answer:` section. This dramatically improves accuracy on multi-step problems.

#### System prompt used

```
You are a methodical reasoning assistant.
For EVERY question you receive, you MUST follow this exact structure:

<thinking>
Step 1: [Identify what is being asked]
Step 2: [Break down the problem into smaller parts]
Step 3: [Work through each part carefully]
Step 4: [Verify your reasoning]
</thinking>

Final Answer: [Your concise, direct answer based on the reasoning above]

Do not skip the thinking steps, even for simple questions. Show all your work.
```

#### How it works

```
System prompt (reasoning format mandate)
        │
        ▼
1-shot CoT example (anchors the format)
        │
        ▼
Real user message ──► Claude reasons step-by-step ──► Final Answer
```

A single demonstration example is injected to reinforce the format:

```js
export function buildCoTMessages(history) {
  const cotExample = [
    { role: "user", content: "A store sells apples for $0.50 each..." },
    { role: "assistant", content: "<thinking>\nStep 1: ...\n</thinking>\n\nFinal Answer: ..." }
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
| **Output format** | Free-form | Strictly structured | Structured (thinking + answer) |
| **Accuracy on logic** | Baseline | Baseline | Significantly higher |
| **Key mechanism** | Pretrained knowledge | Learning by analogy | Explicit intermediate steps |

---

## Sample Outputs

### Zero-shot

**Prompt:**
```
What is machine learning in one sentence?
```

**Response:**
```
Machine learning is a branch of artificial intelligence where systems learn
from data to identify patterns and make decisions with minimal human
intervention, improving their performance over time without being explicitly
programmed for each task.
```

---

**Prompt:**
```
Name three benefits of open-source software.
```

**Response:**
```
1. Transparency — the source code is publicly auditable, making it easier
   to identify security vulnerabilities and verify behaviour.
2. Cost — most open-source software is free to use, reducing licensing costs
   for individuals and organisations.
3. Community-driven improvement — a global community of contributors can
   report bugs, add features, and maintain the project faster than a single
   vendor typically can.
```

---

### Few-shot

**Input:**
```
I waited three weeks and the item still hasn't arrived. Terrible experience!
```

**Response:**
```
Sentiment: NEGATIVE
Confidence: High
Reason: The text expresses frustration over a delayed delivery and explicitly
        describes the experience as "terrible".
```

---

**Input:**
```
The coffee was warm and the chair was comfortable.
```

**Response:**
```
Sentiment: NEUTRAL
Confidence: Medium
Reason: The text describes mildly positive physical conditions but uses
        plain, unenthusiastic language with no strong emotion.
```

---

**Input:**
```
Five stars! Exceeded every expectation I had.
```

**Response:**
```
Sentiment: POSITIVE
Confidence: High
Reason: A five-star rating combined with "exceeded every expectation"
        signals strong, unambiguous satisfaction.
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
<thinking>
Step 1: Identify what is being asked — calculate the total distance of a
        two-leg train journey.
Step 2: Break it down into two separate distance calculations, then sum them.
Step 3: Work through each part:
  Leg 1: 60 mph × 2.5 hours = 150 miles
  Leg 2: 80 mph × 1.5 hours = 120 miles
  Total: 150 + 120 = 270 miles
Step 4: Verify — 60 × 2.5 = 150 ✓  80 × 1.5 = 120 ✓  150 + 120 = 270 ✓
</thinking>

Final Answer: The train covers a total distance of 270 miles.
```

---

**Prompt:**
```
Three friends split a restaurant bill. The food costs $72, tax is 8%,
and they want to tip 20% on the pre-tax amount. How much does each person pay?
```

**Response:**
```
<thinking>
Step 1: Find the total bill including tax and tip, then divide by 3.
Step 2: Three calculations needed — tax amount, tip amount, total, then split.
Step 3:
  Tax:   $72.00 × 0.08 = $5.76
  Tip:   $72.00 × 0.20 = $14.40
  Total: $72.00 + $5.76 + $14.40 = $92.16
  Split: $92.16 ÷ 3 = $30.72
Step 4: Verify — 30.72 × 3 = 92.16 ✓  72 + 5.76 + 14.40 = 92.16 ✓
</thinking>

Final Answer: Each person pays $30.72.
```

---

## License

MIT
