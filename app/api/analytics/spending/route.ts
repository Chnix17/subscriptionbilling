import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/analytics/spending - Get monthly spending data for charts
export async function GET() {
  try {
    const session = await requireAuth()

    // Get all subscriptions
    const { data: subscriptions } = await supabase
      .from('tblsubscriptionname')
      .select('subscription_bill, subscription_type, created_at')
      .eq('subscription_added_by', session.userId)

    // Calculate monthly spending for the last 6 months
    const monthlyData: { month: string; amount: number }[] = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = monthNames[date.getMonth()]

      let monthTotal = 0
      subscriptions?.forEach((sub) => {
        // For simplicity, assume all subscriptions were active in all months
        // In a real app, you'd check subscription creation date and renewal history
        if (sub.subscription_type === 'MONTHLY') {
          monthTotal += Number(sub.subscription_bill)
        } else if (sub.subscription_type === 'ANNUALLY') {
          monthTotal += Number(sub.subscription_bill) / 12
        } else if (sub.subscription_type === 'WEEKLY') {
          monthTotal += Number(sub.subscription_bill) * 4.33
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
