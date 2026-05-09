import { NextResponse } from 'next/server'
import { getSession, requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch fresh user data
    const { data: user, error } = await supabase
      .from('tbluser')
      .select('user_id, user_fullname, user_username, user_role_id, user_is_active')
      .eq('user_id', session.userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
