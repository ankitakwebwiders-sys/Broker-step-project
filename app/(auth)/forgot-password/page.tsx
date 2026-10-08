'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, KeyRound, Mail, RefreshCw } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  function handleVerify(event?: React.MouseEvent | FormEvent) {
    if (event) event.preventDefault()
    router.push('/reset-password')
  }

  function handleResend(event?: React.MouseEvent) {
    if (event) event.preventDefault()
    setResending(true)
    setTimeout(() => setResending(false), 1200)
  }

  return (
    <main className="relative flex h-screen max-h-screen w-screen overflow-hidden bg-gradient-to-br from-[#07152f] via-[#0a1e42] to-[#07152f] text-white">

      {/* Aurora orbs in background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 size-[450px] rounded-full bg-blue-600/25 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-32 -right-32 size-[450px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col justify-between px-4 py-3 sm:px-8 sm:py-4">

        {/* Top Header Bar with Larger Logo */}
        <header className="flex shrink-0 items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-[1.02]">
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

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
            <span className="hidden sm:inline">Remember your password?</span>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-blue-400 hover:bg-blue-600/25 hover:text-white sm:px-4 sm:py-2"
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* Center White Form Card */}
        <div className="flex flex-1 items-center justify-center py-2">
          <div className="w-full max-w-[420px] rounded-2xl border border-white/20 bg-white p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] sm:rounded-3xl sm:p-7 text-slate-900">

            {/* Header */}
            <div className="mb-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                <KeyRound className="size-3" />
                Password recovery
              </div>

              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Forgot your password?
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Enter your email address to verify your account and reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleVerify} className="flex flex-col gap-3">
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
                  <Mail className={`ml-3.5 size-4 transition-colors ${focused === 'email' ? 'text-blue-500' : 'text-slate-400'}`} />
                  <input
                    id="email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="you@brokerage.com"
                    autoComplete="email"
                    className="h-10 w-full bg-transparent px-3 text-xs sm:text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Both Buttons: Verify (goes to /reset-password) & Resend */}
              <div className="mt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  onClick={handleVerify}
                  className="group relative inline-flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-950 px-5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition-all hover:bg-blue-600"
                >
                  <span>Verify & Reset Password</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw className={`size-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending…' : 'Resend'}
                </button>
              </div>
            </form>

            <div className="mt-4 border-t border-slate-100 pt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft className="size-3.5" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="shrink-0 py-1 text-center text-[11px] text-slate-400">
          <p>© 2026 BrokerStep · <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link> · <Link href="/terms" className="hover:text-white transition-colors">Terms</Link></p>
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