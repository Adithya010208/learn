import type { StudyToolsState } from '../layers/studyTools.ts';
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
  UnavailableTime,
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
    unavailableByDate?: Record<string, UnavailableTime[]>;
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
    studyTools?: StudyToolsState;
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

export function migrateWorkspaceCurriculum(state: PersistedWorkspaceState): PersistedWorkspaceState {
  const savedRoadmaps = state.layer2Learning.roadmaps;
  const roadmaps = INITIAL_ROADMAPS.map((canonical) => {
    const saved = savedRoadmaps.find((roadmap) => roadmap.goalId === canonical.goalId);
    if (!saved) return structuredClone(canonical);
    const currentIds = new Set(canonical.topics.map((topic) => topic.id));
    const extensions = saved.topics.filter((topic) => !currentIds.has(topic.id));
    return { ...canonical, isActiveMainSkill: saved.isActiveMainSkill, topics: [...canonical.topics, ...extensions] };
  });
  return {
    ...state,
    settings: {
      ...state.settings,
      notifications: state.settings.notifications.filter((notification) => notification.id !== 'notif-2'),
    },
    layer2Learning: {
      ...state.layer2Learning,
      roadmaps,
      syllabusUpdates: state.layer2Learning.syllabusUpdates.filter(
        (update) => update.id !== 'upd-gate-2026-official' && update.id !== 'upd-fs-react19-server-actions',
      ),
    },
  };
}

export function freshestWorkspace(
  indexed: PersistedWorkspaceState | undefined,
  local: PersistedWorkspaceState | undefined,
): PersistedWorkspaceState | undefined {
  if (!indexed) return local;
  if (!local) return indexed;
  const indexedTime = Date.parse(indexed.updatedAt) || 0;
  const localTime = Date.parse(local.updatedAt) || 0;
  return localTime > indexedTime || (localTime === indexedTime && local.version >= indexed.version) ? local : indexed;
}

function isWorkspace(value: PersistedWorkspaceState | undefined): value is PersistedWorkspaceState {
  return Boolean(value?.layer1Schedule && value.layer2Learning && value.layer3Career && value.settings);
}

export async function loadLocalWorkspaceState(): Promise<PersistedWorkspaceState> {
  let indexed: PersistedWorkspaceState | undefined;
  let local: PersistedWorkspaceState | undefined;
  try {
    const db = await openIndexedDB();
    const record = await new Promise<PersistedWorkspaceState | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const getReq = tx.objectStore(STORE_NAME).get(RECORD_KEY);
      getReq.onsuccess = () => resolve(getReq.result as PersistedWorkspaceState | undefined);
      getReq.onerror = () => reject(getReq.error);
    });
    if (isWorkspace(record)) indexed = record;
  } catch {
    // The copy in localStorage is read independently.
  }
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(LS_FALLBACK_KEY);
      const parsed = raw ? JSON.parse(raw) as PersistedWorkspaceState : undefined;
      if (isWorkspace(parsed)) local = parsed;
    }
  } catch {
    // IndexedDB still works if localStorage is unavailable.
  }

  const saved = freshestWorkspace(indexed, local);
  return saved ? migrateWorkspaceCurriculum(saved) : createInitialWorkspaceState();
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
      unavailableByDate: {
        ...remote.layer1Schedule.unavailableByDate,
        ...local.layer1Schedule.unavailableByDate,
      },
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
