import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/analytics/spending - Get monthly spending data for charts
export async function GET() {
  try {
    const session = await requireAuth()

    // Get all billing logs from subscription log table
    const { data: billingLogs } = await supabase
      .from('tblsubscriptionlog')
      .select(`
        subscription_total_bill,
        subscription_created_at,
        subscription_renew:subscription_renew_id (
          subscription_id,
          subscription:subscription_id (
            subscription_name,
            subscription_type
          )
        )
      `)
      .eq('subscription_action_by', session.userId)

    // Calculate monthly spending for the last 6 months based on actual billing transactions
    const monthlyData: { month: string; amount: number }[] = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      const monthLabel = monthNames[date.getMonth()]

      let monthTotal = 0
      billingLogs?.forEach((log) => {
        const logDate = new Date(log.subscription_created_at)
        // Only include billing transactions that occurred in this month
        if (logDate >= monthStart && logDate <= monthEnd) {
          monthTotal += Number(log.subscription_total_bill)
        }
      })

      monthlyData.push({
        month: monthLabel,
        amount: Math.round(monthTotal * 100) / 100,
      })
    }

    return NextResponse.json({
      success: true,
      data: monthlyData,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/analytics/spending:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
