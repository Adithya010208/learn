import type { GoalId, RoadmapTopic, ScheduledLearningRecommendation } from '../types/domain.ts';

export type StudyToolsState = {
  examDate?: string;
  busyWeek?: { start: string; end: string; minutes: number };
  shortDays?: Record<string, boolean>;
  mistakes?: { id: string; topicId: string; title: string; note: string; date: string }[];
  practice?: Record<string, string>;
};

export const javaStarterResource = 'https://dev.java/learn/getting-started/';
const javaResources: Record<string, string> = {
  'zero-dsa-first-program': javaStarterResource,
  'zero-dsa-values': 'https://dev.java/learn/language-basics/variables/',
  'zero-dsa-conditions': 'https://dev.java/learn/language-basics/controlling-flow/',
  'zero-dsa-loops': 'https://dev.java/learn/language-basics/controlling-flow/',
  'zero-dsa-functions': 'https://dev.java/learn/classes-objects/defining-methods/',
  'zero-dsa-arrays': 'https://dev.java/learn/language-basics/arrays/',
};

export function studyResource(goal: GoalId, topicId: string, authority?: string) {
  if (goal === 'dsa_cp') {
    return { title: 'Java learning resource', url: javaResources[topicId] ?? 'https://dev.java/learn/api/collections-framework/' };
  }
  if (goal === 'gate_cse') return { title: 'Official previous papers', url: 'https://gate2026.iitg.ac.in/download.html' };
  if (goal === 'japanese') return { title: 'Beginner Japanese practice', url: 'https://www.irodori.jpf.go.jp/en/starter/pdf.html' };
  return authority ? { title: 'Study reference', url: authority } : undefined;
}

export function studyLimit(date: string, tools: StudyToolsState): number {
  if (tools.shortDays?.[date]) return 15;
  const week = tools.busyWeek;
  return week && date >= week.start && date <= week.end && Number.isFinite(week.minutes)
    ? Math.max(15, Math.min(240, Math.trunc(week.minutes)))
    : Infinity;
}

export function weekSummary(history: Record<string, ScheduledLearningRecommendation[]>, end: string) {
  const start = new Date(end + 'T12:00:00Z');
  start.setUTCDate(start.getUTCDate() - 6);
  const first = start.toISOString().slice(0, 10);
  const entries = Object.entries(history).filter(([day]) => day >= first && day <= end).flatMap(([, sessions]) => sessions);
  const completed = entries.filter((item) => item.status === 'COMPLETED');
  const closed = new Set(completed.map((item) => item.topicId));
  const unfinished = entries.filter((item) => ['PARTIAL', 'MISSED'].includes(item.status) && !closed.has(item.topicId));
  const counts = new Map<string, number>();
  for (const item of unfinished) counts.set(item.topicTitle, (counts.get(item.topicTitle) ?? 0) + 1);
  const focus = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
  return { completed: completed.length, minutes: completed.reduce((sum, item) => sum + item.durationMinutes, 0), remaining: counts.size, focus };
}

export function applySharedCredit(completed: Set<string>, topics: RoadmapTopic[]) {
  const pair = ['pl-sql-practice', 'fs-sql-practice'];
  if (!pair.some((id) => completed.has(id))) return;
  for (const id of pair) {
    const topic = topics.find((entry) => entry.id === id);
    if (topic?.prerequisites.every((prerequisite) => completed.has(prerequisite))) completed.add(id);
  }
}
