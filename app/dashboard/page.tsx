'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/app/components/Layout/app-shell'
import { StatsCard } from '@/app/components/dashboard/stats-card'
import { SubscriptionChart } from '@/app/components/dashboard/subscription-chart'
import { UpcomingRenewals } from '@/app/components/dashboard/upcoming-renewals'
import { formatCurrency } from '@/app/lib/utils'

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

interface Renewal {
  subscription_renew_id: number
  subscription_expired_at: string
  subscription: {
    subscription_name: string
    subscription_bill: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [spendingData, setSpendingData] = useState<SpendingData[]>([])
  const [upcomingRenewals, setUpcomingRenewals] = useState<Renewal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, spendingRes, renewalsRes] = await Promise.all([
          fetch('/api/analytics/dashboard'),
          fetch('/api/analytics/spending'),
          fetch('/api/renewals/upcoming'),
        ])

        const statsData = await statsRes.json()
        const spendingData = await spendingRes.json()
        const renewalsData = await renewalsRes.json()

        if (statsData.success) setStats(statsData.data)
        if (spendingData.success) setSpendingData(spendingData.data)
        if (renewalsData.success) setUpcomingRenewals(renewalsData.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-slate-600 dark:text-slate-400">Loading...</span>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of your subscription spending
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Monthly Spending"
            value={formatCurrency(stats?.totalMonthlySpending || 0)}
            description="Estimated monthly cost"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="indigo"
          />
          <StatsCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            description="Total active subscriptions"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            }
            color="green"
          />
          <StatsCard
            title="Upcoming Renewals"
            value={stats?.upcomingRenewals || 0}
            description="Next 7 days"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="amber"
          />
          <StatsCard
            title="Expired"
            value={stats?.expiredSubscriptions || 0}
            description="Needs attention"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            color="red"
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionChart data={spendingData} />
          <UpcomingRenewals renewals={upcomingRenewals} />
        </div>
      </div>
    </AppShell>
  )
}
