'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/app/lib/constants'

interface User {
  user_id: number
  user_fullname: string
  user_username: string
  user_role_id: number
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setUser(result.data)
          } else {
            router.push(ROUTES.LOGIN)
          }
        } else {
          router.push(ROUTES.LOGIN)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push(ROUTES.LOGIN)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push(ROUTES.LOGIN)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return { user, loading, logout }
}
