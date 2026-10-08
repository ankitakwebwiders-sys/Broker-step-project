export interface FaqItem {
  question: string
  answer: string
  category?: string
}

export const faqs: FaqItem[] = [
  {
    question: 'What is BrokerStep and how does it help insurance brokers?',
    answer:
      'BrokerStep is a modern, unified operating system designed specifically for independent insurance brokers and growing brokerages. It brings client relationship management, policy lifecycle tracking, upcoming renewals (7/30/60/90-day views), automated commission statement reconciliation, and lead capture into one seamless workspace.',
    category: 'General',
  },
  {
    question: 'How does automated carrier commission reconciliation work?',
    answer:
      'You can upload carrier commission statements in CSV or Excel format. BrokerStep automatically matches policy numbers, premiums, and expected commission percentages against actual carrier disbursements. It instantly identifies discrepancies, short-pays, chargebacks, and outstanding balances so no earned revenue slips through the cracks.',
    category: 'Commissions',
  },
  {
    question: 'Can I track renewals with advance notice and automated reminders?',
    answer:
      'Yes! The Upcoming Renewals dashboard organizes your book of business across 7, 30, 60, and 90-day renewal windows. You can quickly see expiring policies, carrier details, and premium values to proactively engage clients and secure renewals before expiration.',
    category: 'Policies',
  },
  {
    question: 'How secure is our brokerage and client policy data?',
    answer:
      'Data security is our top priority. We utilize enterprise-grade 256-bit AES encryption at rest and in transit, multi-factor authentication (MFA), role-based access controls, and daily automated backups in compliance with stringent insurance data privacy standards.',
    category: 'Security',
  },
  {
    question: 'Can I migrate my existing book of business from another CRM or spreadsheets?',
    answer:
      'Yes, absolutely. BrokerStep provides fast CSV and Excel data import tools for clients, policies, and carrier details. Our support team is also available to assist with data formatting and custom onboarding to ensure a smooth transition with zero downtime.',
    category: 'Onboarding',
  },
  {
    question: 'Can I change my membership plan or cancel at any time?',
    answer:
      'Yes. BrokerStep offers flexible plans with no long-term lock-in contracts. You can upgrade, downgrade, or change your subscription directly from your account settings at any time as your brokerage grows.',
    category: 'Billing',
  },
]
