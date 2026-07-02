"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const GOALS = [
  { value: "muscle_gain", label: "Muskelaufbau" },
  { value: "strength", label: "Kraftsteigerung" },
  { value: "fat_loss", label: "Fettabbau" },
  { value: "general_fitness", label: "Allgemeine Fitness" },
];

const LEVELS = [
  { value: "beginner", label: "Anfänger" },
  { value: "intermediate", label: "Fortgeschritten" },
  { value: "advanced", label: "Erfahren" },
];

const EQUIPMENT_OPTIONS = [
  { value: "barbell", label: "Langhantel" },
  { value: "dumbbell", label: "Kurzhanteln" },
  { value: "machine", label: "Maschinen" },
  { value: "cable", label: "Kabelzug" },
  { value: "bodyweight", label: "Körpergewicht" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("muscle_gain");
  const [level, setLevel] = useState("beginner");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [equipment, setEquipment] = useState<string[]>(["bodyweight"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleEquipment(value: string) {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (equipment.length === 0) {
      setError("Bitte wähle mindestens ein Equipment aus.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, goal, level, daysPerWeek, equipment }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Der Plan konnte nicht erstellt werden.");
      }

      const data = await res.json();
      router.push(`/plan/${data.planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Trainingsplan-Generator</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Beantworte ein paar Fragen und erhalte einen strukturierten,
          periodisierten Krafttrainingsplan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="z. B. Alex"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="goal" className="text-sm font-medium">
            Trainingsziel
          </label>
          <select
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="level" className="text-sm font-medium">
            Erfahrungslevel
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="daysPerWeek" className="text-sm font-medium">
            Trainingstage pro Woche: {daysPerWeek}
          </label>
          <input
            id="daysPerWeek"
            type="range"
            min={2}
            max={6}
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Verfügbares Equipment</span>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={equipment.includes(opt.value)}
                  onChange={() => toggleEquipment(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Plan wird erstellt…" : "Trainingsplan erstellen"}
        </button>
      </form>
    </main>
  );
}
