export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'broker' | 'admin'
  membership?: 'Starter' | 'Professional' | 'Enterprise'
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: Date
}
