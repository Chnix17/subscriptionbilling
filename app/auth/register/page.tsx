'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/app/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const result = await registerUser({
      fullname: formData.fullname,
      username: formData.username,
      password: formData.password,
    })

    if (result.success) {
      router.push('/auth/login')
    } else {
      setError(result.error || 'Registration failed')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create account</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Join us today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <input
                id="fullname"
                type="text"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                placeholder="Choose a username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-6">
          Billing System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
