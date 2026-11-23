import { applySharedCredit, studyLimit, type StudyToolsState } from './studyTools.ts';
import type {
  Layer1PublishedAvailability,
  LearningRoadmap,
  ProjectRecommendation,
  ScheduledLearningRecommendation,
  TopicMasteryRecord,
} from '../types/domain.ts';

export function buildStudyPlan(
  availability: Layer1PublishedAvailability,
  roadmaps: LearningRoadmap[],
  history: Record<string, ScheduledLearningRecommendation[]>,
  mastery: Record<string, TopicMasteryRecord>,
  projects: ProjectRecommendation[],
  tools: StudyToolsState = {},
): ScheduledLearningRecommendation[] {
  const { date, slots, activeExam } = availability;
  const previousOutcomes = Object.entries(history)
    .filter(([day]) => day < date)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([, sessions]) => sessions);
  const completed = new Set([
    ...Object.values(mastery).filter((record) =>
      record.status === 'MASTERED' && (!record.completedAt || record.completedAt <= date),
    ).map((record) => record.topicId),
    ...previousOutcomes.filter((session) => session.status === 'COMPLETED').map((session) => session.topicId),
  ]);
  applySharedCredit(completed, roadmaps.flatMap((roadmap) => roadmap.topics));
  const today = (history[date] ?? []).filter((session) =>
    session.status === 'COMPLETED' || session.status === 'PARTIAL' || session.status === 'MISSED',
  );
  const used = new Set(today.map((session) => session.topicId));
  const missed = previousOutcomes.filter((session) => session.status === 'MISSED' || session.status === 'PARTIAL' || session.status === 'RESCHEDULED');
  const activeTrack = roadmaps.find((roadmap) => roadmap.isMainTechnicalTrack && roadmap.isActiveMainSkill);
  const plan = [...today];
  let minutesLeft = studyLimit(date, tools) - today
    .filter((session) => session.status !== 'MISSED')
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const readyProjects = projects.filter((project) =>
    project.status !== 'Archived' && project.status !== 'Completed' &&
    project.developmentStages.some((stage) => !stage.completed) && project.prerequisiteTopicIds.length > 0 &&
    project.prerequisiteTopicIds.every((id) => completed.has(id)) &&
    (!roadmaps.some((roadmap) => roadmap.goalId === project.goalId && roadmap.isMainTechnicalTrack) ||
      project.goalId === activeTrack?.goalId),
  );

  const prioritySlots = tools.shortDays?.[date] && availability.assignedMode !== 'EXAM_MODE'
    ? [...slots].sort((a, b) => Number(b.suggestedGoalId === 'dsa_cp') - Number(a.suggestedGoalId === 'dsa_cp'))
    : slots;
  let assignedProject = false;
  for (const slot of prioritySlots) {
    if (minutesLeft <= 0) break;
    const originalSlot = slot.slotId.split('@')[0];
    if (today.some((session) => session.slotId.split('@')[0] === originalSlot)) continue;

    const goalId = slot.designatedCategory === 'DEVELOPMENT_SKILL'
      ? activeTrack?.goalId
      : slot.suggestedGoalId;
    const roadmap = roadmaps.find((item) => item.goalId === goalId);
    const eligible = (roadmap?.topics ?? []).filter((topic) =>
      !used.has(topic.id) && topic.prerequisites.every((id) => completed.has(id)),
    );
    const pending = eligible.filter((topic) => !completed.has(topic.id));
    const carryOver = missed.find((session) => pending.some((topic) => topic.id === session.topicId));
    const examSubject = slot.designatedCategory === 'EXAM_PREP'
      ? activeExam?.subjects.find((subject) => subject.examDate >= date)
      : undefined;
    const examUnit = examSubject?.units.find((unit) =>
      unit.topics.some((_, index) => {
        const id = `exam-${activeExam?.id}-${examSubject.id}-${unit.unitNumber}-${index}`;
        return !used.has(id) && !completed.has(id);
      }),
    );
    const examIndex = examUnit?.topics.findIndex((_, index) => {
      const id = `exam-${activeExam?.id}-${examSubject?.id}-${examUnit.unitNumber}-${index}`;
      return !used.has(id) && !completed.has(id);
    }) ?? -1;
    if (slot.designatedCategory === 'EXAM_PREP' && examIndex < 0) continue;

    const project = !assignedProject && !carryOver && examIndex < 0
      ? readyProjects.find((item) => item.goalId === goalId &&
        item.developmentStages.some((stage, index) => !stage.completed && !completed.has(`${item.id}:${index}`)))
      : undefined;
    const stage = project?.developmentStages.findIndex((item, index) =>
      !item.completed && !completed.has(`${project.id}:${index}`)) ?? -1;
    const projectTopicId = project && stage >= 0 ? `${project.id}:${stage}` : undefined;
    const review = eligible.find((topic) =>
      completed.has(topic.id) &&
      ((tools.practice?.[topic.id] && tools.practice[topic.id] < date) ||
        (mastery[topic.id]?.nextReviewDate && mastery[topic.id].nextReviewDate <= date)) &&
      !previousOutcomes.some((session) =>
        session.topicId === topic.id && session.sessionType === 'REVISION_SPACED' &&
        session.status === 'COMPLETED' && session.date >= (tools.practice?.[topic.id] ?? mastery[topic.id]?.nextReviewDate),
      ),
    );
    const topic = pending.find((item) => item.id === carryOver?.topicId) ?? review ?? pending[0];
    const topicId = examIndex >= 0
      ? `exam-${activeExam?.id}-${examSubject?.id}-${examUnit?.unitNumber}-${examIndex}`
      : projectTopicId ?? topic?.id;
    if (!topicId) continue;

    const topicTitle = examIndex >= 0
      ? `${examSubject?.name} · ${examUnit?.topics[examIndex]}`
      : project ? `Project · ${project.title}` : topic?.title ?? '';
    const sessionType = examIndex >= 0 ? 'EXAM_UNIT_PREP'
      : project ? 'PRACTICAL_PROJECT'
      : topic === review ? 'REVISION_SPACED'
      : 'NEW_CONCEPT';
    const autonomousReason = examIndex >= 0 ? 'From your configured exam syllabus.'
      : project ? (project.developmentStages[stage]?.stage ?? project.objective)
      : carryOver ? `Carried over from ${carryOver.date}.`
      : topic === review ? (tools.practice?.[topic.id] ? 'Practice requested. Try the task again without notes.' : 'Spaced review is due.')
      : topic?.studyTask ?? 'Next topic with completed prerequisites.';

    const durationMinutes = Math.min(slot.durationMinutes, minutesLeft);
    const [hours, minutes] = slot.startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + durationMinutes;
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
    plan.push({
      sessionId: `study-${date}-${slot.slotId}`,
      date,
      slotId: slot.slotId,
      displayTime: durationMinutes < slot.durationMinutes ? `${slot.startTime}–${end}` : slot.displayTime,
      durationMinutes,
      goalId: goalId ?? 'gate_cse',
      topicId,
      topicTitle,
      sessionType,
      autonomousReason,
      status: 'SCHEDULED',
    });
    if (project) assignedProject = true;
    minutesLeft -= durationMinutes;
    used.add(topicId);
  }
  const slotOrder = new Map(slots.map((slot, index) => [slot.slotId, index]));
  return plan.sort((a, b) =>
    (slotOrder.get(a.slotId) ?? slots.length) - (slotOrder.get(b.slotId) ?? slots.length),
  );
}
