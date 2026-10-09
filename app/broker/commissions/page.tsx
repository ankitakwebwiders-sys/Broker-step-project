'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Search,
  Plus,
  Download,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Edit3,
  Eye,
  X,
  RotateCcw,
  FileText,
  Check,
  TrendingDown,
  Receipt,
  History,
  Phone,
  Mail,
  Scale,
  Send,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  LayoutGrid,
  List,
  ArrowLeftRight,
} from 'lucide-react'
import {
  initialCommissions,
  type CommissionItem,
  type CommissionTransactionType,
  type CommissionReconciliationStatus,
  type CommissionAuditLog,
} from '@/data/broker/commissions'

export default function CommissionsPage() {
  // Main Commissions state
  const [commissions, setCommissions] = useState<CommissionItem[]>(initialCommissions)

  // View Mode: Table (full horizontal scroll) or Cards (compact responsive cards)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Status Filter Tabs (8.2)
  const [activeTab, setActiveTab] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [reconciliationFilter, setReconciliationFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  // Sync URL query params with active tab, filters, view mode, and drawers
  useEffect(() => {
    function applyUrlParams(searchStr?: string) {
      if (typeof window === 'undefined') return
      const query = searchStr !== undefined ? searchStr : window.location.search
      const params = new URLSearchParams(query)
      const filter = params.get('filter')
      const view = params.get('view')

      if (filter === 'expected') {
        setActiveTab('Expected')
        setTypeFilter('All')
        setReconciliationFilter('All')
      } else if (filter === 'paid') {
        setActiveTab('Paid')
        setTypeFilter('All')
        setReconciliationFilter('All')
      } else if (filter === 'outstanding') {
        setActiveTab('Outstanding')
        setTypeFilter('All')
        setReconciliationFilter('All')
      } else if (filter === 'partial') {
        setActiveTab('Partial')
        setTypeFilter('All')
        setReconciliationFilter('All')
      } else if (filter === 'chargebacks' || filter === 'chargeback') {
        setActiveTab('Chargeback')
        setTypeFilter('All')
        setReconciliationFilter('All')
      } else if (filter === 'adjustments' || filter === 'adjustment') {
        setActiveTab('Adjustment')
        setTypeFilter('All')
        setReconciliationFilter('All')
      } else if (!filter) {
        setActiveTab('All')
        setTypeFilter('All')
        setReconciliationFilter('All')
      }

      if (view === 'transactions' || view === 'transaction') {
        setViewMode('table')
        const txId = params.get('id') || params.get('tx')
        const itemToOpen = txId
          ? initialCommissions.find((c) => c.id === txId || c.transactionNumber === txId) || initialCommissions[0]
          : initialCommissions[0]
        if (itemToOpen) {
          setSelectedCommissionForView(itemToOpen)
        }
      } else if (searchStr !== undefined && !view) {
        setSelectedCommissionForView(null)
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

  const handleTabSelect = (tabKey: string) => {
    setActiveTab(tabKey)
    setTypeFilter('All')
    setReconciliationFilter('All')

    let filterParam: string | null = null
    if (tabKey === 'Expected') filterParam = 'expected'
    else if (tabKey === 'Paid') filterParam = 'paid'
    else if (tabKey === 'Outstanding') filterParam = 'outstanding'
    else if (tabKey === 'Partial') filterParam = 'partial'
    else if (tabKey === 'Chargeback') filterParam = 'chargebacks'
    else if (tabKey === 'Adjustment') filterParam = 'adjustments'

    const newHref = filterParam ? `/broker/commissions?filter=${filterParam}` : '/broker/commissions'
    const targetSearch = filterParam ? `?filter=${filterParam}` : ''

    window.history.pushState(null, '', newHref)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: newHref, search: targetSearch, pathname: '/broker/commissions' },
      })
    )
  }

  // Modals & Drawers
  const [selectedCommissionForView, setSelectedCommissionForView] = useState<CommissionItem | null>(null)
  const [detailTab, setDetailTab] = useState<'overview' | 'financials' | 'audit' | 'statement'>('overview')

  const handleCloseDrawer = () => {
    setSelectedCommissionForView(null)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('view') === 'transactions' || params.get('view') === 'transaction') {
        params.delete('view')
        params.delete('id')
        params.delete('tx')
        const remaining = params.toString()
        const newUrl = remaining ? `${window.location.pathname}?${remaining}` : window.location.pathname
        window.history.replaceState(null, '', newUrl)
        window.dispatchEvent(
          new CustomEvent('broker-nav-change', {
            detail: { href: newUrl, search: remaining ? `?${remaining}` : '', pathname: window.location.pathname },
          })
        )
      }
    }
  }

  // Keyboard shortcut: Escape to close transaction drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCommissionForView) {
        handleCloseDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCommissionForView])

  // Status Change Modal
  const [statusChangeTarget, setStatusChangeTarget] = useState<CommissionItem | null>(null)
  const [newStatusValue, setNewStatusValue] = useState<CommissionReconciliationStatus>('Reconciled')
  const [statusChangeNote, setStatusChangeNote] = useState('')

  // Add Commission / Adjustment Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [modalForm, setModalForm] = useState({
    clientName: 'Marcus Vance',
    businessName: 'Vance Logistics LLC',
    clientEmail: 'm.vance@vancelogistics.com',
    clientPhone: '(555) 392-8812',
    policyNumber: 'POL-8842-TRAV',
    lineOfBusiness: 'Commercial Auto',
    carrier: 'Travelers',
    transactionType: 'Renewal' as CommissionTransactionType,
    statementSource: 'ST-2900',
    premium: '15000',
    commissionRate: '15.0',
    expectedCommission: '2250',
    actualPaidCommission: '2250',
    additionalCommission: '0',
    chargeback: '0',
    adjustment: '0',
    reconciliationStatus: 'Reconciled' as CommissionReconciliationStatus,
    notes: '',
  })

  // Quick Note in Drawer
  const [newDrawerNote, setNewDrawerNote] = useState('')

  // Statement Preview Modal
  const [statementPreviewTarget, setStatementPreviewTarget] = useState<CommissionItem | null>(null)

  // Policy Quick View Modal
  const [policyPreviewTarget, setPolicyPreviewTarget] = useState<CommissionItem | null>(null)

  // ───── 8.1 Metrics Calculations ─────
  const totalExpected = useMemo(() => {
    return commissions.reduce((sum, item) => sum + (item.expectedCommission > 0 ? item.expectedCommission : 0), 0)
  }, [commissions])

  const totalPaidActual = useMemo(() => {
    return commissions.reduce((sum, item) => sum + (item.actualPaidCommission > 0 ? item.actualPaidCommission : 0), 0)
  }, [commissions])

  const totalOutstanding = useMemo(() => {
    return commissions.reduce((sum, item) => {
      if (item.category === 'outstanding') return sum + item.expectedCommission
      if (item.category === 'partial') return sum + Math.max(0, item.expectedCommission - item.actualPaidCommission)
      return sum
    }, 0)
  }, [commissions])

  const totalPartialShortPaid = useMemo(() => {
    return commissions.reduce((sum, item) => {
      if (item.category === 'partial') {
        const diff = item.expectedCommission - item.actualPaidCommission
        return sum + Math.max(0, diff)
      }
      return sum
    }, 0)
  }, [commissions])

  const totalChargebacks = useMemo(() => {
    return Math.abs(commissions.reduce((sum, item) => sum + (item.chargeback < 0 ? item.chargeback : 0), 0))
  }, [commissions])

  const totalAdjustments = useMemo(() => {
    return commissions.reduce((sum, item) => sum + item.adjustment, 0)
  }, [commissions])

  const totalNetCommission = useMemo(() => {
    return commissions.reduce((sum, item) => sum + item.netCommission, 0)
  }, [commissions])

  // ───── 8.2 Tab Counts ─────
  const tabCounts = useMemo(() => {
    return {
      All: commissions.length,
      Expected: commissions.filter(c => c.category === 'expected' || c.expectedCommission > 0).length,
      Paid: commissions.filter(c => c.category === 'paid' || c.actualPaidCommission > 0).length,
      Outstanding: commissions.filter(c => c.category === 'outstanding' || (c.expectedCommission > 0 && c.actualPaidCommission === 0)).length,
      Partial: commissions.filter(c => c.category === 'partial' || (c.expectedCommission > c.actualPaidCommission && c.actualPaidCommission > 0)).length,
      Chargeback: commissions.filter(c => c.category === 'chargeback' || c.chargeback < 0).length,
      Adjustment: commissions.filter(c => c.category === 'adjustment' || c.adjustment !== 0).length,
    }
  }, [commissions])

  // ───── Filtered Commissions ─────
  const filteredCommissions = useMemo(() => {
    return commissions.filter(item => {
      // 8.2 Active Tab Filter
      if (activeTab === 'Expected' && item.category !== 'expected' && item.expectedCommission <= 0) return false
      if (activeTab === 'Paid' && item.category !== 'paid' && item.actualPaidCommission <= 0) return false
      if (activeTab === 'Outstanding' && item.category !== 'outstanding' && !(item.expectedCommission > 0 && item.actualPaidCommission === 0)) return false
      if (activeTab === 'Partial' && item.category !== 'partial' && !(item.expectedCommission > item.actualPaidCommission && item.actualPaidCommission > 0)) return false
      if (activeTab === 'Chargeback' && item.category !== 'chargeback' && item.chargeback >= 0) return false
      if (activeTab === 'Adjustment' && item.category !== 'adjustment' && item.adjustment === 0) return false

      // Carrier filter
      if (carrierFilter !== 'All' && item.carrier !== carrierFilter) return false

      // Reconciliation filter
      if (reconciliationFilter !== 'All' && item.reconciliationStatus !== reconciliationFilter) return false

      // Transaction Type filter
      if (typeFilter !== 'All' && item.transactionType !== typeFilter) return false

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchesClient = item.clientName.toLowerCase().includes(q)
        const matchesBusiness = item.businessName.toLowerCase().includes(q)
        const matchesPolicy = item.policyNumber.toLowerCase().includes(q)
        const matchesCarrier = item.carrier.toLowerCase().includes(q)
        const matchesTxn = item.transactionNumber.toLowerCase().includes(q)
        const matchesStmt = item.statementSource.toLowerCase().includes(q)
        const matchesLine = item.lineOfBusiness.toLowerCase().includes(q)
        if (!matchesClient && !matchesBusiness && !matchesPolicy && !matchesCarrier && !matchesTxn && !matchesStmt && !matchesLine) {
          return false
        }
      }

      return true
    })
  }, [commissions, activeTab, carrierFilter, reconciliationFilter, typeFilter, searchQuery])

  // ───── Horizontal Table Drag-to-Scroll ─────
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)
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
  }, [commissions, filteredCommissions])

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select')) {
      return
    }
    if (!tableContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - tableContainerRef.current.offsetLeft)
    setScrollLeftPos(tableContainerRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - tableContainerRef.current.offsetLeft
    const walk = (x - startX) * 1.4
    tableContainerRef.current.scrollLeft = scrollLeftPos - walk
    checkTableScroll()
  }

  const handleScrollTable = (direction: 'left' | 'right') => {
    if (!tableContainerRef.current) return
    const delta = direction === 'left' ? -350 : 350
    tableContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(checkTableScroll, 350)
  }

  // ───── Format currency helper ─────
  const fmt = (val: number) => {
    const isNeg = val < 0
    const absVal = Math.abs(val)
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(absVal)
    return isNeg ? `-${formatted}` : formatted
  }

  // ───── Helper for Reconciliation Badges ─────
  function getReconciliationBadge(status: CommissionReconciliationStatus) {
    switch (status) {
      case 'Reconciled':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
            <CheckCircle2 className="size-2.5 text-emerald-600 shrink-0" />
            Reconciled
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 whitespace-nowrap">
            <Clock className="size-2.5 text-amber-500 shrink-0" />
            Pending
          </span>
        )
      case 'Partial Paid':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-200 whitespace-nowrap">
            <Scale className="size-2.5 text-indigo-500 shrink-0" />
            Partial Paid
          </span>
        )
      case 'Discrepancy':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200 whitespace-nowrap">
            <AlertCircle className="size-2.5 text-rose-500 shrink-0" />
            Discrepancy
          </span>
        )
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            In Review
          </span>
        )
      case 'Chargeback':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800 ring-1 ring-rose-300 whitespace-nowrap">
            <TrendingDown className="size-2.5 text-rose-600 shrink-0" />
            Chargeback
          </span>
        )
    }
  }

  // ───── Helper for Transaction Type Badges ─────
  function getTypeBadge(type: CommissionTransactionType) {
    switch (type) {
      case 'New Business':
        return (
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
            New Business
          </span>
        )
      case 'Renewal':
        return (
          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-purple-200 whitespace-nowrap">
            Renewal
          </span>
        )
      case 'Endorsement':
        return (
          <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-sky-200 whitespace-nowrap">
            Endorsement
          </span>
        )
      case 'Chargeback':
        return (
          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 ring-1 ring-rose-200 whitespace-nowrap">
            Chargeback
          </span>
        )
      case 'Adjustment':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200 whitespace-nowrap">
            Adjustment
          </span>
        )
      case 'Cancellation':
        return (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-slate-200 whitespace-nowrap">
            Cancellation
          </span>
        )
      case 'Bonus / Additional':
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
            Bonus
          </span>
        )
    }
  }

  // ───── Quick Status Update Handler ─────
  function handleOpenStatusModal(item: CommissionItem) {
    setStatusChangeTarget(item)
    setNewStatusValue(item.reconciliationStatus)
    setStatusChangeNote('')
  }

  function handleSaveStatusChange() {
    if (!statusChangeTarget) return

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const newLog: CommissionAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: nowStr,
      user: 'Jordan Davis (Manual Update)',
      action: `Status changed to ${newStatusValue}`,
      previousStatus: statusChangeTarget.reconciliationStatus,
      newStatus: newStatusValue,
      notes: statusChangeNote.trim() || 'Manual status change executed from commissions console.',
    }

    const updated: CommissionItem = {
      ...statusChangeTarget,
      reconciliationStatus: newStatusValue,
      auditHistory: [newLog, ...statusChangeTarget.auditHistory],
    }

    setCommissions(prev => prev.map(c => c.id === updated.id ? updated : c))
    if (selectedCommissionForView?.id === updated.id) {
      setSelectedCommissionForView(updated)
    }

    setStatusChangeTarget(null)
  }

  // ───── Quick Drawer Note Handler ─────
  function handleAddDrawerNote() {
    if (!selectedCommissionForView || !newDrawerNote.trim()) return

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const newLog: CommissionAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: nowStr,
      user: 'Jordan Davis',
      action: 'Broker Note Added',
      notes: newDrawerNote.trim(),
    }

    const updated: CommissionItem = {
      ...selectedCommissionForView,
      notes: `${selectedCommissionForView.notes} [Note: ${newDrawerNote.trim()}]`,
      auditHistory: [newLog, ...selectedCommissionForView.auditHistory],
    }

    setCommissions(prev => prev.map(c => c.id === updated.id ? updated : c))
    setSelectedCommissionForView(updated)
    setNewDrawerNote('')
  }

  // ───── Add Transaction Handler ─────
  function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()

    const prem = parseFloat(modalForm.premium) || 0
    const rate = parseFloat(modalForm.commissionRate) || 0
    const exp = parseFloat(modalForm.expectedCommission) || (prem * rate) / 100
    const act = parseFloat(modalForm.actualPaidCommission) || 0
    const add = parseFloat(modalForm.additionalCommission) || 0
    const chg = parseFloat(modalForm.chargeback) || 0
    const adj = parseFloat(modalForm.adjustment) || 0
    const net = act + add + chg + adj

    let category: CommissionItem['category'] = 'paid'
    if (chg < 0) category = 'chargeback'
    else if (adj !== 0) category = 'adjustment'
    else if (act === 0 && exp > 0) category = 'outstanding'
    else if (act < exp && act > 0) category = 'partial'
    else if (act === 0) category = 'expected'

    const newItem: CommissionItem = {
      id: `COMM-${Date.now().toString().slice(-4)}`,
      transactionNumber: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: modalForm.transactionType,
      clientId: 'CL-CUSTOM',
      clientName: modalForm.clientName,
      businessName: modalForm.businessName || '—',
      clientEmail: modalForm.clientEmail,
      clientPhone: modalForm.clientPhone,
      policyId: 'POL-CUSTOM',
      policyNumber: modalForm.policyNumber,
      lineOfBusiness: modalForm.lineOfBusiness,
      carrier: modalForm.carrier,
      statementSource: modalForm.statementSource || 'ST-DIRECT',
      statementDate: new Date().toISOString().split('T')[0],
      premium: prem,
      commissionRate: rate,
      expectedCommission: exp,
      actualPaidCommission: act,
      additionalCommission: add,
      chargeback: chg,
      adjustment: adj,
      netCommission: net,
      reconciliationStatus: modalForm.reconciliationStatus,
      category,
      notes: modalForm.notes.trim() || 'Manual commission transaction recorded.',
      auditHistory: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          user: 'Jordan Davis',
          action: 'Transaction Initialized',
          newStatus: modalForm.reconciliationStatus,
          notes: 'Transaction manually entered via broker ledger portal.',
        },
      ],
    }

    setCommissions(prev => [newItem, ...prev])
    setIsAddModalOpen(false)
  }

  return (
    <div className="p-3 sm:p-5 md:p-7 max-w-[1600px] mx-auto space-y-5 sm:space-y-7">
      <div>

        {/* ───── Header ───── */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 inline-flex items-center gap-1.5 text-[11.5px] sm:text-[12px] font-medium text-blue-600">
              <span className="size-1.5 rounded-full bg-blue-500" />
              Broker Workspace · Commission Accounting &amp; Reconciliation
            </p>
            <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-slate-900">
              Commissions
            </h1>
            <p className="mt-0.5 text-[12px] sm:text-[13px] text-slate-500">
              Track expected revenue, reconcile carrier statement payouts, and audit commission discrepancies.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => alert(`Exporting ${filteredCommissions.length} commission ledger rows to CSV...`)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <Download className="size-3.5 sm:size-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 sm:px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)] cursor-pointer"
            >
              <Plus className="size-3.5 sm:size-4 transition-transform group-hover:rotate-90" />
              <span>Log Transaction</span>
            </button>
          </div>
        </div>

        {/* ───── 8.1 Commission Overview Stat Cards ───── */}
        <div className="mt-5 sm:mt-7 grid gap-2.5 sm:gap-3.5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

          {/* 1. Expected Commission */}
          <div
            onClick={() => handleTabSelect('Expected')}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${activeTab === 'Expected'
                ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200/80 bg-white hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]'
              }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11.5px] font-medium text-slate-500">Expected</p>
              <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-blue-600 ring-1 ring-blue-100">
                Calculated
              </span>
            </div>
            <p className="mt-2.5 text-[20px] font-semibold tracking-[-0.04em] text-slate-900">{fmt(totalExpected)}</p>
            <p className="mt-1 text-[10.5px] text-slate-400">Total projected book</p>
          </div>

          {/* 2. Paid / Actual Commission */}
          <div
            onClick={() => handleTabSelect('Paid')}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${activeTab === 'Paid'
                ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20 shadow-md'
                : 'border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.25)]'
              }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11.5px] font-medium text-slate-500">Actual / Paid</p>
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Cleared
              </span>
            </div>
            <p className="mt-2.5 text-[20px] font-semibold tracking-[-0.04em] text-emerald-600">{fmt(totalPaidActual)}</p>
            <p className="mt-1 text-[10.5px] text-slate-400">Deposited remittances</p>
          </div>

          {/* 3. Outstanding Commission */}
          <div
            onClick={() => handleTabSelect('Outstanding')}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${activeTab === 'Outstanding'
                ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20 shadow-md'
                : 'border-slate-200/80 bg-white hover:border-amber-300 hover:shadow-[0_8px_30px_-12px_rgba(245,158,11,0.25)]'
              }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11.5px] font-medium text-slate-500">Outstanding</p>
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-amber-700 ring-1 ring-amber-100">
                Uncollected
              </span>
            </div>
            <p className="mt-2.5 text-[20px] font-semibold tracking-[-0.04em] text-amber-600">{fmt(totalOutstanding)}</p>
            <p className="mt-1 text-[10.5px] text-slate-400">Awaiting statements</p>
          </div>

          {/* 4. Partial / Short Paid */}
          <div
            onClick={() => handleTabSelect('Partial')}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${activeTab === 'Partial'
                ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-md'
                : 'border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-[0_8px_30px_-12px_rgba(99,102,241,0.25)]'
              }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11.5px] font-medium text-slate-500">Short Paid</p>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-indigo-700 ring-1 ring-indigo-100">
                Variance
              </span>
            </div>
            <p className="mt-2.5 text-[20px] font-semibold tracking-[-0.04em] text-indigo-600">{fmt(totalPartialShortPaid)}</p>
            <p className="mt-1 text-[10.5px] text-slate-400">Carrier rate delta</p>
          </div>

          {/* 5. Chargebacks */}
          <div
            onClick={() => handleTabSelect('Chargeback')}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${activeTab === 'Chargeback'
                ? 'border-rose-500 bg-rose-50/20 ring-2 ring-rose-500/20 shadow-md'
                : 'border-slate-200/80 bg-white hover:border-rose-300 hover:shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)]'
              }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11.5px] font-medium text-slate-500">Chargebacks</p>
              <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-rose-700 ring-1 ring-rose-100">
                Clawbacks
              </span>
            </div>
            <p className="mt-2.5 text-[20px] font-semibold tracking-[-0.04em] text-rose-600">-{fmt(totalChargebacks)}</p>
            <p className="mt-1 text-[10.5px] text-slate-400">Cancelled / returned</p>
          </div>

          {/* 6. Adjustments */}
          <div
            onClick={() => handleTabSelect('Adjustment')}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${activeTab === 'Adjustment'
                ? 'border-purple-500 bg-purple-50/20 ring-2 ring-purple-500/20 shadow-md'
                : 'border-slate-200/80 bg-white hover:border-purple-300 hover:shadow-[0_8px_30px_-12px_rgba(168,85,247,0.25)]'
              }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11.5px] font-medium text-slate-500">Adjustments</p>
              <span className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-purple-700 ring-1 ring-purple-100">
                Audits &amp; Fees
              </span>
            </div>
            <p className="mt-2.5 text-[20px] font-semibold tracking-[-0.04em] text-slate-900">{fmt(totalAdjustments)}</p>
            <p className="mt-1 text-[10.5px] text-slate-400">Corrections net</p>
          </div>

          {/* 7. Net Commission */}
          <div
            onClick={() => handleTabSelect('All')}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl col-span-2 sm:col-span-1 md:col-span-1 xl:col-span-1 cursor-pointer ${activeTab === 'All'
                ? 'border-slate-700 bg-slate-950 ring-2 ring-blue-400/40 text-white'
                : 'border-slate-900/10 bg-slate-900 text-white'
              }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[11.5px] font-medium text-slate-300">Net Revenue</p>
              <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[9.5px] font-semibold text-white">
                Total Net
              </span>
            </div>
            <p className="mt-2.5 text-[20px] font-bold tracking-[-0.04em] text-white">{fmt(totalNetCommission)}</p>
            <p className="mt-1 text-[10.5px] text-slate-300">Reconciled broker book</p>
          </div>

        </div>

        {/* ───── 8.2 Filter Tabs Bar (Matches Leads & Clients Exactly) ───── */}
        <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {[
              { label: 'All Commissions', key: 'All' },
              { label: 'Expected Commission', key: 'Expected' },
              { label: 'Paid / Actual Commission', key: 'Paid' },
              { label: 'Outstanding Commission', key: 'Outstanding' },
              { label: 'Partial / Short Paid', key: 'Partial' },
              { label: 'Chargebacks', key: 'Chargeback' },
              { label: 'Adjustments', key: 'Adjustment' },
            ].map((tab) => {
              const count = (tabCounts as any)[tab.key] || 0
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabSelect(tab.key)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all cursor-pointer ${isActive
                      ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <span>{tab.label}</span>
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

          {/* ───── Search & Secondary Dropdown Filters ───── */}
          <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by client, policy #, carrier, statement, transaction ID..."
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

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Carrier Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                <span className="text-[11px] font-medium text-slate-500">Carrier:</span>
                <select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  className="h-9 w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Carriers</option>
                  <option value="Travelers">Travelers</option>
                  <option value="Chubb">Chubb</option>
                  <option value="Medical Protective">Medical Protective</option>
                  <option value="AIG">AIG</option>
                  <option value="CNA">CNA</option>
                  <option value="Hartford">Hartford</option>
                </select>
              </div>

              {/* Reconciliation Status Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                <span className="text-[11px] font-medium text-slate-500">Status:</span>
                <select
                  value={reconciliationFilter}
                  onChange={(e) => setReconciliationFilter(e.target.value)}
                  className="h-9 w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Reconciled">Reconciled</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial Paid">Partial Paid</option>
                  <option value="Discrepancy">Discrepancy</option>
                  <option value="In Review">In Review</option>
                  <option value="Chargeback">Chargeback</option>
                </select>
              </div>

              {/* Transaction Type Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                <span className="text-[11px] font-medium text-slate-500">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="New Business">New Business</option>
                  <option value="Renewal">Renewal</option>
                  <option value="Endorsement">Endorsement</option>
                  <option value="Chargeback">Chargeback</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Cancellation">Cancellation</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(searchQuery || carrierFilter !== 'All' || reconciliationFilter !== 'All' || typeFilter !== 'All' || activeTab !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setCarrierFilter('All')
                    setReconciliationFilter('All')
                    setTypeFilter('All')
                    handleTabSelect('All')
                  }}
                  className="col-span-2 sm:col-span-1 lg:w-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[11.5px] font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ───── Table / Cards View Controls ───── */}
        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900">{filteredCommissions.length}</strong> of {commissions.length} transactions
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/90 p-1 text-[11.5px]">
              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                title="Full Columns Data Table"
              >
                <List className="size-3.5" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                title="Touch Friendly Responsive Cards"
              >
                <LayoutGrid className="size-3.5" />
                <span>Cards</span>
              </button>
            </div>

            {/* Table Horizontal Scroll Arrows (active in table mode) */}
            {viewMode === 'table' && (
              <div className="flex items-center gap-1.5">
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
                  Drag or scroll
                </span>
                <button
                  onClick={() => handleScrollTable('left')}
                  disabled={!canScrollLeft}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  title="Scroll table left"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  onClick={() => handleScrollTable('right')}
                  disabled={!canScrollRight}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  title="Scroll table right"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ───── 8.2 Common Commission Listing Table View ───── */}
        {viewMode === 'table' ? (
          <div className="mt-2 rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
            {/* Mobile swipe indicator banner */}
            <div className="md:hidden flex items-center justify-between px-3.5 py-2 bg-blue-50/70 border-b border-blue-100/70 text-[11px] text-blue-700 font-medium">
              <span className="flex items-center gap-1.5">
                <ArrowLeftRight className="size-3 text-blue-500 animate-pulse shrink-0" />
                Swipe horizontally for all 15 columns
              </span>
              <span className="font-semibold text-blue-900">Sticky actions &rarr;</span>
            </div>

            <div
              ref={tableContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onScroll={checkTableScroll}
              className={`overflow-x-auto custom-scrollbar-table touch-pan-x ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
                }`}
            >
              <table className="w-full min-w-[1780px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                    <th className="px-4 py-3.5 min-w-[210px]">Client</th>
                    <th className="px-3 py-3.5 min-w-[180px]">Policy</th>
                    <th className="px-3 py-3.5 min-w-[130px]">Carrier</th>
                    <th className="px-3 py-3.5 min-w-[125px] whitespace-nowrap">Transaction Type</th>
                    <th className="px-3 py-3.5 min-w-[115px] whitespace-nowrap">Date</th>
                    <th className="px-3 py-3.5 min-w-[110px] text-right">Premium</th>
                    <th className="px-3 py-3.5 min-w-[90px] text-right">Rate</th>
                    <th className="px-3 py-3.5 min-w-[110px] text-right">Expected</th>
                    <th className="px-3 py-3.5 min-w-[110px] text-right">Actual / Paid</th>
                    <th className="px-3 py-3.5 min-w-[100px] text-right">Additional</th>
                    <th className="px-3 py-3.5 min-w-[110px] text-right">Chargeback</th>
                    <th className="px-3 py-3.5 min-w-[110px] text-right">Adjustment</th>
                    <th className="px-3 py-3.5 min-w-[110px] text-right">Net</th>
                    <th className="px-3 py-3.5 min-w-[140px] whitespace-nowrap">Reconciliation Status</th>
                    <th className="px-3 py-3.5 min-w-[130px] whitespace-nowrap">Statement Source</th>
                    <th className="px-3.5 sm:px-4 py-3.5 text-right min-w-[170px] w-[170px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="py-16 text-center text-slate-400">
                        <Receipt className="mx-auto size-9 text-slate-300 mb-2" />
                        <p className="text-[13.5px] font-medium text-slate-600">No commission records found</p>
                        <p className="text-[11.5px] text-slate-400 mt-1">Try selecting another status tab or resetting the search filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCommissions.map((item) => {
                      const variance = item.expectedCommission - item.actualPaidCommission
                      const hasDiscrepancy = variance > 0 && item.actualPaidCommission > 0

                      return (
                        <tr
                          key={item.id}
                          className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                        >
                          {/* 1. Client */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold text-blue-700 ring-1 ring-blue-100">
                                {item.clientName[0] || 'C'}
                              </div>
                              <div className="min-w-0">
                                <button
                                  onClick={() => {
                                    setSelectedCommissionForView(item)
                                    setDetailTab('overview')
                                  }}
                                  className="text-[12.5px] font-semibold text-slate-900 transition hover:text-blue-600 text-left truncate block cursor-pointer"
                                >
                                  {item.clientName}
                                </button>
                                <p className="text-[10.5px] text-slate-400 truncate max-w-[170px]">{item.businessName}</p>
                              </div>
                            </div>
                          </td>

                          {/* 2. Policy */}
                          <td className="px-3 py-3.5">
                            <button
                              onClick={() => setPolicyPreviewTarget(item)}
                              className="font-mono text-[11.5px] font-semibold text-slate-900 hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>{item.policyNumber}</span>
                              <ExternalLink className="size-2.5 opacity-40 group-hover:opacity-100" />
                            </button>
                            <p className="text-[10.5px] text-slate-500 mt-0.5">{item.lineOfBusiness}</p>
                          </td>

                          {/* 3. Carrier */}
                          <td className="px-3 py-3.5">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                              {item.carrier}
                            </span>
                          </td>

                          {/* 4. Transaction Type */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            {getTypeBadge(item.transactionType)}
                          </td>

                          {/* 5. Date */}
                          <td className="px-3 py-3.5 text-[11.5px] text-slate-600 whitespace-nowrap">
                            {item.transactionDate}
                          </td>

                          {/* 6. Premium */}
                          <td className="px-3 py-3.5 text-right font-medium text-[12px] text-slate-800">
                            {fmt(item.premium)}
                          </td>

                          {/* 7. Commission Rate */}
                          <td className="px-3 py-3.5 text-right text-[11.5px] font-semibold text-slate-700">
                            {item.commissionRate > 0 ? `${item.commissionRate.toFixed(1)}%` : '—'}
                          </td>

                          {/* 8. Expected */}
                          <td className="px-3 py-3.5 text-right font-medium text-[12px] text-slate-600">
                            {fmt(item.expectedCommission)}
                          </td>

                          {/* 9. Actual / Paid */}
                          <td className="px-3 py-3.5 text-right text-[12px]">
                            <span className={`font-semibold ${item.actualPaidCommission > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {fmt(item.actualPaidCommission)}
                            </span>
                            {hasDiscrepancy && (
                              <span className="block text-[9.5px] text-amber-600 font-medium">
                                Short by {fmt(variance)}
                              </span>
                            )}
                          </td>

                          {/* 10. Additional */}
                          <td className="px-3 py-3.5 text-right text-[12px]">
                            {item.additionalCommission > 0 ? (
                              <span className="font-semibold text-emerald-600">+{fmt(item.additionalCommission)}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* 11. Chargeback */}
                          <td className="px-3 py-3.5 text-right text-[12px]">
                            {item.chargeback < 0 ? (
                              <span className="font-semibold text-rose-600">{fmt(item.chargeback)}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* 12. Adjustment */}
                          <td className="px-3 py-3.5 text-right text-[12px]">
                            {item.adjustment !== 0 ? (
                              <span className={`font-semibold ${item.adjustment > 0 ? 'text-purple-600' : 'text-slate-700'}`}>
                                {item.adjustment > 0 ? `+${fmt(item.adjustment)}` : fmt(item.adjustment)}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* 13. Net */}
                          <td className="px-3 py-3.5 text-right text-[12.5px] font-bold text-slate-900">
                            <span className={item.netCommission > 0 ? 'text-slate-900' : 'text-rose-600'}>
                              {fmt(item.netCommission)}
                            </span>
                          </td>

                          {/* 14. Reconciliation Status */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            {getReconciliationBadge(item.reconciliationStatus)}
                          </td>

                          {/* 15. Statement Source */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <button
                              onClick={() => setStatementPreviewTarget(item)}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                              title="View statement reconciliation sheet"
                            >
                              <FileSpreadsheet className="size-3 text-slate-400" />
                              <span>{item.statementSource}</span>
                            </button>
                          </td>

                          {/* 16. Actions */}
                          <td className="px-3.5 sm:px-4 py-3.5 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Detail Drawer (8.3) */}
                              <button
                                onClick={() => {
                                  setSelectedCommissionForView(item)
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                                title="Open 8.3 Commission Transaction Detail"
                              >
                                <Eye className="size-3.5" />
                                <span>View Transaction</span>
                              </button>

                              {/* Update Status Button */}
                              <button
                                onClick={() => handleOpenStatusModal(item)}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 sm:px-2.5 py-1.5 text-[10.5px] sm:text-[11px] font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer whitespace-nowrap"
                                title="Update Reconciliation Status"
                              >
                                <Edit3 className="size-3 text-slate-400" />
                                <span>Status</span>
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
          /* ───── 8.2 Responsive Cards View (Mobile & Tablet Friendly) ───── */
          <div className="mt-2 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCommissions.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-200/80 bg-white p-12 text-center text-slate-400">
                <Receipt className="mx-auto size-9 text-slate-300 mb-2" />
                <p className="text-[13.5px] font-medium text-slate-600">No commission records found</p>
                <p className="text-[11.5px] text-slate-400 mt-1">Try selecting another status tab or resetting the search filter.</p>
              </div>
            ) : (
              filteredCommissions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between gap-3"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => setSelectedCommissionForView(item)}
                          className="text-[13.5px] font-bold text-slate-900 hover:text-blue-600 transition text-left truncate block cursor-pointer"
                        >
                          {item.clientName}
                        </button>
                        <p className="text-[11px] text-slate-400 truncate">{item.businessName}</p>
                      </div>
                      <div className="shrink-0">
                        {getReconciliationBadge(item.reconciliationStatus)}
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.policyNumber}
                      </span>
                      <span className="text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {item.carrier}
                      </span>
                      {getTypeBadge(item.transactionType)}
                      <span className="text-slate-400 ml-auto">{item.transactionDate}</span>
                    </div>
                  </div>

                  {/* Financial 3-Col Mini Grid */}
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Premium</span>
                      <strong className="text-[12.5px] text-slate-900 block mt-0.5 font-mono">{fmt(item.premium)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Paid / Actual</span>
                      <strong className="text-[12.5px] text-emerald-600 block mt-0.5 font-mono">{fmt(item.actualPaidCommission)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Net Comm.</span>
                      <strong className="text-[12.5px] text-slate-950 block mt-0.5 font-mono">{fmt(item.netCommission)}</strong>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => setStatementPreviewTarget(item)}
                      className="font-mono text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FileSpreadsheet className="size-3 text-slate-400" />
                      <span>{item.statementSource}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedCommissionForView(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                      >
                        <Eye className="size-3.5" />
                        <span>View Transaction</span>
                      </button>
                      <button
                        onClick={() => handleOpenStatusModal(item)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer whitespace-nowrap"
                      >
                        <Edit3 className="size-3 text-slate-400" />
                        <span>Status</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────────
          8.3 COMMISSION TRANSACTION DETAIL DRAWER (SLIDE-OVER)
          All 15 specification fields directly laid out in full view
      ─────────────────────────────────────────────────────────────── */}
      {selectedCommissionForView && (
        <div
          onClick={handleCloseDrawer}
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-full sm:max-w-2xl lg:max-w-4xl flex-col bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
          >

            {/* Drawer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-slate-50/70 p-4 sm:px-6 sm:py-5 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                  <DollarSign className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded ring-1 ring-blue-100">
                      Section 8.3 Detail
                    </span>
                    <h2 className="text-[15px] sm:text-[17px] font-bold tracking-tight text-slate-900 font-mono truncate">
                      {selectedCommissionForView.transactionNumber}
                    </h2>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {getReconciliationBadge(selectedCommissionForView.reconciliationStatus)}
                    {getTypeBadge(selectedCommissionForView.transactionType)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200/60">
                <Link
                  href={`/broker/commissions/${selectedCommissionForView.id}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition"
                  title="Open Dedicated Full Page"
                >
                  <ExternalLink className="size-3 text-slate-400" />
                  <span>Full Page</span>
                </Link>
                <button
                  onClick={() => handleOpenStatusModal(selectedCommissionForView)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                >
                  <Edit3 className="size-3" />
                  <span>Update Status</span>
                </button>
                <button
                  onClick={handleCloseDrawer}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                  title="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body - All 15 Specification Items in Plain Sight */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 bg-slate-50/40 space-y-4 sm:space-y-5 text-[12px] sm:text-[12.5px]">

              {/* 1. Client and Policy */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-4.5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-blue-600" />
                    <h3 className="text-[12.5px] sm:text-[13px] font-bold text-slate-900 uppercase tracking-wide">
                      1. Client and Policy
                    </h3>
                  </div>
                  <Link href="/broker/clients" className="text-[11px] font-semibold text-blue-600 hover:underline">
                    Client Book &rarr;
                  </Link>
                </div>

                <div className="mt-3.5 grid gap-3 grid-cols-1 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-400 block font-medium">Client Name</span>
                    <span className="font-bold text-slate-900 text-[13px] block mt-0.5">{selectedCommissionForView.clientName}</span>
                    <span className="text-[11.5px] text-slate-500 block">{selectedCommissionForView.businessName}</span>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col gap-0.5 text-[11px] text-slate-600">
                      <span>{selectedCommissionForView.clientPhone}</span>
                      <span>{selectedCommissionForView.clientEmail}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-400 block font-medium">Policy Information</span>
                    <span className="font-mono font-bold text-slate-900 text-[13px] block mt-0.5">{selectedCommissionForView.policyNumber}</span>
                    <span className="text-[11.5px] text-slate-600 block">{selectedCommissionForView.lineOfBusiness}</span>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">Carrier: </span>
                      <strong className="text-slate-800">{selectedCommissionForView.carrier}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 & 3 & 4. Carrier, Transaction Type, Transaction Date, Statement Source */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <Receipt className="size-4 text-blue-600" />
                  <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
                    2. Carrier, Transaction Type, Date &amp; Statement Source
                  </h3>
                </div>

                <div className="mt-3.5 grid gap-3 grid-cols-2 sm:grid-cols-4 text-[12px]">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-400 block font-medium">Carrier</span>
                    <span className="font-bold text-slate-900 mt-1 block">{selectedCommissionForView.carrier}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-400 block font-medium">Transaction Type</span>
                    <span className="font-semibold text-slate-900 mt-1 block">{selectedCommissionForView.transactionType}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-400 block font-medium">Transaction Date</span>
                    <span className="font-medium text-slate-800 mt-1 block">{selectedCommissionForView.transactionDate}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-[11px] text-slate-400 block font-medium">Statement Source</span>
                    <span className="font-mono font-bold text-blue-600 mt-1 block">{selectedCommissionForView.statementSource}</span>
                  </div>
                </div>
              </div>

              {/* 5 through 12: Premium, Rates & All Commission Breakdown */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4 text-emerald-600" />
                    <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
                      3. Premium &amp; Financial Commission Breakdown
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Statement #{selectedCommissionForView.statementSource}</span>
                </div>

                {/* 8-box financial card grid */}
                <div className="mt-3.5 grid gap-2.5 grid-cols-2 sm:grid-cols-4 text-[12px]">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Premium</span>
                    <span className="text-[15px] font-bold text-slate-900 block mt-1">{fmt(selectedCommissionForView.premium)}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Commission Rate</span>
                    <span className="text-[15px] font-bold text-blue-600 block mt-1">{selectedCommissionForView.commissionRate}%</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Expected Commission</span>
                    <span className="text-[15px] font-bold text-slate-800 block mt-1">{fmt(selectedCommissionForView.expectedCommission)}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                    <span className="text-[10.5px] text-emerald-700 block font-medium">Actual / Paid Commission</span>
                    <span className="text-[15px] font-bold text-emerald-700 block mt-1">{fmt(selectedCommissionForView.actualPaidCommission)}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Additional Commission</span>
                    <span className="text-[15px] font-semibold text-slate-900 block mt-1">+{fmt(selectedCommissionForView.additionalCommission)}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Chargeback</span>
                    <span className="text-[15px] font-semibold text-rose-600 block mt-1">{fmt(selectedCommissionForView.chargeback)}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                    <span className="text-[10.5px] text-slate-400 block font-medium">Adjustment / Reversal</span>
                    <span className="text-[15px] font-semibold text-purple-700 block mt-1">{fmt(selectedCommissionForView.adjustment)}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-900 bg-slate-950 text-white">
                    <span className="text-[10.5px] text-slate-300 block font-medium">Net Commission</span>
                    <span className="text-[15px] font-bold text-white block mt-1">{fmt(selectedCommissionForView.netCommission)}</span>
                  </div>
                </div>

                {/* Net Calculation Summary Bar */}
                <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50/90 p-3 text-[11.5px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
                  <span><strong>Net Calculation Formula:</strong> Actual ({fmt(selectedCommissionForView.actualPaidCommission)}) + Add&apos;l ({fmt(selectedCommissionForView.additionalCommission)}) - Chargeback ({fmt(Math.abs(selectedCommissionForView.chargeback))}) + Adj ({fmt(selectedCommissionForView.adjustment)})</span>
                  <span className="font-bold text-slate-900 font-mono text-[13px]">= {fmt(selectedCommissionForView.netCommission)}</span>
                </div>

                {/* Variance Note if short paid */}
                {selectedCommissionForView.expectedCommission !== selectedCommissionForView.actualPaidCommission && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-900">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="size-4 text-amber-600 shrink-0" />
                      Reconciliation Difference: {fmt(selectedCommissionForView.expectedCommission - selectedCommissionForView.actualPaidCommission)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-amber-800">
                      Expected commission differs from recorded statement actual payment.
                    </p>
                  </div>
                )}
              </div>

              {/* 13 & 14. Notes & Reconciliation Status */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-blue-600" />
                    <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
                      4. Notes &amp; Reconciliation Status
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Current Status:</span>
                    {getReconciliationBadge(selectedCommissionForView.reconciliationStatus)}
                  </div>
                </div>

                <div className="mt-3.5 space-y-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block mb-1">Accounting Notes</span>
                    <p className="rounded-xl bg-slate-50 p-3 text-[12px] text-slate-700 border border-slate-100 leading-relaxed">
                      {selectedCommissionForView.notes}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Add Remark</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Log broker remark or reconciliation note..."
                        value={newDrawerNote}
                        onChange={(e) => setNewDrawerNote(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-[12px] outline-none focus:border-blue-400"
                      />
                      <button
                        onClick={handleAddDrawerNote}
                        disabled={!newDrawerNote.trim()}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-600 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Send className="size-3" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 15. History of Manual Status Changes (User / Date-Time) */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <Clock className="size-4 text-blue-600" />
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">
                      5. History of Manual Status Changes (Audit Trail)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Audit history including user name, timestamp, and transition remarks.
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 overflow-x-auto rounded-xl border border-slate-200/80 touch-pan-x">
                  <table className="w-full min-w-[500px] text-left text-[12px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-3.5 py-2.5">Date &amp; Time</th>
                        <th className="px-3 py-2.5">User</th>
                        <th className="px-3 py-2.5">Status Transition</th>
                        <th className="px-3.5 py-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCommissionForView.auditHistory.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60">
                          <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {log.timestamp}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-800">
                            {log.user}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {log.newStatus ? (
                              <div className="flex items-center gap-1.5">
                                {log.previousStatus && (
                                  <span className="line-through text-slate-400 text-[10.5px]">{log.previousStatus}</span>
                                )}
                                {log.previousStatus && <span className="text-slate-400">&rarr;</span>}
                                <span className="rounded bg-blue-50 px-1.5 py-0.2 text-blue-700 font-semibold ring-1 ring-blue-200 text-[10px]">
                                  {log.newStatus}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500">{log.action}</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 text-slate-600">
                            {log.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white p-4 sm:px-6 sm:py-4 gap-2">
              <span className="text-[11px] text-slate-400 font-mono truncate">
                Transaction ID: {selectedCommissionForView.id}
              </span>
              <button
                onClick={() => setSelectedCommissionForView(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shrink-0"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          UPDATE RECONCILIATION STATUS MODAL
      ─────────────────────────────────────────────────────────────── */}
      {statusChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-[calc(100%-1.5rem)] sm:w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="size-4.5 text-blue-600" />
                <h3 className="text-[15px] font-bold text-slate-900">Update Reconciliation Status</h3>
              </div>
              <button
                onClick={() => setStatusChangeTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-[12px] text-slate-600">
              Update audit status for transaction <strong className="font-mono text-slate-900">{statusChangeTarget.transactionNumber}</strong> ({statusChangeTarget.clientName}).
            </p>

            <div className="mt-4 space-y-3.5 text-[12px]">
              <div>
                <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">New Reconciliation Status</label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value as CommissionReconciliationStatus)}
                  className="w-full h-9.5 rounded-xl border border-slate-200 px-3 text-[12.5px] font-medium text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Reconciled">Reconciled</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial Paid">Partial Paid</option>
                  <option value="Discrepancy">Discrepancy</option>
                  <option value="In Review">In Review</option>
                  <option value="Chargeback">Chargeback</option>
                </select>
              </div>

              <div>
                <label className="text-[11.5px] font-semibold text-slate-700 block mb-1">Reason / Audit Remark *</label>
                <textarea
                  rows={2.5}
                  value={statusChangeNote}
                  onChange={(e) => setStatusChangeNote(e.target.value)}
                  placeholder="e.g. Carrier remittance verified against bank statement or discrepancy resolved with underwriter..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setStatusChangeTarget(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatusChange}
                className="rounded-xl bg-slate-950 px-4 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-blue-600 transition cursor-pointer"
              >
                Save &amp; Record Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LOG NEW COMMISSION / ADJUSTMENT MODAL
      ─────────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-[calc(100%-1.5rem)] sm:w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:px-6 sm:py-4 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <Plus className="size-4.5 text-blue-600" />
                <div>
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900">Log Commission Transaction</h3>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500">Record a new expected, actual, chargeback, or adjustment item</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddTransaction} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-[12px]">

              <div className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.clientName}
                    onChange={(e) => setModalForm({ ...modalForm, clientName: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Business Name (optional)</label>
                  <input
                    type="text"
                    value={modalForm.businessName}
                    onChange={(e) => setModalForm({ ...modalForm, businessName: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Policy Number *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.policyNumber}
                    onChange={(e) => setModalForm({ ...modalForm, policyNumber: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] font-mono outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Carrier *</label>
                  <select
                    value={modalForm.carrier}
                    onChange={(e) => setModalForm({ ...modalForm, carrier: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-2.5 text-[12px] outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Travelers">Travelers</option>
                    <option value="Chubb">Chubb</option>
                    <option value="Medical Protective">Medical Protective</option>
                    <option value="AIG">AIG</option>
                    <option value="CNA">CNA</option>
                    <option value="Hartford">Hartford</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Transaction Type *</label>
                  <select
                    value={modalForm.transactionType}
                    onChange={(e) => setModalForm({ ...modalForm, transactionType: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-2.5 text-[12px] outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="New Business">New Business</option>
                    <option value="Renewal">Renewal</option>
                    <option value="Endorsement">Endorsement</option>
                    <option value="Chargeback">Chargeback</option>
                    <option value="Adjustment">Adjustment</option>
                    <option value="Cancellation">Cancellation</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2.5 sm:gap-3.5 grid-cols-2 sm:grid-cols-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Premium ($)</label>
                  <input
                    type="number"
                    value={modalForm.premium}
                    onChange={(e) => setModalForm({ ...modalForm, premium: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={modalForm.commissionRate}
                    onChange={(e) => setModalForm({ ...modalForm, commissionRate: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Expected ($)</label>
                  <input
                    type="number"
                    value={modalForm.expectedCommission}
                    onChange={(e) => setModalForm({ ...modalForm, expectedCommission: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Actual Paid ($)</label>
                  <input
                    type="number"
                    value={modalForm.actualPaidCommission}
                    onChange={(e) => setModalForm({ ...modalForm, actualPaidCommission: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-2.5 sm:gap-3.5 grid-cols-1 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Additional ($)</label>
                  <input
                    type="number"
                    value={modalForm.additionalCommission}
                    onChange={(e) => setModalForm({ ...modalForm, additionalCommission: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Chargeback (negative $)</label>
                  <input
                    type="number"
                    value={modalForm.chargeback}
                    onChange={(e) => setModalForm({ ...modalForm, chargeback: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Adjustment ($)</label>
                  <input
                    type="number"
                    value={modalForm.adjustment}
                    onChange={(e) => setModalForm({ ...modalForm, adjustment: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Statement Source ID</label>
                  <input
                    type="text"
                    placeholder="e.g. ST-2900"
                    value={modalForm.statementSource}
                    onChange={(e) => setModalForm({ ...modalForm, statementSource: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] font-mono outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Initial Reconciliation Status</label>
                  <select
                    value={modalForm.reconciliationStatus}
                    onChange={(e) => setModalForm({ ...modalForm, reconciliationStatus: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-2.5 text-[12px] outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Reconciled">Reconciled</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial Paid">Partial Paid</option>
                    <option value="Discrepancy">Discrepancy</option>
                    <option value="In Review">In Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  placeholder="Carrier statement detail or accounting reference..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2 text-[12px] font-semibold text-white shadow-md hover:bg-blue-600 transition cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STATEMENT PREVIEW MODAL
      ─────────────────────────────────────────────────────────────── */}
      {statementPreviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-[calc(100%-1.5rem)] sm:w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4.5 text-blue-600" />
                <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900">Carrier Remittance Statement</h3>
              </div>
              <button
                onClick={() => setStatementPreviewTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[12px] sm:text-[12.5px]">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Statement Reference</span>
                <span className="font-mono font-bold text-slate-900">{statementPreviewTarget.statementSource}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Carrier / Underwriter</span>
                <span className="font-semibold text-slate-900">{statementPreviewTarget.carrier}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Policy Covered</span>
                <span className="font-mono text-slate-800">{statementPreviewTarget.policyNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Statement Date</span>
                <span className="text-slate-800">{statementPreviewTarget.statementDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Paid Commission Transacted</span>
                <span className="font-bold text-emerald-700">{fmt(statementPreviewTarget.actualPaidCommission)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Reconciliation Audit State</span>
                <span>{getReconciliationBadge(statementPreviewTarget.reconciliationStatus)}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setStatementPreviewTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          POLICY PREVIEW MODAL
      ─────────────────────────────────────────────────────────────── */}
      {policyPreviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-[calc(100%-1.5rem)] sm:w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="size-4.5 text-blue-600" />
                <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900">Policy Record Snapshot</h3>
              </div>
              <button
                onClick={() => setPolicyPreviewTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-[12px] sm:text-[12.5px]">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Policy Number</span>
                <span className="font-mono font-bold text-slate-900">{policyPreviewTarget.policyNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Line of Business</span>
                <span className="font-semibold text-slate-900">{policyPreviewTarget.lineOfBusiness}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Insured Client</span>
                <span className="text-slate-800">{policyPreviewTarget.clientName} ({policyPreviewTarget.businessName})</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Carrier</span>
                <span className="font-semibold text-slate-800">{policyPreviewTarget.carrier}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Gross Premium</span>
                <span className="font-bold text-slate-900">{fmt(policyPreviewTarget.premium)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Broker Commission Rate</span>
                <span className="font-bold text-blue-600">{policyPreviewTarget.commissionRate}%</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPolicyPreviewTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
