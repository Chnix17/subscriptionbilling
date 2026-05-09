'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/app/components/Layout/app-shell'
import { Button } from '@/app/components/UI/button'
import { Alert } from '@/app/components/UI/alert'
import { ThemeToggle } from '@/app/components/UI/theme-toggle'
import { formatCurrency, formatDate, getSubscriptionTypeLabel } from '@/app/lib/utils'
import { ConfirmModal, Modal } from '@/app/components/UI/modal'
import type { Subscription } from '@/app/lib/supabase'

interface Renewal {
  subscription_renew_id: number
  subscription_id: number
  subscription_renewed_at: string
  subscription_expired_at: string
  subscription_is_cancelled: boolean
  months_paid_advance?: number
  subscription: {
    subscription_id: number
    subscription_name: string
    subscription_type: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
    subscription_bill: number
  }
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [renewingSubscription, setRenewingSubscription] = useState<Subscription | null>(null)
  const [reactivatingRenewal, setReactivatingRenewal] = useState<Renewal | null>(null)
  const [advanceMonths, setAdvanceMonths] = useState(1)
  const [estimatedTotal, setEstimatedTotal] = useState(0)
  const [isRenewing, setIsRenewing] = useState(false)
  const [isReactivating, setIsReactivating] = useState(false)
  const [renewedAt, setRenewedAt] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const fetchRenewals = async () => {
    try {
      const response = await fetch('/api/renewals')
      const result = await response.json()
      if (result.success) {
        setRenewals(result.data)
      }
    } catch (error) {
      console.error('Error fetching renewals:', error)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const result = await response.json()
      if (result.success) {
        setSubscriptions(result.data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    }
  }

  useEffect(() => {
    Promise.all([fetchRenewals(), fetchSubscriptions()]).finally(() => setLoading(false))
  }, [])

  const handleCancel = async () => {
    if (!cancellingId) return

    try {
      const response = await fetch(`/api/renewals/${cancellingId}/cancel`, {
        method: 'PUT',
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Renewal cancelled successfully')
        fetchRenewals()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to cancel renewal')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleRenew = async () => {
    if (!renewingSubscription) {
      setError('Subscription data is missing. Please try again.')
      return
    }

    // Create a local copy to prevent state changes during the async operation
    const subscriptionData = renewingSubscription

    if (!subscriptionData.subscription_id) {
      setError('Subscription ID is missing. Please try again.')
      return
    }

    setIsRenewing(true)
    try {
      const requestBody = {
        subscription_id: subscriptionData.subscription_id,
        months_advance: advanceMonths,
      }
      
      const response = await fetch('/api/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(`Renewed ${subscriptionData.subscription_name} for ${advanceMonths} period(s). Total: ${formatCurrency(result.data.total_bill)}`)
        fetchRenewals()
        setRenewingSubscription(null)
        setAdvanceMonths(1)
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(result.error || 'Failed to create renewal')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsRenewing(false)
    }
  }

  const handleReactivate = async () => {
    if (!reactivatingRenewal || !renewedAt) return

    setIsReactivating(true)
    try {
      const response = await fetch('/api/renewals/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renewal_id: reactivatingRenewal.subscription_renew_id,
          renewed_at: renewedAt,
          months_advance: advanceMonths,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(`Reactivated ${reactivatingRenewal.subscription.subscription_name} for ${advanceMonths} period(s). Total: ${formatCurrency(result.data.total_bill)}`)
        fetchRenewals()
        setReactivatingRenewal(null)
        setAdvanceMonths(1)
        setRenewedAt('')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(result.error || 'Failed to reactivate renewal')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsReactivating(false)
    }
  }

  const openRenewModal = (subscription: Subscription) => {
    setRenewingSubscription(subscription)
    setAdvanceMonths(1)
    setEstimatedTotal(Number(subscription.subscription_bill))
  }

  const handleAdvanceChange = (months: number) => {
    setAdvanceMonths(months)
    if (renewingSubscription) {
      setEstimatedTotal(Number(renewingSubscription.subscription_bill) * months)
    } else if (reactivatingRenewal) {
      setEstimatedTotal(Number(reactivatingRenewal.subscription.subscription_bill) * months)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Renewals</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Track and manage your subscription renewals
            </p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <Link href="/logs">
              <Button variant="secondary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                View Logs
              </Button>
            </Link>
          </div>
        </div>

        
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

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
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Renewed At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Expires At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {renewals.map((renewal) => (
                    <tr key={renewal.subscription_renew_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium">
                            {renewal.subscription.subscription_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {renewal.subscription.subscription_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {getSubscriptionTypeLabel(renewal.subscription.subscription_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200">
                        {renewal.months_paid_advance && renewal.months_paid_advance > 1 ? (
                          <div>
                            <span className="font-bold">
                              {formatCurrency(renewal.subscription.subscription_bill * renewal.months_paid_advance)}
                            </span>
                            <span className="text-xs text-slate-500 block">
                              ({renewal.months_paid_advance} x {formatCurrency(renewal.subscription.subscription_bill)})
                            </span>
                          </div>
                        ) : (
                          formatCurrency(renewal.subscription.subscription_bill)
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {formatDate(renewal.subscription_renewed_at)}
                        {renewal.months_paid_advance && renewal.months_paid_advance > 1 && (
                          <span className="text-xs text-indigo-600 block mt-1">
                            Paid {renewal.months_paid_advance} periods
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {formatDate(renewal.subscription_expired_at)}
                      </td>
                      <td className="px-6 py-4">
                        {renewal.subscription_is_cancelled ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {renewal.subscription_is_cancelled ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReactivatingRenewal(renewal)
                                  setAdvanceMonths(1)
                                  setRenewedAt(new Date().toISOString().split('T')[0])
                                  if (renewal.subscription) {
                                    setEstimatedTotal(Number(renewal.subscription.subscription_bill))
                                  }
                                }}
                                className="text-green-600 hover:text-green-700"
                              >
                                Reactivate
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCancellingId(renewal.subscription_renew_id)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  // Create a minimal subscription object using data from renewal
                                  const subscriptionToRenew: Subscription = {
                                    subscription_id: renewal.subscription_id,
                                    subscription_name: renewal.subscription?.subscription_name || 'Unknown',
                                    subscription_type: renewal.subscription?.subscription_type || 'MONTHLY',
                                    subscription_bill: renewal.subscription?.subscription_bill || 0,
                                    subscription_added_by: 0,
                                    created_at: new Date().toISOString()
                                  }
                                  
                                  openRenewModal(subscriptionToRenew)
                                }}
                              >
                                Renew
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renewals.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No renewals found
              </div>
            )}
          </div>
        )}

        
        <ConfirmModal
          isOpen={!!cancellingId}
          onClose={() => setCancellingId(null)}
          title="Cancel Renewal"
          message="Are you sure you want to cancel this renewal?"
          onConfirm={handleCancel}
          confirmText="Cancel Renewal"
          variant="danger"
        />

        {/* Renew in Advance Modal */}
        <Modal
          isOpen={!!renewingSubscription}
          onClose={() => setRenewingSubscription(null)}
          title={`Renew ${renewingSubscription?.subscription_name}`}
        >
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Base Price: <span className="font-medium">{renewingSubscription && formatCurrency(Number(renewingSubscription.subscription_bill))}</span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Type: <span className="font-medium">{renewingSubscription && getSubscriptionTypeLabel(renewingSubscription.subscription_type)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pay in Advance (periods)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={advanceMonths}
                  onChange={(e) => handleAdvanceChange(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-center font-medium text-slate-800 dark:text-slate-200">
                  {advanceMonths}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Pay for {advanceMonths} {renewingSubscription?.subscription_type.toLowerCase()} period(s) in advance
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Total Amount:</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
              {advanceMonths > 1 && renewingSubscription && (
                <p className="text-sm text-slate-500 text-right mt-1">
                  You save: {formatCurrency(Number(renewingSubscription.subscription_bill) * (advanceMonths - 1))} worth of future renewals
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setRenewingSubscription(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenew}
                isLoading={isRenewing}
                className="flex-1"
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reactivation Modal */}
        <Modal
          isOpen={!!reactivatingRenewal}
          onClose={() => setReactivatingRenewal(null)}
          title={`Reactivate ${reactivatingRenewal?.subscription.subscription_name}`}
        >
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Subscription: <span className="font-medium">{reactivatingRenewal?.subscription.subscription_name}</span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Type: <span className="font-medium">{reactivatingRenewal && getSubscriptionTypeLabel(reactivatingRenewal.subscription.subscription_type)}</span>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Last renewed: <span className="font-medium">{reactivatingRenewal && formatDate(reactivatingRenewal.subscription_renewed_at)}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Renewed Date
              </label>
              <input
                type="date"
                value={renewedAt}
                onChange={(e) => setRenewedAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-200"
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-slate-500 mt-1">
                Choose the date when the renewal should be considered active from
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pay in Advance (periods)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={advanceMonths}
                  onChange={(e) => handleAdvanceChange(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 text-center font-medium text-slate-800 dark:text-slate-200">
                  {advanceMonths}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Pay for {advanceMonths} {reactivatingRenewal?.subscription.subscription_type.toLowerCase()} period(s) in advance
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Total Amount:</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
              {advanceMonths > 1 && reactivatingRenewal && (
                <p className="text-sm text-slate-500 text-right mt-1">
                  You save: {formatCurrency(Number(reactivatingRenewal.subscription.subscription_bill) * (advanceMonths - 1))} worth of future renewals
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setReactivatingRenewal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReactivate}
                isLoading={isReactivating}
                className="flex-1"
              >
                Reactivate
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  )
}
