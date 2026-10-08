export interface Statement {
  id: string
  brokerId: string
  carrier: string
  statementNumber: string
  periodStart: Date
  periodEnd: Date
  totalCommission: number
  status: 'received' | 'processing' | 'reconciled' | 'disputed'
  uploadedAt: Date
  reconciledAt?: Date
}

export interface StatementTemplate {
  id: string
  carrierId: string
  name: string
  fieldMappings: Record<string, string>
  createdAt: Date
  updatedAt: Date
}
