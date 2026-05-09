import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/logs - Get activity logs for logged-in user
export async function GET() {
  try {
    const session = await requireAuth()

    const { data: logs, error } = await supabase
      .from('tblsubscriptionlog')
      .select(`
        subscription_log_id,
        subscription_total_bill,
        subscription_created_at,
        subscription_renew:subscription_renew_id (
          subscription_id,
          subscription:subscription_id (
            subscription_name
          ),
          subscription_expired_at,
          subscription_is_cancelled
        )
      `)
      .eq('subscription_action_by', session.userId)
      .order('subscription_created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching logs:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: logs })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
