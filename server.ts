import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserSnapshot, upsertUserSnapshot } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * PROVIDER-INDEPENDENT AI ABSTRACTION
 *
 * Keeps AI provider integration completely decoupled from Layer 1, Layer 2, and Layer 3.
 * Uses Gemini ('gemini-4-hydrogen' via @google/genai on the server) when GEMINI_API_KEY is valid,
 * and falls back to a clearly identified Rule-Based Context Engine (`aiMode: "RULE_BASED_FALLBACK"`)
 * if credentials are missing or unreachable—never misrepresenting fallback output as live AI.
 */
interface AIProviderResponse {
  text: string;
  aiMode: 'LIVE_GEMINI' | 'RULE_BASED_FALLBACK';
  providerName: string;
  modelUsed: string;
}

class ServerAIProviderGateway {
  private getGeminiClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim().length < 10) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  async generateCoachResponse(
    question: string,
    contextSummary: {
      assignedMode: string;
      activeMainSkill: string;
      overallPlacementReadiness: number;
      weakTopics: string[];
      nextSessionTitle: string;
      missedSessionsCount: number;
      upcomingExamTitle?: string;
    }
  ): Promise<AIProviderResponse> {
    const client = this.getGeminiClient();
    if (client) {
      try {
        const systemInstruction = [
          'You are AetherLearn, a senior AI Personal Learning Coach for a Computer Science undergraduate graduating in 2029.',
          'Primary Goal: Product-Based Company Placement. Secondary Goal: GATE CSE.',
          'One-Main-Skill-at-a-Time Rule: Only one main technical development track (Full-Stack, Cybersecurity, or AI/ML) is active at once, while DSA, GATE, Japanese (JLPT N5), and English continue in designated daily slots.',
          `Current Application Context:`,
          `- Today's Timetable Mode: ${contextSummary.assignedMode}`,
          `- Active Main Technical Track: ${contextSummary.activeMainSkill}`,
          `- Verified Placement Readiness: ${contextSummary.overallPlacementReadiness}%`,
          `- Weak Topics Requiring Revision: ${contextSummary.weakTopics.join(', ') || 'None flagged'}`,
          `- Next Scheduled Session: ${contextSummary.nextSessionTitle}`,
          `- Missed Sessions Today: ${contextSummary.missedSessionsCount}`,
          `- Upcoming Exam: ${contextSummary.upcomingExamTitle || 'None active'}`,
          'Provide a concise, actionable, structured coaching answer grounded strictly in the user’s real metrics and timetable constraints (protecting 7h+ sleep and 60m academic limit). Keep response under 220 words.',
        ].join('\n');

        const response = await client.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: question,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });

        const text = response.text?.trim();
        if (text) {
          return {
            text,
            aiMode: 'LIVE_GEMINI',
            providerName: 'Google Gemini API (Server-Side)',
            modelUsed: 'gemini-4-hydrogen',
          };
        }
      } catch (err) {
        console.warn('Gemini API call fell back to deterministic rule-based coach:', err);
      }
    }

    // Clearly identified deterministic Rule-Based Context Fallback
    const qLower = question.toLowerCase();
    let reply = '';

    if (qLower.includes('today') || qLower.includes('study') || qLower.includes('next')) {
      reply = [
        `Based on your **${contextSummary.assignedMode}** timetable and Complete Beginner (From Scratch) roadmap:`,
        `1. **Immediate Priority Session**: **${contextSummary.nextSessionTitle}**.`,
        `2. **Stage 1 Foundation Focus**: Start with **${contextSummary.weakTopics[0] || 'Programming Logic, Arrays, Loops & Big-O Time Complexity from Zero'}** before unlocking intermediate stages.`,
        `3. **Active Main Skill Track**: Continue **${contextSummary.activeMainSkill.toUpperCase()}** Stage 1 Foundations in your evening technical slot (Cybersecurity and AI/ML remain queued per your One-Main-Skill-at-a-Time rule).`,
        `4. **Health Guardrail**: Your 10:00 PM sleep boundary and 60-minute college academic cap are strictly protected.`,
      ].join('\n');
    } else if (qLower.includes('miss') || qLower.includes('recover')) {
      reply = [
        `**Missed-Session Recovery Protocol**:`,
        `- Missed sessions Today: **${contextSummary.missedSessionsCount}**.`,
        `- Do **not** shift your entire evening timetable or sacrifice your 10:00 PM sleep slot.`,
        `- High-priority Placement/DSA misses are compressed into a **15-minute high-yield concept + 2-question quiz** during the 9:40–9:50 PM Review Buffer, while moderate sessions move cleanly to tomorrow's matching slot.`,
      ].join('\n');
    } else if (qLower.includes('placement') || qLower.includes('progress') || qLower.includes('ready')) {
      reply = [
        `**Placement 2029 Readiness Assessment (${contextSummary.overallPlacementReadiness}% Verified Evidence — Complete Beginner Baseline)**:`,
        `- **Current Starting Mode**: All 8 roadmaps are unlocked at **Stage 1 Beginner Foundations (From Scratch)**.`,
        `- **First Foundation Milestones**: ${contextSummary.weakTopics.join(', ') || 'Arrays & Big-O from Zero, Core CS & SQL Basics, HTML/CSS/JS DOM from Scratch, and Hiragana Vowels'}.`,
        `- **Starter Portfolio Project**: Begin Stage 1 of *Responsive Personal Learning Portfolio & Interactive Task Tracker (From Scratch)* to build your first verified project evidence.`,
      ].join('\n');
    } else {
      reply = [
        `**Context-Aware Coaching Summary (${contextSummary.assignedMode})**:`,
        `- **Next Session**: ${contextSummary.nextSessionTitle}`,
        `- **Active Main Skill**: ${contextSummary.activeMainSkill.toUpperCase()} (Placement Readiness: ${contextSummary.overallPlacementReadiness}%)`,
        `- **Stage 1 Beginner Focus**: ${contextSummary.weakTopics.join(', ') || 'DSA Arrays & Big-O, Core CS SQL Basics & HTML/CSS/JS Foundations'}`,
        `- **Upcoming Exam**: ${contextSummary.upcomingExamTitle || 'Semester V Exams (Dec 10–18)'}`,
        `Ask me *"What should I study today?"*, *"How can I recover a missed session?"*, or *"Why is this my next topic?"* for targeted scheduling actions.`,
      ].join('\n');
    }

    return {
      text: reply,
      aiMode: 'RULE_BASED_FALLBACK',
      providerName: 'Deterministic Rule-Based Learning Engine (Fallback)',
      modelUsed: 'rule-engine-v1',
    };
  }
}

const aiGateway = new ServerAIProviderGateway();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Health & Provider Status Route
  app.get('/api/health', (_req, res) => {
    const hasGeminiKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
        process.env.GEMINI_API_KEY.trim().length >= 10
    );
    const hasCloudSql = Boolean(process.env.SQL_HOST && process.env.SQL_DB_NAME);
    res.json({
      status: 'ok',
      aiProviderConfigured: hasGeminiKey,
      cloudSqlConfigured: hasCloudSql,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Personal Coach & Tutor Endpoint (Server-Side Gemini + Transparent Fallback)
  app.post('/api/ai/coach', async (req, res) => {
    try {
      const { question, contextSummary } = req.body || {};
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required' });
      }
      const result = await aiGateway.generateCoachResponse(question, {
        assignedMode: contextSummary?.assignedMode || 'WORKING_DAY',
        activeMainSkill: contextSummary?.activeMainSkill || 'fullstack',
        overallPlacementReadiness: Number(contextSummary?.overallPlacementReadiness ?? 0),
        weakTopics: Array.isArray(contextSummary?.weakTopics) ? contextSummary.weakTopics : [],
        nextSessionTitle:
          contextSummary?.nextSessionTitle ||
          'DSA / Coding — Programming Logic, Arrays, Loops & Big-O Time Complexity from Zero',
        missedSessionsCount: Number(contextSummary?.missedSessionsCount ?? 0),
        upcomingExamTitle: contextSummary?.upcomingExamTitle,
      });
      res.json(result);
    } catch (error: unknown) {
      console.error('AI Coach endpoint error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to generate coach response',
      });
    }
  });

  // Cloud SQL Authenticated Pull Workspace Snapshot
  app.get('/api/sync/pull', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'student@aetherlearn.app';
      await getOrCreateUser(uid, email, req.user!.name);
      const snapshot = await getUserSnapshot(uid);
      if (!snapshot) {
        return res.json({ snapshot: null });
      }
      res.json({
        snapshot: {
          version: snapshot.version,
          updatedAt: snapshot.updatedAt.toISOString(),
          hasUnsyncedOfflineChanges: false,
          layer1Schedule: JSON.parse(snapshot.layer1ScheduleJson),
          layer2Learning: JSON.parse(snapshot.layer2LearningJson),
          layer3Career: JSON.parse(snapshot.layer3CareerJson),
          settings: JSON.parse(snapshot.settingsJson),
        },
      });
    } catch (error: unknown) {
      console.error('Failed to pull workspace snapshot:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to pull cloud snapshot',
      });
    }
  });

  // Cloud SQL Authenticated Push Workspace Snapshot
  app.post('/api/sync/push', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'student@aetherlearn.app';
      await getOrCreateUser(uid, email, req.user!.name);

      const { workspace, forceOverwrite } = req.body || {};
      if (!workspace || !workspace.layer1Schedule || !workspace.layer2Learning || !workspace.layer3Career) {
        return res.status(400).json({ error: 'Invalid workspace snapshot payload' });
      }

      const existing = await getUserSnapshot(uid);
      if (existing && !forceOverwrite && existing.version > Number(workspace.version || 1)) {
        return res.status(409).json({
          error: 'CONFLICT_DETECTED',
          message: 'Cloud database contains a newer snapshot version.',
          remoteSnapshot: {
            version: existing.version,
            updatedAt: existing.updatedAt.toISOString(),
            hasUnsyncedOfflineChanges: false,
            layer1Schedule: JSON.parse(existing.layer1ScheduleJson),
            layer2Learning: JSON.parse(existing.layer2LearningJson),
            layer3Career: JSON.parse(existing.layer3CareerJson),
            settings: JSON.parse(existing.settingsJson),
          },
        });
      }

      const nextVersion = existing ? Math.max(existing.version, Number(workspace.version || 1)) + 1 : 1;
      const saved = await upsertUserSnapshot(uid, {
        version: nextVersion,
        layer1ScheduleJson: JSON.stringify(workspace.layer1Schedule),
        layer2LearningJson: JSON.stringify(workspace.layer2Learning),
        layer3CareerJson: JSON.stringify(workspace.layer3Career),
        settingsJson: JSON.stringify(workspace.settings || {}),
      });

      res.json({
        status: 'synced',
        version: saved.version,
        updatedAt: saved.updatedAt.toISOString(),
      });
    } catch (error: unknown) {
      console.error('Failed to push workspace snapshot:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to push cloud snapshot',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AetherLearn server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
