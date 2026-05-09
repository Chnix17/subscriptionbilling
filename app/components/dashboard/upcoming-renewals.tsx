'use client'

import { formatDate, formatDateRelative, formatCurrency } from '@/app/lib/utils'
import Link from 'next/link'
import { ROUTES } from '@/app/lib/constants'

interface Renewal {
  subscription_renew_id: number
  subscription_expired_at: string
  subscription: {
    subscription_name: string
    subscription_bill: number
  }
}

interface UpcomingRenewalsProps {
  renewals: Renewal[]
}

export function UpcomingRenewals({ renewals }: UpcomingRenewalsProps) {
  if (!renewals || renewals.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Upcoming Renewals</h3>
          <Link
            href={ROUTES.RENEWALS}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No upcoming renewals</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Upcoming Renewals</h3>
        <Link
          href={ROUTES.RENEWALS}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {renewals.slice(0, 5).map((renewal) => (
          <div
            key={renewal.subscription_renew_id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium">
                {renewal.subscription.subscription_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {renewal.subscription.subscription_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(renewal.subscription_expired_at)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {formatCurrency(renewal.subscription.subscription_bill)}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {formatDateRelative(renewal.subscription_expired_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
