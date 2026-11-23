import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Edit3,
  Upload,
  Check,
  AlertTriangle,
  Sun,
  Briefcase,
  BookOpen,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  ActivityCategory,
  DailyMode,
  DateModeAssignment,
  ExamConfiguration,
  HolidayImportParseResult,
  ModeChangePreviewSummary,
  TimetableActivity,
  TimetableTemplate,
} from '../types/domain.ts';
import {
  applyConfirmedModeChange,
  buildModeChangePreview,
  expandDateRange,
  parseHolidayImportContent,
  prepareExamModeActivation,
  removeDateModeAssignment,
  resolveDateMode,
  restorePostExamConfiguration,
  validateScheduleConstraints,
} from '../layers/layer1Schedule.ts';

export function getCategoryColorText(category: ActivityCategory): string {
  switch (category) {
    case 'DSA_CODING':
      return 'text-blue-700 dark:text-blue-400';
    case 'GATE_PREP':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'DEVELOPMENT_SKILL':
      return 'text-violet-700 dark:text-violet-400';
    case 'EXAM_PREP':
      return 'text-orange-700 dark:text-orange-400';
    case 'FITNESS':
      return 'text-teal-700 dark:text-teal-400';
    case 'JAPANESE':
    case 'ENGLISH':
      return 'text-indigo-700 dark:text-indigo-400';
    case 'COLLEGE_COMMITMENT':
    case 'ACADEMICS':
      return 'text-slate-700 dark:text-slate-300';
    case 'SLEEP':
      return 'text-slate-500 dark:text-slate-400';
    default:
      return 'text-slate-600 dark:text-slate-400';
  }
}

export function getModeLabel(mode: DailyMode): string {
  if (mode === 'WORKING_DAY') return 'Working Day';
  if (mode === 'HOLIDAY') return 'Holiday';
  return 'Exam Mode';
}

// ==========================================
// 1. MY TIMETABLE VIEW (Working Day, Holiday, Exam Mode + Activity Editor)
// ==========================================
export const TimetableView: React.FC<{
  selectedDate: string;
  templates: Record<DailyMode, TimetableTemplate>;
  dateAssignments: Record<string, DateModeAssignment>;
  exams: ExamConfiguration[];
  onUpdateTemplate: (mode: DailyMode, updated: TimetableTemplate) => void;
  onActivateExamMode: (examId: string) => void;
  onRestorePostExam: (examId: string) => void;
  onOpenChangeMode: () => void;
}> = ({
  selectedDate,
  templates,
  dateAssignments,
  exams,
  onUpdateTemplate,
  onActivateExamMode,
  onRestorePostExam,
  onOpenChangeMode,
}) => {
  const resolvedToday = resolveDateMode(selectedDate, dateAssignments);
  const [inspectMode, setInspectMode] = useState<DailyMode>(resolvedToday.mode);
  const [viewFormat, setViewFormat] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(30);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const activeTemplate = templates[inspectMode];

  const handleStartEdit = (act: TimetableActivity) => {
    setEditingSlotId(act.id);
    setEditTitle(act.title);
    setEditDuration(act.durationMinutes);
    setValidationErrors([]);
    setSaveFeedback(null);
  };

  const handleSaveSlotEdit = (act: TimetableActivity) => {
    const updatedActivities = activeTemplate.activities.map((item) =>
      item.id === act.id
        ? { ...item, title: editTitle.trim() || item.title, durationMinutes: Number(editDuration) || item.durationMinutes }
        : item
    );
    const candidateTemplate: TimetableTemplate = {
      ...activeTemplate,
      activities: updatedActivities,
    };
    const check = validateScheduleConstraints(candidateTemplate);
    if (!check.valid) {
      setValidationErrors(check.errors);
      return;
    }
    onUpdateTemplate(inspectMode, candidateTemplate);
    setEditingSlotId(null);
    setValidationErrors([]);
    setSaveFeedback(`Saved "${editTitle}" in ${activeTemplate.name} template (all health & sleep constraints verified).`);
  };

  const handleToggleCollegeLearning = (act: TimetableActivity) => {
    const updatedActivities = activeTemplate.activities.map((item) =>
      item.id === act.id
        ? { ...item, allowIndependentLearningInCollege: !item.allowIndependentLearningInCollege }
        : item
    );
    onUpdateTemplate(inspectMode, { ...activeTemplate, activities: updatedActivities });
  };

  const weekDates = expandDateRange('2026-11-15', '2026-11-21');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            My Timetable &amp; Constraint Templates
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Date {selectedDate} is assigned to <strong>{getModeLabel(resolvedToday.mode)}</strong>
            {' · '}
            {resolvedToday.isExplicit ? 'Explicitly Assigned' : 'Default Mode (Working Day)'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['WORKING_DAY', 'HOLIDAY', 'EXAM_MODE'] as DailyMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setInspectMode(m);
                  setEditingSlotId(null);
                  setValidationErrors([]);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  inspectMode === m
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {getModeLabel(m)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setViewFormat('DAILY')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                viewFormat === 'DAILY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Daily View
            </button>
            <button
              type="button"
              onClick={() => setViewFormat('WEEKLY')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                viewFormat === 'WEEKLY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Weekly View
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenChangeMode}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Change Daily Mode
          </button>
        </div>
      </div>

      {/* Template Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Wake-Up &amp; Sleep Window</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {activeTemplate.wakeTime} – {activeTemplate.sleepTime}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Protected Sleep: {Math.round(activeTemplate.minSleepMinutes / 60)}h ({activeTemplate.minSleepMinutes}m)
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Daily Learning Allocation</p>
          <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {Math.floor(activeTemplate.totalLearningMinutes / 60)}h {activeTemplate.totalLearningMinutes % 60}m
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Published to Layer 2 Learning Engine
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">College Academic Limit</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            Max {activeTemplate.maxAcademicMinutes} mins/day
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {inspectMode === 'WORKING_DAY' ? '15m Morning + 45m Evening' : 'Protected 1-Hour Slot'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Workout &amp; Walking</p>
          <p className="mt-1 text-lg font-bold text-teal-600 dark:text-teal-400 tabular-nums">
            60 mins Combined
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Fixed Health Commitment Protected
          </p>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div role="alert" className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Schedule Constraint Violation Prevented</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-red-700 dark:text-red-300 list-disc list-inside">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {saveFeedback && (
        <div role="status" className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {saveFeedback}
        </div>
      )}

      {viewFormat === 'DAILY' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {activeTemplate.name} Timetable ({activeTemplate.activities.length} Daily Slots)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeTemplate.description}
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Fixed Commitments Locked · Flexible Learning Slots Editable
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-3 px-4 w-44">Time Range</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 w-36">Category</th>
                  <th className="py-3 px-4 w-28 text-right">Duration</th>
                  <th className="py-3 px-4 w-40">Commitment Rule</th>
                  <th className="py-3 px-4 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {activeTemplate.activities.map((act) => {
                  const isEditing = editingSlotId === act.id;
                  const isCurrentHighlight = act.id === 'wd-10' || act.id === 'hol-05' || act.id === 'ex-04';
                  return (
                    <tr
                      key={act.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isCurrentHighlight ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {act.displayTime}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            aria-label="Edit activity title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full max-w-xs px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          />
                        ) : (
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {act.title}
                            {isCurrentHighlight && (
                              <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                                · Next Priority Slot
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-xs font-medium ${getCategoryColorText(act.category)}`}>
                        {act.category.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            aria-label="Edit duration minutes"
                            min={5}
                            max={600}
                            value={editDuration}
                            onChange={(e) => setEditDuration(Number(e.target.value))}
                            className="w-20 px-2 py-1 text-right text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          />
                        ) : (
                          `${act.durationMinutes} min`
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          {act.isFixedCommitment ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Fixed Commitment</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-blue-500" />
                              <span>Flexible Learning</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveSlotEdit(act)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSlotId(null)}
                              className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : act.id === 'wd-08' ? (
                          <button
                            type="button"
                            onClick={() => handleToggleCollegeLearning(act)}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {act.allowIndependentLearningInCollege ? 'Disable College Study' : 'Allow College Study'}
                          </button>
                        ) : !act.isFixedCommitment ? (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(act)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit Slot
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Weekly Date-Wise Schedule Overview (Nov 15 – Nov 21, 2026)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Never assumes Monday–Friday are Working Days or weekends are Holidays. Unassigned dates use the default Working Day mode.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDates.map((d) => {
              const res = resolveDateMode(d, dateAssignments);
              const tpl = templates[res.mode];
              return (
                <div
                  key={d}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {d}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {getModeLabel(res.mode)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {res.isExplicit ? 'Explicit Assignment' : 'Default Mode'}
                  </p>
                  <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 tabular-nums">
                    Learning: {tpl.totalLearningMinutes}m
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    Sleep: {Math.round(tpl.minSleepMinutes / 60)}h
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dedicated Exam Mode Configuration & Post-Exam Automatic Restoration Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Dedicated Exam Mode &amp; Post-Exam Automatic Configuration Restoration
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Snapshots your exact date assignments and active skill track before activating Exam Mode, and restores them automatically once exams finish.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                    Window: {exam.startDate} to {exam.endDate} · Status: <strong>{exam.status}</strong> · Countdown: 25 Days Remaining
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {exam.status !== 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={() => onActivateExamMode(exam.id)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Activate Exam Mode Window
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRestorePostExam(exam.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      End Exam Mode &amp; Restore Previous Config
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {exam.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {sub.code}: {sub.name}
                      </span>
                      <span className="text-orange-600 dark:text-orange-400 font-medium tabular-nums">
                        Exam: {sub.examDate} · Priority: {sub.priority}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {sub.units.map((u) => (
                        <div key={u.unitNumber} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>
                            Unit {u.unitNumber}: {u.title} {u.isWeakArea ? '(Weak Area Priority)' : ''}
                          </span>
                          <span className="font-mono tabular-nums">
                            PYQs {u.completedPyqs}/{u.pyqCount} · {u.masteryPercent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. CHANGE DAILY MODE INTERFACE (3 Mode Cards + Date Selection + Confirmation Summary)
// ==========================================
export const ChangeDailyModeView: React.FC<{
  selectedDate: string;
  templates: Record<DailyMode, TimetableTemplate>;
  dateAssignments: Record<string, DateModeAssignment>;
  onApplyModeAssignment: (dates: string[], newMode: DailyMode) => void;
  onRemoveModeAssignment: (dates: string[]) => void;
}> = ({
  selectedDate,
  templates,
  dateAssignments,
  onApplyModeAssignment,
  onRemoveModeAssignment,
}) => {
  const currentResolved = resolveDateMode(selectedDate, dateAssignments);
  const [chosenMode, setChosenMode] = useState<DailyMode>(currentResolved.mode);
  const [selectionType, setSelectionType] = useState<'SINGLE' | 'MULTIPLE' | 'RANGE'>('SINGLE');
  const [singleDate, setSingleDate] = useState(selectedDate);
  const [multiDatesInput, setMultiDatesInput] = useState(`${selectedDate}, 2026-11-16`);
  const [rangeStart, setRangeStart] = useState(selectedDate);
  const [rangeEnd, setRangeEnd] = useState('2026-11-17');
  const [pendingPreview, setPendingPreview] = useState<ModeChangePreviewSummary | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const computeSelectedDates = (): string[] => {
    if (selectionType === 'SINGLE') {
      return singleDate ? [singleDate] : [];
    }
    if (selectionType === 'MULTIPLE') {
      return multiDatesInput
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
    }
    return expandDateRange(rangeStart, rangeEnd);
  };

  const handleReviewChanges = () => {
    const dates = computeSelectedDates();
    if (dates.length === 0) {
      setStatusMessage('Please select at least one valid YYYY-MM-DD date.');
      return;
    }
    const preview = buildModeChangePreview(dates, chosenMode, dateAssignments, templates);
    setPendingPreview(preview);
    setStatusMessage(null);
  };

  const handleConfirmSave = () => {
    if (!pendingPreview) return;
    onApplyModeAssignment(pendingPreview.selectedDates, pendingPreview.newMode);
    setStatusMessage(
      `Applied ${getModeLabel(pendingPreview.newMode)} to ${pendingPreview.affectedCount} date(s). Original timetable templates and unselected dates remain unchanged.`
    );
    setPendingPreview(null);
  };

  const handleResetToDefault = () => {
    const dates = computeSelectedDates();
    if (dates.length === 0) return;
    onRemoveModeAssignment(dates);
    setStatusMessage(`Removed explicit assignment for ${dates.length} date(s); reverted to Default Mode (Working Day).`);
    setPendingPreview(null);
  };

  const modeCards: {
    mode: DailyMode;
    icon: React.ReactNode;
    accentBorder: string;
    accentText: string;
  }[] = [
    {
      mode: 'WORKING_DAY',
      icon: <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      accentBorder: chosenMode === 'WORKING_DAY' ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 dark:border-slate-800',
      accentText: 'text-blue-600 dark:text-blue-400',
    },
    {
      mode: 'HOLIDAY',
      icon: <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      accentBorder: chosenMode === 'HOLIDAY' ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200 dark:border-slate-800',
      accentText: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      mode: 'EXAM_MODE',
      icon: <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      accentBorder: chosenMode === 'EXAM_MODE' ? 'border-orange-600 ring-2 ring-orange-600/20' : 'border-slate-200 dark:border-slate-800',
      accentText: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Change Daily Mode &amp; Date Assignment Studio
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Select one of the three timetable modes below, choose a single date, multiple dates, or a date range, and review the confirmation summary before saving.
        </p>
      </div>

      {statusMessage && (
        <div role="status" className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {statusMessage}
        </div>
      )}

      {/* Three Distinct Mode Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {modeCards.map(({ mode, icon, accentBorder, accentText }) => {
          const tpl = templates[mode];
          const isAssignedToday = currentResolved.mode === mode;
          const isSelectedCard = chosenMode === mode;

          return (
            <div
              key={mode}
              onClick={() => setChosenMode(mode)}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between ${accentBorder}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {icon}
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {tpl.name}
                    </h2>
                  </div>
                  <span className={`text-xs font-semibold ${accentText}`}>
                    {isAssignedToday ? 'Current Today' : isSelectedCard ? 'Selected' : 'Select Mode'}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {tpl.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Wake / Sleep:</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                      {tpl.wakeTime} – {tpl.sleepTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Total Learning:</span>
                    <p className={`font-semibold tabular-nums mt-0.5 ${accentText}`}>
                      {Math.floor(tpl.totalLearningMinutes / 60)}h {tpl.totalLearningMinutes % 60}m ({tpl.totalLearningMinutes}m)
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Key Constraints Protected:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {tpl.constraints.slice(0, 3).map((c, idx) => (
                      <li key={idx} className="truncate">• {c}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Timetable Preview ({tpl.activities.length} slots):
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {tpl.activities.slice(0, 8).map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-mono tabular-nums">{a.displayTime}</span>
                        <span className="truncate ml-2 font-medium text-slate-800 dark:text-slate-200">{a.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setChosenMode(mode);
                }}
                className={`mt-5 w-full py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${
                  isSelectedCard
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                {isSelectedCard ? `Selected: ${tpl.name}` : `Choose ${tpl.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Date Selection & Confirmation Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Step 2: Select Target Date, Multiple Dates, or Date Range
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mode changes affect only the dates you select below and never overwrite timetable templates.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['SINGLE', 'MULTIPLE', 'RANGE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectionType(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectionType === t
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t === 'SINGLE' ? 'Single Date' : t === 'MULTIPLE' ? 'Multiple Dates' : 'Date Range'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {selectionType === 'SINGLE' && (
            <div>
              <label htmlFor="mode-single-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Date (YYYY-MM-DD)
              </label>
              <input
                id="mode-single-date"
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 tabular-nums"
              />
            </div>
          )}

          {selectionType === 'MULTIPLE' && (
            <div className="md:col-span-2">
              <label htmlFor="mode-multi-dates" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Comma-Separated Dates (YYYY-MM-DD)
              </label>
              <input
                id="mode-multi-dates"
                type="text"
                value={multiDatesInput}
                onChange={(e) => setMultiDatesInput(e.target.value)}
                placeholder="2026-11-15, 2026-11-16, 2026-11-20"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          )}

          {selectionType === 'RANGE' && (
            <>
              <div>
                <label htmlFor="mode-range-start" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  id="mode-range-start"
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="mode-range-end" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  id="mode-range-end"
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 tabular-nums"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReviewChanges}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Preview &amp; Confirm Mode Change
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              Remove Assignment (Use Default)
            </button>
          </div>
        </div>

        {/* Mandatory Confirmation Summary Before Saving */}
        {pendingPreview && (
          <div
            role="region"
            aria-label="Mode Change Confirmation Summary"
            className="mt-5 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Confirm Mode Change Summary Before Saving
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Selected Date(s):</span>
                <p className="font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1 break-all">
                  {pendingPreview.selectedDates.join(', ')}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Previous Assigned Mode:</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {getModeLabel(pendingPreview.dominantPreviousMode)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">New Assigned Mode:</span>
                <p className="font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  {getModeLabel(pendingPreview.newMode)} ({pendingPreview.resultingTemplate.totalLearningMinutes}m learning)
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Number of Affected Dates:</span>
                <p className="font-mono font-semibold text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                  {pendingPreview.affectedCount} date(s)
                </p>
              </div>
            </div>

            {pendingPreview.overlappingExamDates.length > 0 && (
              <p className="mt-3 text-xs text-orange-700 dark:text-orange-300 font-medium">
                Warning: {pendingPreview.overlappingExamDates.join(', ')} currently has Exam Mode assigned. Saving will override Exam Mode on those dates.
              </p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm &amp; Save Mode Change
              </button>
              <button
                type="button"
                onClick={() => setPendingPreview(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 3. CALENDAR & HOLIDAY IMPORT VIEW
// ==========================================
export const CalendarAndHolidayView: React.FC<{
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dateAssignments: Record<string, DateModeAssignment>;
  exams: ExamConfiguration[];
  onApplyHolidayCandidates: (dates: { date: string; label: string }[]) => void;
  onQuickModeAssign: (date: string, mode: DailyMode) => void;
}> = ({
  selectedDate,
  onSelectDate,
  dateAssignments,
  exams,
  onApplyHolidayCandidates,
  onQuickModeAssign,
}) => {
  const [calView, setCalView] = useState<'MONTH' | 'WEEK' | 'DAY' | 'UPCOMING_HOLIDAYS'>('MONTH');
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(11); // 1-12 (November 2026)
  const [csvRawInput, setCsvRawInput] = useState(
    'date,label\n2026-11-24,University Founder Holiday\n2026-11-28,Semester Prep Study Holiday\n2026-11-24,Duplicate Entry Example\n2026-02-30,Invalid Date Example'
  );
  const [parsedResult, setParsedResult] = useState<HolidayImportParseResult | null>(null);
  const [importConfirmedBanner, setImportConfirmedBanner] = useState<string | null>(null);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthDates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    monthDates.push(`${year}-${mm}-${dd}`);
  }

  const handleParseHolidayText = () => {
    const res = parseHolidayImportContent(csvRawInput, dateAssignments);
    setParsedResult(res);
    setImportConfirmedBanner(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      setCsvRawInput(content);
      setParsedResult(parseHolidayImportContent(content, dateAssignments));
    };
    reader.readAsText(file);
  };

  const handleConfirmHolidayImport = () => {
    if (!parsedResult) return;
    const validItems = parsedResult.candidates
      .filter((c) => c.status === 'VALID_NEW')
      .map((c) => ({ date: c.date, label: c.label }));
    onApplyHolidayCandidates(validItems);
    setImportConfirmedBanner(
      `Applied ${validItems.length} confirmed holiday date(s) to Calendar. Skipped ${parsedResult.duplicateCount} duplicate(s) and ${parsedResult.invalidCount} invalid row(s).`
    );
    setParsedResult(null);
  };

  const explicitHolidays = Object.values(dateAssignments).filter(
    (a) => a.isExplicit && a.mode === 'HOLIDAY'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Calendar &amp; Holiday Import Manager
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Default Mode is <strong>Working Day</strong> for all dates unless you explicitly assign Holiday or Exam Mode.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1">
            <button
              type="button"
              aria-label="Previous Month"
              onClick={() => {
                if (month === 1) {
                  setMonth(12);
                  setYear((y) => y - 1);
                } else {
                  setMonth((m) => m - 1);
                }
              }}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {year}-{String(month).padStart(2, '0')}
            </span>
            <button
              type="button"
              aria-label="Next Month"
              onClick={() => {
                if (month === 12) {
                  setMonth(1);
                  setYear((y) => y + 1);
                } else {
                  setMonth((m) => m + 1);
                }
              }}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['MONTH', 'WEEK', 'DAY', 'UPCOMING_HOLIDAYS'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCalView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  calView === v
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {v === 'MONTH' ? 'Month' : v === 'WEEK' ? 'Week' : v === 'DAY' ? 'Day' : 'Upcoming Holidays'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {calView === 'MONTH' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {monthDates.map((d) => {
              const resolved = resolveDateMode(d, dateAssignments);
              const isSelected = d === selectedDate;
              const inExamWindow = exams.some((ex) => d >= ex.startDate && d <= ex.endDate);
              return (
                <div
                  key={d}
                  onClick={() => onSelectDate(d)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {d.slice(8, 10)}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        resolved.mode === 'HOLIDAY'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : resolved.mode === 'EXAM_MODE'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {getModeLabel(resolved.mode)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {resolved.isExplicit
                      ? resolved.assignment?.holidayLabel || 'Explicitly Set'
                      : 'Default (Working Day)'}
                  </p>
                  {inExamWindow && (
                    <p className="mt-1 text-[10px] font-medium text-orange-600 dark:text-orange-400">
                      Exam Period Window
                    </p>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1">
                    {(['WORKING_DAY', 'HOLIDAY', 'EXAM_MODE'] as DailyMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickModeAssign(d, m);
                        }}
                        className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                          resolved.mode === m
                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {m === 'WORKING_DAY' ? 'WD' : m === 'HOLIDAY' ? 'HOL' : 'EX'}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calView === 'WEEK' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
            7-Day Active Window Starting {selectedDate}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {expandDateRange(selectedDate, '2026-11-21').map((d) => {
              const res = resolveDateMode(d, dateAssignments);
              return (
                <div key={d} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="font-mono text-xs font-bold tabular-nums">{d}</p>
                  <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {getModeLabel(res.mode)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {res.isExplicit ? 'Explicitly Assigned' : 'Default Mode'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calView === 'DAY' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Single-Day Inspector: {selectedDate}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Assigned Mode: <strong>{getModeLabel(resolveDateMode(selectedDate, dateAssignments).mode)}</strong>
            {' · '}
            {resolveDateMode(selectedDate, dateAssignments).isExplicit ? 'Explicit User Assignment' : 'Default Working Day'}
          </p>
        </div>
      )}

      {calView === 'UPCOMING_HOLIDAYS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Explicitly Scheduled Holidays ({explicitHolidays.length})
          </h2>
          <div className="mt-3 space-y-2">
            {explicitHolidays.map((h) => (
              <div key={h.date} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-mono font-semibold tabular-nums">{h.date}</span>
                <span className="text-slate-700 dark:text-slate-300">{h.holidayLabel || 'Explicit Holiday'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Holiday (8h Sleep, 465m Learning)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holiday File Import with Duplicate/Invalid Detection & Mandatory Manual Confirmation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Import Holiday Dates (CSV / Text File) with Pre-Apply Validation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Parses imported dates, flags duplicates, invalid calendar dates, and exam conflicts, and requires your manual confirmation before changing the calendar.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV File</span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="mt-4">
          <label htmlFor="holiday-csv-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            CSV Content (`date,label` in YYYY-MM-DD format)
          </label>
          <textarea
            id="holiday-csv-input"
            rows={4}
            value={csvRawInput}
            onChange={(e) => setCsvRawInput(e.target.value)}
            className="w-full p-3 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={handleParseHolidayText}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Parse &amp; Inspect Imported Dates
            </button>
          </div>
        </div>

        {importConfirmedBanner && (
          <div role="status" className="mt-4 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            {importConfirmedBanner}
          </div>
        )}

        {parsedResult && (
          <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Proposed Holiday Import Report (Awaiting Your Confirmation)
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                Valid New: <strong>{parsedResult.validNewCount}</strong> · Duplicates: <strong>{parsedResult.duplicateCount}</strong> · Invalid: <strong>{parsedResult.invalidCount}</strong> · Exam Conflicts: <strong>{parsedResult.conflictCount}</strong>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Holiday Label</th>
                    <th className="py-2 px-3">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {parsedResult.candidates.map((c, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-mono tabular-nums">{c.date}</td>
                      <td className="py-2 px-3">{c.label}</td>
                      <td className="py-2 px-3 font-medium">
                        {c.status === 'VALID_NEW' && <span className="text-emerald-600 dark:text-emerald-400">Valid — Ready to Apply</span>}
                        {c.status === 'DUPLICATE' && <span className="text-amber-600 dark:text-amber-400">Duplicate — Will Skip</span>}
                        {c.status === 'INVALID_FORMAT' && <span className="text-red-600 dark:text-red-400">Invalid Calendar Date — Will Skip</span>}
                        {c.status === 'CONFLICT_EXAM' && <span className="text-orange-600 dark:text-orange-400">Conflicts with Exam Mode — Protected</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                disabled={parsedResult.validNewCount === 0}
                onClick={handleConfirmHolidayImport}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                Confirm &amp; Apply {parsedResult.validNewCount} Valid Holiday(s)
              </button>
              <button
                type="button"
                onClick={() => setParsedResult(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
