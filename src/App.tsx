import { StudyToolsPanel } from './components/StudyToolsPanel.tsx';
import { studyResource, weekSummary, type StudyToolsState } from './layers/studyTools.ts';
import { studyCalendar } from './services/studyCalendar.ts';
import { StudyPlanView } from './components/StudyPlanView.tsx';
import { buildStudyPlan } from './layers/studyPlan.ts';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Clock,
  Sliders,
  Calendar,
  Map,
  BookOpen,
  GraduationCap,
  FolderGit2,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleAuthProvider } from './lib/firebase.ts';
import {
  DailyMode,
  GoalId,
  MissedSessionRecoveryDecision,
  NotificationPreferenceConfig,
  ProjectRecommendation,
  ScheduledLearningRecommendation,
  TimetableTemplate,
  UnavailableTime,
} from './types/domain.ts';
import {
  applyConfirmedModeChange,
  prepareExamModeActivation,
  publishDailyAvailability,
  removeDateModeAssignment,
  resolveDateMode,
  restorePostExamConfiguration,
} from './layers/layer1Schedule.ts';
import {
  checkAndUnlockContinuousLearning,
  evaluateAssessmentAndMastery,
  INITIAL_CP_RECORD,
  INITIAL_GATE_SUBJECTS,
  INITIAL_LANGUAGE_PROFICIENCY,
  planMissedSessionRecovery,
  switchActiveMainSkillTrack,
} from './layers/layer2LearningAndCareerBridge.ts';
import {
  createInitialWorkspaceState,
  detectSyncConflict,
  loadLocalWorkspaceState,
  migrateWorkspaceCurriculum,
  mergeWorkspaceStatesNonDestructively,
  PersistedWorkspaceState,
  saveLocalWorkspaceState,
  SyncConflictInfo,
} from './services/offlineSync.ts';
import { PWAInstallButton, OfflineConnectivityBanner } from './components/PWAInstallBanner.tsx';
import {
  CalendarAndHolidayView,
  ChangeDailyModeView,
  getCategoryColorText,
  getModeLabel,
  TimetableView,
} from './components/TimetableAndModeViews.tsx';
import { RoadmapView, StructuredTutorWorkspaceView } from './components/RoadmapAndTutorViews.tsx';
import {
  AICoachAndRecoveryView,
  AnalyticsView,
  CareerGrowthView,
  ProjectsView,
  SettingsAndSyncView,
} from './components/CareerCoachAndSettingsViews.tsx';

export type NavTabId =
  | 'dashboard'
  | 'timetable'
  | 'change-mode'
  | 'calendar'
  | 'roadmap'
  | 'today-learning'
  | 'ai-tutor'
  | 'projects'
  | 'career'
  | 'analytics'
  | 'ai-coach'
  | 'settings';

const NAV_ITEMS: { id: NavTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'timetable', label: 'Timetable', icon: <Clock className="w-4 h-4" /> },
  { id: 'change-mode', label: 'Day modes', icon: <Sliders className="w-4 h-4" /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
  { id: 'roadmap', label: 'Roadmaps', icon: <Map className="w-4 h-4" /> },
  { id: 'today-learning', label: 'Study plan', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'ai-tutor', label: 'AI Tutor', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
  { id: 'career', label: 'Career Growth', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'ai-coach', label: 'AI Coach', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
];

const NAV_GROUPS: { label: string; tabs: NavTabId[] }[] = [
  { label: 'Workspace', tabs: ['today-learning', 'dashboard', 'timetable', 'calendar', 'change-mode'] },
  { label: 'Development', tabs: ['roadmap', 'projects', 'career', 'analytics'] },
  { label: 'Tools', tabs: ['ai-tutor', 'ai-coach', 'settings'] },
];

function WorkspaceNavigation({ current, onSelect }: { current: NavTabId; onSelect: (tab: NavTabId) => void }) {
  return (
    <nav aria-label="Workspace navigation" className="workspace-nav">
      {NAV_GROUPS.map((group) => (
        <div className="workspace-nav-group" key={group.label}>
          <p>{group.label}</p>
          {group.tabs.map((id) => {
            const item = NAV_ITEMS.find((entry) => entry.id === id)!;
            return (
              <button type="button" key={id} onClick={() => onSelect(id)} aria-current={current === id ? 'page' : undefined}>
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function App() {
  const [workspace, setWorkspace] = useState<PersistedWorkspaceState>(() =>
    createInitialWorkspaceState()
  );
  const [activeTab, setActiveTab] = useState<NavTabId>('today-learning');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('sv-SE'));
  const lastToday = useRef(new Date().toLocaleDateString('sv-SE'));
  useEffect(() => {
    const refresh = () => {
      const current = new Date().toLocaleDateString('sv-SE');
      if (current === lastToday.current) return;
      const previous = lastToday.current;
      lastToday.current = current;
      setSelectedDate((selected) => selected === previous ? current : selected);
    };
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const [activeTutorTopicId, setActiveTutorTopicId] = useState<string>('');
  const [recoveryHistory, setRecoveryHistory] = useState<MissedSessionRecoveryDecision[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [planChangeMessage, setPlanChangeMessage] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Firebase Auth & Cloud SQL Sync State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('Local IndexedDB Ready');
  const [conflict, setConflict] = useState<SyncConflictInfo | null>(null);

  // Load persisted workspace from IndexedDB on mount
  useEffect(() => {
    loadLocalWorkspaceState().then((loaded) => {
      setWorkspace(loaded);
      document.documentElement.classList.toggle('dark', loaded.settings.theme === 'dark');
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setSyncStatus('Authenticated as ADHI');
      }
    });
    return () => unsub();
  }, []);

  const persistWorkspace = (updater: (prev: PersistedWorkspaceState) => PersistedWorkspaceState) => {
    setWorkspace((prev) => {
      const next = updater(prev);
      const stamped: PersistedWorkspaceState = {
        ...next,
        version: prev.version + 1,
        updatedAt: new Date().toISOString(),
        hasUnsyncedOfflineChanges: true,
      };
      saveLocalWorkspaceState(stamped);
      return stamped;
    });
  };

  // ==========================================
  // THREE-LAYER INTER-COMMUNICATION PIPELINE
  // 1. Layer 1 publishes today's availability & constraints
  // 2. Layer 3 evaluates verified mastery & project evidence and emits skill gaps
  // 3. Layer 2 selects autonomous daily learning sessions
  // ==========================================
  const layer1Availability = useMemo(
    () =>
      publishDailyAvailability(
        selectedDate,
        workspace.layer1Schedule.dateAssignments,
        workspace.layer1Schedule.templates,
        workspace.layer1Schedule.exams,
        workspace.layer1Schedule.defaultMode,
        workspace.layer1Schedule.unavailableByDate?.[selectedDate],
      ),
    [selectedDate, workspace.layer1Schedule]
  );

  const careerSnapshot = useMemo(
    () =>
      INITIAL_LANGUAGE_PROFICIENCY &&
      INITIAL_CP_RECORD &&
      (() => {
        const cpCustom = {
          ...INITIAL_CP_RECORD,
          totalSolved: INITIAL_CP_RECORD.totalSolved + workspace.layer3Career.cpSolvedIncrement,
          mediumSolved: INITIAL_CP_RECORD.mediumSolved + workspace.layer3Career.cpSolvedIncrement,
        };
        const langCustom = {
          japanese: {
            ...INITIAL_LANGUAGE_PROFICIENCY.japanese,
            vocabularyCount:
              INITIAL_LANGUAGE_PROFICIENCY.japanese.vocabularyCount +
              workspace.layer3Career.japaneseVocabIncrement,
          },
          english: {
            ...INITIAL_LANGUAGE_PROFICIENCY.english,
            speakingSessionsCompleted:
              INITIAL_LANGUAGE_PROFICIENCY.english.speakingSessionsCompleted +
              workspace.layer3Career.englishSessionsIncrement,
          },
        };
        return computeLayer3Snapshot(
          workspace.layer2Learning.roadmaps,
          workspace.layer2Learning.masteryRecords || {},
          workspace.layer3Career.projects,
          INITIAL_GATE_SUBJECTS,
          cpCustom,
          langCustom
        );
      })(),
    [workspace.layer2Learning, workspace.layer3Career]
  );

  const completedStudyTopicIds = useMemo(() => new Set(
    Object.values(workspace.layer2Learning.sessionHistory).flat()
      .filter((session) => session.status === 'COMPLETED')
      .map((session) => session.topicId),
  ), [workspace.layer2Learning.sessionHistory]);

  const dailySessions = useMemo(
    () => buildStudyPlan(
      layer1Availability,
      workspace.layer2Learning.roadmaps,
      workspace.layer2Learning.sessionHistory,
      workspace.layer2Learning.masteryRecords,
      workspace.layer3Career.projects,
      workspace.settings.studyTools,
    ),
    [layer1Availability, workspace.layer2Learning, workspace.layer3Career.projects, workspace.settings.studyTools],
  );

  const tools = workspace.settings.studyTools ?? {};
  const updateStudyTools = (update: (previous: StudyToolsState) => StudyToolsState) => persistWorkspace((previous) => ({
    ...previous,
    settings: { ...previous.settings, studyTools: update(previous.settings.studyTools ?? {}) },
  }));

  const planForDate = (
    date: string,
    history = workspace.layer2Learning.sessionHistory,
    blocks = workspace.layer1Schedule.unavailableByDate?.[date],
  ) => buildStudyPlan(
    publishDailyAvailability(
      date, workspace.layer1Schedule.dateAssignments, workspace.layer1Schedule.templates,
      workspace.layer1Schedule.exams, workspace.layer1Schedule.defaultMode, blocks,
    ),
    workspace.layer2Learning.roadmaps, history, workspace.layer2Learning.masteryRecords,
    workspace.layer3Career.projects, tools,
  );

  const previewCalendarChange = (blocks: UnavailableTime[]) => {
    const updated = planForDate(selectedDate, workspace.layer2Learning.sessionHistory, blocks);
    const before = dailySessions.filter((item) => item.status === 'SCHEDULED');
    const moved = before.filter((item) => !updated.some((next) => next.topicId === item.topicId));
    const trimmed = before.filter((item) => updated.some((next) =>
      next.topicId === item.topicId && next.durationMinutes < item.durationMinutes,
    ));
    return { moved, trimmed };
  };

  const findNextMatchingDay = (
    session: ScheduledLearningRecommendation,
    queue: ScheduledLearningRecommendation[] = [session],
  ) => {
    const date = new Date(session.date + 'T12:00:00Z');
    const history = {
      ...workspace.layer2Learning.sessionHistory,
      [session.date]: [
        ...(workspace.layer2Learning.sessionHistory[session.date] ?? []).filter((item) =>
          !queue.some((entry) => entry.sessionId === item.sessionId)),
        ...queue.map((item) => ({ ...item, status: 'RESCHEDULED' as const })),
      ],
    };
    for (let day = 0; day < 14; day++) {
      date.setUTCDate(date.getUTCDate() + 1);
      const key = date.toISOString().slice(0, 10);
      const plan = planForDate(key, history);
      const next = plan.find((item) => item.topicId === session.topicId && item.status === 'SCHEDULED');
      if (next) return `${key} at ${next.displayTime}`;
      history[key] = plan.map((item) => item.status === 'SCHEDULED' ? { ...item, status: 'COMPLETED' } : item);
    }
    return '';
  };

  const forecastExam = (deadline: string) => {
    const date = new Date(`${selectedDate}T12:00:00Z`);
    const history = { ...workspace.layer2Learning.sessionHistory };
    const planned = new Set<string>();
    let minutes = 0;
    let day = 0;
    for (; day < 370; day++, date.setUTCDate(date.getUTCDate() + 1)) {
      const key = date.toISOString().slice(0, 10);
      if (key >= deadline) break;
      const sessions = planForDate(key, history);
      for (const session of sessions) {
        if (session.goalId !== 'gate_cse' || session.status !== 'SCHEDULED') continue;
        minutes += session.durationMinutes;
        if (session.sessionType === 'NEW_CONCEPT') planned.add(session.topicId);
      }
      history[key] = sessions.map((session) => session.status === 'SCHEDULED' ? { ...session, status: 'COMPLETED' } : session);
    }
    const roadmap = workspace.layer2Learning.roadmaps.find((item) => item.goalId === 'gate_cse');
    const missing = (roadmap?.topics ?? []).filter((item) =>
      !completedStudyTopicIds.has(item.id) && workspace.layer2Learning.masteryRecords[item.id]?.status !== 'MASTERED' &&
      !planned.has(item.id),
    );
    const risk = missing.slice(0, 3).map((item) => item.title).join(', ');
    return `Projected ${minutes} GATE study minutes and ${planned.size} new modules before the deadline. ${missing.length} modules remain outside the estimate${risk ? `, including ${risk}` : ''}. Assumes each planned session is completed${day === 370 ? ' and covers at most 370 days' : ''}.`;
  };

  const exportReminders = () => {
    const calendar = studyCalendar(layer1Availability, dailySessions, workspace.settings.notificationPrefs.reminderLeadMinutes);
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `aetherlearn-${selectedDate}.ics`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ==========================================
  // ACTION HANDLERS ACROSS THE 3 LAYERS
  // ==========================================
  const handleToggleTheme = () => {
    persistWorkspace((prev) => {
      const nextTheme = prev.settings.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      return {
        ...prev,
        settings: {
          ...prev.settings,
          theme: nextTheme,
        },
      };
    });
  };

  const handleUpdateTemplate = (mode: DailyMode, updated: TimetableTemplate) => {
    persistWorkspace((prev) => ({
      ...prev,
      layer1Schedule: {
        ...prev.layer1Schedule,
        templates: {
          ...prev.layer1Schedule.templates,
          [mode]: updated,
        },
      },
    }));
  };

  const handleApplyModeAssignment = (dates: string[], newMode: DailyMode) => {
    persistWorkspace((prev) => ({
      ...prev,
      layer1Schedule: {
        ...prev.layer1Schedule,
        dateAssignments: applyConfirmedModeChange(
          dates,
          newMode,
          prev.layer1Schedule.dateAssignments,
          prev.layer1Schedule.defaultMode
        ),
      },
    }));
  };

  const handleRemoveModeAssignment = (dates: string[]) => {
    persistWorkspace((prev) => ({
      ...prev,
      layer1Schedule: {
        ...prev.layer1Schedule,
        dateAssignments: removeDateModeAssignment(dates, prev.layer1Schedule.dateAssignments),
      },
    }));
  };

  const handleApplyHolidayCandidates = (items: { date: string; label: string }[]) => {
    persistWorkspace((prev) => {
      let nextMap = { ...prev.layer1Schedule.dateAssignments };
      for (const item of items) {
        nextMap = applyConfirmedModeChange(
          [item.date],
          'HOLIDAY',
          nextMap,
          prev.layer1Schedule.defaultMode,
          { isImportedHoliday: true, holidayLabel: item.label }
        );
      }
      return {
        ...prev,
        layer1Schedule: {
          ...prev.layer1Schedule,
          dateAssignments: nextMap,
        },
      };
    });
  };

  const handleActivateExamMode = (examId: string) => {
    persistWorkspace((prev) => {
      const targetExam = prev.layer1Schedule.exams.find((e) => e.id === examId);
      if (!targetExam) return prev;
      const prep = prepareExamModeActivation(
        targetExam,
        prev.layer1Schedule.dateAssignments,
        prev.layer1Schedule.defaultMode
      );
      const updatedAssignments = applyConfirmedModeChange(
        prep.examDates,
        'EXAM_MODE',
        prev.layer1Schedule.dateAssignments,
        prev.layer1Schedule.defaultMode,
        { examId }
      );
      const updatedExams = prev.layer1Schedule.exams.map((e) =>
        e.id === examId
          ? {
              ...e,
              status: 'ACTIVE' as const,
              previousDateAssignmentsSnapshot: prep.previousSnapshot,
              previousActiveMainSkill: prev.layer2Learning.activeMainSkill,
            }
          : e
      );
      return {
        ...prev,
        layer1Schedule: {
          ...prev.layer1Schedule,
          dateAssignments: updatedAssignments,
          exams: updatedExams,
        },
      };
    });
  };

  const handleRestorePostExam = (examId: string) => {
    persistWorkspace((prev) => {
      const targetExam = prev.layer1Schedule.exams.find((e) => e.id === examId);
      if (!targetExam) return prev;
      const restoredAssignments = restorePostExamConfiguration(
        targetExam,
        prev.layer1Schedule.dateAssignments
      );
      const updatedExams = prev.layer1Schedule.exams.map((e) =>
        e.id === examId ? { ...e, status: 'COMPLETED_RESTORED' as const } : e
      );
      return {
        ...prev,
        layer1Schedule: {
          ...prev.layer1Schedule,
          dateAssignments: restoredAssignments,
          exams: updatedExams,
        },
      };
    });
  };

  const handleSwitchMainSkill = (skill: 'fullstack' | 'cybersecurity' | 'ai_ml') => {
    persistWorkspace((prev) => ({
      ...prev,
      layer2Learning: {
        ...prev.layer2Learning,
        activeMainSkill: skill,
        roadmaps: switchActiveMainSkillTrack(prev.layer2Learning.roadmaps, skill),
      },
    }));
  };

  const handleApproveSyllabusUpdate = (updateId: string, approve: boolean) => {
    persistWorkspace((prev) => ({
      ...prev,
      layer2Learning: {
        ...prev.layer2Learning,
        syllabusUpdates: prev.layer2Learning.syllabusUpdates.map((u) =>
          u.id === updateId
            ? { ...u, status: approve ? 'APPROVED' : 'REJECTED' }
            : u
        ),
      },
    }));
  };

  const handleSubmitAssessmentResult = (
    topicId: string,
    goalId: GoalId,
    correctCount: number,
    totalCount: number,
    mistakeCategories: string[],
    practicalCompleted: boolean,
    reflectionNote: string
  ) => {
    persistWorkspace((prev) => {
      const updatedMastery = evaluateAssessmentAndMastery(
        prev.layer2Learning.masteryRecords[topicId],
        topicId,
        goalId,
        correctCount,
        totalCount,
        mistakeCategories,
        practicalCompleted,
        selectedDate
      );
      const nextMasteryMap = {
        ...prev.layer2Learning.masteryRecords,
        [topicId]: updatedMastery,
      };

      // Check if Continuous Learning specialization should unlock for this roadmap
      const nextRoadmaps = prev.layer2Learning.roadmaps.map((rm) => {
        if (rm.goalId !== goalId) return rm;
        const unlocked = checkAndUnlockContinuousLearning(rm, nextMasteryMap);
        return unlocked.updatedRoadmap;
      });

      const topicObj = nextRoadmaps.flatMap((r) => r.topics).find((t) => t.id === topicId);

      return {
        ...prev,
        layer2Learning: {
          ...prev.layer2Learning,
          roadmaps: nextRoadmaps,
          masteryRecords: nextMasteryMap,
          learningLogs: [
            {
              id: `log-${Date.now()}`,
              date: selectedDate,
              topicTitle: topicObj?.title || topicId,
              reflection: reflectionNote,
              minutes: topicObj?.estimatedDurationMinutes || 45,
            },
            ...prev.layer2Learning.learningLogs,
          ],
        },
      };
    });
  };

  const handleMarkSessionMissed = (session: ScheduledLearningRecommendation) => {
    const decision = planMissedSessionRecovery(
      session,
      workspace.layer2Learning.masteryRecords[session.topicId],
      layer1Availability.assignedMode,
      15
    );
    setRecoveryHistory((prev) => [decision, ...prev]);

    recordStudyOutcome(session, 'MISSED');
  };

  const recordStudyOutcome = (
    session: ScheduledLearningRecommendation,
    status: 'COMPLETED' | 'PARTIAL' | 'MISSED',
  ) => {
    const [projectId, milestone] = session.topicId.split(':');
    persistWorkspace((prev) => ({
      ...prev,
      layer2Learning: {
        ...prev.layer2Learning,
        sessionHistory: {
          ...prev.layer2Learning.sessionHistory,
          [session.date]: [
            ...(prev.layer2Learning.sessionHistory[session.date] ?? []).filter((entry) =>
              entry.sessionId !== session.sessionId),
            { ...session, status },
          ],
        },
      },
      settings: session.sessionType === 'REVISION_SPACED' && status === 'COMPLETED' && prev.settings.studyTools?.practice
        ? {
            ...prev.settings,
            studyTools: {
              ...prev.settings.studyTools,
              practice: Object.fromEntries(Object.entries(prev.settings.studyTools.practice).filter(([id]) => id !== session.topicId)),
            },
          }
        : prev.settings,
      layer3Career: session.sessionType !== 'PRACTICAL_PROJECT' || milestone === undefined ? prev.layer3Career : {
        ...prev.layer3Career,
        projects: prev.layer3Career.projects.map((project) => project.id === projectId ? {
          ...project,
          developmentStages: project.developmentStages.map((stage, index) =>
            index === Number(milestone) ? { ...stage, completed: status === 'COMPLETED' } : stage),
        } : project),
      },
    }));
  };

  const saveProjectRepository = (projectId: string, repositoryUrl: string) => {
    persistWorkspace((previous) => ({
      ...previous,
      layer3Career: {
        ...previous.layer3Career,
        projects: previous.layer3Career.projects.map((project) =>
          project.id === projectId ? { ...project, repositoryUrl } : project),
      },
    }));
  };

  const handleUpdateProjectStatus = (
    projectId: string,
    status: ProjectRecommendation['status']
  ) => {
    persistWorkspace((prev) => ({
      ...prev,
      layer3Career: {
        ...prev.layer3Career,
        projects: prev.layer3Career.projects.map((p) =>
          p.id === projectId
            ? { ...p, status, completedAt: status === 'Completed' ? selectedDate : p.completedAt }
            : p
        ),
      },
    }));
  };

  const handleToggleProjectStage = (projectId: string, stageIndex: number) => {
    persistWorkspace((prev) => ({
      ...prev,
      layer3Career: {
        ...prev.layer3Career,
        projects: prev.layer3Career.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                developmentStages: p.developmentStages.map((stg, idx) =>
                  idx === stageIndex ? { ...stg, completed: !stg.completed } : stg
                ),
              }
            : p
        ),
      },
    }));
  };

  // ==========================================
  // GOOGLE AUTH & CLOUD SQL SYNC HANDLERS
  // ==========================================
  const handleGoogleSignIn = async () => {
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      setFirebaseUser(cred.user);
      setSyncStatus('Signed in as ADHI');
    } catch (err: unknown) {
      setSyncStatus(
        err instanceof Error ? `Sign-in notice: ${err.message}` : 'Using Local IndexedDB Mode'
      );
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setSyncStatus('Signed out — Local IndexedDB Mode Active');
  };

  const handlePushCloudSync = async (forceOverwrite = false) => {
    if (!firebaseUser) {
      setSyncStatus('Please sign in with Google first to push to Cloud SQL.');
      return;
    }
    try {
      setSyncStatus('Synchronizing 3-layer workspace to Cloud SQL PostgreSQL...');
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workspace, forceOverwrite }),
      });

      if (response.status === 409) {
        const conflictData = await response.json();
        const detected = detectSyncConflict(workspace, conflictData.remoteSnapshot);
        if (detected) {
          setConflict(detected);
          setSyncStatus('Conflict detected — awaiting your resolution choice.');
          return;
        }
      }

      const data = await response.json();
      if (response.ok) {
        setConflict(null);
        setSyncStatus(`Synced to Cloud SQL PostgreSQL (v${data.version} at ${data.updatedAt})`);
      } else {
        setSyncStatus(`Sync error: ${data.error || 'Unknown error'}`);
      }
    } catch {
      setSyncStatus('Offline — queued in IndexedDB until connectivity returns.');
    }
  };

  const handlePullCloudSync = async () => {
    if (!firebaseUser) {
      setSyncStatus('Please sign in with Google first to pull from Cloud SQL.');
      return;
    }
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/sync/pull', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.snapshot) {
        const migrated = migrateWorkspaceCurriculum({ ...data.snapshot, updatedAt: new Date().toISOString() });
        setWorkspace(migrated);
        saveLocalWorkspaceState(migrated);
        setConflict(null);
        setSyncStatus(`Loaded Cloud SQL snapshot v${data.snapshot.version}`);
      } else {
        setSyncStatus('No remote snapshot stored yet — push your local workspace first.');
      }
    } catch {
      setSyncStatus('Failed to pull cloud snapshot — using local IndexedDB data.');
    }
  };

  const handleResolveConflictMerge = () => {
    if (!conflict) return;
    const merged = migrateWorkspaceCurriculum(mergeWorkspaceStatesNonDestructively(
      conflict.localState,
      conflict.remoteState,
    ));
    setWorkspace(merged);
    saveLocalWorkspaceState(merged);
    setConflict(null);
    setSyncStatus(`Smart non-destructive merge complete (v${merged.version}).`);
  };

  const todayResolved = resolveDateMode(
    selectedDate,
    workspace.layer1Schedule.dateAssignments,
    workspace.layer1Schedule.defaultMode
  );
  const todayTemplate = workspace.layer1Schedule.templates[todayResolved.mode];
  const nextSession = dailySessions.find((session) => session.status === 'SCHEDULED');
  const weakTopicTitles = Object.values(workspace.layer2Learning.masteryRecords)
    .filter((m) => m.status === 'NEEDS_REVISION' || (m.status !== 'NOT_STARTED' && m.understandingLevel < 70))
    .map((m) => {
      const t = workspace.layer2Learning.roadmaps.flatMap((r) => r.topics).find((x) => x.id === m.topicId);
      return t?.title || m.topicId;
    });

  const unreadNotifCount = workspace.settings.notifications.filter((n) => !n.read).length;

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <button type="button" className="workspace-brand" onClick={() => setActiveTab('today-learning')}>
          <span className="workspace-mark"><BookOpen aria-hidden="true" size={19} /></span>
          <span>AetherLearn</span>
        </button>
        <WorkspaceNavigation current={activeTab} onSelect={setActiveTab} />
        <button type="button" className="workspace-goal" onClick={() => setActiveTab('career')}>
          <span><TrendingUp aria-hidden="true" size={17} /></span>
          <span><strong>Placement 2029</strong><small>Career progress</small></span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </aside>

      {mobileNavOpen && (
        <div className="workspace-drawer">
          <button type="button" className="workspace-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
          <aside className="workspace-drawer-panel" onKeyDown={(event) => {
            if (event.key === 'Escape') setMobileNavOpen(false);
          }}>
            <div className="workspace-drawer-header">
              <strong>AetherLearn</strong>
              <button type="button" autoFocus className="workspace-icon-button" aria-label="Close Navigation Menu" onClick={() => setMobileNavOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <WorkspaceNavigation current={activeTab} onSelect={(tab) => {
              setActiveTab(tab);
              setMobileNavOpen(false);
            }} />
          </aside>
        </div>
      )}

      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-breadcrumb">
            <button
              type="button"
              aria-label="Open Navigation Menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
              className="workspace-icon-button workspace-menu-toggle"
            >
              <Menu size={20} />
            </button>
            <span className="workspace-breadcrumb-root">Workspace</span>
            <span className="workspace-breadcrumb-root" aria-hidden="true">/</span>
            <strong>{NAV_ITEMS.find((item) => item.id === activeTab)?.label}</strong>
          </div>
          <div className="workspace-topbar-actions">
            <div className="workspace-install"><PWAInstallButton /></div>
            <button
              type="button"
              aria-label="Toggle Light or Dark Theme"
              onClick={handleToggleTheme}
              className="workspace-icon-button"
            >
              {workspace.settings.theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                aria-label={`Notifications (${unreadNotifCount} unread)`}
                onClick={() => setShowNotifDropdown((v) => !v)}
                className="workspace-icon-button"
              >
                <Bell className="w-4 h-4" />
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 z-50 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span>Notifications ({unreadNotifCount})</span>
                    <button
                      type="button"
                      onClick={() => setShowNotifDropdown(false)}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      Close
                    </button>
                  </div>
                  {workspace.settings.notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.actionTab) setActiveTab(n.actionTab as NavTabId);
                        setShowNotifDropdown(false);
                      }}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{n.timestamp}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="workspace-avatar" aria-label="Open Settings" onClick={() => setActiveTab('settings')}>A</button>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="workspace-content">
          {activeTab === 'dashboard' && (
            <div className="study-page">
              <header className="study-heading">
                <div><h1>Overview</h1><p>Placement preparation and study activity</p></div>
                <button type="button" className="study-button study-button-primary" onClick={() => setActiveTab('today-learning')}>Open study plan <ArrowRight size={16} /></button>
              </header>
              <div className="overview-metrics">
                <section className="study-card study-progress">
                  <header><TrendingUp size={18} /><h2>Placement readiness</h2></header>
                  <p className="study-progress-count"><strong>{careerSnapshot.overallPlacementReadinessPercent}%</strong></p>
                  <button type="button" className="overview-link" onClick={() => setActiveTab('career')}>Career progress <ArrowRight size={14} /></button>
                </section>
                <section className="study-card study-progress">
                  <header><Map size={18} /><h2>GATE CSE readiness</h2></header>
                  <p className="study-progress-count"><strong>{careerSnapshot.gateOverallReadinessPercent}%</strong></p>
                  <button type="button" className="overview-link" onClick={() => setActiveTab('roadmap')}>View roadmaps <ArrowRight size={14} /></button>
                </section>
                <section className="study-card study-progress">
                  <header><FolderGit2 size={18} /><h2>Portfolio projects</h2></header>
                  <p className="study-progress-count"><strong>{careerSnapshot.portfolioReadyProjectsCount}</strong></p>
                  <button type="button" className="overview-link" onClick={() => setActiveTab('projects')}>View projects <ArrowRight size={14} /></button>
                </section>
              </div>
              <div className="study-layout">
                <section className="study-card study-settings">
                  <h2>Next study session</h2>
                  {nextSession ? <>
                    <h3 className="mt-3 text-xl font-bold">{nextSession.topicTitle}</h3>
                    <p>{nextSession.displayTime} · {nextSession.durationMinutes} min</p>
                  </> : <p>No remaining sessions for the selected date.</p>}
                </section>
                <section className="study-card study-settings">
                  <h2>{todayTemplate.name}</h2>
                  <p>{todayTemplate.wakeTime}–{todayTemplate.sleepTime} · {todayTemplate.activities.length} timetable blocks</p>
                  <button type="button" className="overview-link mt-3" onClick={() => setActiveTab('timetable')}>View timetable <ArrowRight size={14} /></button>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'timetable' && (
            <TimetableView
              selectedDate={selectedDate}
              templates={workspace.layer1Schedule.templates}
              dateAssignments={workspace.layer1Schedule.dateAssignments}
              exams={workspace.layer1Schedule.exams}
              onUpdateTemplate={handleUpdateTemplate}
              onActivateExamMode={handleActivateExamMode}
              onRestorePostExam={handleRestorePostExam}
              onOpenChangeMode={() => setActiveTab('change-mode')}
            />
          )}

          {activeTab === 'change-mode' && (
            <ChangeDailyModeView
              selectedDate={selectedDate}
              templates={workspace.layer1Schedule.templates}
              dateAssignments={workspace.layer1Schedule.dateAssignments}
              onApplyModeAssignment={handleApplyModeAssignment}
              onRemoveModeAssignment={handleRemoveModeAssignment}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarAndHolidayView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              dateAssignments={workspace.layer1Schedule.dateAssignments}
              exams={workspace.layer1Schedule.exams}
              onApplyHolidayCandidates={handleApplyHolidayCandidates}
              onQuickModeAssign={(date, mode) => handleApplyModeAssignment([date], mode)}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapView
              roadmaps={workspace.layer2Learning.roadmaps}
              masteryRecords={workspace.layer2Learning.masteryRecords}
              completedTopicIds={completedStudyTopicIds}
              syllabusUpdates={workspace.layer2Learning.syllabusUpdates}
              activeMainSkill={workspace.layer2Learning.activeMainSkill}
              onSwitchMainSkill={handleSwitchMainSkill}
              onApproveSyllabusUpdate={handleApproveSyllabusUpdate}
              onOpenTopicInTutor={(topicId) => {
                setActiveTutorTopicId(topicId);
                setActiveTab('ai-tutor');
              }}
            />
          )}

          {activeTab === 'today-learning' && (
            <>
            {planChangeMessage && <p role="status" className="study-card study-settings mb-3">{planChangeMessage}</p>}
            <StudyPlanView
              key={selectedDate}
              availability={layer1Availability}
              blocks={workspace.layer1Schedule.unavailableByDate?.[selectedDate] ?? []}
              sessions={dailySessions}
              onDate={(date) => { setPlanChangeMessage(''); setSelectedDate(date); }}
              onMode={(mode) => { setPlanChangeMessage(''); handleApplyModeAssignment([selectedDate], mode); }}
              previewBlocks={(blocks) => {
                const { moved, trimmed } = previewCalendarChange(blocks);
                const changes = moved.map((session) => {
                  const next = findNextMatchingDay(session, moved);
                  return next ? `${session.topicTitle}: next matching slot ${next}.` : `${session.topicTitle} will wait for a matching slot.`;
                });
                return [...changes, ...trimmed.map((session) => `${session.topicTitle} will have a shorter session.`)].join(' ') ||
                  'This block leaves your scheduled topics unchanged.';
              }}
              onBlocks={(blocks) => {
                const { moved } = previewCalendarChange(blocks);
                setPlanChangeMessage('');
                persistWorkspace((prev) => ({
                  ...prev,
                  layer1Schedule: {
                    ...prev.layer1Schedule,
                    unavailableByDate: { ...prev.layer1Schedule.unavailableByDate, [selectedDate]: blocks },
                  },
                  layer2Learning: {
                    ...prev.layer2Learning,
                    sessionHistory: {
                      ...prev.layer2Learning.sessionHistory,
                      [selectedDate]: [
                        ...(prev.layer2Learning.sessionHistory[selectedDate] ?? []).filter((entry) =>
                          !moved.some((session) => session.sessionId === entry.sessionId)),
                        ...moved.map((session) => ({ ...session, status: 'RESCHEDULED' as const })),
                      ],
                    },
                  },
                }));
              }}
              onOutcome={(session, status) => {
                recordStudyOutcome(session, status);
                const next = status === 'COMPLETED' ? '' : findNextMatchingDay(session);
                setPlanChangeMessage(status === 'COMPLETED' ? '' : next
                  ? `${session.topicTitle} can resume on ${next}.`
                  : `${session.topicTitle} is queued for a matching slot.`);
              }}
              toolsPanel={<StudyToolsPanel date={selectedDate} tools={tools} update={updateStudyTools}
                summary={weekSummary(workspace.layer2Learning.sessionHistory, selectedDate)}
                forecast={forecastExam} exportCalendar={exportReminders} />}
              sessionTools={(session) => {
                const roadmap = workspace.layer2Learning.roadmaps.find((item) => item.goalId === session.goalId);
                const topic = roadmap?.topics.find((item) => item.id === session.topicId);
                if (!topic) return null;
                const resource = studyResource(session.goalId, session.topicId, roadmap?.authorityUrl);
                return <details className="mt-2 text-sm">
                  <summary className="cursor-pointer font-semibold text-blue-700 dark:text-blue-300">Resource and practice</summary>
                  {resource && <a className="overview-link mt-1" href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a>}
                  <p>{topic.studyTask ?? topic.lesson.independentExercise.prompt}</p>
                  <button type="button" className="study-button mt-2" onClick={() =>
                    updateStudyTools((previous) => ({ ...previous, practice: { ...previous.practice, [topic.id]: selectedDate } }))}>
                    {tools.practice?.[topic.id] ? 'Practice queued' : 'Need more practice'}
                  </button>
                  <form className="mt-2 grid gap-2" onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const note = String(new FormData(form).get('mistake') ?? '').trim().slice(0, 240);
                    if (!note) return;
                    updateStudyTools((previous) => ({
                      ...previous,
                      mistakes: [{ id: crypto.randomUUID(), topicId: topic.id, title: topic.title, note, date: selectedDate }, ...(previous.mistakes ?? [])],
                      practice: { ...previous.practice, [topic.id]: selectedDate },
                    }));
                    form.reset();
                  }}>
                    <label className="study-field">What tripped you up?
                      <input name="mistake" required maxLength={240} placeholder="One sentence" />
                    </label>
                    <button type="submit" className="study-button">Save mistake and queue practice</button>
                  </form>
                </details>;
              }}
              reminderLeadMinutes={workspace.settings.notificationPrefs.enableSessionReminders
                ? workspace.settings.notificationPrefs.reminderLeadMinutes
                : undefined}
            />
            </>
          )}

          {activeTab === 'ai-tutor' && (
            <StructuredTutorWorkspaceView
              selectedDate={selectedDate}
              dailySessions={dailySessions}
              roadmaps={workspace.layer2Learning.roadmaps}
              masteryRecords={workspace.layer2Learning.masteryRecords}
              activeTopicId={activeTutorTopicId || dailySessions.find((session) => session.sessionType !== 'EXAM_UNIT_PREP' && session.sessionType !== 'PRACTICAL_PROJECT')?.topicId || ''}
              onSelectTopicId={setActiveTutorTopicId}
              onSubmitAssessmentResult={handleSubmitAssessmentResult}
              onMarkSessionMissed={handleMarkSessionMissed}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={workspace.layer3Career.projects}
              masteryRecords={workspace.layer2Learning.masteryRecords}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              onToggleProjectStage={handleToggleProjectStage}
              onSaveRepository={saveProjectRepository}
              onOpenPrerequisiteTopic={(topicId) => {
                setActiveTutorTopicId(topicId);
                setActiveTab('ai-tutor');
              }}
            />
          )}

          {activeTab === 'career' && (
            <CareerGrowthView
              careerSnapshot={careerSnapshot}
              onLogCpProblemSolved={() =>
                persistWorkspace((prev) => ({
                  ...prev,
                  layer3Career: {
                    ...prev.layer3Career,
                    cpSolvedIncrement: prev.layer3Career.cpSolvedIncrement + 1,
                  },
                }))
              }
              onLogJapaneseVocab={() =>
                persistWorkspace((prev) => ({
                  ...prev,
                  layer3Career: {
                    ...prev.layer3Career,
                    japaneseVocabIncrement: prev.layer3Career.japaneseVocabIncrement + 5,
                  },
                }))
              }
              onLogEnglishSpeaking={() =>
                persistWorkspace((prev) => ({
                  ...prev,
                  layer3Career: {
                    ...prev.layer3Career,
                    englishSessionsIncrement: prev.layer3Career.englishSessionsIncrement + 1,
                  },
                }))
              }
              onJumpToGapTopic={(topicId) => {
                setActiveTutorTopicId(topicId);
                setActiveTab('ai-tutor');
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              masteryRecords={workspace.layer2Learning.masteryRecords}
              careerSnapshot={careerSnapshot}
              learningLogs={workspace.layer2Learning.learningLogs}
              onAddLearningLog={(topicTitle, reflection, minutes) =>
                persistWorkspace((prev) => ({
                  ...prev,
                  layer2Learning: {
                    ...prev.layer2Learning,
                    learningLogs: [
                      {
                        id: `log-${Date.now()}`,
                        date: selectedDate,
                        topicTitle,
                        reflection,
                        minutes,
                      },
                      ...prev.layer2Learning.learningLogs,
                    ],
                  },
                }))
              }
            />
          )}

          {activeTab === 'ai-coach' && (
            <AICoachAndRecoveryView
              assignedMode={getModeLabel(todayResolved.mode)}
              activeMainSkill={workspace.layer2Learning.activeMainSkill}
              overallPlacementReadiness={careerSnapshot.overallPlacementReadinessPercent}
              weakTopics={weakTopicTitles}
              dailySessions={dailySessions}
              recoveryHistory={recoveryHistory}
              onTriggerMissedSession={handleMarkSessionMissed}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsAndSyncView
              workspace={workspace}
              userEmail={firebaseUser ? 'ADHI' : null}
              syncStatus={syncStatus}
              conflict={conflict}
              onGoogleSignIn={handleGoogleSignIn}
              onSignOut={handleSignOut}
              onPushCloudSync={handlePushCloudSync}
              onPullCloudSync={handlePullCloudSync}
              onResolveConflictMerge={handleResolveConflictMerge}
              onUpdateNotificationPrefs={(prefs: NotificationPreferenceConfig) =>
                persistWorkspace((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    notificationPrefs: prefs,
                  },
                }))
              }
              onImportWorkspaceJson={(restored) => {
                persistWorkspace(() => migrateWorkspaceCurriculum(restored));
              }}
            />
          )}
        </main>

        {/* Quiet Footer */}
        <footer className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AetherLearn — Three-Layer Autonomous Personal Learning Manager (Placement 2029 &amp; GATE CSE)
          </span>
          <span className="font-mono tabular-nums">
            Snapshot v{workspace.version} · IndexedDB + Cloud SQL PostgreSQL
          </span>
        </footer>
      </div>

      <OfflineConnectivityBanner
        hasUnsyncedChanges={workspace.hasUnsyncedOfflineChanges}
      />
    </div>
  );
}

// Helper re-export wrapper to keep App.tsx clean
function computeLayer3Snapshot(
  roadmaps: PersistedWorkspaceState['layer2Learning']['roadmaps'],
  masteryRecords: PersistedWorkspaceState['layer2Learning']['masteryRecords'],
  projects: PersistedWorkspaceState['layer3Career']['projects'],
  gateSubjects: typeof INITIAL_GATE_SUBJECTS,
  cpRecord: typeof INITIAL_CP_RECORD,
  languages: typeof INITIAL_LANGUAGE_PROFICIENCY
) {
  return evaluateCareerSnapshotBridge(
    roadmaps,
    masteryRecords,
    projects,
    gateSubjects,
    cpRecord,
    languages
  );
}
import { evaluateCareerOutcomesAndSkillGaps as evaluateCareerSnapshotBridge } from './layers/layer3Career.ts';
