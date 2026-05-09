'use client'

import { useState, useCallback } from 'react'
import type { Subscription } from '@/app/lib/supabase'

interface UseSubscriptionReturn {
  subscriptions: Subscription[]
  loading: boolean
  error: string | null
  fetchSubscriptions: () => Promise<void>
  createSubscription: (data: {
    subscription_name: string
    subscription_type: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
    subscription_bill: string
  }) => Promise<boolean>
  updateSubscription: (
    id: number,
    data: {
      subscription_name?: string
      subscription_type?: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
      subscription_bill?: string
    }
  ) => Promise<boolean>
  deleteSubscription: (id: number) => Promise<boolean>
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/subscriptions')
      const result = await response.json()
      if (result.success) {
        setSubscriptions(result.data)
      } else {
        setError(result.error || 'Failed to fetch subscriptions')
      }
    } catch {
      setError('An error occurred while fetching subscriptions')
    } finally {
      setLoading(false)
    }
  }, [])

  const createSubscription = async (data: {
    subscription_name: string
    subscription_type: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
    subscription_bill: string
  }) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        await fetchSubscriptions()
        return true
      } else {
        setError(result.error || 'Failed to create subscription')
        return false
      }
    } catch {
      setError('An error occurred while creating subscription')
      return false
    }
  }

  const updateSubscription = async (
    id: number,
    data: {
      subscription_name?: string
      subscription_type?: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
      subscription_bill?: string
    }
  ) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        await fetchSubscriptions()
        return true
      } else {
        setError(result.error || 'Failed to update subscription')
        return false
      }
    } catch {
      setError('An error occurred while updating subscription')
      return false
    }
  }

  const deleteSubscription = async (id: number) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        await fetchSubscriptions()
        return true
      } else {
        setError(result.error || 'Failed to delete subscription')
        return false
      }
    } catch {
      setError('An error occurred while deleting subscription')
      return false
    }
  }

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  }
}
