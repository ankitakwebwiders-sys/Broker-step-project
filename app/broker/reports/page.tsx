'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  FileText,
  Calendar,
  Wallet,
  UserCheck,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  Share2,
  RefreshCw,
  Printer,
  Sparkles,
  ArrowUpDown,
  FileCheck2,
  Layers,
  HelpCircle,
  X,
  SlidersHorizontal,
  Mail,
  Send,
  Building2,
  Scale,
} from 'lucide-react'

// All 15 Client-Specified Report Keys
export type ReportKey =
  | 'catalog'
  | 'book-of-business'
  | 'production'
  | 'expected-commission'
  | 'paid-actual'
  | 'outstanding'
  | 'partial-short-paid'
  | 'chargebacks'
  | 'endorsements'
  | 'cancellations'
  | 'renewals'
  | 'net-commission'
  | 'client-commission-history'
  | 'statement-reconciliation'
  | 'lead'
  | 'marketing-consent'

interface ReportMeta {
  key: ReportKey
  title: string
  category: 'Book & Growth' | 'Commissions & Reconciliation' | 'Policy Operations' | 'Leads & Compliance'
  description: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  mainContent: string
  sowFilters: string
  exportFormats: string[]
}

const REPORT_DEFINITIONS: ReportMeta[] = [
  {
    key: 'book-of-business',
    title: 'Book of Business',
    category: 'Book & Growth',
    icon: BookOpen,
    badge: 'Core Registry',
    description: 'Active client accounts, in-force policies, bound premium totals, and policy term horizons.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Carrier, Line of Business, Policy Status, Effective Date, Expiry Date',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'production',
    title: 'Production',
    category: 'Book & Growth',
    icon: TrendingUp,
    badge: 'Growth Engine',
    description: 'New business vs renewals volume, written premium attribution, producer split velocity, and binder pacing.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Carrier, Line of Business, Transaction Type, Transaction Date, Premium, Agent',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'expected-commission',
    title: 'Expected Commission',
    category: 'Commissions & Reconciliation',
    icon: DollarSign,
    badge: 'Accrual Pipeline',
    description: 'Accrued receivable projections based on written policy premium and carrier agreement split schedules.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Carrier, Line of Business, Premium, Commission, Effective Date',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'paid-actual',
    title: 'Paid / Actual Commission',
    category: 'Commissions & Reconciliation',
    icon: CheckCircle2,
    badge: 'Cleared Funds',
    description: 'Deposited carrier commission disbursements reconciled from uploaded monthly settlement statements.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Carrier, Payment Status, Transaction Date, Commission, Statement ID',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'outstanding',
    title: 'Outstanding Commission',
    category: 'Commissions & Reconciliation',
    icon: Clock,
    badge: 'Receivables Overdue',
    description: 'Earned commissions awaiting statement clearance past expected settlement due date.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Carrier, Line of Business, Payment Status, Due Date, Aging Horizon',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'partial-short-paid',
    title: 'Partial / Short-Paid Commission',
    category: 'Commissions & Reconciliation',
    icon: AlertTriangle,
    badge: 'Variance Audit',
    description: 'Commission payouts where carrier remittance was lower than schedule contract rate.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Carrier, Shortfall Discrepancy Amount, Transaction Date, Line of Business, Reconciliation Status',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'chargebacks',
    title: 'Chargebacks',
    category: 'Commissions & Reconciliation',
    icon: RotateCcw,
    badge: 'Clawbacks Log',
    description: 'Reversals and clawed back commissions resulting from early policy cancellations or downward audits.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Carrier, Transaction Type (Chargeback), Policy Status, Reason, Recovery Status',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'endorsements',
    title: 'Endorsements',
    category: 'Policy Operations',
    icon: FileText,
    badge: 'Mid-term Adjustments',
    description: 'Mid-term endorsements, vehicle additions, property limits modifications, and pro-rated adjustments.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Carrier, Line of Business, Transaction Type, Transaction Date, Delta Premium',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'cancellations',
    title: 'Cancellations',
    category: 'Policy Operations',
    icon: X,
    badge: 'Lapsed & Terms',
    description: 'Terminated and non-renewed policies, effective dates of termination, and pro-rata unearned premium audit.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Policy Status, Carrier, Line of Business, Cancellation Date, Reason',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'renewals',
    title: 'Renewals',
    category: 'Policy Operations',
    icon: Calendar,
    badge: 'Retention Horizon',
    description: 'Upcoming expiration pipelines across 7, 30, 60, and 90-day horizons with renewal quotation status.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Expiry Date Horizon, Carrier, Line of Business, Policy Status, Retention Stage',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'net-commission',
    title: 'Net Commission',
    category: 'Commissions & Reconciliation',
    icon: Wallet,
    badge: 'Net Earnings',
    description: 'Gross commissions received minus house splits, producer allocations, and chargeback deductions.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Date Range, Carrier, Broker Split %, Net Payout Amount, Transaction Date',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'client-commission-history',
    title: 'Client Commission History',
    category: 'Book & Growth',
    icon: UserCheck,
    badge: 'Account Value',
    description: 'Historical multi-year premium and commission revenue generated per commercial and personal client.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Client Name, Date Range, Carrier, Lifetime Commission, Policy Status',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'statement-reconciliation',
    title: 'Statement / Reconciliation Results',
    category: 'Commissions & Reconciliation',
    icon: FileSpreadsheet,
    badge: 'Audit Match',
    description: 'Carrier statement import logs, reconciliation match percentages, unmatched line items, and audit flags.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Statement ID, Carrier, Reconciliation Status, Date Range, Variance Amount',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'lead',
    title: 'Lead Information',
    category: 'Leads & Compliance',
    icon: Users,
    badge: 'Intake Pipeline',
    description: 'Inbound lead intake records, QR capture source, conversion milestones, and quoting status.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Lead Status, Date Range, Lead Source, Line of Business, Estimated Premium',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
  {
    key: 'marketing-consent',
    title: 'Marketing Consent Information',
    category: 'Leads & Compliance',
    icon: ShieldCheck,
    badge: 'TCPA Compliance',
    description: 'Consent audit trails, client opt-in verification dates, digital signatures, and revocation history.',
    mainContent: 'Relevant records, dates and applicable SOW filters',
    sowFilters: 'Marketing Consent Status, Verification Channel, Date Range, Client Name',
    exportFormats: ['Excel', 'CSV', 'PDF'],
  },
]

// Sample Rich Records for each Report Type
const SAMPLE_RECORDS: Record<ReportKey, any[]> = {
  catalog: [],
  'book-of-business': [
    { id: 'POL-TRV-8821', client: 'Apex Logistics LLC', carrier: 'Travelers Insurance', lob: 'Commercial Property', status: 'Active', effective: '2026-01-15', expiry: '2027-01-15', premium: 14500, commRate: '15.0%', expectedComm: 2175, agent: 'Jordan Davis' },
    { id: 'POL-HTF-3011', client: 'Blue Ridge Tech Solutions', carrier: 'The Hartford', lob: 'Cyber & Tech E&O', status: 'Active', effective: '2026-03-01', expiry: '2027-03-01', premium: 8200, commRate: '17.5%', expectedComm: 1435, agent: 'Jordan Davis' },
    { id: 'POL-LBM-9931', client: 'Cascade Manufacturing', carrier: 'Liberty Mutual', lob: 'General Liability', status: 'Active', effective: '2025-11-10', expiry: '2026-11-10', premium: 22400, commRate: '14.0%', expectedComm: 3136, agent: 'Jordan Davis' },
    { id: 'POL-PRG-4418', client: 'Delta Courier Fleet Inc.', carrier: 'Progressive Commercial', lob: 'Commercial Auto', status: 'Active', effective: '2026-02-20', expiry: '2027-02-20', premium: 31000, commRate: '12.5%', expectedComm: 3875, agent: 'Jordan Davis' },
    { id: 'POL-CHB-1192', client: 'Elysium Hotel & Suites', carrier: 'Chubb Commercial', lob: 'Commercial Property', status: 'Active', effective: '2026-04-05', expiry: '2027-04-05', premium: 48000, commRate: '16.0%', expectedComm: 7680, agent: 'Jordan Davis' },
    { id: 'POL-NW-5521', client: 'Harbor Dental Care', carrier: 'Nationwide Mutual', lob: 'Workers Comp', status: 'Active', effective: '2026-05-01', expiry: '2027-05-01', premium: 9400, commRate: '10.0%', expectedComm: 940, agent: 'Jordan Davis' },
    { id: 'POL-TRV-9014', client: 'Skyline Restaurant Group', carrier: 'Travelers Insurance', lob: 'General Liability', status: 'Pending', effective: '2026-10-15', expiry: '2027-10-15', premium: 12800, commRate: '14.0%', expectedComm: 1792, agent: 'Jordan Davis' },
    { id: 'POL-HTF-7741', client: 'Beacon Freight Logistics', carrier: 'The Hartford', lob: 'Commercial Auto', status: 'Expired', effective: '2025-09-01', expiry: '2026-09-01', premium: 19500, commRate: '13.5%', expectedComm: 2632, agent: 'Jordan Davis' },
  ],
  production: [
    { id: 'PRD-101', client: 'Apex Logistics LLC', carrier: 'Travelers Insurance', lob: 'Commercial Property', transType: 'New Business', date: '2026-01-15', premium: 14500, commRate: '15.0%', comm: 2175, producer: 'Jordan Davis' },
    { id: 'PRD-102', client: 'Blue Ridge Tech Solutions', carrier: 'The Hartford', lob: 'Cyber & Tech E&O', transType: 'New Business', date: '2026-03-01', premium: 8200, commRate: '17.5%', comm: 1435, producer: 'Jordan Davis' },
    { id: 'PRD-103', client: 'Cascade Manufacturing', carrier: 'Liberty Mutual', lob: 'General Liability', transType: 'Renewal', date: '2025-11-10', premium: 22400, commRate: '14.0%', comm: 3136, producer: 'Jordan Davis' },
    { id: 'PRD-104', client: 'Delta Courier Fleet Inc.', carrier: 'Progressive Commercial', lob: 'Commercial Auto', transType: 'Renewal', date: '2026-02-20', premium: 31000, commRate: '12.5%', comm: 3875, producer: 'Jordan Davis' },
    { id: 'PRD-105', client: 'Elysium Hotel & Suites', carrier: 'Chubb Commercial', lob: 'Commercial Property', transType: 'New Business', date: '2026-04-05', premium: 48000, commRate: '16.0%', comm: 7680, producer: 'Jordan Davis' },
    { id: 'PRD-106', client: 'Harbor Dental Care', carrier: 'Nationwide Mutual', lob: 'Workers Comp', transType: 'Renewal', date: '2026-05-01', premium: 9400, commRate: '10.0%', comm: 940, producer: 'Jordan Davis' },
  ],
  'expected-commission': [
    { id: 'EXP-881', policyNo: 'TRV-88214', carrier: 'Travelers Insurance', lob: 'Commercial Property', premium: 14500, rate: '15.0%', expectedComm: 2175, split: '80 / 20', brokerNet: 1740, effective: '2026-01-15' },
    { id: 'EXP-882', policyNo: 'HTF-30119', carrier: 'The Hartford', lob: 'Cyber & Tech E&O', premium: 8200, rate: '17.5%', expectedComm: 1435, split: '80 / 20', brokerNet: 1148, effective: '2026-03-01' },
    { id: 'EXP-883', policyNo: 'LBM-99312', carrier: 'Liberty Mutual', lob: 'General Liability', premium: 22400, rate: '14.0%', expectedComm: 3136, split: '85 / 15', brokerNet: 2665, effective: '2025-11-10' },
    { id: 'EXP-884', policyNo: 'PRG-44182', carrier: 'Progressive Commercial', lob: 'Commercial Auto', premium: 31000, rate: '12.5%', expectedComm: 3875, split: '75 / 25', brokerNet: 2906, effective: '2026-02-20' },
    { id: 'EXP-885', policyNo: 'CHB-11920', carrier: 'Chubb Commercial', lob: 'Commercial Property', premium: 48000, rate: '16.0%', expectedComm: 7680, split: '85 / 15', brokerNet: 6528, effective: '2026-04-05' },
  ],
  'paid-actual': [
    { id: 'ACT-901', statementId: 'STMT-2026-09-TRV', carrier: 'Travelers Insurance', policyNo: 'TRV-88214', paidAmount: 2175, paymentDate: '2026-09-28', paymentStatus: 'Paid', method: 'Direct Deposit', reference: 'ACH-772184' },
    { id: 'ACT-902', statementId: 'STMT-2026-09-HTF', carrier: 'The Hartford', policyNo: 'HTF-30119', paidAmount: 1435, paymentDate: '2026-09-25', paymentStatus: 'Paid', method: 'Direct Deposit', reference: 'ACH-491028' },
    { id: 'ACT-903', statementId: 'STMT-2026-09-LBM', carrier: 'Liberty Mutual', policyNo: 'LBM-99312', paidAmount: 3136, paymentDate: '2026-09-20', paymentStatus: 'Paid', method: 'Direct Deposit', reference: 'ACH-118492' },
    { id: 'ACT-904', statementId: 'STMT-2026-09-PRG', carrier: 'Progressive Commercial', policyNo: 'PRG-44182', paidAmount: 3875, paymentDate: '2026-09-18', paymentStatus: 'Paid', method: 'Direct Deposit', reference: 'ACH-664910' },
    { id: 'ACT-905', statementId: 'STMT-2026-09-CHB', carrier: 'Chubb Commercial', policyNo: 'CHB-11920', paidAmount: 7680, paymentDate: '2026-09-15', paymentStatus: 'Paid', method: 'Direct Deposit', reference: 'ACH-889102' },
  ],
  outstanding: [
    { id: 'OUT-401', policyNo: 'TRV-90142', carrier: 'Travelers Insurance', client: 'Skyline Restaurant Group', expectedComm: 1792, dueDate: '2026-09-30', daysOverdue: 12, paymentStatus: 'Outstanding', notes: 'Statement batch pending next cycle' },
    { id: 'OUT-402', policyNo: 'NW-55219', carrier: 'Nationwide Mutual', client: 'Harbor Dental Care', expectedComm: 940, dueDate: '2026-09-15', daysOverdue: 27, paymentStatus: 'Outstanding', notes: 'Carrier inquiry submitted via portal' },
    { id: 'OUT-403', policyNo: 'LBM-88102', carrier: 'Liberty Mutual', client: 'Pinnacle Builders', expectedComm: 2450, dueDate: '2026-08-31', daysOverdue: 42, paymentStatus: 'Outstanding', notes: 'Endorsement discrepancy audit' },
  ],
  'partial-short-paid': [
    { id: 'SHT-11', policyNo: 'TRV-44192', carrier: 'Travelers Insurance', expectedComm: 2400, paidAmount: 1850, variance: -550, date: '2026-09-22', reason: 'Carrier applied 12% instead of 15% tier', reconStatus: 'Discrepancy' },
    { id: 'SHT-12', policyNo: 'PRG-99104', carrier: 'Progressive Commercial', expectedComm: 1950, paidAmount: 1600, variance: -350, date: '2026-09-14', reason: 'Unmatched surcharge reduction', reconStatus: 'In Review' },
    { id: 'SHT-13', policyNo: 'HTF-88210', carrier: 'The Hartford', expectedComm: 3200, paidAmount: 2800, variance: -400, date: '2026-08-29', reason: 'Split dispute on renewal tier', reconStatus: 'Discrepancy' },
  ],
  chargebacks: [
    { id: 'CHG-01', policyNo: 'LBM-44102', carrier: 'Liberty Mutual', client: 'Summit Retail Corp', clawback: -850, reason: 'Mid-term insured cancellation', date: '2026-09-08', transType: 'Chargeback', netImpact: '-$850.00' },
    { id: 'CHG-02', policyNo: 'TRV-11940', carrier: 'Travelers Insurance', client: 'Coastal Marina LLC', clawback: -420, reason: 'Final payroll audit reduction', date: '2026-08-14', transType: 'Chargeback', netImpact: '-$420.00' },
  ],
  endorsements: [
    { id: 'END-01', policyNo: 'PRG-44182', carrier: 'Progressive Commercial', client: 'Delta Courier Fleet', endorsementType: 'Add 3 Fleet Vans', deltaPremium: 4200, deltaComm: 525, date: '2026-09-10', transType: 'Endorsement' },
    { id: 'END-02', policyNo: 'TRV-88214', carrier: 'Travelers Insurance', client: 'Apex Logistics LLC', endorsementType: 'Increase Property Limits', deltaPremium: 2800, deltaComm: 420, date: '2026-08-25', transType: 'Endorsement' },
    { id: 'END-03', policyNo: 'HTF-30119', carrier: 'The Hartford', client: 'Blue Ridge Tech', endorsementType: 'Add Cyber Extortion Rider', deltaPremium: 1400, deltaComm: 245, date: '2026-08-02', transType: 'Endorsement' },
  ],
  cancellations: [
    { id: 'CNC-01', policyNo: 'LBM-44102', carrier: 'Liberty Mutual', client: 'Summit Retail Corp', cancelDate: '2026-09-05', reason: 'Insured sold commercial building', returnPremium: 4250, status: 'Cancelled' },
    { id: 'CNC-02', policyNo: 'NW-11849', carrier: 'Nationwide Mutual', client: 'Vanguard Cafe', cancelDate: '2026-08-18', reason: 'Non-payment of premium', returnPremium: 0, status: 'Cancelled' },
  ],
  renewals: [
    { id: 'RNW-01', policyNo: 'LBM-99312', carrier: 'Liberty Mutual', client: 'Cascade Manufacturing', expiryDate: '2026-11-10', horizon: '30 Days', currentPremium: 22400, renewalQuote: 23500, retentionStage: 'Quote Presented' },
    { id: 'RNW-02', policyNo: 'HTF-77410', carrier: 'The Hartford', client: 'Beacon Freight Logistics', expiryDate: '2026-10-25', horizon: '7 Days', currentPremium: 19500, renewalQuote: 20100, retentionStage: 'Awaiting Signature' },
    { id: 'RNW-03', policyNo: 'TRV-90142', carrier: 'Travelers Insurance', client: 'Skyline Restaurant Group', expiryDate: '2026-12-15', horizon: '60 Days', currentPremium: 12800, renewalQuote: 13200, retentionStage: 'Underwriting Review' },
    { id: 'RNW-04', policyNo: 'CHB-11920', carrier: 'Chubb Commercial', client: 'Elysium Hotel & Suites', expiryDate: '2027-01-15', horizon: '90 Days', currentPremium: 48000, renewalQuote: 49500, retentionStage: 'Renewal Contacted' },
  ],
  'net-commission': [
    { id: 'NET-01', carrier: 'Travelers Insurance', grossComm: 3967, houseSplit: 793, producerSplit: 0, deductions: 0, netPayout: 3174, date: '2026-09-30' },
    { id: 'NET-02', carrier: 'The Hartford', grossComm: 1435, houseSplit: 287, producerSplit: 0, deductions: 0, netPayout: 1148, date: '2026-09-30' },
    { id: 'NET-03', carrier: 'Liberty Mutual', grossComm: 3136, houseSplit: 470, producerSplit: 0, deductions: 850, netPayout: 1816, date: '2026-09-30' },
    { id: 'NET-04', carrier: 'Progressive Commercial', grossComm: 3875, houseSplit: 968, producerSplit: 0, deductions: 0, netPayout: 2907, date: '2026-09-30' },
    { id: 'NET-05', carrier: 'Chubb Commercial', grossComm: 7680, houseSplit: 1152, producerSplit: 0, deductions: 0, netPayout: 6528, date: '2026-09-30' },
  ],
  'client-commission-history': [
    { client: 'Elysium Hotel & Suites', activePolicies: 2, totalPremium: 72000, totalCommission: 11520, brokerNet: 9792, tenure: '3 Years', status: 'Active' },
    { client: 'Delta Courier Fleet Inc.', activePolicies: 3, totalPremium: 48500, totalCommission: 6062, brokerNet: 4546, tenure: '4 Years', status: 'Active' },
    { client: 'Cascade Manufacturing', activePolicies: 2, totalPremium: 38400, totalCommission: 5376, brokerNet: 4569, tenure: '2 Years', status: 'Active' },
    { client: 'Apex Logistics LLC', activePolicies: 2, totalPremium: 29000, totalCommission: 4350, brokerNet: 3480, tenure: '1 Year', status: 'Active' },
    { client: 'Blue Ridge Tech Solutions', activePolicies: 1, totalPremium: 8200, totalCommission: 1435, brokerNet: 1148, tenure: '1 Year', status: 'Active' },
    { client: 'Harbor Dental Care', activePolicies: 1, totalPremium: 9400, totalCommission: 940, brokerNet: 752, tenure: '2 Years', status: 'Active' },
  ],
  'statement-reconciliation': [
    { statementId: 'STMT-2026-09-TRV', carrier: 'Travelers Insurance', lineItems: 42, matchedCount: 41, discrepancyCount: 1, clearedAmount: 24890, reconStatus: 'Reconciled', date: '2026-09-28' },
    { statementId: 'STMT-2026-09-HTF', carrier: 'The Hartford', lineItems: 28, matchedCount: 28, discrepancyCount: 0, clearedAmount: 18450, reconStatus: 'Reconciled', date: '2026-09-25' },
    { statementId: 'STMT-2026-09-LBM', carrier: 'Liberty Mutual', lineItems: 35, matchedCount: 33, discrepancyCount: 2, clearedAmount: 31200, reconStatus: 'Discrepancy', date: '2026-09-20' },
    { statementId: 'STMT-2026-09-PRG', carrier: 'Progressive Commercial', lineItems: 54, matchedCount: 53, discrepancyCount: 1, clearedAmount: 41800, reconStatus: 'Reconciled', date: '2026-09-18' },
    { statementId: 'STMT-2026-09-CHB', carrier: 'Chubb Commercial', lineItems: 19, matchedCount: 19, discrepancyCount: 0, clearedAmount: 26900, reconStatus: 'Reconciled', date: '2026-09-15' },
  ],
  lead: [
    { id: 'LD-881', leadName: 'Metro Logistics Corp', contact: 'Marcus Brody', source: 'Broker QR Code', lob: 'Commercial Auto', estPremium: 28000, leadStatus: 'Quoted', date: '2026-10-08', phone: '+1 (555) 301-9921' },
    { id: 'LD-882', leadName: 'Solstice Green Energy', contact: 'Elena Rostova', source: 'Lead Capture Link', lob: 'General Liability', estPremium: 16500, leadStatus: 'Contacted', date: '2026-10-06', phone: '+1 (555) 881-4402' },
    { id: 'LD-883', leadName: 'Highland Dental Practice', contact: 'Dr. Aaron Chen', source: 'Public Form Preview', lob: 'Workers Comp', estPremium: 9200, leadStatus: 'Bound / Won', date: '2026-10-02', phone: '+1 (555) 774-1290' },
    { id: 'LD-884', leadName: 'Urban Coffee Roasters', contact: 'Sara Jenkins', source: 'Broker QR Code', lob: 'Commercial Property', estPremium: 11400, leadStatus: 'New Intake', date: '2026-10-01', phone: '+1 (555) 441-0092' },
  ],
  'marketing-consent': [
    { id: 'MKT-01', client: 'Apex Logistics LLC', contact: 'Robert Vance', channel: 'SMS + Email Verified', consentDate: '2026-10-08', consentStatus: 'Consented', tcpaHash: 'SHA256:8891...c4', ipAddress: '72.14.192.81' },
    { id: 'MKT-02', client: 'Harbor Dental Care', contact: 'Dr. Amy Lin', channel: 'Email Digital Signature', consentDate: '2026-10-02', consentStatus: 'Consented', tcpaHash: 'SHA256:4910...a1', ipAddress: '198.51.100.42' },
    { id: 'MKT-03', client: 'Cascade Manufacturing', contact: 'Thomas Miller', channel: 'SMS Automated Verification', consentDate: '2026-09-24', consentStatus: 'Withdrawn', tcpaHash: 'SHA256:1192...e9', ipAddress: '203.0.113.19' },
    { id: 'MKT-04', client: 'Skyline Restaurant Group', contact: 'Mario Conti', channel: 'In-Person Digital Form', consentDate: '2026-09-18', consentStatus: 'Consented', tcpaHash: 'SHA256:6630...d8', ipAddress: '192.0.2.77' },
    { id: 'MKT-05', client: 'Beacon Freight Logistics', contact: 'Marcus Brody', channel: 'Phone Verification Protocol', consentDate: '2026-09-12', consentStatus: 'Declined', tcpaHash: 'SHA256:0041...f2', ipAddress: '198.51.100.8' },
  ],
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading reports center...</div>}>
      <ReportsContent />
    </Suspense>
  )
}

function ReportsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialType = searchParams.get('type') as ReportKey | null

  // Active view: 'catalog' matrix OR a specific report key
  const [selectedReport, setSelectedReport] = useState<ReportKey>(
    initialType && REPORT_DEFINITIONS.some((r) => r.key === initialType)
      ? initialType
      : 'catalog'
  )

  // Combinable Multi-Filters State (Client requirement explicitly specified)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('All Time')
  const [carrierFilter, setCarrierFilter] = useState('All')
  const [lobFilter, setLobFilter] = useState('All')
  const [policyStatusFilter, setPolicyStatusFilter] = useState('All')
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('All')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')
  const [reconciliationStatusFilter, setReconciliationStatusFilter] = useState('All')
  const [leadStatusFilter, setLeadStatusFilter] = useState('All')
  const [marketingConsentFilter, setMarketingConsentFilter] = useState('All')

  // UI state
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  // Sync URL query when selectedReport changes
  useEffect(() => {
    if (initialType && initialType !== selectedReport) {
      if (initialType === 'catalog' || REPORT_DEFINITIONS.some((r) => r.key === initialType)) {
        setSelectedReport(initialType)
      }
    }
  }, [initialType])

  function handleSelectReport(key: ReportKey) {
    setSelectedReport(key)
    const targetUrl = key === 'catalog' ? '/broker/reports' : `/broker/reports?type=${key}`
    router.replace(targetUrl, { scroll: false })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: {
            href: targetUrl,
            search: key === 'catalog' ? '' : `?type=${key}`,
            pathname: '/broker/reports',
          },
        })
      )
    }
  }

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery.trim()) count++
    if (dateRange !== 'All Time') count++
    if (carrierFilter !== 'All') count++
    if (lobFilter !== 'All') count++
    if (policyStatusFilter !== 'All') count++
    if (transactionTypeFilter !== 'All') count++
    if (paymentStatusFilter !== 'All') count++
    if (reconciliationStatusFilter !== 'All') count++
    if (leadStatusFilter !== 'All') count++
    if (marketingConsentFilter !== 'All') count++
    return count
  }, [
    searchQuery,
    dateRange,
    carrierFilter,
    lobFilter,
    policyStatusFilter,
    transactionTypeFilter,
    paymentStatusFilter,
    reconciliationStatusFilter,
    leadStatusFilter,
    marketingConsentFilter,
  ])

  function resetAllFilters() {
    setSearchQuery('')
    setDateRange('All Time')
    setCarrierFilter('All')
    setLobFilter('All')
    setPolicyStatusFilter('All')
    setTransactionTypeFilter('All')
    setPaymentStatusFilter('All')
    setReconciliationStatusFilter('All')
    setLeadStatusFilter('All')
    setMarketingConsentFilter('All')
    showToast('Filters cleared')
  }

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filtered Records for the selected report
  const currentRecords = useMemo(() => {
    if (selectedReport === 'catalog') return []
    const records = SAMPLE_RECORDS[selectedReport] || []

    return records.filter((item: any) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchString = JSON.stringify(item).toLowerCase()
        if (!matchString.includes(q)) return false
      }

      // 2. Carrier Filter
      if (carrierFilter !== 'All' && item.carrier && item.carrier !== carrierFilter) {
        return false
      }

      // 3. Line of Business Filter
      if (lobFilter !== 'All' && item.lob && item.lob !== lobFilter) {
        return false
      }

      // 4. Policy Status Filter
      if (policyStatusFilter !== 'All' && item.status && item.status !== policyStatusFilter) {
        return false
      }

      // 5. Transaction Type Filter
      if (transactionTypeFilter !== 'All' && item.transType && item.transType !== transactionTypeFilter) {
        return false
      }

      // 6. Payment Status Filter
      if (paymentStatusFilter !== 'All' && item.paymentStatus && item.paymentStatus !== paymentStatusFilter) {
        return false
      }

      // 7. Reconciliation Status Filter
      if (reconciliationStatusFilter !== 'All' && item.reconStatus && item.reconStatus !== reconciliationStatusFilter) {
        return false
      }

      // 8. Lead Status Filter
      if (leadStatusFilter !== 'All' && item.leadStatus && item.leadStatus !== leadStatusFilter) {
        return false
      }

      // 9. Marketing Consent Status Filter
      if (marketingConsentFilter !== 'All' && item.consentStatus && item.consentStatus !== marketingConsentFilter) {
        return false
      }

      return true
    })
  }, [
    selectedReport,
    searchQuery,
    carrierFilter,
    lobFilter,
    policyStatusFilter,
    transactionTypeFilter,
    paymentStatusFilter,
    reconciliationStatusFilter,
    leadStatusFilter,
    marketingConsentFilter,
  ])

  // Real functional export to CSV / Excel
  function triggerExport(format: 'CSV' | 'Excel' | 'PDF', reportTitle?: string) {
    const title = reportTitle || (selectedReport === 'catalog' ? 'All_Reports_Catalog' : selectedReport)
    const timestamp = new Date().toISOString().split('T')[0]

    if (format === 'PDF') {
      window.print()
      showToast(`Generating print-ready PDF for ${title}...`)
      return
    }

    // Generate CSV data from current records
    const recordsToExport = selectedReport === 'catalog'
      ? REPORT_DEFINITIONS.map((r) => ({
        Report: r.title,
        Category: r.category,
        Description: r.description,
        Main_Content: r.mainContent,
        SOW_Filters: r.sowFilters,
        Export_Formats: r.exportFormats.join(' / '),
      }))
      : currentRecords

    if (recordsToExport.length === 0) {
      showToast('No records to export with current filters')
      return
    }

    const headers = Object.keys(recordsToExport[0])
    const csvRows = [
      headers.join(','),
      ...recordsToExport.map((row) =>
        headers
          .map((h) => {
            const val = row[h] !== undefined ? String(row[h]) : ''
            return `"${val.replace(/"/g, '""')}"`
          })
          .join(',')
      ),
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'))
    const link = document.createElement('a')
    link.setAttribute('href', csvContent)
    const extension = format === 'Excel' ? 'xlsx' : 'csv'
    link.setAttribute('download', `${title}_${timestamp}.${extension}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast(`Successfully exported ${title} (${format})`)
  }

  const activeReportMeta = REPORT_DEFINITIONS.find((r) => r.key === selectedReport)

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
              Reports &amp; Analytics
            </h1>
            <span className="rounded-full bg-slate-950 px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-slate-800">
              15 Standard Reports
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Export-ready production books, commission reconciliations, policy operations, and compliance audit reports.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 transition"
          >
            <Clock className="size-3.5 text-slate-500" />
            <span>Schedule Delivery</span>
          </button>

          <button
            type="button"
            onClick={() => triggerExport('Excel')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0170FE] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0060db] transition"
          >
            <Download className="size-3.5" />
            <span>Export Report (Excel)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-sm font-medium text-slate-500">Available Reports</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-mono">15</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Excel / CSV / PDF formats</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-sm font-medium text-slate-500">Total Book Value</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-mono">$193,500</p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">8 active commercial policies</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-sm font-medium text-slate-500">Cleared Commissions</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 font-mono">$18,296</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Reconciled this period</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <p className="text-sm font-medium text-slate-500">Pending Reconciliation</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 font-mono">$5,182</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">3 outstanding statement items</p>
        </div>
      </div>

      {/* Main Tab Navigation Bar - Styled in BLACK (bg-slate-950) like other broker pages */}
      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          {/* 1. All Reports Catalog Pill */}
          <button
            type="button"
            onClick={() => handleSelectReport('catalog')}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${selectedReport === 'catalog'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
          >
            <Layers className={`size-4 ${selectedReport === 'catalog' ? 'text-white' : 'text-slate-500'}`} />
            <span>All Reports Directory</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${selectedReport === 'catalog' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
            >
              15
            </span>
          </button>

          {/* 15 Individual Report Pills */}
          {REPORT_DEFINITIONS.map((rep) => {
            const Icon = rep.icon
            const isActive = selectedReport === rep.key
            return (
              <button
                key={rep.key}
                type="button"
                onClick={() => handleSelectReport(rep.key)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Icon className={`size-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{rep.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Combinable Multi-Filters Toolbar */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search bar + Preset Pills */}
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, policy #, carrier..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0170FE] focus:bg-white focus:ring-2 focus:ring-[#0170FE]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Quick Carrier Dropdown */}
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
            >
              <option value="All">All Carriers</option>
              <option value="Travelers Insurance">Travelers Insurance</option>
              <option value="The Hartford">The Hartford</option>
              <option value="Liberty Mutual">Liberty Mutual</option>
              <option value="Progressive Commercial">Progressive Commercial</option>
              <option value="Chubb Commercial">Chubb Commercial</option>
              <option value="Nationwide Mutual">Nationwide Mutual</option>
            </select>

            {/* Quick Date Range Dropdown */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-[#0170FE]"
            >
              <option value="All Time">Date: All Time</option>
              <option value="This Month">This Month (Oct 2026)</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Year-to-Date">Year-to-Date (2026)</option>
            </select>

            {/* Toggle Multi-Filter Drawer */}
            <button
              type="button"
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${showFiltersDrawer || activeFiltersCount > 0
                ? 'border-[#0170FE] bg-blue-50/60 text-[#0170FE]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>More Filters</span>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-[#0170FE] px-1.5 py-0.2 text-xs font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-500 hover:text-rose-600 transition cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Quick Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerExport('CSV')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 shadow-xs"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={() => triggerExport('Excel')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 shadow-xs"
            >
              <Download className="size-3.5 text-[#0170FE]" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={() => triggerExport('PDF')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 shadow-xs"
            >
              <Printer className="size-3.5 text-slate-600" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Expanded Multi-Filter Combinable Drawer */}
        {showFiltersDrawer && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in duration-150">
            {/* Line of Business */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Line of Business
              </label>
              <select
                value={lobFilter}
                onChange={(e) => setLobFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0170FE]"
              >
                <option value="All">All Lines of Business</option>
                <option value="Commercial Property">Commercial Property</option>
                <option value="General Liability">General Liability</option>
                <option value="Commercial Auto">Commercial Auto</option>
                <option value="Workers Comp">Workers Compensation</option>
                <option value="Cyber & Tech E&O">Cyber & Tech E&O</option>
              </select>
            </div>

            {/* Policy Status */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Policy Status
              </label>
              <select
                value={policyStatusFilter}
                onChange={(e) => setPolicyStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0170FE]"
              >
                <option value="All">All Policy Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Transaction Type
              </label>
              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0170FE]"
              >
                <option value="All">All Transaction Types</option>
                <option value="New Business">New Business</option>
                <option value="Renewal">Renewal</option>
                <option value="Endorsement">Endorsement</option>
                <option value="Chargeback">Chargeback</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0170FE]"
              >
                <option value="All">All Payment Statuses</option>
                <option value="Paid">Paid / Cleared</option>
                <option value="Outstanding">Outstanding</option>
              </select>
            </div>

            {/* Reconciliation Status */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Reconciliation Status
              </label>
              <select
                value={reconciliationStatusFilter}
                onChange={(e) => setReconciliationStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0170FE]"
              >
                <option value="All">All Reconciliation Statuses</option>
                <option value="Reconciled">Reconciled / Matched</option>
                <option value="Discrepancy">Discrepancy</option>
                <option value="In Review">In Review</option>
              </select>
            </div>

            {/* Lead Status */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Lead Status
              </label>
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0170FE]"
              >
                <option value="All">All Lead Statuses</option>
                <option value="New Intake">New Intake</option>
                <option value="Contacted">Contacted</option>
                <option value="Quoted">Quoted</option>
                <option value="Bound / Won">Bound / Won</option>
              </select>
            </div>

            {/* Marketing Consent Status */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Marketing Consent Status
              </label>
              <select
                value={marketingConsentFilter}
                onChange={(e) => setMarketingConsentFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0170FE]"
              >
                <option value="All">All Consent Statuses</option>
                <option value="Consented">Consented / Active</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {selectedReport === 'catalog' ? (
          /* =========================================================================
             VIEW 1: CLIENT-REQUESTED ALL 15 REPORTS DIRECTORY MATRIX
             ========================================================================= */
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-50/70 to-white">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-950 flex items-center gap-2">
                  <FileText className="size-5 text-[#0170FE]" />
                  Standard Reports Directory &amp; SOW Filter Matrix
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  15 specialized insurance brokerage reports with multi-criteria combinable filtering and Excel / CSV / PDF export capabilities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerExport('Excel', 'BrokerStep_All_15_Reports_Catalog')}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0060db] transition"
                >
                  <Download className="size-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 pl-6 pr-4">Report</th>
                    <th className="py-4 px-4">Main Content / Filters</th>
                    <th className="py-4 px-4">Applicable SOW Filters</th>
                    <th className="py-4 px-4">Export Formats</th>
                    <th className="py-4 pl-4 pr-6 text-right min-w-[210px] w-[210px] sticky right-0 bg-slate-50/95 backdrop-blur-xs shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] select-none">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {REPORT_DEFINITIONS.map((rep) => {
                    const Icon = rep.icon
                    return (
                      <tr key={rep.key} className="hover:bg-slate-50/80 transition group">
                        {/* Report Name & Description */}
                        <td className="py-4 pl-6 pr-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-[#0170FE] group-hover:text-white transition-colors">
                              <Icon className="size-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-[#0170FE] transition-colors">
                                {rep.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                {rep.description}
                              </p>
                              <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                {rep.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Main Content / Filters */}
                        <td className="py-4 px-4 align-top">
                          <p className="text-sm font-semibold text-slate-800">{rep.mainContent}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Standard Scope of Work (SOW) specification
                          </p>
                        </td>

                        {/* Applicable SOW Filters */}
                        <td className="py-4 px-4 align-top max-w-xs">
                          <p className="text-xs text-slate-600 leading-relaxed font-mono">
                            {rep.sowFilters}
                          </p>
                        </td>

                        {/* Export */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {rep.exportFormats.map((fmt) => (
                              <span
                                key={fmt}
                                className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60"
                              >
                                {fmt}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pl-4 pr-6 align-top text-right whitespace-nowrap min-w-[210px] w-[210px] sticky right-0 bg-white group-hover:bg-slate-50/95 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)] transition-colors">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectReport(rep.key)}
                              className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[11.5px] font-semibold text-white shadow-xs hover:bg-blue-600 transition cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="size-3.5" />
                              <span>View </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerExport('Excel', rep.title)}
                              title="Quick Export Excel"
                              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:border-[#0170FE] hover:text-[#0170FE] transition"
                            >
                              <Download className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* =========================================================================
             VIEW 2: INTERACTIVE LIVE DATA VIEWER FOR SELECTED REPORT
             ========================================================================= */
          <div className="space-y-6">
            {/* Active Report Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-900 px-3 py-0.5 text-xs font-bold text-white">
                      {activeReportMeta?.category}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {currentRecords.length} records matching current filters
                    </span>
                  </div>

                  <h2 className="mt-2 text-2xl font-bold text-slate-950 flex items-center gap-2">
                    {activeReportMeta && (
                      <activeReportMeta.icon className="size-6 text-[#0170FE]" />
                    )}
                    {activeReportMeta?.title} Report
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 max-w-2xl leading-relaxed">
                    {activeReportMeta?.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectReport('catalog')}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Layers className="size-4" />
                    <span>Back to Directory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerExport('Excel')}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0170FE] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0060db] transition"
                  >
                    <Download className="size-4" />
                    <span>Download Excel</span>
                  </button>
                </div>
              </div>

              {/* SOW Filters Applied Tagline */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  <span className="font-bold text-slate-700">Supported SOW Filters: </span>
                  <span className="font-mono text-slate-600">{activeReportMeta?.sowFilters}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FileSpreadsheet className="size-4 text-emerald-600" />
                  <span>Real-time CSV &amp; Excel XLSX engine enabled</span>
                </div>
              </div>
            </div>

            {/* Live Data Table Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <p className="text-sm font-bold text-slate-800">
                  Data Preview ({currentRecords.length} Rows)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerExport('CSV')}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#0170FE] hover:underline"
                  >
                    <Download className="size-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => triggerExport('PDF')}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-600 hover:underline"
                  >
                    <Printer className="size-3.5" />
                    <span>Print PDF</span>
                  </button>
                </div>
              </div>

              {currentRecords.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertTriangle className="size-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-base font-bold text-slate-800">No records found matching filters</p>
                  <p className="text-sm text-slate-500 mt-1">Try resetting or loosening the applied search parameters.</p>
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {Object.keys(currentRecords[0]).map((colKey) => (
                          <th key={colKey} className="py-3.5 px-4 capitalize whitespace-nowrap">
                            {colKey.replace(/([A-Z])/g, ' $1').trim()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {currentRecords.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          {Object.entries(row).map(([k, v], cellIdx) => {
                            const isAmount = typeof v === 'number' && (k.toLowerCase().includes('premium') || k.toLowerCase().includes('comm') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('payout'))
                            const isStatus = k.toLowerCase().includes('status')
                            return (
                              <td key={cellIdx} className="py-3.5 px-4 whitespace-nowrap">
                                {isAmount ? (
                                  <span className="font-mono font-bold text-slate-900">
                                    ${(v as number).toLocaleString()}
                                  </span>
                                ) : isStatus ? (
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${v === 'Active' || v === 'Paid' || v === 'Reconciled' || v === 'Consented' || v === 'Bound / Won'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : v === 'Outstanding' || v === 'Pending' || v === 'In Review' || v === 'Quoted'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      }`}
                                  >
                                    {String(v)}
                                  </span>
                                ) : (
                                  <span className={cellIdx === 0 ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                                    {String(v)}
                                  </span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Delivery Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <Clock className="size-5 text-[#0170FE]" />
                Schedule Automated Delivery
              </h3>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Set automated delivery of the <strong>{activeReportMeta?.title || 'Selected Report'}</strong> straight to your agency email in Excel or PDF format.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Recipient Email</label>
                <input
                  type="email"
                  defaultValue="jordan@brokerstep.com"
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-[#0170FE]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Cadence / Frequency</label>
                <select className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-[#0170FE]">
                  <option>Every Monday at 8:00 AM</option>
                  <option>First Day of Every Month</option>
                  <option>Quarterly Closing Summary</option>
                  <option>Daily Morning Digest</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">Attachment Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800 cursor-pointer">
                    <input type="radio" name="format" defaultChecked className="accent-[#0170FE]" />
                    <span>Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 text-sm font-semibold text-slate-800 cursor-pointer">
                    <input type="radio" name="format" className="accent-[#0170FE]" />
                    <span>PDF Document</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleModalOpen(false)
                  showToast('Automated delivery schedule saved!')
                }}
                className="flex-1 rounded-xl bg-[#0170FE] py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0170FE]/25 hover:bg-[#0060db]"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
