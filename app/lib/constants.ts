export const APP_NAME = 'Billing System'

export const SUBSCRIPTION_TYPES = [
  { value: 'MONTHLY', label: 'Monthly', description: 'Billed every month' },
  { value: 'WEEKLY', label: 'Weekly', description: 'Billed every week' },
  { value: 'ANNUALLY', label: 'Annually', description: 'Billed every year' },
] as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  SUBSCRIPTIONS: '/subscriptions',
  RENEWALS: '/renewals',
  ANALYTICS: '/analytics',
  NOTIFICATIONS: '/notifications',
  LOGS: '/logs',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  SUBSCRIPTIONS: {
    LIST: '/api/subscriptions',
    DETAIL: (id: number) => `/api/subscriptions/${id}`,
  },
  RENEWALS: {
    LIST: '/api/renewals',
    UPCOMING: '/api/renewals/upcoming',
    CANCEL: (id: number) => `/api/renewals/${id}/cancel`,
  },
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    SPENDING: '/api/analytics/spending',
    BREAKDOWN: '/api/analytics/breakdown',
  },
  LOGS: '/api/logs',
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    READ: (id: number) => `/api/notifications/${id}/read`,
  },
} as const
