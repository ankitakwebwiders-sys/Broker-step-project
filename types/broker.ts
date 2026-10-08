export interface Broker {
  id: string
  userId: string
  businessName: string
  brokerCode: string
  membership: 'Starter' | 'Professional' | 'Enterprise'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}
