'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ArrowRight } from 'lucide-react'

export default function AccountVerificationPage() {
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
            <span className="hidden sm:inline">Already verified?</span>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-blue-400 hover:bg-blue-600/25 hover:text-white sm:px-4 sm:py-2"
            >
              Sign in
            </Link>
          </div>
        </header>

        {/* Center White Card */}
        <div className="flex flex-1 items-center justify-center py-2">
          <div className="w-full max-w-[420px] rounded-2xl border border-white/20 bg-white p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] sm:rounded-3xl sm:p-7 text-slate-900">

            {/* Header */}
            <div className="mb-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                <ShieldCheck className="size-3" />
                Verification
              </div>

              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Account verification
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Your account is currently being verified.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5">
              <p className="text-xs leading-5 text-blue-950">
                Verification in progress. Please follow the instructions sent to your registered email or contact support if needed.
              </p>
            </div>

            <div className="mt-4">
              <Link
                href="/login"
                className="group relative inline-flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-950 px-5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition-all hover:bg-blue-600"
              >
                <span>Back to sign in</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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
