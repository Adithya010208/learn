import { useState } from 'react';
import type { StudyToolsState } from '../layers/studyTools.ts';

type Props = {
  date: string;
  tools: StudyToolsState;
  update: (updater: (previous: StudyToolsState) => StudyToolsState) => void;
  summary: { completed: number; minutes: number; remaining: number; focus?: string };
  exportCalendar: () => void;
  forecast: (date: string) => string;
};

export function StudyToolsPanel({ date, tools, update, summary, exportCalendar, forecast }: Props) {
  const [target, setTarget] = useState(tools.examDate ?? '');
  const [start, setStart] = useState(tools.busyWeek?.start ?? date);
  const [end, setEnd] = useState(tools.busyWeek?.end ?? date);
  const [limit, setLimit] = useState(tools.busyWeek?.minutes ?? 45);
  const [forecastText, setForecastText] = useState('');
  return (
    <>
      <details className="study-card study-settings">
        <summary className="cursor-pointer font-bold">Time and reminders</summary>
        <div className="mt-3 grid gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(tools.shortDays?.[date])} onChange={(event) => {
              const enabled = event.target.checked;
              update((previous) => ({ ...previous, shortDays: { ...previous.shortDays, [date]: enabled } }));
            }} />
            Only 15 minutes on this date
          </label>
          <form className="grid gap-2" onSubmit={(event) => {
            event.preventDefault();
            if (!start || !end || start > end || !Number.isInteger(limit) || limit < 15 || limit > 240) return;
            update((previous) => ({ ...previous, busyWeek: { start, end, minutes: limit } }));
          }}>
            <h3 className="font-bold">Busy period</h3>
            <label className="study-field">From <input type="date" required value={start} onChange={(event) => setStart(event.target.value)} /></label>
            <label className="study-field">Through <input type="date" required min={start} value={end} onChange={(event) => setEnd(event.target.value)} /></label>
            <label className="study-field">Study minutes per day <input type="number" min={15} max={240} required value={limit} onChange={(event) => setLimit(event.target.valueAsNumber)} /></label>
            <button type="submit" className="study-button">Save study limit</button>
            {tools.busyWeek && <button type="button" className="study-button" onClick={() => update((previous) => ({ ...previous, busyWeek: undefined }))}>Remove study limit</button>}
          </form>
          <button type="button" className="study-button study-button-primary" onClick={exportCalendar}>Export calendar reminders</button>
          <p className="text-xs text-slate-500">Import the calendar file to receive session and evening check-in reminders from your calendar.</p>
        </div>
      </details>
      <details className="study-card study-settings">
        <summary className="cursor-pointer font-bold">GATE deadline forecast</summary>
        <form className="mt-3 grid gap-2" onSubmit={(event) => {
          event.preventDefault();
          if (!target || target <= date) return;
          update((previous) => ({ ...previous, examDate: target }));
          setForecastText(forecast(target));
        }}>
          <label className="study-field">Exam date <input type="date" required value={target} onChange={(event) => setTarget(event.target.value)} /></label>
          <button type="submit" className="study-button" disabled={!target || target <= date}>Estimate what fits</button>
          {forecastText && <p role="status" className="text-sm">{forecastText}</p>}
        </form>
      </details>
      <details className="study-card study-settings">
        <summary className="cursor-pointer font-bold">Weekly review</summary>
        <p>{summary.completed} sessions done · {summary.minutes} minutes logged · {summary.remaining} unfinished topics</p>
        {summary.focus && <p>Start with {summary.focus} in its next matching slot.</p>}
      </details>
      <details className="study-card study-settings">
        <summary className="cursor-pointer font-bold">Mistake log</summary>
        {!tools.mistakes?.length && <p>Add a note from a study session or checkpoint.</p>}
        <ul className="study-block-list">
          {tools.mistakes?.map((mistake) => (
            <li key={mistake.id} className="!items-start">
              <div><strong>{mistake.title}</strong><p className="break-words">{mistake.note}</p></div>
              <button type="button" className="workspace-icon-button" aria-label={`Delete note for ${mistake.title}`} onClick={() =>
                update((previous) => ({ ...previous, mistakes: previous.mistakes?.filter((item) => item.id !== mistake.id) }))}>×</button>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
