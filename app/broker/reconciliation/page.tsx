'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Scale,
  TrendingDown,
  RotateCcw,
  Eye,
  Edit3,
  Search,
  Download,
  ArrowRight,
  ChevronRight,
  Filter,
  Check,
  FileText,
  Layers,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
  X,
  ChevronDown,
  Building2,
  ExternalLink,
  ChevronLeft,
  Calendar,
  DollarSign,
  Workflow,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react'
import {
  initialReconciliationData,
  reconciliationWorkflowSteps,
  type ReconciliationCategoryKey,
  type ReconciliationStatusType,
  type ReconciliationRecord,
  type WorkflowStep,
} from '@/data/broker/reconciliation'

interface TabConfig {
  key: ReconciliationCategoryKey
  title: string
  description: string
  badgeColor?: string
}

const TABS: TabConfig[] = [
  {
    key: 'overview',
    title: 'Overview',
    description: 'Summary of expected vs actual commission and reconciliation statuses.',
  },
  {
    key: 'paid',
    title: 'Paid / Matched',
    description: 'Transactions successfully matched/reconciled.',
  },
  {
    key: 'partial',
    title: 'Partial / Short Paid',
    description: 'Actual commission is lower than expected; show difference/outstanding.',
  },
  {
    key: 'unpaid',
    title: 'Unpaid / Not Found',
    description: 'Expected commission not found in processed statement data.',
  },
  {
    key: 'review',
    title: 'Needs Review',
    description: 'Transactions requiring Broker review.',
  },
  {
    key: 'cancellations',
    title: 'Cancellations',
    description: 'Statement-derived cancellation transactions.',
  },
  {
    key: 'chargebacks',
    title: 'Chargebacks',
    description: 'Chargeback transactions.',
  },
  {
    key: 'adjustments',
    title: 'Adjustments',
    description: 'Adjustment/reversal transactions.',
  },
  {
    key: 'overpaid',
    title: 'Overpaid',
    description: 'Where actual exceeds expected, where applicable.',
  },
]

export default function ReconciliationPage() {
  const [data, setData] = useState<ReconciliationRecord[]>(initialReconciliationData)
  const [activeTab, setActiveTab] = useState<ReconciliationCategoryKey>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [isWorkflowExpanded, setIsWorkflowExpanded] = useState(true)

  // Modals state
  const [viewRecord, setViewRecord] = useState<ReconciliationRecord | null>(null)
  const [reviewRecord, setReviewRecord] = useState<ReconciliationRecord | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [resolveRecord, setResolveRecord] = useState<ReconciliationRecord | null>(null)
  const [resolveMethod, setResolveMethod] = useState<'accept_carrier' | 'dispute_variance' | 'link_statement'>('accept_carrier')
  const [resolveNote, setResolveNote] = useState('')
  const [statusUpdateRecord, setStatusUpdateRecord] = useState<ReconciliationRecord | null>(null)
  const [selectedNewStatus, setSelectedNewStatus] = useState<ReconciliationStatusType>('Paid / Matched')
  const [statusUpdateNote, setStatusUpdateNote] = useState('')

  // Sync tab with URL query parameter and sidebar broker-nav-change event
  useEffect(() => {
    function applyUrlParams(searchStr?: string) {
      if (typeof window === 'undefined') return
      const query = searchStr !== undefined ? searchStr : window.location.search
      const params = new URLSearchParams(query)
      const tabParam = params.get('tab')

      if (!tabParam || tabParam === 'overview') {
        setActiveTab('overview')
      } else if (tabParam === 'paid' || tabParam === 'matched') {
        setActiveTab('paid')
      } else if (tabParam === 'partial' || tabParam === 'short-paid' || tabParam === 'short_paid') {
        setActiveTab('partial')
      } else if (tabParam === 'unpaid' || tabParam === 'not-found' || tabParam === 'not_found') {
        setActiveTab('unpaid')
      } else if (tabParam === 'review' || tabParam === 'needs-review' || tabParam === 'needs_review') {
        setActiveTab('review')
      } else if (tabParam === 'cancellations' || tabParam === 'cancellation') {
        setActiveTab('cancellations')
      } else if (tabParam === 'chargebacks' || tabParam === 'chargeback') {
        setActiveTab('chargebacks')
      } else if (tabParam === 'adjustments' || tabParam === 'adjustment') {
        setActiveTab('adjustments')
      } else if (tabParam === 'overpaid' || tabParam === 'over-paid') {
        setActiveTab('overpaid')
      } else {
        const found = TABS.find((t) => t.key === tabParam)
        if (found) {
          setActiveTab(found.key)
        } else {
          setActiveTab('overview')
        }
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
  }, [])

  // Close drawers/modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewRecord) setViewRecord(null)
        if (reviewRecord) setReviewRecord(null)
        if (resolveRecord) setResolveRecord(null)
        if (statusUpdateRecord) setStatusUpdateRecord(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewRecord, reviewRecord, resolveRecord, statusUpdateRecord])

  const handleTabChange = (key: ReconciliationCategoryKey) => {
    setActiveTab(key)
    const newHref = key === 'overview' ? '/broker/reconciliation' : `/broker/reconciliation?tab=${key}`
    const targetSearch = key === 'overview' ? '' : `?tab=${key}`
    window.history.pushState(null, '', newHref)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: newHref, search: targetSearch, pathname: '/broker/reconciliation' },
      })
    )
  }

  // ───── Currency Formatter ─────
  const fmt = (val: number) => {
    const isNeg = val < 0
    const absVal = Math.abs(val)
    const str = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(absVal)
    return isNeg ? `-${str}` : str
  }

  // ───── Category Mapping ─────
  const isRecordInTab = (item: ReconciliationRecord, tabKey: ReconciliationCategoryKey) => {
    if (tabKey === 'overview') return true
    if (tabKey === 'paid') return item.status === 'Paid / Matched'
    if (tabKey === 'partial') return item.status === 'Partial / Short Paid'
    if (tabKey === 'unpaid') return item.status === 'Unpaid / Not Found'
    if (tabKey === 'review') return item.status === 'Needs Review'
    if (tabKey === 'cancellations') return item.status === 'Cancellations'
    if (tabKey === 'chargebacks') return item.status === 'Chargebacks'
    if (tabKey === 'adjustments') return item.status === 'Adjustments'
    if (tabKey === 'overpaid') return item.status === 'Overpaid'
    return true
  }

  // Counts per tab
  const tabCounts = useMemo(() => {
    const counts: Record<ReconciliationCategoryKey, number> = {
      overview: data.length,
      paid: 0,
      partial: 0,
      unpaid: 0,
      review: 0,
      cancellations: 0,
      chargebacks: 0,
      adjustments: 0,
      overpaid: 0,
    }
    data.forEach((item) => {
      if (item.status === 'Paid / Matched') counts.paid++
      else if (item.status === 'Partial / Short Paid') counts.partial++
      else if (item.status === 'Unpaid / Not Found') counts.unpaid++
      else if (item.status === 'Needs Review') counts.review++
      else if (item.status === 'Cancellations') counts.cancellations++
      else if (item.status === 'Chargebacks') counts.chargebacks++
      else if (item.status === 'Adjustments') counts.adjustments++
      else if (item.status === 'Overpaid') counts.overpaid++
    })
    return counts
  }, [data])

  // Overview metrics
  const totalExpected = useMemo(() => {
    return data.reduce((acc, item) => acc + (item.expected > 0 ? item.expected : 0), 0)
  }, [data])

  const totalActual = useMemo(() => {
    return data.reduce((acc, item) => acc + (item.actualPaid > 0 ? item.actualPaid : 0), 0)
  }, [data])

  const totalDifference = useMemo(() => {
    return data.reduce((acc, item) => acc + (item.differenceOutstanding > 0 ? item.differenceOutstanding : 0), 0)
  }, [data])

  // Carriers list for filter
  const carriersList = useMemo(() => {
    const set = new Set<string>()
    data.forEach((item) => set.add(item.carrier))
    return ['All', ...Array.from(set)]
  }, [data])

  // Filtered rows
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (!isRecordInTab(item, activeTab)) return false
      if (carrierFilter !== 'All' && item.carrier !== carrierFilter) return false
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchClient = item.client.toLowerCase().includes(q)
        const matchPolicy = item.policy.toLowerCase().includes(q)
        const matchCarrier = item.carrier.toLowerCase().includes(q)
        const matchType = item.transactionType.toLowerCase().includes(q)
        const matchStmt = item.statementSource.toLowerCase().includes(q)
        const matchStatus = item.status.toLowerCase().includes(q)
        if (!matchClient && !matchPolicy && !matchCarrier && !matchType && !matchStmt && !matchStatus) {
          return false
        }
      }
      return true
    })
  }, [data, activeTab, carrierFilter, searchQuery])

  // Current tab metadata
  const currentTabConfig = useMemo(() => {
    return TABS.find((t) => t.key === activeTab) || TABS[0]
  }, [activeTab])

  // Helper for Status Badge
  const getStatusBadge = (status: ReconciliationStatusType) => {
    switch (status) {
      case 'Paid / Matched':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
            Paid / Matched
          </span>
        )
      case 'Partial / Short Paid':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
            <Scale className="size-3 text-indigo-600 shrink-0" />
            Partial / Short Paid
          </span>
        )
      case 'Unpaid / Not Found':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <Clock className="size-3 text-amber-600 shrink-0" />
            Unpaid / Not Found
          </span>
        )
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
            <AlertCircle className="size-3 text-rose-600 shrink-0" />
            Needs Review
          </span>
        )
      case 'Cancellations':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
            <XCircle className="size-3 text-slate-500 shrink-0" />
            Cancellations
          </span>
        )
      case 'Chargebacks':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-300">
            <TrendingDown className="size-3 text-rose-600 shrink-0" />
            Chargebacks
          </span>
        )
      case 'Adjustments':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 ring-1 ring-purple-200">
            <RotateCcw className="size-3 text-purple-600 shrink-0" />
            Adjustments
          </span>
        )
      case 'Overpaid':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-200">
            <Sparkles className="size-3 text-teal-600 shrink-0" />
            Overpaid
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {status}
          </span>
        )
    }
  }

  // Action: Save Review
  const handleSaveReview = () => {
    if (!reviewRecord) return
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const updated: ReconciliationRecord = {
      ...reviewRecord,
      notes: `${reviewRecord.notes} [Broker Review Note: ${reviewNote.trim() || 'Reviewed by broker.'}]`,
      auditHistory: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: 'Broker Jordan Davis',
          action: 'Broker Review Completed',
          notes: reviewNote.trim() || 'Reviewed and confirmed.',
        },
        ...reviewRecord.auditHistory,
      ],
    }
    setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    if (viewRecord?.id === updated.id) setViewRecord(updated)
    setReviewRecord(null)
    setReviewNote('')
  }

  // Action: Save Match / Resolve
  const handleSaveResolve = () => {
    if (!resolveRecord) return
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    let newStatus: ReconciliationStatusType = 'Paid / Matched'
    let newActual = resolveRecord.actualPaid
    let newDiff = 0
    let actionLabel = 'Match / Resolve Applied'

    if (resolveMethod === 'accept_carrier') {
      newActual = resolveRecord.actualPaid
      newDiff = 0
      actionLabel = 'Carrier Remittance Accepted as Reconciled'
    } else if (resolveMethod === 'dispute_variance') {
      newStatus = 'Needs Review'
      actionLabel = 'Variance Dispute Ticket Filed with Carrier'
    } else if (resolveMethod === 'link_statement') {
      newActual = resolveRecord.expected
      newDiff = 0
      actionLabel = 'Linked to Carrier Statement & Matched'
    }

    const updated: ReconciliationRecord = {
      ...resolveRecord,
      status: newStatus,
      actualPaid: newActual,
      differenceOutstanding: newDiff,
      canMatchResolve: newStatus !== 'Paid / Matched',
      notes: `${resolveRecord.notes} [Resolved: ${resolveNote.trim() || actionLabel}]`,
      auditHistory: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: 'Broker Desk',
          action: actionLabel,
          notes: resolveNote.trim() || 'Transaction reconciled via manual match/resolve process.',
        },
        ...resolveRecord.auditHistory,
      ],
    }

    setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    if (viewRecord?.id === updated.id) setViewRecord(updated)
    setResolveRecord(null)
    setResolveNote('')
  }

  // Action: Save Status Update
  const handleSaveStatusUpdate = () => {
    if (!statusUpdateRecord) return
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const updated: ReconciliationRecord = {
      ...statusUpdateRecord,
      status: selectedNewStatus,
      notes: `${statusUpdateRecord.notes} [Status changed to ${selectedNewStatus}: ${statusUpdateNote.trim()}]`,
      auditHistory: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: nowStr,
          user: 'Broker Jordan Davis',
          action: `Status Updated to ${selectedNewStatus}`,
          notes: statusUpdateNote.trim() || 'Manual status change applied.',
        },
        ...statusUpdateRecord.auditHistory,
      ],
    }

    setData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    if (viewRecord?.id === updated.id) setViewRecord(updated)
    setStatusUpdateRecord(null)
    setStatusUpdateNote('')
  }

  return (
    <div className="p-3 sm:p-5 md:p-7 max-w-[1600px] mx-auto space-y-6">
      {/* ───── Page Header ───── */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-medium text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Broker Workspace · Reconciliation
          </p>
          <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight text-slate-900">
            Reconciliation
          </h1>
          <p className="mt-0.5 text-[13px] sm:text-[14px] text-slate-500 max-w-2xl">
            {currentTabConfig.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsWorkflowExpanded(!isWorkflowExpanded)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <Workflow className="size-3.5 text-blue-600" />
            <span>{isWorkflowExpanded ? 'Hide Workflow' : '10.1 Workflow'}</span>
          </button>
          <button
            onClick={() => alert(`Exporting ${filteredData.length} reconciliation records to CSV...`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ───── 10.1 Reconciliation Workflow Section ───── */}
      {isWorkflowExpanded && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div>
                <h2 className="text-[14px] font-bold text-slate-900">Reconciliation workflow</h2>
                <p className="text-[11.5px] text-slate-500">
                  Sequential 10-step automated &amp; broker-supervised commission reconciliation pipeline
                </p>
              </div>
            </div>

          </div>

          <div className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {reconciliationWorkflowSteps.map((step) => {
                const isDone = step.status === 'completed'
                const isActive = step.status === 'active'
                return (
                  <div
                    key={step.stepNumber}
                    className={`relative rounded-xl border p-3.5 transition-all ${isActive
                      ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-xs'
                      : isDone
                        ? 'border-emerald-200/80 bg-emerald-50/20'
                        : 'border-slate-200/80 bg-slate-50/40'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-1">

                      <span
                        className={`text-[9.5px] font-semibold uppercase tracking-wider ${isActive
                          ? 'text-blue-600'
                          : isDone
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                          }`}
                      >
                        {step.phase}
                      </span>
                    </div>

                    <h3 className="mt-2 text-[12.5px] font-bold text-slate-900 leading-snug">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 leading-normal line-clamp-3">
                      {step.description}
                    </p>

                    <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-slate-100/80">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Processed
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700">
                          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <Clock className="size-3 text-slate-400" />
                          Queued
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ───── Overview KPI Cards (Summary of expected vs actual commission and reconciliation statuses) ───── */}
      {activeTab === 'overview' && (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-500">Expected Commission</span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-100">
                Scheduled
              </span>
            </div>
            <p className="mt-2 text-[24px] font-bold tracking-tight text-slate-900">{fmt(totalExpected)}</p>
            <p className="mt-1 text-[11px] text-slate-400">Total expected across active policies</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-500">Actual / Paid</span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Cleared
              </span>
            </div>
            <p className="mt-2 text-[24px] font-bold tracking-tight text-emerald-600">{fmt(totalActual)}</p>
            <p className="mt-1 text-[11px] text-slate-400">Deposited carrier statement payouts</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-500">Difference / Outstanding</span>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-100">
                Variances
              </span>
            </div>
            <p className="mt-2 text-[24px] font-bold tracking-tight text-amber-600">{fmt(totalDifference)}</p>
            <p className="mt-1 text-[11px] text-slate-400">Short paid or pending statement match</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-900 p-4 text-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-slate-300">Reconciliation Health</span>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Active Match
              </span>
            </div>
            <p className="mt-2 text-[24px] font-bold tracking-tight text-white">
              {Math.round((tabCounts.paid / (data.length || 1)) * 100)}% Matched
            </p>
            <p className="mt-1 text-[11px] text-slate-300">
              {tabCounts.review + tabCounts.partial + tabCounts.unpaid} transactions require action
            </p>
          </div>
        </div>
      )}

      {/* ───── Listing Tabs Bar ───── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {TABS.map((tab) => {
            const count = tabCounts[tab.key]
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <span>{tab.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ───── Search & Filters ───── */}
        <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Client, Policy, Carrier, Statement Source, Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9.5 pr-8 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-slate-500 whitespace-nowrap">Carrier:</span>
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-[12px] font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none cursor-pointer"
              >
                {carriersList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[12px] text-slate-500 pl-2">
              Showing <span className="font-semibold text-slate-800">{filteredData.length}</span> items
            </div>
          </div>
        </div>
      </div>

      {/* ───── Section Title & Subtitle Badge Banner ───── */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="text-[13px] font-bold text-slate-900">{currentTabConfig.title}</span>
          <p className="text-[12px] text-slate-500 mt-0.5">{currentTabConfig.description}</p>
        </div>

      </div>

      {/* ───── Reconciliation Table ───── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Policy</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4 text-right">Expected</th>
                <th className="py-3 px-4 text-right">Actual/Paid</th>
                <th className="py-3 px-4 text-right">Difference/Outstanding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Statement Source</th>
                <th className="py-3 px-4">Transaction Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="size-8 text-slate-300" />
                      <p className="font-medium text-slate-600">No reconciliation records found</p>
                      <p className="text-[12px] text-slate-400">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* 1. Client */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 whitespace-nowrap">{item.client}</div>
                      {item.businessName && (
                        <div className="text-[11px] text-slate-400">{item.businessName}</div>
                      )}
                    </td>

                    {/* 2. Policy */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-[12px] font-medium text-slate-900 whitespace-nowrap">
                        {item.policy}
                      </div>
                      {item.lineOfBusiness && (
                        <div className="text-[11px] text-slate-400">{item.lineOfBusiness}</div>
                      )}
                    </td>

                    {/* 3. Carrier */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 whitespace-nowrap">{item.carrier}</span>
                    </td>

                    {/* 4. Transaction Type */}
                    <td className="py-3 px-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 whitespace-nowrap">
                        {item.transactionType}
                      </span>
                    </td>

                    {/* 5. Expected */}
                    <td className="py-3 px-4 text-right font-medium text-slate-900 whitespace-nowrap">
                      {fmt(item.expected)}
                    </td>

                    {/* 6. Actual/Paid */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-semibold ${item.actualPaid > 0
                          ? 'text-emerald-600'
                          : item.actualPaid < 0
                            ? 'text-rose-600'
                            : 'text-slate-400'
                          }`}
                      >
                        {fmt(item.actualPaid)}
                      </span>
                    </td>

                    {/* 7. Difference/Outstanding */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-semibold ${item.differenceOutstanding === 0
                          ? 'text-slate-400 font-normal'
                          : item.differenceOutstanding > 0
                            ? 'text-amber-600'
                            : 'text-teal-600'
                          }`}
                      >
                        {item.differenceOutstanding === 0 ? '$0.00' : fmt(item.differenceOutstanding)}
                      </span>
                    </td>

                    {/* 8. Status */}
                    <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>

                    {/* 9. Statement Source */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
                        <FileText className="size-2.5 text-slate-400" />
                        {item.statementSource}
                      </span>
                    </td>

                    {/* 10. Transaction Date */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{item.transactionDate}</td>

                    {/* 11. Actions: View; Review; Match/Resolve where applicable; Update status where allowed */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        {/* View */}
                        <button
                          onClick={() => setViewRecord(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="size-3 text-slate-500" />
                          <span>View</span>
                        </button>

                        {/* Review */}
                        <button
                          onClick={() => {
                            setReviewRecord(item)
                            setReviewNote('')
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100/70 cursor-pointer"
                          title="Review Transaction"
                        >
                          <Edit3 className="size-3 text-blue-600" />
                          <span>Review</span>
                        </button>

                        {/* Match/Resolve where applicable */}
                        {item.canMatchResolve ? (
                          <button
                            onClick={() => {
                              setResolveRecord(item)
                              setResolveMethod('accept_carrier')
                              setResolveNote('')
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                            title="Match or Resolve Variance"
                          >
                            <Scale className="size-3 text-indigo-600" />
                            <span>Match/Resolve</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-normal text-slate-300 cursor-not-allowed"
                            title="Not applicable for matched transactions"
                          >
                            <Scale className="size-3 text-slate-300" />
                            <span>Match/Resolve</span>
                          </button>
                        )}

                        {/* Update status where allowed */}
                        {item.canUpdateStatus ? (
                          <button
                            onClick={() => {
                              setStatusUpdateRecord(item)
                              setSelectedNewStatus(item.status)
                              setStatusUpdateNote('')
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                            title="Update Status"
                          >
                            <RotateCcw className="size-3 text-slate-500" />
                            <span>Update status</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-normal text-slate-300 cursor-not-allowed"
                          >
                            <span>Update status</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───── Slide-over Canvas Drawer: View Transaction Details ───── */}
      {viewRecord && (
        <div
          onClick={() => setViewRecord(null)}
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-full sm:max-w-xl md:max-w-2xl flex-col bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/60 shrink-0">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                  Transaction Details · {viewRecord.id}
                </p>
                <h3 className="text-[17px] sm:text-[18px] font-bold text-slate-900">{viewRecord.client}</h3>
              </div>
              <button
                onClick={() => setViewRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Financial Comparison Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <div>
                  <span className="text-[11px] font-medium text-slate-500">Expected Commission</span>
                  <p className="text-[17px] font-bold text-slate-900 mt-0.5">{fmt(viewRecord.expected)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500">Actual / Paid</span>
                  <p className="text-[17px] font-bold text-emerald-600 mt-0.5">{fmt(viewRecord.actualPaid)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-500">Difference / Outstanding</span>
                  <p
                    className={`text-[17px] font-bold mt-0.5 ${
                      viewRecord.differenceOutstanding === 0
                        ? 'text-slate-500'
                        : viewRecord.differenceOutstanding > 0
                        ? 'text-amber-600'
                        : 'text-teal-600'
                    }`}
                  >
                    {fmt(viewRecord.differenceOutstanding)}
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12.5px]">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Policy Number</span>
                  <p className="font-semibold text-slate-800">{viewRecord.policy}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Line of Business</span>
                  <p className="font-semibold text-slate-800">{viewRecord.lineOfBusiness || 'Standard'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Carrier</span>
                  <p className="font-semibold text-slate-800">{viewRecord.carrier}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Transaction Type</span>
                  <p className="font-semibold text-slate-800">{viewRecord.transactionType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Reconciliation Status</span>
                  <div>{getStatusBadge(viewRecord.status)}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Statement Source</span>
                  <p className="font-mono text-slate-800">{viewRecord.statementSource}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Transaction Date</span>
                  <p className="font-medium text-slate-800">{viewRecord.transactionDate}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-400">Client Contact</span>
                  <p className="font-medium text-slate-800">
                    {viewRecord.clientEmail || '—'} {viewRecord.clientPhone ? `(${viewRecord.clientPhone})` : ''}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Reconciliation Notes
                </span>
                <p className="mt-1 text-[12px] text-slate-700 leading-relaxed">{viewRecord.notes}</p>
              </div>

              {/* Audit History */}
              <div>
                <span className="text-[11.5px] font-bold text-slate-800">Audit History</span>
                <div className="mt-2 space-y-2">
                  {viewRecord.auditHistory.map((log) => (
                    <div key={log.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-[11.5px]">
                      <div className="flex items-center justify-between text-slate-500 text-[10.5px]">
                        <span>{log.user}</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="font-semibold text-slate-800 mt-1">{log.action}</p>
                      {log.notes && <p className="text-slate-600 mt-0.5">{log.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 sm:px-6 py-3.5 bg-slate-50/50 shrink-0">
              <button
                onClick={() => setViewRecord(null)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── Modal 2: Review Transaction ───── */}
      {reviewRecord && (
        <div
          onClick={() => setReviewRecord(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[88vh] sm:max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 bg-slate-50/60 shrink-0">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                  Broker Review Queue
                </p>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-900 truncate">{reviewRecord.client} · {reviewRecord.policy}</h3>
              </div>
              <button
                onClick={() => setReviewRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-[12px]">
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-[12px]">
                  <AlertCircle className="size-4 text-amber-600" />
                  <span>Review Details</span>
                </div>
                <p className="mt-1 text-[11.5px] text-amber-900/80 leading-normal">{reviewRecord.notes}</p>
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11.5px]">
                  <span className="text-amber-800 font-medium">Difference: {fmt(reviewRecord.differenceOutstanding)}</span>
                  <span className="text-amber-800 font-mono">Statement: {reviewRecord.statementSource}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1.5">
                  Broker Review Notes &amp; Action Remarks
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Enter audit remarks, carrier communication notes, or resolution confirmation..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 sm:px-6 py-3 bg-slate-50/60 shrink-0">
              <button
                onClick={() => setReviewRecord(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                className="rounded-xl bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer transition"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── Modal 3: Match / Resolve Variance ───── */}
      {resolveRecord && (
        <div
          onClick={() => setResolveRecord(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[88vh] sm:max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 bg-slate-50/60 shrink-0">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  Match / Resolve Variance
                </p>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-900 truncate">{resolveRecord.client}</h3>
              </div>
              <button
                onClick={() => setResolveRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-[12px]">
              {/* Financial Variance Summary Box */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
                <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
                  <div>
                    <span className="text-[10.5px] font-medium text-slate-500 block">Expected</span>
                    <span className="font-bold text-slate-900 text-[13px] block mt-0.5">{fmt(resolveRecord.expected)}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-medium text-slate-500 block">Actual / Paid</span>
                    <span className="font-bold text-emerald-600 text-[13px] block mt-0.5">{fmt(resolveRecord.actualPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] font-medium text-slate-500 block">Variance</span>
                    <span className="font-bold text-amber-600 text-[13px] block mt-0.5">{fmt(resolveRecord.differenceOutstanding)}</span>
                  </div>
                </div>
              </div>

              {/* Resolution Options */}
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1.5">
                  Select Resolution Method
                </label>
                <div className="space-y-2">
                  <label className={`flex items-start gap-2.5 rounded-xl border p-2.5 sm:p-3 transition cursor-pointer ${
                    resolveMethod === 'accept_carrier'
                      ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="resolveMethod"
                      value="accept_carrier"
                      checked={resolveMethod === 'accept_carrier'}
                      onChange={() => setResolveMethod('accept_carrier')}
                      className="mt-0.5 text-indigo-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 leading-snug">
                        Accept Carrier Remittance &amp; Reconcile
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Accept actual carrier amount paid and mark transaction fully reconciled.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 rounded-xl border p-2.5 sm:p-3 transition cursor-pointer ${
                    resolveMethod === 'dispute_variance'
                      ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="resolveMethod"
                      value="dispute_variance"
                      checked={resolveMethod === 'dispute_variance'}
                      onChange={() => setResolveMethod('dispute_variance')}
                      className="mt-0.5 text-indigo-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 leading-snug">
                        File Dispute Ticket with Carrier
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Flag short-pay variance as active carrier dispute and retain in Needs Review queue.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 rounded-xl border p-2.5 sm:p-3 transition cursor-pointer ${
                    resolveMethod === 'link_statement'
                      ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="resolveMethod"
                      value="link_statement"
                      checked={resolveMethod === 'link_statement'}
                      onChange={() => setResolveMethod('link_statement')}
                      className="mt-0.5 text-indigo-600 cursor-pointer"
                    />
                    <div>
                      <p className="text-[12px] font-semibold text-slate-900 leading-snug">
                        Match with Secondary Statement Line
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Force match with supplemental statement line items and balance difference.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                  Resolution Note / Reason
                </label>
                <textarea
                  rows={2.5}
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Enter details on agreement, fee adjustment, or statement reference..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 sm:px-6 py-3 bg-slate-50/60 shrink-0">
              <button
                onClick={() => setResolveRecord(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResolve}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-[12px] font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer transition"
              >
                Apply Match / Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── Modal 4: Update Status ───── */}
      {statusUpdateRecord && (
        <div
          onClick={() => setStatusUpdateRecord(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[88vh] sm:max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 bg-slate-50/60 shrink-0">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Update Transaction Status
                </p>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-slate-900 truncate">{statusUpdateRecord.client} · {statusUpdateRecord.policy}</h3>
              </div>
              <button
                onClick={() => setStatusUpdateRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-[12px]">
              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1.5">
                  Select New Status
                </label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => setSelectedNewStatus(e.target.value as ReconciliationStatusType)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-[12px] font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="Paid / Matched">Paid / Matched</option>
                  <option value="Partial / Short Paid">Partial / Short Paid</option>
                  <option value="Unpaid / Not Found">Unpaid / Not Found</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Cancellations">Cancellations</option>
                  <option value="Chargebacks">Chargebacks</option>
                  <option value="Adjustments">Adjustments</option>
                  <option value="Overpaid">Overpaid</option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1.5">
                  Reason for Status Update
                </label>
                <textarea
                  rows={2.5}
                  value={statusUpdateNote}
                  onChange={(e) => setStatusUpdateNote(e.target.value)}
                  placeholder="Explain why status is being updated manually..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 sm:px-6 py-3 bg-slate-50/60 shrink-0">
              <button
                onClick={() => setStatusUpdateRecord(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatusUpdate}
                className="rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white shadow-xs hover:bg-slate-800 cursor-pointer transition"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
