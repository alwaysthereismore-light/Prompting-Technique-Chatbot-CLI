import { z } from "zod";

export const SentimentSchema = z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]);
export const ConfidenceSchema = z.enum(["High", "Medium", "Low"]);

export const ChatResponseSchema = z
  .object({
    answer: z.string().trim().min(1),
    explanation: z.string().trim().min(1),
    sentiment: SentimentSchema.nullable(),
    confidence: ConfidenceSchema.nullable(),
  })
  .strict();

export const JudgeResponseSchema = z
  .object({
    score: z.number().int().min(1).max(5),
    rationale: z.string().trim().min(1),
    failureMode: z.string().trim().min(1).nullable(),
  })
  .strict();

export const CHAT_OUTPUT_INSTRUCTIONS = `Return exactly one valid JSON object and no markdown fences or surrounding text.
Use this exact shape:
{"answer":"the direct answer","explanation":"a concise explanation or key calculation steps","sentiment":null,"confidence":"High"}
For general answers, set sentiment to null. For sentiment classification, set sentiment to POSITIVE, NEGATIVE, or NEUTRAL. Confidence must be High, Medium, or Low. Always include every key.`;

export const JUDGE_OUTPUT_INSTRUCTIONS = `Return exactly one valid JSON object and no markdown fences or surrounding text.
Use this exact shape:
{"score":4,"rationale":"why this response meets or misses the case criteria","failureMode":null}
Score the answer from 1 (incorrect or unusable) to 5 (fully correct and follows the task). Use failureMode=null when there is no meaningful failure; otherwise provide a concise failure category.`;
