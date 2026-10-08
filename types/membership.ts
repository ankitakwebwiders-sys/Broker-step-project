export interface Membership {
  id: string
  brokerId: string
  plan: 'Starter' | 'Professional' | 'Enterprise'
  status: 'active' | 'trial' | 'past_due' | 'cancelled'
  startDate: Date
  endDate?: Date
  billingCycle: 'monthly' | 'annual'
  price: number
}

export interface Subscription {
  id: string
  membershipId: string
  stripeSubscriptionId?: string
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'unpaid'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export interface Payment {
  id: string
  subscriptionId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  paidAt?: Date
  createdAt: Date
}
