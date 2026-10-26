'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Trash2,
  RotateCcw,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowUpDown,
  Building2,
  Mail,
  Phone,
  Zap,
  BookOpen,
  Check,
} from 'lucide-react'
import {
  getRecycledItems,
  restoreRecycledItem,
  restoreMultipleRecycledItems,
  permanentlyDeleteRecycledItem,
  permanentlyDeleteMultipleRecycledItems,
  clearRecycleBin,
  type RecycledItem,
  type RecycledItemType,
} from '@/data/broker/recycleBin'

export default function RecycleBinPage() {
  const [items, setItems] = useState<RecycledItem[]>([])
  const [activeTab, setActiveTab] = useState<'All' | 'lead' | 'client' | 'expiring'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sortField, setSortField] = useState<'deletedAt' | 'daysRemaining' | 'title'>('deletedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Modals & Toasts
  const [permanentDeleteModal, setPermanentDeleteModal] = useState<{
    type: 'single' | 'bulk' | 'all'
    item?: RecycledItem
    ids: string[]
    count?: number
  } | null>(null)

  const [toastMessage, setToastMessage] = useState<{
    text: string
    actionHref?: string
    actionLabel?: string
  } | null>(null)

  // Load items on mount and listen to updates
  useEffect(() => {
    setItems(getRecycledItems())

    const handleUpdate = () => {
      setItems(getRecycledItems())
    }

    window.addEventListener('broker_recycle_bin_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('broker_recycle_bin_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Read ?tab= from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam === 'Leads' || tabParam === 'lead') setActiveTab('lead')
      else if (tabParam === 'Clients' || tabParam === 'client') setActiveTab('client')
    }
  }, [])

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    const list = items.filter((item) => {
      if (activeTab === 'lead' && item.type !== 'lead') return false
      if (activeTab === 'client' && item.type !== 'client') return false
      if (activeTab === 'expiring' && item.daysRemaining > 7) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesSubtitle = item.subtitle?.toLowerCase().includes(q) || false
        const matchesDetails = item.details?.toLowerCase().includes(q) || false
        const matchesId = item.originalId.toLowerCase().includes(q)
        const matchesEmail = item.email?.toLowerCase().includes(q) || false
        if (!matchesTitle && !matchesSubtitle && !matchesDetails && !matchesId && !matchesEmail) {
          return false
        }
      }
      return true
    })

    list.sort((a, b) => {
      if (sortField === 'deletedAt') {
        const timeA = new Date(a.deletedAt).getTime()
        const timeB = new Date(b.deletedAt).getTime()
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA
      }
      if (sortField === 'daysRemaining') {
        return sortDirection === 'asc' ? a.daysRemaining - b.daysRemaining : b.daysRemaining - a.daysRemaining
      }
      if (sortField === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      }
      return 0
    })

    return list
  }, [items, activeTab, searchQuery, sortField, sortDirection])

  // Counts
  const totalCount = items.length
  const leadsCount = useMemo(() => items.filter((i) => i.type === 'lead').length, [items])
  const clientsCount = useMemo(() => items.filter((i) => i.type === 'client').length, [items])
  const expiringCount = useMemo(() => items.filter((i) => i.daysRemaining <= 7).length, [items])

  // Selection
  const isAllSelected = filteredItems.length > 0 && filteredItems.every((i) => selectedIds.includes(i.id))
  const isSomeSelected = filteredItems.some((i) => selectedIds.includes(i.id)) && !isAllSelected

  function handleSelectAll() {
    if (isAllSelected) {
      const visibleSet = new Set(filteredItems.map((i) => i.id))
      setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)))
    } else {
      const visibleIds = filteredItems.map((i) => i.id)
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
    }
  }

  function handleToggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  // Restore handlers
  function handleRestoreSingle(item: RecycledItem) {
    const restored = restoreRecycledItem(item.id)
    if (restored) {
      setSelectedIds((prev) => prev.filter((id) => id !== item.id))
      const destination = item.type === 'lead' ? 'Leads & Marketing' : 'My Book'
      const href = item.type === 'lead' ? '/broker/leads' : '/broker/book-of-business'
      showToast(`Restored "${item.title}" back to ${destination}.`, href, `Go to ${destination}`)
    }
  }

  function handleRestoreSelected() {
    if (selectedIds.length === 0) return
    const restored = restoreMultipleRecycledItems(selectedIds)
    const count = restored.length
    setSelectedIds([])
    showToast(`Successfully restored ${count} items back to their active sections.`)
  }

  // Permanent Delete Execution (Step 2)
  function handleConfirmPermanentDelete() {
    if (!permanentDeleteModal) return

    if (permanentDeleteModal.type === 'all') {
      clearRecycleBin()
      setSelectedIds([])
      showToast('Recycle bin was completely emptied.')
    } else if (permanentDeleteModal.type === 'single' && permanentDeleteModal.item) {
      permanentlyDeleteRecycledItem(permanentDeleteModal.item.id)
      setSelectedIds((prev) => prev.filter((id) => id !== permanentDeleteModal.item?.id))
      showToast(`Permanently deleted "${permanentDeleteModal.item.title}". Record purged.`)
    } else if (permanentDeleteModal.type === 'bulk') {
      permanentlyDeleteMultipleRecycledItems(permanentDeleteModal.ids)
      const count = permanentDeleteModal.ids.length
      setSelectedIds([])
      showToast(`Permanently purged ${count} records.`)
    }

    setPermanentDeleteModal(null)
  }

  function showToast(text: string, actionHref?: string, actionLabel?: string) {
    setToastMessage({ text, actionHref, actionLabel })
    setTimeout(() => {
      setToastMessage(null)
    }, 5500)
  }

  return (
    <div className="p-4 sm:p-7 max-w-[1600px] mx-auto space-y-7">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
            {toastMessage.text}
          </div>
          {toastMessage.actionHref && (
            <Link
              href={toastMessage.actionHref}
              className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>{toastMessage.actionLabel || 'View'}</span>
              <ChevronRight className="size-3" />
            </Link>
          )}
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Broker Workspace · 2-Step Deletion Protection
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            Recycle Bin
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              30-Day Retention
            </span>
          </h1>
          <p className="mt-1 text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
            Deleted leads, clients, and policies are safely retained for 30 calendar days before permanent erasure.
            You can restore any item back to its active pipeline or permanently delete it now.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={items.length === 0}
            onClick={() => setPermanentDeleteModal({ type: 'all', ids: items.map((i) => i.id) })}
            className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
              items.length === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-900/60 cursor-pointer shadow-xs'
            }`}
          >
            <Trash2 className="size-4" />
            <span>Empty Recycle Bin</span>
          </button>
        </div>
      </div>

      {/* KPI Retention Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In Bin */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total In Bin
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Trash2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-xs text-slate-400">recoverable records</span>
          </div>
        </div>

        {/* Leads in Bin */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Leads &amp; Marketing
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Zap className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {leadsCount}
            </span>
            <span className="text-xs text-slate-400">deleted prospects</span>
          </div>
        </div>

        {/* Clients in Bin */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Book of Business
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {clientsCount}
            </span>
            <span className="text-xs text-slate-400">client accounts</span>
          </div>
        </div>

        {/* 30-Day Auto Retention Status */}
        <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Auto Retention
            </span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <span>30-Day Auto Purge</span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              Expired records auto-deleted safely
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] space-y-4">
        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 dark:border-white/10 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('All')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'All'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Items ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('lead')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'lead'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="size-3.5" />
              <span>Leads ({leadsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('client')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'client'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="size-3.5" />
              <span>My Book ({clientsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('expiring')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'expiring'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="size-3.5" />
              <span>Expiring Soon ({expiringCount})</span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, business, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="deletedAt">Recently Deleted</option>
                <option value="daysRemaining">Days Remaining</option>
                <option value="title">Alphabetical (Name)</option>
              </select>

              <button
                type="button"
                onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                <ArrowUpDown className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/90 dark:bg-blue-950/40 px-4 py-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {selectedIds.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-blue-950 dark:text-blue-100">
                {selectedIds.length === 1 ? '1 item selected' : `${selectedIds.length} items selected`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                Deselect
              </button>
              <button
                onClick={handleRestoreSelected}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Restore Selected ({selectedIds.length})</span>
              </button>
              <button
                onClick={() =>
                  setPermanentDeleteModal({
                    type: 'bulk',
                    ids: selectedIds,
                    count: selectedIds.length,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-white/10">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                <th className="py-3.5 px-4 w-[48px] text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected
                    }}
                    onChange={handleSelectAll}
                    className="size-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                  />
                </th>
                <th className="py-3.5 px-4 min-w-[240px]">Deleted Record</th>
                <th className="py-3.5 px-4 min-w-[140px]">Source Section</th>
                <th className="py-3.5 px-4 min-w-[200px]">Details &amp; Line</th>
                <th className="py-3.5 px-4 min-w-[180px]">Deleted Date &amp; Actor</th>
                <th className="py-3.5 px-4 min-w-[150px]">Retention Status</th>
                <th className="py-3.5 pr-6 pl-4 text-right min-w-[170px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Trash2 className="mx-auto size-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                      Recycle Bin is Empty
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-md mx-auto">
                      Any deleted records from Leads &amp; Marketing or your Book of Business will appear here for 30 days before being permanently purged.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id)
                  const isExpiring = item.daysRemaining <= 7

                  return (
                    <tr
                      key={item.id}
                      className={`group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(item.id)}
                          className="size-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                        />
                      </td>

                      {/* Record Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[220px]">
                              {item.title}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                              {item.originalId}
                            </span>
                          </div>
                          {item.subtitle && item.subtitle !== '—' && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <Building2 className="size-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[200px]">{item.subtitle}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Source Section */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.type === 'lead' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                            <Zap className="size-3 text-purple-600 dark:text-purple-400" />
                            <span>Leads</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                            <BookOpen className="size-3 text-blue-600 dark:text-blue-400" />
                            <span>My Book</span>
                          </span>
                        )}
                      </td>

                      {/* Details & Line */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {item.details ? (
                          <div className="font-medium">{item.details}</div>
                        ) : (
                          <span className="text-slate-400 italic">No coverage recorded</span>
                        )}
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          {item.phone && <span>{item.phone}</span>}
                          {item.email && <span>· {item.email}</span>}
                        </div>
                      </td>

                      {/* Deleted Date & Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {item.deletedAtFormatted}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          By {item.deletedBy}
                        </div>
                      </td>

                      {/* Retention Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                              isExpiring
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 animate-pulse'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            }`}
                          >
                            <Clock className="size-3" />
                            <span>{item.daysRemaining} days remaining</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          Auto-purges after 30 days
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestoreSingle(item)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer"
                            title="Restore back to active pipeline"
                          >
                            <RotateCcw className="size-3" />
                            <span>Restore</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPermanentDeleteModal({
                                type: 'single',
                                item,
                                ids: [item.id],
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-900/60 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition cursor-pointer"
                            title="Step 2: Permanently delete record"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PERMANENT DELETION MODAL (Step 2 of 2)
      ─────────────────────────────────────────────────────────────── */}
      {permanentDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-4">
              <AlertTriangle className="size-6" />
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 mb-2">
              Step 2 of 2 · Permanent Deletion
            </div>

            <h3 className="text-[17px] font-bold text-slate-900 dark:text-slate-100">
              {permanentDeleteModal.type === 'all'
                ? 'Empty Entire Recycle Bin?'
                : permanentDeleteModal.type === 'bulk'
                ? `Permanently Purge ${permanentDeleteModal.count} Records?`
                : `Permanently Delete "${permanentDeleteModal.item?.title}"?`}
            </h3>

            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This action <strong>CANNOT</strong> be undone. The selected data will be irreversibly erased from your workspace, activity logs, and system backups.
            </p>

            {permanentDeleteModal.item && (
              <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-[12px] space-y-1.5 border border-slate-200/60 dark:border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Record ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {permanentDeleteModal.item.originalId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
                    {permanentDeleteModal.item.type}
                  </span>
                </div>
                {permanentDeleteModal.item.subtitle && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Business</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {permanentDeleteModal.item.subtitle}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPermanentDeleteModal(null)}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel (Keep in Bin)
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-[12px] font-bold text-white shadow-md transition cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Permanently Erase</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
