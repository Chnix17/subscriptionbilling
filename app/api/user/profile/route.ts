import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

export async function PUT(request: Request) {
  try {
    const { user_fullname, user_username } = await request.json()

    // Get the session
    const session = await requireAuth()

    // Check if username is already taken by another user
    const { data: existingUser, error: usernameCheckError } = await supabase
      .from('tbluser')
      .select('user_id')
      .eq('user_username', user_username)
      .neq('user_id', session.userId)
      .single()

    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, message: 'Database error' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('tbluser')
      .update({
        user_fullname,
        user_username,
      })
      .eq('user_id', session.userId)
      .select('user_id, user_fullname, user_username, user_role_id, user_is_active, user_theme')
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
