export interface LeadNote {
  id: string
  date: string
  author: string
  text: string
}

export interface LeadTimelineEvent {
  id: string
  title: string
  date: string
  detail: string
  actor: string
  type: 'creation' | 'contact' | 'quote' | 'status' | 'conversion' | 'note'
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-Up'
  | 'Quoted'
  | 'Won / Converted'
  | 'Lost'
  | 'Not Interested'
  | 'Archived'

export interface LeadItem {
  id: string
  firstName: string
  lastName: string
  name: string
  businessName: string
  phone: string
  email: string
  street?: string
  city?: string
  state?: string
  zip?: string
  dob?: string
  insuranceType: string
  currentInsurance: string
  renewalDate: string
  status: LeadStatus
  marketingConsent: {
    status: 'Granted' | 'Pending' | 'Declined'
    date?: string
    channel?: string
  }
  createdDate: string
  estimatedPremium: string
  source: 'QR Lead Capture' | 'Website Form' | 'Broker Referral' | 'Phone Inbound'
  additionalInfo: string
  notes: LeadNote[]
  timeline: LeadTimelineEvent[]
  convertedClientId?: string
}

export const initialLeads: LeadItem[] = [
  {
    id: 'LD-201',
    firstName: 'Maya',
    lastName: 'Patel',
    name: 'Maya Patel',
    businessName: 'Patel Hospitality Group',
    phone: '(555) 749-1029',
    email: 'maya.patel@patelhospitality.com',
    street: '820 Grand Avenue, Suite 12',
    city: 'San Jose',
    state: 'CA',
    zip: '95112',
    dob: '1988-04-18',
    insuranceType: 'Commercial Property',
    currentInsurance: 'Hartford (Policy expiring soon)',
    renewalDate: 'Nov 15, 2026',
    status: 'New',
    marketingConsent: {
      status: 'Granted',
      date: 'Oct 07, 2026',
      channel: 'QR Mobile Form',
    },
    createdDate: 'Oct 07, 2026',
    estimatedPremium: '$34,500',
    source: 'QR Lead Capture',
    additionalInfo: 'Looking to bundle commercial property and umbrella for 3 boutique hotel locations.',
    notes: [
      {
        id: 'LN-1',
        date: 'Oct 07, 2026',
        author: 'System Intake',
        text: 'Captured via broker stand QR code. High priority hospitality commercial interest.',
      },
    ],
    timeline: [
      {
        id: 'LT-1',
        title: 'Lead Captured via QR Code',
        date: 'Oct 07, 2026, 10:14 AM',
        detail: 'Submitted intake form via mobile device at regional business forum.',
        actor: 'QR Inbound System',
        type: 'creation',
      },
    ],
  },
  {
    id: 'LD-202',
    firstName: 'Brian',
    lastName: 'Kaufman',
    name: 'Brian Kaufman',
    businessName: 'Kaufman BioTech Labs',
    phone: '(555) 612-4491',
    email: 'brian@kaufmanbiotech.io',
    street: '400 Science Park Way',
    city: 'Boston',
    state: 'MA',
    zip: '02142',
    dob: '1981-09-24',
    insuranceType: 'Cyber Liability',
    currentInsurance: 'Chubb',
    renewalDate: 'Dec 01, 2026',
    status: 'Contacted',
    marketingConsent: {
      status: 'Granted',
      date: 'Oct 04, 2026',
      channel: 'Website Form',
    },
    createdDate: 'Oct 04, 2026',
    estimatedPremium: '$19,200',
    source: 'Website Form',
    additionalInfo: 'Requires $5M cyber limit for FDA clinical data compliance.',
    notes: [
      {
        id: 'LN-2',
        date: 'Oct 05, 2026',
        author: 'Jordan Davis',
        text: 'Spoke with CFO Brian Kaufman. Scheduled deep-dive discovery call for next Tuesday.',
      },
    ],
    timeline: [
      {
        id: 'LT-2',
        title: 'Discovery Call Completed',
        date: 'Oct 05, 2026, 2:30 PM',
        detail: 'Discussed cloud ransomware coverage and international exposure.',
        actor: 'Jordan Davis',
        type: 'contact',
      },
      {
        id: 'LT-3',
        title: 'Lead Created from Web Form',
        date: 'Oct 04, 2026, 6:00 PM',
        detail: 'Inbound quote request submitted through landing page.',
        actor: 'Web Intake',
        type: 'creation',
      },
    ],
  },
  {
    id: 'LD-203',
    firstName: 'Chloe',
    lastName: 'Simmons',
    name: 'Chloe Simmons',
    businessName: 'Blue Harbor Marina',
    phone: '(555) 883-2910',
    email: 'chloe@blueharbormarina.com',
    street: '12 Waterfront Pier',
    city: 'Newport',
    state: 'RI',
    zip: '02840',
    dob: '1990-11-12',
    insuranceType: 'Marine & General Liability',
    currentInsurance: 'Travelers',
    renewalDate: 'Nov 30, 2026',
    status: 'Follow-Up',
    marketingConsent: {
      status: 'Granted',
      date: 'Sep 28, 2026',
      channel: 'Broker Referral',
    },
    createdDate: 'Sep 28, 2026',
    estimatedPremium: '$28,000',
    source: 'Broker Referral',
    additionalInfo: 'Dock expansion project completing in Q4; needs updated mooring endorsements.',
    notes: [
      {
        id: 'LN-3',
        date: 'Oct 02, 2026',
        author: 'Jordan Davis',
        text: 'Followed up regarding dock blueprint specs. Waiting for surveyor report.',
      },
    ],
    timeline: [
      {
        id: 'LT-4',
        title: 'Follow-Up Email Sent',
        date: 'Oct 02, 2026, 11:15 AM',
        detail: 'Requested certified slip surveyor inspection document.',
        actor: 'Jordan Davis',
        type: 'contact',
      },
    ],
  },
  {
    id: 'LD-204',
    firstName: 'Devon',
    lastName: 'Taylor',
    name: 'Devon Taylor',
    businessName: 'Apex Precision Engineering',
    phone: '(555) 431-8890',
    email: 'devon@apextaylor.com',
    street: '9100 Industrial Blvd',
    city: 'Detroit',
    state: 'MI',
    zip: '48202',
    dob: '1976-03-08',
    insuranceType: 'Business Owners (BOP)',
    currentInsurance: 'CNA Financial',
    renewalDate: 'Nov 01, 2026',
    status: 'Quoted',
    marketingConsent: {
      status: 'Granted',
      date: 'Sep 20, 2026',
      channel: 'Phone Inbound',
    },
    createdDate: 'Sep 20, 2026',
    estimatedPremium: '$22,400',
    source: 'Phone Inbound',
    additionalInfo: 'Quoted with Travelers and Chubb; awaiting board review.',
    notes: [
      {
        id: 'LN-4',
        date: 'Oct 01, 2026',
        author: 'Jordan Davis',
        text: 'Sent formal 3-tier comparative proposal. Favorable Travelers pricing.',
      },
    ],
    timeline: [
      {
        id: 'LT-5',
        title: 'Formal Quote Submitted',
        date: 'Oct 01, 2026, 4:20 PM',
        detail: 'Delivered customized BOP proposal package with $2M liability aggregate.',
        actor: 'Jordan Davis',
        type: 'quote',
      },
    ],
  },
  {
    id: 'LD-205',
    firstName: 'Marcus',
    lastName: 'Vance',
    name: 'Marcus Vance',
    businessName: 'Vance Logistics LLC',
    phone: '(555) 392-8812',
    email: 'm.vance@vancelogistics.com',
    street: '1420 Harbor Blvd, Suite 400',
    city: 'Seattle',
    state: 'WA',
    zip: '98104',
    dob: '1984-06-14',
    insuranceType: 'Commercial Auto',
    currentInsurance: 'Travelers',
    renewalDate: 'Oct 31, 2026',
    status: 'Won / Converted',
    marketingConsent: {
      status: 'Granted',
      date: 'Aug 14, 2026',
      channel: 'Direct Broker Referral',
    },
    createdDate: 'Aug 10, 2026',
    estimatedPremium: '$42,800',
    source: 'Broker Referral',
    convertedClientId: 'CL-1001',
    additionalInfo: 'Bound multi-unit commercial fleet policy with Travelers.',
    notes: [
      {
        id: 'LN-5',
        date: 'Aug 22, 2026',
        author: 'Jordan Davis',
        text: 'Policy successfully bound. Converted to Client record CL-1001.',
      },
    ],
    timeline: [
      {
        id: 'LT-6',
        title: 'Converted to Client #CL-1001',
        date: 'Aug 22, 2026, 3:00 PM',
        detail: 'Lead closed won. In-force policy #POL-8842 issued and activated.',
        actor: 'Jordan Davis',
        type: 'conversion',
      },
    ],
  },
  {
    id: 'LD-206',
    firstName: 'Elena',
    lastName: 'Rostova',
    name: 'Elena Rostova',
    businessName: 'Apex Dental Care',
    phone: '(555) 819-2041',
    email: 'elena@apexdentalcare.org',
    street: '720 Medical Plaza, Suite 210',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    dob: '1979-11-23',
    insuranceType: 'Professional Liability',
    currentInsurance: 'Medical Protective',
    renewalDate: 'Sep 30, 2026',
    status: 'Won / Converted',
    marketingConsent: {
      status: 'Granted',
      date: 'Jul 15, 2026',
      channel: 'Website Form',
    },
    createdDate: 'Jul 10, 2026',
    estimatedPremium: '$24,000',
    source: 'Website Form',
    convertedClientId: 'CL-1002',
    additionalInfo: 'Malpractice policy bound with Medical Protective.',
    notes: [
      {
        id: 'LN-6',
        date: 'Jul 28, 2026',
        author: 'Jordan Davis',
        text: 'Client account activated. Associated with #CL-1002.',
      },
    ],
    timeline: [
      {
        id: 'LT-7',
        title: 'Converted to Client #CL-1002',
        date: 'Jul 28, 2026, 11:30 AM',
        detail: 'Bound malpractice insurance and generated client roster profile.',
        actor: 'Jordan Davis',
        type: 'conversion',
      },
    ],
  },
  {
    id: 'LD-207',
    firstName: 'Lucas',
    lastName: 'Armas',
    name: 'Lucas Armas',
    businessName: 'Armas Freight Haulers',
    phone: '(555) 234-9011',
    email: 'lucas@armasfreight.com',
    street: '55 Interstate Junction',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    dob: '1975-08-30',
    insuranceType: 'Commercial Auto & Cargo',
    currentInsurance: 'Progressive Commercial',
    renewalDate: 'Oct 01, 2026',
    status: 'Lost',
    marketingConsent: {
      status: 'Declined',
      date: 'Sep 10, 2026',
      channel: 'Phone Inbound',
    },
    createdDate: 'Sep 05, 2026',
    estimatedPremium: '$31,000',
    source: 'Phone Inbound',
    additionalInfo: 'Client chose existing incumbent carrier due to renewal discount.',
    notes: [
      {
        id: 'LN-7',
        date: 'Sep 18, 2026',
        author: 'Jordan Davis',
        text: 'Current carrier matched our premium quote. Retained incumbent.',
      },
    ],
    timeline: [
      {
        id: 'LT-8',
        title: 'Lead Marked Lost',
        date: 'Sep 18, 2026, 1:45 PM',
        detail: 'Lost to incumbent rate match.',
        actor: 'Jordan Davis',
        type: 'status',
      },
    ],
  },
  {
    id: 'LD-208',
    firstName: 'Sofia',
    lastName: 'Gomez',
    name: 'Sofia Gomez',
    businessName: 'Bella Vista Catering',
    phone: '(555) 901-7723',
    email: 'sofia@bellavistacatering.net',
    street: '120 Market Street',
    city: 'San Antonio',
    state: 'TX',
    zip: '78205',
    dob: '1992-05-14',
    insuranceType: 'Workers Comp',
    currentInsurance: 'Texas Mutual',
    renewalDate: 'Jan 15, 2027',
    status: 'Not Interested',
    marketingConsent: {
      status: 'Declined',
      date: 'Aug 29, 2026',
      channel: 'Website Form',
    },
    createdDate: 'Aug 28, 2026',
    estimatedPremium: '$8,400',
    source: 'Website Form',
    additionalInfo: 'Expressed interest but decided to pause insurance review until next fiscal year.',
    notes: [
      {
        id: 'LN-8',
        date: 'Sep 02, 2026',
        author: 'Jordan Davis',
        text: 'Client requested not to be contacted until December.',
      },
    ],
    timeline: [
      {
        id: 'LT-9',
        title: 'Status Set to Not Interested',
        date: 'Sep 02, 2026, 10:00 AM',
        detail: 'Client deferred review to next year.',
        actor: 'Jordan Davis',
        type: 'status',
      },
    ],
  },
  {
    id: 'LD-209',
    firstName: 'Gregory',
    lastName: 'Hale',
    name: 'Gregory Hale',
    businessName: 'Hale Timber & Lumber',
    phone: '(555) 672-1100',
    email: 'ghale@haletimber.com',
    street: '8800 Sawmill Road',
    city: 'Eugene',
    state: 'OR',
    zip: '97401',
    dob: '1967-12-03',
    insuranceType: 'Workers Comp & Property',
    currentInsurance: 'Liberty Mutual',
    renewalDate: 'Jul 01, 2026',
    status: 'Archived',
    marketingConsent: {
      status: 'Pending',
      date: 'Jun 12, 2026',
      channel: 'Broker Referral',
    },
    createdDate: 'Jun 10, 2026',
    estimatedPremium: '$45,000',
    source: 'Broker Referral',
    additionalInfo: 'Business operations restructured; historical file preserved.',
    notes: [
      {
        id: 'LN-9',
        date: 'Jul 15, 2026',
        author: 'Jordan Davis',
        text: 'Archived record following lumber yard merger.',
      },
    ],
    timeline: [
      {
        id: 'LT-10',
        title: 'Record Archived',
        date: 'Jul 15, 2026, 9:00 AM',
        detail: 'Moved to archived files; compliance history kept.',
        actor: 'Jordan Davis',
        type: 'status',
      },
    ],
  },
]
