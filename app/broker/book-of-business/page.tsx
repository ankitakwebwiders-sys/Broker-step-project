'use client'

import React, { useState, useMemo, useRef, useEffect, Fragment, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
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
  ChevronUp,
  ArrowLeft,
  Copy,
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
  BookmarkPlus,
  ShieldAlert,
  Shield,
  ArrowLeftRight,
  Ban,
  Receipt,
  Link2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react'
import {
  initialClients,
  getClientPaymentStatus,
  getClientEffectiveDate,
  getPolicyPaymentStatus,
  type ClientItem,
  type ClientPolicy,
  type CommissionTransaction,
  type ConsentRecord,
  type ClientNote,
  type ClientTimelineEvent,
} from '@/data/broker/clients'

const QUICK_EMAIL_DOMAINS = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com']

const SAMPLE_CANADIAN_ADDRESSES = [
  { street: '100 King Street West, Suite 5600', city: 'Toronto', province: 'ON', postalCode: 'M5X 1C9' },
  { street: '200 Bay Street, Suite 1200', city: 'Toronto', province: 'ON', postalCode: 'M5J 2J2' },
  { street: '1055 West Georgia Street, Suite 1500', city: 'Vancouver', province: 'BC', postalCode: 'V6E 3P3' },
  { street: '666 Burrard Street', city: 'Vancouver', province: 'BC', postalCode: 'V6C 2X8' },
  { street: '1000 Rue de la Gauchetière Ouest', city: 'Montreal', province: 'QC', postalCode: 'H3B 4W5' },
  { street: '855 2nd Street SW, 8th Floor', city: 'Calgary', province: 'AB', postalCode: 'T2P 4J8' },
  { street: '50 O\'Connor Street, Suite 300', city: 'Ottawa', province: 'ON', postalCode: 'K1P 6L2' },
  { street: '10020 100 Street NW', city: 'Edmonton', province: 'AB', postalCode: 'T5J 0N3' },
  { street: '201 Portage Avenue', city: 'Winnipeg', province: 'MB', postalCode: 'R3B 3K6' },
  { street: '1959 Upper Water Street', city: 'Halifax', province: 'NS', postalCode: 'B3J 3N2' },
  { street: '44 Chipman Hill, Suite 1000', city: 'Saint John', province: 'NB', postalCode: 'E2L 2A9' },
  { street: '134 Kent Street', city: 'Charlottetown', province: 'PE', postalCode: 'C1A 8R8' },
]

const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
]

const LOB_OPTIONS = [
  'Auto',
  'Home',
  'Commercial',
  'Travel',
  'Life',
  'Commercial Auto',
  'Cyber Liability',
  'Commercial Property',
]

const INSURER_SUGGESTIONS = [
  'Travelers Canada',
  'Intact Insurance',
  'Aviva Canada',
  'Wawanesa Mutual Insurance',
  'Chubb Insurance Company of Canada',
  'The Hartford',
  'Economical / Definity Insurance',
  'Northbridge Financial',
  'Gore Mutual Insurance',
  'Desjardins Insurance',
  'Liberty Mutual Canada',
  'AIG Canada',
  'Lloyd\'s of London',
  'RSA Canada',
  'SGI CANADA',
]

function getExpiryFromEffective(effDate: string): string {
  if (!effDate) return ''
  const parts = effDate.split('-')
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10)
    if (!isNaN(y)) {
      return `${y + 1}-${parts[1]}-${parts[2]}`
    }
  }
  return ''
}

function BookOfBusinessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const viewParam = searchParams.get('view')
  const idParam = searchParams.get('id')
  const tabParam = searchParams.get('tab')
  const actionParam = searchParams.get('action')

  // Clients state (interactive client data)
  const [clients, setClients] = useState<ClientItem[]>(() => {
    const seen = new Set<string>()
    return initialClients.filter((c) => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  })

  // Load custom clients added via Add Client form with deduplication
  useEffect(() => {
    try {
      const stored = localStorage.getItem('broker_custom_clients')
      if (stored) {
        const parsed: ClientItem[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClients((prev) => {
            const clientMap = new Map<string, ClientItem>()
            // First load existing
            prev.forEach((c) => clientMap.set(c.id, c))
            // Overwrite/prepend custom ones
            parsed.forEach((c) => clientMap.set(c.id, c))
            return Array.from(clientMap.values())
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Status Filter Tabs
  const [activeTab, setActiveTab] = useState<string>(() => tabParam || 'All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    if (tabParam === 'Active' || tabParam === 'Inactive') return tabParam
    return 'All'
  })
  const [policyLineFilter, setPolicyLineFilter] = useState('All')
  const [consentFilter, setConsentFilter] = useState<'All' | 'Granted' | 'Pending' | 'Declined' | 'Revoked'>('All')

  // Full-Page Broker Details View & Tabs state - pre-initialize from query parameters
  const [selectedClientForView, setSelectedClientForView] = useState<ClientItem | null>(() => {
    if (idParam) {
      return initialClients.find(c => c.id === idParam) || initialClients[0]
    }
    if (viewParam === 'details') {
      return initialClients[0]
    }
    return null
  })
  const [clientDetailTab, setClientDetailTab] = useState<'overview' | 'policies' | 'commissions' | 'consent' | 'notes' | 'timeline'>('overview')
  const [policySubFilter, setPolicySubFilter] = useState<'All' | 'Active' | 'Historical'>('All')

  // Table Column Sorting State (Client Name, Client Status, Marketing Consent, Phone, Email, Paid/Unpaid, Eff Date)
  type ClientSortField = 'name' | 'status' | 'consent' | 'phone' | 'email' | 'payment' | 'effectiveDate'
  type SortDirection = 'asc' | 'desc'
  const [sortField, setSortField] = useState<ClientSortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: ClientSortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Inline expansion states for full-page view (NO POPUP MODALS)
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null)
  const [expandedStatementId, setExpandedStatementId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

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

  // Address search state for modal
  const [addressSearchQuery, setAddressSearchQuery] = useState('')
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false)

  // Form State for Add/Edit Client
  const [clientForm, setClientForm] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    clientType: 'Individual' as 'Individual' | 'Commercial',
    dob: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    province: 'ON',
    postalCode: '',
    status: 'Active / Submitted',
    effectiveDate: '2026-10-16',
    expirationDate: '2027-10-16',
    policyNumber: '',
    isPendingPolicyNumber: false,
    linesOfBusiness: ['Auto'] as string[],
    yearlyPremium: '',
    insurerName: 'Travelers Canada',
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

  // New Note input in Broker Details view
  const [newNoteText, setNewNoteText] = useState('')

  // Clipboard copy handler with feedback key
  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!text || text === '—') return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => {
      setCopiedKey(prev => (prev === key ? null : prev))
    }, 2000)
  }

  // Client Selection & Back handlers with URL sync
  const handleSelectClient = (client: ClientItem) => {
    setSelectedClientForView(client)
    setClientDetailTab('overview')
    setExpandedPolicyId(null)
    setExpandedStatementId(null)
    router.push(`/broker/book-of-business?view=details&id=${client.id}`)
  }

  const handleBackToList = () => {
    setSelectedClientForView(null)
    setExpandedPolicyId(null)
    setExpandedStatementId(null)
    router.push('/broker/book-of-business')
  }

  // Sync URL query params with tabs and full-page details
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
      if (tabParam === 'Active' || tabParam === 'Inactive' || tabParam === 'Pending') {
        setStatusFilter(tabParam)
      } else if (tabParam === 'Draft') {
        setStatusFilter('Draft')
      } else {
        setStatusFilter('All')
      }
    } else if (!searchParams.toString()) {
      setActiveTab('All')
      setStatusFilter('All')
    }
    if (actionParam === 'add') {
      setEditingClient(null)
      setIsClientModalOpen(true)
    }
    if (idParam) {
      const found = clients.find(c => c.id === idParam) || initialClients.find(c => c.id === idParam)
      if (found) setSelectedClientForView(found)
    } else if (viewParam === 'details' && initialClients.length > 0) {
      setSelectedClientForView(clients[0] || initialClients[0])
    } else if (!viewParam && !idParam) {
      setSelectedClientForView(null)
    }
  }, [tabParam, actionParam, idParam, viewParam, searchParams, clients])

  const handleTabSelect = (tabKey: string) => {
    setActiveTab(tabKey)
    if (tabKey === 'Active' || tabKey === 'Inactive' || tabKey === 'Draft' || tabKey === 'Pending') setStatusFilter(tabKey)
    else if (tabKey === 'Paid' || tabKey === 'Unpaid' || tabKey === 'All') setStatusFilter('All')

    let newHref = '/broker/book-of-business'
    if (tabKey === 'Active') newHref = '/broker/book-of-business?tab=Active'
    else if (tabKey === 'Draft') newHref = '/broker/book-of-business?tab=Draft'
    else if (tabKey === 'Paid') newHref = '/broker/book-of-business?tab=Paid'
    else if (tabKey === 'Unpaid') newHref = '/broker/book-of-business?tab=Unpaid'
    else if (tabKey === 'Pending') newHref = '/broker/book-of-business?tab=Pending'
    else if (tabKey === 'Inactive') newHref = '/broker/book-of-business?tab=Inactive'

    router.push(newHref)
  }

  // Summary Metrics
  const totalClientsCount = clients.length
  const activeClientsCount = useMemo(() => clients.filter(c => c.status === 'Active' || c.status === 'Active / Submitted').length, [clients])
  const inactiveClientsCount = useMemo(() => clients.filter(c => c.status === 'Inactive').length, [clients])
  const draftClientsCount = useMemo(() => clients.filter(c => c.status === 'Draft' || c.status === 'Draft / Incomplete').length, [clients])
  const paidClientsCount = useMemo(() => clients.filter(c => getClientPaymentStatus(c) === 'Paid').length, [clients])
  const unpaidClientsCount = useMemo(() => clients.filter(c => getClientPaymentStatus(c) === 'Unpaid').length, [clients])
  const totalPoliciesCount = useMemo(() => clients.reduce((acc, c) => acc + c.policies.filter(p => p.status === 'Active').length, 0), [clients])
  const consentGrantedCount = useMemo(() => clients.filter(c => c.marketingConsent.status === 'Granted').length, [clients])
  const consentRate = Math.round((consentGrantedCount / totalClientsCount) * 100) || 0

  // Status Tab Counts
  const statusCounts = useMemo(() => {
    return {
      All: clients.length,
      Active: clients.filter(c => c.status === 'Active' || c.status === 'Active / Submitted').length,
      Draft: clients.filter(c => c.status === 'Draft' || c.status === 'Draft / Incomplete').length,
      Paid: clients.filter(c => getClientPaymentStatus(c) === 'Paid').length,
      Unpaid: clients.filter(c => getClientPaymentStatus(c) === 'Unpaid').length,
      Pending: clients.filter(c => c.status === 'Pending').length,
      Inactive: clients.filter(c => c.status === 'Inactive').length,
      'Pending Renewal': clients.filter(c => c.policies.some(p => p.status === 'Pending Renewal')).length,
      'Consent Granted': clients.filter(c => c.marketingConsent.status === 'Granted').length,
      'Consent Pending': clients.filter(c => c.marketingConsent.status === 'Pending').length,
      'Consent Declined': clients.filter(c => c.marketingConsent.status === 'Declined' || c.marketingConsent.status === 'Revoked').length,
    }
  }, [clients])

  // Filtered & Sorted Clients List
  const filteredClients = useMemo(() => {
    const list = clients.filter(client => {
      // Tab filter
      if (activeTab === 'Active' && client.status !== 'Active' && client.status !== 'Active / Submitted') return false
      if (activeTab === 'Draft' && client.status !== 'Draft' && client.status !== 'Draft / Incomplete') return false
      if (activeTab === 'Paid' && getClientPaymentStatus(client) !== 'Paid') return false
      if (activeTab === 'Unpaid' && getClientPaymentStatus(client) !== 'Unpaid') return false
      if (activeTab === 'Pending' && client.status !== 'Pending') return false
      if (activeTab === 'Inactive' && client.status !== 'Inactive') return false
      if (activeTab === 'Pending Renewal' && !client.policies.some(p => p.status === 'Pending Renewal')) return false
      if (activeTab === 'Consent Granted' && client.marketingConsent.status !== 'Granted') return false
      if (activeTab === 'Consent Pending' && client.marketingConsent.status !== 'Pending') return false
      if (activeTab === 'Consent Declined' && client.marketingConsent.status !== 'Declined' && client.marketingConsent.status !== 'Revoked') return false

      // Dropdown status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Active' && client.status !== 'Active' && client.status !== 'Active / Submitted') return false
        else if (statusFilter === 'Draft' && client.status !== 'Draft' && client.status !== 'Draft / Incomplete') return false
        else if (statusFilter === 'Paid' && getClientPaymentStatus(client) !== 'Paid') return false
        else if (statusFilter === 'Unpaid' && getClientPaymentStatus(client) !== 'Unpaid') return false
        else if (statusFilter === 'Inactive' && client.status !== 'Inactive') return false
        else if (statusFilter === 'Pending' && client.status !== 'Pending') return false
        else if (statusFilter === 'Lead' && client.status !== 'Lead') return false
        else if (statusFilter === 'Active / Submitted' && client.status !== 'Active / Submitted' && client.status !== 'Active') return false
      }

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

    // Sort according to sortField ('name' | 'status' | 'consent' | 'phone' | 'email' | 'payment') and sortDirection
    list.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'payment':
          comparison = getClientPaymentStatus(a).localeCompare(getClientPaymentStatus(b))
          break
        case 'effectiveDate':
          comparison = getClientEffectiveDate(a).localeCompare(getClientEffectiveDate(b))
          break
        case 'consent':
          comparison = a.marketingConsent.status.localeCompare(b.marketingConsent.status)
          break
        case 'phone':
          comparison = (a.phone || '').localeCompare(b.phone || '', undefined, { numeric: true })
          break
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '', undefined, { sensitivity: 'base' })
          break
        default:
          comparison = 0
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return list
  }, [clients, activeTab, statusFilter, policyLineFilter, consentFilter, searchQuery, sortField, sortDirection])

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


  // Handlers & Helpers for Add/Edit Client
  const handleEffectiveDateChange = (effDate: string) => {
    const exp = getExpiryFromEffective(effDate)
    setClientForm(prev => ({
      ...prev,
      effectiveDate: effDate,
      expirationDate: exp,
    }))
  }

  const toggleLineOfBusiness = (line: string) => {
    setClientForm(prev => {
      const exists = prev.linesOfBusiness.includes(line)
      let updated: string[]
      if (exists) {
        updated = prev.linesOfBusiness.filter(l => l !== line)
      } else {
        updated = [...prev.linesOfBusiness, line]
      }
      return {
        ...prev,
        linesOfBusiness: updated.length > 0 ? updated : [line],
      }
    })
  }

  const handleApplyEmailDomain = (domain: string) => {
    const current = clientForm.email.trim()
    if (!current) {
      setClientForm(prev => ({ ...prev, email: domain }))
      return
    }
    if (current.includes('@')) {
      const username = current.split('@')[0]
      setClientForm(prev => ({ ...prev, email: `${username}${domain}` }))
    } else {
      setClientForm(prev => ({ ...prev, email: `${current}${domain}` }))
    }
  }

  const filteredAddressRecommendations = useMemo(() => {
    if (!addressSearchQuery.trim()) return SAMPLE_CANADIAN_ADDRESSES.slice(0, 5)
    const q = addressSearchQuery.toLowerCase()
    const matches = SAMPLE_CANADIAN_ADDRESSES.filter(
      a => a.street.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.province.toLowerCase().includes(q) ||
        a.postalCode.toLowerCase().includes(q)
    )
    if (matches.length > 0) return matches
    return [
      { street: addressSearchQuery, city: 'Toronto', province: 'ON', postalCode: 'M5H 2N2' },
      ...SAMPLE_CANADIAN_ADDRESSES.slice(0, 3)
    ]
  }, [addressSearchQuery])

  const handleSelectAddress = (item: { street: string; city: string; province: string; postalCode: string }) => {
    setClientForm(prev => ({
      ...prev,
      street: item.street,
      city: item.city,
      province: item.province,
      postalCode: item.postalCode,
    }))
    setAddressSearchQuery(`${item.street}, ${item.city}, ${item.province}`)
    setIsAddressDropdownOpen(false)
  }

  function openAddClientModal() {
    setEditingClient(null)
    const today = '2026-10-16'
    const isPendingDefault = typeof window !== 'undefined'
      ? localStorage.getItem('broker_setting_default_policy_pending') !== 'false'
      : true

    setClientForm({
      firstName: '',
      lastName: '',
      businessName: '',
      clientType: 'Individual',
      dob: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      province: 'ON',
      postalCode: '',
      status: 'Active / Submitted',
      effectiveDate: today,
      expirationDate: getExpiryFromEffective(today),
      policyNumber: isPendingDefault ? 'POL-PENDING' : '',
      isPendingPolicyNumber: isPendingDefault,
      linesOfBusiness: ['Auto'],
      yearlyPremium: '',
      insurerName: 'Travelers Insurance',
      notes: '',
    })
    setAddressSearchQuery('')
    setIsAddressDropdownOpen(false)
    setIsClientModalOpen(true)
  }

  function openEditClientModal(client: ClientItem) {
    setEditingClient(client)
    const primaryPolicy = client.policies[0]
    const today = '2026-10-16'
    const eff = primaryPolicy?.effectiveDate || today
    setClientForm({
      firstName: client.firstName,
      lastName: client.lastName,
      businessName: client.businessName === '—' ? '' : client.businessName,
      clientType: (client.clientType || (client.businessName && client.businessName !== '—' ? 'Commercial' : 'Individual')) as 'Individual' | 'Commercial',
      dob: client.dob || '',
      phone: client.phone,
      email: client.email,
      street: client.street,
      city: client.city,
      province: client.province || client.state || 'ON',
      postalCode: client.postalCode || client.zip || '',
      status: client.status || 'Active / Submitted',
      effectiveDate: eff,
      expirationDate: primaryPolicy?.expirationDate || getExpiryFromEffective(eff),
      policyNumber: primaryPolicy?.policyNumber || '',
      isPendingPolicyNumber: false,
      linesOfBusiness: client.linesOfBusiness || (primaryPolicy ? [primaryPolicy.type] : ['Auto']),
      yearlyPremium: primaryPolicy?.premium || client.yearlyPremium || '',
      insurerName: primaryPolicy?.carrier || client.insurerName || 'Travelers Canada',
      notes: client.notes[0]?.text || '',
    })
    setAddressSearchQuery(client.street ? `${client.street}, ${client.city}` : '')
    setIsAddressDropdownOpen(false)
    setIsClientModalOpen(true)
  }

  function handleSaveClient(e?: React.FormEvent, isDraft = false) {
    if (e) e.preventDefault()

    if (!isDraft) {
      if (clientForm.clientType === 'Commercial') {
        if (!clientForm.businessName.trim() && !clientForm.firstName.trim()) {
          alert('Please enter a Business Name for Commercial client.')
          return
        }
      } else {
        if (!clientForm.firstName.trim() || !clientForm.lastName.trim()) {
          alert('Please fill in First Name and Last Name.')
          return
        }
      }
      if (!clientForm.email.trim()) {
        alert('Please provide at least a Primary Email.')
        return
      }
    } else {
      if (!clientForm.firstName.trim() && !clientForm.businessName.trim() && !clientForm.email.trim()) {
        alert('Please provide at least a First Name, Business Name, or Email to save a draft.')
        return
      }
    }

    const personName = `${clientForm.firstName.trim()} ${clientForm.lastName.trim()}`.trim()
    const fullName = clientForm.clientType === 'Commercial'
      ? clientForm.businessName.trim() || personName || 'Commercial Client'
      : personName || clientForm.businessName.trim() || 'Draft Lead'
    const business = clientForm.businessName.trim() || (clientForm.clientType === 'Commercial' ? fullName : '—')
    const finalStatus = isDraft ? 'Lead' : clientForm.status

    const policyNum = clientForm.isPendingPolicyNumber || !clientForm.policyNumber.trim()
      ? `POL-PENDING-${Math.floor(1000 + Math.random() * 9000)}`
      : clientForm.policyNumber.trim()

    const attachedPolicy: ClientPolicy = {
      id: `POL-${Date.now()}`,
      policyNumber: policyNum,
      type: clientForm.linesOfBusiness.join(' & ') || 'Auto',
      carrier: clientForm.insurerName || 'Travelers Canada',
      premium: clientForm.yearlyPremium ? (clientForm.yearlyPremium.startsWith('$') ? clientForm.yearlyPremium : `$${clientForm.yearlyPremium}`) : '$0',
      effectiveDate: clientForm.effectiveDate,
      expirationDate: clientForm.expirationDate || getExpiryFromEffective(clientForm.effectiveDate),
      status: isDraft ? 'Pending Renewal' : 'Active',
    }

    if (editingClient) {
      const updated: ClientItem = {
        ...editingClient,
        firstName: clientForm.firstName.trim(),
        lastName: clientForm.lastName.trim(),
        name: fullName,
        businessName: business,
        clientType: clientForm.clientType,
        dob: clientForm.dob,
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim(),
        street: clientForm.street.trim(),
        city: clientForm.city.trim(),
        province: clientForm.province.trim(),
        state: clientForm.province.trim(),
        postalCode: clientForm.postalCode.trim(),
        zip: clientForm.postalCode.trim(),
        status: finalStatus,
        linesOfBusiness: clientForm.linesOfBusiness,
        yearlyPremium: clientForm.yearlyPremium,
        insurerName: clientForm.insurerName,
        lastActivity: {
          description: isDraft ? 'Draft Client Saved' : 'Client Profile Updated',
          time: 'Just now',
        },
      }

      setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
      if (selectedClientForView?.id === updated.id) {
        setSelectedClientForView(updated)
      }
    } else {
      const newId = `CL-${Math.floor(1000 + Math.random() * 9000)}`
      const newClient: ClientItem = {
        id: newId,
        firstName: clientForm.firstName.trim(),
        lastName: clientForm.lastName.trim(),
        name: fullName,
        businessName: business,
        clientType: clientForm.clientType,
        dob: clientForm.dob,
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim(),
        street: clientForm.street.trim(),
        city: clientForm.city.trim(),
        province: clientForm.province.trim(),
        state: clientForm.province.trim(),
        postalCode: clientForm.postalCode.trim(),
        zip: clientForm.postalCode.trim(),
        brokerCode: 'BRK-8902',
        otherIdentifier: `CAN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: finalStatus,
        linesOfBusiness: clientForm.linesOfBusiness,
        yearlyPremium: clientForm.yearlyPremium,
        insurerName: clientForm.insurerName,
        marketingConsent: {
          status: 'Pending',
          channels: ['Email'],
          consentDate: 'Oct 16, 2026',
          method: 'Automated Broker Intake Link',
          notes: 'Automated consent link dispatched to client email. Awaiting digital client sign-off.',
        },
        notes: clientForm.notes.trim() ? [
          {
            id: `N-${Date.now()}`,
            date: 'Oct 16, 2026',
            author: 'Jordan Davis',
            text: (isDraft ? '[Draft Record] ' : '') + clientForm.notes.trim(),
          }
        ] : (isDraft ? [{
          id: `N-${Date.now()}`,
          date: 'Oct 16, 2026',
          author: 'Jordan Davis',
          text: 'Draft intake saved. Underwriting review pending.',
        }] : []),
        lastActivity: {
          description: isDraft ? 'Draft Client Created' : 'New Client Onboarded',
          time: 'Just now',
        },
        policies: [attachedPolicy],
        commissions: [],
        timeline: [
          {
            id: `T-${Date.now()}`,
            title: isDraft ? 'Draft Client Saved' : 'Client Account Created',
            type: 'system',
            date: 'Today, Just now',
            detail: `Intake registered with status ${finalStatus} and attached policy ${attachedPolicy.policyNumber}.`,
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

  // Reusable Copy Button with 2s visual feedback
  function CopyButton({
    text,
    copyKey,
    label,
    className = '',
  }: {
    text: string
    copyKey: string
    label?: string
    className?: string
  }) {
    const isCopied = copiedKey === copyKey
    return (
      <button
        type="button"
        onClick={(e) => handleCopy(text, copyKey, e)}
        title={isCopied ? 'Copied to clipboard!' : `Copy ${label || text}`}
        className={`inline-flex items-center gap-1 rounded-md p-1 transition cursor-pointer text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 active:scale-95 ${className}`}
        aria-label={`Copy ${label || text}`}
      >
        {isCopied ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 animate-in fade-in zoom-in-75 duration-150">
            <Check className="size-3.5 text-emerald-600" />
            <span className="text-[10px] font-medium hidden sm:inline">Copied!</span>
          </span>
        ) : (
          <Copy className="size-3.5 text-slate-400 hover:text-blue-600 transition" />
        )}
      </button>
    )
  }

  // Render Policy Card matching Client Screenshot (Image 1 Reference)
  const renderPolicyCard = (policy: ClientPolicy) => {
    const isActive = policy.status === 'Active'
    const isPending = policy.policyNumberPending
    const isPolicyPaid = getPolicyPaymentStatus(policy, selectedClientForView || undefined) === 'Paid'
    const commissionPaid = policy.commissionStatus === 'Paid' || (isPolicyPaid && policy.commissionStatus !== 'Unpaid')
    const commissionUnpaid = policy.commissionStatus === 'Unpaid' || (!isPolicyPaid)

    return (
      <div
        key={policy.id}
        className={`rounded-2xl bg-white p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-xs ${isActive || isPending
          ? 'border-2 border-blue-400/90'
          : 'border border-slate-200/90'
          }`}
      >
        {/* Header Row: Carrier, Tags, Statuses */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {policy.carrier}
              </h4>
              {policy.tag && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {policy.tag}
                </span>
              )}
              {policy.isHistory && (
                <span className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  HISTORY
                </span>
              )}
            </div>

            {/* Policy Number Row */}
            {isPending ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-semibold italic text-amber-700">Policy number Pending</span>
                <button
                  type="button"
                  onClick={() => alert(`Manual policy number entry opened for ${policy.carrier}`)}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Enter manually
                </button>
                <span className="text-slate-400">· {policy.policyNumberSubtext || 'will fill from a matched statement'}</span>
              </div>
            ) : (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-mono font-bold text-slate-900 text-sm">{policy.policyNumber}</span>
                <CopyButton text={policy.policyNumber} copyKey={`pol-num-${policy.id}`} label="Policy Number" />
                {policy.policyNumberSubtext && (
                  <span className="text-slate-400">· {policy.policyNumberSubtext}</span>
                )}
              </div>
            )}
          </div>

          {/* Right Status Badges: Policy Status, Policy Payment, Commission */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-left sm:text-right shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                POLICY STATUS
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span className={`size-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-slate-900'}`} />
                {policy.status}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                POLICY PAYMENT
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${isPolicyPaid
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : 'bg-rose-50 text-rose-700 ring-rose-200'
                  }`}
              >
                {isPolicyPaid ? (
                  <>
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    <span>Paid</span>
                  </>
                ) : (
                  <>
                    <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>Unpaid</span>
                  </>
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                COMMISSION
              </span>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${commissionPaid
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : commissionUnpaid
                    ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                    : 'bg-slate-100 text-slate-700'
                  }`}
              >
                {policy.commissionStatus || (isPolicyPaid ? 'Paid' : 'Unpaid')}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Column Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5 text-xs">
          <div>
            <span className="text-slate-400 font-medium block mb-1">Line</span>
            <span className="text-sm font-bold text-slate-900 block">{policy.type}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block mb-1">Term</span>
            <span className="text-xs font-bold text-slate-900 block leading-snug">
              {policy.effectiveDate} – {policy.expirationDate}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block mb-1">Premium</span>
            <span className="text-sm font-bold text-slate-900 block">{policy.premium}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block mb-1">Rate × split</span>
            <span className="text-xs font-bold text-slate-900 block">
              {policy.rateSplit || '10% × 50%'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block mb-1">Expected</span>
            <span className="text-sm font-bold text-slate-900 block">
              {policy.expectedCommission || '$177.50'}
            </span>
          </div>
        </div>

        {/* Paid / Net Row */}
        <div className="mt-4 text-xs">
          <span className="text-slate-400 font-medium block mb-0.5">Paid / net</span>
          <span className="text-sm font-bold text-slate-900 font-mono">
            {policy.paidCommission || (isActive && !isPolicyPaid ? '$0.00' : policy.expectedCommission || '$130.50')} / {policy.netCommission || policy.expectedCommission || '$177.50'}
          </span>
        </div>

        {/* Dedicated Policy Payment Breakdown Card */}
        <div
          className={`mt-4 rounded-xl border p-4 text-xs transition ${isPolicyPaid
            ? 'border-emerald-200/90 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-white'
            : 'border-rose-200/90 bg-gradient-to-r from-rose-50/70 via-red-50/30 to-white'
            }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 mb-3 border-slate-200/60">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-6 items-center justify-center rounded-lg ${isPolicyPaid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
              >
                <DollarSign className="size-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900">Policy Payment &amp; Settlement Details</span>
                <span className="text-[11px] text-slate-500 ml-1.5">
                  ({isPolicyPaid ? 'Premium Cleared' : 'Payment Outstanding'})
                </span>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 select-none ${isPolicyPaid
                ? 'bg-emerald-100 text-emerald-800 ring-emerald-300'
                : 'bg-rose-100 text-rose-800 ring-rose-300'
                }`}
            >
              {isPolicyPaid ? (
                <>
                  <CheckCircle2 className="size-3 text-emerald-700" />
                  <span>Premium Status: Paid</span>
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-full bg-rose-600 animate-pulse" />
                  <span>Premium Status: Unpaid</span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Gross Premium</span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block">{policy.premium}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Billing Method</span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">{policy.billingMethod || 'Direct Bill (Insurer EFT)'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Broker Commission</span>
              <span className={`text-xs font-bold mt-0.5 block ${commissionPaid ? 'text-emerald-700' : 'text-slate-700'}`}>
                {commissionPaid ? `Paid (${policy.paidCommission || policy.expectedCommission || '$177.50'})` : 'Pending Reconciliation'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block text-[11px]">Settlement Date</span>
              <span className="text-xs font-medium text-slate-700 mt-0.5 block">
                {policy.paymentDate || policy.effectiveDate || 'Upon Statement Match'}
              </span>
            </div>
          </div>

          <p className="mt-2.5 pt-2 border-t border-slate-200/50 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              {policy.paymentNote || (isPolicyPaid
                ? '✓ Policyholder premium has been paid and cleared with insurance carrier.'
                : '⚠ Premium payment is pending invoice settlement or carrier statement verification.')}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">LOB: {policy.type}</span>
          </p>
        </div>

        {/* Chain Custody Note */}
        {policy.chainNote && (
          <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-600 bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-100">
            <Link2 className="size-3.5 text-slate-400 shrink-0" />
            <span>{policy.chainNote}</span>
          </div>
        )}

        {/* Broker Explanation Note */}
        {policy.brokerNote && (
          <p className="mt-2 text-xs text-slate-500 italic pl-1">
            {policy.brokerNote}
          </p>
        )}

        {/* Action Buttons Row */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {!policy.isHistory ? (
              <>
                <button
                  type="button"
                  onClick={() => alert(`Initiating renewal workflow for ${policy.carrier} (${policy.policyNumber})`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="size-3.5 text-slate-500" />
                  Renew
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Initiating rewrite process for ${policy.carrier} (${policy.policyNumber})`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  <ArrowLeftRight className="size-3.5 text-slate-500" />
                  Rewrite
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Cancel / non-renew requested for ${policy.carrier} (${policy.policyNumber})`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer shadow-2xs"
                >
                  <Ban className="size-3.5 text-rose-500" />
                  Cancel / non-renew
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Recording transaction for ${policy.carrier} (${policy.policyNumber})`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  <Receipt className="size-3.5 text-slate-500" />
                  Record transaction
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => alert(`Recording transaction for ${policy.carrier} (${policy.policyNumber})`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <Receipt className="size-3.5 text-slate-500" />
                Record transaction
              </button>
            )}
          </div>

          {!policy.policyNumberPending && (
            <button
              type="button"
              onClick={() => handleCopy(policy.policyNumber, `btn-pol-card-${policy.id}`)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer"
            >
              {copiedKey === `btn-pol-card-${policy.id}` ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <Check className="size-3.5" /> Copied Policy #
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Copy className="size-3.5" /> Copy Policy #
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-7 max-w-[1600px] mx-auto space-y-7">
      {!selectedClientForView ? (
        <div>

          {/* ───── Header ───── */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                <span className="size-1.5 rounded-full bg-blue-500" />
                Broker Workspace · Book of Business
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                My Book
              </h1>
              <p className="mt-1 text-sm sm:text-[15px] text-slate-500 leading-relaxed">
                Comprehensive roster of your clients, in-force policies, and commission records.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  alert(`Exporting ${filteredClients.length} clients to CSV...`)
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                <Download className="size-4 text-slate-400" />
                Export CSV
              </button>
              <Link
                href="/broker/clients"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db] cursor-pointer"
              >
                <Plus className="size-4" />
                Add Client
              </Link>
            </div>
          </div>

          {/* ───── Stat Cards ───── */}
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-600">Total Clients</p>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-100">
                  Book roster
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{totalClientsCount}</p>
              <p className="mt-1 text-xs text-slate-500">All managed accounts</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-600">Active Clients</p>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">
                  {Math.round((activeClientsCount / totalClientsCount) * 100)}% active
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600">{activeClientsCount}</p>
              <p className="mt-1 text-xs text-slate-500">In-force relationships</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-600">Inactive Clients</p>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  Archived
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-700">{inactiveClientsCount}</p>
              <p className="mt-1 text-xs text-slate-500">Historical records kept</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-600">In-force Policies</p>
                <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-600 ring-1 ring-violet-100">
                  Coverage
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{totalPoliciesCount}</p>
              <p className="mt-1 text-xs text-slate-500">Active policies in book</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)]">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-600">Marketing Consent</p>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">
                  {consentRate}% opt-in
                </span>
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{consentGrantedCount}/{totalClientsCount}</p>
              <p className="mt-1 text-xs text-slate-500">Compliant consent granted</p>
            </div>
          </div>

          {/* ───── 4.1 Filter Tabs Bar ───── */}
          <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {[
                { label: 'All Clients', key: 'All' },
                { label: 'Active', key: 'Active' },
                { label: 'Inactive', key: 'Inactive' },
                { label: 'Paid', key: 'Paid', isPaid: true },
                { label: 'Unpaid', key: 'Unpaid', isUnpaid: true },

                { label: 'Drafts', key: 'Draft', highlight: true },
                { label: 'Pending', key: 'Pending' },

              ].map((tab) => {
                const count = (statusCounts as any)[tab.key] || 0
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabSelect(tab.key)}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isActive
                      ? tab.key === 'Draft'
                        ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                        : tab.key === 'Paid'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                          : tab.key === 'Unpaid'
                            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/40'
                            : 'bg-slate-950 text-white shadow-sm'
                      : tab.key === 'Draft' && count > 0
                        ? 'text-amber-800 bg-amber-50/90 hover:bg-amber-100 hover:text-amber-900 ring-1 ring-amber-300/80 font-bold'
                        : tab.key === 'Paid'
                          ? 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 hover:text-emerald-800 ring-1 ring-emerald-200 font-semibold'
                          : tab.key === 'Unpaid'
                            ? 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 hover:text-rose-800 ring-1 ring-rose-200 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${isActive
                        ? 'bg-white/20 text-white'
                        : tab.key === 'Draft' && count > 0
                          ? 'bg-amber-200 text-amber-950'
                          : tab.key === 'Paid'
                            ? 'bg-emerald-200 text-emerald-950'
                            : tab.key === 'Unpaid'
                              ? 'bg-rose-200 text-rose-950'
                              : 'bg-slate-100 text-slate-600'
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
                {/* Client Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-600">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active / Submitted">Active / Submitted</option>
                    <option value="Draft">Drafts / Incomplete</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Pending">Pending</option>
                    <option value="Lead">Lead</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Policy Line Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-600">Line:</span>
                  <select
                    value={policyLineFilter}
                    onChange={(e) => setPolicyLineFilter(e.target.value)}
                    className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
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
                  <span className="text-xs font-medium text-slate-600">Consent:</span>
                  <select
                    value={consentFilter}
                    onChange={(e) => setConsentFilter(e.target.value as any)}
                    className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
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
                    className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100 cursor-pointer"
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
              <table className="w-full min-w-[1480px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
                    {/* 1. Client Name (Sortable: A to Z / Z to A) */}
                    <th className="px-4 py-3 min-w-[210px]">
                      <button
                        type="button"
                        onClick={() => handleSort('name')}
                        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'name' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        title={`Sort by Client Name (${sortField === 'name' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                      >
                        <span>Client Name</span>
                        <span
                          className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'name'
                            ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300'
                            : 'text-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-700'
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
                    <th className="px-4 py-3.5 min-w-[170px]">Business Name</th>

                    {/* 3. Phone (Sortable) */}
                    <th className="px-4 py-3 min-w-[145px] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort('phone')}
                        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'phone' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        title={`Sort by Phone (${sortField === 'phone' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                      >
                        <span>Phone</span>
                        <span
                          className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'phone'
                            ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300'
                            : 'text-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-700'
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

                    {/* 4. Email (Sortable) */}
                    <th className="px-4 py-3 min-w-[195px] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort('email')}
                        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'email' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        title={`Sort by Email (${sortField === 'email' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                      >
                        <span>Email</span>
                        <span
                          className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'email'
                            ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300'
                            : 'text-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-700'
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

                    {/* 5. Client Status (Sortable: Active / Inactive) */}
                    <th className="px-3 py-3 min-w-[130px] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort('status')}
                        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'status' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        title={`Sort by Client Status (${sortField === 'status' && sortDirection === 'asc' ? 'Inactive first' : 'Active first'})`}
                      >
                        <span>Client Status</span>
                        <span
                          className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'status'
                            ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300'
                            : 'text-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-700'
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

                    {/* 6. Payment Status (Sortable: Paid / Unpaid) */}
                    <th className="px-3 py-3 min-w-[140px] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort('payment')}
                        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'payment' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        title={`Sort by Payment Status (${sortField === 'payment' && sortDirection === 'asc' ? 'Unpaid first' : 'Paid first'})`}
                      >
                        <span>Paid / Unpaid</span>
                        <span
                          className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'payment'
                            ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300'
                            : 'text-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-700'
                            }`}
                        >
                          {sortField === 'payment' ? (
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

                    {/* 7. Eff Date (Sortable) */}
                    <th className="px-3 py-3 min-w-[125px] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort('effectiveDate')}
                        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'effectiveDate' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        title={`Sort by Effective Date (${sortField === 'effectiveDate' && sortDirection === 'asc' ? 'Oldest first' : 'Newest first'})`}
                      >
                        <span>Eff Date</span>
                        <span
                          className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'effectiveDate'
                            ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300'
                            : 'text-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-700'
                            }`}
                        >
                          {sortField === 'effectiveDate' ? (
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

                    {/* 8. Policies */}
                    <th className="px-3 py-3.5 min-w-[110px] whitespace-nowrap">Policies</th>

                    {/* 9. Marketing Consent (Sortable: Granted, Pending, Declined) */}
                    <th className="px-3 py-3 min-w-[150px] whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleSort('consent')}
                        className={`group inline-flex items-center gap-1.5 transition-colors cursor-pointer ${sortField === 'consent' ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        title={`Sort by Marketing Consent (${sortField === 'consent' && sortDirection === 'asc' ? 'Z to A' : 'A to Z'})`}
                      >
                        <span>Marketing Consent</span>
                        <span
                          className={`inline-flex items-center justify-center rounded p-0.5 transition ${sortField === 'consent'
                            ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-300'
                            : 'text-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-700'
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

                    {/* 10. Last Activity */}
                    <th className="px-4 py-3.5 min-w-[175px]">Last Activity</th>

                    {/* 11. Actions */}
                    <th className="py-3.5 pl-4 pr-6 text-right min-w-[130px] w-[130px] md:sticky md:right-0 md:z-20 bg-slate-50 md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] select-none">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <Users className="mx-auto size-8 text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No clients matched your criteria</p>
                        <p className="text-xs text-slate-400 mt-1">Try selecting another status tab or resetting the search filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client, idx) => {
                      const initials = `${client.firstName[0] || ''}${client.lastName[0] || ''}`
                      const activePolicies = client.policies.filter(p => p.status === 'Active').length
                      const totalPolicies = client.policies.length

                      return (
                        <tr
                          key={`${client.id}-${idx}`}
                          className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                        >
                          {/* 1. Client Name */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <button
                                  onClick={() => handleSelectClient(client)}
                                  className="text-sm font-semibold text-slate-900 transition hover:text-blue-600 text-left truncate block cursor-pointer"
                                >
                                  {client.name}
                                </button>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
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
                              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                                <Building2 className="size-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[170px]">{client.businessName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Personal</span>
                            )}
                          </td>

                          {/* 3. Phone */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <a
                              href={`tel:${client.phone}`}
                              className="group/link inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-blue-600 transition whitespace-nowrap font-medium"
                            >
                              <Phone className="size-3 text-slate-400 group-hover/link:text-blue-600 transition shrink-0" />
                              <span>{client.phone}</span>
                              <ArrowUpRight className="size-3 text-slate-400 group-hover/link:text-blue-600 transition shrink-0" />
                            </a>
                          </td>

                          {/* 4. Email */}
                          <td className="px-4 py-3.5">
                            <a
                              href={`mailto:${client.email}`}
                              className="group/link inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-blue-600 transition truncate max-w-[200px] font-medium"
                              title={client.email}
                            >
                              <Mail className="size-3 text-slate-400 group-hover/link:text-blue-600 transition shrink-0" />
                              <span className="truncate">{client.email}</span>
                              <ArrowUpRight className="size-3 text-slate-400 group-hover/link:text-blue-600 transition shrink-0" />
                            </a>
                          </td>

                          {/* 5. Client Status (Static display badge - non-clickable) */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 whitespace-nowrap select-none ${client.status === 'Draft' || client.status === 'Draft / Incomplete'
                                ? 'bg-amber-50 text-amber-900 ring-amber-300'
                                : client.status === 'Active' || client.status === 'Active / Submitted'
                                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                  : client.status === 'Pending'
                                    ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                    : client.status === 'Lead'
                                      ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                                      : 'bg-slate-100 text-slate-600 ring-slate-200'
                                }`}
                            >
                              <span
                                className={`size-1.5 rounded-full shrink-0 ${client.status === 'Draft' || client.status === 'Draft / Incomplete'
                                  ? 'bg-amber-500 animate-pulse'
                                  : client.status === 'Active' || client.status === 'Active / Submitted'
                                    ? 'bg-emerald-500'
                                    : client.status === 'Pending'
                                      ? 'bg-amber-500'
                                      : client.status === 'Lead'
                                        ? 'bg-indigo-500'
                                        : 'bg-slate-400'
                                  }`}
                              />
                              {client.status === 'Draft' ? 'Draft / Incomplete' : client.status}
                            </span>
                          </td>

                          {/* 6. Payment Status (Paid / Unpaid) */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            {(() => {
                              const payStatus = getClientPaymentStatus(client)
                              if (payStatus === 'Paid') {
                                return (
                                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 select-none bg-emerald-50 text-emerald-700 ring-emerald-200">
                                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                                    <span>Paid</span>
                                  </span>
                                )
                              }
                              return (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 select-none bg-rose-50 text-rose-700 ring-rose-200">
                                  <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  <span>Unpaid</span>
                                  {client.outstanding && client.outstanding !== '$0.00' && (
                                    <span className="text-[10px] font-bold text-rose-600">({client.outstanding})</span>
                                  )}
                                </span>
                              )
                            })()}
                          </td>

                          {/* 7. Eff Date (Effective Date) */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                              <Calendar className="size-3.5 text-slate-400 shrink-0" />
                              <span>{getClientEffectiveDate(client)}</span>
                            </div>
                          </td>

                          {/* 8. Policies (Current / Historical count) */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <div className="flex flex-col whitespace-nowrap">
                              <span className="text-sm font-semibold text-slate-800">
                                {activePolicies} <span className="text-xs font-normal text-slate-400">Active</span>
                              </span>
                              <span className="text-xs text-slate-400">
                                {totalPolicies} total in book
                              </span>
                            </div>
                          </td>

                          {/* 9. Marketing Consent */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            {getConsentBadge(client.marketingConsent.status)}
                          </td>

                          {/* 10. Last Activity */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col max-w-[170px]">
                              <span className="text-xs font-medium text-slate-700 truncate" title={client.lastActivity.description}>
                                {client.lastActivity.description}
                              </span>
                              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                <Clock className="size-3 shrink-0" />
                                {client.lastActivity.time}
                              </span>
                            </div>
                          </td>

                          {/* 11. Actions */}
                          <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[130px] w-[130px] md:sticky md:right-0 md:z-10 bg-white group-hover:bg-[#f8fafc] md:shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] transition-colors">
                            <div className="inline-flex items-center justify-end gap-1.5 whitespace-nowrap">
                              {client.status === 'Draft' || client.status === 'Draft / Incomplete' ? (
                                <>
                                  <Link
                                    href={`/broker/clients?draftId=${client.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold text-white shadow-xs transition cursor-pointer whitespace-nowrap"
                                    title="Resume editing this incomplete draft"
                                  >
                                    <Edit3 className="size-3.5 text-amber-200 shrink-0" />
                                    <span>Resume</span>
                                  </Link>
                                  <button
                                    onClick={() => handleSelectClient(client)}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shrink-0 cursor-pointer"
                                    title="View Draft Details"
                                  >
                                    <Eye className="size-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleSelectClient(client)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                                  >
                                    <Eye className="size-3.5 text-slate-400 shrink-0" />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={() => openEditClientModal(client)}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shrink-0 cursor-pointer"
                                    title="Edit Client"
                                  >
                                    <Edit3 className="size-3.5" />
                                  </button>
                                </>
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
      ) : (
        /* =========================================================================
           4.5 FULL-PAGE BROKER DETAILS REVIEW SCREEN (NO POPUP / NO MODAL)
           ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Breadcrumbs & Quick Return Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-blue-600 transition cursor-pointer py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
              >
                <ArrowLeft className="size-3.5" />
                Back to Clients List
              </button>
              <ChevronRight className="size-3 text-slate-300" />
              <span className="text-slate-500">Broker Review</span>
              <ChevronRight className="size-3 text-slate-300" />
              <span className="font-semibold text-slate-900">{selectedClientForView.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const fullInfo = `Broker Name: ${selectedClientForView.name}
Broker Code: ${selectedClientForView.brokerCode}
Identifier: ${selectedClientForView.otherIdentifier}
Status: ${selectedClientForView.status}
Business: ${selectedClientForView.businessName}
Phone: ${selectedClientForView.phone}
Email: ${selectedClientForView.email}
Address: ${selectedClientForView.street}, ${selectedClientForView.city}, ${selectedClientForView.state} ${selectedClientForView.zip}`
                  handleCopy(fullInfo, 'all-summary')
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                title="Copy complete contact summary"
              >
                {copiedKey === 'all-summary' ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Summary Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-slate-500" />
                    <span>Copy Full Summary</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <X className="size-3.5 text-slate-400" />
                Close
              </button>
            </div>
          </div>

          {/* Main Broker Profile Header Card (Matching Screenshot Reference) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Avatar & Identity Details */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-[18px] sm:text-[20px] font-bold text-white shadow-md">
                  {selectedClientForView.firstName[0]}{selectedClientForView.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
                      <span>{selectedClientForView.name}</span>
                      <CopyButton text={selectedClientForView.name} copyKey="hdr-name" label="Client Name" />
                    </h1>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {selectedClientForView.clientType || (selectedClientForView.businessName !== '—' ? 'Commercial' : 'Individual')}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${selectedClientForView.status === 'Draft' || selectedClientForView.status === 'Draft / Incomplete'
                      ? 'text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md ring-1 ring-amber-300'
                      : 'text-slate-900'
                      }`}>
                      <span className={`size-2 rounded-full ${selectedClientForView.status === 'Draft' || selectedClientForView.status === 'Draft / Incomplete'
                        ? 'bg-amber-500 animate-pulse'
                        : selectedClientForView.status === 'Active'
                          ? 'bg-blue-600'
                          : 'bg-slate-400'
                        }`} />
                      {selectedClientForView.status === 'Draft' ? 'Draft / Incomplete' : selectedClientForView.status}
                    </span>

                    {/* Client Overall Payment Status Badge */}
                    {(() => {
                      const payStatus = getClientPaymentStatus(selectedClientForView)
                      if (payStatus === 'Paid') {
                        return (
                          <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            <span>Paid</span>
                          </span>
                        )
                      }
                      return (
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                          <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>Unpaid</span>
                          {selectedClientForView.outstanding && selectedClientForView.outstanding !== '$0.00' && (
                            <span className="text-[10.5px] text-rose-600 font-semibold">({selectedClientForView.outstanding})</span>
                          )}
                        </span>
                      )
                    })()}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5 text-slate-400" />
                      <span>{selectedClientForView.city}, {selectedClientForView.state}</span>
                      <CopyButton text={`${selectedClientForView.city}, ${selectedClientForView.state}`} copyKey="hdr-city" label="Location" />
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="size-3.5 text-slate-400" />
                      <a href={`mailto:${selectedClientForView.email}`} className="text-blue-600 hover:underline">{selectedClientForView.email}</a>
                      <CopyButton text={selectedClientForView.email} copyKey="hdr-email" label="Email" />
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5 text-slate-400" />
                      <a href={`tel:${selectedClientForView.phone}`} className="text-slate-700 font-medium">{selectedClientForView.phone}</a>
                      <CopyButton text={selectedClientForView.phone} copyKey="hdr-phone" label="Phone" />
                    </span>
                    <span className="text-slate-400">
                      Client since {selectedClientForView.clientSince || '2 Sep 2024'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="text-slate-400">Broker Code:</span>
                      <strong className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">{selectedClientForView.brokerCode}</strong>
                      <CopyButton text={selectedClientForView.brokerCode} copyKey="hdr-bcode" label="Broker Code" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {(selectedClientForView.status === 'Draft' || selectedClientForView.status === 'Draft / Incomplete') && (
                  <Link
                    href={`/broker/clients?draftId=${selectedClientForView.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                  >
                    <Edit3 className="size-3.5 text-amber-200" />
                    Resume &amp; Complete Draft
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setClientDetailTab('commissions')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <Download className="size-3.5 text-slate-500" />
                  Commission history
                </button>
              </div>
            </div>
          </div>

          {/* Draft Notice Banner if viewed client is draft */}
          {(selectedClientForView.status === 'Draft' || selectedClientForView.status === 'Draft / Incomplete') && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs sm:text-sm text-amber-900 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold">This client record is saved in Drafts (Incomplete / Half Info).</span>
                  <span className="text-amber-800 ml-1">
                    {selectedClientForView.lastActivity?.description || 'Pending details before binding.'}
                  </span>
                </div>
              </div>
              <Link
                href={`/broker/clients?draftId=${selectedClientForView.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition cursor-pointer shrink-0"
              >
                <Edit3 className="size-3.5" />
                <span>Resume in Intake Form</span>
              </Link>
            </div>
          )}

          {/* ───── 7 Commission Summary Metrics (Single Row matching Screenshot) ───── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Original expected</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">
                {selectedClientForView.originalExpected || '$430.50'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Additional commission</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">
                {selectedClientForView.additionalCommission || '$0.00'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Chargebacks</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">
                {selectedClientForView.chargebacks || '$0.00'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Other adjustments</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">
                {selectedClientForView.otherAdjustments || '$0.00'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Net commission</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">
                {selectedClientForView.netCommission || '$430.50'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Total paid</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">
                {selectedClientForView.totalPaid || '$253.00'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
              <span className="text-[11px] text-slate-400 font-medium block">Outstanding</span>
              <span className="text-lg font-bold text-slate-900 block mt-1">
                {selectedClientForView.outstanding || '$177.50'}
              </span>
            </div>
          </div>

          {/* Full-Page Navigation Tabs */}
          <div className="border-b border-slate-200 bg-white rounded-xl shadow-2xs px-4 sm:px-6">
            <div className="flex gap-2 sm:gap-6 overflow-x-auto scrollbar-thin">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'policies', label: `Policies (${selectedClientForView.policies.length})` },
                { key: 'commissions', label: `Commissions (${selectedClientForView.commissions.length})` },
                { key: 'consent', label: 'Consent' },
                { key: 'notes', label: `Notes (${selectedClientForView.notes.length})` },
                { key: 'timeline', label: 'Timeline' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setClientDetailTab(tab.key as any)}
                  className={`py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer px-2 sm:px-1 ${clientDetailTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Contents Container */}
          <div className="space-y-6">
            {/* TAB 1: OVERVIEW */}
            {clientDetailTab === 'overview' && (
              <div className="space-y-6">
                {/* Contact Information & Identifiers Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Contact Information Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Contact Information
                      </h3>
                      <span className="text-[11px] text-slate-400">One-click copy enabled</span>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Users className="size-3.5 text-slate-400" /> Name
                        </span>
                        <div className="inline-flex items-center gap-1">
                          <span className="font-semibold text-slate-900">{selectedClientForView.name}</span>
                          <CopyButton text={selectedClientForView.name} copyKey="cnt-name" label="Name" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Phone className="size-3.5 text-slate-400" /> Phone
                        </span>
                        <div className="inline-flex items-center gap-1">
                          <a href={`tel:${selectedClientForView.phone}`} className="font-semibold text-blue-600 hover:underline">
                            {selectedClientForView.phone}
                          </a>
                          <CopyButton text={selectedClientForView.phone} copyKey="cnt-phone" label="Phone" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Mail className="size-3.5 text-slate-400" /> Email
                        </span>
                        <div className="inline-flex items-center gap-1">
                          <a href={`mailto:${selectedClientForView.email}`} className="font-semibold text-blue-600 hover:underline">
                            {selectedClientForView.email}
                          </a>
                          <CopyButton text={selectedClientForView.email} copyKey="cnt-email" label="Email" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 pt-1">
                        <span className="text-slate-500 flex items-center gap-1.5 shrink-0">
                          <MapPin className="size-3.5 text-slate-400 shrink-0" /> Address
                        </span>
                        <div className="inline-flex items-start gap-1 sm:text-right">
                          <span className="font-medium text-slate-800 break-words">
                            {selectedClientForView.street}, {selectedClientForView.city}, {selectedClientForView.state} {selectedClientForView.zip}
                          </span>
                          <CopyButton
                            text={`${selectedClientForView.street}, ${selectedClientForView.city}, ${selectedClientForView.state} ${selectedClientForView.zip}`}
                            copyKey="cnt-addr"
                            label="Address"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-slate-400" /> Date of Birth
                        </span>
                        <span className="font-medium text-slate-800">{selectedClientForView.dob || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Broker Identifiers & Compliance Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Broker Identifiers & Compliance
                      </h3>
                      <span className="text-[11px] text-slate-400">Compliance Verified</span>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Broker Assigned Code</span>
                        <div className="inline-flex items-center gap-1">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {selectedClientForView.brokerCode}
                          </span>
                          <CopyButton text={selectedClientForView.brokerCode} copyKey="comp-bcode" label="Broker Code" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Agent Identifier</span>
                        <div className="inline-flex items-center gap-1">
                          <span className="font-mono font-medium text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {selectedClientForView.otherIdentifier}
                          </span>
                          <CopyButton text={selectedClientForView.otherIdentifier} copyKey="comp-id" label="Identifier" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Business Structure</span>
                        <span className="font-medium text-slate-800">
                          {selectedClientForView.businessName !== '—' ? selectedClientForView.businessName : 'Individual Policyholder'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Status</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${selectedClientForView.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                        >
                          {selectedClientForView.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-500">Marketing Consent</span>
                        {getConsentBadge(selectedClientForView.marketingConsent.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policies Comprehensive Section - Matching Image 1 Exactly */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span>Policies</span>
                        <span className="text-slate-400 font-medium">·</span>
                        <span className="text-slate-500 font-semibold">{selectedClientForView.policies.length}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Active insurance policies and historical rewriting chain bound to this broker account.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => setClientDetailTab('policies')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                      >
                        Ledger Table &rarr;
                      </button>
                    </div>
                  </div>

                  {selectedClientForView.policies.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                      <p className="text-xs text-slate-400">No active policies bound yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedClientForView.policies.map((p) => renderPolicyCard(p))}
                    </div>
                  )}
                </div>

                {/* Recent Notes Preview */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Recent Broker Notes
                    </h3>
                    <button
                      onClick={() => setClientDetailTab('notes')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Manage notes &rarr;
                    </button>
                  </div>
                  {selectedClientForView.notes.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No notes recorded.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedClientForView.notes.slice(0, 2).map((n) => (
                        <div key={n.id} className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3.5 text-xs">
                          <p className="text-slate-700 leading-relaxed">{n.text}</p>
                          <p className="mt-2 text-[11px] text-slate-400 font-medium">Logged by {n.author} · {n.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: POLICIES (Current & Historical - Inline expanded row, NO POPUP!) */}
            {clientDetailTab === 'policies' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Current &amp; Historical Policies</h3>
                    <p className="text-xs text-slate-500">Track all policies associated with this broker record. Click any row to expand details inline without any popup modals.</p>
                  </div>
                </div>

                {selectedClientForView.policies.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                    <ClipboardList className="mx-auto size-9 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No policies in record</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                            <th className="px-5 py-3.5">Policy #</th>
                            <th className="px-4 py-3.5">Coverage Line</th>
                            <th className="px-4 py-3.5">Carrier</th>
                            <th className="px-4 py-3.5">Premium</th>
                            <th className="px-4 py-3.5">Payment</th>
                            <th className="px-4 py-3.5">Term Dates</th>
                            <th className="px-4 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClientForView.policies.map((policy) => {
                            const isExpanded = expandedPolicyId === policy.id
                            return (
                              <Fragment key={policy.id}>
                                <tr
                                  onClick={() => setExpandedPolicyId(isExpanded ? null : policy.id)}
                                  className={`group border-b border-slate-100 text-xs transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                                    }`}
                                >
                                  <td className="px-5 py-4 font-mono font-bold text-slate-900">
                                    <div className="inline-flex items-center gap-1.5">
                                      <span>{policy.policyNumber}</span>
                                      <CopyButton text={policy.policyNumber} copyKey={`pol-table-${policy.id}`} label="Policy Number" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 font-semibold text-slate-800">{policy.type}</td>
                                  <td className="px-4 py-4 text-slate-600">{policy.carrier}</td>
                                  <td className="px-4 py-4 font-bold text-slate-900">{policy.premium}</td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    {(() => {
                                      const isPolPaid = getPolicyPaymentStatus(policy, selectedClientForView) === 'Paid'
                                      return (
                                        <span
                                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${isPolPaid
                                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                            : 'bg-rose-50 text-rose-700 ring-rose-200'
                                            }`}
                                        >
                                          {isPolPaid ? (
                                            <>
                                              <CheckCircle2 className="size-3 text-emerald-600" />
                                              <span>Paid</span>
                                            </>
                                          ) : (
                                            <>
                                              <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                                              <span>Unpaid</span>
                                            </>
                                          )}
                                        </span>
                                      )
                                    })()}
                                  </td>
                                  <td className="px-4 py-4 text-slate-500 font-medium">
                                    {policy.effectiveDate} &rarr; {policy.expirationDate}
                                  </td>
                                  <td className="px-4 py-4">
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${policy.status === 'Active'
                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                        : policy.status === 'Pending Renewal'
                                          ? 'bg-amber-50 text-amber-700 ring-amber-200'
                                          : 'bg-slate-100 text-slate-600 ring-slate-200'
                                        }`}
                                    >
                                      {policy.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="inline-flex items-center gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCopy(policy.policyNumber, `btn-pol-tbl-${policy.id}`)
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                        title="Copy Policy Number"
                                      >
                                        {copiedKey === `btn-pol-tbl-${policy.id}` ? (
                                          <Check className="size-3 text-emerald-600" />
                                        ) : (
                                          <Copy className="size-3 text-slate-400" />
                                        )}
                                        <span>{copiedKey === `btn-pol-tbl-${policy.id}` ? 'Copied' : 'Copy'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setExpandedPolicyId(isExpanded ? null : policy.id)
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                      >
                                        <span>{isExpanded ? 'Hide Specs' : 'View Specs'}</span>
                                        {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Inline Expanded Details Row: Render Image 1 Reference Card directly! */}
                                {isExpanded && (
                                  <tr className="bg-blue-50/20 border-b border-slate-200 animate-in fade-in duration-200">
                                    <td colSpan={8} className="p-4 sm:p-6">
                                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                                          <Shield className="size-3.5" /> Policy Specifications &amp; Overview
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setExpandedPolicyId(null)
                                          }}
                                          className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                                        >
                                          <X className="size-3.5" /> Collapse
                                        </button>
                                      </div>
                                      {renderPolicyCard(policy)}
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View (< sm) - Render Image 1 Reference Cards directly */}
                    <div className="sm:hidden space-y-4">
                      {selectedClientForView.policies.map((policy) => (
                        <div key={policy.id} className="relative">
                          {renderPolicyCard(policy)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 3: COMMISSION HISTORY (Inline Source Breakdown, NO POPUP!) */}
            {clientDetailTab === 'commissions' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Transaction-level Commission History</h3>
                    <p className="text-xs text-slate-500">Traceable carrier statements and revenue payouts. Click View Source to inspect inline statement audit data.</p>
                  </div>
                  <Link
                    href="/broker/commissions"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline self-start sm:self-auto"
                  >
                    Commission Ledger <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>

                {selectedClientForView.commissions.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                    <DollarSign className="mx-auto size-9 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No commission records for this broker yet</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                            <th className="px-5 py-3.5">Date</th>
                            <th className="px-4 py-3.5">Statement #</th>
                            <th className="px-4 py-3.5">Carrier</th>
                            <th className="px-4 py-3.5">Gross Premium</th>
                            <th className="px-4 py-3.5">Rate</th>
                            <th className="px-4 py-3.5">Net Broker Amount</th>
                            <th className="px-4 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClientForView.commissions.map((c) => {
                            const isExpanded = expandedStatementId === c.id
                            return (
                              <Fragment key={c.id}>
                                <tr
                                  onClick={() => setExpandedStatementId(isExpanded ? null : c.id)}
                                  className={`group border-b border-slate-100 text-xs transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'
                                    }`}
                                >
                                  <td className="px-5 py-4 text-slate-600 font-medium">{c.date}</td>
                                  <td className="px-4 py-4 font-mono font-bold text-slate-900">
                                    <div className="inline-flex items-center gap-1.5">
                                      <span>{c.statementNumber}</span>
                                      <CopyButton text={c.statementNumber} copyKey={`stmt-${c.id}`} label="Statement #" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-slate-700 font-semibold">{c.carrier}</td>
                                  <td className="px-4 py-4 text-slate-700">{c.premium}</td>
                                  <td className="px-4 py-4 text-slate-600">{c.rate}</td>
                                  <td className="px-4 py-4 font-bold text-emerald-600 text-sm">{c.amount}</td>
                                  <td className="px-4 py-4">
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${c.status === 'Paid'
                                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                        : 'bg-rose-50 text-rose-700 ring-rose-200'
                                        }`}
                                    >
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="inline-flex items-center gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCopy(c.statementNumber, `btn-copy-stmt-${c.id}`)
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                        title="Copy Statement Number"
                                      >
                                        {copiedKey === `btn-copy-stmt-${c.id}` ? (
                                          <Check className="size-3 text-emerald-600" />
                                        ) : (
                                          <Copy className="size-3 text-slate-400" />
                                        )}
                                        <span>{copiedKey === `btn-copy-stmt-${c.id}` ? 'Copied' : 'Copy'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setExpandedStatementId(isExpanded ? null : c.id)
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                      >
                                        <span>{isExpanded ? 'Hide Source' : 'View Source'}</span>
                                        {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Inline Statement Reconciliation Panel (NO POPUP!) */}
                                {isExpanded && (
                                  <tr className="bg-slate-50/90 border-b border-slate-200 animate-in fade-in duration-200">
                                    <td colSpan={8} className="p-5 sm:p-6">
                                      <div className="rounded-xl border border-blue-200/80 bg-white p-5 shadow-xs">
                                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                              Reconciliation Audit
                                            </span>
                                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                              <span>Statement #{c.statementNumber}</span>
                                              <CopyButton text={c.statementNumber} copyKey={`stmt-detail-${c.id}`} label="Statement #" />
                                            </h4>
                                            <span className="text-xs text-slate-500">· Carrier: {c.carrier}</span>
                                          </div>
                                          <button
                                            onClick={() => setExpandedStatementId(null)}
                                            className="text-xs font-medium text-slate-400 hover:text-slate-700 cursor-pointer flex items-center gap-1"
                                          >
                                            <X className="size-3.5" /> Collapse
                                          </button>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-4 text-xs">
                                          <div className="rounded-lg bg-slate-50 p-3">
                                            <span className="text-slate-400 block text-[11px]">Transaction ID</span>
                                            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">{c.id}</span>
                                          </div>
                                          <div className="rounded-lg bg-slate-50 p-3">
                                            <span className="text-slate-400 block text-[11px]">Payout Date</span>
                                            <span className="font-semibold text-slate-900 text-xs mt-0.5 block">{c.date}</span>
                                          </div>
                                          <div className="rounded-lg bg-slate-50 p-3">
                                            <span className="text-slate-400 block text-[11px]">Associated Policy</span>
                                            <div className="inline-flex items-center gap-1 mt-0.5">
                                              <span className="font-mono font-bold text-slate-900 text-xs">{c.policyNumber}</span>
                                              <CopyButton text={c.policyNumber} copyKey={`stmt-pol-${c.id}`} label="Policy Number" />
                                            </div>
                                          </div>
                                          <div className="rounded-lg bg-slate-50 p-3">
                                            <span className="text-slate-400 block text-[11px]">Broker Net Payment</span>
                                            <span className="font-bold text-emerald-600 text-sm mt-0.5 block">{c.amount}</span>
                                          </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                                          <div className="flex items-center gap-4 text-slate-600">
                                            <span>Gross Premium: <strong className="text-slate-900">{c.premium}</strong></span>
                                            <span>Commission Rate: <strong className="text-slate-900">{c.rate}</strong></span>
                                            <span>Status: <strong className="text-emerald-700">{c.status}</strong></span>
                                          </div>
                                          <Link
                                            href="/broker/statements"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                                          >
                                            Go to Statements Module <ArrowUpRight className="size-3.5" />
                                          </Link>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards View (< sm) */}
                    <div className="sm:hidden space-y-3">
                      {selectedClientForView.commissions.map((c) => {
                        const isExpanded = expandedStatementId === c.id
                        return (
                          <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-xs">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="inline-flex items-center gap-1">
                                  <span className="font-mono font-bold text-slate-900 text-sm">{c.statementNumber}</span>
                                  <CopyButton text={c.statementNumber} copyKey={`mob-stmt-${c.id}`} label="Statement #" />
                                </div>
                                <p className="text-slate-700 font-semibold mt-0.5">{c.carrier}</p>
                                <p className="text-slate-400 text-[11px]">{c.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-600 text-sm">{c.amount}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{c.rate} of {c.premium}</p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${c.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                  }`}
                              >
                                {c.status}
                              </span>
                              <button
                                onClick={() => setExpandedStatementId(isExpanded ? null : c.id)}
                                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isExpanded ? 'Hide Source' : 'View Source'}</span>
                                {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-slate-50 p-3 rounded-xl animate-in fade-in">
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500">Transaction ID</span>
                                  <span className="font-mono text-slate-900">{c.id}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500">Associated Policy</span>
                                  <span className="font-mono text-slate-900">{c.policyNumber}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200/60">
                                  <span className="text-slate-500">Gross Premium</span>
                                  <span className="font-semibold text-slate-900">{c.premium}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                  <span className="text-slate-500">Commission Rate</span>
                                  <span className="font-semibold text-slate-900">{c.rate}</span>
                                </div>
                                <div className="pt-2 flex justify-end">
                                  <Link
                                    href="/broker/statements"
                                    className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                                  >
                                    Go to Statements <ArrowUpRight className="size-3" />
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 4: MARKETING CONSENT */}
            {clientDetailTab === 'consent' && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Current Consent &amp; Privacy Compliance</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Regulatory compliance verification with TCPA and state insurance privacy rules.</p>
                    </div>
                    {getConsentBadge(selectedClientForView.marketingConsent.status)}
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-semibold mb-2">Permitted Communication Channels</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedClientForView.marketingConsent.channels.length > 0 ? (
                          selectedClientForView.marketingConsent.channels.map((ch) => (
                            <span key={ch} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 border border-slate-200 shadow-2xs">
                              {ch}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">No channels permitted</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-semibold mb-1">Intake / Capture Method</span>
                      <span className="font-semibold text-slate-900 text-sm block">
                        {selectedClientForView.marketingConsent.method || 'Direct Broker Intake'}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-semibold mb-1">Date Verified &amp; Logged</span>
                      <span className="font-semibold text-slate-900 text-sm block">
                        {selectedClientForView.marketingConsent.consentDate || 'Pending confirmation'}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                      <span className="text-xs text-slate-400 block font-semibold mb-1">IP Address / Signature Stamp</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs text-slate-900 break-all">
                          {selectedClientForView.marketingConsent.ipAddress || 'Verified via intake documentation'}
                        </span>
                        {selectedClientForView.marketingConsent.ipAddress && (
                          <CopyButton
                            text={selectedClientForView.marketingConsent.ipAddress}
                            copyKey="consent-ip"
                            label="IP Stamp"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedClientForView.marketingConsent.notes && (
                    <div className="mt-4 rounded-xl bg-blue-50/70 border border-blue-100 p-4 text-xs text-blue-900">
                      <strong className="font-semibold block mb-0.5">Compliance Audit Note:</strong>
                      {selectedClientForView.marketingConsent.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: NOTES */}
            {clientDetailTab === 'notes' && (
              <div className="space-y-5">
                {/* Add Note Composer */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-2">Add Internal Broker Note</h3>
                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type details regarding client conversations, policy renewals, coverage inquiries..."
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleAddNote}
                      disabled={!newNoteText.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 disabled:opacity-40 transition cursor-pointer"
                    >
                      <Send className="size-3.5" />
                      Save Note
                    </button>
                  </div>
                </div>

                {/* Notes History Stream */}
                <div className="space-y-3">
                  {selectedClientForView.notes.map((n) => (
                    <div key={n.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-2.5 mb-2.5">
                        <span className="font-bold text-slate-800">{n.author}</span>
                        <span>{n.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: TIMELINE & ACTIVITY */}
            {clientDetailTab === 'timeline' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Chronological Broker &amp; Client History</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Audited timeline of policies, endorsements, consent records, and notes.</p>
                </div>
                <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-7 ml-2">
                  {selectedClientForView.timeline.map((event) => (
                    <div key={event.id} className="relative group">
                      <div className="absolute -left-[31px] sm:-left-[39px] top-0.5 size-4 rounded-full border-2 border-white bg-blue-600 ring-4 ring-blue-100" />
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                          <span className="text-[11px] text-slate-400 shrink-0 font-medium">{event.date}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">{event.detail}</p>
                        <p className="mt-1 text-[11px] text-slate-400">Actor: <span className="font-semibold text-slate-700">{event.actor}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4.4 ADD / EDIT CLIENT MODAL FORM
      ─────────────────────────────────────────────────────────────── */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 flex items-center gap-2">
                  <Users className="size-4.5 text-blue-600" />
                  {editingClient ? 'Edit Client Profile' : 'Add New Client'}
                </h2>
                <p className="text-[12px] text-slate-500">
                  {editingClient ? 'Update client records, policy coverage, and intake details' : 'Complete intake details, policy coverage, and automated compliance setup'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form id="add-client-form" onSubmit={(e) => handleSaveClient(e, false)} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">

              {/* SECTION 1: Client Identity */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <UserCheck className="size-3.5 text-blue-600" />
                  Client Identity
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Client Classification
                    </label>
                    <select
                      value={clientForm.clientType}
                      onChange={(e) => setClientForm({ ...clientForm, clientType: e.target.value as any })}
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
                    >
                      <option value="Individual">Individual Policyholder</option>
                      <option value="Commercial">Commercial / Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Business Name {clientForm.clientType === 'Commercial' ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required={clientForm.clientType === 'Commercial'}
                        value={clientForm.businessName}
                        onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
                        placeholder={clientForm.clientType === 'Commercial' ? 'e.g. Vance Logistics LLC (Required)' : 'e.g. Vance Logistics LLC'}
                        className="h-9.5 w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3 text-[13px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      {clientForm.clientType === 'Commercial' ? 'Contact Person First Name' : 'First Name'}{' '}
                      {clientForm.clientType === 'Individual' ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                    </label>
                    <input
                      type="text"
                      required={clientForm.clientType === 'Individual'}
                      value={clientForm.firstName}
                      onChange={(e) => setClientForm({ ...clientForm, firstName: e.target.value })}
                      placeholder={clientForm.clientType === 'Commercial' ? 'e.g. Marcus (optional)' : 'e.g. Marcus'}
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      {clientForm.clientType === 'Commercial' ? 'Contact Person Last Name' : 'Last Name'}{' '}
                      {clientForm.clientType === 'Individual' ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                    </label>
                    <input
                      type="text"
                      required={clientForm.clientType === 'Individual'}
                      value={clientForm.lastName}
                      onChange={(e) => setClientForm({ ...clientForm, lastName: e.target.value })}
                      placeholder={clientForm.clientType === 'Commercial' ? 'e.g. Vance (optional)' : 'e.g. Vance'}
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-[13px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {clientForm.clientType === 'Commercial' && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-2.5 text-[11px] text-blue-900 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>Commercial Account: Business Name is required. First Name and Last Name are optional contact person fields.</span>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Date of Birth <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={clientForm.dob}
                        onChange={(e) => setClientForm({ ...clientForm, dob: e.target.value })}
                        className="h-9.5 w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3 text-[13px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Contact Information & Email Helpers */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <Phone className="size-3.5 text-blue-600" />
                  Contact Information
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Primary Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        placeholder="(416) 555-0199"
                        className="h-9.5 w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3 text-[13px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Primary Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={clientForm.email}
                        onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                        placeholder="client@domain.com"
                        className="h-9.5 w-full rounded-xl border border-slate-200 bg-white pl-9.5 pr-3 text-[13px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    {/* Quick Email Domain Pill Helpers */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-medium text-slate-400">Quick suffix:</span>
                      {QUICK_EMAIL_DOMAINS.map(domain => (
                        <button
                          key={domain}
                          type="button"
                          onClick={() => handleApplyEmailDomain(domain)}
                          className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                        >
                          {domain}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Address & Location (Searchable Autocomplete) */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <MapPin className="size-3.5 text-blue-600" />
                    Address & Location <span className="text-slate-400 font-normal lowercase">(optional & searchable)</span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium">Auto-fill enabled</span>
                </div>

                {/* Searchable Address Bar */}
                <div className="relative">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Search Address (Type to see suggestions & auto-fill)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={addressSearchQuery}
                      onChange={(e) => {
                        setAddressSearchQuery(e.target.value)
                        setIsAddressDropdownOpen(true)
                      }}
                      onFocus={() => setIsAddressDropdownOpen(true)}
                      placeholder="Type street or city (e.g. 100 King St W, Toronto...)"
                      className="h-10 w-full rounded-xl border border-blue-200 bg-white pl-9.5 pr-8 text-[13px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
                    />
                    {addressSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddressSearchQuery('')
                          setIsAddressDropdownOpen(false)
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Address Dropdown Recommendations */}
                  {isAddressDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Suggested Addresses (Click to Auto-fill)
                      </div>
                      {filteredAddressRecommendations.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAddress(item)}
                          className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-blue-50/80 transition cursor-pointer group"
                        >
                          <MapPin className="size-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                              {item.street}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {item.city}, {item.province} {item.postalCode}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subfields (Street, City, Province, Postal Code) */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={clientForm.street}
                    onChange={(e) => setClientForm({ ...clientForm, street: e.target.value })}
                    placeholder="e.g. 100 King Street West, Suite 5600"
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">City</label>
                    <input
                      type="text"
                      value={clientForm.city}
                      onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                      placeholder="e.g. Toronto"
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Province</label>
                    <select
                      value={clientForm.province}
                      onChange={(e) => setClientForm({ ...clientForm, province: e.target.value })}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    >
                      {CANADIAN_PROVINCES.map(p => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={clientForm.postalCode}
                      onChange={(e) => setClientForm({ ...clientForm, postalCode: e.target.value })}
                      placeholder="e.g. M5X 1C9"
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Client Status & Automated Marketing Consent */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Client Status</label>
                    <select
                      value={clientForm.status}
                      onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as any })}
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12.5px] font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    >
                      <option value="Active / Submitted">Active / Submitted</option>
                      <option value="Pending">Pending</option>
                      <option value="Lead">Lead</option>
                    </select>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Primary intake status for broker book classification.
                    </p>
                  </div>

                  {/* Automated Marketing Consent Notification Banner */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 flex items-start gap-2.5">
                    <ShieldCheck className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11.5px] font-bold text-emerald-900">
                        Automated Consent Dispatch
                      </p>
                      <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                        A digital consent link will automatically be dispatched to the client upon saving. Once digitally authorized, their record automatically updates to <strong className="font-semibold text-emerald-900">Granted</strong> in the client file.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Policy & Coverage Details */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <FileText className="size-3.5 text-blue-600" />
                    Policy & Coverage Details
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Expiry date automatically linked (+1 yr)
                  </span>
                </div>

                {/* Line of Business Multi-Select Pills */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Line of Business <span className="text-slate-400 font-normal">(Multiple selections supported, e.g. Auto & Home)</span>
                    </label>
                    <span className="text-[11px] font-medium text-blue-600">
                      {clientForm.linesOfBusiness.length} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LOB_OPTIONS.map((line) => {
                      const isSelected = clientForm.linesOfBusiness.includes(line)
                      return (
                        <button
                          key={line}
                          type="button"
                          onClick={() => toggleLineOfBusiness(line)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11.5px] font-semibold transition cursor-pointer ${isSelected
                            ? 'bg-slate-950 text-white shadow-xs hover:bg-slate-800'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                          {isSelected && <Check className="size-3.5 text-emerald-400" />}
                          {line}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Policy Number & Insurer */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">Policy Number</label>
                      <label className="flex items-center gap-1.5 text-[10.5px] text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clientForm.isPendingPolicyNumber}
                          onChange={(e) => setClientForm({ ...clientForm, isPendingPolicyNumber: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Pending issuance
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={clientForm.isPendingPolicyNumber}
                      value={clientForm.isPendingPolicyNumber ? 'PENDING ISSUANCE (Auto-generated)' : clientForm.policyNumber}
                      onChange={(e) => setClientForm({ ...clientForm, policyNumber: e.target.value })}
                      placeholder="e.g. POL-8942-CAN"
                      className={`h-9.5 w-full rounded-xl border border-slate-200 px-3 text-[12.5px] font-mono outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${clientForm.isPendingPolicyNumber ? 'bg-slate-100 text-slate-500 italic' : 'bg-white text-slate-900'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Insurer Name <span className="text-slate-400 font-normal">(with suggestions)</span>
                    </label>
                    <input
                      type="text"
                      list="insurer-list"
                      value={clientForm.insurerName}
                      onChange={(e) => setClientForm({ ...clientForm, insurerName: e.target.value })}
                      placeholder="Select or type insurer..."
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12.5px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <datalist id="insurer-list">
                      {INSURER_SUGGESTIONS.map((ins) => (
                        <option key={ins} value={ins} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Effective Date, Auto Expiry (+1 Year), and Yearly Premium */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={clientForm.effectiveDate}
                      onChange={(e) => handleEffectiveDateChange(e.target.value)}
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">Expiry Date</label>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ring-1 ring-emerald-200">
                        +1 Yr Auto
                      </span>
                    </div>
                    <input
                      type="date"
                      readOnly
                      value={clientForm.expirationDate}
                      title="Expiry date is automatically linked to exact one year after effective date."
                      className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-[12px] text-slate-600 outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Yearly Premium</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={clientForm.yearlyPremium}
                        onChange={(e) => setClientForm({ ...clientForm, yearlyPremium: e.target.value })}
                        placeholder="2,450.00"
                        className="h-9.5 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-[12.5px] font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: Additional Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="Optional internal remarks, background context, or intake notes..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-[12px] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </form>

            {/* Modal Footer Actions: Cancel, Draft, Save Client (Always visible) */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/90 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSaveClient(undefined, true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-xs"
                >
                  <BookmarkPlus className="size-4 text-slate-500" />
                  Draft
                </button>
                <button
                  type="submit"
                  form="add-client-form"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5.5 py-2 text-[12.5px] font-semibold text-white shadow-md hover:bg-blue-600 transition cursor-pointer"
                >
                  <Check className="size-4 text-emerald-400" />
                  {editingClient ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Insurance Company / Carrier</label>
                    <span className="text-[10px] text-blue-600 font-medium">Settings Pre-selected</span>
                  </div>
                  <select
                    value={policyForm.carrier}
                    onChange={(e) => setPolicyForm({ ...policyForm, carrier: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 text-[12px] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-medium text-slate-900"
                  >
                    <option value="Travelers Insurance">Travelers Insurance</option>
                    <option value="The Hartford">The Hartford</option>
                    <option value="Liberty Mutual">Liberty Mutual</option>
                    <option value="Progressive Commercial">Progressive Commercial</option>
                    <option value="Chubb Commercial">Chubb Commercial</option>
                    <option value="Nationwide Mutual">Nationwide Mutual</option>
                    <option value="Intact Insurance">Intact Insurance</option>
                    <option value="Aviva Canada">Aviva Canada</option>
                    <option value="Wawanesa Mutual Insurance">Wawanesa Mutual Insurance</option>
                    <option value="Economical / Definity Insurance">Economical / Definity Insurance</option>
                    <option value="Other">Other (Type custom carrier)...</option>
                  </select>
                  {policyForm.carrier === 'Other' && (
                    <input
                      type="text"
                      placeholder="Type custom carrier name..."
                      onChange={(e) => setPolicyForm({ ...policyForm, carrier: e.target.value })}
                      className="mt-1.5 h-8 w-full rounded-xl border border-blue-200 px-3 text-[11px] outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  )}
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

    </div>
  )
}

export default function BookOfBusinessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      }
    >
      <BookOfBusinessContent />
    </Suspense>
  )
}
