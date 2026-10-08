export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface Notification {
  id: string
  recipientId: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  readAt?: Date
}

export interface SystemSettings {
  id: string
  key: string
  value: any
  description?: string
  updatedAt: Date
}
