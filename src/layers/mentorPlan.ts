import type { RoadmapTopic, TopicMasteryRecord } from '../types/domain.ts';

export function getMentorPlan(
  topic: RoadmapTopic,
  mastery: TopicMasteryRecord | undefined,
  date: string,
) {
  const lesson = topic.lesson;

  if (mastery?.status === 'MASTERED') {
    return mastery.nextReviewDate <= date
      ? {
          title: 'Recall before you reread',
          instruction: 'Explain the concept from memory and redo the independent exercise before checking your notes. Then take the quiz.',
        }
      : {
          title: 'Apply what you learned',
          instruction: 'Try the independent exercise with a different example. Explain why your approach works and where it might break.',
        };
  }

  if (mastery?.assessmentAttempts) {
    const mistakes = lesson.quizQuestions.filter((question) =>
      mastery.mistakeCategories.includes(question.mistakeCategory),
    );
    return {
      title: mistakes.length ? 'Work through your last mistakes' : 'Show what you can do independently',
      instruction: mistakes.length
        ? 'Try the questions below aloud from memory. Open each explanation after you have a reason for your answer, then revisit the worked example.'
        : 'Use the exercise checklist to check your work and write down how you verified it.',
      mistakes,
    };
  }

  return {
    title: 'Start with a worked example',
    instruction: 'Read the simple explanation, follow the worked example one step at a time, then attempt the guided exercise before opening its solution.',
  };
}
