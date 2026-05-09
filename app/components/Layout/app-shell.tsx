'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Sidebar } from './sidebar'
import { ROUTES } from '@/app/lib/constants'
import { useRouter } from 'next/navigation'

interface AppShellProps {
  children: ReactNode
}

interface User {
  user_id: number
  user_fullname: string
  user_username: string
  user_role_id: number
}

export function AppShell({ children }: AppShellProps) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar user={user} />
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
