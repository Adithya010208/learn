import { answerStudyQuestion } from '../services/localStudyCoach.ts';
import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Award,
  Code2,
  Languages,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Send,
  Volume2,
  CloudUpload,
  CloudDownload,
  Download,
  Upload,
  Bell,
  Shield,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import {
  AppNotificationItem,
  Layer3CareerEvaluationSnapshot,
  MissedSessionRecoveryDecision,
  NotificationPreferenceConfig,
  ProjectRecommendation,
  ScheduledLearningRecommendation,
  TopicMasteryRecord,
} from '../types/domain.ts';
import { evaluateProjectReadiness } from '../layers/layer3Career.ts';
import { PersistedWorkspaceState, SyncConflictInfo } from '../services/offlineSync.ts';

// ==========================================
// 6. PROJECTS RECOMMENDATION ENGINE VIEW
// ==========================================
export const ProjectsView: React.FC<{
  projects: ProjectRecommendation[];
  masteryRecords: Record<string, TopicMasteryRecord>;
  onUpdateProjectStatus: (projectId: string, status: ProjectRecommendation['status']) => void;
  onToggleProjectStage: (projectId: string, stageIndex: number) => void;
  onSaveRepository: (projectId: string, url: string) => void;
  onOpenPrerequisiteTopic: (topicId: string) => void;
}> = ({
  projects,
  masteryRecords,
  onUpdateProjectStatus,
  onToggleProjectStage,
  onSaveRepository,
  onOpenPrerequisiteTopic,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = projects.filter(
    (p) => filterCategory === 'ALL' || p.category === filterCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Skill-Gated Project Recommendation Engine
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Recommends practical engineering projects calibrated to your verified Layer 2 mastery. Completed projects directly increase Layer 3 Placement &amp; Portfolio Readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['ALL', 'Beginner', 'Intermediate', 'Advanced', 'Portfolio-ready'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat === 'ALL' ? 'All Projects' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((proj) => {
          const readiness = evaluateProjectReadiness(proj, masteryRecords);
          return (
            <div
              key={proj.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <strong className="text-violet-600 dark:text-violet-400">{proj.category}</strong>
                    {' · '}
                    Track: {proj.goalId.toUpperCase()}
                  </span>
                  <select
                    aria-label={`Project status for ${proj.title}`}
                    value={proj.status}
                    onChange={(e) =>
                      onUpdateProjectStatus(proj.id, e.target.value as ProjectRecommendation['status'])
                    }
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {(['Recommended', 'Planned', 'In progress', 'Completed', 'Archived'] as const).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {proj.title}
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Objective:</strong> {proj.objective}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  <strong>Problem Solved:</strong> {proj.problemSolved}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <strong>Tech Stack:</strong> {proj.techStack.join(' · ')}
                </p>

                {/* Prerequisite Gate Check */}
                <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs">
                  {readiness.ready ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      All Prerequisite Skills Verified — Ready to Build
                    </span>
                  ) : (
                    <div>
                      <p className="text-amber-700 dark:text-amber-400 font-semibold">
                        Prerequisite Skill Gap Identified Before Starting:
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {readiness.missingPrerequisiteIds.map((tid) => (
                          <button
                            key={tid}
                            type="button"
                            onClick={() => onOpenPrerequisiteTopic(tid)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Master Prerequisite: {tid} →
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Development Stages */}
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    Development Stages &amp; Verification:
                  </p>
                  <div className="space-y-1.5">
                    {proj.developmentStages.map((stg, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={stg.completed}
                          onChange={() => onToggleProjectStage(proj.id, idx)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                        <span className={stg.completed ? 'line-through text-slate-400' : ''}>
                          {stg.stage}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <form className="mb-3 grid gap-2" onSubmit={(event) => {
                  event.preventDefault();
                  const input = event.currentTarget.elements.namedItem('repository') as HTMLInputElement;
                  const value = input.value.trim();
                  if (value && !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(value)) {
                    input.setCustomValidity('Enter an HTTPS GitHub repository URL.');
                    input.reportValidity();
                    return;
                  }
                  onSaveRepository(proj.id, value);
                }}>
                  <label className="study-field">GitHub repository
                    <input name="repository" type="url" defaultValue={proj.repositoryUrl ?? ''} onInput={(event) => event.currentTarget.setCustomValidity('')} />
                  </label>
                  <button type="submit" className="study-button justify-self-start">Save portfolio link</button>
                </form>
                {proj.repositoryUrl && /^https:\/\/github\.com\//.test(proj.repositoryUrl) &&
                  <a className="overview-link mb-2" href={proj.repositoryUrl} target="_blank" rel="noreferrer">Open project repository</a>}
                {proj.developmentStages.some((stage) => stage.completed) && <p className="mb-2">
                  <strong>Résumé draft</strong> · Completed {proj.developmentStages.filter((stage) => stage.completed).map((stage) => stage.stage).join('; ')} for {proj.title}.
                </p>}
                <p><strong>Portfolio Value:</strong> {proj.portfolioValue}</p>
                <p className="mt-0.5"><strong>Testing Requirement:</strong> {proj.testingRequirements.join('; ')}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 7. CAREER GROWTH & PLACEMENT READINESS VIEW (Layer 3)
// ==========================================
export const CareerGrowthView: React.FC<{
  careerSnapshot: Layer3CareerEvaluationSnapshot;
  onLogCpProblemSolved: () => void;
  onLogJapaneseVocab: () => void;
  onLogEnglishSpeaking: () => void;
  onJumpToGapTopic: (topicId: string) => void;
}> = ({
  careerSnapshot,
  onLogCpProblemSolved,
  onLogJapaneseVocab,
  onLogEnglishSpeaking,
  onJumpToGapTopic,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Career Growth, Placement 2029 &amp; GATE CSE Outcomes (Layer 3)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            All readiness metrics are computed strictly from verified Layer 2 assessment scores, retention evidence, and completed project milestones.
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Placement Readiness (2029)</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {careerSnapshot.overallPlacementReadinessPercent}%
            </p>
          </div>
          <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">GATE CSE Readiness</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {careerSnapshot.gateOverallReadinessPercent}%
            </p>
          </div>
        </div>
      </div>

      {/* Placement Readiness Evidence Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Product-Company Placement Readiness Matrix (Verified Evidence)
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerSnapshot.placementDimensions.map((dim) => (
            <div
              key={dim.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {dim.label}
                </h3>
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                  {dim.verifiedScore}%
                </span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${dim.verifiedScore}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
                <strong>Evidence:</strong> {dim.evidenceSummary}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Target: {dim.targetBenchmark}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Layer 3 -> Layer 2 Skill-Gap Recommendations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Closed-Loop Skill-Gap Signals Sent to Layer 2 Learning Engine
        </h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {careerSnapshot.skillGapsForLayer2.map((gap) => (
            <div
              key={gap.id}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-orange-50/30 dark:bg-orange-950/20"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-orange-700 dark:text-orange-400">
                  {gap.urgency} PRIORITY GAP
                </span>
                <span className="text-slate-500">{gap.targetGoalId.toUpperCase()}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                {gap.gapArea}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {gap.evidenceBasis}
              </p>
              {gap.recommendedTopicId && (
                <button
                  type="button"
                  onClick={() => onJumpToGapTopic(gap.recommendedTopicId!)}
                  className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Open Recommended Lesson →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* GATE CSE Subject Progress & Competitive Programming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Official GATE CSE Subject Coverage &amp; PYQ Accuracy
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 pr-2">Subject (Official Syllabus)</th>
                  <th className="py-2 px-2 text-right">Mastery</th>
                  <th className="py-2 px-2 text-right">PYQs</th>
                  <th className="py-2 pl-2 text-right">Mock Acc.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {careerSnapshot.gateSubjects.map((sub, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-2 font-medium text-slate-900 dark:text-slate-100">
                      {sub.subject}
                      {sub.isWeakSubject && (
                        <span className="ml-1.5 text-[11px] text-orange-600 dark:text-orange-400">
                          · Weak Area
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">{sub.masteryPercent}%</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {sub.pyqTotal ? `${sub.pyqSolved}/${sub.pyqTotal}` : '—'}
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono tabular-nums">{sub.mockAccuracyPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                DSA &amp; Competitive Programming Tracker
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Total Solved: <strong>{careerSnapshot.cpRecord.totalSolved}</strong> (Easy {careerSnapshot.cpRecord.easySolved} · Med {careerSnapshot.cpRecord.mediumSolved} · Hard {careerSnapshot.cpRecord.hardSolved}) · Rating: <strong>{careerSnapshot.cpRecord.currentRating}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={onLogCpProblemSolved}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0"
            >
              + Log Solved Problem
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {careerSnapshot.cpRecord.patternsMastered.map((pat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                <span className="font-medium text-slate-800 dark:text-slate-200">{pat.pattern}</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                  {pat.solved}/{pat.target} solved · {pat.accuracy}% accuracy
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Separate Japanese (JLPT N5) & English Communication Trackers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Japanese Language Proficiency ({careerSnapshot.languages.japanese.targetLevel})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official JEES N5 Benchmark vs Spaced Repetition Progress
              </p>
            </div>
            <button
              type="button"
              onClick={onLogJapaneseVocab}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              + Log 5 N5 Words
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs tabular-nums">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">N5 Vocabulary:</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {careerSnapshot.languages.japanese.vocabularyCount} / {careerSnapshot.languages.japanese.vocabularyTarget}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">N5 Grammar Points:</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {careerSnapshot.languages.japanese.grammarPointsMastered} / {careerSnapshot.languages.japanese.grammarTarget}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">Reading / Listening:</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {careerSnapshot.languages.japanese.readingScorePercent}% / {careerSnapshot.languages.japanese.listeningScorePercent}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">JLPT N5 Readiness:</span>
              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {careerSnapshot.languages.japanese.readinessPercent}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                English Speaking &amp; Technical Interview Fluency
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily 8:00–8:25 PM Speaking Slot &amp; PREP/STAR Articulation
              </p>
            </div>
            <button
              type="button"
              onClick={onLogEnglishSpeaking}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
            >
              + Log Speaking Drill
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs tabular-nums">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">Speaking Sessions:</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {careerSnapshot.languages.english.speakingSessionsCompleted} completed
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">Pronunciation Clarity:</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {careerSnapshot.languages.english.pronunciationClarityScore}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">Grammar &amp; Listening:</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {careerSnapshot.languages.english.grammarAccuracyPercent}% / {careerSnapshot.languages.english.listeningComprehensionPercent}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-500">Interview Articulation:</span>
              <p className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                {careerSnapshot.languages.english.interviewCommunicationScore}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 8. ANALYTICS, POMODORO TIMER & WEEKLY AI REPORT VIEW
// ==========================================
export const AnalyticsView: React.FC<{
  masteryRecords: Record<string, TopicMasteryRecord>;
  careerSnapshot: Layer3CareerEvaluationSnapshot;
  learningLogs: { id: string; date: string; topicTitle: string; reflection: string; minutes: number }[];
  onAddLearningLog: (topicTitle: string, reflection: string, minutes: number) => void;
}> = ({ masteryRecords, careerSnapshot, learningLogs, onAddLearningLog }) => {
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [newLogTopic, setNewLogTopic] = useState('DBMS B+ Tree Indexing');
  const [newLogReflection, setNewLogReflection] = useState('');

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setPomodoroSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const records = Object.values(masteryRecords);
  const masteredCount = records.filter((r) => r.status === 'MASTERED').length;
  const revisionCount = records.filter((r) => r.status === 'NEEDS_REVISION').length;
  const inProgressCount = records.filter((r) => r.status === 'IN_PROGRESS').length;

  const mins = Math.floor(pomodoroSeconds / 60);
  const secs = pomodoroSeconds % 60;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Learning Analytics, Focus Timer &amp; Weekly AI Report
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Rewards verified concept mastery, retention accuracy, and daily consistency rather than raw hours logged.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Topics Mastered / In Progress</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {masteredCount} Mastered · {inProgressCount} Active
          </p>
          <p className="mt-1 text-xs text-slate-500">{revisionCount} flagged for revision</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Weekly Focused Study Time</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            24h 15m
          </p>
          <p className="mt-1 text-xs text-slate-500">94% timetable adherence this week</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Consistency Streak</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            12 Days
          </p>
          <p className="mt-1 text-xs text-slate-500">Zero sleep or academic cap violations</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500">Pomodoro Deep-Focus Timer</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label={timerRunning ? 'Pause Focus Timer' : 'Start Focus Timer'}
                onClick={() => setTimerRunning((r) => !r)}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                aria-label="Reset Focus Timer"
                onClick={() => {
                  setTimerRunning(false);
                  setPomodoroSeconds(25 * 60);
                }}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly AI Report */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Weekly AI Diagnostic &amp; Progression Report (Nov 9 – Nov 15, 2026)
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/20">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">Verified Strengths</p>
            <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
              <li>• DBMS B+ Tree Composite Indexing (92% mastery)</li>
              <li>• O(N) Monotonic Deque Sliding Window (86% pattern accuracy)</li>
              <li>• English PREP/STAR Interview Articulation (81%)</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-orange-50/30 dark:bg-orange-950/20">
            <p className="font-bold text-orange-800 dark:text-orange-300">Weaknesses &amp; Repeated Mistakes</p>
            <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
              <li>• OS Virtual Memory EMAT Numericals (64% — TLB miss penalty weight)</li>
              <li>• GATE TOC DCFL vs CFL Complement Closure (62%)</li>
              <li>• JLPT N5 Particle に vs で location of active event</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-blue-50/30 dark:bg-blue-950/20">
            <p className="font-bold text-blue-800 dark:text-blue-300">Autonomous Next Steps</p>
            <ul className="mt-2 space-y-1 text-slate-700 dark:text-slate-300">
              <li>• Scheduled OS EMAT numerical drill in tomorrow&apos;s morning revision slot</li>
              <li>• Advance Full-Stack JWT/RBAC project to Stage 3 integration tests</li>
              <li>• Maintain 7h Working Day sleep and 60m academic limit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Learning Reflection Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Personal Learning Logs &amp; Session Notes
        </h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            aria-label="Log topic title"
            value={newLogTopic}
            onChange={(e) => setNewLogTopic(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
          <input
            type="text"
            aria-label="Log reflection note"
            value={newLogReflection}
            onChange={(e) => setNewLogReflection(e.target.value)}
            placeholder="Write key insight or mistake learned today..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
          <button
            type="button"
            onClick={() => {
              if (!newLogReflection.trim()) return;
              onAddLearningLog(newLogTopic, newLogReflection.trim(), 45);
              setNewLogReflection('');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap"
          >
            Save Log Entry
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {learningLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{log.topicTitle}</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{log.reflection}</p>
              </div>
              <span className="font-mono text-slate-500 tabular-nums shrink-0">
                {log.date} · {log.minutes}m
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. AI PERSONAL COACH & MISSED SESSION RECOVERY VIEW
// ==========================================
export const AICoachAndRecoveryView: React.FC<{
  assignedMode: string;
  activeMainSkill: string;
  overallPlacementReadiness: number;
  weakTopics: string[];
  dailySessions: ScheduledLearningRecommendation[];
  recoveryHistory: MissedSessionRecoveryDecision[];
  onTriggerMissedSession: (session: ScheduledLearningRecommendation) => void;
}> = ({
  assignedMode,
  activeMainSkill,
  overallPlacementReadiness,
  weakTopics,
  dailySessions,
  recoveryHistory,
  onTriggerMissedSession,
}) => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'coach'; text: string; onDevice?: boolean }[]
  >([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const askCoach = async (questionText: string) => {
    const question = questionText.trim();
    if (!question || loading) return;
    setMessages((previous) => [...previous, { role: 'user', text: question }]);
    setInputQuestion('');
    setLoading(true);
    try {
      const response = await answerStudyQuestion(question, dailySessions, weakTopics);
      setMessages((previous) => [...previous, { role: 'coach', ...response }]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_]/g, ''));
      window.speechSynthesis.speak(utterance);
    }
  };

  const quickPrompts = [
    'What should I study today and why is this my next topic?',
    'What should I revise today based on my weak areas?',
    'How can I recover a missed session without losing sleep?',
    'What is one practical task I can do in my next slot?',
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Study Coach
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Uses on-device Gemini Nano on compatible desktop Chrome browsers. Other browsers get guidance from your current plan. No AI service key is needed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coach Conversation Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => askCoach(qp)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  {qp}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white ml-8'
                      : 'bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 mr-4'
                  }`}
                >
                  {m.role === 'coach' && (
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>
                        <strong>AI Personal Coach</strong>
                        {' · '}
                        {m.onDevice ? 'On-device Gemini Nano' : 'Planner guidance'}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(m.text)}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Read Aloud
                      </button>
                    </div>
                  )}
                  <div className="whitespace-pre-line">{m.text}</div>
                </div>
              ))}
              {loading && (
                <div className="p-3 text-xs text-slate-500">
                  Analyzing your timetable constraints, mastery records, and placement readiness...
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              askCoach(inputQuestion);
            }}
            className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              aria-label="Ask AI Personal Coach"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask why a topic was chosen, how to recover a missed slot, or request a practice quiz..."
              className="flex-1 px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              Ask Coach
            </button>
          </form>
        </div>

        {/* Missed Session Recovery Workbench */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Intelligent Missed-Session Recovery Engine
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Never shifts every subsequent session or sacrifices sleep, meals, workout, or college hours. Distinguishes one-off misses from repeated conceptual struggle.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Simulate / Record a Missed Session Today:
            </p>
            {dailySessions.slice(0, 4).map((sess) => (
              <div
                key={sess.sessionId}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
              >
                <div className="truncate">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {sess.topicTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {sess.displayTime} · Status: {sess.status}
                  </p>
                </div>
                {sess.status === 'SCHEDULED' ? (
                  <button
                    type="button"
                    onClick={() => onTriggerMissedSession(sess)}
                    className="px-2.5 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 rounded shrink-0"
                  >
                    Mark Missed
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 shrink-0">
                    Recovered
                  </span>
                )}
              </div>
            ))}
          </div>

          {recoveryHistory.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Active Recovery Decisions ({recoveryHistory.length}):
              </p>
              {recoveryHistory.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {rec.missedTopicTitle} ({rec.action.replace(/_/g, ' ')})
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">{rec.explanation}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Target Slot: {rec.targetSlotDisplay} ({rec.recommendedDurationMinutes}m) · Sleep &amp; Meals Protected
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 10. SETTINGS, NOTIFICATIONS, OFFLINE & CLOUD SQL SYNC VIEW
// ==========================================
export const SettingsAndSyncView: React.FC<{
  workspace: PersistedWorkspaceState;
  userEmail: string | null;
  syncStatus: string;
  conflict: SyncConflictInfo | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onPushCloudSync: (forceOverwrite?: boolean) => void;
  onPullCloudSync: () => void;
  onResolveConflictMerge: () => void;
  onUpdateNotificationPrefs: (prefs: NotificationPreferenceConfig) => void;
  onImportWorkspaceJson: (restored: PersistedWorkspaceState) => void;
}> = ({
  workspace,
  userEmail,
  syncStatus,
  conflict,
  onGoogleSignIn,
  onSignOut,
  onPushCloudSync,
  onPullCloudSync,
  onResolveConflictMerge,
  onUpdateNotificationPrefs,
  onImportWorkspaceJson,
}) => {
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);
  const prefs = workspace.settings.notificationPrefs;

  const handleExportBackupJson = () => {
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetherlearn-backup-v${workspace.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackupJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '')) as PersistedWorkspaceState;
        if (parsed.layer1Schedule && parsed.layer2Learning && parsed.layer3Career) {
          onImportWorkspaceJson(parsed);
          setRestoreFeedback(`Restored full 3-layer workspace backup (version v${parsed.version}) without losing historical records.`);
        } else {
          setRestoreFeedback('Invalid backup file structure.');
        }
      } catch {
        setRestoreFeedback('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Account Isolation, Cloud SQL Sync, Offline Backup &amp; Notification Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Persists your three independent layers locally in IndexedDB for instant offline access and synchronizes with your provisioned PostgreSQL database.
        </p>
      </div>

      {/* Authentication & Cloud SQL Sync Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Google Authentication &amp; PostgreSQL Cloud Synchronisation
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {userEmail
                ? `Signed in as ${userEmail} · Snapshot Version v${workspace.version} · Last Updated ${workspace.updatedAt}`
                : 'Currently operating in Local IndexedDB Mode. Sign in with Google to sync across devices via Cloud SQL.'}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
              Status: {syncStatus}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!userEmail ? (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Sign In with Google
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onPushCloudSync(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  Sync to Cloud SQL
                </button>
                <button
                  type="button"
                  onClick={onPullCloudSync}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg"
                >
                  <CloudDownload className="w-3.5 h-3.5" />
                  Pull Cloud Snapshot
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Conflict Resolution Modal / Banner */}
        {conflict && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              Sync Conflict Detected — Newer Cloud Snapshot Protected
            </p>
            <p className="text-amber-800 dark:text-amber-300">{conflict.reason}</p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onResolveConflictMerge}
                className="px-3.5 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Smart Non-Destructive Merge (Recommended)
              </button>
              <button
                type="button"
                onClick={() => onPushCloudSync(true)}
                className="px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                Keep Local Offline Version
              </button>
              <button
                type="button"
                onClick={onPullCloudSync}
                className="px-3 py-1.5 font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
              >
                Use Cloud Version
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Full 3-Layer Portable Backup &amp; Restore
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Export or restore your Timetable Templates, Date Mode Assignments, Mastery Records, and Career Evidence as a verified JSON snapshot.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportBackupJson}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg"
            >
              <Download className="w-3.5 h-3.5" />
              Export Backup JSON
            </button>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore Backup JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackupJson} className="hidden" />
            </label>
          </div>
        </div>
        {restoreFeedback && (
          <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {restoreFeedback}
          </p>
        )}
      </div>

      {/* Notification Preferences & Quiet Hours */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Notification Categories &amp; Sleep Quiet Hours
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Quiet hours automatically silence reminders during your 10:00 PM–5:00 AM protected sleep window.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {(
            [
              ['enableSessionReminders', 'Upcoming Learning Sessions'],
              ['enableRevisionAlerts', 'Spaced Repetition Due Alerts'],
              ['enableAssessmentAlerts', 'Mastery Quiz & Assessment Reminders'],
              ['enableExamCountdowns', 'Examination Countdowns'],
              ['enableMissedSessionRecovery', 'Missed Session Recovery Prompts'],
              ['enableSyllabusUpdates', 'Trusted Syllabus Update Alerts'],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>
              <input
                type="checkbox"
                checked={Boolean(prefs[key])}
                onChange={(e) =>
                  onUpdateNotificationPrefs({
                    ...prefs,
                    [key]: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-blue-600"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-slate-500">Reminder Lead Time: </span>
            <strong className="font-mono tabular-nums">{prefs.reminderLeadMinutes} mins before slot</strong>
          </div>
          <div>
            <span className="text-slate-500">Protected Quiet Hours: </span>
            <strong className="font-mono tabular-nums">
              {prefs.quietHoursStart} – {prefs.quietHoursEnd}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
