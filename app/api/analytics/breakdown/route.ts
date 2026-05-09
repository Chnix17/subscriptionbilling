import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/analytics/breakdown - Get subscription breakdown by type
export async function GET() {
  try {
    const session = await requireAuth()

    // Get subscriptions grouped by type
    const { data: subscriptions } = await supabase
      .from('tblsubscriptionname')
      .select('subscription_type, subscription_bill')
      .eq('subscription_added_by', session.userId)

    const breakdown = {
      monthly: { count: 0, total: 0 },
      weekly: { count: 0, total: 0 },
      annually: { count: 0, total: 0 },
    }

    subscriptions?.forEach((sub) => {
      const type = sub.subscription_type.toLowerCase() as keyof typeof breakdown
      if (breakdown[type]) {
        breakdown[type].count += 1
        breakdown[type].total += Number(sub.subscription_bill)
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
