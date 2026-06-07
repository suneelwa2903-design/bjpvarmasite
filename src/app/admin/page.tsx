'use client'

import { useState, useEffect, useCallback } from 'react'
import { LogIn, Shield, AlertCircle, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'forgot-request' | 'forgot-verify' | 'forgot-success'

export default function AdminLogin() {
  const [mode, setMode] = useState<Mode>('login')
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [forgotUsername, setForgotUsername] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/auth', { credentials: 'include' })
      const data = await response.json()
      if (data.authenticated) {
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }, [router])

  useEffect(() => {
    setIsClient(true)
    checkAuthStatus()
  }, [checkAuthStatus])

  const resetState = () => {
    setError('')
    setInfo('')
    setForgotUsername('')
    setResetCode('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        credentials: 'include',
      })
      const data = await response.json()
      if (response.ok && data.success) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setInfo('')
    try {
      const response = await fetch('/api/admin/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUsername }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        // Always show this message, even if the username doesn't exist (anti-enumeration)
        setInfo('If an account exists for that email, a 6-digit code has been sent. Check your inbox (and spam folder).')
        setMode('forgot-verify')
      } else {
        setError(data.error || 'Unable to process reset request')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername,
          code: resetCode,
          password: newPassword,
        }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setMode('forgot-success')
      } else {
        setError(data.error || 'Reset failed')
      }
    } catch (error) {
      console.error('Reset error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">
            {mode === 'login' && 'Login to manage website content'}
            {mode === 'forgot-request' && 'Reset your password'}
            {mode === 'forgot-verify' && 'Enter the code from your email'}
            {mode === 'forgot-success' && 'Password updated'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {info && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-700 text-sm">{info}</span>
          </div>
        )}

        {/* ------------------------- LOGIN ------------------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                required
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Enter username"
                disabled={isLoading}
                suppressHydrationWarning={true}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Enter password"
                disabled={isLoading}
                suppressHydrationWarning={true}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              suppressHydrationWarning={true}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Login
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  resetState()
                  setMode('forgot-request')
                  setForgotUsername(loginData.username)
                }}
                className="text-sm text-orange-700 hover:text-orange-800 hover:underline inline-flex items-center gap-1"
              >
                <KeyRound className="h-4 w-4" />
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* ------------------------- FORGOT — REQUEST ------------------------- */}
        {mode === 'forgot-request' && (
          <form onSubmit={handleForgotRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin email (username)
              </label>
              <input
                type="email"
                required
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="your-email@gmail.com"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                A 6-digit code will be emailed to this address (if it matches an admin account).
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !forgotUsername.trim()}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Sending…' : 'Send reset code'}
            </button>

            <button
              type="button"
              onClick={() => {
                resetState()
                setMode('login')
              }}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900 inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          </form>
        )}

        {/* ------------------------- FORGOT — VERIFY + NEW PASSWORD ------------------------- */}
        {mode === 'forgot-verify' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account email</label>
              <input
                type="email"
                value={forgotUsername}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-lg text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                6-digit code (from email)
              </label>
              <input
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors tracking-widest text-center text-lg font-mono"
                placeholder="000000"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Codes expire after 15 minutes.{' '}
                <button
                  type="button"
                  onClick={() => {
                    resetState()
                    setMode('forgot-request')
                  }}
                  className="underline hover:text-gray-700"
                >
                  Didn&rsquo;t get a code? Resend
                </button>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New password</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="At least 8 characters"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm new password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="Repeat the password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || resetCode.length !== 6}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Updating…' : 'Reset password'}
            </button>

            <button
              type="button"
              onClick={() => {
                resetState()
                setMode('login')
              }}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900 inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel and go back to login
            </button>
          </form>
        )}

        {/* ------------------------- FORGOT — SUCCESS ------------------------- */}
        {mode === 'forgot-success' && (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-700">
              Your password has been updated. You can now log in with the new password.
            </p>
            <button
              type="button"
              onClick={() => {
                setLoginData({ username: forgotUsername, password: '' })
                resetState()
                setMode('login')
              }}
              className="inline-flex items-center justify-center w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors gap-2"
            >
              <LogIn className="h-5 w-5" />
              Go to login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
