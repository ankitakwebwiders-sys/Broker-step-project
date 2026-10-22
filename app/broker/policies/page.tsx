'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Shield,
  Search,
  Plus,
  Filter,
  Download,
  Calendar,
  CalendarDays,
  Building2,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Edit3,
  Eye,
  ChevronDown,
  X,
  ChevronRight,
  RotateCcw,
  DollarSign,
  Activity,
  History,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  ArrowUpRight,
  Check,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Zap,
} from 'lucide-react'
import {
  initialPolicies,
  carrierOptions,
  lineOfBusinessOptions,
  transactionTypeOptions,
  type PolicyRecord,
  type PolicyStatus,
  type TransactionType,
  type ReconciliationStatus,
} from '@/data/broker/policies'
import { initialClients, type ClientItem } from '@/data/broker/clients'

export default function PoliciesPage() {
  // ── Master Policies State ──
  const [policies, setPolicies] = useState<PolicyRecord[]>(initialPolicies)

  // ── Filters & View Tabs (6.2) ──
  type TabType =
    | 'all'
    | 'active'
    | 'historical'
    | 'new-business'
    | 'renewals'
    | 'rewrites'
    | 'endorsements'
    | 'cancellations'
    | 'chargebacks'
    | 'adjustments'

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [lobFilter, setLobFilter] = useState('All')
  const [reconciliationFilter, setReconciliationFilter] = useState('All')

  // ── Modals & Drawers State ──
  const [selectedPolicyForView, setSelectedPolicyForView] = useState<PolicyRecord | null>(null)
  const [detailTab, setDetailTab] = useState<'overview' | 'commission' | 'transactions' | 'timeline' | 'statement'>('overview')

  // Add / Edit Policy Modal State (6.3)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<PolicyRecord | null>(null)

  // Sync URL query params with tabs, modals, and actions
  useEffect(() => {
    function applyUrlParams(searchStr?: string) {
      if (typeof window === 'undefined') return
      const query = searchStr !== undefined ? searchStr : window.location.search
      const params = new URLSearchParams(query)
      const tab = params.get('tab') as TabType | null
      const action = params.get('action')
      if (tab) {
        setActiveTab(tab)
      } else if (!params.toString()) {
        setActiveTab('all')
      }
      if (action === 'add') {
        setEditingPolicy(null)
        setIsPolicyModalOpen(true)
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

  const handleTabSelect = (tabId: TabType) => {
    setActiveTab(tabId)
    const newHref = tabId === 'all' ? '/broker/policies' : `/broker/policies?tab=${tabId}`
    const targetSearch = tabId === 'all' ? '' : `?tab=${tabId}`
    window.history.pushState(null, '', newHref)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: newHref, search: targetSearch, pathname: '/broker/policies' },
      })
    )
  }

  // New Business Quick-Entry Flow State (6.4)
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false)
  const [quickEntryStep, setQuickEntryStep] = useState(1)

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // ── 6.3 Form State ──
  const [allClients, setAllClients] = useState<ClientItem[]>(initialClients)
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const clientSearchRef = useRef<HTMLDivElement>(null)

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
  }, [isPolicyModalOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(e.target as Node)) {
        setIsClientDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return allClients
    const q = clientSearchQuery.toLowerCase()
    return allClients.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.businessName && c.businessName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q))
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

  const [policyForm, setPolicyForm] = useState({
    clientId: initialClients[0]?.id || 'cli-1',
    clientName: initialClients[0]?.name || '',
    businessName: initialClients[0]?.businessName || '',
    clientEmail: initialClients[0]?.email || '',
    clientPhone: initialClients[0]?.phone || '',
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

  // Live calculations for 6.3 form
  const calculatedExpectedCommission = useMemo(() => {
    const gross = (policyForm.premium * (policyForm.commissionRate || 0)) / 100
    const net = (gross * (policyForm.brokerSplit || 0)) / 100
    return Math.round(net * 100) / 100
  }, [policyForm.premium, policyForm.commissionRate, policyForm.brokerSplit])

  const calculatedOutstanding = useMemo(() => {
    const diff = calculatedExpectedCommission - (policyForm.actualPaidCommission || 0)
    return Math.max(0, Math.round(diff * 100) / 100)
  }, [calculatedExpectedCommission, policyForm.actualPaidCommission])

  // ── 6.4 Quick-Entry Form State ──
  const [quickForm, setQuickForm] = useState({
    clientId: initialClients[0]?.id || 'cli-1',
    clientName: initialClients[0]?.name || '',
    businessName: initialClients[0]?.businessName || '',
    clientEmail: initialClients[0]?.email || '',
    clientPhone: initialClients[0]?.phone || '',
    carrier: 'Travelers',
    lineOfBusiness: 'Commercial Property',
    policyNumber: '',
    isPendingNumber: true,
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    premium: 24000,
    commissionRate: 15,
    brokerSplit: 70,
    notes: '',
  })

  const quickExpectedCommission = useMemo(() => {
    const gross = (quickForm.premium * (quickForm.commissionRate || 0)) / 100
    const net = (gross * (quickForm.brokerSplit || 0)) / 100
    return Math.round(net * 100) / 100
  }, [quickForm.premium, quickForm.commissionRate, quickForm.brokerSplit])

  // Open Edit Modal
  function handleOpenEdit(policy: PolicyRecord) {
    setEditingPolicy(policy)
    setPolicyForm({
      clientId: policy.clientId,
      clientName: policy.clientName,
      businessName: policy.businessName,
      clientEmail: policy.clientEmail,
      clientPhone: policy.clientPhone,
      carrier: policy.carrier,
      policyNumber: policy.isPendingNumber ? '' : policy.policyNumber,
      isPendingNumber: !!policy.isPendingNumber,
      policyStatus: policy.policyStatus,
      lineOfBusiness: policy.lineOfBusiness,
      transactionType: policy.transactionType,
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
      premium: policy.premium,
      commissionRate: policy.commissionRate,
      brokerSplit: policy.brokerSplit,
      actualPaidCommission: policy.actualPaidCommission,
      notes: policy.notes || '',
    })
    setIsPolicyModalOpen(true)
  }

  // Open Create Modal
  function handleOpenCreate() {
    setEditingPolicy(null)
    const defaultClient = initialClients[0]
    setPolicyForm({
      clientId: defaultClient?.id || 'cli-1',
      clientName: defaultClient?.name || 'Marcus Vance',
      businessName: defaultClient?.businessName || 'Apex Logistics Corp',
      clientEmail: defaultClient?.email || 'marcus@apexlogistics.com',
      clientPhone: defaultClient?.phone || '+1 (555) 234-5678',
      carrier: 'Travelers',
      policyNumber: '',
      isPendingNumber: false,
      policyStatus: 'Active',
      lineOfBusiness: 'Commercial Property',
      transactionType: 'New Business',
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      premium: 15000,
      commissionRate: 15,
      brokerSplit: 70,
      actualPaidCommission: 0,
      notes: '',
    })
    setIsPolicyModalOpen(true)
  }

  // Save Policy Form (Create or Edit)
  function handleSavePolicyForm(e: React.FormEvent) {
    e.preventDefault()

    const finalPolicyNumber = policyForm.isPendingNumber
      ? 'Pending'
      : policyForm.policyNumber.trim() || `POL-${policyForm.carrier.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`

    const finalExpected = calculatedExpectedCommission
    const finalActual = Number(policyForm.actualPaidCommission) || 0
    const finalOutstanding = Math.max(0, finalExpected - finalActual)

    const recStatus: ReconciliationStatus =
      finalActual === 0
        ? 'Pending'
        : Math.abs(finalActual - finalExpected) < 1
          ? 'Reconciled'
          : 'Discrepancy'

    if (editingPolicy) {
      // Update existing
      setPolicies((prev) =>
        prev.map((p) => {
          if (p.id !== editingPolicy.id) return p
          return {
            ...p,
            clientId: policyForm.clientId,
            clientName: policyForm.clientName,
            businessName: policyForm.businessName,
            clientEmail: policyForm.clientEmail,
            clientPhone: policyForm.clientPhone,
            carrier: policyForm.carrier,
            policyNumber: finalPolicyNumber,
            isPendingNumber: policyForm.isPendingNumber,
            policyStatus: policyForm.policyStatus,
            lineOfBusiness: policyForm.lineOfBusiness,
            transactionType: policyForm.transactionType,
            effectiveDate: policyForm.effectiveDate,
            expiryDate: policyForm.expiryDate,
            premium: Number(policyForm.premium) || 0,
            commissionRate: Number(policyForm.commissionRate) || 0,
            brokerSplit: Number(policyForm.brokerSplit) || 0,
            expectedCommission: finalExpected,
            actualPaidCommission: finalActual,
            outstandingCommission: finalOutstanding,
            reconciliationStatus: recStatus,
            notes: policyForm.notes,
            timeline: [
              {
                id: `tl-edit-${Date.now()}`,
                title: 'Policy Details Updated',
                type: 'creation',
                date: new Date().toLocaleString(),
                detail: `Updated policy terms, premium: $${Number(policyForm.premium).toLocaleString()}.`,
                actor: 'Jordan Taylor (Broker)',
              },
              ...p.timeline,
            ],
          }
        })
      )
      showToast(`Policy ${finalPolicyNumber} successfully updated.`)
    } else {
      // Create new
      const newPolicy: PolicyRecord = {
        id: `pol-${Date.now()}`,
        policyNumber: finalPolicyNumber,
        isPendingNumber: policyForm.isPendingNumber,
        clientId: policyForm.clientId,
        clientName: policyForm.clientName,
        businessName: policyForm.businessName,
        clientEmail: policyForm.clientEmail,
        clientPhone: policyForm.clientPhone,
        carrier: policyForm.carrier,
        policyStatus: policyForm.policyStatus,
        lineOfBusiness: policyForm.lineOfBusiness,
        transactionType: policyForm.transactionType,
        effectiveDate: policyForm.effectiveDate,
        expiryDate: policyForm.expiryDate,
        premium: Number(policyForm.premium) || 0,
        commissionRate: Number(policyForm.commissionRate) || 0,
        brokerSplit: Number(policyForm.brokerSplit) || 0,
        expectedCommission: finalExpected,
        actualPaidCommission: finalActual,
        outstandingCommission: finalOutstanding,
        reconciliationStatus: recStatus,
        notes: policyForm.notes,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            date: policyForm.effectiveDate,
            type: policyForm.transactionType,
            description: `Initial ${policyForm.transactionType} binding`,
            premiumChange: Number(policyForm.premium) || 0,
            expectedCommission: finalExpected,
            actualPaid: finalActual,
            outstanding: finalOutstanding,
            reconciliationStatus: recStatus,
          },
        ],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            title: `Policy Created (${policyForm.transactionType})`,
            type: 'creation',
            date: new Date().toLocaleString(),
            detail: `Bound with ${policyForm.carrier} for $${Number(policyForm.premium).toLocaleString()} premium.`,
            actor: 'Jordan Taylor (Broker)',
          },
        ],
      }
      setPolicies((prev) => [newPolicy, ...prev])
      showToast(`New policy ${finalPolicyNumber} added to Book of Business.`)
    }

    setIsPolicyModalOpen(false)
  }

  // Save 6.4 Quick New Business Flow
  function handleCompleteQuickEntry() {
    const finalPolicyNum = quickForm.isPendingNumber
      ? 'Pending'
      : quickForm.policyNumber.trim() || `POL-${quickForm.carrier.substring(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`

    const newRecord: PolicyRecord = {
      id: `pol-quick-${Date.now()}`,
      policyNumber: finalPolicyNum,
      isPendingNumber: quickForm.isPendingNumber,
      clientId: quickForm.clientId,
      clientName: quickForm.clientName,
      businessName: quickForm.businessName,
      clientEmail: quickForm.clientEmail,
      clientPhone: quickForm.clientPhone,
      carrier: quickForm.carrier,
      policyStatus: 'Active',
      lineOfBusiness: quickForm.lineOfBusiness,
      transactionType: 'New Business',
      effectiveDate: quickForm.effectiveDate,
      expiryDate: quickForm.expiryDate,
      premium: Number(quickForm.premium) || 0,
      commissionRate: Number(quickForm.commissionRate) || 0,
      brokerSplit: Number(quickForm.brokerSplit) || 0,
      expectedCommission: quickExpectedCommission,
      actualPaidCommission: 0,
      outstandingCommission: quickExpectedCommission,
      reconciliationStatus: 'Pending',
      notes: quickForm.notes || 'Created via New Business Quick-Entry flow.',
      transactions: [
        {
          id: `tx-${Date.now()}`,
          date: quickForm.effectiveDate,
          type: 'New Business',
          description: 'New Business quick-entry binding',
          premiumChange: Number(quickForm.premium) || 0,
          expectedCommission: quickExpectedCommission,
          actualPaid: 0,
          outstanding: quickExpectedCommission,
          reconciliationStatus: 'Pending',
        },
      ],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'New Business Bound & Added to Book of Business',
          type: 'creation',
          date: new Date().toLocaleString(),
          detail: `Quick-entry complete. Premium: $${Number(quickForm.premium).toLocaleString()} | Expected commission: $${quickExpectedCommission.toLocaleString()}.`,
          actor: 'Jordan Taylor (Broker)',
        },
      ],
    }

    setPolicies((prev) => [newRecord, ...prev])
    setIsQuickEntryOpen(false)
    setQuickEntryStep(1)
    showToast(`New Business policy ${finalPolicyNum} successfully added to Book of Business!`)
  }

  // ── Tab Filtering (6.2) ──
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      // 1. Tab filter
      if (activeTab === 'active' && policy.policyStatus !== 'Active') return false
      if (activeTab === 'historical' && policy.policyStatus !== 'Historical' && policy.policyStatus !== 'Expired')
        return false
      if (activeTab === 'new-business' && policy.transactionType !== 'New Business') return false
      if (activeTab === 'renewals' && policy.transactionType !== 'Renewal') return false
      if (activeTab === 'rewrites' && policy.transactionType !== 'Rewrite') return false
      if (activeTab === 'endorsements' && policy.transactionType !== 'Endorsement') return false
      if (activeTab === 'cancellations' && policy.transactionType !== 'Cancellation') return false
      if (activeTab === 'chargebacks' && policy.transactionType !== 'Chargeback') return false
      if (activeTab === 'adjustments' && policy.transactionType !== 'Adjustment') return false

      // 2. Carrier filter
      if (carrierFilter !== 'All' && policy.carrier !== carrierFilter) return false

      // 3. Line of business filter
      if (lobFilter !== 'All' && policy.lineOfBusiness !== lobFilter) return false

      // 4. Reconciliation filter
      if (reconciliationFilter !== 'All' && policy.reconciliationStatus !== reconciliationFilter) return false

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesPolicy = policy.policyNumber.toLowerCase().includes(q)
        const matchesClient = policy.clientName.toLowerCase().includes(q)
        const matchesBusiness = policy.businessName.toLowerCase().includes(q)
        const matchesCarrier = policy.carrier.toLowerCase().includes(q)
        const matchesLob = policy.lineOfBusiness.toLowerCase().includes(q)
        if (!matchesPolicy && !matchesClient && !matchesBusiness && !matchesCarrier && !matchesLob) {
          return false
        }
      }

      return true
    })
  }, [policies, activeTab, carrierFilter, lobFilter, reconciliationFilter, searchQuery])

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: policies.length,
      active: policies.filter((p) => p.policyStatus === 'Active').length,
      historical: policies.filter((p) => p.policyStatus === 'Historical' || p.policyStatus === 'Expired').length,
      'new-business': policies.filter((p) => p.transactionType === 'New Business').length,
      renewals: policies.filter((p) => p.transactionType === 'Renewal').length,
      rewrites: policies.filter((p) => p.transactionType === 'Rewrite').length,
      endorsements: policies.filter((p) => p.transactionType === 'Endorsement').length,
      cancellations: policies.filter((p) => p.transactionType === 'Cancellation').length,
      chargebacks: policies.filter((p) => p.transactionType === 'Chargeback').length,
      adjustments: policies.filter((p) => p.transactionType === 'Adjustment').length,
    }
  }, [policies])

  // Financial aggregates
  const financialTotals = useMemo(() => {
    return filteredPolicies.reduce(
      (acc, p) => {
        acc.totalPremium += p.premium
        acc.expectedCommission += p.expectedCommission
        acc.actualPaid += p.actualPaidCommission
        acc.outstanding += p.outstandingCommission
        return acc
      },
      { totalPremium: 0, expectedCommission: 0, actualPaid: 0, outstanding: 0 }
    )
  }, [filteredPolicies])

  // Export CSV helper
  function handleExportCsv() {
    const headers = [
      'Policy Number',
      'Client / Business',
      'Carrier',
      'Policy Status',
      'Line of Business',
      'Transaction Type',
      'Effective Date',
      'Expiry Date',
      'Premium',
      'Expected Commission',
      'Actual/Paid Commission',
      'Outstanding Commission',
      'Reconciliation Status',
    ]
    const rows = filteredPolicies.map((p) => [
      `"${p.policyNumber}"`,
      `"${p.clientName} - ${p.businessName}"`,
      `"${p.carrier}"`,
      `"${p.policyStatus}"`,
      `"${p.lineOfBusiness}"`,
      `"${p.transactionType}"`,
      `"${p.effectiveDate}"`,
      `"${p.expiryDate}"`,
      p.premium,
      p.expectedCommission,
      p.actualPaidCommission,
      p.outstandingCommission,
      `"${p.reconciliationStatus}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `BrokerStep_Policies_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Policies exported to CSV successfully.')
  }

  return (
    <div className="p-4 sm:p-7 max-w-[1680px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-[13px] font-medium text-white shadow-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ───── Header Bar (Matching Dashboard Header) ───── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 max-w-xl">
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Tuesday, October 8, 2026 · Book of Business
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Policies
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Common policy listing, lifecycle transaction tracking, commission reconciliation, and new business binding.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <CalendarDays className="size-4 text-slate-400" />
            <span>2026 Fiscal Year</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="size-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {/* 6.4 New Business Quick-Entry */}
          <button
            onClick={() => {
              setQuickEntryStep(1)
              setIsQuickEntryOpen(true)
            }}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 cursor-pointer dark:border-blue-500/30 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            <Zap className="size-4 text-blue-600 dark:text-blue-400" />
            <span>Quick-Entry</span>
          </button>
        </div>
      </div>

      {/* ───── Summary KPI Strip ───── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Book Premium</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ${financialTotals.totalPremium.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Across {filteredPolicies.length} listed policies
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Expected Commission</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">
            ${financialTotals.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Calculated projected revenue</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Actual / Paid Commission</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            ${financialTotals.actualPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Collected carrier statements</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-white/10 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Outstanding Commission</p>
          <p className={`mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight ${financialTotals.outstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
            ${financialTotals.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Uncollected / Pending variance</p>
        </div>
      </div>

      {/* ───── 6.2 Filter Tabs Bar ───── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {[
            { id: 'all', label: 'All Policies', count: tabCounts.all },
            { id: 'active', label: 'Active', count: tabCounts.active },
            { id: 'historical', label: 'Historical', count: tabCounts.historical },
            { id: 'new-business', label: 'New Business', count: tabCounts['new-business'] },
            { id: 'renewals', label: 'Renewals', count: tabCounts.renewals },
            { id: 'rewrites', label: 'Rewrites', count: tabCounts.rewrites },
            { id: 'endorsements', label: 'Endorsements', count: tabCounts.endorsements },
            { id: 'cancellations', label: 'Cancellations', count: tabCounts.cancellations },
            { id: 'chargebacks', label: 'Chargebacks', count: tabCounts.chargebacks },
            { id: 'adjustments', label: 'Adjustments', count: tabCounts.adjustments },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id as TabType)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-slate-950 text-white shadow-sm dark:bg-blue-600 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-white/20 text-white dark:bg-white/20 dark:text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ───── Search & Secondary Dropdown Filters ───── */}
        <div className="mt-3.5 flex flex-col gap-3 border-t border-slate-100 pt-3.5 lg:flex-row lg:items-center lg:justify-between dark:border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search policy #, client, business, carrier, or line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9.5 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-800/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Carrier Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Carrier:</span>
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Carriers</option>
                {carrierOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Line of Business Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">LOB:</span>
              <select
                value={lobFilter}
                onChange={(e) => setLobFilter(e.target.value)}
                className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Lines</option>
                {lineOfBusinessOptions.map((lob) => (
                  <option key={lob} value={lob}>
                    {lob}
                  </option>
                ))}
              </select>
            </div>

            {/* Reconciliation Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recon:</span>
              <select
                value={reconciliationFilter}
                onChange={(e) => setReconciliationFilter(e.target.value)}
                className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="All">All Statuses</option>
                <option value="Reconciled">Reconciled</option>
                <option value="Pending">Pending</option>
                <option value="Discrepancy">Discrepancy</option>
                <option value="Unmatched">Unmatched</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {(carrierFilter !== 'All' || lobFilter !== 'All' || reconciliationFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setCarrierFilter('All')
                  setLobFilter('All')
                  setReconciliationFilter('All')
                  setSearchQuery('')
                }}
                className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───── 6.1 Common Policy Listing Table ───── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden dark:border-white/10 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[160px]">Policy Number</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">Client / Business</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[150px]">Carrier</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[130px]">Policy Status</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[160px]">Line of Business</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[150px]">Transaction Type</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[110px]">Effective</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[110px]">Expiry</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[120px]">Premium</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[140px]">Expected Comm.</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[130px]">Actual/Paid</th>
                <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[130px]">Outstanding</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">Reconciliation</th>
                <th className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[210px] w-[210px] md:sticky md:right-0 md:z-20 bg-slate-50 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] select-none dark:bg-slate-950 dark:md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.5)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium dark:divide-white/5">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Shield className="mx-auto mb-2 size-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200">No policy records match your filters</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search criteria or filter options.</p>
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="group transition-colors hover:bg-blue-50/40 cursor-pointer dark:hover:bg-slate-800/40"
                      onClick={() => {
                        setSelectedPolicyForView(p)
                        setDetailTab('overview')
                      }}
                    >
                      {/* Policy Number */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {p.isPendingNumber || p.policyNumber === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/60">
                            <Clock className="size-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="font-semibold font-mono text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                            {p.policyNumber}
                          </span>
                        )}
                      </td>

                      {/* Client / Business */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="font-semibold text-slate-900 truncate dark:text-white">{p.clientName}</p>
                        <p className="text-xs text-slate-500 truncate dark:text-slate-400">{p.businessName}</p>
                      </td>

                      {/* Carrier */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Building2 className="size-3 text-slate-400" />
                          {p.carrier}
                        </span>
                      </td>

                      {/* Policy Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={p.policyStatus} />
                      </td>

                      {/* Line of Business */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 text-xs sm:text-sm dark:text-slate-300">
                        {p.lineOfBusiness}
                      </td>

                      {/* Transaction Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <TransactionBadge type={p.transactionType} />
                      </td>

                      {/* Effective Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-mono text-xs dark:text-slate-400">
                        {p.effectiveDate}
                      </td>

                      {/* Expiry Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-mono text-xs dark:text-slate-400">
                        {p.expiryDate}
                      </td>

                      {/* Premium */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-bold text-slate-900 font-mono dark:text-white">
                        ${p.premium.toLocaleString()}
                      </td>

                      {/* Expected Commission */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-bold text-blue-600 font-mono dark:text-blue-400">
                        ${p.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Actual/Paid Commission */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-semibold text-emerald-600 font-mono dark:text-emerald-400">
                        ${p.actualPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Outstanding */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono">
                        <span
                          className={`font-bold ${p.outstandingCommission > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
                            }`}
                        >
                          ${p.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Reconciliation Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <ReconciliationBadge status={p.reconciliationStatus} />
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[210px] w-[210px] md:sticky md:right-0 md:z-10 bg-white group-hover:bg-[#f8fafc] md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] transition-colors dark:bg-slate-900 dark:group-hover:bg-slate-850 dark:md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.5)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="View Policy Details (6.5)"
                            onClick={() => {
                              setSelectedPolicyForView(p)
                              setDetailTab('overview')
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap dark:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            <Eye className="size-4" />
                            View
                          </button>
                          <button
                            title="Edit Policy (6.3)"
                            onClick={() => handleOpenEdit(p)}
                            className="flex size-7.5 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                          >
                            <Edit3 className="size-4" />
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

        {/* Table Footer info */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500 dark:border-white/5 dark:bg-slate-950/40 dark:text-slate-400">
          <span>Showing {filteredPolicies.length} of {policies.length} total policies</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6.5 POLICY DETAILS DRAWER / MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedPolicyForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/75">
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6 dark:border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {selectedPolicyForView.policyNumber}
                  </h2>
                  <StatusBadge status={selectedPolicyForView.policyStatus} />
                  <TransactionBadge type={selectedPolicyForView.transactionType} />
                  <ReconciliationBadge status={selectedPolicyForView.reconciliationStatus} />
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedPolicyForView.clientName} · {selectedPolicyForView.businessName} · {selectedPolicyForView.carrier}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedPolicyForView)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setSelectedPolicyForView(null)}
                  className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* 6.5 Tab Bar */}
            <div className="flex border-b border-slate-100 bg-slate-50/60 px-5 sm:px-6 dark:border-white/10 dark:bg-slate-950/40">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'commission', label: 'Commission' },
                { id: 'transactions', label: 'Transactions' },
                { id: 'timeline', label: 'History / Timeline' },
                { id: 'statement', label: 'Source Statement' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as typeof detailTab)}
                  className={`border-b-2 px-4 py-3 text-[12.5px] font-semibold transition-all ${detailTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 max-h-[calc(92vh-180px)]">
              {/* 1. OVERVIEW TAB */}
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Premium</p>
                      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                        ${selectedPolicyForView.premium.toLocaleString()}
                      </p>
                      <p className="text-[10.5px] text-slate-400 dark:text-slate-500">Annualized</p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/30">
                      <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Expected Comm.</p>
                      <p className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">
                        ${selectedPolicyForView.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10.5px] text-blue-500 dark:text-blue-300">
                        {selectedPolicyForView.commissionRate}% rate @ {selectedPolicyForView.brokerSplit}% split
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                      <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Actual Paid</p>
                      <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${selectedPolicyForView.actualPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10.5px] text-emerald-500 dark:text-emerald-300">Received MTD</p>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/30">
                      <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Outstanding</p>
                      <p className="mt-1 text-xl font-bold text-amber-600 dark:text-amber-400">
                        ${selectedPolicyForView.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10.5px] text-amber-500 dark:text-amber-300">Unsettled amount</p>
                    </div>
                  </div>

                  {/* Policy Information Grid */}
                  <div className="rounded-xl border border-slate-200/80 p-4 space-y-4 dark:border-white/10 dark:bg-slate-950/30">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Policy Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                      <div>
                        <span className="text-slate-400">Carrier:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPolicyForView.carrier}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Line of Business:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPolicyForView.lineOfBusiness}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Transaction Type:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPolicyForView.transactionType}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Effective Date:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{selectedPolicyForView.effectiveDate}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Expiration Date:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">{selectedPolicyForView.expiryDate}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Reconciliation:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPolicyForView.reconciliationStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Policy Owner / Client Details */}
                  <div className="rounded-xl border border-slate-200/80 p-4 space-y-3 dark:border-white/10 dark:bg-slate-950/30">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Client / Business Information
                      </h3>
                      <Link
                        href="/broker/clients"
                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View in Clients Module <ArrowUpRight className="size-3" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-slate-400">Client Name:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPolicyForView.clientName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Business / Entity:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPolicyForView.businessName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{selectedPolicyForView.clientEmail}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedPolicyForView.clientPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedPolicyForView.notes && (
                    <div className="rounded-xl border border-slate-200/80 p-4 dark:border-white/10 dark:bg-slate-950/30">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Notes & Remarks
                      </h3>
                      <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedPolicyForView.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. COMMISSION TAB */}
              {detailTab === 'commission' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-200/80 p-5 space-y-4 bg-slate-50/50 dark:border-white/10 dark:bg-slate-950/40">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Commission Breakdown & Split Math
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Premium Base</span>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white font-mono">
                          ${selectedPolicyForView.premium.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Carrier Commission Rate</span>
                        <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {selectedPolicyForView.commissionRate}%
                        </p>
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                          Gross: ${((selectedPolicyForView.premium * selectedPolicyForView.commissionRate) / 100).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Broker Split Tier</span>
                        <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {selectedPolicyForView.brokerSplit}%
                        </p>
                        <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                          Net: ${selectedPolicyForView.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 p-5 space-y-3 dark:border-white/10 dark:bg-slate-950/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Reconciliation State
                    </h4>
                    <div className="flex items-center gap-3">
                      <ReconciliationBadge status={selectedPolicyForView.reconciliationStatus} />
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {selectedPolicyForView.reconciliationStatus === 'Reconciled' &&
                          'Carrier statement matches expected commission 100%.'}
                        {selectedPolicyForView.reconciliationStatus === 'Discrepancy' &&
                          `Variance detected: $${selectedPolicyForView.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining.`}
                        {selectedPolicyForView.reconciliationStatus === 'Pending' &&
                          'Awaiting carrier statement submission for reconciliation.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TRANSACTIONS TAB */}
              {detailTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Transaction-Level History
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedPolicyForView.transactions.length} record(s)
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                    <table className="w-full min-w-[880px] text-left text-[12px]">
                      <thead className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold uppercase text-slate-500 whitespace-nowrap dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
                        <tr className="whitespace-nowrap">
                          <th className="px-3.5 py-2.5 whitespace-nowrap min-w-[90px]">Date</th>
                          <th className="px-3.5 py-2.5 whitespace-nowrap min-w-[110px]">Type</th>
                          <th className="px-3.5 py-2.5 whitespace-nowrap min-w-[180px]">Description</th>
                          <th className="px-3.5 py-2.5 whitespace-nowrap min-w-[110px]">Statement #</th>
                          <th className="px-3.5 py-2.5 whitespace-nowrap text-right min-w-[100px]">Premium Δ</th>
                          <th className="px-3.5 py-2.5 whitespace-nowrap text-right min-w-[100px]">Expected</th>
                          <th className="px-3.5 py-2.5 whitespace-nowrap text-right min-w-[110px]">Actual Paid</th>
                          <th className="px-3.5 py-2.5 whitespace-nowrap text-right min-w-[110px]">Outstanding</th>
                          <th className="px-3.5 py-2.5 whitespace-nowrap min-w-[110px]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {selectedPolicyForView.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{tx.date}</td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <TransactionBadge type={tx.type} />
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-800 dark:text-slate-200">{tx.description}</td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {tx.statementNumber || '—'}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                              ${tx.premiumChange.toLocaleString()}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              ${tx.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              ${tx.actualPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                              ${tx.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <ReconciliationBadge status={tx.reconciliationStatus} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. TIMELINE TAB */}
              {detailTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Policy Lifecycle & Audit Timeline
                  </h3>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {selectedPolicyForView.timeline.map((event) => (
                      <div key={event.id} className="relative group">
                        <div className="absolute -left-6 top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{event.title}</p>
                            <span className="text-[10.5px] text-slate-400 dark:text-slate-500 font-mono">{event.date}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{event.detail}</p>
                          <p className="mt-0.5 text-[10.5px] font-medium text-slate-400 dark:text-slate-500">By {event.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. SOURCE STATEMENT TAB */}
              {detailTab === 'statement' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Source Commission Statement Link
                  </h3>
                  {selectedPolicyForView.sourceStatementNumber ? (
                    <div className="rounded-xl border border-slate-200 p-5 bg-white space-y-4 shadow-sm dark:border-white/10 dark:bg-slate-950/40">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60">
                            <FileSpreadsheet className="size-5" />
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">
                              Statement #{selectedPolicyForView.sourceStatementNumber}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Carrier: {selectedPolicyForView.sourceStatementCarrier || selectedPolicyForView.carrier} · Date: {selectedPolicyForView.sourceStatementDate || 'Current period'}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60">
                          Reconciled Batch
                        </span>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed dark:bg-slate-900 dark:text-slate-300">
                        This policy transaction was matched and validated against carrier batch statement{' '}
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">{selectedPolicyForView.sourceStatementNumber}</span>.
                      </div>

                      <Link
                        href="/broker/statements"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Open Carrier Statement Module</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 dark:border-white/10 dark:text-slate-500">
                      <FileSpreadsheet className="mx-auto mb-2 size-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">No Carrier Statement Linked Yet</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        Statement link will appear automatically when the carrier statement is imported and reconciled.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6.3 ADD / EDIT POLICY MODAL (FORM)
      ───────────────────────────────────────────────────────────── */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/75">
          <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {editingPolicy ? 'Edit Policy' : 'Add New Policy'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure policy terms, carrier underwriting information, and commission splits.
                </p>
              </div>
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
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
                    <span>+ New Client Record</span>
                  </Link>
                </div>

                {/* Selected Client Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white p-3 shadow-xs dark:border-blue-900/50 dark:bg-slate-900">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm ring-2 ring-blue-500/20">
                      {(policyForm.clientName || 'CL')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {policyForm.clientName || 'Select Client'}
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
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-white/10 dark:text-white"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                    Policy Number (Manual or Pending)
                  </label>
                  <input
                    type="text"
                    placeholder={policyForm.isPendingNumber ? 'Pending from carrier' : 'e.g., POL-TRV-89421'}
                    disabled={policyForm.isPendingNumber}
                    value={policyForm.policyNumber}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-950 dark:disabled:text-slate-600"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                    Policy Status *
                  </label>
                  <select
                    value={policyForm.policyStatus}
                    onChange={(e) => setPolicyForm({ ...policyForm, policyStatus: e.target.value as PolicyStatus })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                    Line of Business *
                  </label>
                  <select
                    value={policyForm.lineOfBusiness}
                    onChange={(e) => setPolicyForm({ ...policyForm, lineOfBusiness: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                  >
                    {lineOfBusinessOptions.map((lob) => (
                      <option key={lob} value={lob}>
                        {lob}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                    Transaction Type *
                  </label>
                  <select
                    value={policyForm.transactionType}
                    onChange={(e) => setPolicyForm({ ...policyForm, transactionType: e.target.value as TransactionType })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    value={policyForm.effectiveDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={policyForm.expiryDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, expiryDate: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Financial Section: Premium, Rate %, Split % */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-4 dark:border-white/10 dark:bg-slate-950/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Financial Terms & Commission Calculation
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                      Premium ($) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={policyForm.premium}
                      onChange={(e) => setPolicyForm({ ...policyForm, premium: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                      Carrier Commission Rate (%) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={policyForm.commissionRate}
                      onChange={(e) => setPolicyForm({ ...policyForm, commissionRate: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                      Broker / Brokerage Split (%) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={policyForm.brokerSplit}
                      onChange={(e) => setPolicyForm({ ...policyForm, brokerSplit: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Live Calculated Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-slate-200 pt-3 dark:border-white/10">
                  <div className="rounded-lg bg-blue-50/70 p-3 dark:bg-blue-950/40">
                    <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">Expected Commission (Calculated)</span>
                    <p className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300 font-mono">
                      ${calculatedExpectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 dark:text-slate-300">
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
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="rounded-lg bg-amber-50/70 p-3 dark:bg-amber-950/40">
                    <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Outstanding (Calculated)</span>
                    <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300 font-mono">
                      ${calculatedOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Underwriting remarks, special endorsements, or renewal reminders..."
                  value={policyForm.notes}
                  onChange={(e) => setPolicyForm({ ...policyForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-950/15 hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {editingPolicy ? 'Update Policy' : 'Save & Add Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6.4 NEW BUSINESS QUICK-ENTRY FLOW (STEP-BY-STEP)
      ───────────────────────────────────────────────────────────── */}
      {isQuickEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/75">
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10">
            {/* Header */}
            <div className="border-b border-slate-100 p-5 sm:p-6 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:ring-blue-800/60">
                    <Zap className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                      New Business Quick-Entry Flow
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Guided 10-step wizard to bind new business into Book of Business
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuickEntryOpen(false)}
                  className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-[11px] ${quickEntryStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                  >
                    1
                  </span>
                  <span className={quickEntryStep === 1 ? 'text-blue-600 font-bold dark:text-blue-400' : ''}>Client & Carrier</span>
                </div>
                <div className="h-0.5 flex-1 mx-3 bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-[11px] ${quickEntryStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                  >
                    2
                  </span>
                  <span className={quickEntryStep === 2 ? 'text-blue-600 font-bold dark:text-blue-400' : ''}>Policy & Dates</span>
                </div>
                <div className="h-0.5 flex-1 mx-3 bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-[11px] ${quickEntryStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                  >
                    3
                  </span>
                  <span className={quickEntryStep === 3 ? 'text-blue-600 font-bold dark:text-blue-400' : ''}>Commission & Bind</span>
                </div>
              </div>
            </div>

            {/* Wizard Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* STEP 1: Select Client & Carrier */}
              {quickEntryStep === 1 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-blue-50/60 p-3 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    Step 1 of 3: Select an existing client record or identify the policy owner entity.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                      1. Select Existing Client or Business *
                    </label>
                    <select
                      value={quickForm.clientId}
                      onChange={(e) => {
                        const sel = initialClients.find((c) => c.id === e.target.value)
                        if (sel) {
                          setQuickForm({
                            ...quickForm,
                            clientId: sel.id,
                            clientName: sel.name,
                            businessName: sel.businessName,
                            clientEmail: sel.email,
                            clientPhone: sel.phone,
                          })
                        }
                      }}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                    >
                      {initialClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.businessName} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                      2. Select Carrier / Underwriter *
                    </label>
                    <select
                      value={quickForm.carrier}
                      onChange={(e) => setQuickForm({ ...quickForm, carrier: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                    >
                      {carrierOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                      3. Select Line of Business *
                    </label>
                    <select
                      value={quickForm.lineOfBusiness}
                      onChange={(e) => setQuickForm({ ...quickForm, lineOfBusiness: e.target.value })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                    >
                      {lineOfBusinessOptions.map((lob) => (
                        <option key={lob} value={lob}>
                          {lob}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Policy Number & Dates & Premium */}
              {quickEntryStep === 2 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-blue-50/60 p-3 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    Step 2 of 3: Enter coverage schedule and premium amount.
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                        Policy Number
                      </label>
                      <input
                        type="text"
                        placeholder={quickForm.isPendingNumber ? 'Pending from carrier' : 'e.g., POL-TRV-99001'}
                        disabled={quickForm.isPendingNumber}
                        value={quickForm.policyNumber}
                        onChange={(e) => setQuickForm({ ...quickForm, policyNumber: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-950 dark:disabled:text-slate-600"
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={quickForm.isPendingNumber}
                          onChange={(e) => setQuickForm({ ...quickForm, isPendingNumber: e.target.checked })}
                          className="size-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Policy Number Pending</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                        Effective Date *
                      </label>
                      <input
                        type="date"
                        value={quickForm.effectiveDate}
                        onChange={(e) => setQuickForm({ ...quickForm, effectiveDate: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                        Expiration Date *
                      </label>
                      <input
                        type="date"
                        value={quickForm.expiryDate}
                        onChange={(e) => setQuickForm({ ...quickForm, expiryDate: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                      Annual Premium ($) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={quickForm.premium}
                      onChange={(e) => setQuickForm({ ...quickForm, premium: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Commission Settings & Final Review */}
              {quickEntryStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-blue-50/60 p-3 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    Step 3 of 3: Apply commission terms and verify calculated expected revenue.
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                        Carrier Commission Rate (%) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        value={quickForm.commissionRate}
                        onChange={(e) => setQuickForm({ ...quickForm, commissionRate: parseFloat(e.target.value) || 0 })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                        Broker Split (%) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        value={quickForm.brokerSplit}
                        onChange={(e) => setQuickForm({ ...quickForm, brokerSplit: parseFloat(e.target.value) || 0 })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Live Calculation Preview Card */}
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-4 space-y-3 dark:border-blue-900/40 dark:from-blue-950/40 dark:to-indigo-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        Calculated Expected Commission
                      </span>
                      <span className="text-xl font-bold text-blue-700 dark:text-blue-400 font-mono">
                        ${quickExpectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11.5px] text-slate-600 border-t border-blue-200/60 pt-2 dark:text-slate-400 dark:border-blue-800/40">
                      <div>
                        Client: <span className="font-semibold text-slate-900 dark:text-white">{quickForm.clientName}</span>
                      </div>
                      <div>
                        Carrier: <span className="font-semibold text-slate-900 dark:text-white">{quickForm.carrier}</span>
                      </div>
                      <div>
                        Line: <span className="font-semibold text-slate-900 dark:text-white">{quickForm.lineOfBusiness}</span>
                      </div>
                      <div>
                        Premium: <span className="font-semibold text-slate-900 dark:text-white font-mono">${quickForm.premium.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 dark:text-slate-300">
                      Binding Remarks / Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Notes regarding binder letter, carrier agreement, or policy notes..."
                      value={quickForm.notes}
                      onChange={(e) => setQuickForm({ ...quickForm, notes: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 p-4 sm:p-5 dark:border-white/10">
              {quickEntryStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setQuickEntryStep((s) => s - 1)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {quickEntryStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setQuickEntryStep((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <span>Continue</span>
                  <ChevronRight className="size-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteQuickEntry}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
                >
                  <Check className="size-4" />
                  <span>Save Policy & Add to Book</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BADGE COMPONENTS
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PolicyStatus }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    )
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/60">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Pending
      </span>
    )
  }
  if (status === 'Under Review') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800/60">
        Under Review
      </span>
    )
  }
  if (status === 'Cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800/60">
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10">
      {status}
    </span>
  )
}

function TransactionBadge({ type }: { type: TransactionType }) {
  const styles: Record<TransactionType, string> = {
    'New Business': 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800/60',
    Renewal: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60',
    Rewrite: 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:ring-purple-800/60',
    Endorsement: 'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:ring-cyan-800/60',
    Cancellation: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800/60',
    Chargeback: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-800/60',
    Adjustment: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/60',
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ${styles[type] || 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10'
        }`}
    >
      {type}
    </span>
  )
}

function ReconciliationBadge({ status }: { status: ReconciliationStatus }) {
  if (status === 'Reconciled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60">
        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
        Reconciled
      </span>
    )
  }
  if (status === 'Discrepancy') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800/60">
        <AlertTriangle className="size-3.5 text-rose-600 dark:text-rose-400" />
        Discrepancy
      </span>
    )
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800/60">
        <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
        Pending
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10">
      Unmatched
    </span>
  )
}
