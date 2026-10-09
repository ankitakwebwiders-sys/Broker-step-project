'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Mail, RefreshCw, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

export default function EmailVerificationPage() {
  const router = useRouter()
  const [resending, setResending] = useState(false)

  function handleVerify() {
    router.push('/select-plan')
  }

  function handleLogout() {
    router.push('/login')
  }

  function handleResend() {
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

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-rose-400 hover:bg-rose-600/25 hover:text-white sm:px-4 sm:py-2"
            >
              <LogOut className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Center White Card */}
        <div className="flex flex-1 items-center justify-center py-2">
          <div className="w-full max-w-[420px] rounded-2xl border border-white/20 bg-white p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] sm:rounded-3xl sm:p-7 text-slate-900">

            {/* Header */}
            <div className="mb-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0170FE]/20 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#0170FE]">
                <Mail className="size-3" />
                Verification
              </div>

              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Email verification
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Please check your inbox for the verification link to proceed to your workspace.
              </p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 ring-1 ring-blue-400/40">
                <Mail className="size-3 text-[#0170FE]" />
              </span>
              <p className="text-xs leading-5 text-blue-950">
                Verification email sent! If you don&apos;t see it, check your spam or junk folder.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2.5">
              <button
                onClick={handleVerify}
                className="cursor-pointer group relative inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0170FE] px-5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition-all hover:bg-[#0061e0] hover:shadow-[0_4px_20px_rgba(1,112,254,0.4)]"
              >
                <span>Verify &amp; Continue</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={handleResend}
                disabled={resending}
                className="cursor-pointer inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:border-[#0170FE]/40 hover:bg-slate-50 hover:text-[#0170FE] disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending…' : 'Resend email'}
              </button>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-[#0170FE]"
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
    </main>
  )
}