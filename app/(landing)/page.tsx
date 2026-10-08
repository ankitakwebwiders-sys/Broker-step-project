'use client'

import Link from 'next/link'
import { ArrowRight, Check, ChevronRight, FileCheck2, Sparkles, TrendingUp, Users, WalletCards, Zap, Target, BarChart3, Award, Clock, Globe, Rocket, Database, Shield, Layers, Star, LayoutGrid, DatabaseBackup, ChartNetwork, HelpCircle, ChevronDown, MessageCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { pricingPlans } from '@/data/landing/pricing'
import { faqs } from '@/data/landing/faqs'

const benefits = [
  { icon: Database, title: 'Unified Data Hub', description: 'All your client data in one place', color: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.22)' },
  { icon: Shield, title: 'Bank-Level Security', description: 'Your data is always protected', color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.22)' },
  { icon: Layers, title: 'Smart Workflows', description: 'Automate repetitive tasks', color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.22)' },
]


const features = [
  { icon: Users, title: 'Book of Business', text: 'Every client and policy, organized.', color: 'from-blue-500 to-cyan-500' },
  { icon: WalletCards, title: 'Commission Tracking', text: 'Know what is earned and pending.', color: 'from-violet-500 to-purple-500' },
  { icon: FileCheck2, title: 'Reconciliation', text: 'Match statements with confidence.', color: 'from-emerald-500 to-teal-500' },
  { icon: Zap, title: 'Lead Management', text: 'Turn opportunities into relationships.', color: 'from-amber-500 to-orange-500' },
  { icon: TrendingUp, title: 'Analytics', text: 'See the signals behind growth.', color: 'from-rose-500 to-pink-500' },
]

const workflowSteps = [
  { icon: LayoutGrid, title: 'Set up your workspace', desc: 'Configure your brokerage settings in minutes' },
  { icon: DatabaseBackup, title: 'Import your data', desc: 'Migrate clients and policies effortlessly' },
  { icon: ChartNetwork, title: 'Track everything', desc: 'Monitor commissions and renewals in real-time' },
  { icon: Rocket, title: 'Scale your business', desc: 'Grow with confidence using actionable insights' },
]

// ─────────────────────────────────────────────
// HOOK: Scroll reveal
// ─────────────────────────────────────────────
function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({ children, delay = 0, className = '', y = 28 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Magnetic wrapper
function Magnetic({ children, strength = 14 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current; if (!el) return
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) / r.width
        const y = (e.clientY - r.top - r.height / 2) / r.height
        setPos({ x: x * strength, y: y * strength })
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`, transition: 'transform 400ms cubic-bezier(0.16,1,0.3,1)' }}
    >
      {children}
    </div>
  )
}

// Spotlight card
function SpotlightCard({ children, className = '', glow = 'rgba(59,130,246,0.15)' }: { children: React.ReactNode; className?: string; glow?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [active, setActive] = useState(false)
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current; if (!el) return
        const r = el.getBoundingClientRect()
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: active ? 1 : 0, background: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, ${glow}, transparent 60%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}

// Animated counter
function Counter({ value, duration = 1600 }: { value: string; duration?: number }) {
  const { ref, visible } = useReveal<HTMLSpanElement>()
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!visible) return
    const prefixMatch = value.match(/^[^0-9]*/)
    const suffixMatch = value.match(/[^0-9.,]*$/)
    const numStr = value.replace(/[^0-9.]/g, '')
    const target = parseFloat(numStr)
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0
    const hasComma = value.includes(',')
    const prefix = prefixMatch?.[0] ?? ''
    const suffix = suffixMatch?.[0] ?? ''

    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = eased * target
      let out = current.toFixed(decimals)
      if (hasComma) out = Number(out).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      setDisplay(`${prefix}${out}${suffix}`)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, value, duration])

  return <span ref={ref}>{display}</span>
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────
export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight)
      setScrollProgress(p * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white text-slate-950 antialiased selection:bg-blue-200/60 selection:text-slate-900">

      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 z-[100] h-[2px] w-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
          style={{ width: `${scrollProgress}%`, transition: 'width 100ms linear' }}
        />
      </div>

      {/* Fixed aurora background — soft pastel orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-300/40 blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-violet-300/40 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-200/50 blur-[120px] animate-pulse" style={{ animationDelay: '4s' }} />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 78%)',
          }}
        />
      </div>

      {/* ═══════════ NAV ═══════════ */}
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative z-10 px-6 pt-30 pb-24 lg:px-10 lg:pt-40">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

            {/* LEFT */}
            <div>
              <Reveal delay={0}>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-medium text-blue-700 backdrop-blur-sm shadow-sm">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Built for modern brokerages
                  <ChevronRight className="size-3" />
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="mt-8 text-[clamp(2.5rem,6.5vw,5rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-slate-950">
                  The clear next step
                  for your{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_4s_linear_infinite]">
                      book of business.
                    </span>
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600">
                  BrokerStep brings clients, renewals, policies, and commissions into one calm, intelligent workspace so you can spend more time growing relationships.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Magnetic strength={14}>
                    <Link
                      href="/register"
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(59,130,246,0.7)] transition-all hover:shadow-[0_10px_50px_-5px_rgba(59,130,246,0.9)]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Create Account
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Link>
                  </Magnetic>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-white"
                  >
                    Sign In
                  </Link>
                </div>
              </Reveal>


            </div>

            {/* RIGHT — Product mock */}
            <Reveal delay={200} y={40}>
              <div className="relative">
                <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-blue-300/50 via-violet-300/50 to-cyan-200/60 blur-3xl" />

                <div className="relative rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-[0_20px_80px_-20px_rgba(59,130,246,0.35)] backdrop-blur-xl">
                  <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white p-5">
                    {/* chrome */}
                    <div className="mb-4 flex items-center gap-1.5">
                      <div className="size-2.5 rounded-full bg-red-400" />
                      <div className="size-2.5 rounded-full bg-yellow-400" />
                      <div className="size-2.5 rounded-full bg-green-400" />
                      <div className="ml-3 flex-1 rounded-md border border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-400">
                        brokerstep.app/dashboard
                      </div>
                    </div>

                    {/* header row */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Portfolio overview</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-950">$2.84M</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 border border-emerald-100">+18.6%</span>
                    </div>

                    {/* chart */}
                    <div className="flex h-32 items-end gap-1.5 mb-4">
                      {[42, 55, 48, 68, 61, 82, 96].map((h, i) => (
                        <div key={i} className="flex-1">
                          <div
                            className="w-full rounded-t bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-[0_4px_12px_rgba(59,130,246,0.35)] transition-all duration-500 hover:from-cyan-500 hover:to-cyan-300"
                            style={{ height: `${h}%`, animation: `growBar 900ms cubic-bezier(0.16,1,0.3,1) ${i * 70}ms both`, transformOrigin: 'bottom' }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* mini KPIs */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Clients', value: '248', color: 'from-blue-50 to-blue-100/50', border: 'border-blue-100' },
                        { label: 'Policies', value: '1,204', color: 'from-violet-50 to-violet-100/50', border: 'border-violet-100' },
                        { label: 'Renewals', value: '42', color: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-100' },
                      ].map((k, i) => (
                        <div key={i} className={`rounded-lg border ${k.border} bg-gradient-to-br ${k.color} p-3 text-center transition-transform hover:scale-105`}>
                          <p className="text-[10px] text-slate-500">{k.label}</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-950">{k.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* floating chips */}
                <div className="absolute -left-6 top-1/3 hidden animate-[float_5s_ease-in-out_infinite] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl lg:block">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                      <TrendingUp className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Commission</p>
                      <p className="text-xs font-semibold text-slate-950">+$12,480</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 hidden animate-[float_6s_ease-in-out_infinite_1s] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl lg:block">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
                      <Users className="size-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">New clients</p>
                      <p className="text-xs font-semibold text-slate-950">+24 this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ═══════════ PLATFORM / BENEFITS ═══════════ */}
      <section id="platform" className="relative z-10 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                <Sparkles className="size-3.5 text-blue-500" />
                Product Benefits
              </span>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Everything your brokerage needs.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Replace disconnected tools with a focused workspace that makes the important work visible and actionable.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 120}>
                <SpotlightCard
                  glow={b.glow}
                  className="group h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${b.color} text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <b.icon className="size-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-950">{b.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{b.description}</p>
                  <div className="mt-6 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    Learn more <ArrowRight className="size-4" />
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="relative z-10 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                <FileCheck2 className="size-3.5 text-emerald-500" />
                Key Features
              </span>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                The tools behind a better brokerage.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Purpose-built workflows replace scattered spreadsheets and give your team one reliable source of truth.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80} className={i === 4 ? 'lg:col-span-1 sm:col-span-2' : ''}>
                <SpotlightCard className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
                  <div className={`inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-md transition-transform duration-500 group-hover:scale-110`}>
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-slate-950">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
                  <ArrowRight className="mt-5 size-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ANALYTICS ═══════════ */}
      <section id="analytics" className="relative z-10 px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                <BarChart3 className="size-3.5 text-violet-500" />
                Why Choose BrokerStep
              </span>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Make decisions from the whole picture.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                A live view of production, renewals, commissions, and pipeline helps every person know what to do next.
              </p>
              <Magnetic strength={12}>
                <Link
                  href="/register"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-all hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.7)]"
                >
                  See your workspace <ArrowRight className="size-4" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={200} y={40}>
            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-r from-violet-200/60 to-blue-200/60 blur-3xl" />
              <div className="relative rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Portfolio health</p>
                    <p className="mt-1 text-3xl font-semibold text-slate-950">$2.84M</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 border border-emerald-100">+18.6%</span>
                </div>
                <div className="mt-8 flex h-36 items-end gap-3">
                  {[42, 55, 48, 68, 61, 82, 96].map((h, i) => (
                    <div key={i} className="flex flex-1 flex-col justify-end gap-2">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-[0_4px_12px_rgba(59,130,246,0.35)] transition-all duration-500 hover:from-cyan-500 hover:to-cyan-300"
                        style={{ height: `${h}%`, animation: `growBar 900ms cubic-bezier(0.16,1,0.3,1) ${i * 70}ms both`, transformOrigin: 'bottom' }}
                      />
                      <span className="text-center text-[10px] text-slate-500">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section id="pricing" className="relative z-10 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                <Award className="size-3.5 text-rose-500" />
                Membership Information
              </span>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                A plan that grows with your brokerage.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Start with the essentials, then bring your whole team into one shared operating system as your book grows.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3 items-stretch">
            {pricingPlans.map((plan, i) => {
              const isPopular = plan.popular

              return (
                <Reveal key={plan.name} delay={i * 120} className="h-full">
                  <div
                    className={`relative flex h-full flex-col justify-between rounded-2xl bg-white p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 ${
                      isPopular
                        ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10'
                        : 'border border-slate-200/90 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-1 text-xs font-bold text-white shadow-sm whitespace-nowrap">
                        Most Popular
                      </span>
                    )}

                    <div>
                      {/* Plan Title & Subtitle (Centered) */}
                      <div className="text-center">
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                          {plan.name}
                        </h3>
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
                        <div className="rounded-xl bg-blue-50/80 py-2.5 px-4 text-center text-xs font-semibold text-blue-600 ring-1 ring-blue-100/60">
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
                              <Check className="size-4 shrink-0 text-sky-500 stroke-[2.5]" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="mt-8 pt-2">
                      <Link
                        href={`/register?plan=${plan.name.toLowerCase()}`}
                        className={`inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                          isPopular
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 hover:bg-blue-700'
                            : 'border border-blue-600 bg-white text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Start Free Trial
                      </Link>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ WORKFLOW ═══════════ */}
      <section id="workflow" className="relative z-10 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                <Target className="size-3.5 text-cyan-500" />
                How It Works
              </span>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Make every next step obvious.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Follow these simple steps to transform your brokerage operations.
              </p>
            </div>
          </Reveal>

          <div className="relative mt-20">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block" />
            <div className="grid gap-8 lg:grid-cols-4">
              {workflowSteps.map((step, i) => (
                <Reveal key={step.title} delay={i * 150}>
                  <div className="group relative">
                    <div className="relative mx-auto flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-500 group-hover:border-blue-300 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]">
                      <step.icon className="size-6 text-blue-600" />
                      <div className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-[10px] font-bold text-white shadow-lg">
                        {i + 1}
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="relative z-10 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                <HelpCircle className="size-3.5 text-blue-500" />
                Frequently Asked Questions
              </span>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Everything you need to know.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                Have questions about BrokerStep? Find clear answers below or reach out to our team anytime.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i
              return (
                <Reveal key={faq.question} delay={i * 60}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen
                      ? 'border-blue-600/60 bg-white shadow-lg shadow-blue-500/5 ring-2 ring-blue-100'
                      : 'border-slate-200/90 bg-white/90 hover:border-slate-300 hover:bg-white'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-semibold text-slate-900 sm:text-lg">
                        {faq.question}
                      </span>
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${isOpen
                          ? 'rotate-180 bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        <ChevronDown className="size-4" />
                      </span>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-slate-100 px-6 pb-6 pt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>


        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section id="about" className="relative z-10 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-12 text-center shadow-xl shadow-slate-200/50 lg:p-20">
              <div className="absolute -top-24 left-1/4 size-96 rounded-full bg-blue-300/40 blur-3xl" />
              <div className="absolute -bottom-24 right-1/4 size-96 rounded-full bg-violet-300/40 blur-3xl" />
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15,23,42,0.12) 1px, transparent 0)`,
                  backgroundSize: '32px 32px',
                }}
              />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm">
                  <Rocket className="size-3.5 text-blue-500" />
                  Ready to transform your brokerage?
                </div>
                <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">
                  Run your brokerage with more clarity.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600">
                  Join the teams using BrokerStep to simplify operations, strengthen relationships, and build a more predictable business.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Magnetic strength={16}>
                    <Link
                      href="/register"
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-slate-950/15 transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
                    >
                      Create Your Free Account
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Magnetic>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    Sign In to BrokerStep
                  </Link>
                </div>

              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <Footer />

      {/* ═══════════ KEYFRAMES ═══════════ */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes growBar {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </main>
  )
}