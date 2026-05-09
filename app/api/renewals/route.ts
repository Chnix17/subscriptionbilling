import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/renewals - List all renewals for logged-in user
export async function GET() {
  try {
    const session = await requireAuth()

    const { data: renewals, error } = await supabase
      .from('tblsubscriptionrenew')
      .select(`
        subscription_renew_id,
        subscription_id,
        subscription_renewed_at,
        subscription_expired_at,
        subscription_renewed_by,
        subscription_is_cancelled,
        months_paid_advance,
        created_at,
        subscription:subscription_id (
          subscription_name,
          subscription_type,
          subscription_bill
        )
      `)
      .eq('subscription_renewed_by', session.userId)
      .order('subscription_expired_at', { ascending: true })

    if (error) {
      console.error('Error fetching renewals:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch renewals' },
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
    console.error('Error in GET /api/renewals:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/renewals - Update existing renewal or create new one if none exists
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/renewals called')
    const session = await requireAuth()
    console.log('Session validated:', session.userId)
    const body = await request.json()
    console.log('Request body:', body)

    const { subscription_id, months_advance = 1, renew_renewed_at, renewal_id } = body
    console.log('Extracted params:', { subscription_id, months_advance, renew_renewed_at, renewal_id })

    if (!subscription_id) {
      return NextResponse.json(
        { success: false, error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    // Verify subscription belongs to user
    const { data: subscription } = await supabase
      .from('tblsubscriptionname')
      .select('subscription_id, subscription_bill, subscription_type, subscription_name')
      .eq('subscription_id', subscription_id)
      .eq('subscription_added_by', session.userId)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Check if renewal exists for this subscription
    let existingRenewal = null
    if (renewal_id) {
      // If renewal_id is provided, get that specific renewal
      const { data } = await supabase
        .from('tblsubscriptionrenew')
        .select('*')
        .eq('subscription_renew_id', renewal_id)
        .eq('subscription_renewed_by', session.userId)
        .single()
      existingRenewal = data
    } else {
      // Otherwise, find the most recent renewal for this subscription
      const { data } = await supabase
        .from('tblsubscriptionrenew')
        .select('*')
        .eq('subscription_id', subscription_id)
        .eq('subscription_renewed_by', session.userId)
        .order('subscription_renewed_at', { ascending: false })
        .limit(1)
        .single()
      existingRenewal = data
    }

    let renewal
    let totalBill
    const multiplier = months_advance || 1

    if (existingRenewal) {
      console.log('Found existing renewal:', existingRenewal.subscription_renew_id)
      
      // Calculate new expiry date - start from existing expiry date
      const expiredAt = new Date(existingRenewal.subscription_expired_at)
      const renewedAt = renew_renewed_at ? new Date(renew_renewed_at) : new Date(existingRenewal.subscription_renewed_at)
      
      // Calculate expiry based on subscription type and advance months
      switch (subscription.subscription_type) {
        case 'WEEKLY':
          expiredAt.setDate(expiredAt.getDate() + (7 * multiplier))
          break
        case 'MONTHLY':
          expiredAt.setMonth(expiredAt.getMonth() + multiplier)
          break
        case 'ANNUALLY':
          expiredAt.setFullYear(expiredAt.getFullYear() + multiplier)
          break
      }

      // Update existing renewal
      const { data: updatedRenewal, error } = await supabase
        .from('tblsubscriptionrenew')
        .update({
          subscription_expired_at: expiredAt.toISOString(),
          subscription_is_cancelled: false, // Reactivate if it was cancelled
          months_paid_advance: multiplier,
          ...(renew_renewed_at && { subscription_renewed_at: renewedAt.toISOString() })
        })
        .eq('subscription_renew_id', existingRenewal.subscription_renew_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating renewal:', error)
        return NextResponse.json(
          { success: false, error: `Failed to update renewal: ${error.message}` },
          { status: 500 }
        )
      }

      renewal = updatedRenewal
      totalBill = Number(subscription.subscription_bill) * multiplier

      // Create log entry
      const logNote = renew_renewed_at 
        ? `Reactivated and renewed ${subscription.subscription_name} for ${multiplier} ${subscription.subscription_type.toLowerCase()}(s)`
        : `Renewed ${subscription.subscription_name} for ${multiplier} ${subscription.subscription_type.toLowerCase()}(s)`

      await supabase.from('tblsubscriptionlog').insert({
        subscription_renew_id: renewal.subscription_renew_id,
        subscription_total_bill: totalBill,
        subscription_action_by: session.userId,
        note: logNote,
      })

    } else {
      console.log('No existing renewal found, creating new one')
      
      // Calculate dates based on advance months
      const renewedAt = new Date()
      const expiredAt = new Date()

      // Calculate expiry based on subscription type and advance months
      switch (subscription.subscription_type) {
        case 'WEEKLY':
          expiredAt.setDate(expiredAt.getDate() + (7 * multiplier))
          break
        case 'MONTHLY':
          expiredAt.setMonth(expiredAt.getMonth() + multiplier)
          break
        case 'ANNUALLY':
          expiredAt.setFullYear(expiredAt.getFullYear() + multiplier)
          break
      }

      totalBill = Number(subscription.subscription_bill) * multiplier

      // Create new renewal
      const { data: newRenewal, error } = await supabase
        .from('tblsubscriptionrenew')
        .insert({
          subscription_id,
          subscription_renewed_at: renewedAt.toISOString(),
          subscription_expired_at: expiredAt.toISOString(),
          subscription_renewed_by: session.userId,
          subscription_is_cancelled: false,
          months_paid_advance: multiplier,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating renewal:', error)
        return NextResponse.json(
          { success: false, error: `Failed to create renewal: ${error.message}` },
          { status: 500 }
        )
      }

      renewal = newRenewal

      // Create log entry
      await supabase.from('tblsubscriptionlog').insert({
        subscription_renew_id: renewal.subscription_renew_id,
        subscription_total_bill: totalBill,
        subscription_action_by: session.userId,
        note: `Initial renewal for ${subscription.subscription_name} - ${multiplier} ${subscription.subscription_type.toLowerCase()}(s)`,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...renewal,
        months_paid_advance: multiplier,
        total_bill: totalBill,
      }
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in POST /api/renewals:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
