'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/app/components/Layout/app-shell'
import { SubscriptionList } from '@/app/components/subscriptions/subscription-list'
import { Button } from '@/app/components/UI/button'
import { Modal } from '@/app/components/UI/modal'
import { SubscriptionForm } from '@/app/components/subscriptions/subscription-form'
import { Alert } from '@/app/components/UI/alert'
import type { Subscription } from '@/app/lib/supabase'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const result = await response.json()
      if (result.success) {
        setSubscriptions(result.data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const handleCreate = async (formData: {
    subscription_name: string
    subscription_type: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
    subscription_bill: string
  }) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Subscription created successfully')
        setIsCreateModalOpen(false)
        fetchSubscriptions()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to create subscription')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Subscriptions</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your recurring subscriptions
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subscription
          </Button>
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
          <SubscriptionList subscriptions={subscriptions} onRefresh={fetchSubscriptions} />
        )}

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add Subscription"
        >
          <SubscriptionForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </AppShell>
  )
}
