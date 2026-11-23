import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialTemplates, publishDailyAvailability } from '../layers/layer1Schedule.ts';
import { INITIAL_ROADMAPS } from '../layers/layer2Learning.ts';
import { INITIAL_PROJECTS } from '../layers/layer3Career.ts';
import { buildStudyPlan } from '../layers/studyPlan.ts';

const templates = createInitialTemplates();
const date = '2026-11-24';
const nextDate = '2026-11-25';
const availability = (day: string, unavailable: { startTime: string; endTime: string }[] = []) =>
  publishDailyAvailability(day, {}, templates, [], 'WORKING_DAY', unavailable);

test('time blocks subtract only the overlapping study minutes', () => {
  const normal = availability(date);
  const partial = availability(date, [{ startTime: '17:45', endTime: '18:00' }]);
  assert.deepEqual(partial.slots.filter((slot) => slot.suggestedGoalId === 'dsa_cp')
    .map(({ startTime, endTime }) => [startTime, endTime]), [['17:30', '17:45'], ['18:00', '18:15']]);
  assert.equal(partial.totalAvailableLearningMinutes, normal.totalAvailableLearningMinutes - 15);
  assert.equal(partial.sleepProtectedMinutes, normal.sleepProtectedMinutes);
  assert.deepEqual(availability(nextDate).slots.map((slot) => slot.slotId),
    normal.slots.map((slot) => slot.slotId));
});

test('missed work rolls into the next eligible slot and completed work unlocks prerequisites', () => {
  const firstDay = buildStudyPlan(availability(date), INITIAL_ROADMAPS, {}, {}, []);
  const dsa = firstDay.find((session) => session.goalId === 'dsa_cp')!;
  assert.equal(dsa.topicId, 'zero-dsa-first-program');
  const missedHistory = { [date]: [{ ...dsa, status: 'MISSED' as const }] };
  const blocked = buildStudyPlan(
    availability(nextDate, [{ startTime: '17:30', endTime: '18:15' }]),
    INITIAL_ROADMAPS, missedHistory, {}, [],
  );
  assert.ok(!blocked.some((session) => session.topicId === dsa.topicId));
  const recovered = buildStudyPlan(availability(nextDate), INITIAL_ROADMAPS, missedHistory, {}, []);
  assert.equal(recovered.find((session) => session.topicId === dsa.topicId)?.autonomousReason,
    `Carried over from ${date}.`);
  const advanced = buildStudyPlan(availability(nextDate), INITIAL_ROADMAPS,
    { [date]: [{ ...dsa, status: 'COMPLETED' }] }, {}, []);
  assert.ok(!advanced.some((session) => session.topicId === dsa.topicId));
  assert.equal(advanced.find((session) => session.goalId === 'dsa_cp')?.topicId, 'zero-dsa-values');
});

test('recommend only one ready project task and leave prerequisites intact', () => {
  const firstDay = buildStudyPlan(availability(date), INITIAL_ROADMAPS, {}, {}, INITIAL_PROJECTS);
  assert.equal(firstDay.filter((session) => session.sessionType === 'PRACTICAL_PROJECT').length, 0);
  const firstWebSession = firstDay.find((session) => session.goalId === 'fullstack')!;
  const webTopics = INITIAL_ROADMAPS.find((roadmap) => roadmap.goalId === 'fullstack')!.topics;
  const foundationIndex = webTopics.findIndex((topic) => topic.id === 'fs-web-html-css-js-scratch');
  const outcomes = webTopics.slice(0, foundationIndex + 1).map((topic) => ({
    ...firstWebSession,
    topicId: topic.id,
    status: 'COMPLETED' as const,
  }));
  const nextDay = buildStudyPlan(availability(nextDate), INITIAL_ROADMAPS,
    { [date]: outcomes }, {}, INITIAL_PROJECTS);
  assert.equal(nextDay.filter((session) => session.sessionType === 'PRACTICAL_PROJECT').length, 1);
  assert.equal(new Set(nextDay.map((session) => session.topicId)).size, nextDay.length);
});
