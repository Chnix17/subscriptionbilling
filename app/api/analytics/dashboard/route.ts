import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/analytics/dashboard - Get dashboard statistics
export async function GET() {
  try {
    const session = await requireAuth()

    // Get total monthly spending
    const { data: subscriptions } = await supabase
      .from('tblsubscriptionname')
      .select('subscription_bill, subscription_type')
      .eq('subscription_added_by', session.userId)

    let totalMonthlySpending = 0
    subscriptions?.forEach((sub) => {
      if (sub.subscription_type === 'MONTHLY') {
        totalMonthlySpending += Number(sub.subscription_bill)
      } else if (sub.subscription_type === 'ANNUALLY') {
        totalMonthlySpending += Number(sub.subscription_bill) / 12
      } else if (sub.subscription_type === 'WEEKLY') {
        totalMonthlySpending += Number(sub.subscription_bill) * 4.33
      }
    })

    // Get active subscriptions count
    const { count: activeCount } = await supabase
      .from('tblsubscriptionname')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_added_by', session.userId)

    // Get upcoming renewals (next 7 days)
    const today = new Date().toISOString()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { count: upcomingCount } = await supabase
      .from('tblsubscriptionrenew')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_renewed_by', session.userId)
      .eq('subscription_is_cancelled', false)
      .gte('subscription_expired_at', today)
      .lte('subscription_expired_at', sevenDaysFromNow.toISOString())

    // Get expired subscriptions
    const { count: expiredCount } = await supabase
      .from('tblsubscriptionrenew')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_renewed_by', session.userId)
      .eq('subscription_is_cancelled', false)
      .lt('subscription_expired_at', today)

    return NextResponse.json({
      success: true,
      data: {
        totalMonthlySpending: Math.round(totalMonthlySpending * 100) / 100,
        activeSubscriptions: activeCount || 0,
        upcomingRenewals: upcomingCount || 0,
        expiredSubscriptions: expiredCount || 0,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/analytics/dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
