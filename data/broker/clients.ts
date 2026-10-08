export interface ClientPolicy {
  id: string
  policyNumber: string
  type: string
  carrier: string
  premium: string
  effectiveDate: string
  expirationDate: string
  status: 'Active' | 'Historical' | 'Pending Renewal' | 'Cancelled'
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
  dob: string
  phone: string
  email: string
  street: string
  city: string
  state: string
  zip: string
  brokerCode: string
  otherIdentifier: string
  status: 'Active' | 'Inactive'
  marketingConsent: ConsentRecord
  notes: ClientNote[]
  lastActivity: {
    description: string
    time: string
  }
  policies: ClientPolicy[]
  commissions: CommissionTransaction[]
  timeline: ClientTimelineEvent[]
}

export const initialClients: ClientItem[] = [
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
