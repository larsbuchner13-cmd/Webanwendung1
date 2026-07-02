import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  GOAL_LABELS,
  LEVEL_LABELS,
  MUSCLE_GROUP_LABELS,
} from "@/lib/labels";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const plan = await prisma.workoutPlan.findUnique({
    where: { id },
    include: {
      user: true,
      days: {
        orderBy: { dayIndex: "asc" },
        include: {
          entries: {
            orderBy: { orderIndex: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  });

  if (!plan) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Trainingsplan für {plan.user.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {GOAL_LABELS[plan.user.goal] ?? plan.user.goal} ·{" "}
            {LEVEL_LABELS[plan.user.level] ?? plan.user.level} ·{" "}
            {plan.user.daysPerWeek}x pro Woche · Zyklus {plan.cycleNumber}
          </p>
        </div>
        <a
          href={`/api/plan/${plan.id}/pdf`}
          className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Als PDF exportieren
        </a>
      </div>

      {plan.notes && (
        <p className="rounded-md bg-neutral-100 p-4 text-sm text-neutral-700">
          {plan.notes}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {plan.days.map((day) => (
          <section
            key={day.id}
            className="rounded-lg border border-neutral-200 p-5"
          >
            <h2 className="text-lg font-semibold">
              Tag {day.dayIndex}: {day.focus}
            </h2>
            {day.rationale && (
              <p className="mt-1 text-sm italic text-neutral-600">
                {day.rationale}
              </p>
            )}

            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-2 pr-2 font-medium">Übung</th>
                  <th className="py-2 pr-2 font-medium">Muskelgruppe</th>
                  <th className="py-2 pr-2 font-medium">Sätze</th>
                  <th className="py-2 pr-2 font-medium">Wdh.</th>
                  <th className="py-2 font-medium">Pause</th>
                </tr>
              </thead>
              <tbody>
                {day.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-2">{entry.exercise.name}</td>
                    <td className="py-2 pr-2 text-neutral-600">
                      {MUSCLE_GROUP_LABELS[entry.exercise.muscleGroup] ??
                        entry.exercise.muscleGroup}
                    </td>
                    <td className="py-2 pr-2">{entry.sets}</td>
                    <td className="py-2 pr-2">{entry.reps}</td>
                    <td className="py-2">{entry.restSeconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>

      <Link href="/" className="text-sm text-neutral-600 underline">
        Neuen Plan erstellen
      </Link>
    </main>
  );
}
