'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export default function OfficeLoginPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'login' | 'verify'>('login')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<string | null>(null)
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null)
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'none' | 'request' | 'reset'>('none')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

  const resetOtpState = () => {
    setOtp('')
    setOtpError(null)
    setInfoMessage(null)
    setResendStatus(null)
    setOtpExpiresAt(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/office/auth/login', { 
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      const j = await res.json()
      if (j.success) {
        window.location.href = '/office/analytics'
        return
      }

      if (j.requireOtp) {
        setStep('verify')
        setInfoMessage(j.message || 'We have sent a verification code to your email.')
        setOtpExpiresAt(j.otpExpiresAt || null)
        setOtp('')
        setOtpError(null)
        setResendStatus(null)
        setError(null)
        return
      }

      throw new Error(j.error || 'Invalid credentials')
    } catch (err:any) { 
      setError(err.message || 'Login failed. Please try again.')
    } finally { 
      setLoading(false) 
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setOtpError(null)
    setResendStatus(null)

    if (!otp || otp.length < 4) {
      setOtpError('Please enter the OTP sent to your email')
      return
    }

    try {
      setOtpLoading(true)
      const res = await fetch('/api/office/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
        credentials: 'include',
      })
      const j = await res.json()
      if (!j.success) {
        throw new Error(j.error || 'Invalid or expired OTP')
      }
      window.location.href = '/office/analytics'
    } catch (err: any) {
      setOtpError(err.message || 'Failed to verify OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendStatus(null)
    setOtpError(null)

    try {
      setOtpLoading(true)
      const res = await fetch('/api/office/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const j = await res.json()
      if (!j.success) {
        throw new Error(j.error || 'Unable to resend OTP right now')
      }
      setResendStatus('A new OTP has been sent to your email.')
      setOtp('')
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend OTP. Please wait a moment and try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setStep('login')
    resetOtpState()
    setError(null)
    setLoading(false)
    setForgotPasswordStep('none')
    setResetCode('')
    setNewPassword('')
    setResetError(null)
  }

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setResetError('Please enter a valid email address')
      return
    }

    setResetLoading(true)
    setResetError(null)

    try {
      const res = await fetch('/api/office/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const j = await res.json()
      if (j.success) {
        setForgotPasswordStep('reset')
        setResetError(null)
      } else {
        setResetError(j.error || 'Failed to send reset code')
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to request password reset')
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!resetCode || resetCode.length < 4) {
      setResetError('Please enter the reset code sent to your email')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long')
      return
    }

    setResetLoading(true)
    setResetError(null)

    try {
      const res = await fetch('/api/mib/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode, password: newPassword }),
      })
      const j = await res.json()
      if (j.success) {
        setResetError(null)
        setForgotPasswordStep('none')
        setResetCode('')
        setNewPassword('')
        setError('Password reset successful. Please login with your new password.')
      } else {
        setResetError(j.error || 'Failed to reset password')
      }
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('office.login.title')}</h1>
          <p className="text-gray-600">{t('office.login.subtitle')}</p>
        </div>
        
        {step === 'login' && forgotPasswordStep === 'none' && error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        {step === 'login' && forgotPasswordStep === 'none' ? (
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('office.login.email')}</label>
              <input 
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="name@office.com"
                type="email"
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('office.login.password')}</label>
              <input 
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="Enter your password"
                type="password"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">{t('office.login.password.hint')}</p>
            </div>
            <button 
              type="submit"
              disabled={loading || !email || !password} 
              className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              {loading ? '…' : t('office.login.submit')}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setForgotPasswordStep('request')}
                className="text-sm text-orange-600 font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>
        ) : forgotPasswordStep === 'request' ? (
          <div className="space-y-5">
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800">
              Enter your email address and we'll send you a reset code.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="name@office.com"
                type="email"
                required
                disabled={resetLoading}
                autoFocus
              />
            </div>
            {resetError && <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">{resetError}</div>}
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading || !email}
              className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              {resetLoading ? 'Sending…' : 'Send Reset Code'}
            </button>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-sm text-gray-600 hover:underline"
            >
              Back to login
            </button>
          </div>
        ) : forgotPasswordStep === 'reset' ? (
          <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800">
              We've sent a reset code to {email}. Enter it below along with your new password.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reset Code</label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-center tracking-widest text-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                required
                disabled={resetLoading}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input 
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors" 
                value={newPassword} 
                onChange={e=>setNewPassword(e.target.value)} 
                placeholder="Enter new password"
                type="password"
                required
                disabled={resetLoading}
                minLength={6}
              />
            </div>
            {resetError && <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">{resetError}</div>}
            <button
              type="submit"
              disabled={resetLoading || !resetCode || !newPassword}
              className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              {resetLoading ? 'Resetting…' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-sm text-gray-600 hover:underline"
            >
              Back to login
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800">
              {infoMessage || `We sent a verification code to ${email}. Enter it below to confirm your account.`}
              {otpExpiresAt && (
                <div className="text-xs text-orange-600 mt-1">
                  Code expires at {new Date(otpExpiresAt).toLocaleTimeString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-center tracking-widest text-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                disabled={otpLoading}
              />
            </div>

            {otpError && <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">{otpError}</div>}
            {resendStatus && <div className="p-3 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm">{resendStatus}</div>}

            <button
              type="submit"
              disabled={otpLoading || otp.length < 4}
              className="w-full px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              {otpLoading ? 'Verifying…' : 'Verify & Sign In'}
            </button>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpLoading}
                className="text-orange-600 font-semibold hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-gray-500 hover:underline"
              >
                Use a different account
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Secure access for authorized office personnel only
          </p>
        </div>
      </div>
    </div>
  )
}


