import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// ==========================================
// CORE USER & ACCOUNT ISOLATION
// ==========================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').default('ADHI'),
  graduationYear: integer('graduation_year').default(2029).notNull(),
  activeMainSkill: text('active_main_skill').default('fullstack').notNull(),
  defaultMode: text('default_mode').default('WORKING_DAY').notNull(),
  theme: text('theme').default('light').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// LAYER 1 — SCHEDULE MANAGEMENT TABLES
// ==========================================
export const timetableTemplates = pgTable('timetable_templates', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  mode: text('mode').notNull(), // WORKING_DAY | HOLIDAY | EXAM_MODE
  name: text('name').notNull(),
  wakeTime: text('wake_time').notNull(),
  sleepTime: text('sleep_time').notNull(),
  minSleepMinutes: integer('min_sleep_minutes').notNull(),
  maxAcademicMinutes: integer('max_academic_minutes').notNull(),
  activitiesJson: text('activities_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dateModeAssignments = pgTable('date_mode_assignments', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  mode: text('mode').notNull(), // WORKING_DAY | HOLIDAY | EXAM_MODE
  previousMode: text('previous_mode').default('WORKING_DAY').notNull(),
  examId: text('exam_id'),
  isImportedHoliday: boolean('is_imported_holiday').default(false).notNull(),
  label: text('label'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const exams = pgTable('exams', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  examCode: text('exam_code').notNull(),
  title: text('title').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  subjectsJson: text('subjects_json').notNull(),
  prioritiesJson: text('priorities_json').notNull(),
  previousConfigSnapshotJson: text('previous_config_snapshot_json').notNull(),
  status: text('status').default('UPCOMING').notNull(), // UPCOMING | ACTIVE | COMPLETED_RESTORED
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// LAYER 2 — LEARNING INTELLIGENCE TABLES
// ==========================================
export const learningRoadmaps = pgTable('learning_roadmaps', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  goalId: text('goal_id').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  priorityRank: integer('priority_rank').notNull(),
  isMainTechnicalTrack: boolean('is_main_technical_track').default(false).notNull(),
  isActiveTrack: boolean('is_active_track').default(true).notNull(),
  sourceType: text('source_type').notNull(), // OFFICIAL_SYLLABUS | CURATED_ROADMAP | AI_GENERATED
  syllabusVersion: text('syllabus_version').notNull(),
  authoritySource: text('authority_source').notNull(),
  lastCheckedAt: text('last_checked_at').notNull(),
  stagesJson: text('stages_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const topicMasteryRecords = pgTable('topic_mastery_records', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  topicId: text('topic_id').notNull(),
  goalId: text('goal_id').notNull(),
  status: text('status').default('NOT_STARTED').notNull(), // NOT_STARTED | IN_PROGRESS | NEEDS_REVISION | MASTERED
  understandingLevel: integer('understanding_level').default(0).notNull(), // 0-100
  retentionScore: integer('retention_score').default(0).notNull(), // 0-100
  assessmentAttempts: integer('assessment_attempts').default(0).notNull(),
  correctAnswers: integer('correct_answers').default(0).notNull(),
  incorrectAnswers: integer('incorrect_answers').default(0).notNull(),
  mistakeCategoriesJson: text('mistake_categories_json').default('[]').notNull(),
  practicalCompleted: boolean('practical_completed').default(false).notNull(),
  nextReviewDate: text('next_review_date'),
  intervalDays: integer('interval_days').default(1).notNull(),
  easeFactor: integer('ease_factor').default(250).notNull(), // 2.50 * 100
  lastStudiedAt: text('last_studied_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const learningSessions = pgTable('learning_sessions', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  sessionCode: text('session_code').notNull(),
  date: text('date').notNull(),
  slotTime: text('slot_time').notNull(),
  topicId: text('topic_id').notNull(),
  goalId: text('goal_id').notNull(),
  title: text('title').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  status: text('status').default('SCHEDULED').notNull(), // SCHEDULED | COMPLETED | MISSED | RESCHEDULED | SHORTENED
  recoveryActionJson: text('recovery_action_json'),
  notes: text('notes').default('').notNull(),
  quizScore: integer('quiz_score'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const syllabusUpdates = pgTable('syllabus_updates', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  updateCode: text('update_code').notNull(),
  goalId: text('goal_id').notNull(),
  sourceName: text('source_name').notNull(),
  sourceUrl: text('source_url').notNull(),
  version: text('version').notNull(),
  changeType: text('change_type').notNull(), // MINOR_AUTO | MAJOR_APPROVAL_REQUIRED
  status: text('status').default('PENDING_APPROVAL').notNull(), // APPLIED | PENDING_APPROVAL | APPROVED | DISMISSED
  summary: text('summary').notNull(),
  affectedTopicsJson: text('affected_topics_json').notNull(),
  detectedAt: text('detected_at').notNull(),
});

// ==========================================
// LAYER 3 — CAREER GROWTH & OUTCOMES TABLES
// ==========================================
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  projectCode: text('project_code').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(), // Beginner | Intermediate | Advanced | Portfolio-ready
  status: text('status').default('Recommended').notNull(), // Recommended | Planned | In progress | Completed | Archived
  goalId: text('goal_id').notNull(),
  detailsJson: text('details_json').notNull(),
  evidenceUrl: text('evidence_url'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const careerReadinessRecords = pgTable('career_readiness_records', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull(),
  placementEvidenceJson: text('placement_evidence_json').notNull(),
  gateProgressJson: text('gate_progress_json').notNull(),
  cpStatsJson: text('cp_stats_json').notNull(),
  japaneseProgressJson: text('japanese_progress_json').notNull(),
  englishProgressJson: text('english_progress_json').notNull(),
  portfolioJson: text('portfolio_json').notNull(),
  skillGapsJson: text('skill_gaps_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// CLOUD SYNC & VERSIONED SNAPSHOTS
// ==========================================
export const userWorkspaceSnapshots = pgTable('user_workspace_snapshots', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid)
    .notNull()
    .unique(),
  version: integer('version').default(1).notNull(),
  layer1ScheduleJson: text('layer1_schedule_json').notNull(),
  layer2LearningJson: text('layer2_learning_json').notNull(),
  layer3CareerJson: text('layer3_career_json').notNull(),
  settingsJson: text('settings_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  timetableTemplates: many(timetableTemplates),
  dateModeAssignments: many(dateModeAssignments),
  exams: many(exams),
  learningRoadmaps: many(learningRoadmaps),
  topicMasteryRecords: many(topicMasteryRecords),
  learningSessions: many(learningSessions),
  projects: many(projects),
  careerReadinessRecords: many(careerReadinessRecords),
  syllabusUpdates: many(syllabusUpdates),
}));
