# Trainingsplan-Generator

KI-gestützter Trainingsplan-Generator für Krafttraining. Nutzer geben Ziel,
Erfahrungslevel, Trainingsfrequenz und verfügbares Equipment an und erhalten
einen strukturierten, periodisierten Trainingsplan als Wochenübersicht mit
PDF-Export.

## Architektur

Die Trainingslogik ist eine deterministische Regel-Engine (`lib/ruleEngine.ts`):
Sie wählt den Split (Ganzkörper / Upper-Lower / Push-Pull-Legs) anhand der
Trainingstage, filtert Übungen aus der statischen Übungsdatenbank
(`lib/exerciseDb.ts`) nach Equipment und Level, und legt Sätze/Wiederholungen
je nach Ziel fest.

Claude (`lib/claudeClient.ts`) wird **nicht** zur Erstellung der Trainingslogik
verwendet, sondern ausschließlich, um für jeden Trainingstag eine
kurze Begründung zu formulieren, warum die gewählte Übungsauswahl für das
Trainingsziel sinnvoll ist. Der bereits fertige Plan wird dafür als JSON an
Claude übergeben; die Antwort wird über `output_config.format` (JSON-Schema)
strukturiert zurückgegeben. Dieser Zwei-Schritt-Ansatz hält die Trainingslogik
nachvollziehbar und konsistent, während die KI gezielt für die
Kommunikationsebene eingesetzt wird.

## Tech-Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite
- Anthropic API (Claude) für Rationale-Texte
- pdf-lib für den PDF-Export

## Setup

```bash
npm install
cp .env.example .env
# ANTHROPIC_API_KEY in .env eintragen
npx prisma db push
npm run db:seed
npm run dev
```

Die App läuft danach unter [http://localhost:3000](http://localhost:3000).

Ohne `ANTHROPIC_API_KEY` funktioniert die App weiterhin — die Regel-Engine
erzeugt den Plan wie gewohnt, nur die Rationale-Texte pro Trainingstag bleiben
leer.

## Projektstruktur

```
app/
  page.tsx                 # Onboarding-Formular
  plan/[id]/page.tsx       # Plan-Anzeige als Wochenübersicht
  api/
    generate-plan/route.ts # Regel-Engine + Claude-Aufruf + Persistenz
    plan/[id]/pdf/route.ts # PDF-Export
lib/
  ruleEngine.ts             # Split-Auswahl, Sätze/Wdh-Logik (reiner Code)
  exerciseDb.ts             # Statische Übungsdatenbank
  claudeClient.ts           # Anthropic API Wrapper für Rationale-Texte
  labels.ts                 # Deutsche Anzeige-Labels
  db.ts                     # Prisma Client
prisma/
  schema.prisma
  seed.ts
```
