import type { ITurn, IAnalysisEvent } from "../models/Session";
import { Patient } from "../models/Patient";
import { Session } from "../models/Session";
import { Report } from "../models/Report";

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
  const missedMeds = allMeds.filter((m) => m.status === "missed" || m.status === "skipped");

  // Get unique names of taken medicines
  const takenNames = [...new Set(takenMeds.map((m) => m.name))];
  
  // Get unique names of missed/skipped medicines, excluding those that were taken
  const missedNames = [...new Set(missedMeds.map((m) => m.name))].filter(
    (name) => !takenNames.includes(name)
  );

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
    takenNames.length
      ? `Taken: ${takenNames.join(", ")}`
      : "No medications confirmed taken.",
    missedNames.length
      ? `Missed/Skipped: ${missedNames.join(", ")}`
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

export async function generateDailyReportWithGemini(
  patientName: string,
  sessions: any[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey.includes("CHANGE_THIS")) {
    console.log("[Gemini] API Key not set. Falling back to template-based report.");
    // Combine turns and analyses from all sessions to pass to fallback
    const allTurns = sessions.flatMap((s) => s.turns || []);
    const allAnalyses = sessions.flatMap((s) => s.analyses || []);
    return buildReport(allTurns, allAnalyses, patientName);
  }

  // Aggregate sessions for the prompt
  const sessionData = sessions.map((s, idx) => ({
    sessionNum: idx + 1,
    time: new Date(s.startedAt).toLocaleTimeString(),
    turns: s.turns?.map((t: any) => `${t.role.toUpperCase()}: ${t.content}`) || [],
    analyses: s.analyses || [],
  }));

  const prompt = `
You are an expert AI clinical assistant for Careplus. Your job is to analyze the daily conversation history of a patient named "${patientName}" collected from their AI health companion bot.

Here is the conversation history of the patient today:
${JSON.stringify(sessionData, null, 2)}

Please generate a professional DAILY CLINICAL REPORT summarizing the patient's status today.
Include the following structured sections:
1. DAILY SUMMARY (Provide a high-level summary of the discussions, frequency of chats, and overall tone).
2. MOOD & MENTAL STATUS (Identify observed moods, anxiety levels, and any noticeable mental distress or positive mood states).
3. MEDICATION ADHERENCE (Specify which medications they confirmed taking, missed, or skipped. Provide counts).
4. NOTABLE CLINICAL OBSERVATIONS (Note any confusion, memory lapses, physical symptoms reported, or cognitive concerns).
5. ASSESSMENT (Stable, Positive, or Concerning - give a professional justification).
6. RECOMMENDATIONS (Actionable suggestions for the caregiver/guardian or doctor, such as follow-up calls or adjusting check-in routines).

Keep the report professional, concise, readable, and highly actionable. Return only the report text. Do not include extra conversational filler.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const result = (await response.json()) as any;
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return text.trim();
    }
    throw new Error("Invalid response format from Gemini API");
  } catch (err) {
    console.error("[Gemini] Error generating report via API:", err);
    console.log("[Gemini] Falling back to template-based report.");
    const allTurns = sessions.flatMap((s) => s.turns || []);
    const allAnalyses = sessions.flatMap((s) => s.analyses || []);
    return buildReport(allTurns, allAnalyses, patientName);
  }
}

export async function generateDailyReportsForToday(): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const startOfToday = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);

  console.log(`[Daily Report] Starting daily report generation for date: ${dateStr}...`);

  const patients = await Patient.find();
  for (const patient of patients) {
    if (!patient.botId) continue;

    // Find all sessions for this patient from today (local time)
    const sessions = await Session.find({
      patientId: patient._id,
      startedAt: { $gte: startOfToday, $lte: endOfToday }
    });

    if (sessions.length === 0) {
      console.log(`[Daily Report] No sessions today for patient ${patient.name} (${patient.botId}). Skipping.`);
      continue;
    }

    console.log(`[Daily Report] Found ${sessions.length} sessions for patient ${patient.name}. Generating summary...`);

    const summaryText = await generateDailyReportWithGemini(patient.name, sessions);

    // Aggregate analyses (moods, medicine logs) from all sessions today
    const aggregatedAnalyses = sessions.flatMap((s) => s.analyses || []);

    // Create or update the Report document
    await Report.findOneAndUpdate(
      { patientId: patient._id, date: dateStr },
      {
        botId: patient.botId,
        patientId: patient._id,
        date: dateStr,
        summary: summaryText,
        analyses: aggregatedAnalyses,
        reportStatus: "pending", // Doctor must approve this report
      },
      { upsert: true, new: true }
    );

    console.log(`[Daily Report] Generated and saved report for ${patient.name} (${dateStr})`);
  }
}


