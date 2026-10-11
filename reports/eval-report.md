# W01 Chatbot Evaluation Report

- **Run date:** 2026-10-11T09:08:08.416Z
- **Model:** gemini-2.5-flash
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

Scores are produced by an LLM judge against the criteria defined for each case. A case passes at 4/5 or higher. A generation, JSON parsing, or schema-validation error is recorded as a failure rather than omitted. Cases not attempted after a non-retryable API error are marked NOT RUN and are not assigned a score. Treat judge scores as a qualitative signal; review borderline results and failure explanations before drawing conclusions.
