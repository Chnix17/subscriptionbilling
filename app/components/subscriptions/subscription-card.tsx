'use client'

import { formatCurrency, getSubscriptionTypeLabel } from '@/app/lib/utils'
import { Button } from '../UI/button'
import type { Subscription } from '@/app/lib/supabase'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (subscription: Subscription) => void
  onDelete: (subscription: Subscription) => void
}

export function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const typeColors = {
    MONTHLY: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    WEEKLY: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    ANNUALLY: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-medium">
            {subscription.subscription_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {subscription.subscription_name}
            </h3>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                typeColors[subscription.subscription_type]
              }`}
            >
              {getSubscriptionTypeLabel(subscription.subscription_type)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {formatCurrency(subscription.subscription_bill)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            per {subscription.subscription_type.toLowerCase().replace('ly', '')}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
        <Button variant="ghost" size="sm" onClick={() => onEdit(subscription)}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(subscription)}>
          <svg className="w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </Button>
      </div>
    </div>
  )
}
