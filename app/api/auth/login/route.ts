import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/app/lib/auth'
import { createSession } from '@/app/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const result = await loginUser({ username, password })

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session
    await createSession(
      result.user.user_id,
      result.user.user_username,
      result.user.user_role_id
    )

    return NextResponse.json({
      success: true,
      data: {
        user_id: result.user.user_id,
        user_fullname: result.user.user_fullname,
        user_username: result.user.user_username,
        user_role_id: result.user.user_role_id,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
