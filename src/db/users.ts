import { db } from './index.ts';
import { users, userWorkspaceSnapshots } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || 'ADHI',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserSnapshot(uid: string) {
  try {
    const rows = await db
      .select()
      .from(userWorkspaceSnapshots)
      .where(eq(userWorkspaceSnapshots.userUid, uid));
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserSnapshot:', error);
    throw new Error('Failed to load workspace snapshot from database.', { cause: error });
  }
}

export async function upsertUserSnapshot(
  uid: string,
  payload: {
    version: number;
    layer1ScheduleJson: string;
    layer2LearningJson: string;
    layer3CareerJson: string;
    settingsJson: string;
  }
) {
  try {
    const result = await db
      .insert(userWorkspaceSnapshots)
      .values({
        userUid: uid,
        version: payload.version,
        layer1ScheduleJson: payload.layer1ScheduleJson,
        layer2LearningJson: payload.layer2LearningJson,
        layer3CareerJson: payload.layer3CareerJson,
        settingsJson: payload.settingsJson,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userWorkspaceSnapshots.userUid,
        set: {
          version: payload.version,
          layer1ScheduleJson: payload.layer1ScheduleJson,
          layer2LearningJson: payload.layer2LearningJson,
          layer3CareerJson: payload.layer3CareerJson,
          settingsJson: payload.settingsJson,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in upsertUserSnapshot:', error);
    throw new Error('Failed to save workspace snapshot to database.', { cause: error });
  }
}
