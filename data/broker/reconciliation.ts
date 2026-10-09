export type ReconciliationCategoryKey =
  | 'overview'
  | 'paid'
  | 'partial'
  | 'unpaid'
  | 'review'
  | 'cancellations'
  | 'chargebacks'
  | 'adjustments'
  | 'overpaid'

export type ReconciliationStatusType =
  | 'Paid / Matched'
  | 'Partial / Short Paid'
  | 'Unpaid / Not Found'
  | 'Needs Review'
  | 'Cancellations'
  | 'Chargebacks'
  | 'Adjustments'
  | 'Overpaid'

export interface ReconciliationAuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  notes?: string
}

export interface ReconciliationRecord {
  id: string
  client: string
  businessName?: string
  clientEmail?: string
  clientPhone?: string
  policy: string
  lineOfBusiness?: string
  carrier: string
  transactionType: string
  expected: number
  actualPaid: number
  differenceOutstanding: number
  status: ReconciliationStatusType
  statementSource: string
  transactionDate: string
  notes: string
  canMatchResolve: boolean
  canUpdateStatus: boolean
  auditHistory: ReconciliationAuditEntry[]
}

export interface WorkflowStep {
  stepNumber: number
  title: string
  description: string
  phase: string
  status: 'completed' | 'active' | 'pending'
}

export const reconciliationWorkflowSteps: WorkflowStep[] = [
  {
    stepNumber: 28,
    title: 'Expected Commission',
    description: 'System projects expected commission amount from policy binding & carrier commission schedule.',
    phase: 'Projection',
    status: 'completed',
  },
  {
    stepNumber: 29,
    title: 'Commission Statement Uploaded',
    description: 'Electronic carrier statement file (CSV, EDI, PDF) received and ingested into the ledger.',
    phase: 'Ingestion',
    status: 'completed',
  },
  {
    stepNumber: 30,
    title: 'Statement Data Extracted',
    description: 'Raw statement line items, amounts, carrier codes, and dates parsed into system records.',
    phase: 'Parsing',
    status: 'completed',
  },
  {
    stepNumber: 31,
    title: 'Fields Mapped / Normalized',
    description: 'Policy identifiers, client designations, and line-of-business codes normalized across carrier schemas.',
    phase: 'Normalization',
    status: 'completed',
  },
  {
    stepNumber: 32,
    title: 'Matching Engine',
    description: 'Automated reconciliation rules match statement line items against expected commission schedules.',
    phase: 'Matching',
    status: 'completed',
  },
  {
    stepNumber: 33,
    title: 'Compare Expected vs Actual',
    description: 'Differential algorithms compute variance, shortfall, overage, or zero-variance reconciliation.',
    phase: 'Comparison',
    status: 'active',
  },
  {
    stepNumber: 34,
    title: 'Classify status',
    description: 'Transaction categorized as Matched, Short Paid, Unpaid, Overpaid, Cancellation, or Chargeback.',
    phase: 'Classification',
    status: 'active',
  },
  {
    stepNumber: 35,
    title: 'Broker Review where required',
    description: 'Manual audit queue for unmatched transactions, clawbacks, and rate discrepancy variances.',
    phase: 'Review',
    status: 'pending',
  },
  {
    stepNumber: 36,
    title: 'Final Transaction Status',
    description: 'Sign-off and approval establishing authoritative reconciled accounting status for the item.',
    phase: 'Finalization',
    status: 'pending',
  },
  {
    stepNumber: 37,
    title: 'Dashboard / Book / Reports updated',
    description: 'Reconciled figures committed to broker ledger, accounting dashboards, book of business, and carrier reports.',
    phase: 'Reporting',
    status: 'pending',
  },
]

export const initialReconciliationData: ReconciliationRecord[] = [
  // 1. Paid / Matched
  {
    id: 'REC-101',
    client: 'Marcus Vance',
    businessName: 'Vance Logistics LLC',
    clientEmail: 'm.vance@vancelogistics.com',
    clientPhone: '(555) 392-8812',
    policy: 'POL-8842-TRAV',
    lineOfBusiness: 'Commercial Auto',
    carrier: 'Travelers',
    transactionType: 'Renewal',
    expected: 6420.0,
    actualPaid: 6420.0,
    differenceOutstanding: 0.0,
    status: 'Paid / Matched',
    statementSource: 'ST-2841',
    transactionDate: '2026-10-04',
    notes: 'Transactions successfully matched/reconciled against Travelers electronic remittance.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-01',
        timestamp: '2026-10-04 10:30 AM',
        user: 'Matching Engine',
        action: 'Rule 32 Auto-Match Cleared',
        notes: 'Expected $6,420.00 matched perfectly with statement ST-2841 line item.',
      },
    ],
  },
  {
    id: 'REC-102',
    client: 'Elena Rostova',
    businessName: 'Apex Dental Care',
    clientEmail: 'elena@apexdentalcare.org',
    clientPhone: '(555) 819-2041',
    policy: 'POL-9102-MEDP',
    lineOfBusiness: 'Professional Liability',
    carrier: 'Medical Protective',
    transactionType: 'New Business',
    expected: 3360.0,
    actualPaid: 3360.0,
    differenceOutstanding: 0.0,
    status: 'Paid / Matched',
    statementSource: 'ST-2855',
    transactionDate: '2026-10-03',
    notes: 'Transactions successfully matched/reconciled with carrier direct deposit.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-02',
        timestamp: '2026-10-03 11:15 AM',
        user: 'Matching Engine',
        action: 'Automated Match Confirmed',
        notes: 'Carrier statement line verified and balanced.',
      },
    ],
  },
  {
    id: 'REC-103',
    client: 'Tariq Al-Mansoor',
    businessName: 'Apex Logistics Corp',
    clientEmail: 'tariq@apexlogistics.com',
    clientPhone: '(555) 912-3810',
    policy: 'POL-6612-HART',
    lineOfBusiness: 'Workers Comp',
    carrier: 'Hartford',
    transactionType: 'New Business',
    expected: 2312.5,
    actualPaid: 2312.5,
    differenceOutstanding: 0.0,
    status: 'Paid / Matched',
    statementSource: 'ST-2710',
    transactionDate: '2026-09-18',
    notes: 'Transactions successfully matched/reconciled without variance.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-03',
        timestamp: '2026-09-18 03:20 PM',
        user: 'Matching Engine',
        action: 'Statement Matched',
        notes: 'Full amount reconciled to Hartford cycle batch.',
      },
    ],
  },

  // 2. Partial / Short Paid
  {
    id: 'REC-104',
    client: 'Sarah Jenkins',
    businessName: 'Harborview Cafe & Bakery',
    clientEmail: 'sarah@harborviewcafe.com',
    clientPhone: '(555) 772-1984',
    policy: 'POL-4410-CHUB',
    lineOfBusiness: 'Business Owners (BOP)',
    carrier: 'Chubb',
    transactionType: 'Renewal',
    expected: 1740.0,
    actualPaid: 1392.0,
    differenceOutstanding: 348.0,
    status: 'Partial / Short Paid',
    statementSource: 'ST-2790',
    transactionDate: '2026-09-28',
    notes: 'Actual commission is lower than expected; show difference/outstanding. Carrier paid 12% instead of contracted 15%.',
    canMatchResolve: true,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-04',
        timestamp: '2026-09-28 02:40 PM',
        user: 'Matching Engine',
        action: 'Variance Detected ($348.00 short)',
        notes: 'Tier discrepancy identified against contracted commission schedule.',
      },
    ],
  },
  {
    id: 'REC-105',
    client: 'Sophia Martinez',
    businessName: 'Martinez Prime Construction',
    clientEmail: 'sophia@martinezconst.com',
    clientPhone: '(555) 672-1190',
    policy: 'POL-8801-TRAV',
    lineOfBusiness: 'Builders Risk',
    carrier: 'Travelers',
    transactionType: 'Endorsement',
    expected: 1372.0,
    actualPaid: 1050.0,
    differenceOutstanding: 322.0,
    status: 'Partial / Short Paid',
    statementSource: 'ST-2644',
    transactionDate: '2026-09-10',
    notes: 'Actual commission is lower than expected; show difference/outstanding. Carrier withheld endorsement brokerage fee.',
    canMatchResolve: true,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-05',
        timestamp: '2026-09-10 09:12 AM',
        user: 'Matching Engine',
        action: 'Shortfall Flagged ($322.00 difference)',
        notes: 'Endorsement premium difference noted on statement ST-2644.',
      },
    ],
  },

  // 3. Unpaid / Not Found
  {
    id: 'REC-106',
    client: 'David Kowalski',
    businessName: 'Kowalski Precision Machining',
    clientEmail: 'david@kowalskimachining.com',
    clientPhone: '(555) 441-9238',
    policy: 'POL-5501-AIG',
    lineOfBusiness: 'Commercial Property',
    carrier: 'AIG',
    transactionType: 'Endorsement',
    expected: 5400.0,
    actualPaid: 0.0,
    differenceOutstanding: 5400.0,
    status: 'Unpaid / Not Found',
    statementSource: 'ST-PEND-09',
    transactionDate: '2026-10-02',
    notes: 'Expected commission not found in processed statement data. Remittance line missing from October carrier file.',
    canMatchResolve: true,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-06',
        timestamp: '2026-10-02 04:50 PM',
        user: 'Matching Engine',
        action: 'Unmatched Schedule',
        notes: 'Expected commission scheduled but not identified in parsed carrier statement files.',
      },
    ],
  },
  {
    id: 'REC-107',
    client: 'Liam O’Connor',
    businessName: 'O’Connor Hospitality Group',
    clientEmail: 'liam@oconnorhospitality.com',
    clientPhone: '(555) 481-9920',
    policy: 'POL-7720-AIG',
    lineOfBusiness: 'Commercial Umbrella',
    carrier: 'AIG',
    transactionType: 'Renewal',
    expected: 2130.0,
    actualPaid: 0.0,
    differenceOutstanding: 2130.0,
    status: 'Unpaid / Not Found',
    statementSource: 'ST-PEND-14',
    transactionDate: '2026-09-15',
    notes: 'Expected commission not found in processed statement data. Awaiting carrier upload or manual lookup.',
    canMatchResolve: true,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-07',
        timestamp: '2026-09-15 11:00 AM',
        user: 'System Projection',
        action: 'Schedule Queued',
        notes: 'Awaiting electronic statement batch from carrier portal.',
      },
    ],
  },

  // 4. Needs Review
  {
    id: 'REC-108',
    client: 'Rachel Green',
    businessName: 'Greenwood Design Studio',
    clientEmail: 'rachel@greenwooddesign.com',
    clientPhone: '(555) 234-8891',
    policy: 'POL-3490-LIBM',
    lineOfBusiness: 'General Liability',
    carrier: 'Liberty Mutual',
    transactionType: 'Endorsement',
    expected: 1850.0,
    actualPaid: 1200.0,
    differenceOutstanding: 650.0,
    status: 'Needs Review',
    statementSource: 'ST-2911',
    transactionDate: '2026-09-29',
    notes: 'Transactions requiring Broker review. Carrier policy ID mismatch between binding slip and remittance header.',
    canMatchResolve: true,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-08',
        timestamp: '2026-09-29 01:45 PM',
        user: 'Matching Engine',
        action: 'Flagged for Broker Review',
        notes: 'Ambiguous policy identifier match requires manual broker authorization.',
      },
    ],
  },
  {
    id: 'REC-109',
    client: 'Jonathan Meyer',
    businessName: 'Meyer Fleet Services',
    clientEmail: 'jmeyer@meyerfleet.com',
    clientPhone: '(555) 902-1144',
    policy: 'POL-6102-TRAV',
    lineOfBusiness: 'Inland Marine',
    carrier: 'Travelers',
    transactionType: 'Renewal',
    expected: 2800.0,
    actualPaid: 2100.0,
    differenceOutstanding: 700.0,
    status: 'Needs Review',
    statementSource: 'ST-2890',
    transactionDate: '2026-09-26',
    notes: 'Transactions requiring Broker review. Split commission rate calculation requires agent verification.',
    canMatchResolve: true,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-09',
        timestamp: '2026-09-26 03:10 PM',
        user: 'Audit Desk',
        action: 'Escalated to Review Queue',
        notes: 'Co-brokerage split percentage disputed against carrier report.',
      },
    ],
  },

  // 5. Cancellations
  {
    id: 'REC-110',
    client: 'Amara Diallo',
    businessName: 'Diallo Transport & Freight',
    clientEmail: 'amara@diallotransport.com',
    clientPhone: '(555) 238-9901',
    policy: 'POL-2190-TRAV',
    lineOfBusiness: 'Commercial Auto',
    carrier: 'Travelers',
    transactionType: 'Cancellation',
    expected: -1800.0,
    actualPaid: -1800.0,
    differenceOutstanding: 0.0,
    status: 'Cancellations',
    statementSource: 'ST-2760',
    transactionDate: '2026-09-25',
    notes: 'Statement-derived cancellation transactions. Pro-rata premium refund and commission reversal.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-10',
        timestamp: '2026-09-25 09:30 AM',
        user: 'Statement Ingestion',
        action: 'Cancellation Ingested',
        notes: 'Processed statement ST-2760 cancellation deduction line.',
      },
    ],
  },
  {
    id: 'REC-111',
    client: 'Victor Vance',
    businessName: 'Vance Courier Express',
    clientEmail: 'vvance@vancecourier.net',
    clientPhone: '(555) 392-1209',
    policy: 'POL-4412-CNA',
    lineOfBusiness: 'Commercial Property',
    carrier: 'CNA',
    transactionType: 'Cancellation',
    expected: -920.0,
    actualPaid: -920.0,
    differenceOutstanding: 0.0,
    status: 'Cancellations',
    statementSource: 'ST-2715',
    transactionDate: '2026-09-12',
    notes: 'Statement-derived cancellation transactions. Flat cancellation processed within statutory grace period.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-11',
        timestamp: '2026-09-12 10:00 AM',
        user: 'Statement Ingestion',
        action: 'Cancellation Processed',
        notes: 'CNA statement reversal balanced.',
      },
    ],
  },

  // 6. Chargebacks
  {
    id: 'REC-112',
    client: 'Kevin Wright',
    businessName: 'Wright Media & Studio',
    clientEmail: 'kevin@wrightmedia.org',
    clientPhone: '(555) 881-2299',
    policy: 'POL-9912-CNA',
    lineOfBusiness: 'Cyber Liability',
    carrier: 'CNA',
    transactionType: 'Chargeback',
    expected: -975.0,
    actualPaid: -975.0,
    differenceOutstanding: 0.0,
    status: 'Chargebacks',
    statementSource: 'ST-2602',
    transactionDate: '2026-09-05',
    notes: 'Chargeback transactions. Early policy termination triggered unearned commission clawback.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-12',
        timestamp: '2026-09-05 04:15 PM',
        user: 'Matching Engine',
        action: 'Chargeback Recorded',
        notes: 'Direct carrier clawback line item matched.',
      },
    ],
  },
  {
    id: 'REC-113',
    client: 'Brandon Lee',
    businessName: 'Summit Peak Logistics',
    clientEmail: 'blee@summitlogistics.org',
    clientPhone: '(555) 781-3320',
    policy: 'POL-1190-TRAV',
    lineOfBusiness: 'Commercial Auto',
    carrier: 'Travelers',
    transactionType: 'Chargeback',
    expected: -1250.0,
    actualPaid: -1250.0,
    differenceOutstanding: 0.0,
    status: 'Chargebacks',
    statementSource: 'ST-2580',
    transactionDate: '2026-08-28',
    notes: 'Chargeback transactions. Carrier clawback due to mid-term endorsement reduction.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-13',
        timestamp: '2026-08-28 01:25 PM',
        user: 'Matching Engine',
        action: 'Chargeback Verified',
        notes: 'Clawback reconciled with August remittance.',
      },
    ],
  },

  // 7. Adjustments
  {
    id: 'REC-114',
    client: 'Robert Chen',
    businessName: 'Chen & Partners CPA',
    clientEmail: 'rchen@chencpafirm.com',
    clientPhone: '(555) 603-9942',
    policy: 'POL-3321-CNA',
    lineOfBusiness: 'Professional Liability',
    carrier: 'CNA',
    transactionType: 'Adjustment',
    expected: 0.0,
    actualPaid: -240.0,
    differenceOutstanding: -240.0,
    status: 'Adjustments',
    statementSource: 'ST-ADJ-88',
    transactionDate: '2026-09-20',
    notes: 'Adjustment/reversal transactions. Carrier audit correction on prior term premium calculation.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-14',
        timestamp: '2026-09-20 11:00 AM',
        user: 'Broker Desk',
        action: 'Adjustment Applied',
        notes: 'Audit worksheet #AW-291 adjustment recorded.',
      },
    ],
  },
  {
    id: 'REC-115',
    client: 'Marcus Vance',
    businessName: 'Vance Logistics LLC',
    clientEmail: 'm.vance@vancelogistics.com',
    clientPhone: '(555) 392-8812',
    policy: 'POL-8843-CHUB',
    lineOfBusiness: 'General Liability',
    carrier: 'Chubb',
    transactionType: 'Adjustment',
    expected: 0.0,
    actualPaid: 450.0,
    differenceOutstanding: 450.0,
    status: 'Adjustments',
    statementSource: 'ST-ADJ-91',
    transactionDate: '2026-09-16',
    notes: 'Adjustment/reversal transactions. Prior year commission rate retroactive increase correction payout.',
    canMatchResolve: false,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-15',
        timestamp: '2026-09-16 02:45 PM',
        user: 'Broker Desk',
        action: 'Credit Adjustment Reconciled',
        notes: 'Retroactive commission adjustment credited to broker account.',
      },
    ],
  },

  // 8. Overpaid
  {
    id: 'REC-116',
    client: 'Samantha Miller',
    businessName: 'Miller Artisanal Roasters',
    clientEmail: 'smiller@millerroasters.com',
    clientPhone: '(555) 412-9011',
    policy: 'POL-5582-HART',
    lineOfBusiness: 'Business Owners (BOP)',
    carrier: 'Hartford',
    transactionType: 'Renewal',
    expected: 1500.0,
    actualPaid: 1800.0,
    differenceOutstanding: -300.0,
    status: 'Overpaid',
    statementSource: 'ST-2940',
    transactionDate: '2026-10-01',
    notes: 'Where actual exceeds expected, where applicable. Carrier paid higher tier bonus incentive (+ $300.00 above expected schedule).',
    canMatchResolve: true,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-16',
        timestamp: '2026-10-01 10:10 AM',
        user: 'Matching Engine',
        action: 'Overpayment Variance Detected',
        notes: 'Actual payout exceeds expected calculation by $300.00.',
      },
    ],
  },
  {
    id: 'REC-117',
    client: 'Carlos Delgado',
    businessName: 'Delgado Import Warehousing',
    clientEmail: 'cdelgado@delgadoimports.com',
    clientPhone: '(555) 621-8843',
    policy: 'POL-7719-TRAV',
    lineOfBusiness: 'Commercial Property',
    carrier: 'Travelers',
    transactionType: 'New Business',
    expected: 3200.0,
    actualPaid: 3550.0,
    differenceOutstanding: -350.0,
    status: 'Overpaid',
    statementSource: 'ST-2955',
    transactionDate: '2026-09-22',
    notes: 'Where actual exceeds expected, where applicable. Carrier credited $350.00 automated electronic filing bonus.',
    canMatchResolve: true,
    canUpdateStatus: true,
    auditHistory: [
      {
        id: 'AUD-17',
        timestamp: '2026-09-22 04:30 PM',
        user: 'Matching Engine',
        action: 'Overpayment Variance Recorded',
        notes: 'Actual payment exceeded expected baseline by $350.00.',
      },
    ],
  },
]
