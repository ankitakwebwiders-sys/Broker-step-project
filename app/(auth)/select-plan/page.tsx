'use client'

import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const plans = [
  { name: 'Starter', price: '$29', description: 'For independent brokers getting organized.', features: ['Client and policy tracking', 'Renewal reminders', 'Basic commission visibility'] },
  { name: 'Professional', price: '$79', description: 'For growing brokerages ready to move faster.', features: ['Everything in Starter', 'Automated lead capture', 'Advanced reporting', 'Team collaboration'], popular: true },
  { name: 'Enterprise', price: 'Custom', description: 'For teams that need a tailored operation.', features: ['Everything in Professional', 'Admin controls and audit logs', 'Priority support', 'Custom workflows'] },
]

export default function SelectPlanPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('Professional')

  function handleSelectPlan(planName: string) {
    setSelected(planName)
    router.push('/broker/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Choose your membership
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            A plan built for your next step.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Pick the workspace that fits your brokerage today. You can change your membership whenever your business grows.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.name}
              onClick={() => handleSelectPlan(plan.name)}
              className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                selected === plan.name ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{plan.description}</p>
                </div>
                {selected === plan.name && (
                  <span className="grid size-6 place-items-center rounded-full bg-blue-600 text-white">
                    <Check className="size-4" />
                  </span>
                )}
              </div>
              <p className="mt-6 text-3xl font-semibold">
                {plan.price}
                <span className="text-sm font-normal text-slate-500">
                  {plan.price !== 'Custom' && ' / month'}
                </span>
              </p>
              <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6">
                {plan.features.map((feature) => (
                  <span key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="size-4 text-emerald-500" />
                    {feature}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            Click on a plan to continue to your dashboard
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
