'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  FileSpreadsheet,
  Download,
  Upload,
  Search,
  Plus,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  FileText,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  List,
  LayoutGrid,
  Layers,
  Building2,
  Sparkles,
  RefreshCw,
  Sliders,
  ArrowLeftRight,
  X,
  FileCheck2,
  Database,
  GitBranch,
  Calendar,
  DollarSign,
  Info,
  Scale,
} from 'lucide-react'
import {
  initialStatements,
  type StatementRecord,
  type StatementTransactionItem,
  type StatementProcessingStatus,
  type MatchConfidenceTier,
} from '@/data/broker/statements'

export default function AllStatementsPage() {
  // Master statements state
  const [statements, setStatements] = useState<StatementRecord[]>(initialStatements)

  // Load custom statements added via Upload New Statement page
  useEffect(() => {
    try {
      const stored = localStorage.getItem('broker_custom_statements')
      if (stored) {
        const parsed: StatementRecord[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStatements((prev) => {
            const existingIds = new Set(prev.map((s) => s.id))
            const newOnes = parsed.filter((s) => !existingIds.has(s.id))
            return [...newOnes, ...prev]
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // View mode for listings: 'table' | 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Modals & Drawers state
  const [selectedStatementForDetail, setSelectedStatementForDetail] = useState<StatementRecord | null>(null)
  const [selectedTxnForTrace, setSelectedTxnForTrace] = useState<StatementTransactionItem | null>(null)
  const [reprocessModalTarget, setReprocessModalTarget] = useState<StatementRecord | null>(null)
  const [resolveModalTarget, setResolveModalTarget] = useState<StatementTransactionItem | null>(null)
  const [resolveNote, setResolveNote] = useState('')

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // ───── Global Metrics Calculations ─────
  const totalStatementsCount = statements.length
  const completedStatementsCount = useMemo(() => {
    return statements.filter((s) => s.processingStatus === 'Completed' || s.processingStatus === 'Processed').length
  }, [statements])

  const inProcessingPipelineCount = useMemo(() => {
    return statements.filter((s) => s.processingStatus === 'Processing' || s.processingStatus === 'Uploaded').length
  }, [statements])

  const needsReviewCount = useMemo(() => {
    return statements.filter((s) => s.processingStatus === 'Needs Review').length
  }, [statements])

  const totalRemittanceVolume = useMemo(() => {
    return statements.reduce((sum, s) => sum + s.totalRemittance, 0)
  }, [statements])

  const totalTransactionsCount = useMemo(() => {
    return statements.reduce((sum, s) => sum + s.transactionsCount, 0)
  }, [statements])

  const totalMatchedCount = useMemo(() => {
    return statements.reduce((sum, s) => sum + s.matchedCount, 0)
  }, [statements])

  const matchAccuracyRate = useMemo(() => {
    if (totalTransactionsCount === 0) return 0
    return Math.round((totalMatchedCount / totalTransactionsCount) * 100)
  }, [totalTransactionsCount, totalMatchedCount])

  // ───── Format Helpers ─────
  const fmtCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val)
  }

  function getStatusBadge(status: StatementProcessingStatus) {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
            <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
            Completed
          </span>
        )
      case 'Processed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
            <FileCheck2 className="size-3.5 text-blue-600 shrink-0" />
            Processed
          </span>
        )
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Processing
          </span>
        )
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 whitespace-nowrap">
            <AlertCircle className="size-3.5 text-rose-600 shrink-0" />
            Needs Review
          </span>
        )
      case 'Uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 whitespace-nowrap">
            <Clock className="size-3.5 text-slate-500 shrink-0" />
            Uploaded
          </span>
        )
    }
  }

  function getFileIcon(type: 'xlsx' | 'csv' | 'pdf') {
    if (type === 'xlsx') return <FileSpreadsheet className="size-4 text-emerald-600" />
    if (type === 'csv') return <FileText className="size-4 text-blue-600" />
    return <FileText className="size-4 text-rose-600" />
  }

  // ───── Table Horizontal Scroll ─────
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkTableScroll = () => {
    if (!tableContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkTableScroll()
    const handleResize = () => checkTableScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [statements])

  const handleScrollTable = (direction: 'left' | 'right') => {
    if (!tableContainerRef.current) return
    const delta = direction === 'left' ? -350 : 350
    tableContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(checkTableScroll, 350)
  }

  // ───── Filtered Statements List ─────
  const filteredStatements = useMemo(() => {
    return statements.filter((stmt) => {
      // Carrier filter
      if (carrierFilter !== 'All' && stmt.carrier !== carrierFilter) {
        return false
      }

      // Processing status filter
      if (statusFilter !== 'All' && stmt.processingStatus !== statusFilter) {
        return false
      }

      // Text search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchesId = stmt.id.toLowerCase().includes(q)
        const matchesIdent = stmt.statementIdentifier.toLowerCase().includes(q)
        const matchesCarrier = stmt.carrier.toLowerCase().includes(q)
        const matchesFile = stmt.fileName.toLowerCase().includes(q)
        const matchesBatch = stmt.batchReference.toLowerCase().includes(q)
        if (!matchesId && !matchesIdent && !matchesCarrier && !matchesFile && !matchesBatch) {
          return false
        }
      }

      return true
    })
  }, [statements, carrierFilter, statusFilter, searchQuery])

  // ───── Reprocess Statement Handler ─────
  function handleExecuteReprocess() {
    if (!reprocessModalTarget) return
    const updated = {
      ...reprocessModalTarget,
      processingStatus: 'Processing' as StatementProcessingStatus,
      reprocessedCount: reprocessModalTarget.reprocessedCount + 1,
      processingPipelineStep: 4,
      auditHistory: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: 'Jordan Davis (Manual Trigger)',
          action: 'Reprocessing Executed',
          notes: 'Full OCR/Parser re-run initiated with latest template mapping definitions.',
        },
        ...reprocessModalTarget.auditHistory,
      ],
    }

    setStatements((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    showToast(`Statement ${reprocessModalTarget.statementIdentifier} sent for reprocessing.`)
    setReprocessModalTarget(null)
  }

  // ───── Manual Match Resolution Handler ─────
  function handleResolveUnmatched() {
    if (!resolveModalTarget) return
    const resolvedItem: StatementTransactionItem = {
      ...resolveModalTarget,
      status: 'Resolved',
      matchConfidence: 'High Confidence',
      resolutionNote: resolveNote.trim() || 'Manually confirmed and reconciled by Principal Broker.',
    }

    setStatements((prev) =>
      prev.map((stmt) => {
        if (stmt.id !== resolveModalTarget.statementId) return stmt
        const updatedTxns = stmt.transactions.map((t) => (t.id === resolvedItem.id ? resolvedItem : t))
        const newMatched = stmt.matchedCount + 1
        const newUnmatched = Math.max(0, stmt.unmatchedCount - 1)
        return {
          ...stmt,
          matchedCount: newMatched,
          unmatchedCount: newUnmatched,
          transactions: updatedTxns,
        }
      })
    )

    if (selectedStatementForDetail && selectedStatementForDetail.id === resolveModalTarget.statementId) {
      setSelectedStatementForDetail((prev) => {
        if (!prev) return null
        return {
          ...prev,
          matchedCount: prev.matchedCount + 1,
          unmatchedCount: Math.max(0, prev.unmatchedCount - 1),
          transactions: prev.transactions.map((t) => (t.id === resolvedItem.id ? resolvedItem : t)),
        }
      })
    }

    showToast(`Transaction ${resolveModalTarget.policyNumber} marked as Resolved!`)
    setResolveModalTarget(null)
    setResolveNote('')
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 bg-[#f8fafc] min-h-screen">
      {/* ───── Toast Notification ───── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-xs sm:text-sm">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* ───── Page Header ───── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span>All Statements</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs sm:text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
              {statements.length} Batches
            </span>
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] text-slate-500 leading-relaxed">
            Carrier remittance batches, reconciliation status, and general commission statement records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => alert(`Exporting audit log of ${statements.length} statements to CSV...`)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <Download className="size-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <Link
            href="/broker/statements/upload"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)]"
          >
            <Upload className="size-4" />
            <span>+ Upload New Statement</span>
          </Link>
        </div>
      </div>

      {/* ───── Top KPI Stat Cards ───── */}
      <div className="grid gap-2.5 sm:gap-3.5 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {/* 1. Total Statements */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Statements</p>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 ring-1 ring-blue-100">
              Total
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
            {totalStatementsCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Carrier batches</p>
        </div>

        {/* 2. Completed */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Processed</p>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Cleared
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 font-mono">
            {completedStatementsCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Ledger booked</p>
        </div>

        {/* 3. In Pipeline */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_8px_30px_-12px_rgba(245,158,11,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Processing</p>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
              Active
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 font-mono">
            {inProcessingPipelineCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">In pipeline</p>
        </div>

        {/* 4. Needs Review */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Needs Review</p>
            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-100">
              Action
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 font-mono">
            {needsReviewCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Variances</p>
        </div>

        {/* 5. Total Remittance */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Total Volume</p>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              Payouts
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-mono truncate">
            {fmtCurrency(totalRemittanceVolume)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Sum remittances</p>
        </div>

        {/* 6. Match Accuracy */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_8px_30px_-12px_rgba(99,102,241,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-xs sm:text-sm font-medium text-slate-500">Match Rate</p>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
              Concordance
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-600 font-mono">
            {matchAccuracyRate}%
          </p>
          <p className="mt-1 text-xs text-slate-400">{totalMatchedCount} of {totalTransactionsCount} matched</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          ALL STATEMENTS LISTING & FILTERS
      ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by statement ID, carrier, file name, batch #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9.5 pr-8 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & View Mode */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Carrier Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600">Carrier:</span>
                <select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Carriers</option>
                  <option value="Travelers">Travelers</option>
                  <option value="Chubb">Chubb</option>
                  <option value="Medical Protective">Medical Protective</option>
                  <option value="Hartford">Hartford</option>
                  <option value="AIG">AIG</option>
                  <option value="CNA">CNA</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Processed">Processed</option>
                  <option value="Processing">Processing</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Uploaded">Uploaded</option>
                </select>
              </div>

              {/* View Switcher: Table vs Cards */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`rounded-lg p-1.5 transition cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Table view"
                >
                  <List className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`rounded-lg p-1.5 transition cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grid cards view"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>

              {/* Reset Filter Button */}
              {(searchQuery || carrierFilter !== 'All' || statusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setCarrierFilter('All')
                    setStatusFilter('All')
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
            {/* Scroll Navigation Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Showing {filteredStatements.length} of {statements.length} Statements
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 hidden sm:inline">Scroll columns:</span>
                <button
                  type="button"
                  onClick={() => handleScrollTable('left')}
                  disabled={!canScrollLeft}
                  className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  title="Scroll Left"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollTable('right')}
                  disabled={!canScrollRight}
                  className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  title="Scroll Right"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>

            <div ref={tableContainerRef} onScroll={checkTableScroll} className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[1240px] text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                    <th className="px-4 py-3 min-w-[190px]">Statement ID / File</th>
                    <th className="px-3.5 py-3 min-w-[140px]">Carrier Partner</th>
                    <th className="px-3.5 py-3 min-w-[120px]">Period</th>
                    <th className="px-3.5 py-3 min-w-[170px]">Payment Method</th>
                    <th className="px-3.5 py-3 min-w-[130px]">Upload Date</th>
                    <th className="px-3.5 py-3 min-w-[130px]">Status</th>
                    <th className="px-3.5 py-3 text-right min-w-[140px]">Matched</th>
                    <th className="px-3.5 py-3 text-right min-w-[120px]">Action Req.</th>
                    <th className="px-4 py-3 text-right min-w-[150px]">Remittance</th>
                    <th className="py-3 pl-4 pr-6 text-right min-w-[180px] w-[180px] md:sticky md:right-0 md:z-10 bg-slate-50 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStatements.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <FileSpreadsheet className="mx-auto size-8 text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No statements match your filter criteria.</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting the carrier or status filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStatements.map((stmt) => {
                      const matchPct =
                        stmt.transactionsCount > 0 ? Math.round((stmt.matchedCount / stmt.transactionsCount) * 100) : 0
                      return (
                        <tr key={stmt.id} className="group hover:bg-slate-50/80 transition-colors">
                          {/* 1. ID & File */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                                {getFileIcon(stmt.fileType)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-mono font-bold text-slate-900 hover:text-blue-600 transition truncate">
                                  {stmt.statementIdentifier}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate max-w-[210px]" title={stmt.fileName}>
                                  {stmt.fileName} · {stmt.fileSize}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Carrier */}
                          <td className="px-3.5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                            {stmt.carrier}
                          </td>

                          {/* 3. Period */}
                          <td className="px-3.5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                            {stmt.statementPeriod}
                          </td>

                          {/* 4. Payment Method */}
                          <td className="px-3.5 py-3.5 whitespace-nowrap">
                            <span className="text-xs text-slate-600 truncate block max-w-[170px]" title={stmt.paymentMethod}>
                              {stmt.paymentMethod}
                            </span>
                            <span className="text-[10.5px] font-mono text-slate-400 block">{stmt.batchReference}</span>
                          </td>

                          {/* 5. Upload Date */}
                          <td className="px-3.5 py-3.5 whitespace-nowrap text-slate-500 text-xs">
                            {stmt.uploadDate}
                          </td>

                          {/* 6. Status */}
                          <td className="px-3.5 py-3.5 whitespace-nowrap">{getStatusBadge(stmt.processingStatus)}</td>

                          {/* 7. Matched */}
                          <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-emerald-600 font-mono text-sm">{stmt.matchedCount}</span>
                              <span className="text-[11px] text-slate-400">{matchPct}% matched</span>
                            </div>
                          </td>

                          {/* 8. Unmatched */}
                          <td className="px-3.5 py-3.5 text-right whitespace-nowrap">
                            {stmt.unmatchedCount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                                <AlertCircle className="size-3" />
                                {stmt.unmatchedCount}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">0</span>
                            )}
                          </td>

                          {/* 9. Remittance */}
                          <td className="px-4 py-3.5 text-right font-bold text-slate-900 font-mono text-sm whitespace-nowrap">
                            {fmtCurrency(stmt.totalRemittance)}
                          </td>

                          {/* 10. Actions (Sticky) */}
                          <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[180px] w-[180px] md:sticky md:right-0 md:z-10 bg-white group-hover:bg-[#f8fafc] md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] transition-colors">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedStatementForDetail(stmt)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                                title="View statement details & transactions"
                              >
                                <Eye className="size-3.5" />
                                <span>View Details</span>
                              </button>

                              <button
                                onClick={() => setReprocessModalTarget(stmt)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-2xs hover:bg-slate-50 hover:text-amber-600 transition cursor-pointer"
                                title="Reprocess statement"
                              >
                                <RefreshCw className="size-3.5" />
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
          /* Cards View */
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStatements.map((stmt) => (
              <div
                key={stmt.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200">
                        {getFileIcon(stmt.fileType)}
                      </div>
                      <div>
                        <p className="font-mono font-bold text-slate-900 text-sm">{stmt.statementIdentifier}</p>
                        <p className="text-xs text-slate-400">{stmt.carrier} · {stmt.statementPeriod}</p>
                      </div>
                    </div>
                    {getStatusBadge(stmt.processingStatus)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50/70 p-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Remittance</span>
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        {fmtCurrency(stmt.totalRemittance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Matched</span>
                      <span className="font-bold font-mono text-emerald-600 text-sm">
                        {stmt.matchedCount} / {stmt.transactionsCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{stmt.uploadDate}</span>
                  <button
                    onClick={() => setSelectedStatementForDetail(stmt)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL / DRAWER: STATEMENT DETAILS INSPECTOR
      ════════════════════════════════════════════════════════════════════ */}
      {selectedStatementForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6 backdrop-blur-xs">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Statement Details: {selectedStatementForDetail.statementIdentifier}</span>
                    {getStatusBadge(selectedStatementForDetail.processingStatus)}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedStatementForDetail.carrier} · {selectedStatementForDetail.statementPeriod} · Remittance:{' '}
                    {fmtCurrency(selectedStatementForDetail.totalRemittance)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStatementForDetail(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="text-[11px] font-medium text-slate-400 block">Total Volume</span>
                  <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                    {fmtCurrency(selectedStatementForDetail.totalRemittance)}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="text-[11px] font-medium text-slate-400 block">Matched Lines</span>
                  <span className="text-sm font-bold font-mono text-emerald-600 mt-0.5 block">
                    {selectedStatementForDetail.matchedCount} of {selectedStatementForDetail.transactionsCount}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="text-[11px] font-medium text-slate-400 block">Payment Method</span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                    {selectedStatementForDetail.paymentMethod}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className="text-[11px] font-medium text-slate-400 block">Batch Reference</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block truncate">
                    {selectedStatementForDetail.batchReference}
                  </span>
                </div>
              </div>

              {/* Transactions Table */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Line Item Transactions ({selectedStatementForDetail.transactions.length})
                  </h3>
                  <span className="text-xs text-slate-400">Ledger concordance preview</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <th className="px-3.5 py-3">Policy #</th>
                        <th className="px-3.5 py-3">Client / Insured</th>
                        <th className="px-3 py-3">Line</th>
                        <th className="px-3 py-3 text-right">Premium</th>
                        <th className="px-3 py-3 text-right">Rate</th>
                        <th className="px-3.5 py-3 text-right">Remittance</th>
                        <th className="px-3.5 py-3">Match Status</th>
                        <th className="px-3.5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStatementForDetail.transactions.map((txn) => {
                        const isMatched = txn.status === 'Auto-Matched' || txn.status === 'Resolved'
                        return (
                          <tr key={txn.id} className="hover:bg-slate-50/60 transition">
                            <td className="px-3.5 py-3 font-mono font-bold text-slate-900">{txn.policyNumber}</td>
                            <td className="px-3.5 py-3">
                              <p className="font-semibold text-slate-800">{txn.clientName}</p>
                              <p className="text-[11px] text-slate-400">{txn.businessName}</p>
                            </td>
                            <td className="px-3 py-3 font-medium text-slate-600">{txn.lineOfBusiness}</td>
                            <td className="px-3 py-3 text-right font-mono text-slate-800">
                              {fmtCurrency(txn.grossPremium)}
                            </td>
                            <td className="px-3 py-3 text-right font-mono font-medium text-slate-600">
                              {txn.commissionRate}%
                            </td>
                            <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900">
                              {fmtCurrency(txn.paidCommission)}
                            </td>
                            <td className="px-3.5 py-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ring-1 ${
                                  isMatched
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                    : 'bg-rose-50 text-rose-700 ring-rose-200'
                                }`}
                              >
                                {isMatched ? <CheckCircle2 className="size-3" /> : <AlertCircle className="size-3" />}
                                <span>{txn.status}</span>
                              </span>
                            </td>
                            <td className="px-3.5 py-3 text-right">
                              <button
                                onClick={() => setSelectedTxnForTrace(txn)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
                              >
                                <Info className="size-3" />
                                <span>Trace</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Log */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Audit &amp; Processing Trail</h3>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2 text-xs">
                  {selectedStatementForDetail.auditHistory.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 border-b border-slate-200/60 pb-2 last:border-0 last:pb-0">
                      <Clock className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.action} <span className="font-normal text-slate-400">· {item.user} ({item.timestamp})</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-3 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedStatementForDetail(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: REPROCESS STATEMENT
      ════════════════════════════════════════════════════════════════════ */}
      {reprocessModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="size-4 text-amber-600" />
                <h3 className="text-[15px] font-bold text-slate-900">Reprocess Statement</h3>
              </div>
              <button
                onClick={() => setReprocessModalTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are about to reprocess <strong>{reprocessModalTarget.statementIdentifier}</strong> (
              {reprocessModalTarget.fileName}). This will re-execute field extraction and rematching against active book
              records.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Parsing / Normalization Template
              </label>
              <select className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800">
                <option>{reprocessModalTarget.mappingTemplate}</option>
                <option>Force Re-detect All Table Columns</option>
                <option>Strict Policy Number Exact Match Rules v4</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReprocessModalTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReprocess}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition cursor-pointer"
              >
                Execute Reprocess
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: TRACE TRANSACTION AUDIT
      ════════════════════════════════════════════════════════════════════ */}
      {selectedTxnForTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Info className="size-4 text-blue-600" />
                <h3 className="text-[15px] font-bold text-slate-900">Transaction Trace &amp; Source Row</h3>
              </div>
              <button
                onClick={() => setSelectedTxnForTrace(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Policy Identifier</span>
                <p className="font-mono font-bold text-slate-900">{selectedTxnForTrace.policyNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Raw Carrier Source Matrix Line</span>
                <p className="font-mono bg-slate-900 text-emerald-400 p-3 rounded-xl mt-1 break-all">
                  {selectedTxnForTrace.rawSourceRow}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Concordance Matching Rule</span>
                <p className="font-semibold text-slate-800">{selectedTxnForTrace.ruleMatched}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxnForTrace(null)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition cursor-pointer"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
