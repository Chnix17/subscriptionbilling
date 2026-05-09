import { NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'
import bcrypt from 'bcryptjs'

export async function PUT(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // Get the session
    const session = await requireAuth()

    // Get the current user data including password
    const { data: user, error: userError } = await supabase
      .from('tbluser')
      .select('user_password')
      .eq('user_id', session.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Verify the current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.user_password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update the password
    const { error: updateError } = await supabase
      .from('tbluser')
      .update({
        user_password: hashedNewPassword,
      })
      .eq('user_id', session.userId)

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
