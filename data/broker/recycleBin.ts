export type RecycledItemType = 'lead' | 'client' | 'policy' | 'other'

export interface RecycledItem {
  id: string
  originalId: string
  type: RecycledItemType
  title: string
  subtitle?: string
  details?: string
  email?: string
  phone?: string
  deletedAt: string
  deletedAtFormatted: string
  deletedBy: string
  retentionDaysTotal: number
  daysRemaining: number
  originalData: any
}

export const INITIAL_RECYCLED_ITEMS: RecycledItem[] = [
  {
    id: 'RCY-8801',
    originalId: 'LD-199',
    type: 'lead',
    title: 'Arthur Pendelton',
    subtitle: 'Pendelton Marine Supplies',
    details: 'Commercial Marine · $22,400 est.',
    email: 'arthur@pendeltonmarine.com',
    phone: '(555) 782-9901',
    deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deletedAtFormatted: 'Oct 24, 2026 · 02:40 PM',
    deletedBy: 'Jordan Davis',
    retentionDaysTotal: 30,
    daysRemaining: 28,
    originalData: {
      id: 'LD-199',
      firstName: 'Arthur',
      lastName: 'Pendelton',
      name: 'Arthur Pendelton',
      businessName: 'Pendelton Marine Supplies',
      phone: '(555) 782-9901',
      email: 'arthur@pendeltonmarine.com',
      street: '404 Coastal Way',
      city: 'San Diego',
      state: 'CA',
      zip: '92101',
      dob: '1979-04-12',
      insuranceType: 'Commercial Marine',
      currentInsurance: 'Travelers',
      renewalDate: '2026-12-01',
      status: 'Archived',
      marketingConsent: {
        status: 'Granted',
        date: 'Oct 10, 2026',
        channel: 'Website Form',
      },
      createdDate: 'Oct 10, 2026',
      estimatedPremium: '$22,400',
      source: 'Website Form',
      additionalInfo: 'Hull and cargo coverage inquiry.',
      notes: [],
      timeline: [],
    },
  },
  {
    id: 'RCY-8802',
    originalId: 'CL-8921',
    type: 'client',
    title: 'Highland Crest Brewery',
    subtitle: 'Highland Crest LLC',
    details: 'General Liability & Property · $38,000',
    email: 'accounts@highlandbrew.com',
    phone: '(555) 321-7788',
    deletedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    deletedAtFormatted: 'Oct 22, 2026 · 11:15 AM',
    deletedBy: 'Jordan Davis',
    retentionDaysTotal: 30,
    daysRemaining: 26,
    originalData: {
      id: 'CL-8921',
      firstName: 'Declan',
      lastName: 'Ross',
      name: 'Highland Crest Brewery',
      businessName: 'Highland Crest LLC',
      clientType: 'Commercial',
      dob: '1982-08-19',
      phone: '(555) 321-7788',
      email: 'accounts@highlandbrew.com',
      street: '128 Brewery District',
      city: 'Toronto',
      state: 'ON',
      province: 'ON',
      zip: 'M5A 3C4',
      postalCode: 'M5A 3C4',
      brokerCode: 'BRK-8921',
      otherIdentifier: 'HC-902',
      status: 'Inactive',
      marketingConsent: {
        status: 'Granted',
        channels: ['Email', 'SMS'],
      },
      notes: [],
      lastActivity: {
        description: 'Policy cancelled upon facility relocation',
        time: 'Oct 22, 2026',
      },
      policies: [],
      commissions: [],
      timeline: [],
    },
  },
]

export function getRecycledItems(): RecycledItem[] {
  if (typeof window === 'undefined') {
    return INITIAL_RECYCLED_ITEMS
  }

  try {
    const raw = localStorage.getItem('broker_recycle_bin')
    if (!raw) {
      localStorage.setItem('broker_recycle_bin', JSON.stringify(INITIAL_RECYCLED_ITEMS))
      return INITIAL_RECYCLED_ITEMS
    }
    const parsed: RecycledItem[] = JSON.parse(raw)
    if (!Array.isArray(parsed)) return INITIAL_RECYCLED_ITEMS

    // Recalculate days remaining based on 30-day retention
    return parsed.map((item) => {
      const deletedTime = new Date(item.deletedAt).getTime()
      const now = Date.now()
      const daysElapsed = Math.floor((now - deletedTime) / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.max(0, 30 - Math.max(0, daysElapsed))
      return {
        ...item,
        daysRemaining: isNaN(daysRemaining) ? (item.daysRemaining ?? 30) : daysRemaining,
      }
    })
  } catch (err) {
    console.error('Error reading broker_recycle_bin from localStorage:', err)
    return INITIAL_RECYCLED_ITEMS
  }
}

export function saveRecycledItems(items: RecycledItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('broker_recycle_bin', JSON.stringify(items))
    window.dispatchEvent(
      new CustomEvent('broker_recycle_bin_updated', {
        detail: { count: items.length, items },
      })
    )
  } catch (err) {
    console.error('Error saving broker_recycle_bin to localStorage:', err)
  }
}

export function addRecycledItem(
  item: Omit<
    RecycledItem,
    'id' | 'deletedAt' | 'deletedAtFormatted' | 'retentionDaysTotal' | 'daysRemaining' | 'deletedBy'
  >
): RecycledItem {
  const current = getRecycledItems()
  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const newItem: RecycledItem = {
    ...item,
    id: `RCY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    deletedAt: now.toISOString(),
    deletedAtFormatted: `${formattedDate} · ${formattedTime}`,
    deletedBy: 'Jordan Davis',
    retentionDaysTotal: 30,
    daysRemaining: 30,
  }

  const updated = [newItem, ...current]
  saveRecycledItems(updated)
  return newItem
}

export function restoreRecycledItem(id: string): RecycledItem | null {
  const current = getRecycledItems()
  const found = current.find((item) => item.id === id)
  if (!found) return null

  const updated = current.filter((item) => item.id !== id)
  saveRecycledItems(updated)

  // Dispatch restore event so origin pages (leads, book-of-business) can recover data
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('broker_recycle_bin_restored', {
        detail: { item: found },
      })
    )
  }

  return found
}

export function restoreMultipleRecycledItems(ids: string[]): RecycledItem[] {
  const idSet = new Set(ids)
  const current = getRecycledItems()
  const restored: RecycledItem[] = []
  const remaining: RecycledItem[] = []

  for (const item of current) {
    if (idSet.has(item.id)) {
      restored.push(item)
    } else {
      remaining.push(item)
    }
  }

  saveRecycledItems(remaining)

  if (typeof window !== 'undefined') {
    for (const item of restored) {
      window.dispatchEvent(
        new CustomEvent('broker_recycle_bin_restored', {
          detail: { item },
        })
      )
    }
  }

  return restored
}

export function permanentlyDeleteRecycledItem(id: string): void {
  const current = getRecycledItems()
  const updated = current.filter((item) => item.id !== id)
  saveRecycledItems(updated)
}

export function permanentlyDeleteMultipleRecycledItems(ids: string[]): void {
  const idSet = new Set(ids)
  const current = getRecycledItems()
  const updated = current.filter((item) => !idSet.has(item.id))
  saveRecycledItems(updated)
}

export function clearRecycleBin(): void {
  saveRecycledItems([])
}
