import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChevronDown, Download } from 'lucide-react'
import type { CashFlowItem } from '../../../types'

const currencyShort = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(0)}tr` : value.toLocaleString('vi-VN')
const currencyFull = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

export default function CashFlowChart({ data }: { data: CashFlowItem[] }) {
  const [period, setPeriod] = useState<'month' | 'quarter'>('month')
  const chartData = useMemo(() => {
    if (period === 'month') return data
    const quarters: CashFlowItem[] = []
    for (let i = 0; i < data.length; i += 3) {
      const group = data.slice(i, i + 3)
      if (group.length) quarters.push({ month: `3T-${Math.floor(i / 3) + 1}`, expenses: group.reduce((sum, item) => sum + item.expenses, 0), income: group.reduce((sum, item) => sum + item.income, 0) })
    }
    return quarters
  }, [data, period])

  return (
    <section className="panel chart-panel cashflow-panel">
      <div className="panel-heading chart-heading">
        <div><h2>Dòng tiền</h2><p className="panel-description">Theo dõi giá trị nhập và xuất kho</p></div>
        <div className="chart-tools">
          <div className="chart-legend"><span><i className="legend-dot legend-dot--expenses" /> Chi nhập</span><span><i className="legend-dot legend-dot--income" /> Giá trị xuất</span></div>
          <button className="select-like" aria-label="Chọn kỳ báo cáo" onClick={() => setPeriod((current) => current === 'month' ? 'quarter' : 'month')}>{period === 'month' ? 'Theo tháng' : 'Theo 3 tháng'} <ChevronDown size={13} /></button>
          <button className="icon-button chart-download" title="Tải dữ liệu CSV" aria-label="Tải dữ liệu CSV" onClick={() => downloadCsv(chartData)}><Download size={15} /></button>
        </div>
      </div>
      <div className="chart-summary-line"><span>{period === 'month' ? 'Giá trị giao dịch theo tháng' : 'Giá trị giao dịch gộp theo 3 tháng'}</span><strong>{period === 'month' ? '12 tháng gần nhất' : 'Gộp mỗi 3 tháng'}</strong></div>
      <div className="cashflow-chart"><ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 4, left: -16, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="#e8eaf0" strokeDasharray="3 4" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a8f9e', fontSize: 11 }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a4b0', fontSize: 10 }} tickFormatter={(v) => currencyShort(Number(v))} />
          <Tooltip cursor={{ fill: '#f8f8fc' }} formatter={(value, name) => [currencyFull(Number(value)), name === 'expenses' ? 'Chi nhập' : 'Giá trị xuất']} contentStyle={{ borderRadius: 12, border: '1px solid #e9eaf0', boxShadow: '0 8px 24px #19213a12', fontSize: 12 }} />
          <Bar dataKey="expenses" name="expenses" stackId="flow" fill="#c9cbd5" radius={[3, 3, 0, 0]} maxBarSize={25} />
          <Bar dataKey="income" name="income" stackId="flow" fill="#a69af6" radius={[3, 3, 0, 0]} maxBarSize={25} />
        </BarChart>
      </ResponsiveContainer></div>
    </section>
  )
}

function downloadCsv(data: CashFlowItem[]) {
  const content = ['Tháng,Chi nhập,Giá trị xuất', ...data.map((row) => `${row.month},${row.expenses},${row.income}`)].join('\n')
  const url = URL.createObjectURL(new Blob(['\ufeff', content], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'invento-cash-flow.csv'; link.click(); URL.revokeObjectURL(url)
}
