import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { prisma } from "@/lib/db";
import {
  GOAL_LABELS,
  LEVEL_LABELS,
  MUSCLE_GROUP_LABELS,
} from "@/lib/labels";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    return NextResponse.json({ error: "Plan nicht gefunden." }, { status: 404 });
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawLine(
    text: string,
    options: { size?: number; usedFont?: PDFFont; color?: [number, number, number]; gap?: number } = {},
  ) {
    const size = options.size ?? 11;
    const usedFont = options.usedFont ?? font;
    const gap = options.gap ?? size + 6;
    ensureSpace(gap);
    page.drawText(text, {
      x: MARGIN,
      y,
      size,
      font: usedFont,
      color: options.color
        ? rgb(...options.color)
        : rgb(0.1, 0.1, 0.1),
    });
    y -= gap;
  }

  drawLine(`Trainingsplan für ${plan.user.name}`, {
    size: 20,
    usedFont: boldFont,
    gap: 30,
  });
  drawLine(
    `${GOAL_LABELS[plan.user.goal] ?? plan.user.goal} · ${
      LEVEL_LABELS[plan.user.level] ?? plan.user.level
    } · ${plan.user.daysPerWeek}x pro Woche · Zyklus ${plan.cycleNumber}`,
    { size: 11, color: [0.35, 0.35, 0.35], gap: 24 },
  );

  if (plan.notes) {
    drawLine(plan.notes, { size: 10, color: [0.3, 0.3, 0.3], gap: 24 });
  }

  for (const day of plan.days) {
    ensureSpace(40);
    drawLine(`Tag ${day.dayIndex}: ${day.focus}`, {
      size: 14,
      usedFont: boldFont,
      gap: 20,
    });

    if (day.rationale) {
      drawLine(day.rationale, {
        size: 9,
        usedFont: italicFont,
        color: [0.4, 0.4, 0.4],
        gap: 18,
      });
    }

    for (const entry of day.entries) {
      const muscleGroup =
        MUSCLE_GROUP_LABELS[entry.exercise.muscleGroup] ??
        entry.exercise.muscleGroup;
      const line = `${entry.exercise.name}  (${muscleGroup}) — ${entry.sets} Sätze x ${entry.reps} Wdh., ${entry.restSeconds}s Pause`;
      drawLine(line, { size: 10, gap: 16 });
    }

    y -= 10;
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="trainingsplan-${plan.user.name}.pdf"`,
    },
  });
}
