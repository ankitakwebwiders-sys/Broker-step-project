'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  Percent,
  Check,
  X,
  ExternalLink,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react'

export interface CarrierRecord {
  id: string
  carrierCode: string
  naic: string
  name: string
  status: 'Active' | 'Inactive'
  defaultCommissionRate: number // e.g. 15.0
  linesOfBusiness: string[]
  payoutSchedule: 'Monthly Direct Bill' | 'Bi-Weekly' | 'Weekly' | 'Quarterly'
  portalUrl: string
  supportEmail: string
  supportPhone: string
  statementParser: string
  notes?: string
  connectedBrokersCount: number
  totalActivePolicies: number
}

const INITIAL_CARRIERS: CarrierRecord[] = [
  {
    id: 'CAR-001',
    carrierCode: 'TRV-001',
    naic: '25658',
    name: 'Travelers Insurance',
    status: 'Active',
    defaultCommissionRate: 15.0,
    linesOfBusiness: ['Commercial Property', 'General Liability', 'Workers Comp', 'Commercial Auto'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://foragents.travelers.com',
    supportEmail: 'agencycommissions@travelers.com',
    supportPhone: '+1 (800) 252-4633',
    statementParser: 'Travelers Standard Grid Parser v2.1',
    notes: 'Direct bill statements issued on the 1st business day of each calendar month.',
    connectedBrokersCount: 38,
    totalActivePolicies: 642,
  },
  {
    id: 'CAR-002',
    carrierCode: 'HFD-002',
    naic: '19682',
    name: 'The Hartford',
    status: 'Active',
    defaultCommissionRate: 14.5,
    linesOfBusiness: ['Commercial Property', 'General Liability', 'Workers Comp', 'Cyber Liability'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://electronicbusiness.thehartford.com',
    supportEmail: 'brokerage-comm@thehartford.com',
    supportPhone: '+1 (866) 467-8730',
    statementParser: 'The Hartford Multi-Tab Statement',
    notes: 'Requires 4-digit agency sub-code on all commercial submissions.',
    connectedBrokersCount: 34,
    totalActivePolicies: 519,
  },
  {
    id: 'CAR-003',
    carrierCode: 'PRG-003',
    naic: '24260',
    name: 'Progressive Commercial',
    status: 'Active',
    defaultCommissionRate: 12.0,
    linesOfBusiness: ['Commercial Auto', 'Fleet Auto', 'Cargo Liability'],
    payoutSchedule: 'Bi-Weekly',
    portalUrl: 'https://foragents.progressive.com',
    supportEmail: 'commercialservice@progressive.com',
    supportPhone: '+1 (800) 444-4487',
    statementParser: 'Progressive Commercial Layout',
    notes: 'Bi-weekly ACH direct payout cycle; reconciliation cutoff on alternate Thursdays.',
    connectedBrokersCount: 41,
    totalActivePolicies: 780,
  },
  {
    id: 'CAR-004',
    carrierCode: 'LBM-004',
    naic: '23043',
    name: 'Liberty Mutual',
    status: 'Active',
    defaultCommissionRate: 16.0,
    linesOfBusiness: ['Commercial Property', 'Inland Marine', 'Workers Comp', 'Umbrella'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://agents.libertymutual.com',
    supportEmail: 'comm-disbursements@libertymutual.com',
    supportPhone: '+1 (800) 344-0197',
    statementParser: 'Liberty Mutual CSV Custom Parser',
    notes: 'Premium thresholds trigger +1.5% retroactive annual override tiers.',
    connectedBrokersCount: 29,
    totalActivePolicies: 410,
  },
  {
    id: 'CAR-005',
    carrierCode: 'CHB-005',
    naic: '12777',
    name: 'Chubb Group',
    status: 'Active',
    defaultCommissionRate: 18.0,
    linesOfBusiness: ['Commercial Property', 'Executive Protection', 'Cyber', 'Excess Umbrella'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://chubbconnect.chubb.com',
    supportEmail: 'agencybilling@chubb.com',
    supportPhone: '+1 (800) 523-4332',
    statementParser: 'Chubb Commercial Multi-Tier',
    notes: 'Premium middle-market book with standard 18% base commission schedule.',
    connectedBrokersCount: 22,
    totalActivePolicies: 312,
  },
  {
    id: 'CAR-006',
    carrierCode: 'NWD-006',
    naic: '23787',
    name: 'Nationwide Mutual',
    status: 'Active',
    defaultCommissionRate: 13.5,
    linesOfBusiness: ['BOP', 'Commercial Property', 'Commercial Auto', 'General Liability'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://agency.nationwide.com',
    supportEmail: 'producerops@nationwide.com',
    supportPhone: '+1 (800) 882-2822',
    statementParser: 'Nationwide Standard Auto/Property Grid',
    notes: 'Standardized regional producer agreements across Northeast & Mid-Atlantic.',
    connectedBrokersCount: 27,
    totalActivePolicies: 395,
  },
  {
    id: 'CAR-007',
    carrierCode: 'BHG-007',
    naic: '22292',
    name: 'Berkshire Hathaway GUARD',
    status: 'Active',
    defaultCommissionRate: 15.5,
    linesOfBusiness: ['Workers Comp', 'BOP', 'Commercial Auto', 'Professional Liability'],
    payoutSchedule: 'Bi-Weekly',
    portalUrl: 'https://guard.com/agents',
    supportEmail: 'commissions@guard.com',
    supportPhone: '+1 (800) 673-2465',
    statementParser: 'Standard Generic Broker CSV Template',
    notes: 'Fast-turnaround direct bill workers compensation underwriting engine.',
    connectedBrokersCount: 31,
    totalActivePolicies: 488,
  },
  {
    id: 'CAR-008',
    carrierCode: 'CNA-008',
    naic: '20443',
    name: 'CNA Financial',
    status: 'Active',
    defaultCommissionRate: 16.5,
    linesOfBusiness: ['Commercial Property', 'General Liability', 'Professional Lines'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://cnaconnect.cna.com',
    supportEmail: 'producerservices@cna.com',
    supportPhone: '+1 (877) 262-2727',
    statementParser: 'Standard Generic Broker CSV Template',
    notes: 'Specialized risk appetite with high producer renewal retention rate.',
    connectedBrokersCount: 19,
    totalActivePolicies: 275,
  },
  {
    id: 'CAR-009',
    carrierCode: 'SFC-009',
    naic: '25178',
    name: 'State Farm Commercial',
    status: 'Inactive',
    defaultCommissionRate: 12.5,
    linesOfBusiness: ['BOP', 'Commercial Auto', 'Property'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://business.statefarm.com',
    supportEmail: 'commercialagency@statefarm.com',
    supportPhone: '+1 (800) 782-8332',
    statementParser: 'Standard Generic Broker CSV Template',
    notes: 'Inactive carrier configuration pending updated independent broker agency agreement.',
    connectedBrokersCount: 6,
    totalActivePolicies: 94,
  },
  {
    id: 'CAR-010',
    carrierCode: 'ZNA-010',
    naic: '16535',
    name: 'Zurich North America',
    status: 'Active',
    defaultCommissionRate: 17.0,
    linesOfBusiness: ['Large Commercial', 'Global Property', 'Casualty', 'Inland Marine'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://zurichna.com/brokers',
    supportEmail: 'comm-admin@zurichna.com',
    supportPhone: '+1 (800) 382-2150',
    statementParser: 'Standard Generic Broker CSV Template',
    notes: 'Global accounts and large commercial excess/surplus lines coverage.',
    connectedBrokersCount: 15,
    totalActivePolicies: 182,
  },
  {
    id: 'CAR-011',
    carrierCode: 'AEH-011',
    naic: '60054',
    name: 'Aetna & Humana Group',
    status: 'Active',
    defaultCommissionRate: 10.0,
    linesOfBusiness: ['Group Health', 'Group Benefits', 'Dental & Vision'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://producer.aetna.com',
    supportEmail: 'benefits-comm@aetna.com',
    supportPhone: '+1 (800) 624-0756',
    statementParser: 'Aetna & Humana Group Benefits Map',
    notes: 'Employee health benefits schedule; net flat rate per enrolled subscriber.',
    connectedBrokersCount: 24,
    totalActivePolicies: 340,
  },
  {
    id: 'CAR-012',
    carrierCode: 'ALL-012',
    naic: '19232',
    name: 'Allstate Business Insurance',
    status: 'Inactive',
    defaultCommissionRate: 13.0,
    linesOfBusiness: ['Small Commercial', 'Commercial Auto', 'General Liability'],
    payoutSchedule: 'Monthly Direct Bill',
    portalUrl: 'https://myallstate.allstate.com',
    supportEmail: 'agencyoperations@allstate.com',
    supportPhone: '+1 (800) 524-7386',
    statementParser: 'Standard Generic Broker CSV Template',
    notes: 'Direct bill integration suspended during state filing audit.',
    connectedBrokersCount: 4,
    totalActivePolicies: 68,
  },
]

const ALL_AVAILABLE_LINES = [
  'Commercial Property',
  'General Liability',
  'Workers Comp',
  'Commercial Auto',
  'Cyber Liability',
  'Inland Marine',
  'BOP',
  'Group Health',
  'Group Benefits',
  'Professional Liability',
  'Executive Protection',
  'Umbrella',
]

const ALL_PARSER_OPTIONS = [
  'Travelers Standard Grid Parser v2.1',
  'The Hartford Multi-Tab Statement',
  'Progressive Commercial Layout',
  'Liberty Mutual CSV Custom Parser',
  'Chubb Commercial Multi-Tier',
  'Nationwide Standard Auto/Property Grid',
  'Aetna & Humana Group Benefits Map',
  'Standard Generic Broker CSV Template',
]

export default function AdminCarriersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading carriers master directory...</div>}>
      <CarriersManagementContent />
    </Suspense>
  )
}

function CarriersManagementContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Master carrier records
  const [carriersList, setCarriersList] = useState<CarrierRecord[]>(INITIAL_CARRIERS)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [lineFilter, setLineFilter] = useState<string>('All')

  // Selected Carrier for Details Drawer (View Mode)
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierRecord | null>(null)

  // Add / Edit Carrier Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCarrier, setEditingCarrier] = useState<CarrierRecord | null>(null)

  // Form Fields State (20.2 Add / Edit Carrier)
  const [formName, setFormName] = useState('')
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active')
  const [formCommissionRate, setFormCommissionRate] = useState('15.0')
  const [formCode, setFormCode] = useState('')
  const [formNaic, setFormNaic] = useState('')
  const [formLines, setFormLines] = useState<string[]>([])
  const [formPayout, setFormPayout] = useState<'Monthly Direct Bill' | 'Bi-Weekly' | 'Weekly' | 'Quarterly'>('Monthly Direct Bill')
  const [formPortalUrl, setFormPortalUrl] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formParser, setFormParser] = useState('Standard Generic Broker CSV Template')
  const [formNotes, setFormNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle URL params and Sidebar Navigation Events
  useEffect(() => {
    const applyUrlParams = (searchStr?: string) => {
      const query = searchStr !== undefined ? searchStr : (typeof window !== 'undefined' ? window.location.search : '')
      const params = new URLSearchParams(query)
      const action = params.get('action')
      const view = params.get('view')
      const carrierId = params.get('id')

      if (action === 'add') {
        openAddCarrierModal()
      } else if (action === 'edit' && carrierId) {
        const target = carriersList.find((c) => c.id === carrierId)
        if (target) {
          openEditCarrierModal(target)
        }
      } else if (view === 'details' || carrierId) {
        const target = carriersList.find((c) => c.id === carrierId) || carriersList[0]
        if (target) {
          setSelectedCarrier(target)
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
  }, [carriersList])

  // Open Add Carrier modal
  function openAddCarrierModal() {
    setEditingCarrier(null)
    setFormName('')
    setFormStatus('Active')
    setFormCommissionRate('15.0')
    setFormCode(`CAR-${String(carriersList.length + 1).padStart(3, '0')}`)
    setFormNaic('')
    setFormLines(['Commercial Property', 'General Liability'])
    setFormPayout('Monthly Direct Bill')
    setFormPortalUrl('')
    setFormEmail('')
    setFormPhone('')
    setFormParser('Standard Generic Broker CSV Template')
    setFormNotes('')
    setFormError(null)
    setIsFormOpen(true)
  }

  // Open Edit Carrier modal
  function openEditCarrierModal(carrier: CarrierRecord) {
    setEditingCarrier(carrier)
    setFormName(carrier.name)
    setFormStatus(carrier.status)
    setFormCommissionRate(String(carrier.defaultCommissionRate))
    setFormCode(carrier.carrierCode)
    setFormNaic(carrier.naic)
    setFormLines([...carrier.linesOfBusiness])
    setFormPayout(carrier.payoutSchedule)
    setFormPortalUrl(carrier.portalUrl)
    setFormEmail(carrier.supportEmail)
    setFormPhone(carrier.supportPhone)
    setFormParser(carrier.statementParser)
    setFormNotes(carrier.notes || '')
    setFormError(null)
    setIsFormOpen(true)
  }

  // Close Form Modal
  function closeFormModal() {
    setIsFormOpen(false)
    setEditingCarrier(null)
    setFormError(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('action')) {
        url.searchParams.delete('action')
        url.searchParams.delete('id')
        const newSearch = url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''
        const newUrl = `${url.pathname}${newSearch}`
        window.history.pushState(null, '', newUrl)
        window.dispatchEvent(
          new CustomEvent('broker-nav-change', {
            detail: { href: newUrl, search: newSearch, pathname: url.pathname },
          })
        )
      }
    }
  }

  // Toggle Line of Business in form
  function toggleLineOfBusiness(line: string) {
    setFormLines((prev) =>
      prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line]
    )
  }

  // Save / Update Carrier
  function handleSaveCarrier(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) {
      setFormError('Please enter a valid carrier name.')
      return
    }

    const rateNum = parseFloat(formCommissionRate)
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setFormError('Please enter a valid commission rate percentage between 0% and 100%.')
      return
    }

    if (editingCarrier) {
      // Update existing
      const updated: CarrierRecord = {
        ...editingCarrier,
        name: formName.trim(),
        status: formStatus,
        defaultCommissionRate: rateNum,
        carrierCode: formCode.trim() || editingCarrier.carrierCode,
        naic: formNaic.trim() || editingCarrier.naic,
        linesOfBusiness: formLines.length > 0 ? formLines : ['Commercial Property'],
        payoutSchedule: formPayout,
        portalUrl: formPortalUrl.trim(),
        supportEmail: formEmail.trim(),
        supportPhone: formPhone.trim(),
        statementParser: formParser,
        notes: formNotes.trim(),
      }

      setCarriersList((prev) => prev.map((c) => (c.id === editingCarrier.id ? updated : c)))
      if (selectedCarrier && selectedCarrier.id === editingCarrier.id) {
        setSelectedCarrier(updated)
      }
      showToast(`Carrier "${updated.name}" updated successfully.`)
    } else {
      // Add new
      const newId = `CAR-${String(carriersList.length + 1).padStart(3, '0')}`
      const newCarrier: CarrierRecord = {
        id: newId,
        carrierCode: formCode.trim() || `CAR-${String(carriersList.length + 1).padStart(3, '0')}`,
        naic: formNaic.trim() || '00000',
        name: formName.trim(),
        status: formStatus,
        defaultCommissionRate: rateNum,
        linesOfBusiness: formLines.length > 0 ? formLines : ['Commercial Property'],
        payoutSchedule: formPayout,
        portalUrl: formPortalUrl.trim(),
        supportEmail: formEmail.trim(),
        supportPhone: formPhone.trim(),
        statementParser: formParser,
        notes: formNotes.trim(),
        connectedBrokersCount: 0,
        totalActivePolicies: 0,
      }

      setCarriersList((prev) => [newCarrier, ...prev])
      showToast(`Carrier "${newCarrier.name}" added to master directory.`)
    }

    closeFormModal()
  }

  // 1-Click Toggle Active / Inactive
  function handleToggleStatus(carrierId: string) {
    setCarriersList((prev) =>
      prev.map((c) => {
        if (c.id === carrierId) {
          const nextStatus: 'Active' | 'Inactive' = c.status === 'Active' ? 'Inactive' : 'Active'
          showToast(`${c.name} status updated to ${nextStatus}.`)
          const updated: CarrierRecord = { ...c, status: nextStatus }
          if (selectedCarrier && selectedCarrier.id === carrierId) {
            setSelectedCarrier(updated)
          }
          return updated
        }
        return c
      })
    )
  }

  // Open Details Drawer (View Mode)
  function handleOpenDetails(carrier: CarrierRecord) {
    setSelectedCarrier(carrier)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', 'details')
      url.searchParams.set('id', carrier.id)
      const newSearch = `?${url.searchParams.toString()}`
      const newUrl = `${url.pathname}${newSearch}`
      window.history.pushState(null, '', newUrl)
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: { href: newUrl, search: newSearch, pathname: url.pathname },
        })
      )
    }
  }

  // Close Details Drawer
  function handleCloseDetails() {
    setSelectedCarrier(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('view') || url.searchParams.has('id')) {
        url.searchParams.delete('view')
        url.searchParams.delete('id')
        const newSearch = url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''
        const newUrl = `${url.pathname}${newSearch}`
        window.history.pushState(null, '', newUrl)
        window.dispatchEvent(
          new CustomEvent('broker-nav-change', {
            detail: { href: newUrl, search: newSearch, pathname: url.pathname },
          })
        )
      }
    }
  }

  // Filtered Carriers Listing
  const filteredCarriers = useMemo(() => {
    return carriersList.filter((carrier) => {
      // 1. Status Filter
      if (statusFilter !== 'All' && carrier.status !== statusFilter) return false

      // 2. Line of Business Filter
      if (lineFilter !== 'All' && !carrier.linesOfBusiness.includes(lineFilter)) return false

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = carrier.name.toLowerCase().includes(q)
        const matchCode = carrier.carrierCode.toLowerCase().includes(q)
        const matchNaic = carrier.naic.toLowerCase().includes(q)
        const matchEmail = carrier.supportEmail.toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchNaic && !matchEmail) return false
      }

      return true
    })
  }, [carriersList, statusFilter, lineFilter, searchQuery])

  // Statistics
  const totalCount = carriersList.length
  const activeCount = carriersList.filter((c) => c.status === 'Active').length
  const inactiveCount = carriersList.filter((c) => c.status === 'Inactive').length
  const avgCommissionRate =
    carriersList.length > 0
      ? (carriersList.reduce((acc, c) => acc + c.defaultCommissionRate, 0) / carriersList.length).toFixed(1)
      : '0.0'

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
              Carriers Master
            </h1>

          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            20.1 Carrier Master listing &amp; 20.2 Add / Edit Carrier configuration for insurance carriers and default commission rates.
          </p>
        </div>

        {/* Header Action: Add Carrier Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAddCarrierModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-slate-950/20 hover:bg-blue-600 transition-all duration-150"
          >
            <Plus className="size-4" />
            <span>Add Carrier</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Carriers</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 font-mono">{totalCount}</p>
          <span className="text-xs text-slate-400">Configured in master catalog</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Carriers</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 font-mono">{activeCount}</p>
          <span className="text-xs text-emerald-600 font-medium">Eligible for broker binding</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inactive / Suspended</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <XCircle className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-700 font-mono">{inactiveCount}</p>
          <span className="text-xs text-slate-400">Excluded from active parsing</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Commission Rate</span>
            <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Percent className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600 font-mono">{avgCommissionRate}%</p>
          <span className="text-xs text-slate-400">Default configured baseline</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search carrier name, code, NAIC..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {(['All', 'Active', 'Inactive'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Line of Business Filter */}
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-600 cursor-pointer"
            >
              <option value="All">All Lines of Business</option>
              {ALL_AVAILABLE_LINES.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>

            {/* Reset Filter Button */}
            {(searchQuery || statusFilter !== 'All' || lineFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All')
                  setLineFilter('All')
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 transition cursor-pointer ml-1"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-slate-800">{filteredCarriers.length}</strong> of {totalCount} carriers
          </div>
        </div>
      </div>

      {/* 20.1 Carrier Master Listing Table */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-6 pr-4 min-w-[260px]">Carrier Name</th>
                <th className="py-3.5 px-4 min-w-[130px]">Status</th>
                <th className="py-3.5 px-4 min-w-[190px]">Default Commission Rate</th>
                <th className="py-3.5 px-4 min-w-[220px]">Lines of Business</th>
                <th className="py-3.5 px-4 min-w-[160px]">Payout Schedule</th>
                <th className="py-3.5 pl-4 pr-6 text-right min-w-[240px] w-[240px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCarriers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Building2 className="size-9 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No insurance carriers found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredCarriers.map((carrier) => {
                  const isActive = carrier.status === 'Active'

                  return (
                    <tr key={carrier.id} className="hover:bg-slate-50/80 transition group">
                      {/* 1. Carrier Name (with Identity Badge & NAIC) */}
                      <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 text-xs font-bold text-white shadow-xs">
                            {carrier.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(carrier)}
                              className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer text-left block"
                            >
                              {carrier.name}
                            </button>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-slate-500 font-semibold">{carrier.carrierCode}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs text-slate-400">NAIC: {carrier.naic}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Status (Active / Inactive) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1.5 ${isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                          />
                          {carrier.status}
                        </span>
                      </td>

                      {/* 3. Default Commission Rate */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 font-mono border border-blue-200/60">
                            {carrier.defaultCommissionRate.toFixed(1)}%
                          </span>
                          <span className="text-xs text-slate-400">Standard Baseline</span>
                        </div>
                      </td>

                      {/* 4. Lines of Business */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-[260px]">
                          {carrier.linesOfBusiness.slice(0, 2).map((line) => (
                            <span
                              key={line}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                            >
                              {line}
                            </span>
                          ))}
                          {carrier.linesOfBusiness.length > 2 && (
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                              +{carrier.linesOfBusiness.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 5. Payout Schedule */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700">{carrier.payoutSchedule}</span>
                      </td>

                      {/* 6. Actions (View / Edit / Activate / Deactivate) - Sticky Fixed */}
                      <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[240px] w-[240px] sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors select-none">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(carrier)}
                            title="View Carrier Details"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="size-3.5" />
                            <span>View</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditCarrierModal(carrier)}
                            title="Edit Carrier Form"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition"
                          >
                            <Edit3 className="size-3.5" />
                          </button>

                          {/* Activate / Deactivate Action */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(carrier.id)}
                            title={isActive ? 'Deactivate Carrier' : 'Activate Carrier'}
                            className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${isActive
                              ? 'border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
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

      {/* =========================================================================
         20.2 ADD / EDIT CARRIER FORM (MODAL / SLIDE-OVER)
         ========================================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={closeFormModal}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                  <Building2 className="size-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    {editingCarrier ? `Edit Carrier: ${editingCarrier.name}` : '20.2 Add New Carrier'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure master carrier identity, status, default commission rate, and integrations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveCarrier} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Carrier Name & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Carrier Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Travelers Insurance, The Hartford"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Carrier Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* 2. Default Commission Rate & Payout Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Default Commission Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={formCommissionRate}
                      onChange={(e) => setFormCommissionRate(e.target.value)}
                      placeholder="15.0"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Baseline default rate used for initial expected commission calculation.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Payout Schedule
                  </label>
                  <select
                    value={formPayout}
                    onChange={(e) => setFormPayout(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Monthly Direct Bill">Monthly Direct Bill</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              {/* 3. Other Agreed Carrier Master Information: Code & NAIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Carrier Code / Identifier
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. TRV-001"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    NAIC Number (National Registry)
                  </label>
                  <input
                    type="text"
                    value={formNaic}
                    onChange={(e) => setFormNaic(e.target.value)}
                    placeholder="e.g. 25658"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* 4. Supported Lines of Business (Multi-Select Pills) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Supported Lines of Business
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_AVAILABLE_LINES.map((line) => {
                    const selected = formLines.includes(line)
                    return (
                      <button
                        key={line}
                        type="button"
                        onClick={() => toggleLineOfBusiness(line)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${selected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                      >
                        {selected && <Check className="inline-block size-3 mr-1 -mt-0.5" />}
                        {line}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 5. Portal URL & Statement Parser Template */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Carrier Portal URL
                  </label>
                  <input
                    type="url"
                    value={formPortalUrl}
                    onChange={(e) => setFormPortalUrl(e.target.value)}
                    placeholder="https://agents.carrier.com"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Assigned Statement Parser Template
                  </label>
                  <select
                    value={formParser}
                    onChange={(e) => setFormParser(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    {ALL_PARSER_OPTIONS.map((parser) => (
                      <option key={parser} value={parser}>
                        {parser}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6. Support Email & Support Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Commission Support Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="commissions@carrier.com"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Producer Support Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (800) 000-0000"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* 7. Internal Notes / Master Guidelines */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Master Guidelines &amp; Notes
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Carrier commission payout guidelines, reconciliation cycles, or agency sub-code instructions..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-slate-950/20 hover:bg-blue-600 transition cursor-pointer"
                >
                  {editingCarrier ? 'Update Carrier' : 'Save Carrier Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         20.1 VIEW CARRIER DETAILS CANVAS DRAWER (SLIDE-OVER)
         Opened when user clicks "View" button in table or via ?view=details
         ========================================================================= */}
      {selectedCarrier && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={handleCloseDetails}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white font-bold text-sm shadow-sm">
                  {selectedCarrier.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-950">{selectedCarrier.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${selectedCarrier.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                      {selectedCarrier.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Code: <span className="font-mono font-semibold text-slate-700">{selectedCarrier.carrierCode}</span> · NAIC: <span className="font-mono text-slate-700">{selectedCarrier.naic}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseDetails()
                    openEditCarrierModal(selectedCarrier)
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Default Commission</span>
                  <p className="mt-1 text-xl font-bold text-blue-600 font-mono">
                    {selectedCarrier.defaultCommissionRate.toFixed(1)}%
                  </p>
                  <span className="text-[11px] text-slate-400">Master baseline</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Connected Brokers</span>
                  <p className="mt-1 text-xl font-bold text-slate-900 font-mono">
                    {selectedCarrier.connectedBrokersCount}
                  </p>
                  <span className="text-[11px] text-slate-400">Active agency setups</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 col-span-2 sm:col-span-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Policies</span>
                  <p className="mt-1 text-xl font-bold text-emerald-600 font-mono">
                    {selectedCarrier.totalActivePolicies}
                  </p>
                  <span className="text-[11px] text-emerald-600">Under carrier</span>
                </div>
              </div>

              {/* Carrier Information Specs */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Carrier Master Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Payout Schedule</span>
                    <span className="font-semibold text-slate-900">{selectedCarrier.payoutSchedule}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Statement Parser Template</span>
                    <span className="font-semibold text-slate-900">{selectedCarrier.statementParser}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Carrier Support Email</span>
                    <a
                      href={`mailto:${selectedCarrier.supportEmail}`}
                      className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Mail className="size-3" />
                      {selectedCarrier.supportEmail}
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Producer Support Phone</span>
                    <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                      <Phone className="size-3 text-slate-400" />
                      {selectedCarrier.supportPhone}
                    </span>
                  </div>
                </div>

                {selectedCarrier.portalUrl && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-xs block font-medium">Agent Portal URL</span>
                      <span className="text-xs font-mono text-slate-700">{selectedCarrier.portalUrl}</span>
                    </div>
                    <a
                      href={selectedCarrier.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Supported Lines of Business */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Supported Lines of Business
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCarrier.linesOfBusiness.map((line) => (
                    <span
                      key={line}
                      className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>

              {/* Master Guidelines & Notes */}
              {selectedCarrier.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Master Guidelines &amp; Notes
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedCarrier.notes}</p>
                </div>
              )}

              {/* Quick Actions in Drawer */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedCarrier.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer border ${selectedCarrier.status === 'Active'
                    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                >
                  {selectedCarrier.status === 'Active' ? 'Deactivate Carrier' : 'Activate Carrier'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleCloseDetails()
                    openEditCarrierModal(selectedCarrier)
                  }}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
                >
                  Edit Carrier Specifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
