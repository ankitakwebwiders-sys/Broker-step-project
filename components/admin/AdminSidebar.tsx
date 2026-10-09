'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Building2,
  FileText,
  BellRing,
  Cog,
  LogOut,
  ChevronDown,
  X,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

export interface SubNavItemDef {
  label: string
  href: string
  count?: string
  badge?: string
}

export interface AdminNavItemDef {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  count?: string
  badge?: string
  subItems?: SubNavItemDef[]
}

export interface AdminNavSectionDef {
  label: string
  items: AdminNavItemDef[]
}

// ───── Client Specified Admin Navigation Schema ─────
export const adminNavSections: AdminNavSectionDef[] = [
  {
    label: 'OVERVIEW',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
        subItems: [
          { label: 'Platform Overview', href: '/admin/dashboard' },
        ],
      },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      {
        label: 'Brokers',
        icon: Users,
        count: '42',
        href: '/admin/brokers',
        subItems: [
          { label: 'All Brokers', href: '/admin/brokers' },
          { label: 'Active', href: '/admin/brokers?tab=active' },
          { label: 'Inactive', href: '/admin/brokers?tab=inactive' },
          { label: 'Pending / Relevant Status', href: '/admin/brokers?tab=pending' },
          { label: 'Broker Details', href: '/admin/brokers?view=details' },
        ],
      },
      {
        label: 'Membership Plans',
        icon: ShieldCheck,
        href: '/admin/memberships',
        subItems: [
          { label: 'All Plans', href: '/admin/memberships' },
          { label: 'Create Plan', href: '/admin/memberships?action=create' },
          { label: 'Edit Plan', href: '/admin/memberships?action=edit' },
          { label: 'Pricing', href: '/admin/memberships?tab=pricing' },
          { label: 'Billing Frequency', href: '/admin/memberships?tab=billing-frequency' },
          { label: 'Trial', href: '/admin/memberships?tab=trial' },
          { label: 'Discounts / Promotions', href: '/admin/memberships?tab=promotions' },
          { label: 'Plan Features', href: '/admin/memberships?tab=features' },
        ],
      },
      {
        label: 'Subscriptions / Billing',
        icon: CreditCard,
        href: '/admin/subscriptions',
        subItems: [
          { label: 'Subscriptions', href: '/admin/subscriptions' },
          { label: 'Payment Status', href: '/admin/payments' },
          { label: 'Failed Payments', href: '/admin/subscriptions?tab=failed-payments' },
          { label: 'Expiring / Non-Renewing', href: '/admin/subscriptions?tab=expiring' },
          { label: 'Subscription Details', href: '/admin/subscriptions?view=details' },
        ],
      },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      {
        label: 'Carriers',
        icon: Building2,
        href: '/admin/carriers',
        subItems: [
          { label: 'Carrier Master', href: '/admin/carriers' },
          { label: 'Add / Edit Carrier', href: '/admin/carriers?action=add' },
          { label: 'Default Commission Rates', href: '/admin/commission-config' },
        ],
      },
      {
        label: 'Statement Templates',
        icon: FileText,
        href: '/admin/statement-templates',
        subItems: [
          { label: 'Standard Templates', href: '/admin/statement-templates' },
          { label: 'Broker-Specific Templates', href: '/admin/statement-templates?tab=broker-specific' },
          { label: 'Field Mapping', href: '/admin/field-mappings' },
          { label: 'Extraction / Mapping Rules', href: '/admin/statement-templates?tab=rules' },
          { label: 'Template Assignment', href: '/admin/statement-templates?tab=assignment' },
        ],
      },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      {
        label: 'Notifications',
        icon: BellRing,
        count: '5',
        href: '/admin/notifications',
        subItems: [
          { label: 'Payment Failure', href: '/admin/notifications?type=payment-failure' },
          { label: 'Expiry / Non-Renewal', href: '/admin/notifications?type=expiry' },
          { label: 'Notification Configuration where agreed', href: '/admin/notifications?tab=config' },
        ],
      },
      {
        label: 'Platform Settings',
        icon: Cog,
        href: '/admin/settings',
        subItems: [
          { label: 'Basic Platform Configuration', href: '/admin/settings' },
        ],
      },
    ],
  },
]

export function AdminLogo() {
  return (
    <Link href="/admin/dashboard" className="inline-flex items-center transition-opacity hover:opacity-90">
      <Image
        src="/images/logos/broker-dark-theme.png"
        alt="BrokerStep Logo"
        width={360}
        height={100}
        style={{ width: 'auto', height: '96px' }}
        className="object-contain"
        priority
      />
    </Link>
  )
}

function NavItem({
  item,
  active,
  expanded,
  onToggleExpand,
  onClick,
  currentSearch,
  pathname,
  onCloseMobile,
}: {
  item: AdminNavItemDef
  active: boolean
  expanded: boolean
  onToggleExpand: () => void
  onClick?: () => void
  currentSearch: string
  pathname: string
  onCloseMobile?: () => void
}) {
  const Icon = item.icon
  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0)
  const router = useRouter()

  const isSubItemActive = (subHref: string) => {
    if (subHref.includes('?')) {
      const [subPath, subQuery] = subHref.split('?')
      if (pathname !== subPath) return false
      const currentParams = new URLSearchParams(currentSearch)
      const subParams = new URLSearchParams(subQuery)
      let matches = true
      subParams.forEach((val, key) => {
        if (currentParams.get(key) !== val) {
          matches = false
        }
      })
      return matches
    }
    return pathname === subHref && (!currentSearch || currentSearch === '' || currentSearch === '?')
  }

  const handleParentClick = (e: React.MouseEvent) => {
    if (!expanded && hasSubItems) {
      onToggleExpand()
    }
    if (onClick) onClick()

    if (pathname === item.href) {
      e.preventDefault()
      window.history.pushState(null, '', item.href)
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: { href: item.href, search: '', pathname: item.href },
        })
      )
    }
  }

  const handleSubClick = (e: React.MouseEvent, subHref: string) => {
    if (onCloseMobile) onCloseMobile()
    const [subPath, subQuery] = subHref.split('?')
    const targetSearch = subQuery ? `?${subQuery}` : ''

    if (pathname === subPath) {
      e.preventDefault()
      window.history.pushState(null, '', subHref)
      window.dispatchEvent(
        new CustomEvent('broker-nav-change', {
          detail: { href: subHref, search: targetSearch, pathname: subPath },
        })
      )
    } else {
      e.preventDefault()
      router.push(subHref)
    }
  }

  return (
    <div className="flex flex-col">
      <div
        className={`group relative flex w-full items-center rounded-xl transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md shadow-blue-500/25'
            : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-medium'
        }`}
      >
        <Link
          href={item.href}
          onClick={handleParentClick}
          className="flex flex-1 items-center gap-3 px-3 py-2.5 text-[13px]"
        >
          <Icon
            className={`size-[18px] shrink-0 transition-colors ${
              active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
            }`}
          />
          <span className="flex-1 truncate">{item.label}</span>
          {item.count && (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                active
                  ? 'bg-white/20 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 border border-slate-700/60 group-hover:bg-slate-700/80 group-hover:text-white'
              }`}
            >
              {item.count}
            </span>
          )}
          {item.badge && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                active
                  ? 'bg-white/25 text-white'
                  : 'bg-blue-500/15 text-blue-400 border border-blue-400/30'
              }`}
            >
              {item.badge}
            </span>
          )}
        </Link>

        {hasSubItems && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleExpand()
            }}
            className={`p-2 mr-1 rounded-lg transition-colors cursor-pointer ${
              active
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label={`Toggle ${item.label} submenus`}
          >
            <ChevronDown
              className={`size-3.5 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {/* Submenu Accordion */}
      {hasSubItems && expanded && (
        <div className="ml-5 mt-2.5 mb-1.5 border-l border-slate-800/90 pl-2.5 flex flex-col space-y-1 pt-1 animate-in fade-in duration-150">
          {item.subItems!.map((sub, subIdx) => {
            const isSubActive = isSubItemActive(sub.href)
            return (
              <Link
                key={sub.label + sub.href}
                href={sub.href}
                onClick={(e) => handleSubClick(e, sub.href)}
                className={`group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all cursor-pointer ${
                  subIdx === 0 ? 'mt-1.5' : ''
                } ${
                  isSubActive
                    ? 'bg-blue-500/15 text-blue-400 font-semibold -ml-[11px] pl-[9px] border-l-2 border-blue-500'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`}
              >
                <span className="truncate">{sub.label}</span>
                {sub.count && (
                  <span className="rounded px-1.5 py-0.2 text-[10px] font-semibold bg-slate-800/80 text-slate-400">
                    {sub.count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface AdminSidebarProps {
  onCloseMobile?: () => void
  className?: string
  showHeader?: boolean
}

export function AdminSidebar({
  onCloseMobile,
  className = '',
  showHeader = true,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [currentSearch, setCurrentSearch] = useState('')
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const section of adminNavSections) {
      for (const item of section.items) {
        if (
          pathname === item.href ||
          pathname.startsWith(item.href + '/') ||
          (item.href === '/admin/subscriptions' && pathname === '/admin/payments') ||
          (item.href === '/admin/carriers' && pathname === '/admin/commission-config') ||
          (item.href === '/admin/statement-templates' && pathname === '/admin/field-mappings')
        ) {
          initial[item.label] = true
        }
      }
    }
    return initial
  })

  // Track search params safely for client sub-item active state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentSearch(window.location.search)
    }
    const updateSearch = (e?: any) => {
      if (e?.detail?.search !== undefined) {
        setCurrentSearch(e.detail.search)
      } else if (typeof window !== 'undefined') {
        setCurrentSearch(window.location.search)
      }
    }
    window.addEventListener('popstate', updateSearch)
    window.addEventListener('broker-nav-change', updateSearch)
    return () => {
      window.removeEventListener('popstate', updateSearch)
      window.removeEventListener('broker-nav-change', updateSearch)
    }
  }, [pathname])

  // Automatically expand the active parent menu
  useEffect(() => {
    for (const section of adminNavSections) {
      for (const item of section.items) {
        if (
          pathname === item.href ||
          pathname.startsWith(item.href + '/') ||
          (item.href === '/admin/subscriptions' && pathname === '/admin/payments') ||
          (item.href === '/admin/carriers' && pathname === '/admin/commission-config') ||
          (item.href === '/admin/statement-templates' && pathname === '/admin/field-mappings')
        ) {
          setExpandedMenus((prev) => ({ ...prev, [item.label]: true }))
        }
      }
    }
  }, [pathname])

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isItemActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin'
    }
    if (href === '/admin/subscriptions' && pathname === '/admin/payments') {
      return true
    }
    if (href === '/admin/carriers' && pathname === '/admin/commission-config') {
      return true
    }
    if (href === '/admin/statement-templates' && pathname === '/admin/field-mappings') {
      return true
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div
      className={`flex h-full w-[280px] flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 px-3.5 py-4 ${className}`}
    >
      {/* Brand Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-2 mb-3">
          <AdminLogo />
          {onCloseMobile && (
            <button
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden transition-colors cursor-pointer"
              onClick={onCloseMobile}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex flex-1 flex-col space-y-4 overflow-y-auto pr-1 scrollbar-thin">
        {adminNavSections.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
              {section.label}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  active={isItemActive(item.href)}
                  expanded={Boolean(expandedMenus[item.label])}
                  onToggleExpand={() => toggleExpand(item.label)}
                  onClick={onCloseMobile}
                  currentSearch={currentSearch}
                  pathname={pathname}
                  onCloseMobile={onCloseMobile}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer User Card */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between rounded-xl p-2 text-left transition hover:bg-white/[0.05]">
          <Link
            href="/admin/settings"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white shadow-sm">
              AD
            </div>
            <div className="truncate">
              <p className="truncate text-[12px] font-semibold text-slate-200 leading-tight">
                Admin User
              </p>
              <p className="truncate text-[10px] text-slate-400 leading-tight">
                System Administrator
              </p>
            </div>
          </Link>
          <Link
            href="/admin/login"
            title="Sign out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
