import {
  AvailableLearningSlotContract,
  DailyMode,
  DateModeAssignment,
  ExamConfiguration,
  HolidayImportCandidate,
  HolidayImportParseResult,
  Layer1PublishedAvailability,
  ModeChangePreviewSummary,
  TimetableActivity,
  TimetableTemplate,
} from '../types/domain.ts';

/**
 * LAYER 1 — SCHEDULE MANAGEMENT ENGINE
 *
 * Owns:
 * - Working Day, Holiday, and Exam Mode Timetable Templates
 * - Date-wise Mode Assignments (Default = Working Day; never assumes weekend = Holiday)
 * - Sleep & Health Constraints (7h Working Day, 8h Holiday, 60m Academic cap, 5m Arrival buffer)
 * - Holiday File Import Parsing & Conflict Detection
 * - Exam Mode Activation & Automatic Restoration of Previous Configuration
 * - Publishing Available Time Slots to Layer 2 (Learning Intelligence)
 */

export const INITIAL_WORKING_DAY_ACTIVITIES: TimetableActivity[] = [
  {
    id: 'wd-01',
    startTime: '05:00',
    endTime: '05:10',
    displayTime: '5:00–5:10 AM',
    title: 'Wake up and freshen up',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 10,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-02',
    startTime: '05:10',
    endTime: '05:40',
    displayTime: '5:10–5:40 AM',
    title: 'Workout',
    category: 'FITNESS',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-03',
    startTime: '05:40',
    endTime: '06:10',
    displayTime: '5:40–6:10 AM',
    title: 'Walking',
    category: 'FITNESS',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-04',
    startTime: '06:10',
    endTime: '06:35',
    displayTime: '6:10–6:35 AM',
    title: 'Bath and get ready',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 25,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-05',
    startTime: '06:35',
    endTime: '06:40',
    displayTime: '6:35–6:40 AM',
    title: 'Transition and preparation',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 5,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-06',
    startTime: '06:40',
    endTime: '06:55',
    displayTime: '6:40–6:55 AM',
    title: 'Extra study / revision',
    category: 'REVISION_PLANNING',
    durationMinutes: 15,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'gate_cse',
  },
  {
    id: 'wd-07',
    startTime: '06:55',
    endTime: '07:00',
    displayTime: '6:55–7:00 AM',
    title: 'College arrival buffer',
    category: 'COLLEGE_COMMITMENT',
    durationMinutes: 5,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-08',
    startTime: '07:00',
    endTime: '17:00',
    displayTime: '7:00 AM–5:00 PM',
    title: 'College and travel',
    category: 'COLLEGE_COMMITMENT',
    durationMinutes: 600,
    isFixedCommitment: true,
    isLearningSlot: false,
    allowIndependentLearningInCollege: false,
  },
  {
    id: 'wd-09',
    startTime: '17:00',
    endTime: '17:30',
    displayTime: '5:00–5:30 PM',
    title: 'Refresh and snacks',
    category: 'MEAL_BREAK',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-10',
    startTime: '17:30',
    endTime: '18:15',
    displayTime: '5:30–6:15 PM',
    title: 'DSA / Coding',
    category: 'DSA_CODING',
    durationMinutes: 45,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'dsa_cp',
  },
  {
    id: 'wd-11',
    startTime: '18:15',
    endTime: '18:25',
    displayTime: '6:15–6:25 PM',
    title: 'Break',
    category: 'MEAL_BREAK',
    durationMinutes: 10,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-12',
    startTime: '18:25',
    endTime: '19:10',
    displayTime: '6:25–7:10 PM',
    title: 'GATE preparation',
    category: 'GATE_PREP',
    durationMinutes: 45,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'gate_cse',
  },
  {
    id: 'wd-13',
    startTime: '19:10',
    endTime: '19:40',
    displayTime: '7:10–7:40 PM',
    title: 'Japanese',
    category: 'JAPANESE',
    durationMinutes: 30,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'japanese',
  },
  {
    id: 'wd-14',
    startTime: '19:40',
    endTime: '20:00',
    displayTime: '7:40–8:00 PM',
    title: 'Dinner',
    category: 'MEAL_BREAK',
    durationMinutes: 20,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-15',
    startTime: '20:00',
    endTime: '20:25',
    displayTime: '8:00–8:25 PM',
    title: 'English speaking',
    category: 'ENGLISH',
    durationMinutes: 25,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'english',
  },
  {
    id: 'wd-16',
    startTime: '20:25',
    endTime: '21:10',
    displayTime: '8:25–9:10 PM',
    title: 'College academics',
    category: 'ACADEMICS',
    durationMinutes: 45,
    isFixedCommitment: false,
    isLearningSlot: false,
  },
  {
    id: 'wd-17',
    startTime: '21:10',
    endTime: '21:40',
    displayTime: '9:10–9:40 PM',
    title: 'Development / technical learning',
    category: 'DEVELOPMENT_SKILL',
    durationMinutes: 30,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'fullstack',
  },
  {
    id: 'wd-18',
    startTime: '21:40',
    endTime: '21:50',
    displayTime: '9:40–9:50 PM',
    title: 'Review and plan',
    category: 'REVISION_PLANNING',
    durationMinutes: 10,
    isFixedCommitment: false,
    isLearningSlot: false,
  },
  {
    id: 'wd-19',
    startTime: '21:50',
    endTime: '22:00',
    displayTime: '9:50–10:00 PM',
    title: 'Prepare for sleep',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 10,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'wd-20',
    startTime: '22:00',
    endTime: '05:00',
    displayTime: '10:00 PM–5:00 AM',
    title: 'Sleep',
    category: 'SLEEP',
    durationMinutes: 420,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
];

export const INITIAL_HOLIDAY_ACTIVITIES: TimetableActivity[] = [
  {
    id: 'hol-01',
    startTime: '06:00',
    endTime: '06:15',
    displayTime: '6:00–6:15 AM',
    title: 'Wake up and freshen up',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 15,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-02',
    startTime: '06:15',
    endTime: '06:45',
    displayTime: '6:15–6:45 AM',
    title: 'Workout',
    category: 'FITNESS',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-03',
    startTime: '06:45',
    endTime: '07:15',
    displayTime: '6:45–7:15 AM',
    title: 'Walking',
    category: 'FITNESS',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-04',
    startTime: '07:15',
    endTime: '08:00',
    displayTime: '7:15–8:00 AM',
    title: 'Bath and personal time',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 45,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-05',
    startTime: '08:00',
    endTime: '09:30',
    displayTime: '8:00–9:30 AM',
    title: 'DSA / Problem solving',
    category: 'DSA_CODING',
    durationMinutes: 90,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'dsa_cp',
  },
  {
    id: 'hol-06',
    startTime: '09:30',
    endTime: '09:45',
    displayTime: '9:30–9:45 AM',
    title: 'Break',
    category: 'MEAL_BREAK',
    durationMinutes: 15,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-07',
    startTime: '09:45',
    endTime: '11:15',
    displayTime: '9:45–11:15 AM',
    title: 'GATE preparation',
    category: 'GATE_PREP',
    durationMinutes: 90,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'gate_cse',
  },
  {
    id: 'hol-08',
    startTime: '11:15',
    endTime: '11:30',
    displayTime: '11:15–11:30 AM',
    title: 'Break',
    category: 'MEAL_BREAK',
    durationMinutes: 15,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-09',
    startTime: '11:30',
    endTime: '12:30',
    displayTime: '11:30 AM–12:30 PM',
    title: 'Development / New technology',
    category: 'DEVELOPMENT_SKILL',
    durationMinutes: 60,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'fullstack',
  },
  {
    id: 'hol-10',
    startTime: '12:30',
    endTime: '13:30',
    displayTime: '12:30–1:30 PM',
    title: 'Lunch and relaxation',
    category: 'MEAL_BREAK',
    durationMinutes: 60,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-11',
    startTime: '13:30',
    endTime: '14:30',
    displayTime: '1:30–2:30 PM',
    title: 'GATE PYQs / Revision',
    category: 'GATE_PREP',
    durationMinutes: 60,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'gate_cse',
  },
  {
    id: 'hol-12',
    startTime: '14:30',
    endTime: '15:00',
    displayTime: '2:30–3:00 PM',
    title: 'Rest',
    category: 'MEAL_BREAK',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-13',
    startTime: '15:00',
    endTime: '15:45',
    displayTime: '3:00–3:45 PM',
    title: 'Japanese',
    category: 'JAPANESE',
    durationMinutes: 45,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'japanese',
  },
  {
    id: 'hol-14',
    startTime: '15:45',
    endTime: '16:15',
    displayTime: '3:45–4:15 PM',
    title: 'English speaking',
    category: 'ENGLISH',
    durationMinutes: 30,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'english',
  },
  {
    id: 'hol-15',
    startTime: '16:15',
    endTime: '17:15',
    displayTime: '4:15–5:15 PM',
    title: 'Project development',
    category: 'DEVELOPMENT_SKILL',
    durationMinutes: 60,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'fullstack',
  },
  {
    id: 'hol-16',
    startTime: '17:15',
    endTime: '18:30',
    displayTime: '5:15–6:30 PM',
    title: 'Free time',
    category: 'FREE_TIME',
    durationMinutes: 75,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-17',
    startTime: '18:30',
    endTime: '19:30',
    displayTime: '6:30–7:30 PM',
    title: 'College academics',
    category: 'ACADEMICS',
    durationMinutes: 60,
    isFixedCommitment: false,
    isLearningSlot: false,
  },
  {
    id: 'hol-18',
    startTime: '19:30',
    endTime: '20:00',
    displayTime: '7:30–8:00 PM',
    title: 'Dinner',
    category: 'MEAL_BREAK',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-19',
    startTime: '20:00',
    endTime: '20:30',
    displayTime: '8:00–8:30 PM',
    title: 'Weekly revision',
    category: 'REVISION_PLANNING',
    durationMinutes: 30,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'placement',
  },
  {
    id: 'hol-20',
    startTime: '20:30',
    endTime: '21:30',
    displayTime: '8:30–9:30 PM',
    title: 'Personal time',
    category: 'FREE_TIME',
    durationMinutes: 60,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-21',
    startTime: '21:30',
    endTime: '22:00',
    displayTime: '9:30–10:00 PM',
    title: 'Prepare for next day',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'hol-22',
    startTime: '22:00',
    endTime: '06:00',
    displayTime: '10:00 PM–6:00 AM',
    title: 'Sleep',
    category: 'SLEEP',
    durationMinutes: 480,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
];

export const INITIAL_EXAM_MODE_ACTIVITIES: TimetableActivity[] = [
  {
    id: 'ex-01',
    startTime: '05:30',
    endTime: '05:45',
    displayTime: '5:30–5:45 AM',
    title: 'Wake up and hydration',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 15,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'ex-02',
    startTime: '05:45',
    endTime: '06:30',
    displayTime: '5:45–6:30 AM',
    title: 'Light workout and walk',
    category: 'FITNESS',
    durationMinutes: 45,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'ex-03',
    startTime: '06:30',
    endTime: '07:00',
    displayTime: '6:30–7:00 AM',
    title: 'Bath and breakfast',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'ex-04',
    startTime: '07:00',
    endTime: '09:30',
    displayTime: '7:00–9:30 AM',
    title: 'Exam Subject High-Priority Unit Deep Dive',
    category: 'EXAM_PREP',
    durationMinutes: 150,
    isFixedCommitment: false,
    isLearningSlot: true,
  },
  {
    id: 'ex-05',
    startTime: '09:30',
    endTime: '10:00',
    displayTime: '9:30–10:00 AM',
    title: 'Refreshment break',
    category: 'MEAL_BREAK',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'ex-06',
    startTime: '10:00',
    endTime: '12:30',
    displayTime: '10:00 AM–12:30 PM',
    title: 'Exam Previous Year Questions (PYQs) & Numericals',
    category: 'EXAM_PREP',
    durationMinutes: 150,
    isFixedCommitment: false,
    isLearningSlot: true,
  },
  {
    id: 'ex-07',
    startTime: '12:30',
    endTime: '14:00',
    displayTime: '12:30–2:00 PM',
    title: 'Lunch and power nap',
    category: 'MEAL_BREAK',
    durationMinutes: 90,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'ex-08',
    startTime: '14:00',
    endTime: '16:30',
    displayTime: '2:00–4:30 PM',
    title: 'Weak-Topic Revision & Formula Consolidation',
    category: 'EXAM_PREP',
    durationMinutes: 150,
    isFixedCommitment: false,
    isLearningSlot: true,
  },
  {
    id: 'ex-09',
    startTime: '16:30',
    endTime: '17:15',
    displayTime: '4:30–5:15 PM',
    title: 'Evening walk and tea break',
    category: 'FITNESS',
    durationMinutes: 45,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'ex-10',
    startTime: '17:15',
    endTime: '19:15',
    displayTime: '5:15–7:15 PM',
    title: 'Timed Mock Test & Mistake Analysis',
    category: 'EXAM_PREP',
    durationMinutes: 120,
    isFixedCommitment: false,
    isLearningSlot: true,
  },
  {
    id: 'ex-11',
    startTime: '19:15',
    endTime: '19:45',
    displayTime: '7:15–7:45 PM',
    title: 'Light DSA / Japanese Streak Maintenance',
    category: 'DSA_CODING',
    durationMinutes: 30,
    isFixedCommitment: false,
    isLearningSlot: true,
    targetGoalId: 'dsa_cp',
  },
  {
    id: 'ex-12',
    startTime: '19:45',
    endTime: '20:30',
    displayTime: '7:45–8:30 PM',
    title: 'Dinner and family time',
    category: 'MEAL_BREAK',
    durationMinutes: 45,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'ex-13',
    startTime: '20:30',
    endTime: '21:30',
    displayTime: '8:30–9:30 PM',
    title: 'Next-Day Exam Summary & Flashcard Review',
    category: 'REVISION_PLANNING',
    durationMinutes: 60,
    isFixedCommitment: false,
    isLearningSlot: true,
  },
  {
    id: 'ex-14',
    startTime: '21:30',
    endTime: '22:00',
    displayTime: '9:30–10:00 PM',
    title: 'Wind down and prepare for sleep',
    category: 'PERSONAL_ROUTINE',
    durationMinutes: 30,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
  {
    id: 'ex-15',
    startTime: '22:00',
    endTime: '05:30',
    displayTime: '10:00 PM–5:30 AM',
    title: 'Protected Exam Sleep (7.5 Hours)',
    category: 'SLEEP',
    durationMinutes: 450,
    isFixedCommitment: true,
    isLearningSlot: false,
  },
];

export function createInitialTemplates(): Record<DailyMode, TimetableTemplate> {
  return {
    WORKING_DAY: {
      mode: 'WORKING_DAY',
      name: 'Working Day',
      description: 'Structured college-day routine with 5:00 AM wake-up, 7:00 AM–5:00 PM college block, and focused evening skill blocks.',
      wakeTime: '5:00 AM',
      sleepTime: '10:00 PM',
      minSleepMinutes: 420, // 7 hours
      maxAcademicMinutes: 60, // 15m morning revision + 45m evening academics
      collegeArrivalBufferMinutes: 5,
      totalLearningMinutes: 190, // 15m + 45m + 45m + 30m + 25m + 30m
      constraints: [
        'Protect at least 7 hours of sleep (10:00 PM–5:00 AM)',
        'College and travel locked 7:00 AM–5:00 PM with exact 5-minute arrival buffer',
        'Workout + walking = 60 minutes combined (5:10–6:10 AM)',
        'Additional college academics capped at 60 minutes/day (15m morning + 45m evening)',
        'Breakfast consumed during college hours (no separate home breakfast slot)',
      ],
      activities: structuredClone(INITIAL_WORKING_DAY_ACTIVITIES),
    },
    HOLIDAY: {
      mode: 'HOLIDAY',
      name: 'Holiday',
      description: 'Deep-work non-college schedule with 6:00 AM wake-up, 8h sleep protection, extended DSA/GATE/Project blocks, and protected rest.',
      wakeTime: '6:00 AM',
      sleepTime: '10:00 PM',
      minSleepMinutes: 480, // 8 hours
      maxAcademicMinutes: 60,
      collegeArrivalBufferMinutes: 0,
      totalLearningMinutes: 465, // 90+90+60+60+45+30+60+30
      constraints: [
        'Protect 8 hours of sleep (10:00 PM–6:00 AM)',
        'Workout + walking = 60 minutes combined (6:15–7:15 AM)',
        'College academics capped at 60 minutes (6:30–7:30 PM)',
        'Separate 30-minute weekly revision slot (8:00–8:30 PM)',
        'Preserve meals, breaks, and free time without auto-filling every free slot',
      ],
      activities: structuredClone(INITIAL_HOLIDAY_ACTIVITIES),
    },
    EXAM_MODE: {
      mode: 'EXAM_MODE',
      name: 'Exam Mode',
      description: 'Dedicated examination preparation schedule prioritizing unit-wise syllabus, PYQs, weak-topic revision, and mock tests while protecting health.',
      wakeTime: '5:30 AM',
      sleepTime: '10:00 PM',
      minSleepMinutes: 450, // 7.5 hours
      maxAcademicMinutes: 660,
      collegeArrivalBufferMinutes: 0,
      totalLearningMinutes: 660,
      constraints: [
        'Protect 7.5 hours of sleep and daily exercise',
        'Prioritize exam units, PYQs, and weak-topic consolidation',
        'Maintain lightweight 30-minute streak slot without overloading',
        'Preserve previous timetable configuration for automatic post-exam restoration',
      ],
      activities: structuredClone(INITIAL_EXAM_MODE_ACTIVITIES),
    },
  };
}

/**
 * Resolves the mode for a specific date (`YYYY-MM-DD`).
 * NEVER assumes Monday–Friday are Working Days or weekends are Holidays.
 * Uses explicit assignment if present; otherwise returns `defaultMode` ('WORKING_DAY') with `isExplicit: false`.
 */
export function resolveDateMode(
  date: string,
  assignments: Record<string, DateModeAssignment>,
  defaultMode: DailyMode = 'WORKING_DAY'
): { mode: DailyMode; isExplicit: boolean; assignment?: DateModeAssignment } {
  const existing = assignments[date];
  if (existing && existing.isExplicit) {
    return { mode: existing.mode, isExplicit: true, assignment: existing };
  }
  return { mode: defaultMode, isExplicit: false };
}

/**
 * Generates a list of YYYY-MM-DD dates inclusive between startDate and endDate.
 */
export function expandDateRange(startDate: string, endDate: string): string[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }
  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && dates.length <= 366) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

/**
 * Builds the mandatory pre-save confirmation summary before applying mode changes.
 */
export function buildModeChangePreview(
  selectedDates: string[],
  newMode: DailyMode,
  assignments: Record<string, DateModeAssignment>,
  templates: Record<DailyMode, TimetableTemplate>,
  defaultMode: DailyMode = 'WORKING_DAY'
): ModeChangePreviewSummary {
  const uniqueDates = Array.from(new Set(selectedDates)).sort();
  const previousModesByDate: Record<string, DailyMode> = {};
  const modeCounts: Record<DailyMode, number> = {
    WORKING_DAY: 0,
    HOLIDAY: 0,
    EXAM_MODE: 0,
  };
  const overlappingExamDates: string[] = [];

  for (const d of uniqueDates) {
    const resolved = resolveDateMode(d, assignments, defaultMode);
    previousModesByDate[d] = resolved.mode;
    modeCounts[resolved.mode] += 1;
    if (resolved.mode === 'EXAM_MODE' && newMode !== 'EXAM_MODE') {
      overlappingExamDates.push(d);
    }
  }

  let dominantPreviousMode: DailyMode = defaultMode;
  let maxCount = -1;
  (Object.keys(modeCounts) as DailyMode[]).forEach((m) => {
    if (modeCounts[m] > maxCount) {
      maxCount = modeCounts[m];
      dominantPreviousMode = m;
    }
  });

  return {
    selectedDates: uniqueDates,
    previousModesByDate,
    dominantPreviousMode,
    newMode,
    affectedCount: uniqueDates.length,
    overlappingExamDates,
    resultingTemplate: templates[newMode],
  };
}

/**
 * Applies confirmed mode changes ONLY to the selected dates.
 * Never mutates the original timetable templates or unselected dates.
 */
export function applyConfirmedModeChange(
  selectedDates: string[],
  newMode: DailyMode,
  currentAssignments: Record<string, DateModeAssignment>,
  defaultMode: DailyMode = 'WORKING_DAY',
  options?: { isImportedHoliday?: boolean; holidayLabel?: string; examId?: string }
): Record<string, DateModeAssignment> {
  const next = { ...currentAssignments };
  const now = new Date().toISOString();

  for (const date of selectedDates) {
    const prev = resolveDateMode(date, currentAssignments, defaultMode).mode;
    next[date] = {
      date,
      mode: newMode,
      previousMode: prev,
      isExplicit: true,
      isImportedHoliday: options?.isImportedHoliday ?? false,
      holidayLabel: options?.holidayLabel,
      examId: options?.examId,
      updatedAt: now,
    };
  }
  return next;
}

/**
 * Removes an explicit date assignment so the date reverts to the default mode (Working Day).
 */
export function removeDateModeAssignment(
  datesToRemove: string[],
  currentAssignments: Record<string, DateModeAssignment>
): Record<string, DateModeAssignment> {
  const next = { ...currentAssignments };
  for (const d of datesToRemove) {
    delete next[d];
  }
  return next;
}

/**
 * Validates Working Day and Holiday constraints when a user edits a template.
 */
export function validateScheduleConstraints(
  template: TimetableTemplate
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const sleepMinutes = template.activities
    .filter((a) => a.category === 'SLEEP')
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  if (template.mode === 'WORKING_DAY' && sleepMinutes < 420) {
    errors.push(`Working Day requires at least 420 minutes (7 hours) of sleep. Found ${sleepMinutes} minutes.`);
  }
  if (template.mode === 'HOLIDAY' && sleepMinutes < 480) {
    errors.push(`Holiday mode requires at least 480 minutes (8 hours) of sleep. Found ${sleepMinutes} minutes.`);
  }

  const fitnessMinutes = template.activities
    .filter((a) => a.category === 'FITNESS')
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  if ((template.mode === 'WORKING_DAY' || template.mode === 'HOLIDAY') && fitnessMinutes < 60) {
    errors.push(`Workout and walking must total at least 60 minutes combined. Found ${fitnessMinutes} minutes.`);
  }

  if (template.mode === 'WORKING_DAY') {
    const eveningAcademics = template.activities
      .filter((a) => a.category === 'ACADEMICS')
      .reduce((sum, a) => sum + a.durationMinutes, 0);
    const morningRevision = template.activities
      .filter((a) => a.id === 'wd-06')
      .reduce((sum, a) => sum + a.durationMinutes, 0);

    if (eveningAcademics + morningRevision > 60) {
      errors.push(
        `Working Day additional college academics + morning revision cannot exceed 60 minutes/day (found ${eveningAcademics + morningRevision}m).`
      );
    }

    const bufferSlot = template.activities.find((a) => a.id === 'wd-07');
    if (!bufferSlot || bufferSlot.durationMinutes !== 5) {
      errors.push('Working Day must preserve the exact 5-minute College arrival buffer (6:55–7:00 AM).');
    }
  }

  if (template.mode === 'HOLIDAY') {
    const academics = template.activities
      .filter((a) => a.category === 'ACADEMICS')
      .reduce((sum, a) => sum + a.durationMinutes, 0);
    if (academics > 60) {
      errors.push(`Holiday college academics limit is 60 minutes (found ${academics}m).`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parses CSV or newline-delimited Holiday files without automatically mutating calendar state.
 * Identifies valid dates, duplicates, invalid date entries, and exam conflicts.
 */
export function parseHolidayImportContent(
  rawContent: string,
  existingAssignments: Record<string, DateModeAssignment>
): HolidayImportParseResult {
  const lines = rawContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const candidates: HolidayImportCandidate[] = [];
  const seenDates = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    // Skip header row if present
    if (i === 0 && /^date\b/i.test(rawLine)) {
      continue;
    }

    const parts = rawLine.split(/[,\t;]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
    const rawDate = parts[0] || '';
    const label = parts[1] || 'Imported Holiday';

    // Validate YYYY-MM-DD
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDate);
    if (!match) {
      candidates.push({
        rawLine,
        date: rawDate,
        label,
        status: 'INVALID_FORMAT',
      });
      continue;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    const isValidCalendarDate =
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day;

    if (!isValidCalendarDate) {
      candidates.push({
        rawLine,
        date: rawDate,
        label,
        status: 'INVALID_FORMAT',
      });
      continue;
    }

    const existing = existingAssignments[rawDate];
    if (seenDates.has(rawDate) || (existing && existing.isExplicit && existing.mode === 'HOLIDAY')) {
      candidates.push({
        rawLine,
        date: rawDate,
        label,
        status: 'DUPLICATE',
        existingMode: existing?.mode || 'HOLIDAY',
      });
      seenDates.add(rawDate);
      continue;
    }

    seenDates.add(rawDate);

    if (existing && existing.isExplicit && existing.mode === 'EXAM_MODE') {
      candidates.push({
        rawLine,
        date: rawDate,
        label,
        status: 'CONFLICT_EXAM',
        existingMode: 'EXAM_MODE',
      });
      continue;
    }

    candidates.push({
      rawLine,
      date: rawDate,
      label,
      status: 'VALID_NEW',
      existingMode: existing?.mode,
    });
  }

  return {
    candidates,
    validNewCount: candidates.filter((c) => c.status === 'VALID_NEW').length,
    duplicateCount: candidates.filter((c) => c.status === 'DUPLICATE').length,
    invalidCount: candidates.filter((c) => c.status === 'INVALID_FORMAT').length,
    conflictCount: candidates.filter((c) => c.status === 'CONFLICT_EXAM').length,
  };
}

/**
 * Activates Exam Mode for an exam period while snapshotting previous date assignments
 * and checking for overlapping explicit assignments.
 */
export function prepareExamModeActivation(
  exam: ExamConfiguration,
  currentAssignments: Record<string, DateModeAssignment>,
  defaultMode: DailyMode = 'WORKING_DAY'
): {
  examDates: string[];
  conflictingDates: { date: string; existingMode: DailyMode; label?: string }[];
  previousSnapshot: Record<string, DailyMode>;
} {
  const examDates = expandDateRange(exam.startDate, exam.endDate);
  const conflictingDates: { date: string; existingMode: DailyMode; label?: string }[] = [];
  const previousSnapshot: Record<string, DailyMode> = {};

  for (const d of examDates) {
    const resolved = resolveDateMode(d, currentAssignments, defaultMode);
    previousSnapshot[d] = resolved.mode;
    if (resolved.isExplicit && resolved.mode !== 'EXAM_MODE') {
      conflictingDates.push({
        date: d,
        existingMode: resolved.mode,
        label: resolved.assignment?.holidayLabel,
      });
    }
  }

  return { examDates, conflictingDates, previousSnapshot };
}

/**
 * Restores the exact previous timetable and date assignments after Exam Mode ends.
 */
export function restorePostExamConfiguration(
  exam: ExamConfiguration,
  currentAssignments: Record<string, DateModeAssignment>
): Record<string, DateModeAssignment> {
  const next = { ...currentAssignments };
  const examDates = expandDateRange(exam.startDate, exam.endDate);
  const now = new Date().toISOString();

  for (const d of examDates) {
    const previousMode = exam.previousDateAssignmentsSnapshot[d] || 'WORKING_DAY';
    if (previousMode === 'WORKING_DAY') {
      delete next[d];
    } else {
      next[d] = {
        date: d,
        mode: previousMode,
        previousMode: 'EXAM_MODE',
        isExplicit: true,
        updatedAt: now,
      };
    }
  }
  return next;
}

/**
 * LAYER 1 -> LAYER 2 INTERFACE:
 * Publishes available learning time slots and health/academic constraints for a given date.
 */
export function publishDailyAvailability(
  date: string,
  assignments: Record<string, DateModeAssignment>,
  templates: Record<DailyMode, TimetableTemplate>,
  exams: ExamConfiguration[],
  defaultMode: DailyMode = 'WORKING_DAY'
): Layer1PublishedAvailability {
  const resolved = resolveDateMode(date, assignments, defaultMode);
  const template = templates[resolved.mode];
  const activeExam = exams.find(
    (e) => e.status === 'ACTIVE' && date >= e.startDate && date <= e.endDate
  );

  const slots: AvailableLearningSlotContract[] = template.activities
    .filter((act) => act.isLearningSlot || (act.category === 'COLLEGE_COMMITMENT' && act.allowIndependentLearningInCollege))
    .map((act) => ({
      slotId: act.id,
      date,
      mode: resolved.mode,
      startTime: act.startTime,
      endTime: act.endTime,
      displayTime: act.displayTime,
      durationMinutes: act.durationMinutes,
      designatedCategory: act.category,
      suggestedGoalId: act.targetGoalId,
    }));

  const totalAvailableLearningMinutes = slots.reduce((sum, s) => sum + s.durationMinutes, 0);
  const sleepProtectedMinutes = template.activities
    .filter((a) => a.category === 'SLEEP')
    .reduce((sum, a) => sum + a.durationMinutes, 0);
  const academicAllocatedMinutes = template.activities
    .filter((a) => a.category === 'ACADEMICS')
    .reduce((sum, a) => sum + a.durationMinutes, 0);

  return {
    date,
    assignedMode: resolved.mode,
    isDefaultMode: !resolved.isExplicit,
    activeExam,
    totalAvailableLearningMinutes,
    sleepProtectedMinutes,
    academicAllocatedMinutes,
    slots,
  };
}
