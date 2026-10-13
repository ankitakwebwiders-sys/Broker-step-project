'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  Check,
  X,
  ExternalLink,
  Sliders,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Layers,
  Building2,
  Users,
  Settings2,
  FileSpreadsheet,
  AlertCircle,
  Info,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Copy,
  Table,
  Cpu,
  UserCheck,
} from 'lucide-react'

// Tab definitions
type TemplateTabId = 'standard' | 'broker-specific' | 'rules' | 'assignment'

// 21.1 Standard Template Definition
export interface StandardTemplate {
  id: string
  name: string
  carrier: string
  structureType: 'Standard CSV Grid' | 'Multi-Tab Excel Workbook' | 'Delimited Text / TSV' | 'EDI 835 / Fixed Width'
  status: 'Active' | 'Inactive'
  version: string
  mappedFieldsCount: number
  totalFieldsCount: number
  keyMappedFields: string[]
  headerRowIndex: number
  dataStartRowIndex: number
  dateFormat: string
  currencyFormat: string
  notes?: string
  lastUpdated: string
}

// 21.2 Broker-Specific Template Definition
export interface BrokerSpecificTemplate {
  id: string
  brokerId: string
  brokerName: string
  agencyName: string
  carrier: string
  structureType: 'Standard CSV Grid' | 'Multi-Tab Excel Workbook' | 'Delimited Text / TSV'
  templateName: string
  overrideStandardTemplate: string // Overridden standard template name
  status: 'Active' | 'Inactive'
  customRulesCount: number
  customSplitLogic: boolean
  lastAssigned: string
}

// Field Mapping Definition for 21.3
export interface FieldMappingDef {
  targetField: string
  targetFieldLabel: string
  sourceHeader: string
  required: boolean
  dataType: 'string' | 'number' | 'date' | 'currency' | 'enum'
  sampleExtractedValue: string
  transformationRule: string
}

const DEFAULT_FIELD_MAPPINGS: FieldMappingDef[] = [
  {
    targetField: 'policyNumber',
    targetFieldLabel: 'Policy Number',
    sourceHeader: 'Policy_No',
    required: true,
    dataType: 'string',
    sampleExtractedValue: 'POL-TRV-89210',
    transformationRule: 'Trim whitespace, uppercase alphanumeric',
  },
  {
    targetField: 'clientName',
    targetFieldLabel: 'Client / Insured Name',
    sourceHeader: 'Insured_Legal_Name',
    required: true,
    dataType: 'string',
    sampleExtractedValue: 'Horizon Freight Corp',
    transformationRule: 'Clean special characters, title-case',
  },
  {
    targetField: 'carrierName',
    targetFieldLabel: 'Writing Carrier',
    sourceHeader: 'Carrier_Company',
    required: true,
    dataType: 'string',
    sampleExtractedValue: 'Travelers Property Casualty',
    transformationRule: 'Normalize to master carrier dictionary',
  },
  {
    targetField: 'transactionDate',
    targetFieldLabel: 'Effective / Statement Dates',
    sourceHeader: 'Trans_Effective_Date',
    required: true,
    dataType: 'date',
    sampleExtractedValue: '10/01/2026',
    transformationRule: 'Parse to ISO standard (YYYY-MM-DD)',
  },
  {
    targetField: 'transactionType',
    targetFieldLabel: 'Transaction Type',
    sourceHeader: 'Tran_Code_Desc',
    required: true,
    dataType: 'enum',
    sampleExtractedValue: 'Renewal',
    transformationRule: 'Map to: New Business, Renewal, Endorsement, Cancellation',
  },
  {
    targetField: 'lineOfBusiness',
    targetFieldLabel: 'Line of Business',
    sourceHeader: 'Coverage_LOB_Code',
    required: true,
    dataType: 'string',
    sampleExtractedValue: 'Commercial Property',
    transformationRule: 'Map to standard LOB catalog',
  },
  {
    targetField: 'writtenPremium',
    targetFieldLabel: 'Gross / Written Premium',
    sourceHeader: 'Written_Premium_Amt',
    required: true,
    dataType: 'currency',
    sampleExtractedValue: '$12,450.00',
    transformationRule: 'Strip currency symbols, parse float2',
  },
  {
    targetField: 'commissionAmount',
    targetFieldLabel: 'Commission Amount / Rate',
    sourceHeader: 'Broker_Payable_Comm',
    required: true,
    dataType: 'currency',
    sampleExtractedValue: '$1,867.50',
    transformationRule: 'Validate against default carrier baseline',
  },
]

const INITIAL_STANDARD_TEMPLATES: StandardTemplate[] = [
  {
    id: 'TPL-STD-001',
    name: 'Travelers Standard Grid Parser v2.1',
    carrier: 'Travelers Insurance',
    structureType: 'Standard CSV Grid',
    status: 'Active',
    version: '2.1.0',
    mappedFieldsCount: 8,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'LOB', 'Premium', 'Commission'],
    headerRowIndex: 1,
    dataStartRowIndex: 2,
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD ($)',
    notes: 'Direct carrier CSV download layout with automatic comma delimiter and quote escape handling.',
    lastUpdated: 'Oct 08, 2026',
  },
  {
    id: 'TPL-STD-002',
    name: 'The Hartford Multi-Tab Statement',
    carrier: 'The Hartford',
    structureType: 'Multi-Tab Excel Workbook',
    status: 'Active',
    version: '1.4.2',
    mappedFieldsCount: 8,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'LOB', 'Premium', 'Commission'],
    headerRowIndex: 3,
    dataStartRowIndex: 4,
    dateFormat: 'YYYY-MM-DD',
    currencyFormat: 'USD ($)',
    notes: 'Target worksheet tab "Commission Details"; skips preliminary agency summary sheet.',
    lastUpdated: 'Sep 29, 2026',
  },
  {
    id: 'TPL-STD-003',
    name: 'Progressive Commercial Layout',
    carrier: 'Progressive Commercial',
    structureType: 'Standard CSV Grid',
    status: 'Active',
    version: '3.0.1',
    mappedFieldsCount: 8,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'LOB', 'Premium', 'Commission'],
    headerRowIndex: 1,
    dataStartRowIndex: 2,
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD ($)',
    notes: 'Bi-weekly commercial fleet auto extract with standardized transaction codes.',
    lastUpdated: 'Oct 04, 2026',
  },
  {
    id: 'TPL-STD-004',
    name: 'Liberty Mutual CSV Custom Parser',
    carrier: 'Liberty Mutual',
    structureType: 'Standard CSV Grid',
    status: 'Active',
    version: '1.8.0',
    mappedFieldsCount: 8,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'LOB', 'Premium', 'Commission'],
    headerRowIndex: 2,
    dataStartRowIndex: 3,
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD ($)',
    notes: 'Header row contains agency contract metadata; tabular headers begin on row 2.',
    lastUpdated: 'Sep 15, 2026',
  },
  {
    id: 'TPL-STD-005',
    name: 'Chubb Commercial Multi-Tier',
    carrier: 'Chubb Group',
    structureType: 'Multi-Tab Excel Workbook',
    status: 'Active',
    version: '2.0.0',
    mappedFieldsCount: 8,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'LOB', 'Premium', 'Commission'],
    headerRowIndex: 4,
    dataStartRowIndex: 5,
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD ($)',
    notes: 'Executive lines workbook parsing sub-tiered override rows based on policy class.',
    lastUpdated: 'Aug 22, 2026',
  },
  {
    id: 'TPL-STD-006',
    name: 'Nationwide Standard Auto/Property Grid',
    carrier: 'Nationwide Mutual',
    structureType: 'Standard CSV Grid',
    status: 'Active',
    version: '1.2.0',
    mappedFieldsCount: 8,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'LOB', 'Premium', 'Commission'],
    headerRowIndex: 1,
    dataStartRowIndex: 2,
    dateFormat: 'YYYY-MM-DD',
    currencyFormat: 'USD ($)',
    notes: 'Standardized monthly statement structure for commercial package policies.',
    lastUpdated: 'Sep 10, 2026',
  },
  {
    id: 'TPL-STD-007',
    name: 'Aetna & Humana Group Benefits Map',
    carrier: 'Aetna & Humana Group',
    structureType: 'Delimited Text / TSV',
    status: 'Active',
    version: '1.1.0',
    mappedFieldsCount: 7,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'Premium', 'Commission'],
    headerRowIndex: 1,
    dataStartRowIndex: 2,
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD ($)',
    notes: 'Tab-delimited employee benefits schedule mapping enrolled employee headcount tiers.',
    lastUpdated: 'Oct 01, 2026',
  },
  {
    id: 'TPL-STD-008',
    name: 'Standard Generic Broker CSV Template',
    carrier: 'Universal / All Carriers',
    structureType: 'Standard CSV Grid',
    status: 'Active',
    version: '1.0.0',
    mappedFieldsCount: 8,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'LOB', 'Premium', 'Commission'],
    headerRowIndex: 1,
    dataStartRowIndex: 2,
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD ($)',
    notes: 'Fallback general parser for brokers manually uploading standardized Excel/CSV sheets.',
    lastUpdated: 'Jul 12, 2026',
  },
  {
    id: 'TPL-STD-009',
    name: 'Berkshire Hathaway Legacy Layout v1',
    carrier: 'Berkshire Hathaway GUARD',
    structureType: 'Standard CSV Grid',
    status: 'Inactive',
    version: '1.0.0',
    mappedFieldsCount: 6,
    totalFieldsCount: 8,
    keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Premium', 'Commission'],
    headerRowIndex: 1,
    dataStartRowIndex: 2,
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD ($)',
    notes: 'Deprecated statement structure replaced by updated API direct download in Q3.',
    lastUpdated: 'Jun 18, 2026',
  },
]

const INITIAL_BROKER_TEMPLATES: BrokerSpecificTemplate[] = [
  {
    id: 'TPL-BRK-001',
    brokerId: 'BRK-001',
    brokerName: 'Jordan Davis',
    agencyName: 'Apex Horizon Brokerage LLC',
    carrier: 'The Hartford',
    structureType: 'Multi-Tab Excel Workbook',
    templateName: 'Apex Horizon - Custom Hartford Split Layout',
    overrideStandardTemplate: 'The Hartford Multi-Tab Statement',
    status: 'Active',
    customRulesCount: 3,
    customSplitLogic: true,
    lastAssigned: 'Oct 09, 2026',
  },
  {
    id: 'TPL-BRK-002',
    brokerId: 'BRK-001',
    brokerName: 'Jordan Davis',
    agencyName: 'Apex Horizon Brokerage LLC',
    carrier: 'Travelers Insurance',
    structureType: 'Standard CSV Grid',
    templateName: 'Apex Horizon - Travelers Producer Code Override',
    overrideStandardTemplate: 'Travelers Standard Grid Parser v2.1',
    status: 'Active',
    customRulesCount: 2,
    customSplitLogic: false,
    lastAssigned: 'Oct 02, 2026',
  },
  {
    id: 'TPL-BRK-003',
    brokerId: 'BRK-002',
    brokerName: 'Morgan Reed',
    agencyName: 'Beacon Mutual Advisory',
    carrier: 'Liberty Mutual',
    structureType: 'Standard CSV Grid',
    templateName: 'Beacon Mutual - Liberty Mutual Override v1.2',
    overrideStandardTemplate: 'Liberty Mutual CSV Custom Parser',
    status: 'Active',
    customRulesCount: 4,
    customSplitLogic: true,
    lastAssigned: 'Sep 25, 2026',
  },
  {
    id: 'TPL-BRK-004',
    brokerId: 'BRK-003',
    brokerName: 'Sarah Jenkins',
    agencyName: 'Summit Crest Partners',
    carrier: 'Progressive Commercial',
    structureType: 'Standard CSV Grid',
    templateName: 'Summit Crest - Progressive Sub-Agent Column Map',
    overrideStandardTemplate: 'Progressive Commercial Layout',
    status: 'Active',
    customRulesCount: 2,
    customSplitLogic: true,
    lastAssigned: 'Sep 18, 2026',
  },
  {
    id: 'TPL-BRK-005',
    brokerId: 'BRK-004',
    brokerName: 'Alex Taylor',
    agencyName: 'Vanguard Risk Management',
    carrier: 'Chubb Group',
    structureType: 'Multi-Tab Excel Workbook',
    templateName: 'Vanguard - Chubb Excess Surplus Custom Map',
    overrideStandardTemplate: 'Chubb Commercial Multi-Tier',
    status: 'Inactive',
    customRulesCount: 1,
    customSplitLogic: false,
    lastAssigned: 'Aug 14, 2026',
  },
]

const CARRIERS_LIST = [
  'Travelers Insurance',
  'The Hartford',
  'Progressive Commercial',
  'Liberty Mutual',
  'Chubb Group',
  'Nationwide Mutual',
  'Berkshire Hathaway GUARD',
  'CNA Financial',
  'Aetna & Humana Group',
  'Universal / All Carriers',
]

const BROKERS_LIST = [
  { id: 'BRK-001', name: 'Jordan Davis', agency: 'Apex Horizon Brokerage LLC' },
  { id: 'BRK-002', name: 'Morgan Reed', agency: 'Beacon Mutual Advisory' },
  { id: 'BRK-003', name: 'Sarah Jenkins', agency: 'Summit Crest Partners' },
  { id: 'BRK-004', name: 'Alex Taylor', agency: 'Vanguard Risk Management' },
  { id: 'BRK-005', name: 'Marcus Vance', agency: 'Pinnacle Assurance Group' },
]

export default function AdminStatementTemplatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading statement templates...</div>}>
      <StatementTemplatesContent />
    </Suspense>
  )
}

function StatementTemplatesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tabParam = (searchParams.get('tab') as TemplateTabId) || 'standard'

  // Active Tab
  const [activeTab, setActiveTab] = useState<TemplateTabId>(() => {
    if (tabParam && ['standard', 'broker-specific', 'rules', 'assignment'].includes(tabParam)) {
      return tabParam
    }
    return 'standard'
  })

  // Master Lists State
  const [standardTemplates, setStandardTemplates] = useState<StandardTemplate[]>(INITIAL_STANDARD_TEMPLATES)
  const [brokerTemplates, setBrokerTemplates] = useState<BrokerSpecificTemplate[]>(INITIAL_BROKER_TEMPLATES)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [carrierFilter, setCarrierFilter] = useState<string>('All')

  // Selected Standard Template for View Drawer
  const [selectedStandardTemplate, setSelectedStandardTemplate] = useState<StandardTemplate | null>(null)

  // 21.3 Template / Mapping Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingType, setEditingType] = useState<'standard' | 'broker-specific'>('standard')
  const [editingStandardTarget, setEditingStandardTarget] = useState<StandardTemplate | null>(null)
  const [editingBrokerTarget, setEditingBrokerTarget] = useState<BrokerSpecificTemplate | null>(null)

  // Form Fields State
  const [formName, setFormName] = useState('')
  const [formCarrier, setFormCarrier] = useState('Travelers Insurance')
  const [formStructureType, setFormStructureType] = useState<'Standard CSV Grid' | 'Multi-Tab Excel Workbook' | 'Delimited Text / TSV' | 'EDI 835 / Fixed Width'>('Standard CSV Grid')
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active')
  const [formIsBrokerSpecific, setFormIsBrokerSpecific] = useState(false)
  const [formSelectedBrokerId, setFormSelectedBrokerId] = useState('BRK-001')
  const [formOverrideStandardTemplate, setFormOverrideStandardTemplate] = useState('Travelers Standard Grid Parser v2.1')
  const [formMappings, setFormMappings] = useState<FieldMappingDef[]>(DEFAULT_FIELD_MAPPINGS)
  const [formHeaderRow, setFormHeaderRow] = useState('1')
  const [formDataStartRow, setFormDataStartRow] = useState('2')
  const [formDateFormat, setFormDateFormat] = useState('MM/DD/YYYY')
  const [formCurrencyFormat, setFormCurrencyFormat] = useState('USD ($)')
  const [formNotes, setFormNotes] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle URL search params and Custom Sidebar Navigation Events
  useEffect(() => {
    const applyUrlParams = (searchStr?: string) => {
      const query = searchStr !== undefined ? searchStr : (typeof window !== 'undefined' ? window.location.search : '')
      const params = new URLSearchParams(query)
      const tab = params.get('tab') as TemplateTabId | null
      const action = params.get('action')
      const view = params.get('view')
      const templateId = params.get('id')

      if (tab && ['standard', 'broker-specific', 'rules', 'assignment'].includes(tab)) {
        setActiveTab(tab)
      } else if (!tab && !view && !action) {
        setActiveTab('standard')
      }

      if (action === 'create') {
        openCreateFormModal(tab === 'broker-specific')
      } else if (view === 'details' || templateId) {
        const target = standardTemplates.find((t) => t.id === templateId) || standardTemplates[0]
        if (target) {
          setSelectedStandardTemplate(target)
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
  }, [standardTemplates])

  function handleTabChange(tab: TemplateTabId) {
    setActiveTab(tab)
    const targetUrl = tab === 'standard' ? '/admin/statement-templates' : `/admin/statement-templates?tab=${tab}`
    const targetSearch = tab === 'standard' ? '' : `?tab=${tab}`
    window.history.pushState(null, '', targetUrl)
    window.dispatchEvent(
      new CustomEvent('broker-nav-change', {
        detail: { href: targetUrl, search: targetSearch, pathname: '/admin/statement-templates' },
      })
    )
  }

  // Open Create Form Modal
  function openCreateFormModal(isBrokerSpecific = false) {
    setEditingType(isBrokerSpecific ? 'broker-specific' : 'standard')
    setEditingStandardTarget(null)
    setEditingBrokerTarget(null)
    setFormIsBrokerSpecific(isBrokerSpecific)
    setFormName(isBrokerSpecific ? 'Custom Statement Parser Override' : 'New Standard Template')
    setFormCarrier('Travelers Insurance')
    setFormStructureType('Standard CSV Grid')
    setFormStatus('Active')
    setFormSelectedBrokerId('BRK-001')
    setFormOverrideStandardTemplate('Travelers Standard Grid Parser v2.1')
    setFormMappings(DEFAULT_FIELD_MAPPINGS.map((m) => ({ ...m })))
    setFormHeaderRow('1')
    setFormDataStartRow('2')
    setFormDateFormat('MM/DD/YYYY')
    setFormCurrencyFormat('USD ($)')
    setFormNotes('')
    setFormError(null)
    setIsFormOpen(true)
  }

  // Open Edit Form for Standard Template
  function openEditStandardModal(template: StandardTemplate) {
    setEditingType('standard')
    setEditingStandardTarget(template)
    setEditingBrokerTarget(null)
    setFormIsBrokerSpecific(false)
    setFormName(template.name)
    setFormCarrier(template.carrier)
    setFormStructureType(template.structureType)
    setFormStatus(template.status)
    setFormMappings(DEFAULT_FIELD_MAPPINGS.map((m) => ({ ...m })))
    setFormHeaderRow(String(template.headerRowIndex))
    setFormDataStartRow(String(template.dataStartRowIndex))
    setFormDateFormat(template.dateFormat)
    setFormCurrencyFormat(template.currencyFormat)
    setFormNotes(template.notes || '')
    setFormError(null)
    setIsFormOpen(true)
  }

  // Open Edit Form for Broker Template
  function openEditBrokerModal(template: BrokerSpecificTemplate) {
    setEditingType('broker-specific')
    setEditingStandardTarget(null)
    setEditingBrokerTarget(template)
    setFormIsBrokerSpecific(true)
    setFormName(template.templateName)
    setFormCarrier(template.carrier)
    setFormStructureType(template.structureType)
    setFormStatus(template.status)
    setFormSelectedBrokerId(template.brokerId)
    setFormOverrideStandardTemplate(template.overrideStandardTemplate)
    setFormMappings(DEFAULT_FIELD_MAPPINGS.map((m) => ({ ...m })))
    setFormHeaderRow('1')
    setFormDataStartRow('2')
    setFormDateFormat('MM/DD/YYYY')
    setFormCurrencyFormat('USD ($)')
    setFormNotes(`Broker-specific override for ${template.agencyName}`)
    setFormError(null)
    setIsFormOpen(true)
  }

  function closeFormModal() {
    setIsFormOpen(false)
    setEditingStandardTarget(null)
    setEditingBrokerTarget(null)
    setFormError(null)
  }

  // Save 21.3 Template / Mapping Form
  function handleSaveForm(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) {
      setFormError('Please enter a valid template name.')
      return
    }

    if (formIsBrokerSpecific) {
      const brokerObj = BROKERS_LIST.find((b) => b.id === formSelectedBrokerId) || BROKERS_LIST[0]

      if (editingBrokerTarget) {
        // Update existing broker template
        const updated: BrokerSpecificTemplate = {
          ...editingBrokerTarget,
          templateName: formName.trim(),
          carrier: formCarrier,
          structureType: formStructureType as any,
          status: formStatus,
          brokerId: brokerObj.id,
          brokerName: brokerObj.name,
          agencyName: brokerObj.agency,
          overrideStandardTemplate: formOverrideStandardTemplate,
        }
        setBrokerTemplates((prev) => prev.map((t) => (t.id === editingBrokerTarget.id ? updated : t)))
        showToast(`Broker-specific template "${updated.templateName}" updated.`)
      } else {
        // Create new broker template
        const newTemplate: BrokerSpecificTemplate = {
          id: `TPL-BRK-00${brokerTemplates.length + 1}`,
          brokerId: brokerObj.id,
          brokerName: brokerObj.name,
          agencyName: brokerObj.agency,
          carrier: formCarrier,
          structureType: formStructureType as any,
          templateName: formName.trim(),
          overrideStandardTemplate: formOverrideStandardTemplate,
          status: formStatus,
          customRulesCount: 2,
          customSplitLogic: true,
          lastAssigned: 'Oct 13, 2026',
        }
        setBrokerTemplates((prev) => [newTemplate, ...prev])
        showToast(`Broker-specific template "${newTemplate.templateName}" assigned to ${brokerObj.name}.`)
      }
    } else {
      if (editingStandardTarget) {
        // Update existing standard template
        const updated: StandardTemplate = {
          ...editingStandardTarget,
          name: formName.trim(),
          carrier: formCarrier,
          structureType: formStructureType,
          status: formStatus,
          headerRowIndex: parseInt(formHeaderRow) || 1,
          dataStartRowIndex: parseInt(formDataStartRow) || 2,
          dateFormat: formDateFormat,
          currencyFormat: formCurrencyFormat,
          notes: formNotes.trim(),
          lastUpdated: 'Oct 13, 2026',
        }
        setStandardTemplates((prev) => prev.map((t) => (t.id === editingStandardTarget.id ? updated : t)))
        if (selectedStandardTemplate && selectedStandardTemplate.id === editingStandardTarget.id) {
          setSelectedStandardTemplate(updated)
        }
        showToast(`Standard template "${updated.name}" updated.`)
      } else {
        // Create new standard template
        const newTemplate: StandardTemplate = {
          id: `TPL-STD-0${String(standardTemplates.length + 1).padStart(2, '0')}`,
          name: formName.trim(),
          carrier: formCarrier,
          structureType: formStructureType,
          status: formStatus,
          version: '1.0.0',
          mappedFieldsCount: 8,
          totalFieldsCount: 8,
          keyMappedFields: ['Policy Number', 'Client Name', 'Carrier', 'Dates', 'Trans Type', 'LOB', 'Premium', 'Commission'],
          headerRowIndex: parseInt(formHeaderRow) || 1,
          dataStartRowIndex: parseInt(formDataStartRow) || 2,
          dateFormat: formDateFormat,
          currencyFormat: formCurrencyFormat,
          notes: formNotes.trim(),
          lastUpdated: 'Oct 13, 2026',
        }
        setStandardTemplates((prev) => [newTemplate, ...prev])
        showToast(`Standard template "${newTemplate.name}" created.`)
      }
    }

    closeFormModal()
  }

  // 1-Click Status Toggle for Standard Template
  function handleToggleStandardStatus(id: string) {
    setStandardTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus: 'Active' | 'Inactive' = t.status === 'Active' ? 'Inactive' : 'Active'
          showToast(`Template "${t.name}" status updated to ${nextStatus}.`)
          const updated: StandardTemplate = { ...t, status: nextStatus }
          if (selectedStandardTemplate && selectedStandardTemplate.id === id) {
            setSelectedStandardTemplate(updated)
          }
          return updated
        }
        return t
      })
    )
  }

  // 1-Click Status Toggle for Broker Template
  function handleToggleBrokerStatus(id: string) {
    setBrokerTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus: 'Active' | 'Inactive' = t.status === 'Active' ? 'Inactive' : 'Active'
          showToast(`Broker template "${t.templateName}" status updated to ${nextStatus}.`)
          return { ...t, status: nextStatus }
        }
        return t
      })
    )
  }

  // Filtered Standard Templates (21.1)
  const filteredStandardTemplates = useMemo(() => {
    return standardTemplates.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false
      if (carrierFilter !== 'All' && t.carrier !== carrierFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = t.name.toLowerCase().includes(q)
        const matchCarrier = t.carrier.toLowerCase().includes(q)
        const matchStructure = t.structureType.toLowerCase().includes(q)
        if (!matchName && !matchCarrier && !matchStructure) return false
      }
      return true
    })
  }, [standardTemplates, statusFilter, carrierFilter, searchQuery])

  // Filtered Broker-Specific Templates (21.2)
  const filteredBrokerTemplates = useMemo(() => {
    return brokerTemplates.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false
      if (carrierFilter !== 'All' && t.carrier !== carrierFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = t.templateName.toLowerCase().includes(q)
        const matchBroker = t.brokerName.toLowerCase().includes(q)
        const matchAgency = t.agencyName.toLowerCase().includes(q)
        const matchCarrier = t.carrier.toLowerCase().includes(q)
        if (!matchName && !matchBroker && !matchAgency && !matchCarrier) return false
      }
      return true
    })
  }, [brokerTemplates, statusFilter, carrierFilter, searchQuery])

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

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Statement Templates
            </h1>

          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Standard Templates, Broker-Specific Overrides, and Dynamic Field Mapping Configuration.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openCreateFormModal(activeTab === 'broker-specific')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-slate-950/20 hover:bg-blue-600 transition-all duration-150"
          >
            <Plus className="size-4" />
            <span>
              {activeTab === 'broker-specific' ? 'Add Broker Override' : 'New Template'}
            </span>
          </button>
        </div>
      </div>



      {/* ───── Sub-Tabs & Filter Bar (Broker-Style Unified Container) ───── */}
      <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        {/* Sub-Tab Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {[
            { id: 'standard', label: 'Standard Templates', count: standardTemplates.length },
            { id: 'broker-specific', label: 'Broker-Specific Templates', count: brokerTemplates.length },
            { id: 'rules', label: 'Extraction & Mapping Rules', count: 6 },
            { id: 'assignment', label: 'Template Assignment Matrix', count: BROKERS_LIST.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id as TemplateTabId)}
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
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ───── Search & Secondary Dropdown Filters ───── */}
        {(activeTab === 'standard' || activeTab === 'broker-specific') && (
          <div className="mt-3.5 flex flex-col gap-3 border-t border-slate-100 pt-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates, carriers, brokers..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9.5 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
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

              {/* Carrier Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Carrier:</span>
                <select
                  value={carrierFilter}
                  onChange={(e) => setCarrierFilter(e.target.value)}
                  className="h-9.5 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Carriers</option>
                  {CARRIERS_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              {(searchQuery || statusFilter !== 'All' || carrierFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('All')
                    setCarrierFilter('All')
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 transition cursor-pointer ml-1"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing{' '}
              <strong className="text-slate-800">
                {activeTab === 'standard' ? filteredStandardTemplates.length : filteredBrokerTemplates.length}
              </strong>{' '}
              templates
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
         TAB 1: 21.1 STANDARD TEMPLATES LISTING TABLE
         Columns:
               ========================================================================= */}
      {activeTab === 'standard' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4 min-w-[260px]">Template Name</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Carrier / Structure</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Status</th>
                  <th className="py-3.5 px-4 min-w-[280px]">Mapped Fields</th>
                  <th className="py-3.5 pl-4 pr-6 text-right min-w-[220px] w-[220px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStandardTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <FileSpreadsheet className="size-9 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No standard templates found</p>
                      <p className="text-xs text-slate-400 mt-1">Try loosening your search or filter criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredStandardTemplates.map((template) => {
                    const isActive = template.status === 'Active'

                    return (
                      <tr key={template.id} className="hover:bg-slate-50/80 transition group">
                        {/* 1. Template Name */}
                        <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-950 to-slate-800 text-xs font-bold text-white shadow-xs">
                              <FileSpreadsheet className="size-4 text-blue-400" />
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedStandardTemplate(template)}
                                className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer text-left block"
                              >
                                {template.name}
                              </button>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs text-slate-500 font-semibold">{template.id}</span>
                                <span className="text-slate-300">·</span>
                                <span className="text-xs text-slate-400">v{template.version}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Carrier / Structure */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div>
                            <span className="font-bold text-slate-900 block">{template.carrier}</span>
                            <span className="text-xs text-slate-500 block mt-0.5">{template.structureType}</span>
                          </div>
                        </td>

                        {/* 3. Status */}
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
                            {template.status}
                          </span>
                        </td>

                        {/* 4. Mapped Fields (Internal field mapping summary) */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/60">
                                {template.mappedFieldsCount}/{template.totalFieldsCount} Core Fields
                              </span>
                              <span className="text-[11px] text-slate-400">Standard Schema</span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                              {template.keyMappedFields.slice(0, 4).map((f) => (
                                <span
                                  key={f}
                                  className="rounded bg-slate-100 px-1.5 py-0.2 text-[10.5px] font-medium text-slate-600"
                                >
                                  {f}
                                </span>
                              ))}
                              {template.keyMappedFields.length > 4 && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10.5px] font-semibold text-slate-500">
                                  +{template.keyMappedFields.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 5. Actions (View / Edit / Deactivate) - Sticky Fixed */}
                        <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[220px] w-[220px] sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors select-none">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedStandardTemplate(template)}
                              title="View Template Details & Mapping"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="size-3.5" />
                              <span>View</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => openEditStandardModal(template)}
                              title="Edit Field Mappings"
                              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition"
                            >
                              <Edit3 className="size-3.5" />
                            </button>

                            {/* Deactivate / Activate Action */}
                            <button
                              type="button"
                              onClick={() => handleToggleStandardStatus(template.id)}
                              title={isActive ? 'Deactivate Template' : 'Activate Template'}
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
      )}

      {/* =========================================================================
         TAB 2: 21.2 BROKER-SPECIFIC TEMPLATES LISTING TABLE
         Columns:
         • Broker (Assigned broker)
         • Carrier / Structure (Statement structure)
         • Template (Template name)
         • Override (Standard template override where applicable)
         • Status (Active/inactive)
         • Actions (Edit/Assign/Deactivate) - Sticky Fixed
         ========================================================================= */}
      {activeTab === 'broker-specific' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4 min-w-[220px]">Broker</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Carrier / Structure</th>
                  <th className="py-3.5 px-4 min-w-[260px]">Template Name</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Override</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right min-w-[230px] w-[230px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBrokerTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="size-9 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No broker-specific template overrides found</p>
                      <p className="text-xs text-slate-400 mt-1">Click &quot;Add Broker Override&quot; to assign custom broker parser rules.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBrokerTemplates.map((template) => {
                    const isActive = template.status === 'Active'

                    return (
                      <tr key={template.id} className="hover:bg-slate-50/80 transition group">
                        {/* 1. Broker */}
                        <td className="py-3.5 pl-6 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white font-bold text-xs shadow-xs">
                              {template.brokerName.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{template.brokerName}</span>
                              <span className="text-xs text-slate-500 block">{template.agencyName}</span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Carrier / Structure */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div>
                            <span className="font-semibold text-slate-800 block">{template.carrier}</span>
                            <span className="text-xs text-slate-500 block">{template.structureType}</span>
                          </div>
                        </td>

                        {/* 3. Template Name */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div>
                            <span className="font-bold text-slate-900 block">{template.templateName}</span>
                            <span className="text-xs text-blue-600 font-medium block">
                              {template.customRulesCount} custom extraction rules
                            </span>
                          </div>
                        </td>

                        {/* 4. Override (Standard template override) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200/80 inline-flex items-center gap-1">
                              <Cpu className="size-3 text-amber-600" />
                              <span>Overrides:</span>
                            </span>
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[160px]" title={template.overrideStandardTemplate}>
                              {template.overrideStandardTemplate}
                            </span>
                          </div>
                        </td>

                        {/* 5. Status */}
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
                            {template.status}
                          </span>
                        </td>

                        {/* 6. Actions (Edit / Assign / Deactivate) - Sticky Fixed */}
                        <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right min-w-[230px] w-[230px] sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors select-none">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => openEditBrokerModal(template)}
                              title="Edit Broker Template"
                              className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition"
                            >
                              <Edit3 className="size-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Assign Action */}
                            <button
                              type="button"
                              onClick={() => {
                                openEditBrokerModal(template)
                              }}
                              title="Reassign or update broker targets"
                              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition"
                            >
                              <UserCheck className="size-3.5 text-slate-400" />
                              <span>Assign</span>
                            </button>

                            {/* Deactivate / Activate Action */}
                            <button
                              type="button"
                              onClick={() => handleToggleBrokerStatus(template.id)}
                              title={isActive ? 'Deactivate Override' : 'Activate Override'}
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
      )}

      {/* =========================================================================
         TAB 3: EXTRACTION & MAPPING RULES VIEW
         ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-950">
              Universal Carrier Statement Extraction &amp; Normalization Rules
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              These internal rules govern data cleansing, currency formatting, date normalization, and transaction reconciliation during parsing.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: 'Header Row Auto-Detection',
                  desc: 'Detects tabular header row by scanning for keywords: "Policy", "Insured", "Commission", "Premium", or "LOB". Ignores carrier banner rows.',
                  tag: 'Row Index Engine',
                },
                {
                  title: 'Date Parsing & Normalization',
                  desc: 'Converts diverse date formats (MM/DD/YYYY, YYYY-MM-DD, DD-Mon-YYYY) into standardized ISO format for transaction accounting.',
                  tag: 'Date Standard',
                },
                {
                  title: 'Currency Sanitization',
                  desc: 'Strips currency symbols ($), commas, and handles negative values indicated by parenthesis e.g. (120.00) or trailing minus signs.',
                  tag: 'Currency Engine',
                },
                {
                  title: 'Transaction Type Mapping',
                  desc: 'Normalizes carrier action codes (NB, RN, END, CAN, RW) into standard taxonomy: New Business, Renewal, Endorsement, Cancellation.',
                  tag: 'Taxonomy Map',
                },
                {
                  title: 'Policy Number Deduplication',
                  desc: 'Cleans leading zeros and hyphens to match broker book-of-business policies even when carrier statements omit punctuation.',
                  tag: 'Matching Rule',
                },
                {
                  title: 'Split & Sub-Broker Calculator',
                  desc: 'Applies broker-specific override schedules before generating broker commission statements and ledger lines.',
                  tag: 'Override Engine',
                },
              ].map((rule) => (
                <div key={rule.title} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/60">
                      {rule.tag}
                    </span>
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{rule.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{rule.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 4: TEMPLATE ASSIGNMENT MATRIX VIEW
         ========================================================================= */}
      {activeTab === 'assignment' && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-950">Broker Template Assignment Matrix</h3>
              <p className="text-xs text-slate-500">
                Summary of active statement parser assignments across enrolled broker agencies.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Broker / Agency</th>
                  <th className="py-3 px-4">Assigned Standard Parsers</th>
                  <th className="py-3 px-4">Active Custom Overrides</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BROKERS_LIST.map((b) => {
                  const assignedOverrides = brokerTemplates.filter((bt) => bt.brokerId === b.id)

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{b.name}</span>
                        <span className="text-xs text-slate-500 block">{b.agency} · {b.id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700">All 8 Core Standard Carrier Parsers</span>
                        <span className="text-slate-400 text-xs block mt-0.5">Auto-detected upon statement drop</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {assignedOverrides.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedOverrides.map((ov) => (
                              <span
                                key={ov.id}
                                className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200"
                              >
                                {ov.templateName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No custom overrides (Using standard catalog)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setFormSelectedBrokerId(b.id)
                            openCreateFormModal(true)
                          }}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition cursor-pointer"
                        >
                          + Assign Override
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
         21.3 TEMPLATE / MAPPING FORM (MODAL / SLIDE-OVER)
         Fields per client requirement:
         • Template Name
         • Carrier / statement structure
         • Field mappings (Policy Number, Client Name, Carrier, Dates, Transaction Type, Line of Business, Premium, Commission)
         • Applicable extraction/mapping rules
         • Broker assignment where broker-specific
         • Status
         ========================================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={closeFormModal}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                  <FileSpreadsheet className="size-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    {editingStandardTarget
                      ? `Edit Template: ${editingStandardTarget.name}`
                      : editingBrokerTarget
                        ? `Edit Broker Override: ${editingBrokerTarget.templateName}`
                        : formIsBrokerSpecific
                          ? '21.3 Create Broker-Specific Template Override'
                          : '21.3 Create Standard Statement Template'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure statement structure, field mapping schema, extraction rules, and broker assignment.
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
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Template Classification & Assignment Toggle */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Template Assignment Scope</span>
                    <span className="text-[11px] text-slate-500">Select whether this template is platform-wide or a custom broker override.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormIsBrokerSpecific(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${!formIsBrokerSpecific
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200'
                        }`}
                    >
                      Standard Platform Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormIsBrokerSpecific(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${formIsBrokerSpecific
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200'
                        }`}
                    >
                      Broker-Specific Override
                    </button>
                  </div>
                </div>

                {formIsBrokerSpecific && (
                  <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Assigned Broker <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formSelectedBrokerId}
                        onChange={(e) => setFormSelectedBrokerId(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                      >
                        {BROKERS_LIST.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.agency})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Overridden Standard Template <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formOverrideStandardTemplate}
                        onChange={(e) => setFormOverrideStandardTemplate(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                      >
                        {standardTemplates.map((st) => (
                          <option key={st.id} value={st.name}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Template Name, Carrier, Structure & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Travelers Standard Grid Parser v2.1"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Applicable Carrier <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCarrier}
                    onChange={(e) => setFormCarrier(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    {CARRIERS_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Statement File Structure <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStructureType}
                    onChange={(e) => setFormStructureType(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Standard CSV Grid">Standard CSV Grid (.csv)</option>
                    <option value="Multi-Tab Excel Workbook">Multi-Tab Excel Workbook (.xlsx, .xls)</option>
                    <option value="Delimited Text / TSV">Delimited Text / TSV (.txt, .tsv)</option>
                    <option value="EDI 835 / Fixed Width">EDI 835 / Fixed Width (.dat)</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">
                    Template Status <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="radio"
                        name="template_status"
                        checked={formStatus === 'Active'}
                        onChange={() => setFormStatus('Active')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Active (Available for production statement parsing)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="radio"
                        name="template_status"
                        checked={formStatus === 'Inactive'}
                        onChange={() => setFormStatus('Inactive')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Inactive (Disabled)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Field Mappings (SOW Core Fields: Policy #, Client Name, Carrier, Dates, Trans Type, LOB, Premium, Commission) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      21.3 Field Mappings Configuration
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Map incoming carrier file header columns to standardized BrokerStep system fields.
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                    {formMappings.length} Fields Configured
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                        <th className="py-2.5 px-3">System Field</th>
                        <th className="py-2.5 px-3">Statement Header (Source Column)</th>
                        <th className="py-2.5 px-3">Data Type</th>
                        <th className="py-2.5 px-3">Sample Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formMappings.map((mapping, idx) => (
                        <tr key={mapping.targetField} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {mapping.targetFieldLabel}
                            {mapping.required && <span className="text-rose-500 ml-0.5">*</span>}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={mapping.sourceHeader}
                              onChange={(e) => {
                                const val = e.target.value
                                setFormMappings((prev) =>
                                  prev.map((m, i) => (i === idx ? { ...m, sourceHeader: val } : m))
                                )
                              }}
                              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                              placeholder="Column Name in CSV..."
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-mono text-slate-600">
                              {mapping.dataType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                            {mapping.sampleExtractedValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Extraction & Mapping Rules */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Applicable Extraction &amp; Mapping Rules
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Header Row #</label>
                    <input
                      type="number"
                      min="1"
                      value={formHeaderRow}
                      onChange={(e) => setFormHeaderRow(e.target.value)}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Data Start Row #</label>
                    <input
                      type="number"
                      min="1"
                      value={formDataStartRow}
                      onChange={(e) => setFormDataStartRow(e.target.value)}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Date Format</label>
                    <select
                      value={formDateFormat}
                      onChange={(e) => setFormDateFormat(e.target.value)}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold cursor-pointer"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="Auto-Detect">Auto-Detect</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Currency Symbol</label>
                    <select
                      value={formCurrencyFormat}
                      onChange={(e) => setFormCurrencyFormat(e.target.value)}
                      className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold cursor-pointer"
                    >
                      <option value="USD ($)">USD ($)</option>
                      <option value="CAD ($)">CAD ($)</option>
                      <option value="Auto Clean">Auto Clean ($/USD)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. Internal Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Internal Parser Guidelines</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes regarding multi-tab structure, agency sub-codes, or special carrier handling..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 outline-none focus:border-blue-600"
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
                  {editingStandardTarget || editingBrokerTarget ? 'Save Template Changes' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
         21.1 VIEW STANDARD TEMPLATE DETAILS CANVAS DRAWER (SLIDE-OVER)
         ========================================================================= */}
      {selectedStandardTemplate && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedStandardTemplate(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white font-bold text-sm shadow-sm">
                  <FileSpreadsheet className="size-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-950">{selectedStandardTemplate.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${selectedStandardTemplate.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                    >
                      {selectedStandardTemplate.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedStandardTemplate.carrier} · {selectedStandardTemplate.structureType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const tpl = selectedStandardTemplate
                    setSelectedStandardTemplate(null)
                    openEditStandardModal(tpl)
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStandardTemplate(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Version</span>
                  <p className="mt-1 text-base font-bold text-slate-900 font-mono">v{selectedStandardTemplate.version}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Header Row</span>
                  <p className="mt-1 text-base font-bold text-blue-600 font-mono">Row #{selectedStandardTemplate.headerRowIndex}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Data Start</span>
                  <p className="mt-1 text-base font-bold text-emerald-600 font-mono">Row #{selectedStandardTemplate.dataStartRowIndex}</p>
                </div>
              </div>

              {/* Mapped Fields List */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Active Field Mappings ({DEFAULT_FIELD_MAPPINGS.length})
                  </h4>
                  <span className="text-xs font-semibold text-emerald-600">All Core Fields Configured</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {DEFAULT_FIELD_MAPPINGS.map((m) => (
                    <div key={m.targetField} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{m.targetFieldLabel}</span>
                        <span className="font-mono text-[11px] text-blue-600 font-medium">Source Header: &quot;{m.sourceHeader}&quot;</span>
                      </div>
                      <div className="text-right">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 block">
                          {m.sampleExtractedValue}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{m.transformationRule}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extraction Guidelines */}
              {selectedStandardTemplate.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Template Extraction Guidelines
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedStandardTemplate.notes}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleStandardStatus(selectedStandardTemplate.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer border ${selectedStandardTemplate.status === 'Active'
                    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                >
                  {selectedStandardTemplate.status === 'Active' ? 'Deactivate Template' : 'Activate Template'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const tpl = selectedStandardTemplate
                    setSelectedStandardTemplate(null)
                    openEditStandardModal(tpl)
                  }}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer"
                >
                  Edit Field Mapping Schema
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
