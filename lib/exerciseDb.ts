export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface ExerciseSeed {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  difficulty: Difficulty;
  videoUrl?: string;
}

export const exerciseDb: ExerciseSeed[] = [
  // Chest
  { id: "barbell-bench-press", name: "Langhantel-Bankdrücken", muscleGroup: "chest", equipment: "barbell", difficulty: "intermediate" },
  { id: "dumbbell-bench-press", name: "Kurzhantel-Bankdrücken", muscleGroup: "chest", equipment: "dumbbell", difficulty: "beginner" },
  { id: "incline-dumbbell-press", name: "Schrägbankdrücken mit Kurzhanteln", muscleGroup: "chest", equipment: "dumbbell", difficulty: "intermediate" },
  { id: "cable-crossover", name: "Kabelzug Fliegende", muscleGroup: "chest", equipment: "cable", difficulty: "intermediate" },
  { id: "push-up", name: "Liegestütze", muscleGroup: "chest", equipment: "bodyweight", difficulty: "beginner" },
  { id: "chest-press-machine", name: "Butterfly-Maschine", muscleGroup: "chest", equipment: "machine", difficulty: "beginner" },

  // Back
  { id: "deadlift", name: "Kreuzheben", muscleGroup: "back", equipment: "barbell", difficulty: "advanced" },
  { id: "barbell-row", name: "Langhantelrudern", muscleGroup: "back", equipment: "barbell", difficulty: "intermediate" },
  { id: "pull-up", name: "Klimmzüge", muscleGroup: "back", equipment: "bodyweight", difficulty: "advanced" },
  { id: "lat-pulldown", name: "Latzug", muscleGroup: "back", equipment: "cable", difficulty: "beginner" },
  { id: "one-arm-dumbbell-row", name: "Kurzhantelrudern einarmig", muscleGroup: "back", equipment: "dumbbell", difficulty: "beginner" },
  { id: "seated-cable-row", name: "Rudern sitzend am Kabelzug", muscleGroup: "back", equipment: "cable", difficulty: "intermediate" },

  // Legs
  { id: "back-squat", name: "Kniebeugen", muscleGroup: "legs", equipment: "barbell", difficulty: "intermediate" },
  { id: "leg-press", name: "Beinpresse", muscleGroup: "legs", equipment: "machine", difficulty: "beginner" },
  { id: "dumbbell-lunge", name: "Ausfallschritte mit Kurzhanteln", muscleGroup: "legs", equipment: "dumbbell", difficulty: "beginner" },
  { id: "romanian-deadlift", name: "Rumänisches Kreuzheben", muscleGroup: "legs", equipment: "barbell", difficulty: "intermediate" },
  { id: "leg-extension", name: "Beinstrecker", muscleGroup: "legs", equipment: "machine", difficulty: "beginner" },
  { id: "leg-curl", name: "Beinbeuger", muscleGroup: "legs", equipment: "machine", difficulty: "beginner" },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", muscleGroup: "legs", equipment: "dumbbell", difficulty: "advanced" },
  { id: "calf-raise-machine", name: "Wadenheben an der Maschine", muscleGroup: "legs", equipment: "machine", difficulty: "beginner" },
  { id: "bodyweight-squat", name: "Kniebeugen mit Körpergewicht", muscleGroup: "legs", equipment: "bodyweight", difficulty: "beginner" },

  // Shoulders
  { id: "overhead-press", name: "Schulterdrücken mit Langhantel", muscleGroup: "shoulders", equipment: "barbell", difficulty: "intermediate" },
  { id: "dumbbell-shoulder-press", name: "Kurzhantel-Schulterdrücken", muscleGroup: "shoulders", equipment: "dumbbell", difficulty: "beginner" },
  { id: "lateral-raise", name: "Seitheben", muscleGroup: "shoulders", equipment: "dumbbell", difficulty: "beginner" },
  { id: "cable-face-pull", name: "Face Pulls am Kabelzug", muscleGroup: "shoulders", equipment: "cable", difficulty: "beginner" },
  { id: "shoulder-press-machine", name: "Schulterdrücken an der Maschine", muscleGroup: "shoulders", equipment: "machine", difficulty: "beginner" },

  // Arms
  { id: "barbell-curl", name: "Bizepscurls mit der Langhantel", muscleGroup: "arms", equipment: "barbell", difficulty: "beginner" },
  { id: "dumbbell-curl", name: "Bizepscurls mit Kurzhanteln", muscleGroup: "arms", equipment: "dumbbell", difficulty: "beginner" },
  { id: "cable-triceps-pushdown", name: "Trizepsdrücken am Kabelzug", muscleGroup: "arms", equipment: "cable", difficulty: "beginner" },
  { id: "dip", name: "Dips", muscleGroup: "arms", equipment: "bodyweight", difficulty: "intermediate" },

  // Core
  { id: "plank", name: "Unterarmstütz (Plank)", muscleGroup: "core", equipment: "bodyweight", difficulty: "beginner" },
  { id: "cable-crunch", name: "Cable Crunch", muscleGroup: "core", equipment: "cable", difficulty: "intermediate" },
];
