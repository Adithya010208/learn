import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyConfirmedModeChange,
  buildModeChangePreview,
  createInitialTemplates,
  parseHolidayImportContent,
  prepareExamModeActivation,
  publishDailyAvailability,
  restorePostExamConfiguration,
  resolveDateMode,
  validateScheduleConstraints,
} from '../layers/layer1Schedule.ts';
import {
  checkAndUnlockContinuousLearning,
  createInitialMasteryRecords,
  evaluateAssessmentAndMastery,
  INITIAL_ROADMAPS,
  planMissedSessionRecovery,
  selectAutonomousDailySessions,
  switchActiveMainSkillTrack,
} from '../layers/layer2Learning.ts';
import {
  evaluateCareerOutcomesAndSkillGaps,
  evaluateProjectReadiness,
  INITIAL_PROJECTS,
} from '../layers/layer3Career.ts';
import { ExamConfiguration } from '../types/domain.ts';

test('Layer 1: Working Day and Holiday templates satisfy exact timetable & health constraints', () => {
  const templates = createInitialTemplates();
  const wd = templates.WORKING_DAY;
  const hol = templates.HOLIDAY;

  assert.equal(wd.activities.length, 20, 'Working Day must have all 20 timetable slots');
  assert.equal(hol.activities.length, 22, 'Holiday must have all 22 timetable slots');

  const wdValidation = validateScheduleConstraints(wd);
  assert.equal(wdValidation.valid, true, `Working Day validation failed: ${wdValidation.errors.join('; ')}`);

  const holValidation = validateScheduleConstraints(hol);
  assert.equal(holValidation.valid, true, `Holiday validation failed: ${holValidation.errors.join('; ')}`);

  // Verify 5-minute arrival buffer and 7:00 AM - 5:00 PM college commitment
  const buffer = wd.activities.find((a) => a.id === 'wd-07');
  assert.equal(buffer?.durationMinutes, 5);
  const college = wd.activities.find((a) => a.id === 'wd-08');
  assert.equal(college?.durationMinutes, 600);
  assert.equal(college?.isFixedCommitment, true);
});

test('Layer 1: Default mode is Working Day even on weekends unless explicitly assigned', () => {
  const assignments = {};
  // 2026-11-15 is a Sunday; must still default to WORKING_DAY with isExplicit: false
  const sundayResolved = resolveDateMode('2026-11-15', assignments);
  assert.equal(sundayResolved.mode, 'WORKING_DAY');
  assert.equal(sundayResolved.isExplicit, false);

  const templates = createInitialTemplates();
  const preview = buildModeChangePreview(['2026-11-15', '2026-11-16'], 'HOLIDAY', assignments, templates);
  assert.equal(preview.affectedCount, 2);
  assert.equal(preview.dominantPreviousMode, 'WORKING_DAY');
  assert.equal(preview.newMode, 'HOLIDAY');

  const updated = applyConfirmedModeChange(['2026-11-15'], 'HOLIDAY', assignments);
  assert.equal(resolveDateMode('2026-11-15', updated).mode, 'HOLIDAY');
  assert.equal(resolveDateMode('2026-11-15', updated).isExplicit, true);
  // Unselected date remains untouched default Working Day
  assert.equal(resolveDateMode('2026-11-16', updated).mode, 'WORKING_DAY');
  assert.equal(resolveDateMode('2026-11-16', updated).isExplicit, false);
});

test('Layer 1: Holiday CSV import detects valid dates, duplicates, invalid formats, and exam conflicts', () => {
  const existing = applyConfirmedModeChange(['2026-11-20'], 'EXAM_MODE', {});
  const csv = [
    'date,label',
    '2026-11-18,Founder Day',
    '2026-11-18,Duplicate Founder Day',
    '2026-02-30,Invalid Calendar Date',
    '2026-11-20,Overlaps With Exam',
  ].join('\n');

  const parsed = parseHolidayImportContent(csv, existing);
  assert.equal(parsed.validNewCount, 1);
  assert.equal(parsed.duplicateCount, 1);
  assert.equal(parsed.invalidCount, 1);
  assert.equal(parsed.conflictCount, 1);
});

test('Layer 1: Exam Mode snapshots previous configuration and restores it cleanly after completion', () => {
  let assignments = applyConfirmedModeChange(['2026-12-02'], 'HOLIDAY', {});
  const exam: ExamConfiguration = {
    id: 'exam-sem-5',
    title: 'University End-Semester Examinations',
    startDate: '2026-12-01',
    endDate: '2026-12-03',
    status: 'ACTIVE',
    subjects: [],
    dailyRevisionPlan: [],
    previousDateAssignmentsSnapshot: {},
    previousActiveMainSkill: 'fullstack',
  };

  const prep = prepareExamModeActivation(exam, assignments);
  assert.equal(prep.conflictingDates.length, 1);
  assert.equal(prep.conflictingDates[0].date, '2026-12-02');
  assert.equal(prep.previousSnapshot['2026-12-01'], 'WORKING_DAY');
  assert.equal(prep.previousSnapshot['2026-12-02'], 'HOLIDAY');

  exam.previousDateAssignmentsSnapshot = prep.previousSnapshot;
  assignments = applyConfirmedModeChange(prep.examDates, 'EXAM_MODE', assignments, 'WORKING_DAY', {
    examId: exam.id,
  });
  assert.equal(resolveDateMode('2026-12-02', assignments).mode, 'EXAM_MODE');

  // Restore post-exam configuration
  const restored = restorePostExamConfiguration(exam, assignments);
  assert.equal(resolveDateMode('2026-12-01', restored).mode, 'WORKING_DAY');
  assert.equal(resolveDateMode('2026-12-02', restored).mode, 'HOLIDAY');
});

test('Layer 2: One-Main-Skill-at-a-Time rule enforces a single active main technical track', () => {
  const activeBefore = INITIAL_ROADMAPS.filter((r) => r.isMainTechnicalTrack && r.isActiveMainSkill);
  assert.equal(activeBefore.length, 1);
  assert.equal(activeBefore[0].goalId, 'fullstack');

  const switched = switchActiveMainSkillTrack(INITIAL_ROADMAPS, 'cybersecurity');
  const activeAfter = switched.filter((r) => r.isMainTechnicalTrack && r.isActiveMainSkill);
  assert.equal(activeAfter.length, 1);
  assert.equal(activeAfter[0].goalId, 'cybersecurity');
});

test('Layer 2: Evidence-based Mastery Engine requires quiz >= 80% AND practical completion', () => {
  const masteryMap = createInitialMasteryRecords();

  // Verify every single topic starts at NOT_STARTED (0%) for a complete beginner
  for (const rec of Object.values(masteryMap)) {
    assert.equal(rec.status, 'NOT_STARTED');
    assert.equal(rec.understandingLevel, 0);
  }

  // Attempt with 100% quiz score but practicalCompleted = false -> must remain IN_PROGRESS, NOT MASTERED
  const withoutPractical = evaluateAssessmentAndMastery(
    undefined,
    'dsa-trees-lca-dp',
    'dsa_cp',
    2,
    2,
    [],
    false,
    '2026-11-15'
  );
  assert.equal(withoutPractical.status, 'IN_PROGRESS');

  // Attempt with 100% quiz score AND practicalCompleted = true -> becomes MASTERED
  const withPractical = evaluateAssessmentAndMastery(
    withoutPractical,
    'dsa-trees-lca-dp',
    'dsa_cp',
    2,
    2,
    [],
    true,
    '2026-11-15'
  );
  assert.equal(withPractical.status, 'MASTERED');
  assert.ok(withPractical.understandingLevel >= 80);
  assert.ok(withPractical.nextReviewDate > '2026-11-15');

  // Verify Continuous Learning unlocks when all topics in a roadmap reach MASTERED
  const dsaRoadmap = structuredClone(INITIAL_ROADMAPS.find((r) => r.goalId === 'dsa_cp')!);
  for (const topic of dsaRoadmap.topics) {
    masteryMap[topic.id] = evaluateAssessmentAndMastery(
      undefined, topic.id, topic.goalId, 2, 2, [], true, '2026-11-15',
    );
  }

  const unlocked = checkAndUnlockContinuousLearning(dsaRoadmap, masteryMap);
  assert.equal(unlocked.unlockedNewSpecialization, true);
  assert.equal(unlocked.updatedRoadmap.topics.length, dsaRoadmap.topics.length + 1);
});

test('Layer 2 & Layer 3 Integration: Complete Beginner From-Scratch Schedule -> Learning -> Career -> Skill-Gap loop', () => {
  const templates = createInitialTemplates();
  const assignments = {};
  const availability = publishDailyAvailability('2026-11-15', assignments, templates, []);
  const masteryMap = createInitialMasteryRecords();

  // At Day 1 Complete Beginner baseline, overall readiness is 0% and emits Stage 1 foundation skill gaps
  const initialCareerSnapshot = evaluateCareerOutcomesAndSkillGaps(
    INITIAL_ROADMAPS,
    masteryMap,
    INITIAL_PROJECTS
  );
  assert.equal(initialCareerSnapshot.overallPlacementReadinessPercent, 0);
  assert.ok(initialCareerSnapshot.skillGapsForLayer2.length > 0);

  const sessions = selectAutonomousDailySessions(
    availability,
    INITIAL_ROADMAPS,
    masteryMap,
    initialCareerSnapshot.skillGapsForLayer2
  );
  assert.equal(sessions.length, 6, 'Working Day has 6 learning slots');

  // Verify that DSA, Full-Stack, GATE, and Japanese all schedule their Stage 1 From-Scratch Beginner topic first!
  const dsaSession = sessions.find((s) => s.goalId === 'dsa_cp')!;
  assert.equal(dsaSession.topicId, 'zero-dsa-first-program');
  const fsSession = sessions.find((s) => s.goalId === 'fullstack')!;
  assert.equal(fsSession.topicId, 'zero-fs-browser');
  const gateSession = sessions.find((s) => s.goalId === 'gate_cse')!;
  assert.equal(gateSession.topicId, 'zero-gate-numbers');
  const jpSession = sessions.find((s) => s.goalId === 'japanese')!;
  assert.equal(jpSession.topicId, 'zero-jp-sounds');

  // Verify missed session recovery preserves sleep and fixed commitments
  const recovery = planMissedSessionRecovery(dsaSession, masteryMap[dsaSession.topicId], 'WORKING_DAY', 15);
  assert.equal(recovery.protectedCommitmentsVerified, true);
  assert.ok(recovery.explanation.length > 20);

  // Verify Project readiness checks prerequisites accurately
  const advancedProj = INITIAL_PROJECTS.find((p) => p.id === 'proj-distributed-job-scheduler')!;
  const projCheck = evaluateProjectReadiness(advancedProj, masteryMap);
  assert.equal(projCheck.ready, false);
  assert.ok(projCheck.missingPrerequisiteIds.includes('pl-cs-foundations-scratch'));
});
