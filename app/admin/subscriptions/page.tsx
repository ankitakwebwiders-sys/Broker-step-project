'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Bell,
  Mail,
  ShieldCheck,
  Download,
  X,
  Info,
  Check,
  Receipt,
  Send,
  SlidersHorizontal,
} from 'lucide-react'

// Tab definitions for Subscriptions / Billing
export type BillingTabKey =
  | 'subscriptions'
  | 'payments'
  | 'failed-payments'
  | 'expiring'

export interface InvoiceRecord {
  invoiceNo: string
  date: string
  amount: number
  status: 'Paid' | 'Failed' | 'Refunded'
  method: string
}

export interface SubscriptionRecord {
  id: string
  brokerId: string
  brokerName: string
  businessName: string
  email: string
  planName: 'Starter' | 'Professional' | 'Enterprise'
  monthlyAmount: number
  yearlyAmount: number
  subscriptionStatus: 'Active' | 'In Trial' | 'Past Due' | 'Expired' | 'Non-Renewed'
  billingFrequency: 'Monthly' | 'Yearly'
  trialRenewalDate: string
  trialRenewalType: 'Renewal' | 'Trial Ends' | 'Expired'
  daysUntilRenewal: number
  paymentStatus: 'Paid' | 'Failed' | 'Pending' | 'Trial Active'
  cardBrand: string
  cardLast4: string
  cardExp: string
  lastPaymentDate: string
  lastPaymentAmount: number
  failedReason?: string
  failedCount?: number
  headerNotificationState: 'Active in Broker Header' | 'Dismissed by Broker' | 'Pending Delivery'
  emailNotificationState: 'Delivered' | 'Bounced' | 'Queued'
  autoRenew: boolean
  invoiceHistory: InvoiceRecord[]
}

const INITIAL_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: 'SUB-2026-001',
    brokerId: 'BRK-001',
    brokerName: 'Jordan Davis',
    businessName: 'Apex Horizon Brokerage LLC',
    email: 'jordan@brokerstep.com',
    planName: 'Professional',
    monthlyAmount: 79.0,
    yearlyAmount: 790.0,
    subscriptionStatus: 'Past Due',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Nov 01, 2026',
    trialRenewalType: 'Renewal',
    daysUntilRenewal: 20,
    paymentStatus: 'Failed',
    cardBrand: 'Visa',
    cardLast4: '4242',
    cardExp: '08/2028',
    lastPaymentDate: 'Oct 01, 2026',
    lastPaymentAmount: 79.0,
    failedReason: 'Card Insufficient Funds / Bank Decline code 51',
    failedCount: 2,
    headerNotificationState: 'Active in Broker Header',
    emailNotificationState: 'Delivered',
    autoRenew: true,
    invoiceHistory: [
      { invoiceNo: 'INV-2026-1001', date: 'Oct 01, 2026', amount: 79.0, status: 'Failed', method: 'Visa •••• 4242' },
      { invoiceNo: 'INV-2026-0901', date: 'Sep 01, 2026', amount: 79.0, status: 'Paid', method: 'Visa •••• 4242' },
      { invoiceNo: 'INV-2026-0801', date: 'Aug 01, 2026', amount: 79.0, status: 'Paid', method: 'Visa •••• 4242' },
      { invoiceNo: 'INV-2026-0701', date: 'Jul 01, 2026', amount: 29.0, status: 'Paid', method: 'Visa •••• 4242' },
    ],
  },
  {
    id: 'SUB-2026-002',
    brokerId: 'BRK-002',
    brokerName: 'Sarah Mitchell',
    businessName: 'Pacific Coast Risk Partners',
    email: 'sarah@pacificrisk.com',
    planName: 'Enterprise',
    monthlyAmount: 199.0,
    yearlyAmount: 1990.0,
    subscriptionStatus: 'Active',
    billingFrequency: 'Yearly',
    trialRenewalDate: 'Jan 15, 2027',
    trialRenewalType: 'Renewal',
    daysUntilRenewal: 95,
    paymentStatus: 'Paid',
    cardBrand: 'Mastercard',
    cardLast4: '8810',
    cardExp: '11/2027',
    lastPaymentDate: 'Jan 15, 2026',
    lastPaymentAmount: 1990.0,
    headerNotificationState: 'Pending Delivery',
    emailNotificationState: 'Delivered',
    autoRenew: true,
    invoiceHistory: [
      { invoiceNo: 'INV-2026-0115', date: 'Jan 15, 2026', amount: 1990.0, status: 'Paid', method: 'Mastercard •••• 8810' },
    ],
  },
  {
    id: 'SUB-2026-003',
    brokerId: 'BRK-003',
    brokerName: 'Michael Chen',
    businessName: 'Chen & Associates SureCare',
    email: 'michael@chensure.com',
    planName: 'Starter',
    monthlyAmount: 29.0,
    yearlyAmount: 290.0,
    subscriptionStatus: 'Active',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Oct 28, 2026',
    trialRenewalType: 'Renewal',
    daysUntilRenewal: 16,
    paymentStatus: 'Paid',
    cardBrand: 'American Express',
    cardLast4: '1004',
    cardExp: '04/2026',
    lastPaymentDate: 'Sep 28, 2026',
    lastPaymentAmount: 29.0,
    headerNotificationState: 'Pending Delivery',
    emailNotificationState: 'Delivered',
    autoRenew: true,
    invoiceHistory: [
      { invoiceNo: 'INV-2026-0928', date: 'Sep 28, 2026', amount: 29.0, status: 'Paid', method: 'Amex •••• 1004' },
      { invoiceNo: 'INV-2026-0828', date: 'Aug 28, 2026', amount: 29.0, status: 'Paid', method: 'Amex •••• 1004' },
    ],
  },
  {
    id: 'SUB-2026-004',
    brokerId: 'BRK-004',
    brokerName: 'Elena Rostova',
    businessName: 'Lone Star Commercial Insurance',
    email: 'elena@lonestarins.com',
    planName: 'Professional',
    monthlyAmount: 79.0,
    yearlyAmount: 790.0,
    subscriptionStatus: 'In Trial',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Oct 24, 2026',
    trialRenewalType: 'Trial Ends',
    daysUntilRenewal: 12,
    paymentStatus: 'Trial Active',
    cardBrand: 'Visa',
    cardLast4: '3019',
    cardExp: '09/2029',
    lastPaymentDate: '— (Trial)',
    lastPaymentAmount: 0.0,
    headerNotificationState: 'Pending Delivery',
    emailNotificationState: 'Delivered',
    autoRenew: true,
    invoiceHistory: [],
  },
  {
    id: 'SUB-2026-005',
    brokerId: 'BRK-005',
    brokerName: 'David Vance',
    businessName: 'SunCoast Benefits Agency',
    email: 'david@suncoastbenefits.com',
    planName: 'Starter',
    monthlyAmount: 29.0,
    yearlyAmount: 290.0,
    subscriptionStatus: 'Expired',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Sep 01, 2026',
    trialRenewalType: 'Expired',
    daysUntilRenewal: -42,
    paymentStatus: 'Failed',
    cardBrand: 'Visa',
    cardLast4: '1192',
    cardExp: '08/2026',
    lastPaymentDate: 'Aug 01, 2026',
    lastPaymentAmount: 29.0,
    failedReason: 'Card Expired / Recurring Authorization Revoked',
    failedCount: 4,
    headerNotificationState: 'Active in Broker Header',
    emailNotificationState: 'Delivered',
    autoRenew: false,
    invoiceHistory: [
      { invoiceNo: 'INV-2026-0905', date: 'Sep 01, 2026', amount: 29.0, status: 'Failed', method: 'Visa •••• 1192' },
      { invoiceNo: 'INV-2026-0805', date: 'Aug 01, 2026', amount: 29.0, status: 'Paid', method: 'Visa •••• 1192' },
    ],
  },
  {
    id: 'SUB-2026-006',
    brokerId: 'BRK-006',
    brokerName: 'Rachel Sterling',
    businessName: 'Mile High Brokerage Group',
    email: 'rachel@milehighins.com',
    planName: 'Professional',
    monthlyAmount: 79.0,
    yearlyAmount: 790.0,
    subscriptionStatus: 'Non-Renewed',
    billingFrequency: 'Monthly',
    trialRenewalDate: 'Oct 26, 2026',
    trialRenewalType: 'Renewal',
    daysUntilRenewal: 14,
    paymentStatus: 'Pending',
    cardBrand: 'Mastercard',
    cardLast4: '9921',
    cardExp: '02/2028',
    lastPaymentDate: 'Sep 26, 2026',
    lastPaymentAmount: 79.0,
    headerNotificationState: 'Active in Broker Header',
    emailNotificationState: 'Delivered',
    autoRenew: false,
    invoiceHistory: [
      { invoiceNo: 'INV-2026-0926', date: 'Sep 26, 2026', amount: 79.0, status: 'Paid', method: 'Mastercard •••• 9921' },
    ],
  },
]

export default function SubscriptionsBillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading subscriptions &amp; billing...</div>}>
      <SubscriptionsBillingContent />
    </Suspense>
  )
}

function SubscriptionsBillingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tabParam = (searchParams.get('tab') as BillingTabKey) || 'subscriptions'
  const viewParam = searchParams.get('view')
  const subIdParam = searchParams.get('id')

  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(INITIAL_SUBSCRIPTIONS)
  const [activeTab, setActiveTab] = useState<BillingTabKey>(tabParam)
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Modals for 19.1 Admin Actions
  const [selectedSubForDetails, setSelectedSubForDetails] = useState<SubscriptionRecord | null>(() => {
    if (subIdParam) return INITIAL_SUBSCRIPTIONS.find((s) => s.id === subIdParam) || null
    if (viewParam === 'details') return INITIAL_SUBSCRIPTIONS[0]
    return null
  })
  const [reviewPaymentSub, setReviewPaymentSub] = useState<SubscriptionRecord | null>(null)
  const [reviewFailedNotifSub, setReviewFailedNotifSub] = useState<SubscriptionRecord | null>(null)
  const [reviewExpiryNotifSub, setReviewExpiryNotifSub] = useState<SubscriptionRecord | null>(null)
  // 19.1 Action: Apply plan/status changes only through agreed administrative controls
  const [adminControlSub, setAdminControlSub] = useState<SubscriptionRecord | null>(null)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (tabParam && ['subscriptions', 'payments', 'failed-payments', 'expiring'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // Custom listener for instant sidebar clicks
  useEffect(() => {
    const handleNavChange = (e: any) => {
      const searchStr = e?.detail?.search !== undefined ? e.detail.search : window.location.search
      const params = new URLSearchParams(searchStr)
      const tab = params.get('tab') as BillingTabKey | null
      const view = params.get('view')

      if (view === 'details') {
        setSelectedSubForDetails(subscriptions[0])
      }

      if (tab && ['subscriptions', 'payments', 'failed-payments', 'expiring'].includes(tab)) {
        setActiveTab(tab)
      } else if (!view) {
        setActiveTab('subscriptions')
      }
    }

    window.addEventListener('broker-nav-change', handleNavChange)
    window.addEventListener('popstate', handleNavChange)
    return () => {
      window.removeEventListener('broker-nav-change', handleNavChange)
      window.removeEventListener('popstate', handleNavChange)
    }
  }, [subscriptions])

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  function handleTabSelect(tab: BillingTabKey) {
    setActiveTab(tab)
    const targetUrl = tab === 'subscriptions' ? '/admin/subscriptions' : `/admin/subscriptions?tab=${tab}`
    router.replace(targetUrl, { scroll: false })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: {
            href: targetUrl,
            search: tab === 'subscriptions' ? '' : `?tab=${tab}`,
            pathname: '/admin/subscriptions',
          },
        })
      )
    }
  }

  // 19.1 Action: Trigger manual payment retry
  function handleRetryPayment(subId: string) {
    showToast('Payment gateway charge re-attempt initiated...')
    setTimeout(() => {
      setSubscriptions((prev) =>
        prev.map((s) => {
          if (s.id === subId) {
            return {
              ...s,
              paymentStatus: 'Paid',
              subscriptionStatus: 'Active',
              failedReason: undefined,
              headerNotificationState: 'Dismissed by Broker',
              invoiceHistory: [
                { invoiceNo: `INV-2026-${Date.now().toString().slice(-4)}`, date: 'Today', amount: s.monthlyAmount, status: 'Paid', method: `${s.cardBrand} •••• ${s.cardLast4}` },
                ...s.invoiceHistory,
              ],
            }
          }
          return s
        })
      )
      setReviewFailedNotifSub(null)
      showToast('Payment succeeded! Account status restored to Active.')
    }, 1500)
  }

  // 19.1 Action: Resend expiry/renewal reminder
  function handleResendRenewalNotice(sub: SubscriptionRecord) {
    showToast(`Renewal notice dispatched to ${sub.email}`)
    setReviewExpiryNotifSub(null)
  }

  // 19.1 Action: Apply plan/status changes only through agreed administrative controls
  function handleApplyAdminControl(
    subId: string,
    targetPlan: string,
    targetStatus: SubscriptionRecord['subscriptionStatus'],
    reason: string,
    refId: string,
    proration: string
  ) {
    const planPrices: Record<string, number> = {
      Starter: 29,
      Professional: 79,
      Enterprise: 199,
    }
    const newPrice = planPrices[targetPlan] || 79

    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          const updated: SubscriptionRecord = {
            ...s,
            planName: targetPlan,
            monthlyAmount: newPrice,
            subscriptionStatus: targetStatus,
            paymentStatus:
              targetStatus === 'Active' || targetStatus === 'In Trial' ? 'Paid' : s.paymentStatus,
          }
          if (selectedSubForDetails?.id === subId) {
            setSelectedSubForDetails(updated)
          }
          return updated
        }
        return s
      })
    )

    setAdminControlSub(null)
    showToast(
      `Applied plan & status changes through agreed administrative controls (${refId || 'AUTH-AGREED'}).`
    )
  }

  // Filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Tab based segregation
      if (activeTab === 'failed-payments' && sub.paymentStatus !== 'Failed') return false
      if (activeTab === 'expiring' && (sub.daysUntilRenewal > 30 || sub.daysUntilRenewal < 0) && sub.subscriptionStatus !== 'Non-Renewed') {
        return false
      }

      // Dropdown filters
      if (planFilter !== 'All' && sub.planName !== planFilter) return false
      if (statusFilter !== 'All' && sub.subscriptionStatus !== statusFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchBroker = sub.brokerName.toLowerCase().includes(q)
        const matchBusiness = sub.businessName.toLowerCase().includes(q)
        const matchEmail = sub.email.toLowerCase().includes(q)
        const matchId = sub.id.toLowerCase().includes(q)
        if (!matchBroker && !matchBusiness && !matchEmail && !matchId) return false
      }

      return true
    })
  }, [subscriptions, activeTab, planFilter, statusFilter, searchQuery])

  // Payments Ledger Items
  const allInvoices = useMemo(() => {
    const list: Array<InvoiceRecord & { brokerName: string; businessName: string; planName: string }> = []
    subscriptions.forEach((sub) => {
      sub.invoiceHistory.forEach((inv) => {
        list.push({
          ...inv,
          brokerName: sub.brokerName,
          businessName: sub.businessName,
          planName: sub.planName,
        })
      })
    })
    return list
  }, [subscriptions])

  // Count badges
  const totalCount = subscriptions.length
  const failedCount = subscriptions.filter((s) => s.paymentStatus === 'Failed').length
  const expiringCount = subscriptions.filter((s) => (s.daysUntilRenewal <= 30 && s.daysUntilRenewal >= 0) || s.subscriptionStatus === 'Non-Renewed').length

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
              Subscriptions &amp; Billing
            </h1>
            <span className="rounded-full bg-slate-950 px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-slate-800">
              Admin Billing Center
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monitor broker subscriptions, failed payments, dunning notification workflows, and expiring memberships.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast('Dispatched recurring statement reconciliation audit')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 transition"
          >
            <RefreshCw className="size-3.5" />
            <span>Audit Gateway Status</span>
          </button>
        </div>
      </div>

      {/* 19.1 Admin Actions & Governance Protocol */}
      <div className="mt-5 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-slate-50/60 to-indigo-50/40 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs">
              <ShieldCheck className="size-4 text-[#0170FE]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Admin Actions &amp; Governance Policy
                </h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                  Administrative Controls
                </span>
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  <span>View subscription</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  <span>Review payment status</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  <span>Review failed payment notification state</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  <span>Review expiry/non-renewal notification state</span>
                </li>
                <li className="flex items-center gap-1.5 font-bold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md">
                  <span className="size-1.5 rounded-full bg-[#0170FE]" />
                  <span>Apply plan/status changes only through agreed administrative controls.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Subscriptions</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{totalCount}</p>
          <p className="mt-1 text-xs text-slate-400">All enrolled accounts</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Active Paid Run Rate</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">$2,940 / mo</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">92% collection rate</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Failed Payments (Action Req.)</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">{failedCount}</p>
          <p className="mt-1 text-xs text-rose-600 font-medium">Notified in header &amp; email</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Approaching Expiry / Non-Renew</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{expiringCount}</p>
          <p className="mt-1 text-xs text-slate-400">Within 30-day horizon</p>
        </div>
      </div>

      {/* Navigation Submenu Tabs - Styled in BLACK (bg-slate-950) like all dashboard tabs */}
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {/* 1. Subscriptions Tab */}
          <button
            type="button"
            onClick={() => handleTabSelect('subscriptions')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'subscriptions'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <CreditCard className={`size-4 ${activeTab === 'subscriptions' ? 'text-white' : 'text-slate-500'}`} />
            <span>Subscriptions</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'subscriptions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {totalCount}
            </span>
          </button>

          {/* 2. Payment Status Tab */}
          <button
            type="button"
            onClick={() => handleTabSelect('payments')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'payments'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <DollarSign className={`size-4 ${activeTab === 'payments' ? 'text-white' : 'text-slate-500'}`} />
            <span>Payment Status</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'payments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {allInvoices.length}
            </span>
          </button>

          {/* 3. Failed Payments Tab */}
          <button
            type="button"
            onClick={() => handleTabSelect('failed-payments')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'failed-payments'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <AlertCircle className={`size-4 ${activeTab === 'failed-payments' ? 'text-rose-400' : 'text-rose-500'}`} />
            <span>Failed Payments</span>
            {failedCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'failed-payments' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                  }`}
              >
                {failedCount}
              </span>
            )}
          </button>

          {/* 4. Expiring / Non-Renewing Tab */}
          <button
            type="button"
            onClick={() => handleTabSelect('expiring')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'expiring'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Clock className={`size-4 ${activeTab === 'expiring' ? 'text-amber-400' : 'text-amber-500'}`} />
            <span>Expiring / Non-Renewing</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === 'expiring' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              {expiringCount}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2.5">
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

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
            >
              <option value="All">All Plans</option>
              <option value="Starter">Starter ($29)</option>
              <option value="Professional">Professional ($79)</option>
              <option value="Enterprise">Enterprise ($199)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
            >
              <option value="All">All Subscription Status</option>
              <option value="Active">Active</option>
              <option value="In Trial">In Trial</option>
              <option value="Past Due">Past Due</option>
              <option value="Expired">Expired</option>
              <option value="Non-Renewed">Non-Renewed</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-800">{activeTab === 'payments' ? allInvoices.length : filteredSubscriptions.length}</strong> records
          </div>
        </div>
      </div>

      {/* =========================================================================
         VIEW: 1. Subscriptions & 3. Failed Payments & 4. Expiring Tables
         ========================================================================= */}
      {activeTab !== 'payments' ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">Broker / Agency</th>
                  <th className="py-3.5 px-4">Plan Tier</th>
                  <th className="py-3.5 px-4">Subscription Status</th>
                  <th className="py-3.5 px-4">Billing Frequency</th>
                  <th className="py-3.5 px-4">Trial / Renewal</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  {activeTab === 'failed-payments' && (
                    <th className="py-3.5 px-4">Notification / Action State</th>
                  )}
                  {activeTab === 'expiring' && (
                    <th className="py-3.5 px-4">Auto-Renew Policy</th>
                  )}
                  <th className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap min-w-[280px] w-[280px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <CreditCard className="size-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No subscription records found</p>
                      <p className="text-xs text-slate-400 mt-1">Try loosening your filter parameters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const isFailed = sub.paymentStatus === 'Failed'
                    const isExpiring = sub.daysUntilRenewal <= 30 && sub.daysUntilRenewal >= 0

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition group align-top">
                        {/* 1. Broker */}
                        <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                          <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs">
                              {sub.brokerName.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedSubForDetails(sub)}
                                className="font-bold text-slate-900 group-hover:text-[#0170FE] transition-colors cursor-pointer text-left block"
                              >
                                {sub.brokerName}
                              </button>
                              <p className="text-xs text-slate-500 font-medium">{sub.businessName}</p>
                              <span className="text-xs text-slate-400 font-mono">{sub.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Plan */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{sub.planName}</span>
                            <p className="text-xs text-slate-500">
                              ${sub.billingFrequency === 'Monthly' ? sub.monthlyAmount.toFixed(2) : (sub.yearlyAmount / 12).toFixed(2)}/mo
                            </p>
                          </div>
                        </td>

                        {/* 3. Subscription Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1.5 ${sub.subscriptionStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.subscriptionStatus === 'In Trial'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : sub.subscriptionStatus === 'Past Due'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${sub.subscriptionStatus === 'Active'
                                ? 'bg-emerald-500'
                                : sub.subscriptionStatus === 'Past Due'
                                  ? 'bg-rose-500'
                                  : 'bg-blue-500'
                                }`}
                            />
                            {sub.subscriptionStatus}
                          </span>
                        </td>

                        {/* 4. Billing Frequency */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-700">{sub.billingFrequency}</span>
                        </td>

                        {/* 5. Trial / Renewal */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div>
                            <p className="font-semibold text-slate-900">{sub.trialRenewalDate}</p>
                            <p
                              className={`text-xs font-medium ${sub.daysUntilRenewal <= 14 && sub.daysUntilRenewal >= 0
                                ? 'text-amber-600 font-bold'
                                : 'text-slate-400'
                                }`}
                            >
                              {sub.daysUntilRenewal >= 0 ? `${sub.daysUntilRenewal} days remaining` : `${Math.abs(sub.daysUntilRenewal)} days ago`}
                            </p>
                          </div>
                        </td>

                        {/* 6. Payment Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 ${sub.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.paymentStatus === 'Failed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                          >
                            {sub.paymentStatus === 'Paid' && <Check className="size-3" />}
                            {sub.paymentStatus === 'Failed' && <AlertCircle className="size-3" />}
                            {sub.paymentStatus}
                          </span>
                        </td>

                        {/* Extra column for Failed Payments tab */}
                        {activeTab === 'failed-payments' && (
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <Bell className="size-3" />
                                {sub.headerNotificationState}
                              </span>
                              <p className="text-xs text-slate-400">
                                Email Dunning: <strong>{sub.emailNotificationState}</strong>
                              </p>
                            </div>
                          </td>
                        )}

                        {/* Extra column for Expiring tab */}
                        {activeTab === 'expiring' && (
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${sub.autoRenew
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                                }`}
                            >
                              {sub.autoRenew ? 'Auto-Renew ON' : 'Non-Renewing (Off)'}
                            </span>
                          </td>
                        )}

                        {/* 19.1 Admin Actions (View, Review Payment, Review Failed Notif, Review Expiry) */}
                        <td className="py-4 pl-4 pr-6 whitespace-nowrap text-right min-w-[280px] w-[280px] sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors">
                          <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                            {/* Action 1: View subscription */}
                            <button
                              type="button"
                              onClick={() => setSelectedSubForDetails(sub)}
                              title="View Subscription Details"
                              className="inline-flex shrink-0 whitespace-nowrap cursor-pointer items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-950 hover:text-white transition"
                            >
                              <Eye className="size-3.5" />
                              <span>View</span>
                            </button>

                            {/* Action 2: Review payment status */}
                            <button
                              type="button"
                              onClick={() => setReviewPaymentSub(sub)}
                              title="Review Payment Status"
                              className="shrink-0 whitespace-nowrap rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#0170FE] hover:text-[#0170FE] transition cursor-pointer"
                            >
                              Payment
                            </button>

                            {/* Action 3: Review failed payment notification state */}
                            {isFailed && (
                              <button
                                type="button"
                                onClick={() => setReviewFailedNotifSub(sub)}
                                title="Review Failed Payment Notification State"
                                className="shrink-0 whitespace-nowrap rounded-xl bg-rose-50 border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                              >
                                Failed Alert
                              </button>
                            )}

                            {/* Action 4: Review expiry/non-renewal notification state */}
                            {(isExpiring || !sub.autoRenew) && (
                              <button
                                type="button"
                                onClick={() => setReviewExpiryNotifSub(sub)}
                                title="Review Expiry / Non-Renewal Notification State"
                                className="shrink-0 whitespace-nowrap rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                              >
                                Renewal Notice
                              </button>
                            )}

                            {/* Action 5: Apply plan/status changes only through agreed administrative controls */}
                            <button
                              type="button"
                              onClick={() => setAdminControlSub(sub)}
                              title="Apply plan/status changes only through agreed administrative controls"
                              className="inline-flex shrink-0 whitespace-nowrap cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
                            >
                              <SlidersHorizontal className="size-3 text-blue-400" />
                              <span>Admin Controls</span>
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
      ) : (
        /* =========================================================================
           VIEW: 2. Payment Status Ledger (Successful & Failed Payments)
           ========================================================================= */
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Receipt className="size-4 text-[#0170FE]" />
                Payment Status &amp; Gateway Settlement Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Successful and failed payment transactions relevant to broker recurring subscriptions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => showToast('Payment ledger exported (CSV)')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Download className="size-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice / Txn ID</th>
                  <th className="py-3 px-4">Broker Account</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right min-w-[120px] w-[120px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allInvoices.map((inv, idx) => (
                  <tr key={`${inv.invoiceNo}-${inv.brokerId}-${idx}`} className="group hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNo}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{inv.brokerName}</p>
                      <p className="text-xs text-slate-400">{inv.businessName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {inv.planName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.date}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-950">${inv.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{inv.method}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1 ${inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                      >
                        {inv.status === 'Paid' ? <Check className="size-3" /> : <AlertCircle className="size-3" />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap min-w-[120px] w-[120px] sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors">
                      <button
                        type="button"
                        onClick={() => showToast(`Receipt generated for ${inv.invoiceNo}`)}
                        className="text-xs font-semibold text-[#0170FE] hover:underline cursor-pointer"
                      >
                        Receipt PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
         19.1 MODAL 1: SUBSCRIPTION DETAILS (SLIDE-OVER INSPECTOR)
         • Broker, plan, billing status, subscription history and applicable payment info.
         ========================================================================= */}
      {selectedSubForDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white font-bold text-sm shadow-sm">
                  {selectedSubForDetails.brokerName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{selectedSubForDetails.brokerName}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedSubForDetails.businessName} · {selectedSubForDetails.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubForDetails(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Subscription Overview */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Subscription Tier
                  </h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${selectedSubForDetails.subscriptionStatus === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : selectedSubForDetails.subscriptionStatus === 'Past Due'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-blue-700'
                      }`}
                  >
                    {selectedSubForDetails.subscriptionStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-xs">Current Plan</span>
                    <span className="font-extrabold text-slate-950 text-sm">{selectedSubForDetails.planName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Billing Cadence</span>
                    <span className="font-bold text-slate-900">{selectedSubForDetails.billingFrequency} (${selectedSubForDetails.monthlyAmount}/mo)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Next Renewal / Expiry</span>
                    <span className="font-bold text-slate-900">{selectedSubForDetails.trialRenewalDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Auto-Renewal Status</span>
                    <span className="font-bold text-emerald-600">{selectedSubForDetails.autoRenew ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              {/* 19.1 Agreed Administrative Controls (Apply plan/status changes) */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-slate-50 to-indigo-50/30 p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-[#0170FE]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Agreed Administrative Controls
                    </h4>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                    SOW 19.1
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  • <strong>Apply plan/status changes only through agreed administrative controls.</strong> Modifying subscription tiers or account lifecycle status requires an authorized operational reason and documented audit reference.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-blue-100/80">
                  <div className="text-xs">
                    <span className="text-slate-400 block text-xs">Current Plan &amp; State</span>
                    <span className="font-bold text-slate-900">
                      {selectedSubForDetails.planName} · {selectedSubForDetails.subscriptionStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminControlSub(selectedSubForDetails)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs"
                  >
                    <SlidersHorizontal className="size-3.5 text-blue-400" />
                    <span>Apply Plan/Status Changes</span>
                  </button>
                </div>
              </div>

              {/* Payment Method on File */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Applicable Payment Information
                </h4>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                      {selectedSubForDetails.cardBrand.slice(0, 4).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {selectedSubForDetails.cardBrand} ending in {selectedSubForDetails.cardLast4}
                      </p>
                      <p className="text-xs text-slate-500">Expires {selectedSubForDetails.cardExp}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${selectedSubForDetails.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                      }`}
                  >
                    {selectedSubForDetails.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Subscription History / Invoice Ledger */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Subscription Invoicing History
                </h4>
                {selectedSubForDetails.invoiceHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No prior invoices generated yet (Account in trial).</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {selectedSubForDetails.invoiceHistory.map((inv, idx) => (
                      <div key={`${inv.invoiceNo}-${idx}`} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <p className="font-mono font-bold text-slate-900">{inv.invoiceNo}</p>
                          <p className="text-xs text-slate-400">{inv.date} · {inv.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-950">${inv.amount.toFixed(2)}</p>
                          <span
                            className={`rounded px-1.5 py-0.2 text-xs font-bold ${inv.status === 'Paid' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                              }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubForDetails(null)
                  setReviewPaymentSub(selectedSubForDetails)
                }}
                className="text-xs font-semibold text-[#0170FE] hover:underline"
              >
                Review Gateway Audit
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminControlSub(selectedSubForDetails)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs"
                >
                  <SlidersHorizontal className="size-3.5 text-blue-400" />
                  <span>Admin Controls</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubForDetails(null)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         19.1 MODAL 2: REVIEW PAYMENT STATUS
         ========================================================================= */}
      {reviewPaymentSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Receipt className="size-4 text-[#0170FE]" />
                Review Payment Status
              </h3>
              <button
                type="button"
                onClick={() => setReviewPaymentSub(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Broker:</span>
                <span className="font-bold text-slate-900">{reviewPaymentSub.brokerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Plan &amp; Amount:</span>
                <span className="font-bold text-slate-900">{reviewPaymentSub.planName} · ${reviewPaymentSub.monthlyAmount}/mo</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Gateway Status:</span>
                <span
                  className={`font-bold ${reviewPaymentSub.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                >
                  {reviewPaymentSub.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Card on File:</span>
                <span className="font-mono text-slate-800">{reviewPaymentSub.cardBrand} •••• {reviewPaymentSub.cardLast4} (Exp: {reviewPaymentSub.cardExp})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Payment Date:</span>
                <span className="text-slate-800">{reviewPaymentSub.lastPaymentDate}</span>
              </div>
            </div>

            {reviewPaymentSub.paymentStatus === 'Failed' && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                <strong>Failure Reason:</strong> {reviewPaymentSub.failedReason || 'General card decline'}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setReviewPaymentSub(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {reviewPaymentSub.paymentStatus === 'Failed' && (
                <button
                  type="button"
                  onClick={() => handleRetryPayment(reviewPaymentSub.id)}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-rose-700"
                >
                  Retry Payment Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         19.1 MODAL 3: REVIEW FAILED PAYMENT NOTIFICATION STATE
         ========================================================================= */}
      {reviewFailedNotifSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Bell className="size-4 text-rose-600" />
                Review Failed Payment Notification State
              </h3>
              <button
                type="button"
                onClick={() => setReviewFailedNotifSub(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Audit the real-time notification workflows triggered for <strong>{reviewFailedNotifSub.brokerName}</strong>:
            </p>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Bell className="size-3.5 text-[#0170FE]" />
                  Header Notification Center:
                </span>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
                  {reviewFailedNotifSub.headerNotificationState}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-[#0170FE]" />
                  Automated Email Dunning:
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {reviewFailedNotifSub.emailNotificationState} to {reviewFailedNotifSub.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Failed Retry Attempts:</span>
                <span className="font-bold text-rose-600">{reviewFailedNotifSub.failedCount} failed attempts</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              <strong>Notice:</strong> Broker dashboard header displays an urgent alert banner with 1-click link to <code>/broker/settings?tab=membership</code>.
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setReviewFailedNotifSub(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => handleRetryPayment(reviewFailedNotifSub.id)}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-rose-700"
              >
                Re-attempt Charge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         19.1 MODAL 4: REVIEW EXPIRY / NON-RENEWAL NOTIFICATION STATE
         ========================================================================= */}
      {reviewExpiryNotifSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Clock className="size-4 text-amber-500" />
                Review Expiry / Non-Renewal Notification State
              </h3>
              <button
                type="button"
                onClick={() => setReviewExpiryNotifSub(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Subscription renewal tracking for <strong>{reviewExpiryNotifSub.brokerName}</strong>:
            </p>

            <div className="rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Approaching Expiry Date:</span>
                <span className="font-bold text-slate-900">{reviewExpiryNotifSub.trialRenewalDate} ({reviewExpiryNotifSub.daysUntilRenewal} days remaining)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Auto-Renewal Setting:</span>
                <span className={`font-bold ${reviewExpiryNotifSub.autoRenew ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {reviewExpiryNotifSub.autoRenew ? 'Auto-Renew ON' : 'Non-Renewing Requested'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Renewal Notice Dispatch:</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  Delivered 30 Days Prior
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setReviewExpiryNotifSub(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleResendRenewalNotice(reviewExpiryNotifSub)}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-slate-800"
              >
                Resend Renewal Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         19.1 MODAL 5: APPLY PLAN/STATUS CHANGES THROUGH AGREED ADMINISTRATIVE CONTROLS
         • Apply plan/status changes only through agreed administrative controls.
         ========================================================================= */}
      {adminControlSub && (
        <AdminControlModal
          sub={adminControlSub}
          onClose={() => setAdminControlSub(null)}
          onApply={handleApplyAdminControl}
        />
      )}
    </div>
  )
}

/**
 * 19.1 Agreed Administrative Controls Modal
 * Policy Requirement: Apply plan/status changes only through agreed administrative controls.
 */
function AdminControlModal({
  sub,
  onClose,
  onApply,
}: {
  sub: SubscriptionRecord
  onClose: () => void
  onApply: (
    subId: string,
    targetPlan: string,
    targetStatus: SubscriptionRecord['subscriptionStatus'],
    reason: string,
    refId: string,
    proration: string
  ) => void
}) {
  const [targetPlan, setTargetPlan] = useState(sub.planName)
  const [targetStatus, setTargetStatus] = useState<SubscriptionRecord['subscriptionStatus']>(
    sub.subscriptionStatus
  )
  const [reason, setReason] = useState('Agreed Master SOW Amendment / Commercial Schedule')
  const [refId, setRefId] = useState(`SOW-ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`)
  const [timing, setTiming] = useState('Immediate (Apply to active account now)')
  const [proration, setProration] = useState('Prorate balance immediately based on remaining cycle')
  const [complianceConfirmed, setComplianceConfirmed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!complianceConfirmed) return
    onApply(sub.id, targetPlan, targetStatus, reason, refId, proration)
  }

  const planOptions = [
    { name: 'Starter', price: '$29/mo', desc: 'Up to 3 carriers, basic reporting, standard support' },
    { name: 'Professional', price: '$79/mo', desc: 'Up to 15 carriers, full reporting & exports, QR tools' },
    { name: 'Enterprise', price: '$199/mo', desc: 'Unlimited carriers, custom templates, dedicated manager' },
  ]

  const statusOptions: Array<{
    status: SubscriptionRecord['subscriptionStatus']
    badgeClass: string
    desc: string
  }> = [
      { status: 'Active', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Full platform access and regular billing cycle.' },
      { status: 'In Trial', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200', desc: 'Complimentary trial period active.' },
      { status: 'Past Due', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', desc: 'Payment failed; account in grace period.' },
      { status: 'Expired', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Subscription terminated / non-renewed.' },
      { status: 'Non-Renewed', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200', desc: 'Account flagged not to renew on next date.' },
    ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm p-2.5 sm:p-4 md:p-6 flex min-h-full items-center justify-center animate-in fade-in">
      <div className="relative w-full max-w-xl my-auto rounded-2xl bg-white shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden border border-slate-100">
        {/* Sticky Modal Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs">
              <ShieldCheck className="size-4.5 sm:size-5 text-[#0170FE]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-950 truncate">
                  Agreed Administrative Controls
                </h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs sm:text-xs font-bold text-blue-800 shrink-0">
                  SOW 19.1
                </span>
              </div>
              <p className="text-xs sm:text-xs text-slate-500 truncate">
                Apply plan &amp; subscription status changes through agreed operational procedures.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4 text-xs scrollbar-thin">
            {/* Governance Policy Notice */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 sm:p-3.5 text-xs">
              <div className="flex items-start gap-2 text-blue-900 font-semibold leading-snug">
                <span className="size-1.5 mt-1.5 rounded-full bg-[#0170FE] shrink-0" />
                <span>Apply plan/status changes only through agreed administrative controls.</span>
              </div>
              <p className="mt-1 text-xs sm:text-xs text-blue-800/80 pl-3.5 leading-relaxed">
                Administrative policy mandates that broker subscription tiers and account lifecycles must be modified only under agreed commercial terms and documented operational authorization.
              </p>
            </div>

            {/* Target Broker Summary (Responsive) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{sub.brokerName}</p>
                <p className="text-xs text-slate-500 truncate">{sub.businessName} · {sub.email}</p>
              </div>
              <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-200/60">
                <span className="text-xs sm:text-xs text-slate-400 block">Current Configuration</span>
                <span className="font-bold text-slate-800 text-xs sm:text-xs">
                  {sub.planName} (${sub.monthlyAmount}/mo) · {sub.subscriptionStatus}
                </span>
              </div>
            </div>

            {/* 1. Target Membership Plan */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Target Membership Plan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {planOptions.map((opt) => {
                  const isSelected = targetPlan === opt.name
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setTargetPlan(opt.name)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition cursor-pointer min-w-0 ${isSelected
                        ? 'border-slate-950 bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{opt.name}</span>
                        <span className={`text-xs font-semibold shrink-0 ${isSelected ? 'text-blue-300' : 'text-slate-500'}`}>
                          {opt.price}
                        </span>
                      </div>
                      <p className={`mt-1 text-xs sm:text-xs leading-tight line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {opt.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Target Subscription Status */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Target Subscription Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statusOptions.map((item) => {
                  const isSelected = targetStatus === item.status
                  return (
                    <button
                      key={item.status}
                      type="button"
                      onClick={() => setTargetStatus(item.status)}
                      className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer min-w-0 ${isSelected
                        ? 'border-slate-950 bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs truncate">{item.status}</span>
                        {isSelected && <Check className="size-3 text-emerald-400 shrink-0" />}
                      </div>
                      <p className={`mt-0.5 text-xs sm:text-xs leading-tight line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Agreed Administrative Justification / Reason */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Agreed Administrative Reason (Required)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              >
                <option value="Agreed Master SOW Amendment / Commercial Schedule">
                  Agreed Master SOW Amendment / Commercial Schedule
                </option>
                <option value="Broker Written & Signed Upgrade/Downgrade Request">
                  Broker Written &amp; Signed Upgrade/Downgrade Request
                </option>
                <option value="Administrative Grace Period Extension (Operations Approved)">
                  Administrative Grace Period Extension (Operations Approved)
                </option>
                <option value="Delinquency & Compliance Suspension Order">
                  Delinquency &amp; Compliance Suspension Order
                </option>
                <option value="Mutual Termination / Non-Renewal Agreement">
                  Mutual Termination / Non-Renewal Agreement
                </option>
                <option value="Promotional Fee Waiver & Trial Extension Policy">
                  Promotional Fee Waiver &amp; Trial Extension Policy
                </option>
              </select>
            </div>

            {/* 4. Controls Reference & Timing (Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  4. Authorization Audit Reference
                </label>
                <input
                  type="text"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder="e.g. SOW-ADM-2026-XXXX"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-medium text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  5. Effective Date
                </label>
                <select
                  value={timing}
                  onChange={(e) => setTiming(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#0170FE]"
                >
                  <option value="Immediate (Apply to active account now)">
                    Immediate (Apply to active account now)
                  </option>
                  <option value={`Next Billing Cycle (${sub.trialRenewalDate})`}>
                    Next Billing Cycle ({sub.trialRenewalDate})
                  </option>
                  <option value="Retroactive Agreed Operational Alignment">
                    Retroactive Agreed Operational Alignment
                  </option>
                </select>
              </div>
            </div>

            {/* 6. Proration & Adjustment Rule */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                6. Proration &amp; Billing Rule
              </label>
              <select
                value={proration}
                onChange={(e) => setProration(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#0170FE]"
              >
                <option value="Prorate balance immediately based on remaining cycle">
                  Prorate balance immediately based on remaining cycle
                </option>
                <option value="No proration charge (standard switch at renewal)">
                  No proration charge (standard switch at renewal)
                </option>
                <option value="Full administrative waiver (Complimentary override)">
                  Full administrative waiver (Complimentary override)
                </option>
              </select>
            </div>

            {/* Mandatory Certification Checkbox */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-3.5 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceConfirmed}
                  onChange={(e) => setComplianceConfirmed(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-[#0170FE] focus:ring-[#0170FE] shrink-0"
                />
                <span className="text-xs sm:text-xs text-slate-700 select-none leading-relaxed">
                  <strong className="text-slate-900">Agreed Administrative Controls Certification:</strong> I verify that this plan/status adjustment complies strictly with agreed administrative controls, documented platform governance, and signed commercial agreements.
                </span>
              </label>
            </div>
          </div>

          {/* Sticky Modal Footer (Responsive actions) */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!complianceConfirmed}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition ${complianceConfirmed
                ? 'bg-slate-950 hover:bg-slate-800 cursor-pointer shadow-md'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
                }`}
            >
              <ShieldCheck className="size-3.5 text-blue-400 shrink-0" />
              <span>Apply Agreed Plan/Status Change</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

