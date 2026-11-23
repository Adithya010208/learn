# Java planner and Vercel update

Java is the DSA language from the first program through the data structures examples. Study Plan includes resource links, 15-minute mode and date-range workload limits, a GATE deadline forecast, an upcoming-slot preview, a mistake log with follow-up practice, and a weekly summary. Matching SQL practice can transfer between placement and full-stack after the receiving prerequisites are completed. Java DSA and frontend each include an independent checkpoint. Project tasks advance one milestone at a time, store a GitHub link, and show a résumé draft based on checked milestones.

The coach runs on compatible desktop Chrome's on-device model, with deterministic guidance everywhere else. There is no billable AI API. Calendar files include alarms and an evening check-in, and must be imported into a calendar to deliver reminders when the planner is closed. The deployed app does not send push notifications.

Vercel uses the pinned npm lockfile, a Vite static build, and a function adapter for optional authenticated cloud sync. The local planner requires no environment variables. See README.md for deployment instructions.

Verification includes a 60-day scheduling simulation with repeatedly restored history, calendar generation, cap and shared-credit checks, and production build and API checks. The configured cloud database and actual Gemini Nano model require their own environment and were not exercised by the automated suite.


## Earlier beginner update

# Start from zero update

All eight roadmaps now open with a Start from zero stage containing 34 preloaded modules. The app has 132 modules overall. Each starter has one short practice task and a 15-minute suggested session. The DSA plan starts by running a first program, then moves through variables, decisions, loops, functions and first arrays. The foundations before GATE CS are preparatory study topics and are separate from the official syllabus coverage.

The planner uses the new prerequisite order automatically. Existing module IDs and saved results are kept. All 15 tests passed, including a planner check for the first two DSA sessions. TypeScript and the production build also passed.

## Earlier curriculum audit

# Curriculum audit update

The app ships 98 modules across eight roadmaps, expanded from 15. The audit mapped GATE technical coverage to IIT Madras's GATE 2027 CS syllabus and aligned Japanese practice to official JLPT N5 test sections. The other tracks are curated and cite the curriculum or framework used. Roadmaps show the sequence, prerequisite names and practice. The standalone Roadmap-audit.html lists the same modules and records the sources and limits.

The app preserves existing topic IDs, assessment records and check-ins. Older local workspaces, cloud snapshots and restored backups load the revised curriculum. The false source-check confirmation was removed. Most newly added modules are practice tasks. The update does not include a complete lesson library, question bank or JLPT word list. The detailed General Aptitude topics use the accessible 2026 official outline and 2027 rules for the exam component, since the 2027 aptitude PDF could not be retrieved during the audit.

## Verification

All 14 tests passed, including prerequisite order, unique module IDs, GATE section coverage and workspace migration. TypeScript checks and the final production build passed. The app was not deployed.

## Earlier workspace redesign

# Workspace redesign

AetherLearn now opens on the Study Plan. The navigation is grouped around Workspace, Development and Tools, with a drawer on smaller screens. The Study Plan separates the next session, progress, schedule, and day settings. Overview was rebuilt as a compact view of placement and GATE progress, portfolio projects and timetable. The shared interface uses a new type system, restrained purple accents and a coordinated dark theme.

## Verification

All 11 existing tests passed. TypeScript checks and the final production build passed. A fresh Chrome profile verified the desktop and mobile layouts, date controls, adding and removing unavailable time, daily check-in, light and dark theme switching, and mobile navigation. The source archive includes the updated app and local setup instructions. This build was not deployed.

## Earlier planner update

# Study planner update

Open **Today's Learning** to switch modes, block specific hours, see the day's study topics, and mark each session Done, Partial, or Missed. A block only subtracts the overlapping study time on the selected date. Complete topics unlock their dependent topics on subsequent days. Missed and partial work takes priority on the next date with a matching free slot. Project tasks use the existing project's prerequisites. Exam preparation slots use upcoming subjects and topics from the configured exam syllabus.

Reminders appear in the Study Plan while it is open. Closed-app notifications were not implemented. The built-in roadmaps determine topic order, and this update did not audit every topic against external syllabuses. Run the app with the instructions in the earlier report below. This update has not been deployed or pushed to GitHub.

## Verification

All 11 tests passed, TypeScript checks passed, and the production build completed. The tests cover splitting a study slot around a block, keeping another day unchanged, carrying missed work forward, advancing from completed prerequisites, avoiding duplicate topics, and suggesting a ready project task. Browser interaction and cloud sync were not reverified.

## Earlier mentor update

# Adaptive mentor update

This update builds on upstream commit 765f0c2 of Adithya010208/learn.

## Implemented

- The mentor opens on the first recommendation for the selected day, which starts on the device's current local date.
- A new learner starts with a worked example and a guided exercise with a revealable solution. Existing quiz mistakes surface as targeted review prompts. Mastered topics receive application or active recall instructions based on the review date.
- Independent work starts with an empty draft and a rubric. The learner self-checks the draft. A saved assessment can retain that draft with the session reflection.
- A full quiz must be answered before submission. In-place practice retries score the answers without changing recorded mastery, and switching topics or dates resets in-progress form state.
- The learning engine includes due mastered topics in spaced repetition and replaces mistakes that the learner resolved on the latest assessment.

## Architecture and storage

The repository uses React, TypeScript, Vite, Express and a Vite PWA. Schedule Management owns daily availability, Learning Intelligence chooses topics and records assessments, and Career Growth reads evidence to calculate progress. The mentor guidance lives in Learning Intelligence and leaves timetable commitments and career records under their existing owners.

The existing IndexedDB workspace stores local progress. The upstream cloud implementation uses Firebase sign-in and PostgreSQL via Drizzle. This update makes no database schema changes. Cloud sync, live Firebase sign-in, live Gemini, PWA installation, and browser layouts were not reverified in this environment. The mentor uses curated lessons and rule-based guidance. Practical solutions are self-reviewed and are not independently graded. The supplied attachment contains written requirements. No separate timetable image was available for comparison.

## Run locally

Use Node.js 24. The checks ran with npm's legacy peer resolution because the inherited Vite and esbuild ranges conflict under npm's default peer resolver.

```sh
npm install --legacy-peer-deps --no-audit --no-fund
npm run dev
```

Open http://localhost:3000 and select Today's Learning. The core mentor has no credential requirement.

## Build and host

```sh
npm run build
```

Set NODE_ENV=production, set PORT if required by the host, and run npm start. The Express server serves dist and the API. This update was not deployed.

For live coaching, configure GEMINI_API_KEY on the server. For cloud sync, configure SQL_HOST, SQL_DB_NAME, SQL_USER and SQL_PASSWORD, provision the existing Drizzle schema, and configure Firebase for the hosting domain. The repository's Drizzle administration config also reads SQL_ADMIN_USER and SQL_ADMIN_PASSWORD. Verify those external integrations in the target environment before relying on them.

## Verification for this update

- npm test passed all 8 tests, including the mentor's worked example, correction and retention progression.
- npm run lint passed.
- npm run build generated the production bundle and PWA assets. Vite reported inherited warnings about configuration compatibility and bundle size.
- The production server returned HTTP 200 for the homepage, health endpoint and coach endpoint in a local smoke check. Health showed live AI and Cloud SQL were unconfigured.
- git diff --check passed.

The previous project status below is historical. Its deployment and browser claims were not reverified in this update.


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
