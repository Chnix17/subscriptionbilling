import { cookies } from 'next/headers'
import { JWTPayload, signJWT, verifyJWT } from './jwt'
import { supabase } from './supabase'

const SESSION_COOKIE_NAME = 'session_token'
const SESSION_DURATION_DAYS = 7

export type Session = {
  session_id: string
  user_id: number
  token: string
  expires_at: string
  created_at: string
}

export async function createSession(userId: number, username: string, roleId: number): Promise<string> {
  const sessionId = crypto.randomUUID()
  
  const payload: JWTPayload = {
    userId,
    username,
    roleId,
    sessionId,
  }
  
  const token = await signJWT(payload)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)
  
  // Store session in database
  const { error } = await supabase
    .from('tblsessions')
    .insert({
      session_id: sessionId,
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString(),
    })
  
  if (error) {
    console.error('Supabase session insert error:', error)
    throw new Error(`Failed to create session: ${error.message}`)
  }
  
  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    path: '/',
  })
  
  return token
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) {
    return null
  }
  
  const payload = await verifyJWT(token)
  if (!payload) {
    return null
  }
  
  // Verify session exists and is not expired in database
  const { data: session } = await supabase
    .from('tblsessions')
    .select('*')
    .eq('session_id', payload.sessionId)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (!session) {
    return null
  }
  
  return payload
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (token) {
    const payload = await verifyJWT(token)
    if (payload) {
      // Delete session from database
      await supabase
        .from('tblsessions')
        .delete()
        .eq('session_id', payload.sessionId)
    }
  }
  
  // Clear cookie
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
