'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldCheck,
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  Tag,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  Search,
  Check,
  X,
  RotateCcw,
  Percent,
  Sliders,
  AlertCircle,
  Info,
  ChevronRight,
  Eye,
  Copy,
  ArrowRight,
  SlidersHorizontal,
  CreditCard,
  Building2,
  Users,
  Repeat,
  Gift,
  ListChecks,
  FileSpreadsheet,
  Zap,
} from 'lucide-react'

export interface MembershipPlan {
  id: string
  name: string
  badge?: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  trialPeriod: string
  trialDays: number
  hasDiscount: boolean
  discountPercentage?: number
  promoCode?: string
  status: 'Active' | 'Inactive'
  features: string[]
  enrolledBrokers: number
  popular?: boolean
}

const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Plan',
    badge: 'Independent',
    description: 'Designed for individual brokers getting organized with basic tracking and policy storage.',
    monthlyPrice: 29.0,
    yearlyPrice: 290.0,
    trialPeriod: '14 Days Free',
    trialDays: 14,
    hasDiscount: true,
    discountPercentage: 17,
    status: 'Active',
    enrolledBrokers: 8,
    features: [
      'Client and policy tracking up to 100 accounts',
      'Renewal reminder alerts (30-day horizon)',
      'Basic expected commission calculations',
      'Standard carrier directory',
      'Community email support',
    ],
  },
  {
    id: 'plan-professional',
    name: 'Professional Workspace',
    badge: 'Most Popular',
    popular: true,
    description: 'For growing brokers and teams requiring automated reconciliation, split engines, and lead capture.',
    monthlyPrice: 79.0,
    yearlyPrice: 790.0,
    trialPeriod: '14 Days Free',
    trialDays: 14,
    hasDiscount: true,
    discountPercentage: 17,
    promoCode: 'BROKER2026',
    status: 'Active',
    enrolledBrokers: 28,
    features: [
      'Unlimited client accounts and policy tracking',
      'Automated carrier statement parsing & reconciliation',
      'Multi-carrier commission split schedules and overrides',
      'Dynamic QR lead capture & embeddable intake forms',
      'Detailed exportable reporting (Excel, CSV, PDF)',
      'TCPA marketing consent tracking engine',
      'Priority ticket and email support',
    ],
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Brokerage',
    badge: 'Custom Operations',
    description: 'For established brokerages needing dedicated statement parsers, multi-agent splits, and audit controls.',
    monthlyPrice: 199.0,
    yearlyPrice: 1990.0,
    trialPeriod: '30 Days Free',
    trialDays: 30,
    hasDiscount: true,
    discountPercentage: 17,
    status: 'Active',
    enrolledBrokers: 6,
    features: [
      'Everything in Professional included',
      'Unlimited sub-producer agent logins and split tracking',
      'Custom carrier statement parser configuration',
      'Administrative audit logs and access governance',
      'API access & webhook data synchronization',
      'Dedicated agency account manager & onboarding specialist',
    ],
  },
  {
    id: 'plan-team-growth',
    name: 'Agency Team Add-On',
    badge: 'Legacy / Archived',
    description: 'Archived transitional tier for regional agencies before the unified Enterprise rollout.',
    monthlyPrice: 149.0,
    yearlyPrice: 1490.0,
    trialPeriod: 'No Trial',
    trialDays: 0,
    hasDiscount: false,
    status: 'Inactive',
    enrolledBrokers: 0,
    features: [
      'Up to 5 licensed broker seats',
      'Standard statement reconciliation',
      'Shared client database',
    ],
  },
]

const STANDARD_AVAILABLE_FEATURES = [
  'Client and policy tracking up to 100 accounts',
  'Unlimited client accounts and policy tracking',
  'Automated carrier statement parsing & reconciliation',
  'Multi-carrier commission split schedules and overrides',
  'Dynamic QR lead capture & embeddable intake forms',
  'Detailed exportable reporting (Excel, CSV, PDF)',
  'TCPA marketing consent tracking engine',
  'Unlimited sub-producer agent logins and split tracking',
  'Custom carrier statement parser configuration',
  'Administrative audit logs and access governance',
  'API access & webhook data synchronization',
  'Renewal reminder alerts (30-day horizon)',
  'Priority 24/7 phone & Slack support',
]

type SubmenuTab =
  | 'all'
  | 'pricing'
  | 'billing-frequency'
  | 'trial'
  | 'promotions'
  | 'features'

export default function AdminMembershipsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading membership plans...</div>}>
      <MembershipPlansContent />
    </Suspense>
  )
}

function MembershipPlansContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tabParam = (searchParams.get('tab') as SubmenuTab) || 'all'
  const actionParam = searchParams.get('action')

  const [plans, setPlans] = useState<MembershipPlan[]>(INITIAL_PLANS)
  const [activeTab, setActiveTab] = useState<SubmenuTab>(tabParam)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Create / Edit Modal State (18.2)
  const [modalOpen, setModalOpen] = useState(actionParam === 'create' || actionParam === 'edit')
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(() => {
    if (actionParam === 'edit') {
      return INITIAL_PLANS[1]
    }
    return null
  })

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Listen to navigation changes (both searchParams and custom broker-nav-change events from sidebar)
  useEffect(() => {
    if (actionParam === 'create') {
      setEditingPlan(null)
      setModalOpen(true)
    } else if (actionParam === 'edit') {
      setEditingPlan(plans[1] || plans[0])
      setModalOpen(true)
    }

    if (tabParam && ['all', 'pricing', 'billing-frequency', 'trial', 'promotions', 'features'].includes(tabParam)) {
      setActiveTab(tabParam)
    } else if (!actionParam) {
      setActiveTab('all')
    }
  }, [tabParam, actionParam, plans])

  // Custom listener for instant sidebar clicks
  useEffect(() => {
    const handleNavChange = (e: any) => {
      const searchStr = e?.detail?.search !== undefined ? e.detail.search : window.location.search
      const params = new URLSearchParams(searchStr)
      const tab = params.get('tab') as SubmenuTab | null
      const action = params.get('action')

      if (action === 'create') {
        setEditingPlan(null)
        setModalOpen(true)
      } else if (action === 'edit') {
        setEditingPlan(plans[1] || plans[0])
        setModalOpen(true)
      } else {
        setModalOpen(false)
      }

      if (tab && ['all', 'pricing', 'billing-frequency', 'trial', 'promotions', 'features'].includes(tab)) {
        setActiveTab(tab)
      } else if (!action) {
        setActiveTab('all')
      }
    }

    window.addEventListener('broker-nav-change', handleNavChange)
    window.addEventListener('popstate', handleNavChange)
    return () => {
      window.removeEventListener('broker-nav-change', handleNavChange)
      window.removeEventListener('popstate', handleNavChange)
    }
  }, [plans])

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  function handleTabSelect(tab: SubmenuTab) {
    setActiveTab(tab)
    const targetUrl = tab === 'all' ? '/admin/memberships' : `/admin/memberships?tab=${tab}`
    router.replace(targetUrl, { scroll: false })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: {
            href: targetUrl,
            search: tab === 'all' ? '' : `?tab=${tab}`,
            pathname: '/admin/memberships',
          },
        })
      )
    }
  }

  function handleOpenCreateModal() {
    setEditingPlan(null)
    setModalOpen(true)
    router.replace('/admin/memberships?action=create', { scroll: false })
  }

  function handleOpenEditModal(plan: MembershipPlan) {
    setEditingPlan(plan)
    setModalOpen(true)
    router.replace('/admin/memberships?action=edit', { scroll: false })
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingPlan(null)
    const targetUrl = activeTab === 'all' ? '/admin/memberships' : `/admin/memberships?tab=${activeTab}`
    router.replace(targetUrl, { scroll: false })
  }

  function handleToggleStatus(planId: string) {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const nextStatus = p.status === 'Active' ? 'Inactive' : 'Active'
          showToast(`${p.name} status updated to ${nextStatus}`)
          return { ...p, status: nextStatus }
        }
        return p
      })
    )
  }

  function handleSavePlan(savedPlan: MembershipPlan) {
    if (editingPlan) {
      setPlans((prev) => prev.map((p) => (p.id === savedPlan.id ? savedPlan : p)))
      showToast(`${savedPlan.name} updated successfully!`)
    } else {
      setPlans((prev) => [savedPlan, ...prev])
      showToast(`${savedPlan.name} created successfully!`)
    }
    handleCloseModal()
  }

  // Filtered plans (18.1)
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = p.name.toLowerCase().includes(q)
        const matchDesc = p.description.toLowerCase().includes(q)
        if (!matchName && !matchDesc) return false
      }
      return true
    })
  }, [plans, statusFilter, searchQuery])

  // Count summaries
  const activeCount = plans.filter((p) => p.status === 'Active').length
  const inactiveCount = plans.filter((p) => p.status === 'Inactive').length

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Membership Plans
            </h1>

          </div>
          <p className="mt-1 text-sm text-slate-500">
            Configure commercial plan tiers, monthly/annual pricing, promotional discounts, trial periods, and feature matrices.
          </p>
        </div>

        {/* Global Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0170FE] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0060db] transition"
          >
            <Plus className="size-4" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Configured Plans</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{plans.length}</p>
          <p className="mt-1 text-xs text-slate-400">Available tiers</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Active Public Plans</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Available for broker signup</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Enrolled Broker Base</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">42</p>
          <p className="mt-1 text-xs text-slate-400">Across all active plans</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Average Plan ARPU</p>
          <p className="mt-1 text-2xl font-bold text-[#0170FE]">$79.00</p>
          <p className="mt-1 text-xs text-slate-400">Per broker / month</p>
        </div>
      </div>


      {/* Complete Submenus Navigation Bar - Styled in BLACK (bg-slate-950) matching the Admin Sidebar */}
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {/* 1. All Plans */}
          <button
            type="button"
            onClick={() => handleTabSelect('all')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'all'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <ShieldCheck className={`size-4 ${activeTab === 'all' ? 'text-white' : 'text-slate-500'}`} />
            <span>All Plans</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {plans.length}
            </span>
          </button>

          {/* 2. Pricing */}
          <button
            type="button"
            onClick={() => handleTabSelect('pricing')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'pricing'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <DollarSign className={`size-4 ${activeTab === 'pricing' ? 'text-white' : 'text-slate-500'}`} />
            <span>Pricing</span>
          </button>

          {/* 3. Billing Frequency */}
          <button
            type="button"
            onClick={() => handleTabSelect('billing-frequency')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'billing-frequency'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Repeat className={`size-4 ${activeTab === 'billing-frequency' ? 'text-white' : 'text-slate-500'}`} />
            <span>Billing Frequency</span>
          </button>

          {/* 4. Trial */}
          <button
            type="button"
            onClick={() => handleTabSelect('trial')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'trial'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Clock className={`size-4 ${activeTab === 'trial' ? 'text-white' : 'text-slate-500'}`} />
            <span>Trial Configuration</span>
          </button>

          {/* 5. Discounts / Promotions */}
          <button
            type="button"
            onClick={() => handleTabSelect('promotions')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'promotions'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Gift className={`size-4 ${activeTab === 'promotions' ? 'text-white' : 'text-slate-500'}`} />
            <span>Discounts / Promotions</span>
          </button>

          {/* 6. Plan Features */}
          <button
            type="button"
            onClick={() => handleTabSelect('features')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'features'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <ListChecks className={`size-4 ${activeTab === 'features' ? 'text-white' : 'text-slate-500'}`} />
            <span>Plan Features Matrix</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
         VIEW 1: TAB === 'all' (18.1 Master Plan Listing)
         ========================================================================= */}
      {activeTab === 'all' && (
        <div className="mt-4 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2.5">
                <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plan name or description..."
                    className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0170FE] focus:bg-white focus:ring-2 focus:ring-[#0170FE]/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Showing <strong className="text-slate-800">{filteredPlans.length}</strong> configured plans
              </div>
            </div>
          </div>

          {/* 18.1 Plan Listing Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-4">Plan Name</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Description</th>
                    <th className="py-3.5 px-4">Monthly Price</th>
                    <th className="py-3.5 px-4">Yearly Price</th>
                    <th className="py-3.5 px-4">Trial Period</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 min-w-[260px]">Applicable Features</th>
                    <th className="py-3.5 pl-4 pr-6 text-right min-w-[170px] w-[170px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <ShieldCheck className="size-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-bold text-slate-700">No plans found</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting your search query.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => {
                      const isActive = plan.status === 'Active'
                      return (
                        <tr key={plan.id} className="hover:bg-slate-50/80 transition group align-top">
                          {/* 1. Plan Name */}
                          <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                            <div className="flex items-start gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs">
                                <ShieldCheck className="size-4 text-[#0170FE]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 text-sm group-hover:text-[#0170FE] transition-colors">
                                    {plan.name}
                                  </span>
                                  {plan.popular && (
                                    <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-800">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {plan.enrolledBrokers} brokers enrolled
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Description */}
                          <td className="py-4 px-4">
                            <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                              {plan.description}
                            </p>
                          </td>

                          {/* 3. Monthly Price */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div>
                              <span className="text-sm font-extrabold text-slate-950">
                                ${plan.monthlyPrice.toFixed(2)}
                              </span>
                              <span className="text-xs text-slate-400"> / mo</span>
                            </div>
                          </td>

                          {/* 4. Yearly Price */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-extrabold text-slate-950">
                                  ${plan.yearlyPrice.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-400"> / yr</span>
                              </div>
                              {plan.hasDiscount && (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                  Save {plan.discountPercentage || 17}%
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. Trial Period */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0170FE]">
                              <Clock className="size-3" />
                              {plan.trialPeriod}
                            </span>
                          </td>

                          {/* 6. Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1.5 ${isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                            >
                              <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {plan.status}
                            </span>
                          </td>

                          {/* 7. Features */}
                          <td className="py-4 px-4">
                            <ul className="space-y-1 text-xs text-slate-600 max-w-sm">
                              {plan.features.slice(0, 3).map((feat, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-1.5">
                                  <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">{feat}</span>
                                </li>
                              ))}
                              {plan.features.length > 3 && (
                                <li className="text-xs text-slate-400 font-semibold pl-5">
                                  +{plan.features.length - 3} additional features
                                </li>
                              )}
                            </ul>
                          </td>

                          {/* 8. Actions (Create / Edit / Activate / Deactivate) */}
                          <td className="py-4 pl-4 pr-6 whitespace-nowrap text-right min-w-[170px] w-[170px] sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(plan)}
                                title="Edit Plan Configuration"
                                className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-950 hover:text-white transition"
                              >
                                <Edit3 className="size-3.5" />

                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(plan.id)}
                                title={isActive ? 'Deactivate Plan' : 'Activate Plan'}
                                className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${isActive
                                  ? 'border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                              >
                                {isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 2: TAB === 'pricing' (Pricing Overview & Rate Modeling)
         ========================================================================= */}
      {activeTab === 'pricing' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <DollarSign className="size-4 text-[#0170FE]" />
              Commercial Pricing Tiers &amp; Rate Structure
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Monthly and annual recurring subscription rates configured per agency tier.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {plans.filter((p) => p.status === 'Active').map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-200 p-5 space-y-4 relative bg-slate-50/40">
                  {p.popular && (
                    <span className="absolute -top-3 right-4 rounded-full bg-slate-950 px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                      Recommended
                    </span>
                  )}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{p.badge}</span>
                    <h4 className="text-lg font-bold text-slate-950 mt-0.5">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="border-y border-slate-200 py-3 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-600">Monthly Billing:</span>
                      <span className="text-xl font-extrabold text-slate-950">${p.monthlyPrice.toFixed(2)}<span className="text-xs font-normal text-slate-400">/mo</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-600">Yearly Billing:</span>
                      <div>
                        <span className="text-base font-bold text-slate-950">${p.yearlyPrice.toFixed(2)}<span className="text-xs font-normal text-slate-400">/yr</span></span>
                        <p className="text-xs text-emerald-600 font-semibold text-right">(${(p.yearlyPrice / 12).toFixed(2)}/mo effective)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Active Enrollment:</span>
                    <span className="font-bold text-slate-900">{p.enrolledBrokers} Brokers</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(p)}
                    className="w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Adjust Pricing Tier
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 3: TAB === 'billing-frequency' (Monthly vs Yearly Billing Schedules)
         ========================================================================= */}
      {activeTab === 'billing-frequency' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Repeat className="size-4 text-[#0170FE]" />
                Billing Frequency Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure billing cadences, annual savings incentives, and invoice collection policies.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Monthly Frequency Card */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="size-4 text-[#0170FE]" />
                    Monthly Recurring Billing
                  </h4>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    Active (Default)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Invoices are generated on the 1st of each calendar month or on the broker subscription anniversary.
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <p>• <strong>Grace Period:</strong> 3 calendar days on payment failure before alert banner</p>
                  <p>• <strong>Automatic Retries:</strong> Day 1, Day 3, and Day 7</p>
                  <p>• <strong>Dunning:</strong> In-app notification center alerts + direct email receipts</p>
                </div>
              </div>

              {/* Yearly Frequency Card */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    Yearly Upfront Billing (Prepaid)
                  </h4>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#0170FE]">
                    17% Incentive Applied
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Brokers pre-pay 12 months in advance in exchange for a discounted annual rate (equivalent to 2 months free).
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <p>• <strong>Renewal Notice:</strong> Dispatched 30 days and 7 days prior to charge</p>
                  <p>• <strong>Auto-Renewal:</strong> Enabled by default with broker self-service toggle</p>
                  <p>• <strong>Cancellation Terms:</strong> Retains active access until end of paid 12-month term</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 4: TAB === 'trial' (Trial Configuration & Conversions)
         ========================================================================= */}
      {activeTab === 'trial' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Clock className="size-4 text-[#0170FE]" />
                Trial Period Management &amp; Conversion Rules
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure trial day allowances per plan tier, expiration safeguards, and trial-to-paid conversion pipelines.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 block uppercase">Starter Plan</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">14 Days Free</span>
                <p className="text-xs text-slate-500 mt-1">Basic tracking evaluation with sample data</p>
              </div>
              <div className="rounded-xl border border-[#0170FE]/30 p-4 bg-blue-50/30">
                <span className="text-xs font-bold text-[#0170FE] block uppercase">Professional Workspace</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">14 Days Free</span>
                <p className="text-xs text-slate-500 mt-1">Full statement reconciliation engine demo</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 block uppercase">Enterprise Brokerage</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">30 Days Pilot</span>
                <p className="text-xs text-slate-500 mt-1">Guided pilot onboarding with parser setup</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-xs space-y-2 mt-2">
              <p className="font-bold text-slate-900">Trial Conversion Rules:</p>
              <p className="text-slate-600">• <strong>Day 10 Reminder:</strong> Automated notification sent 4 days before trial concludes.</p>
              <p className="text-slate-600">• <strong>Day 14 Expiration:</strong> Account prompts payment method entry or gracefully pauses premium features without deleting client data.</p>
              <p className="text-slate-600">• <strong>Admin Extension Override:</strong> Admins can grant complimentary trial extensions in the Broker Details drawer.</p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 5: TAB === 'promotions' (Discounts & Promotional Codes)
         ========================================================================= */}
      {activeTab === 'promotions' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                  <Gift className="size-4 text-[#0170FE]" />
                  Active Discounts &amp; Promotional Codes
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Create and manage voucher codes, seasonal promotions, and affiliate agency rate discounts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => showToast('New promotional campaign code created')}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                <Plus className="size-3.5" />
                <span>Add Promo Code</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Promo Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Applicable Plan</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Redemptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-[#0170FE]">BROKER2026</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">20% Off</td>
                    <td className="py-3 px-4">Professional Plan</td>
                    <td className="py-3 px-4 text-slate-500">First 3 Months</td>
                    <td className="py-3 px-4"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">Active</span></td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">14 Brokers</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-[#0170FE]">ANNUAL17</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">17% Off (2 Months Free)</td>
                    <td className="py-3 px-4">All Yearly Plans</td>
                    <td className="py-3 px-4 text-slate-500">Annual Billing</td>
                    <td className="py-3 px-4"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">Active</span></td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">22 Brokers</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">FOUNDINGPARTNER</td>
                    <td className="py-3 px-4 font-bold text-purple-600">30% Off Lifetime</td>
                    <td className="py-3 px-4">Enterprise Brokerage</td>
                    <td className="py-3 px-4 text-slate-500">Recurring</td>
                    <td className="py-3 px-4"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">Archived</span></td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">5 Brokers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         VIEW 6: TAB === 'features' (Plan Features Matrix)
         ========================================================================= */}
      {activeTab === 'features' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <ListChecks className="size-4 text-[#0170FE]" />
                Cross-Plan Capability &amp; Feature Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Comparative feature matrix across all tiers according to SOW feature configuration rules.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase">
                    <th className="py-3.5 pl-6 pr-4">Feature / Platform Capability</th>
                    <th className="py-3.5 px-4 text-center">Starter ($29)</th>
                    <th className="py-3.5 px-4 text-center bg-blue-50/40 text-blue-900">Professional ($79)</th>
                    <th className="py-3.5 px-4 text-center">Enterprise ($199)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 pl-6 pr-4 font-bold text-slate-900">Client Accounts &amp; Policy Records</td>
                    <td className="py-3 px-4 text-center text-slate-600">Up to 100</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-blue-50/20">Unlimited</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">Unlimited</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 pl-6 pr-4 font-bold text-slate-900">Automated Statement Parsing</td>
                    <td className="py-3 px-4 text-center text-slate-400">Manual Entry</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-blue-50/20">Standard Formats</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">Custom Parsers Included</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 pl-6 pr-4 font-bold text-slate-900">Commission Split Engine &amp; Overrides</td>
                    <td className="py-3 px-4 text-center text-slate-400">Standard Schedule</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-blue-50/20">Multi-Carrier Overrides</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">Multi-Agent House Splits</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 pl-6 pr-4 font-bold text-slate-900">Dynamic QR Code &amp; Lead Intake</td>
                    <td className="py-3 px-4 text-center text-slate-300">—</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-blue-50/20">Included</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">Included + Custom Slugs</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 pl-6 pr-4 font-bold text-slate-900">TCPA Marketing Consent Tracking</td>
                    <td className="py-3 px-4 text-center text-slate-300">—</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 bg-blue-50/20">Full Audit Log</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">Full Audit Log + API Export</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 pl-6 pr-4 font-bold text-slate-900">Sub-Producer / Team Logins</td>
                    <td className="py-3 px-4 text-center text-slate-600">1 Seat</td>
                    <td className="py-3 px-4 text-center text-slate-600 bg-blue-50/20">Up to 3 Seats</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">Unlimited Agent Seats</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 pl-6 pr-4 font-bold text-slate-900">Support Level</td>
                    <td className="py-3 px-4 text-center text-slate-500">Community Email</td>
                    <td className="py-3 px-4 text-center text-slate-800 bg-blue-50/20">Priority Ticket &amp; Email</td>
                    <td className="py-3 px-4 text-center font-bold text-purple-700">Dedicated Account Manager</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         18.2 CREATE / EDIT PLAN FORM (MODAL)
         ========================================================================= */}
      {modalOpen && (
        <PlanFormModal
          plan={editingPlan}
          onClose={handleCloseModal}
          onSave={handleSavePlan}
        />
      )}
    </div>
  )
}

/* =========================================================================
   18.2 CREATE / EDIT PLAN FORM MODAL
   ========================================================================= */
function PlanFormModal({
  plan,
  onClose,
  onSave,
}: {
  plan: MembershipPlan | null
  onClose: () => void
  onSave: (p: MembershipPlan) => void
}) {
  const isEditing = Boolean(plan)

  // Form states matching 18.2 requirements
  const [name, setName] = useState(plan ? plan.name : '')
  const [description, setDescription] = useState(plan ? plan.description : '')
  const [monthlyPrice, setMonthlyPrice] = useState(plan ? String(plan.monthlyPrice) : '49')
  const [yearlyPrice, setYearlyPrice] = useState(plan ? String(plan.yearlyPrice) : '490')
  const [trialDays, setTrialDays] = useState(plan ? String(plan.trialDays) : '14')
  const [hasDiscount, setHasDiscount] = useState(plan ? plan.hasDiscount : true)
  const [discountPercentage, setDiscountPercentage] = useState(plan?.discountPercentage ? String(plan.discountPercentage) : '17')
  const [promoCode, setPromoCode] = useState(plan?.promoCode || '')
  const [status, setStatus] = useState<'Active' | 'Inactive'>(plan ? plan.status : 'Active')
  const [features, setFeatures] = useState<string[]>(plan ? plan.features : [
    'Client and policy tracking up to 100 accounts',
    'Automated carrier statement parsing & reconciliation',
    'Renewal reminder alerts (30-day horizon)',
  ])
  const [customFeatureInput, setCustomFeatureInput] = useState('')

  function handleToggleFeature(feat: string) {
    if (features.includes(feat)) {
      setFeatures(features.filter((f) => f !== feat))
    } else {
      setFeatures([...features, feat])
    }
  }

  function handleAddCustomFeature() {
    if (!customFeatureInput.trim()) return
    if (!features.includes(customFeatureInput.trim())) {
      setFeatures([...features, customFeatureInput.trim()])
    }
    setCustomFeatureInput('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const mPrice = parseFloat(monthlyPrice) || 0
    const yPrice = parseFloat(yearlyPrice) || 0
    const tDays = parseInt(trialDays, 10) || 0

    const updatedPlan: MembershipPlan = {
      id: plan ? plan.id : `plan-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      monthlyPrice: mPrice,
      yearlyPrice: yPrice,
      trialDays: tDays,
      trialPeriod: tDays === 0 ? 'No Trial' : `${tDays} Days Free`,
      hasDiscount,
      discountPercentage: hasDiscount ? parseInt(discountPercentage, 10) || 0 : undefined,
      promoCode: promoCode.trim() || undefined,
      status,
      features,
      enrolledBrokers: plan ? plan.enrolledBrokers : 0,
      popular: plan?.popular,
    }

    onSave(updatedPlan)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8 animate-in slide-in-from-bottom-3 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <ShieldCheck className="size-5 text-[#0170FE]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">
                {isEditing ? `Edit Plan: ${plan?.name}` : 'Create New Membership Plan'}
              </h3>
              <p className="text-xs text-slate-500">
                Section 18.2 SOW Plan Configuration Form
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* 1. Plan Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Plan Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Professional Workspace"
                className="h-10 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Plan Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0170FE]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* 2. Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Commercial description explaining target broker tier and key value proposition..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>

          {/* 3. Monthly Price & Yearly Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Monthly Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(e.target.value)}
                  placeholder="79.00"
                  className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none focus:border-[#0170FE]"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Charged on a recurring monthly cycle.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Yearly Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={yearlyPrice}
                  onChange={(e) => setYearlyPrice(e.target.value)}
                  placeholder="790.00"
                  className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none focus:border-[#0170FE]"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Charged upfront for 12 months.</p>
            </div>
          </div>

          {/* 4. Trial Period */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <label className="text-xs font-bold text-slate-800 block">
              Configured Trial Period
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { label: 'No Trial', days: '0' },
                { label: '7 Days', days: '7' },
                { label: '14 Days', days: '14' },
                { label: '30 Days', days: '30' },
              ].map((t) => (
                <button
                  key={t.days}
                  type="button"
                  onClick={() => setTrialDays(t.days)}
                  className={`rounded-xl border p-2 text-center font-semibold transition cursor-pointer ${trialDays === t.days
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Discount / Promotional Pricing */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 block">
                  Discount / Promotional Pricing
                </label>
                <p className="text-xs text-slate-500">
                  Enable promotional annual discounts or voucher campaigns.
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasDiscount}
                onChange={(e) => setHasDiscount(e.target.checked)}
                className="size-4 accent-[#0170FE] cursor-pointer"
              />
            </div>

            {hasDiscount && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Annual Discount (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      placeholder="17"
                      className="h-9 w-full rounded-xl border border-slate-200 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-[#0170FE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Promo Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FALL2026"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-mono text-slate-900 outline-none focus:border-[#0170FE]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. Applicable Plan Features */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <label className="text-xs font-bold text-slate-800 block">
              Applicable Plan Features ({features.length} Selected)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {STANDARD_AVAILABLE_FEATURES.map((feat) => {
                const isSelected = features.includes(feat)
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => handleToggleFeature(feat)}
                    className={`flex items-start gap-2 rounded-xl border p-2 text-left text-xs transition cursor-pointer ${isSelected
                      ? 'border-[#0170FE] bg-blue-50/50 text-slate-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    <div
                      className={`size-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${isSelected
                        ? 'bg-[#0170FE] border-[#0170FE] text-white'
                        : 'border-slate-300 bg-white'
                        }`}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    <span className="line-clamp-2 leading-tight">{feat}</span>
                  </button>
                )
              })}
            </div>

            {/* Custom feature adder */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                placeholder="Add custom feature..."
                className="h-9 flex-1 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 outline-none focus:border-[#0170FE]"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 shrink-0"
              >
                Add Feature
              </button>
            </div>
          </div>

          {/* SOW Notice */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
            <strong>SOW Specification:</strong> The SOW supports configurable plans, monthly/yearly pricing, trial periods, discounts/promotions and feature configuration. Exact commercial plan names and feature limits are business decisions and are not specified by the SOW.
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0170FE] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0060db] transition"
            >
              {isEditing ? 'Save Plan Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
