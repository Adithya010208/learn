/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
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
  Play,
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
  selectAutonomousDailySessions,
  switchActiveMainSkillTrack,
} from './layers/layer2LearningAndCareerBridge.ts';
import {
  createInitialWorkspaceState,
  detectSyncConflict,
  loadLocalWorkspaceState,
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
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'timetable', label: 'My Timetable', icon: <Clock className="w-4 h-4" /> },
  { id: 'change-mode', label: 'Change Daily Mode', icon: <Sliders className="w-4 h-4" /> },
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
  { id: 'roadmap', label: 'Learning Roadmap', icon: <Map className="w-4 h-4" /> },
  { id: 'today-learning', label: "Today's Learning", icon: <BookOpen className="w-4 h-4" /> },
  { id: 'ai-tutor', label: 'AI Tutor', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
  { id: 'career', label: 'Career Growth', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'ai-coach', label: 'AI Coach', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
];

export default function App() {
  const [workspace, setWorkspace] = useState<PersistedWorkspaceState>(() =>
    createInitialWorkspaceState()
  );
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-15');
  const [activeTutorTopicId, setActiveTutorTopicId] = useState<string>('dsa-basics-arrays-complexity');
  const [recoveryHistory, setRecoveryHistory] = useState<MissedSessionRecoveryDecision[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
        workspace.layer1Schedule.defaultMode
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

  const dailySessions = useMemo(() => {
    const computed = selectAutonomousDailySessions(
      layer1Availability,
      workspace.layer2Learning.roadmaps,
      workspace.layer2Learning.masteryRecords,
      careerSnapshot.skillGapsForLayer2
    );
    const savedForDate = workspace.layer2Learning.sessionHistory[selectedDate] || [];
    return computed.map((item) => {
      const override = savedForDate.find((s) => s.slotId === item.slotId);
      return override ? { ...item, status: override.status, recoveryPlan: override.recoveryPlan } : item;
    });
  }, [layer1Availability, workspace.layer2Learning, careerSnapshot.skillGapsForLayer2, selectedDate]);

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

    persistWorkspace((prev) => {
      const existingForDate = prev.layer2Learning.sessionHistory[selectedDate] || dailySessions;
      const updatedSessions = existingForDate.map((s) =>
        s.slotId === session.slotId
          ? { ...s, status: 'MISSED' as const, recoveryPlan: decision }
          : s
      );
      return {
        ...prev,
        layer2Learning: {
          ...prev.layer2Learning,
          sessionHistory: {
            ...prev.layer2Learning.sessionHistory,
            [selectedDate]: updatedSessions,
          },
        },
      };
    });
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
        setWorkspace(data.snapshot);
        saveLocalWorkspaceState(data.snapshot);
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
    const merged = mergeWorkspaceStatesNonDestructively(
      conflict.localState,
      conflict.remoteState
    );
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
  const nextSession = dailySessions[0];
  const weakTopicTitles = Object.values(workspace.layer2Learning.masteryRecords)
    .filter((m) => m.status === 'NEEDS_REVISION' || (m.status !== 'NOT_STARTED' && m.understandingLevel < 70))
    .map((m) => {
      const t = workspace.layer2Learning.roadmaps.flatMap((r) => r.topics).find((x) => x.id === m.topicId);
      return t?.title || m.topicId;
    });

  const unreadNotifCount = workspace.settings.notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar Navigation (12 Required Items) */}
      <aside
        aria-label="Primary Sidebar Navigation"
        className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800"
      >
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-display whitespace-nowrap"
          >
            AetherLearn
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI Personal Learning System
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Active Main Skill:</span>
            <strong className="text-violet-600 dark:text-violet-400">
              {workspace.layer2Learning.activeMainSkill.toUpperCase()}
            </strong>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Placement 2029:</span>
            <strong className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {careerSnapshot.overallPlacementReadinessPercent}% Ready
            </strong>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative w-72 max-w-full bg-white dark:bg-slate-900 h-full flex flex-col z-10 border-r border-slate-200 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-display">
                AetherLearn
              </span>
              <button
                type="button"
                aria-label="Close Navigation Menu"
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Zone 1 Breadcrumb/Brand, Zone 2 Quick Links, Zone 3 Primary Action */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2 sm:gap-6">
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <button
              type="button"
              aria-label="Open Navigation Menu"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              AetherLearn · {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <nav aria-label="Quick Top Navigation" className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('change-mode')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Change Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('today-learning')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Today&apos;s Learning
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('career')}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
            >
              Placement 2029
            </button>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <PWAInstallButton />

            <button
              type="button"
              aria-label="Toggle Light or Dark Theme"
              onClick={handleToggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 z-50 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span>Intelligent Reminders ({unreadNotifCount})</span>
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

            <button
              type="button"
              onClick={() => setActiveTab('change-mode')}
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Change Daily Mode
            </button>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Greeting & Current Date / Mode Section */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                    Current Date: {selectedDate} · Assigned Daily Mode:{' '}
                    <strong className="text-blue-600 dark:text-blue-400">
                      {getModeLabel(todayResolved.mode)}
                    </strong>{' '}
                    ({todayResolved.isExplicit ? 'Explicitly Assigned' : 'Default Mode — Working Day'})
                  </p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-balance">
                    Good morning, ADHI — Here is your autonomous learning plan for today.
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Primary Goal: <strong>Product-Company Placement (2029)</strong> · Backup Goal: <strong>GATE CSE</strong> · Active Main Technical Track: <strong className="text-violet-600 dark:text-violet-400">{workspace.layer2Learning.activeMainSkill.toUpperCase()}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (nextSession) setActiveTutorTopicId(nextSession.topicId);
                      setActiveTab('ai-tutor');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
                  >
                    <Play className="w-4 h-4" />
                    Start Next Learning Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('change-mode')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    CHANGE DAILY MODE
                  </button>
                </div>
              </section>

              {/* Main Focus Section: Today's Priority, Next Session, Active Skill, Readiness */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Next Autonomous Learning Session
                    </p>
                    <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                      {nextSession?.topicTitle || 'Variable-Size Sliding Window & Monotonic Deque'}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-blue-600 dark:text-blue-400 tabular-nums">
                      {nextSession?.displayTime || '5:30–6:15 PM'} ({nextSession?.durationMinutes || 45}m)
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {nextSession?.autonomousReason}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Active Main Technical Skill Track
                    </p>
                    <h2 className="mt-1 text-base font-bold text-violet-600 dark:text-violet-400">
                      {workspace.layer2Learning.activeMainSkill === 'fullstack'
                        ? 'Full-Stack Software Engineering'
                        : workspace.layer2Learning.activeMainSkill === 'cybersecurity'
                        ? 'Cybersecurity & Ethical Hacking'
                        : 'AI & Machine Learning'}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      One-Main-Skill-at-a-Time Rule enforced
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('roadmap')}
                    className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
                  >
                    Inspect 8 Goal Roadmaps →
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Verified Placement 2029 Readiness
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {careerSnapshot.overallPlacementReadinessPercent}%
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                      GATE CSE Backup Readiness: {careerSnapshot.gateOverallReadinessPercent}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('career')}
                    className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left"
                  >
                    View Verified Career Evidence →
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {weakTopicTitles.length > 0 ? 'Topics Flagged for Revision Today' : 'Learning Level & Starting Mode'}
                    </p>
                    <p className="mt-1 text-base font-bold text-orange-600 dark:text-orange-400">
                      {weakTopicTitles.length > 0
                        ? `${weakTopicTitles.length} Weak / Due Topic(s)`
                        : 'Complete Beginner (From Scratch)'}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                      {weakTopicTitles.join(' · ') || 'All 8 roadmaps unlocked at Stage 1 Foundations (0% baseline)'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTutorTopicId(
                        weakTopicTitles.length > 0 ? 'pl-os-virtual-memory' : 'dsa-basics-arrays-complexity'
                      );
                      setActiveTab('ai-tutor');
                    }}
                    className="mt-3 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline text-left"
                  >
                    {weakTopicTitles.length > 0 ? 'Start Weak-Topic Revision →' : 'Start Stage 1 Foundation Lesson →'}
                  </button>
                </div>
              </section>

              {/* Schedule Section & Autonomous Learning Queue */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Timetable Preview */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Today&apos;s {todayTemplate.name} Timetable ({todayTemplate.wakeTime} – {todayTemplate.sleepTime})
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        Protected Sleep: {Math.round(todayTemplate.minSleepMinutes / 60)}h · Learning Allocation: {todayTemplate.totalLearningMinutes}m · Academic Limit: {todayTemplate.maxAcademicMinutes}m
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('timetable')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                    >
                      Full Timetable ({todayTemplate.activities.length} slots) →
                    </button>
                  </div>

                  <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                    {todayTemplate.activities.map((act) => (
                      <div
                        key={act.id}
                        className="py-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums w-36 shrink-0">
                          {act.displayTime}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100 flex-1 truncate">
                          {act.title}
                        </span>
                        <span className={`font-medium shrink-0 ${getCategoryColorText(act.category)}`}>
                          {act.durationMinutes}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Autonomous Learning Sessions & Coach Insights */}
                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        AI Selected Sessions Today
                      </h2>
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        {dailySessions.length} slots
                      </span>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      {dailySessions.map((sess) => (
                        <div
                          key={sess.sessionId}
                          className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono text-[11px] text-blue-600 dark:text-blue-400 tabular-nums">
                            <span>{sess.displayTime}</span>
                            <span>{sess.goalId.toUpperCase()}</span>
                          </div>
                          <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                            {sess.topicTitle}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {sess.autonomousReason}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTutorTopicId(sess.topicId);
                                setActiveTab('ai-tutor');
                              }}
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Open in AI Tutor →
                            </button>
                            {sess.status === 'SCHEDULED' ? (
                              <button
                                type="button"
                                onClick={() => handleMarkSessionMissed(sess)}
                                className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline"
                              >
                                Missed?
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-orange-600">
                                {sess.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Exams & Active Project Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-xs space-y-3">
                    <div>
                      <p className="font-bold text-orange-600 dark:text-orange-400">
                        Upcoming Examination Window (25 Days)
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                        Semester V University Core CS Exams (Dec 10 – Dec 18, 2026)
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Subjects: DBMS (CS3501) &amp; Operating Systems (CS3502)
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-violet-600 dark:text-violet-400">
                        Recommended Starter Portfolio Project (From Scratch)
                      </p>
                      <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
                        {workspace.layer3Career.projects[0]?.title ||
                          'Responsive Personal Learning Portfolio & Interactive Task Tracker (From Scratch)'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('projects')}
                        className="mt-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Start Stage 1 Foundation Project →
                      </button>
                    </div>
                  </div>
                </div>
              </section>
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
              syllabusUpdates={workspace.layer2Learning.syllabusUpdates}
              activeMainSkill={workspace.layer2Learning.activeMainSkill}
              onSwitchMainSkill={handleSwitchMainSkill}
              onApproveSyllabusUpdate={handleApproveSyllabusUpdate}
              onRunTrustedSourceCheck={() => {}}
              onOpenTopicInTutor={(topicId) => {
                setActiveTutorTopicId(topicId);
                setActiveTab('ai-tutor');
              }}
            />
          )}

          {(activeTab === 'today-learning' || activeTab === 'ai-tutor') && (
            <StructuredTutorWorkspaceView
              selectedDate={selectedDate}
              dailySessions={dailySessions}
              roadmaps={workspace.layer2Learning.roadmaps}
              masteryRecords={workspace.layer2Learning.masteryRecords}
              activeTopicId={activeTutorTopicId}
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
                setWorkspace(restored);
                saveLocalWorkspaceState(restored);
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
