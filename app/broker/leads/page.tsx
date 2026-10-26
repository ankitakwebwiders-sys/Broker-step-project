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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
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
  Lock,
  Trash2,
} from 'lucide-react'
import {
  initialLeads,
  type LeadItem,
  type LeadStatus,
  type LeadNote,
  type LeadTimelineEvent,
} from '@/data/broker/leads'
import { addRecycledItem } from '@/data/broker/recycleBin'

export interface ConsentRecordItem {
  id: string
  client: string
  contact: string
  channel: string
  date: string
  status: 'Consented' | 'Pending' | 'Withdrawn' | 'Declined'
  hash: string
  ip: string
  scope: string[]
}

const initialConsentRecords: ConsentRecordItem[] = [
  {
    id: 'REC-901',
    client: 'Apex Logistics Inc.',
    contact: 'Robert Vance',
    channel: 'SMS + Email',
    date: 'Oct 08, 2026',
    status: 'Consented',
    hash: 'SHA256:8891c4d92a104e76',
    ip: '198.51.100.42 (New York, NY)',
    scope: ['SMS Renewal Notices', 'Email Quotes', 'Electronic Delivery'],
  },
  {
    id: 'REC-902',
    client: 'Harbor Dental Care',
    contact: 'Dr. Amy Lin',
    channel: 'Email Verification',
    date: 'Oct 02, 2026',
    status: 'Consented',
    hash: 'SHA256:4910a173bd9120ee',
    ip: '198.51.100.11 (Brooklyn, NY)',
    scope: ['Email Quotes', 'Policy Revisions'],
  },
  {
    id: 'REC-903',
    client: 'Cascade Manufacturing',
    contact: 'Thomas Miller',
    channel: 'SMS Automated',
    date: 'Sep 24, 2026',
    status: 'Withdrawn',
    hash: 'SHA256:1192e9bf4327aa81',
    ip: '203.0.113.88 (Albany, NY)',
    scope: ['SMS Renewal Notices'],
  },
  {
    id: 'REC-904',
    client: 'Skyline Restaurant Group',
    contact: 'Mario Conti',
    channel: 'In-Person Digital',
    date: 'Sep 18, 2026',
    status: 'Consented',
    hash: 'SHA256:6630d88470aefb19',
    ip: '198.51.100.95 (Manhattan, NY)',
    scope: ['SMS Renewal Notices', 'Email Quotes', 'Direct Calls'],
  },
  {
    id: 'REC-905',
    client: 'Beacon Freight LLC',
    contact: 'Marcus Brody',
    channel: 'Phone Verification',
    date: 'Sep 12, 2026',
    status: 'Declined',
    hash: 'SHA256:0041f2e1a88c39b7',
    ip: '203.0.113.4 (Queens, NY)',
    scope: ['Direct Calls'],
  },
]

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

  // Selection & Bulk Actions state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])
  const [deleteModalState, setDeleteModalState] = useState<{
    type: 'single'
    lead: LeadItem
  } | {
    type: 'bulk'
    count: number
    ids: string[]
  } | null>(null)
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null)

  // In-memory UI mode: clear previous session custom leads so refresh always restores full roster
  useEffect(() => {
    try {
      localStorage.removeItem('broker_custom_leads')
      setLeads(initialLeads)
    } catch (err) {
      console.error('Failed to reset leads on mount', err)
    }

    const handleRestored = (e: any) => {
      const item = e.detail?.item
      if (item && item.type === 'lead' && item.originalData) {
        setLeads(prev => {
          if (prev.some(l => l.id === item.originalData.id)) return prev
          return [item.originalData, ...prev]
        })
      }
    }
    window.addEventListener('broker_recycle_bin_restored', handleRestored)
    return () => window.removeEventListener('broker_recycle_bin_restored', handleRestored)
  }, [])

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

  // Sorting state for Lead Listing Table
  type LeadSortField =
    | 'name'
    | 'businessName'
    | 'phone'
    | 'email'
    | 'insuranceType'
    | 'renewalDate'
    | 'status'
    | 'consent'
    | 'createdDate'
  type SortDirection = 'asc' | 'desc'
  const [sortField, setSortField] = useState<LeadSortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: LeadSortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    const list = leads.filter(lead => {
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

    list.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          break
        case 'businessName':
          comparison = (a.businessName === '—' ? '' : a.businessName).localeCompare(
            b.businessName === '—' ? '' : b.businessName,
            undefined,
            { sensitivity: 'base' }
          )
          break
        case 'phone':
          comparison = (a.phone || '').localeCompare(b.phone || '', undefined, { numeric: true })
          break
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '', undefined, { sensitivity: 'base' })
          break
        case 'insuranceType':
          comparison = (a.insuranceType || '').localeCompare(b.insuranceType || '')
          break
        case 'renewalDate': {
          const dateA = a.renewalDate === '—' ? '' : a.renewalDate
          const dateB = b.renewalDate === '—' ? '' : b.renewalDate
          comparison = dateA.localeCompare(dateB)
          break
        }
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'consent':
          comparison = a.marketingConsent.status.localeCompare(b.marketingConsent.status)
          break
        case 'createdDate':
          comparison = (a.createdDate || '').localeCompare(b.createdDate || '')
          break
        default:
          comparison = 0
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return list
  }, [leads, activeTab, insuranceTypeFilter, consentFilter, searchQuery, sortField, sortDirection])

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

  // Consent History & Client Registry state
  const [consentRecords, setConsentRecords] = useState<ConsentRecordItem[]>(initialConsentRecords)
  const [consentSearchQuery, setConsentSearchQuery] = useState('')
  const [consentFilterStatus, setConsentFilterStatus] = useState<string>('All')
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<ConsentRecordItem | null>(null)
  const [copiedConsentHash, setCopiedConsentHash] = useState(false)

  // Consent sorting state
  const [consentSortField, setConsentSortField] = useState<'client' | 'contact' | 'channel' | 'date' | 'status' | 'hash' | null>(null)
  const [consentSortDirection, setConsentSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleConsentSort = (field: 'client' | 'contact' | 'channel' | 'date' | 'status' | 'hash') => {
    if (consentSortField === field) {
      if (consentSortDirection === 'asc') {
        setConsentSortDirection('desc')
      } else {
        setConsentSortField(null)
        setConsentSortDirection('asc')
      }
    } else {
      setConsentSortField(field)
      setConsentSortDirection('asc')
    }
  }

  const handleCopyConsentHash = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedConsentHash(true)
    setTimeout(() => setCopiedConsentHash(false), 2000)
  }

  const filteredConsentRecords = useMemo(() => {
    const list = consentRecords.filter((r) => {
      const matchesFilter = consentFilterStatus === 'All' || r.status === consentFilterStatus
      const matchesSearch =
        r.client.toLowerCase().includes(consentSearchQuery.toLowerCase()) ||
        r.contact.toLowerCase().includes(consentSearchQuery.toLowerCase()) ||
        r.channel.toLowerCase().includes(consentSearchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(consentSearchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })

    if (!consentSortField) return list

    return [...list].sort((a, b) => {
      let comparison = 0
      switch (consentSortField) {
        case 'client':
          comparison = a.client.localeCompare(b.client, undefined, { sensitivity: 'base' })
          break
        case 'contact':
          comparison = a.contact.localeCompare(b.contact, undefined, { sensitivity: 'base' })
          break
        case 'channel':
          comparison = a.channel.localeCompare(b.channel, undefined, { sensitivity: 'base' })
          break
        case 'date':
          comparison = a.date.localeCompare(b.date)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'hash':
          comparison = a.hash.localeCompare(b.hash)
          break
        default:
          comparison = 0
      }
      return consentSortDirection === 'asc' ? comparison : -comparison
    })
  }, [consentRecords, consentFilterStatus, consentSearchQuery, consentSortField, consentSortDirection])

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

  // Sync URL query params with tabs, modals, and drawers
  useEffect(() => {
    function applyUrlParams(searchStr?: string) {
      if (typeof window === 'undefined') return
      const query = searchStr !== undefined ? searchStr : window.location.search
      const params = new URLSearchParams(query)
      const tab = params.get('tab')
      const action = params.get('action')
      const view = params.get('view')
      if (tab) {
        if (tab === 'Won') setActiveTab('Won / Converted')
        else setActiveTab(tab)
      } else if (!params.toString()) {
        setActiveTab('All')
      }
      if (action === 'add') openAddLeadModal()
      if (action === 'qr') setIsQrModalOpen(true)
      if (view === 'details' && initialLeads.length > 0) {
        setSelectedLeadForView(initialLeads[0])
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
    let newHref = '/broker/leads'
    if (tabKey === 'Won / Converted') newHref = '/broker/leads?tab=Won'
    else if (tabKey !== 'All') newHref = `/broker/leads?tab=${encodeURIComponent(tabKey)}`

    const targetSearch = newHref.includes('?') ? `?${newHref.split('?')[1]}` : ''
    window.history.pushState(null, '', newHref)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: newHref, search: targetSearch, pathname: '/broker/leads' },
      })
    )
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

  // Selection helpers
  const isAllSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.id))
  const isSomeSelected = filteredLeads.some(l => selectedLeadIds.includes(l.id)) && !isAllSelected

  function handleSelectAll() {
    if (isAllSelected) {
      setSelectedLeadIds(prev => prev.filter(id => !filteredLeads.some(l => l.id === id)))
    } else {
      const visibleIds = filteredLeads.map(l => l.id)
      setSelectedLeadIds(prev => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  function handleToggleLead(leadId: string) {
    setSelectedLeadIds(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    )
  }

  // Deletion execution (Step 1: Move to Recycle Bin)
  function handleConfirmDelete() {
    if (!deleteModalState) return

    if (deleteModalState.type === 'single') {
      const lead = deleteModalState.lead
      const leadId = lead.id
      const leadName = lead.name

      // Add to Recycle Bin
      addRecycledItem({
        originalId: lead.id,
        type: 'lead',
        title: lead.name,
        subtitle: lead.businessName,
        details: `${lead.insuranceType} · ${lead.estimatedPremium}`,
        email: lead.email,
        phone: lead.phone,
        originalData: lead,
      })

      setLeads(prev => prev.filter(l => l.id !== leadId))
      setSelectedLeadIds(prev => prev.filter(id => id !== leadId))
      if (selectedLeadForView?.id === leadId) {
        setSelectedLeadForView(null)
      }
      setDeleteSuccessToast(`Lead "${leadName}" moved to Recycle Bin. (30 days to recover or purge)`)
    } else if (deleteModalState.type === 'bulk') {
      const idsToDelete = new Set(deleteModalState.ids)
      const count = deleteModalState.count

      // Add each to Recycle Bin
      leads.forEach(l => {
        if (idsToDelete.has(l.id)) {
          addRecycledItem({
            originalId: l.id,
            type: 'lead',
            title: l.name,
            subtitle: l.businessName,
            details: `${l.insuranceType} · ${l.estimatedPremium}`,
            email: l.email,
            phone: l.phone,
            originalData: l,
          })
        }
      })

      setLeads(prev => prev.filter(l => !idsToDelete.has(l.id)))
      setSelectedLeadIds(prev => prev.filter(id => !idsToDelete.has(id)))
      if (selectedLeadForView && idsToDelete.has(selectedLeadForView.id)) {
        setSelectedLeadForView(null)
      }
      setDeleteSuccessToast(`${count} leads moved to Recycle Bin (30-day retention buffer).`)
    }

    setDeleteModalState(null)
    setTimeout(() => {
      setDeleteSuccessToast(null)
    }, 5500)
  }

  // Bulk Status change
  function handleBulkStatusChange(status: LeadStatus) {
    if (selectedLeadIds.length === 0) return
    const idsSet = new Set(selectedLeadIds)
    setLeads(prev =>
      prev.map(l => {
        if (!idsSet.has(l.id)) return l
        return {
          ...l,
          status,
          timeline: [
            {
              id: `LT-${Date.now()}-${Math.random()}`,
              title: `Bulk Status Update to ${status}`,
              date: 'Today, Just now',
              detail: `Status updated via bulk action.`,
              actor: 'Jordan Davis',
              type: 'status',
            },
            ...l.timeline,
          ],
        }
      })
    )
    setConversionSuccessToast(`Updated status to "${status}" for ${selectedLeadIds.length} lead(s).`)
    setTimeout(() => setConversionSuccessToast(null), 4000)
  }


  // Helper for Status Badges
  function getLeadStatusBadge(status: LeadStatus) {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800/40 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            New
          </span>
        )
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-400 ring-1 ring-violet-200 dark:ring-violet-800/40 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-violet-500 shrink-0" />
            Contacted
          </span>
        )
      case 'Follow-Up':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800/40 whitespace-nowrap">
            <Clock className="size-2.5 text-amber-500 shrink-0" />
            Follow-Up
          </span>
        )
      case 'Quoted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800/40 whitespace-nowrap">
            <FileText className="size-2.5 text-indigo-500 shrink-0" />
            Quoted
          </span>
        )
      case 'Won / Converted':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/40 whitespace-nowrap">
            <CheckCircle2 className="size-2.5 text-emerald-500 shrink-0" />
            Won / Converted
          </span>
        )
      case 'Lost':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800/40 whitespace-nowrap">
            <XCircle className="size-2.5 text-rose-500 shrink-0" />
            Lost
          </span>
        )
      case 'Not Interested':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 whitespace-nowrap">
            Not Interested
          </span>
        )
      case 'Archived':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700 whitespace-nowrap">
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
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/40 whitespace-nowrap">
            <Check className="size-3" />
            Granted
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800/40 whitespace-nowrap">
            <Clock className="size-3" />
            Pending
          </span>
        )
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-400 ring-1 ring-rose-200 dark:ring-rose-800/40 whitespace-nowrap">
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
          <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3 text-emerald-900 dark:text-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[13px] font-medium">{conversionSuccessToast}</span>
            </div>
            <Link
              href="/broker/clients"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 hover:underline"
            >
              Go to Client Directory &rarr;
            </Link>
          </div>
        )}

        {/* ───── Toast Notification for Deletion ───── */}
        {deleteSuccessToast && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/50 px-4 py-3 text-rose-900 dark:text-rose-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <Trash2 className="size-5 text-rose-600 dark:text-rose-400" />
              <span className="text-[13px] font-medium">{deleteSuccessToast}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/broker/recycle-bin?tab=Leads"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-rose-700 dark:text-rose-400 hover:underline"
              >
                <span>View in Recycle Bin</span>
                <ChevronRight className="size-3" />
              </Link>
              <button
                onClick={() => setDeleteSuccessToast(null)}
                className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-200 p-1 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}


        {/* ───── Header ───── */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <span className="size-1.5 rounded-full bg-blue-500" />
              Broker Workspace · Pipeline Management
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Leads
            </h1>
            <p className="mt-1 text-sm sm:text-[15px] text-slate-500 leading-relaxed">
              Inbound prospect pipeline, QR capture links, quote management, <br />and client conversion workflow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Recycle Bin CTA */}
            <Link
              href="/broker/recycle-bin?tab=Leads"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Trash2 className="size-4 text-slate-400" />
              <span>Recycle Bin</span>
            </Link>

            {/* 5.5 QR Code Button */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <QrCode className="size-4 text-blue-600" />
              My QR &amp; Link
            </button>

            {/* 5.4 Public Lead Form Preview Button */}
            <button
              onClick={() => setIsPublicFormModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              <FilePlus2 className="size-4 text-slate-500" />
              Public Intake Form
            </button>

            {/* Add Lead Primary CTA */}
            <button
              onClick={openAddLeadModal}
              className="group flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all hover:bg-blue-600 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.5)] cursor-pointer"
            >
              <Plus className="size-4 transition-transform group-hover:rotate-90" />
              Add Lead
            </button>
          </div>
        </div>

        {/* ───── Stat Cards ───── */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Leads</p>
              <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                All intake
              </span>
            </div>
            <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{totalLeadsCount}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Prospect pipeline size</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">New Inquiries</p>
              <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Needs contact
              </span>
            </div>
            <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">{newLeadsCount}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Uncontacted inbound leads</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In Pipeline</p>
              <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                Active negotiations
              </span>
            </div>
            <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{activePipelineCount}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Contacted / Quoted / Follow-up</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Won / Converted</p>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Active clients
              </span>
            </div>
            <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">{wonCount}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Converted to client book</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Win Rate</p>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Outcome ratio
              </span>
            </div>
            <p className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{winRate}%</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Lead to client conversion</p>
          </div>
        </div>

        {/* ───── 5.2 Filter Tabs Bar ───── */}
        <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
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
                  onClick={() => handleTabSelect(tab.key)}
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
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-8 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
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

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Insurance Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600">Line:</span>
                <select
                  value={insuranceTypeFilter}
                  onChange={(e) => setInsuranceTypeFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
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
                <span className="text-xs font-medium text-slate-600">Consent:</span>
                <select
                  value={consentFilter}
                  onChange={(e) => setConsentFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
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
                  className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ───── Bulk Actions Bar ───── */}
        {selectedLeadIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/90 dark:bg-blue-950/40 px-4 py-3 shadow-xs animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {selectedLeadIds.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-blue-950 dark:text-blue-100">
                {selectedLeadIds.length === 1 ? '1 lead selected' : `${selectedLeadIds.length} leads selected`}
              </span>
              <span className="text-xs text-blue-600/70 dark:text-blue-400">
                (across current filtered view)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedLeadIds([])}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Deselect All
              </button>
              <button
                onClick={() => setDeleteModalState({ type: 'bulk', count: selectedLeadIds.length, ids: selectedLeadIds })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Selected ({selectedLeadIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* ───── 5.1 Common Lead Listing Table ───── */}
        <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-[0_1px_2px_rgba(15,23,42,0.03)] overflow-hidden">
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
            <table className="w-full min-w-[1280px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                  {/* Select All Checkbox */}
                  <th className="py-3 px-4 w-[48px] select-none text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected
                      }}
                      onChange={handleSelectAll}
                      className="size-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                      title={isAllSelected ? 'Deselect all visible' : 'Select all visible'}
                    />
                  </th>

                  {/* 1. Lead Name */}
                  <th className="px-4 py-3 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'name' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Lead Name (${sortField === 'name' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                    >
                      <span>Lead Name</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'name'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 2. Business Name */}
                  <th className="px-4 py-3 min-w-[170px]">
                    <button
                      type="button"
                      onClick={() => handleSort('businessName')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'businessName' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Business Name (${sortField === 'businessName' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                    >
                      <span>Business Name</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'businessName'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'businessName' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 3. Phone */}
                  <th className="px-4 py-3 min-w-[130px] whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort('phone')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'phone' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Phone (${sortField === 'phone' && sortDirection === 'asc' ? 'Descending' : 'Ascending'})`}
                    >
                      <span>Phone</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'phone'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'phone' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 4. Email */}
                  <th className="px-4 py-3 min-w-[185px]">
                    <button
                      type="button"
                      onClick={() => handleSort('email')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'email' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Email (${sortField === 'email' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                    >
                      <span>Email</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'email'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'email' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 5. Insurance Type / Line */}
                  <th className="px-3 py-3 min-w-[185px]">
                    <button
                      type="button"
                      onClick={() => handleSort('insuranceType')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'insuranceType' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Insurance Type (${sortField === 'insuranceType' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                    >
                      <span>Insurance Type / Line</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'insuranceType'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'insuranceType' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 6. Renewal Date */}
                  <th className="px-3 py-3 min-w-[135px] whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort('renewalDate')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'renewalDate' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Renewal Date (${sortField === 'renewalDate' && sortDirection === 'asc' ? 'Latest first' : 'Earliest first'})`}
                    >
                      <span>Renewal Date</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'renewalDate'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'renewalDate' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 7. Lead Status */}
                  <th className="px-3 py-3 min-w-[135px] whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'status' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Lead Status (${sortField === 'status' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                    >
                      <span>Lead Status</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'status'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'status' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 8. Marketing Consent */}
                  <th className="px-3 py-3 min-w-[145px] whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort('consent')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'consent' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Marketing Consent (${sortField === 'consent' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                    >
                      <span>Marketing Consent</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'consent'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'consent' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 9. Created Date */}
                  <th className="px-3 py-3 min-w-[130px] whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort('createdDate')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'createdDate' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Created Date (${sortField === 'createdDate' && sortDirection === 'asc' ? 'Oldest first' : 'Newest first'})`}
                    >
                      <span>Created Date</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'createdDate'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {sortField === 'createdDate' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* 10. Actions (Sticky) */}
                  <th className="py-3.5 pl-4 pr-6 text-right min-w-[250px] w-[250px] md:sticky md:right-0 md:z-20 bg-slate-50 dark:bg-slate-900 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] dark:md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.5)] select-none">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <Zap className="mx-auto size-8 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No leads matched your criteria</p>
                      <p className="text-xs text-slate-400 mt-1">Try selecting another status tab or resetting the search filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const initials = `${lead.firstName[0] || ''}${lead.lastName[0] || ''}`
                    const isSelected = selectedLeadIds.includes(lead.id)
                    return (
                      <tr
                        key={lead.id}
                        className={`group border-b border-slate-100 dark:border-white/5 transition-colors last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                          }`}
                      >
                        {/* Selection Checkbox */}
                        <td className="py-3.5 px-4 w-[48px] text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleLead(lead.id)}
                            className="size-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                            title={`Select ${lead.name}`}
                          />
                        </td>

                        {/* 1. Lead Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-xs font-bold text-white shadow-xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => {
                                  setSelectedLeadForView(lead)
                                  setLeadDetailTab('overview')
                                }}
                                className="text-sm font-semibold text-slate-900 dark:text-white transition hover:text-blue-600 dark:hover:text-blue-400 text-left truncate block cursor-pointer"
                              >
                                {lead.name}
                              </button>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                <span className="font-mono text-slate-500 dark:text-slate-400">{lead.id}</span>
                                <span>·</span>
                                <span className="text-blue-600 dark:text-blue-400 font-medium">{lead.source}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Business Name */}
                        <td className="px-4 py-3.5">
                          {lead.businessName !== '—' ? (
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
                              <Building2 className="size-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[160px]">{lead.businessName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Personal</span>
                          )}
                        </td>

                        {/* 3. Phone */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap font-medium"
                          >
                            <Phone className="size-3 text-slate-400 shrink-0" />
                            {lead.phone}
                          </a>
                        </td>

                        {/* 4. Email */}
                        <td className="px-4 py-3.5">
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition truncate max-w-[180px] font-medium"
                            title={lead.email}
                          >
                            <Mail className="size-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </a>
                        </td>

                        {/* 5. Insurance Type / Line */}
                        <td className="px-3 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {lead.insuranceType}
                            </span>
                            <span className="text-xs text-slate-400 truncate max-w-[150px]" title={lead.currentInsurance}>
                              {lead.currentInsurance}
                            </span>
                          </div>
                        </td>

                        {/* 6. Renewal Date */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {lead.renewalDate !== '—' ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3.5 text-slate-400 shrink-0" />
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
                                <ExternalLink className="size-3.5" />
                              </Link>
                            )}
                          </div>
                        </td>

                        {/* 8. Marketing Consent */}
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          {getConsentBadge(lead.marketingConsent.status)}
                        </td>

                        {/* 9. Created Date */}
                        <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {lead.createdDate}
                        </td>

                        {/* 10. Actions */}
                        <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[250px] w-[250px] md:sticky md:right-0 md:z-10 bg-white dark:bg-slate-900 group-hover:bg-[#f8fafc] dark:group-hover:bg-slate-800 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] dark:md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.5)] transition-colors">
                          <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {/* View */}
                            <button
                              onClick={() => {
                                setSelectedLeadForView(lead)
                                setLeadDetailTab('overview')
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="size-3.5 text-slate-400 shrink-0" />
                              <span>View</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditLeadModal(lead)}
                              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1.5 text-slate-500 dark:text-slate-400 shadow-xs transition hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer"
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
                              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs transition hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-700 shrink-0 cursor-pointer"
                              title="Change Lead Status"
                            >
                              Status
                            </button>

                            {/* Convert to Client (Won / Converted) */}
                            {lead.status !== 'Won / Converted' ? (
                              <Link
                                href={`/broker/clients?fromLead=${lead.id}`}
                                onClick={() => {
                                  try {
                                    localStorage.setItem('broker_custom_leads', JSON.stringify(leads))
                                  } catch (e) {
                                    console.error(e)
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                                title="Convert Lead to Active Client"
                              >
                                <UserCheck className="size-3.5 shrink-0" />
                                <span>Convert</span>
                              </Link>
                            ) : (
                              <Link
                                href="/broker/clients"
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
                              >
                                <span>Client</span>
                                <ArrowUpRight className="size-3 text-slate-400" />
                              </Link>
                            )}

                            {/* Delete Lead */}
                            <button
                              onClick={() => setDeleteModalState({ type: 'single', lead })}
                              className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-1.5 text-slate-400 dark:text-slate-500 shadow-xs transition hover:border-rose-300 dark:hover:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 shrink-0 cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="size-3.5" />
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

        {/* Consent History & Client Registry Table */}
        <div className="mt-8 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/10 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Consent History &amp; Client Registry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Complete verifiable registry of all policyholder opt-in agreements with cryptographic audit fingerprints.
              </p>
            </div>

            {/* Filter pills & search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search client or contact..."
                value={consentSearchQuery}
                onChange={(e) => setConsentSearchQuery(e.target.value)}
                className="h-8.5 w-full sm:w-auto rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#0170FE]"
              />
              <div className="flex items-center overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10 p-0.5 bg-slate-50 dark:bg-slate-800 shrink-0">
                {['All', 'Consented', 'Pending', 'Withdrawn'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setConsentFilterStatus(st)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${consentFilterStatus === st
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                  {/* Client / Business */}
                  <th className="py-3.5 pl-4 pr-4 whitespace-nowrap min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleConsentSort('client')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${consentSortField === 'client' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Client / Business (${consentSortField === 'client' && consentSortDirection === 'asc' ? 'Descending' : 'Ascending'})`}
                    >
                      <span>Client / Business</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${consentSortField === 'client'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {consentSortField === 'client' ? (
                          consentSortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* Contact */}
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => handleConsentSort('contact')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${consentSortField === 'contact' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Contact (${consentSortField === 'contact' && consentSortDirection === 'asc' ? 'Descending' : 'Ascending'})`}
                    >
                      <span>Contact</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${consentSortField === 'contact'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {consentSortField === 'contact' ? (
                          consentSortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* Channel Authorized */}
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">
                    <button
                      type="button"
                      onClick={() => handleConsentSort('channel')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${consentSortField === 'channel' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Channel Authorized (${consentSortField === 'channel' && consentSortDirection === 'asc' ? 'Descending' : 'Ascending'})`}
                    >
                      <span>Channel Authorized</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${consentSortField === 'channel'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {consentSortField === 'channel' ? (
                          consentSortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* Date */}
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => handleConsentSort('date')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${consentSortField === 'date' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Date (${consentSortField === 'date' && consentSortDirection === 'asc' ? 'Descending' : 'Ascending'})`}
                    >
                      <span>Date</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${consentSortField === 'date'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {consentSortField === 'date' ? (
                          consentSortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* Status */}
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => handleConsentSort('status')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${consentSortField === 'status' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Status (${consentSortField === 'status' && consentSortDirection === 'asc' ? 'Descending' : 'Ascending'})`}
                    >
                      <span>Status</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${consentSortField === 'status'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {consentSortField === 'status' ? (
                          consentSortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* Audit Verification Hash */}
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleConsentSort('hash')}
                      className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${consentSortField === 'hash' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      title={`Sort by Audit Verification Hash (${consentSortField === 'hash' && consentSortDirection === 'asc' ? 'Descending' : 'Ascending'})`}
                    >
                      <span>Audit Verification Hash</span>
                      <span
                        className={`inline-flex items-center justify-center rounded p-0.5 transition ${consentSortField === 'hash'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/40'
                          : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-800 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                      >
                        {consentSortField === 'hash' ? (
                          consentSortDirection === 'asc' ? (
                            <ArrowUp className="size-3.5 stroke-[2.5]" />
                          ) : (
                            <ArrowDown className="size-3.5 stroke-[2.5]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-60 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>

                  {/* Actions (Sticky) */}
                  <th className="py-3.5 pl-4 pr-6 text-right min-w-[120px] md:sticky md:right-0 md:z-20 bg-slate-50 dark:bg-slate-900 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] dark:md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.5)] select-none whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredConsentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No matching consent records found.
                    </td>
                  </tr>
                ) : (
                  filteredConsentRecords.map((r) => (
                    <tr key={r.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 pl-4 pr-4 whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                        <div>{r.client}</div>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-normal">{r.id}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">{r.contact}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 text-xs font-medium">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/5">
                          {r.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">{r.date}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.status === 'Consented'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : r.status === 'Pending'
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-[#0170FE] dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                              : r.status === 'Withdrawn'
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-400 dark:text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Lock className="size-3 text-slate-400 dark:text-slate-500" />
                          {r.hash}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[120px] md:sticky md:right-0 md:z-10 bg-white dark:bg-slate-900 group-hover:bg-[#f8fafc] dark:group-hover:bg-slate-800/90 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] dark:md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.5)] transition-colors">
                        <button
                          type="button"
                          onClick={() => setSelectedAuditRecord(r)}
                          className="cursor-pointer text-xs sm:text-sm font-semibold text-[#0170FE] dark:text-blue-400 hover:underline"
                        >
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

      {/* ─────────────────────────────────────────────────────────────
          5.3 LEAD DETAILS DRAWER / MODAL
      ─────────────────────────────────────────────────────────────── */}
      {selectedLeadForView && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs transition-opacity">
          <div className="flex h-full w-full max-w-3xl flex-col bg-white dark:bg-slate-900 border-l border-transparent dark:border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">

            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/90 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-[14px] font-bold text-white shadow-md">
                  {selectedLeadForView.firstName[0]}{selectedLeadForView.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {selectedLeadForView.name}
                    </h2>
                    {getLeadStatusBadge(selectedLeadForView.status)}
                    {getConsentBadge(selectedLeadForView.marketingConsent.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {selectedLeadForView.businessName !== '—' && (
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Building2 className="size-3 text-slate-400" />
                        {selectedLeadForView.businessName}
                      </span>
                    )}
                    <span>Lead ID: <strong className="text-slate-800 dark:text-slate-200">{selectedLeadForView.id}</strong></span>
                    <span>Source: <strong className="text-blue-600 dark:text-blue-400">{selectedLeadForView.source}</strong></span>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2">
                {selectedLeadForView.status !== 'Won / Converted' ? (
                  <Link
                    href={`/broker/clients?fromLead=${selectedLeadForView.id}`}
                    onClick={() => {
                      try {
                        localStorage.setItem('broker_custom_leads', JSON.stringify(leads))
                      } catch (e) {
                        console.error(e)
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <UserCheck className="size-3.5" />
                    Convert to Client
                  </Link>
                ) : (
                  <Link
                    href="/broker/clients"
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-600 dark:hover:bg-blue-500 transition"
                  >
                    View Client File &rarr;
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteModalState({ type: 'single', lead: selectedLeadForView })}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30 px-3 py-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 shadow-xs hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer"
                  title="Delete Lead Record"
                >
                  <Trash2 className="size-3.5 text-rose-500" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedLeadForView(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-white/10 px-6 gap-6 bg-white dark:bg-slate-900 overflow-x-auto">
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
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40 dark:bg-[#070b14]">

              {/* TAB 1: OVERVIEW & CONTACT */}
              {leadDetailTab === 'overview' && (
                <div className="flex flex-col gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3">
                        Contact Information
                      </h3>
                      <div className="flex flex-col gap-2.5 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Phone className="size-3.5 text-slate-400" /> Phone</span>
                          <a href={`tel:${selectedLeadForView.phone}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">{selectedLeadForView.phone}</a>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Mail className="size-3.5 text-slate-400" /> Email</span>
                          <a href={`mailto:${selectedLeadForView.email}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">{selectedLeadForView.email}</a>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" /> Address</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[180px]">
                            {selectedLeadForView.street ? `${selectedLeadForView.street}, ${selectedLeadForView.city}, ${selectedLeadForView.state} ${selectedLeadForView.zip}` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="size-3.5 text-slate-400" /> Date of Birth</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{selectedLeadForView.dob || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-3">
                        Pipeline Status &amp; Value
                      </h3>
                      <div className="flex flex-col gap-2.5 text-[12px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Pipeline Stage</span>
                          <div>{getLeadStatusBadge(selectedLeadForView.status)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Estimated Premium</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-[13px]">{selectedLeadForView.estimatedPremium}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Intake Channel</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{selectedLeadForView.source}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Created Date</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{selectedLeadForView.createdDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedLeadForView.additionalInfo && (
                    <div className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
                        Additional Prospect Notes
                      </h3>
                      <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedLeadForView.additionalInfo}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INSURANCE INFO */}
              {leadDetailTab === 'insurance' && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 shadow-xs space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Requested Coverage</span>
                      <h4 className="text-[16px] font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedLeadForView.insuranceType}</h4>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-[12px] pt-3 border-t border-slate-100 dark:border-white/5">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 p-3">
                        <span className="text-slate-400 text-[11px] block">Current Insurance Policy</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{selectedLeadForView.currentInsurance}</span>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 p-3">
                        <span className="text-slate-400 text-[11px] block">Target Renewal Date</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{selectedLeadForView.renewalDate}</span>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 p-3">
                        <span className="text-slate-400 text-[11px] block">Estimated Annual Value</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{selectedLeadForView.estimatedPremium}</span>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 p-3">
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
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
                    <h3 className="text-[12px] font-semibold text-slate-900 dark:text-slate-100 mb-2">Log Follow-up Note</h3>
                    <textarea
                      rows={3}
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add notes from phone conversation, quote considerations, follow-up schedule..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-3 text-[12px] outline-none transition focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                    />
                    <div className="mt-2.5 flex justify-end">
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 dark:bg-blue-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Send className="size-3" />
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {selectedLeadForView.notes.map((n) => (
                      <div key={n.id} className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5 pb-2 mb-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{n.author}</span>
                          <span>{n.date}</span>
                        </div>
                        <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MARKETING CONSENT */}
              {leadDetailTab === 'consent' && (
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Marketing Consent Status</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Compliant opt-in records captured via lead forms</p>
                    </div>
                    {getConsentBadge(selectedLeadForView.marketingConsent.status)}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-[12px] pt-3">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 p-3">
                      <span className="text-slate-400 text-[11px] block">Consent Channel</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                        {selectedLeadForView.marketingConsent.channel || selectedLeadForView.source}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 p-3">
                      <span className="text-slate-400 text-[11px] block">Recorded Timestamp</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                        {selectedLeadForView.marketingConsent.date || selectedLeadForView.createdDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TIMELINE */}
              {leadDetailTab === 'timeline' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">Lead Interaction History</h3>
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
                    {selectedLeadForView.timeline.map((event) => (
                      <div key={event.id} className="relative group">
                        <div className="absolute -left-[31px] top-0.5 size-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 ring-2 ring-blue-100 dark:ring-blue-900/40" />
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">{event.title}</h4>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{event.date}</span>
                          </div>
                          <p className="mt-1 text-[12px] text-slate-600 dark:text-slate-300">{event.detail}</p>
                          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">Recorded by: <span className="font-medium text-slate-600 dark:text-slate-400">{event.actor}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-6 py-4">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Created: {selectedLeadForView.createdDate}
              </span>
              <button
                onClick={() => setSelectedLeadForView(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-[12px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
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
              <div className="rounded-2xl border-4 border-[#0170FE] bg-white p-4 shadow-md">
                {/* High visual QR placeholder */}
                <div className="size-44 flex flex-col justify-between p-1 bg-white">
                  <div className="flex justify-between">
                    <div className="size-11 border-4 border-slate-950 flex items-center justify-center">
                      <div className="size-5 bg-[#0170FE]" />
                    </div>
                    <div className="size-11 border-4 border-slate-950 flex items-center justify-center">
                      <div className="size-5 bg-[#0170FE]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="rounded-lg bg-[#0170FE] px-2 py-1 text-xs font-extrabold text-white">
                      BROKERSTEP
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="size-11 border-4 border-slate-950 flex items-center justify-center">
                      <div className="size-5 bg-[#0170FE]" />
                    </div>
                    <div className="grid grid-cols-3 gap-1 size-9">
                      <div className="bg-slate-950" />
                      <div className="bg-[#0170FE]" />
                      <div className="bg-slate-950" />
                      <div className="bg-[#0170FE]" />
                      <div className="bg-slate-950" />
                      <div className="bg-[#0170FE]" />
                    </div>
                  </div>
                </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Change Status</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Select new stage for {statusChangeTarget.name}</p>

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
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <span>{statusOption}</span>
                  {statusChangeTarget.status === statusOption && <Check className="size-4 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setStatusChangeTarget(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mb-4">
              <UserCheck className="size-6" />
            </div>
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-slate-100">Convert Lead to Client</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Converting <strong>{convertTarget.name}</strong> will create a new Active Client profile in your Book of Business and mark this lead as <strong>Won / Converted</strong>.
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-[12px] space-y-1.5 border border-slate-200/60 dark:border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Business</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{convertTarget.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Coverage Line</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{convertTarget.insuranceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Estimated Annual Premium</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{convertTarget.estimatedPremium}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setConvertTarget(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href={`/broker/clients?fromLead=${convertTarget.id}`}
                onClick={() => handleConvertToClient(convertTarget)}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-[12px] font-semibold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
              >
                Confirm Conversion
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Audit Verification Hash Details */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-2 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">Cryptographic Audit Certificate</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">TCPA &amp; ESIGN Act Digital Compliance Record</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditRecord(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Registry ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedAuditRecord.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Client / Insured:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedAuditRecord.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Authorized Contact:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedAuditRecord.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Consent Status:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedAuditRecord.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Timestamp:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedAuditRecord.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">IP Address / Geo:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{selectedAuditRecord.ip}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1">
                  SHA-256 Checksum Signature
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedAuditRecord.hash}
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 font-mono text-xs text-slate-800 dark:text-slate-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyConsentHash(selectedAuditRecord.hash)}
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:border-[#0170FE] cursor-pointer"
                  >
                    {copiedConsentHash ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Authorized Scope of Consent
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAuditRecord.scope.map((s) => (
                    <span key={s} className="rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 px-2.5 py-1 text-xs font-semibold text-[#0170FE] dark:text-blue-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 text-emerald-950 dark:text-emerald-300 text-[11px] leading-relaxed">
                This record provides admissible proof of express written consent under 47 U.S.C. § 227 (TCPA) and federal ESIGN Act.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAuditRecord(null)}
                  className="w-full rounded-xl bg-slate-900 dark:bg-blue-600 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 dark:hover:bg-blue-500 transition cursor-pointer"
                >
                  Close Audit Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DELETE LEAD CONFIRMATION MODAL (Single & Multiple)
      ─────────────────────────────────────────────────────────────── */}
      {deleteModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-3">
              <Trash2 className="size-6" />
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 mb-2">
              Step 1 of 2 · Move to Recycle Bin
            </div>

            <h3 className="text-[17px] font-bold text-slate-900 dark:text-slate-100">
              {deleteModalState.type === 'single'
                ? 'Move Lead to Recycle Bin'
                : `Move ${deleteModalState.count} Selected Leads to Recycle Bin`}
            </h3>

            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {deleteModalState.type === 'single' ? (
                <>
                  Are you sure you want to move <strong className="text-slate-800 dark:text-slate-200">{deleteModalState.lead?.name}</strong> to the Recycle Bin? Records are safely retained for <strong>30 days</strong> before permanent erasure, and can be recovered anytime.
                </>
              ) : (
                <>
                  Are you sure you want to move <strong className="text-slate-800 dark:text-slate-200">{deleteModalState.count} leads</strong> to the Recycle Bin? Records can be recovered anytime within <strong>30 days</strong>.
                </>
              )}
            </p>

            {deleteModalState.type === 'single' && deleteModalState.lead && (
              <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-[12px] space-y-1.5 border border-slate-200/60 dark:border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Lead ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{deleteModalState.lead.id}</span>
                </div>
                {deleteModalState.lead.businessName && deleteModalState.lead.businessName !== '—' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Business</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteModalState.lead.businessName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Coverage Line</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteModalState.lead.insuranceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Est. Premium</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{deleteModalState.lead.estimatedPremium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{deleteModalState.lead.status}</span>
                </div>
              </div>
            )}

            {deleteModalState.type === 'bulk' && (
              <div className="mt-4 max-h-40 overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-[12px] space-y-1.5 border border-slate-200/60 dark:border-white/5">
                {deleteModalState.ids.map(id => {
                  const item = leads.find(l => l.id === id)
                  return (
                    <div key={id} className="flex items-center justify-between py-0.5">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                        {item ? item.name : id}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{id}</span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModalState(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-[12px] font-bold text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>
                  {deleteModalState.type === 'single'
                    ? 'Move to Recycle Bin'
                    : `Move (${deleteModalState.count}) to Recycle Bin`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}