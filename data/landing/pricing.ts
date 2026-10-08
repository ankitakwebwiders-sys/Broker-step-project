export const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For independent brokers getting organized.',
    features: [
      'Client and policy tracking',
      'Renewal reminders',
      'Basic commission visibility',
    ],
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'For growing brokerages ready to move faster.',
    features: [
      'Everything in Starter',
      'Automated lead capture',
      'Advanced reporting',
      'Team collaboration',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams that need a tailored operation.',
    features: [
      'Everything in Professional',
      'Admin controls and audit logs',
      'Priority support',
      'Custom workflows',
    ],
  },
]
