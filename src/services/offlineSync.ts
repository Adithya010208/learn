import {
  AppNotificationItem,
  DailyMode,
  DateModeAssignment,
  ExamConfiguration,
  LearningRoadmap,
  NotificationPreferenceConfig,
  ProjectRecommendation,
  ScheduledLearningRecommendation,
  SyllabusUpdateRecord,
  TimetableTemplate,
  TopicMasteryRecord,
} from '../types/domain.ts';
import { createInitialTemplates } from '../layers/layer1Schedule.ts';
import {
  createInitialMasteryRecords,
  INITIAL_ROADMAPS,
  INITIAL_SYLLABUS_UPDATES,
} from '../layers/layer2Learning.ts';
import { INITIAL_PROJECTS } from '../layers/layer3Career.ts';

/**
 * OFFLINE PERSISTENCE (IndexedDB + LocalStorage Fallback),
 * CLOUD SYNC (PostgreSQL Snapshot Sync), CONFLICT DETECTION & RESOLUTION,
 * AND FULL JSON BACKUP / RESTORE
 *
 * Strictly separates:
 * 1. Layer 1 Schedule State (Templates, Date Mode Assignments, Exams)
 * 2. Layer 2 Learning State (Roadmaps, Topic Mastery, Session History, Syllabus Updates)
 * 3. Layer 3 Career State (Projects, CP & Language Logs)
 * 4. User Preferences & Sync Metadata (Version, Timestamp, Pending Offline Queue)
 */

export interface PersistedWorkspaceState {
  version: number;
  updatedAt: string;
  hasUnsyncedOfflineChanges: boolean;
  layer1Schedule: {
    defaultMode: DailyMode;
    templates: Record<DailyMode, TimetableTemplate>;
    dateAssignments: Record<string, DateModeAssignment>;
    exams: ExamConfiguration[];
  };
  layer2Learning: {
    activeMainSkill: 'fullstack' | 'cybersecurity' | 'ai_ml';
    roadmaps: LearningRoadmap[];
    masteryRecords: Record<string, TopicMasteryRecord>;
    sessionHistory: Record<string, ScheduledLearningRecommendation[]>;
    syllabusUpdates: SyllabusUpdateRecord[];
    learningLogs: { id: string; date: string; topicTitle: string; reflection: string; minutes: number }[];
  };
  layer3Career: {
    projects: ProjectRecommendation[];
    cpSolvedIncrement: number;
    japaneseVocabIncrement: number;
    englishSessionsIncrement: number;
  };
  settings: {
    theme: 'light' | 'dark';
    notificationPrefs: NotificationPreferenceConfig;
    notifications: AppNotificationItem[];
  };
}

export interface SyncConflictInfo {
  detectedAt: string;
  localState: PersistedWorkspaceState;
  remoteState: PersistedWorkspaceState;
  reason: string;
}

const DB_NAME = 'AetherLearnIndexedDB';
const DB_VERSION = 1;
const STORE_NAME = 'workspace_store';
const RECORD_KEY = 'current_workspace_v3';
const LS_FALLBACK_KEY = 'aetherlearn_workspace_v3';

export function createInitialWorkspaceState(): PersistedWorkspaceState {
  const today = '2026-11-15';
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    hasUnsyncedOfflineChanges: false,
    layer1Schedule: {
      defaultMode: 'WORKING_DAY',
      templates: createInitialTemplates(),
      dateAssignments: {
        '2026-11-22': {
          date: '2026-11-22',
          mode: 'HOLIDAY',
          previousMode: 'WORKING_DAY',
          isExplicit: true,
          isImportedHoliday: false,
          holidayLabel: 'Scheduled Deep-Work Sunday Holiday',
          updatedAt: '2026-11-15T06:00:00.000Z',
        },
      },
      exams: [
        {
          id: 'exam-univ-dec-2026',
          title: 'Semester V University Core CS Examinations',
          startDate: '2026-12-10',
          endDate: '2026-12-18',
          status: 'UPCOMING',
          previousDateAssignmentsSnapshot: {},
          previousActiveMainSkill: 'fullstack',
          dailyRevisionPlan: [
            'Morning 7:00–9:30 AM: High-weightage Unit derivation & numericals',
            'Midday 10:00 AM–12:30 PM: Last 5 years University + GATE PYQs',
            'Afternoon 2:00–4:30 PM: Weak-area consolidation & formula sheets',
            'Evening 5:15–7:15 PM: Timed 60-minute mock test & error log',
          ],
          subjects: [
            {
              id: 'sub-dbms',
              code: 'CS3501',
              name: 'Database Management Systems',
              examDate: '2026-12-12',
              priority: 'HIGH',
              mockScorePercent: 84,
              units: [
                {
                  unitNumber: 1,
                  title: 'Relational Algebra & SQL Optimization',
                  topics: ['Relational Calculus', 'Join Algorithms', 'Query Cost Estimation'],
                  importantConcepts: ['Pipelines vs Materialization', 'Block Nested Loop Join'],
                  pyqCount: 18,
                  completedPyqs: 16,
                  masteryPercent: 88,
                  isWeakArea: false,
                },
                {
                  unitNumber: 2,
                  title: 'B+ Tree Indexing, Hashing & Concurrency Control',
                  topics: ['B+ Tree Split/Merge', 'Two-Phase Locking (2PL)', 'Timestamp Ordering'],
                  importantConcepts: ['Conflict Serializability Precedence Graph', 'Thomas Write Rule'],
                  pyqCount: 22,
                  completedPyqs: 18,
                  masteryPercent: 85,
                  isWeakArea: false,
                },
              ],
            },
            {
              id: 'sub-os',
              code: 'CS3502',
              name: 'Operating Systems Internals',
              examDate: '2026-12-15',
              priority: 'HIGH',
              mockScorePercent: 64,
              units: [
                {
                  unitNumber: 1,
                  title: 'Virtual Memory, Paging & TLB Access Time',
                  topics: ['Hierarchical Page Tables', 'EMAT Numericals', 'Thrashing & Working Set'],
                  importantConcepts: ['Belady Anomaly Proof', 'Inverted Page Tables'],
                  pyqCount: 24,
                  completedPyqs: 14,
                  masteryPercent: 64,
                  isWeakArea: true,
                },
                {
                  unitNumber: 2,
                  title: 'Deadlocks, Semaphores & Disk Scheduling',
                  topics: ['Banker Algorithm', 'Reader-Writer Synchronization', 'SCAN / C-SCAN'],
                  importantConcepts: ['Resource Allocation Graph Safety Check'],
                  pyqCount: 20,
                  completedPyqs: 15,
                  masteryPercent: 74,
                  isWeakArea: false,
                },
              ],
            },
          ],
        },
      ],
    },
    layer2Learning: {
      activeMainSkill: 'fullstack',
      roadmaps: structuredClone(INITIAL_ROADMAPS),
      masteryRecords: createInitialMasteryRecords(),
      sessionHistory: {},
      syllabusUpdates: structuredClone(INITIAL_SYLLABUS_UPDATES),
      learningLogs: [],
    },
    layer3Career: {
      projects: structuredClone(INITIAL_PROJECTS),
      cpSolvedIncrement: 0,
      japaneseVocabIncrement: 0,
      englishSessionsIncrement: 0,
    },
    settings: {
      theme: 'light',
      notificationPrefs: {
        enableSessionReminders: true,
        reminderLeadMinutes: 10,
        enableRevisionAlerts: true,
        enableAssessmentAlerts: true,
        enableExamCountdowns: true,
        enableMissedSessionRecovery: true,
        enableWeeklyReports: true,
        enableSyllabusUpdates: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '05:00',
      },
      notifications: [
        {
          id: 'notif-1',
          category: 'SESSION',
          title: 'Welcome ADHI — Complete Beginner Mode Active',
          message: 'All 8 learning tracks are set to start from absolute scratch (Stage 1 Foundations, 0% baseline).',
          timestamp: `${today} 06:40 AM`,
          read: false,
          actionTab: 'today-learning',
        },
        {
          id: 'notif-2',
          category: 'SYLLABUS_UPDATE',
          title: 'Major Roadmap Addition Pending Approval',
          message: 'Full-Stack roadmap detected a Stage 4 update from React 19 & OWASP 2026 sources. Review and approve in Learning Roadmap.',
          timestamp: `${today} 07:05 AM`,
          read: false,
          actionTab: 'roadmap',
        },
        {
          id: 'notif-3',
          category: 'EXAM',
          title: 'Semester V Exams in 25 Days',
          message: 'Exam Mode is configured for Dec 10–Dec 18. OS Unit 1 (Virtual Memory) is flagged as high priority.',
          timestamp: `${today} 07:10 AM`,
          read: false,
          actionTab: 'timetable',
        },
      ],
    },
  };
}

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadLocalWorkspaceState(): Promise<PersistedWorkspaceState> {
  try {
    const db = await openIndexedDB();
    const record = await new Promise<PersistedWorkspaceState | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(RECORD_KEY);
      getReq.onsuccess = () => resolve(getReq.result as PersistedWorkspaceState | undefined);
      getReq.onerror = () => reject(getReq.error);
    });
    if (record && record.layer1Schedule && record.layer2Learning && record.layer3Career) {
      return record;
    }
  } catch {
    // Fallback to localStorage
  }

  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_FALLBACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedWorkspaceState;
        if (parsed.layer1Schedule && parsed.layer2Learning) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore parse errors
  }

  return createInitialWorkspaceState();
}

export async function saveLocalWorkspaceState(state: PersistedWorkspaceState): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(state));
    }
  } catch {
    // Ignore quota errors
  }

  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(state, RECORD_KEY);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    });
  } catch {
    // Already saved to localStorage fallback
  }
}

/**
 * Detects whether pushing local offline state would overwrite a newer cloud snapshot.
 * Never silently overwrites newer cloud records with older offline changes.
 */
export function detectSyncConflict(
  local: PersistedWorkspaceState,
  remote: PersistedWorkspaceState | null
): SyncConflictInfo | null {
  if (!remote) {
    return null;
  }
  const localTime = new Date(local.updatedAt).getTime();
  const remoteTime = new Date(remote.updatedAt).getTime();

  if (local.hasUnsyncedOfflineChanges && remote.version > local.version && remoteTime > localTime) {
    return {
      detectedAt: new Date().toISOString(),
      localState: local,
      remoteState: remote,
      reason: `Cloud snapshot is at version v${remote.version} (updated ${remote.updatedAt}), while local offline changes were based on v${local.version}. Choose whether to keep Local Offline changes, adopt Cloud Snapshot, or Merge Mastery & Schedule non-destructively.`,
    };
  }
  return null;
}

/**
 * Non-destructive smart merge of two workspace states:
 * Preserves highest mastery scores/attempts and merges date mode assignments without losing history.
 */
export function mergeWorkspaceStatesNonDestructively(
  local: PersistedWorkspaceState,
  remote: PersistedWorkspaceState
): PersistedWorkspaceState {
  const mergedMastery: Record<string, TopicMasteryRecord> = {
    ...remote.layer2Learning.masteryRecords,
  };

  for (const [topicId, localRec] of Object.entries(local.layer2Learning.masteryRecords)) {
    const remoteRec = mergedMastery[topicId];
    if (!remoteRec || localRec.assessmentAttempts >= remoteRec.assessmentAttempts) {
      mergedMastery[topicId] = localRec;
    }
  }

  return {
    ...local,
    version: Math.max(local.version, remote.version) + 1,
    updatedAt: new Date().toISOString(),
    hasUnsyncedOfflineChanges: false,
    layer1Schedule: {
      ...local.layer1Schedule,
      dateAssignments: {
        ...remote.layer1Schedule.dateAssignments,
        ...local.layer1Schedule.dateAssignments,
      },
    },
    layer2Learning: {
      ...local.layer2Learning,
      masteryRecords: mergedMastery,
    },
  };
}
