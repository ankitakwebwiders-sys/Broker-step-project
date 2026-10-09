'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Zap,
  Search,
  Plus,
  Filter,
  Download,
  Phone,
  Mail,
  Building2,
  Calendar,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Edit3,
  Eye,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RotateCcw,
  Send,
  FilePlus2,
  MapPin,
  Tag,
  DollarSign,
  Activity,
  History,
  Check,
  Sparkles,
  ArrowUpRight,
  ArrowLeftRight,
  QrCode,
  Share2,
  Copy,
  UserCheck,
  UserPlus,
  FileText,
  BadgeCheck,
  Layers,
  HelpCircle,
  Briefcase,
} from 'lucide-react'
import {
  initialLeads,
  type LeadItem,
  type LeadStatus,
  type LeadNote,
  type LeadTimelineEvent,
} from '@/data/broker/leads'

export default function LeadsPage() {
  // Main Leads state
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads)

  // Status Filter Tabs (5.2)
  const [activeTab, setActiveTab] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [insuranceTypeFilter, setInsuranceTypeFilter] = useState('All')
  const [consentFilter, setConsentFilter] = useState('All')

  // Modals & Drawers state
  const [selectedLeadForView, setSelectedLeadForView] = useState<LeadItem | null>(null)
  const [leadDetailTab, setLeadDetailTab] = useState<'overview' | 'insurance' | 'notes' | 'consent' | 'timeline'>('overview')

  // Add / Edit Lead Modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<LeadItem | null>(null)

  // Public Lead Form Preview Modal (5.4)
  const [isPublicFormModalOpen, setIsPublicFormModalOpen] = useState(false)

  // QR Code & Share Modal (5.5)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Quick Change Status Modal
  const [statusChangeTarget, setStatusChangeTarget] = useState<LeadItem | null>(null)
  const [newStatusValue, setNewStatusValue] = useState<LeadStatus>('New')

  // Convert to Client Modal
  const [convertTarget, setConvertTarget] = useState<LeadItem | null>(null)
  const [conversionSuccessToast, setConversionSuccessToast] = useState<string | null>(null)

  // Quick Add Note state
  const [newNoteText, setNewNoteText] = useState('')

  // Form State for Add / Edit Lead
  const [leadForm, setLeadForm] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: 'CA',
    zip: '',
    dob: '',
    insuranceType: 'Commercial Property',
    currentInsurance: '',
    renewalDate: '',
    status: 'New' as LeadStatus,
    marketingConsentStatus: 'Granted' as 'Granted' | 'Pending' | 'Declined',
    estimatedPremium: '$15,000',
    source: 'Website Form' as LeadItem['source'],
    additionalInfo: '',
    notes: '',
  })

  // Public Form Simulator State (5.4)
  const [publicForm, setPublicForm] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: 'CA',
    zip: '',
    dob: '',
    insuranceType: 'Business Owners (BOP)',
    currentInsurance: '',
    renewalDate: '',
    additionalInfo: '',
    notes: '',
    marketingConsent: false, // Unchecked by default as requested in 5.4!
  })

  // Metrics Calculations
  const totalLeadsCount = leads.length
  const newLeadsCount = useMemo(() => leads.filter(l => l.status === 'New').length, [leads])
  const activePipelineCount = useMemo(() => leads.filter(l => ['New', 'Contacted', 'Follow-Up', 'Quoted'].includes(l.status)).length, [leads])
  const wonCount = useMemo(() => leads.filter(l => l.status === 'Won / Converted').length, [leads])
  const winRate = Math.round((wonCount / (leads.filter(l => ['Won / Converted', 'Lost'].includes(l.status)).length || 1)) * 100)

  // Status Tab Counts
  const statusCounts = useMemo(() => {
    return {
      All: leads.length,
      New: leads.filter(l => l.status === 'New').length,
      Contacted: leads.filter(l => l.status === 'Contacted').length,
      'Follow-Up': leads.filter(l => l.status === 'Follow-Up').length,
      Quoted: leads.filter(l => l.status === 'Quoted').length,
      'Won / Converted': leads.filter(l => l.status === 'Won / Converted').length,
      Lost: leads.filter(l => l.status === 'Lost').length,
      'Not Interested': leads.filter(l => l.status === 'Not Interested').length,
      Archived: leads.filter(l => l.status === 'Archived').length,
    }
  }, [leads])

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Tab filter
      if (activeTab !== 'All' && lead.status !== activeTab) return false

      // Insurance Type filter
      if (insuranceTypeFilter !== 'All' && lead.insuranceType !== insuranceTypeFilter) return false

      // Consent filter
      if (consentFilter !== 'All' && lead.marketingConsent.status !== consentFilter) return false

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchesName = lead.name.toLowerCase().includes(q)
        const matchesBusiness = lead.businessName.toLowerCase().includes(q)
        const matchesPhone = lead.phone.toLowerCase().includes(q)
        const matchesEmail = lead.email.toLowerCase().includes(q)
        const matchesInsurance = lead.insuranceType.toLowerCase().includes(q)
        if (!matchesName && !matchesBusiness && !matchesPhone && !matchesEmail && !matchesInsurance) {
          return false
        }
      }

      return true
    })
  }, [leads, activeTab, insuranceTypeFilter, consentFilter, searchQuery])

  // Table Drag-to-Scroll state
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
  }, [leads, filteredLeads])

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
    const delta = direction === 'left' ? -320 : 320
    tableContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' })
    setTimeout(checkTableScroll, 350)
  }

  // Handlers for Add / Edit Lead
  function openAddLeadModal() {
    setEditingLead(null)
    setLeadForm({
      firstName: '',
      lastName: '',
      businessName: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: 'CA',
      zip: '',
      dob: '1988-06-12',
      insuranceType: 'Commercial Property',
      currentInsurance: '',
      renewalDate: '',
      status: 'New',
      marketingConsentStatus: 'Granted',
      estimatedPremium: '$18,000',
      source: 'Website Form',
      additionalInfo: '',
      notes: '',
    })
    setIsLeadModalOpen(true)
  }

  function openEditLeadModal(lead: LeadItem) {
    setEditingLead(lead)
    setLeadForm({
      firstName: lead.firstName,
      lastName: lead.lastName,
      businessName: lead.businessName === '—' ? '' : lead.businessName,
      phone: lead.phone,
      email: lead.email,
      street: lead.street || '',
      city: lead.city || '',
      state: lead.state || 'CA',
      zip: lead.zip || '',
      dob: lead.dob || '',
      insuranceType: lead.insuranceType,
      currentInsurance: lead.currentInsurance,
      renewalDate: lead.renewalDate,
      status: lead.status,
      marketingConsentStatus: lead.marketingConsent.status,
      estimatedPremium: lead.estimatedPremium,
      source: lead.source,
      additionalInfo: lead.additionalInfo,
      notes: lead.notes[0]?.text || '',
    })
    setIsLeadModalOpen(true)
  }

  function handleSaveLead(e: React.FormEvent) {
    e.preventDefault()
    if (!leadForm.firstName.trim() || !leadForm.lastName.trim() || !leadForm.email.trim()) {
      alert('Please fill in First Name, Last Name, and Email.')
      return
    }

    const fullName = `${leadForm.firstName.trim()} ${leadForm.lastName.trim()}`
    const business = leadForm.businessName.trim() || '—'

    if (editingLead) {
      const updated: LeadItem = {
        ...editingLead,
        firstName: leadForm.firstName.trim(),
        lastName: leadForm.lastName.trim(),
        name: fullName,
        businessName: business,
        phone: leadForm.phone.trim(),
        email: leadForm.email.trim(),
        street: leadForm.street.trim(),
        city: leadForm.city.trim(),
        state: leadForm.state.trim(),
        zip: leadForm.zip.trim(),
        dob: leadForm.dob,
        insuranceType: leadForm.insuranceType,
        currentInsurance: leadForm.currentInsurance.trim() || 'None reported',
        renewalDate: leadForm.renewalDate || '—',
        status: leadForm.status,
        marketingConsent: {
          ...editingLead.marketingConsent,
          status: leadForm.marketingConsentStatus,
        },
        estimatedPremium: leadForm.estimatedPremium,
        source: leadForm.source,
        additionalInfo: leadForm.additionalInfo,
      }
      setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
      if (selectedLeadForView?.id === updated.id) {
        setSelectedLeadForView(updated)
      }
    } else {
      const newId = `LD-${Math.floor(200 + Math.random() * 800)}`
      const newLead: LeadItem = {
        id: newId,
        firstName: leadForm.firstName.trim(),
        lastName: leadForm.lastName.trim(),
        name: fullName,
        businessName: business,
        phone: leadForm.phone.trim(),
        email: leadForm.email.trim(),
        street: leadForm.street.trim(),
        city: leadForm.city.trim(),
        state: leadForm.state.trim(),
        zip: leadForm.zip.trim(),
        dob: leadForm.dob,
        insuranceType: leadForm.insuranceType,
        currentInsurance: leadForm.currentInsurance.trim() || 'None reported',
        renewalDate: leadForm.renewalDate || '—',
        status: leadForm.status,
        marketingConsent: {
          status: leadForm.marketingConsentStatus,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          channel: leadForm.source,
        },
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        estimatedPremium: leadForm.estimatedPremium,
        source: leadForm.source,
        additionalInfo: leadForm.additionalInfo,
        notes: leadForm.notes.trim() ? [
          {
            id: `LN-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            author: 'Jordan Davis',
            text: leadForm.notes.trim(),
          }
        ] : [],
        timeline: [
          {
            id: `LT-${Date.now()}`,
            title: 'Lead Added to Roster',
            date: 'Today, Just now',
            detail: `Manually added lead with status ${leadForm.status}.`,
            actor: 'Jordan Davis',
            type: 'creation',
          }
        ],
      }
      setLeads(prev => [newLead, ...prev])
    }

    setIsLeadModalOpen(false)
  }

  // Quick Change Status Handler
  function handleChangeStatus(target: LeadItem, status: LeadStatus) {
    const updated: LeadItem = {
      ...target,
      status,
      timeline: [
        {
          id: `LT-${Date.now()}`,
          title: `Status Changed to ${status}`,
          date: 'Today, Just now',
          detail: `Lead status updated from ${target.status} to ${status}.`,
          actor: 'Jordan Davis',
          type: 'status',
        },
        ...target.timeline,
      ],
    }
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    if (selectedLeadForView?.id === updated.id) {
      setSelectedLeadForView(updated)
    }
    setStatusChangeTarget(null)
  }

  // Convert to Client Handler (Won / Converted)
  function handleConvertToClient(lead: LeadItem) {
    const generatedClientId = `CL-${Math.floor(1050 + Math.random() * 8000)}`
    const updated: LeadItem = {
      ...lead,
      status: 'Won / Converted',
      convertedClientId: generatedClientId,
      timeline: [
        {
          id: `LT-${Date.now()}`,
          title: `Converted to Active Client #${generatedClientId}`,
          date: 'Today, Just now',
          detail: `Lead officially won and converted to active client record #${generatedClientId}.`,
          actor: 'Jordan Davis',
          type: 'conversion',
        },
        ...lead.timeline,
      ],
    }
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    if (selectedLeadForView?.id === updated.id) {
      setSelectedLeadForView(updated)
    }
    setConvertTarget(null)
    setConversionSuccessToast(`Successfully converted ${lead.name} to Client #${generatedClientId}!`)
    setTimeout(() => setConversionSuccessToast(null), 5000)
  }

  // Add Note Handler inside drawer
  function handleAddNote() {
    if (!selectedLeadForView || !newNoteText.trim()) return

    const newNote: LeadNote = {
      id: `LN-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      author: 'Jordan Davis',
      text: newNoteText.trim(),
    }

    const updated: LeadItem = {
      ...selectedLeadForView,
      notes: [newNote, ...selectedLeadForView.notes],
      timeline: [
        {
          id: `LT-${Date.now()}`,
          title: 'Note Logged',
          date: 'Today, Just now',
          detail: newNoteText.trim().slice(0, 70) + (newNoteText.length > 70 ? '...' : ''),
          actor: 'Jordan Davis',
          type: 'note',
        },
        ...selectedLeadForView.timeline,
      ],
    }

    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
    setSelectedLeadForView(updated)
    setNewNoteText('')
  }

  // Submit Public Lead Form Simulator (5.4)
  function handlePublicFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!publicForm.firstName.trim() || !publicForm.lastName.trim() || !publicForm.email.trim()) {
      alert('Please fill out Name and Email.')
      return
    }

    const newId = `LD-${Math.floor(300 + Math.random() * 600)}`
    const newLead: LeadItem = {
      id: newId,
      firstName: publicForm.firstName.trim(),
      lastName: publicForm.lastName.trim(),
      name: `${publicForm.firstName.trim()} ${publicForm.lastName.trim()}`,
      businessName: publicForm.businessName.trim() || '—',
      phone: publicForm.phone.trim() || '(555) 000-0000',
      email: publicForm.email.trim(),
      street: publicForm.street.trim(),
      city: publicForm.city.trim(),
      state: publicForm.state.trim(),
      zip: publicForm.zip.trim(),
      dob: publicForm.dob,
      insuranceType: publicForm.insuranceType,
      currentInsurance: publicForm.currentInsurance.trim() || 'None reported',
      renewalDate: publicForm.renewalDate || '—',
      status: 'New',
      marketingConsent: {
        status: publicForm.marketingConsent ? 'Granted' : 'Pending',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        channel: 'Public Web Intake',
      },
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      estimatedPremium: '$12,000',
      source: 'QR Lead Capture',
      additionalInfo: publicForm.additionalInfo,
      notes: publicForm.notes.trim() ? [
        {
          id: `LN-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          author: 'Public Inbound Form',
          text: publicForm.notes.trim(),
        }
      ] : [],
      timeline: [
        {
          id: `LT-${Date.now()}`,
          title: 'Submitted Public Lead Form',
          date: 'Today, Just now',
          detail: `Inbound request submitted via broker public page for ${publicForm.insuranceType}.`,
          actor: 'Public Form',
          type: 'creation',
        }
      ],
    }

    setLeads(prev => [newLead, ...prev])
    setIsPublicFormModalOpen(false)
    alert(`Public lead for ${newLead.name} submitted successfully! It now appears under 'New Leads'.`)
  }

  // Copy Broker Link Handler (5.5)
  function handleCopyBrokerLink() {
    navigator.clipboard.writeText('https://brokerstep.com/lead/BRK-8902')
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Helper for Status Badges
  function getLeadStatusBadge(status: LeadStatus) {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            New
          </span>
        )
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-violet-500 shrink-0" />
            Contacted
          </span>
        )
      case 'Follow-Up':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 whitespace-nowrap">
            <Clock className="size-2.5 text-amber-500 shrink-0" />
            Follow-Up
          </span>
        )
      case 'Quoted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-200 whitespace-nowrap">
            <FileText className="size-2.5 text-indigo-500 shrink-0" />
            Quoted
          </span>
        )
      case 'Won / Converted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
            <CheckCircle2 className="size-2.5 text-emerald-500 shrink-0" />
            Won / Converted
          </span>
        )
      case 'Lost':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200 whitespace-nowrap">
            <XCircle className="size-2.5 text-rose-500 shrink-0" />
            Lost
          </span>
        )
      case 'Not Interested':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200 whitespace-nowrap">
            Not Interested
          </span>
        )
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 ring-1 ring-zinc-200 whitespace-nowrap">
            Archived
          </span>
        )
    }
  }

  // Helper for Marketing Consent badge
  function getConsentBadge(status: 'Granted' | 'Pending' | 'Declined') {
    switch (status) {
      case 'Granted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
            <Check className="size-3" />
            Granted
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 whitespace-nowrap">
            <Clock className="size-3" />
            Pending
          </span>
        )
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200 whitespace-nowrap">
            <X className="size-3" />
            Declined
          </span>
        )
    }
  }

  return (
    <div className="p-4 sm:p-7 max-w-[1600px] mx-auto space-y-7">
      <div>

        {/* ───── Toast Notification for Conversion ───── */}
        {conversionSuccessToast && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="size-5 text-emerald-600" />
              <span className="text-[13px] font-medium">{conversionSuccessToast}</span>
            </div>
            <Link
              href="/broker/clients"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              Go to Client Directory &rarr;
            </Link>
          </div>
        )}

        {/* ───── Header ───── */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600">
              <span className="size-1.5 rounded-full bg-blue-500" />
              Broker Workspace · Pipeline Management
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
              Leads
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Inbound prospect pipeline, QR capture links, quote management, and client conversion workflow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 5.5 QR Code Button */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
            >
              <QrCode className="size-4 text-blue-600" />
              My QR &amp; Link
            </button>

            {/* 5.4 Public Lead Form Preview Button */}
            <button
              onClick={() => setIsPublicFormModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
            >
              <FilePlus2 className="size-4 text-slate-500" />
              Public Intake Form
            </button>

            {/* Add Lead Primary CTA */}
            <button
              onClick={openAddLeadModal}
              className="group flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)]"
            >
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Add Lead
            </button>
          </div>
        </div>

        {/* ───── Stat Cards ───── */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">Total Leads</p>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-100">
                All intake
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-900">{totalLeadsCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Prospect pipeline size</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">New Inquiries</p>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-100">
                Needs contact
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-blue-600">{newLeadsCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Uncontacted inbound leads</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">In Pipeline</p>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-100">
                Active negotiations
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-900">{activePipelineCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Contacted / Quoted / Follow-up</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">Won / Converted</p>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Active clients
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-emerald-600">{wonCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Converted to client book</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">Win Rate</p>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Outcome ratio
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-900">{winRate}%</p>
            <p className="mt-1 text-[11px] text-slate-400">Lead to client conversion</p>
          </div>
        </div>

        {/* ───── 5.2 Filter Tabs Bar ───── */}
        <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {[
              { label: 'All Leads', key: 'All' },
              { label: 'New', key: 'New' },
              { label: 'Contacted', key: 'Contacted' },
              { label: 'Follow-Up', key: 'Follow-Up' },
              { label: 'Quoted', key: 'Quoted' },
              { label: 'Won / Converted', key: 'Won / Converted' },
              { label: 'Lost', key: 'Lost' },
              { label: 'Not Interested', key: 'Not Interested' },
              { label: 'Archived', key: 'Archived' },
            ].map((tab) => {
              const count = (statusCounts as any)[tab.key] || 0
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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
                placeholder="Search lead name, business, phone, email, or line..."
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
              {/* Insurance Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-medium text-slate-500">Line:</span>
                <select
                  value={insuranceTypeFilter}
                  onChange={(e) => setInsuranceTypeFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="All">All Lines</option>
                  <option value="Commercial Property">Commercial Property</option>
                  <option value="Business Owners (BOP)">Business Owners (BOP)</option>
                  <option value="Commercial Auto">Commercial Auto</option>
                  <option value="Professional Liability">Professional Liability</option>
                  <option value="Cyber Liability">Cyber Liability</option>
                  <option value="Workers Comp">Workers Comp</option>
                  <option value="Marine & General Liability">Marine &amp; Liability</option>
                </select>
              </div>

              {/* Marketing Consent Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-medium text-slate-500">Consent:</span>
                <select
                  value={consentFilter}
                  onChange={(e) => setConsentFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Granted">Granted</option>
                  <option value="Pending">Pending</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(searchQuery || insuranceTypeFilter !== 'All' || consentFilter !== 'All' || activeTab !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setInsuranceTypeFilter('All')
                    setConsentFilter('All')
                    setActiveTab('All')
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

        {/* ───── 5.1 Common Lead Listing Table ───── */}
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
          <div
            ref={tableContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={checkTableScroll}
            className={`overflow-x-auto custom-scrollbar-table ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
              }`}
          >
            <table className="w-full min-w-[1240px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                  <th className="px-4 py-3.5 min-w-[200px]">Lead Name</th>
                  <th className="px-4 py-3.5 min-w-[170px]">Business Name</th>
                  <th className="px-4 py-3.5 min-w-[130px] whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3.5 min-w-[185px]">Email</th>
                  <th className="px-3 py-3.5 min-w-[165px]">Insurance Type / Line</th>
                  <th className="px-3 py-3.5 min-w-[115px] whitespace-nowrap">Renewal Date</th>
                  <th className="px-3 py-3.5 min-w-[130px] whitespace-nowrap">Lead Status</th>
                  <th className="px-3 py-3.5 min-w-[115px] whitespace-nowrap">Marketing Consent</th>
                  <th className="px-3 py-3.5 min-w-[110px] whitespace-nowrap">Created Date</th>
                  <th className="px-4 py-3.5 text-right min-w-[240px] w-[240px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <Zap className="mx-auto size-8 text-slate-300 mb-2" />
                      <p className="text-[13px] font-medium text-slate-600">No leads matched your criteria</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try selecting another status tab or resetting the search filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const initials = `${lead.firstName[0] || ''}${lead.lastName[0] || ''}`
                    return (
                      <tr
                        key={lead.id}
                        className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                      >
                        {/* 1. Lead Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-[11px] font-bold text-white shadow-xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => {
                                  setSelectedLeadForView(lead)
                                  setLeadDetailTab('overview')
                                }}
                                className="text-[13px] font-semibold text-slate-900 transition hover:text-blue-600 text-left truncate block cursor-pointer"
                              >
                                {lead.name}
                              </button>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                <span className="font-mono text-slate-500">{lead.id}</span>
                                <span>·</span>
                                <span className="text-blue-600 font-medium">{lead.source}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Business Name */}
                        <td className="px-4 py-3.5">
                          {lead.businessName !== '—' ? (
                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-800">
                              <Building2 className="size-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{lead.businessName}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Personal</span>
                          )}
                        </td>

                        {/* 3. Phone */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-blue-600 transition whitespace-nowrap"
                          >
                            <Phone className="size-3 text-slate-400 shrink-0" />
                            {lead.phone}
                          </a>
                        </td>

                        {/* 4. Email */}
                        <td className="px-4 py-3.5">
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-blue-600 transition truncate max-w-[180px]"
                            title={lead.email}
                          >
                            <Mail className="size-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </a>
                        </td>

                        {/* 5. Insurance Type / Line */}
                        <td className="px-3 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-semibold text-slate-800">
                              {lead.insuranceType}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px]" title={lead.currentInsurance}>
                              {lead.currentInsurance}
                            </span>
                          </div>
                        </td>

                        {/* 6. Renewal Date */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-[12px] text-slate-600 font-medium">
                          {lead.renewalDate !== '—' ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3 text-slate-400 shrink-0" />
                              {lead.renewalDate}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal">Not provided</span>
                          )}
                        </td>

                        {/* 7. Lead Status */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {getLeadStatusBadge(lead.status)}
                            {lead.convertedClientId && (
                              <Link
                                href="/broker/clients"
                                title={`Linked Client #${lead.convertedClientId}`}
                                className="rounded p-0.5 text-blue-600 hover:bg-blue-50"
                              >
                                <ExternalLink className="size-3" />
                              </Link>
                            )}
                          </div>
                        </td>

                        {/* 8. Marketing Consent */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {getConsentBadge(lead.marketingConsent.status)}
                        </td>

                        {/* 9. Created Date */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-[11px] text-slate-500">
                          {lead.createdDate}
                        </td>

                        {/* 10. Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap min-w-[240px] w-[240px]">
                          <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {/* View */}
                            <button
                              onClick={() => {
                                setSelectedLeadForView(lead)
                                setLeadDetailTab('overview')
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Eye className="size-3 text-slate-400 shrink-0" />
                              <span>View</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditLeadModal(lead)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shrink-0 cursor-pointer"
                              title="Edit Lead"
                            >
                              <Edit3 className="size-3.5" />
                            </button>

                            {/* Status Change Selector */}
                            <button
                              onClick={() => {
                                setStatusChangeTarget(lead)
                                setNewStatusValue(lead.status)
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 shrink-0 cursor-pointer"
                              title="Change Lead Status"
                            >
                              Status
                            </button>

                            {/* Convert to Client (Won / Converted) */}
                            {lead.status !== 'Won / Converted' ? (
                              <button
                                onClick={() => setConvertTarget(lead)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                                title="Convert Lead to Active Client"
                              >
                                <UserCheck className="size-3 shrink-0" />
                                <span>Convert</span>
                              </button>
                            ) : (
                              <Link
                                href="/broker/clients"
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 whitespace-nowrap shrink-0"
                              >
                                <span>Client</span>
                                <ArrowUpRight className="size-3 text-slate-400" />
                              </Link>
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

      {/* ─────────────────────────────────────────────────────────────
          5.3 LEAD DETAILS DRAWER / MODAL
      ─────────────────────────────────────────────────────────────── */}
      {selectedLeadForView && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">

            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-[14px] font-bold text-white shadow-md">
                  {selectedLeadForView.firstName[0]}{selectedLeadForView.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-bold tracking-tight text-slate-900">
                      {selectedLeadForView.name}
                    </h2>
                    {getLeadStatusBadge(selectedLeadForView.status)}
                    {getConsentBadge(selectedLeadForView.marketingConsent.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                    {selectedLeadForView.businessName !== '—' && (
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <Building2 className="size-3 text-slate-400" />
                        {selectedLeadForView.businessName}
                      </span>
                    )}
                    <span>Lead ID: <strong className="text-slate-800">{selectedLeadForView.id}</strong></span>
                    <span>Source: <strong className="text-blue-600">{selectedLeadForView.source}</strong></span>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2">
                {selectedLeadForView.status !== 'Won / Converted' ? (
                  <button
                    onClick={() => setConvertTarget(selectedLeadForView)}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <UserCheck className="size-3.5" />
                    Convert to Client
                  </button>
                ) : (
                  <Link
                    href="/broker/clients"
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-600 transition"
                  >
                    View Client File &rarr;
                  </Link>
                )}
                <button
                  onClick={() => openEditLeadModal(selectedLeadForView)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Edit3 className="size-3.5 text-slate-500" />
                  Edit
                </button>
                <button
                  onClick={() => setSelectedLeadForView(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 gap-6 bg-white overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview & Contact' },
                { key: 'insurance', label: 'Insurance Info' },
                { key: 'notes', label: `Notes (${selectedLeadForView.notes.length})` },
                { key: 'consent', label: 'Marketing Consent' },
                { key: 'timeline', label: 'Activity & Timeline' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setLeadDetailTab(tab.key as any)}
                  className={`py-3 text-[12px] font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${leadDetailTab === tab.key
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">

              {/* TAB 1: OVERVIEW & CONTACT */}
              {leadDetailTab === 'overview' && (
                <div className="flex flex-col gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Contact Information
                      </h3>
                      <div className="flex flex-col gap-2.5 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><Phone className="size-3.5 text-slate-400" /> Phone</span>
                          <a href={`tel:${selectedLeadForView.phone}`} className="font-semibold text-blue-600 hover:underline">{selectedLeadForView.phone}</a>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><Mail className="size-3.5 text-slate-400" /> Email</span>
                          <a href={`mailto:${selectedLeadForView.email}`} className="font-semibold text-blue-600 hover:underline">{selectedLeadForView.email}</a>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" /> Address</span>
                          <span className="font-medium text-slate-800 text-right max-w-[180px]">
                            {selectedLeadForView.street ? `${selectedLeadForView.street}, ${selectedLeadForView.city}, ${selectedLeadForView.state} ${selectedLeadForView.zip}` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="size-3.5 text-slate-400" /> Date of Birth</span>
                          <span className="font-medium text-slate-800">{selectedLeadForView.dob || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Pipeline Status &amp; Value
                      </h3>
                      <div className="flex flex-col gap-2.5 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Pipeline Stage</span>
                          <div>{getLeadStatusBadge(selectedLeadForView.status)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Estimated Premium</span>
                          <span className="font-bold text-slate-900 text-[13px]">{selectedLeadForView.estimatedPremium}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Intake Channel</span>
                          <span className="font-medium text-slate-800">{selectedLeadForView.source}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Created Date</span>
                          <span className="font-medium text-slate-800">{selectedLeadForView.createdDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedLeadForView.additionalInfo && (
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Additional Prospect Notes
                      </h3>
                      <p className="text-[12px] text-slate-700 leading-relaxed">
                        {selectedLeadForView.additionalInfo}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INSURANCE INFO */}
              {leadDetailTab === 'insurance' && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Requested Coverage</span>
                      <h4 className="text-[16px] font-bold text-slate-900 mt-0.5">{selectedLeadForView.insuranceType}</h4>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-[12px] pt-3 border-t border-slate-100">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <span className="text-slate-400 text-[11px] block">Current Insurance Policy</span>
                        <span className="font-semibold text-slate-800 mt-1 block">{selectedLeadForView.currentInsurance}</span>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <span className="text-slate-400 text-[11px] block">Target Renewal Date</span>
                        <span className="font-semibold text-slate-800 mt-1 block">{selectedLeadForView.renewalDate}</span>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <span className="text-slate-400 text-[11px] block">Estimated Annual Value</span>
                        <span className="font-bold text-emerald-600 mt-1 block">{selectedLeadForView.estimatedPremium}</span>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <span className="text-slate-400 text-[11px] block">Lead Status</span>
                        <span className="mt-1 block">{getLeadStatusBadge(selectedLeadForView.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NOTES */}
              {leadDetailTab === 'notes' && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <h3 className="text-[12px] font-semibold text-slate-900 mb-2">Log Follow-up Note</h3>
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add notes from phone conversation, quote considerations, follow-up schedule..."
                      className="w-full rounded-lg border border-slate-200 p-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="mt-2.5 flex justify-end">
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-600 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Send className="size-3" />
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {selectedLeadForView.notes.map((n) => (
                      <div key={n.id} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 pb-2 mb-2">
                          <span className="font-semibold text-slate-700">{n.author}</span>
                          <span>{n.date}</span>
                        </div>
                        <p className="text-[12px] text-slate-700 leading-relaxed">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MARKETING CONSENT */}
              {leadDetailTab === 'consent' && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[14px] font-semibold text-slate-900">Marketing Consent Status</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Compliant opt-in records captured via lead forms</p>
                    </div>
                    {getConsentBadge(selectedLeadForView.marketingConsent.status)}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-[12px] pt-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <span className="text-slate-400 text-[11px] block">Consent Channel</span>
                      <span className="font-semibold text-slate-800 mt-1 block">
                        {selectedLeadForView.marketingConsent.channel || selectedLeadForView.source}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <span className="text-slate-400 text-[11px] block">Recorded Timestamp</span>
                      <span className="font-semibold text-slate-800 mt-1 block">
                        {selectedLeadForView.marketingConsent.date || selectedLeadForView.createdDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TIMELINE */}
              {leadDetailTab === 'timeline' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[14px] font-semibold text-slate-900">Lead Interaction History</h3>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {selectedLeadForView.timeline.map((event) => (
                      <div key={event.id} className="relative group">
                        <div className="absolute -left-[31px] top-0.5 size-4 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-[13px] font-semibold text-slate-900">{event.title}</h4>
                            <span className="text-[10px] text-slate-400">{event.date}</span>
                          </div>
                          <p className="mt-1 text-[12px] text-slate-600">{event.detail}</p>
                          <p className="mt-1 text-[10px] text-slate-400">Recorded by: <span className="font-medium text-slate-600">{event.actor}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
              <span className="text-[11px] text-slate-400">
                Created: {selectedLeadForView.createdDate}
              </span>
              <button
                onClick={() => setSelectedLeadForView(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5.5 MY QR CODE & LEAD CAPTURE LINK MODAL
      ─────────────────────────────────────────────────────────────── */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">Broker Intake Tools</span>
                <h3 className="text-[17px] font-bold text-slate-900 mt-0.5">My QR Code &amp; Lead Link</h3>
                <p className="text-[11px] text-slate-500">Jordan Davis · Broker Code #BRK-8902</p>
              </div>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            {/* QR Visual */}
            <div className="my-5 flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 border border-slate-200/60">
              <div className="relative size-44 rounded-2xl bg-white p-3 shadow-md border border-slate-100 flex items-center justify-center">
                {/* Clean SVG representation of Broker QR code */}
                <svg viewBox="0 0 100 100" className="size-full">
                  <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" fill="#0f172a" />
                  <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" fill="#0f172a" />
                  <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" fill="#0f172a" />
                  <rect x="38" y="10" width="8" height="8" fill="#2563eb" />
                  <rect x="52" y="10" width="8" height="8" fill="#0f172a" />
                  <rect x="38" y="24" width="8" height="8" fill="#0f172a" />
                  <rect x="10" y="38" width="8" height="8" fill="#0f172a" />
                  <rect x="24" y="38" width="8" height="8" fill="#2563eb" />
                  <rect x="38" y="38" width="24" height="24" fill="#0f172a" rx="4" />
                  <circle cx="50" cy="50" r="6" fill="#ffffff" />
                  <rect x="70" y="38" width="8" height="8" fill="#2563eb" />
                  <rect x="84" y="38" width="8" height="8" fill="#0f172a" />
                  <rect x="70" y="52" width="8" height="8" fill="#0f172a" />
                  <rect x="84" y="52" width="8" height="8" fill="#2563eb" />
                  <rect x="38" y="70" width="8" height="8" fill="#0f172a" />
                  <rect x="52" y="70" width="8" height="8" fill="#2563eb" />
                  <rect x="70" y="70" width="8" height="8" fill="#0f172a" />
                  <rect x="84" y="70" width="8" height="8" fill="#0f172a" />
                  <rect x="70" y="84" width="8" height="8" fill="#2563eb" />
                  <rect x="84" y="84" width="8" height="8" fill="#0f172a" />
                </svg>
              </div>
              <p className="mt-3 text-[11px] font-medium text-slate-500">Scan with mobile camera to test public form</p>
            </div>

            {/* Broker-specific Link */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 block">Personalized Lead Capture Link</label>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pl-3">
                <span className="flex-1 truncate font-mono text-[11px] text-slate-700">
                  https://brokerstep.com/lead/BRK-8902
                </span>
                <button
                  onClick={handleCopyBrokerLink}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 shadow-xs border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3 text-slate-500" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  alert('Downloading high-resolution BrokerStep QR code image...')
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Download className="size-3.5 text-slate-500" />
                Download QR
              </button>

              <button
                onClick={() => {
                  setIsQrModalOpen(false)
                  setIsPublicFormModalOpen(true)
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2 text-[11px] font-semibold text-white hover:bg-blue-600 transition cursor-pointer"
              >
                <Eye className="size-3.5" />
                Preview Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5.4 PUBLIC LEAD FORM PREVIEW / SIMULATOR MODAL
      ─────────────────────────────────────────────────────────────── */}
      {isPublicFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-xl bg-blue-600 text-white font-bold text-[12px]">
                  BS
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">
                    Public Lead Capture Form (Preview)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Referral destination for Jordan Davis (BRK-8902)
                  </p>
                </div>
              </div>
              <button onClick={() => setIsPublicFormModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            {/* Public Form Body */}
            <form onSubmit={handlePublicFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

              <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 text-[12px] text-blue-900">
                This is the exact responsive form displayed to prospective clients when they scan your QR code or open your public lead link.
              </div>

              {/* Names */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={publicForm.firstName}
                    onChange={(e) => setPublicForm({ ...publicForm, firstName: e.target.value })}
                    placeholder="First Name"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={publicForm.lastName}
                    onChange={(e) => setPublicForm({ ...publicForm, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Business & DOB */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Business Name (where applicable)</label>
                  <input
                    type="text"
                    value={publicForm.businessName}
                    onChange={(e) => setPublicForm({ ...publicForm, businessName: e.target.value })}
                    placeholder="Company or LLC name"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Date of Birth (where applicable)</label>
                  <input
                    type="date"
                    value={publicForm.dob}
                    onChange={(e) => setPublicForm({ ...publicForm, dob: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={publicForm.phone}
                    onChange={(e) => setPublicForm({ ...publicForm, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={publicForm.email}
                    onChange={(e) => setPublicForm({ ...publicForm, email: e.target.value })}
                    placeholder="name@business.com"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={publicForm.street}
                  onChange={(e) => setPublicForm({ ...publicForm, street: e.target.value })}
                  placeholder="Street address, suite, city, state, zip"
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Insurance Type / Line & Current Insurance */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Insurance Type / Line *</label>
                  <select
                    value={publicForm.insuranceType}
                    onChange={(e) => setPublicForm({ ...publicForm, insuranceType: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Business Owners (BOP)</option>
                    <option>Commercial Property</option>
                    <option>Commercial Auto</option>
                    <option>Professional Liability</option>
                    <option>General Liability</option>
                    <option>Cyber Liability</option>
                    <option>Workers Comp</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Current Insurance Information</label>
                  <input
                    type="text"
                    value={publicForm.currentInsurance}
                    onChange={(e) => setPublicForm({ ...publicForm, currentInsurance: e.target.value })}
                    placeholder="e.g. Existing carrier name or 'None'"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Renewal Date */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Renewal Date (where applicable)</label>
                <input
                  type="date"
                  value={publicForm.renewalDate}
                  onChange={(e) => setPublicForm({ ...publicForm, renewalDate: e.target.value })}
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Additional Information */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Additional Information / Requirements</label>
                <textarea
                  rows={2}
                  value={publicForm.additionalInfo}
                  onChange={(e) => setPublicForm({ ...publicForm, additionalInfo: e.target.value })}
                  placeholder="Describe your property, number of employees, or coverage priorities..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* 5.4 Mandatory requirement: Optional Marketing Consent checkbox, UNCHECKED by default */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publicForm.marketingConsent}
                    onChange={(e) => setPublicForm({ ...publicForm, marketingConsent: e.target.checked })}
                    className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Optional Marketing Consent:</strong> I agree to receive insurance review updates, policy quotes, and renewal notices via email and SMS from BrokerStep. (Unchecked by default).
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPublicFormModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-[12px] font-semibold text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
                >
                  Simulate Public Submission
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ADD / EDIT LEAD MODAL (Workspace Form)
      ─────────────────────────────────────────────────────────────── */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">
                  {editingLead ? 'Edit Lead Record' : 'Create New Lead'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {editingLead ? 'Update lead details, requested line, or status' : 'Add an inbound or referral lead to your workspace pipeline'}
                </p>
              </div>
              <button onClick={() => setIsLeadModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={leadForm.firstName}
                    onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={leadForm.lastName}
                    onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Business Name (where applicable)</label>
                  <input
                    type="text"
                    value={leadForm.businessName}
                    onChange={(e) => setLeadForm({ ...leadForm, businessName: e.target.value })}
                    placeholder="e.g. Apex Corp"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={leadForm.dob}
                    onChange={(e) => setLeadForm({ ...leadForm, dob: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Insurance Type / Line *</label>
                  <select
                    value={leadForm.insuranceType}
                    onChange={(e) => setLeadForm({ ...leadForm, insuranceType: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option>Commercial Property</option>
                    <option>Business Owners (BOP)</option>
                    <option>Commercial Auto</option>
                    <option>Professional Liability</option>
                    <option>Cyber Liability</option>
                    <option>Workers Comp</option>
                    <option>Marine & General Liability</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Lead Status</label>
                  <select
                    value={leadForm.status}
                    onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-Up">Follow-Up</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Won / Converted">Won / Converted</option>
                    <option value="Lost">Lost</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Current Insurance</label>
                  <input
                    type="text"
                    value={leadForm.currentInsurance}
                    onChange={(e) => setLeadForm({ ...leadForm, currentInsurance: e.target.value })}
                    placeholder="e.g. Hartford"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Renewal Date</label>
                  <input
                    type="date"
                    value={leadForm.renewalDate}
                    onChange={(e) => setLeadForm({ ...leadForm, renewalDate: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Marketing Consent Status</label>
                  <select
                    value={leadForm.marketingConsentStatus}
                    onChange={(e) => setLeadForm({ ...leadForm, marketingConsentStatus: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="Granted">Granted</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Estimated Annual Premium</label>
                  <input
                    type="text"
                    value={leadForm.estimatedPremium}
                    onChange={(e) => setLeadForm({ ...leadForm, estimatedPremium: e.target.value })}
                    placeholder="$15,000"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Lead Notes</label>
                <textarea
                  rows={2}
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  placeholder="Internal remarks..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2 text-[12px] font-semibold text-white shadow-md hover:bg-blue-600 transition cursor-pointer"
                >
                  {editingLead ? 'Update Lead' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CHANGE STATUS QUICK MODAL
      ─────────────────────────────────────────────────────────────── */}
      {statusChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-[15px] font-bold text-slate-900">Change Status</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Select new stage for {statusChangeTarget.name}</p>

            <div className="mt-4 space-y-2">
              {[
                'New',
                'Contacted',
                'Follow-Up',
                'Quoted',
                'Won / Converted',
                'Lost',
                'Not Interested',
                'Archived',
              ].map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => handleChangeStatus(statusChangeTarget, statusOption as LeadStatus)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-[12px] font-medium transition cursor-pointer ${statusChangeTarget.status === statusOption
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  <span>{statusOption}</span>
                  {statusChangeTarget.status === statusOption && <Check className="size-4 text-blue-600" />}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setStatusChangeTarget(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CONVERT TO CLIENT CONFIRMATION MODAL
      ─────────────────────────────────────────────────────────────── */}
      {convertTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4">
              <UserCheck className="size-6" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900">Convert Lead to Client</h3>
            <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
              Converting <strong>{convertTarget.name}</strong> will create a new Active Client profile in your Book of Business and mark this lead as <strong>Won / Converted</strong>.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-[12px] space-y-1.5 border border-slate-200/60">
              <div className="flex justify-between">
                <span className="text-slate-500">Business</span>
                <span className="font-semibold text-slate-800">{convertTarget.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coverage Line</span>
                <span className="font-semibold text-slate-800">{convertTarget.insuranceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Annual Premium</span>
                <span className="font-bold text-emerald-600">{convertTarget.estimatedPremium}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setConvertTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConvertToClient(convertTarget)}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-[12px] font-semibold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
              >
                Confirm Conversion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
