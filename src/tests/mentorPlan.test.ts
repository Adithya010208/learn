import test from 'node:test';
import assert from 'node:assert/strict';
import { getMentorPlan } from '../layers/mentorPlan.ts';
import { evaluateAssessmentAndMastery, INITIAL_ROADMAPS } from '../layers/layer2Learning.ts';

test('the mentor progresses from worked examples to targeted correction and retention', () => {
  const topic = INITIAL_ROADMAPS[0].topics.find((item) => item.lesson.quizQuestions.length > 0)!;
  const date = '2026-11-23';
  const firstQuestion = topic.lesson.quizQuestions[0];

  assert.equal(getMentorPlan(topic, undefined, date).title, 'Start with a worked example');
  const weak = evaluateAssessmentAndMastery(
    undefined, topic.id, topic.goalId, 0, 1, [firstQuestion.mistakeCategory], false, date,
  );
  assert.ok(getMentorPlan(topic, weak, date).mistakes?.includes(firstQuestion));

  const mastered = evaluateAssessmentAndMastery(
    weak, topic.id, topic.goalId, 1, 1, [], true, date,
  );
  assert.deepEqual(mastered.mistakeCategories, []);
  assert.equal(getMentorPlan(topic, mastered, date).title, 'Apply what you learned');
  assert.equal(getMentorPlan(topic, mastered, mastered.nextReviewDate).title, 'Recall before you reread');
});
