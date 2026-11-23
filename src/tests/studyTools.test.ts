import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialTemplates, publishDailyAvailability } from '../layers/layer1Schedule.ts';
import { INITIAL_ROADMAPS } from '../layers/layer2Learning.ts';
import { applySharedCredit, weekSummary } from '../layers/studyTools.ts';
import { buildStudyPlan } from '../layers/studyPlan.ts';
import { answerStudyQuestion } from '../services/localStudyCoach.ts';
import { createInitialWorkspaceState, freshestWorkspace } from '../services/offlineSync.ts';
import { studyCalendar } from '../services/studyCalendar.ts';
import type { ScheduledLearningRecommendation } from '../types/domain.ts';

const templates = createInitialTemplates();
const date = '2027-01-05';
const availability = (day: string) => publishDailyAvailability(day, {}, templates, []);

test('the 15-minute limit schedules one Java DSA task and keeps the timetable intact', () => {
  const original = availability(date);
  const sessions = buildStudyPlan(original, INITIAL_ROADMAPS, {}, {}, [], { shortDays: { [date]: true } });
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].topicId, 'zero-dsa-first-program');
  assert.equal(sessions[0].durationMinutes, 15);
  assert.equal(sessions[0].displayTime, '17:30–17:45');
  assert.equal(original.slots.find((slot) => slot.suggestedGoalId === 'dsa_cp')?.durationMinutes, 45);
  const busy = buildStudyPlan(original, INITIAL_ROADMAPS, {}, {}, [], { busyWeek: { start: date, end: date, minutes: 25 } });
  assert.equal(busy.reduce((sum, session) => sum + session.durationMinutes, 0), 25);
});

test('shared SQL practice transfers only after the receiving track prerequisites are met', () => {
  const topics = INITIAL_ROADMAPS.flatMap((roadmap) => roadmap.topics);
  const credit = new Set(['pl-sql-practice']);
  applySharedCredit(credit, topics);
  assert.ok(!credit.has('fs-sql-practice'));
  credit.add('fs-db');
  applySharedCredit(credit, topics);
  assert.ok(credit.has('fs-sql-practice'));
});

test('a completed topic with a note appears again for practice', () => {
  const first = buildStudyPlan(availability(date), INITIAL_ROADMAPS, {}, {}, []).find((item) => item.goalId === 'dsa_cp')!;
  const history = { [date]: [{ ...first, status: 'COMPLETED' as const }] };
  const plan = buildStudyPlan(availability('2027-01-06'), INITIAL_ROADMAPS, history, {}, [], { practice: { [first.topicId]: date } });
  assert.equal(plan.find((item) => item.topicId === first.topicId)?.sessionType, 'REVISION_SPACED');
});

test('calendar export adds alarms for the scheduled study slot and evening check-in', () => {
  const plan = buildStudyPlan(availability(date), INITIAL_ROADMAPS, {}, {}, [], { shortDays: { [date]: true } });
  const calendar = studyCalendar(availability(date), plan, 10);
  assert.match(calendar, /SUMMARY:Run your first Java program/);
  assert.match(calendar, /TRIGGER:-PT10M/);
  assert.match(calendar, /SUMMARY:AetherLearn daily check-in/);
  assert.equal(calendar.match(/BEGIN:VEVENT/g)?.length, 2);
});

test('planner advances across 60 days with saved outcomes restored repeatedly', () => {
  let history: Record<string, ScheduledLearningRecommendation[]> = {};
  const start = new Date('2027-01-05T12:00:00Z');
  for (let day = 0; day < 60; day++, start.setUTCDate(start.getUTCDate() + 1)) {
    const key = start.toISOString().slice(0, 10);
    const plan = buildStudyPlan(availability(key), INITIAL_ROADMAPS, history, {}, []);
    assert.equal(plan.length, new Set(plan.map((session) => session.topicId)).size);
    if (day === 0) {
      history[key] = plan.map((session) => ({ ...session, status: session.goalId === 'dsa_cp' ? 'MISSED' : 'COMPLETED' }));
    } else {
      if (day === 1) assert.match(plan.find((session) => session.goalId === 'dsa_cp')?.autonomousReason ?? '', /Carried over/);
      history[key] = plan.map((session) => ({ ...session, status: 'COMPLETED' }));
    }
    if (day % 7 === 0) history = JSON.parse(JSON.stringify(history));
  }
  const dsa = Object.values(history).flat().filter((session) => session.goalId === 'dsa_cp' && session.status === 'COMPLETED');
  assert.ok(dsa.some((session) => session.topicId === 'dsa-checkpoint-java'));
  assert.equal(dsa.length, new Set(dsa.map((session) => session.topicId)).size);
  assert.ok(weekSummary(history, '2027-01-14').completed > 0);
});

test('coach fallback uses only actual scheduled topics without an AI provider or API key', async () => {
  const plan = buildStudyPlan(availability(date), INITIAL_ROADMAPS, {}, {}, [], { shortDays: { [date]: true } });
  const result = await answerStudyQuestion('What should I do?', plan, []);
  assert.equal(result.onDevice, false);
  assert.match(result.text, /Run your first Java program/);
  assert.match((await answerStudyQuestion('What should I do?', [], [])).text, /no remaining scheduled sessions/);
});

test('reload selects the latest saved copy even when IndexedDB has not caught up', () => {
  const original = createInitialWorkspaceState();
  const indexed = { ...original, version: 5, updatedAt: '2027-01-05T08:00:00.000Z' };
  const local = {
    ...original,
    version: 6,
    updatedAt: '2027-01-05T08:01:00.000Z',
    settings: { ...original.settings, studyTools: { shortDays: { [date]: true } } },
  };
  assert.equal(freshestWorkspace(indexed, local), local);
  assert.equal(freshestWorkspace(local, indexed), local);
  assert.equal(freshestWorkspace(undefined, local), local);
});
