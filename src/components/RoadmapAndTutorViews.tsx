import { getMentorPlan } from '../layers/mentorPlan.ts';
import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Play,
  ShieldCheck,
  Sparkles,
  Code2,
  FileText,
  HelpCircle,
  Award,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  GoalId,
  LearningRoadmap,
  RoadmapTopic,
  ScheduledLearningRecommendation,
  SyllabusUpdateRecord,
  TopicMasteryRecord,
} from '../types/domain.ts';

function formatSourceType(sourceType: LearningRoadmap['sourceType']): string {
  if (sourceType === 'OFFICIAL_SYLLABUS') return 'Official syllabus coverage';
  if (sourceType === 'CURATED_ROADMAP') return 'Curated study roadmap';
  return 'AI-Generated Specialization Plan';
}

// ==========================================
// 4. LEARNING ROADMAP & SYLLABUS ENGINE VIEW
// ==========================================
export const RoadmapView: React.FC<{
  roadmaps: LearningRoadmap[];
  masteryRecords: Record<string, TopicMasteryRecord>;
  completedTopicIds: ReadonlySet<string>;
  syllabusUpdates: SyllabusUpdateRecord[];
  activeMainSkill: 'fullstack' | 'cybersecurity' | 'ai_ml';
  onSwitchMainSkill: (skill: 'fullstack' | 'cybersecurity' | 'ai_ml') => void;
  onApproveSyllabusUpdate: (updateId: string, approve: boolean) => void;
  onOpenTopicInTutor: (topicId: string) => void;
}> = ({
  roadmaps,
  masteryRecords,
  completedTopicIds,
  syllabusUpdates,
  activeMainSkill,
  onSwitchMainSkill,
  onApproveSyllabusUpdate,
  onOpenTopicInTutor,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<GoalId>('placement');
  const [pendingSkillSwitch, setPendingSkillSwitch] = useState<'fullstack' | 'cybersecurity' | 'ai_ml' | null>(null);

  const selectedRoadmap = roadmaps.find((r) => r.goalId === selectedGoalId) || roadmaps[0];

  const handleRequestSkillSwitch = (target: 'fullstack' | 'cybersecurity' | 'ai_ml') => {
    if (target === activeMainSkill) return;
    setPendingSkillSwitch(target);
  };

  const handleConfirmSkillSwitch = () => {
    if (!pendingSkillSwitch) return;
    onSwitchMainSkill(pendingSkillSwitch);
    setSelectedGoalId(pendingSkillSwitch);
    setPendingSkillSwitch(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            AI Learning Roadmap &amp; Authoritative Syllabus Engine
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            One-Main-Skill-at-a-Time Active Track: <strong className="text-violet-600 dark:text-violet-400">{activeMainSkill.toUpperCase()}</strong>
            {' · '}
            DSA, GATE CSE, Japanese, and English run concurrently in designated timetable slots.
          </p>
        </div>

      </div>

      {/* One-Main-Skill-at-a-Time Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              One-Main-Skill-at-a-Time Technical Progression Rule
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Prevents context-switching burnout across unfinished Full-Stack, Cybersecurity, and AI/ML roadmaps. Switching requires your explicit approval.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(['fullstack', 'cybersecurity', 'ai_ml'] as const).map((skill) => {
              const isCurrent = activeMainSkill === skill;
              const label =
                skill === 'fullstack'
                  ? '1. Full-Stack Dev'
                  : skill === 'cybersecurity'
                  ? '2. Cybersecurity'
                  : '3. AI & ML';
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleRequestSkillSwitch(skill)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {label} {isCurrent ? '(Active Main)' : '(Queued)'}
                </button>
              );
            })}
          </div>
        </div>

        {pendingSkillSwitch && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Major Roadmap Direction Change Confirmation Required
            </p>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
              You are switching your primary technical development slot from <strong>{activeMainSkill.toUpperCase()}</strong> to <strong>{pendingSkillSwitch.toUpperCase()}</strong>. All existing mastery records in {activeMainSkill.toUpperCase()} will be safely preserved. Do you approve this roadmap change?
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleConfirmSkillSwitch}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Approve Main Skill Switch
              </button>
              <button
                type="button"
                onClick={() => setPendingSkillSwitch(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                Keep Current ({activeMainSkill.toUpperCase()})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Goal Track Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        {roadmaps.map((rm) => (
          <button
            key={rm.goalId}
            type="button"
            onClick={() => setSelectedGoalId(rm.goalId)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedGoalId === rm.goalId
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {rm.shortTitle}
            {rm.isMainTechnicalTrack && !rm.isActiveMainSkill ? ' (Queued)' : ''}
          </button>
        ))}
      </div>

      {/* Selected Roadmap Detail Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Priority Rank #{selectedRoadmap.priorityRank}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatSourceType(selectedRoadmap.sourceType)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Version {selectedRoadmap.syllabusVersion}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
              {selectedRoadmap.title}
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {selectedRoadmap.description}
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <p>Authoritative Source: <strong className="text-slate-800 dark:text-slate-200">{selectedRoadmap.authoritySource}</strong></p>
            <p className="mt-0.5 tabular-nums">Last Checked: {selectedRoadmap.lastCheckedDate}</p>
          </div>
        </div>

        {/* Topics Progression List */}
        <div className="mt-5 space-y-4">
          {selectedRoadmap.topics.map((topic, index) => {
            const mastery = masteryRecords[topic.id];
            const prereqMet = topic.prerequisites.every((id) =>
              completedTopicIds.has(id) || masteryRecords[id]?.status === 'MASTERED',
            );
            const status = mastery?.status || 'NOT_STARTED';
            const understanding = mastery?.understandingLevel ?? 0;

            return (
              <div
                key={topic.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {String(index + 1).padStart(2, '0')}. {topic.stageTitle}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {topic.sourceType === 'OFFICIAL_SYLLABUS'
                          ? 'Official Syllabus Requirement'
                          : topic.sourceType === 'CURATED_ROADMAP'
                          ? 'Curated study module'
                          : 'AI Continuous Specialization'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{topic.estimatedDurationMinutes}m</span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                      {topic.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Subtopics: {topic.subtopics.join(' · ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-xs font-bold ${
                          status === 'MASTERED'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : status === 'NEEDS_REVISION'
                            ? 'text-orange-600 dark:text-orange-400'
                            : status === 'IN_PROGRESS'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {completedTopicIds.has(topic.id) && status !== 'MASTERED' ? 'Study completed' : `${status.replace(/_/g, ' ')} (${understanding}% assessed)`}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {mastery?.nextReviewDate ? `Next SM-2 Review: ${mastery.nextReviewDate}` : 'Not yet assessed'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenTopicInTutor(topic.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {topic.studyTask ? 'View practice task' : status === 'MASTERED' ? 'Review lesson' : 'Open lesson'}
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <strong>{topic.studyTask ? 'Completion criteria' : 'Mastery criteria'}</strong> · {topic.masteryCriteria}
                  </span>
                  <span>
                    {prereqMet ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Prerequisites Met
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Prerequisite pending
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continuous Learning Beyond Initial Syllabus */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Continuous Learning &amp; Post-Syllabus Specializations (No Artificial Endpoint)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatically unlocks once initial topics in {selectedRoadmap.shortTitle} reach verified MASTERED status:
          </p>
          <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-slate-700 dark:text-slate-300">
            {selectedRoadmap.continuousSpecializations.map((spec, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40"
              >
                0{idx + 1}. {spec}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Syllabus Version History & Approval Center */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Trusted Syllabus Updates &amp; Version Approval Log
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Minor resource refinements apply automatically; major roadmap changes require your explicit approval and preserve all historical mastery.
        </p>

        <div className="mt-4 space-y-3">
          {syllabusUpdates.map((upd) => (
            <div
              key={upd.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{upd.sourceName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {upd.previousVersion} → {upd.newVersion}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">Checked {upd.detectedDate}</span>
                </div>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                  {upd.changeDescription}
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Status: <strong>{upd.status.replace(/_/g, ' ')}</strong> · {upd.recommendedAction}
                </p>
              </div>

              {upd.status === 'PENDING_USER_APPROVAL' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onApproveSyllabusUpdate(upd.id, true)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                  >
                    Approve Roadmap Addition
                  </button>
                  <button
                    type="button"
                    onClick={() => onApproveSyllabusUpdate(upd.id, false)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  >
                    Defer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. TODAY'S LEARNING & 10-STEP STRUCTURED AI TUTOR WORKSPACE
// ==========================================
type TutorWorkspaceProps = {
  selectedDate: string;
  dailySessions: ScheduledLearningRecommendation[];
  roadmaps: LearningRoadmap[];
  masteryRecords: Record<string, TopicMasteryRecord>;
  activeTopicId: string;
  onSelectTopicId: (topicId: string) => void;
  onSubmitAssessmentResult: (
    topicId: string,
    goalId: GoalId,
    correctCount: number,
    totalCount: number,
    mistakeCategories: string[],
    practicalCompleted: boolean,
    reflectionNote: string
  ) => void;
  onMarkSessionMissed: (session: ScheduledLearningRecommendation) => void;
};

export function StructuredTutorWorkspaceView(props: TutorWorkspaceProps) {
  const topics = props.roadmaps.flatMap((roadmap) => roadmap.topics);
  const topic = topics.find((item) => item.id === props.activeTopicId) ?? topics[0];
  const roadmap = props.roadmaps.find((item) => item.goalId === topic?.goalId);
  if (!topic) return <p>Add a roadmap to start learning.</p>;
  if (topic.studyTask) {
    return (
      <section className="study-card study-settings space-y-3">
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <label className="study-field max-w-md">Choose a topic
          <select value={topic.id} onChange={(event) => props.onSelectTopicId(event.target.value)}>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <p>{topic.subtopics.join(' · ')}</p>
        <h2>Practice task</h2>
        <p>{topic.studyTask}</p>
        {roadmap && <a className="overview-link" href={roadmap.authorityUrl} target="_blank" rel="noreferrer">Open curriculum reference</a>}
      </section>
    );
  }

  return <TutorLesson key={JSON.stringify([props.selectedDate, topic.id])} {...props} currentTopic={topic} allTopics={topics} />;
}

const TutorLesson: React.FC<TutorWorkspaceProps & { currentTopic: RoadmapTopic; allTopics: RoadmapTopic[] }> = ({
  selectedDate,
  dailySessions,
  currentTopic,
  allTopics,
  masteryRecords,
  onSelectTopicId,
  onSubmitAssessmentResult,
  onMarkSessionMissed,
}) => {
  const currentMastery = masteryRecords[currentTopic.id];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [practicalChecked, setPracticalChecked] = useState<boolean>(
    currentMastery?.practicalCompleted ?? false
  );
  const [independentDraft, setIndependentDraft] = useState('');
  const [sessionNote, setSessionNote] = useState('');
  const [isPractice, setIsPractice] = useState(false);
  const [quizSubmittedResult, setQuizSubmittedResult] = useState<{
    correct: number;
    total: number;
    mistakes: string[];
  } | null>(null);

  const mentorPlan = getMentorPlan(currentTopic, currentMastery, selectedDate);
  const questions = currentTopic.lesson.quizQuestions;
  const canSubmit = !quizSubmittedResult && questions.length > 0 &&
    questions.every((question) => selectedAnswers[question.id] !== undefined);

  const handleGradeQuizAndUpdateMastery = () => {
    if (!canSubmit) return;
    let correct = 0;
    const mistakes: string[] = [];

    for (const q of questions) {
      const picked = selectedAnswers[q.id];
      if (picked === q.correctIndex) {
        correct += 1;
      } else {
        mistakes.push(q.mistakeCategory);
      }
    }

    const scorePercent = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const practicalCompleted = currentMastery?.practicalCompleted ||
      (practicalChecked && Boolean(independentDraft.trim()));

    if (!isPractice) {
      onSelectTopicId(currentTopic.id);
      onSubmitAssessmentResult(
        currentTopic.id,
        currentTopic.goalId,
        correct,
        questions.length,
        mistakes,
        practicalCompleted,
        [sessionNote.trim() || `Completed ${currentTopic.title} assessment (${scorePercent}%).`,
          practicalChecked && independentDraft.trim() ? `Practical self-review — ${independentDraft.trim()}` : '']
          .filter(Boolean).join('\n')
      );
    }

    setQuizSubmittedResult({
      correct,
      total: questions.length,
      mistakes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Autonomous Daily Queue Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Personal Learning Mentor
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Learning plan for {selectedDate}. Guided lessons use your saved assessment history.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="tutor-topic-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Topic:
            </label>
            <select
              id="tutor-topic-select"
              value={currentTopic.id}
              onChange={(e) => onSelectTopicId(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              {allTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.goalId.toUpperCase()}] {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <section className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <h2 className="text-sm font-semibold">{mentorPlan.title}</h2>
          <p className="mt-1 text-sm">{mentorPlan.instruction}</p>
          {mentorPlan.mistakes?.map((question) => (
            <details key={question.id} className="mt-2 text-sm">
              <summary className="cursor-pointer">{question.question}</summary>
              <p className="mt-1">{question.explanation}</p>
            </details>
          ))}
          {currentMastery?.assessmentAttempts ? (
            <p className="mt-2 text-xs">Next review {currentMastery.nextReviewDate}</p>
          ) : null}
        </section>

        {/* Today's Autonomous Learning Sessions Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {dailySessions.slice(0, 3).map((sess) => (
            <div
              key={sess.sessionId}
              className={`p-3.5 rounded-xl border transition-all ${
                sess.topicId === currentTopic.id
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                  {sess.displayTime} ({sess.durationMinutes}m)
                </span>
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {sess.status}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {sess.topicTitle}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {sess.autonomousReason}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTopicId(sess.topicId)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Load Lesson
                </button>
                {sess.status === 'SCHEDULED' && (
                  <button
                    type="button"
                    onClick={() => onMarkSessionMissed(sess)}
                    className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    Mark Session Missed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distraction-Free 10-Step Structured Lesson Workspace */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{currentTopic.stageTitle}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{currentTopic.estimatedDurationMinutes} mins</span>
              <span aria-hidden="true">·</span>
              <span>
                Current Mastery:{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {currentMastery?.status || 'NOT_STARTED'} ({currentMastery?.understandingLevel ?? 0}%)
                </strong>
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
              {currentTopic.title}
            </h2>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Attempts: {currentMastery?.assessmentAttempts ?? 0} · Next Review: {currentMastery?.nextReviewDate || 'Upon Completion'}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Session Learning Objectives &amp; Mastery Criteria
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
            {currentTopic.objectives.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-400 font-medium">
            Mastery Requirement: {currentTopic.masteryCriteria}
          </p>
        </div>

        {/* Steps 1, 2, 3, 4: Concept Intro, Simple Explanation, Analogy, Worked Example */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              01. Concept Introduction
            </h3>
            <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentTopic.lesson.conceptIntroduction}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              02. Simple Explanation
            </h3>
            <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentTopic.lesson.simpleExplanation}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              03. Real-World Analogy
            </h3>
            <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentTopic.lesson.realWorldAnalogy}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              04. Worked Example
            </h3>
            <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentTopic.lesson.workedExample}
            </p>
          </div>
        </div>

        {/* Step 5: Step-by-Step Demonstration */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            05. Step-by-Step Demonstration
          </h3>
          <div className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
            {currentTopic.lesson.stepByStepDemonstration.map((step, idx) => (
              <p key={idx}>{step}</p>
            ))}
          </div>
        </div>

        {/* Programming Details (Code, Line-by-Line, Dry Run, Test Cases, Debugging, Complexity) */}
        {currentTopic.lesson.programmingDetails && (
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Programming Implementation, Dry Run &amp; Complexity Analysis</span>
            </h3>
            <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
              {currentTopic.lesson.programmingDetails.codeExample}
            </pre>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Line-by-Line Explanation:
                </p>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  {currentTopic.lesson.programmingDetails.lineByLineExplanation.map((line, idx) => (
                    <li key={idx}>• {line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Execution Dry-Run Trace:
                </p>
                <pre className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {currentTopic.lesson.programmingDetails.dryRunTrace}
                </pre>
                <p className="mt-2 font-semibold text-blue-600 dark:text-blue-400">
                  {currentTopic.lesson.programmingDetails.codingChallenge.complexityAnalysis}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Theoretical Details (Definitions, Comparisons, ASCII Diagram) */}
        {currentTopic.lesson.theoreticalDetails && (
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Theoretical Definitions, Comparisons &amp; Structural Diagram
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {currentTopic.lesson.theoreticalDetails.definitions.map((d, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{d.term}: </span>
                  <span className="text-slate-600 dark:text-slate-400">{d.definition}</span>
                </div>
              ))}
            </div>
            <pre className="p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto">
              {currentTopic.lesson.theoreticalDetails.diagramAscii}
            </pre>
          </div>
        )}

        {/* Steps 6 & 7: Guided Exercise & Independent Exercise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              06. Guided Exercise
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-800 dark:text-slate-200">
              {currentTopic.lesson.guidedExercise.question}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              {currentTopic.lesson.guidedExercise.steps.map((s, idx) => (
                <li key={idx}>Step {idx + 1}: {s}</li>
              ))}
            </ul>
            <details className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
              <summary className="cursor-pointer font-semibold">Show solution</summary>
              <p className="mt-1">{currentTopic.lesson.guidedExercise.expectedAnswer}</p>
            </details>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              07. Independent Practical Exercise (Required for Mastery)
            </h3>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
              {currentTopic.lesson.independentExercise.prompt}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
              {currentTopic.lesson.independentExercise.evaluationRubric.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ul>
            <textarea
              aria-label="Independent exercise solution"
              rows={3}
              placeholder="Write your solution and how you checked it"
              value={independentDraft}
              onChange={(e) => setIndependentDraft(e.target.value)}
              className="mt-2 w-full p-2.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <label className="mt-2.5 inline-flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={practicalChecked}
                disabled={!independentDraft.trim() && !practicalChecked}
                onChange={(e) => setPracticalChecked(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>I checked my work against the exercise checklist</span>
            </label>
          </div>
        </div>

        {/* Step 8: Interactive Assessment Quiz */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            08. Mastery Verification Quiz (Requires &ge; 80% Accuracy)
          </h3>

          <div className="mt-4 space-y-4">
            {currentTopic.lesson.quizQuestions.map((q, qIdx) => (
              <div key={q.id} className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Q{qIdx + 1}. {q.question}
                </p>
                <div className="mt-2.5 space-y-1.5">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <input
                        type="radio"
                        name={`quiz-${q.id}`}
                        checked={selectedAnswers[q.id] === optIdx}
                        disabled={Boolean(quizSubmittedResult)}
                        onChange={() =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [q.id]: optIdx,
                          }))
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {quizSubmittedResult && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                    <strong>Explanation ({q.mistakeCategory}):</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              aria-label="Session reflection note"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="Add personal takeaway or revision note for this session..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleGradeQuizAndUpdateMastery}
              disabled={!canSubmit}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {isPractice ? 'Check practice answers' : 'Submit assessment'}
            </button>
          </div>

          {/* Steps 9 & 10: Mistake Analysis & Spaced Repetition Recommendation */}
          {quizSubmittedResult && (
            <div
              role="status"
              className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5"
            >
              <p className="font-bold text-slate-900 dark:text-slate-100">
                09. Assessment &amp; Mistake Analysis: Scored {quizSubmittedResult.correct}/{quizSubmittedResult.total} ({Math.round((quizSubmittedResult.correct / quizSubmittedResult.total) * 100)}%)
              </p>
              {quizSubmittedResult.mistakes.length > 0 ? (
                <p className="text-orange-700 dark:text-orange-300">
                  Review these areas before your next assessment: {quizSubmittedResult.mistakes.join(', ')}.
                </p>
              ) : (
                <p className="text-emerald-700 dark:text-emerald-300">
                  You answered every quiz question correctly.
                </p>
              )}
              <p className="text-slate-700 dark:text-slate-300">
                <strong>10. Revision Recommendation:</strong> {currentTopic.lesson.revisionRecommendation}
              </p>
              <button type="button" className="font-semibold underline" onClick={() => {
                setIsPractice(true);
                setSelectedAnswers({});
                setQuizSubmittedResult(null);
              }}>
                Practice again without changing mastery
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
