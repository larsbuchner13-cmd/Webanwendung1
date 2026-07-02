import type { Equipment, ExerciseSeed, MuscleGroup } from "./exerciseDb";

export type Goal = "muscle_gain" | "strength" | "fat_loss" | "general_fitness";
export type Level = "beginner" | "intermediate" | "advanced";

export interface SetsReps {
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface PlannedExercise {
  exercise: ExerciseSeed;
  orderIndex: number;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface PlannedDay {
  dayIndex: number;
  focus: string;
  exercises: PlannedExercise[];
}

export interface GeneratedPlan {
  days: PlannedDay[];
}

/**
 * Split-Auswahl nach Trainingstagen pro Woche.
 * 2-3 Tage -> Ganzkörper, 4 Tage -> Upper/Lower, 5-6 Tage -> Push/Pull/Legs
 */
function selectSplit(daysPerWeek: number): string[] {
  if (daysPerWeek <= 3) {
    return Array.from({ length: daysPerWeek }, () => "Ganzkörper");
  }
  if (daysPerWeek === 4) {
    return ["Upper Body", "Lower Body", "Upper Body", "Lower Body"];
  }
  if (daysPerWeek === 5) {
    return ["Push", "Pull", "Legs", "Push", "Pull"];
  }
  // 6 days
  return ["Push", "Pull", "Legs", "Push", "Pull", "Legs"];
}

const FOCUS_MUSCLE_GROUPS: Record<string, MuscleGroup[]> = {
  Ganzkörper: ["legs", "chest", "back", "shoulders", "arms", "core"],
  "Upper Body": ["chest", "back", "shoulders", "arms"],
  "Lower Body": ["legs", "core"],
  Push: ["chest", "shoulders", "arms"],
  Pull: ["back", "arms"],
  Legs: ["legs", "core"],
};

/**
 * Sätze/Wiederholungen/Pausenzeit je nach Trainingsziel.
 */
function setsRepsForGoal(goal: Goal): SetsReps {
  switch (goal) {
    case "strength":
      return { sets: 4, reps: "3-6", restSeconds: 180 };
    case "muscle_gain":
      return { sets: 4, reps: "8-12", restSeconds: 90 };
    case "fat_loss":
      return { sets: 3, reps: "12-15", restSeconds: 45 };
    case "general_fitness":
      return { sets: 3, reps: "10-12", restSeconds: 60 };
  }
}

const DIFFICULTY_ORDER: Record<Level, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

function exerciseAllowedForLevel(exercise: ExerciseSeed, level: Level): boolean {
  return DIFFICULTY_ORDER[exercise.difficulty] <= DIFFICULTY_ORDER[level];
}

/**
 * Wählt Übungen pro Trainingstag aus der Übungsdatenbank, gefiltert nach
 * verfügbarem Equipment und Trainingslevel. Pro Muskelgruppe im Fokus des Tages
 * wird eine Übung ausgewählt (deterministisch, keine KI beteiligt).
 */
function selectExercisesForDay(
  focus: string,
  equipment: Equipment[],
  level: Level,
  allExercises: ExerciseSeed[],
  usedInWeek: Set<string>,
): ExerciseSeed[] {
  const muscleGroups = FOCUS_MUSCLE_GROUPS[focus] ?? [];
  const selected: ExerciseSeed[] = [];

  for (const muscleGroup of muscleGroups) {
    const candidates = allExercises.filter(
      (e) =>
        e.muscleGroup === muscleGroup &&
        equipment.includes(e.equipment) &&
        exerciseAllowedForLevel(e, level),
    );
    if (candidates.length === 0) continue;

    const fresh = candidates.filter((e) => !usedInWeek.has(e.id));
    const pool = fresh.length > 0 ? fresh : candidates;
    const chosen = pool[0];
    selected.push(chosen);
    usedInWeek.add(chosen.id);
  }

  return selected;
}

export function generatePlan(params: {
  goal: Goal;
  level: Level;
  daysPerWeek: number;
  equipment: Equipment[];
  allExercises: ExerciseSeed[];
}): GeneratedPlan {
  const { goal, level, daysPerWeek, equipment, allExercises } = params;
  const focuses = selectSplit(daysPerWeek);
  const setsReps = setsRepsForGoal(goal);
  const usedInWeek = new Set<string>();

  const days: PlannedDay[] = focuses.map((focus, index) => {
    const exercises = selectExercisesForDay(
      focus,
      equipment,
      level,
      allExercises,
      usedInWeek,
    );

    return {
      dayIndex: index + 1,
      focus,
      exercises: exercises.map((exercise, orderIndex) => ({
        exercise,
        orderIndex,
        sets: setsReps.sets,
        reps: setsReps.reps,
        restSeconds: setsReps.restSeconds,
      })),
    };
  });

  return { days };
}
