export interface RenewalPolicy {
  client: string
  type: string
  carrier: string
  date: string
  daysUntil: number
  premium: string
  status: 'On track' | 'Needs attention' | 'Urgent review'
  initials: string
  color: string
}

export const upcomingRenewals: RenewalPolicy[] = [
  // Within 7 days
  {
    client: 'Apex Logistics Corp',
    type: 'Commercial Auto',
    carrier: 'Travelers',
    date: 'Oct 12, 2026',
    daysUntil: 5,
    premium: '$34,200',
    status: 'Needs attention',
    initials: 'AL',
    color: 'bg-rose-100 text-rose-700',
  },
  {
    client: 'Northstar Logistics',
    type: 'Commercial Auto',
    carrier: 'Travelers',
    date: 'Oct 14, 2026',
    daysUntil: 7,
    premium: '$42,800',
    status: 'On track',
    initials: 'NL',
    color: 'bg-blue-100 text-blue-700',
  },
  // Within 30 days
  {
    client: 'Riverside Dental Group',
    type: 'Professional Liability',
    carrier: 'AIG',
    date: 'Oct 19, 2026',
    daysUntil: 12,
    premium: '$18,450',
    status: 'Needs attention',
    initials: 'RD',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    client: 'Cedar & Co. Retail',
    type: 'Business Owners (BOP)',
    carrier: 'Chubb',
    date: 'Oct 23, 2026',
    daysUntil: 16,
    premium: '$9,240',
    status: 'On track',
    initials: 'CC',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    client: 'Bayside Marine Supply',
    type: 'Inland Marine',
    carrier: 'Progressive',
    date: 'Oct 28, 2026',
    daysUntil: 21,
    premium: '$21,500',
    status: 'On track',
    initials: 'BM',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    client: 'Pinnacle Tech Systems',
    type: 'Cyber Liability',
    carrier: 'Travelers',
    date: 'Nov 02, 2026',
    daysUntil: 26,
    premium: '$16,600',
    status: 'On track',
    initials: 'PT',
    color: 'bg-indigo-100 text-indigo-700',
  },
  // Within 60 days
  {
    client: 'Summit Hotel Group',
    type: 'Commercial Property',
    carrier: 'AIG',
    date: 'Nov 18, 2026',
    daysUntil: 42,
    premium: '$64,000',
    status: 'On track',
    initials: 'SH',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    client: 'Metro Steel Fabrication',
    type: "Workers' Compensation",
    carrier: 'Travelers',
    date: 'Dec 02, 2026',
    daysUntil: 56,
    premium: '$38,900',
    status: 'Needs attention',
    initials: 'MS',
    color: 'bg-violet-100 text-violet-700',
  },
  // Within 90 days
  {
    client: 'Clearwater BioSciences',
    type: 'D&O Liability',
    carrier: 'Chubb',
    date: 'Dec 22, 2026',
    daysUntil: 76,
    premium: '$29,400',
    status: 'On track',
    initials: 'CB',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    client: 'Redwood Valley Vineyard',
    type: 'Commercial Package',
    carrier: 'AIG',
    date: 'Jan 04, 2027',
    daysUntil: 89,
    premium: '$24,750',
    status: 'On track',
    initials: 'RV',
    color: 'bg-amber-100 text-amber-700',
  },
]
