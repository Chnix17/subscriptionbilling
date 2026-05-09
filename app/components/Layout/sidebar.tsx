'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROUTES } from '@/app/lib/constants'
import { ThemeToggle } from '@/app/components/UI/theme-toggle'
import { ProfileModal } from '@/app/components/UI/profile-modal'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    href: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: ROUTES.SUBSCRIPTIONS,
    label: 'Subscriptions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    href: ROUTES.RENEWALS,
    label: 'Renewals',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    href: ROUTES.ANALYTICS,
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: ROUTES.NOTIFICATIONS,
    label: 'Notifications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    href: ROUTES.LOGS,
    label: 'Activity Logs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  user: {
    user_id: number
    user_fullname: string
    user_username: string
  } | null
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = ROUTES.LOGIN
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleProfileUpdate = (updatedUser: any) => {
    // Update the user data in the parent component if needed
    // For now, we'll just close the modal
    setIsProfileModalOpen(false)
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Billing
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
            title="Edit Profile"
          >
            {user?.user_fullname?.charAt(0).toUpperCase() || 'U'}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
              {user?.user_fullname || 'User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.user_username || ''}
            </p>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={{
            user_id: user.user_id,
            user_fullname: user.user_fullname,
            user_username: user.user_username,
          }}
          onUpdate={handleProfileUpdate}
        />
      )}
    </aside>
  )
}
