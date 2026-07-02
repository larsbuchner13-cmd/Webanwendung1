import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedPlan } from "./ruleEngine";

const client = new Anthropic();

const rationaleSchema = {
  type: "object",
  properties: {
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dayIndex: { type: "integer" },
          rationale: { type: "string" },
        },
        required: ["dayIndex", "rationale"],
        additionalProperties: false,
      },
    },
  },
  required: ["days"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `Du bist ein erfahrener Krafttrainings-Coach.
Du erhältst einen bereits fertig strukturierten Trainingsplan als JSON.
Deine einzige Aufgabe: für jeden Trainingstag einen kurzen Rationale-Text (max. 2 Sätze)
schreiben, der erklärt, warum diese Übungsauswahl und -reihenfolge für das genannte Ziel sinnvoll ist.
Die Trainingslogik (Split, Übungsauswahl, Sätze/Wiederholungen) steht bereits fest und darf nicht verändert werden.
Antworte auf Deutsch.`;

export interface DayRationale {
  dayIndex: number;
  rationale: string;
}

export async function generateRationales(params: {
  goal: string;
  level: string;
  plan: GeneratedPlan;
}): Promise<DayRationale[]> {
  const userPrompt = JSON.stringify({
    goal: params.goal,
    level: params.level,
    plan: params.plan.days.map((day) => ({
      dayIndex: day.dayIndex,
      focus: day.focus,
      exercises: day.exercises.map((e) => ({
        name: e.exercise.name,
        muscleGroup: e.exercise.muscleGroup,
        sets: e.sets,
        reps: e.reps,
      })),
    })),
  });

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: rationaleSchema },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  if (!response.parsed_output) {
    throw new Error("Claude hat keine gültige JSON-Antwort geliefert.");
  }

  return (response.parsed_output as { days: DayRationale[] }).days;
}
