import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// POST /api/renewals/reactivate - Reactivate a cancelled renewal with custom renewed date
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { renewal_id, renewed_at, months_advance = 1 } = body

    if (!renewal_id || !renewed_at) {
      return NextResponse.json(
        { success: false, error: 'Renewal ID and renewed date are required' },
        { status: 400 }
      )
    }

    // Get the renewal details
    const { data: renewal, error: renewalError } = await supabase
      .from('tblsubscriptionrenew')
      .select(`
        *,
        subscription:subscription_id (
          subscription_name,
          subscription_type,
          subscription_bill
        )
      `)
      .eq('subscription_renew_id', renewal_id)
      .eq('subscription_renewed_by', session.userId)
      .single()

    if (renewalError || !renewal) {
      return NextResponse.json(
        { success: false, error: 'Renewal not found' },
        { status: 404 }
      )
    }

    if (!renewal.subscription_is_cancelled) {
      return NextResponse.json(
        { success: false, error: 'Renewal is already active' },
        { status: 400 }
      )
    }

    // Calculate new expiry date based on the provided renewed date
    const renewedDate = new Date(renewed_at)
    const expiredAt = new Date(renewedDate)
    const multiplier = months_advance || 1

    // Calculate expiry based on subscription type and advance months
    switch (renewal.subscription.subscription_type) {
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

    // Update the renewal
    const { data: updatedRenewal, error: updateError } = await supabase
      .from('tblsubscriptionrenew')
      .update({
        subscription_renewed_at: renewedDate.toISOString(),
        subscription_expired_at: expiredAt.toISOString(),
        subscription_is_cancelled: false,
        months_paid_advance: multiplier,
      })
      .eq('subscription_renew_id', renewal_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error reactivating renewal:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to reactivate renewal' },
        { status: 500 }
      )
    }

    // Calculate total bill
    const totalBill = Number(renewal.subscription.subscription_bill) * multiplier

    // Create log entry
    await supabase.from('tblsubscriptionlog').insert({
      subscription_renew_id: renewal_id,
      subscription_total_bill: totalBill,
      subscription_action_by: session.userId,
      note: `Reactivated ${renewal.subscription.subscription_name} with renewed date ${formatDate(renewedDate.toISOString())} for ${multiplier} ${renewal.subscription.subscription_type.toLowerCase()}(s)`,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedRenewal,
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
    console.error('Error in POST /api/renewals/reactivate:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}
