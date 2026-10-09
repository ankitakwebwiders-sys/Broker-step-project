'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Eye,
  RefreshCw,
  Edit3,
  XCircle,
  FileText,
  Building2,
  CalendarDays,
  Shield,
  Layers,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  History,
  Archive,
  Ban,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'

// ── Types for 11. Broker – Renewals ──
export type RenewalHorizon = '7-days' | '30-days' | '60-days' | '90-days' | 'custom'

export type PolicyRenewalStatus =
  | 'Pending Review'
  | 'Needs Attention'
  | 'In Negotiation'
  | 'Quote Requested'
  | 'Renewed'
  | 'Rewritten'
  | 'Non-Renewed'
  | 'Lost Business'

export interface RenewalRecord {
  id: string
  client: string
  businessName: string
  policyNumber: string
  carrier: string
  lineOfBusiness: string
  expiryDate: string // YYYY-MM-DD
  daysUntilExpiry: number
  premium: number
  policyStatus: 'Active' | 'Pending Renewal' | 'Expiring Soon'
  renewalStatus: PolicyRenewalStatus
  notes?: string
}

export default function RenewalsPage() {
  // ── Horizon Tabs State (7 Days, 30 Days, 60 Days, 90 Days, Custom Date Range) ──
  const [selectedHorizon, setSelectedHorizon] = useState<RenewalHorizon>('30-days')

  // Custom Date Range State
  const [customStartDate, setCustomStartDate] = useState('2026-10-01')
  const [customEndDate, setCustomEndDate] = useState('2026-12-31')

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // ── Modals State for Actions (Review, Renew, Rewrite, Non-Renew, Mark Lost Business) ──
  const [activeModalAction, setActiveModalAction] = useState<
    'review' | 'renew' | 'rewrite' | 'non-renew' | 'lost' | null
  >(null)
  const [selectedPolicyForAction, setSelectedPolicyForAction] = useState<RenewalRecord | null>(null)

  // Action form inputs
  const [actionNotes, setActionNotes] = useState('')
  const [newRenewalPremium, setNewRenewalPremium] = useState<number>(0)
  const [newRewriteCarrier, setNewRewriteCarrier] = useState('Chubb')
  const [lostReason, setLostReason] = useState('Price / Premium Increase')

  // ── Master Renewals State ──
  const [renewalRecords, setRenewalRecords] = useState<RenewalRecord[]>([
    // 7 Days horizon (expiry between Oct 9 and Oct 16, 2026)
    {
      id: 'ren-1',
      client: 'Marcus Vance',
      businessName: 'Apex Logistics Corp',
      policyNumber: 'POL-TRV-89421',
      carrier: 'Travelers',
      lineOfBusiness: 'Commercial Auto',
      expiryDate: '2026-10-12',
      daysUntilExpiry: 3,
      premium: 34200,
      policyStatus: 'Expiring Soon',
      renewalStatus: 'Needs Attention',
      notes: 'Renewal proposal ready from Travelers. Telematics discount applied.',
    },
    {
      id: 'ren-2',
      client: 'Sophia Sterling',
      businessName: 'Sterling Craft Breweries',
      policyNumber: 'POL-HFD-49120',
      carrier: 'The Hartford',
      lineOfBusiness: 'Commercial Property',
      expiryDate: '2026-10-15',
      daysUntilExpiry: 6,
      premium: 26800,
      policyStatus: 'Expiring Soon',
      renewalStatus: 'Pending Review',
      notes: 'Client requested property appraisal re-check before binding.',
    },

    // 30 Days horizon (expiry between Oct 17 and Nov 8, 2026)
    {
      id: 'ren-3',
      client: 'David K. Chen',
      businessName: 'Riverside Dental Group',
      policyNumber: 'POL-AIG-19034',
      carrier: 'AIG',
      lineOfBusiness: 'Professional Liability',
      expiryDate: '2026-10-19',
      daysUntilExpiry: 10,
      premium: 18450,
      policyStatus: 'Pending Renewal',
      renewalStatus: 'In Negotiation',
      notes: 'Carrier proposed 4% rate revision for surgical dental coverage.',
    },
    {
      id: 'ren-4',
      client: 'Samuel Hayes',
      businessName: 'Cedar & Co. Retail',
      policyNumber: 'POL-CHB-11849',
      carrier: 'Chubb',
      lineOfBusiness: 'Business Owners (BOP)',
      expiryDate: '2026-10-23',
      daysUntilExpiry: 14,
      premium: 9240,
      policyStatus: 'Active',
      renewalStatus: 'Quote Requested',
      notes: 'Standard BOP terms renewal requested with Chubb.',
    },
    {
      id: 'ren-5',
      client: 'Nadia Petrova',
      businessName: 'Petrova Fine Arts Gallery',
      policyNumber: 'POL-PGR-60192',
      carrier: 'Progressive',
      lineOfBusiness: 'Inland Marine',
      expiryDate: '2026-10-28',
      daysUntilExpiry: 19,
      premium: 21500,
      policyStatus: 'Active',
      renewalStatus: 'Pending Review',
      notes: 'Transit rider scheduled for upcoming winter art fairs.',
    },
    {
      id: 'ren-6',
      client: 'Preston Tech Systems',
      businessName: 'Pinnacle Cloud Solutions',
      policyNumber: 'POL-TRV-39102',
      carrier: 'Travelers',
      lineOfBusiness: 'Cyber Liability',
      expiryDate: '2026-11-02',
      daysUntilExpiry: 24,
      premium: 16600,
      policyStatus: 'Active',
      renewalStatus: 'Pending Review',
      notes: 'Updated SOC2 audit certificate submitted to underwriter.',
    },

    // 60 Days horizon (expiry between Nov 9 and Dec 8, 2026)
    {
      id: 'ren-7',
      client: 'Tariq Al-Mansoor',
      businessName: 'Summit Hospitality Group',
      policyNumber: 'POL-AIG-58190',
      carrier: 'AIG',
      lineOfBusiness: 'Commercial Property',
      expiryDate: '2026-11-18',
      daysUntilExpiry: 40,
      premium: 64000,
      policyStatus: 'Active',
      renewalStatus: 'Pending Review',
      notes: 'Multi-location resort coverage terms in underwriting review.',
    },
    {
      id: 'ren-8',
      client: 'Elena Rostova',
      businessName: 'Vanguard Medical Devices',
      policyNumber: 'POL-CHB-44129',
      carrier: 'Chubb',
      lineOfBusiness: 'Products Liability',
      expiryDate: '2026-11-30',
      daysUntilExpiry: 52,
      premium: 48500,
      policyStatus: 'Active',
      renewalStatus: 'Pending Review',
      notes: 'FDA medical equipment renewal review scheduled.',
    },
    {
      id: 'ren-9',
      client: 'Metro Fabrication Inc',
      businessName: 'Metro Steel Fabrication',
      policyNumber: 'POL-TRV-71289',
      carrier: 'Travelers',
      lineOfBusiness: 'Workers Compensation',
      expiryDate: '2026-12-02',
      daysUntilExpiry: 54,
      premium: 38900,
      policyStatus: 'Active',
      renewalStatus: 'Needs Attention',
      notes: 'Experience mod factor update required prior to renewal bind.',
    },

    // 90 Days horizon (expiry between Dec 9, 2026 and Jan 7, 2027)
    {
      id: 'ren-10',
      client: 'Rachel Green',
      businessName: 'GreenTech Innovations',
      policyNumber: 'POL-CNA-77218',
      carrier: 'CNA',
      lineOfBusiness: 'Cyber Liability',
      expiryDate: '2026-12-22',
      daysUntilExpiry: 74,
      premium: 29400,
      policyStatus: 'Active',
      renewalStatus: 'Pending Review',
      notes: 'Cloud rider extension negotiation slated for Q4.',
    },
    {
      id: 'ren-11',
      client: 'Arthur Pendelton',
      businessName: 'Pendelton Architecture LLC',
      policyNumber: 'POL-LIB-61209',
      carrier: 'Liberty Mutual',
      lineOfBusiness: 'Professional Liability (E&O)',
      expiryDate: '2027-01-04',
      daysUntilExpiry: 87,
      premium: 24750,
      policyStatus: 'Active',
      renewalStatus: 'Pending Review',
      notes: 'Structural engineering project roster submitted.',
    },
  ])

  // ── Filter Records by Selected Horizon ──
  const horizonFilteredRecords = useMemo(() => {
    return renewalRecords.filter((record) => {
      // 1. Horizon filter
      if (selectedHorizon === '7-days') {
        if (record.daysUntilExpiry > 7 || record.daysUntilExpiry < 0) return false
      } else if (selectedHorizon === '30-days') {
        if (record.daysUntilExpiry > 30 || record.daysUntilExpiry < 0) return false
      } else if (selectedHorizon === '60-days') {
        if (record.daysUntilExpiry > 60 || record.daysUntilExpiry < 0) return false
      } else if (selectedHorizon === '90-days') {
        if (record.daysUntilExpiry > 90 || record.daysUntilExpiry < 0) return false
      } else if (selectedHorizon === 'custom') {
        if (record.expiryDate < customStartDate || record.expiryDate > customEndDate) return false
      }

      // 2. Carrier filter
      if (carrierFilter !== 'All' && record.carrier !== carrierFilter) return false

      // 3. Status filter
      if (statusFilter !== 'All' && record.renewalStatus !== statusFilter) return false

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesClient = record.client.toLowerCase().includes(q)
        const matchesBusiness = record.businessName.toLowerCase().includes(q)
        const matchesPolicy = record.policyNumber.toLowerCase().includes(q)
        const matchesCarrier = record.carrier.toLowerCase().includes(q)
        const matchesLob = record.lineOfBusiness.toLowerCase().includes(q)
        if (!matchesClient && !matchesBusiness && !matchesPolicy && !matchesCarrier && !matchesLob) {
          return false
        }
      }

      return true
    })
  }, [
    renewalRecords,
    selectedHorizon,
    customStartDate,
    customEndDate,
    carrierFilter,
    statusFilter,
    searchQuery,
  ])

  // Counts for each Horizon Tab
  const horizonCounts = useMemo(() => {
    return {
      '7-days': renewalRecords.filter((r) => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 7).length,
      '30-days': renewalRecords.filter((r) => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 30).length,
      '60-days': renewalRecords.filter((r) => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 60).length,
      '90-days': renewalRecords.filter((r) => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 90).length,
      custom: renewalRecords.filter((r) => r.expiryDate >= customStartDate && r.expiryDate <= customEndDate).length,
    }
  }, [renewalRecords, customStartDate, customEndDate])

  // Total Premium for currently displayed records
  const totalHorizonPremium = useMemo(() => {
    return horizonFilteredRecords.reduce((sum, r) => sum + r.premium, 0)
  }, [horizonFilteredRecords])

  // ── Open Action Handlers ──
  function handleOpenAction(action: 'review' | 'renew' | 'rewrite' | 'non-renew' | 'lost', policy: RenewalRecord) {
    setSelectedPolicyForAction(policy)
    setActiveModalAction(action)
    setActionNotes(policy.notes || '')
    setNewRenewalPremium(policy.premium)
    setNewRewriteCarrier('Chubb')
    setLostReason('Price / Premium Increase')
  }

  // ── Execute Workflow Actions (Sections 41 - 45) ──
  function handleExecuteRenewal() {
    if (!selectedPolicyForAction) return

    setRenewalRecords((prev) =>
      prev.map((r) => {
        if (r.id !== selectedPolicyForAction.id) return r
        return {
          ...r,
          premium: newRenewalPremium || r.premium,
          renewalStatus: 'Renewed',
          policyStatus: 'Active',
          notes: actionNotes || 'Policy renewed successfully. New term recorded.',
        }
      })
    )

    showToast(
      `Policy ${selectedPolicyForAction.policyNumber} renewed! Historical policy preserved (Step 43) and renewal transaction recorded (Step 44).`
    )
    setActiveModalAction(null)
  }

  function handleExecuteRewrite() {
    if (!selectedPolicyForAction) return

    setRenewalRecords((prev) =>
      prev.map((r) => {
        if (r.id !== selectedPolicyForAction.id) return r
        return {
          ...r,
          carrier: newRewriteCarrier,
          renewalStatus: 'Rewritten',
          notes: actionNotes || `Policy rewritten to ${newRewriteCarrier}. Prior policy preserved.`,
        }
      })
    )

    showToast(
      `Policy ${selectedPolicyForAction.policyNumber} rewritten to ${newRewriteCarrier}! Historical policy preserved (Step 43).`
    )
    setActiveModalAction(null)
  }

  function handleExecuteNonRenew() {
    if (!selectedPolicyForAction) return

    setRenewalRecords((prev) =>
      prev.map((r) => {
        if (r.id !== selectedPolicyForAction.id) return r
        return {
          ...r,
          renewalStatus: 'Non-Renewed',
          notes: actionNotes || 'Marked non-renewed. Historical term preserved.',
        }
      })
    )

    showToast(
      `Policy ${selectedPolicyForAction.policyNumber} marked as Non-Renewed. Historical policy preserved (Step 43).`
    )
    setActiveModalAction(null)
  }

  function handleExecuteMarkLost() {
    if (!selectedPolicyForAction) return

    setRenewalRecords((prev) =>
      prev.map((r) => {
        if (r.id !== selectedPolicyForAction.id) return r
        return {
          ...r,
          renewalStatus: 'Lost Business',
          notes: `Marked Lost Business (${lostReason}). ${actionNotes}`,
        }
      })
    )

    showToast(
      `Policy ${selectedPolicyForAction.policyNumber} marked as Lost Business (${lostReason}). Historical record preserved.`
    )
    setActiveModalAction(null)
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

      {/* ───── Header Bar (11. Broker – Renewals) ───── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 max-w-xl">
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Tuesday, October 8, 2026 · Renewal Management
          </p>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 sm:text-[30px]">
            Renewals
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-500 leading-relaxed">
            Policy expiration horizon tracking, broker reviews, renewal/rewrite actions, and preserved historical policy records.
          </p>
        </div>

        {/* Header Summary KPI */}
        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-right shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Total Horizon Premium</span>
            <span className="text-[15px] font-bold text-slate-900 font-mono">
              ${totalHorizonPremium.toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-right shadow-sm">
            <span className="text-[11px] font-medium text-blue-600 block">Listed Policies</span>
            <span className="text-[15px] font-bold text-blue-700">
              {horizonFilteredRecords.length} Policies
            </span>
          </div>

          <Link
            href="/broker/book-of-business"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Archive className="size-4 text-slate-400" />
            <span>Book of Business</span>
          </Link>
        </div>
      </div>

      {/* ───── 11.1 Renewal Workflow Guide Banner ───── */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-blue-100/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">
              11.1
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-slate-900">
                Renewal Workflow
              </h3>
              <p className="text-[12.5px] text-slate-500">
                End-to-end policy lifecycle tracking from approaching expiration to final statement reconciliation.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-[12px] font-bold text-blue-700 self-start sm:self-auto">
            Automated Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              step: '1',
              title: '38. Existing Policy',
              desc: 'Active policy in Book of Business with in-force terms and contracted commission.',
              icon: Shield,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              step: '2',
              title: '39. Expiry Approaching',
              desc: 'Threshold alert triggered at 90, 60, 30, or 7 days prior to term expiration.',
              icon: Clock,
              color: 'text-amber-600 bg-amber-50',
            },
            {
              step: '3',
              title: '40. Policy in Renewal View',
              desc: 'Account automatically routed to the broker renewal horizon dashboard for review.',
              icon: CalendarDays,
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              step: '4',
              title: '41. Broker Reviews',
              desc: 'Broker evaluates client risk profile, claims history, and new carrier rate quotes.',
              icon: Eye,
              color: 'text-violet-600 bg-violet-50',
            },
            {
              step: '5',
              title: '42. Outcome Decision',
              desc: 'Broker executes decision: Renew, Rewrite, Non-Renew, or Mark Lost Business.',
              icon: RefreshCw,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              step: '6',
              title: '43. History Preserved',
              desc: 'Expiring policy term archived in Historical Book for permanent audit integrity.',
              icon: Archive,
              color: 'text-slate-700 bg-slate-100',
            },
            {
              step: '7',
              title: '44. New Term Recorded',
              desc: 'Renewal/rewrite binder created with updated premium and expected commission.',
              icon: Layers,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              step: '8',
              title: '45. Statement Reconciled',
              desc: 'Remittance statement matched and reconciled against expected commission.',
              icon: CheckCircle2,
              color: 'text-emerald-600 bg-emerald-50',
            },
          ].map((s) => {
            const IconComponent = s.icon
            return (
              <div
                key={s.step}
                className="group rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[11.5px] font-bold font-mono text-blue-700 ring-1 ring-blue-100">
                    Step {s.step}
                  </span>
                  <div className={`flex size-7 items-center justify-center rounded-lg ${s.color}`}>
                    <IconComponent className="size-3.5" />
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-[14px] mt-2.5 group-hover:text-blue-600 transition">
                  {s.title}
                </h4>
                <p className="text-[12.5px] text-slate-600 mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ───── Horizon Filter Tabs Bar (7 Days, 30 Days, 60 Days, 90 Days, Custom Date Range) ───── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {[
            { id: '7-days', label: '7 Days', count: horizonCounts['7-days'] },
            { id: '30-days', label: '30 Days', count: horizonCounts['30-days'] },
            { id: '60-days', label: '60 Days', count: horizonCounts['60-days'] },
            { id: '90-days', label: '90 Days', count: horizonCounts['90-days'] },
            { id: 'custom', label: 'Custom Date Range', count: horizonCounts.custom },
          ].map((tab) => {
            const isActive = selectedHorizon === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedHorizon(tab.id as RenewalHorizon)}
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

        {/* Custom Date Range Picker (Visible only when 'Custom Date Range' tab is active) */}
        {selectedHorizon === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-[12px]">
            <span className="font-semibold text-blue-900 flex items-center gap-1.5">
              <Calendar className="size-4 text-blue-600" />
              Custom Date Range:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-[11px]">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-[11px]">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Search & Secondary Filter Dropdowns */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, policy #, carrier, or line of business..."
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
                <option value="Travelers">Travelers</option>
                <option value="Chubb">Chubb</option>
                <option value="AIG">AIG</option>
                <option value="The Hartford">The Hartford</option>
                <option value="Liberty Mutual">Liberty Mutual</option>
                <option value="CNA">CNA</option>
                <option value="Progressive">Progressive</option>
              </select>
            </div>

            {/* Renewal Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11.5px] font-medium text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="In Negotiation">In Negotiation</option>
                <option value="Quote Requested">Quote Requested</option>
                <option value="Renewed">Renewed</option>
                <option value="Rewritten">Rewritten</option>
                <option value="Non-Renewed">Non-Renewed</option>
                <option value="Lost Business">Lost Business</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(carrierFilter !== 'All' || statusFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setCarrierFilter('All')
                  setStatusFilter('All')
                  setSearchQuery('')
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[11.5px] font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───── Listing Columns Table (Client, Policy Number, Carrier, Line of Business, Expiry Date, Premium, Policy Status, Renewal Status | Actions) ───── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1440px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[210px]">Client</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[160px]">Policy Number</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[130px]">Carrier</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[190px]">Line of Business</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[150px]">Expiry Date</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[130px] text-right">Premium</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">Policy Status</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[150px]">Renewal Status</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[350px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {horizonFilteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Clock className="mx-auto size-8 text-slate-300 mb-2" />
                    <p className="text-[13px] font-medium text-slate-600">
                      No policies found in {selectedHorizon.replace('-', ' ')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try selecting another horizon tab or resetting your filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                horizonFilteredRecords.map((policy) => {
                  return (
                    <tr key={policy.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Client */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-semibold text-slate-900 leading-snug">{policy.client}</p>
                        <p className="text-[11px] text-slate-500 leading-snug">{policy.businessName}</p>
                      </td>

                      {/* 2. Policy Number */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-900 font-mono text-[12px]">
                        {policy.policyNumber}
                      </td>

                      {/* 3. Carrier */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11.5px] font-medium text-slate-800">
                          {policy.carrier}
                        </span>
                      </td>

                      {/* 4. Line of Business */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-700 font-medium">{policy.lineOfBusiness}</td>

                      {/* 5. Expiry Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[12px]">
                        <p className="font-semibold text-slate-900 leading-snug">{policy.expiryDate}</p>
                        <span
                          className={`inline-block text-[10.5px] font-bold leading-snug ${policy.daysUntilExpiry <= 7
                            ? 'text-rose-600'
                            : policy.daysUntilExpiry <= 30
                              ? 'text-amber-600'
                              : 'text-slate-400'
                            }`}
                        >
                          {policy.daysUntilExpiry} days remaining
                        </span>
                      </td>

                      {/* 6. Premium */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-bold text-slate-900 font-mono text-[13px]">
                        ${policy.premium.toLocaleString()}
                      </td>

                      {/* 7. Policy Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${policy.policyStatus === 'Expiring Soon'
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                            : policy.policyStatus === 'Pending Renewal'
                              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                              : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            }`}
                        >
                          {policy.policyStatus}
                        </span>
                      </td>

                      {/* 8. Renewal Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${policy.renewalStatus === 'Renewed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : policy.renewalStatus === 'Rewritten'
                              ? 'bg-blue-100 text-blue-800'
                              : policy.renewalStatus === 'Non-Renewed'
                                ? 'bg-slate-200 text-slate-700'
                                : policy.renewalStatus === 'Lost Business'
                                  ? 'bg-rose-100 text-rose-800'
                                  : policy.renewalStatus === 'Needs Attention'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                            }`}
                        >
                          {policy.renewalStatus}
                        </span>
                      </td>

                      {/* Actions: Review; Renew; Rewrite; Non-Renew; Mark Lost Business */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                          {/* Review Action */}
                          <button
                            onClick={() => handleOpenAction('review', policy)}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            title="Review Policy (Step 41)"
                          >
                            <Eye className="size-3 text-slate-400" />
                            <span>Review</span>
                          </button>

                          {/* Renew Action */}
                          <button
                            onClick={() => handleOpenAction('renew', policy)}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                            title="Renew Policy (Step 42)"
                          >
                            <Check className="size-3" />
                            <span>Renew</span>
                          </button>

                          {/* Rewrite Action */}
                          <button
                            onClick={() => handleOpenAction('rewrite', policy)}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                            title="Rewrite to Carrier (Step 42)"
                          >
                            <RefreshCw className="size-3 text-blue-600" />
                            <span>Rewrite</span>
                          </button>

                          {/* Non-Renew Action */}
                          <button
                            onClick={() => handleOpenAction('non-renew', policy)}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            title="Non-Renew Policy (Step 42)"
                          >
                            <Ban className="size-3 text-slate-400" />
                            <span>Non-Renew</span>
                          </button>

                          {/* Mark Lost Business Action */}
                          <button
                            onClick={() => handleOpenAction('lost', policy)}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                            title="Mark Lost Business (Step 42)"
                          >
                            <XCircle className="size-3 text-rose-500" />
                            <span>Lost</span>
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

      {/* ─────────────────────────────────────────────────────────────
          ACTION MODALS (Review, Renew, Rewrite, Non-Renew, Mark Lost Business)
      ─────────────────────────────────────────────────────────────── */}

      {/* 1. REVIEW MODAL (Step 41) */}
      {activeModalAction === 'review' && selectedPolicyForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Step 41: Broker Reviews Policy
                </span>
                <h3 className="text-[17px] font-bold text-slate-900 mt-0.5">
                  Renewal Audit for {selectedPolicyForAction.policyNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2.5 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Client / Insured:</span>
                <span className="font-semibold text-slate-900">{selectedPolicyForAction.client} ({selectedPolicyForAction.businessName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Carrier:</span>
                <span className="font-semibold text-slate-900">{selectedPolicyForAction.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Line of Business:</span>
                <span className="font-semibold text-slate-900">{selectedPolicyForAction.lineOfBusiness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Expiry Date:</span>
                <span className="font-mono font-bold text-rose-600">{selectedPolicyForAction.expiryDate} ({selectedPolicyForAction.daysUntilExpiry} days left)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expiring Term Premium:</span>
                <span className="font-mono font-bold text-slate-900">${selectedPolicyForAction.premium.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-700">Broker Review Notes &amp; Action Plan:</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter client coverage notes, carrier terms, and decision rationale..."
                className="w-full rounded-xl border border-slate-200 p-3 text-[12px] text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Step 41 complete &rarr; Proceed to Step 42 decisions</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalAction(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setRenewalRecords((prev) =>
                      prev.map((r) =>
                        r.id === selectedPolicyForAction.id
                          ? { ...r, notes: actionNotes, renewalStatus: 'In Negotiation' }
                          : r
                      )
                    )
                    showToast('Review notes saved. Policy marked In Negotiation.')
                    setActiveModalAction(null)
                  }}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-600"
                >
                  Save Review Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RENEW MODAL (Step 42 & 43 & 44) */}
      {activeModalAction === 'renew' && selectedPolicyForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Step 42: Renew Policy
                </span>
                <h3 className="text-[17px] font-bold text-slate-900 mt-0.5">
                  Execute Renewal for {selectedPolicyForAction.policyNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2 text-[12px] text-emerald-950">
              <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Workflow Compliance:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11.5px]">
                <li><strong>Step 43:</strong> Historical policy term will be preserved in Book of Business.</li>
                <li><strong>Step 44:</strong> New renewal transaction will be recorded with carrier {selectedPolicyForAction.carrier}.</li>
                <li><strong>Step 45:</strong> Later carrier statement will be matched &amp; reconciled automatically.</li>
              </ul>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Renewal Term Premium ($):</label>
                <input
                  type="number"
                  value={newRenewalPremium}
                  onChange={(e) => setNewRenewalPremium(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Renewal Notes &amp; Binding Remarks:</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Terms accepted by insured. Standard renewal binder issued."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] text-slate-800 focus:border-blue-500 focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModalAction(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRenewal}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-md hover:bg-emerald-700"
              >
                Confirm Renewal &amp; Bind New Term
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REWRITE MODAL (Step 42 & 43 & 44) */}
      {activeModalAction === 'rewrite' && selectedPolicyForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Step 42: Rewrite Policy
                </span>
                <h3 className="text-[17px] font-bold text-slate-900 mt-0.5">
                  Rewrite Policy to New Carrier
                </h3>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-1 text-[11.5px] text-slate-600">
              <p className="font-semibold text-blue-900">
                Rewriting expiring {selectedPolicyForAction.carrier} contract for {selectedPolicyForAction.client}.
              </p>
              <p>Expiring contract will be preserved in Historical Book (Step 43) and rewrite recorded (Step 44).</p>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select New Target Carrier:</label>
                <select
                  value={newRewriteCarrier}
                  onChange={(e) => setNewRewriteCarrier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Chubb">Chubb</option>
                  <option value="Travelers">Travelers</option>
                  <option value="Liberty Mutual">Liberty Mutual</option>
                  <option value="The Hartford">The Hartford</option>
                  <option value="CNA">CNA</option>
                  <option value="AIG">AIG</option>
                  <option value="Progressive">Progressive</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rewrite Premium ($):</label>
                <input
                  type="number"
                  value={newRenewalPremium}
                  onChange={(e) => setNewRenewalPremium(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rewrite Justification:</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Carrier restructuring / competitive terms offered by replacement carrier."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] text-slate-800 focus:border-blue-500 focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModalAction(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRewrite}
                className="rounded-xl bg-blue-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-md hover:bg-blue-700"
              >
                Confirm Rewrite Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. NON-RENEW MODAL (Step 42 & 43) */}
      {activeModalAction === 'non-renew' && selectedPolicyForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Step 42: Non-Renew Policy
                </span>
                <h3 className="text-[17px] font-bold text-slate-900 mt-0.5">
                  Confirm Non-Renewal for {selectedPolicyForAction.policyNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[12px] text-slate-600">
              <p>
                Marking this policy as Non-Renewed will discontinue expiration alarms. Historical policy lifecycle will remain <strong>Preserved</strong> in the Historical Book (Step 43).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-700">Non-Renewal Reason &amp; Underwriting Notice:</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Notice of non-renewal issued by carrier / insured discontinued business entity."
                className="w-full rounded-xl border border-slate-200 p-3 text-[12px] text-slate-800 focus:border-blue-500 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModalAction(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteNonRenew}
                className="rounded-xl bg-slate-900 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-slate-800"
              >
                Confirm Non-Renewal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MARK LOST BUSINESS MODAL (Step 42 & 43) */}
      {activeModalAction === 'lost' && selectedPolicyForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  Step 42: Mark Lost Business
                </span>
                <h3 className="text-[17px] font-bold text-slate-900 mt-0.5">
                  Record Lost Business on {selectedPolicyForAction.policyNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-[12px] text-rose-900 space-y-1">
              <p className="font-semibold">Historical Policy Preserved (Step 43)</p>
              <p className="text-[11.5px] text-slate-600">
                This account will be marked as lost to track broker retention leakage and win-loss ratios.
              </p>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Reason for Lost Business:</label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Price / Premium Increase">Price / Premium Increase</option>
                  <option value="Lost to Direct Competitor">Lost to Direct Competitor / Broker</option>
                  <option value="Client Sold Business / Closed Operations">Client Sold Business / Closed Operations</option>
                  <option value="Dissatisfied with Carrier Claim Experience">Dissatisfied with Carrier Claim Experience</option>
                  <option value="Coverage Terms Restricted">Coverage Terms Restricted</option>
                  <option value="Other / Client Choice">Other / Client Choice</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Additional Observations:</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Notes regarding competitor rate or client decision..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[12px] text-slate-800 focus:border-blue-500 focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModalAction(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteMarkLost}
                className="rounded-xl bg-rose-600 px-4 py-2 text-[12.5px] font-semibold text-white shadow-md hover:bg-rose-700"
              >
                Confirm Lost Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
