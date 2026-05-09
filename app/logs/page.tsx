'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/app/components/Layout/app-shell'
import { formatCurrency, formatDate } from '@/app/lib/utils'

interface LogEntry {
  subscription_log_id: number
  subscription_total_bill: number
  subscription_created_at: string
  subscription_renew: {
    subscription_id: number
    subscription: {
      subscription_name: string
    }
    subscription_expired_at: string
    subscription_is_cancelled: boolean
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs')
        const result = await response.json()
        if (result.success) {
          setLogs(result.data)
        }
      } catch (error) {
        console.error('Error fetching logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Activity Logs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track all your subscription activities
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {logs.map((log) => (
                    <tr key={log.subscription_log_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium">
                            {log.subscription_renew?.subscription?.subscription_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {log.subscription_renew?.subscription?.subscription_name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          Renewal Created
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200">
                        {formatCurrency(log.subscription_total_bill)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {formatDate(log.subscription_created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {log.subscription_renew?.subscription_is_cancelled ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {logs.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No activity logs found
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
