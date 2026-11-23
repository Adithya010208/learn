import {
  CompetitiveProgrammingRecord,
  GateSubjectProgress,
  LanguageProficiencyRecord,
  Layer3CareerEvaluationSnapshot,
  LearningRoadmap,
  PlacementDimensionMetric,
  ProjectRecommendation,
  SkillGapRecommendationContract,
  TopicMasteryRecord,
} from '../types/domain.ts';

/**
 * LAYER 3 — CAREER GROWTH & OUTCOMES ENGINE
 *
 * Owns:
 * - Evidence-Based Placement Readiness Evaluation (2029 Graduation Target)
 * - GATE CSE Subject Mastery, PYQ & Mock Accuracy Tracking
 * - Competitive Programming Pattern & Rating Progression
 * - Japanese (JLPT N5) & English Communication Proficiency
 * - Skill-Gated Project Recommendation Engine (Beginner -> Portfolio-Ready)
 * - Skill-Gap Analysis & Feedback Signals back to Layer 2 (Learning Intelligence)
 */

export const INITIAL_PROJECTS: ProjectRecommendation[] = [
  {
    id: 'proj-beginner-html-portfolio',
    title: 'Responsive Personal Learning Portfolio & Interactive Task Tracker (From Scratch)',
    category: 'Beginner',
    status: 'Recommended',
    goalId: 'fullstack',
    objective: 'Build your very first responsive web page from scratch using semantic HTML5, CSS Flexbox, and vanilla JavaScript DOM events.',
    problemSolved: 'Gives you a hands-on beginner foundation in how HTML structure, CSS layout, and JavaScript state work together without frameworks.',
    requiredSkills: ['HTML5 Semantic Tags', 'CSS Flexbox', 'JavaScript Variables & Click Events'],
    techStack: ['HTML5', 'CSS3 Flexbox', 'JavaScript (ES6+)'],
    prerequisiteTopicIds: ['fs-web-html-css-js-scratch'],
    featureBreakdown: [
      'Personal bio header & 2029 Placement goal banner',
      'Interactive daily study task checklist with live counter',
      'Responsive Flexbox card grid for desktop and mobile',
    ],
    developmentStages: [
      { stage: '1. Semantic HTML5 Structure & Bio Section', completed: false },
      { stage: '2. CSS Flexbox Layout & Dark/Light Styling', completed: false },
      { stage: '3. JavaScript Interactive Task Counter', completed: false },
    ],
    testingRequirements: [
      'Verify layout on mobile (390px) and desktop (1440px)',
      'Verify task counter increments and resets accurately',
    ],
    completionCriteria: [
      'All 3 stages checked off after mastering Stage 1 Web Development',
    ],
    portfolioValue: 'Your very first completed web engineering project built from scratch.',
    repositoryUrl: 'https://github.com/adhi-dev/beginner-portfolio-tracker',
  },
  {
    id: 'proj-dsa-visualizer-deque',
    title: 'Interactive Array & Sliding Window Dry-Run Visualizer',
    category: 'Beginner',
    status: 'Planned',
    goalId: 'dsa_cp',
    objective: 'Visualize array indices, loop counters, and two-pointer / sliding window steps interactively.',
    problemSolved: 'Helps beginners see how index pointers move across arrays and why O(N) beats nested O(N^2) loops.',
    requiredSkills: ['Arrays & Loops', 'Big-O Complexity', 'Sliding Window'],
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    prerequisiteTopicIds: ['dsa-basics-arrays-complexity', 'dsa-sliding-window-monotonic'],
    featureBreakdown: [
      'Step-by-step array index pointer highlighter',
      'Custom array input & operation counter proving O(N) steps',
    ],
    developmentStages: [
      { stage: '1. Array Traversal & Max/Sum Stepper', completed: false },
      { stage: '2. Two-Pointer & Sliding Window View', completed: false },
      { stage: '3. Big-O Operation Comparison Chart', completed: false },
    ],
    testingRequirements: ['Pass edge-case arrays including negative numbers and single-element arrays'],
    completionCriteria: ['Complete after mastering Stage 1 & Stage 2 DSA topics'],
    portfolioValue: 'Proves strong algorithmic fundamentals and visual debugging clarity.',
    repositoryUrl: 'https://github.com/adhi-dev/dsa-array-window-visualizer',
  },
  {
    id: 'proj-jwt-rbac-launchpad',
    title: 'Zero-Trust OAuth & RBAC API Gateway with Audit Telemetry',
    category: 'Intermediate',
    status: 'Planned',
    goalId: 'fullstack',
    objective: 'Build a production-grade Express + PostgreSQL REST service implementing asymmetric JWT verification, composite-indexed query scoping, and tamper-evident audit logs.',
    problemSolved: 'Eliminates Broken Object Level Authorization (IDOR) and unindexed query bottlenecks in multi-tenant SaaS backends.',
    requiredSkills: ['TypeScript', 'Express', 'PostgreSQL B+ Tree Indexing', 'OAuth 2.0 / JWT'],
    techStack: ['React 19', 'TypeScript', 'Node.js / Express', 'Drizzle ORM', 'PostgreSQL'],
    prerequisiteTopicIds: ['pl-cs-foundations-scratch', 'pl-dbms-indexing', 'fs-web-html-css-js-scratch', 'fs-jwt-oauth-architecture'],
    featureBreakdown: [
      'Asymmetric RS256 Bearer token verification middleware',
      'Composite B+ Tree index on (user_uid, created_at) verified via EXPLAIN ANALYZE',
      'Role-based route guards with automated integration test suite',
    ],
    developmentStages: [
      { stage: '1. Schema & Composite Index Design', completed: false },
      { stage: '2. JWT Middleware & IDOR Prevention', completed: false },
      { stage: '3. Integration Test Suite & Benchmark Report', completed: false },
    ],
    testingRequirements: [
      'Unit test token expiration and cross-user IDOR rejection (403/404)',
      'Verify < 5ms query execution time on 10,000 seeded rows',
    ],
    completionCriteria: [
      'All integration tests green',
      'EXPLAIN ANALYZE proof documented in README',
    ],
    portfolioValue: 'Demonstrates verifiable backend security and database indexing competence for product-company SDE interviews.',
    repositoryUrl: 'https://github.com/adhi-dev/zero-trust-rbac-gateway',
  },
  {
    id: 'proj-distributed-job-scheduler',
    title: 'Fault-Tolerant Distributed Task Scheduler with Dead-Letter Queue',
    category: 'Portfolio-ready',
    status: 'Planned',
    goalId: 'placement',
    objective: 'Architect a high-throughput job scheduler supporting cron expressions, exponential backoff retries, idempotency keys, and worker heartbeats.',
    problemSolved: 'Prevents duplicate task execution and lost background jobs during worker crashes.',
    requiredSkills: ['DBMS Isolation Levels', 'OS Concurrency', 'Full-Stack APIs', 'Binary Lifting / Priority Queues'],
    techStack: ['TypeScript', 'Node.js', 'PostgreSQL `FOR UPDATE SKIP LOCKED`', 'React Telemetry UI'],
    prerequisiteTopicIds: ['pl-cs-foundations-scratch', 'pl-dbms-indexing', 'pl-os-virtual-memory', 'fs-jwt-oauth-architecture'],
    featureBreakdown: [
      'PostgreSQL `SELECT ... FOR UPDATE SKIP LOCKED` atomic job claiming',
      'Configurable exponential backoff with jitter & Dead-Letter Queue (DLQ) replay',
      'Real-time worker throughput & p99 latency dashboard',
    ],
    developmentStages: [
      { stage: '1. Atomic Lock Acquisition & Schema', completed: false },
      { stage: '2. Worker Heartbeat & Retry Engine', completed: false },
      { stage: '3. Chaos Fault Injection Verification', completed: false },
    ],
    testingRequirements: ['Zero duplicate executions across 8 concurrent workers under simulated crash'],
    completionCriteria: ['Complete benchmark report and architectural diagram for resume highlight'],
    portfolioValue: 'Flagship Tier-1 product-company portfolio project combining DBMS locking, OS concurrency, and full-stack engineering.',
  },
];

export const INITIAL_GATE_SUBJECTS: GateSubjectProgress[] = [
  {
    subject: 'Engineering & Discrete Mathematics (Start Here)',
    isOfficialSyllabus: true,
    topicsCompleted: 0,
    totalTopics: 10,
    masteryPercent: 0,
    pyqSolved: 0,
    pyqTotal: 85,
    mockAccuracyPercent: 0,
    isWeakSubject: false,
    revisionCycleStatus: 'UP_TO_DATE',
  },
  {
    subject: 'Theory of Computation (TOC)',
    isOfficialSyllabus: true,
    topicsCompleted: 0,
    totalTopics: 7,
    masteryPercent: 0,
    pyqSolved: 0,
    pyqTotal: 55,
    mockAccuracyPercent: 0,
    isWeakSubject: false,
    revisionCycleStatus: 'UP_TO_DATE',
  },
  {
    subject: 'Algorithms & Programming Foundations',
    isOfficialSyllabus: true,
    topicsCompleted: 0,
    totalTopics: 10,
    masteryPercent: 0,
    pyqSolved: 0,
    pyqTotal: 70,
    mockAccuracyPercent: 0,
    isWeakSubject: false,
    revisionCycleStatus: 'UP_TO_DATE',
  },
  {
    subject: 'Database Management Systems (DBMS)',
    isOfficialSyllabus: true,
    topicsCompleted: 0,
    totalTopics: 8,
    masteryPercent: 0,
    pyqSolved: 0,
    pyqTotal: 60,
    mockAccuracyPercent: 0,
    isWeakSubject: false,
    revisionCycleStatus: 'UP_TO_DATE',
  },
  {
    subject: 'Operating Systems (OS)',
    isOfficialSyllabus: true,
    topicsCompleted: 0,
    totalTopics: 9,
    masteryPercent: 0,
    pyqSolved: 0,
    pyqTotal: 65,
    mockAccuracyPercent: 0,
    isWeakSubject: false,
    revisionCycleStatus: 'UP_TO_DATE',
  },
  {
    subject: 'Computer Networks (CN)',
    isOfficialSyllabus: true,
    topicsCompleted: 0,
    totalTopics: 8,
    masteryPercent: 0,
    pyqSolved: 0,
    pyqTotal: 50,
    mockAccuracyPercent: 0,
    isWeakSubject: false,
    revisionCycleStatus: 'UP_TO_DATE',
  },
];

export const INITIAL_CP_RECORD: CompetitiveProgrammingRecord = {
  totalSolved: 0,
  easySolved: 0,
  mediumSolved: 0,
  hardSolved: 0,
  currentRating: 0,
  targetRating: 1650,
  patternsMastered: [
    { pattern: 'Stage 1: Arrays, Loops & Time Complexity (From Scratch)', solved: 0, target: 25, accuracy: 0 },
    { pattern: 'Stage 2: Strings & Frequency Hash Maps', solved: 0, target: 25, accuracy: 0 },
    { pattern: 'Stage 3: Two Pointers & Sliding Window', solved: 0, target: 30, accuracy: 0 },
    { pattern: 'Stage 4: Binary Search Fundamentals', solved: 0, target: 25, accuracy: 0 },
    { pattern: 'Stage 5: Recursion, Trees & Graphs', solved: 0, target: 45, accuracy: 0 },
  ],
  commonMistakes: [
    'Complete Beginner Tip #1: Always check 0-based array bounds (0 to length - 1)',
    'Complete Beginner Tip #2: Initialize maxVal to nums[0] instead of 0 when negative numbers can appear',
  ],
  recentContests: [],
};

export const INITIAL_LANGUAGE_PROFICIENCY: LanguageProficiencyRecord = {
  japanese: {
    targetLevel: 'JLPT N5',
    vocabularyCount: 0,
    vocabularyTarget: 800,
    grammarPointsMastered: 0,
    grammarTarget: 80,
    readingScorePercent: 0,
    listeningScorePercent: 0,
    practiceTestsCompleted: 0,
    srsDueCount: 0,
    readinessPercent: 0,
  },
  english: {
    speakingSessionsCompleted: 0,
    pronunciationClarityScore: 0,
    vocabularyActiveCount: 0,
    grammarAccuracyPercent: 0,
    listeningComprehensionPercent: 0,
    interviewCommunicationScore: 0,
    fluencyConfidenceScore: 0,
  },
};

/**
 * LAYER 2 -> LAYER 3 -> LAYER 2 CLOSED-LOOP EVALUATION:
 * Evaluates verified learning evidence (mastery records, assessment accuracy, completed projects, CP & GATE stats)
 * and outputs concrete placement readiness metrics + skill-gap recommendations for Layer 2.
 */
export function evaluateCareerOutcomesAndSkillGaps(
  roadmaps: LearningRoadmap[],
  masteryMap: Record<string, TopicMasteryRecord>,
  projects: ProjectRecommendation[],
  gateSubjects: GateSubjectProgress[] = INITIAL_GATE_SUBJECTS,
  cpRecord: CompetitiveProgrammingRecord = INITIAL_CP_RECORD,
  languages: LanguageProficiencyRecord = INITIAL_LANGUAGE_PROFICIENCY
): Layer3CareerEvaluationSnapshot {
  const masteryValues = Object.values(masteryMap);
  const completedProjects = projects.filter((p) => p.status === 'Completed');
  const inProgressProjects = projects.filter((p) => p.status === 'In progress');

  // Compute Core CS score from actual placement/gate mastery records
  const coreCsRecords = masteryValues.filter((m) => m.goalId === 'placement' || m.goalId === 'gate_cse');
  const coreCsAvgUnderstanding =
    coreCsRecords.length > 0
      ? Math.round(coreCsRecords.reduce((s, r) => s + r.understandingLevel, 0) / coreCsRecords.length)
      : 0;

  // Compute DSA score from actual DSA mastery records + CP problem evidence
  const dsaRecords = masteryValues.filter((m) => m.goalId === 'dsa_cp');
  const dsaAvgUnderstanding =
    dsaRecords.length > 0
      ? Math.round(dsaRecords.reduce((s, r) => s + r.understandingLevel, 0) / dsaRecords.length)
      : 0;
  const dsaVerifiedScore = Math.min(
    100,
    Math.round(dsaAvgUnderstanding * 0.7 + Math.min(100, (cpRecord.totalSolved / 150) * 100) * 0.3)
  );

  // Compute Technical Projects score from actual completed & in-progress projects
  const projectScore = Math.min(100, completedProjects.length * 45 + inProgressProjects.length * 25);

  // Compute Full-Stack / Practical Engineering score
  const fsRecords = masteryValues.filter((m) => m.goalId === 'fullstack');
  const fsScore =
    fsRecords.length > 0
      ? Math.round(fsRecords.reduce((s, r) => s + r.understandingLevel, 0) / fsRecords.length)
      : 0;

  // Compute English communication score from actual English mastery records + logged sessions
  const engRecords = masteryValues.filter((m) => m.goalId === 'english');
  const engMasteryAvg =
    engRecords.length > 0
      ? Math.round(engRecords.reduce((s, r) => s + r.understandingLevel, 0) / engRecords.length)
      : 0;
  const commScore = Math.min(
    100,
    Math.max(languages.english.interviewCommunicationScore, engMasteryAvg + languages.english.speakingSessionsCompleted * 5)
  );

  // Compute GATE / Aptitude score from GATE mastery records
  const gateRecords = masteryValues.filter((m) => m.goalId === 'gate_cse');
  const gateMasteryAvg =
    gateRecords.length > 0
      ? Math.round(gateRecords.reduce((s, r) => s + r.understandingLevel, 0) / gateRecords.length)
      : 0;

  const placementDimensions: PlacementDimensionMetric[] = [
    {
      id: 'dim-dsa',
      label: 'DSA & Problem-Solving (From Scratch)',
      verifiedScore: dsaVerifiedScore,
      evidenceSummary:
        cpRecord.totalSolved === 0 && dsaAvgUnderstanding === 0
          ? 'Complete Beginner Baseline (0 solved) — Start Stage 1: Arrays, Loops & Big-O today'
          : `${cpRecord.totalSolved} problems solved · Stage Mastery Avg: ${dsaAvgUnderstanding}%`,
      targetBenchmark: 'Step 1: Master Arrays & Loops -> Step 2: 150+ problems across core patterns',
      status: dsaVerifiedScore >= 75 ? 'ON_TRACK' : 'NEEDS_ATTENTION',
    },
    {
      id: 'dim-core-cs',
      label: 'Core CS Foundations (Databases, OS, Networks)',
      verifiedScore: coreCsAvgUnderstanding,
      evidenceSummary:
        coreCsAvgUnderstanding === 0
          ? 'Complete Beginner Baseline — Start Stage 1: How Memory, Tables & SQL Work'
          : `Core CS Verified Mastery Average: ${coreCsAvgUnderstanding}%`,
      targetBenchmark: 'Step 1: Basic Tables & SQL -> Step 2: Indexing, Transactions & OS Memory',
      status: coreCsAvgUnderstanding >= 75 ? 'ON_TRACK' : 'NEEDS_ATTENTION',
    },
    {
      id: 'dim-projects',
      label: 'Web Development & Practical Projects (From Scratch)',
      verifiedScore: Math.round((projectScore + fsScore) / 2),
      evidenceSummary:
        completedProjects.length === 0 && fsScore === 0
          ? 'Complete Beginner Baseline — Start Stage 1: HTML5, CSS Flexbox & JavaScript Basics'
          : `${completedProjects.length} Completed, ${inProgressProjects.length} In Progress · Web Mastery: ${fsScore}%`,
      targetBenchmark: 'Step 1: First HTML/CSS/JS Page -> Step 2: Full-Stack Apps for 2029 Placement',
      status: projectScore >= 65 ? 'ON_TRACK' : 'NEEDS_ATTENTION',
    },
    {
      id: 'dim-comm',
      label: 'English Speaking & Interview Confidence',
      verifiedScore: commScore,
      evidenceSummary:
        languages.english.speakingSessionsCompleted === 0 && engMasteryAvg === 0
          ? 'Complete Beginner Baseline — Start Stage 1: Daily 25m Spoken English & Clear Sentences'
          : `${languages.english.speakingSessionsCompleted} speaking sessions logged · Articulation: ${commScore}%`,
      targetBenchmark: 'Daily 8:00–8:25 PM speaking practice & structured PREP/STAR answers',
      status: commScore >= 75 ? 'ON_TRACK' : 'NEEDS_ATTENTION',
    },
    {
      id: 'dim-aptitude',
      label: 'Logic, Aptitude & GATE CSE Foundations',
      verifiedScore: gateMasteryAvg,
      evidenceSummary:
        gateMasteryAvg === 0
          ? 'Complete Beginner Baseline — Start Stage 1: Propositional Logic, Sets & DFA Basics'
          : `GATE & Discrete Logic Verified Mastery: ${gateMasteryAvg}%`,
      targetBenchmark: 'Master Propositional Logic & Finite Automata before PYQ drills',
      status: gateMasteryAvg >= 75 ? 'ON_TRACK' : 'NEEDS_ATTENTION',
    },
    {
      id: 'dim-portfolio',
      label: 'GitHub Portfolio & 2029 Placement Resume',
      verifiedScore: Math.min(100, completedProjects.length * 35 + (fsScore >= 80 ? 20 : 0)),
      evidenceSummary: `${completedProjects.length} verified beginner-to-advanced GitHub projects completed`,
      targetBenchmark: 'Build 3 progressive projects from scratch before 2028/2029 placement drives',
      status: completedProjects.length >= 2 ? 'ON_TRACK' : 'NEEDS_ATTENTION',
    },
  ];

  const overallPlacementReadinessPercent = Math.round(
    placementDimensions.reduce((sum, d) => sum + d.verifiedScore, 0) / placementDimensions.length
  );

  const gateSubjectAvg = Math.round(
    gateSubjects.reduce((sum, s) => sum + s.masteryPercent, 0) / gateSubjects.length
  );
  const gateOverallReadinessPercent = Math.max(gateSubjectAvg, gateMasteryAvg);

  // Generate closed-loop Skill Gap Recommendations for Layer 2 (Beginner-First Order!)
  const skillGapsForLayer2: SkillGapRecommendationContract[] = [];

  if ((masteryMap['dsa-basics-arrays-complexity']?.understandingLevel ?? 0) < 80) {
    skillGapsForLayer2.push({
      id: 'gap-dsa-beginner',
      targetGoalId: 'dsa_cp',
      gapArea: 'Stage 1 Beginner Foundation: Arrays, Loops & Big-O Time Complexity',
      evidenceBasis: 'Starting from scratch (0% mastery) — required before Sliding Window & Two-Pointers.',
      recommendedTopicId: 'dsa-basics-arrays-complexity',
      urgency: 'HIGH',
      actionForLayer2: 'Schedule Stage 1 Arrays, Loops & Big-O in the daily DSA slot.',
    });
  } else if ((masteryMap['dsa-sliding-window-monotonic']?.understandingLevel ?? 0) < 80) {
    skillGapsForLayer2.push({
      id: 'gap-dsa-window',
      targetGoalId: 'dsa_cp',
      gapArea: 'Stage 2: Sliding Window & Two-Pointer Patterns',
      evidenceBasis: 'Stage 1 Arrays mastered — ready to advance to Stage 2 Sliding Window.',
      recommendedTopicId: 'dsa-sliding-window-monotonic',
      urgency: 'MEDIUM',
      actionForLayer2: 'Advance to Variable-Size Sliding Window.',
    });
  }

  if ((masteryMap['fs-web-html-css-js-scratch']?.understandingLevel ?? 0) < 80) {
    skillGapsForLayer2.push({
      id: 'gap-fs-beginner',
      targetGoalId: 'fullstack',
      gapArea: 'Stage 1 Beginner Foundation: HTML5, CSS Flexbox & JavaScript Basics',
      evidenceBasis: 'Starting Full-Stack from scratch (0% mastery) — required before Backend APIs & Auth.',
      recommendedTopicId: 'fs-web-html-css-js-scratch',
      urgency: 'HIGH',
      actionForLayer2: 'Schedule Stage 1 Web Foundations in the daily Development slot.',
    });
  }

  if ((masteryMap['pl-cs-foundations-scratch']?.understandingLevel ?? 0) < 80) {
    skillGapsForLayer2.push({
      id: 'gap-pl-beginner',
      targetGoalId: 'placement',
      gapArea: 'Stage 1 Beginner Foundation: How Memory, Tables & SQL Queries Work',
      evidenceBasis: 'Starting Core CS from scratch (0% mastery) — required before B+ Tree Indexing & OS Virtual Memory.',
      recommendedTopicId: 'pl-cs-foundations-scratch',
      urgency: 'HIGH',
      actionForLayer2: 'Schedule Stage 1 Core CS Foundations first.',
    });
  }

  if ((masteryMap['gate-foundations-logic-dfa']?.understandingLevel ?? 0) < 80) {
    skillGapsForLayer2.push({
      id: 'gap-gate-beginner',
      targetGoalId: 'gate_cse',
      gapArea: 'Stage 1 Beginner Foundation: Propositional Logic, Sets & Intro to DFA',
      evidenceBasis: 'Starting GATE CSE from scratch (0% mastery) — required before Closure Properties & Pumping Lemma.',
      recommendedTopicId: 'gate-foundations-logic-dfa',
      urgency: 'HIGH',
      actionForLayer2: 'Schedule Stage 1 GATE Logic & DFA Foundations in the 6:25–7:10 PM GATE slot.',
    });
  }

  const jpMasteryAvg =
    masteryValues
      .filter((m) => m.goalId === 'japanese')
      .reduce((s, r) => s + r.understandingLevel, 0) /
    Math.max(1, masteryValues.filter((m) => m.goalId === 'japanese').length);

  return {
    overallPlacementReadinessPercent,
    graduationTargetYear: 2029,
    placementDimensions,
    gateOverallReadinessPercent,
    gateSubjects,
    cpRecord,
    languages: {
      japanese: {
        ...languages.japanese,
        readinessPercent: Math.max(
          languages.japanese.readinessPercent,
          Math.min(100, Math.round(jpMasteryAvg * 0.5 + (languages.japanese.vocabularyCount / 800) * 50))
        ),
      },
      english: {
        ...languages.english,
        interviewCommunicationScore: commScore,
      },
    },
    skillGapsForLayer2,
    portfolioReadyProjectsCount: completedProjects.length,
    resumeReadinessPercent: Math.min(100, completedProjects.length * 35),
  };
}

/**
 * Evaluates whether a project's prerequisites are satisfied by actual Layer 2 mastery records.
 */
export function evaluateProjectReadiness(
  project: ProjectRecommendation,
  masteryMap: Record<string, TopicMasteryRecord>
): { ready: boolean; missingPrerequisiteIds: string[] } {
  const missing = project.prerequisiteTopicIds.filter((topicId) => {
    const rec = masteryMap[topicId];
    return !rec || rec.understandingLevel < 70;
  });
  return {
    ready: missing.length === 0,
    missingPrerequisiteIds: missing,
  };
}
