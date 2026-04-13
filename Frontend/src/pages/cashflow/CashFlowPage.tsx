import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCashFlow } from '../../features/reports'

const currencyShort = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(0)}tr` : value.toLocaleString('vi-VN')
const currencyFull = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

export default function CashFlowPage() {
  const { data, loading, error, reload } = useCashFlow(12)
  const totalIncome = data.reduce((sum, row) => sum + row.income, 0)
  const totalExpense = data.reduce((sum, row) => sum + row.expenses, 0)

  return <div className="feature-page">
    <div className="page-title-row">
      <div><h1>Dòng tiền</h1><p>Giá trị nhập kho (chi) và xuất kho (thu) tính theo từng tháng.</p></div>
      <div className="page-title-actions"><button className="button button-secondary" onClick={() => reload()} disabled={loading}>Làm mới</button></div>
    </div>
    {error && <div className="form-error" role="alert">{error}</div>}
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-head"><h3>Tổng chi nhập (12 tháng)</h3></div><p className="stat-value">{totalExpense.toLocaleString('vi-VN')} ₫</p><p className="stat-note">Qua {data.length} tháng có giao dịch</p></div>
      <div className="stat-card"><div className="stat-head"><h3>Tổng giá trị xuất</h3></div><p className="stat-value">{totalIncome.toLocaleString('vi-VN')} ₫</p><p className="stat-note">Hàng đã xuất khỏi kho</p></div>
      <div className="stat-card"><div className="stat-head"><h3>Chênh lệch</h3></div><p className="stat-value">{(totalIncome - totalExpense).toLocaleString('vi-VN')} ₫</p><p className="stat-note">Giá trị xuất − giá trị nhập</p></div>
    </div>
    <section className="panel chart-panel cashflow-panel">
      <div className="panel-heading chart-heading"><div><h2>Dòng tiền theo tháng</h2><p className="panel-description">Nguồn số liệu: giao dịch nhập/xuất kho thật.</p></div></div>
      {loading && data.length === 0 ? <p className="panel-description">Đang tải...</p> : data.length === 0
        ? <div className="table-empty"><strong>Chưa có giao dịch nào</strong><p>Nhập hoặc xuất kho để thấy dòng tiền xuất hiện.</p></div>
        : <div className="chart-large"><ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 4, left: -8, bottom: 0 }} barGap={4}>
            <CartesianGrid vertical={false} stroke="#e8eaf0" strokeDasharray="3 4" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a8f9e', fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a4b0', fontSize: 10 }} tickFormatter={(v) => currencyShort(Number(v))} />
            <Tooltip cursor={{ fill: '#f8f8fc' }} formatter={(value, name) => [currencyFull(Number(value)), name === 'expenses' ? 'Chi nhập' : 'Giá trị xuất']} contentStyle={{ borderRadius: 12, border: '1px solid #e9eaf0', boxShadow: '0 8px 24px #19213a12', fontSize: 12 }} />
            <Bar dataKey="expenses" name="expenses" fill="#b9bed4" radius={[3, 3, 0, 0]} maxBarSize={30} />
            <Bar dataKey="income" name="income" fill="#6d78c9" radius={[3, 3, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer></div>}
    </section>
  </div>
}
