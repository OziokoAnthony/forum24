import { useState } from 'react'
import { Check, Save, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'

const roles = [
  { name: 'Super Admin', scope: 'Full access to the entire platform', users: 1 },
  { name: 'Administrator', scope: 'Content, users, categories and settings', users: 3 },
  { name: 'Editor', scope: 'Review, edit, approve and publish articles', users: 6 },
  { name: 'Author', scope: 'Create and manage own articles', users: 14 },
  { name: 'Contributor', scope: 'Submit articles for editorial review', users: 22 },
  { name: 'Reader', scope: 'Browse content and subscribe to newsletters', users: 18402 },
]

const audit = [
  { action: 'article.approved', actor: 'Adaeze Okonkwo', target: 'Nigeria’s AI startups…', time: '11 Nov, 09:42' },
  { action: 'ai.task.retried', actor: 'System', target: 'Task #4821', time: '11 Nov, 09:20' },
  { action: 'resource.uploaded', actor: 'Ngozi Eze', target: 'Study Skills Handbook', time: '10 Nov, 16:48' },
  { action: 'user.role.changed', actor: 'Super Admin', target: 'i.musa → Author', time: '10 Nov, 14:02' },
  { action: 'settings.updated', actor: 'Super Admin', target: 'Advertising placements', time: '9 Nov, 11:15' },
]

export function AdminSettings() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-5">
      <div>
        <h2 className="text-xl font-extrabold">Settings</h2>
        <p className="text-sm text-ink-muted">Site configuration, roles and the audit log.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-card border border-line bg-panel p-5 shadow-card">
          <h3 className="text-base font-extrabold">Site details</h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="site-name" className="block text-[12px] font-bold text-ink">Site name</label>
              <input id="site-name" defaultValue="FORUM24" className="mt-1 w-full rounded-control border border-line px-2.5 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="site-email" className="block text-[12px] font-bold text-ink">Contact email</label>
              <input id="site-email" type="email" defaultValue="hello@forum24.example" className="mt-1 w-full rounded-control border border-line px-2.5 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="site-tagline" className="block text-[12px] font-bold text-ink">Tagline</label>
              <input id="site-tagline" defaultValue="Nigeria’s pulse. Africa’s stories." className="mt-1 w-full rounded-control border border-line px-2.5 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="site-language" className="block text-[12px] font-bold text-ink">Default language</label>
              <select id="site-language" className="mt-1 w-full rounded-control border border-line px-2.5 py-2 text-sm">
                <option>English (Nigeria)</option>
                <option>English (UK)</option>
              </select>
            </div>
            <div>
              <label htmlFor="site-timezone" className="block text-[12px] font-bold text-ink">Timezone</label>
              <select id="site-timezone" className="mt-1 w-full rounded-control border border-line px-2.5 py-2 text-sm">
                <option>Africa/Lagos (WAT)</option>
                <option>UTC</option>
              </select>
            </div>
          </div>

          <h3 className="mt-6 text-base font-extrabold">Editorial controls</h3>
          <div className="mt-2 grid gap-2">
            {[
              ['Require approval before publishing', true],
              ['Enable reader comments', true],
              ['Moderate comments before display', true],
              ['Enable newsletter signup', true],
              ['Show advertising on document pages', true],
            ].map(([label, checked]) => (
              <label
                key={String(label)}
                className="flex cursor-pointer items-center justify-between rounded-control border border-line bg-cloud px-3 py-2 text-sm font-semibold"
              >
                {label}
                <input type="checkbox" defaultChecked={Boolean(checked)} className="h-4 w-4 accent-sky-600" />
              </label>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              onClick={() => {
                setSaved(true)
                window.setTimeout(() => setSaved(false), 2500)
              }}
            >
              {saved ? <Check size={15} aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
              {saved ? 'Saved' : 'Save changes'}
            </Button>
            <span className="text-[12px] text-ink-muted">Changes are audit-logged.</span>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <div className="rounded-card border border-line bg-panel p-4 shadow-card">
            <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">
              <ShieldCheck size={15} aria-hidden="true" className="text-sky-600" />
              Security
            </h3>
            <ul className="mt-2 grid gap-1.5 text-[13px] text-ink-soft">
              <li>Passwords hashed with Argon2</li>
              <li>Role-based access control</li>
              <li>Rate limiting on auth routes</li>
              <li>HTTPS enforced, secure cookies</li>
              <li>Uploads validated and scanned</li>
            </ul>
          </div>

          <div className="rounded-card border border-line bg-panel p-4 shadow-card">
            <h3 className="text-sm font-extrabold tracking-[0.04em] text-ink-muted uppercase">Backups</h3>
            <p className="mt-2 text-[13px] text-ink-soft">
              Nightly PostgreSQL backup, 14-day retention, monthly restore test.
            </p>
            <p className="mt-1 text-[12px] font-semibold text-green-700">Last backup: today, 02:00 WAT</p>
          </div>
        </aside>
      </div>

      <section className="rounded-card border border-line bg-panel p-5 shadow-card">
        <h3 className="text-base font-extrabold">Roles &amp; permissions</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                <th className="px-3 py-2 font-bold">Role</th>
                <th className="px-3 py-2 font-bold">Scope</th>
                <th className="px-3 py-2 text-right font-bold">Users</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.name} className="border-t border-line hover:bg-sky-50">
                  <td className="px-3 py-2.5 font-semibold text-ink">{role.name}</td>
                  <td className="px-3 py-2.5 text-ink-soft">{role.scope}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-ink-soft">{role.users.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-card border border-line bg-panel p-5 shadow-card">
        <h3 className="text-base font-extrabold">Audit log</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-cloud text-left text-[11px] tracking-[0.05em] text-ink-muted uppercase">
                <th className="px-3 py-2 font-bold">Action</th>
                <th className="px-3 py-2 font-bold">Actor</th>
                <th className="px-3 py-2 font-bold">Target</th>
                <th className="px-3 py-2 font-bold">Time</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((entry) => (
                <tr key={`${entry.action}-${entry.time}`} className="border-t border-line">
                  <td className="px-3 py-2.5 font-mono text-[12px] text-sky-700">{entry.action}</td>
                  <td className="px-3 py-2.5 text-ink-soft">{entry.actor}</td>
                  <td className="px-3 py-2.5 text-ink-soft">{entry.target}</td>
                  <td className="px-3 py-2.5 text-[13px] text-ink-muted">{entry.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
