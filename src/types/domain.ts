/**
 * THREE-LAYER INDEPENDENT ARCHITECTURE — DATA CONTRACTS
 *
 * Layer 1: Schedule Management (Availability, Templates, Calendar, Constraints, Missed Slot Recovery)
 * Layer 2: Learning Intelligence (Roadmaps, Syllabuses, Mastery Engine, AI Tutor, Spaced Repetition)
 * Layer 3: Career Growth & Outcomes (Verified Evidence, Placement Readiness, GATE CSE, CP, Languages, Projects)
 */

export type DailyMode = 'WORKING_DAY' | 'HOLIDAY' | 'EXAM_MODE';

export type ActivityCategory =
  | 'SLEEP'
  | 'FITNESS'
  | 'PERSONAL_ROUTINE'
  | 'COLLEGE_COMMITMENT'
  | 'MEAL_BREAK'
  | 'DSA_CODING'
  | 'GATE_PREP'
  | 'DEVELOPMENT_SKILL'
  | 'JAPANESE'
  | 'ENGLISH'
  | 'ACADEMICS'
  | 'REVISION_PLANNING'
  | 'EXAM_PREP'
  | 'FREE_TIME';

export interface TimetableActivity {
  id: string;
  startTime: string; // e.g. "05:00" (24h)
  endTime: string;   // e.g. "05:10" (24h)
  displayTime: string; // e.g. "5:00–5:10 AM"
  title: string;
  category: ActivityCategory;
  durationMinutes: number;
  isFixedCommitment: boolean;
  isLearningSlot: boolean;
  targetGoalId?: GoalId;
  allowIndependentLearningInCollege?: boolean;
}

export interface TimetableTemplate {
  mode: DailyMode;
  name: string;
  description: string;
  wakeTime: string;
  sleepTime: string;
  minSleepMinutes: number;
  maxAcademicMinutes: number;
  collegeArrivalBufferMinutes: number;
  totalLearningMinutes: number;
  constraints: string[];
  activities: TimetableActivity[];
}

export interface DateModeAssignment {
  date: string; // YYYY-MM-DD
  mode: DailyMode;
  previousMode: DailyMode;
  isExplicit: boolean;
  isImportedHoliday?: boolean;
  holidayLabel?: string;
  examId?: string;
  updatedAt: string;
}

export interface ModeChangePreviewSummary {
  selectedDates: string[];
  previousModesByDate: Record<string, DailyMode>;
  dominantPreviousMode: DailyMode;
  newMode: DailyMode;
  affectedCount: number;
  overlappingExamDates: string[];
  resultingTemplate: TimetableTemplate;
}

export interface HolidayImportCandidate {
  rawLine: string;
  date: string;
  label: string;
  status: 'VALID_NEW' | 'DUPLICATE' | 'INVALID_FORMAT' | 'CONFLICT_EXAM';
  existingMode?: DailyMode;
}

export interface HolidayImportParseResult {
  candidates: HolidayImportCandidate[];
  validNewCount: number;
  duplicateCount: number;
  invalidCount: number;
  conflictCount: number;
}

export interface ExamUnitSyllabus {
  unitNumber: number;
  title: string;
  topics: string[];
  importantConcepts: string[];
  pyqCount: number;
  completedPyqs: number;
  masteryPercent: number;
  isWeakArea: boolean;
}

export interface ExamSubjectConfig {
  id: string;
  code: string;
  name: string;
  examDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  mockScorePercent: number;
  units: ExamUnitSyllabus[];
}

export interface ExamConfiguration {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED_RESTORED';
  subjects: ExamSubjectConfig[];
  dailyRevisionPlan: string[];
  previousDateAssignmentsSnapshot: Record<string, DailyMode>;
  previousActiveMainSkill: GoalId;
}

// ==========================================
// INTER-LAYER CONTRACT 1 -> 2: PUBLISHED AVAILABILITY
// ==========================================
export interface UnavailableTime {
  startTime: string;
  endTime: string;
}

export interface AvailableLearningSlotContract {
  slotId: string;
  date: string;
  mode: DailyMode;
  startTime: string;
  endTime: string;
  displayTime: string;
  durationMinutes: number;
  designatedCategory: ActivityCategory;
  suggestedGoalId?: GoalId;
}

export interface Layer1PublishedAvailability {
  date: string;
  assignedMode: DailyMode;
  isDefaultMode: boolean;
  activeExam?: ExamConfiguration;
  totalAvailableLearningMinutes: number;
  sleepProtectedMinutes: number;
  academicAllocatedMinutes: number;
  slots: AvailableLearningSlotContract[];
}

// ==========================================
// LAYER 2 — LEARNING INTELLIGENCE CONTRACTS
// ==========================================
export type GoalId =
  | 'placement'
  | 'gate_cse'
  | 'dsa_cp'
  | 'fullstack'
  | 'cybersecurity'
  | 'ai_ml'
  | 'japanese'
  | 'english';

export type SyllabusSourceType =
  | 'OFFICIAL_SYLLABUS'
  | 'CURATED_ROADMAP'
  | 'AI_GENERATED';

export type MasteryStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'NEEDS_REVISION'
  | 'MASTERED';

export interface StructuredLessonContent {
  conceptIntroduction: string;
  simpleExplanation: string;
  realWorldAnalogy: string;
  workedExample: string;
  stepByStepDemonstration: string[];
  programmingDetails?: {
    codeExample: string;
    lineByLineExplanation: string[];
    dryRunTrace: string;
    testCases: { input: string; expectedOutput: string; explanation: string }[];
    debuggingExercise: { buggyCode: string; hint: string; fixedCode: string };
    codingChallenge: { prompt: string; starterCode: string; solutionKey: string; complexityAnalysis: string };
  };
  theoreticalDetails?: {
    definitions: { term: string; definition: string }[];
    comparisons: { aspect: string; itemA: string; itemB: string }[];
    diagramAscii: string;
    applicationQuestions: string[];
  };
  guidedExercise: {
    question: string;
    steps: string[];
    expectedAnswer: string;
  };
  independentExercise: {
    prompt: string;
    evaluationRubric: string[];
  };
  quizQuestions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    mistakeCategory: string;
  }[];
  revisionRecommendation: string;
}

export interface RoadmapTopic {
  id: string;
  goalId: GoalId;
  stageId: string;
  stageTitle: string;
  title: string;
  subtopics: string[];
  prerequisites: string[]; // topic IDs
  estimatedDurationMinutes: number;
  objectives: string[];
  masteryCriteria: string;
  studyTask?: string;
  sourceType: SyllabusSourceType;
  isOfficialGateTopic?: boolean;
  isAdvancedContinuousTopic?: boolean;
  lesson: StructuredLessonContent;
}

export interface TopicMasteryRecord {
  topicId: string;
  goalId: GoalId;
  startedAt?: string;
  completedAt?: string;
  status: MasteryStatus;
  assessmentAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  mistakeCategories: string[];
  understandingLevel: number; // 0-100 verified by quiz + exercises
  retentionScore: number;     // 0-100 spaced repetition retention
  practicalPerformance: number; // 0-100
  practicalCompleted: boolean;
  intervalDays: number;
  easeFactor: number; // e.g. 2.5
  nextReviewDate: string; // YYYY-MM-DD
  lastStudiedDate?: string;
}

export interface LearningRoadmap {
  goalId: GoalId;
  title: string;
  shortTitle: string;
  priorityTier: 'PRIMARY_CAREER' | 'BACKUP_CAREER' | 'CORE_SUPPORT' | 'MAIN_TECHNICAL_SKILL' | 'CONTINUOUS_LANGUAGE';
  priorityRank: number;
  isMainTechnicalTrack: boolean;
  isActiveMainSkill: boolean;
  sourceType: SyllabusSourceType;
  authoritySource: string;
  authorityUrl: string;
  syllabusVersion: string;
  lastCheckedDate: string;
  description: string;
  topics: RoadmapTopic[];
  continuousSpecializations: string[];
}

export interface SyllabusUpdateRecord {
  id: string;
  goalId: GoalId;
  sourceName: string;
  sourceUrl: string;
  previousVersion: string;
  newVersion: string;
  detectedDate: string;
  changeType: 'MINOR_AUTO' | 'MAJOR_APPROVAL_REQUIRED';
  status: 'APPLIED_AUTOMATICALLY' | 'PENDING_USER_APPROVAL' | 'APPROVED' | 'REJECTED';
  changeDescription: string;
  affectedTopics: string[];
  recommendedAction: string;
}

export interface ScheduledLearningRecommendation {
  sessionId: string;
  date: string;
  slotId: string;
  displayTime: string;
  durationMinutes: number;
  goalId: GoalId;
  topicId: string;
  topicTitle: string;
  sessionType: 'NEW_CONCEPT' | 'REVISION_SPACED' | 'WEAK_AREA_RECOVERY' | 'PRACTICAL_PROJECT' | 'EXAM_UNIT_PREP';
  autonomousReason: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'PARTIAL' | 'MISSED' | 'RESCHEDULED' | 'SHORTENED';
  notes?: string;
  assessmentScore?: number;
  recoveryPlan?: MissedSessionRecoveryDecision;
}

export interface MissedSessionRecoveryDecision {
  missedSessionId: string;
  missedTopicId: string;
  missedTopicTitle: string;
  goalId: GoalId;
  importanceLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  action: 'RESCHEDULE_TODAY_BUFFER' | 'SHORTEN_HIGH_YIELD' | 'POSTPONE_NEXT_SIMILAR_SLOT' | 'ADAPT_TEACHING_PREREQUISITE';
  targetDate: string;
  targetSlotDisplay: string;
  recommendedDurationMinutes: number;
  explanation: string;
  isRepeatedDifficulty: boolean;
  protectedCommitmentsVerified: boolean;
}

// ==========================================
// LAYER 3 — CAREER GROWTH & OUTCOMES CONTRACTS
// ==========================================
export interface ProjectRecommendation {
  id: string;
  title: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced' | 'Portfolio-ready';
  status: 'Recommended' | 'Planned' | 'In progress' | 'Completed' | 'Archived';
  goalId: GoalId;
  objective: string;
  problemSolved: string;
  requiredSkills: string[];
  techStack: string[];
  prerequisiteTopicIds: string[];
  featureBreakdown: string[];
  developmentStages: { stage: string; completed: boolean }[];
  testingRequirements: string[];
  completionCriteria: string[];
  portfolioValue: string;
  repositoryUrl?: string;
  completedAt?: string;
}

export interface PlacementDimensionMetric {
  id: string;
  label: string;
  verifiedScore: number; // 0-100 computed purely from actual evidence
  evidenceSummary: string;
  targetBenchmark: string;
  status: 'ON_TRACK' | 'NEEDS_ATTENTION' | 'STRONG';
}

export interface GateSubjectProgress {
  subject: string;
  isOfficialSyllabus: boolean;
  topicsCompleted: number;
  totalTopics: number;
  masteryPercent: number;
  pyqSolved: number;
  pyqTotal: number;
  mockAccuracyPercent: number;
  isWeakSubject: boolean;
  revisionCycleStatus: 'UP_TO_DATE' | 'DUE_SOON' | 'OVERDUE';
}

export interface CompetitiveProgrammingRecord {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentRating: number;
  targetRating: number;
  patternsMastered: { pattern: string; solved: number; target: number; accuracy: number }[];
  commonMistakes: string[];
  recentContests: { name: string; date: string; rank: number; ratingDelta: number; solvedCount: string }[];
}

export interface LanguageProficiencyRecord {
  japanese: {
    targetLevel: 'JLPT N5';
    vocabularyCount: number;
    vocabularyTarget: number;
    grammarPointsMastered: number;
    grammarTarget: number;
    readingScorePercent: number;
    listeningScorePercent: number;
    practiceTestsCompleted: number;
    srsDueCount: number;
    readinessPercent: number;
  };
  english: {
    speakingSessionsCompleted: number;
    pronunciationClarityScore: number;
    vocabularyActiveCount: number;
    grammarAccuracyPercent: number;
    listeningComprehensionPercent: number;
    interviewCommunicationScore: number;
    fluencyConfidenceScore: number;
  };
}

export interface SkillGapRecommendationContract {
  id: string;
  targetGoalId: GoalId;
  gapArea: string;
  evidenceBasis: string;
  recommendedTopicId?: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  actionForLayer2: string;
}

export interface Layer3CareerEvaluationSnapshot {
  overallPlacementReadinessPercent: number;
  graduationTargetYear: number;
  placementDimensions: PlacementDimensionMetric[];
  gateOverallReadinessPercent: number;
  gateSubjects: GateSubjectProgress[];
  cpRecord: CompetitiveProgrammingRecord;
  languages: LanguageProficiencyRecord;
  skillGapsForLayer2: SkillGapRecommendationContract[];
  portfolioReadyProjectsCount: number;
  resumeReadinessPercent: number;
}

export interface NotificationPreferenceConfig {
  enableSessionReminders: boolean;
  reminderLeadMinutes: number;
  enableRevisionAlerts: boolean;
  enableAssessmentAlerts: boolean;
  enableExamCountdowns: boolean;
  enableMissedSessionRecovery: boolean;
  enableWeeklyReports: boolean;
  enableSyllabusUpdates: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string;   // "05:00"
}

export interface AppNotificationItem {
  id: string;
  category: 'SESSION' | 'REVISION' | 'ASSESSMENT' | 'EXAM' | 'MISSED_RECOVERY' | 'WEEKLY_REPORT' | 'SYLLABUS_UPDATE';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionTab?: string;
}
