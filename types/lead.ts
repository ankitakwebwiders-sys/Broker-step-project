export interface Lead {
  id: string
  brokerId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  source: 'qr' | 'referral' | 'website' | 'other'
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  notes?: string
  createdAt: Date
  updatedAt: Date
}
