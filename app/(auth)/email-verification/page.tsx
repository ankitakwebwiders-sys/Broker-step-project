'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Mail, RefreshCw, LogOut, ShieldCheck } from 'lucide-react'
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
    // Resend email logic would go here
    console.log('Resend email clicked')
    setTimeout(() => setResending(false), 1200)
  }

  return (
    <main className="relative flex h-screen max-h-screen overflow-hidden bg-[#f8fafc] text-slate-950">

      {/* Ambient aurora background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-300/40 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-300/40 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />
      </div>

      {/* ═══════════ LEFT SIDEBAR (dark) ═══════════ */}
      <aside className="relative z-10 hidden h-screen w-[46%] flex-col overflow-hidden bg-gradient-to-br from-[#07152f] via-[#0a1e42] to-[#07152f] p-10 text-white lg:flex">

        {/* Aurora orbs inside sidebar */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-blue-600/30 blur-[100px] animate-pulse" />
          <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-violet-600/25 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 size-72 rounded-full bg-cyan-500/15 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 inline-flex">
          <Image
            src="/images/logos/broker-dark-theme.png"
            alt="BrokerStep Logo"
            width={180}
            height={48}
            className="object-contain"
            priority
          />
        </Link>

        {/* Main copy */}
        <div className="relative z-10 max-w-md mt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-200 backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            Trusted by 2,500+ brokers
          </div>

          <h1 className="mt-6 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.045em]">
            Move business
            <br />
            forward, one{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              clear step
            </span>{' '}
            at a time.
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-slate-300">
            The focused workspace for clients, policies, renewals, and commissions.
          </p>

          <ul className="mt-8 space-y-3.5">
            {[
              'One place for your whole book',
              'Clear commission visibility',
              'Built for modern teams',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                  <Check className="size-3.5 text-emerald-400" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          
        </div>
      </aside>

      {/* ═══════════ RIGHT FORM SECTION ═══════════ */}
      <section className="relative z-10 flex h-screen flex-1 flex-col overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between p-6 lg:p-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 lg:hidden"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>

          <div className="ml-auto text-sm text-slate-500">
           <button
              onClick={handleLogout}
              className="group ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Form wrapper */}
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-6 pb-8 lg:px-0">
          <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-7 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700">
                <Mail className="size-3" />
                Verification
              </div>

              <h2 className="mt-4 text-[1.65rem] font-semibold tracking-[-0.03em] text-slate-950">
                Email verification
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Please check your email for a verification link. Click the link to verify your account and continue to your workspace.
              </p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 ring-1 ring-blue-400/40">
                <Mail className="size-3.5 text-blue-600" />
              </span>
              <p className="text-sm leading-6 text-blue-900">
                Verification email sent! If you don&apos;t see it in your inbox, check your spam folder.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-3">

              {/* Primary — Verify */}
              <button
                onClick={handleVerify}
                className="group relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.7)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Verify
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>

              {/* Secondary — Resend */}
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className={`size-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending…' : 'Resend email'}
              </button>
            </div>

            {/* Back to sign in */}
            <div className="mt-5 border-t border-slate-100 pt-5 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600"
              >
                <ArrowLeft className="size-3.5" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Autofill fix */}
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