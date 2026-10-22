'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  Layers,
  Building2,
  DollarSign,
  Calendar,
  X,
  ChevronRight,
  FileCheck2,
  Info,
  GitBranch,
  Search,
  PlusCircle,
  AlertTriangle,
  ExternalLink,
  User,
  Scale,
  SlidersHorizontal,
  CheckCheck,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Wrench,
  FileEdit,
  UserPlus,
  Zap,
} from 'lucide-react'
import {
  initialStatements,
  type StatementRecord,
  type StatementTransactionItem,
} from '@/data/broker/statements'
import {
  initialClients,
  type ClientItem,
} from '@/data/broker/clients'

type UploadStep = 1 | 2 | 3 | 4

const STEPS = [
  { step: 1, title: 'Upload Statement', desc: 'Select period & source file' },
  { step: 2, title: 'Processing & Extraction', desc: 'Data parsing pipeline' },
  { step: 3, title: 'Reconciliation Review', desc: 'Verify line matches' },
  { step: 4, title: 'Confirmation', desc: 'Committed to ledger' },
]

export default function UploadStatementPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<UploadStep>(1)

  // Super Admin Allocated Template Profile (Every broker has 1 allocated statement template)
  const [allocatedProfile, setAllocatedProfile] = useState({
    templateName: 'Standard Broker Remittance Template v2.4',
    remittanceMethod: 'Electronic ACH Remittance',
    mappingMode: 'Dynamic Column & Multi-Carrier Auto-Detection',
    status: 'Super Admin Allocated',
    carrierAutoDetect: true,
  })

  // Load super admin broker allocation if set
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('broker_statement_allocation_BRK-001')
      if (stored) {
        const parsed = JSON.parse(stored)
        setAllocatedProfile((prev) => ({
          ...prev,
          templateName: parsed.templateName || prev.templateName,
          remittanceMethod: parsed.remittanceMethod || prev.remittanceMethod,
        }))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Step 1: Form state (Statement period kept, carrier is auto-detected per template)
  const [uploadCarrier, setUploadCarrier] = useState('Multi-Carrier Remittance')
  const [uploadPeriodMonth, setUploadPeriodMonth] = useState('October')
  const [uploadPeriodYear, setUploadPeriodYear] = useState('2026')
  const [uploadMethod, setUploadMethod] = useState('Electronic ACH')
  const [uploadTemplate, setUploadTemplate] = useState('Standard Broker Remittance Template v2.4')
  const [selectedFile, setSelectedFile] = useState<{
    name: string
    size: string
    type: 'xlsx' | 'csv' | 'pdf'
  } | null>({
    name: 'Broker_Remittance_Statement_Oct2026.xlsx',
    size: '3.4 MB',
    type: 'xlsx',
  })

  // Step 2: Processing state
  const [pipelineProgress, setPipelineProgress] = useState(0)
  const [activePipelineStage, setActivePipelineStage] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Step 3: Matching preview transactions
  const [transactions, setTransactions] = useState<StatementTransactionItem[]>([
    {
      id: 'TXN-UP-1',
      statementId: 'ST-PENDING',
      lineIndex: 1,
      rawSourceRow: 'L1: POL-8842-TRV | COMMERCIAL AUTO | $14,500.00 | 15% | $2,175.00',
      policyNumber: 'POL-8842-TRV',
      clientName: 'Sarah Jenkins',
      businessName: 'Apex Logistics Corp',
      lineOfBusiness: 'Commercial Auto',
      carrier: 'Travelers',
      grossPremium: 14500,
      commissionRate: 15.0,
      paidCommission: 2175.0,
      expectedCommission: 2175.0,
      variance: 0.0,
      matchConfidence: 'High Confidence',
      matchScore: 99,
      ruleMatched: 'Exact Policy # & Client Tax ID Match',
      status: 'Auto-Matched',
    },
    {
      id: 'TXN-UP-2',
      statementId: 'ST-PENDING',
      lineIndex: 2,
      rawSourceRow: 'L2: POL-9941-TRV | COMM PROPERTY | $32,000.00 | 15% | $4,800.00',
      policyNumber: 'POL-9941-TRV',
      clientName: 'Arthur Miller',
      businessName: 'Acme Industrial Supplies',
      lineOfBusiness: 'Commercial Property',
      carrier: 'Travelers',
      grossPremium: 32000,
      commissionRate: 15.0,
      paidCommission: 4800.0,
      expectedCommission: 4800.0,
      variance: 0.0,
      matchConfidence: 'High Confidence',
      matchScore: 98,
      ruleMatched: 'Exact Policy # & Insured Match',
      status: 'Auto-Matched',
    },
    {
      id: 'TXN-UP-3',
      statementId: 'ST-PENDING',
      lineIndex: 3,
      rawSourceRow: 'L3: POL-1029-TRV | GENERAL LIAB | $8,200.00 | 14.5% | $1,189.00',
      policyNumber: 'POL-1029-TRV',
      clientName: 'Marcus Vance',
      businessName: 'Vance Design Studio',
      lineOfBusiness: 'General Liability',
      carrier: 'Travelers',
      grossPremium: 8200,
      commissionRate: 14.5,
      paidCommission: 1189.0,
      expectedCommission: 1230.0,
      variance: -41.0,
      matchConfidence: 'Possible Match',
      matchScore: 84,
      ruleMatched: 'Fuzzy Policy Suffix Variance (Endorsement)',
      status: 'Pending Broker Review',
    },
    {
      id: 'TXN-UP-4',
      statementId: 'ST-PENDING',
      lineIndex: 4,
      rawSourceRow: 'L4: POL-4491-TRV | CYBER LIAB | $18,400.00 | 16% | $2,944.00',
      policyNumber: 'POL-4491-TRV',
      clientName: 'Elena Rostova',
      businessName: 'Rostova BioTech Corp',
      lineOfBusiness: 'Cyber Liability',
      carrier: 'Travelers',
      grossPremium: 18400,
      commissionRate: 16.0,
      paidCommission: 2944.0,
      expectedCommission: 2944.0,
      variance: 0.0,
      matchConfidence: 'High Confidence',
      matchScore: 96,
      ruleMatched: 'Policy Number Exact Concordance',
      status: 'Auto-Matched',
    },
    {
      id: 'TXN-UP-5',
      statementId: 'ST-PENDING',
      lineIndex: 5,
      rawSourceRow: 'L5: POL-UNBOUND-90 | DIRECT BILL | $4,100.00 | 12% | $492.00',
      policyNumber: 'POL-9012-TRV-DB',
      clientName: 'David Zhang',
      businessName: 'Zhang & Sons Construction',
      lineOfBusiness: 'Commercial Umbrella',
      carrier: 'Travelers',
      grossPremium: 4100,
      commissionRate: 12.0,
      paidCommission: 492.0,
      expectedCommission: 0.0,
      variance: 492.0,
      matchConfidence: 'Unmatched',
      matchScore: 42,
      ruleMatched: 'Direct Bill Remittance Unbound in CRM',
      status: 'Action Required',
    },
  ])

  // Step 4: Final generated record
  const [createdRecord, setCreatedRecord] = useState<StatementRecord | null>(null)

  // Simulation handler for moving from Step 1 -> Step 2
  const handleStartExtraction = () => {
    setCurrentStep(2)
    setIsProcessing(true)
    setPipelineProgress(15)
    setActivePipelineStage(1)

    const timer1 = setTimeout(() => {
      setPipelineProgress(45)
      setActivePipelineStage(2)
    }, 700)

    const timer2 = setTimeout(() => {
      setPipelineProgress(75)
      setActivePipelineStage(3)
    }, 1400)

    const timer3 = setTimeout(() => {
      setPipelineProgress(100)
      setActivePipelineStage(4)
      setIsProcessing(false)
    }, 2100)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }

  // Confirm and Commit to Ledger (Step 3 -> Step 4)
  const handleCommitToLedger = () => {
    const newId = `ST-${Math.floor(2900 + Math.random() * 90)}`
    const totalVolume = transactions.reduce((sum, t) => sum + t.paidCommission, 0)
    const matchedCount = transactions.filter((t) => t.status === 'Auto-Matched' || t.status === 'Resolved').length
    const unmatchedCount = transactions.filter((t) => t.status === 'Action Required' || t.status === 'Pending Broker Review').length

    const record: StatementRecord = {
      id: newId,
      statementIdentifier: `${newId}-STMT-${uploadPeriodMonth.slice(0, 3).toUpperCase()}`,
      fileName: selectedFile?.name || `Remittance_${uploadPeriodMonth}${uploadPeriodYear}.xlsx`,
      fileType: selectedFile?.type || 'xlsx',
      fileSize: selectedFile?.size || '3.2 MB',
      carrier: 'Multi-Carrier Remittance',
      statementPeriod: `${uploadPeriodMonth.slice(0, 3)} ${uploadPeriodYear}`,
      statementPeriodDate: '2026-10-01',
      uploadDate: 'Just now',
      processingStatus: unmatchedCount > 0 ? 'Needs Review' : 'Completed',
      transactionsCount: transactions.length,
      matchedCount: matchedCount,
      unmatchedCount: unmatchedCount,
      needsReviewCount: unmatchedCount,
      highConfidenceCount: matchedCount,
      totalRemittance: totalVolume,
      paymentMethod: allocatedProfile.remittanceMethod,
      batchReference: `BATCH-${Date.now().toString().slice(-6)}`,
      mappingTemplate: allocatedProfile.templateName,
      extractedDate: 'Just now',
      normalizedDate: 'Just now',
      reprocessedCount: 0,
      notes: `Ingested via Super Admin allocated statement template: ${allocatedProfile.templateName}.`,
      processingPipelineStep: 9,
      auditHistory: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: 'Jordan Davis (Principal Broker)',
          action: 'Statement Ingestion & Reconciliation Complete',
          notes: 'Transactions verified and committed to broker commission ledger.',
        },
      ],
      transactions: transactions.map((t) => ({ ...t, statementId: newId })),
    }

    setCreatedRecord(record)

    // Save to localStorage so All Statements list updates immediately
    try {
      const stored = localStorage.getItem('broker_custom_statements')
      const existing: StatementRecord[] = stored ? JSON.parse(stored) : []
      localStorage.setItem('broker_custom_statements', JSON.stringify([record, ...existing]))
    } catch (e) {
      console.error(e)
    }

    setCurrentStep(4)
  }

  // ───── Reconciliation Review & Link Modal State ─────
  const [reviewingTxn, setReviewingTxn] = useState<StatementTransactionItem | null>(null)
  const [reviewTab, setReviewTab] = useState<'candidates' | 'fix' | 'create' | 'search'>('candidates')
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')

  // Fix Discrepancy Form State (Next Tab: Fix It)
  const [fixPolicyNumber, setFixPolicyNumber] = useState('')
  const [fixClientName, setFixClientName] = useState('')
  const [fixBusinessName, setFixBusinessName] = useState('')
  const [fixCoverage, setFixCoverage] = useState('')
  const [fixGrossPremium, setFixGrossPremium] = useState('')
  const [fixCommRate, setFixCommRate] = useState('')
  const [fixVarianceAction, setFixVarianceAction] = useState('Accept endorsement variance & balance line')
  const [fixAdjustmentNote, setFixAdjustmentNote] = useState('')
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [selectedSearchPolicy, setSelectedSearchPolicy] = useState<{
    clientId: string
    clientName: string
    businessName: string
    policyNumber: string
    coverage: string
    premium: string
    carrier: string
    status: string
  } | null>(null)
  const [resolutionReason, setResolutionReason] = useState('Endorsement & rate variance accepted')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Quick Add Client State (Few-clicks client addition)
  const [quickAddTxn, setQuickAddTxn] = useState<StatementTransactionItem | null>(null)
  const [quickAddClientName, setQuickAddClientName] = useState('')
  const [quickAddBusinessName, setQuickAddBusinessName] = useState('')
  const [quickAddClientType, setQuickAddClientType] = useState<'Commercial' | 'Individual'>('Commercial')
  const [quickAddPolicyNumber, setQuickAddPolicyNumber] = useState('')
  const [quickAddCoverage, setQuickAddCoverage] = useState('')
  const [quickAddPremium, setQuickAddPremium] = useState('')
  const [quickAddRate, setQuickAddRate] = useState('')

  // Step 3 Table Column Sorting (A to Z / Z to A)
  type UploadTxnSortField =
    | 'policyNumber'
    | 'client'
    | 'coverage'
    | 'premium'
    | 'rate'
    | 'remittance'
    | 'status'

  const [txnSortField, setTxnSortField] = useState<UploadTxnSortField>('policyNumber')
  const [txnSortDirection, setTxnSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleTxnSort = (field: UploadTxnSortField) => {
    if (txnSortField === field) {
      setTxnSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setTxnSortField(field)
      setTxnSortDirection('asc')
    }
  }

  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
      let comparison = 0
      switch (txnSortField) {
        case 'policyNumber':
          comparison = a.policyNumber.localeCompare(b.policyNumber)
          break
        case 'client':
          comparison = (a.clientName || a.businessName).localeCompare(b.clientName || b.businessName)
          break
        case 'coverage':
          comparison = a.lineOfBusiness.localeCompare(b.lineOfBusiness)
          break
        case 'premium':
          comparison = a.grossPremium - b.grossPremium
          break
        case 'rate':
          comparison = a.commissionRate - b.commissionRate
          break
        case 'remittance':
          comparison = a.paidCommission - b.paidCommission
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }
      return txnSortDirection === 'asc' ? comparison : -comparison
    })
  }, [transactions, txnSortField, txnSortDirection])

  const renderTxnSortHeader = (
    field: UploadTxnSortField,
    label: string,
    alignRight = false,
    className = ''
  ) => {
    const isActive = txnSortField === field
    const title =
      isActive && txnSortDirection === 'asc'
        ? `Sorted A to Z (Click for Z to A)`
        : `Sort by ${label} (A to Z)`

    return (
      <button
        type="button"
        onClick={() => handleTxnSort(field)}
        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
          alignRight ? 'flex-row-reverse text-right' : ''
        } ${isActive ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} ${className}`}
        title={title}
      >
        <span>{label}</span>
        <span
          className={`inline-flex items-center justify-center rounded p-0.5 transition ${
            isActive
              ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-700/50'
              : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-200'
          }`}
        >
          {isActive ? (
            txnSortDirection === 'asc' ? (
              <ArrowUp className="size-3.5 stroke-[2.5]" />
            ) : (
              <ArrowDown className="size-3.5 stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
          )}
        </span>
      </button>
    )
  }

  // New Client Form State (if client not in Book of Business)
  const [newClientName, setNewClientName] = useState('')
  const [newBusinessName, setNewBusinessName] = useState('')
  const [newClientType, setNewClientType] = useState<'Commercial' | 'Individual'>('Commercial')
  const [newPolicyNumber, setNewPolicyNumber] = useState('')
  const [newLineOfBusiness, setNewLineOfBusiness] = useState('')
  const [newGrossPremium, setNewGrossPremium] = useState('')
  const [newCommRate, setNewCommRate] = useState('')
  const [newBillingMethod, setNewBillingMethod] = useState<'Direct Bill' | 'Agency Bill'>('Direct Bill')

  // Custom clients loaded from localStorage
  const [customClients, setCustomClients] = useState<ClientItem[]>([])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('broker_custom_clients')
      if (stored) {
        setCustomClients(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Candidate Match Item Interface
  interface MatchCandidateItem {
    id: string
    clientName: string
    businessName: string
    policyNumber: string
    coverage: string
    carrier: string
    bookPremium: number
    commRate: number
    expectedCommission: number
    remittance: number
    variance: number
    matchScore: number
    confidence: 'High Confidence' | 'Possible Match' | 'Low Confidence'
    matchReason: string
    policyStatus: string
    detail: string
    isExistingClient: boolean
  }

  // Generate candidate matches for a statement item
  const getCandidateMatches = (txn: StatementTransactionItem): MatchCandidateItem[] => {
    if (txn.id === 'TXN-UP-3') {
      return [
        {
          id: 'CAND-VANCE-1',
          clientName: 'Marcus Vance',
          businessName: 'Vance Design Studio',
          policyNumber: 'POL-1029-TRV-A',
          coverage: 'General Liability',
          carrier: 'Travelers',
          bookPremium: 8200,
          commRate: 15.0,
          expectedCommission: 1230.0,
          remittance: txn.paidCommission,
          variance: -41.0,
          matchScore: 92,
          confidence: 'High Confidence',
          matchReason: 'Fuzzy Policy Suffix Variance (Endorsement)',
          policyStatus: 'Active',
          detail:
            'CRM has base policy POL-1029-TRV-A @ 15.0% ($1,230.00). Carrier statement remitted $1,189.00 reflecting a 0.5% rate endorsement reduction.',
          isExistingClient: true,
        },
        {
          id: 'CAND-VANCE-2',
          clientName: 'Marcus Vance',
          businessName: 'Vance Design Studio',
          policyNumber: 'POL-1029-UMB',
          coverage: 'Commercial Umbrella',
          carrier: 'Travelers',
          bookPremium: 3500,
          commRate: 12.0,
          expectedCommission: 420.0,
          remittance: txn.paidCommission,
          variance: 769.0,
          matchScore: 78,
          confidence: 'Possible Match',
          matchReason: 'Same Insured & Carrier, Coverage Line Differential',
          policyStatus: 'Active',
          detail:
            'Same client account in CRM with active Commercial Umbrella policy. Remittance amount exceeds expected umbrella commission.',
          isExistingClient: true,
        },
        {
          id: 'CAND-VANCE-3',
          clientName: 'Marcus Vance',
          businessName: 'Vance Logistics LLC',
          policyNumber: 'POL-1030-TRV',
          coverage: 'Commercial Auto',
          carrier: 'Travelers',
          bookPremium: 12400,
          commRate: 15.0,
          expectedCommission: 1860.0,
          remittance: txn.paidCommission,
          variance: -671.0,
          matchScore: 64,
          confidence: 'Possible Match',
          matchReason: 'Related Corporate Entity / Same Named Contact',
          policyStatus: 'Active',
          detail: 'Associated corporate entity where Marcus Vance is listed as principal operating officer.',
          isExistingClient: true,
        },
      ]
    }

    if (txn.id === 'TXN-UP-5') {
      return [
        {
          id: 'CAND-ZHANG-1',
          clientName: 'David Zhang',
          businessName: 'Zhang & Sons Construction',
          policyNumber: 'POL-9012-TRV',
          coverage: 'Commercial Property',
          carrier: 'Travelers',
          bookPremium: 4100,
          commRate: 12.0,
          expectedCommission: 492.0,
          remittance: txn.paidCommission,
          variance: 0.0,
          matchScore: 88,
          confidence: 'High Confidence',
          matchReason: 'Base Policy Suffix Reconciliation (-DB direct bill)',
          policyStatus: 'Active',
          detail:
            'CRM has base policy POL-9012-TRV ($4,100 gross @ 12% = $492.00). Carrier statement included suffix -DB for electronic EFT direct billing.',
          isExistingClient: true,
        },
        {
          id: 'CAND-ZHANG-2',
          clientName: 'David Zhang',
          businessName: 'Zhang & Sons Construction',
          policyNumber: 'POL-8812-TRV',
          coverage: 'General Liability',
          carrier: 'Travelers',
          bookPremium: 5600,
          commRate: 14.0,
          expectedCommission: 784.0,
          remittance: txn.paidCommission,
          variance: -292.0,
          matchScore: 61,
          confidence: 'Possible Match',
          matchReason: 'Same Insured Client, Separate Active Policy',
          policyStatus: 'Active',
          detail: 'Same client account in CRM with active General Liability coverage.',
          isExistingClient: true,
        },
      ]
    }

    // Default dynamic lookup from CRM clients
    const results: MatchCandidateItem[] = []
    const all = [...customClients, ...initialClients]
    const searchTerms = [
      txn.clientName.toLowerCase(),
      txn.businessName.toLowerCase(),
      txn.policyNumber.toLowerCase().replace(/[^a-z0-9]/g, ''),
    ]

    all.forEach((client) => {
      const cName = `${client.firstName} ${client.lastName}`.toLowerCase()
      const bName = (client.businessName || '').toLowerCase()
      const isClientMatch =
        searchTerms[0].includes(cName) ||
        cName.includes(searchTerms[0]) ||
        (bName && (searchTerms[1].includes(bName) || bName.includes(searchTerms[1])))

      client.policies.forEach((pol, pIdx) => {
        const cleanPolNum = pol.policyNumber.toLowerCase().replace(/[^a-z0-9]/g, '')
        const isPolMatch = cleanPolNum.includes(searchTerms[2]) || searchTerms[2].includes(cleanPolNum)

        if (isClientMatch || isPolMatch) {
          const numPrem = parseFloat(pol.premium.replace(/[^0-9.]/g, '')) || txn.grossPremium
          const rate = parseFloat((pol.rateSplit || '15%').replace(/[^0-9.]/g, '')) || txn.commissionRate
          const exp = (numPrem * rate) / 100
          results.push({
            id: `CAND-${client.id}-${pIdx}`,
            clientName: `${client.firstName} ${client.lastName}`,
            businessName: client.businessName || '',
            policyNumber: pol.policyNumber,
            coverage: pol.type,
            carrier: pol.carrier || txn.carrier,
            bookPremium: numPrem,
            commRate: rate,
            expectedCommission: exp,
            remittance: txn.paidCommission,
            variance: Number((txn.paidCommission - exp).toFixed(2)),
            matchScore: isPolMatch ? 95 : 80,
            confidence: isPolMatch ? 'High Confidence' : 'Possible Match',
            matchReason: isPolMatch ? 'Exact / Suffix Policy Number Concordance' : 'Insured Name Concordance in CRM',
            policyStatus: pol.status || 'Active',
            detail: `Found in Book of Business under ${client.firstName} ${client.lastName} (${client.businessName || 'Individual'}).`,
            isExistingClient: true,
          })
        }
      })
    })

    return results
  }

  const populateFixForm = (cand?: MatchCandidateItem, txn?: StatementTransactionItem) => {
    const currentTxn = txn || reviewingTxn
    if (!currentTxn) return
    if (cand) {
      setFixPolicyNumber(cand.policyNumber)
      setFixClientName(cand.clientName)
      setFixBusinessName(cand.businessName)
      setFixCoverage(cand.coverage)
      setFixGrossPremium(cand.bookPremium.toString())
      setFixCommRate(cand.commRate.toString())
      setFixVarianceAction('Accept endorsement variance & balance line')
      setFixAdjustmentNote(`Reconciled variance with candidate match ${cand.policyNumber}. ${cand.matchReason}`)
    } else {
      setFixPolicyNumber(currentTxn.policyNumber)
      setFixClientName(currentTxn.clientName)
      setFixBusinessName(currentTxn.businessName)
      setFixCoverage(currentTxn.lineOfBusiness)
      setFixGrossPremium(currentTxn.grossPremium.toString())
      setFixCommRate(currentTxn.commissionRate.toString())
      setFixVarianceAction('Manual policy correction & balance')
      setFixAdjustmentNote('Policy details and rate adjusted by broker')
    }
  }

  // Open reconciliation modal
  const handleOpenReviewModal = (txn: StatementTransactionItem) => {
    setReviewingTxn(txn)
    setClientSearchQuery('')
    setSelectedSearchPolicy(null)
    setResolutionReason(
      txn.id === 'TXN-UP-3'
        ? 'Endorsement & rate variance accepted'
        : txn.id === 'TXN-UP-5'
        ? 'Direct-bill unbound remittance linked'
        : 'Reconciled and confirmed by broker'
    )
    setResolutionNotes(txn.resolutionNote || '')

    // Pre-populate new client form in case they need to add client
    setNewClientName(txn.clientName)
    setNewBusinessName(txn.businessName)
    setNewClientType(txn.businessName ? 'Commercial' : 'Individual')
    setNewPolicyNumber(txn.policyNumber)
    setNewLineOfBusiness(txn.lineOfBusiness)
    setNewGrossPremium(txn.grossPremium.toString())
    setNewCommRate(txn.commissionRate.toString())
    setNewBillingMethod('Direct Bill')

    const candidates = getCandidateMatches(txn)
    if (candidates.length > 0) {
      setSelectedCandidateId(candidates[0].id)
      populateFixForm(candidates[0], txn)
      setReviewTab('candidates')
    } else {
      setSelectedCandidateId('')
      populateFixForm(undefined, txn)
      setReviewTab('search')
    }
  }

  // Filtered policies for Search Book of Business Tab
  const searchedPolicies = React.useMemo(() => {
    if (!clientSearchQuery.trim()) return []
    const q = clientSearchQuery.toLowerCase()
    const all = [...customClients, ...initialClients]
    const list: Array<{
      clientId: string
      clientName: string
      businessName: string
      policyNumber: string
      coverage: string
      premium: string
      carrier: string
      status: string
    }> = []

    all.forEach((c) => {
      const matchClient =
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        (c.businessName && c.businessName.toLowerCase().includes(q)) ||
        c.id.toLowerCase().includes(q)

      c.policies.forEach((p) => {
        const matchPol = p.policyNumber.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
        if (matchClient || matchPol) {
          list.push({
            clientId: c.id,
            clientName: `${c.firstName} ${c.lastName}`,
            businessName: c.businessName || '',
            policyNumber: p.policyNumber,
            coverage: p.type,
            premium: p.premium,
            carrier: p.carrier,
            status: p.status,
          })
        }
      })
    })

    return list.slice(0, 10)
  }, [clientSearchQuery, customClients])

  // Confirm match link from candidate list
  const handleConfirmCandidateLink = () => {
    if (!reviewingTxn) return
    const candidates = getCandidateMatches(reviewingTxn)
    const selected = candidates.find((c) => c.id === selectedCandidateId)
    if (!selected) return

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === reviewingTxn.id
          ? {
              ...t,
              status: 'Resolved',
              matchConfidence: 'High Confidence',
              matchScore: selected.matchScore,
              policyNumber: selected.policyNumber,
              clientName: selected.clientName,
              businessName: selected.businessName,
              expectedCommission: selected.expectedCommission,
              variance: selected.variance,
              ruleMatched: `Manual Match: ${selected.matchReason}`,
              resolutionNote: resolutionNotes.trim()
                ? resolutionNotes
                : `${resolutionReason}. Linked to policy ${selected.policyNumber}.`,
            }
          : t
      )
    )

    setToastMessage(`Policy ${selected.policyNumber} (${selected.clientName}) linked and reconciled!`)
    setTimeout(() => setToastMessage(null), 4000)
    setReviewingTxn(null)
  }

  // Confirm match link from search tab
  const handleConfirmSearchPolicyLink = () => {
    if (!reviewingTxn || !selectedSearchPolicy) return

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === reviewingTxn.id
          ? {
              ...t,
              status: 'Resolved',
              matchConfidence: 'High Confidence',
              matchScore: 95,
              policyNumber: selectedSearchPolicy.policyNumber,
              clientName: selectedSearchPolicy.clientName,
              businessName: selectedSearchPolicy.businessName,
              ruleMatched: `Manual Search Match: Linked to CRM policy ${selectedSearchPolicy.policyNumber}`,
              resolutionNote: resolutionNotes.trim()
                ? resolutionNotes
                : `Manually linked to CRM policy ${selectedSearchPolicy.policyNumber} (${selectedSearchPolicy.clientName}).`,
            }
          : t
      )
    )

    setToastMessage(`Linked to ${selectedSearchPolicy.policyNumber} (${selectedSearchPolicy.clientName}) from Book of Business.`)
    setTimeout(() => setToastMessage(null), 4000)
    setReviewingTxn(null)
  }

  // Apply Fix & Reconcile (Next Tab: Fix Discrepancy & Adjust)
  const handleApplyFix = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!reviewingTxn) return

    const numPrem = parseFloat(fixGrossPremium.replace(/[^0-9.]/g, '')) || reviewingTxn.grossPremium
    const numRate = parseFloat(fixCommRate.replace(/[^0-9.]/g, '')) || reviewingTxn.commissionRate
    const newExpected = Number(((numPrem * numRate) / 100).toFixed(2))
    const newVariance = Number((reviewingTxn.paidCommission - newExpected).toFixed(2))

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === reviewingTxn.id
          ? {
              ...t,
              status: 'Resolved',
              matchConfidence: 'High Confidence',
              matchScore: 100,
              policyNumber: fixPolicyNumber.trim() || t.policyNumber,
              clientName: fixClientName.trim() || t.clientName,
              businessName: fixBusinessName.trim() || t.businessName,
              lineOfBusiness: fixCoverage.trim() || t.lineOfBusiness,
              grossPremium: numPrem,
              commissionRate: numRate,
              expectedCommission: newExpected,
              variance: newVariance,
              ruleMatched: `Broker Fix: ${fixVarianceAction}`,
              resolutionNote: fixAdjustmentNote.trim()
                ? fixAdjustmentNote
                : `Discrepancy fixed by broker (${fixVarianceAction}). Policy ${fixPolicyNumber} reconciled.`,
            }
          : t
      )
    )

    setToastMessage(`Discrepancy fixed! Policy ${fixPolicyNumber} has been updated and reconciled.`)
    setTimeout(() => setToastMessage(null), 4000)
    setReviewingTxn(null)
  }

  // Open Quick Add Client Modal (Fast, few clicks)
  const handleOpenQuickAdd = (txn: StatementTransactionItem) => {
    setQuickAddTxn(txn)
    setQuickAddClientName(txn.clientName)
    setQuickAddBusinessName(txn.businessName)
    setQuickAddClientType(txn.businessName ? 'Commercial' : 'Individual')
    setQuickAddPolicyNumber(txn.policyNumber)
    setQuickAddCoverage(txn.lineOfBusiness)
    setQuickAddPremium(txn.grossPremium.toString())
    setQuickAddRate(txn.commissionRate.toString())
  }

  // Confirm Quick Add Client in Few Clicks
  const handleConfirmQuickAdd = (txnToUse?: StatementTransactionItem) => {
    const targetTxn = txnToUse || quickAddTxn
    if (!targetTxn) return

    const newId = `CL-${Math.floor(1200 + Math.random() * 800)}`
    const isUsingQuickModal = Boolean(!txnToUse && quickAddTxn)
    const clientFullName = (isUsingQuickModal ? quickAddClientName.trim() : '') || targetTxn.clientName
    const bName =
      (isUsingQuickModal ? quickAddBusinessName.trim() : '') ||
      targetTxn.businessName ||
      (quickAddClientType === 'Commercial' ? clientFullName : '')
    const polNum = (isUsingQuickModal ? quickAddPolicyNumber.trim() : '') || targetTxn.policyNumber
    const coverage = (isUsingQuickModal ? quickAddCoverage.trim() : '') || targetTxn.lineOfBusiness
    const grossNum =
      parseFloat((isUsingQuickModal ? quickAddPremium : '').replace(/[^0-9.]/g, '')) || targetTxn.grossPremium
    const rateNum =
      parseFloat((isUsingQuickModal ? quickAddRate : '').replace(/[^0-9.]/g, '')) || targetTxn.commissionRate

    const newClientObj: ClientItem = {
      id: newId,
      firstName: clientFullName.split(' ')[0] || clientFullName,
      lastName: clientFullName.split(' ').slice(1).join(' ') || '',
      name: bName || clientFullName,
      businessName: bName,
      clientType: quickAddClientType,
      clientSince: 'Today (Quick Add)',
      dob: '1985-05-15',
      phone: '+1 (416) 555-0199',
      email: `${clientFullName.toLowerCase().replace(/[^a-z]/g, '.')}@example.com`,
      street: '450 Bay Street, Suite 1200',
      city: 'Toronto',
      state: 'ON',
      zip: 'M5H 2V9',
      province: 'ON',
      postalCode: 'M5H 2V9',
      brokerCode: 'BRK-8821',
      otherIdentifier: `STMT-QUICK-${newId}`,
      status: 'Active',
      linesOfBusiness: [coverage],
      yearlyPremium: `$${grossNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      insurerName: targetTxn.carrier,
      marketingConsent: {
        status: 'Granted',
        channels: ['Email', 'Phone'],
        consentDate: 'Today',
        method: 'Carrier Statement Quick Add',
        notes: 'Client auto-created via Statement Quick Add',
      },
      notes: [
        {
          id: `note-${Date.now()}`,
          date: 'Today',
          author: 'Statement Quick Add',
          text: `Client created with few clicks for policy ${polNum}. Remittance ${fmtCurrency(
            targetTxn.paidCommission
          )} reconciled.`,
        },
      ],
      lastActivity: {
        description: `Quick Add from Carrier Statement (${targetTxn.carrier})`,
        time: 'Just now',
      },
      policies: [
        {
          id: `pol-${Date.now()}`,
          policyNumber: polNum,
          type: coverage,
          carrier: targetTxn.carrier,
          premium: `$${grossNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          effectiveDate: new Date().toISOString().split('T')[0],
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Active',
          rateSplit: `${rateNum}% / 100%`,
          expectedCommission: `$${targetTxn.paidCommission.toFixed(2)}`,
          paidCommission: `$${targetTxn.paidCommission.toFixed(2)}`,
          netCommission: `$${targetTxn.paidCommission.toFixed(2)}`,
          commissionStatus: 'Paid',
          paymentStatus: 'Paid',
          billingMethod: 'Direct Bill',
          paymentDate: 'Today',
          paymentNote: `Reconciled from ${targetTxn.carrier} statement batch.`,
        },
      ],
      commissions: [
        {
          id: `comm-${Date.now()}`,
          date: 'Today',
          statementNumber: targetTxn.statementId,
          carrier: targetTxn.carrier,
          policyNumber: polNum,
          premium: `$${grossNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          rate: `${rateNum}%`,
          amount: `$${targetTxn.paidCommission.toFixed(2)}`,
          status: 'Paid',
        },
      ],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'Client Quick-Added & Reconciled',
          type: 'policy',
          date: 'Today',
          detail: `Policy ${polNum} created and linked to statement remittance ${fmtCurrency(targetTxn.paidCommission)}.`,
          actor: 'Reconciliation Quick Add',
        },
      ],
      paymentStatus: 'Paid',
      effectiveDate: new Date().toISOString().split('T')[0],
    }

    try {
      const stored = localStorage.getItem('broker_custom_clients')
      const existing: ClientItem[] = stored ? JSON.parse(stored) : []
      const updated = [newClientObj, ...existing]
      localStorage.setItem('broker_custom_clients', JSON.stringify(updated))
      setCustomClients(updated)
    } catch (e) {
      console.error(e)
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === targetTxn.id
          ? {
              ...t,
              status: 'Resolved',
              matchConfidence: 'High Confidence',
              matchScore: 100,
              policyNumber: polNum,
              clientName: clientFullName,
              businessName: bName,
              lineOfBusiness: coverage,
              grossPremium: grossNum,
              commissionRate: rateNum,
              expectedCommission: targetTxn.paidCommission,
              variance: 0,
              ruleMatched: 'Quick Add: Client Created & Reconciled with Few Clicks',
              resolutionNote: `Client ${clientFullName} quick-added to Book of Business. Policy ${polNum} reconciled.`,
            }
          : t
      )
    )

    setToastMessage(`⚡ Quick Add Success! ${clientFullName} added to Book of Business & policy ${polNum} reconciled!`)
    setTimeout(() => setToastMessage(null), 4500)
    setQuickAddTxn(null)
    if (reviewingTxn?.id === targetTxn.id) {
      setReviewingTxn(null)
    }
  }

  // Create & Link as New Client
  const handleCreateAndLinkNewClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingTxn) return

    const newId = `CL-${Math.floor(1200 + Math.random() * 800)}`
    const clientFullName = newClientName.trim() || reviewingTxn.clientName
    const bName = newBusinessName.trim() || (newClientType === 'Commercial' ? clientFullName : '')
    const polNum = newPolicyNumber.trim() || reviewingTxn.policyNumber
    const coverage = newLineOfBusiness.trim() || reviewingTxn.lineOfBusiness
    const grossNum = parseFloat(newGrossPremium.replace(/[^0-9.]/g, '')) || reviewingTxn.grossPremium
    const rateNum = parseFloat(newCommRate.replace(/[^0-9.]/g, '')) || reviewingTxn.commissionRate

    const newClientObj: ClientItem = {
      id: newId,
      firstName: clientFullName.split(' ')[0] || clientFullName,
      lastName: clientFullName.split(' ').slice(1).join(' ') || '',
      name: bName || clientFullName,
      businessName: bName,
      clientType: newClientType,
      clientSince: 'Today (Statement Ingestion)',
      dob: '1985-05-15',
      phone: '+1 (416) 555-0199',
      email: `${clientFullName.toLowerCase().replace(/[^a-z]/g, '.')}@example.com`,
      street: '450 Bay Street, Suite 1200',
      city: 'Toronto',
      state: 'ON',
      zip: 'M5H 2V9',
      province: 'ON',
      postalCode: 'M5H 2V9',
      brokerCode: 'BRK-8821',
      otherIdentifier: `STMT-INGEST-${newId}`,
      status: 'Active',
      linesOfBusiness: [coverage],
      yearlyPremium: `$${grossNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      insurerName: reviewingTxn.carrier,
      marketingConsent: {
        status: 'Granted',
        channels: ['Email', 'Phone'],
        consentDate: 'Today',
        method: 'Carrier Remittance Ingestion',
        notes: 'Client auto-created via Statement Reconciliation Review',
      },
      notes: [
        {
          id: `note-${Date.now()}`,
          date: 'Today',
          author: 'Reconciliation Pipeline',
          text: `Client created automatically via Statement Reconciliation Review for policy ${polNum}. Remittance ${fmtCurrency(
            reviewingTxn.paidCommission
          )} linked.`,
        },
      ],
      lastActivity: {
        description: `Created & Linked from Carrier Statement (${reviewingTxn.carrier})`,
        time: 'Just now',
      },
      policies: [
        {
          id: `pol-${Date.now()}`,
          policyNumber: polNum,
          type: coverage,
          carrier: reviewingTxn.carrier,
          premium: `$${grossNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          effectiveDate: new Date().toISOString().split('T')[0],
          expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Active',
          rateSplit: `${rateNum}% / 100%`,
          expectedCommission: `$${reviewingTxn.paidCommission.toFixed(2)}`,
          paidCommission: `$${reviewingTxn.paidCommission.toFixed(2)}`,
          netCommission: `$${reviewingTxn.paidCommission.toFixed(2)}`,
          commissionStatus: 'Paid',
          paymentStatus: 'Paid',
          billingMethod: newBillingMethod,
          paymentDate: 'Today',
          paymentNote: `Reconciled from ${reviewingTxn.carrier} statement batch.`,
        },
      ],
      commissions: [
        {
          id: `comm-${Date.now()}`,
          date: 'Today',
          statementNumber: reviewingTxn.statementId,
          carrier: reviewingTxn.carrier,
          policyNumber: polNum,
          premium: `$${grossNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          rate: `${rateNum}%`,
          amount: `$${reviewingTxn.paidCommission.toFixed(2)}`,
          status: 'Paid',
        },
      ],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'New Client & Policy Ingested',
          type: 'policy',
          date: 'Today',
          detail: `Policy ${polNum} created and linked to statement remittance ${fmtCurrency(reviewingTxn.paidCommission)}.`,
          actor: 'Reconciliation Pipeline',
        },
      ],
      paymentStatus: 'Paid',
      effectiveDate: new Date().toISOString().split('T')[0],
    }

    try {
      const stored = localStorage.getItem('broker_custom_clients')
      const existing: ClientItem[] = stored ? JSON.parse(stored) : []
      const updated = [newClientObj, ...existing]
      localStorage.setItem('broker_custom_clients', JSON.stringify(updated))
      setCustomClients(updated)
    } catch (e) {
      console.error(e)
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === reviewingTxn.id
          ? {
              ...t,
              status: 'Resolved',
              matchConfidence: 'High Confidence',
              matchScore: 100,
              clientName: clientFullName,
              businessName: bName,
              policyNumber: polNum,
              lineOfBusiness: coverage,
              grossPremium: grossNum,
              commissionRate: rateNum,
              expectedCommission: t.paidCommission,
              variance: 0,
              ruleMatched: `New Client Created (${newId}) & Policy Bound in Book of Business`,
              resolutionNote: resolutionNotes.trim()
                ? resolutionNotes
                : `Created new client ${clientFullName} (${newId}) and bound policy ${polNum}. Reconciled.`,
            }
          : t
      )
    )

    setToastMessage(`New client "${clientFullName}" (${newId}) created and policy ${polNum} linked!`)
    setTimeout(() => setToastMessage(null), 4000)
    setReviewingTxn(null)
  }

  // Flag as carrier dispute
  const handleFlagDispute = () => {
    if (!reviewingTxn) return

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === reviewingTxn.id
          ? {
              ...t,
              status: 'Disputed',
              matchConfidence: 'Unmatched',
              resolutionNote: resolutionNotes.trim()
                ? resolutionNotes
                : 'Flagged for carrier audit inquiry. Discrepancy under broker investigation.',
            }
          : t
      )
    )

    setToastMessage(`Transaction for ${reviewingTxn.policyNumber} flagged as Carrier Dispute.`)
    setTimeout(() => setToastMessage(null), 4000)
    setReviewingTxn(null)
  }

  const fmtCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val)

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d18] px-4 py-6 sm:px-8">
      {/* ───── Breadcrumb & Page Header ───── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/broker/statements" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Statements
            </Link>
            <ChevronRight className="size-3 text-slate-400 dark:text-slate-600" />
            <span className="text-slate-900 dark:text-white font-semibold">Upload New Statement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Upload Carrier Statement
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Automated extraction, normalization, and reconciliation pipeline for commission statements.
          </p>
        </div>

        <Link
          href="/broker/statements"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition self-start sm:self-auto"
        >
          <ArrowLeft className="size-3.5 text-slate-500 dark:text-slate-400" />
          <span>All Statements</span>
        </Link>
      </div>

      {/* ───── Stepper Progress Bar ───── */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.step
            const isCurrent = currentStep === s.step
            return (
              <div
                key={s.step}
                className={`flex items-center gap-3 rounded-xl p-2.5 transition-all ${isCurrent
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-blue-200 dark:ring-blue-800/60'
                    : isCompleted
                      ? 'bg-slate-50 dark:bg-slate-800/40'
                      : 'opacity-60'
                  }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition ${isCompleted
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {isCompleted ? <Check className="size-4 stroke-[3]" /> : s.step}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-950 dark:text-blue-300' : isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'
                      }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STEP 1: UPLOAD & SETUP
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-white/10 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800/50">
                <Upload className="size-4" />
              </span>
              Step 1: Statement Specifications
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select the statement period and upload your remittance document. Template mapping &amp; remittance payment methods are configured in Super Admin.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Statement Period (Kept as per client requirement) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Statement Period <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={uploadPeriodMonth}
                  onChange={(e) => setUploadPeriodMonth(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 cursor-pointer"
                >
                  <option value="October">October</option>
                  <option value="September">September</option>
                  <option value="August">August</option>
                  <option value="July">July</option>
                  <option value="June">June</option>
                  <option value="May">May</option>
                </select>
                <select
                  value={uploadPeriodYear}
                  onChange={(e) => setUploadPeriodYear(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800 px-3 text-xs sm:text-sm font-medium text-slate-800 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 cursor-pointer"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Period covering your carrier commissions and ledger entries.
              </p>
            </div>

            {/* Super Admin Allocated Template & Remittance Profile (Read-only for broker) */}
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
                  <span>Broker Allocated Template</span>
                </span>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50">
                  Super Admin Allocated
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Statement Template:</span>
                  <span className="font-semibold text-slate-800 dark:text-white truncate max-w-[200px]" title={allocatedProfile.templateName}>
                    {allocatedProfile.templateName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Remittance Method:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 text-[11px]">
                    {allocatedProfile.remittanceMethod}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Carrier Partner:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                    Multi-Carrier Auto-Detect
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Mapping Info Alert */}
          <div className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <Info className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Single Statement Template Active:</strong> Every broker is allocated 1 dynamic template statement. Carrier partners (Travelers, Chubb, Hartford, etc.), remittance methods, and field mappings are configured in <strong>Super Admin</strong> and dynamically auto-mapped from your uploaded file.
            </p>
          </div>

          {/* Statement File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Statement Source Document <span className="text-rose-500">*</span>
            </label>
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50/70 dark:bg-slate-800/30 p-6 sm:p-8 text-center transition hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/10 dark:hover:bg-blue-950/20">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 shadow-xs ring-1 ring-slate-200 dark:ring-white/10 text-blue-600 dark:text-blue-400 mb-3">
                <Upload className="size-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drag and drop your statement file here, or{' '}
                <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">browse file</span>
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Agreed Excel (.xlsx, .xls), CSV (.csv), or structured PDF (.pdf) statements.
              </p>

              {/* Sample files chips */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFile({
                      name: 'Travelers_Oct2026_ACH_Batch.xlsx',
                      size: '3.4 MB',
                      type: 'xlsx',
                    })
                  }
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition"
                >
                  Use Sample Travelers XLSX
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFile({
                      name: 'Chubb_Monthly_Remittance_2026.csv',
                      size: '1.8 MB',
                      type: 'csv',
                    })
                  }
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition"
                >
                  Use Sample Chubb CSV
                </button>
              </div>

              {/* Selected File Card */}
              {selectedFile && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/70 dark:bg-blue-950/40 px-4 py-2.5 max-w-md mx-auto text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileSpreadsheet className="size-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">{selectedFile.size} · Ingestion Ready</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 p-1 cursor-pointer shrink-0"
                    title="Clear file"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
            <Link
              href="/broker/statements"
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleStartExtraction}
              disabled={!selectedFile}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-600 dark:hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
            >
              <span>Continue to Extraction Pipeline</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 2: PROCESSING & EXTRACTION PIPELINE
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 ring-1 ring-amber-100 dark:ring-amber-800/50">
                  <GitBranch className="size-4" />
                </span>
                Step 2: Processing &amp; Data Normalization Pipeline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Parsing source line items and matching against active client &amp; policy ledgers.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 ring-1 ring-blue-100 dark:ring-blue-800/50">
              {pipelineProgress}% Completed
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${pipelineProgress}%` }}
              />
            </div>
          </div>

          {/* 4 Pipeline Stages */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                num: 1,
                title: 'File Ingestion & OCR Cell Parsing',
                desc: 'Reading raw tabular matrix and checking column delimiter boundaries.',
                done: activePipelineStage >= 1,
              },
              {
                num: 2,
                title: 'Field Normalization & Schema Mapping',
                desc: 'Aligning carrier codes, policy identifiers, and gross premium amounts.',
                done: activePipelineStage >= 2,
              },
              {
                num: 3,
                title: 'Automated Commission Split Calculation',
                desc: 'Cross-referencing expected agency split rates and broker overrides.',
                done: activePipelineStage >= 3,
              },
              {
                num: 4,
                title: 'Policy Concordance & Match Verification',
                desc: 'Linking transactions to active client ledger binders in system.',
                done: activePipelineStage >= 4,
              },
            ].map((stage) => (
              <div
                key={stage.num}
                className={`rounded-xl border p-4 transition-all ${stage.done
                    ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 opacity-60'
                  }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${stage.done ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    {stage.done ? <Check className="size-3.5 stroke-[3]" /> : stage.num}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{stage.title}</h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-8.5">{stage.desc}</p>
              </div>
            ))}
          </div>

          {/* Raw Extraction Log Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-950 dark:bg-black/80 p-4 text-emerald-400 font-mono text-[11px] space-y-1">
            <p className="text-slate-400 dark:text-slate-500">// Ingestion Log Console:</p>
            <p>+ Allocated Template: {allocatedProfile.templateName} | Remittance: {allocatedProfile.remittanceMethod}</p>
            <p>+ Extracted 5 raw ledger transaction line rows from source file.</p>
            <p className={activePipelineStage >= 3 ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-600'}>
              + Calculated net commissions: $10,800.00 across active broker records.
            </p>
            <p className={activePipelineStage >= 4 ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-600'}>
              + 4 High Confidence matches, 1 pending variance requiring review.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Back to Setup
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 dark:bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-600 dark:hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
            >
              <span>Review Reconciliation Matches</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 3: RECONCILIATION REVIEW
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="max-w-6xl mx-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800/50">
                  <ShieldCheck className="size-4" />
                </span>
                Step 3: Reconciliation &amp; Line Match Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Review extracted transaction rows before final commitment to the general ledger.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800/50">
                {transactions.filter((t) => t.status === 'Auto-Matched' || t.status === 'Resolved').length} Matched
              </span>
              <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800/50">
                {transactions.filter((t) => t.status === 'Pending Broker Review' || t.status === 'Action Required').length} Action Req.
              </span>
              {transactions.filter((t) => t.status === 'Disputed').length > 0 && (
                <span className="rounded-full bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 text-rose-700 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-800/50">
                  {transactions.filter((t) => t.status === 'Disputed').length} Disputed
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  const unverified = transactions.find(
                    (t) => t.status !== 'Auto-Matched' && t.status !== 'Resolved' && t.status !== 'Disputed'
                  )
                  if (unverified) {
                    handleOpenQuickAdd(unverified)
                  } else {
                    handleOpenQuickAdd(transactions[0])
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-400 transition cursor-pointer shadow-2xs ml-1"
                title="Add unmatched client directly to Book of Business in few clicks"
              >
                <UserPlus className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>+ Quick Add Client</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/90 dark:bg-emerald-950/80 px-4 py-3 text-xs font-medium text-emerald-800 dark:text-emerald-200 shadow-xs animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <th className="px-3 py-3">
                    {renderTxnSortHeader('policyNumber', 'Policy #')}
                  </th>
                  <th className="px-3 py-3">
                    {renderTxnSortHeader('client', 'Client / Insured')}
                  </th>
                  <th className="px-3 py-3">
                    {renderTxnSortHeader('coverage', 'Coverage Line')}
                  </th>
                  <th className="px-2.5 py-3 text-right">
                    {renderTxnSortHeader('premium', 'Premium', true, 'justify-end w-full')}
                  </th>
                  <th className="px-2.5 py-3 text-right">
                    {renderTxnSortHeader('rate', 'Comm. Rate', true, 'justify-end w-full')}
                  </th>
                  <th className="px-2.5 py-3 text-right">
                    {renderTxnSortHeader('remittance', 'Remittance', true, 'justify-end w-full')}
                  </th>
                  <th className="px-3 py-3">
                    {renderTxnSortHeader('status', 'Match Status')}
                  </th>
                  <th className="px-3 py-3 text-right min-w-[190px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {sortedTransactions.map((txn) => {
                  const isResolvedOrMatched = txn.status === 'Auto-Matched' || txn.status === 'Resolved'
                  const isDisputed = txn.status === 'Disputed'

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-900 dark:text-white">{txn.policyNumber}</td>
                      <td className="px-3.5 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{txn.clientName}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">{txn.businessName}</p>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-600 dark:text-slate-400">{txn.lineOfBusiness}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-800 dark:text-slate-200">{fmtCurrency(txn.grossPremium)}</td>
                      <td className="px-3 py-3 text-right font-mono font-medium text-slate-600 dark:text-slate-400">
                        {txn.commissionRate}%
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {fmtCurrency(txn.paidCommission)}
                      </td>
                      <td className="px-3.5 py-3">
                        {isDisputed ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800/50">
                            <AlertTriangle className="size-3" />
                            <span>Disputed</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
                              isResolvedOrMatched
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800/50'
                                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-800/50'
                            }`}
                          >
                            {isResolvedOrMatched ? (
                              <CheckCircle2 className="size-3" />
                            ) : (
                              <AlertCircle className="size-3" />
                            )}
                            <span>{txn.status}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        {!isResolvedOrMatched && !isDisputed ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              id={`quick-add-btn-${txn.id}`}
                              type="button"
                              onClick={() => handleOpenQuickAdd(txn)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-400 transition cursor-pointer shadow-2xs"
                              title="Add client & policy to Book of Business with few clicks"
                            >
                              <UserPlus className="size-3 text-emerald-600 dark:text-emerald-400" />
                              <span>+ Quick Add</span>
                            </button>
                            <button
                              id={`resolve-btn-${txn.id}`}
                              type="button"
                              onClick={() => handleOpenReviewModal(txn)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-blue-700 transition cursor-pointer"
                            >
                              <GitBranch className="size-3" />
                              <span>Resolve &amp; Link</span>
                            </button>
                          </div>
                        ) : isDisputed ? (
                          <button
                            id={`dispute-btn-${txn.id}`}
                            type="button"
                            onClick={() => handleOpenReviewModal(txn)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/40 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer"
                          >
                            <span>Review Dispute</span>
                            <ChevronRight className="size-3" />
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                              <CheckCircle2 className="size-3" />
                              {txn.status === 'Resolved' ? 'Resolved' : 'Matched'}
                            </span>
                            <button
                              id={`review-btn-${txn.id}`}
                              type="button"
                              onClick={() => handleOpenReviewModal(txn)}
                              className="rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                            >
                              Review
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Back to Pipeline
            </button>
            <button
              type="button"
              onClick={handleCommitToLedger}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              <span>Commit &amp; Save to Statements Ledger</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RECONCILIATION REVIEW & LINK MODAL
          ══════════════════════════════════════════════════════════════════ */}
          {reviewingTxn && (() => {
            const candidates = getCandidateMatches(reviewingTxn)
            const activeCandidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0]

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
                <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                        <GitBranch className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Reconciliation Review &amp; Match Resolver
                          </h3>
                          <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            Line #{reviewingTxn.lineIndex}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Verify extracted carrier statement item against Book of Business records.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewingTxn(null)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  {/* Top Banner: Statement Extracted Item Details */}
                  <div className="border-b border-slate-200 dark:border-white/10 bg-slate-900 dark:bg-slate-950 px-6 py-4 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                          Extracted Statement Line
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          {reviewingTxn.policyNumber}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-200">{reviewingTxn.carrier}</span>
                      </div>
                      <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
                        {reviewingTxn.ruleMatched}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Insured / Entity</p>
                        <p className="font-bold text-white mt-0.5 truncate">{reviewingTxn.clientName}</p>
                        <p className="text-[11px] text-slate-300 truncate">{reviewingTxn.businessName}</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Coverage Line</p>
                        <p className="font-bold text-white mt-0.5">{reviewingTxn.lineOfBusiness}</p>
                        <p className="text-[11px] text-slate-300">Annual Commercial</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-2.5 border border-white/10">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Gross Premium / Rate</p>
                        <p className="font-bold text-white mt-0.5 font-mono">{fmtCurrency(reviewingTxn.grossPremium)}</p>
                        <p className="text-[11px] text-slate-300 font-mono">Rate: {reviewingTxn.commissionRate}%</p>
                      </div>
                      <div className="rounded-xl bg-blue-500/10 p-2.5 border border-blue-400/30">
                        <p className="text-[10px] uppercase font-bold text-blue-300">Carrier Remittance</p>
                        <p className="text-base font-extrabold text-blue-200 font-mono mt-0.5">
                          {fmtCurrency(reviewingTxn.paidCommission)}
                        </p>
                        {reviewingTxn.variance !== 0 ? (
                          <p className="text-[10px] font-semibold text-amber-300">
                            Variance: {reviewingTxn.variance > 0 ? '+' : ''}{fmtCurrency(reviewingTxn.variance)}
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-400">Balanced (100% Concordance)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sub-Tabs: 1) Review Matches, 2) Next Tab: Fix Discrepancy, 3) Add This Policy / Client, 4) Search CRM Ledger */}
                  <div className="flex flex-wrap border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/50 px-6 pt-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewTab('candidates')}
                      className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        reviewTab === 'candidates'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="size-3.5 text-blue-500 dark:text-blue-400" />
                      <span>1. Review Matches</span>
                      <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-2 py-0.2 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {candidates.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (activeCandidate) populateFixForm(activeCandidate)
                        setReviewTab('fix')
                      }}
                      className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        reviewTab === 'fix'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Wrench className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>2. Fix Discrepancy &amp; Adjust</span>
                      <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.2 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        Next Tab: Fix It
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewTab('create')}
                      className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        reviewTab === 'create'
                          ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <PlusCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>3. Add This Policy / Client</span>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        Add This
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewTab('search')}
                      className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        reviewTab === 'search'
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Search className="size-3.5 text-slate-400" />
                      <span>4. Search CRM Ledger</span>
                    </button>
                  </div>

                  {/* Modal Body / Tab Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900">
                    {/* TAB 1: SUGGESTED CANDIDATE MATCHES */}
                    {reviewTab === 'candidates' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            The matching engine found <strong className="text-slate-900 dark:text-white">{candidates.length} potential match candidates</strong> in your CRM records. Select a policy to review concordance and link:
                          </p>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">Click card to select</span>
                        </div>

                        {candidates.length === 0 ? (
                          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-gradient-to-b from-emerald-50/90 to-slate-50 dark:from-emerald-950/40 dark:to-slate-900 p-6 text-center space-y-4 shadow-xs">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                              <UserPlus className="size-6" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                                No Client Found in Book of Business
                              </h3>
                              <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto mt-1">
                                No matching records found for <strong>{reviewingTxn.clientName}</strong>. You can add them to your CRM right now with few clicks:
                              </p>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => handleConfirmQuickAdd(reviewingTxn)}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
                              >
                                <Zap className="size-4" />
                                <span>⚡ 1-Click Quick Add &amp; Reconcile</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setReviewTab('create')}
                                className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition cursor-pointer"
                              >
                                Open Full Client Form
                              </button>
                              <button
                                type="button"
                                onClick={() => setReviewTab('search')}
                                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                              >
                                Search CRM Ledger
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Quick Add Helper if client is not in candidates */}
                            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                              <div className="flex items-center gap-2.5">
                                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0 shadow-2xs">
                                  <Zap className="size-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-emerald-950 dark:text-emerald-200">
                                    No match applies? Quick add {reviewingTxn.clientName} in few clicks
                                  </p>
                                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                                    Create this client and bind policy {reviewingTxn.policyNumber} instantly to your Book of Business.
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleConfirmQuickAdd(reviewingTxn)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-500 transition cursor-pointer shrink-0"
                              >
                                <Zap className="size-3.5" />
                                <span>⚡ Quick Add in 1-Click</span>
                              </button>
                            </div>
                            {candidates.map((cand) => {
                              const isSelected = selectedCandidateId === cand.id

                              return (
                                <div
                                  key={cand.id}
                                  onClick={() => {
                                    setSelectedCandidateId(cand.id)
                                    populateFixForm(cand)
                                  }}
                                  className={`rounded-xl border p-4 transition cursor-pointer ${
                                    isSelected
                                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50/50 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <div className="pt-0.5">
                                        <div
                                          className={`flex size-5 items-center justify-center rounded-full border ${
                                            isSelected
                                              ? 'border-blue-600 bg-blue-600 text-white'
                                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                          }`}
                                        >
                                          {isSelected && <Check className="size-3 stroke-[3]" />}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                            {cand.policyNumber}
                                          </span>
                                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            {cand.clientName}
                                          </span>
                                          {cand.businessName && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                              ({cand.businessName})
                                            </span>
                                          )}
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                              cand.matchScore >= 90
                                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                                                : cand.matchScore >= 75
                                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                          >
                                            {cand.matchScore}% Match · {cand.confidence}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                          {cand.detail}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Financial comparison on card */}
                                    <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-white/10 sm:pl-4 min-w-[170px] shrink-0">
                                      <div className="flex justify-between sm:justify-end gap-2 text-xs">
                                        <span className="text-slate-500 dark:text-slate-400">Expected:</span>
                                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                          {fmtCurrency(cand.expectedCommission)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between sm:justify-end gap-2 text-xs mt-0.5">
                                        <span className="text-slate-500 dark:text-slate-400">Remittance:</span>
                                        <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                                          {fmtCurrency(cand.remittance)}
                                        </span>
                                      </div>
                                      <div className="mt-1">
                                        {cand.variance === 0 ? (
                                          <span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800/50">
                                            Exact $0.00 Variance
                                          </span>
                                        ) : (
                                          <span
                                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                                              cand.variance < 0
                                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800/50'
                                                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-800/50'
                                            }`}
                                          >
                                            {cand.variance > 0 ? '+' : ''}{fmtCurrency(cand.variance)} Variance
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick link to Fix Tab */}
                                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400 dark:text-slate-500">Match score: {cand.matchScore}%</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedCandidateId(cand.id)
                                        populateFixForm(cand)
                                        setReviewTab('fix')
                                      }}
                                      className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                                    >
                                      <Wrench className="size-3" />
                                      <span>Next Tab: Fix Discrepancy &amp; Adjust →</span>
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Selected Candidate Concordance Breakdown */}
                        {activeCandidate && (
                          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                              <Scale className="size-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Side-by-Side Concordance Comparison</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              {/* Left: Statement */}
                              <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-3 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  Carrier Statement Line
                                </span>
                                <div className="flex justify-between border-b border-slate-100 dark:border-white/10 pb-1">
                                  <span className="text-slate-500 dark:text-slate-400">Policy #:</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">{reviewingTxn.policyNumber}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 dark:border-white/10 pb-1">
                                  <span className="text-slate-500 dark:text-slate-400">Insured:</span>
                                  <span className="font-semibold text-slate-900 dark:text-white">{reviewingTxn.clientName}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 dark:border-white/10 pb-1">
                                  <span className="text-slate-500 dark:text-slate-400">Coverage:</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">{reviewingTxn.lineOfBusiness}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 dark:border-white/10 pb-1">
                                  <span className="text-slate-500 dark:text-slate-400">Gross Premium:</span>
                                  <span className="font-mono text-slate-900 dark:text-white">{fmtCurrency(reviewingTxn.grossPremium)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">Remitted Comm:</span>
                                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{fmtCurrency(reviewingTxn.paidCommission)} ({reviewingTxn.commissionRate}%)</span>
                                </div>
                              </div>

                              {/* Right: Selected CRM Candidate */}
                              <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-950/20 p-3 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                                  Selected CRM Ledger Record
                                </span>
                                <div className="flex justify-between border-b border-blue-100/70 dark:border-white/10 pb-1">
                                  <span className="text-slate-500 dark:text-slate-400">Policy #:</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">{activeCandidate.policyNumber}</span>
                                </div>
                                <div className="flex justify-between border-b border-blue-100/70 dark:border-white/10 pb-1">
                                  <span className="text-slate-500 dark:text-slate-400">Insured:</span>
                                  <span className="font-semibold text-slate-900 dark:text-white">{activeCandidate.clientName}</span>
                                </div>
                                <div className="flex justify-between border-b border-blue-100/70 dark:border-white/10 pb-1">
                                  <span className="text-slate-500 dark:text-slate-400">Coverage:</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">{activeCandidate.coverage}</span>
                                </div>
                                <div className="flex justify-between border-b border-blue-100/70 dark:border-white/10 pb-1">
                                  <span className="text-slate-500 dark:text-slate-400">Book Premium:</span>
                                  <span className="font-mono text-slate-900 dark:text-white">{fmtCurrency(activeCandidate.bookPremium)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500 dark:text-slate-400">Expected Comm:</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">{fmtCurrency(activeCandidate.expectedCommission)} ({activeCandidate.commRate}%)</span>
                                </div>
                              </div>
                            </div>

                            {/* Settlement Rationale Select */}
                            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Resolution Classification
                                </label>
                                <select
                                  value={resolutionReason}
                                  onChange={(e) => setResolutionReason(e.target.value)}
                                  className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                                >
                                  <option value="Endorsement & rate variance accepted">Endorsement &amp; rate variance accepted</option>
                                  <option value="Direct-bill policy confirmed & linked">Direct-bill policy confirmed &amp; linked</option>
                                  <option value="Base policy match confirmed (suffix variant)">Base policy match confirmed (suffix variant)</option>
                                  <option value="Commission variance approved by broker">Commission variance approved by broker</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Broker Audit Note (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  placeholder="e.g. Endorsement rate reduction reconciled with carrier..."
                                  className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Next Action Callout (Client request: "There should be a next tab. So they can fix it or add this") */}
                        <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                          <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                              <Wrench className="size-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Discrepancy detected? Go to the Next Tab to Fix or Add this item
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                                You can fix policy number typos, endorse rate variances, or add this policy directly to your Book of Business.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (activeCandidate) populateFixForm(activeCandidate)
                                setReviewTab('fix')
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition cursor-pointer"
                            >
                              <span>Next Tab: Fix Discrepancy</span>
                              <ArrowRight className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setReviewTab('create')}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
                            >
                              <PlusCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Or Add This Policy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: FIX DISCREPANCY & ADJUST (Client Request: Next Tab to Fix it or Add this) */}
                    {reviewTab === 'fix' && (
                      <form onSubmit={handleApplyFix} className="space-y-5">
                        {/* Header Info Banner */}
                        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50/90 to-blue-50/70 dark:from-indigo-950/40 dark:to-blue-950/30 p-4 flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                            <Wrench className="size-4" />
                          </div>
                          <div className="text-xs text-indigo-950 dark:text-indigo-200">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-indigo-950 dark:text-indigo-100">Fix Discrepancy &amp; Commission Adjustment</p>
                              <span className="rounded-full bg-indigo-200/80 dark:bg-indigo-900/60 px-2 py-0.5 text-[10px] font-extrabold text-indigo-800 dark:text-indigo-300">
                                Next Tab Workbench
                              </span>
                            </div>
                            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5 leading-relaxed">
                              Adjust policy number typos, endorse rate differences, reconcile gross premiums, or balance variance directly against carrier remittance.
                            </p>
                          </div>
                        </div>

                        {/* Live Reconciliation Calculation Banner */}
                        {(() => {
                          const numPrem = parseFloat(fixGrossPremium.replace(/[^0-9.]/g, '')) || reviewingTxn.grossPremium
                          const numRate = parseFloat(fixCommRate.replace(/[^0-9.]/g, '')) || reviewingTxn.commissionRate
                          const calcExpected = Number(((numPrem * numRate) / 100).toFixed(2))
                          const calcVariance = Number((reviewingTxn.paidCommission - calcExpected).toFixed(2))
                          const isBalanced = calcVariance === 0

                          return (
                            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  Live Balance &amp; Recalculation
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ring-1 ${
                                    isBalanced
                                      ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 ring-emerald-300 dark:ring-emerald-700/50'
                                      : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 ring-amber-300 dark:ring-amber-700/50'
                                  }`}
                                >
                                  {isBalanced ? 'Balanced ($0.00 Variance)' : `Variance: ${calcVariance > 0 ? '+' : ''}${fmtCurrency(calcVariance)}`}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-2">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Expected Comm</span>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{fmtCurrency(calcExpected)}</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">({numRate}% of {fmtCurrency(numPrem)})</span>
                                </div>
                                <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-2">
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Carrier Remittance</span>
                                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-xs sm:text-sm">{fmtCurrency(reviewingTxn.paidCommission)}</span>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Received</span>
                                </div>
                                <div className={`rounded-lg border p-2 ${isBalanced ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'}`}>
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Discrepancy / Variance</span>
                                  <span className={`font-mono font-bold text-xs sm:text-sm ${isBalanced ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                    {calcVariance > 0 ? '+' : ''}{fmtCurrency(calcVariance)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{isBalanced ? 'Fully Cleared' : 'Adjustable'}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })()}

                        {/* Form Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Policy Number */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Policy Number (Correct typos or suffix variants) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={fixPolicyNumber}
                              onChange={(e) => setFixPolicyNumber(e.target.value)}
                              required
                              placeholder="e.g. POL-1029-TRV-A"
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 font-mono text-xs font-bold text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Statement had: {reviewingTxn.policyNumber}</p>
                          </div>

                          {/* Coverage Line */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Coverage / Line of Business
                            </label>
                            <input
                              type="text"
                              value={fixCoverage}
                              onChange={(e) => setFixCoverage(e.target.value)}
                              placeholder="e.g. Commercial General Liability"
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Carrier: {reviewingTxn.carrier}</p>
                          </div>

                          {/* Insured Client Name */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Insured Contact Name
                            </label>
                            <input
                              type="text"
                              value={fixClientName}
                              onChange={(e) => setFixClientName(e.target.value)}
                              placeholder="e.g. Marcus Vance"
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>

                          {/* Business Name */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Business / Company Name
                            </label>
                            <input
                              type="text"
                              value={fixBusinessName}
                              onChange={(e) => setFixBusinessName(e.target.value)}
                              placeholder="e.g. Vance Design Studio"
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>

                          {/* Gross Premium */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Gross Premium ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={fixGrossPremium}
                              onChange={(e) => setFixGrossPremium(e.target.value)}
                              placeholder="8200"
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 font-mono text-xs text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Used to compute expected commissions</p>
                          </div>

                          {/* Commission Rate (%) */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Commission Rate (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={fixCommRate}
                              onChange={(e) => setFixCommRate(e.target.value)}
                              placeholder="15.0"
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 font-mono text-xs text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Carrier remitted at {reviewingTxn.commissionRate}%</p>
                          </div>

                          {/* Variance Action / Treatment */}
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Variance Treatment / Reason
                            </label>
                            <select
                              value={fixVarianceAction}
                              onChange={(e) => setFixVarianceAction(e.target.value)}
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-none"
                            >
                              <option value="Accept endorsement variance & balance line">Accept endorsement variance &amp; balance line</option>
                              <option value="Adjust Book of Business rate to match carrier remittance">Adjust Book of Business rate to match carrier remittance</option>
                              <option value="One-time commission audit adjustment">One-time commission audit adjustment</option>
                              <option value="Correction of policy number typo / suffix">Correction of policy number typo / suffix</option>
                              <option value="Direct-bill policy commission accepted">Direct-bill policy commission accepted</option>
                            </select>
                          </div>

                          {/* Broker Audit Note */}
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Audit Trail Note (Recorded in Statement Batch Ledger)
                            </label>
                            <input
                              type="text"
                              value={fixAdjustmentNote}
                              onChange={(e) => setFixAdjustmentNote(e.target.value)}
                              placeholder="e.g. Endorsement rate reduction verified with carrier representative..."
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Bottom Action Bar inside Tab 2 */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10 gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setReviewTab('candidates')}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            >
                              <ArrowLeft className="size-3.5" />
                              <span>Back to Matches List</span>
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <button
                              type="button"
                              onClick={() => setReviewTab('create')}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 cursor-pointer"
                            >
                              <PlusCircle className="size-3.5" />
                              <span>Or Add This Policy as New</span>
                            </button>
                          </div>

                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition cursor-pointer"
                          >
                            <Check className="size-4" />
                            <span>Apply Fix &amp; Resolve Statement Line</span>
                          </button>
                        </div>
                      </form>
                    )}

                    {/* TAB 2: SEARCH BOOK OF BUSINESS */}
                    {reviewTab === 'search' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                            Search All Clients &amp; Policies in Book of Business
                          </label>
                          <div className="relative">
                            <Search className="size-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                              type="text"
                              value={clientSearchQuery}
                              onChange={(e) => setClientSearchQuery(e.target.value)}
                              placeholder="Type client name, business name, or policy # to search..."
                              className="h-10 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 focus:outline-none"
                              autoFocus
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            Search across active, pending, and historical client policies in your CRM ledger.
                          </p>
                        </div>

                        {selectedSearchPolicy && (
                          <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                                <Check className="size-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                                  Selected: {selectedSearchPolicy.policyNumber} — {selectedSearchPolicy.clientName}
                                </p>
                                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                                  {selectedSearchPolicy.coverage} · {selectedSearchPolicy.carrier} · Premium: {selectedSearchPolicy.premium}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleConfirmSearchPolicyLink}
                              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-500 transition cursor-pointer"
                            >
                              Link This Policy
                            </button>
                          </div>
                        )}

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {clientSearchQuery.trim() === '' ? (
                            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                              Start typing above to search existing policies from your Book of Business.
                            </div>
                          ) : searchedPolicies.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/20 p-8 text-center space-y-3">
                              <AlertCircle className="size-6 text-slate-400 mx-auto" />
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                No clients or policies matched &quot;{clientSearchQuery}&quot;
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                If this is a newly written or direct-bill policy, you can add them to your CRM right now.
                              </p>
                              <button
                                type="button"
                                onClick={() => setReviewTab('create')}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Create as New Client &amp; Link
                              </button>
                            </div>
                          ) : (
                            searchedPolicies.map((p) => {
                              const isThisSelected = selectedSearchPolicy?.policyNumber === p.policyNumber

                              return (
                                <div
                                  key={`${p.clientId}-${p.policyNumber}`}
                                  className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                                    isThisSelected
                                      ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30'
                                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-white/20'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                        {p.policyNumber}
                                      </span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                        {p.clientName}
                                      </span>
                                      {p.businessName && (
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                          ({p.businessName})
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      {p.coverage} · {p.carrier} · Annual Premium: {p.premium}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSearchPolicy(p)}
                                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer shrink-0 ${
                                      isThisSelected
                                        ? 'bg-emerald-600 text-white'
                                        : 'border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                    }`}
                                  >
                                    {isThisSelected ? 'Selected' : 'Select'}
                                  </button>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: ADD NEW CLIENT & LINK */}
                    {reviewTab === 'create' && (
                      <form onSubmit={handleCreateAndLinkNewClient} className="space-y-4">
                        <div className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/30 p-3.5 flex items-start gap-3">
                          <Info className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div className="text-xs text-blue-900 dark:text-blue-200">
                            <p className="font-semibold">Client not found in Book of Business?</p>
                            <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                              Pre-filled below with carrier remittance data. Submitting this form will automatically create an <strong>Active client</strong> in your CRM and mark this statement transaction as <strong>Resolved</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Client Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newClientName}
                              onChange={(e) => setNewClientName(e.target.value)}
                              required
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Business / Company Name
                            </label>
                            <input
                              type="text"
                              value={newBusinessName}
                              onChange={(e) => setNewBusinessName(e.target.value)}
                              placeholder="e.g. Vance Design Studio"
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Client Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setNewClientType('Commercial')}
                                className={`rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                                  newClientType === 'Commercial'
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                Commercial
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewClientType('Individual')}
                                className={`rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                                  newClientType === 'Individual'
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                Individual
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Policy Number <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newPolicyNumber}
                              onChange={(e) => setNewPolicyNumber(e.target.value)}
                              required
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-mono font-bold text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Line of Business
                            </label>
                            <input
                              type="text"
                              value={newLineOfBusiness}
                              onChange={(e) => setNewLineOfBusiness(e.target.value)}
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Carrier
                            </label>
                            <input
                              type="text"
                              value={reviewingTxn.carrier}
                              disabled
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/50 px-3 text-xs font-medium text-slate-500 dark:text-slate-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Gross Annual Premium ($)
                            </label>
                            <input
                              type="number"
                              value={newGrossPremium}
                              onChange={(e) => setNewGrossPremium(e.target.value)}
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-mono text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                              Commission Rate (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={newCommRate}
                              onChange={(e) => setNewCommRate(e.target.value)}
                              className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs font-mono text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-white/10">
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
                          >
                            <PlusCircle className="size-4" />
                            <span>Create Client &amp; Link Statement Line</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 px-6 py-4 gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {reviewTab === 'candidates' ? (
                        <button
                          type="button"
                          onClick={handleFlagDispute}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/50 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition cursor-pointer w-full sm:w-auto justify-center"
                        >
                          <AlertTriangle className="size-3.5" />
                          <span>Flag as Carrier Dispute</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewTab('candidates')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        >
                          <ArrowLeft className="size-3.5" />
                          <span>Back to Matches</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setReviewingTxn(null)}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        Cancel
                      </button>

                      {reviewTab === 'candidates' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setReviewTab('create')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
                          >
                            <PlusCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Add This Policy</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (activeCandidate) populateFixForm(activeCandidate)
                              setReviewTab('fix')
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition cursor-pointer"
                          >
                            <Wrench className="size-3.5" />
                            <span>Next Tab: Fix It</span>
                            <ArrowRight className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={handleConfirmCandidateLink}
                            disabled={!selectedCandidateId && candidates.length > 0}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
                          >
                            <Check className="size-4" />
                            <span>Confirm Match &amp; Link Policy</span>
                          </button>
                        </>
                      )}

                      {reviewTab === 'fix' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setReviewTab('create')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
                          >
                            <PlusCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Or Add This Policy</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleApplyFix}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition cursor-pointer"
                          >
                            <Check className="size-4" />
                            <span>Apply Fix &amp; Resolve Line</span>
                          </button>
                        </>
                      )}

                      {reviewTab === 'create' && (
                        <button
                          type="button"
                          onClick={(e) => handleCreateAndLinkNewClient(e as unknown as React.FormEvent)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
                        >
                          <PlusCircle className="size-4" />
                          <span>Create Client &amp; Link</span>
                        </button>
                      )}

                      {reviewTab === 'search' && (
                        <button
                          type="button"
                          onClick={handleConfirmSearchPolicyLink}
                          disabled={!selectedSearchPolicy}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="size-4" />
                          <span>Link Selected CRM Policy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          QUICK ADD CLIENT MODAL (Client Request: Add client quickie in few clicks)
      ══════════════════════════════════════════════════════════════════ */}
      {quickAddTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/70 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Quick Add Client to Book of Business</span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                      2 Clicks
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pre-filled from extracted statement line {quickAddTxn.policyNumber}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddTxn(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleConfirmQuickAdd()
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 flex items-start gap-2.5">
                <Zap className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  Clicking <strong>&quot;Create &amp; Reconcile Now&quot;</strong> will immediately create an <strong>Active client</strong> in your CRM, bind policy <strong>{quickAddPolicyNumber}</strong>, and mark this statement transaction as <strong>Resolved</strong> in 2 clicks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={quickAddClientName}
                    onChange={(e) => setQuickAddClientName(e.target.value)}
                    required
                    className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 font-semibold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business / Entity Name
                  </label>
                  <input
                    type="text"
                    value={quickAddBusinessName}
                    onChange={(e) => setQuickAddBusinessName(e.target.value)}
                    placeholder="e.g. Vance Design Studio"
                    className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickAddClientType('Commercial')}
                      className={`rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                        quickAddClientType === 'Commercial'
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Commercial
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickAddClientType('Individual')}
                      className={`rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                        quickAddClientType === 'Individual'
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Individual
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Policy Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={quickAddPolicyNumber}
                    onChange={(e) => setQuickAddPolicyNumber(e.target.value)}
                    required
                    className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Coverage Line
                  </label>
                  <input
                    type="text"
                    value={quickAddCoverage}
                    onChange={(e) => setQuickAddCoverage(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gross Annual Premium ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quickAddPremium}
                    onChange={(e) => setQuickAddPremium(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 font-mono text-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Carrier &amp; Remittance
                  </label>
                  <div className="h-9 flex items-center justify-between rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{quickAddTxn.carrier}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{fmtCurrency(quickAddTxn.paidCommission)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const txn = quickAddTxn
                    setQuickAddTxn(null)
                    handleOpenReviewModal(txn)
                  }}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                >
                  Open Full Match Resolver →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickAddTxn(null)}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
                  >
                    <Zap className="size-4" />
                    <span>Create Client &amp; Reconcile Now</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 4: CONFIRMATION & SUCCESS
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-xs text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-50/50 dark:ring-emerald-950/30 shadow-xs">
            <CheckCircle2 className="size-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Statement Ingestion Completed!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your statement has been parsed, reconciled, and successfully recorded into the broker commissions ledger.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/40 p-5 text-left max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Statement Identifier</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {createdRecord?.statementIdentifier || 'ST-2940-TRAVELERS-OCT'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Assigned Template</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{allocatedProfile.templateName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Remittance Method</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{allocatedProfile.remittanceMethod}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Period / Month</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {uploadPeriodMonth} {uploadPeriodYear}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Remittance Volume</span>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {fmtCurrency(createdRecord?.totalRemittance || 10800.0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Transactions Reconciled</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {transactions.length} Lines ({transactions.filter((t) => t.status === 'Auto-Matched' || t.status === 'Resolved').length} Active)
              </span>
            </div>
          </div>

          {/* Direct CTA links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1)
                setSelectedFile(null)
              }}
              className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Upload Another Statement
            </button>
            <Link
              href="/broker/statements"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-600 dark:hover:bg-blue-500 transition"
            >
              <span>View in All Statements</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
