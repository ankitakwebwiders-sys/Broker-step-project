'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  AlertCircle,
  CreditCard,
  Calendar,
  Check,
  CheckCheck,
  ArrowRight,
  ShieldCheck,
  Info,
  X,
  ExternalLink,
} from 'lucide-react'

export interface BrokerNotification {
  id: string
  type: 'payment_failed' | 'expiry_warning' | 'account_status'
  title: string
  message: string
  badge: string
  timestamp: string
  unread: boolean
  actionText: string
  targetHref: string
  severity: 'critical' | 'warning' | 'info'
}

const DEFAULT_NOTIFICATIONS: BrokerNotification[] = [
  {
    id: 'notif-failed-payment',
    type: 'payment_failed',
    title: 'Failed Membership Payment',
    message:
      'Your monthly renewal payment of $79.00 for the Professional Plan failed to process on Visa ending in 4242. Please update your payment method immediately to avoid account suspension.',
    badge: 'Critical Billing',
    timestamp: '15 mins ago',
    unread: true,
    actionText: 'Update Payment Method',
    targetHref: '/broker/settings?tab=membership',
    severity: 'critical',
  },
  {
    id: 'notif-expiry-warning',
    type: 'expiry_warning',
    title: 'Membership Expiry / Renewal Notice',
    message:
      'Your Professional Plan subscription renewal is approaching on November 1, 2026. Auto-renewal is active ($79/mo). Review active features, licenses, or billing terms.',
    badge: 'Renewal Alert',
    timestamp: 'Yesterday',
    unread: true,
    actionText: 'Review Membership Terms',
    targetHref: '/broker/settings?tab=membership',
    severity: 'warning',
  },
  {
    id: 'notif-account-status',
    type: 'account_status',
    title: 'Account Security & Compliance Verified',
    message:
      'Your broker credentials (NPN #19842011), state licensing records, and active 2FA security protocols have been verified.',
    badge: 'Account Verified',
    timestamp: '3 days ago',
    unread: false,
    actionText: 'Manage Security & 2FA',
    targetHref: '/broker/settings?tab=account',
    severity: 'info',
  },
]

export function HeaderNotificationCenter({
  onNavigate,
}: {
  onNavigate?: (href: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<BrokerNotification[]>(DEFAULT_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const unreadCount = notifications.filter((n) => n.unread).length

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  function handleNotificationClick(notif: BrokerNotification) {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    )
    setIsOpen(false)

    // Navigate to target affected page
    if (onNavigate) {
      onNavigate(notif.targetHref)
    } else {
      router.push(notif.targetHref)
      if (typeof window !== 'undefined') {
        const [subPath, subQuery] = notif.targetHref.split('?')
        window.dispatchEvent(
          new CustomEvent('broker-nav-change', {
            detail: {
              href: notif.targetHref,
              search: subQuery ? `?${subQuery}` : '',
              pathname: subPath,
            },
          })
        )
      }
    }
  }

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => n.unread) : notifications

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex size-9 items-center justify-center rounded-xl transition-colors cursor-pointer ${
          isOpen
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
        aria-label="Notifications Center"
        aria-expanded={isOpen}
        title="Notification Center"
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className="absolute inline-flex size-4 animate-ping rounded-full bg-rose-500 opacity-75" />
            <span className="relative flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-[380px] sm:w-[420px] rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-950">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Membership, billing and account alerts
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#0170FE] hover:underline"
                >
                  <CheckCheck className="size-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 bg-white text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Check className="size-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">No unread notifications at this time.</p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const isCritical = notif.severity === 'critical'
                const isWarning = notif.severity === 'warning'

                return (
                  <div
                    key={notif.id}
                    className={`p-4 transition-colors relative hover:bg-slate-50/80 ${
                      notif.unread ? 'bg-blue-50/25' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Left Icon Badge */}
                      <div
                        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                          isCritical
                            ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-200'
                            : isWarning
                            ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                            : 'bg-blue-100 text-[#0170FE] ring-1 ring-blue-200'
                        }`}
                      >
                        {isCritical ? (
                          <CreditCard className="size-4.5" />
                        ) : isWarning ? (
                          <Calendar className="size-4.5" />
                        ) : (
                          <ShieldCheck className="size-4.5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                              isCritical
                                ? 'bg-rose-100 text-rose-700'
                                : isWarning
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {notif.badge}
                          </span>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {notif.timestamp}
                          </span>
                        </div>

                        <h4 className="mt-1 text-sm font-bold text-slate-900 leading-snug">
                          {notif.title}
                        </h4>

                        <p className="mt-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>

                        {/* Action Link to affected membership/account page */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleNotificationClick(notif)}
                            className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                              isCritical
                                ? 'text-rose-600 hover:text-rose-700 hover:underline'
                                : 'text-[#0170FE] hover:text-[#0060db] hover:underline'
                            }`}
                          >
                            <span>{notif.actionText}</span>
                            <ArrowRight className="size-3.5" />
                          </button>

                          {notif.unread && (
                            <span className="size-2 rounded-full bg-blue-600" title="Unread" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer Notice (Client Requirement Specification) */}
          <div className="border-t border-slate-100 p-3.5 bg-slate-50/80 text-xs text-slate-500 flex items-start gap-2">
            <Info className="size-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Header notification center links directly to affected membership and account settings. Other notification workflows are not automatically included unless separately agreed.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
