import type { ReactNode } from 'react'

interface StatCardProps { title: string; value: string; note?: string; icon?: ReactNode }

export default function StatCard({ title, value, note, icon }: StatCardProps) {
  return (
    <section className="stat-card" aria-label={title}>
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
      </div>
      <p className="stat-title">{title}</p>
      <div className="stat-value-row"><strong className="stat-value">{value}</strong></div>
      {note && <p className="stat-note">{note}</p>}
    </section>
  )
}
