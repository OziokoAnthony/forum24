import type { ArticleStatus } from '../../data/content'

const styles: Record<ArticleStatus, string> = {
  Draft: 'bg-slate-100 text-slate-600',
  'Pending Review': 'bg-amber-100 text-amber-900',
  Approved: 'bg-sky-100 text-sky-800',
  Scheduled: 'bg-sun-100 text-sun-800',
  Published: 'bg-emerald-100 text-emerald-800',
  Archived: 'bg-slate-100 text-slate-500',
}

export function StatusPill({ status }: { status: ArticleStatus }) {
  return (
    <span
      className={`pill-3d inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

type TaskState = 'Queued' | 'Running' | 'Succeeded' | 'Failed'

const taskStyles: Record<TaskState, string> = {
  Queued: 'bg-slate-100 text-slate-600',
  Running: 'bg-sky-100 text-sky-800',
  Succeeded: 'bg-emerald-100 text-emerald-800',
  Failed: 'bg-red-100 text-red-800',
}

export function TaskPill({ state }: { state: TaskState }) {
  return (
    <span
      className={`pill-3d inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${taskStyles[state]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {state}
    </span>
  )
}
