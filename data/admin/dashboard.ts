export interface PlatformKPIs {
  totalBrokers: number
  activeBrokers: number
  inactiveBrokers: number
  pendingBrokers: number
  suspendedBrokers: number
  activeRate: number
  totalAgencies: number
  totalPoliciesManaged: number
  grossCommissionProcessed: number
  monthlyRecurringRevenue: number
  annualRunRate: number
  activeSubscriptions: number
  trialBrokers: number
  failedPaymentsCount: number
  failedPaymentsAmount: number
  upcomingExpiriesCount: number
}

export interface AdminBrokerAccount {
  id: string
  brokerCode: string
  name: string
  email: string
  phone: string
  agencyName: string
  cityState: string
  membershipTier: 'Starter' | 'Professional' | 'Enterprise' | 'Custom Agency'
  billingCycle: 'Monthly' | 'Annual'
  status: 'Active' | 'Inactive' | 'Pending Verification' | 'Suspended'
  policiesCount: number
  grossCommissionVolume: number
  joinedDate: string
  lastActive: string
  autoRenew: boolean
}

export interface MembershipPlanOverview {
  id: string
  tierName: 'Starter' | 'Professional' | 'Enterprise' | 'Custom Agency'
  monthlyPrice: number
  annualPrice: number
  activeSubscribers: number
  monthlyRevenue: number
  sharePercentage: number
  featuresSummary: string
  growthMom: string
}

export interface FailedPaymentRecord {
  id: string
  transactionId: string
  brokerId: string
  brokerName: string
  agencyName: string
  email: string
  planTier: string
  amountDue: number
  failedDate: string
  daysOverdue: number
  retryCount: number
  maxRetries: number
  failureReason: 'Insufficient Funds' | 'Card Expired' | 'Bank Authentication Failed' | 'Payment Method Declined' | 'Fraud Security Flag'
  gracePeriodEnds: string
  status: 'Requires Attention' | 'Retrying' | 'Resolved' | 'Suspended'
}

export interface UpcomingExpiryRecord {
  id: string
  brokerId: string
  brokerName: string
  agencyName: string
  email: string
  planTier: string
  expiryDate: string
  daysRemaining: number
  billingCycle: 'Monthly' | 'Annual' | '14-Day Trial'
  autoRenew: boolean
  lastRenewalAttempt?: string
  churnRisk: 'Low' | 'Medium' | 'High'
}

export interface PlatformSystemMetric {
  service: string
  status: 'Operational' | 'Degraded' | 'Maintenance'
  uptime: string
  latency: string
  detail: string
}

export interface PlatformActivityLog {
  id: string
  timestamp: string
  type: 'broker' | 'subscription' | 'payment' | 'system' | 'carrier'
  title: string
  description: string
  user: string
}

export const platformKPIsData: PlatformKPIs = {
  totalBrokers: 142,
  activeBrokers: 124,
  inactiveBrokers: 9,
  pendingBrokers: 6,
  suspendedBrokers: 3,
  activeRate: 87.3,
  totalAgencies: 118,
  totalPoliciesManaged: 28450,
  grossCommissionProcessed: 6842500,
  monthlyRecurringRevenue: 34850,
  annualRunRate: 418200,
  activeSubscriptions: 127,
  trialBrokers: 8,
  failedPaymentsCount: 5,
  failedPaymentsAmount: 1845,
  upcomingExpiriesCount: 7,
}

export const membershipPlansOverviewData: MembershipPlanOverview[] = [
  {
    id: 'plan-starter',
    tierName: 'Starter',
    monthlyPrice: 49,
    annualPrice: 470,
    activeSubscribers: 38,
    monthlyRevenue: 1862,
    sharePercentage: 29.9,
    featuresSummary: 'Up to 250 policies, 3 carrier statements, basic matching',
    growthMom: '+8%',
  },
  {
    id: 'plan-pro',
    tierName: 'Professional',
    monthlyPrice: 149,
    annualPrice: 1430,
    activeSubscribers: 61,
    monthlyRevenue: 9089,
    sharePercentage: 48.0,
    featuresSummary: 'Unlimited policies, 15 carriers, automated reconciler & audit',
    growthMom: '+14%',
  },
  {
    id: 'plan-enterprise',
    tierName: 'Enterprise',
    monthlyPrice: 399,
    annualPrice: 3830,
    activeSubscribers: 22,
    monthlyRevenue: 8778,
    sharePercentage: 17.3,
    featuresSummary: 'Custom statement rules, multi-user seats, dedicated OCR parser',
    growthMom: '+18%',
  },
  {
    id: 'plan-custom',
    tierName: 'Custom Agency',
    monthlyPrice: 799,
    annualPrice: 7670,
    activeSubscribers: 6,
    monthlyRevenue: 4794,
    sharePercentage: 4.8,
    featuresSummary: 'Whitelabel broker portal, automated ledger sync, API integrations',
    growthMom: '+25%',
  },
]

export const failedPaymentsData: FailedPaymentRecord[] = [
  {
    id: 'FAIL-901',
    transactionId: 'TXN-SUB-8812',
    brokerId: 'BRK-109',
    brokerName: 'David K. Vance',
    agencyName: 'Vance Commercial Risks',
    email: 'd.vance@vancerisks.com',
    planTier: 'Enterprise ($399/mo)',
    amountDue: 399,
    failedDate: 'Today at 09:14 AM',
    daysOverdue: 1,
    retryCount: 2,
    maxRetries: 3,
    failureReason: 'Card Expired',
    gracePeriodEnds: 'In 4 days (Oct 13, 2026)',
    status: 'Requires Attention',
  },
  {
    id: 'FAIL-902',
    transactionId: 'TXN-SUB-8790',
    brokerId: 'BRK-044',
    brokerName: 'Alicia Gomez',
    agencyName: 'Solana Pacific Brokerage',
    email: 'alicia@solanapacific.com',
    planTier: 'Professional ($149/mo)',
    amountDue: 149,
    failedDate: 'Yesterday at 04:30 PM',
    daysOverdue: 2,
    retryCount: 3,
    maxRetries: 3,
    failureReason: 'Insufficient Funds',
    gracePeriodEnds: 'In 3 days (Oct 12, 2026)',
    status: 'Requires Attention',
  },
  {
    id: 'FAIL-903',
    transactionId: 'TXN-SUB-8744',
    brokerId: 'BRK-078',
    brokerName: 'Robert Sterling',
    agencyName: 'Sterling Insure Group',
    email: 'rsterling@sterlinginsure.org',
    planTier: 'Custom Agency ($799/mo)',
    amountDue: 799,
    failedDate: 'Oct 06, 2026',
    daysOverdue: 3,
    retryCount: 1,
    maxRetries: 3,
    failureReason: 'Bank Authentication Failed',
    gracePeriodEnds: 'In 2 days (Oct 11, 2026)',
    status: 'Requires Attention',
  },
  {
    id: 'FAIL-904',
    transactionId: 'TXN-SUB-8650',
    brokerId: 'BRK-112',
    brokerName: 'Chloe Bennett',
    agencyName: 'Apex Casualty Advisors',
    email: 'c.bennett@apexcasualty.com',
    planTier: 'Professional ($149/mo)',
    amountDue: 149,
    failedDate: 'Oct 05, 2026',
    daysOverdue: 4,
    retryCount: 2,
    maxRetries: 3,
    failureReason: 'Payment Method Declined',
    gracePeriodEnds: 'Tomorrow (Oct 10, 2026)',
    status: 'Requires Attention',
  },
  {
    id: 'FAIL-905',
    transactionId: 'TXN-SUB-8592',
    brokerId: 'BRK-095',
    brokerName: 'Kevin Gallagher',
    agencyName: 'Gallagher Coast Underwriters',
    email: 'kgallagher@coastunderwriters.com',
    planTier: 'Starter ($49/mo)',
    amountDue: 49,
    failedDate: 'Oct 04, 2026',
    daysOverdue: 5,
    retryCount: 3,
    maxRetries: 3,
    failureReason: 'Fraud Security Flag',
    gracePeriodEnds: 'Expired - Pending Action',
    status: 'Requires Attention',
  },
]

export const upcomingExpiriesData: UpcomingExpiryRecord[] = [
  {
    id: 'EXP-101',
    brokerId: 'BRK-031',
    brokerName: 'Marcus Sterling',
    agencyName: 'Metro Shield Brokers',
    email: 'm.sterling@metroshield.com',
    planTier: 'Enterprise ($399/mo)',
    expiryDate: 'Oct 11, 2026',
    daysRemaining: 2,
    billingCycle: 'Annual',
    autoRenew: false,
    churnRisk: 'High',
  },
  {
    id: 'EXP-102',
    brokerId: 'BRK-084',
    brokerName: 'Elena Rostova',
    agencyName: 'Heritage Risk Partners',
    email: 'elena@heritagerisk.com',
    planTier: 'Professional ($149/mo)',
    expiryDate: 'Oct 13, 2026',
    daysRemaining: 4,
    billingCycle: 'Monthly',
    autoRenew: false,
    churnRisk: 'Medium',
  },
  {
    id: 'EXP-103',
    brokerId: 'BRK-122',
    brokerName: 'Julian Hayes',
    agencyName: 'Hayes Benefits Alliance',
    email: 'j.hayes@hayesalliance.com',
    planTier: 'Starter (14-Day Trial)',
    expiryDate: 'Oct 14, 2026',
    daysRemaining: 5,
    billingCycle: '14-Day Trial',
    autoRenew: false,
    churnRisk: 'High',
  },
  {
    id: 'EXP-104',
    brokerId: 'BRK-015',
    brokerName: 'Samantha Wu',
    agencyName: 'Pacific Maritime Insurers',
    email: 'swu@pacificmaritime.com',
    planTier: 'Custom Agency ($799/mo)',
    expiryDate: 'Oct 16, 2026',
    daysRemaining: 7,
    billingCycle: 'Annual',
    autoRenew: true,
    churnRisk: 'Low',
  },
  {
    id: 'EXP-105',
    brokerId: 'BRK-072',
    brokerName: 'Thomas Thorne',
    agencyName: 'Ironclad Surety Group',
    email: 'tthorne@ironcladsurety.com',
    planTier: 'Professional ($149/mo)',
    expiryDate: 'Oct 18, 2026',
    daysRemaining: 9,
    billingCycle: 'Monthly',
    autoRenew: false,
    churnRisk: 'Medium',
  },
  {
    id: 'EXP-106',
    brokerId: 'BRK-139',
    brokerName: 'Priya Sharma',
    agencyName: 'Crestview Life & Health',
    email: 'priya@crestviewinsure.com',
    planTier: 'Starter (14-Day Trial)',
    expiryDate: 'Oct 20, 2026',
    daysRemaining: 11,
    billingCycle: '14-Day Trial',
    autoRenew: false,
    churnRisk: 'High',
  },
  {
    id: 'EXP-107',
    brokerId: 'BRK-063',
    brokerName: 'Gregory Vance',
    agencyName: 'Timberline Agency',
    email: 'gvance@timberlineins.com',
    planTier: 'Enterprise ($399/mo)',
    expiryDate: 'Oct 22, 2026',
    daysRemaining: 13,
    billingCycle: 'Annual',
    autoRenew: true,
    churnRisk: 'Low',
  },
]

export const adminBrokerAccountsData: AdminBrokerAccount[] = [
  {
    id: 'BRK-001',
    brokerCode: 'BRK-AZ-001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@apexbroker.com',
    phone: '(555) 234-5678',
    agencyName: 'Apex Brokerage Group',
    cityState: 'Phoenix, AZ',
    membershipTier: 'Enterprise',
    billingCycle: 'Annual',
    status: 'Active',
    policiesCount: 420,
    grossCommissionVolume: 184500,
    joinedDate: 'Jan 12, 2024',
    lastActive: '5 mins ago',
    autoRenew: true,
  },
  {
    id: 'BRK-002',
    brokerCode: 'BRK-TX-002',
    name: 'Michael Torres',
    email: 'm.torres@torresinsure.com',
    phone: '(555) 876-5432',
    agencyName: 'Torres Commercial Insurance',
    cityState: 'Austin, TX',
    membershipTier: 'Professional',
    billingCycle: 'Monthly',
    status: 'Active',
    policiesCount: 260,
    grossCommissionVolume: 92400,
    joinedDate: 'Feb 03, 2024',
    lastActive: '12 mins ago',
    autoRenew: true,
  },
  {
    id: 'BRK-003',
    brokerCode: 'BRK-IL-003',
    name: 'David K. Vance',
    email: 'd.vance@vancerisks.com',
    phone: '(555) 345-6789',
    agencyName: 'Vance Commercial Risks',
    cityState: 'Chicago, IL',
    membershipTier: 'Enterprise',
    billingCycle: 'Monthly',
    status: 'Active',
    policiesCount: 310,
    grossCommissionVolume: 148200,
    joinedDate: 'Mar 15, 2024',
    lastActive: '1 hour ago',
    autoRenew: false,
  },
  {
    id: 'BRK-004',
    brokerCode: 'BRK-CA-004',
    name: 'Alicia Gomez',
    email: 'alicia@solanapacific.com',
    phone: '(555) 987-6543',
    agencyName: 'Solana Pacific Brokerage',
    cityState: 'San Diego, CA',
    membershipTier: 'Professional',
    billingCycle: 'Monthly',
    status: 'Active',
    policiesCount: 180,
    grossCommissionVolume: 64200,
    joinedDate: 'Apr 22, 2024',
    lastActive: '2 hours ago',
    autoRenew: false,
  },
  {
    id: 'BRK-005',
    brokerCode: 'BRK-FL-005',
    name: 'Robert Sterling',
    email: 'rsterling@sterlinginsure.org',
    phone: '(555) 432-1098',
    agencyName: 'Sterling Insure Group',
    cityState: 'Miami, FL',
    membershipTier: 'Custom Agency',
    billingCycle: 'Annual',
    status: 'Active',
    policiesCount: 890,
    grossCommissionVolume: 420000,
    joinedDate: 'Nov 10, 2023',
    lastActive: '3 hours ago',
    autoRenew: true,
  },
  {
    id: 'BRK-006',
    brokerCode: 'BRK-NY-006',
    name: 'Jonathan Reynolds',
    email: 'jreynolds@empireadvisors.net',
    phone: '(555) 321-7654',
    agencyName: 'Empire Casualty Advisors',
    cityState: 'New York, NY',
    membershipTier: 'Starter',
    billingCycle: 'Monthly',
    status: 'Inactive',
    policiesCount: 45,
    grossCommissionVolume: 12500,
    joinedDate: 'May 08, 2024',
    lastActive: '4 days ago',
    autoRenew: false,
  },
  {
    id: 'BRK-007',
    brokerCode: 'BRK-WA-007',
    name: 'Emily Chen',
    email: 'emily.chen@cascadeprotect.com',
    phone: '(555) 654-9870',
    agencyName: 'Cascade Protection Services',
    cityState: 'Seattle, WA',
    membershipTier: 'Professional',
    billingCycle: 'Monthly',
    status: 'Pending Verification',
    policiesCount: 12,
    grossCommissionVolume: 4800,
    joinedDate: 'Oct 07, 2026',
    lastActive: 'Yesterday',
    autoRenew: true,
  },
  {
    id: 'BRK-008',
    brokerCode: 'BRK-GA-008',
    name: 'Kevin Gallagher',
    email: 'kgallagher@coastunderwriters.com',
    phone: '(555) 789-0123',
    agencyName: 'Gallagher Coast Underwriters',
    cityState: 'Atlanta, GA',
    membershipTier: 'Starter',
    billingCycle: 'Monthly',
    status: 'Suspended',
    policiesCount: 30,
    grossCommissionVolume: 8900,
    joinedDate: 'Aug 14, 2024',
    lastActive: 'Oct 04, 2026',
    autoRenew: false,
  },
]

export const platformSystemMetricsData: PlatformSystemMetric[] = [
  {
    service: 'Carrier Statement Ingestion OCR',
    status: 'Operational',
    uptime: '99.98%',
    latency: '1.2s avg parse',
    detail: '342 statement sheets processed in last 24h across 48 templates',
  },
  {
    service: 'Auto-Reconciliation Engine',
    status: 'Operational',
    uptime: '100.0%',
    latency: '85ms execution',
    detail: '94.2% initial pass match accuracy without manual intervention',
  },
  {
    service: 'Billing & Subscription Webhooks',
    status: 'Operational',
    uptime: '99.95%',
    latency: '110ms webhook sync',
    detail: 'Stripe webhook listener active; automated dunning retry cycle enabled',
  },
  {
    service: 'Audit Log & Ledger Storage',
    status: 'Operational',
    uptime: '100.0%',
    latency: '24ms query',
    detail: 'Encrypted tamper-evident audit storage running at 34% cluster capacity',
  },
]

export const platformActivityLogsData: PlatformActivityLog[] = [
  {
    id: 'LOG-01',
    timestamp: '10 mins ago',
    type: 'payment',
    title: 'Payment Failure Triggered',
    description: 'David K. Vance (Enterprise $399) renewal attempt #2 failed: Card Expired.',
    user: 'Billing Automation',
  },
  {
    id: 'LOG-02',
    timestamp: '42 mins ago',
    type: 'broker',
    title: 'New Broker Verification Submitted',
    description: 'Emily Chen from Cascade Protection Services submitted license credentials for review.',
    user: 'Self-Serve Portal',
  },
  {
    id: 'LOG-03',
    timestamp: '1 hour ago',
    type: 'carrier',
    title: 'Template Mapping Assigned',
    description: 'Super Admin assigned Travelers Master v3.2 template to 14 active broker accounts.',
    user: 'Admin (System)',
  },
  {
    id: 'LOG-04',
    timestamp: '2 hours ago',
    type: 'subscription',
    title: 'Plan Upgraded',
    description: 'Torres Commercial Insurance upgraded from Starter ($49/mo) to Professional ($149/mo).',
    user: 'Broker Self-Service',
  },
  {
    id: 'LOG-05',
    timestamp: '3 hours ago',
    type: 'system',
    title: 'Daily Platform Statement Backup',
    description: 'Automated off-site encrypted snapshot complete (1,482 statements preserved).',
    user: 'Backup Daemon',
  },
]
