'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle, User, LogIn, Shield, Clock, FileText, Target, TrendingUp, Award, BarChart3, Newspaper, Building2, Briefcase, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import Image from 'next/image'
import Link from 'next/link'
import TicketForm from '@/components/mib/TicketForm'

type AuthMode = 'register' | 'verify' | 'login' | 'forgot' | 'reset' | 'authenticated'

export default function MakeItBetterPortal() {
  const { t } = useLanguage()
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [pendingMobile, setPendingMobile] = useState<string | null>(null)
  const [pendingOtpExpiresAt, setPendingOtpExpiresAt] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState<string | null>(null)
  const authTitleMap: Record<AuthMode, string> = {
    register: 'Create Account',
    verify: 'Verify Your Email',
    login: 'Login to Your Account',
    forgot: 'Forgot Password',
    reset: 'Reset Password',
    authenticated: '',
  }

  const handleRegistered = (payload: { name: string; email: string; mobile?: string; otpExpiresAt?: string }) => {
    setPendingEmail(payload.email)
    setPendingName(payload.name)
    setPendingMobile(payload.mobile || null)
    setPendingOtpExpiresAt(payload.otpExpiresAt || null)
    setAuthMode('verify')
  }

  const handleVerificationComplete = () => {
    setPendingOtpExpiresAt(null)
    setAuthMode('login')
  }

  const handleResendVerification = (expiresAt?: string | null) => {
    if (expiresAt) setPendingOtpExpiresAt(expiresAt)
  }

  const handleForgotSubmitted = (email: string) => {
    setResetEmail(email)
    setAuthMode('reset')
  }

  const handleResetComplete = () => {
    setAuthMode('login')
  }

  const handleLoginSuccess = (name: string, email: string, phone?: string) => {
    try {
      localStorage.setItem('mibUserName', name)
      if (email) localStorage.setItem('mibUserEmail', email)
      if (phone) localStorage.setItem('mibUserMobile', phone)
    } catch {}
    setPendingEmail(null)
    setPendingOtpExpiresAt(null)
    setResetEmail(null)
    setUser({ name, email })
    setAuthMode('authenticated')
  }

  useEffect(() => {
    try {
      const n = localStorage.getItem('mibUserName')
      if (n && !user) {
        const e = localStorage.getItem('mibUserEmail') || ''
        if (e) {
          setUser({ name: n, email: e })
          setAuthMode('authenticated')
        }
      }
    } catch {}
    setMounted(true)
  }, [user])

  const stats = [
    { label: 'Issues Resolved', value: '1,180', icon: CheckCircle, color: 'text-green-600' },
    { label: 'In Progress', value: '45', icon: Clock, color: 'text-orange-600' },
    { label: 'Response Rate', value: '98%', icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Total Complaints', value: '1,245', icon: FileText, color: 'text-orange-600' },
  ]

  if (!mounted || authMode !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('nav.mib')}</h1>
              <p className="text-xl text-orange-100 max-w-3xl mx-auto">{/* Keep short; can add TE copy later */}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-orange-50 to-orange-50 rounded-xl p-6 text-center border border-orange-100"
                >
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-3xl font-bold mb-2 text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {['register', 'login'].includes(authMode) && (
            <div className="flex gap-3 mb-8 max-w-md mx-auto" suppressHydrationWarning>
              <button
                suppressHydrationWarning
                onClick={() => {
                  setAuthMode('register')
                  setPendingEmail(null)
                  setPendingOtpExpiresAt(null)
                }}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                  authMode === 'register'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline-block mr-2" />
                Create Account
              </button>
              <button
                suppressHydrationWarning
                onClick={() => {
                  setAuthMode('login')
                }}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                  authMode === 'login'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <LogIn className="h-4 w-4 inline-block mr-2" />
                {t('office.login.submit')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Auth Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {authTitleMap[authMode]}
              </h2>

              {authMode === 'register' && (
                <RegisterForm
                  onRegistered={handleRegistered}
                  onSwitchToLogin={() => setAuthMode('login')}
                />
              )}

              {authMode === 'verify' && pendingEmail && (
                <VerifyForm
                  email={pendingEmail}
                  name={pendingName || undefined}
                  expiresAt={pendingOtpExpiresAt || undefined}
                  onVerified={handleVerificationComplete}
                  onResend={handleResendVerification}
                  onChangeEmail={() => setAuthMode('register')}
                  onGoToLogin={() => setAuthMode('login')}
                />
              )}

              {authMode === 'verify' && !pendingEmail && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    We couldn&apos;t find your registration details. Please register again to receive a verification code.
                  </p>
                  <button
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    onClick={() => setAuthMode('register')}
                  >
                    Go to Registration
                  </button>
                </div>
              )}

              {authMode === 'login' && (
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onForgot={() => {
                    setResetEmail(null)
                    setAuthMode('forgot')
                  }}
                  onRequireVerification={async (email) => {
                    setPendingEmail(email)
                    setAuthMode('verify')
                    // Automatically send OTP when email verification is required
                    try {
                      const res = await fetch('/api/mib/auth/resend-verification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                      })
                      const json = await res.json()
                      if (json.success) {
                        if (json.data?.otpExpiresAt) {
                          setPendingOtpExpiresAt(json.data.otpExpiresAt)
                        }
                      } else {
                        // If OTP sending fails, still show verification form but user can manually resend
                        console.warn('Failed to automatically send verification code:', json.error)
                      }
                    } catch (err) {
                      // Network or other errors - still show verification form
                      console.error('Failed to send verification code:', err)
                    }
                  }}
                  initialEmail={pendingEmail || resetEmail || ''}
                  onSwitchToRegister={() => setAuthMode('register')}
                />
              )}

              {authMode === 'forgot' && (
                <ForgotPasswordForm
                  onSubmitted={handleForgotSubmitted}
                  onBackToLogin={() => setAuthMode('login')}
                />
              )}

              {authMode === 'reset' && (
                <ResetPasswordForm
                  email={resetEmail || pendingEmail || ''}
                  onComplete={handleResetComplete}
                  onBackToLogin={() => setAuthMode('login')}
                />
              )}

              <div className="mt-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    Registration ensures only serious inquiries are submitted and allows you to track grievance status in real-time.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                    <FileText className="h-6 w-6 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-orange-600">Submit Grievance</div>
                      <div className="text-sm text-gray-600">File a complaint or inquiry</div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </Link>

                  <Link href="/initiatives" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                    <Target className="h-6 w-6 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-orange-600">View BJPVarma Impact</div>
                      <div className="text-sm text-gray-600">Track development projects</div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </Link>

                  <Link href="/press-release" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors group">
                    <Newspaper className="h-6 w-6 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-orange-600">Press Releases</div>
                      <div className="text-sm text-gray-600">Latest updates and announcements</div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Recent Activities */}
              <RecentActivities />
            </motion.div>
          </div>

          {/* Features Section */}
          <FeaturesSection />
        </div>
      </div>
    )
  }

  return (
    <div suppressHydrationWarning>
      <TicketForm />
    </div>
  )
}

function RegisterForm({
  onRegistered,
  onSwitchToLogin,
}: {
  onRegistered: (payload: { name: string; email: string; mobile?: string; otpExpiresAt?: string }) => void
  onSwitchToLogin: () => void
}) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', marketingOptIn: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/mib/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: formData.phone.trim(),
          password: formData.password,
          marketingOptIn: formData.marketingOptIn,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Registration failed')
        return
      }
      onRegistered({
        name: json.data.name,
        email: json.data.email,
        mobile: json.data.mobile,
        otpExpiresAt: json.data.otpExpiresAt ?? undefined,
      })
    } catch (err: any) {
      setError(err?.message || 'Registration error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning autoComplete="off">
      <input
        type="text"
        required
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="off"
        suppressHydrationWarning
      />
      <input
        type="email"
        required
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="off"
        suppressHydrationWarning
      />
      <input
        type="tel"
        required
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="off"
        suppressHydrationWarning
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="new-password"
        suppressHydrationWarning
      />
      <label className="flex items-start gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={formData.marketingOptIn}
          onChange={(e) => setFormData({ ...formData, marketingOptIn: e.target.checked })}
          className="mt-1"
        />
        <span>
          Keep me informed about portal updates and resolution progress via email.
        </span>
      </label>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        suppressHydrationWarning
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p className="text-sm text-gray-600 text-center">
        Already have an account?{' '}
        <button type="button" className="text-orange-600 font-semibold hover:underline" onClick={onSwitchToLogin}>
          Login
        </button>
      </p>
    </form>
  )
}

function LoginForm({
  onSuccess,
  onForgot,
  onRequireVerification,
  initialEmail,
  onSwitchToRegister,
}: {
  onSuccess: (name: string, email: string, phone?: string) => void
  onForgot: () => void
  onRequireVerification: (email: string) => void
  initialEmail?: string
  onSwitchToRegister: () => void
}) {
  const [formData, setFormData] = useState({ email: initialEmail || '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialEmail && initialEmail !== formData.email) {
      setFormData((prev) => ({ ...prev, email: initialEmail }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/mib/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), password: formData.password }),
      })
      const json = await res.json()
      if (!json.success) {
        if (json.error === 'Email not verified') {
          onRequireVerification(formData.email.trim().toLowerCase())
          return
        }
        setError(json.error || 'Login failed')
        return
      }
      onSuccess(json.data.name, json.data.email, json.data.mobile)
    } catch (err: any) {
      setError(err?.message || 'Login error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning autoComplete="off">
      <input
        type="email"
        required
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="email"
        suppressHydrationWarning
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="current-password"
        suppressHydrationWarning
      />
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
      <button
        type="submit"
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        suppressHydrationWarning
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
        <button type="button" className="text-orange-600 font-semibold hover:underline text-left" onClick={onForgot} suppressHydrationWarning>
          Forgot password?
        </button>
        <button type="button" className="text-orange-600 font-semibold hover:underline text-left" onClick={onSwitchToRegister} suppressHydrationWarning>
          Create new account
        </button>
      </div>
    </form>
  )
}

function VerifyForm({
  email,
  name,
  expiresAt,
  onVerified,
  onResend,
  onChangeEmail,
  onGoToLogin,
}: {
  email: string
  name?: string
  expiresAt?: string
  onVerified: () => void
  onResend: (expiresAt?: string | null) => void
  onChangeEmail: () => void
  onGoToLogin: () => void
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    let timer: any
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => Math.max(prev - 1, 0)), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  useEffect(() => {
    if (expiresAt) {
      const ms = new Date(expiresAt).getTime() - Date.now()
      if (ms > 0) {
        setResendCooldown(Math.round(ms / 1000))
      }
    }
  }, [expiresAt])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/mib/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Verification failed')
        return
      }
      setMessage('Email verified successfully! You can now login.')
      setTimeout(() => {
        onVerified()
      }, 800)
    } catch (err: any) {
      setError(err?.message || 'Verification error')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/mib/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Unable to resend code')
        return
      }
      setMessage('A new verification code has been sent to your email.')
      const newExpiry = json.data?.otpExpiresAt
      if (newExpiry) {
        onResend(newExpiry)
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to resend code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="text-sm text-gray-600 bg-orange-50 border border-orange-200 rounded-md px-4 py-3">
        <p className="font-medium text-orange-700">We’ve sent a verification code to {email}.</p>
        <p>Enter the 6-digit code to activate your account.</p>
        {name && <p className="mt-2 text-gray-600">Hi {name.split(' ')[0]}, welcome aboard!</p>}
      </div>
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        pattern="[0-9]*"
        required
        placeholder="Enter 6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
      />
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
      {message && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">{message}</div>}
      <button
        type="submit"
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify Email'}
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
        <button
          type="button"
          className="text-orange-600 font-semibold hover:underline text-left disabled:opacity-50"
          onClick={handleResend}
          disabled={loading || resendCooldown > 0}
        >
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
        </button>
        <div className="flex gap-4">
          <button type="button" className="hover:underline" onClick={onChangeEmail}>
            Use different email
          </button>
          <button type="button" className="hover:underline" onClick={onGoToLogin}>
            Go to login
          </button>
        </div>
      </div>
    </form>
  )
}

function ForgotPasswordForm({
  onSubmitted,
  onBackToLogin,
}: {
  onSubmitted: (email: string) => void
  onBackToLogin: () => void
}) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/mib/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Unable to process request')
        return
      }
      setMessage('A password reset code has been sent to your email.')
      onSubmitted(email.trim().toLowerCase())
    } catch (err: any) {
      setError(err?.message || 'Unable to process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter your registered email address. We will send a password reset code to help you regain access.
      </p>
      <input
        type="email"
        required
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="email"
        suppressHydrationWarning
      />
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
      {message && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">{message}</div>}
      <button
        type="submit"
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Reset Code'}
      </button>
      <button type="button" className="text-sm text-orange-600 font-semibold hover:underline" onClick={onBackToLogin}>
        Back to login
      </button>
    </form>
  )
}

function ResetPasswordForm({
  email,
  onComplete,
  onBackToLogin,
}: {
  email: string
  onComplete: () => void
  onBackToLogin: () => void
}) {
  const [formData, setFormData] = useState({ email: email || '', code: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (email && email !== formData.email) {
      setFormData((prev) => ({ ...prev, email }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/mib/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          code: formData.code.trim(),
          password: formData.password,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Unable to reset password')
        return
      }
      setMessage('Password updated! You can now login with your new password.')
      setTimeout(() => {
        onComplete()
      }, 800)
    } catch (err: any) {
      setError(err?.message || 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter the reset code sent to your email along with your new password.
      </p>
      <input
        type="email"
        required
        placeholder="Email Address"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="email"
        suppressHydrationWarning
      />
      <input
        type="text"
        required
        placeholder="Reset Code"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="one-time-code"
        suppressHydrationWarning
      />
      <input
        type="password"
        required
        placeholder="New Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        autoComplete="new-password"
        suppressHydrationWarning
      />
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
      {message && <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">{message}</div>}
      <button
        type="submit"
        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
      <button type="button" className="text-sm text-orange-600 font-semibold hover:underline" onClick={onBackToLogin}>
        Back to login
      </button>
    </form>
  )
}

function RecentActivities() {
  const activities = [
    { title: 'New initiative launched', type: 'initiative', date: '2 days ago' },
    { title: 'Grievance resolved', type: 'grievance', date: '3 days ago' },
    { title: 'Press release published', type: 'news', date: '5 days ago' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h3>
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-orange-600"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{activity.title}</div>
              <div className="text-xs text-gray-500">{activity.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeaturesSection() {
  const features = [
    { icon: Target, title: 'Quick Resolution', description: 'Get fast responses and track your complaint in real-time' },
    { icon: CheckCircle, title: '24/7 Support', description: 'Round-the-clock assistance for urgent matters' },
    { icon: Award, title: 'Verified System', description: 'Secure and transparent grievance management' },
    { icon: BarChart3, title: 'Status Tracking', description: 'Monitor your complaint progress from submission to resolution' },
  ]

  return (
    <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Make it Better Portal?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={feature.title} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="bg-orange-100 p-4 rounded-full mb-4">
              <feature.icon className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function GrievanceForm({ user }: { user: { name: string; email: string } }) {
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
    location: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const categories = [
    'Infrastructure', 'Public Works', 'Healthcare', 'Education', 'Sanitation', 'Security', 'Other'
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl p-12 text-center max-w-md"
        >
          <CheckCircle className="h-16 w-16 mx-auto mb-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Grievance Submitted Successfully!</h2>
          <p className="text-gray-600 mb-8">
            Your complaint has been registered. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Submit Another Grievance
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Submit Your Grievance</h2>
            <p className="text-xl text-orange-100">Welcome, {user.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-orange-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">Grievance Form</h2>
            <p className="text-orange-100">Fill out the form below to submit your concern</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="City, State"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                placeholder="Please provide detailed information about your grievance..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              suppressHydrationWarning
            >
              <Send className="h-5 w-5" />
              Submit Grievance
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
