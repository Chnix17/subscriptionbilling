import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// GET /api/notifications - Get notifications for logged-in user
export async function GET() {
  try {
    const session = await requireAuth()

    const { data: notifications, error } = await supabase
      .from('tblnotifications')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a notification (for internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const { notification_title, notification_message, notification_type } = body

    if (!notification_title || !notification_message || !notification_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: notification, error } = await supabase
      .from('tblnotifications')
      .insert({
        user_id: session.userId,
        notification_title,
        notification_message,
        notification_type,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create notification' },
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
    console.error('Error in POST /api/notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
