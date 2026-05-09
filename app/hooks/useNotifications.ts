'use client'

import { useState, useCallback } from 'react'
import type { Notification } from '@/app/lib/supabase'

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: () => Promise<void>
  markAsRead: (id: number) => Promise<boolean>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications')
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data)
      } else {
        setError(result.error || 'Failed to fetch notifications')
      }
    } catch {
      setError('An error occurred while fetching notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      })
      const result = await response.json()
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
        )
        return true
      } else {
        setError(result.error || 'Failed to mark as read')
        return false
      }
    } catch {
      setError('An error occurred while marking notification as read')
      return false
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
  }
}
