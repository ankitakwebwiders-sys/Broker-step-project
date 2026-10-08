'use client'

import { useState, useMemo } from 'react'

interface FilterOption {
  value: string
  label: string
}

interface UseFiltersProps<T> {
  data: T[]
  initialFilters?: Record<string, string>
}

export function useFilters<T extends Record<string, any>>({ data, initialFilters = {} }: UseFiltersProps<T>) {
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters)

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true
        const itemValue = item[key]
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase())
        }
        return itemValue === value
      })
    })
  }, [data, filters])

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: '' }))
  }

  const clearAllFilters = () => {
    setFilters(initialFilters)
  }

  return {
    filters,
    filteredData,
    updateFilter,
    clearFilter,
    clearAllFilters,
  }
}
