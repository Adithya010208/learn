# AetherLearn

A personal study planner for placement preparation, Java DSA, GATE CSE, full-stack, and other goals.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci --legacy-peer-deps --no-audit --no-fund
npm run dev
```

Open http://localhost:3000. Study Plan contains daily check-ins, timetable controls, unavailable hours, resource and practice links, calendar export, and workload tools. Projects contains evidence links and milestones. The coach lives under Tools.

## Deploy on Vercel

Import this Git repository as a **Vite** project and leave Root Directory at the repository root. Use Node.js 24. The committed Vercel configuration pins the npm install command, builds into `dist`, and exposes the optional API via `api/[...route].ts`. No environment variables are required for the personal planner. After a deployment, check the UI and `/api/health`.

Progress is stored on the device by default. Use the Settings backup feature before moving browsers or devices. Optional cloud sync requires your own PostgreSQL instance and Firebase project credentials. Keep credential values server-side (see `.env.example`) and authorize the deployment domain in Firebase before testing sign-in. With no database configured, the sync endpoints return a clear unavailable response and the planner still works.

## Cost and limits

- The coach can use Chrome's on-device Gemini Nano on supported desktop browsers. Model availability depends on browser version, settings, hardware, and download status. Otherwise the coach answers with deterministic guidance from the current plan.
- Calendar export includes session alarms and an evening check-in. Import the file into a calendar with notifications enabled for reminders when the app is closed. Export and import again when the plan changes. Calendar apps differ in duplicate and alarm handling.
- The GATE forecast assumes scheduled work gets done. It reports projected study time and which modules may remain, and does not change the real plan.
- Java DSA references and practice run in your own JDK or editor. The website does not execute submitted code.

## Verification

```sh
npm test
npm run lint
npm run build
```
