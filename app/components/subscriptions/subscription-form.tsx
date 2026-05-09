'use client'

import { useState, useEffect } from 'react'
import { Button } from '../UI/button'
import { Input } from '../UI/input'
import { SUBSCRIPTION_TYPES } from '@/app/lib/constants'

interface SubscriptionFormData {
  subscription_name: string
  subscription_type: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
  subscription_bill: string
}

interface SubscriptionFormProps {
  initialData?: Partial<SubscriptionFormData>
  onSubmit: (data: SubscriptionFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function SubscriptionForm({ initialData, onSubmit, onCancel, isLoading }: SubscriptionFormProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    subscription_name: '',
    subscription_type: 'MONTHLY',
    subscription_bill: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        subscription_name: initialData.subscription_name || '',
        subscription_type: initialData.subscription_type || 'MONTHLY',
        subscription_bill: initialData.subscription_bill || '',
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Subscription Name"
        placeholder="e.g., Netflix, Spotify"
        value={formData.subscription_name}
        onChange={(e) => setFormData({ ...formData, subscription_name: e.target.value })}
        required
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Billing Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SUBSCRIPTION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, subscription_type: type.value })}
              className={`p-3 rounded-xl border text-center transition-all ${
                formData.subscription_type === type.value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              <p className="font-medium text-sm">{type.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={formData.subscription_bill}
        onChange={(e) => setFormData({ ...formData, subscription_bill: e.target.value })}
        required
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update' : 'Create'} Subscription
        </Button>
      </div>
    </form>
  )
}
