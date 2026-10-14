'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Shield,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
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
  ChevronRight,
  ChevronLeft,
  X,
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
  BarChart3,
  PieChart,
  FileUp,
  CheckCheck,
  RefreshCw,
  FolderArchive,
  Workflow,
  SlidersHorizontal,
  BadgeAlert,
  Percent,
  Briefcase,
  Layers2,
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

// ── Types ──
type BookTabType = 'overview' | 'active' | 'historical' | 'import' | 'analytics' | 'drilldown'

interface ImportRow {
  id: string
  rawPolicyNumber: string
  rawClientName: string
  rawCarrier: string
  rawLineOfBusiness: string
  rawPremium: number
  rawEffectiveDate: string
  rawExpiryDate: string
  rawCommissionRate: number
  rawBrokerSplit: number
  isValid: boolean
  isDuplicate: boolean
  validationNotes: string[]
  status: 'Ready' | 'Warning' | 'Error' | 'Skipped'
}

export default function BookOfBusinessPage() {
  // ── Master State ──
  const [policies, setPolicies] = useState<PolicyRecord[]>(initialPolicies)
  const [activeTab, setActiveTab] = useState<BookTabType>('active')

  // Sync URL query params with active tab
  useEffect(() => {
    function applyUrlParams(searchStr?: string) {
      if (typeof window === 'undefined') return
      const query = searchStr !== undefined ? searchStr : window.location.search
      const params = new URLSearchParams(query)
      const tab = params.get('tab') as BookTabType | null
      if (tab) {
        setActiveTab(tab)
      } else {
        setActiveTab('active')
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

  const handleTabSelect = (tabId: BookTabType) => {
    setActiveTab(tabId)
    const newHref = tabId === 'overview' ? '/broker/book-of-business' : `/broker/book-of-business?tab=${tabId}`
    const targetSearch = tabId === 'overview' ? '' : `?tab=${tabId}`
    window.history.pushState(null, '', newHref)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: newHref, search: targetSearch, pathname: '/broker/book-of-business' },
      })
    )
  }

  // ── Toast Notifications ──
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // ── 7.6 Common Filter State ──
  const [searchQuery, setSearchQuery] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [lobFilter, setLobFilter] = useState('All')
  const [txTypeFilter, setTxTypeFilter] = useState('All')
  const [reconFilter, setReconFilter] = useState('All')
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | '2026' | 'q1' | 'q2' | 'q3' | 'q4'>('all')
  const [shortPaidOnly, setShortPaidOnly] = useState(false)

  // ── Modals & Drawers ──
  const [selectedPolicyForDrawer, setSelectedPolicyForDrawer] = useState<PolicyRecord | null>(null)
  const [drawerTab, setDrawerTab] = useState<'overview' | 'commission' | 'transactions' | 'timeline'>('overview')

  // ── 7.6 Multi-Level Drill-Down State ──
  // Hierarchy: Outstanding Commission -> Carrier -> Line of Business -> Client -> Policy -> Transaction -> Statement
  const [drillLevel, setDrillLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
  const [selectedDrillCarrier, setSelectedDrillCarrier] = useState<string | null>(null)
  const [selectedDrillLob, setSelectedDrillLob] = useState<string | null>(null)
  const [selectedDrillClient, setSelectedDrillClient] = useState<string | null>(null)
  const [selectedDrillPolicyId, setSelectedDrillPolicyId] = useState<string | null>(null)
  const [selectedDrillTxId, setSelectedDrillTxId] = useState<string | null>(null)

  // ── 7.4 Import Wizard State (7/8 Steps) ──
  const [importStep, setImportStep] = useState<number>(1)
  const [uploadedFileName, setUploadedFileName] = useState<string>('Broker_Book_Import_Q4_2026.xlsx')
  const [parsedRows, setParsedRows] = useState<ImportRow[]>([
    {
      id: 'imp-1',
      rawPolicyNumber: 'POL-TRV-89421',
      rawClientName: 'Apex Logistics Corp (Marcus Vance)',
      rawCarrier: 'Travelers',
      rawLineOfBusiness: 'Commercial Auto',
      rawPremium: 34200,
      rawEffectiveDate: '2026-10-12',
      rawExpiryDate: '2027-10-12',
      rawCommissionRate: 15,
      rawBrokerSplit: 70,
      isValid: true,
      isDuplicate: true,
      validationNotes: ['Policy number matches existing active record. Will update/version.'],
      status: 'Warning',
    },
    {
      id: 'imp-2',
      rawPolicyNumber: 'POL-HFD-99412',
      rawClientName: 'Beacon Peak Roasters',
      rawCarrier: 'The Hartford',
      rawLineOfBusiness: 'Business Owners (BOP)',
      rawPremium: 14800,
      rawEffectiveDate: '2026-11-01',
      rawExpiryDate: '2027-11-01',
      rawCommissionRate: 15,
      rawBrokerSplit: 70,
      isValid: true,
      isDuplicate: false,
      validationNotes: ['Clean record. Field mapping validated 100%.'],
      status: 'Ready',
    },
    {
      id: 'imp-3',
      rawPolicyNumber: 'POL-CHB-78219',
      rawClientName: 'Solstice Biopharma Ltd',
      rawCarrier: 'Chubb',
      rawLineOfBusiness: 'Products Liability',
      rawPremium: 58000,
      rawEffectiveDate: '2026-11-15',
      rawExpiryDate: '2027-11-15',
      rawCommissionRate: 14,
      rawBrokerSplit: 75,
      isValid: true,
      isDuplicate: false,
      validationNotes: ['Premium exceeds $50K tier. Split tier verified.'],
      status: 'Ready',
    },
    {
      id: 'imp-4',
      rawPolicyNumber: 'POL-LIB-33901',
      rawClientName: 'Oakhaven Civil Engineers',
      rawCarrier: 'Liberty Mutual',
      rawLineOfBusiness: 'Professional Liability (E&O)',
      rawPremium: 22400,
      rawEffectiveDate: '2026-10-01',
      rawExpiryDate: '2027-10-01',
      rawCommissionRate: 15,
      rawBrokerSplit: 70,
      isValid: true,
      isDuplicate: false,
      validationNotes: ['Clean record. Ready for binding.'],
      status: 'Ready',
    },
    {
      id: 'imp-5',
      rawPolicyNumber: 'POL-PGR-10492',
      rawClientName: 'Highline Express Couriers',
      rawCarrier: 'Progressive',
      rawLineOfBusiness: 'Commercial Auto',
      rawPremium: 31000,
      rawEffectiveDate: '2026-12-01',
      rawExpiryDate: '2027-12-01',
      rawCommissionRate: 14,
      rawBrokerSplit: 70,
      isValid: true,
      isDuplicate: false,
      validationNotes: ['Valid commercial fleet policy.'],
      status: 'Ready',
    },
  ])

  // Field mappings state (Source -> BrokerStep target)
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({
    'Source Policy #': 'policyNumber',
    'Insured / Client Name': 'clientName',
    'Insurance Carrier': 'carrier',
    'Coverage / Line of Business': 'lineOfBusiness',
    'Annualized Premium ($)': 'premium',
    'Inception / Effective Date': 'effectiveDate',
    'Term Expiration Date': 'expiryDate',
    'Carrier Commission Rate %': 'commissionRate',
    'Broker Split Tier %': 'brokerSplit',
  })

  // ── 7.1 Aggregate Calculations ──
  const activePolicies = useMemo(() => {
    return policies.filter((p) => p.policyStatus === 'Active' || p.policyStatus === 'Pending' || p.policyStatus === 'Under Review')
  }, [policies])

  const historicalPolicies = useMemo(() => {
    return policies.filter((p) => p.policyStatus === 'Historical' || p.policyStatus === 'Expired' || p.policyStatus === 'Cancelled')
  }, [policies])

  // Financial aggregates
  const financialMetrics = useMemo(() => {
    const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0)
    const expectedCommission = policies.reduce((sum, p) => sum + p.expectedCommission, 0)
    const actualPaidCommission = policies.reduce((sum, p) => sum + p.actualPaidCommission, 0)
    const outstandingCommission = policies.reduce((sum, p) => sum + p.outstandingCommission, 0)

    // Short-paid / partial policies (Discrepancy where expected > actual and actual > 0)
    const partialPaidPolicies = policies.filter((p) => p.actualPaidCommission > 0 && p.actualPaidCommission < p.expectedCommission)
    const partialShortPaidAmount = partialPaidPolicies.reduce((sum, p) => sum + p.outstandingCommission, 0)

    return {
      totalPremium,
      expectedCommission,
      actualPaidCommission,
      outstandingCommission,
      partialShortPaidAmount,
      partialPaidCount: partialPaidPolicies.length,
    }
  }, [policies])

  // 7.1 Lifecycle Transaction Breakdown
  const lifecycleBreakdown = useMemo(() => {
    const types: TransactionType[] = [
      'New Business',
      'Renewal',
      'Rewrite',
      'Endorsement',
      'Cancellation',
      'Chargeback',
      'Adjustment',
    ]

    return types.map((type) => {
      const matchingPolicies = policies.filter((p) => p.transactionType === type)
      const count = matchingPolicies.length
      const premiumSum = matchingPolicies.reduce((sum, p) => sum + p.premium, 0)
      const expectedCommSum = matchingPolicies.reduce((sum, p) => sum + p.expectedCommission, 0)
      const actualPaidSum = matchingPolicies.reduce((sum, p) => sum + p.actualPaidCommission, 0)
      const outstandingSum = matchingPolicies.reduce((sum, p) => sum + p.outstandingCommission, 0)

      return {
        type,
        count,
        premiumSum,
        expectedCommSum,
        actualPaidSum,
        outstandingSum,
      }
    })
  }, [policies])

  // ── Filtered Policy Lists ──
  const filteredActivePolicies = useMemo(() => {
    return activePolicies.filter((p) => {
      if (carrierFilter !== 'All' && p.carrier !== carrierFilter) return false
      if (lobFilter !== 'All' && p.lineOfBusiness !== lobFilter) return false
      if (txTypeFilter !== 'All' && p.transactionType !== txTypeFilter) return false
      if (reconFilter !== 'All' && p.reconciliationStatus !== reconFilter) return false
      if (shortPaidOnly && (p.actualPaidCommission === 0 || p.actualPaidCommission >= p.expectedCommission)) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesNum = p.policyNumber.toLowerCase().includes(q)
        const matchesClient = p.clientName.toLowerCase().includes(q)
        const matchesBiz = p.businessName.toLowerCase().includes(q)
        const matchesCarrier = p.carrier.toLowerCase().includes(q)
        const matchesLob = p.lineOfBusiness.toLowerCase().includes(q)
        if (!matchesNum && !matchesClient && !matchesBiz && !matchesCarrier && !matchesLob) return false
      }
      return true
    })
  }, [activePolicies, carrierFilter, lobFilter, txTypeFilter, reconFilter, shortPaidOnly, searchQuery])

  const filteredHistoricalPolicies = useMemo(() => {
    return historicalPolicies.filter((p) => {
      if (carrierFilter !== 'All' && p.carrier !== carrierFilter) return false
      if (lobFilter !== 'All' && p.lineOfBusiness !== lobFilter) return false
      if (txTypeFilter !== 'All' && p.transactionType !== txTypeFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesNum = p.policyNumber.toLowerCase().includes(q)
        const matchesClient = p.clientName.toLowerCase().includes(q)
        const matchesBiz = p.businessName.toLowerCase().includes(q)
        const matchesCarrier = p.carrier.toLowerCase().includes(q)
        const matchesLob = p.lineOfBusiness.toLowerCase().includes(q)
        if (!matchesNum && !matchesClient && !matchesBiz && !matchesCarrier && !matchesLob) return false
      }
      return true
    })
  }, [historicalPolicies, carrierFilter, lobFilter, txTypeFilter, searchQuery])

  // ── 7.6 Drill-Down Data Engine ──
  // Policies with outstanding commission
  const outstandingPolicies = useMemo(() => {
    return policies.filter((p) => p.outstandingCommission > 0)
  }, [policies])

  // Level 1: Outstanding by Carrier
  const carrierDrillSummary = useMemo(() => {
    const map = new Map<string, { carrier: string; totalOutstanding: number; policyCount: number }>()
    outstandingPolicies.forEach((p) => {
      const cur = map.get(p.carrier) || { carrier: p.carrier, totalOutstanding: 0, policyCount: 0 }
      cur.totalOutstanding += p.outstandingCommission
      cur.policyCount += 1
      map.set(p.carrier, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.totalOutstanding - a.totalOutstanding)
  }, [outstandingPolicies])

  // Level 2: Line of Business under selected Carrier
  const lobDrillSummary = useMemo(() => {
    if (!selectedDrillCarrier) return []
    const matching = outstandingPolicies.filter((p) => p.carrier === selectedDrillCarrier)
    const map = new Map<string, { lob: string; totalOutstanding: number; policyCount: number }>()
    matching.forEach((p) => {
      const cur = map.get(p.lineOfBusiness) || { lob: p.lineOfBusiness, totalOutstanding: 0, policyCount: 0 }
      cur.totalOutstanding += p.outstandingCommission
      cur.policyCount += 1
      map.set(p.lineOfBusiness, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.totalOutstanding - a.totalOutstanding)
  }, [outstandingPolicies, selectedDrillCarrier])

  // Level 3: Clients under Carrier & LOB
  const clientDrillSummary = useMemo(() => {
    if (!selectedDrillCarrier || !selectedDrillLob) return []
    const matching = outstandingPolicies.filter(
      (p) => p.carrier === selectedDrillCarrier && p.lineOfBusiness === selectedDrillLob
    )
    const map = new Map<string, { clientName: string; businessName: string; totalOutstanding: number; policyCount: number }>()
    matching.forEach((p) => {
      const cur = map.get(p.clientName) || {
        clientName: p.clientName,
        businessName: p.businessName,
        totalOutstanding: 0,
        policyCount: 0,
      }
      cur.totalOutstanding += p.outstandingCommission
      cur.policyCount += 1
      map.set(p.clientName, cur)
    })
    return Array.from(map.values()).sort((a, b) => b.totalOutstanding - a.totalOutstanding)
  }, [outstandingPolicies, selectedDrillCarrier, selectedDrillLob])

  // Level 4: Policies under Client
  const policyDrillList = useMemo(() => {
    if (!selectedDrillCarrier || !selectedDrillLob || !selectedDrillClient) return []
    return outstandingPolicies.filter(
      (p) =>
        p.carrier === selectedDrillCarrier &&
        p.lineOfBusiness === selectedDrillLob &&
        p.clientName === selectedDrillClient
    )
  }, [outstandingPolicies, selectedDrillCarrier, selectedDrillLob, selectedDrillClient])

  // Level 5: Transactions for selected policy
  const drillPolicyRecord = useMemo(() => {
    if (!selectedDrillPolicyId) return null
    return policies.find((p) => p.id === selectedDrillPolicyId) || null
  }, [policies, selectedDrillPolicyId])

  // Level 6: Selected Transaction & Source Statement voucher
  const drillTransaction = useMemo(() => {
    if (!drillPolicyRecord || !selectedDrillTxId) return null
    return drillPolicyRecord.transactions.find((t) => t.id === selectedDrillTxId) || null
  }, [drillPolicyRecord, selectedDrillTxId])

  // ── Import Execution Handler (Step 7 -> 8) ──
  function handleExecuteImport() {
    // Generate new policy records from the valid parsed rows
    const newPolicies: PolicyRecord[] = parsedRows
      .filter((r) => r.status === 'Ready' || r.status === 'Warning')
      .map((r, idx) => {
        const expected = Math.round(((r.rawPremium * r.rawCommissionRate) / 100) * (r.rawBrokerSplit / 100) * 100) / 100
        return {
          id: `pol-imp-${Date.now()}-${idx}`,
          policyNumber: r.rawPolicyNumber,
          clientId: `cli-imp-${idx}`,
          clientName: r.rawClientName.split('(')[0].trim(),
          businessName: r.rawClientName,
          clientEmail: 'contact@clientcompany.com',
          clientPhone: '+1 (555) 700-100' + idx,
          carrier: r.rawCarrier,
          policyStatus: 'Active',
          lineOfBusiness: r.rawLineOfBusiness,
          transactionType: 'New Business',
          effectiveDate: r.rawEffectiveDate,
          expiryDate: r.rawExpiryDate,
          premium: r.rawPremium,
          commissionRate: r.rawCommissionRate,
          brokerSplit: r.rawBrokerSplit,
          expectedCommission: expected,
          actualPaidCommission: 0,
          outstandingCommission: expected,
          reconciliationStatus: 'Pending',
          notes: `Imported via Bulk Book of Business Wizard on ${new Date().toLocaleDateString()}. Source file: ${uploadedFileName}`,
          transactions: [
            {
              id: `tx-imp-${Date.now()}-${idx}`,
              date: r.rawEffectiveDate,
              type: 'New Business',
              description: 'Initial import & binding',
              premiumChange: r.rawPremium,
              expectedCommission: expected,
              actualPaid: 0,
              outstanding: expected,
              reconciliationStatus: 'Pending',
            },
          ],
          timeline: [
            {
              id: `tl-imp-${Date.now()}-${idx}`,
              title: 'Imported into Book of Business',
              type: 'creation',
              date: new Date().toLocaleString(),
              detail: `Imported from ${uploadedFileName}. Initial binder created.`,
              actor: 'Jordan Taylor (Broker)',
            },
          ],
        }
      })

    // Merge into state (avoiding exact duplicates by updating or appending)
    setPolicies((prev) => {
      const existingMap = new Map(prev.map((p) => [p.policyNumber, p]))
      newPolicies.forEach((np) => {
        existingMap.set(np.policyNumber, np)
      })
      return Array.from(existingMap.values())
    })

    setImportStep(8)
    showToast(`Successfully imported ${newPolicies.length} policies into your Book of Business!`)
  }

  // Export CSV Helper
  function handleExportBookCsv() {
    const target = activeTab === 'historical' ? filteredHistoricalPolicies : filteredActivePolicies
    const headers = [
      'Policy Number',
      'Client Name',
      'Business Entity',
      'Carrier',
      'Line of Business',
      'Status',
      'Transaction Type',
      'Effective Date',
      'Expiry Date',
      'Annual Premium',
      'Expected Commission',
      'Actual Paid Commission',
      'Outstanding Commission',
      'Reconciliation Status',
    ]

    const rows = target.map((p) => [
      `"${p.policyNumber}"`,
      `"${p.clientName}"`,
      `"${p.businessName}"`,
      `"${p.carrier}"`,
      `"${p.lineOfBusiness}"`,
      `"${p.policyStatus}"`,
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
    link.setAttribute('download', `BrokerStep_BookOfBusiness_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Book of Business records exported to CSV successfully.')
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

      {/* ───── Header Bar (Matching Policies/Dashboard Header) ───── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 max-w-xl">
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Tuesday, October 8, 2026 · Broker Portal
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Book of Business
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] text-slate-500 leading-relaxed">
            Portfolio management, active &amp; historical policy ledgers, bulk data import, commission reconciliation, and multi-tier drill-down analytics.
          </p>
        </div>

        {/* 4 Header Action Buttons in 1 Row without wrapping */}
        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer">
            <CalendarDays className="size-4 text-slate-400" />
            <span>2026 Fiscal Year</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          <button
            onClick={handleExportBookCsv}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <Download className="size-4 text-slate-400" />
            <span>Export Book</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import')
              setImportStep(1)
            }}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 cursor-pointer"
          >
            <FileUp className="size-4 text-blue-600" />
            <span>Import Book</span>
          </button>


        </div>
      </div>

      {/* ───── Primary Tab Navigation Bar (Matching Policies Page Style) ───── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {[
            { id: 'active', label: 'Active Book', count: activePolicies.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id as BookTabType)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>


      </div>



      {/* ─────────────────────────────────────────────────────────────
          7.2 ACTIVE BOOK TAB
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[1520px] text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="min-w-[160px] whitespace-nowrap px-4 py-3.5">Policy Number</th>
                    <th className="min-w-[230px] whitespace-nowrap px-4 py-3.5">Client / Business</th>
                    <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5">Carrier</th>
                    <th className="min-w-[180px] whitespace-nowrap px-4 py-3.5">Line of Business</th>
                    <th className="min-w-[180px] whitespace-nowrap px-4 py-3.5">Dates</th>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3.5 text-right">Annual Premium</th>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3.5 text-right">Expected Comm.</th>
                    <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5 text-right">Actual Paid</th>
                    <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5 text-right">Outstanding</th>
                    <th className="min-w-[180px] whitespace-nowrap px-4 py-3.5">Reconciliation / Status</th>
                    <th className="py-3.5 pl-4 pr-6 text-right min-w-[210px] w-[210px] md:sticky md:right-0 md:z-20 bg-slate-50 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivePolicies.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-14 text-center text-slate-400">
                        <AlertCircle className="mx-auto size-9 text-slate-300 mb-2" />
                        <p className="text-base font-bold text-slate-700">No active policies matched your filters</p>
                        <p className="text-xs text-slate-400 mt-1">Try clearing your search query or reset the filter dropdowns.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredActivePolicies.map((p) => {
                      const isShortPaid = p.actualPaidCommission > 0 && p.actualPaidCommission < p.expectedCommission
                      return (
                        <tr
                          key={p.id}
                          onClick={() => {
                            setSelectedPolicyForDrawer(p)
                            setDrawerTab('overview')
                          }}
                          className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-900 font-mono text-sm">
                            {p.policyNumber}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <p className="font-bold text-slate-900 text-sm">{p.clientName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{p.businessName}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                              {p.carrier}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 font-medium text-xs sm:text-sm">{p.lineOfBusiness}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600 font-mono">
                            <p className="font-semibold text-slate-800">{p.effectiveDate}</p>
                            <p className="text-xs text-slate-400">to {p.expiryDate}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-slate-900 font-mono text-sm">
                            ${p.premium.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-blue-600 font-mono text-sm">
                            ${p.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-emerald-600 font-mono text-sm">
                            ${p.actualPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-extrabold text-amber-600 font-mono text-sm">
                            ${p.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            {isShortPaid ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                                <AlertTriangle className="size-3.5 text-rose-600" />
                                Short-Paid
                              </span>
                            ) : p.reconciliationStatus === 'Reconciled' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                Reconciled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                                <Clock className="size-3.5 text-amber-600" />
                                {p.reconciliationStatus}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[210px] w-[210px] md:sticky md:right-0 md:z-10 bg-white group-hover:bg-[#f8fafc] md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] transition-colors">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedPolicyForDrawer(p)
                                  setDrawerTab('overview')
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                              >
                                <Eye className="size-3.5 text-slate-400" />
                                View
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



      {/* ─────────────────────────────────────────────────────────────
          7.4 IMPORT BOOK OF BUSINESS (7/8 STEP WIZARD)
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Wizard Step Progression Bar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">


            {/* Stepper items */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 text-[12px]">
              {[
                { step: 1, label: '1. Upload File' },
                { step: 2, label: '2. Review & Confirm' },
              ].map((s) => {
                const isPassed = importStep > s.step
                const isCurrent = importStep === s.step
                return (
                  <div
                    key={s.step}
                    onClick={() => s.step <= importStep && setImportStep(s.step)}
                    className={`rounded-xl p-3 text-center transition cursor-pointer ${isCurrent
                      ? 'bg-slate-950 text-white font-bold shadow-md shadow-slate-950/15'
                      : isPassed
                        ? 'bg-emerald-50 text-emerald-700 font-bold ring-1 ring-emerald-200'
                        : 'bg-slate-50 text-slate-400 font-medium'
                      }`}
                  >
                    <span>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* STEP 1: UPLOAD EXCEL / CSV / PDF */}
          {importStep === 1 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] text-center space-y-6">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                <Upload className="size-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-[20px] font-bold text-slate-900">
                  Upload Book of Business Document
                </h4>
                <p className="mt-1.5 text-[13.5px] text-slate-500 leading-relaxed">
                  Select an Excel spreadsheet (.xlsx, .xls), CSV file (.csv), or a processable text-based PDF statement from your carrier portal.
                </p>
              </div>

              {/* Drag Drop Area */}
              <div className="max-w-xl mx-auto rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 transition hover:border-blue-400 hover:bg-blue-50/30">
                <FileSpreadsheet className="mx-auto size-12 text-slate-400 mb-3" />
                <p className="text-[14px] font-bold text-slate-800">
                  Drag and drop your file here, or browse
                </p>
                <p className="text-[12px] text-slate-400 mt-1">
                  Supported formats: .XLSX, .XLS, .CSV, .PDF (text-based) · Max 25MB
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setImportStep(2)}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer"
                  >
                    Select File &amp; Continue
                  </button>
                  <button
                    onClick={() => {
                      showToast('BrokerStep standard CSV template downloaded.')
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Download Template CSV
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-[12.5px] text-slate-500 pt-2 font-medium">
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-600" /> Multi-carrier normalization</span>
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-600" /> Duplicate safety lock</span>
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-600" /> Auto reconciliation preview</span>
              </div>
            </div>
          )}



          {/* STEP 8: BOOK OF BUSINESS UPDATED CONFIRMATION */}
          {importStep === 2 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)] text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <CheckCheck className="size-8" />
              </div>
              <div className="max-w-md mx-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Step 2 Complete
                </span>
                <h4 className="text-[20px] font-bold text-slate-900 mt-1">
                  Your Book of Business Updated Successfully!
                </h4>
                <p className="mt-1 text-[13px] text-slate-600">
                  Your broker account has been credited with the imported policies. Financial reconciliations and lifecycle ledgers have been updated.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('active')}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-[12.5px] font-semibold text-white hover:bg-blue-600 transition shadow-md cursor-pointer"
                >
                  View Active Book Ledger
                </button>

              </div>
            </div>
          )}
        </div>
      )}






      {/* ─────────────────────────────────────────────────────────────
          7.7 POLICY DETAILS RIGHT-SIDE CANVAS / DRAWER (Matching Client Page)
      ───────────────────────────────────────────────────────────── */}
      {selectedPolicyForDrawer && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setSelectedPolicyForDrawer(null)}
        >
          <div
            className="flex h-full w-full max-w-3xl sm:max-w-4xl flex-col bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="border-b border-slate-200 bg-slate-50/50 px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-[13px] sm:text-[14px] font-bold text-white shadow-md">
                    <Shield className="size-5 sm:size-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h2 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-slate-900 truncate font-mono">
                        {selectedPolicyForDrawer.policyNumber}
                      </h2>
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200">
                        {selectedPolicyForDrawer.policyStatus}
                      </span>
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 bg-blue-50 text-blue-700 ring-blue-200">
                        {selectedPolicyForDrawer.transactionType}
                      </span>
                      {selectedPolicyForDrawer.reconciliationStatus === 'Reconciled' ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Reconciled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                          <Clock className="size-3 text-amber-600" />
                          {selectedPolicyForDrawer.reconciliationStatus}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10.5px] sm:text-[11px] text-slate-500 mt-1">
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <User className="size-3 text-slate-400" />
                        {selectedPolicyForDrawer.clientName}
                      </span>
                      {selectedPolicyForDrawer.businessName !== '—' && (
                        <span className="text-slate-600 flex items-center gap-1">
                          <Building2 className="size-3 text-slate-400" />
                          {selectedPolicyForDrawer.businessName}
                        </span>
                      )}
                      <span>Carrier: <strong className="text-slate-800">{selectedPolicyForDrawer.carrier}</strong></span>
                      <span>LOB: <strong className="text-slate-800">{selectedPolicyForDrawer.lineOfBusiness}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href="/broker/policies"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-xs hover:border-blue-300 hover:text-blue-600 transition"
                  >
                    <ExternalLink className="size-3 text-slate-400" />
                    <span className="hidden sm:inline">Policies</span>
                  </Link>
                  <button
                    onClick={() => setSelectedPolicyForDrawer(null)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition shrink-0 cursor-pointer"
                    aria-label="Close Drawer"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-3 sm:px-6 gap-2 sm:gap-6 bg-white overflow-x-auto scrollbar-thin">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'commission', label: 'Commission & Splits' },
                { id: 'transactions', label: `Transactions (${selectedPolicyForDrawer.transactions?.length || 0})` },
                { id: 'timeline', label: 'Timeline' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id as typeof drawerTab)}
                  className={`py-2.5 sm:py-3 text-[11.5px] sm:text-[12px] font-medium border-b-2 transition whitespace-nowrap px-1.5 sm:px-0 cursor-pointer ${drawerTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
              {/* 1. OVERVIEW TAB */}
              {drawerTab === 'overview' && (
                <div className="space-y-6">
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Premium</p>
                      <p className="mt-1 text-xl font-bold text-slate-900 font-mono">
                        ${selectedPolicyForDrawer.premium.toLocaleString()}
                      </p>
                      <p className="text-[10.5px] text-slate-400">Annualized</p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                      <p className="text-[11px] font-medium text-blue-600 uppercase tracking-wider">Expected Comm.</p>
                      <p className="mt-1 text-xl font-bold text-blue-600 font-mono">
                        ${selectedPolicyForDrawer.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10.5px] text-blue-500">
                        {selectedPolicyForDrawer.commissionRate}% rate @ {selectedPolicyForDrawer.brokerSplit}% split
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                      <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Actual Paid</p>
                      <p className="mt-1 text-xl font-bold text-emerald-600 font-mono">
                        ${selectedPolicyForDrawer.actualPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10.5px] text-emerald-500">Received MTD</p>
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
                      <p className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">Outstanding</p>
                      <p className="mt-1 text-xl font-bold text-amber-600 font-mono">
                        ${selectedPolicyForDrawer.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10.5px] text-amber-500">Unsettled delta</p>
                    </div>
                  </div>

                  {/* Policy Information Grid */}
                  <div className="rounded-xl border border-slate-200/80 p-4 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Policy Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                      <div>
                        <span className="text-slate-400">Carrier:</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedPolicyForDrawer.carrier}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Line of Business:</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedPolicyForDrawer.lineOfBusiness}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Transaction Type:</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedPolicyForDrawer.transactionType}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Effective Date:</span>
                        <p className="font-semibold text-slate-800 mt-0.5 font-mono">{selectedPolicyForDrawer.effectiveDate}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Expiration Date:</span>
                        <p className="font-semibold text-slate-800 mt-0.5 font-mono">{selectedPolicyForDrawer.expiryDate}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Reconciliation:</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedPolicyForDrawer.reconciliationStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Client / Business Information */}
                  <div className="rounded-xl border border-slate-200/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Client / Business Information
                      </h3>
                      <Link
                        href="/broker/clients"
                        className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-blue-600 hover:underline"
                      >
                        View in Clients Module <ArrowUpRight className="size-3" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-slate-400">Client Name:</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedPolicyForDrawer.clientName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Business / Entity:</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedPolicyForDrawer.businessName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <p className="font-semibold text-slate-800 mt-0.5 truncate">{selectedPolicyForDrawer.clientEmail}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedPolicyForDrawer.clientPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. COMMISSION TAB */}
              {drawerTab === 'commission' && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-200/80 p-5 space-y-4 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900">
                      Commission Breakdown & Split Math
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <span className="text-[11px] font-medium text-slate-500">Premium Base</span>
                        <p className="mt-1 text-2xl font-bold text-slate-900 font-mono">
                          ${selectedPolicyForDrawer.premium.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <span className="text-[11px] font-medium text-slate-500">Carrier Commission Rate</span>
                        <p className="mt-1 text-2xl font-bold text-indigo-600 font-mono">
                          {selectedPolicyForDrawer.commissionRate}%
                        </p>
                        <p className="text-[10.5px] text-slate-400">
                          Gross: ${((selectedPolicyForDrawer.premium * selectedPolicyForDrawer.commissionRate) / 100).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <span className="text-[11px] font-medium text-slate-500">Broker Split Share</span>
                        <p className="mt-1 text-2xl font-bold text-blue-600 font-mono">
                          {selectedPolicyForDrawer.brokerSplit}%
                        </p>
                        <p className="text-[10.5px] text-slate-400">
                          Net: ${selectedPolicyForDrawer.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Reconciliation State
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                        Status: {selectedPolicyForDrawer.reconciliationStatus}
                      </span>
                      <span className="text-xs text-slate-600">
                        {selectedPolicyForDrawer.reconciliationStatus === 'Reconciled' &&
                          'Carrier statement matches expected commission 100%.'}
                        {selectedPolicyForDrawer.reconciliationStatus === 'Discrepancy' &&
                          `Variance detected: $${selectedPolicyForDrawer.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining.`}
                        {selectedPolicyForDrawer.reconciliationStatus === 'Pending' &&
                          'Awaiting carrier statement submission for reconciliation.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TRANSACTIONS TAB */}
              {drawerTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Transaction-Level History
                    </h3>
                    <span className="text-xs text-slate-500">
                      {selectedPolicyForDrawer.transactions?.length || 0} record(s)
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-[12px]">
                      <thead className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold uppercase text-slate-500">
                        <tr>
                          <th className="px-3.5 py-2.5">Date</th>
                          <th className="px-3.5 py-2.5">Type</th>
                          <th className="px-3.5 py-2.5">Description</th>
                          <th className="px-3.5 py-2.5">Statement #</th>
                          <th className="px-3.5 py-2.5 text-right">Premium Δ</th>
                          <th className="px-3.5 py-2.5 text-right">Expected</th>
                          <th className="px-3.5 py-2.5 text-right">Actual Paid</th>
                          <th className="px-3.5 py-2.5 text-right">Outstanding</th>
                          <th className="px-3.5 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedPolicyForDrawer.transactions && selectedPolicyForDrawer.transactions.length > 0 ? (
                          selectedPolicyForDrawer.transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50">
                              <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">{tx.date}</td>
                              <td className="px-3.5 py-2.5 whitespace-nowrap">
                                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                  {tx.type}
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5 text-slate-800">{tx.description}</td>
                              <td className="px-3.5 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                                {tx.statementNumber || '—'}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                                ${tx.premiumChange.toLocaleString()}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-mono text-blue-600 whitespace-nowrap">
                                ${tx.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-mono text-emerald-600 whitespace-nowrap">
                                ${tx.actualPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                                ${tx.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-3.5 py-2.5 whitespace-nowrap">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tx.reconciliationStatus === 'Reconciled'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                                  }`}>
                                  {tx.reconciliationStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400">
                              No transaction line items recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. TIMELINE TAB */}
              {drawerTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Policy Lifecycle & Audit Trail</h3>
                  {selectedPolicyForDrawer.timeline && selectedPolicyForDrawer.timeline.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {selectedPolicyForDrawer.timeline.map((event) => (
                        <div key={event.id} className="relative">
                          <span className="absolute -left-[22px] top-1.5 size-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900">{event.title}</h4>
                              <span className="text-[11px] font-mono text-slate-400">{event.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">{event.detail}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Actor: {event.actor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center text-slate-400 text-xs">
                      No lifecycle events recorded for this policy yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-200 bg-slate-50/70 px-4 sm:px-6 py-3.5 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Policy ID: <strong className="font-mono text-slate-600">{selectedPolicyForDrawer.id}</strong>
              </span>
              <button
                onClick={() => setSelectedPolicyForDrawer(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
