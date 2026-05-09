'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/app/components/Layout/app-shell'
import { Button } from '@/app/components/UI/button'
import { Alert } from '@/app/components/UI/alert'
import { formatDate, getNotificationTypeColor } from '@/app/lib/utils'
import type { Notification } from '@/app/lib/supabase'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Notification marked as read')
        fetchNotifications()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Notifications</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

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
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  className={`p-6 flex items-start gap-4 ${
                    !notification.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationTypeColor(notification.notification_type)}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-slate-800 dark:text-slate-200">
                          {notification.notification_title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notification.notification_message}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.notification_id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {notifications.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No notifications found
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
