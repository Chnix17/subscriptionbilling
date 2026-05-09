export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatDateRelative(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days ago`
  } else if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Tomorrow'
  } else {
    return `In ${diffInDays} days`
  }
}

export function calculateMonthlyCost(bill: number, type: string): number {
  switch (type) {
    case 'MONTHLY':
      return bill
    case 'ANNUALLY':
      return bill / 12
    case 'WEEKLY':
      return bill * 4.33
    default:
      return bill
  }
}

export function getSubscriptionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MONTHLY: 'Monthly',
    WEEKLY: 'Weekly',
    ANNUALLY: 'Annually',
  }
  return labels[type] || type
}

export function getNotificationTypeColor(type: string): string {
  const colors: Record<string, string> = {
    renewal: 'bg-blue-500',
    expiry: 'bg-red-500',
    payment_due: 'bg-yellow-500',
  }
  return colors[type] || 'bg-gray-500'
}
