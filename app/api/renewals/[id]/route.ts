import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/renewals/[id] - Get single renewal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const { data: renewal, error } = await supabase
      .from('tblsubscriptionrenew')
      .select(`
        *,
        subscription:tblsubscriptionname(*)
      `)
      .eq('subscription_renew_id', id)
      .eq('subscription_renewed_by', session.userId)
      .single()

    if (error || !renewal) {
      return NextResponse.json(
        { success: false, error: 'Renewal not found' },
        { status: 404 }
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
    console.error('Error in GET /api/renewals/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/renewals/[id] - Delete renewal
export async function DELETE(
  request: NextRequest,
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

    const { error } = await supabase
      .from('tblsubscriptionrenew')
      .delete()
      .eq('subscription_renew_id', id)

    if (error) {
      console.error('Error deleting renewal:', error)
      return NextResponse.json(
        { success: false, error: `Failed to delete renewal: ${error.message}` },
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
    console.error('Error in DELETE /api/renewals/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
