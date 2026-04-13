import { useCallback, useEffect, useState } from 'react'
import type { CashFlowItem, ReportSummary } from '../../../types'
import { getCashFlow, getReportSummary } from '../api/reportApi'

export function useCashFlow(months = 12) {
  const [data, setData] = useState<CashFlowItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await getCashFlow(months)); setError(null) }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải dòng tiền.') }
    finally { setLoading(false) }
  }, [months])

  useEffect(() => { void load() }, [load])

  return { data, loading, error, reload: () => void load() }
}

export function useReportSummary() {
  const [data, setData] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await getReportSummary()); setError(null) }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể tải báo cáo.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  return { data, loading, error, reload: () => void load() }
}
