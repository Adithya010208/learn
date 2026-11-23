import type { Layer1PublishedAvailability, ScheduledLearningRecommendation } from '../types/domain.ts';

const utc = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');

export function studyCalendar(
  availability: Layer1PublishedAvailability,
  sessions: ScheduledLearningRecommendation[],
  leadMinutes: number,
) {
  const stamp = utc(new Date());
  const events: string[] = [];
  const alarm = Math.max(0, Math.min(120, Math.trunc(leadMinutes) || 0));
  const event = (id: string, start: Date, minutes: number, title: string, description: string, reminder: number) => {
    events.push(
      'BEGIN:VEVENT', `UID:${encodeURIComponent(id)}@aetherlearn.local`, `DTSTAMP:${stamp}`,
      `DTSTART:${utc(start)}`, `DTEND:${utc(new Date(start.getTime() + minutes * 60000))}`,
      `SUMMARY:${escapeText(title)}`, `DESCRIPTION:${escapeText(description)}`,
      'BEGIN:VALARM', `TRIGGER:${reminder ? '-' : ''}PT${reminder}M`, 'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(title)}`, 'END:VALARM', 'END:VEVENT',
    );
  };
  for (const session of sessions) {
    if (session.status !== 'SCHEDULED') continue;
    const slot = availability.slots.find((item) => item.slotId === session.slotId);
    if (slot) event(session.sessionId, new Date(`${availability.date}T${slot.startTime}:00`),
      session.durationMinutes, session.topicTitle, session.autonomousReason, alarm);
  }
  if (events.length) {
    event(`check-in-${availability.date}`, new Date(`${availability.date}T21:45:00`), 5,
      'AetherLearn daily check-in', 'Open Study Plan and mark each session Done, Partial or Missed.', 0);
  }
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AetherLearn//Study Plan//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR', ''].join('\r\n');
}
