import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
})

export type User = {
  user_id: number
  user_fullname: string
  user_username: string
  user_password: string
  user_role_id: number
  user_is_active: boolean
  created_at: string
}

export type Role = {
  role_id: number
  role_name: string
}

export type Subscription = {
  subscription_id: number
  subscription_name: string
  subscription_type: 'MONTHLY' | 'WEEKLY' | 'ANNUALLY'
  subscription_bill: number
  subscription_added_by: number
  created_at: string
}

export type SubscriptionRenew = {
  subscription_renew_id: number
  subscription_id: number
  subscription_renewed_at: string
  subscription_expired_at: string
  subscription_renewed_by: number
  subscription_is_cancelled: boolean
  created_at: string
}

export type SubscriptionLog = {
  subscription_log_id: number
  subscription_renew_id: number
  subscription_total_bill: number
  subscription_action_by: number
  subscription_created_at: string
}

export type Notification = {
  notification_id: number
  user_id: number
  notification_title: string
  notification_message: string
  notification_type: 'renewal' | 'expiry' | 'payment_due'
  is_read: boolean
  created_at: string
}
