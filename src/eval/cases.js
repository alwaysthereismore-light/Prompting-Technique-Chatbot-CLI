import {
  COT_SYSTEM,
  buildCoTMessages,
} from "../patterns/chain-of-thought.js";
import {
  FEW_SHOT_SYSTEM,
  buildFewShotMessages,
} from "../patterns/few-shot.js";
import {
  ZERO_SHOT_SYSTEM,
  buildZeroShotMessages,
} from "../patterns/zero-shot.js";

export const EVAL_CASES = [
  {
    id: "zs-01",
    pattern: "Zero-shot",
    input: "In one sentence, what is machine learning?",
    criteria:
      "Explain that machine learning systems learn patterns from data and use them to make predictions or decisions.",
    system: ZERO_SHOT_SYSTEM,
    build: buildZeroShotMessages,
  },
  {
    id: "zs-02",
    pattern: "Zero-shot",
    input: "Translate 'Hello, how are you?' into French.",
    criteria:
      "Provide a correct natural French translation, such as 'Bonjour, comment allez-vous?' or the informal equivalent.",
    system: ZERO_SHOT_SYSTEM,
    build: buildZeroShotMessages,
  },
  {
    id: "zs-03",
    pattern: "Zero-shot",
    input: "Name three distinct benefits of open-source software.",
    criteria:
      "Name three distinct and plausible benefits, such as transparency, lower licensing costs, customizability, or community collaboration.",
    system: ZERO_SHOT_SYSTEM,
    build: buildZeroShotMessages,
  },
  {
    id: "fs-01",
    pattern: "Few-shot",
    input:
      'Classify this text: "I absolutely love the new design; it is brilliant!"',
    criteria:
      "Classify the text as POSITIVE, include the same sentiment in the sentiment field, and give a fitting concise explanation.",
    system: FEW_SHOT_SYSTEM,
    build: buildFewShotMessages,
  },
  {
    id: "fs-02",
    pattern: "Few-shot",
    input:
      'Classify this text: "The app crashes every time I open it. Completely unusable."',
    criteria:
      "Classify the text as NEGATIVE, include the same sentiment in the sentiment field, and give a fitting concise explanation.",
    system: FEW_SHOT_SYSTEM,
    build: buildFewShotMessages,
  },
  {
    id: "fs-03",
    pattern: "Few-shot",
    input: 'Classify this text: "The package arrived on Tuesday."',
    criteria:
      "Classify this factual, emotionally neutral text as NEUTRAL in both answer and sentiment.",
    system: FEW_SHOT_SYSTEM,
    build: buildFewShotMessages,
  },
  {
    id: "fs-04",
    pattern: "Few-shot",
    input:
      'Classify this text: "It works fine, but nothing about it stands out."',
    criteria:
      "Recognize the mild mixed/ambivalent wording as NEUTRAL rather than strongly positive or negative; answer and sentiment must agree.",
    system: FEW_SHOT_SYSTEM,
    build: buildFewShotMessages,
  },
  {
    id: "cot-01",
    pattern: "Chain-of-thought",
    input:
      "A train travels at 60 mph for 2.5 hours and then at 80 mph for 1.5 hours. What total distance does it cover?",
    criteria:
      "Calculate 60 × 2.5 = 150 miles and 80 × 1.5 = 120 miles, then give a total of 270 miles.",
    system: COT_SYSTEM,
    build: buildCoTMessages,
  },
  {
    id: "cot-02",
    pattern: "Chain-of-thought",
    input:
      "Three friends split a $72 food bill. Tax is 8% of the food cost and the tip is 20% of the pre-tax food cost. How much does each pay?",
    criteria:
      "Compute tax as $5.76 and tip as $14.40, total as $92.16, and each share as $30.72.",
    system: COT_SYSTEM,
    build: buildCoTMessages,
  },
  {
    id: "cot-03",
    pattern: "Chain-of-thought",
    input:
      "A $40 item is discounted by 25%, then 10% sales tax is applied to the discounted price. What is the final price?",
    criteria:
      "Apply the discount first ($30), then tax ($3), and give a final price of $33.",
    system: COT_SYSTEM,
    build: buildCoTMessages,
  },
];
