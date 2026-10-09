'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  DollarSign,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  Layers,
  PieChart,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from 'lucide-react'
import {
  dashboardStats,
  carrierProductionData,
  lobProductionData,
  commissionSummaryBreakdown,
  KpiStat,
} from '@/data/broker/stats'
import { upcomingRenewals, RenewalPolicy } from '@/data/broker/renewals'

const activities = [
  {
    title: 'Commission payment matched',
    detail: 'Travelers · Statement #ST-2841',
    time: '18 min ago',
    icon: FileCheck2,
    tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  },
  {
    title: 'New lead captured',
    detail: 'Maya Patel · Commercial Property',
    time: '1 hr ago',
    icon: Users,
    tone: 'bg-blue-50 text-blue-600 ring-blue-100',
  },
  {
    title: 'Policy endorsement added',
    detail: 'Northstar Logistics · #POL-8842',
    time: '3 hrs ago',
    icon: ClipboardList,
    tone: 'bg-violet-50 text-violet-600 ring-violet-100',
  },
  {
    title: 'Statement ready for review',
    detail: 'AIG · September 2026',
    time: 'Yesterday',
    icon: FileSpreadsheet,
    tone: 'bg-amber-50 text-amber-600 ring-amber-100',
  },
]

const quickActions = [
  {
    title: 'Add new client',
    description: 'Create client record & bind policies',
    icon: Users,
    href: '/broker/clients',
    tone: 'bg-blue-50 text-blue-600 ring-blue-100/80 group-hover:bg-blue-600 group-hover:text-white',
    badge: 'Fast entry',
  },
  {
    title: 'Upload statement',
    description: 'Auto-reconcile carrier commissions',
    icon: FileSpreadsheet,
    href: '/broker/statements',
    tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100/80 group-hover:bg-emerald-600 group-hover:text-white',
    badge: '3 pending',
  },
  {
    title: 'Review renewals',
    description: '8 policies renewing in next 30 days',
    icon: CalendarDays,
    href: '/broker/renewals',
    tone: 'bg-amber-50 text-amber-600 ring-amber-100/80 group-hover:bg-amber-600 group-hover:text-white',
    badge: 'Priority',
  },
]

function StatCard({ stat }: { stat: KpiStat }) {
  const toneClasses =
    stat.tone === 'emerald'
      ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
      : stat.tone === 'amber'
        ? 'bg-amber-50 text-amber-600 ring-amber-100'
        : stat.tone === 'violet'
          ? 'bg-violet-50 text-violet-600 ring-violet-100'
          : stat.tone === 'rose'
            ? 'bg-rose-50 text-rose-600 ring-rose-100'
            : stat.tone === 'indigo'
              ? 'bg-indigo-50 text-indigo-600 ring-indigo-100'
              : 'bg-blue-50 text-blue-600 ring-blue-100'

  return (
    <Link href={stat.link} className="group block">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.22)]">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12px] font-medium text-slate-500 leading-tight">
              {stat.label}
            </p>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${toneClasses}`}
            >
              {stat.change}
            </span>
          </div>
          <p className="mt-2 text-[24px] font-bold tracking-tight text-slate-900 leading-tight">
            {stat.value}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2 text-[10.5px] text-slate-400">
          <span>{stat.note}</span>
          <span className="inline-flex items-center gap-0.5 font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
            View <ArrowRight className="size-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function BrokerDashboardPage() {
  const [range, setRange] = useState('Last 12 months')
  const [kpiCategory, setKpiCategory] = useState<'all' | 'production' | 'commission'>('all')
  const [renewalDaysFilter, setRenewalDaysFilter] = useState<number>(30)

  // Filter KPI cards by category tab
  const filteredKpis = useMemo(() => {
    if (kpiCategory === 'all') return dashboardStats
    if (kpiCategory === 'production') {
      return dashboardStats.filter(
        (s) => s.category === 'production' || s.category === 'policies'
      )
    }
    return dashboardStats.filter((s) => s.category === 'commission')
  }, [kpiCategory])

  // Filter renewals by days (7, 30, 60, 90, or all)
  const filteredRenewals = useMemo(() => {
    if (renewalDaysFilter === 0) return upcomingRenewals
    return upcomingRenewals.filter((item) => item.daysUntil <= renewalDaysFilter)
  }, [renewalDaysFilter])

  // Calculate renewal total volume
  const totalRenewalVolume = useMemo(() => {
    const sum = filteredRenewals.reduce((acc, curr) => {
      const num = parseInt(curr.premium.replace(/[^0-9]/g, ''), 10) || 0
      return acc + num
    }, 0)
    return `$${sum.toLocaleString()}`
  }, [filteredRenewals])

  return (
    <div className="p-4 sm:p-7 max-w-[1600px] mx-auto space-y-7">
      {/* ───── Header Bar ───── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Tuesday, October 8, 2026 · Live Overview
          </p>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 sm:text-[30px]">
            Good morning, Jordan
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Here is what is happening across your book of business today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex">
            <CalendarDays className="size-4 text-slate-400" />
            <span>2026 Fiscal Year</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
          <Link
            href="/broker/policies"
            className="group flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600"
          >
            <Plus className="size-4 transition-transform group-hover:rotate-90" />
            <span>Add New Policy</span>
          </Link>
        </div>
      </div>

      {/* ───── 3.1 KPI Cards (All 11 KPIs) ───── */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
              Key Performance Indicators
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {dashboardStats.length} KPIs
            </span>
          </div>

          {/* KPI category filter tabs */}
          <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 text-[11.5px] font-medium text-slate-600">
            <button
              onClick={() => setKpiCategory('all')}
              className={`rounded-lg px-3 py-1 transition-all ${kpiCategory === 'all'
                  ? 'bg-white font-semibold text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
                }`}
            >
              All KPIs (11)
            </button>
            <button
              onClick={() => setKpiCategory('production')}
              className={`rounded-lg px-3 py-1 transition-all ${kpiCategory === 'production'
                  ? 'bg-white font-semibold text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
                }`}
            >
              Production & Policies (5)
            </button>
            <button
              onClick={() => setKpiCategory('commission')}
              className={`rounded-lg px-3 py-1 transition-all ${kpiCategory === 'commission'
                  ? 'bg-white font-semibold text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
                }`}
            >
              Commissions & Reconciliation (6)
            </button>
          </div>
        </div>

        {/* 11 KPI Cards Grid with Clickable Drill-Downs (5 cards per row on desktop) */}
        <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredKpis.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      {/* ───── 3.2 Production Summary ───── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <TrendingUp className="size-4" />
              </span>
              <h2 className="text-[16px] font-bold text-slate-900">
                Production Summary
              </h2>
            </div>
            <p className="mt-1 text-[12px] text-slate-500">
              New business, renewals, carrier volume, and line-of-business distribution
            </p>
          </div>

          {/* Drill-down link */}
          <Link
            href="/broker/analytics"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
          >
            Detailed Analytics <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Link
            href="/broker/policies"
            className="group rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-blue-300 hover:bg-blue-50/30"
          >
            <p className="text-[11px] font-medium text-slate-500">New Business</p>
            <p className="mt-1 text-[18px] font-bold text-slate-900 group-hover:text-blue-600">
              $45,000
            </p>
            <span className="mt-1 inline-flex items-center text-[10px] font-semibold text-emerald-600">
              +15.3% this month
            </span>
          </Link>

          <Link
            href="/broker/renewals"
            className="group rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-blue-300 hover:bg-blue-50/30"
          >
            <p className="text-[11px] font-medium text-slate-500">Renewals</p>
            <p className="mt-1 text-[18px] font-bold text-slate-900 group-hover:text-blue-600">
              $97,000
            </p>
            <span className="mt-1 inline-flex items-center text-[10px] font-semibold text-blue-600">
              +10.8% this month
            </span>
          </Link>

          <Link
            href="/broker/analytics"
            className="group rounded-xl border border-blue-200/80 bg-blue-50/40 p-3.5 transition hover:border-blue-300 hover:bg-blue-50/60"
          >
            <p className="text-[11px] font-medium text-blue-700">Total Production</p>
            <p className="mt-1 text-[18px] font-bold text-blue-950">
              $142,000
            </p>
            <span className="mt-1 inline-flex items-center text-[10px] font-semibold text-blue-600">
              +12.1% total MTD
            </span>
          </Link>

          <Link
            href="/broker/carriers"
            className="group rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-blue-300 hover:bg-blue-50/30"
          >
            <p className="text-[11px] font-medium text-slate-500">Top Carrier Share</p>
            <p className="mt-1 text-[18px] font-bold text-slate-900 group-hover:text-blue-600">
              Travelers (41%)
            </p>
            <span className="mt-1 inline-flex text-[10px] font-medium text-slate-500">
              $58,000 volume
            </span>
          </Link>

          <Link
            href="/broker/policies"
            className="group col-span-2 sm:col-span-1 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition hover:border-blue-300 hover:bg-blue-50/30"
          >
            <p className="text-[11px] font-medium text-slate-500">Active Policies</p>
            <p className="mt-1 text-[18px] font-bold text-slate-900 group-hover:text-blue-600">
              1,192
            </p>
            <span className="mt-1 inline-flex text-[10px] font-semibold text-emerald-600">
              92.8% retention
            </span>
          </Link>
        </div>

        {/* Carrier Production & LOB Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Carrier Production */}
          <div className="rounded-xl border border-slate-200/70 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-blue-600" />
                <h3 className="text-[13px] font-semibold text-slate-800">
                  Carrier Production
                </h3>
              </div>
              <Link
                href="/broker/carriers"
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                View all carriers
              </Link>
            </div>
            <div className="mt-3.5 space-y-3">
              {carrierProductionData.map((c) => (
                <Link
                  key={c.carrier}
                  href={c.link}
                  className="group block space-y-1 rounded-lg p-1.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {c.carrier}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">
                        {c.policies} policies
                      </span>
                      <span className="font-bold text-slate-900">{c.amount}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Line-of-Business Production */}
          <div className="rounded-xl border border-slate-200/70 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-violet-600" />
                <h3 className="text-[13px] font-semibold text-slate-800">
                  Line-of-Business Production
                </h3>
              </div>
              <Link
                href="/broker/analytics"
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                View breakdown
              </Link>
            </div>
            <div className="mt-3.5 space-y-3">
              {lobProductionData.map((lob) => (
                <Link
                  key={lob.lob}
                  href={lob.link}
                  className="group block space-y-1 rounded-lg p-1.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors">
                      {lob.lob}
                    </span>
                    <span className="font-bold text-slate-900">{lob.amount} ({lob.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${lob.percentage}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Production & Commission Trend Bar Chart */}
        <div className="rounded-xl border border-slate-200/70 p-4 pt-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-800">
                Monthly Production &amp; Commission Trend
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Historical growth and commission collection across all lines
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-600 font-medium">
                <span className="size-2 rounded-full bg-blue-600" /> Production
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-600 font-medium">
                <span className="size-2 rounded-full bg-violet-400" /> Commission
              </div>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-blue-400"
              >
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>This year</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex h-[210px] items-end gap-2 border-b border-l border-slate-100 px-2 pb-0 pt-3 sm:gap-4 sm:px-4">
            <div className="flex h-full flex-col justify-between pb-1 pr-2 text-[10px] text-slate-400">
              <span>$400k</span>
              <span>$300k</span>
              <span>$200k</span>
              <span>$100k</span>
              <span>$0</span>
            </div>
            <div className="flex h-full flex-1 items-end justify-between gap-1 sm:gap-3">
              {[
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
              ].map((month, i) => (
                <div
                  key={month}
                  className="group/bar flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <div className="flex h-full w-full items-end justify-center gap-0.5">
                    <div
                      className="w-1/2 rounded-t-[3px] bg-blue-600/90 transition-all duration-300 group-hover/bar:bg-blue-600"
                      style={{
                        height: `${35 + [8, 17, 28, 23, 42, 48, 57, 60, 68, 74, 82, 90][i]
                          }%`,
                      }}
                    />
                    <div
                      className="w-1/2 rounded-t-[3px] bg-violet-400/90 transition-all duration-300 group-hover/bar:bg-violet-500"
                      style={{
                        height: `${20 + [5, 13, 18, 20, 30, 34, 38, 40, 44, 51, 57, 64][i]
                          }%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 transition group-hover/bar:text-slate-700">
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── 3.2 Commission Summary ───── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <WalletCards className="size-4" />
              </span>
              <h2 className="text-[16px] font-bold text-slate-900">
                Commission Summary
              </h2>
            </div>
            <p className="mt-1 text-[12px] text-slate-500">
              Expected vs Paid reconciliations, outstanding balances, partials, chargebacks, and net commission
            </p>
          </div>

          <Link
            href="/broker/commissions"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
          >
            Commission Portal <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Expected vs Actual Collection Bar */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Reconciliation &amp; Collection Progress
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-[20px] font-bold text-slate-900">
                  {commissionSummaryBreakdown.actualPaid}
                </span>
                <span className="text-[12px] text-slate-500">
                  paid of {commissionSummaryBreakdown.expected} expected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                {commissionSummaryBreakdown.paidRatio}% Collection Rate
              </span>
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80 flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${commissionSummaryBreakdown.paidRatio}%` }}
              title={`Paid: ${commissionSummaryBreakdown.actualPaid}`}
            />
            <div
              className="h-full bg-rose-400 transition-all duration-500"
              style={{ width: `${100 - commissionSummaryBreakdown.paidRatio}%` }}
              title={`Outstanding: ${commissionSummaryBreakdown.outstanding}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Paid / Received: <b className="text-slate-800">{commissionSummaryBreakdown.actualPaid}</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-400" />
              Outstanding / Unpaid: <b className="text-slate-800">{commissionSummaryBreakdown.outstanding}</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              Net Commission: <b className="text-emerald-700">{commissionSummaryBreakdown.netCommission}</b>
            </span>
          </div>
        </div>

        {/* 6 Clickable Drill-down Summary Tiles */}
        <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/broker/commissions"
            className="group rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <p className="text-[11px] font-medium text-slate-500">Expected</p>
            <p className="mt-1 text-[18px] font-bold text-slate-900 group-hover:text-blue-600">
              {commissionSummaryBreakdown.expected}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Total projected</p>
          </Link>

          <Link
            href="/broker/statements"
            className="group rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <p className="text-[11px] font-medium text-slate-500">Actual / Paid</p>
            <p className="mt-1 text-[18px] font-bold text-emerald-600">
              {commissionSummaryBreakdown.actualPaid}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Matched in statements</p>
          </Link>

          <Link
            href="/broker/commissions"
            className="group rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
          >
            <p className="text-[11px] font-medium text-slate-500">Outstanding</p>
            <p className="mt-1 text-[18px] font-bold text-rose-600">
              {commissionSummaryBreakdown.outstanding}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Awaiting carrier pay</p>
          </Link>

          <Link
            href="/broker/reconciliation"
            className="group rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
          >
            <p className="text-[11px] font-medium text-slate-500">Partial / Short-Paid</p>
            <p className="mt-1 text-[18px] font-bold text-amber-600">
              {commissionSummaryBreakdown.partialShortPaid}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Rate variance delta</p>
          </Link>

          <Link
            href="/broker/commissions"
            className="group rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
          >
            <p className="text-[11px] font-medium text-slate-500">Chargebacks</p>
            <p className="mt-1 text-[18px] font-bold text-rose-600">
              -{commissionSummaryBreakdown.chargebacks}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Policy cancellations</p>
          </Link>

          <Link
            href="/broker/reconciliation"
            className="group rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
          >
            <p className="text-[11px] font-medium text-slate-500">Adjustments</p>
            <p className="mt-1 text-[18px] font-bold text-violet-600">
              +{commissionSummaryBreakdown.adjustments}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">Manual corrections</p>
          </Link>
        </div>
      </section>

      {/* ───── 3.2 Upcoming Renewals (7/30/60/90 Day Views) + Quick Actions ───── */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr] items-stretch">
        {/* Upcoming Renewals Card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-col justify-between h-[420px]">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-bold text-slate-900">
                    Upcoming Renewals
                  </h2>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                    {filteredRenewals.length} policies · {totalRenewalVolume}
                  </span>
                </div>
                <p className="mt-0.5 text-[11.5px] text-slate-400">
                  Select timeframe view to filter policies needing renewal outreach
                </p>
              </div>

              {/* 7/30/60/90 Day View Filter Tabs */}
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-1 text-[11px] font-semibold text-slate-600 shrink-0">
                {[
                  { label: '7 Days', days: 7 },
                  { label: '30 Days', days: 30 },
                  { label: '60 Days', days: 60 },
                  { label: '90 Days', days: 90 },
                  { label: 'All', days: 0 },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setRenewalDaysFilter(tab.days)}
                    className={`rounded-lg px-2.5 py-1 transition-all ${renewalDaysFilter === tab.days
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'hover:text-slate-900'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Renewals Table with custom-scrollbar and fixed height to prevent card resize */}
            <div className="overflow-x-auto overflow-y-auto custom-scrollbar h-[270px]">
              {filteredRenewals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400">
                  <CalendarDays className="size-8 text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">No renewals in this timeframe</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Try selecting 30, 60, or 90 days to view upcoming expirations</p>
                </div>
              ) : (
                <table className="w-full min-w-[620px] text-left">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur z-10">
                    <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3">Client</th>
                      <th className="px-3 py-3">Renewal Date</th>
                      <th className="px-3 py-3">Premium</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRenewals.map((row) => (
                      <tr
                        key={row.client}
                        className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-8 items-center justify-center rounded-lg text-[10px] font-bold ring-1 ring-black/5 ${row.color}`}
                            >
                              {row.initials}
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold text-slate-800">
                                {row.client}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {row.type} · {row.carrier}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[11px] text-slate-600 font-medium">
                          {row.date}
                          <span className="block text-[9.5px] text-slate-400">
                            in {row.daysUntil} days
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[11.5px] font-bold text-slate-800">
                          {row.premium}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${row.status === 'On track'
                                ? 'bg-emerald-50 text-emerald-600 ring-emerald-100'
                                : row.status === 'Needs attention'
                                  ? 'bg-amber-50 text-amber-600 ring-amber-100'
                                  : 'bg-rose-50 text-rose-600 ring-rose-100'
                              }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href="/broker/renewals"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 shadow-sm transition"
                          >
                            Renew
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>


        </section>

        {/* Quick Actions Shortcuts Card — Exact matching height of 420px */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Quick Actions</h2>
              <p className="mt-0.5 text-[11.5px] text-slate-400">
                Direct operations &amp; workflow shortcuts
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
              <Sparkles className="size-3 text-blue-600" /> Shortcuts
            </span>
          </div>

          {/* Action cards with consistent compact spacing */}
          <div className="my-auto flex flex-col gap-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative flex items-center justify-between gap-3.5 rounded-xl border border-slate-200/70 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-slate-50/50 hover:shadow-md hover:shadow-blue-500/5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex size-9.5 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-200 ${action.tone}`}
                    >
                      <Icon className="size-4.5 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-semibold text-slate-800 transition-colors group-hover:text-blue-600">
                          {action.title}
                        </p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">
                          {action.badge}
                        </span>
                      </div>
                      <p className="truncate text-[10.5px] text-slate-400 mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:translate-x-0.5">
                    <ArrowUpRight className="size-3.5" />
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/broker/policies"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              <Plus className="size-3.5" /> Bind New Policy
            </Link>
          </div>
        </section>
      </div>

      {/* ───── 3.2 Leads Requiring Attention + Reconciliation Records ───── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads Requiring Attention */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                  <AlertCircle className="size-3.5" />
                </span>
                <h2 className="text-[14px] sm:text-[15px] font-bold text-slate-900">
                  Leads Requiring Attention
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] sm:text-[11.5px] text-slate-400">
                Prospects needing immediate outreach or quote finalization
              </p>
            </div>
            <Link
              href="/broker/leads"
              className="text-[11.5px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline shrink-0"
            >
              View all leads
            </Link>
          </div>

          {/* Mobile Cards View (Visible on < sm screens) */}
          <div className="mt-3.5 space-y-2.5 sm:hidden">
            {[
              {
                name: 'Maya Patel',
                company: 'Patel Hospitality Group',
                type: 'Commercial Property',
                status: 'Hot Lead',
                days: '2 days ago',
                phone: '+1 (555) 392-1190',
              },
              {
                name: 'Marcus Vance',
                company: 'Tech Solutions Inc',
                type: 'Cyber & D&O',
                status: 'Follow-up Required',
                days: '5 days ago',
                phone: '+1 (555) 728-3019',
              },
              {
                name: 'Elena Rostova',
                company: 'Green Valley Farms',
                type: 'Farm & Ranch Package',
                status: 'Quote Pending',
                days: '8 days ago',
                phone: '+1 (555) 481-9234',
              },
            ].map((lead) => (
              <div
                key={lead.name}
                className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-slate-900">{lead.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{lead.company}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                      lead.status === 'Hot Lead'
                        ? 'bg-rose-50 text-rose-600 ring-rose-100'
                        : lead.status === 'Follow-up Required'
                        ? 'bg-amber-50 text-amber-600 ring-amber-100'
                        : 'bg-blue-50 text-blue-600 ring-blue-100'
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/50 pt-2 text-[11px]">
                  <span className="truncate text-slate-600 max-w-[60%]">{lead.type}</span>
                  <span className="text-slate-400 shrink-0">{lead.days}</span>
                </div>

                <div className="mt-2.5 flex items-center justify-end">
                  <Link
                    href="/broker/leads"
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    Contact <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table View (Hidden on < sm screens) */}
          <div className="mt-4 hidden sm:block overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[500px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2.5">Lead / Contact</th>
                  <th className="px-3 py-2.5">Line of Business</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Last Contact</th>
                  <th className="px-3 py-2.5 text-right">Drill-Down</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: 'Maya Patel',
                    company: 'Patel Hospitality Group',
                    type: 'Commercial Property',
                    status: 'Hot Lead',
                    days: '2 days ago',
                    phone: '+1 (555) 392-1190',
                  },
                  {
                    name: 'Marcus Vance',
                    company: 'Tech Solutions Inc',
                    type: 'Cyber & D&O',
                    status: 'Follow-up Required',
                    days: '5 days ago',
                    phone: '+1 (555) 728-3019',
                  },
                  {
                    name: 'Elena Rostova',
                    company: 'Green Valley Farms',
                    type: 'Farm & Ranch Package',
                    status: 'Quote Pending',
                    days: '8 days ago',
                    phone: '+1 (555) 481-9234',
                  },
                ].map((lead) => (
                  <tr
                    key={lead.name}
                    className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-3">
                      <p className="text-[12px] font-semibold text-slate-800">
                        {lead.name}
                      </p>
                      <p className="text-[10px] text-slate-400">{lead.company}</p>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {lead.type}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[9.5px] font-semibold ring-1 ${lead.status === 'Hot Lead'
                            ? 'bg-rose-50 text-rose-600 ring-rose-100'
                            : lead.status === 'Follow-up Required'
                              ? 'bg-amber-50 text-amber-600 ring-amber-100'
                              : 'bg-blue-50 text-blue-600 ring-blue-100'
                          }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-500 font-medium">
                      {lead.days}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href="/broker/leads"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Contact <ArrowUpRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Records Requiring Reconciliation / Review */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                  <Scale className="size-3.5" />
                </span>
                <h2 className="text-[14px] sm:text-[15px] font-bold text-slate-900">
                  Records Requiring Reconciliation
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] sm:text-[11.5px] text-slate-400">
                Statements and commission deltas awaiting manual match
              </p>
            </div>
            <Link
              href="/broker/reconciliation"
              className="text-[11.5px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline shrink-0"
            >
              View portal
            </Link>
          </div>

          <div className="mt-3.5 sm:mt-4 space-y-2.5 sm:space-y-3">
            {[
              {
                carrier: 'Travelers Commercial',
                statement: '#ST-2841 · September 2026',
                discrepancy: '$1,420 delta',
                status: 'Discrepancy Found',
                priority: 'High',
                link: '/broker/reconciliation',
              },
              {
                carrier: 'AIG Specialty Lines',
                statement: '#ST-2839 · September 2026',
                discrepancy: '$780 unassigned',
                status: 'Pending Review',
                priority: 'Medium',
                link: '/broker/reconciliation',
              },
              {
                carrier: 'Chubb Commercial',
                statement: '#ST-2824 · August 2026',
                discrepancy: '$320 short-paid',
                status: 'Ready to Match',
                priority: 'Low',
                link: '/broker/reconciliation',
              },
            ].map((record) => (
              <Link
                key={record.carrier}
                href={record.link}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-slate-200/70 p-3 sm:p-3.5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-slate-50/60 hover:shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${record.priority === 'High'
                        ? 'bg-rose-100 text-rose-700 ring-rose-200'
                        : record.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700 ring-amber-200'
                          : 'bg-blue-100 text-blue-700 ring-blue-200'
                      }`}
                  >
                    <FileCheck2 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 truncate">
                    <p className="truncate text-[12.5px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {record.carrier}
                    </p>
                    <p className="truncate text-[10.5px] text-slate-400">{record.statement}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100/80 pt-2 sm:pt-0 shrink-0">
                  <p className="text-[12px] sm:text-[11.5px] font-bold text-slate-900">
                    {record.discrepancy}
                  </p>
                  <span
                    className={`text-[10.5px] sm:text-[10px] font-semibold ${record.status === 'Discrepancy Found'
                        ? 'text-rose-600'
                        : record.status === 'Pending Review'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                  >
                    {record.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ───── 3.2 Pending Work ───── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Pending Work</h2>
            <p className="mt-0.5 text-[11.5px] text-slate-400">
              Operational queue items requiring broker confirmation
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            28 total actions pending
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              task: 'Approve Renewals',
              count: 8,
              detail: 'Policies expiring within 30 days',
              link: '/broker/renewals',
              color: 'blue',
            },
            {
              task: 'Review Statements',
              count: 3,
              detail: 'Unmatched carrier commission files',
              link: '/broker/statements',
              color: 'violet',
            },
            {
              task: 'Follow-up Leads',
              count: 12,
              detail: 'Uncontacted prospects this week',
              link: '/broker/leads',
              color: 'amber',
            },
            {
              task: 'Reconcile Discrepancies',
              count: 5,
              detail: 'Short-paid items requiring signoff',
              link: '/broker/reconciliation',
              color: 'emerald',
            },
          ].map((item) => (
            <Link
              key={item.task}
              href={item.link}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex size-9 items-center justify-center rounded-xl ring-1 ${item.color === 'blue'
                      ? 'bg-blue-100 text-blue-700 ring-blue-200'
                      : item.color === 'violet'
                        ? 'bg-violet-100 text-violet-700 ring-violet-200'
                        : item.color === 'amber'
                          ? 'bg-amber-100 text-amber-700 ring-amber-200'
                          : 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                    }`}
                >
                  <Activity className="size-4" />
                </div>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10.5px] font-bold text-white shadow-sm">
                  {item.count} items
                </span>
              </div>
              <div className="mt-3">
                <p className="text-[13px] font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {item.task}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.detail}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-medium text-blue-600">
                <span>Open task queue</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───── Recent Book Activity Feed ───── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">
              Recent Book Activity
            </h2>
            <p className="mt-0.5 text-[11.5px] text-slate-400">
              Latest policy, commission, and endorsement events logged
            </p>
          </div>
          <Link
            href="/broker/policies"
            className="text-[11.5px] font-semibold text-blue-600 hover:underline"
          >
            Audit log →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((act) => {
            const Icon = act.icon
            return (
              <div
                key={act.title}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-50"
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${act.tone}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-slate-800 truncate">
                    {act.title}
                  </p>
                  <p className="text-[10.5px] text-slate-500 truncate">{act.detail}</p>
                  <p className="text-[9.5px] text-slate-400 mt-1">{act.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}