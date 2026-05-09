import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/renewals/upcoming - Get upcoming renewals
export async function GET() {
  try {
    const session = await requireAuth()

    const today = new Date().toISOString()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const { data: renewals, error } = await supabase
      .from('tblsubscriptionrenew')
      .select(`
        *,
        subscription:subscription_id (
          subscription_name,
          subscription_type,
          subscription_bill
        )
      `)
      .eq('subscription_renewed_by', session.userId)
      .eq('subscription_is_cancelled', false)
      .gte('subscription_expired_at', today)
      .lte('subscription_expired_at', thirtyDaysFromNow.toISOString())
      .order('subscription_expired_at', { ascending: true })

    if (error) {
      console.error('Error fetching upcoming renewals:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch upcoming renewals' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: renewals })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/renewals/upcoming:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
