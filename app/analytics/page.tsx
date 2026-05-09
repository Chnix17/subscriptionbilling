'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/app/components/Layout/app-shell'
import { SubscriptionChart } from '@/app/components/dashboard/subscription-chart'
import { formatCurrency } from '@/app/lib/utils'

interface SpendingData {
  month: string
  amount: number
}

interface BreakdownData {
  monthly: { count: number; total: number }
  weekly: { count: number; total: number }
  annually: { count: number; total: number }
}

export default function AnalyticsPage() {
  const [spendingData, setSpendingData] = useState<SpendingData[]>([])
  const [breakdown, setBreakdown] = useState<BreakdownData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [spendingRes, breakdownRes] = await Promise.all([
          fetch('/api/analytics/spending'),
          fetch('/api/analytics/breakdown'),
        ])

        const spending = await spendingRes.json()
        const breakdown = await breakdownRes.json()

        if (spending.success) setSpendingData(spending.data)
        if (breakdown.success) setBreakdown(breakdown.data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const totalSpending = spendingData.reduce((sum, d) => sum + d.amount, 0)
  const averageMonthly = totalSpending / (spendingData.length || 1)

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Detailed insights into your subscription spending
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-slate-600 dark:text-slate-400">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">6-Month Total</p>
                <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(totalSpending)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Monthly</p>
                <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(averageMonthly)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Yearly Estimate</p>
                <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(averageMonthly * 12)}
                </p>
              </div>
            </div>

            {/* Chart */}
            <SubscriptionChart data={spendingData} />

            {/* Breakdown */}
          
          </>
        )}
      </div>
    </AppShell>
  )
}
