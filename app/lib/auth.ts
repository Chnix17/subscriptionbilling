import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export type LoginCredentials = {
  username: string
  password: string
}

export type RegisterCredentials = {
  fullname: string
  username: string
  password: string
}

export async function loginUser(credentials: LoginCredentials) {
  const { data: user, error } = await supabase
    .from('tbluser')
    .select('*')
    .eq('user_username', credentials.username)
    .eq('user_is_active', true)
    .single()

  if (error || !user) {
    return { success: false, error: 'Invalid username or password' }
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, user.user_password)

  if (!isPasswordValid) {
    return { success: false, error: 'Invalid username or password' }
  }

  return { success: true, user }
}

export async function registerUser(credentials: RegisterCredentials) {
  // Check if username already exists
  const { data: existingUser } = await supabase
    .from('tbluser')
    .select('user_id')
    .eq('user_username', credentials.username)
    .single()

  if (existingUser) {
    return { success: false, error: 'Username already exists' }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(credentials.password, 10)

  // Insert new user with role_id = 2 (User role)
  const { data: newUser, error } = await supabase
    .from('tbluser')
    .insert({
      user_fullname: credentials.fullname,
      user_username: credentials.username,
      user_password: hashedPassword,
      user_role_id: 2, // User role as requested
      user_is_active: true,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: 'Failed to create account' }
  }

  return { success: true, user: newUser }
}
