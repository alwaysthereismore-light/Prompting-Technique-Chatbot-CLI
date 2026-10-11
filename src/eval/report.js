function escapeTableCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll(/\s+/g, " ").trim();
}

export function renderReport(
  results,
  {
    chatbotModel,
    judgeModel,
    metaPrompting = true,
    threshold = 4,
    date,
  } = {}
) {
  const passed = results.filter(
    (result) => result.score !== null && result.score >= threshold
  ).length;
  const failed = results.filter(
    (result) =>
      !result.notRun && (result.score === null || result.score < threshold)
  ).length;
  const notRun = results.filter((result) => result.notRun).length;
  const failures = results.filter(
    (result) =>
      result.notRun || result.score === null || result.score < threshold
  );

  const rows = results
    .map((result) => {
      const status = result.notRun
        ? "NOT RUN"
        : result.score !== null && result.score >= threshold
        ? "PASS"
        : "FAIL";
      const score = result.score === null ? "—" : `${result.score}/5`;
      const notes = result.error ?? result.rationale ?? "No judge rationale.";
      return `| ${escapeTableCell(result.id)} | ${escapeTableCell(
        result.pattern
      )} | ${score} | **${status}** | ${escapeTableCell(notes)} |`;
    })
    .join("\n");

  const failureCommentary = failures.length
    ? failures
        .map((result) => {
          const category =
            result.failureMode ??
            (result.error ? "Generation or schema validation" : "Uncategorized");
          const detail = result.error ?? result.rationale;
          const label = result.notRun ? "Not run" : category;
          return `- **${escapeTableCell(label)} (${escapeTableCell(
            result.id
          )}):** ${escapeTableCell(detail ?? "No details recorded.")}`;
        })
        .join("\n")
    : "No failure modes were observed in this run.";
  const plans = results.filter((result) => result.plan);
  const planCommentary = plans.length
    ? plans
        .map(
          (result) =>
            `- **${escapeTableCell(result.id)}:** ${escapeTableCell(
              result.plan.task
            )} Instructions: ${result.plan.instructions
              .map(escapeTableCell)
              .join("; ")}`
        )
        .join("\n")
    : "No meta-prompt plans were generated in this run.";

  return `# W01 Chatbot Evaluation Report

- **Run date:** ${date ?? new Date().toISOString()}
- **Chatbot model:** ${chatbotModel ?? "Not recorded"}
- **LLM-as-judge model:** ${judgeModel ?? "Not recorded"}
- **Meta-prompting:** ${metaPrompting ? "Enabled" : "Not applied"}
- **Judge strategy:** Use a separately configured, highest-capability Gemini model for evaluation.
- **Cases:** ${results.length}
- **Pass threshold:** ${threshold}/5
- **Result:** ${passed} passed, ${failed} failed, ${notRun} not run

## Pass/fail table

| Case | Pattern | Judge score | Result | Judge commentary |
|---|---|---:|---|---|
${rows}

## Generated meta-prompt plans

${planCommentary}

## Failure mode commentary

${failureCommentary}

## Interpretation

Scores are produced by an LLM judge against the criteria defined for each case. A case passes at ${threshold}/5 or higher. A generation, JSON parsing, or schema-validation error is recorded as a failure rather than omitted. Cases not attempted after a non-retryable API error are marked NOT RUN and are not assigned a score. Treat judge scores as a qualitative signal; review borderline results and failure explanations before drawing conclusions.
`;
}
