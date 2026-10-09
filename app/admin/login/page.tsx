'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
} from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    // Redirect to admin dashboard
    setTimeout(() => {
      router.push('/admin/dashboard')
    }, 600)
  }

  return (
    <main className="relative flex h-screen max-h-screen w-full overflow-hidden bg-gradient-to-br from-[#07152f] via-[#0a1e42] to-[#07152f] text-white">
      {/* Ambient background glow orbs (Identical to Broker Login) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 size-[450px] rounded-full bg-blue-600/25 blur-[120px] animate-pulse" />
        <div
          className="absolute -bottom-32 -right-32 size-[450px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col justify-between px-4 py-2 sm:px-8 sm:py-3">
        {/* Top Header Bar */}
        <header className="flex shrink-0 items-center justify-between">
          <Link href="/" className="inline-flex items-center transition-transform hover:scale-[1.02]">
            <Image
              src="/images/logos/broker-dark-theme.png"
              alt="BrokerStep Logo"
              width={360}
              height={100}
              style={{ width: 'auto', height: '76px' }}
              className="object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-3 text-xs text-slate-300 sm:text-sm">
            <span className="hidden sm:inline">Broker Portal?</span>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-blue-400 hover:bg-blue-600/25 hover:text-white sm:px-4 sm:py-2"
            >
              Broker sign in
            </Link>
          </div>
        </header>

        {/* Center Form Card */}
        <div className="flex flex-1 items-center justify-center py-1 min-h-0">
          <div className="w-full max-w-[440px] rounded-2xl border border-white/20 bg-white p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] sm:rounded-3xl sm:p-6">
            {/* Header */}
            <div className="mb-3 text-center sm:text-left sm:mb-4">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                <Sparkles className="size-3" />
                Super Admin
              </div>

              <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">
                Sign in to Admin Console
              </h1>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Enter your credentials to access the admin portal.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3">
              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700">
                  Email address
                </label>
                <div
                  className={`relative flex items-center rounded-xl border bg-white transition-all ${
                    focused === 'email'
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Mail
                    className={`ml-3.5 size-3.5 transition-colors sm:size-4 ${
                      focused === 'email' ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  />
                  <input
                    id="email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="admin@brokerstep.com"
                    autoComplete="email"
                    className="h-9.5 w-full bg-transparent px-3 text-xs text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-700">
                  Password
                </label>
                <div
                  className={`relative flex items-center rounded-xl border bg-white transition-all ${
                    focused === 'password'
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Lock
                    className={`ml-3.5 size-4 transition-colors ${
                      focused === 'password' ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  />
                  <input
                    id="password"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-10 w-full bg-transparent px-3 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:h-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group cursor-pointer relative mt-1 inline-flex h-9.5 items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition-all hover:bg-blue-600 disabled:opacity-70 sm:h-10"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Please wait…
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="shrink-0 py-1 text-center text-[11px] text-slate-400">
          <p>
            © 2026 BrokerStep ·{' '}
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>{' '}
            ·{' '}
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
          </p>
        </footer>
      </div>

      {/* White form autofill fix */}
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #0f172a !important;
          caret-color: #0f172a;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>
    </main>
  )
}
