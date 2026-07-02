

Readme · MD
# 🏋️ Trainingsplan-Generator
 
KI-gestützter Trainingsplan-Generator für Krafttraining. Nutzer geben Ziel, Erfahrungslevel, Trainingsfrequenz und verfügbares Equipment an und erhalten einen strukturierten, periodisierten Trainingsplan als Wochenübersicht mit PDF-Export.
 
> 💡 **Über dieses Projekt:** Dieses Projekt ist Teil meines Portfolios, mit dem ich praktische Fähigkeiten im Bereich KI-gestützte Automatisierung und Webentwicklung demonstriere. Entstanden ist es mit Unterstützung von [Claude Code](https://claude.com/claude-code) – von der Architekturentscheidung bis zum lokalen Deployment habe ich den gesamten Entwicklungsprozess begleitet, verstanden und dokumentiert.
 
---
 
## Was die App macht
 
1. Nutzer:in beantwortet ein kurzes Onboarding-Formular (Trainingsziel, Erfahrungslevel, Frequenz, verfügbares Equipment)
2. Eine deterministische Regel-Engine berechnet daraus einen passenden Trainingssplit (Ganzkörper / Upper-Lower / Push-Pull-Legs) inklusive Übungsauswahl, Sätzen und Wiederholungen
3. Für jeden Trainingstag generiert Claude (Anthropic API) eine kurze, verständliche Begründung, warum genau diese Übungsauswahl zum Ziel passt
4. Der fertige Plan lässt sich als PDF exportieren
## Architektur
 
Die eigentliche Trainingslogik läuft **nicht** über die KI, sondern über eine nachvollziehbare, deterministische Regel-Engine (`lib/ruleEngine.ts`):
 
- Split-Auswahl anhand der gewählten Trainingstage
- Filterung der Übungsdatenbank (`lib/exerciseDb.ts`) nach Equipment und Erfahrungslevel
- Festlegung von Sätzen/Wiederholungen je nach Trainingsziel
Claude (`lib/claudeClient.ts`) kommt gezielt nur auf der **Kommunikationsebene** zum Einsatz: Der fertige Plan wird als JSON an die API übergeben, die Antwort kommt strukturiert per JSON-Schema zurück und liefert die Rationale-Texte pro Trainingstag. Dieser Zwei-Schritt-Ansatz trennt bewusst nachvollziehbare Logik von KI-generierten Inhalten – ein Muster, das sich gut auf andere KI-Integrationen übertragen lässt.
 
## Tech-Stack
 
- **Frontend/Backend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Datenbank:** Prisma ORM + SQLite
- **KI:** Anthropic API (Claude) für die Rationale-Texte
- **PDF-Export:** pdf-lib
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
 
Ohne `ANTHROPIC_API_KEY` funktioniert die App weiterhin – die Regel-Engine erzeugt den Plan wie gewohnt, nur die Rationale-Texte pro Trainingstag bleiben leer.
 
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
 
## Was ich dabei gelernt habe
 
- Umgang mit Next.js App Router, TypeScript und Prisma in einem produktionsnahen Setup
- Sinnvolle Trennung zwischen deterministischer Geschäftslogik und KI-generierten Inhalten (statt "KI macht alles")
- Strukturierte Ausgaben von LLMs über JSON-Schema statt Freitext-Parsing
- Praktisches Troubleshooting rund um Node.js/npm-Setup, Git-Workflow und Umgebungsvariablen unter Windows
## Kontakt
 
Lars Buchner | [GitHub](https://github.com/larsbuchner13-cmd)
 

