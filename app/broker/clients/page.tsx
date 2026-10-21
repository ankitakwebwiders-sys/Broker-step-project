'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  UserPlus,
  ArrowLeft,
  Check,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  DollarSign,
  Percent,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  FileSpreadsheet,
  Download,
  ChevronDown,
  Plus,
  Sliders,
  ExternalLink,
  Layers,
  ArrowRight,
  RefreshCw,
  Bookmark,
  FolderClock,
  Trash2,
  FileEdit,
  Clock,
} from 'lucide-react'
import { type ClientItem, initialClients } from '@/data/broker/clients'

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
  'Commercial Auto',
  'General Liability',
  'Commercial Property',
  'Professional Liability',
  'Cyber Liability',
  'Workers Comp',
  'Business Owners',
  'Travel',
  'Life',
]

const DEFAULT_SETTINGS_COMPANIES = [
  { carrier: 'Intact Insurance', defaultComm: 15.5, brokerSplit: 82, houseSplit: 18, prefix: 'INT' },
  { carrier: 'Travelers Insurance', defaultComm: 15.0, brokerSplit: 80, houseSplit: 20, prefix: 'TRV' },
  { carrier: 'The Hartford', defaultComm: 14.5, brokerSplit: 80, houseSplit: 20, prefix: 'HTF' },
  { carrier: 'Liberty Mutual', defaultComm: 15.0, brokerSplit: 85, houseSplit: 15, prefix: 'LBM' },
  { carrier: 'Progressive Commercial', defaultComm: 12.5, brokerSplit: 75, houseSplit: 25, prefix: 'PRG' },
  { carrier: 'Chubb Commercial', defaultComm: 16.0, brokerSplit: 85, houseSplit: 15, prefix: 'CHB' },
  { carrier: 'Nationwide Mutual', defaultComm: 14.0, brokerSplit: 80, houseSplit: 20, prefix: 'NWM' },
  { carrier: 'Aviva Canada', defaultComm: 14.0, brokerSplit: 80, houseSplit: 20, prefix: 'AVV' },
  { carrier: 'Wawanesa Mutual Insurance', defaultComm: 13.5, brokerSplit: 78, houseSplit: 22, prefix: 'WAW' },
  { carrier: 'Economical / Definity Insurance', defaultComm: 14.5, brokerSplit: 80, houseSplit: 20, prefix: 'DEF' },
  { carrier: 'Northbridge Financial', defaultComm: 14.5, brokerSplit: 80, houseSplit: 20, prefix: 'NBF' },
  { carrier: 'Desjardins Insurance', defaultComm: 13.0, brokerSplit: 75, houseSplit: 25, prefix: 'DES' },
]

export interface BulkImportItem {
  clientType: 'Individual' | 'Commercial'
  businessName: string
  firstName: string
  lastName: string
  phone: string
  email: string
  city: string
  province: string
  street: string
  postalCode: string
  insurerName: string
  linesOfBusiness: string[]
  policyNumber: string
  yearlyPremium: string
  status?: string
  paymentStatus?: 'Paid' | 'Unpaid'
}

const SAMPLE_BULK_IMPORT_CLIENTS: BulkImportItem[] = [
  {
    clientType: 'Commercial',
    businessName: 'Apex Precision Logistics Inc.',
    firstName: 'David',
    lastName: 'Sterling',
    phone: '+1 (416) 555-0182',
    email: 'dsterling@apexlogistics.ca',
    street: '450 University Ave, Suite 900',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5G 1V6',
    insurerName: 'Travelers Insurance',
    linesOfBusiness: ['Commercial Auto', 'General Liability'],
    policyNumber: 'POL-TRV-88219',
    yearlyPremium: '$8,450',
    status: 'Active / Submitted',
    paymentStatus: 'Paid',
  },
  {
    clientType: 'Commercial',
    businessName: 'Highland Hospitality Group',
    firstName: 'Elena',
    lastName: 'Rostova',
    phone: '+1 (604) 555-0144',
    email: 'erostova@highlandgroup.ca',
    street: '1055 Canada Place, Suite 300',
    city: 'Vancouver',
    province: 'BC',
    postalCode: 'V6C 0C3',
    insurerName: 'Chubb Commercial',
    linesOfBusiness: ['Commercial Property', 'General Liability'],
    policyNumber: 'POL-CHB-44120',
    yearlyPremium: '$12,800',
    status: 'Active / Submitted',
  },
  {
    clientType: 'Individual',
    businessName: '—',
    firstName: 'Jonathan',
    lastName: 'Patel',
    phone: '+1 (403) 555-0199',
    email: 'jpatel@cloudmail.com',
    street: '720 4th Ave SW',
    city: 'Calgary',
    province: 'AB',
    postalCode: 'T2P 3N4',
    insurerName: 'The Hartford',
    linesOfBusiness: ['Home', 'Auto'],
    policyNumber: 'POL-HTF-77312',
    yearlyPremium: '$3,150',
    status: 'Active / Submitted',
  },
  {
    clientType: 'Commercial',
    businessName: 'Nexar Robotics & Automation',
    firstName: 'Chloe',
    lastName: 'Dupont',
    phone: '+1 (514) 555-0128',
    email: 'cdupont@nexarobotics.ca',
    street: '1250 Boulevard René-Lévesque Ouest',
    city: 'Montreal',
    province: 'QC',
    postalCode: 'H3B 4W8',
    insurerName: 'Liberty Mutual',
    linesOfBusiness: ['Cyber Liability', 'Professional Liability'],
    policyNumber: 'POL-LBM-99341',
    yearlyPremium: '$6,900',
    status: 'Active / Submitted',
  },
  {
    clientType: 'Individual',
    businessName: '—',
    firstName: 'Sarah',
    lastName: 'Tremblay',
    phone: '+1 (613) 555-0163',
    email: 'stremblay@quebecmail.ca',
    street: '150 Elgin Street, Suite 800',
    city: 'Ottawa',
    province: 'ON',
    postalCode: 'K2P 1L4',
    insurerName: 'Progressive Commercial',
    linesOfBusiness: ['Auto'],
    policyNumber: 'POL-PRG-66201',
    yearlyPremium: '$2,200',
    status: 'Active / Submitted',
  },
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

function AddClientFormContent() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
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
    linesOfBusiness: ['Auto'] as string[],
    insurerName: 'Travelers Insurance',
    policyNumber: 'POL-PENDING',
    isPendingPolicyNumber: true,
    effectiveDate: today,
    expirationDate: getExpiryFromEffective(today),
    yearlyPremium: '',
    commissionRate: 15.0,
    brokerSplit: 80,
    consentStatus: 'Granted' as 'Granted' | 'Pending' | 'Declined',
    consentChannels: ['Email', 'Phone', 'SMS'] as string[],
    consentNotes: 'Intake consent confirmed verbally / on client form.',
    paymentStatus: 'Paid' as 'Paid' | 'Unpaid',
    notes: '',
  })

  // Workflow preference: Default policy number to pending (syncs with Settings tab)
  const [defaultPolicyPending, setDefaultPolicyPending] = useState<boolean>(true)

  // Company Combobox & Pre-selection from Settings
  const [configuredCompanies, setConfiguredCompanies] = useState<{
    carrier: string
    defaultComm: number
    brokerSplit: number
    houseSplit: number
    prefix?: string
  }[]>(DEFAULT_SETTINGS_COMPANIES)
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false)
  const [companySearchQuery, setCompanySearchQuery] = useState('')
  const [isCustomCompanyMode, setIsCustomCompanyMode] = useState(false)
  const companyDropdownRef = useRef<HTMLDivElement>(null)
  const companyInputRef = useRef<HTMLInputElement>(null)

  // Automatically align commission rate and broker split from Settings for the selected company
  const applyCarrierSettings = (carrierName: string) => {
    const trimmed = carrierName.trim()
    if (!trimmed) {
      setForm((prev) => ({ ...prev, insurerName: '' }))
      return
    }

    const match = configuredCompanies.find(
      (c) =>
        c.carrier.toLowerCase() === trimmed.toLowerCase() ||
        c.carrier.toLowerCase().includes(trimmed.toLowerCase()) ||
        trimmed.toLowerCase().includes(c.carrier.toLowerCase())
    )

    if (match) {
      setForm((prev) => ({
        ...prev,
        insurerName: match.carrier,
        commissionRate: match.defaultComm,
        brokerSplit: match.brokerSplit,
      }))
    } else {
      setForm((prev) => ({ ...prev, insurerName: trimmed }))
    }
  }

  // Bulk Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFileName, setImportFileName] = useState('')
  const [importFileSize, setImportFileSize] = useState('')
  const [importFormat, setImportFormat] = useState<'excel' | 'pdf' | 'csv' | null>(null)
  const [parsedImportRows, setParsedImportRows] = useState<BulkImportItem[]>([])
  const [isImportProcessing, setIsImportProcessing] = useState(false)
  const [isImportSuccess, setIsImportSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Address search & notification states
  const [addressSearchQuery, setAddressSearchQuery] = useState('')
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Draft Management State & Parameters
  const searchParams = useSearchParams()
  const draftIdParam = searchParams.get('draftId')
  const [resumedDraftId, setResumedDraftId] = useState<string | null>(null)
  const [resumedDraftName, setResumedDraftName] = useState<string>('')
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false)
  const [allDrafts, setAllDrafts] = useState<ClientItem[]>([])
  const [draftSearchQuery, setDraftSearchQuery] = useState('')

  // Read all drafts from localStorage + initialClients
  const refreshDrafts = () => {
    try {
      const stored = localStorage.getItem('broker_custom_clients')
      const customList: ClientItem[] = stored ? JSON.parse(stored) : []
      const customDrafts = customList.filter(
        (c) => c.status === 'Draft' || c.status === 'Draft / Incomplete'
      )
      const sampleDrafts = initialClients.filter(
        (c) => c.status === 'Draft' || c.status === 'Draft / Incomplete'
      )
      const draftMap = new Map<string, ClientItem>()
      customDrafts.forEach((d) => draftMap.set(d.id, d))
      sampleDrafts.forEach((d) => {
        if (!draftMap.has(d.id)) {
          draftMap.set(d.id, d)
        }
      })
      setAllDrafts(Array.from(draftMap.values()))
    } catch (e) {
      console.error(e)
    }
  }

  // Populate the form from a chosen draft
  const loadDraftIntoForm = (draft: ClientItem) => {
    setResumedDraftId(draft.id)
    setResumedDraftName(draft.name)
    const primaryPol = draft.policies?.[0]
    setForm({
      firstName: draft.firstName && draft.firstName !== 'Draft' && draft.firstName !== 'Client' ? draft.firstName : '',
      lastName: draft.lastName || '',
      businessName: draft.businessName === '—' ? '' : draft.businessName || '',
      clientType: (draft.clientType as any) || (draft.businessName && draft.businessName !== '—' ? 'Commercial' : 'Individual'),
      dob: draft.dob === '—' ? '' : draft.dob || '',
      phone: draft.phone && !draft.phone.includes('Pending') ? draft.phone : '',
      email: draft.email && !draft.email.includes('Pending') ? draft.email : '',
      street: draft.street && draft.street !== '—' ? draft.street : '',
      city: draft.city || '',
      province: draft.province || draft.state || 'ON',
      postalCode: draft.postalCode && draft.postalCode !== '—' ? draft.postalCode : '',
      status: 'Active / Submitted',
      linesOfBusiness: draft.linesOfBusiness && draft.linesOfBusiness.length > 0
        ? draft.linesOfBusiness
        : primaryPol?.type ? [primaryPol.type] : ['Auto'],
      insurerName: draft.insurerName || primaryPol?.carrier || 'Travelers Insurance',
      policyNumber: primaryPol?.policyNumber || (defaultPolicyPending ? 'POL-PENDING' : ''),
      isPendingPolicyNumber: primaryPol?.policyNumberPending ?? defaultPolicyPending,
      effectiveDate: primaryPol?.effectiveDate || today,
      expirationDate: primaryPol?.expirationDate || getExpiryFromEffective(today),
      yearlyPremium: (draft.yearlyPremium || primaryPol?.premium || '').replace(/[^0-9.]/g, ''),
      commissionRate: 15.0,
      brokerSplit: 80,
      consentStatus: (draft.marketingConsent?.status as any) || 'Granted',
      consentChannels: draft.marketingConsent?.channels || ['Email', 'Phone'],
      consentNotes: draft.marketingConsent?.notes || 'Intake consent confirmed verbally / on client form.',
      paymentStatus: (draft.paymentStatus as 'Paid' | 'Unpaid') || 'Unpaid',
      notes: draft.notes?.[0]?.text || '',
    })

    if (draft.street && draft.street !== '—') {
      setAddressSearchQuery(`${draft.street}, ${draft.city || ''}`)
    }
    setSuccessBanner(
      `Resumed draft for "${draft.name}" (${draft.id}). You can finish the incomplete/half info and click "Save Client & View in My Book" to finalize.`
    )
    setIsDraftsModalOpen(false)
  }

  // Save partial info as a draft without blocking on mandatory fields
  const handleSaveDraft = () => {
    const personName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()
    const draftName = form.clientType === 'Commercial'
      ? form.businessName.trim() || personName || 'Incomplete Commercial Draft'
      : personName || form.businessName.trim() || 'Incomplete Individual Draft'

    const missing: string[] = []
    if (form.clientType === 'Commercial' && !form.businessName.trim()) missing.push('Business Name')
    if (form.clientType === 'Individual' && (!form.firstName.trim() || !form.lastName.trim())) missing.push('Contact Name')
    if (!form.email.trim()) missing.push('Email')
    if (!form.phone.trim()) missing.push('Phone')
    if (!form.street.trim()) missing.push('Address')
    if (!form.yearlyPremium.trim()) missing.push('Premium')
    if (form.isPendingPolicyNumber) missing.push('Policy #')

    const completeness = Math.max(25, 100 - missing.length * 15)
    const draftId = resumedDraftId || `CL-DRAFT-${Math.floor(100 + Math.random() * 900)}`

    const draftClient: ClientItem = {
      id: draftId,
      firstName: form.firstName.trim() || (form.clientType === 'Commercial' ? form.businessName.trim() : 'Draft'),
      lastName: form.lastName.trim() || '',
      name: draftName,
      businessName: form.businessName.trim() || (form.clientType === 'Commercial' ? draftName : '—'),
      clientType: form.clientType,
      clientSince: 'Today (Draft)',
      dob: form.dob || '—',
      phone: form.phone.trim() || '— (Pending phone)',
      email: form.email.trim() || '— (Pending email)',
      street: form.street.trim() || '—',
      city: form.city.trim() || 'Toronto',
      state: form.province,
      province: form.province,
      zip: form.postalCode.trim() || '—',
      postalCode: form.postalCode.trim() || '—',
      brokerCode: 'BRK-8821',
      otherIdentifier: `DRAFT-${completeness}%`,
      status: 'Draft',
      paymentStatus: 'Unpaid',
      linesOfBusiness: form.linesOfBusiness,
      yearlyPremium: form.yearlyPremium ? `$${form.yearlyPremium}` : '— (Pending quote)',
      insurerName: form.insurerName || 'Travelers Insurance',
      marketingConsent: {
        status: form.consentStatus === 'Granted' ? 'Pending' : form.consentStatus,
        channels: form.consentChannels,
        consentDate: today,
        method: 'Draft Intake',
        notes: form.consentNotes || 'Incomplete draft intake.',
      },
      notes: form.notes.trim()
        ? [
          {
            id: `note-${Date.now()}`,
            date: 'Today',
            author: 'Broker Intake',
            text: form.notes.trim(),
          },
        ]
        : [
          {
            id: `note-${Date.now()}`,
            date: 'Today',
            author: 'Broker Intake',
            text: `Draft saved with ${missing.length > 0 ? `pending: ${missing.join(', ')}` : 'half info'}.`,
          },
        ],
      lastActivity: {
        description: `Saved in Drafts (${completeness}% complete${missing.length > 0 ? ` - pending ${missing.slice(0, 2).join(', ')}` : ''})`,
        time: 'Just now',
      },
      policies: [
        {
          id: `pol-${Date.now()}`,
          policyNumber: form.isPendingPolicyNumber ? 'DRAFT-PENDING' : form.policyNumber || 'DRAFT-PENDING',
          type: form.linesOfBusiness[0] || 'Auto',
          carrier: form.insurerName || 'Travelers Insurance',
          premium: form.yearlyPremium ? `$${form.yearlyPremium}` : 'Pending binding',
          effectiveDate: form.effectiveDate,
          expirationDate: form.expirationDate,
          status: 'Active',
          policyNumberPending: true,
          policyNumberSubtext: 'Draft intake - policy not yet bound',
          rateSplit: `${form.commissionRate}% / ${form.brokerSplit}%`,
          expectedCommission: 'Pending',
          commissionStatus: 'Pending',
        },
      ],
      commissions: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'Draft Intake Saved',
          type: 'system',
          date: 'Today',
          detail: `Record saved to Draft list (${completeness}% complete).`,
          actor: 'Broker Intake',
        },
      ],
    }

    try {
      const existing = localStorage.getItem('broker_custom_clients')
      const currentList: ClientItem[] = existing ? JSON.parse(existing) : []
      const filtered = currentList.filter((c) => c.id !== draftId)
      localStorage.setItem('broker_custom_clients', JSON.stringify([draftClient, ...filtered]))
    } catch (err) {
      console.error(err)
    }

    setResumedDraftId(draftId)
    setResumedDraftName(draftName)
    refreshDrafts()
    setSuccessBanner(
      `Draft "${draftName}" (${draftId}) saved successfully! You can resume it anytime from My Book > Drafts or the Drafts button above.`
    )
  }

  // Delete draft
  const handleDeleteDraft = (draftId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm('Are you sure you want to delete this draft?')) return
    try {
      const existing = localStorage.getItem('broker_custom_clients')
      const currentList: ClientItem[] = existing ? JSON.parse(existing) : []
      const filtered = currentList.filter((c) => c.id !== draftId)
      localStorage.setItem('broker_custom_clients', JSON.stringify(filtered))
      setAllDrafts((prev) => prev.filter((d) => d.id !== draftId))
      if (resumedDraftId === draftId) {
        setResumedDraftId(null)
        setResumedDraftName('')
      }
      refreshDrafts()
    } catch (err) {
      console.error(err)
    }
  }

  // On mount: load drafts and auto-load draft if draftId is in URL
  useEffect(() => {
    refreshDrafts()
  }, [])

  useEffect(() => {
    if (draftIdParam && allDrafts.length > 0) {
      const target = allDrafts.find((d) => d.id === draftIdParam)
      if (target && resumedDraftId !== draftIdParam) {
        loadDraftIntoForm(target)
      }
    }
  }, [draftIdParam, allDrafts])

  // Sync workflow default setting for policy pending from Settings tab (localStorage)
  useEffect(() => {
    try {
      const storedPending = localStorage.getItem('broker_setting_default_policy_pending')
      const isPending = storedPending === null ? true : storedPending === 'true'
      setDefaultPolicyPending(isPending)
      setForm((prev) => ({
        ...prev,
        isPendingPolicyNumber: isPending,
        policyNumber: isPending ? 'POL-PENDING' : '',
      }))
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Sync pre-selected companies from Settings tab (localStorage)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('broker_settings_carriers')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed.map((item: any) => ({
            carrier: typeof item === 'string' ? item : item.carrier,
            defaultComm: item.defaultComm !== undefined ? item.defaultComm : 15.0,
            brokerSplit: item.brokerSplit !== undefined ? item.brokerSplit : 80,
            houseSplit: item.houseSplit !== undefined ? item.houseSplit : 20,
            prefix: item.policyPrefix || '',
          }))
          // Merge with unique default market carriers
          const names = new Set(list.map((c: any) => c.carrier.toLowerCase()))
          DEFAULT_SETTINGS_COMPANIES.forEach((def) => {
            if (!names.has(def.carrier.toLowerCase())) {
              list.push(def)
            }
          })
          setConfiguredCompanies(list)
          return
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Auto-align initial commission rate & broker split from settings for default selected company
  useEffect(() => {
    if (form.insurerName && configuredCompanies.length > 0) {
      const match = configuredCompanies.find(
        (c) =>
          c.carrier.toLowerCase() === form.insurerName.toLowerCase() ||
          c.carrier.toLowerCase().includes(form.insurerName.toLowerCase()) ||
          form.insurerName.toLowerCase().includes(c.carrier.toLowerCase())
      )
      if (match) {
        setForm((prev) => ({
          ...prev,
          commissionRate: match.defaultComm,
          brokerSplit: match.brokerSplit,
        }))
      }
    }
  }, [configuredCompanies])

  // Close company dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target as Node)) {
        setIsCompanyDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Download Sample CSV Template
  const handleDownloadSampleTemplate = () => {
    const csvContent =
      'Client Classification,Business Name,Contact First Name,Contact Last Name,Phone,Email,Street Address,City,Province,Postal Code,Insurance Company,Line of Business,Policy Number,Annual Premium\n' +
      'Commercial,Apex Precision Logistics Inc.,David,Sterling,+1 (416) 555-0182,dsterling@apexlogistics.ca,450 University Ave,Toronto,ON,M5G 1V6,Travelers Insurance,Commercial Auto,POL-TRV-88219,8450\n' +
      'Commercial,Highland Hospitality Group,Elena,Rostova,+1 (604) 555-0144,erostova@highlandgroup.ca,1055 Canada Place,Vancouver,BC,V6C 0C3,Chubb Commercial,Commercial Property,POL-CHB-44120,12800\n' +
      'Individual,,Jonathan,Patel,+1 (403) 555-0199,jpatel@cloudmail.com,720 4th Ave SW,Calgary,AB,T2P 3N4,The Hartford,Home,POL-HTF-77312,3150\n' +
      'Individual,,Sarah,Tremblay,+1 (613) 555-0163,stremblay@quebecmail.ca,150 Elgin St,Ottawa,ON,K2P 1L4,Progressive Commercial,Auto,POL-PRG-66201,2200\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'broker_bulk_clients_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle file selection from disk (Excel, PDF, CSV)
  const handleFileSelect = (file: File) => {
    if (!file) return
    const name = file.name.toLowerCase()
    let format: 'excel' | 'pdf' | 'csv' = 'csv'
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      format = 'excel'
    } else if (name.endsWith('.pdf')) {
      format = 'pdf'
    }

    setImportFileName(file.name)
    setImportFileSize(`${(file.size / 1024).toFixed(1)} KB`)
    setImportFormat(format)
    setIsImportProcessing(true)

    if (name.endsWith('.csv') || name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
          if (lines.length > 1) {
            // Parse CSV lines
            const parsed: BulkImportItem[] = []
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
              if (cols.length >= 4) {
                const cType = cols[0]?.toLowerCase().includes('comm') ? 'Commercial' : 'Individual'
                parsed.push({
                  clientType: cType,
                  businessName: cols[1] || (cType === 'Commercial' ? 'Imported Enterprise' : '—'),
                  firstName: cols[2] || 'Client',
                  lastName: cols[3] || '',
                  phone: cols[4] || '+1 (416) 555-0100',
                  email: cols[5] || 'client@imported.ca',
                  street: cols[6] || '100 King St W',
                  city: cols[7] || 'Toronto',
                  province: cols[8] || 'ON',
                  postalCode: cols[9] || 'M5X 1C9',
                  insurerName: cols[10] || 'Travelers Insurance',
                  linesOfBusiness: [cols[11] || (cType === 'Commercial' ? 'Commercial Auto' : 'Auto')],
                  policyNumber: cols[12] || `POL-${Math.floor(10000 + Math.random() * 90000)}`,
                  yearlyPremium: cols[13] ? (cols[13].startsWith('$') ? cols[13] : `$${cols[13]}`) : '$2,850',
                  status: 'Active / Submitted',
                })
              }
            }
            setParsedImportRows(parsed.length > 0 ? parsed : SAMPLE_BULK_IMPORT_CLIENTS)
          } else {
            setParsedImportRows(SAMPLE_BULK_IMPORT_CLIENTS)
          }
        } catch (err) {
          console.error(err)
          setParsedImportRows(SAMPLE_BULK_IMPORT_CLIENTS)
        }
        setIsImportProcessing(false)
      }
      reader.readAsText(file)
    } else {
      // Excel or PDF simulation with smart extraction
      setTimeout(() => {
        setParsedImportRows(SAMPLE_BULK_IMPORT_CLIENTS)
        setIsImportProcessing(false)
      }, 700)
    }
  }

  // Load sample batch directly
  const handleLoadSampleBatch = () => {
    setImportFileName('Client_Portfolio_Batch_2026.xlsx')
    setImportFileSize('142.6 KB')
    setImportFormat('excel')
    setIsImportProcessing(true)
    setTimeout(() => {
      setParsedImportRows(SAMPLE_BULK_IMPORT_CLIENTS)
      setIsImportProcessing(false)
    }, 450)
  }

  // Execute bulk import and save to My Book
  const handleExecuteBulkImport = () => {
    if (parsedImportRows.length === 0) return
    setIsImportProcessing(true)

    const newClients: ClientItem[] = parsedImportRows.map((row, idx) => {
      const newId = `CL-${Math.floor(3000 + Math.random() * 6900)}`
      const personFullName = `${row.firstName.trim()} ${row.lastName.trim()}`.trim()
      const fullName =
        row.clientType === 'Commercial'
          ? row.businessName.trim() || personFullName || 'Commercial Client'
          : personFullName || row.businessName.trim() || 'Client'
      const polNum = row.policyNumber.trim() || `POL-${Math.floor(10000 + Math.random() * 90000)}`
      const lobs = row.linesOfBusiness.length > 0 ? row.linesOfBusiness : ['Commercial']

      return {
        id: newId,
        firstName: row.firstName.trim() || (row.clientType === 'Commercial' ? row.businessName.trim() : 'Client'),
        lastName: row.lastName.trim() || '',
        name: fullName,
        businessName: row.businessName.trim() || (row.clientType === 'Commercial' ? fullName : '—'),
        clientType: row.clientType,
        clientSince: 'Today',
        dob: '1988-04-12',
        phone: row.phone.trim() || '+1 (416) 555-0100',
        email:
          row.email.trim() ||
          (personFullName
            ? `${row.firstName.toLowerCase().replace(/\s+/g, '')}.${row.lastName.toLowerCase().replace(/\s+/g, '') || 'client'}@client.com`
            : `${row.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'info'}@business.com`),
        street: row.street.trim() || '100 King Street West',
        city: row.city.trim() || 'Toronto',
        state: row.province || 'ON',
        province: row.province || 'ON',
        zip: row.postalCode.trim() || 'M5X 1C9',
        postalCode: row.postalCode.trim() || 'M5X 1C9',
        brokerCode: 'BRK-8821',
        otherIdentifier: `ID-${Math.floor(10000 + Math.random() * 90000)}`,
        status: (row.status as any) || 'Active / Submitted',
        linesOfBusiness: lobs,
        yearlyPremium: row.yearlyPremium || '$3,200',
        paymentStatus: row.paymentStatus || 'Paid',
        insurerName: row.insurerName || 'Travelers Insurance',
        marketingConsent: {
          status: 'Granted',
          channels: ['Email', 'Phone', 'SMS'],
          consentDate: today,
          method: 'Bulk Document Import',
          notes: `Imported via bulk batch file: ${importFileName || 'Document'}`,
        },
        notes: [
          {
            id: `note-${Date.now()}-${idx}`,
            date: 'Today',
            author: 'System (Bulk Import)',
            text: `Record imported in bulk from document ${importFileName || 'batch upload'}.`,
          },
        ],
        lastActivity: {
          description: `Bulk imported from ${importFileName || 'file'}`,
          time: 'Just now',
        },
        policies: [
          {
            id: `pol-${Date.now()}-${idx}`,
            policyNumber: polNum,
            type: lobs[0] || 'Commercial Auto',
            carrier: row.insurerName || 'Travelers Insurance',
            effectiveDate: today,
            expirationDate: getExpiryFromEffective(today),
            premium: row.yearlyPremium || '$3,200',
            status: 'Active',
          },
        ],
        commissions: [],
        timeline: [
          {
            id: `tl-${Date.now()}-${idx}`,
            title: 'Bulk Data Import',
            type: 'system',
            date: 'Today',
            detail: `Client profile created via bulk upload (${importFileName || 'document'}).`,
            actor: 'Bulk Importer',
          },
        ],
        documents: [],
        claims: [],
        auditTrail: [
          {
            id: `audit-${Date.now()}-${idx}`,
            action: 'Bulk Data Import',
            date: 'Today',
            detail: `Bulk entry processed into My Book from ${importFileName || 'document'}.`,
            actor: 'Bulk Importer',
          },
        ],
      }
    })

    try {
      const existing = localStorage.getItem('broker_custom_clients')
      const currentList: ClientItem[] = existing ? JSON.parse(existing) : []
      localStorage.setItem('broker_custom_clients', JSON.stringify([...newClients, ...currentList]))
    } catch (err) {
      console.error(err)
    }

    setIsImportProcessing(false)
    setIsImportSuccess(true)

    setTimeout(() => {
      setIsImportModalOpen(false)
      setIsImportSuccess(false)
      setParsedImportRows([])
      router.push('/broker/book-of-business')
    }, 1200)
  }

  const handleSelectAddress = (item: (typeof SAMPLE_CANADIAN_ADDRESSES)[0]) => {
    setForm((prev) => ({
      ...prev,
      street: item.street,
      city: item.city,
      province: item.province,
      postalCode: item.postalCode,
    }))
    setAddressSearchQuery('')
    setIsAddressDropdownOpen(false)
  }

  const handleEffectiveDateChange = (dateVal: string) => {
    setForm((prev) => ({
      ...prev,
      effectiveDate: dateVal,
      expirationDate: getExpiryFromEffective(dateVal),
    }))
  }

  const handleToggleChannel = (channel: string) => {
    setForm((prev) => {
      const exists = prev.consentChannels.includes(channel)
      return {
        ...prev,
        consentChannels: exists
          ? prev.consentChannels.filter((c) => c !== channel)
          : [...prev.consentChannels, channel],
      }
    })
  }

  const handleSave = (e: React.FormEvent, andAddAnother = false) => {
    e.preventDefault()

    // Validation based on Client Classification
    if (form.clientType === 'Individual') {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        alert('Please enter both First Name and Last Name for an Individual Policyholder.')
        return
      }
    } else {
      // Commercial: Business Name is required, First & Last Name are optional
      if (!form.businessName.trim() && !form.firstName.trim()) {
        alert('Please enter a Business / Company Name for Commercial / Business client.')
        return
      }
    }

    setIsSubmitting(true)

    const newId = `CL-${Math.floor(1000 + Math.random() * 9000)}`
    const personFullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()
    const fullName = form.clientType === 'Commercial'
      ? form.businessName.trim() || personFullName || 'Commercial Client'
      : personFullName || form.businessName.trim() || 'Client'
    const polNum = form.isPendingPolicyNumber
      ? 'POL-PENDING'
      : form.policyNumber.trim() || `POL-${Math.floor(10000 + Math.random() * 90000)}`

    const newClient: ClientItem = {
      id: newId,
      firstName: form.firstName.trim() || (form.clientType === 'Commercial' ? form.businessName.trim() : 'Client'),
      lastName: form.lastName.trim() || '',
      name: fullName,
      businessName: form.businessName.trim() || (form.clientType === 'Commercial' ? fullName : '—'),
      clientType: form.clientType,
      clientSince: 'Today',
      dob: form.dob || '—',
      phone: form.phone.trim() || '+1 (416) 555-0100',
      email: form.email.trim() || (personFullName
        ? `${form.firstName.toLowerCase().replace(/\s+/g, '')}.${form.lastName.toLowerCase().replace(/\s+/g, '') || 'client'}@client.com`
        : `${form.businessName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'info'}@business.com`),
      street: form.street.trim() || '100 King Street West',
      city: form.city.trim() || 'Toronto',
      state: form.province,
      province: form.province,
      zip: form.postalCode.trim() || 'M5X 1C9',
      postalCode: form.postalCode.trim() || 'M5X 1C9',
      brokerCode: 'BRK-8821',
      otherIdentifier: `ID-${Math.floor(10000 + Math.random() * 90000)}`,
      status: form.status,
      linesOfBusiness: form.linesOfBusiness,
      yearlyPremium: form.yearlyPremium ? `$${form.yearlyPremium}` : '$2,450',
      paymentStatus: form.paymentStatus || 'Paid',
      insurerName: form.insurerName,
      marketingConsent: {
        status: form.consentStatus,
        channels: form.consentChannels,
        consentDate: today,
        method: 'Client Intake Form',
        notes: form.consentNotes,
      },
      notes: form.notes.trim()
        ? [
          {
            id: `note-${Date.now()}`,
            date: 'Today',
            author: 'You (Broker)',
            text: form.notes.trim(),
          },
        ]
        : [],
      lastActivity: {
        description: 'Client profile registered via intake form',
        time: 'Just now',
      },
      policies: [
        {
          id: `pol-${Date.now()}`,
          policyNumber: polNum,
          type: form.linesOfBusiness[0] || 'Auto',
          carrier: form.insurerName,
          premium: form.yearlyPremium ? `$${form.yearlyPremium}` : '$2,450',
          effectiveDate: form.effectiveDate,
          expirationDate: form.expirationDate,
          status: 'Active',
          policyNumberPending: form.isPendingPolicyNumber,
          policyNumberSubtext: form.isPendingPolicyNumber ? 'Pending issuance from insurer' : undefined,
          rateSplit: `${form.commissionRate}% / ${form.brokerSplit}%`,
          expectedCommission: `$${Math.round(
            (parseFloat(form.yearlyPremium || '2450') * (form.commissionRate / 100) * (form.brokerSplit / 100)) || 294
          )}`,
          commissionStatus: 'Pending',
        },
      ],
      commissions: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'Client Intake Form Submitted',
          type: 'system',
          date: 'Today',
          detail: `Initial record created with ${form.insurerName} coverage.`,
          actor: 'Broker Intake',
        },
      ],
    }

    try {
      const existing = localStorage.getItem('broker_custom_clients')
      const currentList: ClientItem[] = existing ? JSON.parse(existing) : []
      const cleaned = resumedDraftId ? currentList.filter(c => c.id !== resumedDraftId) : currentList
      localStorage.setItem('broker_custom_clients', JSON.stringify([newClient, ...cleaned]))
      setResumedDraftId(null)
      setResumedDraftName('')
      refreshDrafts()
    } catch (err) {
      console.error(err)
    }

    setIsSubmitting(false)

    if (andAddAnother) {
      setSuccessBanner(`Client "${fullName}" (${newId}) was saved successfully! You can add another client below.`)
      setForm({
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
        linesOfBusiness: ['Auto'],
        insurerName: 'Travelers Insurance',
        policyNumber: defaultPolicyPending ? 'POL-PENDING' : '',
        isPendingPolicyNumber: defaultPolicyPending,
        effectiveDate: today,
        expirationDate: getExpiryFromEffective(today),
        yearlyPremium: '',
        commissionRate: 15.0,
        brokerSplit: 80,
        consentStatus: 'Granted',
        consentChannels: ['Email', 'Phone', 'SMS'],
        consentNotes: 'Intake consent confirmed verbally / on client form.',
        paymentStatus: 'Paid',
        notes: '',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push(`/broker/book-of-business?view=details&id=${newId}`)
    }
  }

  return (
    <div className="p-4 sm:p-7 max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <Link
          href="/broker/book-of-business"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#0170FE] transition cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to My Book</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium">Broker Intake · New Client Setup</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#0170FE]/10 text-[#0170FE] shadow-xs">
            <UserPlus className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Add New Client
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Complete client identity, contact information, primary policy coverage, <br />and compliance setup.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Drafts List Drawer Button */}
          <button
            type="button"
            onClick={() => {
              refreshDrafts()
              setIsDraftsModalOpen(true)
            }}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/90 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition"
            title="View saved drafts with pending or half info"
          >
            <FolderClock className="size-4 text-amber-600" />
            <span>Drafts</span>
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-950">
              {allDrafts.length}
            </span>
          </button>

          {/* 1-Click Save as Draft Button */}


          <button
            type="button"
            onClick={() => {
              setIsImportModalOpen(true)
              if (parsedImportRows.length === 0) {
                // Preload sample batch for fast demonstration
                handleLoadSampleBatch()
              }
            }}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#0170FE] shadow-2xs hover:bg-blue-100/70 transition"
            title="Import bulk entries from PDF, Excel, or CSV"
          >
            <UploadCloud className="size-4" />
            <span>Import Bulk Data</span>
            <span className="hidden md:inline-flex text-[10px] font-bold bg-[#0170FE] text-white px-1.5 py-0.5 rounded">PDF / Excel / CSV</span>
          </button>

          <Link
            href="/broker/book-of-business"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSave(e, false)}
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0170FE] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db] disabled:opacity-50"
          >
            <Check className="size-4" />
            <span>{resumedDraftId ? 'Finalize Client' : 'Save Client'}</span>
          </button>
        </div>
      </div>

      {/* Resumed Draft Mode Active Banner */}
      {resumedDraftId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/40 to-white p-4 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <FileEdit className="size-4.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-md">
                  Resumed Draft Mode
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {resumedDraftId}</span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                Currently editing draft <strong className="font-semibold text-slate-900">&ldquo;{resumedDraftName}&rdquo;</strong>. Finish the pending/half details and click <strong className="text-blue-700 font-semibold">Finalize Client</strong> to move it to Active in My Book.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setResumedDraftId(null)
              setResumedDraftName('')
              setSuccessBanner('Draft mode cleared. Now creating a fresh new client entry.')
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            Clear Draft / Start Fresh
          </button>
        </div>
      )}

      {/* Quick Bulk Import Callout Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0170FE] text-white shadow-sm">
            <FileSpreadsheet className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Need to upload bulk entries?</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#0170FE] px-2 py-0.5 rounded-full">
                Bulk Onboarding
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Import multiple client records in one go from PDF policy schedules, Excel (.xlsx, .xls), or CSV spreadsheets directly into My Book.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsImportModalOpen(true)
              if (parsedImportRows.length === 0) {
                handleLoadSampleBatch()
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0170FE] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0060db] transition cursor-pointer"
          >
            <UploadCloud className="size-4" />
            <span>Upload Document</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSampleTemplate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            title="Download CSV / Excel Sample Template"
          >
            <Download className="size-3.5 text-slate-500" />
            <span className="hidden sm:inline">Sample Template</span>
          </button>
        </div>
      </div>

      {/* Success Banner if adding multiple */}
      {successBanner && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs sm:text-sm text-emerald-800 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Main Intake Form */}
      <form onSubmit={(e) => handleSave(e, false)} className="space-y-6">
        {/* SECTION 1: Client Identity */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#0170FE]">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900">Client Identity</h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">* Required fields</span>
          </div>

          {/* Row 1: Client Classification & Business / Company Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Classification <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.clientType}
                onChange={(e) => setForm({ ...form, clientType: e.target.value as any })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 font-medium outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              >
                <option value="Individual">Individual Policyholder</option>
                <option value="Commercial">Commercial / Business</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business / Company Name{' '}
                {form.clientType === 'Commercial' ? (
                  <span className="text-rose-500">*</span>
                ) : (
                  <span className="text-slate-400 font-normal">(optional)</span>
                )}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  required={form.clientType === 'Commercial'}
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder={form.clientType === 'Commercial' ? 'e.g. Vance Logistics LLC (Required for Commercial)' : 'e.g. Vance Logistics LLC'}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>
          </div>

          {/* Row 2: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {form.clientType === 'Commercial' ? 'Contact Person First Name' : 'First Name'}{' '}
                {form.clientType === 'Individual' ? (
                  <span className="text-rose-500">*</span>
                ) : (
                  <span className="text-slate-400 font-normal">(optional)</span>
                )}
              </label>
              <input
                type="text"
                required={form.clientType === 'Individual'}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder={form.clientType === 'Commercial' ? 'e.g. Marcus (optional)' : 'e.g. Marcus'}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {form.clientType === 'Commercial' ? 'Contact Person Last Name' : 'Last Name'}{' '}
                {form.clientType === 'Individual' ? (
                  <span className="text-rose-500">*</span>
                ) : (
                  <span className="text-slate-400 font-normal">(optional)</span>
                )}
              </label>
              <input
                type="text"
                required={form.clientType === 'Individual'}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder={form.clientType === 'Commercial' ? 'e.g. Vance (optional)' : 'e.g. Vance'}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>
          </div>

          {/* Helper alert when Commercial is selected */}
          {form.clientType === 'Commercial' && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900 flex items-start gap-2.5">
              <Building2 className="size-4 text-[#0170FE] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-950">Commercial / Business Classification Active</p>
                <p className="text-blue-700 text-[11px] mt-0.5">
                  Business / Company Name is primary for this account. First Name and Last Name are optional contact person fields.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date of Birth <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Account Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              >
                <option value="Active / Submitted">Active / Submitted</option>
                <option value="Pending">Pending Review</option>
                <option value="Lead">Lead Intake</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Contact Information & Location */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#0170FE]">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900">Contact &amp; Location Details</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (416) 555-0192"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="marcus.vance@gmail.com"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>

              {/* Quick domain autofill tags */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {QUICK_EMAIL_DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => {
                      const prefix = form.email.split('@')[0] || form.firstName.toLowerCase() || 'client'
                      setForm({ ...form, email: `${prefix}${domain}` })
                    }}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canadian Address with autocomplete helper */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Street Address <span className="text-slate-400 font-normal">(search Canadian address or type manually)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => {
                    setForm({ ...form, street: e.target.value })
                    setAddressSearchQuery(e.target.value)
                    setIsAddressDropdownOpen(true)
                  }}
                  onFocus={() => setIsAddressDropdownOpen(true)}
                  placeholder="e.g. 100 King Street West, Suite 5600"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {isAddressDropdownOpen && addressSearchQuery.length > 1 && (
                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  {SAMPLE_CANADIAN_ADDRESSES.filter((a) =>
                    a.street.toLowerCase().includes(addressSearchQuery.toLowerCase()) ||
                    a.city.toLowerCase().includes(addressSearchQuery.toLowerCase())
                  ).slice(0, 5).map((addr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className="flex w-full items-start gap-2 rounded-lg p-2 text-left text-xs hover:bg-blue-50 transition cursor-pointer"
                    >
                      <MapPin className="size-3.5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-800">{addr.street}</p>
                        <p className="text-[11px] text-slate-500">{addr.city}, {addr.province} {addr.postalCode}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsAddressDropdownOpen(false)}
                    className="w-full text-center py-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 border-t border-slate-100 mt-1"
                  >
                    Close suggestions
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Toronto"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Province</label>
                <select
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                >
                  {CANADIAN_PROVINCES.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal Code</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. M5X 1C9"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-mono font-semibold uppercase text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Primary Policy & Coverage Setup */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#0170FE]">
                3
              </span>
              <h2 className="text-base font-bold text-slate-900">Primary Policy &amp; Coverage Setup</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Automatic contract split calculation</span>
          </div>

          {/* Line of Business Multi-Select Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Line of Business <span className="text-slate-400 font-normal">(Multiple selections supported, e.g. Auto & Home)</span> <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-medium text-blue-600">
                {form.linesOfBusiness.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {LOB_OPTIONS.map((line) => {
                const isSelected = form.linesOfBusiness.includes(line)
                return (
                  <button
                    key={line}
                    type="button"
                    onClick={() => {
                      setForm((prev) => {
                        const exists = prev.linesOfBusiness.includes(line)
                        if (exists && prev.linesOfBusiness.length === 1) return prev // keep at least 1
                        return {
                          ...prev,
                          linesOfBusiness: exists
                            ? prev.linesOfBusiness.filter((l) => l !== line)
                            : [...prev.linesOfBusiness, line],
                        }
                      })
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${isSelected
                      ? 'bg-slate-950 text-white shadow-xs hover:bg-slate-800'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    {isSelected && <Check className="size-3.5 text-emerald-400" />}
                    <span>{line}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company / Insurer Selection with Combobox, Pre-selected from Settings & Other */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Insurance Company / Carrier <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-normal">
                  Click anywhere to view settings carriers
                </span>
              </div>

              {/* Clickable anywhere in the field */}
              <div
                ref={companyDropdownRef}
                className="relative"
              >
                <div
                  onClick={() => {
                    setIsCompanyDropdownOpen(true)
                    companyInputRef.current?.focus()
                  }}
                  className={`relative flex items-center w-full rounded-xl border bg-white transition cursor-pointer shadow-2xs ${isCompanyDropdownOpen
                    ? 'border-[#0170FE] ring-2 ring-[#0170FE]/20'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={companyInputRef}
                    type="text"
                    required
                    value={form.insurerName}
                    onChange={(e) => {
                      const val = e.target.value
                      setForm({ ...form, insurerName: val })
                      setCompanySearchQuery(val)
                      setIsCompanyDropdownOpen(true)
                    }}
                    onFocus={() => setIsCompanyDropdownOpen(true)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsCompanyDropdownOpen(true)
                    }}
                    placeholder="Click or type to select insurance company..."
                    className="h-10 w-full rounded-xl bg-transparent pl-10 pr-20 text-sm text-slate-900 font-medium outline-none cursor-text placeholder:text-slate-400"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {form.insurerName && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setForm({ ...form, insurerName: '' })
                          setCompanySearchQuery('')
                          setIsCompanyDropdownOpen(true)
                          companyInputRef.current?.focus()
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        title="Clear company"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsCompanyDropdownOpen((prev) => !prev)
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      <ChevronDown
                        className={`size-4 transition-transform duration-200 ${isCompanyDropdownOpen ? 'rotate-180 text-[#0170FE]' : ''
                          }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Dropdown Menu showing all companies pre-selected in Settings tab + Other */}
                {isCompanyDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 mb-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <Sliders className="size-3 text-[#0170FE]" />
                        <span>Pre-selected in Settings Tab</span>
                      </div>
                      <Link
                        href="/broker/settings?tab=commissions"
                        target="_blank"
                        className="text-[11px] font-medium text-[#0170FE] hover:underline flex items-center gap-0.5"
                      >
                        <span>Manage in Settings</span>
                        <ExternalLink className="size-2.5" />
                      </Link>
                    </div>

                    {/* Pre-selected Companies List */}
                    <div className="space-y-0.5">
                      {configuredCompanies
                        .filter((c) =>
                          !companySearchQuery ||
                          c.carrier.toLowerCase().includes(companySearchQuery.toLowerCase())
                        )
                        .map((c) => {
                          const isSelected = form.insurerName.toLowerCase() === c.carrier.toLowerCase()
                          return (
                            <button
                              type="button"
                              key={c.carrier}
                              onClick={() => {
                                applyCarrierSettings(c.carrier)
                                setIsCompanyDropdownOpen(false)
                                setIsCustomCompanyMode(false)
                                setCompanySearchQuery('')
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left transition cursor-pointer ${isSelected
                                ? 'bg-blue-50 text-[#0170FE] font-semibold'
                                : 'text-slate-800 hover:bg-slate-50'
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Building2
                                  className={`size-3.5 shrink-0 ${isSelected ? 'text-[#0170FE]' : 'text-slate-400'
                                    }`}
                                />
                                <span>{c.carrier}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                  {c.defaultComm}% Comm · {c.brokerSplit}% Split
                                </span>
                                {isSelected && <Check className="size-4 text-[#0170FE]" />}
                              </div>
                            </button>
                          )
                        })}

                      {/* When no exact filter match */}
                      {configuredCompanies.filter((c) =>
                        c.carrier.toLowerCase().includes(companySearchQuery.toLowerCase())
                      ).length === 0 && companySearchQuery && (
                          <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 rounded-xl my-1">
                            <p className="mb-2">No settings company matches &quot;{companySearchQuery}&quot;</p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomCompanyMode(true)
                                setIsCompanyDropdownOpen(false)
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0170FE] px-3 py-1.5 rounded-lg hover:bg-[#0060db] transition cursor-pointer shadow-xs"
                            >
                              <Plus className="size-3.5" />
                              <span>Use &quot;{companySearchQuery}&quot; as custom name</span>
                            </button>
                          </div>
                        )}
                    </div>

                    {/* "Other" Option as explicitly requested by client */}
                    <div className="pt-1.5 mt-1.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCompanyMode(true)
                          setIsCompanyDropdownOpen(false)
                          setForm((prev) => ({ ...prev, insurerName: '' }))
                          setCompanySearchQuery('')
                          setTimeout(() => companyInputRef.current?.focus(), 50)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[#0170FE] bg-blue-50/70 hover:bg-blue-100/70 transition cursor-pointer border border-blue-100"
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="size-4 text-[#0170FE]" />
                          <span>Other (Type unknown / new company name)</span>
                        </div>
                        <span className="text-[10px] font-bold bg-white text-[#0170FE] px-2 py-0.5 rounded-md border border-blue-200">
                          Custom
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Informative helper note for custom company mode */}
              {isCustomCompanyMode && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                  <Sparkles className="size-3 text-amber-600 shrink-0" />
                  <span>Custom / Unknown company entry active. You can type any company name directly.</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Annual Gross Premium ($ CAD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.yearlyPremium}
                  onChange={(e) => setForm({ ...form, yearlyPremium: e.target.value })}
                  placeholder="2450.00"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Policy Number</label>
                <div className="flex items-center gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-blue-600 cursor-pointer font-medium hover:text-blue-700 select-none">
                    <input
                      type="checkbox"
                      checked={form.isPendingPolicyNumber}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          isPendingPolicyNumber: e.target.checked,
                          policyNumber: e.target.checked ? 'POL-PENDING' : '',
                        })
                      }
                      className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Pending</span>
                  </label>
                  <Link
                    href="/broker/settings?tab=commissions"
                    target="_blank"
                    className="text-[10px] text-slate-400 hover:text-[#0170FE] transition"
                    title="Change default pending behavior in Settings tab"
                  >
                    ⚙
                  </Link>
                </div>
              </div>
              <input
                type="text"
                disabled={form.isPendingPolicyNumber}
                value={form.isPendingPolicyNumber ? 'POL-PENDING (will fill from statement)' : form.policyNumber}
                onChange={(e) => setForm({ ...form, policyNumber: e.target.value })}
                placeholder={form.isPendingPolicyNumber ? 'POL-PENDING' : 'Type policy number (e.g. POL-88210-TRAV)'}
                className={`h-10 w-full rounded-xl border px-3.5 text-sm font-mono font-medium outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20 transition ${form.isPendingPolicyNumber
                  ? 'bg-amber-50/70 text-amber-700 border-amber-200 cursor-not-allowed'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                  }`}
              />
              <p className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  {form.isPendingPolicyNumber
                    ? 'Default: Pending. Uncheck box to type a policy number.'
                    : 'Manual entry active — enter policy number above.'}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Effective Date</label>
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) => handleEffectiveDateChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Expiration Date</label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ring-1 ring-emerald-200">
                  +1 Yr Auto
                </span>
              </div>
              <input
                type="date"
                readOnly
                value={form.expirationDate}
                title="Expiry date is automatically linked to exact one year after effective date."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-sm text-slate-600 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Payment Status & Client Account Status Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Status <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentStatus: 'Paid' })}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold border transition cursor-pointer ${
                    form.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/30 shadow-2xs font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>Paid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentStatus: 'Unpaid' })}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold border transition cursor-pointer ${
                    form.paymentStatus === 'Unpaid'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400/30 shadow-2xs font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Unpaid</span>
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {form.paymentStatus === 'Paid'
                  ? 'Premium paid in full / up-to-date.'
                  : 'Payment outstanding or pending invoice settlement.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Account Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              >
                <option value="Active / Submitted">Active / Submitted</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
                <option value="Inactive">Inactive</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Controls the primary lifecycle state in My Book roster.
              </p>
            </div>
          </div>

          {/* Commission & Split Rates Preview - Auto-aligned as per Settings & Selected Company */}
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#0170FE] text-white">
                  <Percent className="size-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Contract Commission Split</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-[#0170FE] px-2 py-0.5 rounded-full border border-blue-200">
                      Settings Linked
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Adjusted automatically as per pre-settings for{' '}
                    <strong className="text-slate-800 font-semibold">{form.insurerName || 'selected company'}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {configuredCompanies.some(
                  (c) => c.carrier.toLowerCase() === form.insurerName.toLowerCase()
                ) && (
                    <button
                      type="button"
                      onClick={() => applyCarrierSettings(form.insurerName)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0170FE] bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition cursor-pointer shadow-2xs"
                      title="Reset to pre-configured settings for this carrier"
                    >
                      <RefreshCw className="size-3" />
                      <span>Reset to Carrier Settings</span>
                    </button>
                  )}
                <Link
                  href="/broker/settings?tab=commissions"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#0170FE] transition"
                  title="Configure carrier commission rates and split shares in Settings"
                >
                  <Sliders className="size-3 text-[#0170FE]" />
                  <span>Settings Tab</span>
                  <ExternalLink className="size-2.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Contract Commission Rate (%)</label>
                  <span className="text-[11px] font-mono font-bold text-[#0170FE]">
                    {form.commissionRate}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.commissionRate}
                    onChange={(e) => setForm({ ...form, commissionRate: parseFloat(e.target.value) || 0 })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-8 text-sm font-semibold text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    %
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Contract default from settings for {form.insurerName || 'carrier'}.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Broker Share (%)</label>
                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                    Broker: {form.brokerSplit}% · House: {100 - form.brokerSplit}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={form.brokerSplit}
                    onChange={(e) => setForm({ ...form, brokerSplit: parseInt(e.target.value) || 0 })}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-8 text-sm font-semibold text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    %
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Contract broker split percentage from settings.
                </p>
              </div>
            </div>

            {/* Live calculation banner if annual premium is provided */}
            {form.yearlyPremium && parseFloat(form.yearlyPremium) > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
                <span className="font-medium">
                  Estimated Earnings on ${parseFloat(form.yearlyPremium).toLocaleString()} Annual Premium:
                </span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  ${(
                    parseFloat(form.yearlyPremium) *
                    (form.commissionRate / 100) *
                    (form.brokerSplit / 100)
                  ).toFixed(2)}{' '}
                  CAD <span className="text-[11px] font-normal text-emerald-700">(Broker Net Share)</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Marketing Consent & Compliance (CASL / PIPEDA) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#0170FE]">
                4
              </span>
              <h2 className="text-base font-bold text-slate-900">Marketing Consent &amp; Compliance</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              CASL Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Consent Status
              </label>
              <select
                value={form.consentStatus}
                onChange={(e) => setForm({ ...form, consentStatus: e.target.value as any })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
              >
                <option value="Granted">Granted (Opted In)</option>
                <option value="Pending">Pending Confirmation</option>
                <option value="Declined">Declined (Do Not Solicit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Allowed Communication Channels
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Email', 'SMS', 'Phone', 'Direct Mail'].map((channel) => {
                  const isChecked = form.consentChannels.includes(channel)
                  return (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => handleToggleChannel(channel)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${isChecked
                        ? 'bg-blue-50 text-[#0170FE] border border-blue-200'
                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <Check className={`size-3.5 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{channel}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Automated Marketing Consent Notification Banner */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5 flex items-start gap-2.5">
            <Shield className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Automated Consent Dispatch
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                A digital consent link will automatically be dispatched to the client upon saving. Once digitally authorized, their record automatically updates to <strong className="font-semibold text-emerald-900">Granted</strong> in the client file.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Initial Broker Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Bound primary commercial policy during annual review. Client expressed interest in umbrella endorsement next quarter."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#0170FE] focus:ring-2 focus:ring-[#0170FE]/20"
            />
          </div>
        </div>

        {/* Submit Actions Bar */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
          <Link
            href="/broker/book-of-business"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 text-center hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </Link>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/90 px-4 py-2.5 text-xs sm:text-sm font-semibold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
              title="Save half or pending info without required field validation"
            >
              <Bookmark className="size-4 text-amber-600" />
              <span>Save as Draft</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSave(e, true)}
              className="w-full sm:w-auto rounded-xl border border-[#0170FE] bg-blue-50/60 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#0170FE] hover:bg-blue-100/70 transition cursor-pointer disabled:opacity-50"
            >
              Save &amp; Add Another
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0170FE] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 transition hover:bg-[#0060db] cursor-pointer disabled:opacity-50"
            >
              <Check className="size-4" />
              <span>{resumedDraftId ? 'Finalize Client & View in My Book' : 'Save Client & View in My Book'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* BULK DATA IMPORT MODAL (PDF, EXCEL, CSV) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#0170FE] text-white shadow-sm">
                  <UploadCloud className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Bulk Client Data Import
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Upload bulk entries from PDF policy schedules, Excel (.xlsx, .xls), or CSV files.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Excel (.xlsx, .xls)
                    </span>
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                      PDF Document (.pdf)
                    </span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                      CSV Spreadsheet (.csv)
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false)
                  setParsedImportRows([])
                }}
                className="size-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* File Dropzone / Upload Box (displayed when no file is active) */}
              {parsedImportRows.length === 0 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (e.dataTransfer.files?.[0]) {
                      handleFileSelect(e.dataTransfer.files[0])
                    }
                  }}
                  className="group relative rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/60 hover:border-[#0170FE] p-6 sm:p-8 text-center transition cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf,.txt"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0])
                      }
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-blue-100 group-hover:scale-105 transition">
                      <UploadCloud className="size-7 text-[#0170FE]" />
                    </div>
                    <h4 className="mt-3 text-sm font-bold text-slate-900">
                      Click to browse or drag and drop your document here
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 max-w-md">
                      Accepts Microsoft Excel (.xlsx, .xls), PDF policy declarations (.pdf), or standard comma-separated (.csv) files.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLoadSampleBatch()
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0170FE] bg-white border border-blue-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-blue-50 transition cursor-pointer"
                      >
                        <Sparkles className="size-3.5 text-[#0170FE]" />
                        <span>Load Sample Batch (5 Clients)</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadSampleTemplate()
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                      >
                        <Download className="size-3.5 text-slate-400" />
                        <span>Download Sample CSV Template</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading / Extraction State */}
              {isImportProcessing && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 flex flex-col items-center justify-center text-center animate-in fade-in">
                  <RefreshCw className="size-8 text-[#0170FE] animate-spin mb-3" />
                  <p className="text-sm font-bold text-slate-900">Analyzing Document &amp; Extracting Client Entries...</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Validating classification, contacts, policy numbers, and insurance carriers.
                  </p>
                </div>
              )}

              {/* Success Notification */}
              {isImportSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex flex-col items-center justify-center text-center animate-in fade-in">
                  <CheckCircle2 className="size-10 text-emerald-600 mb-2" />
                  <p className="text-base font-bold text-emerald-900">Successfully Imported {parsedImportRows.length} Clients!</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Redirecting you to My Book to view the newly registered clients...
                  </p>
                </div>
              )}

              {/* Data Preview Table */}
              {!isImportProcessing && !isImportSuccess && parsedImportRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{importFileName || 'Imported File'}</span>
                          {importFileSize && (
                            <span className="text-[10px] text-slate-400">({importFileSize})</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {parsedImportRows.length} valid records extracted ·{' '}
                          <span className="text-emerald-700 font-semibold">
                            {parsedImportRows.filter((r) => r.clientType === 'Commercial').length} Commercial
                          </span>
                          ,{' '}
                          <span className="text-blue-700 font-semibold">
                            {parsedImportRows.filter((r) => r.clientType === 'Individual').length} Individual
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#0170FE] hover:underline self-start sm:self-auto"
                    >
                      Re-upload different file
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Client / Business</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Contact</th>
                            <th className="py-2.5 px-3">Insurance Company</th>
                            <th className="py-2.5 px-3">Policy &amp; LOB</th>
                            <th className="py-2.5 px-3">Annual Premium</th>
                            <th className="py-2.5 px-3">Payment</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {parsedImportRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 transition">
                              <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                                {row.clientType === 'Commercial'
                                  ? row.businessName || `${row.firstName} ${row.lastName}`
                                  : `${row.firstName} ${row.lastName}`}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${row.clientType === 'Commercial'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-blue-50 text-[#0170FE] border border-blue-200'
                                    }`}
                                >
                                  {row.clientType}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <div className="text-[11px] font-medium text-slate-800">{row.phone}</div>
                                <div className="text-[10px] text-slate-400">{row.email}</div>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <Building2 className="size-3 text-slate-400" />
                                  <span>{row.insurerName}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <div className="font-semibold text-slate-800">{row.policyNumber}</div>
                                <div className="text-[10px] text-slate-500">
                                  {row.linesOfBusiness.join(', ')}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-bold text-emerald-700 whitespace-nowrap">
                                {row.yearlyPremium}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${row.paymentStatus === 'Unpaid'
                                    ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                    }`}
                                >
                                  {row.paymentStatus === 'Unpaid' ? (
                                    <>
                                      <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                                      <span>Unpaid</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="size-3 text-emerald-600" />
                                      <span>Paid</span>
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <Check className="size-3" />
                                  <span>Ready</span>
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false)
                  setParsedImportRows([])
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={parsedImportRows.length === 0 || isImportProcessing}
                  onClick={handleExecuteBulkImport}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0170FE] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0060db] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="size-4" />
                  <span>
                    Import {parsedImportRows.length > 0 ? `${parsedImportRows.length} Clients` : 'Entries'} to My Book
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVED DRAFTS & INCOMPLETE / HALF INFO RECORDS MODAL */}
      {isDraftsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-start gap-3.5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                  <FolderClock className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      Drafts &amp; Incomplete Records
                    </h3>
                    <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-950">
                      {allDrafts.length} Saved
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Entries saved with pending, half info, or awaiting missing documents. Resume anytime to finish and bind.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDraftsModalOpen(false)}
                className="size-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Search Filter for Drafts */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter drafts by client name, business, phone..."
                  value={draftSearchQuery}
                  onChange={(e) => setDraftSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
                {draftSearchQuery && (
                  <button
                    onClick={() => setDraftSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Drafts List Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 divide-y divide-slate-100">
              {allDrafts.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <FolderClock className="mx-auto size-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No drafts currently saved</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When intake has partial or half info, click &ldquo;Save as Draft&rdquo; to store it here.
                  </p>
                </div>
              ) : (
                allDrafts
                  .filter((d) => {
                    if (!draftSearchQuery.trim()) return true
                    const q = draftSearchQuery.toLowerCase()
                    return (
                      d.name.toLowerCase().includes(q) ||
                      (d.businessName && d.businessName.toLowerCase().includes(q)) ||
                      (d.phone && d.phone.toLowerCase().includes(q))
                    )
                  })
                  .map((draft) => {
                    const isCurrentResumed = resumedDraftId === draft.id
                    return (
                      <div
                        key={draft.id}
                        className={`pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl transition ${isCurrentResumed
                          ? 'bg-amber-50/80 border border-amber-300 ring-2 ring-amber-400/30'
                          : 'hover:bg-slate-50 border border-transparent'
                          }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {draft.name}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${draft.clientType === 'Commercial'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                            >
                              {draft.clientType || 'Individual'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Draft / Incomplete
                            </span>
                            {isCurrentResumed && (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                                Active in Editor
                              </span>
                            )}
                          </div>

                          {/* Partial Info Summary */}
                          <p className="text-xs text-amber-900 mt-1 flex items-center gap-1.5">
                            <Clock className="size-3 text-amber-600 shrink-0" />
                            <span>{draft.lastActivity?.description || 'Half Info saved'}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5">
                            {draft.phone && draft.phone !== '— (Pending phone)' && (
                              <span className="flex items-center gap-1">
                                <Phone className="size-3 text-slate-400" />
                                {draft.phone}
                              </span>
                            )}
                            {draft.email && !draft.email.includes('Pending') && (
                              <span className="flex items-center gap-1">
                                <Mail className="size-3 text-slate-400" />
                                {draft.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Building2 className="size-3 text-slate-400" />
                              {draft.insurerName || 'Travelers Insurance'}
                            </span>
                            <span>·</span>
                            <span>{draft.policies?.[0]?.type || 'Auto'}</span>
                            <span>·</span>
                            <span className="font-mono text-slate-400">{draft.id}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => loadDraftIntoForm(draft)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
                          >
                            <FileEdit className="size-3.5 text-amber-200" />
                            <span>{isCurrentResumed ? 'Loaded in Form' : 'Resume Draft'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDraft(draft.id, e)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete this draft"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500">
                Drafts are also listed in <Link href="/broker/book-of-business?tab=Draft" className="text-blue-600 hover:underline font-semibold">My Book &gt; Drafts</Link>
              </span>
              <button
                type="button"
                onClick={() => setIsDraftsModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
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

export default function AddClientPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      }
    >
      <AddClientFormContent />
    </Suspense>
  )
}
