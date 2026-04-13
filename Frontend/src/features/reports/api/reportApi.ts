import type { CashFlowItem, ReportSummary } from '../../../types'
import { request } from '../../../lib/request'

export async function getCashFlow(months = 12): Promise<CashFlowItem[]> {
  const rows = await request<Array<Record<string, unknown>>>(`/reports/cash-flow?months=${months}`)
  return rows.map((r) => ({ month: String(r.label), expenses: Number(r.expenses), income: Number(r.income) }))
}

export async function getReportSummary(): Promise<ReportSummary> {
  const raw = await request<Record<string, unknown>>('/reports/summary')
  return {
    stockValueByWarehouse: (raw.stockValueByWarehouse as Array<Record<string, unknown>>).map((w) => ({
      warehouse: String(w.warehouse), stockValue: Number(w.stockValue), distinctProducts: Number(w.distinctProducts),
    })),
    topProducts: (raw.topProducts as Array<Record<string, unknown>>).map((p) => ({
      sku: String(p.sku), name: String(p.name), receiveValue: Number(p.receiveValue),
      issueValue: Number(p.issueValue), totalUnitsMoved: Number(p.totalUnitsMoved),
    })),
    receiveCount30d: Number(raw.receiveCount30d),
    issueCount30d: Number(raw.issueCount30d),
    receiveValue30d: Number(raw.receiveValue30d),
    issueValue30d: Number(raw.issueValue30d),
  }
}
