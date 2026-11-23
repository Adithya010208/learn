import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_ROADMAPS } from '../layers/layer2Learning.ts';
import { createInitialWorkspaceState, migrateWorkspaceCurriculum } from '../services/offlineSync.ts';
import { evaluateCareerOutcomesAndSkillGaps } from '../layers/layer3Career.ts';

test('each curriculum is ordered by existing prerequisites with unique module IDs', () => {
  assert.equal(INITIAL_ROADMAPS.length, 8);
  const ids = new Set<string>();
  for (const roadmap of INITIAL_ROADMAPS) {
    assert.ok(roadmap.topics.length >= 7);
    const prior = new Set<string>();
    for (const topic of roadmap.topics) {
      assert.equal(topic.goalId, roadmap.goalId);
      assert.ok(!ids.has(topic.id), topic.id);
      assert.ok(topic.prerequisites.every((id) => prior.has(id)), topic.id);
      if (topic.studyTask) assert.equal(topic.lesson.quizQuestions.length, 0);
      ids.add(topic.id);
      prior.add(topic.id);
    }
  }
});

test('all ten official GATE CS areas appear in the curriculum and career view', () => {
  const gate = INITIAL_ROADMAPS.find((roadmap) => roadmap.goalId === 'gate_cse')!;
  const officialAreas = new Set(gate.topics.filter((topic) => topic.isOfficialGateTopic).map((topic) => topic.stageTitle));
  assert.equal(officialAreas.size, 10);
  assert.ok(gate.topics.some((topic) => topic.stageTitle === 'General Aptitude'));
  assert.ok(!gate.topics.find((topic) => topic.id === 'gate27-mock')?.isOfficialGateTopic);
  assert.equal(evaluateCareerOutcomesAndSkillGaps(INITIAL_ROADMAPS, {}, []).gateSubjects.length, 10);
  assert.equal(INITIAL_ROADMAPS.find((roadmap) => roadmap.goalId === 'japanese')?.sourceType, 'CURATED_ROADMAP');
});

test('older workspace curriculums migrate without replacing mastery or session history', () => {
  const saved = createInitialWorkspaceState();
  const dsa = saved.layer2Learning.roadmaps.find((roadmap) => roadmap.goalId === 'dsa_cp')!;
  dsa.topics = dsa.topics.filter((topic) => !topic.studyTask);
  dsa.syllabusVersion = 'previous';
  const before = structuredClone(saved.layer2Learning.masteryRecords);
  const migrated = migrateWorkspaceCurriculum(saved);
  assert.ok(migrated.layer2Learning.roadmaps.find((roadmap) => roadmap.goalId === 'dsa_cp')?.topics.some((topic) => topic.id === 'dsa-search-sort'));
  assert.deepEqual(migrated.layer2Learning.masteryRecords, before);
  assert.equal(migrated.layer2Learning.sessionHistory, saved.layer2Learning.sessionHistory);
});


test('each track starts with an actionable zero-level sequence before its original material', () => {
  for (const roadmap of INITIAL_ROADMAPS) {
    const entries = roadmap.topics.filter((topic) => topic.stageTitle === 'Start from zero');
    assert.ok(entries.length >= 3, roadmap.goalId);
    assert.deepEqual(roadmap.topics.slice(0, entries.length), entries);
    assert.deepEqual(entries[0].prerequisites, []);
    assert.ok(entries.every((topic) => topic.studyTask && !topic.isOfficialGateTopic));
    assert.deepEqual(roadmap.topics[entries.length].prerequisites, [entries.at(-1)!.id]);
  }
});
