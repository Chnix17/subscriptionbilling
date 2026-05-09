import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/subscriptions - List all subscriptions for logged-in user
export async function GET() {
  try {
    const session = await requireAuth()

    const { data: subscriptions, error } = await supabase
      .from('tblsubscriptionname')
      .select('*')
      .eq('subscription_added_by', session.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: subscriptions })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/subscriptions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { subscription_name, subscription_type, subscription_bill } = body

    if (!subscription_name || !subscription_type || !subscription_bill) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate subscription_type
    const validTypes = ['MONTHLY', 'WEEKLY', 'ANNUALLY']
    if (!validTypes.includes(subscription_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription type' },
        { status: 400 }
      )
    }

    const { data: subscription, error } = await supabase
      .from('tblsubscriptionname')
      .insert({
        subscription_name,
        subscription_type,
        subscription_bill: Number(subscription_bill),
        subscription_added_by: session.userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, error: `Failed to create subscription: ${error.message}` },
        { status: 500 }
      )
    }

    // Create initial renewal
    const renewedAt = new Date()
    const expiredAt = new Date()

    switch (subscription_type) {
      case 'WEEKLY':
        expiredAt.setDate(expiredAt.getDate() + 7)
        break
      case 'MONTHLY':
        expiredAt.setMonth(expiredAt.getMonth() + 1)
        break
      case 'ANNUALLY':
        expiredAt.setFullYear(expiredAt.getFullYear() + 1)
        break
    }

    const { data: renewal } = await supabase
      .from('tblsubscriptionrenew')
      .insert({
        subscription_id: subscription.subscription_id,
        subscription_renewed_at: renewedAt.toISOString(),
        subscription_expired_at: expiredAt.toISOString(),
        subscription_renewed_by: session.userId,
        subscription_is_cancelled: false,
      })
      .select()
      .single()

    // Create log entry if renewal was created
    if (renewal) {
      await supabase.from('tblsubscriptionlog').insert({
        subscription_renew_id: renewal.subscription_renew_id,
        subscription_total_bill: Number(subscription_bill),
        subscription_action_by: session.userId,
      })
    }

    return NextResponse.json({ success: true, data: subscription })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in POST /api/subscriptions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
