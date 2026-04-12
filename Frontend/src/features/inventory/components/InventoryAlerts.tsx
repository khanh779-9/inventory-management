import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowUpRight } from 'lucide-react'

const palette: Record<string, string> = { 'In Stock': '#6cc58f', 'Low Stock': '#fb8e89', 'Out of Stock': '#b9b8c9' }
const labels: Record<string, string> = { 'In Stock': 'Đủ hàng', 'Low Stock': 'Sắp hết', 'Out of Stock': 'Hết hàng' }

export default function InventoryAlerts({ data, onViewInventory }: { data: { status: string; count: number }[]; onViewInventory: (status?: string) => void }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  return (
    <section className="panel alert-panel">
      <div className="panel-heading"><div><h2>Cảnh báo tồn kho</h2><p className="panel-description">Tình trạng sản phẩm hiện tại</p></div><button className="icon-button panel-link" aria-label="Xem sản phẩm tồn kho" onClick={() => onViewInventory()}><ArrowUpRight size={17} /></button></div>
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius="65%" outerRadius="88%" paddingAngle={3} stroke="none" cornerRadius={5}>
              {data.map((entry) => <Cell key={entry.status} fill={palette[entry.status] ?? '#b9b8c9'} />)}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} sản phẩm`, labels[String(name)] ?? name]} contentStyle={{ borderRadius: 12, border: '1px solid #e9eaf0', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center"><strong>{total}</strong><span>Sản phẩm</span></div>
      </div>
      <div className="alert-legend">
        {data.map((item) => <button key={item.status} className="alert-legend-item" onClick={() => onViewInventory(item.status)}>
          <span className="alert-legend-label"><i style={{ background: palette[item.status] ?? '#b9b8c9' }} />{labels[item.status] ?? item.status}</span>
          <strong>{item.count}</strong>
        </button>)}
      </div>
    </section>
  )
}
