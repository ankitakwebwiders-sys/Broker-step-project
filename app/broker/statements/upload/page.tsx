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
} from 'lucide-react'
import {
  initialStatements,
  type StatementRecord,
  type StatementTransactionItem,
} from '@/data/broker/statements'

type UploadStep = 1 | 2 | 3 | 4

const STEPS = [
  { step: 1, title: 'Upload & Carrier', desc: 'Select carrier & file' },
  { step: 2, title: 'Processing & Extraction', desc: 'Data parsing pipeline' },
  { step: 3, title: 'Reconciliation Review', desc: 'Verify line matches' },
  { step: 4, title: 'Confirmation', desc: 'Committed to ledger' },
]

export default function UploadStatementPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<UploadStep>(1)

  // Step 1: Form state
  const [uploadCarrier, setUploadCarrier] = useState('Travelers')
  const [uploadPeriodMonth, setUploadPeriodMonth] = useState('October')
  const [uploadPeriodYear, setUploadPeriodYear] = useState('2026')
  const [uploadMethod, setUploadMethod] = useState('Electronic ACH')
  const [uploadTemplate, setUploadTemplate] = useState('Carrier Default Auto-Detect Template')
  const [selectedFile, setSelectedFile] = useState<{
    name: string
    size: string
    type: 'xlsx' | 'csv' | 'pdf'
  } | null>({
    name: 'Travelers_ACH_Oct2026_Remittance_Batch.xlsx',
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
      statementIdentifier: `${newId}-${uploadCarrier.toUpperCase()}-${uploadPeriodMonth.slice(0, 3).toUpperCase()}`,
      fileName: selectedFile?.name || `${uploadCarrier}_Remittance_${uploadPeriodMonth}${uploadPeriodYear}.xlsx`,
      fileType: selectedFile?.type || 'xlsx',
      fileSize: selectedFile?.size || '3.2 MB',
      carrier: uploadCarrier,
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
      paymentMethod: uploadMethod,
      batchReference: `BATCH-${Date.now().toString().slice(-6)}`,
      mappingTemplate: uploadTemplate,
      extractedDate: 'Just now',
      normalizedDate: 'Just now',
      reprocessedCount: 0,
      notes: `Ingested via dedicated upload workflow using ${uploadTemplate}.`,
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

  // Resolve transaction action
  const handleResolveTxn = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            status: 'Resolved',
            matchConfidence: 'High Confidence',
            variance: 0,
            resolutionNote: 'Manually verified and confirmed by broker.',
          }
          : t
      )
    )
  }

  const fmtCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val)

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-8">
      {/* ───── Breadcrumb & Page Header ───── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link href="/broker/statements" className="hover:text-blue-600 transition">
              Statements
            </Link>
            <ChevronRight className="size-3 text-slate-400" />
            <span className="text-slate-900 font-semibold">Upload New Statement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Upload Carrier Statement
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Automated extraction, normalization, and reconciliation pipeline for commission statements.
          </p>
        </div>

        <Link
          href="/broker/statements"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition self-start sm:self-auto"
        >
          <ArrowLeft className="size-3.5 text-slate-500" />
          <span>All Statements</span>
        </Link>
      </div>

      {/* ───── Stepper Progress Bar ───── */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.step
            const isCurrent = currentStep === s.step
            return (
              <div
                key={s.step}
                className={`flex items-center gap-3 rounded-xl p-2.5 transition-all ${isCurrent
                    ? 'bg-blue-50/80 ring-1 ring-blue-200'
                    : isCompleted
                      ? 'bg-slate-50'
                      : 'opacity-60'
                  }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition ${isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                >
                  {isCompleted ? <Check className="size-4 stroke-[3]" /> : s.step}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-950' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                      }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{s.desc}</p>
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
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <Upload className="size-4" />
              </span>
              Step 1: Carrier &amp; Statement Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the carrier remittance partner and file to begin extraction.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Carrier Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Carrier Partner <span className="text-rose-500">*</span>
              </label>
              <select
                value={uploadCarrier}
                onChange={(e) => setUploadCarrier(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="Travelers">Travelers Insurance</option>
                <option value="Chubb">Chubb Commercial</option>
                <option value="Hartford">The Hartford</option>
                <option value="Medical Protective">Medical Protective</option>
                <option value="AIG">AIG Canada</option>
                <option value="CNA">CNA Financial</option>
              </select>
            </div>

            {/* Statement Period */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Statement Period <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={uploadPeriodMonth}
                  onChange={(e) => setUploadPeriodMonth(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="October">October</option>
                  <option value="September">September</option>
                  <option value="August">August</option>
                  <option value="July">July</option>
                </select>
                <select
                  value={uploadPeriodYear}
                  onChange={(e) => setUploadPeriodYear(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Remittance Payment Method
              </label>
              <select
                value={uploadMethod}
                onChange={(e) => setUploadMethod(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="Electronic ACH">Electronic ACH Remittance</option>
                <option value="Direct Wire">Direct Wire Remittance</option>
                <option value="Paper Remittance Check">Paper Remittance Check</option>
              </select>
            </div>

            {/* Template */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Field Mapping Template
              </label>
              <select
                value={uploadTemplate}
                onChange={(e) => setUploadTemplate(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="Carrier Default Auto-Detect Template">Carrier Default Auto-Detect Template</option>
                <option value="Standard Broker EDI-820 Format">Standard Broker EDI-820 Format</option>
                <option value="Custom Multi-Line Table Template">Custom Multi-Line Table Template</option>
              </select>
            </div>
          </div>

          {/* Statement File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Statement Source Document <span className="text-rose-500">*</span>
            </label>
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6 sm:p-8 text-center transition hover:border-blue-400 hover:bg-blue-50/10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-slate-200 text-blue-600 mb-3">
                <Upload className="size-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your statement file here, or{' '}
                <span className="text-blue-600 underline cursor-pointer">browse file</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
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
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
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
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Use Sample Chubb CSV
                </button>
              </div>

              {/* Selected File Card */}
              {selectedFile && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 max-w-md mx-auto text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileSpreadsheet className="size-5 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-blue-900 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-blue-700">{selectedFile.size} · Ingestion Ready</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer shrink-0"
                    title="Clear file"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link
              href="/broker/statements"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleStartExtraction}
              disabled={!selectedFile}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
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
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                  <GitBranch className="size-4" />
                </span>
                Step 2: Processing &amp; Data Normalization Pipeline
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Parsing source line items and matching against active client &amp; policy ledgers.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
              {pipelineProgress}% Completed
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-2">
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
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
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/60 opacity-60'
                  }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${stage.done ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}
                  >
                    {stage.done ? <Check className="size-3.5 stroke-[3]" /> : stage.num}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{stage.title}</h3>
                </div>
                <p className="text-[11px] text-slate-500 pl-8.5">{stage.desc}</p>
              </div>
            ))}
          </div>

          {/* Raw Extraction Log Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-emerald-400 font-mono text-[11px] space-y-1">
            <p className="text-slate-400">// Ingestion Log Console:</p>
            <p>+ Carrier target: {uploadCarrier} | Mapping format: {uploadTemplate}</p>
            <p>+ Extracted 5 raw ledger transaction line rows from source file.</p>
            <p className={activePipelineStage >= 3 ? 'text-emerald-400' : 'text-slate-500'}>
              + Calculated net commissions: $10,800.00 across active broker records.
            </p>
            <p className={activePipelineStage >= 4 ? 'text-emerald-400' : 'text-slate-500'}>
              + 4 High Confidence matches, 1 pending variance requiring review.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Back to Setup
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
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
        <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <ShieldCheck className="size-4" />
                </span>
                Step 3: Reconciliation &amp; Line Match Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Review extracted transaction rows before final commitment to the general ledger.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200">
                {transactions.filter((t) => t.status === 'Auto-Matched' || t.status === 'Resolved').length} Matched
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-200">
                {transactions.filter((t) => t.status === 'Pending Broker Review' || t.status === 'Action Required').length} Action Req.
              </span>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="px-3.5 py-3">Policy #</th>
                  <th className="px-3.5 py-3">Client / Insured</th>
                  <th className="px-3 py-3">Coverage Line</th>
                  <th className="px-3 py-3 text-right">Premium</th>
                  <th className="px-3 py-3 text-right">Comm. Rate</th>
                  <th className="px-3.5 py-3 text-right">Remittance</th>
                  <th className="px-3.5 py-3">Match Status</th>
                  <th className="px-3.5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => {
                  const isResolvedOrMatched = txn.status === 'Auto-Matched' || txn.status === 'Resolved'
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-900">{txn.policyNumber}</td>
                      <td className="px-3.5 py-3">
                        <p className="font-semibold text-slate-800">{txn.clientName}</p>
                        <p className="text-[11px] text-slate-400">{txn.businessName}</p>
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-600">{txn.lineOfBusiness}</td>
                      <td className="px-3 py-3 text-right font-mono text-slate-800">{fmtCurrency(txn.grossPremium)}</td>
                      <td className="px-3 py-3 text-right font-mono font-medium text-slate-600">
                        {txn.commissionRate}%
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900">
                        {fmtCurrency(txn.paidCommission)}
                      </td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${isResolvedOrMatched
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-amber-50 text-amber-700 ring-amber-200'
                            }`}
                        >
                          {isResolvedOrMatched ? (
                            <CheckCircle2 className="size-3" />
                          ) : (
                            <AlertCircle className="size-3" />
                          )}
                          <span>{txn.status}</span>
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        {!isResolvedOrMatched ? (
                          <button
                            type="button"
                            onClick={() => handleResolveTxn(txn.id)}
                            className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-blue-700 transition cursor-pointer"
                          >
                            Resolve &amp; Link
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">Verified</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Back to Pipeline
            </button>
            <button
              type="button"
              onClick={handleCommitToLedger}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              <span>Commit &amp; Save to Statements Ledger</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 4: CONFIRMATION & SUCCESS
      ══════════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xs text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50 shadow-xs">
            <CheckCircle2 className="size-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Statement Ingestion Completed!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your statement has been parsed, reconciled, and successfully recorded into the broker commissions ledger.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-left max-w-lg mx-auto space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Statement Identifier</span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {createdRecord?.statementIdentifier || 'ST-2940-TRAVELERS-OCT'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Carrier Partner</span>
              <span className="text-xs font-semibold text-slate-800">{uploadCarrier}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Period / Month</span>
              <span className="text-xs font-semibold text-slate-800">
                {uploadPeriodMonth} {uploadPeriodYear}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-xs text-slate-500 font-medium">Total Remittance Volume</span>
              <span className="text-sm font-mono font-bold text-emerald-600">
                {fmtCurrency(createdRecord?.totalRemittance || 10800.0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Transactions Reconciled</span>
              <span className="text-xs font-bold text-slate-900">
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
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Upload Another Statement
            </button>
            <Link
              href="/broker/statements"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-600 transition"
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
