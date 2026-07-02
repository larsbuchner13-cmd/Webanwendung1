import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generatePlan } from "@/lib/ruleEngine";
import type { Equipment as EquipmentType, ExerciseSeed } from "@/lib/exerciseDb";
import { generateRationales } from "@/lib/claudeClient";
import { GOAL_LABELS, LEVEL_LABELS } from "@/lib/labels";

const requestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  goal: z.enum(["muscle_gain", "strength", "fat_loss", "general_fitness"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(2).max(6),
  equipment: z
    .array(z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight"]))
    .min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, goal, level, daysPerWeek, equipment } = parsed.data;

  const allExercises = await prisma.exercise.findMany();
  if (allExercises.length === 0) {
    return NextResponse.json(
      {
        error:
          "Die Übungsdatenbank ist leer. Bitte zuerst `npm run db:seed` ausführen.",
      },
      { status: 500 },
    );
  }

  const plan = generatePlan({
    goal,
    level,
    daysPerWeek,
    equipment: equipment as EquipmentType[],
    allExercises: allExercises as ExerciseSeed[],
  });

  let rationales: { dayIndex: number; rationale: string }[] = [];
  try {
    rationales = await generateRationales({ goal, level, plan });
  } catch (err) {
    console.error("Claude rationale generation failed:", err);
  }
  const rationaleByDay = new Map(rationales.map((r) => [r.dayIndex, r.rationale]));

  const user = await prisma.user.create({
    data: {
      name,
      goal,
      level,
      daysPerWeek,
      equipment: equipment.join(","),
    },
  });

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7 * 6);

  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      userId: user.id,
      cycleNumber: 1,
      startDate,
      endDate,
      notes: `Trainingsplan für ${name}: Ziel "${GOAL_LABELS[goal]}", Level "${LEVEL_LABELS[level]}", ${daysPerWeek}x pro Woche.`,
      days: {
        create: plan.days.map((day) => ({
          dayIndex: day.dayIndex,
          focus: day.focus,
          rationale: rationaleByDay.get(day.dayIndex) ?? null,
          entries: {
            create: day.exercises.map((entry) => ({
              exerciseId: entry.exercise.id,
              sets: entry.sets,
              reps: entry.reps,
              restSeconds: entry.restSeconds,
              orderIndex: entry.orderIndex,
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json({ planId: workoutPlan.id });
}
