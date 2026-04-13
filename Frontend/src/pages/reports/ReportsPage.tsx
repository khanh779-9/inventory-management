import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownLeft, ArrowUpRight, Boxes } from 'lucide-react'
import type { ReactNode } from 'react'
import { useReportSummary } from '../../features/reports'

const currencyShort = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(0)}tr` : value.toLocaleString('vi-VN')
const currencyFull = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

export default function ReportsPage() {
  const { data, loading, error, reload } = useReportSummary()

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Báo cáo kho</h1><p>Giá trị tồn kho theo kho và hoạt động nhập xuất 30 ngày gần nhất.</p></div>
      <div className="page-title-actions"><button className="button button-secondary" onClick={() => reload()} disabled={loading}>Làm mới</button></div>
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    {loading && !data ? <p className="panel-description">Đang tính số liệu...</p> : data && <>
      <div className="stats-grid">
        <StatBox title="Nhập kho 30 ngày" value={data.receiveCount30d} note={currencyFull(data.receiveValue30d)} tone="receive" icon={<ArrowDownLeft size={17} />} />
        <StatBox title="Xuất kho 30 ngày" value={data.issueCount30d} note={currencyFull(data.issueValue30d)} tone="issue" icon={<ArrowUpRight size={17} />} />
        <StatBox title="Giá trị tồn kho" value={currencyShort(data.stockValueByWarehouse.reduce((s, w) => s + w.stockValue, 0))} note="Tổng các kho" icon={<Boxes size={17} />} />
      </div>
      <div className="reports-grid">
        <section className="panel chart-panel">
          <div className="panel-heading chart-heading"><div><h2>Giá trị tồn kho theo kho</h2><p className="panel-description">Nhân số lượng đang giữ với đơn giá sản phẩm.</p></div></div>
          <div className="chart-large"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.stockValueByWarehouse.map((w) => ({ name: w.warehouse, value: w.stockValue }))} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e8eaf0" strokeDasharray="3 4" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a8f9e', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a4b0', fontSize: 10 }} tickFormatter={(v) => currencyShort(Number(v))} />
              <Tooltip cursor={{ fill: '#f8f8fc' }} formatter={(value) => currencyFull(Number(value))} contentStyle={{ borderRadius: 12, border: '1px solid #e9eaf0', boxShadow: '0 8px 24px #19213a12', fontSize: 12 }} />
              <Bar dataKey="value" fill="#6d78c9" radius={[4, 4, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer></div>
        </section>
        <section className="panel chart-panel">
          <div className="panel-heading chart-heading"><div><h2>Sản phẩm sôi động nhất</h2><p className="panel-description">Theo giá trị nhập/xuất 30 ngày.</p></div></div>
          <div className="chart-large"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProducts.map((p) => ({ name: p.sku, receive: p.receiveValue, issue: p.issueValue }))} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e8eaf0" strokeDasharray="3 4" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a8f9e', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a4b0', fontSize: 10 }} tickFormatter={(v) => currencyShort(Number(v))} />
              <Tooltip cursor={{ fill: '#f8f8fc' }} formatter={(value, name) => [currencyFull(Number(value)), name === 'receive' ? 'Nhập' : 'Xuất']} contentStyle={{ borderRadius: 12, border: '1px solid #e9eaf0', boxShadow: '0 8px 24px #19213a12', fontSize: 12 }} />
              <Bar dataKey="receive" name="receive" stackId="t" fill="#5d6dae" radius={[0, 0, 4, 4]} maxBarSize={30} />
              <Bar dataKey="issue" name="issue" stackId="t" fill="#9fb8f5" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer></div>
        </section>
      </div>
    </>}
  </div>
}

function StatBox({ title, value, note, icon, tone }: { title: string; value: string | number; note?: string; icon?: ReactNode; tone?: 'receive' | 'issue' }) {
  return <div className="stat-card">
    <div className="stat-head"><h3>{title}</h3>{icon && <span className={`stat-icon ${tone ? `stat-icon--${tone}` : ''}`}>{icon}</span>}</div>
    <p className="stat-value">{value}</p>
    {note && <p className="stat-note">{note}</p>}
  </div>
}
