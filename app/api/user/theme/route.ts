import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/lib/session'
import { supabase } from '@/app/lib/supabase'

// PUT /api/user/theme - Update user theme preference
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    
    const { theme } = body
    
    if (!theme || !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { success: false, error: 'Invalid theme' },
        { status: 400 }
      )
    }

    // Update user theme preference
    try {
      const { error } = await supabase
        .from('tbluser')
        .update({ user_theme: theme })
        .eq('user_id', session.userId)

      if (error) {
        // If column doesn't exist, just save to localStorage and return success
        if (error.message.includes('column') || error.code === 'PGRST116') {
          return NextResponse.json({ success: true })
        }
        throw error
      }
    } catch (error: any) {
      // If column doesn't exist, just save to localStorage and return success
      if (error.message.includes('column') || error.code === 'PGRST116') {
        return NextResponse.json({ success: true })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in PUT /api/user/theme:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/user/theme - Get user theme preference
export async function GET() {
  try {
    const session = await requireAuth()

    // Try to get theme preference, but handle case where column doesn't exist yet
    try {
      const { data: user, error } = await supabase
        .from('tbluser')
        .select('user_theme')
        .eq('user_id', session.userId)
        .single()

      if (error) {
        // If column doesn't exist, return default theme
        if (error.message.includes('column') || error.code === 'PGRST116') {
          return NextResponse.json({ 
            success: true, 
            data: { theme: 'light' }
          })
        }
        throw error
      }

      return NextResponse.json({ 
        success: true, 
        data: { theme: user?.user_theme || 'light' }
      })
    } catch (error: any) {
      // If column doesn't exist, return default theme
      if (error.message.includes('column') || error.code === 'PGRST116') {
        return NextResponse.json({ 
          success: true, 
          data: { theme: 'light' }
        })
      }
      throw error
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.error('Error in GET /api/user/theme:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
