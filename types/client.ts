export interface Client {
  id: string
  brokerId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  status: 'active' | 'inactive' | 'prospect'
  createdAt: Date
  updatedAt: Date
}

export interface ClientWithPolicies extends Client {
  policyCount: number
  totalPremium: number
}
