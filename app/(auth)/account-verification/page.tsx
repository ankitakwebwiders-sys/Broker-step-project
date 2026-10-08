'use client'

import Link from 'next/link'
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react'

export default function AccountVerificationPage() {
  return (
    <main className="flex min-h-screen bg-[#f8fafc] text-slate-950">
      {/* Left Sidebar */}
      <div className="hidden w-[44%] flex-col justify-between bg-[#07152f] p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600">
            <ShieldCheck className="size-5" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-bold tracking-[-0.04em]">
            Broker<span className="text-blue-400">Step</span>
          </span>
        </Link>

        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
            The broker's workspace
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-[-0.055em]">
            Move business forward, one clear step at a time.
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-300">
            The focused workspace for clients, policies, renewals, and commissions.
          </p>
          <div className="mt-9 flex flex-col gap-3 text-sm text-slate-300">
            <p className="flex items-center gap-3">
              <Check className="size-4 text-emerald-400" />
              One place for your whole book
            </p>
            <p className="flex items-center gap-3">
              <Check className="size-4 text-emerald-400" />
              Clear commission visibility
            </p>
            <p className="flex items-center gap-3">
              <Check className="size-4 text-emerald-400" />
              Built for modern teams
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500">© 2026 BrokerStep</p>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-6 lg:p-10">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 lg:hidden">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <div className="ml-auto text-sm text-slate-500">
            Already verified?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-6 pb-12 lg:px-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            Verification
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Account Verification
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your account is being verified. Please complete the verification process to access your BrokerStep workspace.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                Verification in progress. Please follow the instructions sent to your email or contact support if you need assistance.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
