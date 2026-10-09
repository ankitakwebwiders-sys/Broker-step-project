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

type StatementTab = 'all' | 'upload' | 'processing' | 'processed' | 'matching' | 'details'

export default function StatementsPage() {
  // Master statements state
  const [statements, setStatements] = useState<StatementRecord[]>(initialStatements)

  // Active Tab state
  const [activeTab, setActiveTab] = useState<StatementTab>('all')

  // Selected statement for detailed inspection & workflow
  const [selectedStatementId, setSelectedStatementId] = useState<string>(initialStatements[0]?.id || 'ST-2841')

  // View mode for listings: 'table' | 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Matching results confidence tier filter
  const [matchingConfidenceFilter, setMatchingConfidenceFilter] = useState<'All' | MatchConfidenceTier>('All')

  // Modals & Drawers state
  const [selectedTxnForTrace, setSelectedTxnForTrace] = useState<StatementTransactionItem | null>(null)
  const [reprocessModalTarget, setReprocessModalTarget] = useState<StatementRecord | null>(null)
  const [resolveModalTarget, setResolveModalTarget] = useState<StatementTransactionItem | null>(null)
  const [resolveActionType, setResolveActionType] = useState<'link' | 'binder' | 'query'>('link')
  const [resolveNote, setResolveNote] = useState('')

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Active Statement accessor
  const currentStatement = useMemo(() => {
    return statements.find((s) => s.id === selectedStatementId) || statements[0]
  }, [statements, selectedStatementId])

  // Sync URL query params with active tab & submenus
  useEffect(() => {
    function applyUrlParams(searchStr?: string) {
      if (typeof window === 'undefined') return
      const query = searchStr !== undefined ? searchStr : window.location.search
      const params = new URLSearchParams(query)
      const tabParam = params.get('tab') as StatementTab | null
      const stmtParam = params.get('stmt')

      if (tabParam) {
        setActiveTab(tabParam)
      } else {
        setActiveTab('all')
      }

      if (stmtParam) {
        const found = statements.find((s) => s.id === stmtParam)
        if (found) setSelectedStatementId(found.id)
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
  }, [statements])

  // 1-Click Tab Switcher + URL & Sidebar Syncer
  const handleTabSelect = (tabKey: StatementTab, stmtId?: string) => {
    setActiveTab(tabKey)
    if (stmtId) setSelectedStatementId(stmtId)

    const targetStmtId = stmtId || selectedStatementId
    let newHref = '/broker/statements'
    let targetSearch = ''

    if (tabKey !== 'all') {
      newHref = `/broker/statements?tab=${tabKey}`
      targetSearch = `?tab=${tabKey}`
      if (tabKey === 'details' && targetStmtId) {
        newHref += `&stmt=${targetStmtId}`
        targetSearch += `&stmt=${targetStmtId}`
      }
    }

    window.history.pushState(null, '', newHref)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: newHref, search: targetSearch, pathname: '/broker/statements' },
      })
    )
  }

  // ───── 9.1 All Statements Filtered List ─────
  const filteredStatements = useMemo(() => {
    return statements.filter((stmt) => {
      // Tab filter: processed tab filters specifically for Processed or Completed
      if (activeTab === 'processed') {
        if (stmt.processingStatus !== 'Processed' && stmt.processingStatus !== 'Completed') {
          return false
        }
      }

      // Carrier filter
      if (carrierFilter !== 'All' && stmt.carrier !== carrierFilter) return false

      // Status filter
      if (statusFilter !== 'All' && stmt.processingStatus !== statusFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesId = stmt.statementIdentifier.toLowerCase().includes(q)
        const matchesCarrier = stmt.carrier.toLowerCase().includes(q)
        const matchesFile = stmt.fileName.toLowerCase().includes(q)
        const matchesBatch = stmt.batchReference.toLowerCase().includes(q)
        const matchesPeriod = stmt.statementPeriod.toLowerCase().includes(q)
        if (!matchesId && !matchesCarrier && !matchesFile && !matchesBatch && !matchesPeriod) {
          return false
        }
      }

      return true
    })
  }, [statements, activeTab, carrierFilter, statusFilter, searchQuery])

  // ───── 9.4 Filtered Matching Transactions ─────
  const allTransactions = useMemo(() => {
    return statements.flatMap((s) => s.transactions)
  }, [statements])

  const filteredMatchingTransactions = useMemo(() => {
    return allTransactions.filter((txn) => {
      if (matchingConfidenceFilter !== 'All' && txn.matchConfidence !== matchingConfidenceFilter) {
        return false
      }
      return true
    })
  }, [allTransactions, matchingConfidenceFilter])

  // ───── Global Metrics Calculations ─────
  const totalStatementsCount = statements.length
  const completedStatementsCount = useMemo(() => {
    return statements.filter((s) => s.processingStatus === 'Completed').length
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

  const totalUnmatchedCount = useMemo(() => {
    return statements.reduce((sum, s) => sum + s.unmatchedCount, 0)
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
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
            <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
            Completed
          </span>
        )
      case 'Processed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
            <FileCheck2 className="size-3 text-blue-600 shrink-0" />
            Processed
          </span>
        )
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            Processing
          </span>
        )
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200 whitespace-nowrap">
            <AlertCircle className="size-3 text-rose-600 shrink-0" />
            Needs Review
          </span>
        )
      case 'Uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 whitespace-nowrap">
            <Clock className="size-3 text-slate-500 shrink-0" />
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
  }, [filteredStatements, activeTab])

  const handleScrollTable = (direction: 'left' | 'right') => {
    if (!tableContainerRef.current) return
    const delta = direction === 'left' ? -350 : 350
    tableContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(checkTableScroll, 350)
  }

  // ───── 9.2 Upload Statement Form State ─────
  const [uploadCarrier, setUploadCarrier] = useState('Travelers')
  const [uploadPeriodMonth, setUploadPeriodMonth] = useState('October')
  const [uploadPeriodYear, setUploadPeriodYear] = useState('2026')
  const [uploadMethod, setUploadMethod] = useState('Electronic ACH')
  const [uploadTemplate, setUploadTemplate] = useState('Carrier Default Auto-Detect Template')
  const [uploadSelectedFile, setUploadSelectedFile] = useState<{ name: string; size: string; type: 'xlsx' | 'csv' | 'pdf' } | null>({
    name: 'Travelers_Oct2026_Remittance_Batch_Sample.xlsx',
    size: '3.4 MB',
    type: 'xlsx',
  })
  const [isSimulatingProcessing, setIsSimulatingProcessing] = useState(false)

  function handleExecuteUploadAndProcess(e: React.FormEvent) {
    e.preventDefault()
    setIsSimulatingProcessing(true)

    setTimeout(() => {
      const newId = `ST-${Math.floor(2900 + Math.random() * 90)}`
      const newRecord: StatementRecord = {
        id: newId,
        statementIdentifier: `${newId}-${uploadCarrier.toUpperCase()}-${uploadPeriodMonth.slice(0, 3).toUpperCase()}`,
        fileName: uploadSelectedFile?.name || `${uploadCarrier}_Remittance_${uploadPeriodMonth}${uploadPeriodYear}.xlsx`,
        fileType: uploadSelectedFile?.type || 'xlsx',
        fileSize: uploadSelectedFile?.size || '2.8 MB',
        carrier: uploadCarrier,
        statementPeriod: `${uploadPeriodMonth.slice(0, 3)} ${uploadPeriodYear}`,
        statementPeriodDate: '2026-10-01',
        uploadDate: 'Just now',
        processingStatus: 'Processing',
        transactionsCount: 34,
        matchedCount: 30,
        unmatchedCount: 4,
        needsReviewCount: 2,
        highConfidenceCount: 28,
        totalRemittance: 38400.0,
        paymentMethod: uploadMethod,
        batchReference: `BATCH-${Date.now().toString().slice(-6)}`,
        mappingTemplate: uploadTemplate,
        extractedDate: 'Just now',
        normalizedDate: 'Just now',
        reprocessedCount: 0,
        notes: `Uploaded via broker intake portal with ${uploadTemplate}.`,
        processingPipelineStep: 5,
        auditHistory: [
          {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: 'Jordan Davis (Broker)',
            action: 'Statement Ingestion Triggered',
            notes: 'File accepted. Extraction and field normalization queued.',
          },
        ],
        transactions: [
          {
            id: `TXN-${Date.now()}-1`,
            statementId: newId,
            lineIndex: 2,
            rawSourceRow: `L2: POL-9941-${uploadCarrier.slice(0, 4).toUpperCase()} | ACME INDUSTRIAL | COMM | $32,000.00 | 15.0% | $4,800.00`,
            policyNumber: `POL-9941-${uploadCarrier.slice(0, 4).toUpperCase()}`,
            clientName: 'Arthur Miller',
            businessName: 'Acme Industrial Supplies',
            lineOfBusiness: 'Commercial Property',
            carrier: uploadCarrier,
            grossPremium: 32000,
            commissionRate: 15.0,
            paidCommission: 4800.0,
            expectedCommission: 4800.0,
            variance: 0.0,
            matchConfidence: 'High Confidence',
            matchScore: 99,
            matchedSystemPolicyId: 'POL-9941',
            ruleMatched: 'Exact Policy Number & Client Tax ID Match',
            status: 'Auto-Matched',
          },
        ],
      }

      setStatements((prev) => [newRecord, ...prev])
      setIsSimulatingProcessing(false)
      setSelectedStatementId(newId)
      showToast(`Statement ${newRecord.statementIdentifier} uploaded successfully! Routing into Processing Pipeline.`)
      handleTabSelect('processing', newId)
    }, 1200)
  }

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
    handleTabSelect('processing', updated.id)
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

    showToast(`Transaction ${resolveModalTarget.policyNumber} marked as Resolved!`)
    setResolveModalTarget(null)
    setResolveNote('')
  }

  return (
    <div className="p-3 sm:p-5 md:p-7 max-w-[1600px] mx-auto space-y-5 sm:space-y-7">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-[13px] font-medium text-white shadow-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ───── Header ───── */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-medium text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Broker Workspace · Statement Accounting &amp; Extraction
          </p>
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-slate-900">
            Statements
          </h1>
          <p className="mt-0.5 text-[12px] sm:text-[13px] text-slate-500">
            Ingest, parse, and reconcile multi-carrier electronic remittances, Excel, CSV, and text-based PDF statements.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => alert(`Exporting audit log of ${statements.length} statements to CSV...`)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <Download className="size-3.5 sm:size-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleTabSelect('upload')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 sm:px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)] cursor-pointer"
          >
            <Upload className="size-3.5 sm:size-4" />
            <span>Upload Statement</span>
          </button>
        </div>
      </div>

      {/* ───── Top KPI Stat Cards ───── */}
      <div className="grid gap-2.5 sm:gap-3.5 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {/* 1. Total Statements */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-[11.5px] font-medium text-slate-500">Statements</p>
            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-blue-600 ring-1 ring-blue-100">
              Total Ingested
            </span>
          </div>
          <p className="mt-2 text-[22px] font-bold tracking-tight text-slate-900">{totalStatementsCount}</p>
          <p className="mt-0.5 text-[10.5px] text-slate-400">Carrier batches</p>
        </div>

        {/* 2. Completed */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-[11.5px] font-medium text-slate-500">Processed</p>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
              Reconciled
            </span>
          </div>
          <p className="mt-2 text-[22px] font-bold tracking-tight text-emerald-600">{completedStatementsCount}</p>
          <p className="mt-0.5 text-[10.5px] text-slate-400">Ledger booked</p>
        </div>

        {/* 3. In Pipeline */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_8px_30px_-12px_rgba(245,158,11,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-[11.5px] font-medium text-slate-500">Processing</p>
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-amber-700 ring-1 ring-amber-100">
              Active Pipeline
            </span>
          </div>
          <p className="mt-2 text-[22px] font-bold tracking-tight text-amber-600">{inProcessingPipelineCount}</p>
          <p className="mt-0.5 text-[10.5px] text-slate-400">Parsing &amp; matching</p>
        </div>

        {/* 4. Needs Review */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-[11.5px] font-medium text-slate-500">Needs Review</p>
            <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-rose-700 ring-1 ring-rose-100">
              Discrepancies
            </span>
          </div>
          <p className="mt-2 text-[22px] font-bold tracking-tight text-rose-600">{needsReviewCount}</p>
          <p className="mt-0.5 text-[10.5px] text-slate-400">Action required</p>
        </div>

        {/* 5. Total Remittance */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-[11.5px] font-medium text-slate-500">Total Volume</p>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-700">
              Payouts
            </span>
          </div>
          <p className="mt-2 text-[19px] sm:text-[21px] font-bold tracking-tight text-slate-900">
            {fmtCurrency(totalRemittanceVolume)}
          </p>
          <p className="mt-0.5 text-[10.5px] text-slate-400">Sum remittances</p>
        </div>

        {/* 6. Match Accuracy */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_8px_30px_-12px_rgba(99,102,241,0.25)]">
          <div className="flex items-start justify-between">
            <p className="text-[11.5px] font-medium text-slate-500">Match Rate</p>
            <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
              Engine
            </span>
          </div>
          <p className="mt-2 text-[22px] font-bold tracking-tight text-indigo-600">{matchAccuracyRate}%</p>
          <p className="mt-0.5 text-[10.5px] text-slate-400">{totalMatchedCount} of {totalTransactionsCount} matched</p>
        </div>
      </div>

      {/* ───── Navigation Tabs Bar (Matches All Broker Pages Exactly) ───── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {[
            { id: 'all' as StatementTab, label: 'All Statements', badge: totalStatementsCount },
            { id: 'upload' as StatementTab, label: 'Upload Statement', badge: 'New Form' },
            { id: 'processing' as StatementTab, label: 'Processing Pipeline', badge: inProcessingPipelineCount ? `${inProcessingPipelineCount} Active` : 'Engine' },
            { id: 'processed' as StatementTab, label: 'Processed & Cleared', badge: completedStatementsCount },
            { id: 'matching' as StatementTab, label: 'Matching Results', badge: `${allTransactions.length} Items` },
            { id: 'details' as StatementTab, label: 'Statement Details', badge: currentStatement ? currentStatement.id : 'Inspector' },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB CONTENT: 9.1 ALL STATEMENTS & PROCESSED LISTING
      ════════════════════════════════════════════════════════════════════ */}
      {(activeTab === 'all' || activeTab === 'processed') && (
        <div className="space-y-4">
          {/* Secondary Search & Filter Bar */}
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

              {/* Filters & View switcher */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Carrier filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-500">Carrier:</span>
                  <select
                    value={carrierFilter}
                    onChange={(e) => setCarrierFilter(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-xs focus:border-blue-500 focus:outline-none cursor-pointer"
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

                {/* Status filter (if in All tab) */}
                {activeTab === 'all' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-xs focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Processed">Processed</option>
                      <option value="Processing">Processing</option>
                      <option value="Needs Review">Needs Review</option>
                      <option value="Uploaded">Uploaded</option>
                    </select>
                  </div>
                )}

                {/* Reset button */}
                {(searchQuery || carrierFilter !== 'All' || statusFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setCarrierFilter('All')
                      setStatusFilter('All')
                    }}
                    className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[11.5px] font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset</span>
                  </button>
                )}

                {/* View Mode switcher */}
                <div className="ml-auto flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/90 p-1 text-[11.5px]">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition cursor-pointer ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <List className="size-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition cursor-pointer ${
                      viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="size-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table View Controls & Count */}
          <div className="flex items-center justify-between text-[12px] text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{filteredStatements.length}</strong> of {statements.length} statements
            </span>

            {viewMode === 'table' && (
              <div className="flex items-center gap-1.5">
                <span className="hidden md:inline text-[11px] text-slate-400">Scroll table</span>
                <button
                  onClick={() => handleScrollTable('left')}
                  disabled={!canScrollLeft}
                  className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  title="Scroll left"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  onClick={() => handleScrollTable('right')}
                  disabled={!canScrollRight}
                  className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  title="Scroll right"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 9.1 Common Statements Table View */}
          {viewMode === 'table' ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
              <div
                ref={tableContainerRef}
                onScroll={checkTableScroll}
                className="overflow-x-auto custom-scrollbar-table"
              >
                <table className="w-full min-w-[1350px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                      <th className="px-4 py-3.5 min-w-[280px]">Statement / File Identifier</th>
                      <th className="px-3.5 py-3.5 min-w-[160px]">Carrier</th>
                      <th className="px-3.5 py-3.5 min-w-[140px]">Statement Period</th>
                      <th className="px-3.5 py-3.5 min-w-[150px]">Upload Date</th>
                      <th className="px-3.5 py-3.5 min-w-[150px]">Processing Status</th>
                      <th className="px-3.5 py-3.5 min-w-[110px] text-right">Transactions</th>
                      <th className="px-3.5 py-3.5 min-w-[120px] text-right">Matched</th>
                      <th className="px-3.5 py-3.5 min-w-[130px] text-right">Unmatched</th>
                      <th className="px-4 py-3.5 min-w-[130px] text-right">Remittance</th>
                      <th className="px-4 py-3.5 text-right min-w-[180px] w-[180px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStatements.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center text-slate-400">
                          <FileSpreadsheet className="mx-auto size-9 text-slate-300 mb-2" />
                          <p className="text-[13.5px] font-medium text-slate-600">No statements found</p>
                          <p className="text-[11.5px] text-slate-400 mt-1">Try adjusting the carrier or status filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStatements.map((stmt) => {
                        const matchPct = stmt.transactionsCount > 0 ? Math.round((stmt.matchedCount / stmt.transactionsCount) * 100) : 0
                        return (
                          <tr
                            key={stmt.id}
                            className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                          >
                            {/* 1. Statement */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                                  {getFileIcon(stmt.fileType)}
                                </div>
                                <div className="min-w-0">
                                  <button
                                    onClick={() => handleTabSelect('details', stmt.id)}
                                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-[13px] truncate block text-left cursor-pointer"
                                  >
                                    {stmt.statementIdentifier}
                                  </button>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5" title={stmt.fileName}>
                                    {stmt.fileName} · {stmt.fileSize}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* 2. Carrier */}
                            <td className="px-3.5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="size-3.5 text-slate-400 shrink-0" />
                                <span className="text-[12.5px] font-semibold text-slate-800">{stmt.carrier}</span>
                              </div>
                            </td>

                            {/* 3. Statement Period */}
                            <td className="px-3.5 py-3.5">
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                <Calendar className="size-3 text-slate-500" />
                                {stmt.statementPeriod}
                              </span>
                            </td>

                            {/* 4. Upload Date */}
                            <td className="px-3.5 py-3.5 text-[12px] text-slate-600 whitespace-nowrap">
                              {stmt.uploadDate}
                            </td>

                            {/* 5. Processing Status */}
                            <td className="px-3.5 py-3.5">
                              {getStatusBadge(stmt.processingStatus)}
                            </td>

                            {/* 6. Transactions */}
                            <td className="px-3.5 py-3.5 text-right font-semibold text-slate-800 text-[12.5px]">
                              {stmt.transactionsCount}
                            </td>

                            {/* 7. Matched */}
                            <td className="px-3.5 py-3.5 text-right">
                              <div className="flex flex-col items-end">
                                <span className="font-semibold text-emerald-600 text-[12.5px]">
                                  {stmt.matchedCount}
                                </span>
                                <span className="text-[10px] text-slate-400">{matchPct}% matched</span>
                              </div>
                            </td>

                            {/* 8. Unmatched */}
                            <td className="px-3.5 py-3.5 text-right">
                              {stmt.unmatchedCount > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
                                  <AlertCircle className="size-2.5" />
                                  {stmt.unmatchedCount} Action Req.
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-medium">0</span>
                              )}
                            </td>

                            {/* 9. Remittance Amount */}
                            <td className="px-4 py-3.5 text-right font-bold text-slate-900 text-[12.5px]">
                              {fmtCurrency(stmt.totalRemittance)}
                            </td>

                            {/* 10. Actions (Sticky) */}
                            <td className="px-4 py-3.5 text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] group-hover:bg-slate-50/95 transition-colors">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleTabSelect('details', stmt.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer"
                                  title="View full statement details & line items"
                                >
                                  <Eye className="size-3" />
                                  <span>View</span>
                                </button>

                                <button
                                  onClick={() => setReprocessModalTarget(stmt)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-amber-600 transition cursor-pointer"
                                  title="Reprocess statement with alternate template or force re-run"
                                >
                                  <RefreshCw className="size-3" />
                                  <span>Reprocess</span>
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
            /* Cards View for Responsive / Mobile */
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStatements.map((stmt) => (
                <div
                  key={stmt.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all hover:shadow-md hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        {getFileIcon(stmt.fileType)}
                      </div>
                      <div>
                        <button
                          onClick={() => handleTabSelect('details', stmt.id)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-[13px] text-left block"
                        >
                          {stmt.statementIdentifier}
                        </button>
                        <p className="text-[11px] text-slate-500">{stmt.carrier} · {stmt.statementPeriod}</p>
                      </div>
                    </div>
                    {getStatusBadge(stmt.processingStatus)}
                  </div>

                  <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-[11.5px]">
                    <div>
                      <p className="text-slate-400 text-[10px]">Total Remittance</p>
                      <p className="font-bold text-slate-900 mt-0.5">{fmtCurrency(stmt.totalRemittance)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Transactions</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{stmt.transactionsCount} rows</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Matched</p>
                      <p className="font-semibold text-emerald-600 mt-0.5">{stmt.matchedCount} items</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Unmatched</p>
                      <p className="font-semibold text-rose-600 mt-0.5">{stmt.unmatchedCount} action req.</p>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Uploaded: {stmt.uploadDate}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTabSelect('details', stmt.id)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setReprocessModalTarget(stmt)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 hover:text-amber-600 cursor-pointer"
                      >
                        Reprocess
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB CONTENT: 9.2 UPLOAD STATEMENT FORM
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'upload' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03)] max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <Upload className="size-4" />
              </span>
              <h2 className="text-[17px] font-bold text-slate-900">Upload Statement Form</h2>
            </div>
            <p className="mt-1 text-[12.5px] text-slate-500">
              Submit newly received carrier commission statements for automated data extraction, normalization, and reconciliation.
            </p>
          </div>

          <form onSubmit={handleExecuteUploadAndProcess} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Carrier Selection */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Carrier <span className="text-rose-500">*</span>
                </label>
                <select
                  value={uploadCarrier}
                  onChange={(e) => setUploadCarrier(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  required
                >
                  <option value="Travelers">Travelers</option>
                  <option value="Chubb">Chubb</option>
                  <option value="Medical Protective">Medical Protective</option>
                  <option value="Hartford">Hartford</option>
                  <option value="AIG">AIG</option>
                  <option value="CNA">CNA</option>
                </select>
              </div>

              {/* Statement Period */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Statement Period / Applicable Date <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={uploadPeriodMonth}
                    onChange={(e) => setUploadPeriodMonth(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="October">October</option>
                    <option value="September">September</option>
                    <option value="August">August</option>
                    <option value="July">July</option>
                  </select>
                  <select
                    value={uploadPeriodYear}
                    onChange={(e) => setUploadPeriodYear(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              {/* Payment Method / Remittance Reference */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Remittance Type / Payment Method
                </label>
                <select
                  value={uploadMethod}
                  onChange={(e) => setUploadMethod(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="Electronic ACH">Electronic ACH Remittance</option>
                  <option value="Direct Wire">Direct Wire Remittance</option>
                  <option value="Paper Remittance Check">Paper Remittance Check</option>
                </select>
              </div>

              {/* Mapping Template Selection */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  Field Mapping / Parsing Template
                </label>
                <select
                  value={uploadTemplate}
                  onChange={(e) => setUploadTemplate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="Carrier Default Auto-Detect Template">Carrier Default Auto-Detect Template</option>
                  <option value="Standard Broker EDI-820 Format">Standard Broker EDI-820 Format</option>
                  <option value="Custom Multi-Line Table Template">Custom Multi-Line Table Template</option>
                </select>
              </div>
            </div>

            {/* Statement File Dropzone */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Statement File <span className="text-rose-500">*</span>
              </label>

              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50/10">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 text-blue-600">
                  <Upload className="size-6" />
                </div>
                <p className="mt-3 text-[13px] font-semibold text-slate-800">
                  Drag and drop your statement file, or <span className="text-blue-600 underline cursor-pointer">browse file</span>
                </p>

                {/* Scope requirements banner */}
                <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 text-[11.5px] font-medium text-slate-600 ring-1 ring-slate-200">
                  <span className="font-semibold text-slate-900">Supported source scope:</span>
                  Agreed Excel (.xlsx, .xls), CSV (.csv), and text-based / processable PDF (.pdf) statements.
                </div>

                {/* File Mock Selected State */}
                {uploadSelectedFile && (
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 max-w-md mx-auto text-left">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="size-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-[12.5px] font-semibold text-blue-900 truncate">{uploadSelectedFile.name}</p>
                        <p className="text-[11px] text-blue-700">{uploadSelectedFile.size} · Ready for ingestion</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadSelectedFile(null)}
                      className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer"
                      title="Clear file"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleTabSelect('all')}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSimulatingProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
              >
                {isSimulatingProcessing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Extracting &amp; Processing Data...</span>
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    <span>Upload &amp; Process Statement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB CONTENT: 9.3 PROCESSING PIPELINE WORKFLOW
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'processing' && (
        <div className="space-y-6">
          {/* Active Statement Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                <GitBranch className="size-4" />
              </div>
              <div>
                <h3 className="text-[13.5px] font-bold text-slate-900">
                  Processing Pipeline: <span className="text-blue-600">{currentStatement.statementIdentifier}</span>
                </h3>
                <p className="text-[11.5px] text-slate-500">
                  {currentStatement.carrier} · {currentStatement.fileName} · {currentStatement.transactionsCount} Extracted Rows
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatementId}
                onChange={(e) => setSelectedStatementId(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                {statements.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.statementIdentifier} ({s.carrier} - {s.processingStatus})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  showToast('Re-running 9-stage extraction & matching workflow...')
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-600 transition cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Rerun Pipeline</span>
              </button>
            </div>
          </div>

          {/* 9-Stage Automated Processing Pipeline Visualizer */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-slate-900">9-Stage Automated Ingestion &amp; Matching Engine</h4>
                <p className="text-[12px] text-slate-500">Standardized pipeline tracking for statement normalization, rule matching, and downstream ledger sync.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                Step {currentStatement.processingPipelineStep} of 9 Complete
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Upload', desc: 'Verify file structure and integrity (.xlsx, .csv, processable .pdf)' },
                { title: 'Extract statement data', desc: 'Raw row parsing, headers, commission rates, and premium amounts' },
                { title: 'Normalize fields', desc: 'Standardize date formatting, currency sanitization, and carrier codes' },
                { title: 'Apply standard or Broker-specific mapping/template', desc: 'Map carrier columns into Broker unified ledger schema' },
                { title: 'Show extraction/mapping results', desc: 'Preview table with verified columns and transformation validation' },
                { title: 'Run matching', desc: 'Automated policy #, client name, and expected revenue cross-referencing' },
                { title: 'Classify results', desc: 'Categorize into High Confidence, Possible Match, or Action Required' },
                { title: 'Send unresolved items to Broker Review', desc: 'Route discrepancies, short-pays, and unmapped rows to review queue' },
                { title: 'Update reconciliation and downstream records after finalization', desc: 'Book confirmed earnings into general commissions ledger & reports' },
              ].map((step, idx) => {
                const stepNum = idx + 1
                const isCompleted = stepNum < currentStatement.processingPipelineStep
                const isCurrent = stepNum === currentStatement.processingPipelineStep
                const isPending = stepNum > currentStatement.processingPipelineStep

                return (
                  <div
                    key={step.title}
                    className={`relative rounded-xl border p-4 transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : isCurrent
                        ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200/70 bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex size-6 items-center justify-center rounded-full text-[11px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isCompleted ? <Check className="size-3.5" /> : stepNum}
                        </span>
                        <h5 className="text-[12.5px] font-bold text-slate-900 leading-tight">{step.title}</h5>
                      </div>
                      {isCompleted && <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">Passed</span>}
                      {isCurrent && <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded animate-pulse">Running</span>}
                      {isPending && <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.2 rounded">Queued</span>}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500 leading-relaxed pl-8">{step.desc}</p>
                  </div>
                )
              })}
            </div>

            {/* Extracted Preview Sample Strip */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-800">
                  Normalized Field Extraction Sample Preview ({currentStatement.carrier})
                </span>
                <span className="text-[11px] text-slate-500">Template: {currentStatement.mappingTemplate}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11.5px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                      <th className="py-1.5 pr-3">Row #</th>
                      <th className="py-1.5 pr-3">Source Policy Tag</th>
                      <th className="py-1.5 pr-3">Insured Name</th>
                      <th className="py-1.5 pr-3 text-right">Gross Premium</th>
                      <th className="py-1.5 pr-3 text-right">Rate</th>
                      <th className="py-1.5 pr-3 text-right">Paid Remittance</th>
                      <th className="py-1.5 text-right">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {currentStatement.transactions.slice(0, 3).map((txn) => (
                      <tr key={txn.id}>
                        <td className="py-2 pr-3 font-mono text-[10.5px]">Line {txn.lineIndex}</td>
                        <td className="py-2 pr-3 font-semibold text-slate-900">{txn.policyNumber}</td>
                        <td className="py-2 pr-3">{txn.clientName}</td>
                        <td className="py-2 pr-3 text-right">{fmtCurrency(txn.grossPremium)}</td>
                        <td className="py-2 pr-3 text-right">{txn.commissionRate}%</td>
                        <td className="py-2 pr-3 text-right font-bold text-slate-900">{fmtCurrency(txn.paidCommission)}</td>
                        <td className="py-2 text-right">
                          <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                            {txn.matchConfidence}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick transition button to Matching Results */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleTabSelect('matching')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
              >
                <span>Proceed to Matching Results</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB CONTENT: 9.4 MATCHING RESULTS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'matching' && (
        <div className="space-y-5">
          {/* CRITICAL SECURITY & DATA INTEGRITY NOTICE */}
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/50 p-4 shadow-xs">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-slate-900">
                Core Safety &amp; Non-Destructive Matching Principle
              </h4>
              <p className="mt-0.5 text-[12px] text-slate-600 leading-relaxed">
                <strong>Uncertain matching must not overwrite existing client, policy, or transaction information.</strong> Possible matches and unmatched items are quarantined for broker verification and audit trail preservation.
              </p>
            </div>
          </div>

          {/* Three Matching Confidence Tiers Filter Strip */}
          <div className="grid gap-3 sm:grid-cols-3">
            {/* 1. High Confidence */}
            <button
              onClick={() => setMatchingConfidenceFilter(matchingConfidenceFilter === 'High Confidence' ? 'All' : 'High Confidence')}
              className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                matchingConfidenceFilter === 'High Confidence'
                  ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/80 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="size-3" />
                  High Confidence (95–100%)
                </span>
                <span className="font-mono text-[12px] font-bold text-slate-900">
                  {allTransactions.filter((t) => t.matchConfidence === 'High Confidence').length} Items
                </span>
              </div>
              <p className="mt-2 text-[12px] font-medium text-slate-800">
                May be automatically applied under agreed rules; review if needed.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Exact policy number, carrier Tax ID, and expected revenue concordance.
              </p>
            </button>

            {/* 2. Possible Match */}
            <button
              onClick={() => setMatchingConfidenceFilter(matchingConfidenceFilter === 'Possible Match' ? 'All' : 'Possible Match')}
              className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                matchingConfidenceFilter === 'Possible Match'
                  ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20 shadow-md'
                  : 'border-slate-200/80 bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
                  <Scale className="size-3" />
                  Possible Match (70–94%)
                </span>
                <span className="font-mono text-[12px] font-bold text-slate-900">
                  {allTransactions.filter((t) => t.matchConfidence === 'Possible Match').length} Items
                </span>
              </div>
              <p className="mt-2 text-[12px] font-medium text-slate-800">
                Broker review required.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Fuzzy policy suffix, endorsement variance, or insured trade-name difference.
              </p>
            </button>

            {/* 3. Unmatched / Action Required */}
            <button
              onClick={() => setMatchingConfidenceFilter(matchingConfidenceFilter === 'Unmatched' ? 'All' : 'Unmatched')}
              className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                matchingConfidenceFilter === 'Unmatched'
                  ? 'border-rose-500 bg-rose-50/30 ring-2 ring-rose-500/20 shadow-md'
                  : 'border-slate-200/80 bg-white hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800 ring-1 ring-rose-200">
                  <AlertCircle className="size-3" />
                  Unmatched / Action Required (&lt;70%)
                </span>
                <span className="font-mono text-[12px] font-bold text-slate-900">
                  {allTransactions.filter((t) => t.matchConfidence === 'Unmatched').length} Items
                </span>
              </div>
              <p className="mt-2 text-[12px] font-medium text-slate-800">
                Broker manually resolves or creates the appropriate record.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Policy not bound in system, carrier truncation, or direct bill remittance.
              </p>
            </button>
          </div>

          {/* Filter Status Reset Pill */}
          {matchingConfidenceFilter !== 'All' && (
            <div className="flex items-center gap-2 text-[12px] text-slate-600">
              <span>Filtering by <strong>{matchingConfidenceFilter}</strong> only</span>
              <button
                onClick={() => setMatchingConfidenceFilter('All')}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Clear filter (Show all tiers)
              </button>
            </div>
          )}

          {/* Matching Results Transaction Ledger Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 min-w-[180px]">Policy Number</th>
                    <th className="px-3.5 py-3.5 min-w-[200px]">Client / Insured Business</th>
                    <th className="px-3.5 py-3.5 min-w-[130px]">Carrier</th>
                    <th className="px-3.5 py-3.5 min-w-[110px] text-right">Premium</th>
                    <th className="px-3.5 py-3.5 min-w-[120px] text-right">Paid Remittance</th>
                    <th className="px-3.5 py-3.5 min-w-[120px] text-right">Expected</th>
                    <th className="px-3.5 py-3.5 min-w-[180px]">Matching Tier &amp; Score</th>
                    <th className="px-3.5 py-3.5 min-w-[220px]">Rule Triggered</th>
                    <th className="px-4 py-3.5 text-right min-w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[12.5px]">
                  {filteredMatchingTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No transactions found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMatchingTransactions.map((txn) => {
                      const isHigh = txn.matchConfidence === 'High Confidence'
                      const isPossible = txn.matchConfidence === 'Possible Match'
                      const isUnmatched = txn.matchConfidence === 'Unmatched'

                      return (
                        <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {txn.policyNumber}
                          </td>
                          <td className="px-3.5 py-3">
                            <p className="font-semibold text-slate-800">{txn.clientName}</p>
                            <p className="text-[11px] text-slate-400">{txn.businessName} · {txn.lineOfBusiness}</p>
                          </td>
                          <td className="px-3.5 py-3 font-medium text-slate-700">
                            {txn.carrier}
                          </td>
                          <td className="px-3.5 py-3 text-right font-medium text-slate-700">
                            {fmtCurrency(txn.grossPremium)}
                          </td>
                          <td className="px-3.5 py-3 text-right font-bold text-slate-900">
                            {fmtCurrency(txn.paidCommission)}
                          </td>
                          <td className="px-3.5 py-3 text-right text-slate-600">
                            {fmtCurrency(txn.expectedCommission)}
                          </td>
                          <td className="px-3.5 py-3">
                            {isHigh && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                                <CheckCircle2 className="size-3" />
                                High ({txn.matchScore}%)
                              </span>
                            )}
                            {isPossible && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
                                <Scale className="size-3" />
                                Possible ({txn.matchScore}%)
                              </span>
                            )}
                            {isUnmatched && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800 ring-1 ring-rose-200">
                                <AlertCircle className="size-3" />
                                Unmatched ({txn.matchScore}%)
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-3 text-[11.5px] text-slate-500 font-mono">
                            {txn.ruleMatched}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isHigh ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <Check className="size-3.5" /> Auto-Applied
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setResolveModalTarget(txn)
                                  setResolveNote('')
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11.5px] font-semibold text-white shadow-2xs hover:bg-blue-700 transition cursor-pointer"
                              >
                                <span>Resolve</span>
                              </button>
                            )}
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

      {/* ════════════════════════════════════════════════════════════════════
          TAB CONTENT: 9.5 STATEMENT DETAILS
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* Statement Header Card (9.5 Requirements) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-start gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                  {getFileIcon(currentStatement.fileType)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-bold text-slate-900">{currentStatement.statementIdentifier}</h2>
                    {getStatusBadge(currentStatement.processingStatus)}
                  </div>
                  <p className="mt-1 text-[12.5px] text-slate-500">
                    Original Source: <span className="font-medium text-slate-700">{currentStatement.fileName}</span> ({currentStatement.fileSize})
                  </p>
                </div>
              </div>

              {/* Statement switch dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedStatementId}
                  onChange={(e) => handleTabSelect('details', e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  {statements.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.statementIdentifier} ({s.carrier})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setReprocessModalTarget(currentStatement)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  <RefreshCw className="size-3.5" />
                  <span>Reprocess Statement</span>
                </button>
              </div>
            </div>

            {/* Metadata Grid (9.5 Requirements) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-[12.5px]">
              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[11px] font-medium text-slate-400">Carrier &amp; Period</span>
                <p className="font-bold text-slate-900 mt-0.5">{currentStatement.carrier}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{currentStatement.statementPeriod} · {currentStatement.paymentMethod}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[11px] font-medium text-slate-400">Total Remittance Payout</span>
                <p className="font-bold text-emerald-600 text-[14px] mt-0.5">{fmtCurrency(currentStatement.totalRemittance)}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Ref: {currentStatement.batchReference}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[11px] font-medium text-slate-400">Matched / Unmatched Counts</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  <span className="text-emerald-600">{currentStatement.matchedCount} Matched</span> ·{' '}
                  <span className="text-rose-600">{currentStatement.unmatchedCount} Unmatched</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">High Confidence: {currentStatement.highConfidenceCount}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <span className="text-[11px] font-medium text-slate-400">Reprocessing / Correction Status</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {currentStatement.reprocessedCount > 0 ? `Reprocessed ${currentStatement.reprocessedCount}x` : 'Original Ingestion'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Template: {currentStatement.mappingTemplate.slice(0, 24)}...</p>
              </div>
            </div>
          </div>

          {/* Extracted / Normalized Transactions Table with Traceability */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-[15px] font-bold text-slate-900">Extracted &amp; Normalized Transactions</h3>
                <p className="text-[12px] text-slate-500">
                  Full transaction-to-source traceability linking carrier lines to internal policy ledgers.
                </p>
              </div>
              <span className="text-[12px] font-semibold text-slate-600">
                {currentStatement.transactions.length} Line Items Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-3.5 py-3">Source Row</th>
                    <th className="px-3.5 py-3 min-w-[160px]">Policy Number</th>
                    <th className="px-3.5 py-3 min-w-[180px]">Insured Client</th>
                    <th className="px-3.5 py-3 text-right">Gross Premium</th>
                    <th className="px-3.5 py-3 text-right">Commission Rate</th>
                    <th className="px-3.5 py-3 text-right">Paid Remittance</th>
                    <th className="px-3.5 py-3 text-right">Expected Revenue</th>
                    <th className="px-3.5 py-3">Matching Tier</th>
                    <th className="px-3.5 py-3 text-right">Traceability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentStatement.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No transactions parsed yet for this statement.
                      </td>
                    </tr>
                  ) : (
                    currentStatement.transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3.5 py-3 font-mono text-[11px] text-slate-500">
                          Line {txn.lineIndex}
                        </td>
                        <td className="px-3.5 py-3 font-semibold text-slate-900">
                          {txn.policyNumber}
                        </td>
                        <td className="px-3.5 py-3 font-medium text-slate-800">
                          {txn.clientName}
                        </td>
                        <td className="px-3.5 py-3 text-right text-slate-700">
                          {fmtCurrency(txn.grossPremium)}
                        </td>
                        <td className="px-3.5 py-3 text-right text-slate-700 font-medium">
                          {txn.commissionRate}%
                        </td>
                        <td className="px-3.5 py-3 text-right font-bold text-slate-900">
                          {fmtCurrency(txn.paidCommission)}
                        </td>
                        <td className="px-3.5 py-3 text-right text-slate-600">
                          {fmtCurrency(txn.expectedCommission)}
                        </td>
                        <td className="px-3.5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${
                              txn.matchConfidence === 'High Confidence'
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : txn.matchConfidence === 'Possible Match'
                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            }`}
                          >
                            {txn.matchConfidence}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
            <h3 className="text-[14.5px] font-bold text-slate-900">Statement Processing Audit History</h3>
            <div className="space-y-3">
              {currentStatement.auditHistory.map((log) => (
                <div key={log.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-[12px]">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                    ✓
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{log.action}</p>
                      <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{log.notes}</p>
                    <p className="text-[10.5px] text-slate-400 mt-1">Operator: {log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: REPROCESS STATEMENT
      ════════════════════════════════════════════════════════════════════ */}
      {reprocessModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="size-4 text-amber-600" />
                <h3 className="text-[15px] font-bold text-slate-900">Reprocess Statement</h3>
              </div>
              <button
                onClick={() => setReprocessModalTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-[12.5px] text-slate-600">
              You are about to reprocess <strong>{reprocessModalTarget.statementIdentifier}</strong> ({reprocessModalTarget.fileName}). This will re-execute field extraction and rematching against active book records.
            </p>

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                Select Parsing / Normalization Template
              </label>
              <select className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12.5px] text-slate-800">
                <option>{reprocessModalTarget.mappingTemplate}</option>
                <option>Force Re-detect All Table Columns</option>
                <option>Strict Policy Number Exact Match Rules v4</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReprocessModalTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReprocess}
                className="rounded-xl bg-amber-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-amber-700 transition cursor-pointer"
              >
                Execute Reprocess
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: MANUAL RESOLVE UNMATCHED TRANSACTION
      ════════════════════════════════════════════════════════════════════ */}
      {resolveModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="size-4 text-blue-600" />
                <h3 className="text-[15px] font-bold text-slate-900">Resolve Unmatched Transaction</h3>
              </div>
              <button
                onClick={() => setResolveModalTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-[12px] space-y-1">
              <p><strong>Raw Policy:</strong> {resolveModalTarget.policyNumber}</p>
              <p><strong>Insured Client:</strong> {resolveModalTarget.clientName} ({resolveModalTarget.carrier})</p>
              <p><strong>Paid Remittance:</strong> {fmtCurrency(resolveModalTarget.paidCommission)}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Resolution Action
                </label>
                <select
                  value={resolveActionType}
                  onChange={(e: any) => setResolveActionType(e.target.value)}
                  className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12.5px] text-slate-800"
                >
                  <option value="link">Link to Existing Active Policy Binder</option>
                  <option value="binder">Create New Binder &amp; Record Downstream</option>
                  <option value="query">Issue Carrier Reconciliation Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                  Resolution Audit Notes
                </label>
                <textarea
                  rows={2}
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Enter reason or link reference..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-[12px] text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolveModalTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveUnmatched}
                className="rounded-xl bg-blue-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          DRAWER: TRANSACTION SOURCE TRACEABILITY
      ════════════════════════════════════════════════════════════════════ */}
      {selectedTxnForTrace && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-2xs">
          <div className="w-full max-w-md h-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-blue-600" />
                  <h3 className="text-[15px] font-bold text-slate-900">Transaction Traceability</h3>
                </div>
                <button
                  onClick={() => setSelectedTxnForTrace(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3 text-[12px]">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">Policy Identifier</span>
                  <p className="font-bold text-slate-900 text-[14px]">{selectedTxnForTrace.policyNumber}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">Original Raw Source Row</span>
                  <div className="rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-[11px] leading-relaxed overflow-x-auto mt-1">
                    {selectedTxnForTrace.rawSourceRow}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-slate-400 text-[10px]">Carrier</span>
                    <p className="font-semibold text-slate-900">{selectedTxnForTrace.carrier}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-slate-400 text-[10px]">Line Index</span>
                    <p className="font-semibold text-slate-900">Row {selectedTxnForTrace.lineIndex}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-slate-400 text-[10px]">Gross Premium</span>
                    <p className="font-semibold text-slate-900">{fmtCurrency(selectedTxnForTrace.grossPremium)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2.5">
                    <span className="text-slate-400 text-[10px]">Commission Rate</span>
                    <p className="font-semibold text-slate-900">{selectedTxnForTrace.commissionRate}%</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 text-[11px] block font-medium">Matching Rule Applied</span>
                  <p className="font-semibold text-blue-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 mt-1">
                    {selectedTxnForTrace.ruleMatched} (Confidence score: {selectedTxnForTrace.matchScore}%)
                  </p>
                </div>

                {selectedTxnForTrace.resolutionNote && (
                  <div>
                    <span className="text-slate-400 text-[11px] block font-medium">Broker Resolution Note</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1">
                      {selectedTxnForTrace.resolutionNote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTxnForTrace(null)}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-[12px] font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Close Trace Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
