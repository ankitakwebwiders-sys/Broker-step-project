export interface ClientPolicy {
  id: string
  policyNumber: string
  type: string
  carrier: string
  premium: string
  effectiveDate: string
  expirationDate: string
  status: 'Active' | 'Historical' | 'Pending Renewal' | 'Cancelled' | 'Rewritten'
  tag?: string
  isHistory?: boolean
  policyNumberPending?: boolean
  policyNumberSubtext?: string
  rateSplit?: string
  expectedCommission?: string
  paidCommission?: string
  netCommission?: string
  commissionStatus?: 'Paid' | 'Unpaid' | 'Pending'
  chainNote?: string
  brokerNote?: string
  paymentStatus?: 'Paid' | 'Unpaid'
  billingMethod?: 'Direct Bill' | 'Agency Bill' | string
  paymentDate?: string
  paymentNote?: string
}

export interface CommissionTransaction {
  id: string
  date: string
  statementNumber: string
  carrier: string
  policyNumber: string
  premium: string
  rate: string
  amount: string
  status: 'Paid' | 'Outstanding' | 'Pending Reconciliation'
  sourceStatementUrl?: string
}

export interface ConsentRecord {
  status: 'Granted' | 'Pending' | 'Declined' | 'Revoked'
  channels: string[]
  consentDate?: string
  method?: string
  ipAddress?: string
  notes?: string
}

export interface ClientTimelineEvent {
  id: string
  title: string
  type: 'policy' | 'commission' | 'consent' | 'contact' | 'system'
  date: string
  detail: string
  actor: string
}

export interface ClientNote {
  id: string
  date: string
  author: string
  text: string
}

export interface ClientItem {
  id: string
  firstName: string
  lastName: string
  name: string
  businessName: string
  clientType?: 'Individual' | 'Commercial'
  clientSince?: string
  dob: string
  phone: string
  email: string
  street: string
  city: string
  state: string
  zip: string
  brokerCode: string
  otherIdentifier: string
  status: 'Active' | 'Inactive' | 'Active / Submitted' | 'Pending' | 'Lead' | string
  province?: string
  postalCode?: string
  linesOfBusiness?: string[]
  yearlyPremium?: string
  insurerName?: string
  marketingConsent: ConsentRecord
  notes: ClientNote[]
  lastActivity: {
    description: string
    time: string
  }
  policies: ClientPolicy[]
  commissions: CommissionTransaction[]
  timeline: ClientTimelineEvent[]
  originalExpected?: string
  additionalCommission?: string
  chargebacks?: string
  otherAdjustments?: string
  netCommission?: string
  totalPaid?: string
  outstanding?: string
  paymentStatus?: 'Paid' | 'Unpaid'
  effectiveDate?: string
}

export function getClientPaymentStatus(client: ClientItem): 'Paid' | 'Unpaid' {
  if (client.paymentStatus === 'Paid') return 'Paid'
  if (client.paymentStatus === 'Unpaid') return 'Unpaid'

  if (client.status === 'Draft' || client.status === 'Draft / Incomplete') {
    return 'Unpaid'
  }

  if (client.outstanding) {
    const val = parseFloat(client.outstanding.replace(/[^0-9.]/g, ''))
    if (!isNaN(val)) {
      return val === 0 ? 'Paid' : 'Unpaid'
    }
  }

  if (client.commissions && client.commissions.length > 0) {
    const hasUnpaid = client.commissions.some(c => c.status === 'Outstanding' || c.status === 'Pending Reconciliation')
    if (hasUnpaid) return 'Unpaid'
    return 'Paid'
  }

  if (client.policies && client.policies.length > 0) {
    const hasUnpaid = client.policies.some(p => p.commissionStatus === 'Unpaid')
    if (hasUnpaid) return 'Unpaid'
    const hasPaid = client.policies.some(p => p.commissionStatus === 'Paid')
    if (hasPaid) return 'Paid'
  }

  const numId = parseInt(client.id.replace(/\D/g, ''), 10) || 0
  return numId % 2 === 0 ? 'Paid' : 'Unpaid'
}

export function getClientEffectiveDate(client: ClientItem): string {
  if (client.effectiveDate) return client.effectiveDate
  const activePol = client.policies?.find(p => p.status === 'Active' && p.effectiveDate)
  if (activePol?.effectiveDate) return activePol.effectiveDate
  const anyPol = client.policies?.find(p => p.effectiveDate)
  if (anyPol?.effectiveDate) return anyPol.effectiveDate
  if (client.clientSince && client.clientSince !== '—') return client.clientSince
  return '—'
}

export function getPolicyPaymentStatus(policy: ClientPolicy, client?: ClientItem): 'Paid' | 'Unpaid' {
  if (policy.paymentStatus === 'Paid') return 'Paid'
  if (policy.paymentStatus === 'Unpaid') return 'Unpaid'
  if (policy.commissionStatus === 'Paid') return 'Paid'
  if (policy.commissionStatus === 'Unpaid') return 'Unpaid'
  if (policy.status === 'Historical' || policy.isHistory) return 'Paid'
  if (policy.policyNumberPending) return 'Unpaid'
  if (client) {
    if (client.status === 'Draft' || client.status === 'Draft / Incomplete') return 'Unpaid'
    if (client.paymentStatus === 'Paid') return 'Paid'
    if (client.paymentStatus === 'Unpaid') return 'Unpaid'
    if (client.outstanding && client.outstanding !== '$0.00') return 'Unpaid'
  }
  return 'Paid'
}

export const initialClients: ClientItem[] = [
  {
    id: 'CL-DRAFT-101',
    firstName: 'Robert',
    lastName: 'MacKenzie',
    name: 'Northern Ridge Contracting Ltd.',
    businessName: 'Northern Ridge Contracting Ltd.',
    clientType: 'Commercial',
    clientSince: 'Today (Draft)',
    dob: '—',
    phone: '+1 (416) 555-0149',
    email: 'robert@northernridge.ca',
    street: '880 Industrial Pkwy, Unit 4',
    city: 'Vaughan',
    state: 'ON',
    province: 'ON',
    zip: 'L4K 4V8',
    postalCode: 'L4K 4V8',
    brokerCode: 'BRK-8821',
    otherIdentifier: 'DRAFT-INCOMPLETE-55%',
    status: 'Draft',
    linesOfBusiness: ['Commercial Auto', 'General Liability'],
    yearlyPremium: '— (Pending quote)',
    insurerName: 'Intact Insurance',
    marketingConsent: {
      status: 'Pending',
      channels: ['Email'],
      consentDate: 'Today',
      method: 'Draft Intake',
      notes: 'Pending final review and client signature',
    },
    notes: [
      {
        id: 'n-draft-1',
        date: 'Today',
        author: 'Jordan Davis',
        text: 'Draft saved: Awaiting fleet schedule and liability limit confirmation from Robert before binding.',
      },
    ],
    lastActivity: {
      description: 'Saved in Drafts (55% complete - Half Info)',
      time: '2 hours ago',
    },
    policies: [
      {
        id: 'pol-draft-101',
        policyNumber: 'DRAFT-PENDING',
        type: 'Commercial Auto',
        carrier: 'Intact Insurance',
        premium: 'Pending quote',
        effectiveDate: '2026-11-01',
        expirationDate: '2027-11-01',
        status: 'Active',
        policyNumberPending: true,
        policyNumberSubtext: 'Draft intake - policy not yet bound',
        rateSplit: '15.5% / 82%',
        expectedCommission: 'Pending',
        commissionStatus: 'Pending',
      },
    ],
    commissions: [],
    timeline: [
      {
        id: 'tl-draft-101',
        title: 'Draft Intake Saved',
        type: 'system',
        date: 'Today',
        detail: 'Incomplete client intake record saved to Drafts folder (55% complete).',
        actor: 'Broker Intake',
      },
    ],
  },
  {
    id: 'CL-DRAFT-102',
    firstName: 'Amina',
    lastName: 'Zahra',
    name: 'Amina Zahra',
    businessName: '—',
    clientType: 'Individual',
    clientSince: 'Yesterday (Draft)',
    dob: '—',
    phone: '+1 (905) 555-0188',
    email: '',
    street: '142 Maplewood Ave',
    city: 'Hamilton',
    state: 'ON',
    province: 'ON',
    zip: 'L8M 1W9',
    postalCode: 'L8M 1W9',
    brokerCode: 'BRK-8821',
    otherIdentifier: 'DRAFT-HALF-INFO-40%',
    status: 'Draft',
    linesOfBusiness: ['Home'],
    yearlyPremium: '$1,850',
    insurerName: 'Travelers Insurance',
    marketingConsent: {
      status: 'Pending',
      channels: ['Phone'],
      consentDate: 'Yesterday',
      method: 'Phone Intake (Half Info)',
      notes: 'Caller intake incomplete; awaiting prior dec page and email.',
    },
    notes: [
      {
        id: 'n-draft-2',
        date: 'Yesterday',
        author: 'Jordan Davis',
        text: 'Half Info saved: Client had to drop off call. Missing email address and date of birth. Follow up to finalize.',
      },
    ],
    lastActivity: {
      description: 'Saved in Drafts (Half info - missing email & DOB)',
      time: 'Yesterday',
    },
    policies: [
      {
        id: 'pol-draft-102',
        policyNumber: 'DRAFT-PENDING',
        type: 'Home',
        carrier: 'Travelers Insurance',
        premium: '$1,850',
        effectiveDate: '2026-11-15',
        expirationDate: '2027-11-15',
        status: 'Active',
        policyNumberPending: true,
        policyNumberSubtext: 'Draft quote - awaiting missing info',
        rateSplit: '15.0% / 80%',
        expectedCommission: '$222',
        commissionStatus: 'Pending',
      },
    ],
    commissions: [],
    timeline: [
      {
        id: 'tl-draft-102',
        title: 'Draft Intake Saved',
        type: 'system',
        date: 'Yesterday',
        detail: 'Phone intake saved with half info. Needs email and DOB before binding.',
        actor: 'Broker Intake',
      },
    ],
  },
  {
    id: 'CL-1000',
    firstName: 'Daniel',
    lastName: 'Okafor',
    name: 'Daniel Okafor',
    businessName: '—',
    clientType: 'Individual',
    clientSince: '2 Sep 2024',
    dob: '1988-03-22',
    phone: '(416) 555-0110',
    email: 'daniel.okafor@example.ca',
    street: '450 City Centre Dr',
    city: 'Mississauga',
    state: 'ON',
    zip: 'L5B 1M3',
    brokerCode: 'BRK-8902',
    otherIdentifier: 'DL-ON-9821034-A',
    status: 'Active',
    originalExpected: '$430.50',
    additionalCommission: '$0.00',
    chargebacks: '$0.00',
    otherAdjustments: '$0.00',
    netCommission: '$430.50',
    totalPaid: '$253.00',
    outstanding: '$177.50',
    marketingConsent: {
      status: 'Granted',
      channels: ['Email', 'SMS', 'Phone'],
      consentDate: '2 Sep 2024',
      method: 'Electronic Signature',
      ipAddress: '142.214.19.82',
      notes: 'Consent granted during initial home insurance intake.',
    },
    notes: [
      {
        id: 'N-DO-1',
        date: '15 Sep 2026',
        author: 'Jordan Davis',
        text: 'Rewrote coverage from ABC Insurance to XYZ Insurance to provide enhanced water-damage coverage at competitive premium.',
      },
      {
        id: 'N-DO-2',
        date: '2 Sep 2024',
        author: 'Jordan Davis',
        text: 'Initial new business bound with ABC Insurance on Home policy ABC-A123.',
      },
    ],
    lastActivity: {
      description: 'Rewritten with XYZ Insurance Pending',
      time: '15 Sep 2026',
    },
    policies: [
      {
        id: 'pol-do-1',
        policyNumber: 'XYZ-PENDING',
        type: 'Home',
        carrier: 'XYZ Insurance',
        premium: '$2,840.00',
        effectiveDate: '15 Sep 2026',
        expirationDate: '15 Sep 2027',
        status: 'Active',
        tag: 'Rewrite',
        isHistory: false,
        policyNumberPending: true,
        policyNumberSubtext: 'will fill from a matched statement',
        rateSplit: '12.5% × 50%',
        expectedCommission: '$177.50',
        paidCommission: '$0.00',
        netCommission: '$177.50',
        commissionStatus: 'Unpaid',
        chainNote: 'Rewritten from ABC Insurance ABC-B456 (2025)',
        brokerNote: 'Moved to XYZ for better water-damage coverage. Policy number not yet issued.',
      },
      {
        id: 'pol-do-2',
        policyNumber: 'ABC-B456',
        type: 'Home',
        carrier: 'ABC Insurance',
        premium: '$2,610.00',
        effectiveDate: '15 Sep 2025',
        expirationDate: '15 Sep 2026',
        status: 'Rewritten',
        tag: 'Renewal',
        isHistory: true,
        policyNumberPending: false,
        policyNumberSubtext: 'Entered at binding',
        rateSplit: '10% × 50%',
        expectedCommission: '$130.50',
        paidCommission: '$130.50',
        netCommission: '$130.50',
        commissionStatus: 'Paid',
        chainNote: 'Renewal of ABC Insurance ABC-A123 (2024) · Rewritten as XYZ Insurance Pending',
      },
      {
        id: 'pol-do-3',
        policyNumber: 'ABC-A123',
        type: 'Home',
        carrier: 'ABC Insurance',
        premium: '$2,450.00',
        effectiveDate: '15 Sep 2024',
        expirationDate: '15 Sep 2025',
        status: 'Rewritten',
        tag: 'New Business',
        isHistory: true,
        policyNumberPending: false,
        policyNumberSubtext: 'Initial binding',
        rateSplit: '10% × 50%',
        expectedCommission: '$122.50',
        paidCommission: '$122.50',
        netCommission: '$122.50',
        commissionStatus: 'Paid',
        chainNote: 'Initial binding for Daniel Okafor · Renewed as ABC-B456',
      },
    ],
    commissions: [
      {
        id: 'COMM-DO-1',
        date: '2026-09-15',
        statementNumber: 'STM-2026-09-XYZ',
        carrier: 'XYZ Insurance',
        policyNumber: 'Pending (XYZ)',
        premium: '$2,840.00',
        rate: '12.5% × 50%',
        amount: '$177.50',
        status: 'Outstanding',
        sourceStatementUrl: '/broker/statements',
      },
      {
        id: 'COMM-DO-2',
        date: '2025-09-15',
        statementNumber: 'STM-2025-09-ABC',
        carrier: 'ABC Insurance',
        policyNumber: 'ABC-B456',
        premium: '$2,610.00',
        rate: '10% × 50%',
        amount: '$130.50',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
      {
        id: 'COMM-DO-3',
        date: '2024-09-15',
        statementNumber: 'STM-2024-09-ABC',
        carrier: 'ABC Insurance',
        policyNumber: 'ABC-A123',
        premium: '$2,450.00',
        rate: '10% × 50%',
        amount: '$122.50',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'TL-DO-1',
        title: 'Rewritten — new carrier',
        type: 'policy',
        date: '15 Sep 2026',
        detail: 'XYZ Insurance Pending · Home · $2,840.00',
        actor: 'Jordan Davis',
      },
      {
        id: 'TL-DO-2',
        title: 'Renewed — same carrier',
        type: 'policy',
        date: '15 Sep 2025',
        detail: 'ABC Insurance ABC-B456 · Home · $2,610.00',
        actor: 'Jordan Davis',
      },
      {
        id: 'TL-DO-3',
        title: 'New business',
        type: 'policy',
        date: '15 Sep 2024',
        detail: 'ABC Insurance ABC-A123 · Home · $2,450.00',
        actor: 'Jordan Davis',
      },
    ],
  },
  {
    id: 'CL-1001',
    firstName: 'Marcus',
    lastName: 'Vance',
    name: 'Marcus Vance',
    businessName: 'Vance Logistics LLC',
    dob: '1984-06-14',
    phone: '(555) 392-8812',
    email: 'm.vance@vancelogistics.com',
    street: '1420 Harbor Blvd, Suite 400',
    city: 'Seattle',
    state: 'WA',
    zip: '98104',
    brokerCode: 'BRK-8902',
    otherIdentifier: 'EIN-94-3829102',
    status: 'Active',
    marketingConsent: {
      status: 'Granted',
      channels: ['Email', 'SMS', 'Phone'],
      consentDate: 'Oct 02, 2026',
      method: 'Electronic Signature (DocuSign)',
      ipAddress: '198.51.100.45',
      notes: 'Consent confirmed during annual policy review.',
    },
    notes: [
      {
        id: 'N-1',
        date: 'Oct 03, 2026',
        author: 'Jordan Davis',
        text: 'Client requested quote for 2 additional fleet commercial vans. Expecting endorsement next week.',
      },
      {
        id: 'N-2',
        date: 'Sep 15, 2026',
        author: 'Jordan Davis',
        text: 'Annual renewal completed with Travelers with 6% premium rate reduction.',
      },
    ],
    lastActivity: {
      description: 'Fleet Endorsement Quote Sent',
      time: '2 hours ago',
    },
    policies: [
      {
        id: 'POL-8842',
        policyNumber: 'POL-8842-TRAV',
        type: 'Commercial Auto',
        carrier: 'Travelers',
        premium: '$42,800',
        effectiveDate: 'Nov 01, 2025',
        expirationDate: 'Oct 31, 2026',
        status: 'Active',
      },
      {
        id: 'POL-8843',
        policyNumber: 'POL-8843-CHUB',
        type: 'General Liability',
        carrier: 'Chubb',
        premium: '$18,500',
        effectiveDate: 'Jan 15, 2026',
        expirationDate: 'Jan 14, 2027',
        status: 'Active',
      },
      {
        id: 'POL-7701',
        policyNumber: 'POL-7701-HART',
        type: 'Workers Comp',
        carrier: 'Hartford',
        premium: '$12,400',
        effectiveDate: 'May 01, 2024',
        expirationDate: 'Apr 30, 2025',
        status: 'Historical',
      },
    ],
    commissions: [
      {
        id: 'COM-301',
        date: 'Oct 01, 2026',
        statementNumber: 'ST-2841',
        carrier: 'Travelers',
        policyNumber: 'POL-8842-TRAV',
        premium: '$42,800',
        rate: '15.0%',
        amount: '$6,420.00',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
      {
        id: 'COM-240',
        date: 'Jul 15, 2026',
        statementNumber: 'ST-2590',
        carrier: 'Chubb',
        policyNumber: 'POL-8843-CHUB',
        premium: '$18,500',
        rate: '12.5%',
        amount: '$2,312.50',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
      {
        id: 'COM-190',
        date: 'Apr 10, 2026',
        statementNumber: 'ST-2210',
        carrier: 'Travelers',
        policyNumber: 'POL-8842-TRAV',
        premium: '$3,200',
        rate: '15.0%',
        amount: '$480.00',
        status: 'Outstanding',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'T-1',
        title: 'Endorsement Inquiry Logged',
        type: 'contact',
        date: 'Today, 11:20 AM',
        detail: 'Marcus phoned requesting vehicle addition endorsement for 2 transit vans.',
        actor: 'Jordan Davis',
      },
      {
        id: 'T-2',
        title: 'Commission Reconciled & Paid',
        type: 'commission',
        date: 'Oct 01, 2026',
        detail: 'Statement #ST-2841 matched Travelers commission payout of $6,420.00.',
        actor: 'Reconciliation Engine',
      },
      {
        id: 'T-3',
        title: 'Marketing Consent Granted',
        type: 'consent',
        date: 'Oct 02, 2026',
        detail: 'Marketing consent confirmed via e-sign verification (DocuSign ref #DS-9921).',
        actor: 'System',
      },
    ],
  },
  {
    id: 'CL-1002',
    firstName: 'Elena',
    lastName: 'Rostova',
    name: 'Elena Rostova',
    businessName: 'Apex Dental Care',
    dob: '1979-11-23',
    phone: '(555) 819-2041',
    email: 'elena@apexdentalcare.org',
    street: '720 Medical Plaza, Suite 210',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    brokerCode: 'BRK-8902',
    otherIdentifier: 'NPI-1928374610',
    status: 'Active',
    marketingConsent: {
      status: 'Granted',
      channels: ['Email'],
      consentDate: 'Sep 18, 2026',
      method: 'Client Portal Opt-in',
      ipAddress: '172.56.21.90',
      notes: 'Opted into digital renewal reminders and policy updates only.',
    },
    notes: [
      {
        id: 'N-3',
        date: 'Sep 20, 2026',
        author: 'Jordan Davis',
        text: 'Malpractice policy renewed with Medical Protective. Limits unchanged at $2M/$4M.',
      },
    ],
    lastActivity: {
      description: 'Professional Liability Review Completed',
      time: '1 day ago',
    },
    policies: [
      {
        id: 'POL-9102',
        policyNumber: 'POL-9102-MEDP',
        type: 'Professional Liability',
        carrier: 'Medical Protective',
        premium: '$24,000',
        effectiveDate: 'Oct 01, 2026',
        expirationDate: 'Sep 30, 2027',
        status: 'Active',
      },
      {
        id: 'POL-9103',
        policyNumber: 'POL-9103-HART',
        type: 'Business Owners',
        carrier: 'Hartford',
        premium: '$9,200',
        effectiveDate: 'Feb 01, 2026',
        expirationDate: 'Jan 31, 2027',
        status: 'Active',
      },
    ],
    commissions: [
      {
        id: 'COM-310',
        date: 'Oct 05, 2026',
        statementNumber: 'ST-2855',
        carrier: 'Medical Protective',
        policyNumber: 'POL-9102-MEDP',
        premium: '$24,000',
        rate: '14.0%',
        amount: '$3,360.00',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'T-4',
        title: 'Policy Renewed Successfully',
        type: 'policy',
        date: 'Oct 01, 2026',
        detail: 'Professional Liability policy renewed for 2026-2027 policy cycle.',
        actor: 'Jordan Davis',
      },
    ],
  },
  {
    id: 'CL-1003',
    firstName: 'David',
    lastName: 'Kowalski',
    name: 'David Kowalski',
    businessName: 'Kowalski Precision Machining',
    dob: '1968-04-09',
    phone: '(555) 441-9238',
    email: 'david@kowalskimachining.com',
    street: '500 Industrial Parkway',
    city: 'Cleveland',
    state: 'OH',
    zip: '44114',
    brokerCode: 'BRK-1044',
    otherIdentifier: 'EIN-34-9102384',
    status: 'Active',
    marketingConsent: {
      status: 'Pending',
      channels: ['Email', 'Phone'],
      consentDate: undefined,
      method: 'Verification Email Sent',
      notes: 'Consent request email sent on Oct 04, 2026; waiting for signature.',
    },
    notes: [
      {
        id: 'N-4',
        date: 'Sep 29, 2026',
        author: 'Jordan Davis',
        text: 'Followed up on equipment breakdown policy endorsement.',
      },
    ],
    lastActivity: {
      description: 'Consent Verification Sent',
      time: '3 days ago',
    },
    policies: [
      {
        id: 'POL-5501',
        policyNumber: 'POL-5501-AIG',
        type: 'Commercial Property',
        carrier: 'AIG',
        premium: '$54,000',
        effectiveDate: 'Dec 01, 2025',
        expirationDate: 'Nov 30, 2026',
        status: 'Pending Renewal',
      },
      {
        id: 'POL-5502',
        policyNumber: 'POL-5502-TRAV',
        type: 'Workers Comp',
        carrier: 'Travelers',
        premium: '$31,500',
        effectiveDate: 'Mar 15, 2026',
        expirationDate: 'Mar 14, 2027',
        status: 'Active',
      },
    ],
    commissions: [
      {
        id: 'COM-210',
        date: 'Aug 14, 2026',
        statementNumber: 'ST-2704',
        carrier: 'AIG',
        policyNumber: 'POL-5501-AIG',
        premium: '$54,000',
        rate: '10.0%',
        amount: '$5,400.00',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'T-5',
        title: 'Consent Request Dispatched',
        type: 'consent',
        date: 'Oct 04, 2026',
        detail: 'Automated marketing consent request sent to david@kowalskimachining.com',
        actor: 'System',
      },
    ],
  },
  {
    id: 'CL-1004',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    name: 'Sarah Jenkins',
    businessName: 'Harborview Cafe & Bakery',
    dob: '1991-08-30',
    phone: '(555) 772-1984',
    email: 'sarah@harborviewcafe.com',
    street: '88 Waterfront Way',
    city: 'San Diego',
    state: 'CA',
    zip: '92101',
    brokerCode: 'BRK-8902',
    otherIdentifier: 'EIN-68-1209384',
    status: 'Active',
    marketingConsent: {
      status: 'Granted',
      channels: ['Email', 'SMS'],
      consentDate: 'Jul 10, 2026',
      method: 'QR Code Lead Capture',
      ipAddress: '166.198.42.11',
      notes: 'Captured via broker marketing stand QR code event.',
    },
    notes: [
      {
        id: 'N-5',
        date: 'Aug 01, 2026',
        author: 'Jordan Davis',
        text: 'Bound Business Owners policy with Chubb. Includes spoilage and business interruption riders.',
      },
    ],
    lastActivity: {
      description: 'Quarterly Audit Check',
      time: '4 days ago',
    },
    policies: [
      {
        id: 'POL-4410',
        policyNumber: 'POL-4410-CHUB',
        type: 'Business Owners',
        carrier: 'Chubb',
        premium: '$11,600',
        effectiveDate: 'Aug 01, 2026',
        expirationDate: 'Jul 31, 2027',
        status: 'Active',
      },
    ],
    commissions: [
      {
        id: 'COM-188',
        date: 'Aug 18, 2026',
        statementNumber: 'ST-2680',
        carrier: 'Chubb',
        policyNumber: 'POL-4410-CHUB',
        premium: '$11,600',
        rate: '15.0%',
        amount: '$1,740.00',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'T-6',
        title: 'New Client Onboarded',
        type: 'contact',
        date: 'Aug 01, 2026',
        detail: 'Client onboarded and policy bound with Chubb.',
        actor: 'Jordan Davis',
      },
    ],
  },
  {
    id: 'CL-1005',
    firstName: 'Robert',
    lastName: 'Chen',
    name: 'Robert Chen',
    businessName: 'Chen & Partners CPA',
    dob: '1975-01-19',
    phone: '(555) 603-9942',
    email: 'rchen@chencpafirm.com',
    street: '333 Financial District, Fl 12',
    city: 'San Francisco',
    state: 'CA',
    zip: '94111',
    brokerCode: 'BRK-8902',
    otherIdentifier: 'CPA-LIC-99382',
    status: 'Active',
    marketingConsent: {
      status: 'Granted',
      channels: ['Email', 'Phone'],
      consentDate: 'May 14, 2026',
      method: 'DocuSign Agreement',
      ipAddress: '64.233.160.1',
      notes: 'Consented to receive cross-sell commercial umbrella proposals.',
    },
    notes: [
      {
        id: 'N-6',
        date: 'Jun 10, 2026',
        author: 'Jordan Davis',
        text: 'Discussed Cyber Liability coverage addition in Q4.',
      },
    ],
    lastActivity: {
      description: 'Cyber Liability Proposal Shared',
      time: '1 week ago',
    },
    policies: [
      {
        id: 'POL-3321',
        policyNumber: 'POL-3321-CNA',
        type: 'Professional Liability',
        carrier: 'CNA',
        premium: '$16,200',
        effectiveDate: 'May 01, 2026',
        expirationDate: 'Apr 30, 2027',
        status: 'Active',
      },
      {
        id: 'POL-3322',
        policyNumber: 'POL-3322-AIG',
        type: 'Commercial Umbrella',
        carrier: 'AIG',
        premium: '$7,800',
        effectiveDate: 'May 01, 2026',
        expirationDate: 'Apr 30, 2027',
        status: 'Active',
      },
    ],
    commissions: [
      {
        id: 'COM-155',
        date: 'May 20, 2026',
        statementNumber: 'ST-2512',
        carrier: 'CNA',
        policyNumber: 'POL-3321-CNA',
        premium: '$16,200',
        rate: '13.5%',
        amount: '$2,187.00',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'T-7',
        title: 'Cyber Proposal Sent',
        type: 'contact',
        date: 'Oct 01, 2026',
        detail: 'Detailed Cyber and Data Breach liability plan submitted for review.',
        actor: 'Jordan Davis',
      },
    ],
  },
  {
    id: 'CL-1006',
    firstName: 'Amara',
    lastName: 'Diallo',
    name: 'Amara Diallo',
    businessName: 'Diallo Transport & Freight',
    dob: '1982-12-05',
    phone: '(555) 238-9901',
    email: 'amara@diallotransport.com',
    street: '8910 Interstate Loop, Bay 14',
    city: 'Atlanta',
    state: 'GA',
    zip: '30339',
    brokerCode: 'BRK-1044',
    otherIdentifier: 'DOT-3392019',
    status: 'Inactive',
    marketingConsent: {
      status: 'Declined',
      channels: [],
      consentDate: 'Jan 12, 2026',
      method: 'Opt-out on file',
      notes: 'Client declined marketing communications. Transactional updates only.',
    },
    notes: [
      {
        id: 'N-7',
        date: 'Mar 15, 2026',
        author: 'Jordan Davis',
        text: 'Fleet sold out of state; policies allowed to expire at term end. Preserving historical file.',
      },
    ],
    lastActivity: {
      description: 'Historical Records Archived',
      time: '3 weeks ago',
    },
    policies: [
      {
        id: 'POL-2190',
        policyNumber: 'POL-2190-TRAV',
        type: 'Commercial Auto',
        carrier: 'Travelers',
        premium: '$38,000',
        effectiveDate: 'Feb 01, 2025',
        expirationDate: 'Jan 31, 2026',
        status: 'Historical',
      },
      {
        id: 'POL-2191',
        policyNumber: 'POL-2191-HART',
        type: 'Cargo & Freight',
        carrier: 'Hartford',
        premium: '$14,500',
        effectiveDate: 'Feb 01, 2025',
        expirationDate: 'Jan 31, 2026',
        status: 'Historical',
      },
    ],
    commissions: [
      {
        id: 'COM-098',
        date: 'Feb 20, 2025',
        statementNumber: 'ST-1940',
        carrier: 'Travelers',
        policyNumber: 'POL-2190-TRAV',
        premium: '$38,000',
        rate: '12.0%',
        amount: '$4,560.00',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'T-8',
        title: 'Status Set to Inactive',
        type: 'system',
        date: 'Mar 15, 2026',
        detail: 'Client moved to inactive archive following business relocation.',
        actor: 'Jordan Davis',
      },
    ],
  },
  {
    id: 'CL-1007',
    firstName: 'Claire',
    lastName: 'Bouchard',
    name: 'Claire Bouchard',
    businessName: 'Bouchard Architecture Atelier',
    dob: '1987-03-22',
    phone: '(555) 902-3341',
    email: 'cbouchard@atelier-arch.com',
    street: '410 Design Row, Studio 3B',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
    brokerCode: 'BRK-8902',
    otherIdentifier: 'CO-AIA-88219',
    status: 'Active',
    marketingConsent: {
      status: 'Granted',
      channels: ['Email'],
      consentDate: 'Jun 22, 2026',
      method: 'Website Inbound Form',
      ipAddress: '73.14.88.204',
      notes: 'Consented via web contact form submission.',
    },
    notes: [
      {
        id: 'N-8',
        date: 'Jul 04, 2026',
        author: 'Jordan Davis',
        text: 'Architects errors and omissions insurance bound with Berkshire Hathaway.',
      },
    ],
    lastActivity: {
      description: 'Certificate of Insurance Issued',
      time: '5 days ago',
    },
    policies: [
      {
        id: 'POL-6612',
        policyNumber: 'POL-6612-BHHC',
        type: 'Errors & Omissions',
        carrier: 'Berkshire Hathaway',
        premium: '$19,800',
        effectiveDate: 'Jul 01, 2026',
        expirationDate: 'Jun 30, 2027',
        status: 'Active',
      },
    ],
    commissions: [
      {
        id: 'COM-177',
        date: 'Jul 19, 2026',
        statementNumber: 'ST-2622',
        carrier: 'Berkshire Hathaway',
        policyNumber: 'POL-6612-BHHC',
        premium: '$19,800',
        rate: '15.0%',
        amount: '$2,970.00',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'T-9',
        title: 'COI Dispatched to City Hall',
        type: 'policy',
        date: 'Oct 02, 2026',
        detail: 'Generated and transmitted Certificate of Insurance for civic project bidding.',
        actor: 'Jordan Davis',
      },
    ],
  },
  {
    id: 'CL-1008',
    firstName: 'Thomas',
    lastName: 'Garrison',
    name: 'Thomas Garrison',
    businessName: '—',
    dob: '1962-09-17',
    phone: '(555) 314-7789',
    email: 'tom.garrison62@gmail.com',
    street: '744 Meadowbrook Lane',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85001',
    brokerCode: 'BRK-8902',
    otherIdentifier: 'SSN-XXX-XX-4819',
    status: 'Inactive',
    marketingConsent: {
      status: 'Revoked',
      channels: [],
      consentDate: 'Feb 10, 2026',
      method: 'Phone Request',
      notes: 'Customer retired, cancelled personal umbrella, requested no further calls.',
    },
    notes: [
      {
        id: 'N-9',
        date: 'Feb 10, 2026',
        author: 'Jordan Davis',
        text: 'Client retired out of state. Historical personal umbrella records kept for compliance.',
      },
    ],
    lastActivity: {
      description: 'Account Marked Inactive',
      time: '2 months ago',
    },
    policies: [
      {
        id: 'POL-1109',
        policyNumber: 'POL-1109-CHUB',
        type: 'Personal Umbrella',
        carrier: 'Chubb',
        premium: '$4,200',
        effectiveDate: 'Jan 01, 2025',
        expirationDate: 'Dec 31, 2025',
        status: 'Historical',
      },
    ],
    commissions: [
      {
        id: 'COM-081',
        date: 'Jan 15, 2025',
        statementNumber: 'ST-1820',
        carrier: 'Chubb',
        policyNumber: 'POL-1109-CHUB',
        premium: '$4,200',
        rate: '15.0%',
        amount: '$630.00',
        status: 'Paid',
        sourceStatementUrl: '/broker/statements',
      },
    ],
    timeline: [
      {
        id: 'T-10',
        title: 'Consent Revocation Registered',
        type: 'consent',
        date: 'Feb 10, 2026',
        detail: 'Client requested marketing opt-out upon policy non-renewal.',
        actor: 'Jordan Davis',
      },
    ],
  },
]

