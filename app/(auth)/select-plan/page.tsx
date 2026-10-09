'use client'

import { Check, LogOut } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/landing/Footer'
import { pricingPlans } from '@/data/landing/pricing'

export default function SelectPlanPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('Professional')

  function handleSelectPlan(planName: string) {
    setSelected(planName)
    router.push('/broker/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      {/* Top Navbar: Logo on left, Logout on right (No menu items) */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5 lg:px-10">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              src="/images/logos/broker-logo-removebg-preview.png"
              alt="BrokerStep Logo"
              width={220}
              height={60}
              priority
              className="object-contain"
            />
          </Link>

          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-rose-600"
          >
            <LogOut className="size-4 text-slate-500 transition-colors group-hover:text-rose-600" />
            <span>Logout</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0170FE]">
            Choose your membership
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            A plan built for your next step.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Pick the workspace that fits your brokerage today. You can change
            your membership whenever your business grows.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan) => {
            const isSelected = selected === plan.name
            const isPopular = plan.popular

            return (
              <div
                key={plan.name}
                className={`relative flex h-full flex-col justify-between rounded-2xl bg-white p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 ${isPopular || isSelected
                  ? 'border-2 border-[#0170FE] shadow-xl shadow-[#0170FE]/10'
                  : 'border border-slate-200/90 shadow-sm hover:shadow-md'
                  }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#0170FE] px-5 py-1 text-xs font-bold text-white shadow-sm whitespace-nowrap">
                    Most Popular
                  </span>
                )}

                <div>
                  {/* Plan Title & Subtitle (Centered) */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                      {plan.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 min-h-[40px] flex items-center justify-center">
                      {plan.subtitle}
                    </p>
                  </div>

                  {/* Price (Centered) */}
                  <div className="mt-6 flex items-baseline justify-center">
                    <span className="text-xs font-bold text-slate-800 mr-1.5">
                      {plan.currency}
                    </span>
                    <span className="text-4xl font-extrabold tracking-tight text-slate-950">
                      {plan.price}
                    </span>
                    <span className="text-sm font-medium text-slate-500 ml-1.5">
                      {plan.period}
                    </span>
                  </div>

                  {/* Trial Badge Pill (Centered) */}
                  <div className="mt-5">
                    <div className="rounded-xl bg-blue-50/80 py-2.5 px-4 text-center text-xs font-semibold text-[#0170FE] ring-1 ring-[#0170FE]/20">
                      {plan.trial}
                    </div>
                  </div>

                  {/* Features (Left-aligned) */}
                  <div className="mt-7">
                    <p className="text-xs font-bold text-slate-900 mb-3.5">
                      {plan.includesTitle}
                    </p>
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-3 text-xs sm:text-[13px] text-slate-700"
                        >
                          <Check className="size-4 shrink-0 text-[#0170FE] stroke-[2.5]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Select Plan Button */}
                <div className="mt-8 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.name)}
                    className={`inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition-all ${isPopular || isSelected
                      ? 'bg-[#0170FE] text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0061e0]'
                      : 'border border-slate-200/90 bg-white text-slate-800 shadow-xs hover:border-[#0170FE]/40 hover:bg-slate-50 hover:text-[#0170FE]'
                      }`}
                  >
                    Start Free Trial
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}