export interface Carrier {
  id: string
  name: string
  code: string
  commissionRates: CommissionRate[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CommissionRate {
  policyType: string
  rate: number
  effectiveFrom: Date
}
