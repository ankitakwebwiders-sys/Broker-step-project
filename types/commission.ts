export interface Commission {
  id: string
  brokerId: string
  policyId: string
  statementId: string
  amount: number
  rate: number
  status: 'pending' | 'earned' | 'paid'
  paidDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CommissionOverview {
  totalExpected: number
  totalPaid: number
  totalOutstanding: number
  yearOverYearChange: number
}
