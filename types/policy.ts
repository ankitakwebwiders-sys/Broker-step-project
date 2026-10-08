export interface Policy {
  id: string
  clientId: string
  brokerId: string
  policyNumber: string
  type: 'Commercial Auto' | 'Professional Liability' | 'Business Owners' | 'General Liability' | 'Workers Comp' | 'Other'
  carrier: string
  premium: number
  effectiveDate: Date
  expirationDate: Date
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  createdAt: Date
  updatedAt: Date
}

export interface Renewal {
  policy: Policy
  daysUntilRenewal: number
  status: 'on-track' | 'needs-attention' | 'overdue'
}
