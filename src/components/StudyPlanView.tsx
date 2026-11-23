import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, ListChecks, Plus, SlidersHorizontal, X } from 'lucide-react';
import { isValidUnavailableTime } from '../layers/layer1Schedule.ts';
import type {
  DailyMode, Layer1PublishedAvailability, ScheduledLearningRecommendation, UnavailableTime,
} from '../types/domain.ts';

const modes: Record<DailyMode, string> = {
  WORKING_DAY: 'Working day',
  HOLIDAY: 'Leave day',
  EXAM_MODE: 'Exam mode',
};

type Props = {
  availability: Layer1PublishedAvailability;
  blocks: UnavailableTime[];
  sessions: ScheduledLearningRecommendation[];
  onDate: (date: string) => void;
  onMode: (mode: DailyMode) => void;
  onBlocks: (blocks: UnavailableTime[]) => void;
  onOutcome: (session: ScheduledLearningRecommendation, status: 'COMPLETED' | 'PARTIAL' | 'MISSED') => void;
  reminderLeadMinutes?: number;
  toolsPanel?: ReactNode;
  sessionTools?: (session: ScheduledLearningRecommendation) => ReactNode;
  previewBlocks?: (blocks: UnavailableTime[]) => string;
};

export function StudyPlanView({
  availability, blocks, sessions, onDate, onMode, onBlocks, onOutcome, reminderLeadMinutes, toolsPanel, sessionTools, previewBlocks,
}: Props) {
  const { date, assignedMode, slots } = availability;
  const [preview, setPreview] = useState<{ blocks: UnavailableTime[]; message: string } | null>(null);
  const blockForm = useRef<HTMLFormElement>(null);
  const [blockError, setBlockError] = useState('');
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const sessionStarts = new Map(slots.map((slot) => [slot.slotId, slot.startTime]));
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dueSession = date === now.toLocaleDateString('sv-SE') && reminderLeadMinutes !== undefined
    ? sessions.find((session) => {
        const start = sessionStarts.get(session.slotId);
        if (!start || session.status !== 'SCHEDULED') return false;
        const [hour, minute] = start.split(':').map(Number);
        const minutesLeft = hour * 60 + minute - currentMinutes;
        return minutesLeft >= 0 && minutesLeft <= reminderLeadMinutes;
      })
    : undefined;
  const canConfirm = date <= now.toLocaleDateString('sv-SE');
  const today = now.toLocaleDateString('sv-SE');
  const pending = sessions.filter((session) => session.status === 'SCHEDULED');
  const completed = sessions.filter((session) => session.status === 'COMPLETED').length;
  const deferred = sessions.length - completed - pending.length;
  const plannedMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
  const featured = dueSession || pending.find((session) => {
    const slot = slots.find((item) => item.slotId === session.slotId);
    if (date !== today || !slot) return true;
    const [hour, minute] = slot.endTime.split(':').map(Number);
    return hour * 60 + minute > currentMinutes;
  });
  const headingDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
  const changeDate = (amount: number) => {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + amount);
    onDate(next.toLocaleDateString('sv-SE'));
  };
  const outcomes = [
    { status: 'COMPLETED', label: 'Done' },
    { status: 'PARTIAL', label: 'Partial' },
    { status: 'MISSED', label: 'Missed' },
  ] as const;

  return (
    <div className="study-page">
      <header className="study-heading">
        <div>
          <h1>Study plan</h1>
          <p><CalendarDays size={16} aria-hidden="true" />{headingDate}</p>
        </div>
        <div className="study-date-controls">
          <button type="button" className="study-button" onClick={() => onDate(today)} disabled={date === today}>Today</button>
          <div className="study-date-picker">
            <button type="button" className="workspace-icon-button" aria-label="Previous day" onClick={() => changeDate(-1)}><ChevronLeft size={18} /></button>
            <input type="date" aria-label="Plan date" value={date} onChange={(event) => {
              const next = event.target.value;
              if (/^\d{4}-\d{2}-\d{2}$/.test(next)) onDate(next);
            }} />
            <button type="button" className="workspace-icon-button" aria-label="Next day" onClick={() => changeDate(1)}><ChevronRight size={18} /></button>
          </div>
          <a href="#study-day-settings" className="study-button study-settings-link"><SlidersHorizontal size={15} />Day settings</a>
        </div>
      </header>

      <div className="study-summary">
        <section className="study-focus">
          <div className="study-focus-art" aria-hidden="true"><span /><span /><span /></div>
          <div className="study-focus-content">
            <p className="study-focus-label"><span />{dueSession ? 'Starting soon' : 'Up next'}</p>
            <h2>{featured?.topicTitle ?? 'You’re clear for this day'}</h2>
            {featured && <p className="study-focus-time"><Clock3 size={16} />{featured.displayTime} <span>·</span> {featured.durationMinutes} min</p>}
            {featured && <a href="#study-sessions" className="study-focus-link">View schedule <ArrowDownRight size={16} /></a>}
          </div>
        </section>
        <section className="study-card study-progress">
          <header><ListChecks size={18} /><h2>Daily progress</h2></header>
          <p className="study-progress-count"><strong>{completed}</strong><span> / {sessions.length} done</span></p>
          <progress value={completed} max={Math.max(1, sessions.length)} aria-label="Completed study sessions" />
          <div className="study-progress-footer">
            <span>{pending.length} to do</span>
            <span>{deferred} to carry over</span>
          </div>
        </section>
      </div>

      <div className="study-layout">
        <section className="study-card study-agenda" id="study-sessions">
          <header className="study-section-heading">
            <div><h2>Schedule</h2><p>{sessions.length} sessions · {plannedMinutes} minutes</p></div>
            {canConfirm && <span className="study-checkin-label">Daily check-in</span>}
          </header>
          {!sessions.length && <p className="study-empty">There are no study sessions scheduled for this date.</p>}
          <ul className="study-session-list">
            {sessions.map((session) => (
              <li className="study-session" key={session.sessionId}>
                <div className="study-session-time"><strong>{session.displayTime}</strong><span>{session.durationMinutes} min</span></div>
                <div className="study-session-details">
                  <h3>{session.topicTitle}</h3>
                  <p>{session.autonomousReason}</p>
                  {sessionTools?.(session)}
                  {canConfirm && <div className="study-outcomes" aria-label={`Check in for ${session.topicTitle}`}>
                    {outcomes.map(({ status, label }) => (
                      <button type="button" key={status} aria-pressed={session.status === status} onClick={() => onOutcome(session, status)}>
                        {session.status === status && <Check size={13} aria-hidden="true" />}{label}
                      </button>
                    ))}
                  </div>}
                </div>
              </li>
            ))}
          </ul>
        </section>
        <aside className="study-tools" id="study-day-settings">
          <section className="study-card study-settings">
            <h2>Day settings</h2>
            <label className="study-field">Timetable
              <select value={assignedMode} onChange={(event) => onMode(event.target.value as DailyMode)}>
                {Object.entries(modes).map(([mode, label]) => <option key={mode} value={mode}>{label}</option>)}
              </select>
            </label>
          </section>
          <section className="study-card study-settings">
            <h2>Unavailable hours</h2>
            <p>Study sessions adjust around these blocks.</p>
            <form ref={blockForm} className="study-block-form" onInput={() => {
              setBlockError('');
              setPreview(null);
            }} onSubmit={(event) => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              const block = { startTime: String(values.get('blockStart') ?? ''), endTime: String(values.get('blockEnd') ?? '') };
              if (!isValidUnavailableTime(block)) {
                setBlockError('Choose an end time after the start time.');
                return;
              }
              if (blocks.some((item) => item.startTime === block.startTime && item.endTime === block.endTime)) {
                setBlockError('Those hours are already blocked.');
                return;
              }
              const next = [...blocks, block].sort((a, b) => a.startTime.localeCompare(b.startTime));
              setBlockError('');
              setPreview({ blocks: next, message: previewBlocks?.(next) ?? 'Review the change before adding the block.' });
            }}>
              <div>
                <label className="study-field">From<input type="time" name="blockStart" required /></label>
                <label className="study-field">To<input type="time" name="blockEnd" required /></label>
              </div>
              {blockError && <p role="status">{blockError}</p>}
              <button type="submit" className="study-button study-button-primary"><Plus size={16} />Preview time block</button>
            </form>
            {preview && <div className="mt-3 grid gap-2">
              <p role="status" className="text-sm">{preview.message}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="study-button study-button-primary" onClick={() => {
                  onBlocks(preview.blocks);
                  setPreview(null);
                  blockForm.current?.reset();
                }}>Apply time block</button>
                <button type="button" className="study-button" onClick={() => setPreview(null)}>Cancel</button>
              </div>
            </div>}
            {!!blocks.length && <ul className="study-block-list">
              {blocks.map((item, index) => (
                <li key={`${item.startTime}-${item.endTime}`}>
                  <span><Clock3 size={15} />{item.startTime}–{item.endTime}</span>
                  <button className="workspace-icon-button" aria-label={`Remove block ${item.startTime} to ${item.endTime}`} type="button" onClick={() => onBlocks(blocks.filter((_, i) => index !== i))}><X size={16} /></button>
                </li>
              ))}
            </ul>}
          </section>
          {toolsPanel}
        </aside>
      </div>
    </div>
  );
}
