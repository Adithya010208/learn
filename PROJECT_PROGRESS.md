# PROJECT_PROGRESS.md — AI Personal Learning Manager (AetherLearn)

## 1. Project Overview
**AetherLearn** is a complete, autonomous AI Personal Learning Manager engineered for a Computer Science undergraduate targeting **Product-Based Software Company Placement (2029 Graduation)** as the primary objective and **GATE CSE** as the backup objective, alongside **DSA & Competitive Programming**, **Full-Stack Development** (Active Main Technical Skill Track), **Cybersecurity** (Queued), **AI/ML** (Queued), **Japanese (JLPT N5)**, and **English Communication**.

## 2. Three-Layer Independent Architecture
- **Layer 1 — Schedule Management (`src/layers/layer1Schedule.ts`)**:
  - Owns Working Day (20 slots, 5:00 AM–10:00 PM, 7h sleep protection, 60m academic limit = 15m morning + 45m evening, 5m arrival buffer, 7:00 AM–5:00 PM college commitment lock), Holiday (22 slots, 6:00 AM–10:00 PM, 8h sleep protection, 30m weekly revision), and Exam Mode (15 slots, 7.5h sleep protection) templates.
  - Owns Date-Wise Mode Assignments (`Default = Working Day`, never assuming Mon–Fri are Working Days or weekends are Holidays), multi-date and date-range mode assignment preview & confirmation, Holiday CSV file import with duplicate/invalid/conflict detection, and Exam Mode snapshot & automatic post-exam restoration.
  - Publishes `Layer1PublishedAvailability` to Layer 2.
- **Layer 2 — Learning Intelligence (`src/layers/layer2Learning.ts`)**:
  - Owns 8 Goal Roadmaps, distinguishing `OFFICIAL_SYLLABUS` (GATE CSE, JLPT N5) from `CURATED_ROADMAP` and `AI_GENERATED`.
  - Enforces the **One-Main-Skill-at-a-Time Rule** across Full-Stack, Cybersecurity, and AI/ML.
  - Autonomous Topic Sequencer (`selectAutonomousDailySessions`) consuming Layer 1 availability and Layer 3 skill-gap signals.
  - 10-Step Structured AI Tutor lessons (Concept Intro, Simple Explanation, Analogy, Worked Example, Step-by-Step Demo, Code/Dry-Run/Test-Cases/Complexity or Theoretical Definitions/Comparisons/Diagram, Guided Exercise, Independent Exercise, Assessment Quiz, Mistake Analysis & SM-2 Revision Recommendation).
  - Evidence-Based Mastery Engine (`evaluateAssessmentAndMastery`) requiring quiz accuracy >= 80% AND completed practical exercise before marking `MASTERED`.
  - Continuous Learning specialization unlocker (`checkAndUnlockContinuousLearning`) and Missed Session Recovery Engine (`planMissedSessionRecovery`).
- **Layer 3 — Career Growth & Outcomes (`src/layers/layer3Career.ts`)**:
  - Evaluates verified Layer 2 mastery and project evidence across 6 Placement Readiness dimensions, GATE CSE subjects, Competitive Programming patterns/contests, Japanese (JLPT N5), and English Communication.
  - Skill-Gated Project Recommendation Engine (`evaluateProjectReadiness`) and closed-loop `SkillGapRecommendationContract` feedback to Layer 2.

## 3. Development Phases & Status
- **Current Phase**: Completed — All 12 Phases Verified & Ready for Delivery.
- **Completed Phases**:
  - [x] Step 0 — Repository inspection, Timetable extraction, Architecture design, `PROJECT_PROGRESS.md`.
  - [x] Step 1 — Foundation, Firebase Google Sign-In Auth, Cloud SQL (PostgreSQL + Drizzle ORM) 11-table schema (`UpdateSchema` + `information_schema.columns` verified), Light/Dark theme tokens.
  - [x] Step 2 — Timetable Engine (Working Day, Holiday, Exam Mode, constraint validation).
  - [x] Step 3 — Detailed Mode Manager (3 Mode Cards, Single/Multiple/Range selection, Confirmation Summary) & Calendar + Holiday CSV Import.
  - [x] Step 4 — Exam Mode configuration, subject/unit syllabus, PYQ tracking, and post-exam automatic restoration.
  - [x] Step 5 — Learning Roadmaps & One-Main-Skill-at-a-Time rule.
  - [x] Step 6 — 10-Step Structured AI Tutor & SM-2 Spaced Repetition Mastery Engine.
  - [x] Step 7 — Trusted Syllabus Source Registry & Major/Minor Update Approval Flow.
  - [x] Step 8 — Context-Aware AI Personal Coach (Server-side Gemini `gemini-4-hydrogen` + transparent Rule-Based Fallback) & Missed Session Recovery.
  - [x] Step 9 — Projects Engine, Analytics, Pomodoro Timer, Weekly AI Report, and Career Growth Dashboard.
  - [x] Step 10 — Notifications, Quiet Hours, IndexedDB Offline Persistence, Cloud SQL Sync, Conflict Detection & Non-Destructive Merge, JSON Backup/Restore.
  - [x] Step 11 — Responsive SaaS UI & PWA Compliance (`vite-plugin-pwa`, manifest, icons, install prompt).
  - [x] Step 12 — Unit tests (`src/tests/threeLayerArchitecture.test.ts` — 7/7 passed) & Playwright real-browser verification (Desktop `1440x900` & Mobile `390x844`, 0 console errors).

## 4. Environment & Integration Status
- **Cloud SQL (PostgreSQL)**: Provisioned (`ai-studio-da4cb8df` in `asia-southeast1`), 11 normalized tables pushed via Drizzle Kit and verified in `information_schema.columns`.
- **Firebase Authentication**: Configured with Google Sign-In OAuth (`firebase-applet-config.json`) and server-side `firebase-admin` token verification (`src/middleware/auth.ts`).
- **AI Provider Gateway**: Server-side `@google/genai` (`gemini-4-hydrogen`) in `server.ts` with automatic, clearly labeled deterministic fallback when `GEMINI_API_KEY` is unconfigured.

## 5. Verified Test Execution Summary
- **Unit & Integration Test Suite (`npx --yes tsx --test src/tests/threeLayerArchitecture.test.ts`)**:
  - 7/7 tests passed (`pass 7`, `fail 0`):
    1. Layer 1 Working Day & Holiday timetable and health constraint validation.
    2. Layer 1 Default Working Day resolution (including weekends unless explicitly assigned) and multi-date confirmation summary.
    3. Layer 1 Holiday CSV parser duplicate, invalid date, and Exam Mode conflict detection.
    4. Layer 1 Exam Mode snapshot & automatic post-exam timetable/mode restoration.
    5. Layer 2 One-Main-Skill-at-a-Time rule enforcement across Full-Stack, Cybersecurity, and AI/ML.
    6. Layer 2 Evidence-based Mastery Engine (requires quiz >= 80% AND completed practical exercise before marking `MASTERED`).
    7. Closed-loop Layer 1 -> Layer 2 -> Layer 3 -> Layer 2 integration verification without cross-layer state corruption.
- **Headless Chromium Browser Verification (`playwright-cli`)**:
  - Verified Desktop (`1440x900`) and Mobile (`390x844`) viewports with 0 console errors and 0 warnings.
  - Verified Mode Change Confirmation Summary, Calendar Holiday CSV parsing, 10-Step AI Tutor assessment evaluation (`0% -> NEEDS_REVISION` and `100% -> MASTERED`), and Layer 3 Career Growth evidence updates.
