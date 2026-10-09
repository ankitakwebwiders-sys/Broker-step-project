'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Building2,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
  FileSpreadsheet,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  CalendarDays,
  X,
  FileText,
  Send,
  ChevronDown,
  Plus,
  Scale,
  WalletCards,
  FileCheck2,
  Check,
} from 'lucide-react'
import {
  platformKPIsData,
  membershipPlansOverviewData,
  failedPaymentsData,
  upcomingExpiriesData,
  adminBrokerAccountsData,
  platformSystemMetricsData,
  platformActivityLogsData,
  type AdminBrokerAccount,
  type FailedPaymentRecord,
  type UpcomingExpiryRecord,
} from '@/data/admin/dashboard'

interface AdminStatItem {
  id: string
  label: string
  value: string
  change: string
  note: string
  tone: 'emerald' | 'amber' | 'violet' | 'rose' | 'indigo' | 'blue'
  category: 'brokers' | 'revenue'
  link: string
}

const adminKpisList: AdminStatItem[] = [
  {
    id: 'kpi-1',
    label: 'Total Registered Brokers',
    value: '142',
    change: '+12.4%',
    note: '124 active broker accounts',
    tone: 'blue',
    category: 'brokers',
    link: '#broker-directory-section',
  },
  {
    id: 'kpi-2',
    label: 'Active Account Rate',
    value: '87.3%',
    change: '+4.1%',
    note: '118 broker agencies active',
    tone: 'emerald',
    category: 'brokers',
    link: '#broker-directory-section',
  },
  {
    id: 'kpi-3',
    label: 'Monthly Recurring Revenue',
    value: '$34,850',
    change: '+14.2%',
    note: '$418.2K Annual Run Rate',
    tone: 'emerald',
    category: 'revenue',
    link: '#membership-overview-section',
  },
  {
    id: 'kpi-4',
    label: 'Managed Policies Volume',
    value: '28,450',
    change: '+8.9%',
    note: '$6.84M gross commission',
    tone: 'indigo',
    category: 'revenue',
    link: '#broker-directory-section',
  },
  {
    id: 'kpi-5',
    label: 'Failed Payments (Urgent)',
    value: '5',
    change: '$1,845 due',
    note: 'Requires immediate attention',
    tone: 'rose',
    category: 'revenue',
    link: '#failed-payments-section',
  },
  {
    id: 'kpi-6',
    label: 'Upcoming Plan Expiries',
    value: '7',
    change: 'Next 14d',
    note: '3 high churn risk accounts',
    tone: 'amber',
    category: 'revenue',
    link: '#upcoming-expiries-section',
  },
]

function StatCard({ stat }: { stat: AdminStatItem }) {
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
    <a href={stat.link} className="group block">
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
    </a>
  )
}

export default function AdminDashboardPage() {
  // KPI Filter Category
  const [kpiCategory, setKpiCategory] = useState<'all' | 'brokers' | 'revenue'>('all')

  // Broker Directory Filters
  const [brokerStatusFilter, setBrokerStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Pending Verification' | 'Suspended'>('All')
  const [brokerSearch, setBrokerSearch] = useState('')

  // Expiry Horizon Filter
  const [expiryHorizonFilter, setExpiryHorizonFilter] = useState<'all' | '7days' | '14days' | 'trials'>('all')

  // Interactive selected broker drawer (Right-side slide over canvas)
  const [selectedBroker, setSelectedBroker] = useState<AdminBrokerAccount | null>(null)

  // Interactive State for Failed Payments
  const [failedPayments, setFailedPayments] = useState<FailedPaymentRecord[]>(failedPaymentsData)
  const [activeToast, setActiveToast] = useState<string | null>(null)

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBroker) {
        setSelectedBroker(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedBroker])

  // Toast trigger helper
  const showToast = (message: string) => {
    setActiveToast(message)
    setTimeout(() => {
      setActiveToast(null)
    }, 3500)
  }

  // Handle Retry Payment
  const handleRetryPayment = (id: string, brokerName: string) => {
    setFailedPayments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, retryCount: item.retryCount + 1, status: 'Retrying' } : item
      )
    )
    showToast(`Payment retry queued for ${brokerName}. Automated Stripe charge initiated.`)
  }

  // Handle Send Payment Link
  const handleSendPaymentLink = (brokerName: string, email: string) => {
    showToast(`Secure payment & update link emailed to ${brokerName} (${email}).`)
  }

  // Handle Grace Period Extension
  const handleExtendGrace = (id: string, brokerName: string) => {
    setFailedPayments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, gracePeriodEnds: 'Extended +7 Days (Oct 17, 2026)' } : item
      )
    )
    showToast(`Grace period for ${brokerName} extended by 7 days.`)
  }

  // Filtered KPI list
  const filteredKpis = useMemo(() => {
    if (kpiCategory === 'all') return adminKpisList
    return adminKpisList.filter((k) => k.category === kpiCategory)
  }, [kpiCategory])

  // Filtered brokers list
  const filteredBrokers = useMemo(() => {
    return adminBrokerAccountsData.filter((b) => {
      const matchesStatus = brokerStatusFilter === 'All' || b.status === brokerStatusFilter
      const query = brokerSearch.toLowerCase().trim()
      const matchesSearch =
        !query ||
        b.name.toLowerCase().includes(query) ||
        b.agencyName.toLowerCase().includes(query) ||
        b.brokerCode.toLowerCase().includes(query) ||
        b.cityState.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [brokerStatusFilter, brokerSearch])

  // Filtered upcoming expiries
  const filteredExpiries = useMemo(() => {
    if (expiryHorizonFilter === '7days') {
      return upcomingExpiriesData.filter((e) => e.daysRemaining <= 7)
    }
    if (expiryHorizonFilter === '14days') {
      return upcomingExpiriesData.filter((e) => e.daysRemaining <= 14)
    }
    if (expiryHorizonFilter === 'trials') {
      return upcomingExpiriesData.filter((e) => e.billingCycle === '14-Day Trial')
    }
    return upcomingExpiriesData
  }, [expiryHorizonFilter])

  // Currency Formatter
  const fmt = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="p-4 sm:p-7 max-w-[1600px] mx-auto space-y-7">
      {/* ───── Toast Notification ───── */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-[12.5px] font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{activeToast}</span>
          <button
            onClick={() => setActiveToast(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ───── Header Bar (Exact Broker Dashboard Styling) ───── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Super Admin Console · Platform Overview
          </p>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 sm:text-[30px]">
            Platform Executive Dashboard
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Platform-level broker accounts, memberships, failed payments requiring attention, and infrastructure health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex cursor-pointer">
            <CalendarDays className="size-4 text-slate-400" />
            <span>2026 Fiscal Year</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
          <Link
            href="/admin/brokers"
            className="group flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600"
          >
            <Plus className="size-4 transition-transform group-hover:rotate-90" />
            <span>Add New Broker</span>
          </Link>
        </div>
      </div>

      {/* ───── 1. Platform-Level Broker Account Summary (Stat Cards) ───── */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
              Platform-Level Broker Account Summary
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {adminKpisList.length} KPIs
            </span>
          </div>

          {/* KPI category filter tabs */}
          <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 text-[11.5px] font-medium text-slate-600">
            <button
              onClick={() => setKpiCategory('all')}
              className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${kpiCategory === 'all'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
                }`}
            >
              All KPIs ({adminKpisList.length})
            </button>
            <button
              onClick={() => setKpiCategory('brokers')}
              className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${kpiCategory === 'brokers'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
                }`}
            >
              Broker Accounts (2)
            </button>
            <button
              onClick={() => setKpiCategory('revenue')}
              className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${kpiCategory === 'revenue'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
                }`}
            >
              Revenue &amp; Payments (4)
            </button>
          </div>
        </div>

        {/* 6 KPI Cards Grid */}
        <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {filteredKpis.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>
      {/* ───── 5. Active & Inactive Broker Accounts Directory ───── */}
      <section id="broker-directory-section" className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <Users className="size-4" />
              </span>
              <h2 className="text-[16px] font-bold text-slate-900">
                Active &amp; Inactive Broker Accounts
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {filteredBrokers.length} Accounts
              </span>
            </div>
            <p className="mt-1 text-[12px] text-slate-500">
              Platform directory of broker accounts, verification states, policy counts, and commission volume
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              value={brokerSearch}
              onChange={(e) => setBrokerSearch(e.target.value)}
              placeholder="Search broker, agency, code..."
              className="w-full h-9 rounded-xl border border-slate-200 pl-8 pr-3 text-[12px] placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11.5px]">
          {(['All', 'Active', 'Inactive', 'Pending Verification', 'Suspended'] as const).map((status) => {
            const count =
              status === 'All'
                ? adminBrokerAccountsData.length
                : adminBrokerAccountsData.filter((b) => b.status === status).length

            return (
              <button
                key={status}
                onClick={() => setBrokerStatusFilter(status)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition cursor-pointer ${brokerStatusFilter === status
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
              >
                <span>{status}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${brokerStatusFilter === status ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                    }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Directory Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Broker &amp; Agency</th>
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Membership Tier</th>
                  <th className="py-2.5 px-3">Managed Policies</th>
                  <th className="py-2.5 px-3">Gross Commission</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBrokers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No broker accounts match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredBrokers.map((broker) => (
                    <tr key={broker.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Agency */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white text-[11px] font-bold">
                            {broker.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedBroker(broker)}
                              className="font-bold text-slate-900 hover:text-blue-600 transition text-left cursor-pointer"
                            >
                              {broker.name}
                            </button>
                            <span className="text-[11px] text-slate-500 block">{broker.agencyName}</span>
                            <span className="text-[10.5px] text-slate-400 block">{broker.cityState}</span>
                          </div>
                        </div>
                      </td>

                      {/* Broker Code */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {broker.brokerCode}
                      </td>

                      {/* Tier & Billing */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block">{broker.membershipTier}</span>
                        <span className="text-[10.5px] text-slate-400 block">Cycle: {broker.billingCycle}</span>
                      </td>

                      {/* Policies */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-medium text-slate-700">
                        {broker.policiesCount} policies
                      </td>

                      {/* Gross Commission */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                        {fmt(broker.grossCommissionVolume)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${broker.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : broker.status === 'Inactive'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : broker.status === 'Pending Verification'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${broker.status === 'Active'
                              ? 'bg-emerald-500'
                              : broker.status === 'Inactive'
                                ? 'bg-slate-400'
                                : broker.status === 'Pending Verification'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                          />
                          {broker.status}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-3 whitespace-nowrap text-[11px] text-slate-500">
                        {broker.lastActive}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedBroker(broker)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
                          >
                            <span>View</span>
                          </button>
                          <Link
                            href={`/admin/brokers?id=${broker.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                            title="Open full broker management"
                          >
                            <ExternalLink className="size-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>





      {/* ───── 3. Membership / Subscription Status Overview ───── */}
      <section id="membership-overview-section" className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CreditCard className="size-4" />
              </span>
              <h2 className="text-[16px] font-bold text-slate-900">
                Membership / Subscription Status Overview
              </h2>
            </div>
            <p className="mt-1 text-[12px] text-slate-500">
              Platform-level subscription tier breakdown, pricing revenue share, and member lifecycle
            </p>
          </div>

          <Link
            href="/admin/memberships"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
          >
            Manage Plans &amp; Pricing <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Subscription Progress Bar (Exact Broker Collection Progress Style) */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Subscriptions &amp; Member Base
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-[20px] font-bold text-slate-900 font-mono">
                  {platformKPIsData.activeSubscriptions} Paid Accounts
                </span>
                <span className="text-[12px] text-slate-500">
                  of {platformKPIsData.totalBrokers} total registered brokers
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                89.4% Subscription Retention
              </span>
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80 flex">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: '84.5%' }}
              title="Active Paid: 84.5%"
            />
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: '10.5%' }}
              title="14-Day Free Trials: 10.5%"
            />
            <div
              className="h-full bg-rose-400 transition-all duration-500"
              style={{ width: '5.0%' }}
              title="Failed / Overdue: 5.0%"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-600" />
              Active Paid Members: <b className="text-slate-800">{platformKPIsData.activeSubscriptions}</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400" />
              Free Trials: <b className="text-slate-800">{platformKPIsData.trialBrokers} Brokers</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-400" />
              Failed Invoices: <b className="text-rose-700">{platformKPIsData.failedPaymentsCount} Overdue</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              Monthly MRR: <b className="text-emerald-700">{fmt(platformKPIsData.monthlyRecurringRevenue)}</b>
            </span>
          </div>
        </div>

        {/* 4 Tier Plan Cards Grid */}
        <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {membershipPlansOverviewData.map((plan) => (
            <div
              key={plan.id}
              className="group rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[13.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {plan.tierName}
                  </h3>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-blue-700 ring-1 ring-blue-100">
                    ${plan.monthlyPrice}/mo
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug">{plan.featuresSummary}</p>

                <div className="mt-3.5 flex items-baseline justify-between border-t border-slate-200/70 pt-2.5">
                  <div>
                    <span className="text-[18px] font-bold text-slate-900 font-mono">{plan.activeSubscribers}</span>
                    <span className="text-[11px] text-slate-400 ml-1">subscribers</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">{plan.growthMom} MoM</span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Monthly Yield:</span>
                  <span className="font-bold text-slate-900 font-mono">{fmt(plan.monthlyRevenue)}</span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Subscriber Share</span>
                    <span className="font-semibold text-slate-700">{plan.sharePercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${plan.sharePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 text-[10.5px] text-slate-400 flex items-center justify-between">
                <span>Annual: ${plan.annualPrice}/yr</span>
                <Link
                  href={`/admin/memberships?tier=${plan.tierName.toLowerCase()}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Configure &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── 4. Upcoming Membership Expiries & Non-Renewals ───── */}
      <section id="upcoming-expiries-section" className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <CalendarDays className="size-4" />
              </span>
              <h2 className="text-[16px] font-bold text-slate-900">
                Upcoming Membership Expiries &amp; Non-Renewals
              </h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                {filteredExpiries.length} Accounts
              </span>
            </div>
            <p className="mt-1 text-[12px] text-slate-500">
              Proactive churn monitoring for brokers nearing trial expiry or with auto-renewal disabled
            </p>
          </div>

          {/* Filter tabs */}
          <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 text-[11.5px] font-medium text-slate-600">
            <button
              onClick={() => setExpiryHorizonFilter('all')}
              className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${expiryHorizonFilter === 'all'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
                }`}
            >
              All Expiries ({upcomingExpiriesData.length})
            </button>
            <button
              onClick={() => setExpiryHorizonFilter('7days')}
              className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${expiryHorizonFilter === '7days'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
                }`}
            >
              Next 7 Days (3)
            </button>
            <button
              onClick={() => setExpiryHorizonFilter('14days')}
              className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${expiryHorizonFilter === '14days'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
                }`}
            >
              Next 14 Days (7)
            </button>
            <button
              onClick={() => setExpiryHorizonFilter('trials')}
              className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${expiryHorizonFilter === 'trials'
                ? 'bg-white font-semibold text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
                }`}
            >
              14-Day Trials (2)
            </button>
          </div>
        </div>

        {/* Expiries Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Broker &amp; Agency</th>
                  <th className="py-2.5 px-3">Current Plan</th>
                  <th className="py-2.5 px-3">Expiration Date</th>
                  <th className="py-2.5 px-3">Days Remaining</th>
                  <th className="py-2.5 px-3">Auto-Renew Status</th>
                  <th className="py-2.5 px-3">Churn Risk</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpiries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{item.brokerName}</span>
                      <span className="text-[11px] text-slate-500 block">{item.agencyName}</span>
                      <span className="font-mono text-[10.5px] text-slate-400">{item.email}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {item.planTier}
                      <span className="text-[10.5px] text-slate-400 block">Cycle: {item.billingCycle}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {item.expiryDate}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${item.daysRemaining <= 3
                          ? 'bg-rose-100 text-rose-700'
                          : item.daysRemaining <= 7
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                          }`}
                      >
                        <Clock className="size-3" />
                        {item.daysRemaining} days left
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.autoRenew ? (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700">
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          Auto-Renew Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          <XCircle className="size-3 text-rose-500" />
                          Auto-Renew Off
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`rounded px-2 py-0.5 text-[10.5px] font-bold uppercase ${item.churnRisk === 'High'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : item.churnRisk === 'Medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                      >
                        {item.churnRisk} Risk
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => showToast(`Renewal reminder and incentive email dispatched to ${item.brokerName}.`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                          title="Send renewal reminder email"
                        >
                          <Mail className="size-3 text-slate-400" />
                          <span>Reminder</span>
                        </button>
                        <button
                          onClick={() => showToast(`Subscription manually renewed for ${item.brokerName}.`)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
                          title="Manually renew plan"
                        >
                          <span>Renew</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>


      {/* ───── 5. Failed Membership Payments Requiring Attention (Alert Section) ───── */}
      <section id="failed-payments-section" className="rounded-2xl border border-rose-200/90 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                <AlertTriangle className="size-4" />
              </span>
              <h2 className="text-[16px] font-bold text-slate-900">
                Failed Membership Payments Requiring Attention
              </h2>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                {failedPayments.length} Active Overdue
              </span>
            </div>
            <p className="mt-1 text-[12px] text-slate-500">
              Immediate admin intervention required for recurring payment failures, bank declines, and expired cards
            </p>
          </div>

          <button
            onClick={() => showToast('Batch dunning retry dispatched to Stripe for all eligible failed invoices.')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-rose-700 hover:bg-rose-50 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
          >
            <RefreshCw className="size-3.5 text-rose-600" />
            <span>Retry All Invoices ({failedPayments.length})</span>
          </button>
        </div>

        {/* Failed Payments Summary Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-rose-200/70 bg-rose-50/40 p-3.5">
            <p className="text-[11px] font-semibold text-rose-800 uppercase tracking-wide">Total Overdue Amount</p>
            <p className="mt-1 text-[18px] font-bold text-rose-700 font-mono">
              {fmt(platformKPIsData.failedPaymentsAmount)}
            </p>
            <span className="text-[10.5px] text-rose-600">Across 5 broker agencies</span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500">Dunning Recovery Rate</p>
            <p className="mt-1 text-[18px] font-bold text-slate-900 font-mono">
              92.4%
            </p>
            <span className="text-[10.5px] text-emerald-600 font-semibold">+3.2% vs last month</span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500">Max Retry Limit</p>
            <p className="mt-1 text-[18px] font-bold text-slate-900 font-mono">
              3 Attempts
            </p>
            <span className="text-[10.5px] text-slate-500">48-hour retry interval</span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
            <p className="text-[11px] font-medium text-slate-500">Default Grace Period</p>
            <p className="mt-1 text-[18px] font-bold text-slate-900 font-mono">
              7 Days
            </p>
            <span className="text-[10.5px] text-slate-500">Before account suspension</span>
          </div>
        </div>

        {/* Failed Payments Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Broker / Agency</th>
                  <th className="py-3 px-4">Plan &amp; Amount</th>
                  <th className="py-3 px-4">Failure Reason</th>
                  <th className="py-3 px-4">Retries &amp; Overdue</th>
                  <th className="py-3 px-4">Grace Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {failedPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.brokerName}</span>
                        <span className="text-[11px] text-slate-500 block">{item.agencyName}</span>
                        <span className="font-mono text-[10.5px] text-slate-400">{item.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 block">{item.planTier}</span>
                      <span className="text-[13px] font-bold text-rose-600 font-mono">{fmt(item.amountDue)} due</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
                        <XCircle className="size-3" />
                        {item.failureReason}
                      </span>
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">{item.failedDate}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-slate-800">
                          {item.retryCount}/{item.maxRetries} Retries
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                          {item.daysOverdue}d overdue
                        </span>
                      </div>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${(item.retryCount / item.maxRetries) * 100}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[11.5px]">
                      <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                        {item.gracePeriodEnds}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleRetryPayment(item.id, item.brokerName)}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
                          title="Trigger instant retry charge via payment gateway"
                        >
                          <RefreshCw className="size-3" />
                          <span>Retry</span>
                        </button>

                        <button
                          onClick={() => handleSendPaymentLink(item.brokerName, item.email)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                          title="Send direct self-service invoice link"
                        >
                          <Send className="size-3 text-slate-400" />
                          <span>Send Link</span>
                        </button>

                        <button
                          onClick={() => handleExtendGrace(item.id, item.brokerName)}
                          className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-[11px] font-medium text-amber-800 hover:bg-amber-100/70 transition cursor-pointer"
                          title="Extend grace period by 7 days to prevent account lock"
                        >
                          <Clock className="size-3 text-amber-600" />
                          <span>+7d Grace</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>


      {/* ───── 6. Relevant Platform-Level Information & Operational Intelligence ───── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Platform Infrastructure & Service Health */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <Activity className="size-4" />
              </span>
              <h3 className="text-[14px] font-bold text-slate-900">
                Platform Infrastructure &amp; Operational Health
              </h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200">
              99.98% System Uptime
            </span>
          </div>

          <div className="space-y-3">
            {platformSystemMetricsData.map((metric) => (
              <div key={metric.service} className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 text-[12px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{metric.service}</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/70 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {metric.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{metric.detail}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10.5px] font-mono text-slate-500">
                  <span>Uptime: <strong className="text-slate-800">{metric.uptime}</strong></span>
                  <span>Latency: <strong className="text-slate-800">{metric.latency}</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-3.5 text-[11.5px] text-blue-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-blue-600 shrink-0" />
              <span>Automated carrier statement extraction accuracy: <strong>98.4%</strong> across 48 templates.</span>
            </span>
            <Link href="/admin/statement-templates" className="font-bold underline text-blue-700 shrink-0 ml-2">
              Templates &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column: Live Platform Audit & Activity Stream */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <FileSpreadsheet className="size-4" />
                </span>
                <h3 className="text-[14px] font-bold text-slate-900">
                  Live Platform Audit Feed
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Real-time Stream</span>
            </div>

            <div className="mt-3.5 space-y-3">
              {platformActivityLogsData.map((log) => (
                <div key={log.id} className="relative pl-4 border-l-2 border-slate-200 text-[11.5px] space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.title}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-500 leading-snug text-[11px]">{log.description}</p>
                  <span className="text-[10px] font-mono text-slate-400 block">By: {log.user}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              href="/admin/notifications"
              className="text-[11.5px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Security &amp; Activity Log</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ───── 7. Broker Account Details Slide-Over Canvas Drawer ───── */}
      {selectedBroker && (
        <div
          onClick={() => setSelectedBroker(null)}
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-full sm:max-w-xl md:max-w-2xl flex-col bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-md">
                  {selectedBroker.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Broker Account Details
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{selectedBroker.brokerCode}</span>
                  </div>
                  <h3 className="text-[17px] font-bold text-slate-900 leading-tight mt-0.5">{selectedBroker.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedBroker(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-[12px]">

              {/* Status & Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center">
                <div>
                  <span className="text-[10.5px] text-slate-400 block uppercase">Status</span>
                  <span className="font-bold text-emerald-700 text-[12.5px] block mt-0.5">{selectedBroker.status}</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block uppercase">Plan Tier</span>
                  <span className="font-bold text-blue-700 text-[12.5px] block mt-0.5">{selectedBroker.membershipTier}</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block uppercase">Policies</span>
                  <span className="font-bold text-slate-900 text-[12.5px] block mt-0.5">{selectedBroker.policiesCount}</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-slate-400 block uppercase">Gross Vol</span>
                  <span className="font-bold text-slate-900 text-[12.5px] block mt-0.5">{fmt(selectedBroker.grossCommissionVolume)}</span>
                </div>
              </div>

              {/* Agency Profile */}
              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-xs space-y-2.5">
                <h4 className="text-[11.5px] font-bold text-slate-900 uppercase tracking-wider">
                  Agency &amp; Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Agency Business</span>
                    <span className="font-semibold text-slate-800">{selectedBroker.agencyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Location</span>
                    <span className="font-semibold text-slate-800">{selectedBroker.cityState}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Email</span>
                    <span className="font-mono text-slate-700">{selectedBroker.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Phone</span>
                    <span className="font-mono text-slate-700">{selectedBroker.phone}</span>
                  </div>
                </div>
              </div>

              {/* Membership & Billing */}
              <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-xs space-y-2.5">
                <h4 className="text-[11.5px] font-bold text-slate-900 uppercase tracking-wider">
                  Subscription &amp; Billing State
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Billing Cycle</span>
                    <span className="font-semibold text-slate-800">{selectedBroker.billingCycle} Recurring</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Auto-Renewal</span>
                    <span className={`font-semibold ${selectedBroker.autoRenew ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedBroker.autoRenew ? 'Active (Auto-charging)' : 'Disabled / Manual invoice'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Member Since</span>
                    <span className="text-slate-700">{selectedBroker.joinedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Last Platform Activity</span>
                    <span className="text-slate-700">{selectedBroker.lastActive}</span>
                  </div>
                </div>
              </div>

              {/* Administrative Actions Inside Drawer */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Super Admin Management
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      showToast(`Password reset link dispatched to ${selectedBroker.email}.`)
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Send Password Reset
                  </button>
                  <button
                    onClick={() => {
                      showToast(`Audit report for ${selectedBroker.agencyName} generated.`)
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Generate Account Audit
                  </button>
                  <Link
                    href={`/admin/brokers?id=${selectedBroker.id}`}
                    className="rounded-lg bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-600 transition cursor-pointer"
                  >
                    Full Broker Profile &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 sm:px-6 py-3.5 bg-slate-50/50 shrink-0">
              <button
                onClick={() => setSelectedBroker(null)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer text-center"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
