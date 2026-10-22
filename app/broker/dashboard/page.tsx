'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  Clock,
  Check,
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
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  WalletCards,
  X,
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
import {
  carrierOptions,
  lineOfBusinessOptions,
  transactionTypeOptions,
  type PolicyStatus,
  type TransactionType,
} from '@/data/broker/policies'
import { initialClients, type ClientItem } from '@/data/broker/clients'

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
    tone: 'bg-blue-50 text-blue-600 ring-blue-100/80 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/40 dark:group-hover:bg-blue-600 dark:group-hover:text-white',
    badge: 'Fast entry',
  },
  {
    title: 'Upload statement',
    description: 'Auto-reconcile carrier commissions',
    icon: FileSpreadsheet,
    href: '/broker/statements',
    tone: 'bg-emerald-50 text-emerald-600 ring-emerald-100/80 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/40 dark:group-hover:bg-emerald-600 dark:group-hover:text-white',
    badge: '3 pending',
  },
  {
    title: 'Review renewals',
    description: '8 policies renewing in next 30 days',
    icon: CalendarDays,
    href: '/broker/renewals',
    tone: 'bg-amber-50 text-amber-600 ring-amber-100/80 group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/40 dark:group-hover:bg-amber-600 dark:group-hover:text-white',
    badge: 'Priority',
  },
]

function StatCard({ stat }: { stat: KpiStat }) {
  const toneClasses =
    stat.tone === 'emerald'
      ? 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/40'
      : stat.tone === 'amber'
        ? 'bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/40'
        : stat.tone === 'violet'
          ? 'bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900/40'
          : stat.tone === 'rose'
            ? 'bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-900/40'
            : stat.tone === 'indigo'
              ? 'bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-900/40'
              : 'bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/40'

  return (
    <Link href={stat.link} className="group block">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.22)] dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-blue-500/40">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-600 leading-tight dark:text-slate-400">
              {stat.label}
            </p>
            <span
              className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ${toneClasses}`}
            >
              {stat.change}
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight dark:text-slate-100">
            {stat.value}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100/80 pt-2 text-xs text-slate-500 dark:border-white/5 dark:text-slate-400">
          <span>{stat.note}</span>

        </div>
      </div>
    </Link>
  )
}

const MONTHLY_TREND_DATA = [
  { month: 'Jan', prodPct: 43, commPct: 25, prodVal: '$172,000', commVal: '$25,800' },
  { month: 'Feb', prodPct: 52, commPct: 33, prodVal: '$208,000', commVal: '$31,200' },
  { month: 'Mar', prodPct: 63, commPct: 38, prodVal: '$252,000', commVal: '$37,800' },
  { month: 'Apr', prodPct: 58, commPct: 40, prodVal: '$232,000', commVal: '$34,800' },
  { month: 'May', prodPct: 77, commPct: 50, prodVal: '$308,000', commVal: '$46,200' },
  { month: 'Jun', prodPct: 83, commPct: 54, prodVal: '$332,000', commVal: '$49,800' },
  { month: 'Jul', prodPct: 88, commPct: 58, prodVal: '$352,000', commVal: '$55,200' },
  { month: 'Aug', prodPct: 92, commPct: 60, prodVal: '$368,000', commVal: '$57,000' },
  { month: 'Sep', prodPct: 85, commPct: 64, prodVal: '$340,000', commVal: '$61,800' },
  { month: 'Oct', prodPct: 90, commPct: 71, prodVal: '$360,000', commVal: '$65,400' },
  { month: 'Nov', prodPct: 82, commPct: 68, prodVal: '$328,000', commVal: '$70,200' },
  { month: 'Dec', prodPct: 95, commPct: 74, prodVal: '$380,000', commVal: '$75,000' },
]

export default function BrokerDashboardPage() {
  const [range, setRange] = useState('Last 12 months')
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [allClients, setAllClients] = useState<ClientItem[]>(initialClients)
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const clientSearchRef = useRef<HTMLDivElement>(null)

  // Load custom clients added via Add Client form with deduplication
  useEffect(() => {
    try {
      const stored = localStorage.getItem('broker_custom_clients')
      if (stored) {
        const parsed: ClientItem[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clientMap = new Map<string, ClientItem>()
          initialClients.forEach((c) => clientMap.set(c.id, c))
          parsed.forEach((c) => clientMap.set(c.id, c))
          setAllClients(Array.from(clientMap.values()))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [isAddPolicyModalOpen])

  // Close client search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setIsClientDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const defaultClient = initialClients[0]
  const [policyForm, setPolicyForm] = useState({
    clientId: defaultClient?.id || 'cli-1',
    clientName: defaultClient?.name || 'Marcus Vance',
    businessName: defaultClient?.businessName || 'Apex Logistics Corp',
    clientEmail: defaultClient?.email || 'marcus@apexlogistics.com',
    clientPhone: defaultClient?.phone || '+1 (555) 234-5678',
    carrier: 'Travelers',
    policyNumber: '',
    isPendingNumber: false,
    policyStatus: 'Active' as PolicyStatus,
    lineOfBusiness: 'Commercial Property',
    transactionType: 'New Business' as TransactionType,
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    premium: 15000,
    commissionRate: 15,
    brokerSplit: 70,
    actualPaidCommission: 0,
    notes: '',
  })

  // Live filter for client accounts by name, company, email, phone, or id
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return allClients
    const q = clientSearchQuery.toLowerCase()
    return allClients.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.businessName && c.businessName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.otherIdentifier && c.otherIdentifier.toLowerCase().includes(q))
    )
  }, [allClients, clientSearchQuery])

  const handleSelectClient = (client: ClientItem) => {
    setPolicyForm((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      businessName: client.businessName || '',
      clientEmail: client.email || '',
      clientPhone: client.phone || '',
    }))
    setClientSearchQuery('')
    setIsClientDropdownOpen(false)
  }

  const calculatedExpectedCommission = useMemo(() => {
    const gross = (policyForm.premium * (policyForm.commissionRate || 0)) / 100
    const net = (gross * (policyForm.brokerSplit || 0)) / 100
    return Math.round(net * 100) / 100
  }, [policyForm.premium, policyForm.commissionRate, policyForm.brokerSplit])

  const calculatedOutstanding = useMemo(() => {
    const diff = calculatedExpectedCommission - (policyForm.actualPaidCommission || 0)
    return Math.max(0, Math.round(diff * 100) / 100)
  }, [calculatedExpectedCommission, policyForm.actualPaidCommission])

  const handleSavePolicyForm = (e: React.FormEvent) => {
    e.preventDefault()
    const finalPolicyNum = policyForm.isPendingNumber
      ? 'Pending'
      : policyForm.policyNumber.trim() || `POL-${policyForm.carrier.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`

    // Attach policy to the target client's account in localStorage
    try {
      const stored = localStorage.getItem('broker_custom_clients')
      const currentList: ClientItem[] = stored ? JSON.parse(stored) : [...initialClients]
      const clientIndex = currentList.findIndex((c) => c.id === policyForm.clientId)

      const newPolicy = {
        id: `pol-${Date.now()}`,
        policyNumber: finalPolicyNum,
        type: policyForm.lineOfBusiness,
        carrier: policyForm.carrier,
        premium: `$${policyForm.premium.toLocaleString()}`,
        effectiveDate: policyForm.effectiveDate,
        expirationDate: policyForm.expiryDate,
        status: (policyForm.policyStatus === 'Active' ? 'Active' : policyForm.policyStatus) as any,
        rateSplit: `${policyForm.commissionRate}% / ${policyForm.brokerSplit}%`,
        expectedCommission: `$${calculatedExpectedCommission.toLocaleString()}`,
        paidCommission: `$${(policyForm.actualPaidCommission || 0).toLocaleString()}`,
        commissionStatus: (policyForm.actualPaidCommission >= calculatedExpectedCommission && calculatedExpectedCommission > 0 ? 'Paid' : 'Unpaid') as any,
        policyNumberPending: policyForm.isPendingNumber,
      }

      if (clientIndex >= 0) {
        currentList[clientIndex].policies = [newPolicy, ...(currentList[clientIndex].policies || [])]
        localStorage.setItem('broker_custom_clients', JSON.stringify(currentList))
      } else {
        const baseClient = initialClients.find((c) => c.id === policyForm.clientId)
        if (baseClient) {
          const updatedClient = {
            ...baseClient,
            policies: [newPolicy, ...(baseClient.policies || [])],
          }
          currentList.push(updatedClient)
          localStorage.setItem('broker_custom_clients', JSON.stringify(currentList))
        }
      }
    } catch (err) {
      console.error('Failed to attach policy to client account:', err)
    }

    setIsAddPolicyModalOpen(false)
    setToastMessage(`Policy ${finalPolicyNum} added to ${policyForm.clientName}'s account!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const displayedTrendData = useMemo(() => {
    if (range === 'Last 6 months') return MONTHLY_TREND_DATA.slice(-6)
    if (range === 'This year') return MONTHLY_TREND_DATA.slice(0, 10)
    return MONTHLY_TREND_DATA
  }, [range])
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
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Tuesday, October 8, 2026 · Live Overview
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Good morning, Jordan
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] text-slate-500 leading-relaxed">
            Here is what is happening across your book of business today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:flex dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-white/20">
            <CalendarDays className="size-4 text-slate-400 dark:text-slate-400" />
            <span>2026 Fiscal Year</span>
            <ChevronDown className="size-3.5 text-slate-400 dark:text-slate-400" />
          </button>
          <Link
            href="/broker/clients?action=add"
            className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 cursor-pointer dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-white/20"
          >
            <UserPlus className="size-4 text-slate-500 transition-transform group-hover:scale-110 dark:text-slate-400" />
            <span>Add Client</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsAddPolicyModalOpen(true)}
            className="group flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-900/30"
          >
            <Plus className="size-4 transition-transform group-hover:rotate-90" />
            <span>Add New Policy</span>
          </button>
        </div>
      </div>

      {/* ───── 3.1 KPI Cards (All 11 KPIs) ───── */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Key Performance Indicators
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {dashboardStats.length} KPIs
            </span>
          </div>

          {/* KPI category filter tabs */}
          <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-100/70 p-1 text-xs sm:text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-slate-900/80">
            <button
              onClick={() => setKpiCategory('all')}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${kpiCategory === 'all'
                ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-blue-600 dark:text-white'
                : 'hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
            >
              All KPIs (11)
            </button>
            <button
              onClick={() => setKpiCategory('production')}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${kpiCategory === 'production'
                ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-blue-600 dark:text-white'
                : 'hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
            >
              Production & Policies (5)
            </button>
            <button
              onClick={() => setKpiCategory('commission')}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${kpiCategory === 'commission'
                ? 'bg-white font-semibold text-slate-900 shadow-sm dark:bg-blue-600 dark:text-white'
                : 'hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
            >
              Commissions & Reconciliation (6)
            </button>
          </div>
        </div>

        {/* 11 KPI Cards Grid with Clickable Drill-Downs (5 cards per row on desktop) */}
        <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {filteredKpis.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </section>

      {/* ───── 3.2 Upcoming Renewals (7/30/60/90 Day Views) + Quick Actions ───── */}
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr] items-stretch">
        {/* Upcoming Renewals Card */}
        <section className="flex flex-col h-auto xl:h-[480px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 p-3.5 sm:px-5 sm:py-4 bg-white">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="flex size-8.5 sm:size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 shrink-0">
                <CalendarDays className="size-4 sm:size-4.5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
                    Upcoming Renewals
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] sm:text-xs font-bold text-blue-700 ring-1 ring-blue-100/80">
                    {filteredRenewals.length} {filteredRenewals.length === 1 ? 'policy' : 'policies'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 truncate sm:whitespace-normal">
                  Active policy expirations requiring broker review &amp; outreach
                </p>
              </div>
            </div>

            <Link
              href="/broker/renewals"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition self-start sm:self-auto shrink-0"
            >
              <span>Renewals Hub</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {/* Timeframe Controls Bar */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5 border-b border-slate-100 bg-slate-50/70 px-3 sm:px-5 py-2.5 dark:border-white/5 dark:bg-slate-900/50">
            <div className="overflow-x-auto scrollbar-none pb-0.5 xs:pb-0">
              <div className="inline-flex rounded-xl border border-slate-200/80 bg-slate-200/60 p-0.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800/80">
                {[
                  { label: '7 Days', days: 7 },
                  { label: '30 Days', days: 30 },
                  { label: '60 Days', days: 60 },
                  { label: '90 Days', days: 90 },
                  { label: 'All', days: 0 },
                ].map((tab) => {
                  const isActive = renewalDaysFilter === tab.days
                  return (
                    <button
                      key={tab.label}
                      onClick={() => setRenewalDaysFilter(tab.days)}
                      className={`rounded-lg px-2 sm:px-3 py-1 transition-all text-xs font-semibold whitespace-nowrap cursor-pointer ${isActive
                        ? 'bg-slate-950 text-white shadow-sm dark:bg-blue-600 dark:text-white'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/60'
                        }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between xs:justify-end gap-1.5 text-xs font-medium text-slate-600">
              <span className="text-slate-500">Pipeline:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-xs">
                {totalRenewalVolume}
              </span>
            </div>
          </div>

          {/* Renewals Table — fills remaining vertical space smoothly */}
          <div className="flex-1 min-h-[260px] max-h-[380px] xl:max-h-none overflow-x-auto overflow-y-auto custom-scrollbar">
            {filteredRenewals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2.5">
                  <CalendarDays className="size-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">No renewals found in this timeframe</p>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
                  There are no policies expiring within {renewalDaysFilter} days.
                </p>
                <button
                  onClick={() => setRenewalDaysFilter(0)}
                  className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition"
                >
                  View All Expirations
                </button>
              </div>
            ) : (
              <table className="w-full min-w-[560px] text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 border-b border-slate-100">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3 sm:px-5 py-2.5">Client &amp; Policy</th>
                    <th className="px-2.5 sm:px-3 py-2.5">Renewal Date</th>
                    <th className="px-2.5 sm:px-3 py-2.5">Premium</th>
                    <th className="px-2.5 sm:px-3 py-2.5">Status</th>
                    <th className="px-3 sm:px-5 py-2.5 text-right min-w-[100px] sm:min-w-[120px] md:sticky md:right-0 bg-slate-50/95 backdrop-blur-xs md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredRenewals.map((row) => (
                    <tr
                      key={row.client}
                      className="group transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-3 sm:px-5 py-3">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div
                            className={`flex size-8 sm:size-8.5 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 ring-black/5 shadow-xs ${row.color}`}
                          >
                            {row.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {row.client}
                            </p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {row.type} · <span className="font-medium text-slate-600">{row.carrier}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2.5 sm:px-3 py-3 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-800">
                          {row.date}
                        </p>
                        {row.daysUntil <= 7 ? (
                          <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10.5px] sm:text-[11px] font-bold text-rose-700 ring-1 ring-rose-200/80">
                            <Clock className="size-2.5" /> in {row.daysUntil} {row.daysUntil === 1 ? 'day' : 'days'}
                          </span>
                        ) : row.daysUntil <= 30 ? (
                          <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] sm:text-[11px] font-bold text-amber-700 ring-1 ring-amber-200/80">
                            in {row.daysUntil} days
                          </span>
                        ) : (
                          <span className="mt-0.5 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] sm:text-[11px] font-medium text-slate-600">
                            in {row.daysUntil} days
                          </span>
                        )}
                      </td>
                      <td className="px-2.5 sm:px-3 py-3 whitespace-nowrap">
                        <p className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                          {row.premium}
                        </p>
                        <span className="block text-[10px] sm:text-[11px] text-slate-400">
                          annualized
                        </span>
                      </td>
                      <td className="px-2.5 sm:px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold ring-1 ${row.status === 'On track'
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/80'
                            : row.status === 'Needs attention'
                              ? 'bg-amber-50 text-amber-700 ring-amber-200/80'
                              : 'bg-rose-50 text-rose-700 ring-rose-200/80'
                            }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${row.status === 'On track'
                              ? 'bg-emerald-500'
                              : row.status === 'Needs attention'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                              }`}
                          />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap min-w-[100px] sm:min-w-[120px] md:sticky md:right-0 bg-white group-hover:bg-slate-50/95 dark:bg-slate-900 dark:group-hover:bg-slate-800 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] dark:md:shadow-none transition-colors">
                        <Link
                          href="/broker/renewals"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 shadow-xs transition dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                        >
                          <span>Review</span>
                          <ArrowRight className="size-3 text-slate-400 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-3.5 sm:px-5 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Showing <strong className="text-slate-900 font-semibold">{filteredRenewals.length}</strong> of{' '}
                <strong className="text-slate-900 font-semibold">{upcomingRenewals.length}</strong> accounts
              </span>
            </div>
            <Link
              href="/broker/renewals"
              className="inline-flex items-center justify-center sm:justify-start gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition"
            >
              <span>Manage all renewals</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </section>

        {/* Quick Actions Shortcuts Card */}
        <section className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] h-auto xl:h-[480px] dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-white/5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight dark:text-slate-100">Quick Actions</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Direct operations &amp; workflow shortcuts
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-0.5 text-xs font-semibold text-blue-700 shrink-0 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-400">
              <Sparkles className="size-3 text-blue-600 dark:text-blue-400" /> Shortcuts
            </span>
          </div>

          {/* Action cards with consistent responsive spacing */}
          <div className="my-auto flex flex-col gap-2.5 sm:gap-3 py-3 sm:py-0">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white p-3 sm:p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-slate-50/50 hover:shadow-md hover:shadow-blue-500/5 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-blue-500/40 dark:hover:bg-white/[0.04] dark:hover:shadow-blue-950/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-200 ${action.tone}`}
                    >
                      <Icon className="size-4.5 sm:size-5 transition-transform group-hover:scale-110" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                          {action.title}
                        </p>
                        <span className="rounded-full bg-slate-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-600 shrink-0 dark:bg-slate-800 dark:text-slate-400">
                          {action.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 sm:truncate dark:text-slate-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex size-7 sm:size-7.5 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:translate-x-0.5 dark:bg-slate-800/80 dark:text-slate-400 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400">
                    <ArrowUpRight className="size-3.5 sm:size-4" />
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5">
            <Link
              href="/broker/dashboard/policy"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-900/25"
            >
              <Plus className="size-3.5" /> Bind New Policy
            </Link>
          </div>
        </section>
      </div>

      {/* ───── 3.2 Production Summary ───── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <TrendingUp className="size-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Production Summary
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              New business, renewals, carrier volume, and line-of-business distribution
            </p>
          </div>


        </div>

        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Link
            href="/broker/policies"
            className="group rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/20"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">New Business</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              $45,000
            </p>
            <span className="mt-1 inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +15.3% this month
            </span>
          </Link>

          <Link
            href="/broker/renewals"
            className="group rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/20"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Renewals</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              $97,000
            </p>
            <span className="mt-1 inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              +10.8% this month
            </span>
          </Link>

          <Link
            href="/"
            className="group rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 transition hover:border-blue-300 hover:bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/40 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/30"
          >
            <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Total Production</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              $142,000
            </p>
            <span className="mt-1 inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              +12.1% total MTD
            </span>
          </Link>

          <Link
            href="/broker/carriers"
            className="group rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/20"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Top Carrier Share</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Travelers (41%)
            </p>
            <span className="mt-1 inline-flex text-xs font-medium text-slate-700 dark:text-slate-300">
              $58,000 volume
            </span>
          </Link>

          <Link
            href="/broker/policies"
            className="group col-span-2 sm:col-span-1 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/20"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Active Policies</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              1,192
            </p>
            <span className="mt-1 inline-flex text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              92.8% retention
            </span>
          </Link>
        </div>

        {/* Carrier Production & LOB Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Carrier Production */}
          <div className="rounded-xl border border-slate-200/70 p-4 sm:p-5 dark:border-white/10 dark:bg-slate-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                  Carrier Production
                </h3>
              </div>
              <Link
                href="/broker/carriers"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                View all carriers
              </Link>
            </div>
            <div className="mt-3.5 space-y-3">
              {carrierProductionData.map((c) => (
                <Link
                  key={c.carrier}
                  href={c.link}
                  className="group block space-y-1.5 rounded-lg p-2 transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors dark:text-slate-200 dark:group-hover:text-blue-400">
                      {c.carrier}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-500 text-xs dark:text-slate-400">
                        {c.policies} policies
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{c.amount}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
          <div className="rounded-xl border border-slate-200/70 p-4 sm:p-5 dark:border-white/10 dark:bg-slate-900/40">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                  Line-of-Business Production
                </h3>
              </div>

            </div>
            <div className="mt-3.5 space-y-3">
              {lobProductionData.map((lob) => (
                <Link
                  key={lob.lob}
                  href={lob.link}
                  className="group block space-y-1.5 rounded-lg p-2 transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800 group-hover:text-violet-600 transition-colors dark:text-slate-200 dark:group-hover:text-violet-400">
                      {lob.lob}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{lob.amount} ({lob.percentage}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
        <div className="rounded-xl border border-slate-200/70 bg-white p-4 sm:p-5 pt-5 shadow-xs overflow-hidden">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                Monthly Production &amp; Commission Trend
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Historical growth and commission collection across all lines
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-600 shadow-2xs" /> Production
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-violet-400 shadow-2xs" /> Commission
                </span>
              </div>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#0170FE] dark:bg-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20"
              >
                <option value="Last 12 months">Last 12 months</option>
                <option value="Last 6 months">Last 6 months</option>
                <option value="This year">This year</option>
              </select>
            </div>
          </div>

          {/* Scrollable Container with Sticky Y-Axis on Mobile */}
          <div className="relative mt-5 sm:mt-6">
            <div className="overflow-x-auto pb-1 scrollbar-thin">
              <div className="flex h-[220px] min-w-[540px] sm:min-w-0 items-end gap-1.5 border-b border-l border-slate-100 pb-0 pt-3 sm:gap-3">
                {/* Sticky Y-Axis */}
                <div className="sticky left-0 z-10 flex h-full flex-col justify-between pb-1 pr-2.5 pl-0.5 text-xs font-mono text-slate-400 bg-white/95 backdrop-blur-xs select-none border-r border-slate-100 sm:border-r-0">
                  <span>$400k</span>
                  <span>$300k</span>
                  <span>$200k</span>
                  <span>$100k</span>
                  <span>$0</span>
                </div>

                {/* Bars Area */}
                <div className="flex h-full flex-1 items-end justify-between gap-1 sm:gap-2.5 px-1 sm:px-2">
                  {displayedTrendData.map((item) => (
                    <div
                      key={item.month}
                      className="group/bar relative flex h-full flex-1 flex-col items-center justify-end gap-1.5 min-w-[28px] sm:min-w-0 cursor-pointer"
                    >
                      {/* Floating Tooltip on Hover */}
                      <div className="pointer-events-none absolute -top-12 z-20 hidden -translate-x-1/2 flex-col items-center rounded-lg bg-slate-950 px-2 py-1 text-[10.5px] font-semibold text-white shadow-lg group-hover/bar:flex left-1/2 whitespace-nowrap">
                        <span className="text-blue-300">Prod: {item.prodVal}</span>
                        <span className="text-violet-300">Comm: {item.commVal}</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                      </div>

                      {/* Bar Pair */}
                      <div className="flex h-full w-full items-end justify-center gap-0.5 sm:gap-1">
                        <div
                          className="w-1/2 max-w-[14px] rounded-t-[3px] bg-blue-600/90 transition-all duration-300 group-hover/bar:bg-blue-600"
                          style={{ height: `${item.prodPct}%` }}
                        />
                        <div
                          className="w-1/2 max-w-[14px] rounded-t-[3px] bg-violet-400/90 transition-all duration-300 group-hover/bar:bg-violet-500"
                          style={{ height: `${item.commPct}%` }}
                        />
                      </div>

                      {/* Month Label */}
                      <span className="text-[11px] font-medium text-slate-400 transition group-hover/bar:text-slate-900 group-hover/bar:font-bold">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Swipe Hint */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 sm:hidden px-1">
              <span>← Swipe chart horizontally to view months →</span>
              <span className="font-semibold text-slate-600">{displayedTrendData.length} Months</span>
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
              <h2 className="text-lg font-bold text-slate-900">
                Commission Summary
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Expected vs Paid reconciliations, outstanding balances, partials, chargebacks, and net commission
            </p>
          </div>

          <Link
            href="/broker/commissions"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
          >
            Commission Portal <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Expected vs Actual Collection Bar */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reconciliation &amp; Collection Progress
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {commissionSummaryBreakdown.actualPaid}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  paid of {commissionSummaryBreakdown.expected} expected
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {commissionSummaryBreakdown.paidRatio}% Collection Rate
              </span>
            </div>
          </div>

          <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80 flex">
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

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-600 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              Paid / Received: <b className="text-slate-900">{commissionSummaryBreakdown.actualPaid}</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-400" />
              Outstanding / Unpaid: <b className="text-slate-900">{commissionSummaryBreakdown.outstanding}</b>
            </span>
            <span className="inline-flex items-center gap-1.5">
              Net Commission: <b className="text-emerald-700 font-bold">{commissionSummaryBreakdown.netCommission}</b>
            </span>
          </div>
        </div>

        {/* 6 Clickable Drill-down Summary Tiles */}
        <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/broker/commissions"
            className="group rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-blue-500/40"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Expected</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
              {commissionSummaryBreakdown.expected}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Total projected</p>
          </Link>

          <Link
            href="/broker/statements"
            className="group rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-emerald-500/40"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Actual / Paid</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {commissionSummaryBreakdown.actualPaid}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Matched in statements</p>
          </Link>

          <Link
            href="/broker/commissions"
            className="group rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-rose-500/40"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Outstanding</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
              {commissionSummaryBreakdown.outstanding}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Awaiting carrier pay</p>
          </Link>

          <Link
            href="/broker/reconciliation"
            className="group rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-amber-500/40"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Partial / Short-Paid</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
              {commissionSummaryBreakdown.partialShortPaid}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Rate variance delta</p>
          </Link>

          <Link
            href="/broker/commissions"
            className="group rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-rose-500/40"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Chargebacks</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
              -{commissionSummaryBreakdown.chargebacks}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Policy cancellations</p>
          </Link>

          <Link
            href="/broker/reconciliation"
            className="group rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-violet-500/40"
          >
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Adjustments</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
              +{commissionSummaryBreakdown.adjustments}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Manual corrections</p>
          </Link>
        </div>
      </section>



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
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Leads Requiring Attention
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Prospects needing immediate outreach or quote finalization
              </p>
            </div>
            <Link
              href="/broker/leads"
              className="text-xs sm:text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline shrink-0"
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
                className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 transition hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lead.company}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ${lead.status === 'Hot Lead'
                      ? 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-900/40'
                      : lead.status === 'Follow-up Required'
                        ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/40'
                        : 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/40'
                      }`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/50 pt-2 text-xs dark:border-white/5">
                  <span className="truncate text-slate-700 max-w-[60%] font-medium dark:text-slate-300">{lead.type}</span>
                  <span className="text-slate-400 shrink-0 dark:text-slate-500">{lead.days}</span>
                </div>

                <div className="mt-2.5 flex items-center justify-end">
                  <Link
                    href="/broker/leads"
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/60"
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
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-3 py-2.5">Lead / Contact</th>
                  <th className="px-3 py-2.5">Line of Business</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Last Contact</th>
                  <th className="px-3 py-2.5 text-right min-w-[110px] w-[110px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">Drill-Down</th>
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
                    className="group border-b border-slate-50 transition last:border-0 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {lead.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lead.company}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-700 font-medium dark:text-slate-300">
                      {lead.type}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`whitespace-nowrap rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ${lead.status === 'Hot Lead'
                          ? 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-900/40'
                          : lead.status === 'Follow-up Required'
                            ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/40'
                            : 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/40'
                          }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 font-medium dark:text-slate-400">
                      {lead.days}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap min-w-[110px] w-[110px] sticky right-0 bg-white group-hover:bg-slate-50/95 dark:bg-slate-900 dark:group-hover:bg-slate-800 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] dark:shadow-none transition-colors">
                      <Link
                        href="/broker/leads"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
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
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Records Requiring Reconciliation
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Statements and commission deltas awaiting manual match
              </p>
            </div>
            <Link
              href="/broker/reconciliation"
              className="text-xs sm:text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline shrink-0"
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
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-slate-200/70 p-3 sm:p-3.5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-slate-50/60 hover:shadow-xs dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-blue-500/40 dark:hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${record.priority === 'High'
                      ? 'bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-900/40'
                      : record.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/40'
                        : 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/40'
                      }`}
                  >
                    <FileCheck2 className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 truncate">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-slate-100 dark:group-hover:text-blue-400">
                      {record.carrier}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">{record.statement}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100/80 pt-2 sm:pt-0 shrink-0 dark:border-white/5">
                  <p className="text-sm font-bold text-slate-900 font-mono dark:text-slate-100">
                    {record.discrepancy}
                  </p>
                  <span
                    className={`text-xs font-semibold ${record.status === 'Discrepancy Found'
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
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Pending Work</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Operational queue items requiring broker confirmation
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
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
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-slate-900/40 dark:hover:border-blue-500/40 dark:hover:bg-slate-800/80"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex size-9 items-center justify-center rounded-xl ring-1 ${item.color === 'blue'
                    ? 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900/40'
                    : item.color === 'violet'
                      ? 'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-900/40'
                      : item.color === 'amber'
                        ? 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/40'
                        : 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/40'
                    }`}
                >
                  <Activity className="size-4" />
                </div>
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm dark:bg-blue-600">
                  {item.count} items
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-slate-100 dark:group-hover:text-blue-400">
                  {item.task}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.detail}</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs font-semibold text-blue-600 dark:border-white/5 dark:text-blue-400">
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
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Recent Book Activity
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Latest policy, commission, and endorsement events logged
            </p>
          </div>
          <Link
            href="/broker/policies"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:underline"
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
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50 dark:border-white/5 dark:bg-slate-900/30 dark:hover:bg-white/[0.04]"
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ring-1 ${act.tone}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate dark:text-slate-100">
                    {act.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5 dark:text-slate-400">{act.detail}</p>
                  <p className="text-xs text-slate-400 mt-1 dark:text-slate-500">{act.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ───── Add New Policy Modal Popup (Direct on Dashboard) ───── */}
      {isAddPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Add New Policy
                </h2>
                <p className="text-xs text-slate-500">
                  Configure policy terms, carrier underwriting information, and commission splits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPolicyModalOpen(false)}
                className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSavePolicyForm} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Searchable Client Account Selection */}
              <div ref={clientSearchRef} className="space-y-2 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 dark:text-white">
                      Current Client Account *
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Search client by name to add and bind this policy directly to their account.
                    </p>
                  </div>
                  <Link
                    href="/broker/clients?action=add"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                  >
                    <UserPlus className="size-3.5" />
                    <span>+ New Client Record</span>
                  </Link>
                </div>

                {/* Selected Client Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white p-3 shadow-xs dark:border-blue-900/50 dark:bg-slate-900">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm ring-2 ring-blue-500/20">
                      {policyForm.clientName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {policyForm.clientName}
                        </span>
                        {policyForm.businessName && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Building2 className="size-2.5 text-slate-400" />
                            {policyForm.businessName}
                          </span>
                        )}
                        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono">
                          ID: {policyForm.clientId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {policyForm.clientEmail} {policyForm.clientPhone ? `· ${policyForm.clientPhone}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsClientDropdownOpen(true)
                      setClientSearchQuery('')
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition cursor-pointer dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60"
                  >
                    <Search className="size-3.5" />
                    <span>Search / Change Client</span>
                  </button>
                </div>

                {/* Real-time Client Search Input */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by client name, business name, or email..."
                      value={clientSearchQuery}
                      onChange={(e) => {
                        setClientSearchQuery(e.target.value)
                        setIsClientDropdownOpen(true)
                      }}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      className="h-10.5 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-xs font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-900 dark:border-white/10 dark:text-white"
                    />
                    {clientSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setClientSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {isClientDropdownOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-900 dark:border-white/15">
                      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 backdrop-blur-sm dark:border-white/5 dark:bg-slate-800/90 dark:text-slate-400">
                        <span>Available Accounts ({filteredClients.length})</span>
                        <span className="text-[9px] text-slate-400 normal-case">Click to select for this policy</span>
                      </div>

                      {filteredClients.length === 0 ? (
                        <div className="p-5 text-center">
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            No account found matching &ldquo;<span className="font-semibold text-slate-900 dark:text-white">{clientSearchQuery}</span>&rdquo;
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Check spelling or create a client record.
                          </p>
                          <Link
                            href="/broker/clients?action=add"
                            target="_blank"
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                          >
                            <Plus className="size-3.5" />
                            <span>Add New Client</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                          {filteredClients.map((client) => {
                            const isSelected = client.id === policyForm.clientId
                            const policyCount = client.policies?.length || 0
                            return (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => handleSelectClient(client)}
                                className={`w-full flex items-center justify-between p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer ${
                                  isSelected ? 'bg-blue-50/80 dark:bg-blue-950/50' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                      isSelected
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    {client.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {client.name}
                                      </p>
                                      {client.businessName && (
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                          · {client.businessName}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {client.email} {client.phone ? `· ${client.phone}` : ''}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {policyCount} {policyCount === 1 ? 'policy' : 'policies'}
                                  </span>
                                  {isSelected && (
                                    <div className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                      <Check className="size-3 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Company / Carrier */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                  Insurance Company / Carrier *
                </label>
                <select
                  value={policyForm.carrier}
                  onChange={(e) => setPolicyForm({ ...policyForm, carrier: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:bg-slate-900 dark:border-white/10 dark:text-white"
                  required
                >
                  {carrierOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Policy Number & Pending Checkbox */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Policy Number (Manual or Pending)
                  </label>
                  <input
                    type="text"
                    placeholder={policyForm.isPendingNumber ? 'Pending from carrier' : 'e.g., POL-TRV-89421'}
                    disabled={policyForm.isPendingNumber}
                    value={policyForm.policyNumber}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policyForm.isPendingNumber}
                      onChange={(e) => setPolicyForm({ ...policyForm, isPendingNumber: e.target.checked })}
                      className="size-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Mark as Pending / Blank</span>
                  </label>
                </div>
              </div>

              {/* Status, LOB & Transaction Type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Policy Status *
                  </label>
                  <select
                    value={policyForm.policyStatus}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyStatus: e.target.value as PolicyStatus })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Historical">Historical</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Line of Business *
                  </label>
                  <select
                    value={policyForm.lineOfBusiness}
                    onChange={(e) => setPolicyForm({ ...policyForm, lineOfBusiness: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {lineOfBusinessOptions.map((lob) => (
                      <option key={lob} value={lob}>
                        {lob}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Transaction Type *
                  </label>
                  <select
                    value={policyForm.transactionType}
                    onChange={(e) => setPolicyForm({ ...policyForm, transactionType: e.target.value as TransactionType })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    {transactionTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Effective and Expiry Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    value={policyForm.effectiveDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={policyForm.expiryDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, expiryDate: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Financial Section: Premium, Rate %, Split % */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Financial Terms &amp; Commission Calculation
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Premium ($) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={policyForm.premium}
                      onChange={(e) => setPolicyForm({ ...policyForm, premium: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Carrier Commission Rate (%) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={policyForm.commissionRate}
                      onChange={(e) => setPolicyForm({ ...policyForm, commissionRate: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Broker / Brokerage Split (%) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={policyForm.brokerSplit}
                      onChange={(e) => setPolicyForm({ ...policyForm, brokerSplit: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Live Calculated Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-slate-200 pt-3">
                  <div className="rounded-lg bg-blue-50/70 p-3">
                    <span className="text-[11px] font-medium text-blue-700">Expected Commission (Calculated)</span>
                    <p className="mt-1 text-lg font-bold text-blue-700 font-mono">
                      ${calculatedExpectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Actual / Paid Commission ($)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={policyForm.actualPaidCommission}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          actualPaidCommission: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="rounded-lg bg-amber-50/70 p-3">
                    <span className="text-[11px] font-medium text-amber-700">Outstanding (Calculated)</span>
                    <p className="mt-1 text-lg font-bold text-amber-700 font-mono">
                      ${calculatedOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Underwriting remarks, special endorsements, or renewal reminders..."
                  value={policyForm.notes}
                  onChange={(e) => setPolicyForm({ ...policyForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddPolicyModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-blue-600 transition cursor-pointer dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Save &amp; Add Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}