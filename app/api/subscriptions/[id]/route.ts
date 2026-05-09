import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/subscriptions/[id] - Get single subscription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const { data: subscription, error } = await supabase
      .from('tblsubscriptionname')
      .select('*')
      .eq('subscription_id', id)
      .eq('subscription_added_by', session.userId)
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: subscription })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/subscriptions/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/subscriptions/[id] - Update subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = await request.json()

    const { subscription_name, subscription_type, subscription_bill } = body

    // Validate subscription_type if provided
    if (subscription_type) {
      const validTypes = ['MONTHLY', 'WEEKLY', 'ANNUALLY']
      if (!validTypes.includes(subscription_type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid subscription type' },
          { status: 400 }
        )
      }
    }

    // Check if subscription exists and belongs to user
    const { data: existing } = await supabase
      .from('tblsubscriptionname')
      .select('subscription_id')
      .eq('subscription_id', id)
      .eq('subscription_added_by', session.userId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (subscription_name !== undefined) updateData.subscription_name = subscription_name
    if (subscription_type !== undefined) updateData.subscription_type = subscription_type
    if (subscription_bill !== undefined) updateData.subscription_bill = Number(subscription_bill)

    const { data: subscription, error } = await supabase
      .from('tblsubscriptionname')
      .update(updateData)
      .eq('subscription_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: subscription })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in PUT /api/subscriptions/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/subscriptions/[id] - Delete subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Check if subscription exists and belongs to user
    const { data: existing } = await supabase
      .from('tblsubscriptionname')
      .select('subscription_id')
      .eq('subscription_id', id)
      .eq('subscription_added_by', session.userId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('tblsubscriptionname')
      .delete()
      .eq('subscription_id', id)

    if (error) {
      console.error('Error deleting subscription:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in DELETE /api/subscriptions/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
