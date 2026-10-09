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
  const [activeTab, setActiveTab] = useState<BookTabType>('overview')

  // Sync URL query params with active tab
  useEffect(() => {
    function applyUrlParams(searchStr?: string) {
      if (typeof window === 'undefined') return
      const query = searchStr !== undefined ? searchStr : window.location.search
      const params = new URLSearchParams(query)
      const tab = params.get('tab') as BookTabType | null
      if (tab) {
        setActiveTab(tab)
      } else if (!params.toString()) {
        setActiveTab('overview')
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
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Tuesday, October 8, 2026 · Broker Portal
          </p>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 sm:text-[30px]">
            Book of Business
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500 leading-relaxed">
            Portfolio management, active &amp; historical policy ledgers, bulk data import, commission reconciliation, and multi-tier drill-down analytics.
          </p>
        </div>

        {/* 4 Header Action Buttons in 1 Row without wrapping */}
        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer">
            <CalendarDays className="size-4 text-slate-400" />
            <span>2026 Fiscal Year</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          <button
            onClick={handleExportBookCsv}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            <Download className="size-4 text-slate-400" />
            <span>Export Book</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import')
              setImportStep(1)
            }}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-[12.5px] font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 cursor-pointer"
          >
            <FileUp className="size-4 text-blue-600" />
            <span>Import Book</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('drilldown')
              setDrillLevel(1)
            }}
            className="group inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-slate-950 px-4 py-2 text-[12.5px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 cursor-pointer"
          >
            <Workflow className="size-4 transition-transform group-hover:scale-110" />
            <span>Drill-Down Explorer</span>
          </button>
        </div>
      </div>

      {/* ───── Primary Tab Navigation Bar (Matching Policies Page Style) ───── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {[
            { id: 'overview', label: 'Overview', count: policies.length },
            { id: 'active', label: 'Active Book', count: activePolicies.length },
            { id: 'historical', label: 'Historical Book', count: historicalPolicies.length },
            { id: 'import', label: 'Import Book of Business', count: 'Wizard' },
            { id: 'analytics', label: 'Book Analytics', count: 'Insights' },
            { id: 'drilldown', label: 'Drill-Down Explorer', count: `$${Math.round(financialMetrics.outstandingCommission).toLocaleString()}` },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id as BookTabType)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Secondary Filter Strip for Active/Historical views */}
        {(activeTab === 'active' || activeTab === 'historical' || activeTab === 'overview') && (
          <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search policy #, client, carrier, business, or line..."
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

            <div className="flex flex-wrap items-center gap-2">
              {/* Carrier Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-medium text-slate-500">Carrier:</span>
                <select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Carriers</option>
                  {carrierOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* LOB Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-medium text-slate-500">Line:</span>
                <select
                  value={lobFilter}
                  onChange={(e) => setLobFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Lines</option>
                  {lineOfBusinessOptions.map((lob) => (
                    <option key={lob} value={lob}>
                      {lob}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-medium text-slate-500">Type:</span>
                <select
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  {transactionTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Partial / Short-Paid Filter Toggle */}
              {activeTab === 'active' && (
                <button
                  onClick={() => setShortPaidOnly(!shortPaidOnly)}
                  className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[11.5px] font-semibold transition cursor-pointer ${shortPaidOnly
                    ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <BadgeAlert className={`size-3.5 ${shortPaidOnly ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span>Short-Paid Only ({financialMetrics.partialPaidCount})</span>
                </button>
              )}

              {/* Reset Filters */}
              {(carrierFilter !== 'All' || lobFilter !== 'All' || txTypeFilter !== 'All' || reconFilter !== 'All' || searchQuery || shortPaidOnly) && (
                <button
                  onClick={() => {
                    setCarrierFilter('All')
                    setLobFilter('All')
                    setTxTypeFilter('All')
                    setReconFilter('All')
                    setSearchQuery('')
                    setShortPaidOnly(false)
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[11.5px] font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7.1 OVERVIEW TAB
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main 7.1 Overview KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {/* 1. Active Policies */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-slate-500">Active Policies</p>
                <p className="mt-2 text-[26px] font-extrabold text-slate-900 tracking-tight font-mono">{activePolicies.length}</p>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-emerald-500"></span>
                <p className="text-[12px] text-emerald-600 font-semibold">In force &amp; current</p>
              </div>
            </div>

            {/* 2. Historical Policies */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-slate-500">Historical Policies</p>
                <p className="mt-2 text-[26px] font-extrabold text-slate-700 tracking-tight font-mono">{historicalPolicies.length}</p>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-slate-400"></span>
                <p className="text-[12px] text-slate-500 font-medium">Archived &amp; expired</p>
              </div>
            </div>

            {/* 3. Total Premium */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-slate-500">Total Premium</p>
                <p className="mt-2 text-[26px] font-extrabold text-slate-900 tracking-tight font-mono">
                  ${Math.round(financialMetrics.totalPremium).toLocaleString()}
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-blue-500"></span>
                <p className="text-[12px] text-slate-500 font-medium">Total book volume</p>
              </div>
            </div>

            {/* 4. Expected Commission */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-slate-500">Expected Comm.</p>
                <p className="mt-2 text-[26px] font-extrabold text-blue-600 tracking-tight font-mono">
                  ${financialMetrics.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-blue-600"></span>
                <p className="text-[12px] text-blue-600 font-semibold">Contracted revenue</p>
              </div>
            </div>

            {/* 5. Actual/Paid Commission */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-slate-500">Actual/Paid Comm.</p>
                <p className="mt-2 text-[26px] font-extrabold text-emerald-600 tracking-tight font-mono">
                  ${financialMetrics.actualPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-emerald-500"></span>
                <p className="text-[12px] text-emerald-600 font-semibold">Reconciled remittance</p>
              </div>
            </div>

            {/* 6. Outstanding Commission */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-slate-500">Outstanding Comm.</p>
                <p className="mt-2 text-[26px] font-extrabold text-amber-600 tracking-tight font-mono">
                  ${financialMetrics.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-amber-500"></span>
                <p className="text-[12px] text-amber-600 font-semibold">Pending remittance</p>
              </div>
            </div>

            {/* 7. Partial/Short-Paid Commission */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <p className="text-[12.5px] font-semibold text-slate-500">Short-Paid Comm.</p>
                <p className="mt-2 text-[26px] font-extrabold text-rose-600 tracking-tight font-mono">
                  ${financialMetrics.partialShortPaidAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="inline-block size-2 rounded-full bg-rose-500"></span>
                <p className="text-[12px] text-rose-600 font-semibold">
                  {financialMetrics.partialPaidCount} discrepancies
                </p>
              </div>
            </div>
          </div>

          {/* 7.1 Lifecycle Transaction Breakdown Grid */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-[17px] font-bold text-slate-900">
                  Lifecycle Transaction Breakdown
                </h3>
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  Breakdown by New Business, Renewals, Rewrites, Endorsements, Cancellations, Chargebacks, and Adjustments.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('active')}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
              >
                <span>View Full Active Ledger</span>
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {lifecycleBreakdown.map((item) => {
                const isNegative = item.premiumSum < 0 || item.expectedCommSum < 0
                return (
                  <div
                    key={item.type}
                    onClick={() => {
                      setTxTypeFilter(item.type)
                      setActiveTab('active')
                    }}
                    className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-[13px] font-bold text-slate-800 group-hover:text-blue-600 transition truncate">{item.type}</span>
                      <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700">
                        {item.count}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Premium Base</span>
                        <span className={`text-[14px] font-extrabold font-mono ${isNegative ? 'text-rose-600' : 'text-slate-900'}`}>
                          ${Math.round(item.premiumSum).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Expected Comm.</span>
                        <span className="text-[13px] font-bold font-mono text-blue-600">
                          ${Math.round(item.expectedCommSum).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Outstanding</span>
                        <span className="text-[12.5px] font-bold font-mono text-amber-600">
                          ${Math.round(item.outstandingSum).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Action Navigator Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              onClick={() => setActiveTab('import')}
              className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/60 via-white to-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:border-blue-400 hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-3">
                <FileUp className="size-5" />
              </div>
              <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition">
                Import Book of Business
              </h4>
              <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">
                Upload Excel, CSV, or PDF statements. Parse data, map fields, detect duplicates, and update your book in minutes.
              </p>
              <div className="mt-3.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-blue-600">
                Launch Import Wizard &rarr;
              </div>
            </div>

            <div
              onClick={() => setActiveTab('analytics')}
              className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-50/60 via-white to-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm mb-3">
                <BarChart3 className="size-5" />
              </div>
              <h4 className="text-[16px] font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Book Analytics
              </h4>
              <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">
                Production trends by carrier &amp; line of business, New Business vs Renewals, realization curves, and aging buckets.
              </p>
              <div className="mt-3.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-indigo-600">
                Explore Analytics &rarr;
              </div>
            </div>

            <div
              onClick={() => {
                setActiveTab('drilldown')
                setDrillLevel(1)
              }}
              className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-white shadow-lg shadow-slate-950/10 transition-all hover:bg-slate-900 hover:shadow-xl"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm mb-3">
                <Workflow className="size-5" />
              </div>
              <h4 className="text-[16px] font-bold text-white group-hover:text-blue-300 transition">
                Multi-Level Drill-Down
              </h4>
              <p className="mt-1.5 text-[12.5px] text-slate-300 leading-relaxed">
                Outstanding Commission &rarr; Carrier &rarr; Line of Business &rarr; Client &rarr; Policy &rarr; Transaction &rarr; Source Statement.
              </p>
              <div className="mt-3.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-blue-400">
                Start Drill-Down &rarr;
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7.2 ACTIVE BOOK TAB
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[1520px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
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
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivePolicies.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-14 text-center text-slate-400">
                        <AlertCircle className="mx-auto size-9 text-slate-300 mb-2" />
                        <p className="text-[14px] font-bold text-slate-700">No active policies matched your filters</p>
                        <p className="text-[12px] text-slate-400 mt-1">Try clearing your search query or reset the filter dropdowns.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredActivePolicies.map((p) => {
                      const isShortPaid = p.actualPaidCommission > 0 && p.actualPaidCommission < p.expectedCommission
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-900 font-mono text-[13px]">
                            {p.policyNumber}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <p className="font-bold text-slate-900 text-[13.5px]">{p.clientName}</p>
                            <p className="text-[12px] text-slate-500 mt-0.5">{p.businessName}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-800">
                              {p.carrier}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 font-medium">{p.lineOfBusiness}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-slate-600 font-mono">
                            <p className="font-semibold text-slate-800">{p.effectiveDate}</p>
                            <p className="text-[11.5px] text-slate-400">to {p.expiryDate}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-slate-900 font-mono text-[13.5px]">
                            ${p.premium.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-blue-600 font-mono text-[13.5px]">
                            ${p.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-emerald-600 font-mono text-[13.5px]">
                            ${p.actualPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-right font-extrabold text-amber-600 font-mono text-[13.5px]">
                            ${p.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
                            {isShortPaid ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
                                <AlertTriangle className="size-3.5 text-rose-600" />
                                Short-Paid
                              </span>
                            ) : p.reconciliationStatus === 'Reconciled' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                Reconciled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
                                <Clock className="size-3.5 text-amber-600" />
                                {p.reconciliationStatus}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setSelectedPolicyForDrawer(p)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                              >
                                <Eye className="size-3.5 text-slate-400" />
                                View
                              </button>
                              {p.outstandingCommission > 0 && (
                                <button
                                  onClick={() => {
                                    setSelectedDrillCarrier(p.carrier)
                                    setSelectedDrillLob(p.lineOfBusiness)
                                    setSelectedDrillClient(p.clientName)
                                    setSelectedDrillPolicyId(p.id)
                                    setDrillLevel(5)
                                    setActiveTab('drilldown')
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer shadow-xs"
                                >
                                  <Workflow className="size-3.5 text-blue-600" />
                                  Drill
                                </button>
                              )}
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
          7.3 HISTORICAL BOOK TAB
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'historical' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">
                Preserved Policy Lifecycle &amp; Historical Archives
              </h3>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                Complete audit trails of expired, non-renewed, cancelled, and carrier-rewrite policies with preserved transaction history.
              </p>
            </div>
            <span className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-[12.5px] font-bold text-slate-700 whitespace-nowrap self-start sm:self-center">
              {filteredHistoricalPolicies.length} Archived Records
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[1400px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="min-w-[160px] whitespace-nowrap px-4 py-3.5">Policy Number</th>
                    <th className="min-w-[230px] whitespace-nowrap px-4 py-3.5">Client / Entity</th>
                    <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5">Carrier</th>
                    <th className="min-w-[180px] whitespace-nowrap px-4 py-3.5">Line of Business</th>
                    <th className="min-w-[190px] whitespace-nowrap px-4 py-3.5">Historical Term</th>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3.5 text-right">Archived Premium</th>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3.5 text-right">Realized Comm.</th>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3.5">Historical Status</th>
                    <th className="min-w-[180px] whitespace-nowrap px-4 py-3.5">Preserved Transactions</th>
                    <th className="min-w-[130px] whitespace-nowrap px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistoricalPolicies.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-14 text-center text-slate-400">
                        <FolderArchive className="mx-auto size-9 text-slate-300 mb-2" />
                        <p className="text-[14px] font-bold text-slate-700">No historical records found</p>
                        <p className="text-[12px] text-slate-400 mt-1">Try clearing your search query or reset the filter dropdowns.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistoricalPolicies.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800 font-mono text-[13px]">
                          {p.policyNumber}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <p className="font-bold text-slate-900 text-[13.5px]">{p.clientName}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">{p.businessName}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-700">
                            {p.carrier}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 font-medium">{p.lineOfBusiness}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[12px] text-slate-600 font-mono">
                          {p.effectiveDate} &rarr; {p.expiryDate}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-slate-800 font-mono text-[13.5px]">
                          ${p.premium.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-emerald-600 font-mono text-[13.5px]">
                          ${p.actualPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">
                            {p.policyStatus}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
                            <Layers className="size-3.5 text-slate-400" />
                            {p.transactions.length} recorded event(s)
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-center">
                          <button
                            onClick={() => setSelectedPolicyForDrawer(p)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs whitespace-nowrap"
                          >
                            <History className="size-3.5 text-slate-400" />
                            Audit Log
                          </button>
                        </td>
                      </tr>
                    ))
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
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-blue-600">
                  Bulk Data Pipeline
                </span>
                <h3 className="text-[19px] font-bold text-slate-900 mt-0.5">
                  Import Book of Business
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                  Step {importStep} of 8
                </span>
                <button
                  onClick={() => setImportStep(1)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Start Over
                </button>
              </div>
            </div>

            {/* Stepper items */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 text-[12px]">
              {[
                { step: 1, label: '1. Upload File' },
                { step: 2, label: '2. Read / Parse' },
                { step: 3, label: '3. Map Fields' },
                { step: 4, label: '4. Validate' },
                { step: 5, label: '5. Deduplicate' },
                { step: 6, label: '6. Broker Review' },
                { step: 7, label: '7. Import Records' },
                { step: 8, label: '8. Book Updated' },
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

          {/* STEP 2: READ / PARSE DATA */}
          {importStep === 2 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    Read &amp; Parse Data
                  </h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    File <strong className="text-slate-800">{uploadedFileName}</strong> parsed successfully. 5 policy records found.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                    Parsed in 184ms
                  </span>
                  <button
                    onClick={() => setImportStep(3)}
                    className="rounded-xl bg-slate-950 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-blue-600 transition cursor-pointer"
                  >
                    Continue to Field Mapping &rarr;
                  </button>
                </div>
              </div>

              {/* Raw Parsed Table */}
              <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-slate-200/80">
                <table className="w-full min-w-[1150px] text-left text-[13px]">
                  <thead className="bg-slate-50/80 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="min-w-[80px] whitespace-nowrap px-4 py-3.5">Row #</th>
                      <th className="min-w-[170px] whitespace-nowrap px-4 py-3.5">Raw Policy Number</th>
                      <th className="min-w-[200px] whitespace-nowrap px-4 py-3.5">Raw Insured / Client</th>
                      <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5">Raw Carrier</th>
                      <th className="min-w-[180px] whitespace-nowrap px-4 py-3.5">Raw Line of Business</th>
                      <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5 text-right">Raw Premium</th>
                      <th className="min-w-[130px] whitespace-nowrap px-4 py-3.5">Effective Date</th>
                      <th className="min-w-[130px] whitespace-nowrap px-4 py-3.5">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[12px]">
                    {parsedRows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-400 font-bold">#{idx + 1}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">{row.rawPolicyNumber}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-sans font-bold text-slate-900">{row.rawClientName}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-sans text-slate-700">{row.rawCarrier}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-sans text-slate-700">{row.rawLineOfBusiness}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">${row.rawPremium.toLocaleString()}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.rawEffectiveDate}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.rawExpiryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: MAP SOURCE FIELDS TO BROKERSTEP FIELDS */}
          {importStep === 3 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    Map Source Fields to BrokerStep Fields
                  </h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Our AI field mapping engine detected 9 of 9 standard columns. Verify or reassign mappings below.
                  </p>
                </div>
                <button
                  onClick={() => setImportStep(4)}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-blue-600 transition cursor-pointer"
                >
                  Run Validation (Step 14) &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(fieldMappings).map(([sourceCol, targetField]) => (
                  <div key={sourceCol} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">Source Column</span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">Mapped 100%</span>
                    </div>
                    <p className="text-[14px] font-bold text-slate-900 truncate">{sourceCol}</p>

                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-[11.5px] font-medium text-slate-500 block mb-1">Maps to BrokerStep Field:</span>
                      <select
                        value={targetField}
                        onChange={(e) =>
                          setFieldMappings((prev) => ({ ...prev, [sourceCol]: e.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-semibold text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none cursor-pointer"
                      >
                        <option value="policyNumber">Policy Number</option>
                        <option value="clientName">Client / Insured Name</option>
                        <option value="carrier">Carrier Name</option>
                        <option value="lineOfBusiness">Line of Business</option>
                        <option value="premium">Annualized Premium</option>
                        <option value="effectiveDate">Effective Date</option>
                        <option value="expiryDate">Expiration Date</option>
                        <option value="commissionRate">Carrier Commission Rate %</option>
                        <option value="brokerSplit">Broker Split Tier %</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 & 5: VALIDATE & IDENTIFY DUPLICATES/ERRORS */}
          {(importStep === 4 || importStep === 5) && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    {importStep === 4 ? 'Validate Records' : 'Identify Potential Duplicates & Errors'}
                  </h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Automated sanity tests, currency validation, date ranges, and duplicate cross-checking against existing book.
                  </p>
                </div>
                <button
                  onClick={() => setImportStep(6)}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-blue-600 transition cursor-pointer"
                >
                  Proceed to Broker Review (Step 16) &rarr;
                </button>
              </div>

              {/* Validation Summary Cards */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4.5">
                  <span className="text-[12px] font-bold text-emerald-800">Valid Records</span>
                  <p className="mt-1 text-[26px] font-extrabold text-emerald-800 font-mono">4 / 5</p>
                  <p className="text-[11.5px] text-emerald-600 font-medium">Passed all sanity audits</p>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4.5">
                  <span className="text-[12px] font-bold text-amber-800">Potential Duplicates</span>
                  <p className="mt-1 text-[26px] font-extrabold text-amber-800 font-mono">1</p>
                  <p className="text-[11.5px] text-amber-600 font-medium">Existing policy # match</p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4.5">
                  <span className="text-[12px] font-bold text-blue-800">Gross Premium Sum</span>
                  <p className="mt-1 text-[26px] font-extrabold text-blue-800 font-mono">$160,400</p>
                  <p className="text-[11.5px] text-blue-600 font-medium">Ready to ingest</p>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4.5">
                  <span className="text-[12px] font-bold text-indigo-800">Projected Commission</span>
                  <p className="mt-1 text-[26px] font-extrabold text-indigo-800 font-mono">$16,564</p>
                  <p className="text-[11.5px] text-indigo-600 font-medium">Calculated revenue</p>
                </div>
              </div>

              {/* Duplicate & Flag Details */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-[14px]">
                  <AlertTriangle className="size-4.5 text-amber-600" />
                  <span>Flagged Conflict in Row #1: POL-TRV-89421</span>
                </div>
                <p className="text-[13px] text-slate-700 leading-relaxed">
                  Policy number <strong>POL-TRV-89421</strong> already exists in your Active Book under <em>Marcus Vance (Apex Logistics Corp)</em>.
                  In Step 16, you can choose to <strong>Overwrite</strong>, <strong>Import as Term Renewal/Rewrite</strong>, or <strong>Skip</strong> this record.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: BROKER REVIEW WHERE REQUIRED */}
          {importStep === 6 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    Broker Review &amp; Conflict Resolution
                  </h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Confirm actions for all rows before importing to the database.
                  </p>
                </div>
                <button
                  onClick={() => setImportStep(7)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition cursor-pointer"
                >
                  Execute Import (Step 17) &rarr;
                </button>
              </div>

              <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-slate-200/80">
                <table className="w-full min-w-[1240px] text-left text-[13px]">
                  <thead className="bg-slate-50/80 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="min-w-[160px] whitespace-nowrap px-4 py-3.5">Policy Number</th>
                      <th className="min-w-[200px] whitespace-nowrap px-4 py-3.5">Client</th>
                      <th className="min-w-[200px] whitespace-nowrap px-4 py-3.5">Carrier &amp; LOB</th>
                      <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5 text-right">Premium</th>
                      <th className="min-w-[220px] whitespace-nowrap px-4 py-3.5">Validation Note</th>
                      <th className="min-w-[240px] whitespace-nowrap px-4 py-3.5">Resolution Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3.5 font-bold font-mono text-slate-900">{row.rawPolicyNumber}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-900">{row.rawClientName}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 font-medium">
                          {row.rawCarrier} · {row.rawLineOfBusiness}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold font-mono text-slate-900">
                          ${row.rawPremium.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[12px]">
                          {row.isDuplicate ? (
                            <span className="text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">{row.validationNotes[0]}</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">{row.validationNotes[0]}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {row.isDuplicate ? (
                            <select
                              value={row.status}
                              onChange={(e) => {
                                const val = e.target.value as any
                                setParsedRows((prev) =>
                                  prev.map((r) => (r.id === row.id ? { ...r, status: val } : r))
                                )
                              }}
                              className="rounded-xl border border-amber-300 bg-amber-50/70 px-3 py-1.5 text-[12px] font-bold text-amber-900 focus:outline-none cursor-pointer"
                            >
                              <option value="Ready">Import as Version / Renewal</option>
                              <option value="Warning">Overwrite Existing</option>
                              <option value="Skipped">Skip this row</option>
                            </select>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                              Ready to Ingest
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 7: IMPORT RECORDS (EXECUTION) */}
          {importStep === 7 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)] text-center space-y-5">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg animate-pulse">
                <RefreshCw className="size-7 animate-spin" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-[19px] font-bold text-slate-900">
                  Step 17: Importing Records into Broker Account
                </h4>
                <p className="mt-1 text-[13px] text-slate-500">
                  Writing normalized policy records, creating client links, and generating initial commission expectation ledgers...
                </p>
              </div>

              <div className="max-w-md mx-auto bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-full w-4/5 rounded-full animate-pulse" />
              </div>

              <div>
                <button
                  onClick={handleExecuteImport}
                  className="rounded-xl bg-slate-950 px-6 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-600 shadow-md transition cursor-pointer"
                >
                  Finalize &amp; Commit to Book of Business
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: BOOK OF BUSINESS UPDATED CONFIRMATION */}
          {importStep === 8 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)] text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <CheckCheck className="size-8" />
              </div>
              <div className="max-w-md mx-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Step 18 Complete
                </span>
                <h4 className="text-[20px] font-bold text-slate-900 mt-1">
                  Book of Business Updated Successfully!
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
                  View Active Book Ledger &rarr;
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Go to 7.1 Overview
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7.5 BOOK ANALYTICS TAB
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Analytics KPI Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
              <div>
                <span className="text-[13px] font-semibold text-slate-500">Average Premium / Policy</span>
                <p className="mt-2 text-[28px] font-extrabold text-slate-900 font-mono tracking-tight">
                  ${Math.round(financialMetrics.totalPremium / (policies.length || 1)).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-[12px] text-slate-400 font-medium">Calculated over {policies.length} total policies</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
              <div>
                <span className="text-[13px] font-semibold text-slate-500">Commission Realization Rate</span>
                <p className="mt-2 text-[28px] font-extrabold text-emerald-600 font-mono tracking-tight">
                  {Math.round((financialMetrics.actualPaidCommission / (financialMetrics.expectedCommission || 1)) * 100)}%
                </p>
              </div>
              <p className="mt-2 text-[12px] text-emerald-600 font-medium">Actual collected vs expected</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
              <div>
                <span className="text-[13px] font-semibold text-slate-500">New Business vs Renewal Ratio</span>
                <p className="mt-2 text-[28px] font-extrabold text-blue-600 font-mono tracking-tight">
                  {policies.filter((p) => p.transactionType === 'New Business').length} :{' '}
                  {policies.filter((p) => p.transactionType === 'Renewal').length}
                </p>
              </div>
              <p className="mt-2 text-[12px] text-blue-600 font-medium">New acquisition vs retention</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
              <div>
                <span className="text-[13px] font-semibold text-slate-500">Total Uncollected Discrepancy</span>
                <p className="mt-2 text-[28px] font-extrabold text-amber-600 font-mono tracking-tight">
                  ${financialMetrics.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <p className="mt-2 text-[12px] text-amber-600 font-medium">Unsettled carrier balances</p>
            </div>
          </div>

          {/* Carrier Production & Line of Business Production */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Carrier Production */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">Carrier Production</h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">Premium distribution &amp; revenue per insurance carrier</p>
                </div>
                <span className="text-[12px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Volume Share</span>
              </div>

              <div className="space-y-3.5 pt-1">
                {['Travelers', 'Chubb', 'CNA', 'Liberty Mutual', 'AIG', 'The Hartford', 'Progressive'].map((carrier) => {
                  const matching = policies.filter((p) => p.carrier === carrier)
                  const prem = matching.reduce((s, p) => s + p.premium, 0)
                  const pct = Math.round((prem / (financialMetrics.totalPremium || 1)) * 100)
                  return (
                    <div key={carrier} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-bold text-slate-800">{carrier}</span>
                        <span className="font-mono font-bold text-slate-700">
                          ${prem.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Line of Business Production */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">Line-of-Business Production</h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">Market share across commercial and specialty insurance lines</p>
                </div>
                <span className="text-[12px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Coverage Share</span>
              </div>

              <div className="space-y-3.5 pt-1">
                {[
                  'Commercial Auto',
                  'Commercial Property',
                  'Workers Compensation',
                  'Products Liability',
                  'Cyber Liability',
                  'Professional Liability (E&O)',
                  'Inland Marine',
                  'Business Owners (BOP)',
                ].map((lob) => {
                  const matching = policies.filter((p) => p.lineOfBusiness.includes(lob) || lob.includes(p.lineOfBusiness))
                  const prem = matching.reduce((s, p) => s + p.premium, 0)
                  const pct = Math.round((prem / (financialMetrics.totalPremium || 1)) * 100)
                  return (
                    <div key={lob} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-bold text-slate-800">{lob}</span>
                        <span className="font-mono font-bold text-slate-700">
                          ${prem.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Renewal-Related Pipeline Views */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-[17px] font-bold text-slate-900">Renewal Pipeline Horizons</h4>
                <p className="text-[12.5px] text-slate-500 mt-0.5">Upcoming policy expirations scheduled for 30, 60, and 90-day renewal notices</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3.5 py-1 text-[12px] font-bold text-blue-700 self-start sm:self-center">
                Retention Health: 92.4%
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-2.5">
                <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-rose-600">Next 30 Days</span>
                <p className="text-[24px] font-extrabold text-slate-900 font-mono">3 Policies</p>
                <p className="text-[13px] text-slate-700 font-bold">Premium at stake: $52,650</p>
                <div className="pt-2.5 border-t border-slate-200 text-[12px] text-slate-600 font-medium">
                  Marcus Vance (Apex), David Chen (Riverside)
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-2.5">
                <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-amber-600">31 - 60 Days</span>
                <p className="text-[24px] font-extrabold text-slate-900 font-mono">2 Policies</p>
                <p className="text-[13px] text-slate-700 font-bold">Premium at stake: $41,200</p>
                <div className="pt-2.5 border-t border-slate-200 text-[12px] text-slate-600 font-medium">
                  Sophia Sterling, Northstar Logistics
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-2.5">
                <span className="text-[11.5px] font-extrabold uppercase tracking-wider text-emerald-600">61 - 90 Days</span>
                <p className="text-[24px] font-extrabold text-slate-900 font-mono">4 Policies</p>
                <p className="text-[13px] text-slate-700 font-bold">Premium at stake: $78,500</p>
                <div className="pt-2.5 border-t border-slate-200 text-[12px] text-slate-600 font-medium">
                  Elena Rostova, Arthur Pendelton
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7.6 MULTI-LEVEL DRILL-DOWN EXPLORER
          Outstanding Commission → Carrier → Line of Business → Client → Policy → Commission Transaction → Source Statement
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'drilldown' && (
        <div className="space-y-5">
          {/* Breadcrumb Trail */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] flex flex-wrap items-center gap-2 text-[12px]">
            <span className="font-semibold text-slate-400">Drill Path:</span>

            {/* Level 1: Root */}
            <button
              onClick={() => {
                setDrillLevel(1)
                setSelectedDrillCarrier(null)
                setSelectedDrillLob(null)
                setSelectedDrillClient(null)
                setSelectedDrillPolicyId(null)
                setSelectedDrillTxId(null)
              }}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${drillLevel === 1 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              1. Outstanding Commission (${Math.round(financialMetrics.outstandingCommission).toLocaleString()})
            </button>

            {/* Level 2: Carrier */}
            {selectedDrillCarrier && (
              <>
                <ChevronRight className="size-3.5 text-slate-400" />
                <button
                  onClick={() => {
                    setDrillLevel(2)
                    setSelectedDrillLob(null)
                    setSelectedDrillClient(null)
                    setSelectedDrillPolicyId(null)
                    setSelectedDrillTxId(null)
                  }}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${drillLevel === 2 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  2. Carrier: {selectedDrillCarrier}
                </button>
              </>
            )}

            {/* Level 3: LOB */}
            {selectedDrillLob && (
              <>
                <ChevronRight className="size-3.5 text-slate-400" />
                <button
                  onClick={() => {
                    setDrillLevel(3)
                    setSelectedDrillClient(null)
                    setSelectedDrillPolicyId(null)
                    setSelectedDrillTxId(null)
                  }}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${drillLevel === 3 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  3. Line: {selectedDrillLob}
                </button>
              </>
            )}

            {/* Level 4: Client */}
            {selectedDrillClient && (
              <>
                <ChevronRight className="size-3.5 text-slate-400" />
                <button
                  onClick={() => {
                    setDrillLevel(4)
                    setSelectedDrillPolicyId(null)
                    setSelectedDrillTxId(null)
                  }}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${drillLevel === 4 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  4. Client: {selectedDrillClient}
                </button>
              </>
            )}

            {/* Level 5: Policy */}
            {drillPolicyRecord && (
              <>
                <ChevronRight className="size-3.5 text-slate-400" />
                <button
                  onClick={() => {
                    setDrillLevel(5)
                    setSelectedDrillTxId(null)
                  }}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${drillLevel === 5 ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  5. Policy: {drillPolicyRecord.policyNumber}
                </button>
              </>
            )}

            {/* Level 6: Statement */}
            {drillTransaction && (
              <>
                <ChevronRight className="size-3.5 text-slate-400" />
                <span className="rounded-lg bg-blue-600 text-white px-2.5 py-1 font-semibold">
                  6. Statement Voucher: {drillTransaction.statementNumber || 'Pending Remittance'}
                </span>
              </>
            )}
          </div>

          {/* LEVEL 1: CARRIER BREAKDOWN */}
          {drillLevel === 1 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-[17px] font-bold text-slate-900">
                  Level 1: Outstanding Commission by Carrier
                </h4>
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  Click any carrier to drill down into its Lines of Business.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {carrierDrillSummary.map((item) => (
                  <div
                    key={item.carrier}
                    onClick={() => {
                      setSelectedDrillCarrier(item.carrier)
                      setDrillLevel(2)
                    }}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {item.carrier}
                      </span>
                      <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                        {item.policyCount} policy(ies)
                      </span>
                    </div>
                    <p className="mt-3 text-[26px] font-extrabold text-amber-600 font-mono tracking-tight">
                      ${item.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-1 font-medium">Outstanding variance</p>
                    <div className="mt-3.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-blue-600">
                      Drill into LOB &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 2: LOB BREAKDOWN UNDER SELECTED CARRIER */}
          {drillLevel === 2 && selectedDrillCarrier && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    Level 2: {selectedDrillCarrier} &rarr; Line of Business Breakdown
                  </h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Select a line of business to drill into individual clients.
                  </p>
                </div>
                <button
                  onClick={() => setDrillLevel(1)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  &larr; Back to Carriers
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lobDrillSummary.map((item) => (
                  <div
                    key={item.lob}
                    onClick={() => {
                      setSelectedDrillLob(item.lob)
                      setDrillLevel(3)
                    }}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {item.lob}
                      </span>
                      <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                        {item.policyCount} policy
                      </span>
                    </div>
                    <p className="mt-3 text-[26px] font-extrabold text-amber-600 font-mono tracking-tight">
                      ${item.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[12px] text-slate-500 mt-1 font-medium">Outstanding in this line</p>
                    <div className="mt-3.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-blue-600">
                      Drill into Clients &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 3: CLIENT BREAKDOWN UNDER CARRIER & LOB */}
          {drillLevel === 3 && selectedDrillLob && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    Level 3: {selectedDrillCarrier} &rarr; {selectedDrillLob} &rarr; Client Listing
                  </h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Select a client to inspect the associated policy contract.
                  </p>
                </div>
                <button
                  onClick={() => setDrillLevel(2)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  &larr; Back to Lines
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {clientDrillSummary.map((item) => (
                  <div
                    key={item.clientName}
                    onClick={() => {
                      setSelectedDrillClient(item.clientName)
                      setDrillLevel(4)
                    }}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div>
                        <span className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition block">
                          {item.clientName}
                        </span>
                        <span className="text-[12px] text-slate-500 font-medium">{item.businessName}</span>
                      </div>
                      <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                        {item.policyCount} policy
                      </span>
                    </div>
                    <p className="mt-3 text-[26px] font-extrabold text-amber-600 font-mono tracking-tight">
                      ${item.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <div className="mt-3.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-blue-600">
                      View Client Policies &rarr;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 4: POLICIES UNDER CLIENT */}
          {drillLevel === 4 && selectedDrillClient && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    Level 4: Policies for {selectedDrillClient}
                  </h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Click a policy to drill down into its transaction history and reconciliation statement.
                  </p>
                </div>
                <button
                  onClick={() => setDrillLevel(3)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  &larr; Back to Clients
                </button>
              </div>

              <div className="space-y-3.5">
                {policyDrillList.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedDrillPolicyId(p.id)
                      setDrillLevel(5)
                    }}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition-all hover:border-blue-400 hover:bg-white hover:shadow-md flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[15px] text-slate-900 group-hover:text-blue-600 transition">
                          {p.policyNumber}
                        </span>
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                          {p.transactionType}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-slate-500 mt-1">
                        {p.carrier} · {p.lineOfBusiness} · Term: {p.effectiveDate} to {p.expiryDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-5 text-right">
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">Outstanding</span>
                        <span className="text-[22px] font-extrabold text-amber-600 font-mono">
                          ${p.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm whitespace-nowrap">
                        View Transactions &rarr;
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 5: COMMISSION TRANSACTIONS FOR POLICY */}
          {drillLevel === 5 && drillPolicyRecord && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-[17px] font-bold text-slate-900">
                    Level 5: Commission Transactions for {drillPolicyRecord.policyNumber}
                  </h4>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Insured: {drillPolicyRecord.clientName} ({drillPolicyRecord.businessName}) · Carrier: {drillPolicyRecord.carrier}
                  </p>
                </div>
                <button
                  onClick={() => setDrillLevel(4)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  &larr; Back to Policies
                </button>
              </div>

              <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-slate-200/80">
                <table className="w-full min-w-[1300px] text-left text-[13px]">
                  <thead className="bg-slate-50/80 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="min-w-[130px] whitespace-nowrap px-4 py-3.5">Date</th>
                      <th className="min-w-[170px] whitespace-nowrap px-4 py-3.5">Transaction Type</th>
                      <th className="min-w-[240px] whitespace-nowrap px-4 py-3.5">Description</th>
                      <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5 text-right">Premium Delta</th>
                      <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5 text-right">Expected</th>
                      <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5 text-right">Actual Paid</th>
                      <th className="min-w-[140px] whitespace-nowrap px-4 py-3.5 text-right">Outstanding</th>
                      <th className="min-w-[190px] whitespace-nowrap px-4 py-3.5">Statement Reference</th>
                      <th className="min-w-[150px] whitespace-nowrap px-4 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drillPolicyRecord.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-slate-700 font-medium">{tx.date}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-900">{tx.type}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">{tx.description}</td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          ${tx.premiumChange.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-bold text-blue-600">
                          ${tx.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-bold text-emerald-600">
                          ${tx.actualPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono font-extrabold text-amber-600">
                          ${tx.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[12px] text-slate-700">
                          {tx.statementNumber || 'Awaiting Carrier Batch'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-center">
                          <button
                            onClick={() => {
                              setSelectedDrillTxId(tx.id)
                              setDrillLevel(6)
                            }}
                            className="rounded-xl bg-blue-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs whitespace-nowrap"
                          >
                            Inspect Source &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LEVEL 6: SOURCE STATEMENT VOUCHER */}
          {drillLevel === 6 && drillTransaction && drillPolicyRecord && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-blue-600">
                    Drill-Down Level 6: Source Carrier Statement
                  </span>
                  <h4 className="text-[19px] font-bold text-slate-900 mt-0.5">
                    Statement Voucher: {drillTransaction.statementNumber || 'Pending Carrier Batch'}
                  </h4>
                </div>
                <button
                  onClick={() => setDrillLevel(5)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  &larr; Back to Transactions
                </button>
              </div>

              {/* Statement Voucher Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-[13px]">
                  <div>
                    <span className="text-slate-400 block text-[12px]">Statement Number:</span>
                    <span className="font-mono font-bold text-slate-900 text-[14px]">
                      {drillTransaction.statementNumber || 'ST-PENDING-2026'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[12px]">Carrier Remittance:</span>
                    <span className="font-bold text-slate-900">{drillPolicyRecord.carrier}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[12px]">Batch Statement Date:</span>
                    <span className="font-mono text-slate-800 font-semibold">{drillTransaction.statementDate || drillPolicyRecord.effectiveDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[12px]">Reconciliation Status:</span>
                    <span className="font-extrabold text-amber-600">{drillTransaction.reconciliationStatus}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4.5">
                    <span className="text-[12px] font-semibold text-slate-500">Expected Contract Value</span>
                    <p className="text-[22px] font-extrabold text-blue-600 font-mono mt-1">
                      ${drillTransaction.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">
                      Rate: {drillPolicyRecord.commissionRate}% @ Split: {drillPolicyRecord.brokerSplit}%
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4.5">
                    <span className="text-[12px] font-semibold text-slate-500">Actual Remitted by Carrier</span>
                    <p className="text-[22px] font-extrabold text-emerald-600 font-mono mt-1">
                      ${drillTransaction.actualPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">Received on clearing schedule</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4.5">
                    <span className="text-[12px] font-semibold text-slate-500">Outstanding Discrepancy</span>
                    <p className="text-[22px] font-extrabold text-rose-600 font-mono mt-1">
                      ${drillTransaction.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11.5px] text-rose-500 font-medium mt-0.5">Variance claim ticket opened</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[12.5px] text-slate-600">
                    Source statement PDF voucher verified via broker clearing house API.
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/broker/statements"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Open Carrier Statements Module &rarr;
                    </Link>
                    <button
                      onClick={() => showToast('Statement PDF exported.')}
                      className="rounded-xl bg-slate-950 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-blue-600 transition cursor-pointer"
                    >
                      Download Voucher PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          POLICY DETAIL DRAWER
      ─────────────────────────────────────────────────────────────── */}
      {selectedPolicyForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/70 px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12.5px] font-bold uppercase tracking-wider text-blue-600">
                    {selectedPolicyForDrawer.carrier}
                  </span>
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                    {selectedPolicyForDrawer.policyStatus}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {selectedPolicyForDrawer.policyNumber}
                </h2>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  {selectedPolicyForDrawer.clientName} &middot; {selectedPolicyForDrawer.businessName}
                </p>
              </div>

              <button
                onClick={() => setSelectedPolicyForDrawer(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Sub-tab switcher */}
            <div className="flex border-b border-slate-200 px-6 gap-6 bg-white text-[13px]">
              {(['overview', 'commission', 'transactions', 'timeline'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={`py-3.5 font-bold border-b-2 transition capitalize cursor-pointer ${drawerTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
              {drawerTab === 'overview' && (
                <div className="space-y-4 text-[13px]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-xs">
                    <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11.5px]">Coverage Overview</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 text-[12px] block">Line of Business:</span>
                        <p className="font-bold text-slate-800 mt-0.5 text-[13.5px]">{selectedPolicyForDrawer.lineOfBusiness}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[12px] block">Transaction Type:</span>
                        <p className="font-bold text-slate-800 mt-0.5 text-[13.5px]">{selectedPolicyForDrawer.transactionType}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[12px] block">Effective Date:</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5 text-[13.5px]">{selectedPolicyForDrawer.effectiveDate}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[12px] block">Expiration Date:</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5 text-[13.5px]">{selectedPolicyForDrawer.expiryDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-xs">
                    <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11.5px]">Client Contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 text-[12px] block">Email:</span>
                        <p className="font-bold text-slate-800 mt-0.5 text-[13.5px]">{selectedPolicyForDrawer.clientEmail}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[12px] block">Phone:</span>
                        <p className="font-bold text-slate-800 mt-0.5 text-[13.5px]">{selectedPolicyForDrawer.clientPhone}</p>
                      </div>
                    </div>
                  </div>

                  {selectedPolicyForDrawer.notes && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[11.5px] mb-1.5">Notes &amp; Remarks</h4>
                      <p className="text-slate-700 leading-relaxed text-[13px]">{selectedPolicyForDrawer.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {drawerTab === 'commission' && (
                <div className="space-y-4 text-[13px]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5.5 space-y-4 shadow-xs">
                    <h4 className="font-bold text-slate-900 text-[15px]">Split Calculation Engine</h4>
                    <div className="grid grid-cols-3 gap-3.5">
                      <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                        <span className="text-slate-500 block text-[12px]">Annual Premium</span>
                        <span className="font-extrabold text-slate-900 text-lg font-mono mt-1 block">
                          ${selectedPolicyForDrawer.premium.toLocaleString()}
                        </span>
                      </div>
                      <div className="rounded-xl bg-blue-50 p-3.5 border border-blue-100">
                        <span className="text-blue-600 block text-[12px] font-semibold">Carrier Rate</span>
                        <span className="font-extrabold text-blue-700 text-lg font-mono mt-1 block">
                          {selectedPolicyForDrawer.commissionRate}%
                        </span>
                      </div>
                      <div className="rounded-xl bg-indigo-50 p-3.5 border border-indigo-100">
                        <span className="text-indigo-600 block text-[12px] font-semibold">Broker Split</span>
                        <span className="font-extrabold text-indigo-700 text-lg font-mono mt-1 block">
                          {selectedPolicyForDrawer.brokerSplit}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3.5">
                    <div className="rounded-2xl border border-blue-200 bg-white p-4.5 shadow-xs">
                      <span className="text-slate-500 text-[12px] font-semibold">Expected</span>
                      <p className="text-xl font-extrabold text-blue-600 font-mono mt-1">
                        ${selectedPolicyForDrawer.expectedCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4.5 shadow-xs">
                      <span className="text-slate-500 text-[12px] font-semibold">Actual Paid</span>
                      <p className="text-xl font-extrabold text-emerald-600 font-mono mt-1">
                        ${selectedPolicyForDrawer.actualPaidCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-white p-4.5 shadow-xs">
                      <span className="text-slate-500 text-[12px] font-semibold">Outstanding</span>
                      <p className="text-xl font-extrabold text-amber-600 font-mono mt-1">
                        ${selectedPolicyForDrawer.outstandingCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'transactions' && (
                <div className="space-y-3.5">
                  {selectedPolicyForDrawer.transactions.map((tx) => (
                    <div key={tx.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-[13px] space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-[14px]">{tx.type}</span>
                        <span className="font-mono text-slate-400 text-[12px]">{tx.date}</span>
                      </div>
                      <p className="text-slate-700">{tx.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-mono text-[12px]">
                        <span className="text-blue-600 font-bold">Expected: ${tx.expectedCommission.toLocaleString()}</span>
                        <span className="text-emerald-600 font-bold">Paid: ${tx.actualPaid.toLocaleString()}</span>
                        <span className="text-amber-600 font-bold">Variance: ${tx.outstanding.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === 'timeline' && (
                <div className="relative pl-7 border-l-2 border-slate-200 space-y-6 text-[13px]">
                  {selectedPolicyForDrawer.timeline.map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[35px] top-0.5 size-4.5 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-[14.5px]">{event.title}</h4>
                          <span className="text-[11.5px] text-slate-400 font-mono">{event.date}</span>
                        </div>
                        <p className="mt-1 text-slate-700 leading-relaxed">{event.detail}</p>
                        <p className="mt-1 text-[11.5px] text-slate-400 font-medium">Actor: {event.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
              <span className="text-[12.5px] text-slate-500 font-mono">
                ID: {selectedPolicyForDrawer.id}
              </span>
              <button
                onClick={() => setSelectedPolicyForDrawer(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
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
