import type { ITurn, IAnalysisEvent } from "../models/Session";

/**
 * Compile a structured clinical report from raw session data.
 * In production, swap buildReport() with an Ollama/Gemini API call.
 */
export function buildReport(
  turns: ITurn[],
  analyses: IAnalysisEvent[],
  patientName = "Patient"
): string {
  const date = new Date().toDateString();
  const exchanges = Math.floor(turns.length / 2);

  // Aggregate moods
  const moods = analyses.map((a) => a.mood).filter(Boolean);
  const avgIntensity =
    analyses.reduce((s, a) => s + (a.mood_intensity || 5), 0) /
    (analyses.length || 1);
  const moodSummary = moods.length
    ? `${[...new Set(moods)].join(", ")} (avg intensity: ${avgIntensity.toFixed(1)}/10)`
    : "Not recorded";

  // Aggregate medicines
  const allMeds = analyses.flatMap((a) => a.medicine_log || []);
  const takenMeds = allMeds.filter((m) => m.status === "taken");
  const missedMeds = allMeds.filter((m) => m.status === "missed");

  // Aggregate forgotten items
  const forgotten = [...new Set(analyses.flatMap((a) => a.forgotten_items || []))];

  // Determine overall mood sentiment
  let assessment = "Stable";
  if (avgIntensity <= 3) assessment = "Concerning — patient may need emotional support.";
  else if (avgIntensity >= 8) assessment = "Positive — patient appears in good spirits.";

  const lines = [
    `DAILY SESSION REPORT`,
    `Date: ${date}`,
    `Patient: ${patientName}`,
    `─────────────────────────────────────────`,
    ``,
    `SUMMARY`,
    `Session had ${exchanges} exchange(s) lasting approx. ${Math.round(analyses.length * 1.5)} minutes.`,
    ``,
    `MOOD & MENTAL STATUS`,
    `Observed moods: ${moodSummary}`,
    ``,
    `MEDICATION STATUS`,
    takenMeds.length
      ? `Taken: ${takenMeds.map((m) => m.name).join(", ")}`
      : "No medications confirmed taken.",
    missedMeds.length
      ? `Missed/Skipped: ${missedMeds.map((m) => m.name).join(", ")}`
      : "",
    ``,
    `NOTABLE OBSERVATIONS`,
    forgotten.length
      ? `Forgotten items mentioned: ${forgotten.join(", ")}`
      : "No notable memory concerns reported.",
    ``,
    `ASSESSMENT`,
    assessment,
    ``,
    `RECOMMENDATIONS`,
    avgIntensity <= 3
      ? "Consider scheduling a follow-up call. Monitor for persistent low mood."
      : "Continue current care plan. Next review at scheduled time.",
    ``,
    `─────────────────────────────────────────`,
    `Note: Self-reported data collected via AI companion. Pending doctor review.`,
  ];

  return lines.filter((l) => l !== undefined).join("\n");
}
