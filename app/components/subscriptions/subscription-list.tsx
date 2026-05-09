'use client'

import { useState } from 'react'
import { SubscriptionCard } from './subscription-card'
import { SubscriptionForm } from './subscription-form'
import { Modal, ConfirmModal } from '../UI/modal'
import { Button } from '../UI/button'
import { Alert } from '../UI/alert'
import type { Subscription } from '@/app/lib/supabase'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onRefresh: () => void
}

export function SubscriptionList({ subscriptions, onRefresh }: SubscriptionListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreate = async (formData: {
    subscription_name: string
    subscription_type: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
    subscription_bill: string
  }) => {
    setIsLoading(true)
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
        onRefresh()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to create subscription')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (formData: {
    subscription_name: string
    subscription_type: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
    subscription_bill: string
  }) => {
    if (!editingSubscription) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/subscriptions/${editingSubscription.subscription_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Subscription updated successfully')
        setEditingSubscription(null)
        onRefresh()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to update subscription')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingSubscription) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/subscriptions/${deletingSubscription.subscription_id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Subscription deleted successfully')
        setDeletingSubscription(null)
        onRefresh()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to delete subscription')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {success && (
        <div className="mb-4">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.subscription_id}
            subscription={subscription}
            onEdit={setEditingSubscription}
            onDelete={setDeletingSubscription}
          />
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Subscription"
      >
        <SubscriptionForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSubscription}
        onClose={() => setEditingSubscription(null)}
        title="Edit Subscription"
      >
        <SubscriptionForm
          initialData={{
            subscription_name: editingSubscription?.subscription_name,
            subscription_type: editingSubscription?.subscription_type,
            subscription_bill: editingSubscription?.subscription_bill.toString(),
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditingSubscription(null)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingSubscription}
        onClose={() => setDeletingSubscription(null)}
        title="Delete Subscription"
        message={`Are you sure you want to delete "${deletingSubscription?.subscription_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
