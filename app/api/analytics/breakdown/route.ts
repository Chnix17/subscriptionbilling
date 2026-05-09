import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/analytics/breakdown - Get subscription breakdown by type
export async function GET() {
  try {
    const session = await requireAuth()

    // Get billing logs with subscription types for accurate breakdown
    const { data: billingLogs } = await supabase
      .from('tblsubscriptionlog')
      .select(`
        subscription_total_bill,
        subscription_renew:subscription_renew_id (
          subscription_id,
          subscription:subscription_id (
            subscription_type
          )
        )
      `)
      .eq('subscription_action_by', session.userId)

    const breakdown = {
      monthly: { count: 0, total: 0 },
      weekly: { count: 0, total: 0 },
      annually: { count: 0, total: 0 },
    }

    // Track unique subscriptions to avoid counting renewals multiple times for count
    const uniqueSubscriptions = new Set<string>()

    billingLogs?.forEach((log) => {
      const subscriptionData = log.subscription_renew?.[0]
      if (!subscriptionData) return

      const subscriptionType = subscriptionData.subscription?.[0]?.subscription_type
      if (!subscriptionType) return

      const type = subscriptionType.toLowerCase() as keyof typeof breakdown
      if (breakdown[type]) {
        breakdown[type].total += Number(log.subscription_total_bill)
        
        // Create unique key for subscription using subscription_id
        const subscriptionKey = `${subscriptionData.subscription_id}_${subscriptionType}`
        if (!uniqueSubscriptions.has(subscriptionKey)) {
          uniqueSubscriptions.add(subscriptionKey)
          breakdown[type].count += 1
        }
      }
    })

    // Round totals
    breakdown.monthly.total = Math.round(breakdown.monthly.total * 100) / 100
    breakdown.weekly.total = Math.round(breakdown.weekly.total * 100) / 100
    breakdown.annually.total = Math.round(breakdown.annually.total * 100) / 100

    return NextResponse.json({
      success: true,
      data: breakdown,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/analytics/breakdown:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
