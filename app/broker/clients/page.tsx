'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Phone,
  Mail,
  Building2,
  Calendar,
  ShieldCheck,
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
  UserCheck,
  UserX,
  X,
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
} from 'lucide-react'
import {
  initialClients,
  type ClientItem,
  type ClientPolicy,
  type CommissionTransaction,
  type ConsentRecord,
  type ClientNote,
  type ClientTimelineEvent,
} from '@/data/broker/clients'

export default function ClientsPage() {
  // Clients state (interactive client data)
  const [clients, setClients] = useState<ClientItem[]>(initialClients)

  // Status Filter Tabs
  const [activeTab, setActiveTab] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [policyLineFilter, setPolicyLineFilter] = useState('All')
  const [consentFilter, setConsentFilter] = useState<'All' | 'Granted' | 'Pending' | 'Declined' | 'Revoked'>('All')

  // Modals & Drawers state
  const [selectedClientForView, setSelectedClientForView] = useState<ClientItem | null>(null)
  const [clientDetailTab, setClientDetailTab] = useState<'overview' | 'policies' | 'commissions' | 'consent' | 'notes' | 'timeline'>('overview')

  // Add / Edit Client Modal state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null)

  // Add Policy Modal state
  const [isAddPolicyModalOpen, setIsAddPolicyModalOpen] = useState(false)
  const [policyClientTarget, setPolicyClientTarget] = useState<ClientItem | null>(null)

  // View Policy Preview Modal
  const [previewPolicy, setPreviewPolicy] = useState<{ clientName: string; policy: ClientPolicy } | null>(null)

  // View Statement Preview Modal
  const [previewStatement, setPreviewStatement] = useState<CommissionTransaction | null>(null)

  // Form State for Add/Edit Client
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    dob: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    brokerCode: 'BRK-8902',
    otherIdentifier: '',
    status: 'Active' as 'Active' | 'Inactive',
    marketingConsentStatus: 'Granted' as 'Granted' | 'Pending' | 'Declined' | 'Revoked',
    marketingChannels: ['Email'] as string[],
    notes: '',
  })

  // New Policy Form State
  const [policyForm, setPolicyForm] = useState({
    policyNumber: '',
    type: 'Commercial Auto',
    carrier: 'Travelers',
    premium: '$12,500',
    effectiveDate: '2026-11-01',
    expirationDate: '2027-10-31',
    status: 'Active' as 'Active' | 'Pending Renewal',
  })

  // New Note input in Client Details drawer
  const [newNoteText, setNewNoteText] = useState('')

  // Summary Metrics
  const totalClientsCount = clients.length
  const activeClientsCount = useMemo(() => clients.filter(c => c.status === 'Active').length, [clients])
  const inactiveClientsCount = useMemo(() => clients.filter(c => c.status === 'Inactive').length, [clients])
  const totalPoliciesCount = useMemo(() => clients.reduce((acc, c) => acc + c.policies.filter(p => p.status === 'Active').length, 0), [clients])
  const consentGrantedCount = useMemo(() => clients.filter(c => c.marketingConsent.status === 'Granted').length, [clients])
  const consentRate = Math.round((consentGrantedCount / totalClientsCount) * 100) || 0

  // Status Tab Counts
  const statusCounts = useMemo(() => {
    return {
      All: clients.length,
      Active: clients.filter(c => c.status === 'Active').length,
      Inactive: clients.filter(c => c.status === 'Inactive').length,
      'Pending Renewal': clients.filter(c => c.policies.some(p => p.status === 'Pending Renewal')).length,
      'Consent Granted': clients.filter(c => c.marketingConsent.status === 'Granted').length,
      'Consent Pending': clients.filter(c => c.marketingConsent.status === 'Pending').length,
      'Consent Declined': clients.filter(c => c.marketingConsent.status === 'Declined' || c.marketingConsent.status === 'Revoked').length,
    }
  }, [clients])

  // Filtered Clients List
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Tab filter
      if (activeTab === 'Active' && client.status !== 'Active') return false
      if (activeTab === 'Inactive' && client.status !== 'Inactive') return false
      if (activeTab === 'Pending Renewal' && !client.policies.some(p => p.status === 'Pending Renewal')) return false
      if (activeTab === 'Consent Granted' && client.marketingConsent.status !== 'Granted') return false
      if (activeTab === 'Consent Pending' && client.marketingConsent.status !== 'Pending') return false
      if (activeTab === 'Consent Declined' && client.marketingConsent.status !== 'Declined' && client.marketingConsent.status !== 'Revoked') return false

      // Dropdown status filter
      if (statusFilter !== 'All' && client.status !== statusFilter) return false

      // Policy Line filter
      if (policyLineFilter !== 'All' && !client.policies.some(p => p.type.toLowerCase().includes(policyLineFilter.toLowerCase()))) return false

      // Consent filter
      if (consentFilter !== 'All' && client.marketingConsent.status !== consentFilter) return false

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchesName = client.name.toLowerCase().includes(q)
        const matchesBusiness = client.businessName.toLowerCase().includes(q)
        const matchesPhone = client.phone.toLowerCase().includes(q)
        const matchesEmail = client.email.toLowerCase().includes(q)
        const matchesBrokerCode = client.brokerCode.toLowerCase().includes(q)
        const matchesIdentifier = client.otherIdentifier.toLowerCase().includes(q)
        const matchesPolicy = client.policies.some(p => p.policyNumber.toLowerCase().includes(q) || p.type.toLowerCase().includes(q))
        if (!matchesName && !matchesBusiness && !matchesPhone && !matchesEmail && !matchesBrokerCode && !matchesIdentifier && !matchesPolicy) {
          return false
        }
      }

      return true
    })
  }, [clients, activeTab, statusFilter, policyLineFilter, consentFilter, searchQuery])

  // Table horizontal drag-to-scroll state & handlers
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
  }, [clients, filteredClients])

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

  // Handlers for Add/Edit Client
  function openAddClientModal() {
    setEditingClient(null)
    setClientForm({
      firstName: '',
      lastName: '',
      businessName: '',
      dob: '1985-05-15',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: 'CA',
      zip: '',
      brokerCode: 'BRK-8902',
      otherIdentifier: '',
      status: 'Active',
      marketingConsentStatus: 'Granted',
      marketingChannels: ['Email'],
      notes: '',
    })
    setIsClientModalOpen(true)
  }

  function openEditClientModal(client: ClientItem) {
    setEditingClient(client)
    setClientForm({
      firstName: client.firstName,
      lastName: client.lastName,
      businessName: client.businessName === '—' ? '' : client.businessName,
      dob: client.dob,
      phone: client.phone,
      email: client.email,
      street: client.street,
      city: client.city,
      state: client.state,
      zip: client.zip,
      brokerCode: client.brokerCode,
      otherIdentifier: client.otherIdentifier,
      status: client.status,
      marketingConsentStatus: client.marketingConsent.status,
      marketingChannels: client.marketingConsent.channels,
      notes: client.notes[0]?.text || '',
    })
    setIsClientModalOpen(true)
  }

  function handleSaveClient(e: React.FormEvent) {
    e.preventDefault()
    if (!clientForm.firstName.trim() || !clientForm.lastName.trim() || !clientForm.email.trim()) {
      alert('Please fill in First Name, Last Name, and Email.')
      return
    }

    const fullName = `${clientForm.firstName.trim()} ${clientForm.lastName.trim()}`
    const business = clientForm.businessName.trim() || '—'

    if (editingClient) {
      // Update existing
      const updated: ClientItem = {
        ...editingClient,
        firstName: clientForm.firstName.trim(),
        lastName: clientForm.lastName.trim(),
        name: fullName,
        businessName: business,
        dob: clientForm.dob,
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim(),
        street: clientForm.street.trim(),
        city: clientForm.city.trim(),
        state: clientForm.state.trim(),
        zip: clientForm.zip.trim(),
        brokerCode: clientForm.brokerCode.trim(),
        otherIdentifier: clientForm.otherIdentifier.trim(),
        status: clientForm.status,
        marketingConsent: {
          ...editingClient.marketingConsent,
          status: clientForm.marketingConsentStatus,
          channels: clientForm.marketingChannels,
        },
        lastActivity: {
          description: 'Client Profile Updated',
          time: 'Just now',
        },
      }

      setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
      if (selectedClientForView?.id === updated.id) {
        setSelectedClientForView(updated)
      }
    } else {
      // Create new
      const newId = `CL-${Math.floor(1000 + Math.random() * 9000)}`
      const newClient: ClientItem = {
        id: newId,
        firstName: clientForm.firstName.trim(),
        lastName: clientForm.lastName.trim(),
        name: fullName,
        businessName: business,
        dob: clientForm.dob,
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim(),
        street: clientForm.street.trim(),
        city: clientForm.city.trim(),
        state: clientForm.state.trim(),
        zip: clientForm.zip.trim(),
        brokerCode: clientForm.brokerCode.trim() || 'BRK-8902',
        otherIdentifier: clientForm.otherIdentifier.trim() || `ID-${Math.floor(100000 + Math.random() * 900000)}`,
        status: clientForm.status,
        marketingConsent: {
          status: clientForm.marketingConsentStatus,
          channels: clientForm.marketingChannels,
          consentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          method: 'Broker Form Intake',
          notes: 'Marketing consent preferences captured at onboarding.',
        },
        notes: clientForm.notes.trim() ? [
          {
            id: `N-${Date.now()}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            author: 'Jordan Davis',
            text: clientForm.notes.trim(),
          }
        ] : [],
        lastActivity: {
          description: 'New Client Onboarded',
          time: 'Just now',
        },
        policies: [],
        commissions: [],
        timeline: [
          {
            id: `T-${Date.now()}`,
            title: 'Client Account Created',
            type: 'system',
            date: 'Today, Just now',
            detail: `Initial record set up with status ${clientForm.status}.`,
            actor: 'Jordan Davis',
          }
        ],
      }

      setClients(prev => [newClient, ...prev])
    }

    setIsClientModalOpen(false)
  }

  // Handler for Add Policy
  function openAddPolicyModal(client: ClientItem) {
    setPolicyClientTarget(client)
    setPolicyForm({
      policyNumber: `POL-${Math.floor(1000 + Math.random() * 9000)}-${['TRAV', 'CHUB', 'HART', 'AIG'][Math.floor(Math.random() * 4)]}`,
      type: 'Commercial Auto',
      carrier: 'Travelers',
      premium: '$14,800',
      effectiveDate: '2026-11-01',
      expirationDate: '2027-10-31',
      status: 'Active',
    })
    setIsAddPolicyModalOpen(true)
  }

  function handleSavePolicy(e: React.FormEvent) {
    e.preventDefault()
    if (!policyClientTarget) return

    const newPolicy: ClientPolicy = {
      id: `POL-${Date.now()}`,
      policyNumber: policyForm.policyNumber.trim(),
      type: policyForm.type,
      carrier: policyForm.carrier,
      premium: policyForm.premium.trim(),
      effectiveDate: policyForm.effectiveDate,
      expirationDate: policyForm.expirationDate,
      status: policyForm.status,
    }

    const updatedClient: ClientItem = {
      ...policyClientTarget,
      policies: [newPolicy, ...policyClientTarget.policies],
      lastActivity: {
        description: `New Policy Added (#${newPolicy.policyNumber})`,
        time: 'Just now',
      },
      timeline: [
        {
          id: `T-${Date.now()}`,
          title: `Policy Added: ${newPolicy.type}`,
          type: 'policy',
          date: 'Today, Just now',
          detail: `Bound ${newPolicy.type} policy with ${newPolicy.carrier} for ${newPolicy.premium}.`,
          actor: 'Jordan Davis',
        },
        ...policyClientTarget.timeline,
      ],
    }

    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c))
    if (selectedClientForView?.id === updatedClient.id) {
      setSelectedClientForView(updatedClient)
    }
    setIsAddPolicyModalOpen(false)
  }

  // Add Note Handler
  function handleAddNote() {
    if (!selectedClientForView || !newNoteText.trim()) return

    const newNote: ClientNote = {
      id: `N-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      author: 'Jordan Davis',
      text: newNoteText.trim(),
    }

    const updatedClient: ClientItem = {
      ...selectedClientForView,
      notes: [newNote, ...selectedClientForView.notes],
      lastActivity: {
        description: 'New Client Note Logged',
        time: 'Just now',
      },
      timeline: [
        {
          id: `T-${Date.now()}`,
          title: 'Note Added to Client File',
          type: 'contact',
          date: 'Today, Just now',
          detail: newNoteText.trim().slice(0, 70) + (newNoteText.length > 70 ? '...' : ''),
          actor: 'Jordan Davis',
        },
        ...selectedClientForView.timeline,
      ],
    }

    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c))
    setSelectedClientForView(updatedClient)
    setNewNoteText('')
  }

  // Toggle Client Status (Active <-> Inactive)
  function handleToggleStatus(client: ClientItem) {
    const nextStatus = client.status === 'Active' ? 'Inactive' : 'Active'
    const updatedClient: ClientItem = {
      ...client,
      status: nextStatus,
      lastActivity: {
        description: `Status changed to ${nextStatus}`,
        time: 'Just now',
      },
      timeline: [
        {
          id: `T-${Date.now()}`,
          title: `Client Marked ${nextStatus}`,
          type: 'system',
          date: 'Today, Just now',
          detail: `Account status updated from ${client.status} to ${nextStatus}. Historical records preserved.`,
          actor: 'Jordan Davis',
        },
        ...client.timeline,
      ],
    }
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c))
    if (selectedClientForView?.id === updatedClient.id) {
      setSelectedClientForView(updatedClient)
    }
  }

  // Helper tone styling for marketing consent
  function getConsentBadge(status: ConsentRecord['status']) {
    switch (status) {
      case 'Granted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="size-3" />
            Granted
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <Clock className="size-3" />
            Pending
          </span>
        )
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200">
            <XCircle className="size-3" />
            Declined
          </span>
        )
      case 'Revoked':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
            <RotateCcw className="size-3" />
            Revoked
          </span>
        )
    }
  }

  return (
    <div className="p-4 sm:p-7 max-w-[1600px] mx-auto space-y-7">
      <div>

        {/* ───── Header ───── */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-blue-600">
              <span className="size-1.5 rounded-full bg-blue-500" />
              Broker Workspace · Client Directory
            </p>
            <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
              Clients
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Comprehensive roster of individual and business policyholders, consent compliance, and policies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Exporting ${filteredClients.length} clients to CSV...`)
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Download className="size-4 text-slate-400" />
              Export CSV
            </button>
            <button
              onClick={openAddClientModal}
              className="group flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)]"
            >
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Add Client
            </button>
          </div>
        </div>

        {/* ───── Stat Cards ───── */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">Total Clients</p>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-100">
                Book roster
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-900">{totalClientsCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">All managed accounts</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">Active Clients</p>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-100">
                {Math.round((activeClientsCount / totalClientsCount) * 100)}% active
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-emerald-600">{activeClientsCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">In-force relationships</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">Inactive Clients</p>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                Archived
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-700">{inactiveClientsCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Historical records kept</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">In-force Policies</p>
              <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 ring-1 ring-violet-100">
                Coverage
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-900">{totalPoliciesCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Active policies in book</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-slate-500">Marketing Consent</p>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-100">
                {consentRate}% opt-in
              </span>
            </div>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-slate-900">{consentGrantedCount}/{totalClientsCount}</p>
            <p className="mt-1 text-[11px] text-slate-400">Compliant consent granted</p>
          </div>
        </div>

        {/* ───── 4.1 Filter Tabs Bar ───── */}
        <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {[
              { label: 'All Clients', key: 'All' },
              { label: 'Active', key: 'Active' },
              { label: 'Inactive', key: 'Inactive' },
              { label: 'Pending Renewal', key: 'Pending Renewal' },
              { label: 'Consent Granted', key: 'Consent Granted' },
              { label: 'Consent Pending', key: 'Consent Pending' },
              { label: 'Consent Declined', key: 'Consent Declined' },
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
                placeholder="Search by client name, business, phone, email, identifier..."
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
              {/* Client Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-medium text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Policy Line Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-medium text-slate-500">Line:</span>
                <select
                  value={policyLineFilter}
                  onChange={(e) => setPolicyLineFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="All">All Lines</option>
                  <option value="Commercial Auto">Commercial Auto</option>
                  <option value="General Liability">General Liability</option>
                  <option value="Commercial Property">Commercial Property</option>
                  <option value="Professional Liability">Professional Liability</option>
                  <option value="Workers Comp">Workers Comp</option>
                  <option value="Business Owners">Business Owners</option>
                  <option value="Commercial Umbrella">Commercial Umbrella</option>
                </select>
              </div>

              {/* Marketing Consent Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11.5px] font-medium text-slate-500">Consent:</span>
                <select
                  value={consentFilter}
                  onChange={(e) => setConsentFilter(e.target.value as any)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="All">All Consents</option>
                  <option value="Granted">Granted</option>
                  <option value="Pending">Pending</option>
                  <option value="Declined">Declined</option>
                  <option value="Revoked">Revoked</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(searchQuery || statusFilter !== 'All' || policyLineFilter !== 'All' || consentFilter !== 'All' || activeTab !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('All')
                    setPolicyLineFilter('All')
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

        {/* ───── 4.1 All Clients Listing Table ───── */}
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
            <table className="w-full min-w-[1220px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                  <th className="px-4 py-3.5 min-w-[210px]">Client Name</th>
                  <th className="px-4 py-3.5 min-w-[170px]">Business Name</th>
                  <th className="px-4 py-3.5 min-w-[135px] whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3.5 min-w-[185px]">Email</th>
                  <th className="px-3 py-3.5 min-w-[110px] whitespace-nowrap">Client Status</th>
                  <th className="px-3 py-3.5 min-w-[110px] whitespace-nowrap">Policies</th>
                  <th className="px-3 py-3.5 min-w-[125px] whitespace-nowrap">Marketing Consent</th>
                  <th className="px-4 py-3.5 min-w-[175px]">Last Activity</th>
                  <th className="px-4 py-3.5 text-right min-w-[210px] w-[210px] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <Users className="mx-auto size-8 text-slate-300 mb-2" />
                      <p className="text-[13px] font-medium text-slate-600">No clients matched your criteria</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try selecting another status tab or resetting the search filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const initials = `${client.firstName[0] || ''}${client.lastName[0] || ''}`
                    const activePolicies = client.policies.filter(p => p.status === 'Active').length
                    const totalPolicies = client.policies.length

                    return (
                      <tr
                        key={client.id}
                        className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                      >
                        {/* 1. Client Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => {
                                  setSelectedClientForView(client)
                                  setClientDetailTab('overview')
                                }}
                                className="text-[13px] font-semibold text-slate-900 transition hover:text-blue-600 text-left truncate block"
                              >
                                {client.name}
                              </button>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span>{client.brokerCode}</span>
                                <span>·</span>
                                <span>{client.otherIdentifier}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Business Name */}
                        <td className="px-4 py-3.5">
                          {client.businessName !== '—' ? (
                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-800">
                              <Building2 className="size-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[170px]">{client.businessName}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Personal</span>
                          )}
                        </td>

                        {/* 3. Phone */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <a
                            href={`tel:${client.phone}`}
                            className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-blue-600 transition whitespace-nowrap"
                          >
                            <Phone className="size-3 text-slate-400 shrink-0" />
                            {client.phone}
                          </a>
                        </td>

                        {/* 4. Email */}
                        <td className="px-4 py-3.5">
                          <a
                            href={`mailto:${client.email}`}
                            className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 hover:text-blue-600 transition truncate max-w-[180px]"
                            title={client.email}
                          >
                            <Mail className="size-3 text-slate-400 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </a>
                        </td>

                        {/* 5. Client Status */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(client)}
                            title={`Click to mark as ${client.status === 'Active' ? 'Inactive' : 'Active'}`}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 transition cursor-pointer whitespace-nowrap ${client.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 ring-slate-200 hover:bg-slate-200'
                              }`}
                          >
                            {client.status === 'Active' ? (
                              <>
                                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                                Active
                              </>
                            ) : (
                              <>
                                <span className="size-1.5 rounded-full bg-slate-400 shrink-0" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>

                        {/* 6. Policies (Current / Historical count) */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col whitespace-nowrap">
                            <span className="text-[12px] font-semibold text-slate-800">
                              {activePolicies} <span className="text-[11px] font-normal text-slate-400">Active</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {totalPolicies} total in book
                            </span>
                          </div>
                        </td>

                        {/* 7. Marketing Consent */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {getConsentBadge(client.marketingConsent.status)}
                        </td>

                        {/* 8. Last Activity */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col max-w-[170px]">
                            <span className="text-[11px] font-medium text-slate-700 truncate" title={client.lastActivity.description}>
                              {client.lastActivity.description}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                              <Clock className="size-2.5 shrink-0" />
                              {client.lastActivity.time}
                            </span>
                          </div>
                        </td>

                        {/* 9. Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap min-w-[210px] w-[210px]">
                          <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedClientForView(client)
                                setClientDetailTab('overview')
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 whitespace-nowrap shrink-0"
                            >
                              <Eye className="size-3 text-slate-400 shrink-0" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => openEditClientModal(client)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shrink-0"
                              title="Edit Client"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => openAddPolicyModal(client)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-blue-600 whitespace-nowrap shrink-0"
                              title="Add Policy to Client"
                            >
                              <Plus className="size-3 shrink-0" />
                              <span>Policy</span>
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

      {/* ─────────────────────────────────────────────────────────────
          4.5 CLIENT DETAILS DRAWER / MODAL
      ─────────────────────────────────────────────────────────────── */}
      {selectedClientForView && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
          <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">

            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-[14px] font-bold text-white shadow-md">
                  {selectedClientForView.firstName[0]}{selectedClientForView.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-bold tracking-tight text-slate-900">
                      {selectedClientForView.name}
                    </h2>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${selectedClientForView.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : 'bg-slate-100 text-slate-600 ring-slate-200'
                      }`}>
                      {selectedClientForView.status}
                    </span>
                    {getConsentBadge(selectedClientForView.marketingConsent.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                    {selectedClientForView.businessName !== '—' && (
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <Building2 className="size-3 text-slate-400" />
                        {selectedClientForView.businessName}
                      </span>
                    )}
                    <span>Broker Code: <strong className="text-slate-800">{selectedClientForView.brokerCode}</strong></span>
                    <span>ID: <strong className="text-slate-800">{selectedClientForView.otherIdentifier}</strong></span>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditClientModal(selectedClientForView)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  <Edit3 className="size-3.5 text-slate-500" />
                  Edit Client
                </button>
                <button
                  onClick={() => openAddPolicyModal(selectedClientForView)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-600 transition"
                >
                  <Plus className="size-3.5" />
                  Add Policy
                </button>
                <button
                  onClick={() => setSelectedClientForView(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                  aria-label="Close Drawer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Overview, Policies, Commissions, Consent, Notes, Timeline) */}
            <div className="flex border-b border-slate-200 px-6 gap-6 bg-white overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'policies', label: `Policies (${selectedClientForView.policies.length})` },
                { key: 'commissions', label: `Commissions (${selectedClientForView.commissions.length})` },
                { key: 'consent', label: 'Marketing Consent' },
                { key: 'notes', label: `Notes (${selectedClientForView.notes.length})` },
                { key: 'timeline', label: 'Timeline & Activity' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setClientDetailTab(tab.key as any)}
                  className={`py-3 text-[12px] font-medium border-b-2 transition whitespace-nowrap ${clientDetailTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">

              {/* TAB 1: OVERVIEW */}
              {clientDetailTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  {/* Primary Info Cards */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Contact Information
                      </h3>
                      <div className="flex flex-col gap-2.5 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><Phone className="size-3.5 text-slate-400" /> Phone</span>
                          <a href={`tel:${selectedClientForView.phone}`} className="font-semibold text-blue-600 hover:underline">{selectedClientForView.phone}</a>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><Mail className="size-3.5 text-slate-400" /> Email</span>
                          <a href={`mailto:${selectedClientForView.email}`} className="font-semibold text-blue-600 hover:underline">{selectedClientForView.email}</a>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" /> Address</span>
                          <span className="font-medium text-slate-800 text-right max-w-[180px]">
                            {selectedClientForView.street}, {selectedClientForView.city}, {selectedClientForView.state} {selectedClientForView.zip}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="size-3.5 text-slate-400" /> Date of Birth</span>
                          <span className="font-medium text-slate-800">{selectedClientForView.dob || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Broker Identifiers & Compliance
                      </h3>
                      <div className="flex flex-col gap-2.5 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Broker Assigned Code</span>
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{selectedClientForView.brokerCode}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Agreed Identifier</span>
                          <span className="font-mono font-medium text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{selectedClientForView.otherIdentifier}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Business Structure</span>
                          <span className="font-medium text-slate-800">{selectedClientForView.businessName !== '—' ? selectedClientForView.businessName : 'Individual'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Status</span>
                          <span className="font-semibold text-emerald-700">{selectedClientForView.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Policies Quick Peek */}
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        In-Force Policies ({selectedClientForView.policies.length})
                      </h3>
                      <button
                        onClick={() => setClientDetailTab('policies')}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        View all &rarr;
                      </button>
                    </div>
                    {selectedClientForView.policies.length === 0 ? (
                      <p className="text-[12px] text-slate-400 py-3 text-center">No active policies bound yet.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selectedClientForView.policies.map((p) => (
                          <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[12px]">
                            <div>
                              <p className="font-semibold text-slate-800">{p.type} <span className="text-slate-400 font-normal">({p.carrier})</span></p>
                              <p className="text-[10px] text-slate-500">{p.policyNumber} · Expires {p.expirationDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">{p.premium}</p>
                              <span className={`text-[9px] font-bold uppercase ${p.status === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>{p.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Notes Preview */}
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Recent Broker Notes
                      </h3>
                      <button
                        onClick={() => setClientDetailTab('notes')}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        Add note &rarr;
                      </button>
                    </div>
                    {selectedClientForView.notes.length === 0 ? (
                      <p className="text-[12px] text-slate-400 py-2">No notes recorded.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selectedClientForView.notes.slice(0, 2).map((n) => (
                          <div key={n.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-[12px]">
                            <p className="text-slate-700">{n.text}</p>
                            <p className="mt-1.5 text-[10px] text-slate-400 font-medium">Logged by {n.author} · {n.date}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: POLICIES (Current & Historical) */}
              {clientDetailTab === 'policies' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[14px] font-semibold text-slate-900">Current &amp; Historical Policies</h3>
                      <p className="text-[11px] text-slate-500">Track all policies associated with this client record</p>
                    </div>
                    <button
                      onClick={() => openAddPolicyModal(selectedClientForView)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-600 transition"
                    >
                      <Plus className="size-3.5" />
                      Add Policy
                    </button>
                  </div>

                  {selectedClientForView.policies.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                      <ClipboardList className="mx-auto size-8 text-slate-300 mb-2" />
                      <p className="text-[13px] font-medium text-slate-600">No policies in record</p>
                      <button
                        onClick={() => openAddPolicyModal(selectedClientForView)}
                        className="mt-3 text-[12px] font-semibold text-blue-600 hover:underline"
                      >
                        + Bind the first policy
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                      <table className="w-full min-w-[580px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                            <th className="px-4 py-3">Policy #</th>
                            <th className="px-3 py-3">Coverage Line</th>
                            <th className="px-3 py-3">Carrier</th>
                            <th className="px-3 py-3">Premium</th>
                            <th className="px-3 py-3">Term Dates</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClientForView.policies.map((policy) => (
                            <tr key={policy.id} className="border-b border-slate-50 text-[12px] hover:bg-slate-50/60 last:border-0">
                              <td className="px-4 py-3 font-semibold text-slate-900 font-mono text-[11px]">
                                {policy.policyNumber}
                              </td>
                              <td className="px-3 py-3 font-medium text-slate-800">{policy.type}</td>
                              <td className="px-3 py-3 text-slate-600">{policy.carrier}</td>
                              <td className="px-3 py-3 font-semibold text-slate-900">{policy.premium}</td>
                              <td className="px-3 py-3 text-[11px] text-slate-500">
                                {policy.effectiveDate} &rarr; {policy.expirationDate}
                              </td>
                              <td className="px-3 py-3">
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${policy.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                  : policy.status === 'Pending Renewal'
                                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                    : 'bg-slate-100 text-slate-600 ring-slate-200'
                                  }`}>
                                  {policy.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => setPreviewPolicy({ clientName: selectedClientForView.name, policy })}
                                  className="text-[11px] font-medium text-blue-600 hover:underline"
                                >
                                  View Policy
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COMMISSION HISTORY */}
              {clientDetailTab === 'commissions' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[14px] font-semibold text-slate-900">Transaction-level Commission History</h3>
                      <p className="text-[11px] text-slate-500">Traceable carrier statements and revenue payouts</p>
                    </div>
                    <Link
                      href="/broker/commissions"
                      className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Commission Ledger <ArrowUpRight className="size-3" />
                    </Link>
                  </div>

                  {selectedClientForView.commissions.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                      <DollarSign className="mx-auto size-8 text-slate-300 mb-2" />
                      <p className="text-[13px] font-medium text-slate-600">No commission records for this client yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                      <table className="w-full min-w-[580px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                            <th className="px-4 py-3">Date</th>
                            <th className="px-3 py-3">Statement #</th>
                            <th className="px-3 py-3">Carrier</th>
                            <th className="px-3 py-3">Premium</th>
                            <th className="px-3 py-3">Rate</th>
                            <th className="px-3 py-3">Amount</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Trace Statement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClientForView.commissions.map((c) => (
                            <tr key={c.id} className="border-b border-slate-50 text-[12px] hover:bg-slate-50/60 last:border-0">
                              <td className="px-4 py-3 text-slate-600 font-medium">{c.date}</td>
                              <td className="px-3 py-3 font-mono font-semibold text-slate-900">{c.statementNumber}</td>
                              <td className="px-3 py-3 text-slate-600">{c.carrier}</td>
                              <td className="px-3 py-3 text-slate-700">{c.premium}</td>
                              <td className="px-3 py-3 text-slate-600">{c.rate}</td>
                              <td className="px-3 py-3 font-bold text-emerald-600">{c.amount}</td>
                              <td className="px-3 py-3">
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${c.status === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                  : 'bg-rose-50 text-rose-700 ring-rose-200'
                                  }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => setPreviewStatement(c)}
                                  className="text-[11px] font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                  View Source
                                  <ExternalLink className="size-2.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MARKETING CONSENT */}
              {clientDetailTab === 'consent' && (
                <div className="flex flex-col gap-5">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[14px] font-semibold text-slate-900">Current Consent Status</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Compliance records with TCPA &amp; data privacy regulations</p>
                      </div>
                      {getConsentBadge(selectedClientForView.marketingConsent.status)}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 text-[12px]">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <span className="text-[11px] text-slate-400 block font-medium">Opted Channels</span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {selectedClientForView.marketingConsent.channels.length > 0 ? (
                            selectedClientForView.marketingConsent.channels.map((ch) => (
                              <span key={ch} className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                                {ch}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">No channels permitted</span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <span className="text-[11px] text-slate-400 block font-medium">Capture Method</span>
                        <span className="mt-1 block font-semibold text-slate-800">
                          {selectedClientForView.marketingConsent.method || 'Direct Intake'}
                        </span>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <span className="text-[11px] text-slate-400 block font-medium">Date Verified</span>
                        <span className="mt-1 block font-semibold text-slate-800">
                          {selectedClientForView.marketingConsent.consentDate || 'Pending confirmation'}
                        </span>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <span className="text-[11px] text-slate-400 block font-medium">IP Address / Signature Stamp</span>
                        <span className="mt-1 block font-mono text-[11px] text-slate-800">
                          {selectedClientForView.marketingConsent.ipAddress || 'Verified via paper/verbal intake'}
                        </span>
                      </div>
                    </div>

                    {selectedClientForView.marketingConsent.notes && (
                      <div className="mt-4 rounded-lg bg-blue-50/50 border border-blue-100 p-3 text-[11px] text-blue-900">
                        <strong className="font-semibold">Compliance Note:</strong> {selectedClientForView.marketingConsent.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: NOTES */}
              {clientDetailTab === 'notes' && (
                <div className="flex flex-col gap-4">
                  {/* Add Note Input */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <h3 className="text-[12px] font-semibold text-slate-900 mb-2">Add Internal Broker Note</h3>
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Type details regarding client conversations, policy renewals, coverage inquiries..."
                      className="w-full rounded-lg border border-slate-200 p-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="mt-2.5 flex justify-end">
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-600 disabled:opacity-40 transition"
                      >
                        <Send className="size-3" />
                        Save Note
                      </button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="flex flex-col gap-3">
                    {selectedClientForView.notes.map((n) => (
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

              {/* TAB 6: TIMELINE & ACTIVITY */}
              {clientDetailTab === 'timeline' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[14px] font-semibold text-slate-900">Chronological Client History</h3>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {selectedClientForView.timeline.map((event) => (
                      <div key={event.id} className="relative group">
                        {/* Dot */}
                        <div className="absolute -left-[31px] top-0.5 size-4 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-[13px] font-semibold text-slate-900">{event.title}</h4>
                            <span className="text-[10px] text-slate-400">{event.date}</span>
                          </div>
                          <p className="mt-1 text-[12px] text-slate-600">{event.detail}</p>
                          <p className="mt-1 text-[10px] text-slate-400">Actor: <span className="font-medium text-slate-600">{event.actor}</span></p>
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
                Last recorded activity: {selectedClientForView.lastActivity.description} ({selectedClientForView.lastActivity.time})
              </span>
              <button
                onClick={() => setSelectedClientForView(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4.4 ADD / EDIT CLIENT MODAL FORM
      ─────────────────────────────────────────────────────────────── */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">
                  {editingClient ? 'Edit Client Profile' : 'Add New Client'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {editingClient ? 'Update client records, identifiers, and compliance' : 'Create a new client record in your broker book'}
                </p>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveClient} className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Names */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.firstName}
                    onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                    placeholder="e.g. Marcus"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.lastName}
                    onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                    placeholder="e.g. Vance"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Business & DOB */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Business Name (optional)</label>
                  <input
                    type="text"
                    value={clientForm.businessName}
                    onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
                    placeholder="e.g. Vance Logistics LLC"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={clientForm.dob}
                    onChange={(e) => setClientForm({ ...clientForm, dob: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Primary Phone</label>
                  <input
                    type="tel"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Primary Email *</label>
                  <input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="client@example.com"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={clientForm.street}
                  onChange={(e) => setClientForm({ ...clientForm, street: e.target.value })}
                  placeholder="Street, Suite, Apt"
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    placeholder="City"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={clientForm.state}
                    onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                    placeholder="WA"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={clientForm.zip}
                    onChange={(e) => setClientForm({ ...clientForm, zip: e.target.value })}
                    placeholder="98104"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Identifiers */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Broker Code / Identifier</label>
                  <input
                    type="text"
                    value={clientForm.brokerCode}
                    onChange={(e) => setClientForm({ ...clientForm, brokerCode: e.target.value })}
                    placeholder="BRK-8902"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Other Agreed Identifier (Tax ID / SSN / EIN)</label>
                  <input
                    type="text"
                    value={clientForm.otherIdentifier}
                    onChange={(e) => setClientForm({ ...clientForm, otherIdentifier: e.target.value })}
                    placeholder="EIN-94-3829102"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Status & Marketing Consent */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Client Status</label>
                  <select
                    value={clientForm.status}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Marketing Consent Status</label>
                  <select
                    value={clientForm.marketingConsentStatus}
                    onChange={(e) => setClientForm({ ...clientForm, marketingConsentStatus: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="Granted">Granted</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Client Notes</label>
                <textarea
                  rows={2}
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="Optional internal remarks or background history..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2 text-[12px] font-semibold text-white shadow-md hover:bg-blue-600 transition"
                >
                  {editingClient ? 'Update Client' : 'Save Client'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ADD POLICY MODAL (Quick Action)
      ─────────────────────────────────────────────────────────────── */}
      {isAddPolicyModalOpen && policyClientTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/50">
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Add Policy to {policyClientTarget.name}</h2>
                <p className="text-[11px] text-slate-500">Attach a new in-force or pending policy to this client</p>
              </div>
              <button
                onClick={() => setIsAddPolicyModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Policy Number *</label>
                <input
                  type="text"
                  required
                  value={policyForm.policyNumber}
                  onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                  placeholder="e.g. POL-8842-TRAV"
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Coverage Line</label>
                  <select
                    value={policyForm.type}
                    onChange={(e) => setPolicyForm({ ...policyForm, type: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Commercial Auto</option>
                    <option>General Liability</option>
                    <option>Professional Liability</option>
                    <option>Business Owners</option>
                    <option>Workers Comp</option>
                    <option>Commercial Property</option>
                    <option>Commercial Umbrella</option>
                    <option>Cyber Liability</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Carrier</label>
                  <select
                    value={policyForm.carrier}
                    onChange={(e) => setPolicyForm({ ...policyForm, carrier: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option>Travelers</option>
                    <option>Chubb</option>
                    <option>Hartford</option>
                    <option>AIG</option>
                    <option>CNA</option>
                    <option>Medical Protective</option>
                    <option>Berkshire Hathaway</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Annual Premium</label>
                  <input
                    type="text"
                    required
                    value={policyForm.premium}
                    onChange={(e) => setPolicyForm({ ...policyForm, premium: e.target.value })}
                    placeholder="$14,500"
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Policy Status</label>
                  <select
                    value={policyForm.status}
                    onChange={(e) => setPolicyForm({ ...policyForm, status: e.target.value as any })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Renewal">Pending Renewal</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={policyForm.effectiveDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, effectiveDate: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Expiration Date</label>
                  <input
                    type="date"
                    value={policyForm.expirationDate}
                    onChange={(e) => setPolicyForm({ ...policyForm, expirationDate: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPolicyModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-2 text-[12px] font-semibold text-white shadow-md hover:bg-blue-600 transition"
                >
                  Bind Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW POLICY PREVIEW MODAL
      ─────────────────────────────────────────────────────────────── */}
      {previewPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Policy Detail</span>
                <h3 className="text-[16px] font-bold text-slate-900 mt-0.5">{previewPolicy.policy.policyNumber}</h3>
                <p className="text-[11px] text-slate-500">Client: {previewPolicy.clientName}</p>
              </div>
              <button onClick={() => setPreviewPolicy(null)} className="text-slate-400 hover:text-slate-700">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-[12px]">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Coverage Type</span>
                <span className="font-semibold text-slate-800">{previewPolicy.policy.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Underwriting Carrier</span>
                <span className="font-semibold text-slate-800">{previewPolicy.policy.carrier}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Annual Premium</span>
                <span className="font-bold text-slate-900">{previewPolicy.policy.premium}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Effective Date</span>
                <span className="text-slate-700">{previewPolicy.policy.effectiveDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Expiration Date</span>
                <span className="text-slate-700">{previewPolicy.policy.expirationDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-emerald-600">{previewPolicy.policy.status}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPreviewPolicy(null)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-600 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW SOURCE STATEMENT MODAL
      ─────────────────────────────────────────────────────────────── */}
      {previewStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Traceable Carrier Statement</span>
                <h3 className="text-[16px] font-bold text-slate-900 mt-0.5">Statement #{previewStatement.statementNumber}</h3>
                <p className="text-[11px] text-slate-500">Carrier: {previewStatement.carrier}</p>
              </div>
              <button onClick={() => setPreviewStatement(null)} className="text-slate-400 hover:text-slate-700">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-[12px]">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-medium text-slate-800">{previewStatement.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Payout Date</span>
                <span className="text-slate-700">{previewStatement.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Associated Policy</span>
                <span className="font-mono text-slate-800">{previewStatement.policyNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Gross Premium</span>
                <span className="font-medium text-slate-800">{previewStatement.premium}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Commission Rate</span>
                <span className="font-medium text-slate-800">{previewStatement.rate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Broker Net Payment</span>
                <span className="font-bold text-emerald-600 text-[14px]">{previewStatement.amount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Reconciliation Status</span>
                <span className="font-semibold text-emerald-600">{previewStatement.status}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/broker/statements"
                className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Go to Statements Module <ArrowUpRight className="size-3" />
              </Link>
              <button
                onClick={() => setPreviewStatement(null)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-[12px] font-semibold text-white hover:bg-blue-600 transition"
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
