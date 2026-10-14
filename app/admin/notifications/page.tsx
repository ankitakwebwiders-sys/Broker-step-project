'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Bell,
  BellRing,
  AlertCircle,
  Clock,
  ShieldCheck,
  Mail,
  CheckCircle2,
  Search,
  Filter,
  ExternalLink,
  ArrowRight,
  UserCheck,
  Check,
  Send,
  RotateCcw,
  Info,
  AlertTriangle,
  Eye,
  X,
  FileText,
  ChevronRight,
  Smartphone,
  Server,
  Layers,
} from 'lucide-react'

export interface NotificationWorkflowDef {
  id: string
  title: string
  typeKey: 'payment-failure' | 'expiry'
  priority: 'Critical' | 'High' | 'Standard'
  recipients: string
  recipientBrokers: boolean
  recipientSuperAdmin: boolean
  pageInformation: string
  pageHref: string
  pageLabel: string
  triggerCondition: string
  deliveryChannels: string[]
  status: 'Active & Enforced' | 'Configured'
  lastTriggered: string
  totalSentThisMonth: number
  description: string
}

export interface NotificationLogRecord {
  id: string
  workflowKey: 'payment-failure' | 'expiry'
  eventTitle: string
  brokerName: string
  brokerEmail: string
  businessName: string
  planName: string
  recipientsSummary: string
  deliveredTo: string[]
  pageInfoSummary: string
  timestamp: string
  channel: 'In-App + Email' | 'Email Only' | 'In-App Only'
  deliveryStatus: 'Delivered' | 'Queued' | 'Action Taken'
  payloadDetail: {
    subject: string
    bodyPreview: string
    amount?: number
    daysLeft?: number
    actionRequired: string
  }
}

// ───── 1. Contractual SOW Workflows Specified by Client ─────
const AGREED_WORKFLOWS: NotificationWorkflowDef[] = [
  {
    id: 'NOTIF-WF-001',
    title: 'Failed membership payment',
    typeKey: 'payment-failure',
    priority: 'Critical',
    recipients: 'Broker + Super Admin',
    recipientBrokers: true,
    recipientSuperAdmin: true,
    pageInformation: 'Payment/subscription issue and relevant status',
    pageHref: '/admin/subscriptions?tab=failed-payments',
    pageLabel: 'Subscriptions > Failed Payments',
    triggerCondition: 'Immediate payment failure, insufficient funds, or past-due grace period trigger.',
    deliveryChannels: ['Broker In-App Banner', 'Broker Billing Email', 'Super Admin Security Alert'],
    status: 'Active & Enforced',
    lastTriggered: '24 mins ago',
    totalSentThisMonth: 14,
    description:
      'Dispatched simultaneously to the impacted broker and Super Admin console when an automated recurring membership charge declines, detailing payment retry schedule and grace period countdown.',
  },
  {
    id: 'NOTIF-WF-002',
    title: 'Membership expiry / non-renewal',
    typeKey: 'expiry',
    priority: 'High',
    recipients: 'Broker + Super Admin',
    recipientBrokers: true,
    recipientSuperAdmin: true,
    pageInformation: 'Expiry/non-renewal status and affected membership',
    pageHref: '/admin/subscriptions?tab=expiring',
    pageLabel: 'Subscriptions > Expiring / Non-Renewing',
    triggerCondition: '30-day, 7-day countdown before term expiry, or explicit non-renewal selection.',
    deliveryChannels: ['Broker Renewal Banner', 'Broker Countdown Email', 'Super Admin Retention Queue'],
    status: 'Active & Enforced',
    lastTriggered: '2 hours ago',
    totalSentThisMonth: 28,
    description:
      'Notifies broker of impending term expiration or non-renewal intent, while flagging the affected account in the Super Admin retention queue for administrative follow-up or commercial agreement.',
  },
]

// ───── 2. Realistic Log Records for Platform Auditing ─────
const INITIAL_LOGS: NotificationLogRecord[] = [
  {
    id: 'LOG-2026-901',
    workflowKey: 'payment-failure',
    eventTitle: 'Failed membership payment',
    brokerName: 'Marcus Vance',
    brokerEmail: 'marcus@vanceinsure.com',
    businessName: 'Vance & Associates Risk Group',
    planName: 'Professional ($79/mo)',
    recipientsSummary: 'Broker + Super Admin',
    deliveredTo: ['marcus@vanceinsure.com', 'admin@brokerstep.internal'],
    pageInfoSummary: 'Past Due · Card declined (Insufficient Funds) · Grace Period: 3 days remaining',
    timestamp: 'Today at 09:42 AM',
    channel: 'In-App + Email',
    deliveryStatus: 'Delivered',
    payloadDetail: {
      subject: 'Urgent: Your BrokerStep Professional Membership Payment Failed',
      bodyPreview:
        'Your monthly payment of $79.00 via Visa •••• 4242 failed. Please update your billing method within 3 days to maintain seamless platform access.',
      amount: 79.0,
      actionRequired: 'Review Failed Payment & retry billing card in Subscriptions panel.',
    },
  },
  {
    id: 'LOG-2026-902',
    workflowKey: 'expiry',
    eventTitle: 'Membership expiry notice (14 Days)',
    brokerName: 'Elena Rostova',
    brokerEmail: 'elena@summitinsure.com',
    businessName: 'Summit Life & Health Partners',
    planName: 'Professional ($79/mo)',
    recipientsSummary: 'Broker + Super Admin',
    deliveredTo: ['elena@summitinsure.com', 'admin@brokerstep.internal'],
    pageInfoSummary: 'Expiring in 14 Days (Nov 01, 2026) · Auto-renew flag pending verification',
    timestamp: 'Today at 07:15 AM',
    channel: 'In-App + Email',
    deliveryStatus: 'Delivered',
    payloadDetail: {
      subject: 'Reminder: Your BrokerStep Membership will renew in 14 days',
      bodyPreview:
        'Your Professional membership plan is scheduled for term renewal on November 01, 2026. Review your plan details and carrier slots anytime.',
      daysLeft: 14,
      actionRequired: 'Inspect upcoming renewal schedule under Subscriptions > Expiring.',
    },
  },
  {
    id: 'LOG-2026-903',
    workflowKey: 'expiry',
    eventTitle: 'Non-renewal preference recorded',
    brokerName: 'Jordan Davis',
    brokerEmail: 'jordan@brokerstep.com',
    businessName: 'Apex Horizon Brokerage LLC',
    planName: 'Professional ($79/mo)',
    recipientsSummary: 'Broker + Super Admin',
    deliveredTo: ['jordan@brokerstep.com', 'admin@brokerstep.internal'],
    pageInfoSummary: 'Non-Renewed · Broker opted out of auto-renew on renewal date (Oct 28, 2026)',
    timestamp: 'Yesterday at 04:30 PM',
    channel: 'In-App + Email',
    deliveryStatus: 'Action Taken',
    payloadDetail: {
      subject: 'Confirmation: Non-Renewal Scheduled for Apex Horizon Brokerage',
      bodyPreview:
        'Your request to discontinue automatic renewal at the end of the current term has been recorded. Full access remains active until Oct 28, 2026.',
      daysLeft: 14,
      actionRequired: 'Commercial retention review in agreed administrative controls.',
    },
  },
  {
    id: 'LOG-2026-904',
    workflowKey: 'payment-failure',
    eventTitle: 'Failed membership payment (Retry #2)',
    brokerName: 'Nathaniel Cross',
    brokerEmail: 'ncross@crosslinerisk.com',
    businessName: 'Crossline Risk Advisors LLC',
    planName: 'Starter ($29/mo)',
    recipientsSummary: 'Broker + Super Admin',
    deliveredTo: ['ncross@crosslinerisk.com', 'admin@brokerstep.internal'],
    pageInfoSummary: 'Past Due · Card Expired · Gateway error: EXPIRED_CARD',
    timestamp: 'Oct 12, 2026 at 11:20 AM',
    channel: 'In-App + Email',
    deliveryStatus: 'Delivered',
    payloadDetail: {
      subject: 'Action Required: Card Expired for BrokerStep Starter Plan',
      bodyPreview:
        'We were unable to process your renewal of $29.00 due to an expired credit card on file. Please provide updated card details.',
      amount: 29.0,
      actionRequired: 'Update payment method in broker portal billing settings.',
    },
  },
  {
    id: 'LOG-2026-905',
    workflowKey: 'expiry',
    eventTitle: 'Membership expiry notice (30 Days)',
    brokerName: 'Aria Montgomery',
    brokerEmail: 'aria@beaconwealthins.com',
    businessName: 'Beacon Wealth & Insurance LLC',
    planName: 'Enterprise ($199/mo)',
    recipientsSummary: 'Broker + Super Admin',
    deliveredTo: ['aria@beaconwealthins.com', 'admin@brokerstep.internal'],
    pageInfoSummary: 'Expiring in 30 Days (Nov 15, 2026) · Annual enterprise renewal schedule',
    timestamp: 'Oct 11, 2026 at 09:00 AM',
    channel: 'Email Only',
    deliveryStatus: 'Delivered',
    payloadDetail: {
      subject: 'Advance Notice: 30-Day Enterprise Membership Term Renewal',
      bodyPreview:
        'Your annual Enterprise agreement with BrokerStep approaches its renewal date on Nov 15, 2026. Custom SLA and carrier integration limits will roll over automatically.',
      daysLeft: 30,
      actionRequired: 'Review Enterprise billing schedule with designated account manager.',
    },
  },
]

export default function AdminNotificationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading notifications module...</div>}>
      <NotificationsContent />
    </Suspense>
  )
}

function NotificationsContent() {
  const searchParams = useSearchParams()
  const typeFilterParam = searchParams.get('type')

  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'all' | 'payment-failure' | 'expiry'>(() => {
    if (typeFilterParam === 'payment-failure') return 'payment-failure'
    if (typeFilterParam === 'expiry') return 'expiry'
    return 'all'
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [recipientFilter, setRecipientFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [logs, setLogs] = useState<NotificationLogRecord[]>(INITIAL_LOGS)
  const [selectedLog, setSelectedLog] = useState<NotificationLogRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  function handleResendNotification(log: NotificationLogRecord) {
    showToast(`Notification "${log.eventTitle}" re-dispatched to ${log.deliveredTo.join(', ')}`)
  }

  // Filtered log feed
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Tab filter
      if (activeWorkflowTab === 'payment-failure' && log.workflowKey !== 'payment-failure') return false
      if (activeWorkflowTab === 'expiry' && log.workflowKey !== 'expiry') return false

      // Recipient filter
      if (recipientFilter !== 'All' && log.recipientsSummary !== recipientFilter) return false

      // Status filter
      if (statusFilter !== 'All' && log.deliveryStatus !== statusFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = log.eventTitle.toLowerCase().includes(q)
        const matchBroker = log.brokerName.toLowerCase().includes(q)
        const matchBusiness = log.businessName.toLowerCase().includes(q)
        const matchEmail = log.brokerEmail.toLowerCase().includes(q)
        const matchInfo = log.pageInfoSummary.toLowerCase().includes(q)
        if (!matchTitle && !matchBroker && !matchBusiness && !matchEmail && !matchInfo) return false
      }

      return true
    })
  }, [logs, activeWorkflowTab, recipientFilter, statusFilter, searchQuery])

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ───── Page Header ───── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Notifications
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Platform notification center, routing matrix, and automated delivery logs for broker accounts.
          </p>
        </div>

        {/* Quick Scope Verification Status */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>2 Agreed Workflows Active</span>
          </div>
          <Link
            href="/admin/subscriptions"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0170FE] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#005cd4] transition cursor-pointer"
          >
            <ExternalLink className="size-3.5" />
            <span>View Subscriptions</span>
          </Link>
        </div>
      </div>

      {/* ───── 3 Top KPI Cards ───── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Agreed Notification Scope
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-950">2 Workflows</p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Strictly configured as agreed with Super Admin + Broker recipients.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payment Failure Workflows
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-950">14 Dispatched</p>
          <p className="mt-1 text-xs text-rose-600 font-medium">
            Active in broker header &amp; Super Admin queue.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Expiry &amp; Non-Renewal Workflows
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-950">28 Dispatched</p>
          <p className="mt-1 text-xs text-amber-600 font-medium">
            30-day countdowns &amp; non-renewing ledger entries.
          </p>
        </div>
      </div>

      {/* =========================================================================
         SECTION A: CONTRACTUAL NOTIFICATIONS MATRIX (EXACT CLIENT REQUIREMENT)
         ========================================================================= */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                <BellRing className="size-3.5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950">
                Agreed Notification Routing Matrix
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Exact routing, designated recipients, and destination information defined under agreed specifications.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="size-3.5" />
            <span>Enforced Standard Routing</span>
          </div>
        </div>

        {/* The Matrix Table (Exact mapping as requested) */}
        <div className="overflow-x-auto">
          <table className="min-w-[1240px] w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-4 min-w-[360px] w-[30%]">Notification</th>
                <th className="py-3.5 px-4 min-w-[280px] w-[22%]">Recipient</th>
                <th className="py-3.5 px-4 min-w-[360px] w-[28%]">Page / information</th>
                <th className="py-3.5 px-4 min-w-[280px] w-[20%]">Delivery Channels</th>
                <th className="py-3.5 pl-4 pr-6 text-right min-w-[170px] w-[170px] md:sticky md:right-0 bg-slate-50/95 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {AGREED_WORKFLOWS.map((wf) => {
                const isFailedPayment = wf.typeKey === 'payment-failure'
                return (
                  <tr key={wf.id} className="group hover:bg-slate-50/80 transition">
                    {/* 1. Notification */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl ${isFailedPayment
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                            : 'bg-amber-50 text-amber-600 border border-amber-200/80'
                            }`}
                        >
                          {isFailedPayment ? <AlertCircle className="size-4" /> : <Clock className="size-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 text-sm whitespace-nowrap">
                            {wf.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {wf.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="font-mono text-[10.5px] text-slate-400 font-semibold">
                              {wf.id}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${wf.priority === 'Critical'
                                ? 'bg-rose-100/70 text-rose-800'
                                : 'bg-amber-100/70 text-amber-800'
                                }`}
                            >
                              {wf.priority} Priority
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Recipient */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white shadow-2xs whitespace-nowrap">
                          <UserCheck className="size-3 text-blue-400" />
                          <span>{wf.recipients}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 pl-0.5">
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Check className="size-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs text-slate-600 font-medium">Broker (Header Banner + Billing Email)</span>
                          </span>
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <Check className="size-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs text-slate-600 font-medium">Super Admin (Queue &amp; Security Alert)</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Page / information */}
                    <td className="py-4 px-4 align-top">
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-snug">
                          {wf.pageInformation}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Directly connects into the administrative subscriptions management views:
                        </p>
                        <div className="mt-2.5">
                          <Link
                            href={wf.pageHref}
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-xs font-bold text-[#0170FE] hover:bg-blue-100 hover:border-blue-300 transition whitespace-nowrap shadow-2xs"
                          >
                            <span>{wf.pageLabel}</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* 4. Delivery Channels */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {wf.deliveryChannels.map((channel, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap"
                          >
                            <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
                            {channel}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        Triggered: {wf.lastTriggered}
                      </p>
                    </td>

                    {/* 5. Status */}
                    <td className="py-4 pl-4 pr-6 text-right align-top whitespace-nowrap min-w-[170px] w-[170px] md:sticky md:right-0 bg-white group-hover:bg-[#f8fafc] md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {wf.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ───── CRITICAL SCOPE / CLIENT REQUIREMENT GOVERNANCE NOTICE ───── */}
        <div className="border-t border-slate-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Info className="size-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Agreed Notification Governance Notice
                </span>
                <span className="rounded-full bg-blue-200/70 px-2 py-0.2 text-[10.5px] font-bold text-blue-900">
                  Scope Policy
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                &ldquo;<strong>Additional notification workflows are not automatically included unless separately agreed.</strong>&rdquo;
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                All platform automated notifications are strictly aligned with the agreed specification for payment failure and membership expiry. Any additional third-party webhooks, SMS alerts, or custom operational notification channels require dedicated commercial authorization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
         SECTION B: LIVE NOTIFICATION DISPATCH FEED & DELIVERY LOGS
         ========================================================================= */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-950">
            Automated Notification Dispatch Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of recently dispatched alerts delivered to Brokers and Super Admin.
          </p>
        </div>

        {/* Workflow Quick Tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${activeWorkflowTab === 'all'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            All Workflows ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('payment-failure')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${activeWorkflowTab === 'payment-failure'
              ? 'bg-white text-rose-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Failed Payments ({logs.filter((l) => l.workflowKey === 'payment-failure').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkflowTab('expiry')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${activeWorkflowTab === 'expiry'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Expiry &amp; Non-Renewal ({logs.filter((l) => l.workflowKey === 'expiry').length})
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar (Responsive) */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:flex-wrap flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:w-auto sm:min-w-[220px] sm:max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, broker, or email..."
                className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0170FE] focus:bg-white focus:ring-2 focus:ring-[#0170FE]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 w-full sm:w-auto">
              <select
                value={recipientFilter}
                onChange={(e) => setRecipientFilter(e.target.value)}
                className="h-9.5 w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
              >
                <option value="All">All Recipients</option>
                <option value="Broker + Super Admin">Broker + Super Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9.5 w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
              >
                <option value="All">All Delivery Status</option>
                <option value="Delivered">Delivered</option>
                <option value="Action Taken">Action Taken</option>
                <option value="Queued">Queued</option>
              </select>

              {(recipientFilter !== 'All' || statusFilter !== 'All' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setRecipientFilter('All')
                    setStatusFilter('All')
                  }}
                  className="hidden lg:inline-flex items-center gap-1.5 h-9.5 px-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 font-medium pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
            <span>
              Showing <strong className="text-slate-800">{filteredLogs.length}</strong> records
            </span>
            {(recipientFilter !== 'All' || statusFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setRecipientFilter('All')
                  setStatusFilter('All')
                }}
                className="lg:hidden inline-flex items-center gap-1 text-xs font-semibold text-[#0170FE] hover:underline"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Logs Table */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-4 min-w-[240px]">Event &amp; Timestamp</th>
                <th className="py-3.5 px-4 min-w-[240px]">Affected Broker</th>
                <th className="py-3.5 px-4 min-w-[220px]">Recipient Routing</th>
                <th className="py-3.5 px-4 min-w-[280px]">Delivered Information</th>
                <th className="py-3.5 px-4 min-w-[140px]">Status</th>
                <th className="py-3.5 pl-4 pr-6 text-right min-w-[180px] w-[180px] md:sticky md:right-0 bg-slate-50/95 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No notification dispatch records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isPayment = log.workflowKey === 'payment-failure'
                  return (
                    <tr key={log.id} className="group hover:bg-slate-50/80 transition">
                      {/* 1. Event & Timestamp */}
                      <td className="py-3.5 pl-6 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full shrink-0 ${isPayment ? 'bg-rose-500' : 'bg-amber-500'
                              }`}
                          />
                          <p className="font-bold text-slate-900">{log.eventTitle}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono pl-4">
                          {log.id} · {log.timestamp}
                        </p>
                      </td>

                      {/* 2. Affected Broker */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{log.brokerName}</p>
                        <p className="text-xs text-slate-400">{log.businessName}</p>
                        <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.2 text-[10.5px] font-semibold text-slate-600">
                          {log.planName}
                        </span>
                      </td>

                      {/* 3. Recipient Routing */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-800">
                          <UserCheck className="size-3 text-blue-600" />
                          {log.recipientsSummary}
                        </span>
                        <p className="text-[10.5px] text-slate-400 mt-1 truncate max-w-[200px]" title={log.deliveredTo.join(', ')}>
                          {log.deliveredTo.join(' & ')}
                        </p>
                      </td>

                      {/* 4. Delivered Information */}
                      <td className="py-3.5 px-4">
                        <p className="text-xs text-slate-700 leading-snug">
                          {log.pageInfoSummary}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[#0170FE]">
                          <Mail className="size-3" />
                          {log.channel}
                        </span>
                      </td>

                      {/* 5. Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${log.deliveryStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.deliveryStatus === 'Action Taken'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                        >
                          <Check className="size-3" />
                          {log.deliveryStatus}
                        </span>
                      </td>

                      {/* 6. Actions (Sticky only on md+) */}
                      <td className="py-3.5 pl-4 pr-6 text-right whitespace-nowrap min-w-[180px] w-[180px] md:sticky md:right-0 bg-white group-hover:bg-[#f8fafc] md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#0170FE] transition cursor-pointer"
                          >
                            <Eye className="size-3" />
                            <span>Inspect</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResendNotification(log)}
                            title="Resend notification to Broker & Super Admin"
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer"
                          >
                            <Send className="size-3 text-slate-500" />
                            <span>Resend</span>
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
         MODAL / INSPECTOR: NOTIFICATION DETAILS & PAYLOAD PREVIEW
         ========================================================================= */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm p-3 sm:p-4 flex min-h-full items-center justify-center animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${selectedLog.workflowKey === 'payment-failure'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-amber-50 text-amber-600'
                    }`}
                >
                  <Bell className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    Notification Payload Inspector
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedLog.id} · {selectedLog.timestamp}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                aria-label="Close modal"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Recipient Distribution Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Designated Recipients (Agreed Scope)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2.5">
                    <span className="font-bold text-slate-800 text-xs block flex items-center gap-1">
                      <UserCheck className="size-3 text-blue-600" />
                      Broker Recipient
                    </span>
                    <p className="text-slate-600 mt-0.5 truncate">{selectedLog.brokerEmail}</p>
                    <span className="text-[10.5px] text-emerald-600 font-semibold block mt-1">
                      ✓ In-App Header &amp; Email Delivered
                    </span>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2.5">
                    <span className="font-bold text-slate-800 text-xs block flex items-center gap-1">
                      <ShieldCheck className="size-3 text-indigo-600" />
                      Super Admin Recipient
                    </span>
                    <p className="text-slate-600 mt-0.5 truncate">admin@brokerstep.internal</p>
                    <span className="text-[10.5px] text-emerald-600 font-semibold block mt-1">
                      ✓ Console Security Alert Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Content Preview */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Delivered Subject &amp; Content
                </span>
                <p className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  {selectedLog.payloadDetail.subject}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {selectedLog.payloadDetail.bodyPreview}
                </p>
                {selectedLog.payloadDetail.amount && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700">
                    <span>Payment Due Amount: ${selectedLog.payloadDetail.amount.toFixed(2)}</span>
                  </div>
                )}
                {selectedLog.payloadDetail.daysLeft && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                    <span>Term Days Remaining: {selectedLog.payloadDetail.daysLeft} days</span>
                  </div>
                )}
              </div>

              {/* Action Required & Direct Page Destination */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
                  Page / Information Destination
                </span>
                <p className="text-xs font-medium text-blue-950">
                  {selectedLog.payloadDetail.actionRequired}
                </p>
                <div className="pt-2">
                  <Link
                    href={
                      selectedLog.workflowKey === 'payment-failure'
                        ? '/admin/subscriptions?tab=failed-payments'
                        : '/admin/subscriptions?tab=expiring'
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0170FE] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#005cd4] transition cursor-pointer"
                  >
                    <span>Open in Subscriptions Management</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Contractually agreed notification workflow
              </span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
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
