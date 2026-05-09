'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    user_id: number
    user_fullname: string
    user_username: string
  }
  onUpdate: (updatedUser: any) => void
}

export function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    user_fullname: user.user_fullname,
    user_username: user.user_username,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Profile updated successfully!')
        onUpdate(result.data)
        setTimeout(() => {
          setSuccess('')
        }, 3000)
      } else {
        setError(result.message || 'Failed to update profile')
      }
    } catch (error) {
      setError('An error occurred while updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Password updated successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTimeout(() => {
          setSuccess('')
        }, 3000)
      } else {
        setError(result.message || 'Failed to update password')
      }
    } catch (error) {
      setError('An error occurred while updating password')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
              Profile Information
            </h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.user_fullname}
                  onChange={(e) => setFormData({ ...formData, user_fullname: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.user_username}
                  onChange={(e) => setFormData({ ...formData, user_username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
              Change Password
            </h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
