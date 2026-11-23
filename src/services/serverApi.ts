import express from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.ts';
import { getOrCreateUser, getUserSnapshot, upsertUserSnapshot } from '../db/users.ts';

export const api = express();
api.disable('x-powered-by');
api.use(express.json({ limit: '5mb' }));

const cloudConfigured = () => Boolean(
  process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_PASSWORD && process.env.SQL_DB_NAME,
);

api.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  aiProviderConfigured: false,
  cloudSqlConfigured: cloudConfigured(),
  timestamp: new Date().toISOString(),
}));

api.use('/api/sync', (_req, res, next) => {
  if (!cloudConfigured()) {
    res.status(503).json({ error: 'Cloud sync is unconfigured. Your planner data is stored on this device.' });
  } else {
    next();
  }
});

  // Cloud SQL Authenticated Pull Workspace Snapshot
api.get('/api/sync/pull', requireAuth, async (req: AuthRequest, res) => {
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
        error: 'Failed to pull cloud snapshot',
      });
    }
  });

  // Cloud SQL Authenticated Push Workspace Snapshot
api.post('/api/sync/push', requireAuth, async (req: AuthRequest, res) => {
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
        error: 'Failed to push cloud snapshot',
      });
    }
  });


api.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));
