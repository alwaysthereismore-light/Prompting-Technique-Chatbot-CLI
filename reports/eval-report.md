# W01 Chatbot Evaluation Report

- **Run date:** 2026-10-11T09:08:08.416Z
- **Chatbot model:** gemini-2.5-flash
- **LLM-as-judge model:** Not recorded (judge was not reached)
- **Meta-prompting:** Not applied
- **Judge strategy:** Use a separately configured, highest-capability Gemini model for evaluation.
- **Cases:** 10
- **Pass threshold:** 4/5
- **Result:** 0 passed, 1 failed, 9 not run

## Pass/fail table

| Case | Pattern | Judge score | Result | Judge commentary |
|---|---|---:|---|---|
| zs-01 | Zero-shot | — | **FAIL** | Gemini request failed with HTTP 404; verify API configuration and retry. |
| zs-02 | Zero-shot | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |
| zs-03 | Zero-shot | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |
| fs-01 | Few-shot | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |
| fs-02 | Few-shot | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |
| fs-03 | Few-shot | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |
| fs-04 | Few-shot | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |
| cot-01 | Chain-of-thought | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |
| cot-02 | Chain-of-thought | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |
| cot-03 | Chain-of-thought | — | **NOT RUN** | Not run because the preceding Gemini request failed with HTTP 404. |

## Failure mode commentary

- **Gemini API error (HTTP 404) (zs-01):** Gemini request failed with HTTP 404; verify API configuration and retry.
- **Not run (zs-02):** Not run because the preceding Gemini request failed with HTTP 404.
- **Not run (zs-03):** Not run because the preceding Gemini request failed with HTTP 404.
- **Not run (fs-01):** Not run because the preceding Gemini request failed with HTTP 404.
- **Not run (fs-02):** Not run because the preceding Gemini request failed with HTTP 404.
- **Not run (fs-03):** Not run because the preceding Gemini request failed with HTTP 404.
- **Not run (fs-04):** Not run because the preceding Gemini request failed with HTTP 404.
- **Not run (cot-01):** Not run because the preceding Gemini request failed with HTTP 404.
- **Not run (cot-02):** Not run because the preceding Gemini request failed with HTTP 404.
- **Not run (cot-03):** Not run because the preceding Gemini request failed with HTTP 404.

## Interpretation

This historical run predates the plan-then-answer meta-prompting implementation and failed before a judge request, so it contains no LLM-as-judge scores or generated plans. The chosen evaluation policy is to use a separate, highest-capability Gemini model as judge; the exact judge model is configured with `GEMINI_JUDGE_MODEL` and recorded on completed future runs. A case passes at 4/5 or higher. A generation, JSON parsing, or schema-validation error is recorded as a failure rather than omitted. Cases not attempted after a non-retryable API error are marked NOT RUN and are not assigned a score. Treat judge scores as a qualitative signal; review borderline results and failure explanations before drawing conclusions.
