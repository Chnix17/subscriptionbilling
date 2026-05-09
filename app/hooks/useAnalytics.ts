'use client'

import { useState, useCallback } from 'react'

interface DashboardStats {
  totalMonthlySpending: number
  activeSubscriptions: number
  upcomingRenewals: number
  expiredSubscriptions: number
}

interface SpendingData {
  month: string
  amount: number
}

interface BreakdownData {
  monthly: { count: number; total: number }
  weekly: { count: number; total: number }
  annually: { count: number; total: number }
}

interface UseAnalyticsReturn {
  stats: DashboardStats | null
  spendingData: SpendingData[]
  breakdown: BreakdownData | null
  loading: boolean
  error: string | null
  fetchDashboardStats: () => Promise<void>
  fetchSpendingData: () => Promise<void>
  fetchBreakdown: () => Promise<void>
}

export function useAnalytics(): UseAnalyticsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [spendingData, setSpendingData] = useState<SpendingData[]>([])
  const [breakdown, setBreakdown] = useState<BreakdownData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analytics/dashboard')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      } else {
        setError(result.error || 'Failed to fetch stats')
      }
    } catch {
      setError('An error occurred while fetching stats')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSpendingData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analytics/spending')
      const result = await response.json()
      if (result.success) {
        setSpendingData(result.data)
      } else {
        setError(result.error || 'Failed to fetch spending data')
      }
    } catch {
      setError('An error occurred while fetching spending data')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBreakdown = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analytics/breakdown')
      const result = await response.json()
      if (result.success) {
        setBreakdown(result.data)
      } else {
        setError(result.error || 'Failed to fetch breakdown')
      }
    } catch {
      setError('An error occurred while fetching breakdown')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    stats,
    spendingData,
    breakdown,
    loading,
    error,
    fetchDashboardStats,
    fetchSpendingData,
    fetchBreakdown,
  }
}
