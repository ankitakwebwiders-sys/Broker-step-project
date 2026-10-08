export interface PricingPlan {
  name: string
  subtitle: string
  currency: string
  price: string
  period: string
  trial: string
  popular?: boolean
  includesTitle: string
  features: string[]
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    subtitle: 'Perfect for new brokers getting started.',
    currency: 'CAD',
    price: '1,000',
    period: '/ month',
    trial: '3-Day Free Trial',
    includesTitle: 'Includes:',
    features: [
      'Full Access for 3 Days',
      'Up to 100 Clients',
      'Basic Features',
      'Support via Email',
    ],
  },
  {
    name: 'Professional',
    subtitle: 'For growing brokers and teams.',
    currency: 'CAD',
    price: '1,500',
    period: '/ month',
    trial: '3-Day Free Trial',
    popular: true,
    includesTitle: 'Includes:',
    features: [
      'Up to 500 Clients',
      'Lead Generation Form',
      'All Core Features',
      'Priority Support',
    ],
  },
  {
    name: 'Business',
    subtitle: 'For large brokerages and advanced needs.',
    currency: 'CAD',
    price: '2,000',
    period: '/ month',
    trial: '3-Day Free Trial',
    includesTitle: 'Includes:',
    features: [
      'Unlimited Clients',
      'Advanced Analytics & Reports',
      'API Access',
      'Dedicated Support',
    ],
  },
]
