'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Sliders,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X,
  Lock,
  RefreshCw,
  Award,
  Layers,
  SlidersHorizontal,
  Check,
  KeyRound,
  LogOut,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react'

// Tab definitions for 17.1
type BrokerTabId = 'all' | 'active' | 'inactive' | 'pending'

export interface BrokerRecord {
  id: string
  brokerCode: string
  name: string
  businessName: string
  email: string
  phone: string
  address: string
  state: string
  npn: string
  licenseNumber: string
  accountStatus: 'Active' | 'Inactive' | 'Pending Review'
  membershipPlan: 'Starter' | 'Professional' | 'Enterprise'
  subscriptionStatus: 'Active' | 'Trial' | 'Expired' | 'Non-renewed' | 'Payment Failed'
  billingFrequency: 'Monthly' | 'Yearly'
  trialRenewalDate: string
  trialRenewalType: 'Renewal' | 'Trial Expiry' | 'Lapsed'
  registeredDate: string
  lastActive: string
  clientCount: number
  policyCount: number
  totalPremium: string
  twoFactorEnabled: boolean
  assignedTemplates: string[]
}

const INITIAL_BROKERS: BrokerRecord[] = [
  {
    id: 'BRK-001',
    brokerCode: 'BRK-NY-8821',
    name: 'Jordan Davis',
    businessName: 'Apex Horizon Brokerage LLC',
    email: 'jordan@brokerstep.com',
    phone: '+1 (555) 234-5678',
    address: '100 Wall Street, Suite 1400, New York, NY 10005',
    state: 'NY',
    npn: '19842011',
    licenseNumber: 'BR-NY-90214',
    accountStatus: 'Active',
    membershipPlan: 'Professional',
    subscriptionStatus: 'Payment Failed',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Nov 01, 2026',
    trialRenewalType: 'Renewal',
    registeredDate: 'Jan 15, 2024',
    lastActive: '12 mins ago',
    clientCount: 248,
    policyCount: 412,
    totalPremium: '$2,840,000',
    twoFactorEnabled: true,
    assignedTemplates: ['Travelers Standard Grid Parser v2.1', 'The Hartford Multi-Tab Statement', 'Progressive Commercial Layout'],
  },
  {
    id: 'BRK-002',
    brokerCode: 'BRK-CA-4412',
    name: 'Sarah Mitchell',
    businessName: 'Pacific Coast Risk Partners',
    email: 'sarah@pacificrisk.com',
    phone: '+1 (555) 491-0022',
    address: '400 Montgomery St, San Francisco, CA 94104',
    state: 'CA',
    npn: '17409210',
    licenseNumber: 'BR-CA-88192',
    accountStatus: 'Active',
    membershipPlan: 'Enterprise',
    subscriptionStatus: 'Active',
    billingFrequency: 'Yearly',
    trialRenewalDate: 'Jan 15, 2027',
    trialRenewalType: 'Renewal',
    registeredDate: 'Nov 20, 2023',
    lastActive: '1 hour ago',
    clientCount: 520,
    policyCount: 890,
    totalPremium: '$5,200,000',
    twoFactorEnabled: true,
    assignedTemplates: ['Liberty Mutual CSV Custom Parser', 'Chubb Commercial Multi-Tier', 'Travelers Standard Grid Parser v2.1'],
  },
  {
    id: 'BRK-003',
    brokerCode: 'BRK-IL-1190',
    name: 'Michael Chen',
    businessName: 'Chen & Associates SureCare',
    email: 'michael@chensure.com',
    phone: '+1 (555) 881-3310',
    address: '233 S Wacker Dr, Chicago, IL 60606',
    state: 'IL',
    npn: '18902145',
    licenseNumber: 'BR-IL-33910',
    accountStatus: 'Active',
    membershipPlan: 'Starter',
    subscriptionStatus: 'Active',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Oct 28, 2026',
    trialRenewalType: 'Renewal',
    registeredDate: 'Mar 10, 2024',
    lastActive: '3 hours ago',
    clientCount: 94,
    policyCount: 142,
    totalPremium: '$890,000',
    twoFactorEnabled: false,
    assignedTemplates: ['Nationwide Standard Auto/Property Grid'],
  },
  {
    id: 'BRK-004',
    brokerCode: 'BRK-TX-9901',
    name: 'Elena Rostova',
    businessName: 'Lone Star Commercial Insurance',
    email: 'elena@lonestarins.com',
    phone: '+1 (555) 774-9912',
    address: '1000 Main Street, Houston, TX 77002',
    state: 'TX',
    npn: '20194012',
    licenseNumber: 'BR-TX-77401',
    accountStatus: 'Active',
    membershipPlan: 'Professional',
    subscriptionStatus: 'Trial',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Oct 24, 2026',
    trialRenewalType: 'Trial Expiry',
    registeredDate: 'Oct 10, 2026',
    lastActive: 'Just now',
    clientCount: 18,
    policyCount: 24,
    totalPremium: '$180,000',
    twoFactorEnabled: true,
    assignedTemplates: ['The Hartford Multi-Tab Statement', 'Progressive Commercial Layout'],
  },
  {
    id: 'BRK-005',
    brokerCode: 'BRK-FL-3304',
    name: 'David Vance',
    businessName: 'SunCoast Benefits Agency',
    email: 'david@suncoastbenefits.com',
    phone: '+1 (555) 301-4491',
    address: '201 S Biscayne Blvd, Miami, FL 33131',
    state: 'FL',
    npn: '16901184',
    licenseNumber: 'BR-FL-22019',
    accountStatus: 'Inactive',
    membershipPlan: 'Starter',
    subscriptionStatus: 'Expired',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Sep 01, 2026',
    trialRenewalType: 'Lapsed',
    registeredDate: 'May 04, 2023',
    lastActive: '42 days ago',
    clientCount: 45,
    policyCount: 62,
    totalPremium: '$410,000',
    twoFactorEnabled: false,
    assignedTemplates: ['Travelers Standard Grid Parser v2.1'],
  },
  {
    id: 'BRK-006',
    brokerCode: 'BRK-CO-7718',
    name: 'Rachel Sterling',
    businessName: 'Mile High Brokerage Group',
    email: 'rachel@milehighins.com',
    phone: '+1 (555) 662-8819',
    address: '1700 Lincoln St, Denver, CO 80203',
    state: 'CO',
    npn: '19408219',
    licenseNumber: 'BR-CO-99214',
    accountStatus: 'Pending Review',
    membershipPlan: 'Professional',
    subscriptionStatus: 'Trial',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Oct 26, 2026',
    trialRenewalType: 'Trial Expiry',
    registeredDate: 'Oct 11, 2026',
    lastActive: '5 hours ago',
    clientCount: 5,
    policyCount: 8,
    totalPremium: '$95,000',
    twoFactorEnabled: false,
    assignedTemplates: ['Standard Generic Broker CSV Template'],
  },
  {
    id: 'BRK-007',
    brokerCode: 'BRK-WA-5521',
    name: 'Marcus Brody',
    businessName: 'Cascade Sound Commercial',
    email: 'marcus@cascadesound.com',
    phone: '+1 (555) 993-2210',
    address: '1201 3rd Ave, Seattle, WA 98101',
    state: 'WA',
    npn: '15891102',
    licenseNumber: 'BR-WA-44102',
    accountStatus: 'Inactive',
    membershipPlan: 'Professional',
    subscriptionStatus: 'Non-renewed',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Aug 15, 2026',
    trialRenewalType: 'Lapsed',
    registeredDate: 'Feb 18, 2023',
    lastActive: '60 days ago',
    clientCount: 88,
    policyCount: 110,
    totalPremium: '$920,000',
    twoFactorEnabled: true,
    assignedTemplates: ['Liberty Mutual CSV Custom Parser'],
  },
]

const ALL_AVAILABLE_TEMPLATES = [
  'Travelers Standard Grid Parser v2.1',
  'The Hartford Multi-Tab Statement',
  'Liberty Mutual CSV Custom Parser',
  'Progressive Commercial Layout',
  'Chubb Commercial Multi-Tier',
  'Nationwide Standard Auto/Property Grid',
  'Standard Generic Broker CSV Template',
  'Aetna & Humana Group Benefits Map',
]

export default function AdminBrokersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading brokers directory...</div>}>
      <BrokersManagementContent />
    </Suspense>
  )
}

function BrokersManagementContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tabParam = (searchParams.get('tab') as BrokerTabId) || 'all'
  const viewParam = searchParams.get('view')
  const brokerIdParam = searchParams.get('id')

  // Brokers master list state
  const [brokersList, setBrokersList] = useState<BrokerRecord[]>(INITIAL_BROKERS)
  const [activeTab, setActiveTab] = useState<BrokerTabId>(tabParam)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('All')
  const [subscriptionFilter, setSubscriptionFilter] = useState('All')
  const [billingFilter, setBillingFilter] = useState('All')

  // Details drawer state (17.2 Broker Details)
  const [selectedBroker, setSelectedBroker] = useState<BrokerRecord | null>(() => {
    if (brokerIdParam) {
      return INITIAL_BROKERS.find((b) => b.id === brokerIdParam) || null
    }
    if (viewParam === 'details') {
      return INITIAL_BROKERS[0]
    }
    return null
  })
  const [detailsDrawerTab, setDetailsDrawerTab] = useState<'profile' | 'account' | 'subscription' | 'platform' | 'templates'>('profile')

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Sync tab, search params, and details drawer with URL & sidebar events
  useEffect(() => {
    const applyUrlParams = (searchStr?: string) => {
      const query = searchStr !== undefined ? searchStr : (typeof window !== 'undefined' ? window.location.search : '')
      const params = new URLSearchParams(query)
      const tab = params.get('tab') as BrokerTabId | null
      const view = params.get('view')
      const id = params.get('id')

      if (tab && ['all', 'active', 'inactive', 'pending'].includes(tab)) {
        setActiveTab(tab)
      } else if (!tab && !view && !id) {
        setActiveTab('all')
      }

      if (view === 'details' || id) {
        if (id) {
          const target = brokersList.find((b) => b.id === id) || brokersList[0]
          if (target) {
            setSelectedBroker(target)
            setDetailsDrawerTab('profile')
          }
        } else if (brokersList.length > 0) {
          setSelectedBroker((prev) => prev || brokersList[0])
          setDetailsDrawerTab('profile')
        }
      } else {
        setSelectedBroker(null)
      }
    }

    applyUrlParams()

    const handleNavChange = (e: any) => {
      const search = e?.detail?.search !== undefined ? e.detail.search : undefined
      applyUrlParams(search)
    }

    window.addEventListener('popstate', () => applyUrlParams())
    window.addEventListener('broker-nav-change', handleNavChange)
    return () => {
      window.removeEventListener('popstate', () => applyUrlParams())
      window.removeEventListener('broker-nav-change', handleNavChange)
    }
  }, [brokersList])

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  function handleTabChange(tab: BrokerTabId) {
    setActiveTab(tab)
    const targetUrl = tab === 'all' ? '/admin/brokers' : `/admin/brokers?tab=${tab}`
    const targetSearch = tab === 'all' ? '' : `?tab=${tab}`
    window.history.pushState(null, '', targetUrl)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: targetUrl, search: targetSearch, pathname: '/admin/brokers' },
      })
    )
  }

  function handleOpenDetails(broker: BrokerRecord, initialDrawerTab: 'profile' | 'account' | 'subscription' | 'platform' | 'templates' = 'profile') {
    setSelectedBroker(broker)
    setDetailsDrawerTab(initialDrawerTab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', 'details')
      url.searchParams.set('id', broker.id)
      const newSearch = `?${url.searchParams.toString()}`
      const newUrl = `${url.pathname}${newSearch}`
      window.history.pushState(null, '', newUrl)
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: { href: newUrl, search: newSearch, pathname: url.pathname },
        })
      )
    }
  }

  function handleCloseDetails() {
    setSelectedBroker(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('view') || url.searchParams.has('id')) {
        url.searchParams.delete('view')
        url.searchParams.delete('id')
        const newSearch = url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''
        const newUrl = `${url.pathname}${newSearch}`
        window.history.pushState(null, '', newUrl)
        window.dispatchEvent(
          new CustomEvent('broker-nav-change', {
            detail: { href: newUrl, search: newSearch, pathname: url.pathname },
          })
        )
      }
    }
  }

  function handleToggleAccountStatus(brokerId: string) {
    setBrokersList((prev) =>
      prev.map((b) => {
        if (b.id === brokerId) {
          const nextStatus = b.accountStatus === 'Active' ? 'Inactive' : 'Active'
          showToast(`${b.name} account status updated to ${nextStatus}`)
          return { ...b, accountStatus: nextStatus }
        }
        return b
      })
    )
    if (selectedBroker && selectedBroker.id === brokerId) {
      setSelectedBroker((prev) =>
        prev ? { ...prev, accountStatus: prev.accountStatus === 'Active' ? 'Inactive' : 'Active' } : null
      )
    }
  }

  function handleUpdatePlan(brokerId: string, newPlan: 'Starter' | 'Professional' | 'Enterprise') {
    setBrokersList((prev) =>
      prev.map((b) => (b.id === brokerId ? { ...b, membershipPlan: newPlan } : b))
    )
    if (selectedBroker && selectedBroker.id === brokerId) {
      setSelectedBroker((prev) => (prev ? { ...prev, membershipPlan: newPlan } : null))
    }
    showToast(`Membership plan updated to ${newPlan}`)
  }

  function handleAssignTemplate(brokerId: string, templateName: string) {
    if (!templateName) return
    setBrokersList((prev) =>
      prev.map((b) => {
        if (b.id === brokerId) {
          if (b.assignedTemplates.includes(templateName)) return b
          const updated = [...b.assignedTemplates, templateName]
          return { ...b, assignedTemplates: updated }
        }
        return b
      })
    )
    if (selectedBroker && selectedBroker.id === brokerId) {
      setSelectedBroker((prev) =>
        prev && !prev.assignedTemplates.includes(templateName)
          ? { ...prev, assignedTemplates: [...prev.assignedTemplates, templateName] }
          : prev
      )
    }
    showToast(`Template "${templateName}" assigned successfully`)
  }

  function handleRemoveTemplate(brokerId: string, templateName: string) {
    setBrokersList((prev) =>
      prev.map((b) => {
        if (b.id === brokerId) {
          return { ...b, assignedTemplates: b.assignedTemplates.filter((t) => t !== templateName) }
        }
        return b
      })
    )
    if (selectedBroker && selectedBroker.id === brokerId) {
      setSelectedBroker((prev) =>
        prev ? { ...prev, assignedTemplates: prev.assignedTemplates.filter((t) => t !== templateName) } : null
      )
    }
    showToast(`Template unassigned`)
  }

  // Filtered Brokers (17.1)
  const filteredBrokers = useMemo(() => {
    return brokersList.filter((b) => {
      // 1. Status Tab filter
      if (activeTab === 'active' && b.accountStatus !== 'Active') return false
      if (activeTab === 'inactive' && b.accountStatus !== 'Inactive') return false
      if (activeTab === 'pending' && b.accountStatus !== 'Pending Review') return false

      // 2. Search query (Broker, Business, Email)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = b.name.toLowerCase().includes(q)
        const matchBusiness = b.businessName.toLowerCase().includes(q)
        const matchEmail = b.email.toLowerCase().includes(q)
        const matchCode = b.brokerCode.toLowerCase().includes(q)
        if (!matchName && !matchBusiness && !matchEmail && !matchCode) return false
      }

      // 3. Plan filter
      if (planFilter !== 'All' && b.membershipPlan !== planFilter) return false

      // 4. Subscription Status filter
      if (subscriptionFilter !== 'All' && b.subscriptionStatus !== subscriptionFilter) return false

      // 5. Billing Frequency filter
      if (billingFilter !== 'All' && b.billingFrequency !== billingFilter) return false

      return true
    })
  }, [brokersList, activeTab, searchQuery, planFilter, subscriptionFilter, billingFilter])

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: brokersList.length,
      active: brokersList.filter((b) => b.accountStatus === 'Active').length,
      inactive: brokersList.filter((b) => b.accountStatus === 'Inactive').length,
      pending: brokersList.filter((b) => b.accountStatus === 'Pending Review').length,
    }
  }, [brokersList])

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
              Brokers Management
            </h1>

          </div>
          <p className="mt-1 text-sm text-slate-500">
            Section Broker directory, subscription statuses, account controls, and statement template assignments.
          </p>
        </div>


      </div>



      {/* 17.1 Status Tabs - Styled in black (bg-slate-950) like all dashboard tabs */}
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'all'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <span>All Brokers</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {tabCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('active')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'active'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <CheckCircle2 className={`size-3.5 ${activeTab === 'active' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>Active</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {tabCounts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('inactive')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'inactive'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <XCircle className={`size-3.5 ${activeTab === 'inactive' ? 'text-rose-400' : 'text-slate-400'}`} />
            <span>Inactive</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'inactive' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {tabCounts.inactive}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('pending')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'pending'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Clock className={`size-3.5 ${activeTab === 'pending' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>Pending / Relevant Status</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {tabCounts.pending}
            </span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search broker, business, or email..."
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

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
            >
              <option value="All">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            {/* Subscription Status Filter */}
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
            >
              <option value="All">All Subscription Status</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Expired">Expired</option>
              <option value="Non-renewed">Non-renewed</option>
              <option value="Payment Failed">Payment Failed</option>
            </select>

            {/* Billing Frequency Filter */}
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
            >
              <option value="All">All Billing Frequencies</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>

            {(searchQuery || planFilter !== 'All' || subscriptionFilter !== 'All' || billingFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setPlanFilter('All')
                  setSubscriptionFilter('All')
                  setBillingFilter('All')
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 transition cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-800">{filteredBrokers.length}</strong> brokers
          </div>
        </div>
      </div>

      {/* 17.1 All Brokers Listing Table */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-4">Broker</th>
                <th className="py-3.5 px-4">Business</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Membership Plan</th>
                <th className="py-3.5 px-4">Subscription Status</th>
                <th className="py-3.5 px-4">Billing Frequency</th>
                <th className="py-3.5 px-4">Trial / Renewal</th>
                <th className="py-3.5 pl-4 pr-6 text-right min-w-[210px] w-[210px] md:sticky md:right-0 md:z-20 bg-slate-50 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] select-none">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredBrokers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="size-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No brokers found</p>
                    <p className="text-xs text-slate-400 mt-1">Try loosening your filter parameters.</p>
                  </td>
                </tr>
              ) : (
                filteredBrokers.map((broker) => {
                  const isAccountActive = broker.accountStatus === 'Active'
                  const isAccountPending = broker.accountStatus === 'Pending Review'

                  return (
                    <tr key={broker.id} className="hover:bg-slate-50/80 transition group">
                      {/* 1. Broker */}
                      <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-xs font-bold text-white shadow-xs">
                            {broker.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(broker)}
                              className="font-bold text-slate-900 group-hover:text-[#0170FE] transition-colors cursor-pointer text-left block"
                            >
                              {broker.name}
                            </button>
                            <span className="text-xs font-mono text-slate-400">
                              {broker.brokerCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Business */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{broker.businessName}</span>
                      </td>

                      {/* 3. Email */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-600 font-mono text-xs">{broker.email}</span>
                      </td>

                      {/* 4. Account Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1.5 ${isAccountActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isAccountPending
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${isAccountActive ? 'bg-emerald-500' : isAccountPending ? 'bg-amber-500' : 'bg-slate-400'
                              }`}
                          />
                          {broker.accountStatus}
                        </span>
                      </td>

                      {/* 5. Membership Plan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${broker.membershipPlan === 'Enterprise'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : broker.membershipPlan === 'Professional'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                        >
                          {broker.membershipPlan}
                        </span>
                      </td>

                      {/* 6. Subscription Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${broker.subscriptionStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : broker.subscriptionStatus === 'Trial'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : broker.subscriptionStatus === 'Payment Failed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                        >
                          {broker.subscriptionStatus}
                        </span>
                      </td>

                      {/* 7. Billing Frequency */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{broker.billingFrequency}</span>
                      </td>

                      {/* 8. Trial / Renewal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-slate-900">{broker.trialRenewalDate}</p>
                          <p className="text-xs text-slate-400">{broker.trialRenewalType}</p>
                        </div>
                      </td>

                      {/* 9. Actions (View, Activate/Deactivate, View Subscription) */}
                      <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[210px] w-[210px] md:sticky md:right-0 md:z-10 bg-white group-hover:bg-[#f8fafc] md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] transition-colors">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(broker, 'profile')}
                            title="View Broker Details"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="size-3.5" />
                            <span>View</span>
                          </button>

                          {/* Activate / Deactivate Action */}
                          <button
                            type="button"
                            onClick={() => handleToggleAccountStatus(broker.id)}
                            title={isAccountActive ? 'Deactivate Broker' : 'Activate Broker'}
                            className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${isAccountActive
                              ? 'border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                          >
                            {isAccountActive ? 'Deactivate' : 'Activate'}
                          </button>

                          {/* View Subscription Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(broker, 'subscription')}
                            title="View Subscription & Plan Details"
                            className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:border-[#0170FE] hover:text-[#0170FE] transition cursor-pointer"
                          >
                            <CreditCard className="size-3.5" />
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

      {/* =========================================================================
         17.2 BROKER DETAILS SLIDE-OVER DRAWER
         • Broker profile/account information.
         • Account status controls.
         • Membership/subscription status.
         • Plan information.
         • Relevant account-level platform information.
         • Broker-specific statement template assignment.
         ========================================================================= */}
      {selectedBroker && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={handleCloseDetails}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white font-bold text-sm shadow-sm">
                  {selectedBroker.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-950">{selectedBroker.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${selectedBroker.accountStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                      {selectedBroker.accountStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{selectedBroker.businessName} · {selectedBroker.brokerCode}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Sub-Navigation Tabs */}
            <div className="border-b border-slate-200 bg-white px-6">
              <div className="flex gap-4 overflow-x-auto scrollbar-none text-xs font-semibold">
                {[
                  { id: 'profile', label: 'Profile & Account' },
                  { id: 'account', label: 'Status Controls' },
                  { id: 'subscription', label: 'Membership & Plan' },
                  { id: 'platform', label: 'Platform Metrics' },
                  { id: 'templates', label: 'Statement Templates' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDetailsDrawerTab(t.id as any)}
                    className={`py-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${detailsDrawerTab === t.id
                      ? 'border-slate-950 text-slate-950 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* TAB 1: Broker profile/account information */}
              {detailsDrawerTab === 'profile' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Broker Account Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-xs">Legal Name</span>
                        <span className="font-bold text-slate-900">{selectedBroker.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Agency Business Name</span>
                        <span className="font-bold text-slate-900">{selectedBroker.businessName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Primary Email</span>
                        <span className="font-mono text-slate-800">{selectedBroker.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Business Phone</span>
                        <span className="font-semibold text-slate-800">{selectedBroker.phone}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-xs">Office Physical Address</span>
                        <span className="font-medium text-slate-800">{selectedBroker.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Licensing &amp; Agreed Identifiers
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-xs">National Producer # (NPN)</span>
                        <span className="font-mono font-bold text-slate-900">{selectedBroker.npn}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Resident State License</span>
                        <span className="font-mono font-bold text-slate-900">{selectedBroker.licenseNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Resident Jurisdiction</span>
                        <span className="font-bold text-slate-900">{selectedBroker.state}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Onboarding Registered Date</span>
                        <span className="font-medium text-slate-800">{selectedBroker.registeredDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Account status controls */}
              {detailsDrawerTab === 'account' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Account Status Controls
                    </h4>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Platform Access Status</p>
                        <p className="text-xs text-slate-500">
                          Currently <strong>{selectedBroker.accountStatus}</strong>. Inactive brokers cannot log in to dashboard.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAccountStatus(selectedBroker.id)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${selectedBroker.accountStatus === 'Active'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                      >
                        {selectedBroker.accountStatus === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                      </button>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">Password Reset Request</p>
                          <p className="text-xs text-slate-400">Dispatch verified password reset email to broker.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Password reset link dispatched to ' + selectedBroker.email)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
                        >
                          Send Reset Link
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">Two-Factor Authentication (2FA)</p>
                          <p className="text-xs text-slate-400">
                            {selectedBroker.twoFactorEnabled ? '2FA is enforced and verified' : '2FA is not yet configured'}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${selectedBroker.twoFactorEnabled
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                            }`}
                        >
                          {selectedBroker.twoFactorEnabled ? 'Enforced' : 'Optional'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">Administrative Impersonation</p>
                          <p className="text-xs text-slate-400">View portal exactly as this broker with read-only audit.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            router.push('/broker/dashboard')
                            showToast(`Impersonating ${selectedBroker.name}...`)
                          }}
                          className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Launch Broker View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Membership/subscription status & Plan information */}
              {detailsDrawerTab === 'subscription' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Membership &amp; Subscription Status
                      </h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${selectedBroker.subscriptionStatus === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedBroker.subscriptionStatus === 'Payment Failed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                      >
                        {selectedBroker.subscriptionStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block text-xs">Current Plan</span>
                        <span className="font-bold text-slate-900 text-sm">{selectedBroker.membershipPlan}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Billing Frequency</span>
                        <span className="font-bold text-slate-900">{selectedBroker.billingFrequency} Billing</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Renewal / Expiry Date</span>
                        <span className="font-bold text-slate-900">{selectedBroker.trialRenewalDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Payment Method on File</span>
                        <span className="font-mono text-slate-700">Visa ending in 4242</span>
                      </div>
                    </div>

                    {/* Admin Plan Override Controls */}
                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-800 block mb-2">
                        Modify Plan Tier Assignment
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Starter', 'Professional', 'Enterprise'] as const).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => handleUpdatePlan(selectedBroker.id, tier)}
                            className={`rounded-xl border p-2.5 text-center transition cursor-pointer ${selectedBroker.membershipPlan === tier
                              ? 'border-slate-950 bg-slate-950 text-white font-bold'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                          >
                            <p className="text-xs">{tier}</p>
                            <p className="text-xs opacity-75 mt-0.5">
                              {tier === 'Starter' ? '$29/mo' : tier === 'Professional' ? '$79/mo' : '$199/mo'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Relevant account-level platform information */}
              {detailsDrawerTab === 'platform' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Platform Usage &amp; Operational Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-xs text-slate-500 block">Clients in Book</span>
                        <span className="text-xl font-bold text-slate-950">{selectedBroker.clientCount}</span>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-xs text-slate-500 block">Policies in Force</span>
                        <span className="text-xl font-bold text-slate-950">{selectedBroker.policyCount}</span>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-xs text-slate-500 block">Total Book Premium</span>
                        <span className="text-xl font-bold text-slate-950">{selectedBroker.totalPremium}</span>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-xs text-slate-500 block">Last Active Activity</span>
                        <span className="text-sm font-bold text-slate-950">{selectedBroker.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Broker-specific statement template assignment */}
              {detailsDrawerTab === 'templates' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Broker-Specific Statement Templates
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Assigned parsers for processing carrier commission statement uploads.
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {selectedBroker.assignedTemplates.length} assigned
                      </span>
                    </div>

                    {/* Assigned Templates List */}
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {selectedBroker.assignedTemplates.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No statement templates assigned yet.
                        </div>
                      ) : (
                        selectedBroker.assignedTemplates.map((tmpl) => (
                          <div key={tmpl} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="size-4 text-[#0170FE]" />
                              <span className="font-semibold text-slate-800">{tmpl}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTemplate(selectedBroker.id, tmpl)}
                              className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                              title="Unassign template"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Assign New Template Dropdown */}
                    <div className="pt-2">
                      <label className="text-xs font-bold text-slate-800 block mb-1.5">
                        Assign Additional Carrier Statement Template
                      </label>
                      <div className="flex gap-2">
                        <select
                          id="new-template-select"
                          className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#0170FE]"
                        >
                          {ALL_AVAILABLE_TEMPLATES.map((tmpl) => (
                            <option key={tmpl} value={tmpl}>
                              {tmpl}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const select = document.getElementById('new-template-select') as HTMLSelectElement
                            if (select && select.value) {
                              handleAssignTemplate(selectedBroker.id, select.value)
                            }
                          }}
                          className="rounded-xl bg-[#0170FE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0060db] transition shrink-0 cursor-pointer"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Broker ID: <strong className="text-slate-600">{selectedBroker.id}</strong>
              </span>
              <button
                type="button"
                onClick={handleCloseDetails}
                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
