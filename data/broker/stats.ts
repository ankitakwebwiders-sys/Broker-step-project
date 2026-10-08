export interface KpiStat {
  id: string
  label: string
  value: string
  change: string
  note: string
  category: 'production' | 'commission' | 'policies'
  tone: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'indigo'
  link: string
}

export const dashboardStats: KpiStat[] = [
  {
    id: 'total-premium',
    label: 'Total Premium',
    value: '$1,420,000',
    change: '+14.2%',
    note: 'vs. last year',
    category: 'production',
    tone: 'emerald',
    link: '/broker/policies',
  },
  {
    id: 'total-policies',
    label: 'Total Policies',
    value: '1,284',
    change: '+8.6%',
    note: 'active book',
    category: 'policies',
    tone: 'blue',
    link: '/broker/policies',
  },
  {
    id: 'active-policies',
    label: 'Active Policies',
    value: '1,192',
    change: '92.8%',
    note: 'retention rate',
    category: 'policies',
    tone: 'blue',
    link: '/broker/policies',
  },
  {
    id: 'expected-commission',
    label: 'Expected Commission',
    value: '$142,000',
    change: '+8.4%',
    note: 'projected MTD',
    category: 'commission',
    tone: 'indigo',
    link: '/broker/commissions',
  },
  {
    id: 'actual-paid-commission',
    label: 'Actual/Paid Commission',
    value: '$125,000',
    change: '88.0%',
    note: 'collected MTD',
    category: 'commission',
    tone: 'emerald',
    link: '/broker/statements',
  },
  {
    id: 'outstanding-commission',
    label: 'Outstanding Commission',
    value: '$17,000',
    change: '11.9%',
    note: 'pending payment',
    category: 'commission',
    tone: 'rose',
    link: '/broker/commissions',
  },
  {
    id: 'partial-short-paid',
    label: 'Partial/Short-Paid Commission',
    value: '$3,200',
    change: '2.2%',
    note: 'under review',
    category: 'commission',
    tone: 'amber',
    link: '/broker/reconciliation',
  },
  {
    id: 'chargebacks',
    label: 'Chargebacks',
    value: '$800',
    change: '0.5%',
    note: 'clawback items',
    category: 'commission',
    tone: 'rose',
    link: '/broker/commissions',
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    value: '$1,500',
    change: '1.0%',
    note: 'manual delta',
    category: 'commission',
    tone: 'violet',
    link: '/broker/reconciliation',
  },
  {
    id: 'new-business',
    label: 'New Business',
    value: '$45,000',
    change: '+15.3%',
    note: '38 policies this month',
    category: 'production',
    tone: 'emerald',
    link: '/broker/policies',
  },
  {
    id: 'renewals',
    label: 'Renewals',
    value: '$97,000',
    change: '+10.8%',
    note: '84 policies this month',
    category: 'production',
    tone: 'blue',
    link: '/broker/renewals',
  },
]

export const carrierProductionData = [
  { carrier: 'Travelers', amount: '$58,000', percentage: 41, policies: 48, link: '/broker/carriers' },
  { carrier: 'AIG', amount: '$38,000', percentage: 27, policies: 32, link: '/broker/carriers' },
  { carrier: 'Chubb', amount: '$28,000', percentage: 20, policies: 24, link: '/broker/carriers' },
  { carrier: 'Progressive', amount: '$18,000', percentage: 12, policies: 18, link: '/broker/carriers' },
]

export const lobProductionData = [
  { lob: 'Commercial Property', amount: '$48,500', percentage: 34, link: '/broker/analytics' },
  { lob: 'Commercial Auto', amount: '$36,200', percentage: 25, link: '/broker/analytics' },
  { lob: "Workers' Compensation", amount: '$27,800', percentage: 20, link: '/broker/analytics' },
  { lob: 'General Liability', amount: '$19,500', percentage: 14, link: '/broker/analytics' },
  { lob: 'Cyber Liability', amount: '$10,000', percentage: 7, link: '/broker/analytics' },
]

export const commissionSummaryBreakdown = {
  expected: '$142,000',
  actualPaid: '$125,000',
  outstanding: '$17,000',
  partialShortPaid: '$3,200',
  chargebacks: '$800',
  adjustments: '$1,500',
  netCommission: '$125,700',
  paidRatio: 88,
}
