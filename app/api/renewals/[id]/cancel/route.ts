import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// PUT /api/renewals/[id]/cancel - Cancel a renewal
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Check if renewal exists and belongs to user
    const { data: existing } = await supabase
      .from('tblsubscriptionrenew')
      .select('subscription_renew_id')
      .eq('subscription_renew_id', id)
      .eq('subscription_renewed_by', session.userId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Renewal not found' },
        { status: 404 }
      )
    }

    const { data: renewal, error } = await supabase
      .from('tblsubscriptionrenew')
      .update({ subscription_is_cancelled: true })
      .eq('subscription_renew_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error cancelling renewal:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to cancel renewal' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: renewal })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in PUT /api/renewals/[id]/cancel:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
