import { PrismaClient } from "@prisma/client";
import { exerciseDb } from "../lib/exerciseDb";

const prisma = new PrismaClient();

async function main() {
  for (const exercise of exerciseDb) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: exercise,
      create: exercise,
    });
  }
  console.log(`Seeded ${exerciseDb.length} exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
