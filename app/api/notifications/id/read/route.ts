import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

    // Check if notification exists and belongs to user
    const { data: existing } = await supabase
      .from('tblnotifications')
      .select('notification_id')
      .eq('notification_id', id)
      .eq('user_id', session.userId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    const { data: notification, error } = await supabase
      .from('tblnotifications')
      .update({ is_read: true })
      .eq('notification_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error marking notification as read:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in PUT /api/notifications/[id]/read:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
