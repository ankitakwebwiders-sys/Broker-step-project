'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Send,
  Check,
  Copy,
  Clock,
  ShieldAlert,
  CreditCard,
  HelpCircle,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const contactChannels = [
  {
    title: 'General Inquiries',
    email: 'inquiry@brokerstep.com',
    mailto: 'mailto:inquiry@brokerstep.com',
    description: 'Platform inquiries, partnerships, media requests, and general questions.',
    icon: HelpCircle,
    badge: 'General',
    color: 'from-blue-500 to-cyan-500',
    response: 'Replies within 2-4 hours',
  },
  {
    title: 'Sales & Enterprise',
    email: 'Sales@brokerstep.com',
    mailto: 'mailto:Sales@brokerstep.com',
    description: 'Custom quotes, migration assistance, team demos, and brokerage onboarding.',
    icon: Sparkles,
    badge: 'Sales',
    color: 'from-blue-600 to-indigo-600',
    response: 'Priority response within 1 hour',
  },
  {
    title: 'Billing & Subscriptions',
    email: 'Billing@brokerstep.com',
    mailto: 'mailto:Billing@brokerstep.com',
    description: 'Invoices, plan changes, payment inquiries, receipts, and contract queries.',
    icon: CreditCard,
    badge: 'Accounts',
    color: 'from-emerald-500 to-teal-500',
    response: 'Mon - Fri, 9am - 6pm EST',
  },
  {
    title: 'Complaints & Support',
    email: 'Complaints@brokerstep.com',
    mailto: 'mailto:Complaints@brokerstep.com',
    description: 'Issue escalations, dispute resolutions, feedback, and priority customer care.',
    icon: ShieldAlert,
    badge: 'Priority Support',
    color: 'from-rose-500 to-pink-500',
    response: 'Direct manager escalation',
  },
]

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'inquiry@brokerstep.com',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleCopy(email: string) {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <div className="relative min-h-screen bg-white text-slate-950 antialiased selection:bg-blue-200/60 selection:text-slate-900">
      {/* Background aurora lights */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-300/35 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-violet-300/30 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-200/40 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
          }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-5 pt-32 pb-24 sm:px-8 lg:px-10 lg:pt-36">
        {/* Header Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0170FE]/20 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-[#0170FE] shadow-xs backdrop-blur-sm">
            <MessageSquare className="size-3.5" />
            Contact &amp; Support Hub
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            We&apos;re here for your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-[#0170FE] bg-clip-text text-transparent">
              brokerage.
            </span>
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Whether you have platform questions, require customized sales assistance, have billing inquiries, or need immediate dispute resolution, our teams are standing by.
          </p>
        </div>

        {/* 4 Dedicated Email Department Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactChannels.map((item) => {
            const Icon = item.icon
            const isCopied = copiedEmail === item.email

            return (
              <div
                key={item.email}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0170FE]/40 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md`}>
                      <Icon className="size-5.5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.description}</p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  {/* Mailto link */}
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={item.mailto}
                      className="truncate text-xs font-semibold text-[#0170FE] transition-colors hover:text-[#0060db] hover:underline"
                      title={item.email}
                    >
                      {item.email}
                    </a>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.email)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      title="Copy email address"
                      aria-label={`Copy ${item.email}`}
                    >
                      {isCopied ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="size-3" />
                    <span>{item.response}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact Form & Office Info Grid */}
        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Direct Message Form */}
          <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-xl shadow-slate-200/40 backdrop-blur-xl sm:p-10 lg:col-span-7">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0170FE]">
                <Mail className="size-3.5" />
                Direct Message
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Send us a direct message
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Fill out the details below and we will route your message to the responsible department immediately.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center animate-in fade-in duration-300">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-7" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-emerald-950">Message Sent Successfully!</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-emerald-700">
                  Thank you for reaching out. We have received your inquiry and our team will get back to you shortly at <span className="font-semibold text-emerald-900">{formData.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      department: 'inquiry@brokerstep.com',
                      subject: '',
                      message: '',
                    })
                  }}
                  className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-xs font-medium text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="name"
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700">
                      Work Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="email"
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@brokerage.com"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="mb-1 block text-xs font-medium text-slate-700">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="mb-1 block text-xs font-medium text-slate-700">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                    >
                      <option value="inquiry@brokerstep.com">General Inquiry (inquiry@brokerstep.com)</option>
                      <option value="Sales@brokerstep.com">Sales &amp; Enterprise (Sales@brokerstep.com)</option>
                      <option value="Billing@brokerstep.com">Billing &amp; Payments (Billing@brokerstep.com)</option>
                      <option value="Complaints@brokerstep.com">Complaints &amp; Support (Complaints@brokerstep.com)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-1 block text-xs font-medium text-slate-700">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="subject"
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help you?"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-1 block text-xs font-medium text-slate-700">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry or request in detail..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0170FE] px-6 text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition-all hover:bg-[#0060db] hover:shadow-[0_4px_20px_rgba(1,112,254,0.4)] disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending message…
                    </>
                  ) : (
                    <>
                      <span>Send Message to {formData.department.split('@')[0]}</span>
                      <Send className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Key Details & Fast Channels */}
          <div className="space-y-6 lg:col-span-5">
            {/* Quick Email Directory Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 to-slate-950 p-7 text-white shadow-xl sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <Building2 className="size-3.5 text-[#0170FE]" />
                Official Email Directory
              </span>

              <h3 className="mt-4 text-xl font-bold tracking-tight">Need immediate access?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                You can write directly from your email client to any of our dedicated mailboxes:
              </p>

              <div className="mt-6 space-y-3">
                {contactChannels.map((c) => (
                  <div
                    key={c.email}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
                  >
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">{c.badge}</p>
                      <a
                        href={c.mailto}
                        className="text-xs font-semibold text-white transition-colors hover:text-[#0170FE]"
                      >
                        {c.email}
                      </a>
                    </div>
                    <a
                      href={c.mailto}
                      className="inline-flex size-7 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-[#0170FE]"
                      title={`Email ${c.email}`}
                    >
                      <ArrowRight className="size-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Guarantee & Office Hours */}
            <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-7 shadow-sm backdrop-blur-md">
              <h4 className="text-base font-bold text-slate-900">Operating Hours &amp; Response Guarantee</h4>
              <p className="mt-1 text-xs text-slate-500">
                Our operations and customer advocacy desks are monitored round-the-clock for critical incidents.
              </p>

              <div className="mt-5 space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500">Customer Support:</span>
                  <span className="font-semibold text-slate-900">Monday – Friday: 8 AM – 8 PM EST</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500">Sales Inquiries:</span>
                  <span className="font-semibold text-slate-900">Within 1 business hour</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-slate-500">Urgent Escalations:</span>
                  <span className="font-semibold text-emerald-600">24/7 Priority Queue</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-blue-50/70 p-4 border border-[#0170FE]/20">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Looking for self-service?</p>
                  <p className="text-[11px] text-slate-500">Check our frequently asked questions.</p>
                </div>
                <Link
                  href="/#faq"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0170FE] transition-colors hover:text-[#0060db]"
                >
                  View FAQ <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
